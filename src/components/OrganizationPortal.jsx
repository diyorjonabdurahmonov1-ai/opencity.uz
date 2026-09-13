import { useRef, useState } from "react";
import { Camera, ChevronLeft, ClipboardList } from "lucide-react";
import { RESOLUTION_PHOTOS_REQUIRED, compressImage } from "../constants";
import { S } from "../styles";
import { StatCard, EmptyState, ReportCard, ReportDetail } from "./shared";
import { advanceStatus, markResolved } from "../lib/api/reports";
import { uploadPhoto } from "../lib/api/storage";

export function OrganizationPortal({ profile, myOrg, reports, refreshReports, showToast }) {
  const [openId, setOpenId] = useState(null);
  const [proofUrls, setProofUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const assigned = reports.filter((r) => r.assignedOrgId === profile.org_id);
  const open = assigned.find((r) => r.id === openId);

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
      <h2 style={S.pageTitle}>{myOrg?.name || "Bo'lim / Tashkilot paneli"}</h2>
      <div style={S.statsRow}>
        <StatCard label="Yangi tayinlangan" value={assigned.filter((r) => r.status === "assigned").length} accent="#8759B3" />
        <StatCard label="Bajarilmoqda" value={assigned.filter((r) => r.status === "in_progress").length} accent="#1E88A8" />
        <StatCard label="Hal qilingan" value={assigned.filter((r) => r.status === "resolved" || r.status === "closed").length} accent="#2E9A5C" />
      </div>
      <h3 style={S.sectionTitle}>Tayinlangan hisobotlar</h3>
      {assigned.length === 0 ? <EmptyState icon={ClipboardList} text="Hozircha tayinlangan hisobotlar yo'q." /> : (
        <div style={S.reportGrid}>{assigned.map((r) => <ReportCard key={r.id} report={r} onClick={() => setOpenId(r.id)} />)}</div>
      )}
    </div>
  );
}
