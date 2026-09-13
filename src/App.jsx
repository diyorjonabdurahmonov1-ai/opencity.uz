import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "./hooks/useAuth";
import { fetchMyProfile, updateMyProfile } from "./lib/api/profiles";
import { fetchReports, subscribeToReports } from "./lib/api/reports";
import { fetchOrganizations, fetchOrgById } from "./lib/api/organizations";
import { fetchNotifications, subscribeToNotifications } from "./lib/api/notifications";
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
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [myOrg, setMyOrg] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [portal, setPortal] = useState("citizen");
  const [view, setView] = useState("home");
  const [toast, setToast] = useState(null);
  const [booting, setBooting] = useState(true);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3200); };

  const refreshReports = useCallback(async () => setReports(await fetchReports()), []);
  const refreshOrgs = useCallback(async () => setOrgs(await fetchOrganizations()), []);
  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    setNotifications(await fetchNotifications(user.id));
  }, [user]);

  useEffect(() => {
    if (!user) { setProfile(null); setBooting(false); return; }
    let cancelled = false;
    setBooting(true);
    (async () => {
      const [p, rpts, orgList, notifs] = await Promise.all([
        fetchMyProfileWithRetry(user.id),
        fetchReports(),
        fetchOrganizations(),
        fetchNotifications(user.id),
      ]);
      if (cancelled) return;
      setProfile(p);
      setReports(rpts);
      setOrgs(orgList);
      setMyOrg(await fetchOrgById(p.org_id));
      setNotifications(notifs);
      setBooting(false);
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
        const msg = err.code === 1
          ? "Joylashuvga ruxsat berilmadi — brauzer manzil satridagi qulf belgisidan saytga joylashuv ruxsatini berishingiz mumkin."
          : "Joylashuvingizni aniqlab bo'lmadi. Hisobot yuborishda hududni qo'lda tanlashingiz mumkin.";
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
    return (<div style={S.page} className="oc-aurora"><GlobalStyle /><div style={S.bootWrap}><Loader2 className="spin" size={26} color="#1E88A8" /></div></div>);
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
            view={view} setView={setView} showToast={showToast}
          />
        )}
        {portal === "organization" && profile.role !== "citizen" && (
          <OrganizationPortal profile={profile} myOrg={myOrg} reports={reports} refreshReports={refreshReports} showToast={showToast} />
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
