
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Sales from './views/Sales';
import Purchases from './views/Purchases';
import CreatePurchase from './views/CreatePurchase';
import PurchaseDetails from './views/PurchaseDetails';
import DailyClosingDetails from './views/DailyClosingDetails';
import Inventory from './views/Inventory';
import Custody from './views/Custody';
import Suppliers from './views/Suppliers';
import SupplierStatement from './views/SupplierStatement';
import Salaries from './views/Salaries';
import Reports from './views/Reports';
import Login from './views/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout component to wrap Sidebar and Main Content
const AppLayout = () => {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-row min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <main className="flex-1 overflow-auto h-screen">
        <header className="bg-white shadow-sm sticky top-0 z-10 px-8 py-4 flex justify-between items-center print:hidden">
          <h1 className="text-xl font-bold text-slate-700">نظام إدارة الموارد</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block text-sm font-bold text-slate-700">{user?.name}</span>
              <span className="block text-xs text-slate-500 capitalize">{user?.role}</span>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold uppercase">
              {user?.name.charAt(0)}
            </div>
          </div>
        </header>
        <div className="p-8 print:p-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
             <Route element={<AppLayout />}>
                
                {/* Everyone can see Dashboard */}
                <Route path="/" element={<Dashboard />} />
                
                {/* Sales & Closings: Admin + Cashier */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'cashier']} />}>
                   <Route path="/sales" element={<Sales />} />
                   <Route path="/sales/:id" element={<DailyClosingDetails />} />
                   <Route path="/custody" element={<Custody />} />
                </Route>

                {/* Purchases, Suppliers, Salaries, Reports: Admin + Accountant */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'accountant']} />}>
                   <Route path="/purchases" element={<Purchases />} />
                   <Route path="/purchases/new" element={<CreatePurchase />} />
                   <Route path="/purchases/edit/:id" element={<CreatePurchase />} />
                   <Route path="/purchases/:id" element={<PurchaseDetails />} />
                   <Route path="/suppliers" element={<Suppliers />} />
                   <Route path="/suppliers/:id" element={<SupplierStatement />} />
                   <Route path="/salaries" element={<Salaries />} />
                   <Route path="/reports" element={<Reports />} />
                </Route>

                {/* Inventory: Everyone (View/Edit depends on logic but route accessible) */}
                <Route path="/inventory" element={<Inventory />} />
                
                <Route path="*" element={<Navigate to="/" replace />} />
             </Route>
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
