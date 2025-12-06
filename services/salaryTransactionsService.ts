import { supabase } from "../supabaseClient";
import { SalaryTransaction } from "../types";

/* --------------------------------------
   تحميل كل عمليات الرواتب
-------------------------------------- */
export const getSalaryTransactions = async () => {
  const { data, error } = await supabase
    .from("salary_transactions")
    .select("*");

  if (error) {
    console.error("Error loading salary transactions:", error);
    return [];
  }

  return data || [];
};

/* --------------------------------------
   إضافة عملية راتب
-------------------------------------- */
export const addSalaryTransaction = async (tx: Partial<SalaryTransaction>) => {
  const { data, error } = await supabase
    .from("salary_transactions")
    .insert([tx])
    .select()
    .single();

  if (error) {
    console.error("Error adding salary transaction:", error);
    return null;
  }

  return data;
};

/* --------------------------------------
   حذف عملية راتب
-------------------------------------- */
export const deleteSalaryTransaction = async (id: string) => {
  const { error } = await supabase
    .from("salary_transactions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting salary transaction:", error);
    return false;
  }

  return true;
};
