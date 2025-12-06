import { supabase } from "../supabaseClient";
import { Custody } from "../types";

export async function getCustody(employeeId: string) {
  const { data, error } = await supabase
    .from("custody")
    .select("*")
    .eq("employee_id", employeeId);

  if (error) {
    console.error("Error loading custody:", error);
    return [];
  }
  return data || [];
}

export async function addCustody(c: Omit<Custody, "id">) {
  const { data, error } = await supabase
    .from("custody")
    .insert([c])
    .select()
    .single();

  if (error) {
    console.error("Error adding custody:", error);
    return null;
  }

  return data;
}

export async function updateCustody(id: string, fields: Partial<Custody>) {
  const { data, error } = await supabase
    .from("custody")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) return null;
  return data;
}
