import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMapEvents } from "react-leaflet";
import {
  Camera, ChevronLeft, ClipboardList, Megaphone, Milestone, CircleDot, Trash2, RotateCcw, Check, AlertTriangle,
} from "lucide-react";
import { RESOLUTION_PHOTOS_REQUIRED, UZBEKISTAN_CENTER, districtsOf, fmtDate, compressImage } from "../constants";
import { S } from "../styles";
import { StatCard, EmptyState, ReportCard, ReportDetail, pinIcon } from "./shared";
import { advanceStatus, markResolved } from "../lib/api/reports";
import { uploadPhoto } from "../lib/api/storage";
import { verifyPhoto } from "../lib/api/ai";
import { createAnnouncement, deleteAnnouncement } from "../lib/api/announcements";

export function OrganizationPortal({ profile, myOrg, reports, refreshReports, announcements, refreshAnnouncements, showToast }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState("reports");
  const [openId, setOpenId] = useState(null);
  const [proofUrls, setProofUrls] = useState([]);
  const [proofFlags, setProofFlags] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const assigned = reports.filter((r) => r.assignedOrgId === profile.org_id);
  const open = assigned.find((r) => r.id === openId);
  const isGovernment = myOrg?.kind === "government";
  const suspiciousCount = proofFlags.filter((f) => f?.suspicious).length;

  const addProof = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const blob = await compressImage(file, 480, 0.55);
      const [url, flag] = await Promise.all([uploadPhoto(profile.id, blob), verifyPhoto(blob)]);
      setProofUrls((p) => [...p, url]);
      setProofFlags((p) => [...p, flag]);
    } catch {
      // e'tiborsiz qoldiramiz — foydalanuvchi qayta urinib ko'rishi mumkin
    }
    setUploading(false);
  };

  const advance = async (report, nextStatus, note) => {
    await advanceStatus(report.id, nextStatus, note, myOrg?.name || t("org.defaultOrgName"));
    await refreshReports();
    showToast(t("org.toasts.statusUpdated"));
  };

  const finishResolve = async (report) => {
    if (proofUrls.length < RESOLUTION_PHOTOS_REQUIRED) return;
    await markResolved(report.id, proofUrls, myOrg?.name || t("org.defaultOrgName"), t);
    await refreshReports();
    setProofUrls([]);
    setProofFlags([]);
    setOpenId(null);
    showToast(t("org.toasts.resolvedToast"));
  };

  if (!profile.org_id) {
    return (
      <div style={S.content}>
        <EmptyState icon={ClipboardList} text={t("org.noOrgAssigned")} />
      </div>
    );
  }

  if (open) {
    return (
      <div style={S.content}>
        <button style={S.linkBtn} onClick={() => { setOpenId(null); setProofUrls([]); setProofFlags([]); }}><ChevronLeft size={15} /> {t("common.backToList")}</button>
        <ReportDetail report={open} onBack={() => setOpenId(null)} />
        <div style={S.orgActionBox}>
          {open.status === "assigned" && <button style={S.primaryBtn} onClick={() => advance(open, "in_progress", t("timeline.notes.workStarted"))}>{t("org.startWork")}</button>}
          {open.status === "assigned" && <button style={S.secondaryBtn} onClick={() => advance(open, "neglected", t("timeline.notes.neglected"))}>{t("org.neglect")}</button>}
          {open.status === "in_progress" && (
            <div style={{ width: "100%" }}>
              <div style={S.label}>{t("org.resolvePhotosNeeded", { count: RESOLUTION_PHOTOS_REQUIRED, have: proofUrls.length })}</div>
              <div style={S.proofRow}>
                {proofUrls.map((p, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img src={p} style={S.proofImg} alt="" />
                    {proofFlags[i]?.suspicious && (
                      <span title={proofFlags[i].reason} style={{ position: "absolute", top: -6, right: -6, background: "#C98A2B", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
                        <AlertTriangle size={12} color="#fff" />
                      </span>
                    )}
                  </div>
                ))}
                <button style={S.uploadMini} onClick={() => fileRef.current?.click()} disabled={uploading}><Camera size={16} /></button>
              </div>
              {suspiciousCount > 0 && (
                <div style={{ ...S.fine, color: "#C98A2B", display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangle size={14} /> {t("org.aiSuspiciousWarning", { count: suspiciousCount })}
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={addProof} />
              <button style={S.primaryBtn} disabled={proofUrls.length < RESOLUTION_PHOTOS_REQUIRED} onClick={() => finishResolve(open)}>
                {t("org.markResolved")}
              </button>
            </div>
          )}
          {open.status === "neglected" && <button style={S.primaryBtn} onClick={() => advance(open, "in_progress", t("timeline.notes.workResumed"))}>{t("org.startWork")}</button>}
        </div>
      </div>
    );
  }

  return (
    <div style={S.content}>
      <div style={S.rowHeader}>
        <h2 style={S.pageTitle}>{myOrg?.name || t("org.defaultOrgName")}</h2>
        {isGovernment && (
          <div style={S.portalSwitch}>
            <button onClick={() => setTab("reports")} style={{ ...S.portalTab, ...(tab === "reports" ? S.portalTabActive : {}) }}>
              <ClipboardList size={14} /> <span>{t("org.tabReports")}</span>
            </button>
            <button onClick={() => setTab("announcements")} style={{ ...S.portalTab, ...(tab === "announcements" ? S.portalTabActive : {}) }}>
              <Megaphone size={14} /> <span>{t("org.tabAnnouncements")}</span>
            </button>
          </div>
        )}
      </div>

      {tab === "reports" && (
        <>
          <div style={S.statsRow}>
            <StatCard label={t("org.statNew")} value={assigned.filter((r) => r.status === "assigned").length} accent="#B6903F" />
            <StatCard label={t("org.statInProgress")} value={assigned.filter((r) => r.status === "in_progress").length} accent="#1C8B80" />
            <StatCard label={t("org.statResolved")} value={assigned.filter((r) => r.status === "resolved" || r.status === "closed").length} accent="#2E9A5C" />
          </div>
          <h3 style={S.sectionTitle}>{t("org.assignedReportsTitle")}</h3>
          {assigned.length === 0 ? <EmptyState icon={ClipboardList} text={t("org.assignedEmpty")} /> : (
            <div style={S.reportGrid}>{assigned.map((r) => <ReportCard key={r.id} report={r} onClick={() => setOpenId(r.id)} />)}</div>
          )}
        </>
      )}

      {tab === "announcements" && isGovernment && (
        <AnnouncementsSection profile={profile} myOrg={myOrg} announcements={announcements} refreshAnnouncements={refreshAnnouncements} showToast={showToast} />
      )}
    </div>
  );
}

function LocationClickCatcher({ onPick }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

function AnnouncementsSection({ profile, myOrg, announcements, refreshAnnouncements, showToast }) {
  const { t, i18n } = useTranslation();
  const mine = (announcements || []).filter((a) => a.orgId === myOrg.id);

  const remove = async (id) => {
    if (!window.confirm(t("org.announcementsSection.confirmDelete"))) return;
    await deleteAnnouncement(id);
    await refreshAnnouncements();
    showToast(t("org.toasts.announcementDeleted"));
  };

  return (
    <div>
      <AnnouncementForm profile={profile} myOrg={myOrg}
        onCreated={async () => { await refreshAnnouncements(); showToast(t("org.toasts.announcementCreated")); }} />
      <h3 style={S.sectionTitle}>{t("org.announcementsSection.yourAnnouncements")}</h3>
      {mine.length === 0 ? <EmptyState icon={Megaphone} text={t("org.announcementsSection.empty")} /> : (
        <div style={S.appList}>
          {mine.map((a) => (
            <div key={a.id} style={S.appRow}>
              {a.kind === "line" ? <Milestone size={18} color="#C98A2B" /> : <CircleDot size={18} color="#B2402A" />}
              <div style={{ flex: 1 }}>
                <div style={S.reportCardTitle}>{a.title}</div>
                <div style={S.reportCardMeta}>
                  {(a.startsAt || a.endsAt) ? `${a.startsAt ? fmtDate(a.startsAt, i18n.language) : "?"} — ${a.endsAt ? fmtDate(a.endsAt, i18n.language) : t("common.unknown")}` : fmtDate(a.createdAt, i18n.language)}
                </div>
              </div>
              <button style={S.iconBtn} onClick={() => remove(a.id)} title={t("common.delete")}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnnouncementForm({ profile, myOrg, onCreated }) {
  const { t } = useTranslation();
  const [kind, setKind] = useState("line");
  const [closurePoints, setClosurePoints] = useState([]);
  const [detourPoints, setDetourPoints] = useState([]);
  const [drawingDetour, setDrawingDetour] = useState(false);
  const [zoneCenter, setZoneCenter] = useState(null);
  const [zoneRadius, setZoneRadius] = useState(300);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const orgDistrict = myOrg.district ? districtsOf(myOrg.region).find((d) => d.name === myOrg.district) : null;
  const mapCenter = orgDistrict ? [orgDistrict.lat, orgDistrict.lng] : UZBEKISTAN_CENTER;

  const resetGeometry = () => {
    setClosurePoints([]); setDetourPoints([]); setDrawingDetour(false); setZoneCenter(null);
  };

  const changeKind = (next) => {
    setKind(next);
    resetGeometry();
  };

  const handleMapClick = (lat, lng) => {
    if (kind === "zone") { setZoneCenter({ lat, lng }); return; }
    if (drawingDetour) setDetourPoints((prev) => [...prev, { lat, lng }]);
    else setClosurePoints((prev) => [...prev, { lat, lng }]);
  };

  const undoLastPoint = () => {
    if (drawingDetour) setDetourPoints((prev) => prev.slice(0, -1));
    else setClosurePoints((prev) => prev.slice(0, -1));
  };

  const startDetour = () => setDrawingDetour(true);
  const finishDetour = () => setDrawingDetour(false);
  const removeDetour = () => { setDetourPoints([]); setDrawingDetour(false); };

  const canSubmit = title.trim().length > 0 && (
    (kind === "line" && closurePoints.length >= 2) || (kind === "zone" && !!zoneCenter)
  );

  const geometryHint = kind === "line"
    ? (drawingDetour
      ? (detourPoints.length === 0 ? t("org.announcementForm.hint.detourStart") : t("org.announcementForm.hint.detourContinue"))
      : (closurePoints.length < 2 ? t("org.announcementForm.hint.closureStart") : t("org.announcementForm.hint.closureContinue")))
    : (zoneCenter ? t("org.announcementForm.hint.zoneRadius") : t("org.announcementForm.hint.zoneCenter"));

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const form = {
        kind, title: title.trim(), description: description.trim(),
        region: myOrg.region || null, district: myOrg.district || null,
        startsAt: startsAt || null, endsAt: endsAt || null,
      };
      if (kind === "line") {
        form.linePoints = closurePoints;
        form.detourPoints = detourPoints;
      } else {
        form.zoneCenter = zoneCenter;
        form.zoneRadius = zoneRadius;
      }
      await createAnnouncement(myOrg.id, profile.id, form);
      resetGeometry(); setTitle(""); setDescription(""); setStartsAt(""); setEndsAt("");
      onCreated();
    } catch (e) {
      setError(e.message || t("org.announcementForm.errorGeneric"));
    }
    setSubmitting(false);
  };

  return (
    <div style={S.staffForm}>
      <h3 style={{ ...S.sectionTitle, margin: "0 0 8px" }}>{t("org.announcementForm.newTitle")}</h3>
      <div style={S.row2} className="oc-row2">
        <button onClick={() => changeKind("line")} style={{ ...S.catBtn, ...(kind === "line" ? S.catBtnActive : {}) }}>
          <Milestone size={18} color={kind === "line" ? "#fff" : "#C98A2B"} /><span>{t("org.announcementForm.kindLine")}</span>
        </button>
        <button onClick={() => changeKind("zone")} style={{ ...S.catBtn, ...(kind === "zone" ? S.catBtnActive : {}) }}>
          <CircleDot size={18} color={kind === "zone" ? "#fff" : "#B2402A"} /><span>{t("org.announcementForm.kindZone")}</span>
        </button>
      </div>

      <p style={S.fine}>{geometryHint}</p>
      <div style={S.pickGrid}>
        <MapContainer key={myOrg.id} center={mapCenter} zoom={13} style={{ width: "100%", height: "100%" }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationClickCatcher onPick={handleMapClick} />
          {kind === "line" && closurePoints.map((p, i) => (
            <Marker key={`c${i}`} position={[p.lat, p.lng]} icon={pinIcon("#B2402A")} />
          ))}
          {kind === "line" && closurePoints.length >= 2 && (
            <Polyline positions={closurePoints.map((p) => [p.lat, p.lng])} pathOptions={{ color: "#B2402A", weight: 6 }} />
          )}
          {kind === "line" && detourPoints.map((p, i) => (
            <Marker key={`d${i}`} position={[p.lat, p.lng]} icon={pinIcon("#2E9A5C")} />
          ))}
          {kind === "line" && detourPoints.length >= 1 && closurePoints.length >= 2 && (
            <Polyline positions={[closurePoints[0], ...detourPoints, closurePoints[closurePoints.length - 1]].map((p) => [p.lat, p.lng])}
              pathOptions={{ color: "#2E9A5C", weight: 4, dashArray: "10 8" }} />
          )}
          {kind === "zone" && zoneCenter && (
            <>
              <Marker position={[zoneCenter.lat, zoneCenter.lng]} icon={pinIcon("#B2402A")} />
              <Circle center={[zoneCenter.lat, zoneCenter.lng]} radius={zoneRadius} pathOptions={{ color: "#B2402A", fillColor: "#B2402A", fillOpacity: 0.15 }} />
            </>
          )}
        </MapContainer>
      </div>

      {kind === "line" && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          {(drawingDetour ? detourPoints.length > 0 : closurePoints.length > 0) && (
            <button style={S.secondaryBtn} onClick={undoLastPoint}><RotateCcw size={14} /> {t("org.announcementForm.undoPoint")}</button>
          )}
          {(closurePoints.length > 0 || detourPoints.length > 0) && (
            <button style={S.secondaryBtn} onClick={resetGeometry}>{t("org.announcementForm.resetGeometry")}</button>
          )}
          {closurePoints.length >= 2 && !drawingDetour && detourPoints.length === 0 && (
            <button style={S.secondaryBtn} onClick={startDetour}>{t("org.announcementForm.addDetourButton")}</button>
          )}
          {drawingDetour && detourPoints.length >= 1 && (
            <button style={S.primaryBtn} onClick={finishDetour}>{t("org.announcementForm.finishDetourButton")}</button>
          )}
          {!drawingDetour && detourPoints.length > 0 && (
            <button style={S.secondaryBtn} onClick={removeDetour}>{t("org.announcementForm.removeDetourButton")}</button>
          )}
        </div>
      )}

      {kind === "zone" && zoneCenter && (
        <div style={S.field}>
          <label style={S.label}>{t("org.announcementForm.radiusLabel", { radius: zoneRadius })}</label>
          <input type="range" min={50} max={3000} step={50} value={zoneRadius} onChange={(e) => setZoneRadius(Number(e.target.value))} style={{ width: "100%" }} />
          <button style={{ ...S.secondaryBtn, marginTop: 8 }} onClick={resetGeometry}>{t("org.announcementForm.resetGeometry")}</button>
        </div>
      )}

      <div style={S.field}>
        <label style={S.label}>{t("org.announcementForm.titleLabel")}</label>
        <input style={S.input} placeholder={kind === "line" ? t("org.announcementForm.titlePlaceholderLine") : t("org.announcementForm.titlePlaceholderZone")}
          value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
      </div>
      <div style={S.field}>
        <label style={S.label}>{t("org.announcementForm.descriptionLabel")}</label>
        <textarea style={{ ...S.input, height: 80 }} placeholder={t("org.announcementForm.descriptionPlaceholder")}
          value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div style={S.row2} className="oc-row2">
        <div style={S.field}>
          <label style={S.label}>{t("org.announcementForm.startsAtLabel")}</label>
          <input type="datetime-local" style={S.input} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </div>
        <div style={S.field}>
          <label style={S.label}>{t("org.announcementForm.endsAtLabel")}</label>
          <input type="datetime-local" style={S.input} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </div>
      </div>
      {error && <div style={{ fontSize: 12.5, color: "#A33A3A", marginBottom: 10 }}>{error}</div>}
      <button style={S.primaryBtn} disabled={!canSubmit || submitting} onClick={submit}>
        <Check size={15} /> {t("org.announcementForm.submit")}
      </button>
    </div>
  );
}

