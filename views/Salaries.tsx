import React, { useEffect, useState } from "react";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../services/employeesService";

import {
  getSalaryTransactions,
  addSalaryTransaction,
  deleteSalaryTransaction,
} from "../services/salaryTransactionsService";

import { getCustody } from "../services/custodyService";

import { Employee, SalaryTransaction, Custody } from "../types";

const Salaries: React.FC = () => {
  /* -------------------------------------------------------------------
     🟦 1) States الأساسية
  ------------------------------------------------------------------- */
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [transactions, setTransactions] = useState<SalaryTransaction[]>([]);
  const [custodyList, setCustodyList] = useState<Custody[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    salary: 0,
  });

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [txForm, setTxForm] = useState({
    type: "loan",
    amount: 0,
    notes: "",
    date: "",
  });

  /* -------------------------------------------------------------------
     🟧 2) تحميل البيانات من Supabase
  ------------------------------------------------------------------- */
  const loadAllData = async () => {
    const emp = await getEmployees();
    setEmployees(emp);

    // جلب كل العمليات لكل الموظفين
    let allTx: SalaryTransaction[] = [];

    for (const e of emp) {
      const tx = await getSalaryTransactions(e.id);
      allTx = [...allTx, ...tx];

      // جلب العهد المرتبطة بالموظف
      const cust = await getCustody(e.id);
      setCustodyList((prev) => [...prev, ...cust]);
    }

    setTransactions(allTx);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  /* -------------------------------------------------------------------
     🟨 3) حساب بيانات الموظف
  ------------------------------------------------------------------- */
  const calculateEmployeeStats = (employeeId: string) => {
    const employeeTransactions = transactions.filter(
      (t) => t.employee_id === employeeId
    );

    const employeeCustody = custodyList.filter(
      (c) => c.employee_id === employeeId
    );

    const salary = employees.find((e) => e.id === employeeId)?.salary ?? 0;

    const loans = employeeTransactions
      .filter((t) => t.type === "loan")
      .reduce((s, t) => s + t.amount, 0);

    const deductions = employeeTransactions
      .filter((t) => t.type === "deduction")
      .reduce((s, t) => s + t.amount, 0);

    const meals = employeeTransactions
      .filter((t) => t.type === "meal")
      .reduce((s, t) => s + t.amount, 0);

    const shortages = employeeTransactions
      .filter((t) => t.type === "shortage")
      .reduce((s, t) => s + t.amount, 0);

    const bonuses = employeeTransactions
      .filter((t) => t.type === "bonus")
      .reduce((s, t) => s + t.amount, 0);

    const custodyTotal = employeeCustody.reduce(
      (sum, c) => sum + c.amount - (c.return_amount ?? 0) - (c.expenses ?? 0),
      0
    );

    const netSalary =
      salary + bonuses - loans - deductions - meals - shortages - custodyTotal;

    return {
      salary,
      loans,
      deductions,
      meals,
      shortages,
      bonuses,
      custodyTotal,
      netSalary,
    };
  };

  /* -------------------------------------------------------------------
     🟥 4) حفظ موظف (إضافة / تعديل)
  ------------------------------------------------------------------- */
  const handleSaveEmployee = async () => {
    if (!form.name.trim()) return;

    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, form);
    } else {
      await createEmployee(form);
    }

    setForm({ name: "", phone: "", salary: 0 });
    setEditingEmployee(null);
    setModalOpen(false);
    setEmployees(await getEmployees());
  };

  /* -------------------------------------------------------------------
     🟩 5) حذف موظف
  ------------------------------------------------------------------- */
  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm("هل تريد حذف الموظف؟")) return;

    await deleteEmployee(id);
    loadAllData();
  };

  /* -------------------------------------------------------------------
     🟦 6) حفظ حركة مالية
  ------------------------------------------------------------------- */
  const handleSaveTransaction = async () => {
    if (!selectedEmployee) return;

    await addSalaryTransaction({
      employee_id: selectedEmployee.id,
      type: txForm.type,
      amount: txForm.amount,
      notes: txForm.notes,
      date: txForm.date || new Date().toISOString().slice(0, 10),
    });

    setTxForm({
      type: "loan",
      amount: 0,
      notes: "",
      date: "",
    });

    setTxModalOpen(false);
    loadAllData();
  };

  /* -------------------------------------------------------------------
     🟫 7) حذف عملية مالية
  ------------------------------------------------------------------- */
  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm("حذف الحركة؟")) return;

    await deleteSalaryTransaction(id);
    loadAllData();
  };

  /* -------------------------------------------------------------------
     🟪 8) واجهة المستخدم
  ------------------------------------------------------------------- */
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">إدارة الرواتب</h2>

      {/* زر إضافة موظف */}
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => {
          setEditingEmployee(null);
          setForm({ name: "", phone: "", salary: 0 });
          setModalOpen(true);
        }}
      >
        إضافة موظف
      </button>

      {/* جدول الموظفين */}
      <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-3">الاسم</th>
              <th className="p-3">الراتب الأساسي</th>
              <th className="p-3">سلف</th>
              <th className="p-3">خصومات</th>
              <th className="p-3">وجبات</th>
              <th className="p-3">نواقص</th>
              <th className="p-3">مكافآت</th>
              <th className="p-3">عهد</th>
              <th className="p-3">الصافي</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp) => {
              const stats = calculateEmployeeStats(emp.id);

              return (
                <tr key={emp.id} className="border-t">
                  <td className="p-3">{emp.name}</td>
                  <td className="p-3">{stats.salary}</td>
                  <td className="p-3">{stats.loans}</td>
                  <td className="p-3">{stats.deductions}</td>
                  <td className="p-3">{stats.meals}</td>
                  <td className="p-3">{stats.shortages}</td>
                  <td className="p-3">{stats.bonuses}</td>
                  <td className="p-3">{stats.custodyTotal}</td>
                  <td className="p-3 font-bold">{stats.netSalary}</td>

                  <td className="p-3 space-x-2">
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded"
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setTxModalOpen(true);
                      }}
                    >
                      إضافة حركة
                    </button>

                    <button
                      className="px-3 py-1 bg-yellow-500 text-white rounded"
                      onClick={() => {
                        setEditingEmployee(emp);
                        setForm({
                          name: emp.name,
                          phone: emp.phone ?? "",
                          salary: emp.salary ?? 0,
                        });
                        setModalOpen(true);
                      }}
                    >
                      تعديل
                    </button>

                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded"
                      onClick={() => handleDeleteEmployee(emp.id)}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* نافذة الموظف */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold">
              {editingEmployee ? "تعديل موظف" : "إضافة موظف"}
            </h3>

            <input
              className="w-full p-2 border rounded"
              placeholder="الاسم"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="w-full p-2 border rounded"
              placeholder="الجوال"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <input
              type="number"
              className="w-full p-2 border rounded"
              placeholder="الراتب"
              value={form.salary}
              onChange={(e) =>
                setForm({ ...form, salary: Number(e.target.value) })
              }
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-slate-400 rounded"
                onClick={() => setModalOpen(false)}
              >
                إلغاء
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleSaveEmployee}
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الحركة المالية */}
      {txModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold">
              إضافة حركة مالية — {selectedEmployee.name}
            </h3>

            <select
              className="w-full p-2 border rounded"
              value={txForm.type}
              onChange={(e) =>
                setTxForm({ ...txForm, type: e.target.value })
              }
            >
              <option value="loan">سلفة</option>
              <option value="deduction">خصم</option>
              <option value="meal">وجبة</option>
              <option value="shortage">نقص</option>
              <option value="bonus">مكافأة</option>
            </select>

            <input
              type="number"
              className="w-full p-2 border rounded"
              placeholder="المبلغ"
              value={txForm.amount}
              onChange={(e) =>
                setTxForm({ ...txForm, amount: Number(e.target.value) })
              }
            />

            <input
              type="date"
              className="w-full p-2 border rounded"
              value={txForm.date}
              onChange={(e) =>
                setTxForm({ ...txForm, date: e.target.value })
              }
            />

            <textarea
              className="w-full p-2 border rounded"
              placeholder="ملاحظات"
              value={txForm.notes}
              onChange={(e) =>
                setTxForm({ ...txForm, notes: e.target.value })
              }
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-slate-400 rounded"
                onClick={() => setTxModalOpen(false)}
              >
                إلغاء
              </button>

              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={handleSaveTransaction}
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* جدول الحركات */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-2">كل الحركات المالية</h3>

        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-3">الموظف</th>
              <th className="p-3">النوع</th>
              <th className="p-3">المبلغ</th>
              <th className="p-3">التاريخ</th>
              <th className="p-3">ملاحظات</th>
              <th className="p-3">حذف</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((tx) => {
              const emp = employees.find((e) => e.id === tx.employee_id);
              return (
                <tr key={tx.id} className="border-t">
                  <td className="p-3">{emp?.name}</td>
                  <td className="p-3">{tx.type}</td>
                  <td className="p-3">{tx.amount}</td>
                  <td className="p-3">{tx.date}</td>
                  <td className="p-3">{tx.notes}</td>

                  <td className="p-3">
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded"
                      onClick={() => handleDeleteTransaction(tx.id)}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Salaries;
