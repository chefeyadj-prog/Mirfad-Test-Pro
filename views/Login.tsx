import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const ok = await login(email, password);

    if (!ok) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      return;
    }

    // 🔥 التنقل الصحيح بدون refresh
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">تسجيل الدخول</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            className="w-full p-3 border rounded-lg"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="كلمة المرور"
            className="w-full p-3 border rounded-lg"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {error && <p className="text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold"
          >
            دخول
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
