import { supabase } from "../supabaseClient";
import { createPrivateOrg, findGovernmentOrg } from "./organizations";
import { assignProfileToOrg } from "./profiles";

export async function fetchMyApplication(userId) {
  const { data, error } = await supabase
    .from("org_applications")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchAllApplications() {
  const { data, error } = await supabase
    .from("org_applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function submitApplication(userId, form) {
  let payload = { ...form, created_by: userId };
  if (form.kind === "government") {
    const org = await findGovernmentOrg(form.region, form.district, form.category);
    payload = { ...payload, org_name: org.name, target_org_id: org.id };
  }
  const { data, error } = await supabase.from("org_applications").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function approveApplication(application) {
  if (application.kind === "government") {
    await assignProfileToOrg(application.created_by, application.target_org_id);
  } else {
    const org = await createPrivateOrg({
      name: application.org_name,
      type: application.org_type,
      city: application.city,
    });
    await assignProfileToOrg(application.created_by, org.id);
  }
  const { error } = await supabase
    .from("org_applications")
    .update({ status: "approved" })
    .eq("id", application.id);
  if (error) throw error;
}

export async function rejectApplication(application, reason) {
  const { error } = await supabase
    .from("org_applications")
    .update({ status: "rejected", rejection_reason: reason || null })
    .eq("id", application.id);
  if (error) throw error;
}
