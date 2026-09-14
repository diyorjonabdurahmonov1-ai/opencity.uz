import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Home, Map as MapIcon, ListChecks, ThumbsUp, CheckCircle2, Bell, User, Plus,
  Building2, ChevronRight, FileWarning, RotateCcw, Clock, XCircle, ArrowRight,
  MoreHorizontal, Flame, X, ChevronLeft, Megaphone, Milestone, CircleDot,
} from "lucide-react";
import {
  CATEGORIES, STATUS, DONE_STATUSES, ORG_TYPES, REGION_NAMES, districtsOf,
  REOPEN_VOTES_REQUIRED, HOT_VOTES, fmtDate, isHot,
} from "../constants";
import { S } from "../styles";
import { SideNav, StatCard, EmptyState, ReportCard, CityMap, ReportDetail, PartnerFlyer, SuccessBurst } from "./shared";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ReportWizard } from "./ReportWizard";
import { toggleVote, addVoteIfMissing, reopenVote, deleteReport } from "../lib/api/reports";
import { fetchMyApplication, submitApplication } from "../lib/api/applications";
import { createNotification, markAllNotificationsRead } from "../lib/api/notifications";

export function CitizenPortal({
  profile, reports, refreshReports, myOrg, orgs, notifications, refreshNotifications, markOneNotificationRead,
  announcements, view, setView, showToast,
}) {
  const { t } = useTranslation();
  const [myApplication, setMyApplication] = useState(null);
  const [focusAnnouncement, setFocusAnnouncement] = useState(null);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    fetchMyApplication(profile.id).then(setMyApplication).catch(() => {});
  }, [profile.id]);

  const announcementCenter = (a) => {
    if (!a) return undefined;
    if (a.kind === "zone" && a.zoneCenter) return [a.zoneCenter.lat, a.zoneCenter.lng];
    if (a.kind === "line" && a.linePoints?.length >= 2) {
      const mid = a.linePoints[Math.floor((a.linePoints.length - 1) / 2)];
      return [mid.lat, mid.lng];
    }
    return undefined;
  };

  const myReports = reports.filter((r) => r.createdBy === profile.id);

  const nav = [
    { id: "home", label: t("citizen.nav.home"), icon: Home },
    { id: "map", label: t("citizen.nav.map"), icon: MapIcon },
    { id: "my-reports", label: t("citizen.nav.myReports"), icon: ListChecks },
    { id: "voting", label: t("citizen.nav.voting"), icon: ThumbsUp },
    { id: "announcements", label: t("citizen.nav.announcements"), icon: Megaphone },
    { id: "completed", label: t("citizen.nav.completed"), icon: CheckCircle2 },
    { id: "notifications", label: t("citizen.nav.notifications"), icon: Bell },
    { id: "profile", label: t("citizen.nav.profile"), icon: User },
  ];

  return (
    <div style={S.withSidebar} className="oc-shell">
      {celebrate && <SuccessBurst onDone={() => setCelebrate(false)} />}
      {view !== "report" && view !== "apply-org" && (
        <button style={S.reportFab} onClick={() => setView("report")} className="oc-glow">
          <span style={S.reportFabIcon}><Plus size={20} color="#173A66" /></span>
          {t("citizen.reportFab")}
        </button>
      )}
      <SideNav items={nav} active={view} onChange={setView} />
      <div style={S.content}>
      <div key={view} className="oc-view-fade">
        {view === "home" && (
          <CitizenHome profile={profile} myOrg={myOrg} orgs={orgs} myReports={myReports} reports={reports} refreshReports={refreshReports}
            announcements={announcements} showToast={showToast} setView={setView} myApplication={myApplication} />
        )}
        {view === "report" && (
          <ReportWizard
            profile={profile} reports={reports}
            onVoteInstead={async (id) => {
              await addVoteIfMissing(id, profile.id);
              await refreshReports();
              showToast(t("citizen.voteRecordedToast"));
              setView("voting");
            }}
            onDone={async (report) => {
              await refreshReports();
              await createNotification(profile.id, {
                title: t("citizen.reportSubmittedTitle"),
                message: t("citizen.reportSubmittedMessage", { org: report.assignedDeptName }),
                type: "success",
              });
              await refreshNotifications();
              showToast(t("citizen.reportSubmittedToast"));
              setCelebrate(true);
              setView("my-reports");
            }}
            onCancel={() => setView("home")}
          />
        )}
        {view === "map" && (
          <div>
            <CityMapHero reports={reports} orgs={orgs} />
            <div style={S.mapFrame}>
              <CityMap reports={reports} title={null} center={announcementCenter(focusAnnouncement)}
                profile={profile} myOrg={myOrg} refreshReports={refreshReports} showToast={showToast} announcements={announcements} />
            </div>
          </div>
        )}
        {view === "announcements" && (
          <AnnouncementsList announcements={announcements}
            onSelect={(a) => { setFocusAnnouncement(a); setView("map"); }} />
        )}
        {view === "my-reports" && (
          <MyReports myReports={myReports} onNew={() => setView("report")}
            onDelete={async (id) => {
              await deleteReport(id);
              await refreshReports();
              showToast(t("citizen.reportDeletedToast"));
            }} />
        )}
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
              const count = await reopenVote(report, profile.id, t);
              await refreshReports();
              showToast(count >= REOPEN_VOTES_REQUIRED ? t("citizen.completed.reopenedToast") : t("citizen.completed.voteRecordedToast", { count, required: REOPEN_VOTES_REQUIRED }));
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
              showToast(t("citizen.applicationSubmittedToast"));
              setView("profile");
            }}
            onCancel={() => setView("profile")} />
        )}
      </div>
      </div>
    </div>
  );
}

