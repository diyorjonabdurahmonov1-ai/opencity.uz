import { useEffect, useRef, useState } from "react";
import {
  TrendingUp, ListChecks, FileWarning, Building2, Info, ChevronLeft, Check, ImageUp, Loader2,
  Users, Ban, Trash2, Pencil,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { CATEGORIES, STATUS, PRIORITY, DONE_STATUSES, HOT_VOTES, fmtDate } from "../constants";
import { S } from "../styles";
import { SideNav, StatCard, EmptyState, ReportCard, ReportDetail } from "./shared";
import { setPriority, reassignToOrg, deleteReport, updateReportDetails } from "../lib/api/reports";
import { findGovernmentOrg, searchOrganizations, uploadOrgLogo, updateOrgDetails, setOrgActive } from "../lib/api/organizations";
import { fetchAllApplications, approveApplication, rejectApplication } from "../lib/api/applications";
import {
  findProfileByEmail, assignProfileToOrg, searchProfiles, fetchRecentProfiles,
  setProfileRole, setProfileBanned,
} from "../lib/api/profiles";

export function AdminPortal({ reports, refreshReports, orgs, refreshOrgs, showToast }) {
  const [tab, setTab] = useState("overview");
  const [applications, setApplications] = useState([]);

  const refreshApplications = async () => setApplications(await fetchAllApplications());
  useEffect(() => { refreshApplications(); }, []);

  const tabs = [
    { id: "overview", label: "Umumiy ko'rinish", icon: TrendingUp },
    { id: "reports", label: "Hisobotlar", icon: ListChecks },
    { id: "applications", label: "Tashkilot arizalari", icon: FileWarning },
    { id: "orgs", label: "Tashkilotlar", icon: Building2 },
    { id: "users", label: "Foydalanuvchilar", icon: Users },
  ];

  return (
    <div style={S.withSidebar} className="oc-shell">
      <SideNav items={tabs} active={tab} onChange={setTab} />
      <div style={S.content}>
        <div style={S.demoNote}><Info size={14} /> Admin panel — barcha hisobotlar, arizalar va tashkilotlarni shu yerdan boshqarasiz.</div>
        <div key={tab} className="oc-view-fade">
        {tab === "overview" && <AdminOverview reports={reports} applications={applications} orgs={orgs} />}
        {tab === "reports" && (
          <AdminReports reports={reports} refreshReports={refreshReports} orgs={orgs} showToast={showToast} />
        )}
        {tab === "applications" && (
          <AdminApplications
            applications={applications}
            onDecision={async (app, decision, reason) => {
              if (decision === "approved") {
                await approveApplication(app);
                await refreshOrgs();
                showToast("Tashkilot tasdiqlandi ✓");
              } else {
                await rejectApplication(app, reason);
                showToast("Ariza rad etildi");
              }
              await refreshApplications();
            }}
          />
        )}
        {tab === "orgs" && <AdminOrgs orgs={orgs} reports={reports} refreshOrgs={refreshOrgs} showToast={showToast} />}
        {tab === "users" && <AdminUsers showToast={showToast} />}
        </div>
      </div>
    </div>
  );
}

function AdminOverview({ reports, applications, orgs }) {
  const byCategory = CATEGORIES.map((c) => ({ name: c.label.split(" ")[0], value: reports.filter((r) => r.category === c.id).length }));
  const byStatus = Object.entries(STATUS).map(([k, v]) => ({ name: v.label, value: reports.filter((r) => r.status === k).length, color: v.color }));
  const resolved = reports.filter((r) => DONE_STATUSES.includes(r.status)).length;
  const hot = reports.filter((r) => r.votes.length >= HOT_VOTES && !DONE_STATUSES.includes(r.status)).length;

  const byRegion = Object.entries(
    reports.reduce((acc, r) => { if (r.region) acc[r.region] = (acc[r.region] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));

  const orgLeaderboard = orgs
    .map((o) => ({ name: o.name, resolved: reports.filter((r) => r.assignedOrgId === o.id && DONE_STATUSES.includes(r.status)).length }))
    .filter((o) => o.resolved > 0)
    .sort((a, b) => b.resolved - a.resolved)
    .slice(0, 5);

  const resolutionDays = reports
    .filter((r) => DONE_STATUSES.includes(r.status))
    .map((r) => {
      const submitted = r.timeline.find((t) => t.status === "submitted");
      const done = r.timeline.find((t) => t.status === "resolved");
      if (!submitted || !done) return null;
      return (new Date(done.at) - new Date(submitted.at)) / (1000 * 60 * 60 * 24);
    })
    .filter((d) => d != null && d >= 0);
  const avgResolutionDays = resolutionDays.length ? (resolutionDays.reduce((a, b) => a + b, 0) / resolutionDays.length).toFixed(1) : "—";

  return (
    <div>
      <h2 style={S.pageTitle}>Admin — umumiy ko'rinish</h2>
      <div style={S.statsRow}>
        <StatCard label="Jami hisobotlar" value={reports.length} accent="#1E88A8" />
        <StatCard label="Hal qilingan" value={resolved} accent="#2E9A5C" />
        <StatCard label="Dolzarb (ko'p ovoz)" value={hot} accent="#B2402A" />
        <StatCard label="O'rtacha hal qilish (kun)" value={avgResolutionDays} accent="#C98A2B" />
        <StatCard label="Xususiy tashkilotlar" value={orgs.length} accent="#8759B3" />
        <StatCard label="Kutilayotgan arizalar" value={applications.filter((a) => a.status === "pending").length} accent="#C98A2B" />
      </div>
      {reports.length > 0 ? (
        <>
          <h3 style={S.sectionTitle}>Turkumlar bo'yicha</h3>
          <div style={S.chartBox}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8ED" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#1E88A8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <h3 style={S.sectionTitle}>Hudud bo'yicha (top 8)</h3>
          <div style={S.chartBox}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byRegion}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8ED" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#8759B3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <h3 style={S.sectionTitle}>Holat bo'yicha taqsimot</h3>
          <div style={S.chartBox}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byStatus.filter((s) => s.value > 0)} dataKey="value" nameKey="name" outerRadius={80} label>
                  {byStatus.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {orgLeaderboard.length > 0 && (
            <>
              <h3 style={S.sectionTitle}>Eng faol xususiy tashkilotlar</h3>
              <div style={S.votingList}>
                {orgLeaderboard.map((o, i) => (
                  <div key={o.name} style={S.votingRow}>
                    <div style={{ ...S.stepDot, ...S.stepDotActive, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1 }}><div style={S.reportCardTitle}>{o.name}</div></div>
                    <span style={{ ...S.statusPill, background: "#2E9A5C1a", color: "#2E9A5C" }}>{o.resolved} ta hal qilingan</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : <EmptyState icon={TrendingUp} text="Statistikalar hisobotlar yuborilgach paydo bo'ladi." />}
    </div>
  );
}

function AdminReports({ reports, refreshReports, orgs, showToast }) {
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const list = filter === "all" ? reports : reports.filter((r) => r.status === filter);
  const open = reports.find((r) => r.id === openId);

  const reassign = async (report, orgId) => {
    if (!orgId) {
      const gov = await findGovernmentOrg(report.region, report.district, report.category);
      await reassignToOrg(report.id, gov.id, gov.name, report.status);
    } else {
      const org = orgs.find((o) => o.id === orgId);
      await reassignToOrg(report.id, orgId, org.name, report.status);
    }
    await refreshReports();
    showToast("Qayta tayinlandi ✓");
  };

  const changePriority = async (report, priority) => {
    await setPriority(report.id, priority);
    await refreshReports();
  };

  const toggleSelect = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const bulkDelete = async () => {
    if (!window.confirm(`${selected.length} ta hisobotni butunlay o'chirmoqchimisiz? Bu amalni orqaga qaytarib bo'lmaydi.`)) return;
    for (const id of selected) await deleteReport(id);
    setSelected([]);
    await refreshReports();
    showToast("Tanlangan hisobotlar o'chirildi ✓");
  };

  const bulkPriority = async (priority) => {
    for (const id of selected) await setPriority(id, priority);
    setSelected([]);
    await refreshReports();
    showToast("Muhimlik darajasi yangilandi ✓");
  };

  const startEdit = () => {
    setEditForm({ title: open.title, description: open.description || "", category: open.category });
    setEditing(true);
  };
  const saveEdit = async () => {
    await updateReportDetails(open.id, editForm);
    setEditing(false);
    await refreshReports();
    showToast("Hisobot tahrirlandi ✓");
  };
  const removeReport = async () => {
    if (!window.confirm("Bu hisobotni butunlay o'chirmoqchimisiz? Bu amalni orqaga qaytarib bo'lmaydi.")) return;
    await deleteReport(open.id);
    setOpenId(null);
    await refreshReports();
    showToast("Hisobot o'chirildi ✓");
  };

  if (open) {
    return (
      <div>
        <button style={S.linkBtn} onClick={() => { setOpenId(null); setEditing(false); }}><ChevronLeft size={15} /> Ro'yxatga qaytish</button>
        <ReportDetail report={open} onBack={() => setOpenId(null)} />
        {editing ? (
          <div style={S.adminActionBox}>
            <div style={S.field}><label style={S.label}>Sarlavha</label>
              <input style={S.input} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></div>
            <div style={S.field}><label style={S.label}>Tavsif</label>
              <textarea style={{ ...S.input, height: 90 }} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} /></div>
            <div style={S.field}><label style={S.label}>Turkum</label>
              <select style={S.input} value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select></div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.primaryBtn} onClick={saveEdit}>Saqlash</button>
              <button style={S.secondaryBtn} onClick={() => setEditing(false)}>Bekor qilish</button>
            </div>
          </div>
        ) : (
          <div style={S.adminActionBox} className="oc-row2">
            <div style={S.field}>
              <label style={S.label}>Xususiy tashkilotga qayta tayinlash (ixtiyoriy)</label>
              <select style={S.input} defaultValue="" onChange={(e) => reassign(open, e.target.value)}>
                <option value="">Avtomatik davlat bo'limida qoldirish ({open.assignedDeptName})</option>
                {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div style={S.field}>
              <label style={S.label}>Muhimlik darajasi</label>
              <select style={S.input} value={open.priority} onChange={(e) => changePriority(open, e.target.value)}>
                {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.secondaryBtn} onClick={startEdit}><Pencil size={14} /> Tahrirlash</button>
              <button style={S.dangerBtn} onClick={removeReport}><Trash2 size={14} /> O'chirish</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={S.rowHeader}>
        <h2 style={S.pageTitle}>Barcha hisobotlar</h2>
        <select style={S.selectSm} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Barchasi</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>
      {selected.length > 0 && (
        <div style={S.bulkBar}>
          <span>{selected.length} ta tanlandi</span>
          <select style={S.selectSm} defaultValue="" onChange={(e) => { if (e.target.value) bulkPriority(e.target.value); e.target.value = ""; }}>
            <option value="" disabled>Muhimlikni belgilash...</option>
            {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button style={S.dangerBtn} onClick={bulkDelete}><Trash2 size={14} /> O'chirish</button>
          <button style={S.linkBtn} onClick={() => setSelected([])}>Bekor qilish</button>
        </div>
      )}
      {list.length === 0 ? <EmptyState icon={ListChecks} text="Hisobotlar topilmadi." /> : (
        <div style={S.reportGrid}>
          {list.map((r) => (
            <div key={r.id} style={{ position: "relative" }}>
              <input type="checkbox" checked={selected.includes(r.id)} style={S.bulkCheckbox}
                onClick={(e) => e.stopPropagation()} onChange={() => toggleSelect(r.id)} />
              <ReportCard report={r} onClick={() => setOpenId(r.id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminApplications({ applications, onDecision }) {
  const [openId, setOpenId] = useState(null);
  const [reason, setReason] = useState("");
  const open = applications.find((a) => a.id === openId);
  if (open) {
    return (
      <div>
        <button style={S.linkBtn} onClick={() => setOpenId(null)}><ChevronLeft size={15} /> Ro'yxatga qaytish</button>
        <div style={S.detailCard}>
          <span style={S.catChip}>{open.kind === "government" ? "Davlat bo'limi xodimi" : "Tadbirkor / xususiy kompaniya"}</span>
          <h2 style={{ ...S.pageTitle, marginTop: 8 }}>{open.org_name}</h2>
          {open.kind === "private" && (
            <>
              <div style={S.reviewRow}><b>Turi:</b> {open.org_type}</div>
              <div style={S.reviewRow}><b>Ro'yxat/STIR:</b> {open.reg_number || "—"}</div>
              <div style={S.reviewRow}><b>Manzil:</b> {open.address}, {open.city}</div>
            </>
          )}
          <div style={S.reviewRow}><b>Email:</b> {open.email}</div>
          <div style={S.reviewRow}><b>Telefon:</b> {open.phone}</div>
          <div style={S.reviewRow}><b>{open.kind === "government" ? "Xodim" : "Mas'ul shaxs"}:</b> {open.contact_person} ({open.contact_position || "—"})</div>
          {open.description && <div style={S.reviewRow}><b>Tavsif:</b> {open.description}</div>}
          <div style={S.reviewRow}><b>Holat:</b> {appStatusLabel(open.status)}</div>
          {open.status === "pending" && (
            <>
              <div style={S.field}><label style={S.label}>Rad etish sababi (agar kerak bo'lsa)</label>
                <input style={S.input} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Masalan: hujjatlar to'liq emas" /></div>
              <div style={S.wizardFooter}>
                <button style={S.dangerBtn} onClick={() => { onDecision(open, "rejected", reason); setOpenId(null); }}>Rad etish</button>
                <div style={{ flex: 1 }} />
                <button style={S.primaryBtn} onClick={() => { onDecision(open, "approved"); setOpenId(null); }}>Tasdiqlash <Check size={15} /></button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  return (
    <div>
      <h2 style={S.pageTitle}>Tashkilot arizalari</h2>
      {applications.length === 0 ? <EmptyState icon={FileWarning} text="Arizalar yo'q." /> : (
        <div style={S.appList}>
          {applications.map((a) => (
            <div key={a.id} style={S.appRow} className="oc-card" onClick={() => setOpenId(a.id)}>
              <Building2 size={18} color="#1E88A8" />
              <div style={{ flex: 1 }}>
                <div style={S.reportCardTitle}>{a.org_name}</div>
                <div style={S.reportCardMeta}>{a.kind === "government" ? "Davlat bo'limi" : a.org_type} · {fmtDate(a.created_at)}</div>
              </div>
              <span style={{ ...S.statusPill, ...appPillStyle(a.status) }}>{appStatusLabel(a.status)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function appStatusLabel(s) { return { pending: "Kutilmoqda", approved: "Tasdiqlangan", rejected: "Rad etilgan" }[s] || s; }
function appPillStyle(s) { const c = { pending: "#C98A2B", approved: "#2E9A5C", rejected: "#A33A3A" }[s] || "#7A8A99"; return { background: c + "1a", color: c }; }

function AdminOrgs({ orgs, reports, refreshOrgs, showToast }) {
  return (
    <div>
      <StaffAssignForm showToast={showToast} />
      <h2 style={S.pageTitle}>Tasdiqlangan xususiy tashkilotlar</h2>
      {orgs.length === 0 ? <EmptyState icon={Building2} text="Hali tasdiqlangan xususiy tashkilotlar yo'q." /> : (
        <div style={S.reportGrid}>
          {orgs.map((o) => {
            const count = reports.filter((r) => r.assignedOrgId === o.id).length;
            return <OrgCard key={o.id} org={o} count={count} refreshOrgs={refreshOrgs} showToast={showToast} />;
          })}
        </div>
      )}
    </div>
  );
}

function OrgCard({ org, count, refreshOrgs, showToast }) {
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: org.name, type: org.type || "", city: org.city || "" });
  const fileRef = useRef();
  const active = org.active !== false;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadOrgLogo(org.id, file);
      await refreshOrgs();
      showToast(`${org.name} uchun logotip yuklandi ✓`);
    } catch (err) {
      showToast(`Xatolik: ${err.message}`);
    }
    setUploading(false);
  };

  const saveEdit = async () => {
    await updateOrgDetails(org.id, form);
    setEditing(false);
    await refreshOrgs();
    showToast("Tashkilot ma'lumotlari yangilandi ✓");
  };

  const toggleActive = async () => {
    await setOrgActive(org.id, !active);
    await refreshOrgs();
    showToast(active ? "Tashkilot faolsizlantirildi ✓" : "Tashkilot faollashtirildi ✓");
  };

  return (
    <div style={{ ...S.orgCard, opacity: active ? 1 : 0.55 }}>
      {org.logo_url ? (
        <img src={org.logo_url} alt="" style={S.orgLogo} />
      ) : (
        <div style={{ ...S.orgLogo, ...S.orgLogoPlaceholder }}><Building2 size={22} color="#8A97A2" /></div>
      )}
      {editing ? (
        <>
          <input style={S.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nomi" />
          <input style={S.input} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Turi" />
          <input style={S.input} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Shahar" />
          <div style={{ display: "flex", gap: 6 }}>
            <button style={S.primaryBtn} onClick={saveEdit}>Saqlash</button>
            <button style={S.secondaryBtn} onClick={() => setEditing(false)}>Bekor</button>
          </div>
        </>
      ) : (
        <>
          <div style={S.reportCardTitle}>{org.name} {!active && <span style={{ color: "#A33A3A", fontSize: 11 }}>(nofaol)</span>}</div>
          <div style={S.reportCardMeta}>{org.type} · {org.city}</div>
          <div style={S.fine}>{count} ta hisobot tayinlangan</div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button style={S.secondaryBtn} onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="spin" size={14} /> : <ImageUp size={14} />}
              {org.logo_url ? "Logotip" : "Logotip yuklash"}
            </button>
            <button style={S.secondaryBtn} onClick={() => setEditing(true)}><Pencil size={14} /> Tahrirlash</button>
            <button style={active ? S.dangerBtn : S.primaryBtn} onClick={toggleActive}>
              {active ? "Faolsizlantirish" : "Faollashtirish"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StaffAssignForm({ showToast }) {
  const [email, setEmail] = useState("");
  const [found, setFound] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const [orgQuery, setOrgQuery] = useState("");
  const [orgResults, setOrgResults] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);

  const search = async () => {
    setSearching(true);
    setError("");
    setFound(null);
    try {
      const p = await findProfileByEmail(email);
      if (!p) setError("Bu email bilan foydalanuvchi topilmadi. (Avval Google bilan bir marta kirgan bo'lishi kerak.)");
      else setFound(p);
    } catch (e) {
      setError(e.message);
    }
    setSearching(false);
  };

  const searchOrgs = async (q) => {
    setOrgQuery(q);
    setSelectedOrg(null);
    setOrgResults(q.trim().length >= 2 ? await searchOrganizations(q) : []);
  };

  const assign = async () => {
    if (!found || !selectedOrg) return;
    await assignProfileToOrg(found.id, selectedOrg.id);
    showToast(`${found.name} — "${selectedOrg.name}" tashkilotiga biriktirildi ✓`);
    setFound(null);
    setEmail("");
    setOrgQuery("");
    setOrgResults([]);
    setSelectedOrg(null);
  };

  return (
    <div style={S.staffForm}>
      <h3 style={{ ...S.sectionTitle, margin: "0 0 8px" }}>Xodimni tashkilotga biriktirish</h3>
      <p style={S.fine}>Foydalanuvchi avval Google bilan kirgan bo'lishi kerak. Uni davlat bo'limi yoki tasdiqlangan xususiy tashkilotga biriktirish uning "Bo'lim" portaliga kirish huquqini beradi.</p>
      <div style={S.field}>
        <label style={S.label}>Foydalanuvchi emaili</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input style={S.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="xodim@misol.uz" />
          <button style={S.secondaryBtn} onClick={search} disabled={!email.trim() || searching}>Qidirish</button>
        </div>
        {error && <div style={{ fontSize: 12.5, color: "#A33A3A", marginTop: 6 }}>{error}</div>}
        {found && <div style={{ ...S.fine, color: "#2E9A5C" }}>Topildi: {found.name} ({found.email}) — joriy rol: {found.role}</div>}
      </div>
      <div style={S.field}>
        <label style={S.label}>Tashkilot (davlat bo'limi yoki xususiy kompaniya nomi bo'yicha qidiring)</label>
        <input style={S.input} value={orgQuery} onChange={(e) => searchOrgs(e.target.value)} placeholder="Masalan: Samarqand shahri — Yo'l xo'jaligi..." />
        {orgResults.length > 0 && (
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
            {orgResults.map((o) => (
              <div key={o.id} onClick={() => { setSelectedOrg(o); setOrgQuery(o.name); setOrgResults([]); }}
                style={{ fontSize: 12.5, padding: "6px 10px", borderRadius: 8, background: "#F0F4F6", cursor: "pointer" }}>
                {o.name}
              </div>
            ))}
          </div>
        )}
        {selectedOrg && <div style={{ ...S.fine, color: "#2E9A5C" }}>Tanlandi: {selectedOrg.name}</div>}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={S.primaryBtn} onClick={assign} disabled={!found || !selectedOrg}>Biriktirish</button>
      </div>
    </div>
  );
}

function AdminUsers({ showToast }) {
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const load = async (q) => {
    setLoading(true);
    setProfiles(q.trim().length >= 2 ? await searchProfiles(q) : await fetchRecentProfiles());
    setLoading(false);
  };
  useEffect(() => { load(""); }, []);

  const open = profiles.find((p) => p.id === openId);

  const changeRole = async (p, role) => {
    await setProfileRole(p.id, role);
    showToast(`${p.name} roli yangilandi ✓`);
    await load(query);
  };

  const toggleBan = async (p) => {
    await setProfileBanned(p.id, !p.banned);
    showToast(p.banned ? `${p.name} blokdan chiqarildi ✓` : `${p.name} bloklandi ✓`);
    await load(query);
  };

  if (open) {
    return (
      <div>
        <button style={S.linkBtn} onClick={() => setOpenId(null)}><ChevronLeft size={15} /> Ro'yxatga qaytish</button>
        <div style={S.detailCard}>
          <div style={{ ...S.profileCard, boxShadow: "none", border: "none", padding: 0 }}>
            <div style={S.avatarLg}>{open.name.slice(0, 1).toUpperCase()}</div>
            <div>
              <div style={S.profileName}>{open.name}</div>
              <div style={S.profileRole}>{open.email}</div>
            </div>
          </div>
          <div style={S.reviewRow}><b>Joriy rol:</b> {roleLabel(open.role)}{open.org?.name ? ` · ${open.org.name}` : ""}</div>
          <div style={S.reviewRow}><b>Ro'yxatdan o'tgan:</b> {fmtDate(open.created_at)}</div>
          {open.banned && <div style={{ ...S.reviewRow, color: "#A33A3A" }}><b>Holat:</b> Bloklangan</div>}
          <div style={S.field}>
            <label style={S.label}>Rolini o'zgartirish</label>
            <select style={S.input} value={open.role} onChange={(e) => changeRole(open, e.target.value)}>
              <option value="citizen">Fuqaro</option>
              <option value="org">Tashkilot xodimi</option>
              <option value="admin">Admin</option>
            </select>
            {open.role === "org" && <p style={S.fine}>Eslatma: rolini "Fuqaro"ga o'zgartirsangiz, tashkilotdan avtomatik ajratiladi.</p>}
          </div>
          <button style={open.banned ? S.primaryBtn : S.dangerBtn} onClick={() => toggleBan(open)}>
            <Ban size={14} /> {open.banned ? "Blokdan chiqarish" : "Bloklash"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={S.pageTitle}>Foydalanuvchilar</h2>
      <input style={{ ...S.input, marginBottom: 14 }} placeholder="Ism yoki email bo'yicha qidirish..."
        value={query} onChange={(e) => { setQuery(e.target.value); load(e.target.value); }} />
      {loading ? <EmptyState icon={Users} text="Yuklanmoqda..." /> : profiles.length === 0 ? (
        <EmptyState icon={Users} text="Foydalanuvchilar topilmadi." />
      ) : (
        <div style={S.appList}>
          {profiles.map((p) => (
            <div key={p.id} style={S.appRow} className="oc-card" onClick={() => setOpenId(p.id)}>
              <div style={S.avatar}>{p.name.slice(0, 1).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={S.reportCardTitle}>{p.name} {p.banned && <span style={{ color: "#A33A3A", fontSize: 11 }}>(bloklangan)</span>}</div>
                <div style={S.reportCardMeta}>{p.email}{p.org?.name ? ` · ${p.org.name}` : ""}</div>
              </div>
              <span style={{ ...S.statusPill, ...roleBadgeStyle(p.role) }}>{roleLabel(p.role)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function roleLabel(r) { return { citizen: "Fuqaro", org: "Tashkilot", admin: "Admin" }[r] || r; }
function roleBadgeStyle(r) { const c = { citizen: "#5B7A99", org: "#8759B3", admin: "#B2402A" }[r] || "#7A8A99"; return { background: c + "1a", color: c }; }
