import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  // 1) انتظر تحميل AuthContext
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  // 2) بعد التحميل: إذا لا يوجد مستخدم → صفحة تسجيل الدخول
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3) المستخدم موجود → عرض الصفحة
  return <>{children}</>;
};

export default ProtectedRoute;
