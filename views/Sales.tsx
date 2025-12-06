import React, { useState, useEffect } from "react";
import { createDailyClosing, getDailyClosings } from "../services/salesService";
import { DailyClosing } from "../types";
import { Link } from "react-router-dom";

const Sales: React.FC = () => {
  const [closings, setClosings] = useState<DailyClosing[]>([]);
  const [systemTotal, setSystemTotal] = useState(0);
  const [actualTotal, setActualTotal] = useState(0);
  const [date, setDate] = useState("");

  const loadData = async () => {
    const data = await getDailyClosings();
    setClosings(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!date) {
      alert("اختر تاريخ الإغلاق");
      return;
    }

    const variance = actualTotal - systemTotal;

    const newClosing = await createDailyClosing({
      date,
      total_system: systemTotal,
      total_actual: actualTotal,
      variance,
      cash_system: 0,
      cash_actual: 0,
      card_system: 0,
      card_actual: 0,
      gross_sales: systemTotal,
      vat_amount: 0,
      net_sales: systemTotal,
      discount_amount: 0,
      tips: 0,
      details: {},
    });

    if (newClosing) {
      alert("تم حفظ إغلاق اليوم");
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">إغلاقات المبيعات</h2>

      {/* إضافة إغلاق يومي جديد */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <input
          type="date"
          className="p-3 border rounded-lg w-full"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="number"
          className="p-3 border rounded-lg w-full"
          placeholder="إجمالي النظام"
          value={systemTotal}
          onChange={(e) => setSystemTotal(Number(e.target.value))}
        />

        <input
          type="number"
          className="p-3 border rounded-lg w-full"
          placeholder="إجمالي الصندوق"
          value={actualTotal}
          onChange={(e) => setActualTotal(Number(e.target.value))}
        />

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          onClick={handleSave}
        >
          حفظ الإغلاق
        </button>
      </div>

      {/* قائمة الإغلاقات */}
      <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 text-right">
              <th className="p-3">التاريخ</th>
              <th className="p-3">إجمالي النظام</th>
              <th className="p-3">إجمالي الصندوق</th>
              <th className="p-3">الفرق</th>
              <th className="p-3">عرض</th>
            </tr>
          </thead>
          <tbody>
            {closings.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.date}</td>
                <td className="p-3">{c.total_system}</td>
                <td className="p-3">{c.total_actual}</td>
                <td className="p-3">{c.variance}</td>
                <td className="p-3">
                  <Link
                    to={`/sales/${c.id}`}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    عرض التفاصيل
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sales;
