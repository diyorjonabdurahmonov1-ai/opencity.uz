import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "./i18n";
import { useAuth } from "./hooks/useAuth";
import { fetchMyProfile, updateMyProfile } from "./lib/api/profiles";
import { fetchReports, subscribeToReports } from "./lib/api/reports";
import { fetchOrganizations, fetchOrgById } from "./lib/api/organizations";
import { fetchNotifications, subscribeToNotifications, markNotificationRead } from "./lib/api/notifications";
import { fetchAnnouncements } from "./lib/api/announcements";
import { nearestLocation } from "./constants";
import { GlobalStyle, S } from "./styles";
import { SignInScreen } from "./components/SignInScreen";
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
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [myOrg, setMyOrg] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [portal, setPortal] = useState("citizen");
  const [view, setView] = useState("home");
  const [toast, setToast] = useState(null);
  const [booting, setBooting] = useState(true);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3200); };

  const refreshReports = useCallback(async () => setReports(await fetchReports()), []);
  const refreshOrgs = useCallback(async () => setOrgs(await fetchOrganizations()), []);
  const refreshAnnouncements = useCallback(async () => setAnnouncements(await fetchAnnouncements()), []);
  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    setNotifications(await fetchNotifications(user.id));
  }, [user]);
  const markOneNotificationRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try { await markNotificationRead(id); } catch { /* keyingi refreshda tuzatiladi */ }
  }, []);

  useEffect(() => {
    if (!user) { setProfile(null); setBooting(false); return; }
    let cancelled = false;
    setBooting(true);
    (async () => {
      try {
        // Har birini alohida .catch bilan o'raymiz — biror yangi jadval/migratsiya hali
        // qo'llanilmagan bo'lsa ham, butun ilova cheksiz "yuklanmoqda"da qolib ketmasin.
        const [p, rpts, orgList, notifs, announces] = await Promise.all([
          fetchMyProfileWithRetry(user.id),
          fetchReports().catch(() => []),
          fetchOrganizations().catch(() => []),
          fetchNotifications(user.id).catch(() => []),
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
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubscribeReports = subscribeToReports(() => refreshReports());
    const unsubscribeNotifs = subscribeToNotifications(user.id, (n) => setNotifications((prev) => [n, ...prev]));
    return () => { unsubscribeReports(); unsubscribeNotifs(); };
  }, [user, refreshReports]);

  // Fuqaroning tumanini brauzer GPS'i orqali aniqlash — profilga bir marta yoziladi.
  useEffect(() => {
    if (!profile || profile.detected_district || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const loc = nearestLocation(latitude, longitude);
        const updated = await updateMyProfile(profile.id, {
          detected_region: loc?.region || null, detected_district: loc?.district || null,
          home_lat: latitude, home_lng: longitude,
        });
        setProfile(updated);
      },
      (err) => {
        const msg = err.code === 1 ? t("app.geo.permissionDenied") : t("app.geo.unavailable");
        showToast(msg);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const handleSignOut = async () => {
    await signOut();
    setPortal("citizen");
    setView("home");
  };

  if (authLoading || (user && booting)) {
    return (<div style={S.page} className="oc-aurora"><GlobalStyle /><div style={S.bootWrap}><Loader2 className="spin" size={26} color="#1C8B80" /></div></div>);
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
      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}
