import { supabase } from "../supabaseClient";
import { Purchase, PurchaseItem } from "../types";

// جلب كل فواتير المشتريات
export async function getPurchases(): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error loading purchases:", error);
    return [];
  }
  return data || [];
}

// جلب فاتورة واحدة عبر ID
export async function getPurchaseById(id: string) {
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error loading purchase:", error);
    return null;
  }
  return data;
}

// إضافة فاتورة شراء
export async function createPurchase(purchase: Omit<Purchase, "id">) {
  const { data, error } = await supabase
    .from("purchases")
    .insert([purchase])
    .select()
    .single();

  if (error) {
    console.error("Error creating purchase:", error);
    return null;
  }

  return data;
}

// تعديل فاتورة
export async function updatePurchase(id: string, fields: Partial<Purchase>) {
  const { data, error } = await supabase
    .from("purchases")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating purchase:", error);
    return null;
  }

  return data;
}

// حذف فاتورة + البنود التابعة
export async function deletePurchase(id: string) {
  const { error } = await supabase
    .from("purchases")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting purchase:", error);
    return false;
  }
  return true;
}

/* ---------------------- ITEMS ----------------------- */

// جلب بنود الفاتورة
export async function getPurchaseItems(purchaseId: string): Promise<PurchaseItem[]> {
  const { data, error } = await supabase
    .from("purchase_items")
    .select("*")
    .eq("purchase_id", purchaseId);

  if (error) {
    console.error("Error loading items:", error);
    return [];
  }
  return data || [];
}

// إضافة بند واحد
export async function addPurchaseItem(item: Omit<PurchaseItem, "id">) {
  const { data, error } = await supabase
    .from("purchase_items")
    .insert([item])
    .select()
    .single();

  if (error) {
    console.error("Error adding item:", error);
    return null;
  }
  return data;
}

// حذف بند
export async function deletePurchaseItem(id: string) {
  const { error } = await supabase
    .from("purchase_items")
    .delete()
    .eq("id", id);

  if (error) {
    return false;
  }
  return true;
}

// تعديل بند
export async function updatePurchaseItem(id: string, fields: Partial<PurchaseItem>) {
  const { data, error } = await supabase
    .from("purchase_items")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) return null;
  return data;
}
