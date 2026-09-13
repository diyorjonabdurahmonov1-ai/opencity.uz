import { useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMapEvents } from "react-leaflet";
import {
  Camera, ChevronLeft, ClipboardList, Megaphone, Milestone, CircleDot, Trash2, RotateCcw, Check,
} from "lucide-react";
import { RESOLUTION_PHOTOS_REQUIRED, UZBEKISTAN_CENTER, districtsOf, fmtDate, compressImage } from "../constants";
import { S } from "../styles";
import { StatCard, EmptyState, ReportCard, ReportDetail, pinIcon } from "./shared";
import { advanceStatus, markResolved } from "../lib/api/reports";
import { uploadPhoto } from "../lib/api/storage";
import { createAnnouncement, deleteAnnouncement } from "../lib/api/announcements";

export function OrganizationPortal({ profile, myOrg, reports, refreshReports, announcements, refreshAnnouncements, showToast }) {
  const [tab, setTab] = useState("reports");
  const [openId, setOpenId] = useState(null);
  const [proofUrls, setProofUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const assigned = reports.filter((r) => r.assignedOrgId === profile.org_id);
  const open = assigned.find((r) => r.id === openId);
  const isGovernment = myOrg?.kind === "government";

  const addProof = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const blob = await compressImage(file, 480, 0.55);
      const url = await uploadPhoto(profile.id, blob);
      setProofUrls((p) => [...p, url]);
    } catch {
      // e'tiborsiz qoldiramiz — foydalanuvchi qayta urinib ko'rishi mumkin
    }
    setUploading(false);
  };

  const advance = async (report, nextStatus, note) => {
    await advanceStatus(report.id, nextStatus, note, myOrg?.name || "Tashkilot");
    await refreshReports();
    showToast("Holat yangilandi ✓");
  };

  const finishResolve = async (report) => {
    if (proofUrls.length < RESOLUTION_PHOTOS_REQUIRED) return;
    await markResolved(report.id, proofUrls, myOrg?.name || "Tashkilot");
    await refreshReports();
    setProofUrls([]);
    setOpenId(null);
    showToast("Hisobot hal qilindi deb belgilandi va xaritadan olib tashlandi ✓");
  };

  if (!profile.org_id) {
    return (
      <div style={S.content}>
        <EmptyState icon={ClipboardList} text="Sizga hali biror tashkilot biriktirilmagan. Admin bilan bog'laning." />
      </div>
    );
  }

  if (open) {
    return (
      <div style={S.content}>
        <button style={S.linkBtn} onClick={() => { setOpenId(null); setProofUrls([]); }}><ChevronLeft size={15} /> Ro'yxatga qaytish</button>
        <ReportDetail report={open} onBack={() => setOpenId(null)} />
        <div style={S.orgActionBox}>
          {open.status === "assigned" && <button style={S.primaryBtn} onClick={() => advance(open, "in_progress", "Ish boshlandi.")}>Ishni boshlash</button>}
          {open.status === "assigned" && <button style={S.secondaryBtn} onClick={() => advance(open, "neglected", "Hozircha e'tiborsiz qoldirildi.")}>E'tiborsiz qoldirish</button>}
          {open.status === "in_progress" && (
            <div style={{ width: "100%" }}>
              <div style={S.label}>Yopish uchun kamida {RESOLUTION_PHOTOS_REQUIRED} ta shu joydan olingan rasm kerak ({proofUrls.length}/{RESOLUTION_PHOTOS_REQUIRED})</div>
              <div style={S.proofRow}>
                {proofUrls.map((p, i) => <img key={i} src={p} style={S.proofImg} alt="" />)}
                <button style={S.uploadMini} onClick={() => fileRef.current?.click()} disabled={uploading}><Camera size={16} /></button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={addProof} />
              <button style={S.primaryBtn} disabled={proofUrls.length < RESOLUTION_PHOTOS_REQUIRED} onClick={() => finishResolve(open)}>
                Hal qilindi deb belgilash
              </button>
            </div>
          )}
          {open.status === "neglected" && <button style={S.primaryBtn} onClick={() => advance(open, "in_progress", "Ish qayta boshlandi.")}>Ishni boshlash</button>}
        </div>
      </div>
    );
  }

  return (
    <div style={S.content}>
      <div style={S.rowHeader}>
        <h2 style={S.pageTitle}>{myOrg?.name || "Bo'lim / Tashkilot paneli"}</h2>
        {isGovernment && (
          <div style={S.portalSwitch}>
            <button onClick={() => setTab("reports")} style={{ ...S.portalTab, ...(tab === "reports" ? S.portalTabActive : {}) }}>
              <ClipboardList size={14} /> <span>Hisobotlar</span>
            </button>
            <button onClick={() => setTab("announcements")} style={{ ...S.portalTab, ...(tab === "announcements" ? S.portalTabActive : {}) }}>
              <Megaphone size={14} /> <span>E'lonlar</span>
            </button>
          </div>
        )}
      </div>

      {tab === "reports" && (
        <>
          <div style={S.statsRow}>
            <StatCard label="Yangi tayinlangan" value={assigned.filter((r) => r.status === "assigned").length} accent="#8759B3" />
            <StatCard label="Bajarilmoqda" value={assigned.filter((r) => r.status === "in_progress").length} accent="#1E88A8" />
            <StatCard label="Hal qilingan" value={assigned.filter((r) => r.status === "resolved" || r.status === "closed").length} accent="#2E9A5C" />
          </div>
          <h3 style={S.sectionTitle}>Tayinlangan hisobotlar</h3>
          {assigned.length === 0 ? <EmptyState icon={ClipboardList} text="Hozircha tayinlangan hisobotlar yo'q." /> : (
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
  const mine = (announcements || []).filter((a) => a.orgId === myOrg.id);

  const remove = async (id) => {
    if (!window.confirm("Bu e'lonni o'chirmoqchimisiz?")) return;
    await deleteAnnouncement(id);
    await refreshAnnouncements();
    showToast("E'lon o'chirildi ✓");
  };

  return (
    <div>
      <AnnouncementForm profile={profile} myOrg={myOrg}
        onCreated={async () => { await refreshAnnouncements(); showToast("E'lon joylandi ✓"); }} />
      <h3 style={S.sectionTitle}>Sizning e'lonlaringiz</h3>
      {mine.length === 0 ? <EmptyState icon={Megaphone} text="Hali e'lon joylamagansiz." /> : (
        <div style={S.appList}>
          {mine.map((a) => (
            <div key={a.id} style={S.appRow}>
              {a.kind === "line" ? <Milestone size={18} color="#C98A2B" /> : <CircleDot size={18} color="#B2402A" />}
              <div style={{ flex: 1 }}>
                <div style={S.reportCardTitle}>{a.title}</div>
                <div style={S.reportCardMeta}>
                  {(a.startsAt || a.endsAt) ? `${a.startsAt ? fmtDate(a.startsAt) : "?"} — ${a.endsAt ? fmtDate(a.endsAt) : "noma'lum"}` : fmtDate(a.createdAt)}
                </div>
              </div>
              <button style={S.iconBtn} onClick={() => remove(a.id)} title="O'chirish"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnnouncementForm({ profile, myOrg, onCreated }) {
  const [kind, setKind] = useState("line");
  const [points, setPoints] = useState([]);
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

  const changeKind = (next) => {
    setKind(next);
    setPoints([]);
    setZoneCenter(null);
  };

  const handleMapClick = (lat, lng) => {
    if (kind === "line") setPoints((prev) => [...prev, { lat, lng }]);
    else setZoneCenter({ lat, lng });
  };

  const resetGeometry = () => { setPoints([]); setZoneCenter(null); };

  const canSubmit = title.trim().length > 0 && (
    (kind === "line" && points.length >= 2) || (kind === "zone" && !!zoneCenter)
  );

  const geometryHint = kind === "line"
    ? (points.length === 0 ? "Ko'chaning YOPILADIGAN qismi boshlanadigan nuqtani xaritada bosing (qizil chiziq bo'ladi)."
      : points.length === 1 ? "Endi ko'chaning tugash nuqtasini bosing."
        : "Yopilgan qism qizil rangda chizildi. Kerak bo'lsa, aylanib o'tish yo'li uchun oraliq nuqtalarni bosib qo'shing — u yashil rangda ko'rinadi.")
    : (zoneCenter ? "Endi pastdagi tayoqcha bilan ta'sirlangan hudud radiusini belgilang." : "Ta'sirlangan hudud markazini xaritada bosing.");

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
        form.lineStart = points[0];
        form.lineEnd = points[1];
        form.detour = points.slice(2);
      } else {
        form.zoneCenter = zoneCenter;
        form.zoneRadius = zoneRadius;
      }
      await createAnnouncement(myOrg.id, profile.id, form);
      setPoints([]); setZoneCenter(null); setTitle(""); setDescription(""); setStartsAt(""); setEndsAt("");
      onCreated();
    } catch (e) {
      setError(e.message || "Xatolik yuz berdi.");
    }
    setSubmitting(false);
  };

  return (
    <div style={S.staffForm}>
      <h3 style={{ ...S.sectionTitle, margin: "0 0 8px" }}>Yangi e'lon joylash</h3>
      <div style={S.row2} className="oc-row2">
        <button onClick={() => changeKind("line")} style={{ ...S.catBtn, ...(kind === "line" ? S.catBtnActive : {}) }}>
          <Milestone size={18} color={kind === "line" ? "#fff" : "#C98A2B"} /><span>Ko'cha yopilishi</span>
        </button>
        <button onClick={() => changeKind("zone")} style={{ ...S.catBtn, ...(kind === "zone" ? S.catBtnActive : {}) }}>
          <CircleDot size={18} color={kind === "zone" ? "#fff" : "#B2402A"} /><span>Xizmat uzilishi (hudud)</span>
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
          {kind === "line" && points.map((p, i) => (
            <Marker key={i} position={[p.lat, p.lng]} icon={pinIcon(i === 0 ? "#B2402A" : i === 1 ? "#B2402A" : "#2E9A5C")} />
          ))}
          {kind === "line" && points.length >= 2 && (
            <Polyline positions={[points[0], points[1]].map((p) => [p.lat, p.lng])} pathOptions={{ color: "#B2402A", weight: 6 }} />
          )}
          {kind === "line" && points.length > 2 && (
            <Polyline positions={[points[0], ...points.slice(2), points[1]].map((p) => [p.lat, p.lng])}
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
      {(points.length > 0 || zoneCenter) && (
        <button style={{ ...S.secondaryBtn, marginTop: 8 }} onClick={resetGeometry}><RotateCcw size={14} /> Qaytadan belgilash</button>
      )}

      {kind === "zone" && zoneCenter && (
        <div style={S.field}>
          <label style={S.label}>Ta'sirlangan hudud radiusi: {zoneRadius} metr</label>
          <input type="range" min={50} max={3000} step={50} value={zoneRadius} onChange={(e) => setZoneRadius(Number(e.target.value))} style={{ width: "100%" }} />
        </div>
      )}

      <div style={S.field}>
        <label style={S.label}>Sarlavha</label>
        <input style={S.input} placeholder={kind === "line" ? "Masalan: Amir Temur ko'chasi yopiladi" : "Masalan: Issiq suv uzilishi"}
          value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
      </div>
      <div style={S.field}>
        <label style={S.label}>Tavsif (ixtiyoriy)</label>
        <textarea style={{ ...S.input, height: 80 }} placeholder="Sabab, aylanib o'tish yo'li haqida qo'shimcha ma'lumot..."
          value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div style={S.row2} className="oc-row2">
        <div style={S.field}>
          <label style={S.label}>Boshlanish vaqti (ixtiyoriy)</label>
          <input type="datetime-local" style={S.input} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </div>
        <div style={S.field}>
          <label style={S.label}>Tugash vaqti (ixtiyoriy)</label>
          <input type="datetime-local" style={S.input} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </div>
      </div>
      {error && <div style={{ fontSize: 12.5, color: "#A33A3A", marginBottom: 10 }}>{error}</div>}
      <button style={S.primaryBtn} disabled={!canSubmit || submitting} onClick={submit}>
        <Check size={15} /> E'lonni joylash
      </button>
    </div>
  );
}
