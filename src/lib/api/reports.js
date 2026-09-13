import { supabase } from "../supabaseClient";
import { findGovernmentOrg } from "./organizations";
import { REOPEN_VOTES_REQUIRED } from "../../constants";

const SELECT = `
  *,
  assigned_org:organizations(id,name,kind),
  report_votes(user_id),
  report_reopen_votes(user_id),
  report_timeline(id,status,at,by,note)
`;

function mapReport(row) {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    description: row.description,
    photos: row.photos?.length ? row.photos : (row.photo_url ? [row.photo_url] : []),
    photo: row.photos?.[0] || row.photo_url || null,
    region: row.region,
    district: row.district,
    address: row.address,
    coords: row.coords,
    status: row.status,
    priority: row.priority,
    assignedOrgId: row.assigned_org_id,
    assignedDeptName: row.assigned_org?.name || "",
    assignedOrgKind: row.assigned_org?.kind || null,
    resolutionPhotos: row.resolution_photos || [],
    votes: (row.report_votes || []).map((v) => v.user_id),
    reopenVotes: (row.report_reopen_votes || []).map((v) => v.user_id),
    createdBy: row.created_by,
    createdByName: row.created_by_name,
    createdAt: row.created_at,
    timeline: (row.report_timeline || []).slice().sort((a, b) => new Date(a.at) - new Date(b.at)),
  };
}

export async function fetchReports() {
  const { data, error } = await supabase.from("reports").select(SELECT).order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapReport);
}

export async function fetchReport(id) {
  const { data, error } = await supabase.from("reports").select(SELECT).eq("id", id).single();
  if (error) throw error;
  return mapReport(data);
}

export async function createReport(profile, { category, title, description, photoUrls, region, district, address, coords }) {
  const org = await findGovernmentOrg(region, district, category);

  const { data: inserted, error } = await supabase
    .from("reports")
    .insert({
      category, title, description: description || null, photos: photoUrls || [],
      region, district, address: address || null, coords,
      status: "assigned", priority: "normal",
      assigned_org_id: org.id,
      created_by: profile.id, created_by_name: profile.name,
    })
    .select("id")
    .single();
  if (error) throw error;

  const { error: timelineError } = await supabase.from("report_timeline").insert([
    { report_id: inserted.id, status: "submitted", by: "Fuqaro", note: "Hisobot yuborildi." },
    { report_id: inserted.id, status: "assigned", by: "Tizim", note: `Avtomatik ravishda "${org.name}" ga yo'naltirildi.` },
  ]);
  if (timelineError) throw timelineError;

  return fetchReport(inserted.id);
}

export async function addVoteIfMissing(reportId, userId) {
  const { error } = await supabase.from("report_votes").insert({ report_id: reportId, user_id: userId });
  if (error && error.code !== "23505") throw error;
}

export async function toggleVote(reportId, userId, alreadyVoted) {
  if (alreadyVoted) {
    const { error } = await supabase.from("report_votes").delete().eq("report_id", reportId).eq("user_id", userId);
    if (error) throw error;
  } else {
    await addVoteIfMissing(reportId, userId);
  }
}

export async function advanceStatus(reportId, status, note, by) {
  const { error } = await supabase.from("reports").update({ status }).eq("id", reportId);
  if (error) throw error;
  const { error: timelineError } = await supabase.from("report_timeline").insert({ report_id: reportId, status, note, by });
  if (timelineError) throw timelineError;
}

export async function markResolved(reportId, resolutionPhotoUrls, by) {
  const { error } = await supabase
    .from("reports")
    .update({ status: "resolved", resolution_photos: resolutionPhotoUrls })
    .eq("id", reportId);
  if (error) throw error;
  const note = `${resolutionPhotoUrls.length} ta tasdiqlovchi rasm bilan yopildi. (Sun'iy intellekt yordamida yaratilgan rasmlar taqiqlanadi — bu ishonchga asoslangan, avtomatik tekshirilmaydi.)`;
  const { error: timelineError } = await supabase.from("report_timeline").insert({ report_id: reportId, status: "resolved", note, by });
  if (timelineError) throw timelineError;
}

export async function reassignToOrg(reportId, orgId, orgName, currentStatus) {
  const { error } = await supabase.from("reports").update({ assigned_org_id: orgId }).eq("id", reportId);
  if (error) throw error;
  const note = `Boshqa tashkilotga qayta tayinlandi: "${orgName}".`;
  await supabase.from("report_timeline").insert({ report_id: reportId, status: currentStatus, note, by: "Admin" });
}

// Xususiy tashkilot hali davlat bo'limida turgan (hal qilinmagan) hisobotni o'ziga qabul qiladi.
export async function claimReport(reportId, orgId, orgName) {
  const { error } = await supabase
    .from("reports")
    .update({ assigned_org_id: orgId, status: "in_progress" })
    .eq("id", reportId);
  if (error) throw error;
  const note = `"${orgName}" ushbu muammoni o'z zimmasiga oldi va hal qilish ustida ishlamoqda.`;
  const { error: timelineError } = await supabase
    .from("report_timeline")
    .insert({ report_id: reportId, status: "in_progress", note, by: orgName });
  if (timelineError) throw timelineError;
}

// Admin: soxta/spam hisobotni butunlay o'chiradi.
export async function deleteReport(reportId) {
  const { error } = await supabase.from("reports").delete().eq("id", reportId);
  if (error) throw error;
}

// Admin: hisobot ma'lumotlarini tahrirlaydi.
export async function updateReportDetails(reportId, { title, description, category }) {
  const { data, error } = await supabase
    .from("reports")
    .update({ title, description, category })
    .eq("id", reportId)
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function setPriority(reportId, priority) {
  const { error } = await supabase.from("reports").update({ priority }).eq("id", reportId);
  if (error) throw error;
}

// Ovoz qo'shadi va agar chegaraga yetsa hisobotni avtomatik qayta ochadi (in_progress).
export async function reopenVote(report, userId) {
  const { error } = await supabase.from("report_reopen_votes").insert({ report_id: report.id, user_id: userId });
  if (error && error.code !== "23505") throw error;

  const { count, error: countError } = await supabase
    .from("report_reopen_votes")
    .select("*", { count: "exact", head: true })
    .eq("report_id", report.id);
  if (countError) throw countError;

  if (count >= REOPEN_VOTES_REQUIRED) {
    await advanceStatus(
      report.id,
      "in_progress",
      `${count} fuqaro "hal qilinmagan" deb ovoz berdi — hisobot qayta ochildi.`,
      "Jamiyat"
    );
  }
  return count;
}

export function subscribeToReports(onChange) {
  const channel = supabase
    .channel("reports-all")
    .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, onChange)
    .subscribe();
  return () => supabase.removeChannel(channel);
}
