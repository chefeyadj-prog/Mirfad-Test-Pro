import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

// الصفحات
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Purchases from "./pages/Purchases";
import PurchaseDetails from "./pages/PurchaseDetails";
import CreatePurchase from "./pages/CreatePurchase";
import Suppliers from "./pages/Suppliers";
import SupplierStatement from "./pages/SupplierStatement";
import Inventory from "./pages/Inventory";
import Custody from "./pages/Custody";
import Salaries from "./pages/Salaries";
import Reports from "./pages/Reports";
import DailyClosingDetails from "./pages/DailyClosingDetails";
import Login from "./pages/Login";

const AppLayout: React.FC = () => {
  const { user } = useAuth();

  // حماية ضد undefined لمنع الشاشة البيضاء
  const firstLetter = user?.name?.charAt?.(0)?.toUpperCase() ?? "";

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
          <h1 className="text-xl font-bold text-slate-800">نظام مِرفاد المحاسبي</h1>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold uppercase">
              {firstLetter}
            </div>

            <div className="text-right">
              <p className="font-bold">{user?.name ?? ""}</p>
              <p className="text-xs text-slate-500">{user?.email ?? ""}</p>
            </div>
          </div>
        </div>

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

function App() {
  return (
    <Router>
      {/* حماية جميع الصفحات */}
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

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
