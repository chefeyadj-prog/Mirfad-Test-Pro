import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getPurchaseById,
  getPurchaseItems,
} from "../services/purchasesService";
import { getSupplierById } from "../services/suppliersService";
import { Purchase, PurchaseItem, Supplier } from "../types";

const PurchaseDetails: React.FC = () => {
  const { id } = useParams();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!id) return;

    // 1) جلب الفاتورة
    const p = await getPurchaseById(id);
    if (p) setPurchase(p);

    // 2) جلب البنود
    const it = await getPurchaseItems(id);
    setItems(it);

    // 3) جلب اسم المورد
    if (p?.supplier_id) {
      const s = await getSupplierById(p.supplier_id);
      setSupplier(s);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return <p className="text-center p-4">جاري التحميل...</p>;
  }

  if (!purchase) {
    return (
      <div className="p-4 text-center">
        <p>الفاتورة غير موجودة.</p>
        <Link to="/purchases" className="text-blue-600 underline">
          العودة للمشتريات
        </Link>
      </div>
    );
  }

  const totalAmount = items.reduce((sum, i) => sum + (i.total ?? 0), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">تفاصيل فاتورة مشتريات</h2>

      {/* 🔵 معلومات الفاتورة */}
      <div className="bg-white p-4 rounded-lg shadow space-y-2">
        <p>
          <strong>رقم الفاتورة:</strong> {purchase.invoice_number}
        </p>
        <p>
          <strong>التاريخ:</strong> {purchase.date}
        </p>
        <p>
          <strong>المورد:</strong> {supplier ? supplier.name : "—"}
        </p>
        <p>
          <strong>الإجمالي:</strong> {totalAmount} ريال
        </p>
      </div>

      {/* 🔵 جدول البنود */}
      <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 text-right">
              <th className="p-3">الوصف</th>
              <th className="p-3">الكمية</th>
              <th className="p-3">السعر</th>
              <th className="p-3">المجموع</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="p-3">{i.description}</td>
                <td className="p-3">{i.quantity}</td>
                <td className="p-3">{i.unit_price}</td>
                <td className="p-3">{i.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔵 أزرار أسفل الصفحة */}
      <div className="flex gap-3">
        <Link
          to="/purchases"
          className="px-4 py-2 bg-slate-500 text-white rounded"
        >
          رجوع
        </Link>

        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={() => window.print()}
        >
          طباعة
        </button>
      </div>
    </div>
  );
};

export default PurchaseDetails;