function CityMapHero({ reports, orgs }) {
  const { t } = useTranslation();
  const active = reports.filter((r) => !DONE_STATUSES.includes(r.status)).length;
  const resolved = reports.filter((r) => DONE_STATUSES.includes(r.status)).length;
  const hot = reports.filter(isHot).length;

  return (
    <div style={S.mapHero} className="oc-map-hero">
      <div style={S.mapHeroEyebrow}><span className="oc-live-dot" style={S.livePulseDot} /> {t("citizen.map.live")}</div>
      <h1 style={S.mapHeroTitle}>{t("citizen.nav.map")}</h1>
      <p style={S.mapHeroSub}>{t("citizen.map.subtitle")}</p>
      <div style={S.mapHeroStats}>
        <StatCard label={t("citizen.map.statActive")} value={active} accent="#1C8B80" />
        <StatCard label={t("citizen.map.statResolved")} value={resolved} accent="#2E9A5C" />
        <StatCard label={t("citizen.map.statHot")} value={hot} accent="#B2402A" />
        <StatCard label={t("citizen.map.statOrgs")} value={orgs.length} accent="#B6903F" />
      </div>
    </div>
  );
}

function CitizenHome({ profile, myOrg, orgs, myReports, reports, refreshReports, announcements, showToast, setView, myApplication }) {
  const { t } = useTranslation();
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
          <div style={S.heroEyebrowDark}>{t("citizen.home.greeting", { name: profile.name.split(" ")[0] })}</div>
          <h1 style={S.pageTitleLg}>{district ? t("citizen.home.titleWithDistrict", { district }) : t("citizen.home.titleFallback")}</h1>
          <p style={S.fine}>
            {district ? t("citizen.home.subtitleWithDistrict") : t("citizen.home.subtitleFallback")}
          </p>
        </div>
        <button style={S.primaryBtn} onClick={() => setView("report")}><Plus size={16} /> {t("citizen.home.reportButton")}</button>
      </div>

      <CityMap reports={localReports} compact title={null}
        center={profile.home_lat != null ? [profile.home_lat, profile.home_lng] : undefined}
        profile={profile} myOrg={myOrg} refreshReports={refreshReports} showToast={showToast} announcements={announcements} />

      <PartnerFlyer orgs={orgs} />

      <div style={S.statsRow}>
        <StatCard label={t("citizen.home.statActive")} value={active} accent="#1C8B80" />
        <StatCard label={t("citizen.home.statResolved")} value={resolved} accent="#2E9A5C" />
        <StatCard label={district ? t("citizen.home.statLocalActive", { district }) : t("citizen.home.statCityActive")} value={localReports.length} accent="#B6903F" />
      </div>

      {!myApplication && (
        <div style={S.orgPromo} className="oc-card" onClick={() => setView("apply-org")}>
          <Building2 size={20} color="#1C8B80" />
          <div style={{ flex: 1 }}>
            <div style={S.orgPromoTitle}>{t("citizen.home.orgPromoTitle")}</div>
            <div style={S.orgPromoSub}>{t("citizen.home.orgPromoSub")}</div>
          </div>
          <ChevronRight size={18} color="#7A8A99" />
        </div>
      )}

      <h3 style={S.sectionTitle}>{t("citizen.home.recentReports")}</h3>
      {myReports.length === 0 ? (
        <EmptyState icon={FileWarning} text={t("citizen.home.noReportsYet")} />
      ) : (
        <div style={S.reportGrid}>{myReports.slice(0, 4).map((r) => <ReportCard key={r.id} report={r} />)}</div>
      )}
    </div>
  );
}

