import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "./i18n";
import { useAuth, TEMP_SKIP_GOOGLE_AUTH } from "./hooks/useAuth";
import { fetchMyProfile, updateMyProfile } from "./lib/api/profiles";
import { fetchReports, subscribeToReports } from "./lib/api/reports";
import { fetchOrganizations, fetchOrgById } from "./lib/api/organizations";
import { fetchNotifications, subscribeToNotifications, markNotificationRead } from "./lib/api/notifications";
import { fetchAnnouncements } from "./lib/api/announcements";
import { nearestLocation } from "./constants";
import { GlobalStyle, S } from "./styles";
import { SignInScreen } from "./components/SignInScreen";
import { InAppBrowserNotice, detectInAppBrowser } from "./components/InAppBrowserNotice";
import { AssistantChat } from "./components/AssistantChat";
import { TopBar } from "./components/TopBar";
import { CitizenPortal } from "./components/CitizenPortal";
import { OrganizationPortal } from "./components/OrganizationPortal";
import { AdminPortal } from "./components/AdminPortal";

// Google orqali ro'yxatdan o'tgan zahoti `handle_new_user` trigger'i profil qatorini yaratadi,
// lekin bu bir zumlik kechikish qilishi mumkin — shu sabab bir necha marta qayta urinamiz.
async function fetchMyProfileWithRetry(userId, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchMyProfile(userId);
    } catch (e) {
      if (i === attempts - 1) throw e;
      await new Promise((r) => setTimeout(r, 400));
    }
  }
}

