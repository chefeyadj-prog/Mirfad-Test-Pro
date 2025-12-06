import React, { useState } from 'react';
import { Sparkles, FileText, Loader2 } from 'lucide-react';

import { supabase } from '../supabaseClient';
import { generateReportAnalysis } from '../services/geminiService';

const Reports: React.FC = () => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------------
     🟦 جلب البيانات من Supabase
  --------------------------------------------------------- */
  const loadSales = async () => {
    const { data, error } = await supabase
      .from("daily_closings")
      .select("*")
      .order("date", { ascending: false });

    if (error) return [];
    return data || [];
  };

  const loadPurchases = async () => {
    const { data, error } = await supabase
      .from("purchases")
      .select("*");

    if (error) return [];
    return data || [];
  };

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*");

    if (error) return [];
    return data || [];
  };

  const loadCustody = async () => {
    const { data, error } = await supabase
      .from("custody")
      .select("*");

    if (error) return [];
    return data || [];
  };

  const loadSalaryTransactions = async () => {
    const { data, error } = await supabase
      .from("salary_transactions")
      .select("*");

    if (error) return [];
    return data || [];
  };

  /* ---------------------------------------------------------
     🟩 تحليل البيانات عبر الذكاء الاصطناعي
  --------------------------------------------------------- */
  const handleGenerateReport = async () => {
    setLoading(true);

    // تحميل البيانات الفعلية من Supabase
    const sales = await loadSales();
    const purchases = await loadPurchases();
    const products = await loadProducts();
    const custody = await loadCustody();
    const salaryTransactions = await loadSalaryTransactions();

    // حساب إجمالي المبيعات (من daily_closings)
    const totalSales = sales.reduce(
      (sum, s) => sum + (s.total_system ?? 0),
      0
    );

    // إجمالي المشتريات
    const totalPurchases = purchases.reduce(
      (sum, p) => sum + (p.amount ?? 0),
      0
    );

    // قيمة المخزون
    const inventoryValue = products.reduce(
      (sum, p) => sum + ((p.cost ?? 0) * (p.quantity ?? 0)),
      0
    );

    // المنتجات منخفضة المخزون
    const lowStockProducts = products
      .filter(p => (p.quantity ?? 0) < 5)
      .map(p => p.name);

    const openCustodyAmount = custody
      .filter(c => c.status === "active")
      .reduce((sum, c) => sum + (c.amount ?? 0), 0);

    const totalSalaries =
      salaryTransactions
        .filter(t => t.type === "salary")
        .reduce((sum, t) => sum + (t.amount ?? 0), 0);

    // تجهيز البيانات للذكاء الاصطناعي
    const dataContext = JSON.stringify({
      totalSales,
      totalPurchases,
      inventoryValue,
      lowStockProducts,
      openCustodyAmount,
      totalSalaries,
      recentClosings: sales.slice(0, 5),
      recentPurchases: purchases.slice(0, 5),
      productsCount: products.length,
      employeesCount: salaryTransactions.length,
    });

    const result = await generateReportAnalysis(dataContext);
    setAnalysis(result);

    setLoading(false);
  };

  /* ---------------------------------------------------------
     🟫 واجهة المستخدم (نفس تصميمك 100%)
     مأخوذ من نسختك الأصلية: 
     :contentReference[oaicite:1]{index=1}
  --------------------------------------------------------- */
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">التقارير الذكية</h2>
        <p className="text-slate-500">استخدم الذكاء الاصطناعي لتحليل أداء منشأتك المالي</p>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl mb-8 flex flex-col items-center justify-center text-center">
        <Sparkles size={48} className="mb-4 text-yellow-300" />
        <h3 className="text-xl font-bold mb-2">المستشار المالي الذكي</h3>
        <p className="mb-6 opacity-90 max-w-lg">
          نقوم بتحليل المبيعات، المشتريات، حركة المخزون، والعهد المالية لتقديم توصيات استراتيجية لزيادة أرباحك.
        </p>

        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="bg-white text-indigo-700 px-8 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" /> : <FileText />}
          {loading ? 'جاري التحليل...' : 'إنشاء التقرير الشامل'}
        </button>
      </div>

      {/* AI Report Output */}
      {analysis && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden animate-fade-in">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600" />
            <h3 className="font-bold text-slate-800">نتيجة التحليل</h3>
          </div>

          <div className="p-8 prose prose-slate max-w-none font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
            {analysis}
          </div>
        </div>
      )}

      {/* Placeholder Boxes (نفس تصميمك) */}
      {!analysis && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm text-center">
            يتم تحليل هوامش الربح للمنتجات
          </div>

          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm text-center">
            مراقبة كفاءة الموظفين والعهد
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
