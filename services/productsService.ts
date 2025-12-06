import { supabase } from "../supabaseClient";
import { Product } from "../types";

// جلب المنتجات
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading products:", error);
    return [];
  }
  return data || [];
}

// إضافة منتج
export async function createProduct(product: Omit<Product, "id">) {
  const { data, error } = await supabase
    .from("products")
    .insert([product])
    .select()
    .single();
  if (error) {
    console.error("Error adding product:", error);
    return null;
  }
  return data;
}

// تعديل منتج
export async function updateProduct(id: string, fields: Partial<Product>) {
  const { data, error } = await supabase
    .from("products")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating product:", error);
    return null;
  }
  return data;
}

// حذف منتج
export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting product:", error);
    return false;
  }
  return true;
}
