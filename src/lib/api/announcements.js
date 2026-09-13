import { supabase } from "../supabaseClient";

const SELECT = `*, org:organizations(id,name)`;

function mapAnnouncement(row) {
  return {
    id: row.id,
    orgId: row.org_id,
    orgName: row.org?.name || "",
    kind: row.kind,
    title: row.title,
    description: row.description,
    region: row.region,
    district: row.district,
    linePoints: row.line_points || [],
    detourPoints: row.detour_points || [],
    zoneCenter: row.zone_center,
    zoneRadius: row.zone_radius,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    createdAt: row.created_at,
  };
}

export async function fetchAnnouncements() {
  const { data, error } = await supabase.from("announcements").select(SELECT).order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapAnnouncement);
}

export async function fetchOrgAnnouncements(orgId) {
  const { data, error } = await supabase
    .from("announcements")
    .select(SELECT)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapAnnouncement);
}

export async function createAnnouncement(orgId, userId, form) {
  const payload = {
    org_id: orgId,
    created_by: userId,
    kind: form.kind,
    title: form.title,
    description: form.description || null,
    region: form.region || null,
    district: form.district || null,
    line_points: form.kind === "line" ? form.linePoints : null,
    detour_points: form.kind === "line" && form.detourPoints?.length ? form.detourPoints : null,
    zone_center: form.kind === "zone" ? form.zoneCenter : null,
    zone_radius: form.kind === "zone" ? form.zoneRadius : null,
    starts_at: form.startsAt || null,
    ends_at: form.endsAt || null,
  };
  const { data, error } = await supabase.from("announcements").insert(payload).select(SELECT).single();
  if (error) throw error;
  return mapAnnouncement(data);
}

export async function deleteAnnouncement(id) {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw error;
}
