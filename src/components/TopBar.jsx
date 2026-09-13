import { MapPin, User, Building2, ShieldCheck, Bell, LogOut } from "lucide-react";
import { S } from "../styles";

function PortalTab({ active, onClick, icon, label }) {
  return (<button onClick={onClick} style={{ ...S.portalTab, ...(active ? S.portalTabActive : {}) }}>{icon}<span>{label}</span></button>);
}

export function TopBar({ profile, portal, setPortal, setView, notifCount, onSignOut }) {
  return (
    <div style={S.topbar} className="oc-topbar">
      <div style={S.topbarLeft} onClick={() => { setPortal("citizen"); setView("home"); }}>
        <div style={S.brandMarkSm}><MapPin size={16} color="#fff" /></div>
        <span style={S.topbarBrand}>OpenCity</span>
      </div>
      <div style={S.portalSwitch}>
        <PortalTab active={portal === "citizen"} onClick={() => setPortal("citizen")} icon={<User size={14} />} label="Fuqaro" />
        {profile.role !== "citizen" && (
          <PortalTab active={portal === "organization"} onClick={() => setPortal("organization")} icon={<Building2 size={14} />} label="Bo'lim" />
        )}
        {profile.role === "admin" && (
          <PortalTab active={portal === "admin"} onClick={() => setPortal("admin")} icon={<ShieldCheck size={14} />} label="Admin" />
        )}
      </div>
      <div style={S.topbarRight}>
        <button style={S.iconBtn} onClick={() => { setPortal("citizen"); setView("notifications"); }}>
          <Bell size={17} />
          {notifCount > 0 && <span style={S.badge}>{notifCount}</span>}
        </button>
        <div style={S.avatarChip} onClick={() => { setPortal("citizen"); setView("profile"); }}>
          <div style={S.avatar}>{profile.name.slice(0, 1).toUpperCase()}</div>
          <span style={S.avatarName} className="oc-avatar-name">{profile.name}</span>
        </div>
        <button style={S.iconBtn} onClick={onSignOut} title="Chiqish"><LogOut size={16} /></button>
      </div>
    </div>
  );
}
