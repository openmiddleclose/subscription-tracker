import { supabase } from "../supabaseClient";

// Fetch all subscriptions for the current user
export async function getSubscriptions() {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("next_renewal_date", { ascending: true });
  if (error) throw error;
  return data;
}

// Add a new subscription
export async function addSubscription(subscription) {
  const { data, error } = await supabase.from("subscriptions").insert([subscription]);
  if (error) throw error;
  return data;
}

// Update subscription
export async function updateSubscription(id, updates) {
  const { data, error } = await supabase
    .from("subscriptions")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
  return data;
}

// Delete subscription
export async function deleteSubscription(id) {
  const { error } = await supabase.from("subscriptions").delete().eq("id", id);
  if (error) throw error;
}
