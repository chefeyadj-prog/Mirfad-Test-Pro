import React, { useEffect, useState } from "react";
import { getPurchases, deletePurchase } from "../services/purchasesService";
import { Purchase } from "../types";
import { Link } from "react-router-dom";

const Purchases: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    const data = await getPurchases();
    setPurchases(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("هل تريد حذف هذه الفاتورة بالفعل؟")) {
      await deletePurchase(id);
      loadData();
    }
  };

  const filtered = purchases.filter((p) =>
    p.invoice_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">فواتير المشتريات</h2>
        <Link
          to="/purchases/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          إنشاء فاتورة جديدة
        </Link>
      </div>

      <input
        className="w-full p-2 border rounded-lg"
        placeholder="بحث برقم الفاتورة..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 text-right">
              <th className="p-3">رقم الفاتورة</th>
              <th className="p-3">التاريخ</th>
              <th className="p-3">المبلغ</th>
              <th className="p-3">المورد</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.invoice_number}</td>
                <td className="p-3">{p.date}</td>
                <td className="p-3">{p.amount}</td>
                <td className="p-3">{p.supplier_id}</td>

                <td className="p-3 space-x-2">
                  <Link
                    className="px-3 py-1 bg-green-600 text-white rounded"
                    to={`/purchases/${p.id}`}
                  >
                    عرض
                  </Link>

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
    </div>
  );
};

export default Purchases;