function MyReports({ myReports, onNew, onDelete }) {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState(null);
  const open = myReports.find((r) => r.id === openId);
  if (open) {
    return (
      <ReportDetail report={open} onBack={() => setOpenId(null)}
        onDelete={async (id) => { await onDelete(id); setOpenId(null); }} />
    );
  }
  return (
    <div>
      <div style={S.rowHeader}>
        <h2 style={S.pageTitle}>{t("citizen.myReports.title")}</h2>
        <button style={S.primaryBtn} onClick={onNew}><Plus size={15} /> {t("citizen.myReports.newReport")}</button>
      </div>
      {myReports.length === 0 ? <EmptyState icon={FileWarning} text={t("citizen.myReports.empty")} /> : (
        <div style={S.reportGrid}>{myReports.map((r) => <ReportCard key={r.id} report={r} onClick={() => setOpenId(r.id)} />)}</div>
      )}
    </div>
  );
}

function VotingBoard({ reports, profile, onVote }) {
  const { t, i18n } = useTranslation();
  const active = reports.filter((r) => !DONE_STATUSES.includes(r.status));
  const sorted = [...active].sort((a, b) => b.votes.length - a.votes.length);
  return (
    <div>
      <h2 style={S.pageTitle}>{t("citizen.voting.title")}</h2>
      <p style={S.fine}>{t("citizen.voting.description", { hotVotes: HOT_VOTES })}</p>
      <div style={S.votingList}>
        {sorted.map((r) => {
          const cat = CATEGORIES.find((c) => c.id === r.category);
          const Icon = cat?.icon || MoreHorizontal;
          const voted = r.votes.includes(profile.id);
          const hot = isHot(r);
          return (
            <div key={r.id} style={S.votingRow}>
              <Icon size={18} color={cat?.color || "#1C8B80"} />
              <div style={{ flex: 1 }}>
                <div style={S.reportCardTitle}>{r.title} {hot && <Flame size={13} color="#B2402A" style={{ verticalAlign: "-2px" }} />}</div>
                <div style={S.reportCardMeta}>{r.district} · {t(`status.${r.status}`)}</div>
              </div>
              <button style={{ ...S.voteBtn, ...(voted ? S.voteBtnActive : {}) }} onClick={() => onVote(r.id, voted)}>
                <ThumbsUp size={14} /> {r.votes.length}
              </button>
            </div>
          );
        })}
        {sorted.length === 0 && <EmptyState icon={ThumbsUp} text={t("citizen.voting.empty")} />}
      </div>
    </div>
  );
}