export default function App() {
  const { t } = useTranslation();
  const [inAppBrowser] = useState(() => detectInAppBrowser());
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  // Supabase har token yangilanishida (~1 soatda) yangi `user` obyektini beradi — effektlar
  // obyektga emas, id'ga bog'lanadi, aks holda ilova har soatda qaytadan yuklanib, ochiq sahifa yo'qoladi.
  const userId = user?.id ?? null;
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [myOrg, setMyOrg] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [portal, setPortal] = useState("citizen");
  const [view, setView] = useState("map");
  const [toast, setToast] = useState(null);
  const [booting, setBooting] = useState(true);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3200); };

  const refreshReports = useCallback(async () => setReports(await fetchReports()), []);
  const refreshOrgs = useCallback(async () => setOrgs(await fetchOrganizations()), []);
  const refreshAnnouncements = useCallback(async () => setAnnouncements(await fetchAnnouncements()), []);
  const refreshNotifications = useCallback(async () => {
    if (!userId) return;
    setNotifications(await fetchNotifications(userId));
  }, [userId]);
  const markOneNotificationRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try { await markNotificationRead(id); } catch { /* keyingi refreshda tuzatiladi */ }
  }, []);

  useEffect(() => {
    if (!userId) { setProfile(null); setBooting(false); return; }
    let cancelled = false;
    setBooting(true);
    (async () => {
      try {
        // Har birini alohida .catch bilan o'raymiz — biror yangi jadval/migratsiya hali
        // qo'llanilmagan bo'lsa ham, butun ilova cheksiz "yuklanmoqda"da qolib ketmasin.
        const [p, rpts, orgList, notifs, announces] = await Promise.all([
          fetchMyProfileWithRetry(userId),
          fetchReports().catch(() => []),
          fetchOrganizations().catch(() => []),
          fetchNotifications(userId).catch(() => []),
          fetchAnnouncements().catch(() => []),
        ]);
        if (cancelled) return;
        setProfile(p);
        if (p.language) changeLanguage(p.language);
        setReports(rpts);
        setOrgs(orgList);
        setMyOrg(await fetchOrgById(p.org_id).catch(() => null));
        setNotifications(notifs);
        setAnnouncements(announces);
      } catch (e) {
        // Sessiya bor, lekin profil o'qilmadi (masalan, foydalanuvchi bazadan o'chirilgan) —
        // eskirgan sessiyani tozalaymiz, shunda kirish ekrani qayta ishlaydi va qotib qolmaydi.
        console.error("Profilni yuklab bo'lmadi:", e);
        if (!cancelled) await signOut().catch(() => {});
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const unsubscribeReports = subscribeToReports(() => refreshReports().catch(() => {}));
    const unsubscribeNotifs = subscribeToNotifications(userId, (n) => setNotifications((prev) => [n, ...prev]));
    return () => { unsubscribeReports(); unsubscribeNotifs(); };
  }, [userId, refreshReports]);

  // Fuqaroning tumanini brauzer GPS'i orqali aniqlash — profilga bir marta yoziladi.
  useEffect(() => {
    if (!profile || profile.detected_district || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const loc = nearestLocation(latitude, longitude);
        try {
          const updated = await updateMyProfile(profile.id, {
            detected_region: loc?.region || null, detected_district: loc?.district || null,
            home_lat: latitude, home_lng: longitude,
          });
          setProfile(updated);
        } catch (e) {
          console.error(e);
        }
      },
      (err) => {
        const msg = err.code === 1 ? t("app.geo.permissionDenied") : t("app.geo.unavailable");
        showToast(msg);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  // Tugma bosilganda ishlaydigan async amallar (status o'zgartirish, tayinlash, o'chirish va h.k.)
  // xato bersa, ular jim yutilib ketmasin — umumiy ushlagich foydalanuvchiga toast ko'rsatadi.
  useEffect(() => {
    const onRejection = (event) => {
      const err = event.reason;
      console.error(err);
      const msg = err?.message;
      setToast(msg ? `${t("common.error")} (${msg})` : t("common.error"));
      setTimeout(() => setToast(null), 4500);
    };
    window.addEventListener("unhandledrejection", onRejection);
    return () => window.removeEventListener("unhandledrejection", onRejection);
  }, [t]);

  const handleSignOut = async () => {
    await signOut();
    setPortal("citizen");
    setView("home");
  };

  if (authLoading || (user && (booting || !profile))) {
    return (
      <div style={S.page} className="oc-aurora">
        <GlobalStyle />
        <div style={{ ...S.bootWrap, flexDirection: "column", gap: 14 }}>
          <img src="/icon-192.png" alt="" style={{ width: 52, height: 52, borderRadius: 15, boxShadow: "0 6px 18px rgba(23,58,102,0.35)" }} className="oc-float" />
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#5B6772", fontSize: 13, fontWeight: 600 }}>
            <Loader2 className="spin" size={15} color="#1C8B80" /> {t("common.loading")}
          </div>
        </div>
      </div>
    );
  }
  if ((!user || !profile) && inAppBrowser && !TEMP_SKIP_GOOGLE_AUTH) {
    return (<div style={S.page} className="oc-aurora"><GlobalStyle /><InAppBrowserNotice source={inAppBrowser} /></div>);
  }
  if (!user || !profile) {
    return (<div style={S.page} className="oc-aurora"><GlobalStyle /><SignInScreen onSignIn={signInWithGoogle} /></div>);
  }

  return (
    <div style={S.page} className="oc-aurora">
      <GlobalStyle />
      <TopBar profile={profile} portal={portal} setPortal={setPortal} setView={setView}
        notifCount={notifications.filter((n) => !n.read).length} onSignOut={handleSignOut} />
      <div style={S.body} className="oc-body-content">
      <div key={portal} className="oc-view-fade">
        {portal === "citizen" && (
          <CitizenPortal
            profile={profile} reports={reports} refreshReports={refreshReports}
            myOrg={myOrg} orgs={orgs} notifications={notifications} refreshNotifications={refreshNotifications}
            markOneNotificationRead={markOneNotificationRead}
            announcements={announcements}
            view={view} setView={setView} showToast={showToast}
          />
        )}
        {portal === "organization" && profile.role !== "citizen" && (
          <OrganizationPortal profile={profile} myOrg={myOrg} reports={reports} refreshReports={refreshReports}
            announcements={announcements} refreshAnnouncements={refreshAnnouncements} showToast={showToast} />
        )}
        {portal === "admin" && profile.role === "admin" && (
          <AdminPortal reports={reports} refreshReports={refreshReports} orgs={orgs} refreshOrgs={refreshOrgs} showToast={showToast} />
        )}
      </div>
      </div>
      {toast && <div style={S.toast} className="oc-toast">{toast}</div>}
      <AssistantChat />
    </div>
  );
}
