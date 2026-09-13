import { User, Building2, ShieldCheck, Bell, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { S } from "../styles";
import { LanguageSwitcher } from "./LanguageSwitcher";

function PortalTab({ active, onClick, icon, label }) {
  return (<button onClick={onClick} style={{ ...S.portalTab, ...(active ? S.portalTabActive : {}) }}>{icon}<span>{label}</span></button>);
}

export function TopBar({ profile, portal, setPortal, setView, notifCount, onSignOut }) {
  const { t } = useTranslation();
  return (
    <div style={S.topbar} className="oc-topbar">
      <div style={S.topbarLeft} onClick={() => { setPortal("citizen"); setView("home"); }}>
        <img src="/brand-mark.png" alt="OpenCity" style={S.brandMarkSm} />
        <span style={S.topbarBrand}>OpenCity</span>
      </div>
      <div style={S.portalSwitch}>
        <PortalTab active={portal === "citizen"} onClick={() => setPortal("citizen")} icon={<User size={14} />} label={t("topbar.tabCitizen")} />
        {profile.role !== "citizen" && (
          <PortalTab active={portal === "organization"} onClick={() => setPortal("organization")} icon={<Building2 size={14} />} label={t("topbar.tabOrg")} />
        )}
        {profile.role === "admin" && (
          <PortalTab active={portal === "admin"} onClick={() => setPortal("admin")} icon={<ShieldCheck size={14} />} label={t("topbar.tabAdmin")} />
        )}
      </div>
      <div style={S.topbarRight}>
        <LanguageSwitcher profile={profile} compact />
        <button style={S.iconBtn} onClick={() => { setPortal("citizen"); setView("notifications"); }}>
          <Bell size={17} />
          {notifCount > 0 && <span style={S.badge}>{notifCount}</span>}
        </button>
        <div style={S.avatarChip} onClick={() => { setPortal("citizen"); setView("profile"); }}>
          <div style={S.avatar}>{profile.name.slice(0, 1).toUpperCase()}</div>
          <span style={S.avatarName} className="oc-avatar-name">{profile.name}</span>
        </div>
        <button style={S.iconBtn} onClick={onSignOut} title={t("topbar.signOut")}><LogOut size={16} /></button>
      </div>
    </div>
  );
}
