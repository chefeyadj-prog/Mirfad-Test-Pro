import { supabase } from "../supabaseClient";
import { DailyClosing } from "../types";

// جلب كل الإغلاقات اليومية
export async function getDailyClosings() {
  const { data, error } = await supabase
    .from("daily_closings")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error loading daily closings:", error);
    return [];
  }
  return data || [];
}

// إنشاء إغلاق يومي جديد
export async function createDailyClosing(closing: Omit<DailyClosing, "id">) {
  const { data, error } = await supabase
    .from("daily_closings")
    .insert([closing])
    .select()
    .single();

  if (error) {
    console.error("Error creating closing:", error);
    return null;
  }

  return data;
}

// جلب إغلاق معين
export async function getClosingById(id: string) {
  const { data, error } = await supabase
    .from("daily_closings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error loading closing:", error);
    return null;
  }
  return data;
}
