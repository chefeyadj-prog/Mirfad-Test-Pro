import React, { useEffect, useState } from "react";
import {
  getProducts,
  updateProduct,
} from "../services/productsService";
import {
  createPurchase,
  addPurchaseItem,
} from "../services/purchasesService";
import { getSuppliers } from "../services/suppliersService";
import { Supplier, Product, PurchaseItem } from "../types";
import extractPurchaseFromImage from "../geminiService";

const CreatePurchase: React.FC = () => {
  /* ---------------------------------------------------------
    🟦 1) STATES الأساسية
  --------------------------------------------------------- */
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState(0);

  /* ------------------- بند يدوي أو من المخزون ------------------ */
  const [manualItem, setManualItem] = useState({
    code: "",
    description: "",
    quantity: 1,
    unit_price: 0,
  });

  const [selectedProductId, setSelectedProductId] = useState("");

  /* ------------------- AI Extract ------------------ */
  const [uploading, setUploading] = useState(false);

  /* ------------------- تحميل البيانات من سوبابيس ------------------ */
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const sData = await getSuppliers();
    const pData = await getProducts();
    setSuppliers(sData);
    setProducts(pData);
  };

  /* ---------------------------------------------------------
    🟧 2) إضافة بند يدوي
  --------------------------------------------------------- */
  const addManualItemToList = () => {
    if (!manualItem.description) return;

    const total = manualItem.quantity * manualItem.unit_price;

    const newItem: PurchaseItem = {
      id: "",
      purchase_id: "",
      code: manualItem.code,
      description: manualItem.description,
      quantity: manualItem.quantity,
      unit_price: manualItem.unit_price,
      total,
    };

    setItems([...items, newItem]);

    setManualItem({
      code: "",
      description: "",
      quantity: 1,
      unit_price: 0,
    });
  };

  /* ---------------------------------------------------------
    🟨 3) إضافة بند من المخزون
  --------------------------------------------------------- */
  const addStockItem = () => {
    if (!selectedProductId) return;

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const newItem: PurchaseItem = {
      id: "",
      purchase_id: "",
      code: product.sku ?? "",
      description: product.name,
      quantity: 1,
      unit_price: product.cost ?? 0,
      total: product.cost ?? 0,
    };

    setItems([...items, newItem]);
    setSelectedProductId("");
  };

  /* ---------------------------------------------------------
    🟥 4) حذف بند
  --------------------------------------------------------- */
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  /* ---------------------------------------------------------
    🟩 5) حفظ الفاتورة في Supabase
    1) إنشاء purchase
    2) إنشاء purchase_items
    3) تحديث كمية المنتجات
  --------------------------------------------------------- */
  const handleSavePurchase = async () => {
    if (!selectedSupplier) {
      alert("اختر المورد");
      return;
    }

    if (items.length === 0) {
      alert("أضف بنودًا للفاتورة");
      return;
    }

    // حساب إجمالي الفاتورة
    const totalAmount = items.reduce((sum, i) => sum + (i.total ?? 0), 0);
    setAmount(totalAmount);

    /* 🔵 1) إنشاء فاتورة مشتريات */
    const purchase = await createPurchase({
      supplier_id: selectedSupplier,
      invoice_number: invoiceNumber,
      date,
      amount: totalAmount,
      description: "",
      currency: "SAR",
      payment_method: "",
      status: "received",
      tax_number: "",
    });

    if (!purchase) {
      alert("خطأ أثناء إنشاء الفاتورة");
      return;
    }

    /* 🔵 2) إضافة البنود إلى purchase_items */
    for (const item of items) {
      await addPurchaseItem({
        purchase_id: purchase.id,
        code: item.code,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      });

      /* 🔵 3) تحديث مخزون المنتج (زيادة الكمية) */
      const product = products.find((p) => p.sku === item.code);
      if (product) {
        await updateProduct(product.id, {
          quantity: (product.quantity ?? 0) + item.quantity,
          cost: item.unit_price, // تحديث التكلفة الحالية
        });
      }
    }

    alert("تم حفظ الفاتورة بنجاح");
    window.location.href = "/purchases";
  };

  /* ---------------------------------------------------------
    🟪 6) الذكاء الاصطناعي — قراءة صورة الفاتورة
  --------------------------------------------------------- */
  const handleInvoiceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    setUploading(true);

    const res = await extractPurchaseFromImage(e.target.files[0]);

    if (res) {
      setInvoiceNumber(res.invoiceNumber || "");
      setDate(res.date || "");
      setManualItem({
        code: "",
        description: res.itemName || "",
        quantity: res.quantity || 1,
        unit_price: res.unitPrice || 0,
      });
    }

    setUploading(false);
  };

  /* ---------------------------------------------------------
    🟫 7) واجهة المستخدم
  --------------------------------------------------------- */
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">إنشاء فاتورة مشتريات</h2>

      {/* 🔵 بيانات الفاتورة */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <select
          className="p-3 border rounded-lg w-full"
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
        >
          <option value="">اختر المورد...</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          className="p-3 border rounded-lg w-full"
          placeholder="رقم الفاتورة"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
        />

        <input
          type="date"
          className="p-3 border rounded-lg w-full"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {/* الذكاء الاصطناعي */}
        <input
          type="file"
          className="p-2"
          onChange={handleInvoiceImage}
          disabled={uploading}
        />
      </div>

      {/* 🔵 إضافة بند من المخزون */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <h3 className="font-bold">إضافة من المخزون</h3>

        <select
          className="p-3 border rounded-lg w-full"
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
        >
          <option value="">اختر منتج...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.sku}
            </option>
          ))}
        </select>

        <button
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
          onClick={addStockItem}
        >
          إضافة
        </button>
      </div>

      {/* 🔵 إضافة بند يدوي */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <h3 className="font-bold">إضافة بند يدوي</h3>

        <input
          className="p-3 border rounded-lg w-full"
          placeholder="الوصف"
          value={manualItem.description}
          onChange={(e) =>
            setManualItem({ ...manualItem, description: e.target.value })
          }
        />

        <input
          type="number"
          className="p-3 border rounded-lg w-full"
          placeholder="الكمية"
          value={manualItem.quantity}
          onChange={(e) =>
            setManualItem({ ...manualItem, quantity: Number(e.target.value) })
          }
        />

        <input
          type="number"
          className="p-3 border rounded-lg w-full"
          placeholder="السعر"
          value={manualItem.unit_price}
          onChange={(e) =>
            setManualItem({ ...manualItem, unit_price: Number(e.target.value) })
          }
        />

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          onClick={addManualItemToList}
        >
          إضافة
        </button>
      </div>

      {/* 🔵 جدول البنود */}
      <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-3">الوصف</th>
              <th className="p-3">كمية</th>
              <th className="p-3">السعر</th>
              <th className="p-3">الإجمالي</th>
              <th className="p-3">حذف</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-3">{item.description}</td>
                <td className="p-3">{item.quantity}</td>
                <td className="p-3">{item.unit_price}</td>
                <td className="p-3">{item.total}</td>
                <td className="p-3">
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded"
                    onClick={() => removeItem(idx)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔵 زر حفظ */}
      <button
        className="w-full p-3 bg-blue-700 text-white rounded-lg text-xl font-bold"
        onClick={handleSavePurchase}
      >
        حفظ الفاتورة
      </button>
    </div>
  );
};

export default CreatePurchase;