function CompletedWorks({ reports, profile, onReopenVote }) {
  const { t } = useTranslation();
  const done = reports.filter((r) => DONE_STATUSES.includes(r.status));
  const [openId, setOpenId] = useState(null);
  const open = done.find((r) => r.id === openId);

  if (open) {
    const voted = open.reopenVotes.includes(profile.id);
    return (
      <div>
        <button style={S.linkBtn} onClick={() => setOpenId(null)}><ChevronLeft size={15} /> {t("common.backToList")}</button>
        <ReportDetail report={open} onBack={() => setOpenId(null)} />
        <div style={S.reopenBox}>
          <div style={S.reopenText}>{t("citizen.completed.reopenText", { count: open.reopenVotes.length, required: REOPEN_VOTES_REQUIRED })}</div>
          <button style={{ ...S.dangerBtn, ...(voted ? { opacity: 0.5, cursor: "default" } : {}) }} disabled={voted} onClick={() => onReopenVote(open)}>
            <RotateCcw size={14} /> {voted ? t("citizen.completed.reopenVoted") : t("citizen.completed.reopenButton")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={S.pageTitle}>{t("citizen.completed.title")}</h2>
      <p style={S.fine}>{t("citizen.completed.description")}</p>
      {done.length === 0 ? <EmptyState icon={CheckCircle2} text={t("citizen.completed.empty")} /> : (
        <div style={S.reportGrid}>{done.map((r) => <ReportCard key={r.id} report={r} onClick={() => setOpenId(r.id)} />)}</div>
      )}
    </div>
  );
}

function AnnouncementsList({ announcements, onSelect }) {
  const { t, i18n } = useTranslation();
  const active = (announcements || []).filter((a) => !a.endsAt || new Date(a.endsAt) > new Date());
  return (
    <div>
      <h2 style={S.pageTitle}>{t("citizen.announcements.title")}</h2>
      <p style={S.fine}>{t("citizen.announcements.description")}</p>
      {active.length === 0 ? <EmptyState icon={Megaphone} text={t("citizen.announcements.empty")} /> : (
        <div style={S.notifList}>
          {active.map((a) => (
            <div key={a.id} style={{ ...S.notifRow, cursor: "pointer" }} className="oc-card" onClick={() => onSelect(a)}>
              <div style={{ ...S.notifDot, background: a.kind === "line" ? "#B2402A" : "#B2402A" }} />
              <div style={{ flex: 1 }}>
                <div style={S.notifTitle}>
                  {a.kind === "line" ? <Milestone size={13} style={{ verticalAlign: "-2px" }} /> : <CircleDot size={13} style={{ verticalAlign: "-2px" }} />}
                  {" "}{a.title}
                </div>
                {a.description && <div style={S.notifMsg}>{a.description}</div>}
                <div style={S.notifTime}>
                  {a.orgName}{a.district ? ` · ${a.district}` : ""}
                  {(a.startsAt || a.endsAt) && ` · ${a.startsAt ? fmtDate(a.startsAt, i18n.language) : "?"} — ${a.endsAt ? fmtDate(a.endsAt, i18n.language) : t("citizen.announcements.unknownEnd")}`}
                </div>
              </div>
              <ChevronRight size={16} color="#9AA7B2" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationsView({ notifications, onReadAll, onReadOne }) {
  const { t, i18n } = useTranslation();
  return (
    <div>
      <div style={S.rowHeader}>
        <h2 style={S.pageTitle}>{t("citizen.notifications.title")}</h2>
        {notifications.some((n) => !n.read) && <button style={S.linkBtn} onClick={onReadAll}>{t("citizen.notifications.markAllRead")}</button>}
      </div>
      {notifications.length === 0 ? <EmptyState icon={Bell} text={t("citizen.notifications.empty")} /> : (
        <div style={S.notifList}>
          {notifications.map((n) => (
            <div key={n.id} style={{ ...S.notifRow, ...(n.read ? {} : S.notifRowUnread), cursor: n.read ? "default" : "pointer" }}
              onClick={() => !n.read && onReadOne(n.id)}>
              <div style={{ ...S.notifDot, background: n.type === "success" ? "#2E9A5C" : n.type === "warn" ? "#C98A2B" : "#1C8B80" }} />
              <div style={{ flex: 1 }}>
                <div style={S.notifTitle}>{n.title}</div>
                <div style={S.notifMsg}>{n.message}</div>
                <div style={S.notifTime}>{fmtDate(n.created_at, i18n.language)}</div>
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
  const { t } = useTranslation();
  return (
    <div>
      <h2 style={S.pageTitle}>{t("citizen.profile.title")}</h2>
      <div style={S.profileCard}>
        <div style={S.avatarLg}>{profile.name.slice(0, 1).toUpperCase()}</div>
        <div>
          <div style={S.profileName}>{profile.name}</div>
          <div style={S.profileRole}>{t("citizen.profile.roleCitizen")} {myOrg ? `· ${myOrg.name} ${t("citizen.profile.orgMemberSuffix")}` : ""}</div>
          <div style={S.profileRole}>{profile.detected_district ? t("citizen.profile.detectedRegion", { district: profile.detected_district, region: profile.detected_region }) : t("citizen.profile.undetected")}</div>
        </div>
      </div>
      <h3 style={S.sectionTitle}>{t("citizen.profile.languageTitle")}</h3>
      <LanguageSwitcher profile={profile} />
      <h3 style={S.sectionTitle}>{t("citizen.profile.orgRightsTitle")}</h3>
      {myOrg ? (
        <div style={S.infoBanner}><CheckCircle2 size={18} color="#2E9A5C" /> {t("citizen.profile.memberBanner", { org: myOrg.name })}</div>
      ) : myApplication ? (
        <ApplicationStatusCard application={myApplication} />
      ) : (
        <div style={S.orgPromo} className="oc-card" onClick={onApply}>
          <Building2 size={20} color="#1C8B80" />
          <div style={{ flex: 1 }}>
            <div style={S.orgPromoTitle}>{t("citizen.profile.applyTitle")}</div>
            <div style={S.orgPromoSub}>{t("citizen.profile.applySub")}</div>
          </div>
          <ChevronRight size={18} color="#7A8A99" />
        </div>
      )}
    </div>
  );
}

function ApplicationStatusCard({ application }) {
  const { t, i18n } = useTranslation();
  const map = {
    pending: { color: "#C98A2B", icon: Clock },
    approved: { color: "#2E9A5C", icon: CheckCircle2 },
    rejected: { color: "#A33A3A", icon: XCircle },
  };
  const st = map[application.status] || map.pending;
  const Icon = st.icon;
  return (
    <div style={{ ...S.infoBanner, borderColor: st.color + "55" }}>
      <Icon size={18} color={st.color} />
      <div>
        <div style={{ fontWeight: 600, color: st.color }}>{t(`citizen.applicationStatus.${application.status}`) || t("citizen.applicationStatus.pending")}</div>
        <div style={S.fine}>{application.org_name} · {t("citizen.applicationStatus.submittedAt", { date: fmtDate(application.created_at, i18n.language) })}</div>
        {application.rejection_reason && <div style={S.fine}>{t("citizen.applicationStatus.reason", { reason: application.rejection_reason })}</div>}
      </div>
    </div>
  );
}

function OrgApplicationForm({ profile, onSubmit, onCancel }) {
  const { t } = useTranslation();
  const [kind, setKind] = useState(null);

  if (!kind) {
    return (
      <div style={S.wizardWrap}>
        <button style={S.linkBtn} onClick={onCancel}><X size={16} /> {t("common.cancel")}</button>
        <h2 style={S.wizardTitle}>{t("citizen.application.whoAreYou")}</h2>
        <div style={S.catGrid}>
          <button style={S.catBtn} onClick={() => setKind("government")}>
            <Building2 size={20} color="#1C8B80" /><span>{t("citizen.application.govOption")}</span>
          </button>
          <button style={S.catBtn} onClick={() => setKind("private")}>
            <Building2 size={20} color="#1C8B80" /><span>{t("citizen.application.privateOption")}</span>
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
  const { t } = useTranslation();
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
      <button style={S.linkBtn} onClick={onCancel}><X size={16} /> {t("common.back")}</button>
      <h2 style={S.wizardTitle}>{t("citizen.application.govTitle")}</h2>
      <div style={S.row2} className="oc-row2">
        <div style={S.field}><label style={S.label}>{t("citizen.application.fields.region")}</label>
          <select style={S.input} value={region} onChange={(e) => changeRegion(e.target.value)}>
            {REGION_NAMES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select></div>
        <div style={S.field}><label style={S.label}>{t("citizen.application.fields.district")}</label>
          <select style={S.input} value={district} onChange={(e) => setDistrict(e.target.value)}>
            {regionDistricts.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select></div>
      </div>
      <div style={S.field}><label style={S.label}>{t("citizen.application.fields.workArea")}</label>
        <select style={S.input} value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{t(`category.${c.id}`)}</option>)}
        </select></div>
      <div style={S.row2} className="oc-row2">
        <div style={S.field}><label style={S.label}>{t("citizen.application.fields.officialEmail")}</label><input style={S.input} type="email" value={form.email} onChange={set("email")} /></div>
        <div style={S.field}><label style={S.label}>{t("citizen.application.fields.phone")}</label><input style={S.input} value={form.phone} onChange={set("phone")} /></div>
      </div>
      <div style={S.row2} className="oc-row2">
        <div style={S.field}><label style={S.label}>{t("citizen.application.fields.yourName")}</label><input style={S.input} value={form.contact_person} onChange={set("contact_person")} /></div>
        <div style={S.field}><label style={S.label}>{t("citizen.application.fields.position")}</label><input style={S.input} value={form.contact_position} onChange={set("contact_position")} /></div>
      </div>
      <div style={S.field}><label style={S.label}>{t("citizen.application.fields.extraNote")}</label><textarea style={{ ...S.input, height: 90 }} value={form.description} onChange={set("description")} /></div>
      <div style={S.wizardFooter}>
        <div style={{ flex: 1 }} />
        <button style={S.primaryBtn} disabled={!valid} onClick={() => onSubmit({ kind: "government", region, district, category, ...form })}>
          {t("citizen.application.submitButton")} <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

function PrivateApplicationForm({ profile, onSubmit, onCancel }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    org_name: "", org_type: ORG_TYPES[0], reg_number: "", address: "", city: "Toshkent",
    email: "", phone: "", contact_person: profile.name, contact_position: "", description: "",
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const valid = form.org_name.trim() && form.email.trim() && form.phone.trim() && form.contact_person.trim();
  return (
    <div style={S.wizardWrap}>
      <button style={S.linkBtn} onClick={onCancel}><X size={16} /> {t("common.back")}</button>
      <h2 style={S.wizardTitle}>{t("citizen.application.privateTitle")}</h2>
      <div style={S.row2} className="oc-row2">
        <div style={S.field}><label style={S.label}>{t("citizen.application.fields.orgName")}</label><input style={S.input} value={form.org_name} onChange={set("org_name")} /></div>
        <div style={S.field}><label style={S.label}>{t("citizen.application.fields.orgType")}</label>
          <select style={S.input} value={form.org_type} onChange={set("org_type")}>
            {ORG_TYPES.map((ot) => <option key={ot} value={ot}>{t(`orgType.${ot}`)}</option>)}
          </select></div>
      </div>
      <div style={S.row2} className="oc-row2">
        <div style={S.field}><label style={S.label}>{t("citizen.application.fields.regNumber")}</label><input style={S.input} value={form.reg_number} onChange={set("reg_number")} /></div>
        <div style={S.field}><label style={S.label}>{t("citizen.application.fields.city")}</label><input style={S.input} value={form.city} onChange={set("city")} /></div>
      </div>
      <div style={S.field}><label style={S.label}>{t("citizen.application.fields.officialAddress")}</label><input style={S.input} value={form.address} onChange={set("address")} /></div>
      <div style={S.row2} className="oc-row2">
        <div style={S.field}><label style={S.label}>{t("citizen.application.fields.officialEmail")}</label><input style={S.input} type="email" value={form.email} onChange={set("email")} /></div>
        <div style={S.field}><label style={S.label}>{t("citizen.application.fields.phone")}</label><input style={S.input} value={form.phone} onChange={set("phone")} /></div>
      </div>
      <div style={S.row2} className="oc-row2">
        <div style={S.field}><label style={S.label}>{t("citizen.application.fields.contactPerson")}</label><input style={S.input} value={form.contact_person} onChange={set("contact_person")} /></div>
        <div style={S.field}><label style={S.label}>{t("citizen.application.fields.contactPosition")}</label><input style={S.input} value={form.contact_position} onChange={set("contact_position")} /></div>
      </div>
      <div style={S.field}><label style={S.label}>{t("citizen.application.fields.orgDescription")}</label><textarea style={{ ...S.input, height: 90 }} value={form.description} onChange={set("description")} /></div>
      <div style={S.wizardFooter}>
        <div style={{ flex: 1 }} />
        <button style={S.primaryBtn} disabled={!valid} onClick={() => onSubmit({ kind: "private", ...form })}>
          {t("citizen.application.submitButton")} <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
