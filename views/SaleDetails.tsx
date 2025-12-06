import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getClosingById } from "../services/salesService";
import { DailyClosing } from "../types";

const SaleDetails: React.FC = () => {
  const { id } = useParams();
  const [closing, setClosing] = useState<DailyClosing | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    const data = await getClosingById(id);
    setClosing(data);
  };

  if (!closing) return <p className="p-4">جاري التحميل...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">تفاصيل إغلاق اليوم</h2>

      <div className="bg-white p-4 rounded-lg shadow space-y-2">
        <p><strong>التاريخ:</strong> {closing.date}</p>
        <p><strong>إجمالي النظام:</strong> {closing.total_system}</p>
        <p><strong>إجمالي الصندوق:</strong> {closing.total_actual}</p>
        <p><strong>الفرق:</strong> {closing.variance}</p>
      </div>

      <div className="flex gap-3">
        <Link to="/sales" className="px-4 py-2 bg-slate-600 text-white rounded">
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

export default SaleDetails;
