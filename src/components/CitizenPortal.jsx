import { useEffect, useState } from "react";
import {
  Home, Map as MapIcon, ListChecks, ThumbsUp, CheckCircle2, Bell, User, Plus,
  Building2, ChevronRight, FileWarning, RotateCcw, Clock, XCircle, ArrowRight,
  MoreHorizontal, Flame, X, ChevronLeft,
} from "lucide-react";
import {
  CATEGORIES, STATUS, DONE_STATUSES, ORG_TYPES, REGION_NAMES, districtsOf,
  REOPEN_VOTES_REQUIRED, HOT_VOTES, fmtDate,
} from "../constants";
import { S } from "../styles";
import { SideNav, StatCard, EmptyState, ReportCard, CityMap, ReportDetail, PartnerFlyer } from "./shared";
import { ReportWizard } from "./ReportWizard";
import { toggleVote, addVoteIfMissing, reopenVote } from "../lib/api/reports";
import { fetchMyApplication, submitApplication } from "../lib/api/applications";
import { createNotification, markAllNotificationsRead } from "../lib/api/notifications";

export function CitizenPortal({
  profile, reports, refreshReports, myOrg, orgs, notifications, refreshNotifications, markOneNotificationRead,
  view, setView, showToast,
}) {
  const [myApplication, setMyApplication] = useState(null);

  useEffect(() => {
    fetchMyApplication(profile.id).then(setMyApplication).catch(() => {});
  }, [profile.id]);

  const myReports = reports.filter((r) => r.createdBy === profile.id);

  const nav = [
    { id: "home", label: "Mahallam xaritasi", icon: Home },
    { id: "map", label: "Butun shahar xaritasi", icon: MapIcon },
    { id: "my-reports", label: "Mening hisobotlarim", icon: ListChecks },
    { id: "voting", label: "Ovoz berish", icon: ThumbsUp },
    { id: "completed", label: "Tugatilgan ishlar", icon: CheckCircle2 },
    { id: "notifications", label: "Bildirishnomalar", icon: Bell },
    { id: "profile", label: "Profil", icon: User },
  ];

  return (
    <div style={S.withSidebar} className="oc-shell">
      <SideNav items={nav} active={view} onChange={setView} />
      <div style={S.content}>
      <div key={view} className="oc-view-fade">
        {view === "home" && (
          <CitizenHome profile={profile} myOrg={myOrg} orgs={orgs} myReports={myReports} reports={reports} refreshReports={refreshReports}
            showToast={showToast} setView={setView} myApplication={myApplication} />
        )}
        {view === "report" && (
          <ReportWizard
            profile={profile} reports={reports}
            onVoteInstead={async (id) => {
              await addVoteIfMissing(id, profile.id);
              await refreshReports();
              showToast("Ovoz berildi — rahmat! ✓");
              setView("voting");
            }}
            onDone={async (report) => {
              await refreshReports();
              await createNotification(profile.id, {
                title: "Hisobot yuborildi",
                message: `Hisobotingiz "${report.assignedDeptName}" ga avtomatik yo'naltirildi. Holatini "Mening hisobotlarim" bo'limidan kuzatishingiz mumkin.`,
                type: "success",
              });
              await refreshNotifications();
              showToast("Hisobot yuborildi ✓");
              setView("my-reports");
            }}
            onCancel={() => setView("home")}
          />
        )}
        {view === "map" && (
          <CityMap reports={reports} title="Butun shahar xaritasi"
            profile={profile} myOrg={myOrg} refreshReports={refreshReports} showToast={showToast} />
        )}
        {view === "my-reports" && <MyReports myReports={myReports} onNew={() => setView("report")} />}
        {view === "voting" && (
          <VotingBoard reports={reports} profile={profile}
            onVote={async (id, alreadyVoted) => {
              await toggleVote(id, profile.id, alreadyVoted);
              await refreshReports();
            }} />
        )}
        {view === "completed" && (
          <CompletedWorks reports={reports} profile={profile}
            onReopenVote={async (report) => {
              const count = await reopenVote(report, profile.id);
              await refreshReports();
              showToast(count >= REOPEN_VOTES_REQUIRED ? "Hisobot qayta ochildi va xaritaga qaytdi ✓" : `Ovoz qabul qilindi (${count}/${REOPEN_VOTES_REQUIRED})`);
            }} />
        )}
        {view === "notifications" && (
          <NotificationsView notifications={notifications}
            onReadAll={async () => {
              await markAllNotificationsRead(profile.id);
              await refreshNotifications();
            }}
            onReadOne={markOneNotificationRead} />
        )}
        {view === "profile" && (
          <ProfileView profile={profile} myApplication={myApplication} myOrg={myOrg} onApply={() => setView("apply-org")} />
        )}
        {view === "apply-org" && (
          <OrgApplicationForm profile={profile}
            onSubmit={async (form) => {
              const app = await submitApplication(profile.id, form);
              setMyApplication(app);
              showToast("Ariza yuborildi ✓");
              setView("profile");
            }}
            onCancel={() => setView("profile")} />
        )}
      </div>
      </div>
    </div>
  );
}

