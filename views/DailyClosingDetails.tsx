import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getClosingById } from "../services/salesService";
import { DailyClosing } from "../types";

const DailyClosingDetails: React.FC = () => {
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
      <h2 className="text-xl font-bold">تفاصيل الإغلاق المتقدمة</h2>

      <div className="bg-white p-4 rounded-lg shadow space-y-2">
        <p><strong>التاريخ:</strong> {closing.date}</p>
        <p><strong>إجمالي النظام:</strong> {closing.total_system}</p>
        <p><strong>إجمالي الصندوق:</strong> {closing.total_actual}</p>
        <p><strong>الفرق:</strong> {closing.variance}</p>

        <p><strong>البيانات الخام:</strong></p>
        <pre className="bg-slate-100 p-3 rounded">
          {JSON.stringify(closing.details, null, 2)}
        </pre>
      </div>

      <Link
        to="/sales"
        className="px-4 py-2 bg-slate-600 text-white rounded"
      >
        رجوع
      </Link>
    </div>
  );
};

export default DailyClosingDetails;
