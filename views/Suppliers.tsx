import React, { useEffect, useState } from "react";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../services/suppliersService";
import { Supplier } from "../types";

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    tax_number: "",
    code: "",
  });

  const loadData = async () => {
    const data = await getSuppliers();
    setSuppliers(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return;

    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, form);
    } else {
      await createSupplier(form as any);
    }

    setModalOpen(false);
    setEditingSupplier(null);
    setForm({ name: "", phone: "", tax_number: "", code: "" });
    loadData();
  };

  const handleEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setForm({
      name: s.name,
      phone: s.phone ?? "",
      tax_number: s.tax_number ?? "",
      code: s.code ?? "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد؟")) {
      await deleteSupplier(id);
      loadData();
    }
  };

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">الموردين</h2>
        <button
          onClick={() => {
            setEditingSupplier(null);
            setForm({ name: "", phone: "", tax_number: "", code: "" });
            setModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          إضافة مورد
        </button>
      </div>

      <input
        className="w-full p-2 border rounded-lg"
        placeholder="بحث عن مورد..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 text-right">
              <th className="p-3">الاسم</th>
              <th className="p-3">الهاتف</th>
              <th className="p-3">الضريبة</th>
              <th className="p-3">الكود</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.phone}</td>
                <td className="p-3">{s.tax_number}</td>
                <td className="p-3">{s.code}</td>
                <td className="p-3 space-x-2">
                  <button
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                    onClick={() => handleEdit(s)}
                  >
                    تعديل
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded"
                    onClick={() => handleDelete(s.id)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
            <h3 className="font-bold text-lg">
              {editingSupplier ? "تعديل مورد" : "إضافة مورد"}
            </h3>

            <input
              className="w-full border p-2 rounded"
              placeholder="اسم المورد"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="w-full border p-2 rounded"
              placeholder="الهاتف"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <input
              className="w-full border p-2 rounded"
              placeholder="الرقم الضريبي"
              value={form.tax_number}
              onChange={(e) => setForm({ ...form, tax_number: e.target.value })}
            />

            <input
              className="w-full border p-2 rounded"
              placeholder="الكود"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />

            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 bg-slate-300 rounded" onClick={() => setModalOpen(false)}>
                إلغاء
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleSave}
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