function CitizenHome({ profile, myOrg, orgs, myReports, reports, refreshReports, showToast, setView, myApplication }) {
  const district = profile.detected_district;
  const region = profile.detected_region;
  const localReports = district
    ? reports.filter((r) => r.district === district && r.region === region && !DONE_STATUSES.includes(r.status))
    : reports.filter((r) => !DONE_STATUSES.includes(r.status));
  const active = myReports.filter((r) => !DONE_STATUSES.includes(r.status)).length;
  const resolved = myReports.filter((r) => r.status === "resolved").length;

  return (
    <div>
      <div style={S.rowHeader}>
        <div>
          <div style={S.heroEyebrowDark}>Salom, {profile.name.split(" ")[0]}</div>
          <h1 style={S.pageTitleLg}>{district ? `${district} xaritasi` : "O'zbekiston xaritasi"}</h1>
          <p style={S.fine}>
            {district
              ? "Joylashuvingiz asosida aniqlandi. Qizil rangda yonib turgan nuqtalar — eng ko'p ovoz olgan, eng dolzarb muammolar."
              : "Joylashuvni aniqlash uchun xaritadagi \"Joylashuvimni aniqlash\" tugmasini bosing yoki brauzer so'ragan GPS ruxsatini bering."}
          </p>
        </div>
        <button style={S.primaryBtn} onClick={() => setView("report")}><Plus size={16} /> Muammo haqida xabar berish</button>
      </div>

      <CityMap reports={localReports} compact title={null}
        center={profile.home_lat != null ? [profile.home_lat, profile.home_lng] : undefined}
        profile={profile} myOrg={myOrg} refreshReports={refreshReports} showToast={showToast} />

      <PartnerFlyer orgs={orgs} />

      <div style={S.statsRow}>
        <StatCard label="Faol hisobotlarim" value={active} accent="#1E88A8" />
        <StatCard label="Hal qilinganlarim" value={resolved} accent="#2E9A5C" />
        <StatCard label={district ? `${district}dagi faol muammolar` : "Shahar bo'yicha faol"} value={localReports.length} accent="#8759B3" />
      </div>

      {!myApplication && (
        <div style={S.orgPromo} className="oc-card" onClick={() => setView("apply-org")}>
          <Building2 size={20} color="#1E88A8" />
          <div style={{ flex: 1 }}>
            <div style={S.orgPromoTitle}>Tashkilot vakilimisiz?</div>
            <div style={S.orgPromoSub}>Kommunal xizmat yoki kompaniyangiz uchun Tashkilot Portaliga kirish huquqini so'rang.</div>
          </div>
          <ChevronRight size={18} color="#7A8A99" />
        </div>
      )}

      <h3 style={S.sectionTitle}>So'nggi hisobotlaringiz</h3>
      {myReports.length === 0 ? (
        <EmptyState icon={FileWarning} text="Hali hisobot yubormagansiz. Birinchi hisobotingizni yuboring." />
      ) : (
        <div style={S.reportGrid}>{myReports.slice(0, 4).map((r) => <ReportCard key={r.id} report={r} />)}</div>
      )}
    </div>
  );
}

function MyReports({ myReports, onNew }) {
  const [openId, setOpenId] = useState(null);
  const open = myReports.find((r) => r.id === openId);
  if (open) return <ReportDetail report={open} onBack={() => setOpenId(null)} />;
  return (
    <div>
      <div style={S.rowHeader}>
        <h2 style={S.pageTitle}>Mening hisobotlarim</h2>
        <button style={S.primaryBtn} onClick={onNew}><Plus size={15} /> Yangi hisobot</button>
      </div>
      {myReports.length === 0 ? <EmptyState icon={FileWarning} text="Hozircha hisobotlaringiz yo'q." /> : (
        <div style={S.reportGrid}>{myReports.map((r) => <ReportCard key={r.id} report={r} onClick={() => setOpenId(r.id)} />)}</div>
      )}
    </div>
  );
}

