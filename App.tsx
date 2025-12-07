import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

/* -------------------------
   IMPORT ALL PAGES CORRECTLY
   FROM /views  (NOT /pages)
-------------------------- */
import Dashboard from "./views/Dashboard";
import Sales from "./views/Sales";
import Purchases from "./views/Purchases";
import PurchaseDetails from "./views/PurchaseDetails";
import CreatePurchase from "./views/CreatePurchase";
import Suppliers from "./views/Suppliers";
import SupplierStatement from "./views/SupplierStatement";
import Inventory from "./views/Inventory";
import Custody from "./views/Custody";
import Salaries from "./views/Salaries";
import Reports from "./views/Reports";
import DailyClosingDetails from "./views/DailyClosingDetails";
import Login from "./views/Login";

/* ------------------------ */

const AppLayout: React.FC = () => {
  const { user } = useAuth();

  // حماية قوية ضد undefined لمنع الشاشة البيضاء
  const firstLetter = user?.name?.charAt?.(0)?.toUpperCase() ?? "";

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1 p-6 space-y-6">
        {/* ------ TOP BAR ------ */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
          <h1 className="text-xl font-bold text-slate-800">
            نظام مِرفاد المحاسبي
          </h1>

          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold uppercase">
              {firstLetter}
            </div>

            {/* Info */}
            <div className="text-right">
              <p className="font-bold">{user?.name ?? ""}</p>
              <p className="text-xs text-slate-500">{user?.email ?? ""}</p>
            </div>
          </div>
        </div>

        {/* ------ ROUTES ------ */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales/:id" element={<DailyClosingDetails />} />

          <Route path="/purchases" element={<Purchases />} />
          <Route path="/purchases/create" element={<CreatePurchase />} />
          <Route path="/purchases/:id" element={<PurchaseDetails />} />

          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/suppliers/:id" element={<SupplierStatement />} />

          <Route path="/inventory" element={<Inventory />} />
          <Route path="/custody" element={<Custody />} />
          <Route path="/salaries" element={<Salaries />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </div>
    </div>
  );
};

/* ------------------------ */

function App() {
  return (
    <Router>
      <Routes>
        {/* صفحة تسجيل الدخول لا تحتاج حماية */}
        <Route path="/login" element={<Login />} />

        {/* كل باقي الصفحات محمية */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
