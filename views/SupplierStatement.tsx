import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Printer, Phone, Building } from 'lucide-react';

import { getSupplierById } from "../services/suppliersService";
import { supabase } from "../supabaseClient";

import { Supplier, Purchase } from '../types';

const SupplierStatement: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [transactions, setTransactions] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  /* -----------------------------------------------------------
     🟦 Load Supplier + Purchases from Supabase
  ----------------------------------------------------------- */
  const loadData = async () => {
    if (!id) return;

    // 1) Load Supplier
    const s = await getSupplierById(id);
    setSupplier(s);

    if (!s) {
      setLoading(false);
      return;
    }

    // 2) Load Purchases for this Supplier
    const { data: pur, error } = await supabase
      .from("purchases")
      .select("*")
      .eq("supplier_id", id)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error loading purchases:", error);
    }

    setTransactions(pur || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center p-10 text-slate-500">
        جاري تحميل كشف الحساب...
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-slate-500 mb-4">المورد غير موجود.</p>
        <button onClick={() => navigate('/suppliers')} className="text-blue-600 hover:underline">
          العودة للقائمة
        </button>
      </div>
    );
  }

  /* -----------------------------------------------------------
     🟧 Calculate Totals
  ----------------------------------------------------------- */
  const totalCreditPurchases = transactions
    .filter(t => t.payment_method === "credit")
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const totalCashPurchases = transactions
    .filter(t => t.payment_method === "cash" || t.payment_method === "transfer")
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/suppliers')}
            className="p-2 bg-white border border-slate-200 rounded-full text-slate-500 hover:bg-slate-50"
          >
            <ArrowRight size={20} />
          </button>
          <h2 className="text-2xl font-bold text-slate-800">كشف حساب مورد</h2>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-md"
        >
          <Printer size={18} />
          <span>طباعة الكشف</span>
        </button>
      </div>

      {/* Statement Container */}
      <div className="bg-white shadow-lg p-10 rounded-xl min-h-[297mm] print:p-0">
        
        {/* Statement Header */}
        <div className="flex justify-between items-start border-b-2 pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">كشف حساب</h1>
            <p className="text-slate-500">Statement of Account</p>
            <p className="text-sm text-slate-400 mt-1">تاريخ الإصدار: {new Date().toISOString().split('T')[0]}</p>
          </div>

          <div className="text-left bg-slate-50 p-4 rounded-lg border">
            <h3 className="font-bold text-slate-700 flex justify-end items-center gap-2">
              {supplier.name}
              <Building size={18} className="text-indigo-600" />
            </h3>
            <div className="text-sm text-slate-500 mt-2 space-y-1 text-right">
              <p className="flex items-center justify-end gap-2">
                <span dir="ltr">{supplier.phone}</span> <Phone size={14} />
              </p>
              <p className="font-mono text-xs">ID: {supplier.id}</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="p-4 bg-slate-50 rounded-lg border text-center">
            <p className="text-slate-500 text-sm mb-1">الرصيد الحالي المستحق</p>
            <p className={`text-2xl font-bold ${supplier.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {supplier.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? 0}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border text-center">
            <p className="text-slate-500 text-sm mb-1">إجمالي مشتريات الآجل</p>
            <p className="text-xl font-bold text-slate-700">
              {totalCreditPurchases.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border text-center">
            <p className="text-slate-500 text-sm mb-1">إجمالي مشتريات النقدي / التحويل</p>
            <p className="text-xl font-bold text-slate-700">
              {totalCashPurchases.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-hidden border rounded-lg">
          <table className="w-full text-right">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="p-4 font-bold">التاريخ</th>
                <th className="p-4 font-bold">رقم المرجع</th>
                <th className="p-4 font-bold">البيان</th>
                <th className="p-4 font-bold">النوع</th>
                <th className="p-4 font-bold text-left">مدين</th>
                <th className="p-4 font-bold text-left">دائن</th>
              </tr>
            </thead>

            <tbody className="divide-y text-sm">
              {transactions.length > 0 ? (
                transactions.map((t) => {
                  const isCredit = t.payment_method === "credit";
                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono">{t.date}</td>

                      <td className="p-4 font-medium text-slate-800">
                        {t.invoice_number || t.id}
                        <button
                          onClick={() => navigate(`/purchases/${t.id}`)}
                          className="mr-2 text-indigo-600 hover:underline text-xs print:hidden"
                        >
                          (عرض)
                        </button>
                      </td>

                      <td className="p-4 text-slate-500">
                        {t.description || "فاتورة مشتريات"}
                      </td>

                      <td className="p-4">
                        {isCredit ? (
                          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                            فاتورة آجل
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                            دفع فوري
                          </span>
                        )}
                      </td>

                      {/* Debit */}
                      <td className="p-4 text-left text-slate-400">-</td>

                      {/* Credit */}
                      <td className="p-4 text-left font-bold text-slate-800">
                        {(t.amount ?? 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    لا توجد فواتير لهذا المورد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t flex justify-between text-xs text-slate-400">
          <span>تم إصدار هذا الكشف من نظام المحاسب برو</span>
          <span>طبع بواسطة: المدير العام</span>
        </div>
      </div>
    </div>
  );
};

export default SupplierStatement;