function VotingBoard({ reports, profile, onVote }) {
  const active = reports.filter((r) => !DONE_STATUSES.includes(r.status));
  const sorted = [...active].sort((a, b) => b.votes.length - a.votes.length);
  return (
    <div>
      <h2 style={S.pageTitle}>Jamoat ovoz berishi</h2>
      <p style={S.fine}>Muhim deb bilgan muammolarga ovoz bering. {HOT_VOTES}+ ovoz olganlar xaritada qizil "yonib" ko'rinadi va birinchi navbatda e'tiborga olinadi.</p>
      <div style={S.votingList}>
        {sorted.map((r) => {
          const cat = CATEGORIES.find((c) => c.id === r.category);
          const Icon = cat?.icon || MoreHorizontal;
          const voted = r.votes.includes(profile.id);
          const hot = r.votes.length >= HOT_VOTES;
          return (
            <div key={r.id} style={S.votingRow}>
              <Icon size={18} color="#1E88A8" />
              <div style={{ flex: 1 }}>
                <div style={S.reportCardTitle}>{r.title} {hot && <Flame size={13} color="#B2402A" style={{ verticalAlign: "-2px" }} />}</div>
                <div style={S.reportCardMeta}>{r.district} В· {STATUS[r.status].label}</div>
              </div>
              <button style={{ ...S.voteBtn, ...(voted ? S.voteBtnActive : {}) }} onClick={() => onVote(r.id, voted)}>
                <ThumbsUp size={14} /> {r.votes.length}
              </button>
            </div>
          );
        })}
        {sorted.length === 0 && <EmptyState icon={ThumbsUp} text="Hozircha faol hisobotlar yo'q." />}
      </div>
    </div>
  );
}

