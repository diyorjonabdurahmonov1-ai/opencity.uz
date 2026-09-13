import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Camera, X, Check, ChevronRight, ChevronLeft, Loader2, MapPin, CheckCircle2, ThumbsUp } from "lucide-react";
import {
  CATEGORIES, REGION_NAMES, districtsOf, UZBEKISTAN_CENTER, nearestLocation,
  compressImage, fmtDate, now, DONE_STATUSES,
} from "../constants";
import { S } from "../styles";
import { EmptyState, ReportCard, pinIcon } from "./shared";
import { createReport } from "../lib/api/reports";
import { findGovernmentOrg } from "../lib/api/organizations";
import { uploadPhoto } from "../lib/api/storage";

function LocationPicker({ onPick }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

export function ReportWizard({ profile, reports, onDone, onCancel, onVoteInstead }) {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState(null);
  const [photoBlobs, setPhotoBlobs] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const MAX_PHOTOS = 5;
  const [region, setRegion] = useState(profile.detected_region || REGION_NAMES[0]);
  const [district, setDistrict] = useState(profile.detected_district || districtsOf(profile.detected_region || REGION_NAMES[0])[0]?.name);
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(
    profile.home_lat != null ? { lat: profile.home_lat, lng: profile.home_lng, gps: true } : null
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [locateError, setLocateError] = useState("");
  const [locating, setLocating] = useState(false);
  const [assignedOrgName, setAssignedOrgName] = useState("");
  const fileRef = useRef();

  const regionDistricts = districtsOf(region);

  useEffect(() => {
    if (step !== 5 || !category || !region || !district) return;
    findGovernmentOrg(region, district, category).then((org) => setAssignedOrgName(org.name)).catch(() => setAssignedOrgName(""));
  }, [step, category, region, district]);

  const steps = [
    t("wizard.steps.category"), t("wizard.steps.photo"), t("wizard.steps.location"),
    t("wizard.steps.similarCheck"), t("wizard.steps.description"), t("wizard.steps.review"),
  ];

  const similar = category
    ? reports.filter((r) => r.category === category && r.district === district && r.region === region && !DONE_STATUSES.includes(r.status))
    : [];

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_PHOTOS - photoBlobs.length);
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    for (const file of files) {
      try {
        const blob = await compressImage(file);
        setPhotoBlobs((prev) => [...prev, blob]);
        setPhotoPreviews((prev) => [...prev, URL.createObjectURL(blob)]);
      } catch {
        // e'tiborsiz qoldiramiz, foydalanuvchi qayta urinib ko'rishi mumkin
      }
    }
    setUploading(false);
  };

  const removePhoto = (i) => {
    setPhotoBlobs((prev) => prev.filter((_, idx) => idx !== i));
    setPhotoPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const applyLocation = (lat, lng, gps) => {
    setCoords({ lat, lng, gps });
    const loc = nearestLocation(lat, lng);
    if (loc) { setRegion(loc.region); setDistrict(loc.district); }
  };

  // Bir necha soniya davomida signalni "aniqlashtirib", eng past xato (accuracy) bilan kelgan
  // o'qishni saqlaydi — telefonlarda GPS bir necha soniyada aniqroq bo'lib boradi.
  const useMyLocation = () => {
    setLocateError("");
    if (!navigator.geolocation) { setLocateError(t("wizard.geo.notSupported")); return; }
    setLocating(true);
    let best = null;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!best || pos.coords.accuracy < best.coords.accuracy) {
          best = pos;
          applyLocation(pos.coords.latitude, pos.coords.longitude, true);
        }
      },
      (err) => {
        navigator.geolocation.clearWatch(watchId);
        setLocating(false);
        setLocateError(err.code === 1 ? t("wizard.geo.permissionDenied") : t("wizard.geo.unavailable"));
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 8000 }
    );
    setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
      setLocating(false);
      if (!best) setLocateError(t("wizard.geo.unavailable"));
    }, 6000);
  };
  const pickOnMap = (lat, lng) => applyLocation(lat, lng, false);

  const changeRegion = (nextRegion) => {
    setRegion(nextRegion);
    setDistrict(districtsOf(nextRegion)[0]?.name);
  };

  const districtCenter = regionDistricts.find((d) => d.name === district);
  const mapCenter = coords ? [coords.lat, coords.lng] : districtCenter ? [districtCenter.lat, districtCenter.lng] : UZBEKISTAN_CENTER;

  const goNext = () => {
    if (step === 2 && similar.length === 0) { setStep(4); return; }
    setStep(step + 1);
  };
  const goBack = () => {
    if (step === 4 && similar.length === 0) { setStep(2); return; }
    setStep(step - 1);
  };

  const canNext = [!!category, true, !!coords, true, title.trim().length > 2, true][step];

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const photoUrls = [];
      for (const blob of photoBlobs) photoUrls.push(await uploadPhoto(profile.id, blob));
      const report = await createReport(profile, {
        category, title: title.trim(), description: description.trim(), photoUrls, region, district, address, coords,
      }, t);
      onDone(report);
    } catch (e) {
      setError(e.message || t("wizard.errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={S.wizardWrap}>
      <div style={S.wizardHeader}>
        <button style={S.linkBtn} onClick={onCancel}><X size={16} /> {t("common.cancel")}</button>
        <div style={S.stepIndicator}>{steps.map((s, i) => (<div key={s} style={{ ...S.stepDot, ...(i <= step ? S.stepDotActive : {}) }}>{i + 1}</div>))}</div>
      </div>
      <h2 style={S.wizardTitle}>{steps[step]}</h2>

      <div key={step} className="oc-view-fade">
      {step === 0 && (
        <div style={S.catGrid}>
          {CATEGORIES.map((c) => {
            const Icon = c.icon; const sel = category === c.id;
            return (
              <button key={c.id} onClick={() => setCategory(c.id)} style={{ ...S.catBtn, ...(sel ? S.catBtnActive : {}) }}>
                <Icon size={20} color={sel ? "#fff" : "#1E88A8"} /><span>{t(`category.${c.id}`)}</span>
              </button>
            );
          })}
        </div>
      )}

      {step === 1 && (
        <div style={S.uploadZone}>
          <div style={S.proofRow}>
            {photoPreviews.map((src, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img src={src} alt="" style={S.proofImg} />
                <button style={{ ...S.removePhotoBtn, width: 20, height: 20, top: -6, right: -6 }} onClick={() => removePhoto(i)}><X size={11} /></button>
              </div>
            ))}
            {photoPreviews.length < MAX_PHOTOS && (
              <button style={S.uploadMini} onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="spin" size={16} /> : <Camera size={16} />}
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFile} />
          <p style={S.fine}>{t("wizard.photoHint", { max: MAX_PHOTOS })}</p>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={S.row2} className="oc-row2">
            <div style={S.field}>
              <label style={S.label}>{t("wizard.fields.region")}</label>
              <select style={S.input} value={region} onChange={(e) => changeRegion(e.target.value)}>
                {REGION_NAMES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={S.field}>
              <label style={S.label}>{t("wizard.fields.district")}</label>
              <select style={S.input} value={district} onChange={(e) => setDistrict(e.target.value)}>
                {regionDistricts.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div style={S.field}>
            <label style={S.label}>{t("wizard.fields.address")}</label>
            <input style={S.input} placeholder={t("wizard.placeholders.address")} value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <button style={S.secondaryBtn} onClick={useMyLocation} disabled={locating}>
            {locating ? <Loader2 className="spin" size={15} /> : <MapPin size={15} />}
            {locating ? t("wizard.locating") : t("wizard.useMyLocation")}
          </button>
          {locateError && <div style={{ ...S.fine, color: "#A33A3A" }}>{locateError}</div>}
          <p style={S.fine}>{t("wizard.mapHint")}</p>
          <div style={S.pickGrid}>
            <MapContainer key={district} center={mapCenter} zoom={13} style={{ width: "100%", height: "100%" }} scrollWheelZoom>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker onPick={pickOnMap} />
              {coords && <Marker position={[coords.lat, coords.lng]} icon={pinIcon("#B2402A")} />}
            </MapContainer>
          </div>
          {coords && <div style={S.coordConfirm}><Check size={14} color="#2E9A5C" /> {coords.gps ? t("wizard.locationConfirmedGps") : t("wizard.locationConfirmedMap")}</div>}
        </div>
      )}

      {step === 3 && (
        <div>
          {similar.length > 0 ? (
            <>
              <p style={S.fine}>{t("wizard.similarIntro", { district, count: similar.length })}</p>
              <div style={S.reportGrid}>
                {similar.map((r) => (
                  <div key={r.id} style={S.similarCard}>
                    <ReportCard report={r} />
                    <button style={S.primaryBtn} onClick={() => onVoteInstead(r.id)}><ThumbsUp size={14} /> {t("wizard.voteInsteadButton")}</button>
                  </div>
                ))}
              </div>
              <button style={{ ...S.secondaryBtn, marginTop: 14 }} onClick={() => setStep(4)}>
                {t("wizard.continueAnyway")}
              </button>
            </>
          ) : (
            <EmptyState icon={CheckCircle2} text={t("wizard.noSimilarFound")} />
          )}
        </div>
      )}

      {step === 4 && (
        <div>
          <div style={S.field}><label style={S.label}>{t("wizard.fields.title")}</label>
            <input style={S.input} placeholder={t("wizard.placeholders.title")} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={90} /></div>
          <div style={S.field}><label style={S.label}>{t("wizard.fields.description")}</label>
            <textarea style={{ ...S.input, height: 110, resize: "vertical" }} placeholder={t("wizard.placeholders.description")} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        </div>
      )}

      {step === 5 && (
        <div style={S.reviewCard}>
          {photoPreviews.length > 0 && (
            <div style={S.proofRow}>{photoPreviews.map((src, i) => <img key={i} src={src} style={S.proofImg} alt="" />)}</div>
          )}
          <div style={S.reviewRow}><b>{t("wizard.review.category")}</b> {t(`category.${category}`)}</div>
          <div style={S.reviewRow}><b>{t("wizard.review.title")}</b> {title}</div>
          {description && <div style={S.reviewRow}><b>{t("wizard.review.description")}</b> {description}</div>}
          <div style={S.reviewRow}><b>{t("wizard.review.location")}</b> {district}, {region}{address ? `, ${address}` : ""}</div>
          {assignedOrgName && <div style={S.reviewRow}><b>{t("wizard.review.autoAssigned")}</b> {assignedOrgName}</div>}
          <div style={S.reviewRow}><b>{t("wizard.review.date")}</b> {fmtDate(now(), i18n.language)}</div>
          {error && <div style={{ ...S.reviewRow, color: "#A33A3A" }}>{error}</div>}
        </div>
      )}
      </div>

      <div style={S.wizardFooter}>
        {step > 0 && <button style={S.secondaryBtn} onClick={goBack}><ChevronLeft size={15} /> {t("common.back")}</button>}
        <div style={{ flex: 1 }} />
        {step < 5 && <button style={S.primaryBtn} disabled={!canNext} onClick={goNext}>{t("common.next")} <ChevronRight size={15} /></button>}
        {step === 5 && <button style={S.primaryBtn} disabled={submitting} onClick={submit}>
          {submitting ? <Loader2 className="spin" size={15} /> : <Check size={15} />} {t("common.submit")}
        </button>}
      </div>
    </div>
  );
}
