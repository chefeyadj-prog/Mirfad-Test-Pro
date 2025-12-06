import { supabase } from "../supabaseClient";
import { Supplier } from "../types";

export async function getSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
  return data || [];
}

export async function createSupplier(supplier: Omit<Supplier, "id">) {
  const { data, error } = await supabase
    .from("suppliers")
    .insert([supplier])
    .select()
    .single();

  if (error) {
    console.error("Error creating supplier:", error);
    return null;
  }

  return data;
}

export async function updateSupplier(id: string, fields: Partial<Supplier>) {
  const { data, error } = await supabase
    .from("suppliers")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating supplier:", error);
    return null;
  }

  return data;
}

export async function deleteSupplier(id: string) {
  const { error } = await supabase
    .from("suppliers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting supplier:", error);
    return false;
  }

  return true;
}

export async function getSupplierById(id: string) {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching supplier:", error);
    return null;
  }

  return data;
}

export async function getSupplierPurchases(supplierId: string) {
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("supplier_id", supplierId)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error supplier purchases:", error);
    return [];
  }

  return data || [];
}