function CompletedWorks({ reports, profile, onReopenVote }) {
  const done = reports.filter((r) => DONE_STATUSES.includes(r.status));
  const [openId, setOpenId] = useState(null);
  const open = done.find((r) => r.id === openId);

  if (open) {
    const voted = open.reopenVotes.includes(profile.id);
    return (
      <div>
        <button style={S.linkBtn} onClick={() => setOpenId(null)}><ChevronLeft size={15} /> Ro'yxatga qaytish</button>
        <ReportDetail report={open} onBack={() => setOpenId(null)} />
        <div style={S.reopenBox}>
          <div style={S.reopenText}>Bu muammo hali ham mavjudmi? {open.reopenVotes.length} kishi "hal qilinmagan" degan — {REOPEN_VOTES_REQUIRED} taga yetsa hisobot qayta ochiladi.</div>
          <button style={{ ...S.dangerBtn, ...(voted ? { opacity: 0.5, cursor: "default" } : {}) }} disabled={voted} onClick={() => onReopenVote(open)}>
            <RotateCcw size={14} /> {voted ? "Ovoz berilgan" : "Bu muammo hal qilinmagan"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={S.pageTitle}>Tugatilgan ishlar</h2>
      <p style={S.fine}>Bu yerda hal qilingan muammolarni ko'rishingiz mumkin. Agar biror ish noto'g'ri yopilgan bo'lsa, uni belgilab qayta ochilishiga ovoz bera olasiz.</p>
      {done.length === 0 ? <EmptyState icon={CheckCircle2} text="Hali tugatilgan ishlar yo'q." /> : (
        <div style={S.reportGrid}>{done.map((r) => <ReportCard key={r.id} report={r} onClick={() => setOpenId(r.id)} />)}</div>
      )}
    </div>
  );
}

function NotificationsView({ notifications, onReadAll, onReadOne }) {
  return (
    <div>
      <div style={S.rowHeader}>
        <h2 style={S.pageTitle}>Bildirishnomalar</h2>
        {notifications.some((n) => !n.read) && <button style={S.linkBtn} onClick={onReadAll}>Barchasini o'qilgan deb belgilash</button>}
      </div>
      {notifications.length === 0 ? <EmptyState icon={Bell} text="Bildirishnomalar yo'q." /> : (
        <div style={S.notifList}>
          {notifications.map((n) => (
            <div key={n.id} style={{ ...S.notifRow, ...(n.read ? {} : S.notifRowUnread), cursor: n.read ? "default" : "pointer" }}
              onClick={() => !n.read && onReadOne(n.id)}>
              <div style={{ ...S.notifDot, background: n.type === "success" ? "#2E9A5C" : n.type === "warn" ? "#C98A2B" : "#1E88A8" }} />
              <div style={{ flex: 1 }}>
                <div style={S.notifTitle}>{n.title}</div>
                <div style={S.notifMsg}>{n.message}</div>
                <div style={S.notifTime}>{fmtDate(n.created_at)}</div>
              </div>
              {!n.read && <span style={S.notifUnreadBadge} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileView({ profile, myApplication, myOrg, onApply }) {
  return (
    <div>
      <h2 style={S.pageTitle}>Profil</h2>
      <div style={S.profileCard}>
        <div style={S.avatarLg}>{profile.name.slice(0, 1).toUpperCase()}</div>
        <div>
          <div style={S.profileName}>{profile.name}</div>
          <div style={S.profileRole}>Fuqaro {myOrg ? `В· ${myOrg.name} a'zosi` : ""}</div>
          <div style={S.profileRole}>{profile.detected_district ? `Aniqlangan hudud: ${profile.detected_district}, ${profile.detected_region}` : "Hudud hali aniqlanmagan"}</div>
        </div>
      </div>
      <h3 style={S.sectionTitle}>Tashkilot huquqi</h3>
      {myOrg ? (
        <div style={S.infoBanner}><CheckCircle2 size={18} color="#2E9A5C" /> Siz "{myOrg.name}" tashkiloti a'zosisiz. Tashkilot Portaliga yuqoridagi menyudan o'ting.</div>
      ) : myApplication ? (
        <ApplicationStatusCard application={myApplication} />
      ) : (
        <div style={S.orgPromo} className="oc-card" onClick={onApply}>
          <Building2 size={20} color="#1E88A8" />
          <div style={{ flex: 1 }}>
            <div style={S.orgPromoTitle}>Tashkilot huquqi uchun ariza bering</div>
            <div style={S.orgPromoSub}>Kommunal xizmat yoki kompaniya vakilisiz — hisobotlarni ko'rib, hal qiling.</div>
          </div>
          <ChevronRight size={18} color="#7A8A99" />
        </div>
      )}
    </div>
  );
}

function ApplicationStatusCard({ application }) {
  const map = {
    pending: { label: "Ko'rib chiqilmoqda", color: "#C98A2B", icon: Clock },
    approved: { label: "Tasdiqlandi", color: "#2E9A5C", icon: CheckCircle2 },
    rejected: { label: "Rad etildi", color: "#A33A3A", icon: XCircle },
  };
  const st = map[application.status] || map.pending;
  const Icon = st.icon;
  return (
    <div style={{ ...S.infoBanner, borderColor: st.color + "55" }}>
      <Icon size={18} color={st.color} />
      <div>
        <div style={{ fontWeight: 600, color: st.color }}>{st.label}</div>
        <div style={S.fine}>{application.org_name} В· yuborilgan: {fmtDate(application.created_at)}</div>
        {application.rejection_reason && <div style={S.fine}>Sabab: {application.rejection_reason}</div>}
      </div>
    </div>
  );
}

function OrgApplicationForm({ profile, onSubmit, onCancel }) {
  const [kind, setKind] = useState(null);

  if (!kind) {
    return (
      <div style={S.wizardWrap}>
        <button style={S.linkBtn} onClick={onCancel}><X size={16} /> Bekor qilish</button>
        <h2 style={S.wizardTitle}>Siz kimsiz?</h2>
        <div style={S.catGrid}>
          <button style={S.catBtn} onClick={() => setKind("government")}>
            <Building2 size={20} color="#1E88A8" /><span>Davlat tashkiloti xodimiman</span>
          </button>
          <button style={S.catBtn} onClick={() => setKind("private")}>
            <Building2 size={20} color="#1E88A8" /><span>Tadbirkor / xususiy kompaniya vakiliman</span>
          </button>
        </div>
      </div>
    );
  }

  return kind === "government"
    ? <GovernmentApplicationForm profile={profile} onSubmit={onSubmit} onCancel={() => setKind(null)} />
    : <PrivateApplicationForm profile={profile} onSubmit={onSubmit} onCancel={() => setKind(null)} />;
}

function GovernmentApplicationForm({ profile, onSubmit, onCancel }) {
  const [region, setRegion] = useState(REGION_NAMES[0]);
  const [district, setDistrict] = useState(districtsOf(REGION_NAMES[0])[0]?.name);
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [form, setForm] = useState({
    email: profile.email || "", phone: "", contact_person: profile.name, contact_position: "", description: "",
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const regionDistricts = districtsOf(region);
  const valid = form.email.trim() && form.phone.trim() && form.contact_person.trim();

  const changeRegion = (next) => {
    setRegion(next);
    setDistrict(districtsOf(next)[0]?.name);
  };

  return (
    <div style={S.wizardWrap}>
      <button style={S.linkBtn} onClick={onCancel}><X size={16} /> Orqaga</button>
      <h2 style={S.wizardTitle}>Davlat bo'limi xodimi sifatida ariza</h2>
      <div style={S.row2} className="oc-row2">
        <div style={S.field}><label style={S.label}>Viloyat</label>
          <select style={S.input} value={region} onChange={(e) => changeRegion(e.target.value)}>
            {REGION_NAMES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select></div>
        <div style={S.field}><label style={S.label}>Tuman / shahar</label>
          <select style={S.input} value={district} onChange={(e) => setDistrict(e.target.value)}>
            {regionDistricts.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select></div>
      </div>
      <div style={S.field}><label style={S.label}>Qaysi yo'nalishda ishlaysiz</label>
        <select style={S.input} value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select></div>
      <div style={S.row2} className="oc-row2">
        <div style={S.field}><label style={S.label}>Rasmiy email</label><input style={S.input} type="email" value={form.email} onChange={set("email")} /></div>
        <div style={S.field}><label style={S.label}>Telefon raqami</label><input style={S.input} value={form.phone} onChange={set("phone")} /></div>
      </div>
      <div style={S.row2} className="oc-row2">
        <div style={S.field}><label style={S.label}>Ismingiz</label><input style={S.input} value={form.contact_person} onChange={set("contact_person")} /></div>
        <div style={S.field}><label style={S.label}>Lavozimingiz</label><input style={S.input} value={form.contact_position} onChange={set("contact_position")} /></div>
      </div>
      <div style={S.field}><label style={S.label}>Qo'shimcha izoh (ixtiyoriy)</label><textarea style={{ ...S.input, height: 90 }} value={form.description} onChange={set("description")} /></div>
      <div style={S.wizardFooter}>
        <div style={{ flex: 1 }} />
        <button style={S.primaryBtn} disabled={!valid} onClick={() => onSubmit({ kind: "government", region, district, category, ...form })}>
          Arizani yuborish <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

function PrivateApplicationForm({ profile, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    org_name: "", org_type: ORG_TYPES[0], reg_number: "", address: "", city: "Toshkent",
    email: "", phone: "", contact_person: profile.name, contact_position: "", description: "",
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const valid = form.org_name.trim() && form.email.trim() && form.phone.trim() && form.contact_person.trim();
  return (
    <div style={S.wizardWrap}>
      <button style={S.linkBtn} onClick={onCancel}><X size={16} /> Orqaga</button>
      <h2 style={S.wizardTitle}>Tadbirkor / xususiy kompaniya arizasi</h2>
      <div style={S.row2} className="oc-row2">
        <div style={S.field}><label style={S.label}>Tashkilot nomi</label><input style={S.input} value={form.org_name} onChange={set("org_name")} /></div>
        <div style={S.field}><label style={S.label}>Tashkilot turi</label>
          <select style={S.input} value={form.org_type} onChange={set("org_type")}>{ORG_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
      </div>
      <div style={S.row2} className="oc-row2">
        <div style={S.field}><label style={S.label}>Guvohnoma / STIR raqami</label><input style={S.input} value={form.reg_number} onChange={set("reg_number")} /></div>
        <div style={S.field}><label style={S.label}>Shahar</label><input style={S.input} value={form.city} onChange={set("city")} /></div>
      </div>
      <div style={S.field}><label style={S.label}>Rasmiy manzil</label><input style={S.input} value={form.address} onChange={set("address")} /></div>
      <div style={S.row2} className="oc-row2">
        <div style={S.field}><label style={S.label}>Rasmiy email</label><input style={S.input} type="email" value={form.email} onChange={set("email")} /></div>
        <div style={S.field}><label style={S.label}>Telefon raqami</label><input style={S.input} value={form.phone} onChange={set("phone")} /></div>
      </div>
      <div style={S.row2} className="oc-row2">
        <div style={S.field}><label style={S.label}>Mas'ul shaxs</label><input style={S.input} value={form.contact_person} onChange={set("contact_person")} /></div>
        <div style={S.field}><label style={S.label}>Lavozimi</label><input style={S.input} value={form.contact_position} onChange={set("contact_position")} /></div>
      </div>
      <div style={S.field}><label style={S.label}>Tashkilot haqida qisqacha</label><textarea style={{ ...S.input, height: 90 }} value={form.description} onChange={set("description")} /></div>
      <div style={S.wizardFooter}>
        <div style={{ flex: 1 }} />
        <button style={S.primaryBtn} disabled={!valid} onClick={() => onSubmit({ kind: "private", ...form })}>
          Arizani yuborish <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

