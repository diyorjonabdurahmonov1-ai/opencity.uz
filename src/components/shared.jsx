import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
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
      <span style={S.flyerLabel}>Hamkorlarimiz</span>
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

export function StatCard({ label, value, accent }) {
  return (<div style={S.statCard}><div style={{ ...S.statValue, color: accent || "#16202B" }}>{value}</div><div style={S.statLabel}>{label}</div></div>);
}

export function EmptyState({ icon: Icon, text }) {
  return (<div style={S.emptyState}><Icon size={26} color="#9AA7B2" /><p style={S.emptyText}>{text}</p></div>);
}

export function ReportCard({ report, onClick, profile, onVote }) {
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
          {hot && <span style={S.hotBadge}><Flame size={11} /> Dolzarb</span>}
        </div>
      ) : (
        <div style={{ ...S.reportImg, ...S.reportImgPlaceholder, position: "relative" }}>
          <Icon size={22} color="#7A8A99" />
          {hot && <span style={S.hotBadge}><Flame size={11} /> Dolzarb</span>}
        </div>
      )}
      <div style={S.reportCardBody}>
        <div style={S.reportCardTop}>
          <span style={S.catChip}><Icon size={12} /> {cat.label}</span>
          <span style={{ ...S.statusPill, background: st.color + "1a", color: st.color }}>{st.label}</span>
        </div>
        <div style={S.reportCardTitle}>{report.title}</div>
        <div style={S.reportCardMeta}>{report.district}, {report.region} · {fmtDate(report.createdAt)}</div>
        {report.assignedOrgKind === "private" ? (
          <span style={S.sponsorBadge}><Building2 size={11} /> {report.assignedDeptName} hal qilmoqda</span>
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

export function CityMap({ reports, title = "Shahar xaritasi", compact = false, center, profile, myOrg, refreshReports, showToast }) {
  const [catFilter, setCatFilter] = useState("all");
  const [showDone, setShowDone] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");
  const mapRef = useRef(null);

  const base = showDone ? reports : reports.filter((r) => !DONE_STATUSES.includes(r.status));
  const filtered = base.filter((r) => (catFilter === "all" || r.category === catFilter) && r.coords?.lat != null && r.coords?.lng != null);
  const open = reports.find((r) => r.id === openId);

  const handleVote = async (reportId, alreadyVoted) => {
    if (!profile) return;
    await toggleVote(reportId, profile.id, alreadyVoted);
    await refreshReports?.();
  };

  const geoErrorMessage = (err) => {
    if (err.code === 1) return "Joylashuvga ruxsat berilmagan. Brauzer manzil satridagi qulf/sozlamalar belgisidan saytga joylashuv ruxsatini bering.";
    if (err.code === 3) return "Joylashuvni aniqlash vaqti tugadi. Qaytadan urinib ko'ring.";
    return "Joylashuvni aniqlab bo'lmadi. GPS/joylashuv xizmati yoqilganini tekshiring.";
  };

  const locateMe = () => {
    setLocateError("");
    if (!navigator.geolocation) { setLocateError("Bu brauzer joylashuvni aniqlashni qo'llab-quvvatlamaydi."); return; }
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
      {title && <h2 style={S.pageTitle}>{title}</h2>}
      <div style={S.filterRow}>
        <select style={S.selectSm} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="all">Barcha turkumlar</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <label style={S.checkboxRow}>
          <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
          Tugatilganlarni ham ko'rsatish
        </label>
        <span style={S.fine}>{filtered.length} ta hisobot · <Flame size={11} style={{ verticalAlign: "-1px" }} color="#B2402A" /> = {HOT_VOTES}+ ovoz olgan dolzarb muammo</span>
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
          {myLocation && <Marker position={myLocation} icon={meIcon} />}
        </MapContainer>
        <button onClick={locateMe} title="Joylashuvimni aniqlash" style={S.locateBtn}>
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
                await claimReport(detailReport.id, myOrg.id, myOrg.name);
                await refreshReports?.();
                showToast?.(`"${detailReport.title}" hisobotini qabul qildingiz ✓`);
                setDetailId(null);
              }}
              profile={profile}
              onVote={profile ? handleVote : undefined}
              onDelete={profile && detailReport?.createdBy === profile.id ? async (id) => {
                await deleteReport(id);
                await refreshReports?.();
                showToast?.("Hisobot o'chirildi ✓");
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
              <div style={S.timelineStatus}>{st?.label || ev.status}</div>
              <div style={S.timelineMeta}>{ev.by} · {fmtDate(ev.at)}</div>
              {ev.note && <div style={S.timelineNote}>{ev.note}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ReportDetail({ report, onBack, canClaim = false, onClaim, profile, onVote, onDelete }) {
  const cat = CATEGORIES.find((c) => c.id === report.category);
  const Icon = cat?.icon || MoreHorizontal;
  const voted = !!profile && report.votes.includes(profile.id);
  const photos = report.photos?.length ? report.photos : (report.photo ? [report.photo] : []);
  const [lightbox, setLightbox] = useState(null);
  return (
    <div style={S.detailWrap}>
      <div style={S.rowHeader}>
        <button style={{ ...S.linkBtn, marginBottom: 0 }} onClick={onBack}><ChevronLeft size={15} /> Orqaga</button>
        {onDelete && (
          <button style={S.dangerBtn} onClick={() => {
            if (window.confirm("Bu hisobotni butunlay o'chirmoqchimisiz? Bu amalni orqaga qaytarib bo'lmaydi.")) onDelete(report.id);
          }}>
            <Trash2 size={14} /> O'chirish
          </button>
        )}
      </div>
      <div style={S.detailHeader}>
        {photos[0] && <img src={photos[0]} style={S.detailImg} alt="" onClick={() => setLightbox(photos[0])} />}
        <div>
          <span style={S.catChip}><Icon size={12} /> {cat?.label}</span>
          <h2 style={S.detailTitle}>{report.title}</h2>
          <div style={S.reportCardMeta}>{report.district}, {report.region} · {fmtDate(report.createdAt)}</div>
          {report.assignedOrgKind === "private" ? (
            <div style={S.sponsorBanner}><Building2 size={15} /> Bu muammoni <b>{report.assignedDeptName}</b> hal qilmoqda</div>
          ) : (
            <div style={S.reportCardMeta}>Mas'ul: {report.assignedDeptName}</div>
          )}
          {report.description && <p style={S.detailDesc}>{report.description}</p>}
          {onVote && (
            <button style={{ ...S.voteBtn, ...(voted ? S.voteBtnActive : {}), marginTop: 10 }} onClick={() => onVote(report.id, voted)}>
              <ThumbsUp size={14} /> {voted ? "Ovoz berilgan" : "Ovoz berish"} ({report.votes.length})
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
        <button style={S.claimBtn} onClick={onClaim}><HandHeart size={15} /> Men bu muammoni hal qilaman</button>
      )}
      {report.resolutionPhotos?.length > 0 && (
        <>
          <h3 style={S.sectionTitle}>Yopilganini tasdiqlovchi rasmlar</h3>
          <div style={S.proofRow}>{report.resolutionPhotos.map((p, i) => <img key={i} src={p} style={S.proofImg} alt="" onClick={() => setLightbox(p)} />)}</div>
        </>
      )}
      <h3 style={S.sectionTitle}>Holat tarixi</h3>
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
