import React, { useState, useEffect } from 'react';
import { Plus, User } from 'lucide-react';

import { getEmployees } from "../services/employeesService";
import {
  getCustody,
  addCustody,
  updateCustody
} from "../services/custodyService";

import { Custody as CustodyType, Employee } from '../types';

const Custody: React.FC = () => {
  /* -------------------------------------------------------------
     🟦 1) STATES
  ------------------------------------------------------------- */
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [custodies, setCustodies] = useState<CustodyType[]>([]);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const [selectedCustody, setSelectedCustody] = useState<CustodyType | null>(null);

  const [newCustodyData, setNewCustodyData] = useState({
    employeeId: '',
    amount: 0,
  });

  const [closeData, setCloseData] = useState({
    expenses: 0,
    notes: ''
  });

  /* -------------------------------------------------------------
     🟨 2) LOAD DATA FROM SUPABASE
  ------------------------------------------------------------- */
  const loadData = async () => {
    // 1) Load employees
    const emp = await getEmployees();
    setEmployees(emp);

    // 2) Load custody for all employees
    let all: CustodyType[] = [];

    for (const e of emp) {
      const c = await getCustody(e.id);
      for (const i of c) {
        all.push({
          ...i,
          employeeName: e.name,
        });
      }
    }

    setCustodies(all);
  };

  useEffect(() => {
    loadData();
  }, []);

  /* -------------------------------------------------------------
     🟥 3) CREATE NEW CUSTODY
  ------------------------------------------------------------- */
  const handleCreateCustody = async () => {
    if (!newCustodyData.employeeId || newCustodyData.amount <= 0) return;

    const emp = employees.find((e) => e.id === newCustodyData.employeeId);
    if (!emp) return;

    const saved = await addCustody({
      employee_id: emp.id,
      amount: newCustodyData.amount,
      date_given: new Date().toISOString().split("T")[0],
      status: "active",
      expenses: 0,
      return_amount: 0,
      notes: ""
    });

    if (saved) {
      await loadData();
      setNewCustodyData({ employeeId: "", amount: 0 });
      setIsNewModalOpen(false);
    }
  };

  /* -------------------------------------------------------------
     🟩 4) OPEN CLOSE MODAL
  ------------------------------------------------------------- */
  const openCloseModal = (c: CustodyType) => {
    setSelectedCustody(c);
    setCloseData({ expenses: 0, notes: "" });
    setIsCloseModalOpen(true);
  };

  /* -------------------------------------------------------------
     🟪 5) CLOSE CUSTODY
  ------------------------------------------------------------- */
  const handleCloseCustody = async () => {
    if (!selectedCustody) return;

    const expenses = Number(closeData.expenses);
    const returnAmount = selectedCustody.amount - expenses;

    await updateCustody(selectedCustody.id, {
      status: "closed",
      expenses,
      return_amount: returnAmount,
      notes: closeData.notes
    });

    await loadData();
    setIsCloseModalOpen(false);
    setSelectedCustody(null);
  };

  /* -------------------------------------------------------------
     🟫 6) UI
  ------------------------------------------------------------- */
  return (
    <div>
      {/* TITLE + NEW BUTTON */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">إدارة العهد المالية</h2>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          <span>إنشاء عهدة جديدة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ACTIVE CUSTODIES */}
        <div>
          <h3 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            العهد النشطة
          </h3>
          <div className="space-y-4">
            {custodies.filter((c) => c.status === "active").map((c) => (
              <div
                key={c.id}
                className="bg-white p-5 rounded-xl shadow-sm border border-l-4 border-l-green-500 border-slate-100"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 rounded-full text-slate-600">
                      <User size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{c.employeeName}</h4>
                      <p className="text-xs text-slate-500">
                        تاريخ الاستلام: {c.date_given}
                      </p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    {c.amount} ر.س
                  </span>
                </div>
                <button
                  onClick={() => openCloseModal(c)}
                  className="w-full mt-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 text-sm"
                >
                  إقفال العهدة وتصفية الحساب
                </button>
              </div>
            ))}

            {custodies.filter((c) => c.status === "active").length === 0 && (
              <div className="p-6 text-center text-slate-400 border border-dashed border-slate-300 rounded-xl">
                لا توجد عهد نشطة حالياً
              </div>
            )}
          </div>
        </div>

        {/* CLOSED CUSTODIES */}
        <div>
          <h3 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            سجل العهد المقفلة
          </h3>
          <div className="space-y-4">
            {custodies.filter((c) => c.status === "closed").map((c) => (
              <div
                key={c.id}
                className="bg-slate-50 p-5 rounded-xl border border-slate-200 opacity-80 hover:opacity-100 transition-opacity"
              >
                <div className="flex justify-between mb-2">
                  <h4 className="font-bold text-slate-700">{c.employeeName}</h4>
                  <span className="text-xs bg-slate-200 px-2 py-1 rounded">
                    مغلقة
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm text-center mb-2">
                  <div className="bg-white p-1 rounded border">
                    <span className="block text-xs text-slate-400">المبلغ</span>
                    <span className="font-bold">{c.amount}</span>
                  </div>
                  <div className="bg-white p-1 rounded border">
                    <span className="block text-xs text-slate-400">المصروفات</span>
                    <span className="font-bold text-red-500">{c.expenses}</span>
                  </div>
                  <div className="bg-white p-1 rounded border">
                    <span className="block text-xs text-slate-400">المتبقي</span>
                    <span className="font-bold text-green-600">
                      {c.return_amount}
                    </span>
                  </div>
                </div>

                {c.notes && (
                  <p className="text-xs text-slate-500 bg-white p-2 rounded border border-slate-100">
                    {c.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CREATE CUSTODY MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">صرف عهدة جديدة</h3>
            <div className="space-y-4">
              {/* EMPLOYEE SELECT */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  الموظف المستلم
                </label>
                <select
                  className="w-full border p-2 rounded-lg bg-white text-slate-600"
                  value={newCustodyData.employeeId}
                  onChange={(e) =>
                    setNewCustodyData({
                      ...newCustodyData,
                      employeeId: e.target.value,
                    })
                  }
                >
                  <option value="">اختر موظف...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* AMOUNT */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  مبلغ العهدة
                </label>
                <input
                  type="number"
                  className="w-full border p-2 rounded-lg bg-white text-slate-600"
                  value={newCustodyData.amount}
                  onChange={(e) =>
                    setNewCustodyData({
                      ...newCustodyData,
                      amount: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="px-4 py-2 text-slate-600"
              >
                إلغاء
              </button>

              <button
                onClick={handleCreateCustody}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                تأكيد الصرف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLOSE CUSTODY MODAL */}
      {isCloseModalOpen && selectedCustody && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-2">إقفال العهدة</h3>
            <p className="text-sm text-slate-500 mb-4">
              عهدة الموظف: {selectedCustody.employeeName} | المبلغ الأصلي:{" "}
              {selectedCustody.amount}
            </p>

            <div className="space-y-4">
              {/* EXPENSES */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  إجمالي المصروفات (الفواتير)
                </label>
                <input
                  type="number"
                  className="w-full border p-2 rounded-lg bg-white text-slate-600"
                  value={closeData.expenses}
                  onChange={(e) =>
                    setCloseData({
                      ...closeData,
                      expenses: Number(e.target.value),
                    })
                  }
                />
              </div>

              {/* RETURN AMOUNT */}
              <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                <span className="text-sm font-medium">
                  المبلغ الواجب إعادته للخزينة:
                </span>
                <span
                  className={`text-lg font-bold ${
                    selectedCustody.amount - closeData.expenses < 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {selectedCustody.amount - closeData.expenses} ر.س
                </span>
              </div>

              {/* NOTES */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  ملاحظات / بيان المصروفات
                </label>
                <textarea
                  className="w-full border p-2 rounded-lg h-24 bg-white text-slate-600"
                  value={closeData.notes}
                  onChange={(e) =>
                    setCloseData({ ...closeData, notes: e.target.value })
                  }
                  placeholder="تفاصيل الفواتير..."
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsCloseModalOpen(false)}
                className="px-4 py-2 text-slate-600"
              >
                إلغاء
              </button>

              <button
                onClick={handleCloseCustody}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg"
              >
                إقفال نهائي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Custody;
