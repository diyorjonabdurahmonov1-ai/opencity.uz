import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Send, Loader2, Sparkles } from "lucide-react";
import { S } from "../styles";
import { askAssistant } from "../lib/api/ai";

const FAB = {
  position: "fixed", bottom: 20, right: 20, zIndex: 60, display: "flex", alignItems: "center", gap: 9,
  border: "none", borderRadius: 30, padding: "6px 16px 6px 6px",
  background: "linear-gradient(135deg, #173A66 0%, #1C8B80 100%)", color: "#fff",
  cursor: "pointer", boxShadow: "0 6px 20px rgba(23,58,102,0.4)", fontSize: 13.5, fontWeight: 700,
};
const FAB_AVATAR = {
  position: "relative", width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
  background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible",
};
const FAB_BADGE = {
  position: "absolute", bottom: -3, right: -3, width: 16, height: 16, borderRadius: "50%",
  background: "#B6903F", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff",
};
const PANEL = {
  position: "fixed", bottom: 84, right: 20, zIndex: 60, width: 320, maxWidth: "calc(100vw - 32px)",
  height: 420, maxHeight: "calc(100vh - 120px)", display: "flex", flexDirection: "column",
  borderRadius: 18, overflow: "hidden", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 20px 50px rgba(15,42,67,0.28)",
};

export function AssistantChat() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    const reply = await askAssistant(next, i18n.language);
    setMessages((prev) => [...prev, { role: "assistant", content: reply || t("assistant.error") }]);
    setSending(false);
  };

  return (
    <>
      {open && (
        <div style={PANEL} className="oc-signin-card-in">
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderBottom: "1px solid #E4EAEE", background: "rgba(255,255,255,0.5)" }}>
            <Sparkles size={16} color="#1C8B80" />
            <div style={{ ...S.brandName, fontSize: 14 }}>{t("assistant.title")}</div>
            <button style={{ ...S.iconBtn, marginLeft: "auto", width: 26, height: 26 }} onClick={() => setOpen(false)}><X size={14} /></button>
          </div>
          <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.length === 0 && (
              <div style={{ ...S.fine, margin: 0 }}>{t("assistant.welcome")}</div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "88%", fontSize: 13, lineHeight: 1.45, padding: "8px 12px", borderRadius: 12,
                background: m.role === "user" ? "linear-gradient(135deg, #173A66 0%, #1C8B80 100%)" : "#F0F4F6",
                color: m.role === "user" ? "#fff" : "#16202B",
              }}>
                {m.content}
              </div>
            ))}
            {sending && (
              <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, ...S.fine, margin: 0 }}>
                <Loader2 className="spin" size={13} /> {t("assistant.thinking")}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, padding: 10, borderTop: "1px solid #E4EAEE" }}>
            <input
              style={{ ...S.input, flex: 1, padding: "8px 10px", fontSize: 13 }}
              value={input}
              placeholder={t("assistant.placeholder")}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            />
            <button style={{ ...S.iconBtn, background: "#173A66", color: "#fff", border: "none" }} onClick={send} disabled={sending || !input.trim()}>
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
      <button style={FAB} onClick={() => setOpen((o) => !o)} title={t("assistant.openLabel")}>
        <span style={FAB_AVATAR}>
          {open ? <X size={18} color="#173A66" /> : <img src="/icon-192.png" alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />}
          {!open && <span style={FAB_BADGE}><Sparkles size={9} color="#fff" /></span>}
        </span>
        {t("assistant.fabLabel")}
      </button>
    </>
  );
}
