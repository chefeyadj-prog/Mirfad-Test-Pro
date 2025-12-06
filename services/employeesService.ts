import { supabase } from "../supabaseClient";
import { Employee } from "../types";

export async function getEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading employees:", error);
    return [];
  }
  return data || [];
}

export async function createEmployee(emp: Omit<Employee, "id">) {
  const { data, error } = await supabase
    .from("employees")
    .insert([emp])
    .select()
    .single();

  if (error) {
    console.error("Error creating employee:", error);
    return null;
  }
  return data;
}

export async function updateEmployee(id: string, fields: Partial<Employee>) {
  const { data, error } = await supabase
    .from("employees")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function deleteEmployee(id: string) {
  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", id);

  return !error;
}
