
import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle, Banknote } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import StatCard from '../components/StatCard';
import DateFilter, { DateRange } from '../components/DateFilter';
import { MOCK_PRODUCTS } from '../constants'; // Fallback only
import { DailyClosing, Purchase, Product } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalCashSales: 0,
    totalPurchases: 0,
    netProfit: 0,
    lowStockCount: 0
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ label: 'الكل', start: null, end: null });

  useEffect(() => {
    // 1. Load Data from LocalStorage
    const savedClosings = localStorage.getItem('dailyClosings');
    const allClosings: DailyClosing[] = savedClosings ? JSON.parse(savedClosings) : [];

    const savedPurchases = localStorage.getItem('purchases');
    const allPurchases: Purchase[] = savedPurchases ? JSON.parse(savedPurchases) : [];

    const savedProducts = localStorage.getItem('products');
    const products: Product[] = savedProducts ? JSON.parse(savedProducts) : MOCK_PRODUCTS;

    // 2. Filter Data based on Date Range
    const filterByDate = (itemDateStr: string) => {
        if (!dateRange.start || !dateRange.end) return true;
        const itemDate = new Date(itemDateStr);
        return itemDate >= dateRange.start && itemDate <= dateRange.end;
    };

    const filteredClosings = allClosings.filter(c => filterByDate(c.date));
    const filteredPurchases = allPurchases.filter(p => filterByDate(p.date));

    // 3. Calculate Totals based on filtered data
    // Sales: Sum of Gross Sales from Daily Closings
    const totalSales = filteredClosings.reduce((sum, item) => sum + (item.grossSales || item.totalSystem || 0), 0);
    
    // Cash Sales: Sum of Actual Cash collected
    const totalCashSales = filteredClosings.reduce((sum, item) => sum + (item.cashActual || 0), 0);

    // Purchases: Sum of all purchase invoices
    const totalPurchases = filteredPurchases.reduce((sum, item) => sum + item.amount, 0);
    
    // Net Profit
    const netProfit = totalSales - totalPurchases;

    // Low Stock: Count items with quantity < 5 (Inventory is snapshot, not filtered by date usually, but could filter by added date if needed. Here we keep it general)
    const lowStockCount = products.filter(p => p.quantity < 5).length;

    setStats({
      totalSales,
      totalCashSales,
      totalPurchases,
      netProfit,
      lowStockCount
    });

    // 4. Prepare Chart Data (Last 7 Days or Range)
    const generateChartData = () => {
        // If "All" or generic range selected, default to last 7 days visual for charts, or try to plot the filtered range
        // For simplicity, we'll keep the chart showing daily breakdown of the filtered data or last 7 days if "All"
        
        let daysToProcess = 7;
        let endDate = new Date();
        
        if (dateRange.start && dateRange.end) {
            // Calculate days between
            const diffTime = Math.abs(dateRange.end.getTime() - dateRange.start.getTime());
            daysToProcess = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            endDate = dateRange.end;
            if (daysToProcess > 30) daysToProcess = 30; // Cap at 30 bars for visibility
        }

        const data = [];
        
        for (let i = daysToProcess - 1; i >= 0; i--) {
            const d = new Date(endDate);
            d.setDate(endDate.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            
            // Filter data for this specific date
            const daySales = allClosings // Use allClosings to check specific date
                .filter(c => c.date === dateStr)
                .reduce((sum, c) => sum + (c.grossSales || c.totalSystem || 0), 0);

            const dayPurchases = allPurchases
                .filter(p => p.date === dateStr)
                .reduce((sum, p) => sum + p.amount, 0);

            // Only add if we are in "All" mode OR if the date falls within the selected range
            if (!dateRange.start || !dateRange.end || (d >= dateRange.start && d <= dateRange.end)) {
                 data.push({
                    name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // Changed to en-US for Gregorian
                    fullDate: dateStr,
                    sales: daySales,
                    purchases: dayPurchases,
                    profit: daySales - dayPurchases
                });
            }
        }
        return data;
    };

    setChartData(generateChartData());

  }, [dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-slate-800">لوحة التحكم</h2>
         <DateFilter onFilterChange={setDateRange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard 
          title="إجمالي المبيعات" 
          value={`${stats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={DollarSign} 
          color="blue" 
          trend="المبيعات (Gross)"
        />
        <StatCard 
          title="إجمالي الكاش (الفعلي)" 
          value={`${stats.totalCashSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={Banknote} 
          color="green" 
          trend="النقد في الصندوق"
        />
        <StatCard 
          title="إجمالي المشتريات" 
          value={`${stats.totalPurchases.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={ShoppingCart} 
          color="orange" 
        />
        <StatCard 
          title="صافي التدفق (تقديري)" 
          value={`${stats.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={TrendingUp} 
          color={stats.netProfit >= 0 ? "green" : "red"} 
          trend="الفرق (مبيعات - مشتريات)"
        />
        <StatCard 
          title="تنبيهات المخزون" 
          value={`${stats.lowStockCount} منتجات`} 
          icon={AlertTriangle} 
          color="red" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4 text-slate-700">حركة المبيعات والمشتريات</h3>
          <div className="h-80 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="sales" name="المبيعات" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="purchases" name="المشتريات" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4 text-slate-700">مؤشر الربحية</h3>
          <div className="h-80 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="profit" name="الصافي" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
