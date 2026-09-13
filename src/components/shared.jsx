import { Fragment, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Polyline, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import { MoreHorizontal, ThumbsUp, Flame, X, ChevronLeft, LocateFixed, Loader2, Building2, HandHeart, Trash2 } from "lucide-react";
import { CATEGORIES, STATUS, DONE_STATUSES, HOT_VOTES, UZBEKISTAN_CENTER, fmtDate } from "../constants";
import { S } from "../styles";
import { claimReport, toggleVote, deleteReport } from "../lib/api/reports";

export function pinIcon(color, hot = false) {
  return L.divIcon({
    className: "oc-map-pin",
    html: `<span style="display:flex;width:24px;height:24px;border-radius:50%;background:#fff;border:2px solid ${color};align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(15,42,67,0.28);${hot ? "animation:hotpulse 1.4s ease-in-out infinite;" : ""}"><span style="width:9px;height:9px;border-radius:50%;background:${color};"></span></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

const meIcon = L.divIcon({
  className: "oc-map-pin",
  html: `<span style="display:flex;width:18px;height:18px;border-radius:50%;background:#1E88A8;border:3px solid #fff;box-shadow:0 0 0 2px rgba(30,136,168,0.5),0 2px 6px rgba(15,42,67,0.35);"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export const closureIcon = L.divIcon({
  className: "oc-map-pin",
  html: `<span style="display:flex;width:30px;height:30px;border-radius:50%;background:#B2402A;border:3px solid #fff;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(178,64,42,0.55);font-size:15px;">⛔</span>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

export const zoneMarkerIcon = L.divIcon({
  className: "oc-map-pin",
  html: `<span style="display:flex;width:30px;height:30px;border-radius:50%;background:#B2402A;border:3px solid #fff;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(178,64,42,0.55);font-size:15px;">⚠️</span>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

export function SideNav({ items, active, onChange }) {
  return (
    <div style={S.sidenav} className="oc-sidenav">
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = active === it.id || (active === "report" && it.id === "home") || (active === "apply-org" && it.id === "profile");
        return (
          <button key={it.id} onClick={() => onChange(it.id)} className="oc-sidenav-item"
            style={{ ...S.sidenavItem, ...(isActive ? S.sidenavItemActive : {}) }}>
            <Icon size={17} /><span className="oc-sidenav-label">{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function PartnerFlyer({ orgs }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!orgs || orgs.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % orgs.length), 3500);
    return () => clearInterval(id);
  }, [orgs?.length]);

  if (!orgs || orgs.length === 0) return null;
  const org = orgs[index % orgs.length];

  return (
    <div style={S.flyer}>
      <span style={S.flyerLabel}>{t("shared.partnerFlyer.label")}</span>
      <div key={org.id} className="oc-flyer-fade" style={S.flyerContent}>
        {org.logo_url ? (
          <img src={org.logo_url} alt="" style={S.flyerLogo} />
        ) : (
          <div style={{ ...S.flyerLogo, ...S.flyerLogoPlaceholder }}><Building2 size={22} color="#8759B3" /></div>
        )}
        <div style={S.flyerTextCol}>
          <span style={S.flyerName}>{org.name}</span>
          {org.type && <span style={S.flyerType}>{org.type}</span>}
        </div>
      </div>
      {orgs.length > 1 && (
        <div style={S.flyerDots}>
          {orgs.map((o, i) => (
            <span key={o.id} style={{ ...S.flyerDot, ...(i === index ? S.flyerDotActive : {}) }} />
          ))}
        </div>
      )}
    </div>
  );
}

// Butun sonlar o'zgarganda silliq "hisoblab chiqish" animatsiyasi bilan ko'rsatadi
// (masalan "3" dan "7" ga sakramay, tez o'sib boradi) — matn/"—" kabi qiymatlar o'zgarishsiz qoladi.
function useCountUp(value, duration = 650) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  useEffect(() => {
    if (typeof value !== "number" || typeof prevRef.current !== "number") {
      setDisplay(value);
      prevRef.current = value;
      return;
    }
    const from = prevRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prevRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
}

export function StatCard({ label, value, accent }) {
  const display = useCountUp(value);
  return (<div style={S.statCard} className="oc-card"><div style={{ ...S.statValue, color: accent || "#16202B" }}>{display}</div><div style={S.statLabel}>{label}</div></div>);
}

export function EmptyState({ icon: Icon, text }) {
  return (<div style={S.emptyState}><Icon size={26} color="#9AA7B2" /><p style={S.emptyText}>{text}</p></div>);
}

export function ReportCard({ report, onClick, profile, onVote }) {
  const { t, i18n } = useTranslation();
  const cat = CATEGORIES.find((c) => c.id === report.category) || CATEGORIES[CATEGORIES.length - 1];
  const st = STATUS[report.status];
  const Icon = cat.icon;
  const hot = report.votes.length >= HOT_VOTES && !DONE_STATUSES.includes(report.status);
  const voted = !!profile && report.votes.includes(profile.id);
  return (
    <div style={S.reportCard} className="oc-card" onClick={onClick}>
      {report.photo ? (
        <div style={{ position: "relative" }}>
          <img src={report.photo} alt="" style={S.reportImg} />
          {hot && <span style={S.hotBadge}><Flame size={11} /> {t("shared.reportCard.hot")}</span>}
        </div>
      ) : (
        <div style={{ ...S.reportImg, ...S.reportImgPlaceholder, position: "relative" }}>
          <Icon size={22} color="#7A8A99" />
          {hot && <span style={S.hotBadge}><Flame size={11} /> {t("shared.reportCard.hot")}</span>}
        </div>
      )}
      <div style={S.reportCardBody}>
        <div style={S.reportCardTop}>
          <span style={S.catChip}><Icon size={12} /> {t(`category.${cat.id}`)}</span>
          <span style={{ ...S.statusPill, background: st.color + "1a", color: st.color }}>{t(`status.${report.status}`)}</span>
        </div>
        <div style={S.reportCardTitle}>{report.title}</div>
        <div style={S.reportCardMeta}>{report.district}, {report.region} · {fmtDate(report.createdAt, i18n.language)}</div>
        {report.assignedOrgKind === "private" ? (
          <span style={S.sponsorBadge}><Building2 size={11} /> {report.assignedDeptName} {t("shared.reportCard.sponsorSuffix")}</span>
        ) : (
          <div style={S.reportCardMeta}>{report.assignedDeptName}</div>
        )}
        {onVote ? (
          <button
            style={{ ...S.voteBtn, ...S.reportCardVoteBtn, ...(voted ? S.voteBtnActive : {}) }}
            onClick={(e) => { e.stopPropagation(); onVote(report.id, voted); }}
          >
            <ThumbsUp size={12} /> {report.votes.length}
          </button>
        ) : (
          <div style={S.reportCardVotes}><ThumbsUp size={12} /> {report.votes.length}</div>
        )}
      </div>
    </div>
  );
}

export function CityMap({ reports, title, compact = false, center, profile, myOrg, refreshReports, showToast, announcements = [] }) {
  const { t, i18n } = useTranslation();
  const [catFilter, setCatFilter] = useState("all");
  const [showDone, setShowDone] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");
  const mapRef = useRef(null);
  const resolvedTitle = title === null ? null : (title || t("shared.cityMap.defaultTitle"));

  const base = showDone ? reports : reports.filter((r) => !DONE_STATUSES.includes(r.status));
  const filtered = base.filter((r) => (catFilter === "all" || r.category === catFilter) && r.coords?.lat != null && r.coords?.lng != null);
  const open = reports.find((r) => r.id === openId);

  const handleVote = async (reportId, alreadyVoted) => {
    if (!profile) return;
    await toggleVote(reportId, profile.id, alreadyVoted);
    await refreshReports?.();
  };

  const geoErrorMessage = (err) => {
    if (err.code === 1) return t("shared.geo.permissionDenied");
    if (err.code === 3) return t("shared.geo.timeout");
    return t("shared.geo.unavailable");
  };

  const locateMe = () => {
    setLocateError("");
    if (!navigator.geolocation) { setLocateError(t("shared.geo.notSupported")); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const pt = [pos.coords.latitude, pos.coords.longitude];
        setMyLocation(pt);
        mapRef.current?.flyTo(pt, 15);
        setLocating(false);
      },
      (err) => { setLocating(false); setLocateError(geoErrorMessage(err)); },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div>
      {resolvedTitle && <h2 style={S.pageTitle}>{resolvedTitle}</h2>}
      <div style={S.filterRow}>
        <select style={S.selectSm} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="all">{t("shared.cityMap.allCategories")}</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{t(`category.${c.id}`)}</option>)}
        </select>
        <label style={S.checkboxRow}>
          <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
          {t("shared.cityMap.showDone")}
        </label>
        <span style={S.fine}>{t("shared.cityMap.reportsCount", { count: filtered.length })} · <Flame size={11} style={{ verticalAlign: "-1px" }} color="#B2402A" /> {t("shared.cityMap.hotLegend", { hot: HOT_VOTES })}</span>
      </div>
      <div style={{ ...(compact ? S.compactMap : S.bigMap), position: "relative" }}>
        <MapContainer ref={mapRef} key={center ? center.join(",") : "uzbekistan"} center={center || UZBEKISTAN_CENTER} zoom={center ? 13 : 6}
          style={{ width: "100%", height: "100%" }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filtered.map((r) => {
            const st = STATUS[r.status];
            const hot = r.votes.length >= HOT_VOTES && !DONE_STATUSES.includes(r.status);
            return (
              <Marker key={r.id} position={[r.coords.lat, r.coords.lng]} icon={pinIcon(hot ? "#B2402A" : st.color, hot)}
                eventHandlers={{ click: () => setOpenId(r.id) }} />
            );
          })}
          {announcements.filter((a) => !a.endsAt || new Date(a.endsAt) > new Date()).map((a) => {
            if (a.kind === "line" && a.linePoints?.length >= 2) {
              const mid = a.linePoints[Math.floor((a.linePoints.length - 1) / 2)];
              return (
                <Fragment key={a.id}>
                  <Polyline positions={a.linePoints.map((p) => [p.lat, p.lng])}
                    pathOptions={{ color: "#B2402A", weight: 6 }} />
                  {a.detourPoints?.length > 0 && (
                    <Polyline positions={[a.linePoints[0], ...a.detourPoints, a.linePoints[a.linePoints.length - 1]].map((p) => [p.lat, p.lng])}
                      pathOptions={{ color: "#2E9A5C", weight: 4, dashArray: "10 8" }} />
                  )}
                  <Marker position={[mid.lat, mid.lng]} icon={closureIcon}>
                    <Popup><AnnouncementPopup a={a} /></Popup>
                  </Marker>
                </Fragment>
              );
            }
            if (a.kind === "zone" && a.zoneCenter && a.zoneRadius) {
              return (
                <Fragment key={a.id}>
                  <Circle center={[a.zoneCenter.lat, a.zoneCenter.lng]} radius={a.zoneRadius}
                    pathOptions={{ color: "#B2402A", fillColor: "#B2402A", fillOpacity: 0.15, weight: 2 }} />
                  <Marker position={[a.zoneCenter.lat, a.zoneCenter.lng]} icon={zoneMarkerIcon}>
                    <Popup><AnnouncementPopup a={a} /></Popup>
                  </Marker>
                </Fragment>
              );
            }
            return null;
          })}
          {myLocation && <Marker position={myLocation} icon={meIcon} />}
        </MapContainer>
        <button onClick={locateMe} title={t("shared.cityMap.locateTitle")} style={S.locateBtn}>
          {locating ? <Loader2 className="spin" size={17} /> : <LocateFixed size={17} />}
        </button>
        {locateError && (
          <div style={S.locateError}>
            {locateError}
            <button onClick={() => setLocateError("")} style={S.locateErrorClose}><X size={12} /></button>
          </div>
        )}
      </div>
      {open && (
        <div style={S.mapPreviewCard}>
          <button style={S.removePhotoBtn} onClick={() => setOpenId(null)}><X size={13} /></button>
          <ReportCard report={open} onClick={() => setDetailId(open.id)} profile={profile} onVote={profile ? handleVote : undefined} />
        </div>
      )}
      {detailId && (() => {
        const detailReport = reports.find((r) => r.id === detailId);
        const canClaim = !!(
          profile && myOrg?.kind === "private" &&
          detailReport?.assignedOrgKind === "government" &&
          !DONE_STATUSES.includes(detailReport?.status)
        );
        return (
          <Modal onClose={() => setDetailId(null)}>
            <ReportDetail
              report={detailReport}
              onBack={() => setDetailId(null)}
              canClaim={canClaim}
              onClaim={async () => {
                await claimReport(detailReport.id, myOrg.id, myOrg.name, t);
                await refreshReports?.();
                showToast?.(t("shared.reportDetail.claimedToast", { title: detailReport.title }));
                setDetailId(null);
              }}
              profile={profile}
              onVote={profile ? handleVote : undefined}
              onDelete={profile && detailReport?.createdBy === profile.id ? async (id) => {
                await deleteReport(id);
                await refreshReports?.();
                showToast?.(t("shared.reportDetail.deletedToast"));
                setDetailId(null);
                setOpenId(null);
              } : undefined}
            />
          </Modal>
        );
      })()}
    </div>
  );
}

function AnnouncementPopup({ a }) {
  const { t, i18n } = useTranslation();
  return (
    <div style={{ fontSize: 12.5, lineHeight: 1.5, maxWidth: 200 }}>
      <div style={{ fontWeight: 700, marginBottom: 3 }}>{a.title}</div>
      {a.description && <div style={{ marginBottom: 3 }}>{a.description}</div>}
      <div style={{ color: "#7A8A99" }}>{a.orgName}</div>
      {(a.startsAt || a.endsAt) && (
        <div style={{ color: "#7A8A99", marginTop: 3 }}>
          {a.startsAt ? fmtDate(a.startsAt, i18n.language) : t("shared.announcementPopup.unknownStart")} — {a.endsAt ? fmtDate(a.endsAt, i18n.language) : t("shared.announcementPopup.unknownEnd")}
        </div>
      )}
    </div>
  );
}

export function Modal({ onClose, children }) {
  return (
    <div style={S.modalBackdrop} onClick={onClose}>
      <div style={S.modalCard} onClick={(e) => e.stopPropagation()}>
        <button style={S.modalClose} onClick={onClose}><X size={16} /></button>
        {children}
      </div>
    </div>
  );
}

export function Timeline({ events }) {
  const { t, i18n } = useTranslation();
  return (
    <div style={S.timeline}>
      {events.map((ev, i) => {
        const st = STATUS[ev.status];
        return (
          <div key={ev.id} style={S.timelineRow}>
            <div style={S.timelineDotWrap}>
              <div style={{ ...S.timelineDot, background: st?.color || "#7A8A99" }} />
              {i < events.length - 1 && <div style={S.timelineLine} />}
            </div>
            <div style={S.timelineBody}>
              <div style={S.timelineStatus}>{st ? t(`status.${ev.status}`) : ev.status}</div>
              <div style={S.timelineMeta}>{ev.by} · {fmtDate(ev.at, i18n.language)}</div>
              {ev.note && <div style={S.timelineNote}>{ev.note}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ReportDetail({ report, onBack, canClaim = false, onClaim, profile, onVote, onDelete }) {
  const { t, i18n } = useTranslation();
  const cat = CATEGORIES.find((c) => c.id === report.category);
  const Icon = cat?.icon || MoreHorizontal;
  const voted = !!profile && report.votes.includes(profile.id);
  const photos = report.photos?.length ? report.photos : (report.photo ? [report.photo] : []);
  const [lightbox, setLightbox] = useState(null);
  return (
    <div style={S.detailWrap}>
      <div style={S.rowHeader}>
        <button style={{ ...S.linkBtn, marginBottom: 0 }} onClick={onBack}><ChevronLeft size={15} /> {t("common.back")}</button>
        {onDelete && (
          <button style={S.dangerBtn} onClick={() => {
            if (window.confirm(t("shared.reportDetail.confirmDelete"))) onDelete(report.id);
          }}>
            <Trash2 size={14} /> {t("common.delete")}
          </button>
        )}
      </div>
      <div style={S.detailHeader}>
        {photos[0] && <img src={photos[0]} style={S.detailImg} alt="" onClick={() => setLightbox(photos[0])} />}
        <div>
          <span style={S.catChip}><Icon size={12} /> {cat && t(`category.${cat.id}`)}</span>
          <h2 style={S.detailTitle}>{report.title}</h2>
          <div style={S.reportCardMeta}>{report.district}, {report.region} · {fmtDate(report.createdAt, i18n.language)}</div>
          {report.assignedOrgKind === "private" ? (
            <div style={S.sponsorBanner}><Building2 size={15} /> {t("shared.reportDetail.sponsorPrefix")} <b>{report.assignedDeptName}</b> {t("shared.reportDetail.sponsorSuffix")}</div>
          ) : (
            <div style={S.reportCardMeta}>{t("shared.reportDetail.responsible")} {report.assignedDeptName}</div>
          )}
          {report.description && <p style={S.detailDesc}>{report.description}</p>}
          {onVote && (
            <button style={{ ...S.voteBtn, ...(voted ? S.voteBtnActive : {}), marginTop: 10 }} onClick={() => onVote(report.id, voted)}>
              <ThumbsUp size={14} /> {voted ? t("shared.reportDetail.voted") : t("shared.reportDetail.voteButton")} ({report.votes.length})
            </button>
          )}
        </div>
      </div>
      {photos.length > 1 && (
        <div style={S.proofRow}>
          {photos.map((p, i) => <img key={i} src={p} style={S.proofImg} alt="" onClick={() => setLightbox(p)} />)}
        </div>
      )}
      {canClaim && (
        <button style={S.claimBtn} onClick={onClaim}><HandHeart size={15} /> {t("shared.reportDetail.claim")}</button>
      )}
      {report.resolutionPhotos?.length > 0 && (
        <>
          <h3 style={S.sectionTitle}>{t("shared.reportDetail.resolutionPhotos")}</h3>
          <div style={S.proofRow}>{report.resolutionPhotos.map((p, i) => <img key={i} src={p} style={S.proofImg} alt="" onClick={() => setLightbox(p)} />)}</div>
        </>
      )}
      <h3 style={S.sectionTitle}>{t("shared.reportDetail.statusHistory")}</h3>
      <Timeline events={report.timeline} />
      {lightbox && (
        <div style={S.lightboxBackdrop} onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" style={S.lightboxImg} onClick={(e) => e.stopPropagation()} />
          <button style={S.modalClose} onClick={() => setLightbox(null)}><X size={16} /></button>
        </div>
      )}
    </div>
  );
}
