import React, { useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productsService";
import { Product } from "../types";

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    quantity: 0,
    cost: 0,
    price: 0,
    category: "",
  });

  const loadData = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return;

    if (editingProduct) {
      await updateProduct(editingProduct.id, form);
    } else {
      await createProduct(form as any);
    }

    setModalOpen(false);
    setEditingProduct(null);
    setForm({
      name: "",
      sku: "",
      quantity: 0,
      cost: 0,
      price: 0,
      category: "",
    });
    loadData();
  };

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      sku: p.sku ?? "",
      quantity: p.quantity ?? 0,
      cost: p.cost ?? 0,
      price: p.price ?? 0,
      category: p.category ?? "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف المنتج؟")) {
      await deleteProduct(id);
      loadData();
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">المخزون</h2>
        <button
          onClick={() => {
            setEditingProduct(null);
            setForm({
              name: "",
              sku: "",
              quantity: 0,
              cost: 0,
              price: 0,
              category: "",
            });
            setModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          إضافة منتج
        </button>
      </div>

      <input
        className="w-full p-2 border rounded-lg"
        placeholder="بحث عن منتج..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 text-right">
              <th className="p-3">الاسم</th>
              <th className="p-3">الباركود</th>
              <th className="p-3">الكمية</th>
              <th className="p-3">التكلفة</th>
              <th className="p-3">السعر</th>
              <th className="p-3">التصنيف</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.sku}</td>
                <td className="p-3">{p.quantity}</td>
                <td className="p-3">{p.cost}</td>
                <td className="p-3">{p.price}</td>
                <td className="p-3">{p.category}</td>

                <td className="p-3 space-x-2">
                  <button
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                    onClick={() => handleEdit(p)}
                  >
                    تعديل
                  </button>

                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded"
                    onClick={() => handleDelete(p.id)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
            <h3 className="font-bold text-lg">
              {editingProduct ? "تعديل منتج" : "إضافة منتج"}
            </h3>

            <input
              className="w-full border p-2 rounded"
              placeholder="اسم المنتج"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="w-full border p-2 rounded"
              placeholder="الباركود / SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />

            <input
              type="number"
              className="w-full border p-2 rounded"
              placeholder="الكمية"
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: Number(e.target.value) })
              }
            />

            <input
              type="number"
              className="w-full border p-2 rounded"
              placeholder="التكلفة"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
            />

            <input
              type="number"
              className="w-full border p-2 rounded"
              placeholder="السعر"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
            />

            <input
              className="w-full border p-2 rounded"
              placeholder="التصنيف"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-slate-300 rounded"
                onClick={() => setModalOpen(false)}
              >
                إلغاء
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleSave}
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
