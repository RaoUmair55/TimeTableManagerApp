import { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DEFAULT_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

const PALETTE = [
  { bg: "#F97316", light: "rgba(249,115,22,0.14)", border: "rgba(249,115,22,0.4)", text: "#fff" },
  { bg: "#3B82F6", light: "rgba(59,130,246,0.14)", border: "rgba(59,130,246,0.4)", text: "#fff" },
  { bg: "#10B981", light: "rgba(16,185,129,0.14)", border: "rgba(16,185,129,0.4)", text: "#fff" },
  { bg: "#F59E0B", light: "rgba(245,158,11,0.14)", border: "rgba(245,158,11,0.4)", text: "#1a0e00" },
  { bg: "#EC4899", light: "rgba(236,72,153,0.14)", border: "rgba(236,72,153,0.4)", text: "#fff" },
];

function getColor(label, allSems) {
  const i = allSems.indexOf(label);
  return PALETTE[Math.max(i, 0) % PALETTE.length];
}
function toMin(t) {
  if (!t) return 0;
  const s = t.includes(":") ? t : t + ":00";
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}
function normalizeTime(t) {
  if (!t) return "08:00";
  let str = t.trim().toUpperCase();
  let isPM = str.includes("PM");
  let isAM = str.includes("AM");
  str = str.replace(/(AM|PM)/g, "").trim();
  // handle range like "8:00-9:00", take only start time
  if (str.includes("-")) str = str.split("-")[0].trim();
  const s = str.includes(":") ? str : str + ":00";
  const [hStr, mStr] = s.split(":");
  let h = parseInt(hStr, 10) || 0;
  let m = parseInt(mStr, 10) || 0;

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;

  // Heuristic: 0-7 are clearly wrong for university classes — assume PM
  if (!isAM && !isPM && h >= 0 && h < 8) h += 12;

  // Clamp to visible grid range
  if (h < 8) h = 8;

  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}
function nowMin() { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); }
function todayIdx() { const d = new Date().getDay(); return d === 0 ? -1 : d - 1; }
function fmtLeft(m) {
  if (m <= 0) return "ending now";
  return m < 60 ? m + "m left" : Math.floor(m / 60) + "h " + (m % 60) + "m left";
}
function getStatus(c) {
  const di = DAYS.indexOf(c.day), ci = todayIdx(), nm = nowMin();
  const s = toMin(c.time), e = s + c.duration * 60;
  if (ci === -1 || di !== ci) return "later";
  if (nm >= s && nm < e) return "ongoing";
  if (nm < s && s - nm <= 60) return "soon";
  if (nm >= e) return "done";
  return "today";
}

const SEED = [
  { id: 1, name: "Data Structures", code: "CS301", room: "B-204", day: "Mon", time: "09:00", duration: 1.5, semester: "6th Sem", instructor: "Dr. Ahmed", active: true },
  { id: 2, name: "Operating Systems", code: "CS302", room: "A-101", day: "Mon", time: "11:00", duration: 1.5, semester: "6th Sem", instructor: "Dr. Sara", active: true },
  { id: 3, name: "Database Systems", code: "CS303", room: "Lab-3", day: "Tue", time: "10:00", duration: 2, semester: "6th Sem", instructor: "Prof. Khalid", active: true },
  { id: 4, name: "Software Engg.", code: "CS304", room: "B-301", day: "Wed", time: "14:00", duration: 1.5, semester: "6th Sem", instructor: "Dr. Ahmed", active: true },
  { id: 5, name: "Computer Networks", code: "CS305", room: "A-203", day: "Thu", time: "10:00", duration: 1.5, semester: "6th Sem", instructor: "Dr. Sara", active: true },
  { id: 6, name: "Linear Algebra", code: "MT201", room: "C-305", day: "Tue", time: "08:00", duration: 1.5, semester: "4th Sem", instructor: "Dr. Fatima", active: true },
  { id: 7, name: "Physics II", code: "PH202", room: "D-102", day: "Wed", time: "09:00", duration: 1.5, semester: "4th Sem", instructor: "Prof. Ali", active: true },
  { id: 8, name: "Calculus III", code: "MT203", room: "C-201", day: "Fri", time: "11:00", duration: 1.5, semester: "4th Sem", instructor: "Dr. Fatima", active: true },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0f1117;--bg2:#161b27;--bg3:#1e2535;
  --border:rgba(255,255,255,0.08);--border2:rgba(255,255,255,0.14);
  --text:#f1f5ff;--text2:#8b9ab5;--text3:#4d5f7a;
  --accent:#F97316;--accent2:#fb923c;
  --r:14px;--rs:9px;
}
body{background:var(--bg);font-family:'Plus Jakarta Sans',sans-serif;color:var(--text)}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);transition:border-color .2s,box-shadow .2s}
.card:hover{border-color:var(--border2);box-shadow:0 2px 16px rgba(0,0,0,0.3)}
.pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.02em}
.inp{background:var(--bg3);border:1.5px solid var(--border);border-radius:var(--rs);padding:11px 14px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;width:100%;outline:none;transition:border-color .2s,box-shadow .2s}
.inp:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(249,115,22,0.15)}
.inp::placeholder{color:var(--text3)}
.sel{background:var(--bg3);border:1.5px solid var(--border);border-radius:var(--rs);padding:11px 14px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;width:100%;outline:none;cursor:pointer}
option{background:#1e2535}
.btnp{background:var(--accent);color:#fff;border:none;border-radius:var(--rs);padding:11px 22px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s}
.btnp:hover{background:var(--accent2);transform:translateY(-1px);box-shadow:0 4px 16px rgba(249,115,22,0.35)}
.btnp:disabled{opacity:.35;cursor:not-allowed;transform:none;box-shadow:none}
.btng{background:var(--bg3);color:var(--text2);border:1.5px solid var(--border);border-radius:var(--rs);padding:11px 22px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}
.btng:hover{border-color:var(--border2);color:var(--text)}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(12px);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px}
.modal{background:var(--bg2);border:1.5px solid var(--border2);border-radius:20px;padding:28px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,0.6)}
.nav-btn{padding:9px 16px;border-radius:10px;font-size:13px;font-weight:600;transition:all .2s;cursor:pointer;color:var(--text2);border:1.5px solid transparent;background:none;font-family:'Plus Jakarta Sans',sans-serif}
.nav-btn:hover{color:var(--text);background:var(--bg3)}
.nav-btn.act{color:var(--accent);background:rgba(249,115,22,0.1);border-color:rgba(249,115,22,0.3)}
.tab-btn{padding:8px 14px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;border:1.5px solid var(--border);background:var(--bg3);font-family:'Plus Jakarta Sans',sans-serif;color:var(--text2)}
.tab-btn.act{background:rgba(249,115,22,0.12);border-color:rgba(249,115,22,0.4);color:var(--accent)}
.tab-btn:hover{border-color:var(--border2);color:var(--text)}
.chk{width:18px;height:18px;border-radius:5px;border:2px solid var(--border2);background:transparent;cursor:pointer;-webkit-appearance:none;appearance:none;flex-shrink:0;transition:all .15s;margin:0;position:relative}
.chk:checked{background:var(--accent);border-color:var(--accent)}
.chk:checked::after{content:'OK';font-size:0;position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800}
.ldot{width:9px;height:9px;border-radius:50%;background:#22c55e;flex-shrink:0;animation:rp 1.8s ease-out infinite}
@keyframes rp{0%{box-shadow:0 0 0 0 rgba(34,197,94,.6)}70%{box-shadow:0 0 0 9px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}
@keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fu .35s cubic-bezier(.22,1,.36,1) forwards}
@keyframes sp{to{transform:rotate(360deg)}}
.sp{animation:sp 1s linear infinite;display:inline-block}
.lbl{font-size:11px;font-weight:700;letter-spacing:.08em;color:var(--text3);text-transform:uppercase;margin-bottom:6px;display:block}
.sh{display:flex;align-items:center;gap:10px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--border)}
.sb{background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:14px 16px;flex:1}
@media(max-width:600px){
  .stat-grid-3{grid-template-columns:repeat(2,1fr)!important}
  .hero-sub-grid{grid-template-columns:1fr!important}
  .nav-btn{padding:7px 10px!important;font-size:11px!important}
  .modal{padding:18px 14px!important;border-radius:14px!important;max-height:93vh!important}
  .overlay{padding:10px!important}
}
`;

function OngoingHero({ c, allSems }) {
  const col = getColor(c.semester, allSems);
  const endM = toMin(c.time) + c.duration * 60;
  const pct = Math.min(100, Math.max(0, ((nowMin() - toMin(c.time)) / (c.duration * 60)) * 100));
  return (
    <div style={{ background: "linear-gradient(135deg," + col.light.replace("0.14", "0.22") + ",rgba(22,27,39,0.9))", border: "1.5px solid " + col.border, borderRadius: 18, marginBottom: 20, padding: 28, boxShadow: "0 8px 32px " + col.light.replace("0.14", "0.25") }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div className="ldot" />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", letterSpacing: ".08em" }}>LIVE NOW</span>
        <span style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{c.time}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 5, letterSpacing: "-.02em", lineHeight: 1.15 }}>{c.name}</div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 22, fontWeight: 500 }}>{c.code} · {c.instructor}</div>
      <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 10, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct + "%", background: col.bg, borderRadius: 10 }} />
      </div>
      <div className="hero-sub-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {[["Room", c.room], ["Ends In", fmtLeft(endM - nowMin())], ["Semester", c.semester]].map(function (pair) {
          return (
            <div key={pair[0]} className="sb">
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>{pair[0]}</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: col.bg }}>{pair[1]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TodayRow({ c, allSems }) {
  const col = getColor(c.semester, allSems);
  const st = getStatus(c);
  const done = st === "done";
  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: 16, padding: "15px 20px", opacity: done ? 0.4 : 1, position: "relative", overflow: "hidden" }}>
      <div style={{ width: 4, height: "calc(100% - 20px)", borderRadius: 4, background: col.bg, flexShrink: 0, position: "absolute", left: 0, top: 10 }} />
      <div style={{ width: 4, flexShrink: 0 }} />
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 500, color: "var(--text3)", flexShrink: 0, minWidth: 48 }}>{c.time}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, textDecoration: done ? "line-through" : "none", color: done ? "var(--text3)" : "var(--text)", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
        <div style={{ fontSize: 12, color: "var(--text3)", fontWeight: 500 }}>{c.instructor} · {c.duration}h</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: col.bg, fontFamily: "'JetBrains Mono',monospace" }}>{c.room}</div>
          <span className="pill" style={{ background: col.light, color: col.bg, border: "1px solid " + col.border, marginTop: 2, fontSize: 10 }}>{c.semester}</span>
        </div>
        {st === "ongoing" && <div className="ldot" />}
        {st === "soon" && <span className="pill" style={{ background: "rgba(234,179,8,0.15)", color: "#eab308", border: "1px solid rgba(234,179,8,0.35)", fontSize: 11, fontWeight: 700 }}>SOON</span>}
      </div>
    </div>
  );
}

function ScanSlot({ slot, onLabel, onImage, onRemove, onScan, onToggle, onAll }) {
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <label className="lbl">Semester Label</label>
        <input className="inp" placeholder="e.g. 6th Sem, 4th Sem" value={slot.semLabel} onChange={function (e) { onLabel(e.target.value); }} />
      </div>
      {!slot.file ? (
        <label style={{ display: "block", border: "2px dashed rgba(249,115,22,0.25)", borderRadius: 14, padding: 32, textAlign: "center", cursor: "pointer", marginBottom: 14, background: "rgba(249,115,22,0.03)", transition: "all .2s" }}
          onMouseEnter={function (e) { e.currentTarget.style.borderColor = "rgba(249,115,22,0.5)"; e.currentTarget.style.background = "rgba(249,115,22,0.07)"; }}
          onMouseLeave={function (e) { e.currentTarget.style.borderColor = "rgba(249,115,22,0.25)"; e.currentTarget.style.background = "rgba(249,115,22,0.03)"; }}>
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={function (e) { if (e.target.files[0]) onImage(e.target.files[0]); }} />
          <div style={{ fontSize: 32, marginBottom: 10 }}>📷</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Upload Timetable Photo</div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>PNG · JPG · WEBP</div>
        </label>
      ) : (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: "#22c55e", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>✓ {slot.file.name}</div>
            <button onClick={onRemove} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 600, marginLeft: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Remove</button>
          </div>
          <img src={URL.createObjectURL(slot.file)} alt="preview" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 10, border: "1.5px solid var(--border)" }} />
        </div>
      )}
      {slot.error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1.5px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: 13, marginBottom: 14, fontSize: 13, color: "#fca5a5", fontWeight: 500 }}>{slot.error}</div>}
      {slot.file && slot.courses.length === 0 && !slot.loading && (
        <button className="btnp" style={{ width: "100%", marginBottom: 14 }} onClick={onScan} disabled={!slot.semLabel.trim()}>
          {slot.semLabel.trim() ? "Scan with AI" : "Enter semester label first"}
        </button>
      )}
      {slot.loading && (
        <div style={{ textAlign: "center", padding: "20px 0", marginBottom: 14, background: "rgba(249,115,22,0.05)", borderRadius: 12, border: "1px solid rgba(249,115,22,0.15)" }}>
          <span className="sp" style={{ fontSize: 20, color: "var(--accent)" }}>◌</span>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginTop: 8 }}>Reading your timetable...</div>
        </div>
      )}
      {slot.courses.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              <span style={{ color: "var(--accent)" }}>{slot.courses.filter(function (c) { return c._checked; }).length}</span>/{slot.courses.length} selected
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={function () { onAll(true); }} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>All</button>
              <button onClick={function () { onAll(false); }} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>None</button>
            </div>
          </div>
          <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, paddingRight: 4 }}>
            {slot.courses.map(function (c, i) {
              return (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: c._checked ? "rgba(249,115,22,0.06)" : "var(--bg3)", border: "1.5px solid " + (c._checked ? "rgba(249,115,22,0.3)" : "var(--border)"), borderRadius: 10, padding: "11px 14px", cursor: "pointer", transition: "all .15s" }}>
                  <input type="checkbox" className="chk" checked={!!c._checked} onChange={function () { onToggle(i); }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{c.name} <span style={{ fontWeight: 500, color: "var(--text3)", fontSize: 12 }}>{c.code}</span></div>
                    <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2, fontWeight: 500 }}>{c.day} · {c.time} · {c.room} · {c.duration}h</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClassNav() {
  var [courses, setCourses] = useState(function () {
    try { var s = localStorage.getItem("cn_courses"); return s ? JSON.parse(s) : SEED; } catch (e) { return SEED; }
  });
  var [view, setView] = useState("dashboard");
  var [semesters, setSemesters] = useState(function () {
    try { var s = localStorage.getItem("cn_semesters"); return s ? JSON.parse(s) : ["6th Sem", "4th Sem"]; } catch (e) { return ["6th Sem", "4th Sem"]; }
  });
  var [scanOpen, setScanOpen] = useState(false);
  var [slots, setSlots] = useState([]);
  var [activeSlot, setActiveSlot] = useState(0);
  var [addOpen, setAddOpen] = useState(false);
  var [clashOpen, setClashOpen] = useState(false);
  var [newC, setNewC] = useState({ name: "", code: "", room: "", day: "Mon", time: "09:00", duration: 1.5, semester: "6th Sem", instructor: "" });
  var [searchQ, setSearchQ] = useState("");
  var [notifPerm, setNotifPerm] = useState("default");
  var [notifiedSet, setNotifiedSet] = useState([]);
  var [toast, setToast] = useState(null);
  var [editOpen, setEditOpen] = useState(false);
  var [editC, setEditC] = useState(null);

  useEffect(function () {
    if (typeof Notification !== "undefined") {
      setNotifPerm(Notification.permission);
    }
  }, []);

  // Persist courses + semesters to localStorage on every change
  useEffect(function () {
    try { localStorage.setItem("cn_courses", JSON.stringify(courses)); } catch (e) { }
  }, [courses]);

  useEffect(function () {
    try { localStorage.setItem("cn_semesters", JSON.stringify(semesters)); } catch (e) { }
  }, [semesters]);

  var allSems = Array.from(new Set(courses.map(function (c) { return c.semester; })));
  var active = courses.filter(function (c) { return c.active; });
  var todayCls = active.filter(function (c) { return DAYS.indexOf(c.day) === todayIdx(); }).sort(function (a, b) { return toMin(a.time) - toMin(b.time); });
  var ongoingC = active.find(function (c) { return getStatus(c) === "ongoing"; }) || null;
  // Dynamic grid slots — computed from actual course start times
  var TIME_SLOTS = active.length > 0
    ? Array.from(new Set(active.map(function (c) { return c.time; }))).sort(function (a, b) { return toMin(a) - toMin(b); })
    : DEFAULT_SLOTS;

  function getClashes() {
    var res = [];
    for (var i = 0; i < active.length; i++) {
      for (var j = i + 1; j < active.length; j++) {
        var a = active[i], b = active[j];
        if (a.day !== b.day) continue;
        var as = toMin(a.time), ae = as + a.duration * 60, bs = toMin(b.time), be = bs + b.duration * 60;
        var overlapMins = Math.min(ae, be) - Math.max(as, bs);
        if (overlapMins >= 30) res.push([a, b]);
      }
    }
    return res;
  }
  var clashes = getClashes();

  function showToast(msg, type) {
    setToast({ msg: msg, type: type || "ok" });
    setTimeout(function () { setToast(null); }, 3500);
  }

  async function enableNotifs() {
    if (typeof Notification === "undefined") return;
    var p = await Notification.requestPermission();
    setNotifPerm(p);
    if (p === "granted") showToast("Reminders enabled! 5 min heads-up before each class.", "ok");
    else showToast("Notifications blocked. Check browser settings.", "err");
  }

  useEffect(function () {
    if (notifPerm !== "granted") return;
    function check() {
      var nm = nowMin(), ci = todayIdx();
      if (ci === -1) return;
      active.forEach(function (c) {
        if (DAYS.indexOf(c.day) !== ci) return;
        var diff = toMin(c.time) - nm;
        if (diff > 0 && diff <= 5) {
          var key = c.id + "-" + c.day + "-" + c.time;
          if (notifiedSet.indexOf(key) === -1) {
            try { new Notification("ClassNav: " + c.name + " in " + diff + " min - Room " + c.room); } catch (e) { }
            setNotifiedSet(function (prev) { return prev.concat([key]); });
          }
        }
      });
    }
    check();
    var t = setInterval(check, 30000);
    return function () { clearInterval(t); };
  }, [notifPerm, active.length, notifiedSet.length]);

  function toggleCourse(id) { setCourses(function (p) { return p.map(function (c) { return c.id === id ? Object.assign({}, c, { active: !c.active }) : c; }); }); }
  function deleteCourse(id) { setCourses(function (p) { return p.filter(function (c) { return c.id !== id; }); }); }

  function openEdit(course) {
    setEditC(Object.assign({}, course));
    setEditOpen(true);
  }

  function saveEdit() {
    if (!editC) return;
    var sem = editC.semester === "__new__" ? (editC._customSem || "New Sem") : editC.semester;
    var updated = Object.assign({}, editC, { semester: sem, time: normalizeTime(editC.time) });
    delete updated._customSem;
    setCourses(function (p) { return p.map(function (c) { return c.id === updated.id ? updated : c; }); });
    if (semesters.indexOf(sem) === -1) setSemesters(function (p) { return p.concat([sem]); });
    setEditOpen(false);
    setEditC(null);
    showToast("Course updated!", "ok");
  }

  function resolveClash(keepId, dropId) {
    setCourses(function (p) { return p.map(function (c) { return c.id === dropId ? Object.assign({}, c, { active: false }) : c; }); });
    showToast("Clash resolved - course hidden from schedule.", "ok");
  }

  function addCourse() {
    var id = Math.max.apply(null, [0].concat(courses.map(function (c) { return c.id; }))) + 1;
    var sem = newC.semester === "__new__" ? (newC._customSem || "New Sem") : newC.semester;
    var c = Object.assign({}, newC, { semester: sem, id: id, active: true, time: normalizeTime(newC.time) });
    delete c._customSem;
    setCourses(function (p) { return p.concat([c]); });
    if (semesters.indexOf(sem) === -1) setSemesters(function (p) { return p.concat([sem]); });
    setNewC({ name: "", code: "", room: "", day: "Mon", time: "09:00", duration: 1.5, semester: semesters[0] || "6th Sem", instructor: "" });
    setAddOpen(false);
    showToast("Course added!", "ok");
  }

  function openScan() { setSlots([]); setActiveSlot(0); setScanOpen(true); }

  function addSlot() {
    var idx = slots.length;
    setSlots(function (p) { return p.concat([{ semLabel: "", file: null, base64: null, mt: "image/jpeg", courses: [], loading: false, error: null }]); });
    setActiveSlot(idx);
  }

  function updSlot(idx, patch) {
    setSlots(function (p) { return p.map(function (s, i) { return i === idx ? Object.assign({}, s, patch) : s; }); });
  }

  function handleImg(idx, file) {
    var r = new FileReader();
    r.onload = function (ev) {
      updSlot(idx, { file: file, base64: ev.target.result.split(",")[1], mt: file.type || "image/jpeg", courses: [], error: null });
    };
    r.readAsDataURL(file);
  }

  async function scanSlot(idx) {
    var s = slots[idx];
    if (!s || !s.base64 || !s.semLabel.trim()) return;
    updSlot(idx, { loading: true, error: null, courses: [] });
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY in .env");

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: s.mt,
                  data: s.base64,
                },
              },
              {
                text: "Extract all classes from this timetable for semester " + s.semLabel + ". Return ONLY a JSON array, no markdown. Each item: {name,code,room,day(Mon|Tue|Wed|Thu|Fri|Sat),time(HH:MM 24hr),duration(hours number),instructor}",
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });

      const txt = response.text;
      const parsed = JSON.parse(txt.replace(/```json|```/g, "").trim());

      if (!Array.isArray(parsed)) throw new Error("Invalid format");

      updSlot(idx, {
        loading: false, courses: parsed.map(function (c, i) {
          return Object.assign({}, c, { time: normalizeTime(c.time), semester: s.semLabel, active: true, id: Date.now() + i, _checked: true });
        })
      });
    } catch (e) {
      console.error(e);
      updSlot(idx, { loading: false, error: e.message.includes("API_KEY") ? "Missing Gemini API Key in .env file" : "Could not read timetable. Try a clearer photo." });
    }
  }

  function togglePending(si, ci) {
    setSlots(function (p) {
      return p.map(function (s, i) {
        if (i !== si) return s;
        return Object.assign({}, s, { courses: s.courses.map(function (c, j) { return j === ci ? Object.assign({}, c, { _checked: !c._checked }) : c; }) });
      });
    });
  }

  function selectAll(idx, val) {
    setSlots(function (p) {
      return p.map(function (s, i) {
        if (i !== idx) return s;
        return Object.assign({}, s, { courses: s.courses.map(function (c) { return Object.assign({}, c, { _checked: val }); }) });
      });
    });
  }

  function importAll() {
    var toAdd = [];
    slots.forEach(function (s) {
      s.courses.forEach(function (c) {
        if (c._checked) { var nc = Object.assign({}, c); delete nc._checked; toAdd.push(nc); }
      });
    });
    setCourses(function (p) { return p.concat(toAdd); });
    var newSems = Array.from(new Set(toAdd.map(function (c) { return c.semester; })));
    setSemesters(function (p) { return Array.from(new Set(p.concat(newSems))); });
    setScanOpen(false); setSlots([]); setView("timetable");
    showToast(toAdd.length + " courses imported!", "ok");
  }

  var totalSel = slots.reduce(function (n, s) { return n + s.courses.filter(function (c) { return c._checked; }).length; }, 0);
  var filtered = active.filter(function (c) {
    var q = searchQ.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.room.toLowerCase().includes(q);
  });

  function closeOnBg(fn) { return function (e) { if (e.target === e.currentTarget) fn(); }; }
  function xBtn(fn) {
    return <button onClick={fn} style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text2)", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: "6px 10px", borderRadius: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>x</button>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "'Plus Jakarta Sans',sans-serif", color: "var(--text)" }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "0 clamp(12px,3vw,24px)", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 56, position: "sticky", top: 0, background: "rgba(15,17,23,0.93)", backdropFilter: "blur(20px)", zIndex: 50, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#F97316,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, boxShadow: "0 4px 12px rgba(249,115,22,0.4)" }}>◈</div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-.03em" }}>ClassNav</span>
          {clashes.length > 0 && <span className="pill" onClick={function () { setClashOpen(true); }} style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)", fontWeight: 700, cursor: "pointer" }}>⚠ {clashes.length}</span>}
        </div>
        <nav style={{ display: "flex", gap: 2, flexWrap: "nowrap", overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
          {[["dashboard", "Now"], ["timetable", "Grid"], ["finder", "Find"], ["manage", "Manage"]].map(function (pair) {
            return <button key={pair[0]} className={"nav-btn" + (view === pair[0] ? " act" : "")} onClick={function () { setView(pair[0]); }}>{pair[1]}</button>;
          })}
        </nav>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(16px,4vw,32px) clamp(12px,4vw,20px)" }}>

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div className="fu">
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", letterSpacing: ".08em", marginBottom: 6, textTransform: "uppercase" }}>
                {todayIdx() >= 0 ? FULL_DAYS[todayIdx()] : "Weekend"} · {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
              <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1.15 }}>
                {ongoingC ? "You're in class right now." : todayCls.length > 0 ? "Here's your day." : "No classes today!"}
              </h1>
            </div>

            <div className="stat-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
              {[["Today", todayCls.length + " classes", "📅"], ["Active", active.length + " total", "📚"], ["Semesters", allSems.length + " loaded", "🎓"]].map(function (t) {
                return (
                  <div key={t[0]} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{t[2]}</span>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{t[1]}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 3, fontWeight: 600, letterSpacing: ".04em" }}>{t[0].toUpperCase()}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {ongoingC ? <OngoingHero c={ongoingC} allSems={allSems} /> : (
              <div className="card" style={{ marginBottom: 20, padding: 28, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>☕</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text2)" }}>No class in session right now</div>
                <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>Enjoy your break!</div>
              </div>
            )}

            {notifPerm === "default" && (
              <div style={{ marginBottom: 16, background: "rgba(59,130,246,0.08)", border: "1.5px solid rgba(59,130,246,0.25)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <span style={{ fontSize: 22 }}>🔔</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#93c5fd" }}>Enable Class Reminders</div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Get a notification 5 min before each class starts</div>
                </div>
                <button className="btnp" style={{ background: "#3B82F6", padding: "9px 18px", fontSize: 13 }} onClick={enableNotifs}>Enable</button>
              </div>
            )}
            {notifPerm === "granted" && (
              <div style={{ marginBottom: 16, background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <span>🔔</span>
                <span style={{ fontSize: 13, color: "#86efac", fontWeight: 600 }}>Reminders active — notified 5 min before each class</span>
              </div>
            )}
            {notifPerm === "denied" && (
              <div style={{ marginBottom: 16, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <span>🔕</span>
                <span style={{ fontSize: 13, color: "#fca5a5", fontWeight: 500 }}>Notifications blocked. Enable in browser settings for class reminders.</span>
              </div>
            )}

            {todayCls.length > 0 && (
              <div>
                <div className="sh" style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text2)", letterSpacing: ".06em" }}>TODAY'S SCHEDULE</div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginLeft: "auto" }}>{todayCls.length} classes</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {todayCls.map(function (c) { return <TodayRow key={c.id} c={c} allSems={allSems} />; })}
                </div>
              </div>
            )}

            {clashes.length > 0 && (
              <div style={{ marginTop: 20, background: "rgba(239,68,68,0.07)", border: "1.5px solid rgba(239,68,68,0.25)", borderRadius: 14, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fca5a5" }}>⚠ {clashes.length} Schedule Clash{clashes.length > 1 ? "es" : ""}</div>
                  <button onClick={function () { setClashOpen(true); }} style={{ background: "rgba(239,68,68,0.18)", border: "1.5px solid rgba(239,68,68,0.4)", color: "#fca5a5", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Fix Clashes</button>
                </div>
                {clashes.map(function (pair, i) {
                  return <div key={i} style={{ fontSize: 13, color: "#f87171", marginBottom: 4, fontWeight: 500 }}>{pair[0].name} overlaps with {pair[1].name} · {pair[0].day} {pair[0].time}</div>;
                })}
              </div>
            )}
          </div>
        )}

        {/* TIMETABLE */}
        {view === "timetable" && (
          <div className="fu">
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>Weekly Grid</h2>
                <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 3, fontWeight: 500 }}>{active.length} active · {allSems.length} semester{allSems.length !== 1 ? "s" : ""}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {allSems.map(function (s) {
                  var col = getColor(s, allSems); return (
                    <span key={s} className="pill" style={{ background: col.light, color: col.bg, border: "1.5px solid " + col.border, fontSize: 12, fontWeight: 700 }}>{s}</span>
                  );
                })}
              </div>
            </div>
            <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid var(--border)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560, background: "var(--bg2)" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: ".08em", width: 60, background: "var(--bg3)" }}>TIME</th>
                    {DAYS.map(function (d, i) {
                      return (
                        <th key={d} style={{ padding: "12px 8px", textAlign: "center", fontSize: 12, fontWeight: 700, background: i === todayIdx() ? "rgba(249,115,22,0.08)" : "var(--bg3)", color: i === todayIdx() ? "var(--accent)" : "var(--text2)" }}>
                          {d}
                          {i === todayIdx() && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent)", margin: "4px auto 0" }} />}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map(function (slot) {
                    return (
                      <tr key={slot} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "6px 14px", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "var(--text3)", verticalAlign: "top", background: "var(--bg3)", fontWeight: 500 }}>{slot}</td>
                        {DAYS.map(function (day, di) {
                          var slotMin = toMin(slot);
                          var cells = active.filter(function (c) {
                            if (c.day !== day) return false;
                            return c.time === slot;
                          });
                          return (
                            <td key={day} style={{ verticalAlign: "top", padding: 4, background: di === todayIdx() ? "rgba(249,115,22,0.03)" : "transparent", minWidth: 80 }}>
                              {cells.map(function (c) {
                                var col = getColor(c.semester, allSems);
                                var on = getStatus(c) === "ongoing";
                                return (
                                  <div key={c.id} style={{ background: on ? col.bg : col.light, border: "1.5px solid " + col.border, borderLeft: "4px solid " + col.bg, borderRadius: 7, padding: "6px 8px", marginBottom: 3 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: on ? col.text : col.bg, lineHeight: 1.3 }}>{c.name}</div>
                                    <div style={{ fontSize: 10, color: on ? col.text : "var(--text3)", marginTop: 2, fontFamily: "'JetBrains Mono',monospace" }}>{c.room}</div>
                                    {on && <div style={{ fontSize: 9, color: col.text, marginTop: 2, fontWeight: 700 }}>LIVE</div>}
                                  </div>
                                );
                              })}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FINDER */}
        {view === "finder" && (
          <div className="fu">
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, letterSpacing: "-.02em" }}>Find a Class</h2>
            <div style={{ position: "relative", marginBottom: 20 }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "var(--text3)" }}>⌕</span>
              <input className="inp" placeholder="Search by name, code, or room..." value={searchQ} onChange={function (e) { setSearchQ(e.target.value); }} style={{ paddingLeft: 40, fontSize: 14 }} />
            </div>
            {searchQ && <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 12, fontWeight: 500 }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.length === 0 && <div style={{ textAlign: "center", color: "var(--text3)", padding: 48, fontSize: 14 }}><div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>No classes found</div>}
              {filtered.map(function (c) {
                var col = getColor(c.semester, allSems);
                var st = getStatus(c);
                return (
                  <div key={c.id} className="card" style={{ display: "flex", gap: 16, padding: "16px 20px" }}>
                    <div style={{ width: 46, height: 46, borderRadius: 12, background: col.light, border: "1.5px solid " + col.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: col.bg, fontSize: 18, fontWeight: 800 }}>{c.name[0]}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{c.name} <span style={{ fontWeight: 500, color: "var(--text3)", fontSize: 13 }}>{c.code}</span></div>
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500 }}>📍 {c.room}</span>
                        <span style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500 }}>📅 {c.day} {c.time}</span>
                        <span style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500 }}>⏱ {c.duration}h</span>
                        {c.instructor && <span style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500 }}>👤 {c.instructor}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                      <span className="pill" style={{ background: col.light, color: col.bg, border: "1.5px solid " + col.border, fontWeight: 700 }}>{c.semester}</span>
                      {st === "ongoing" && <span className="pill" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)", fontWeight: 700 }}>LIVE</span>}
                      {st === "soon" && <span className="pill" style={{ background: "rgba(234,179,8,0.15)", color: "#eab308", border: "1px solid rgba(234,179,8,0.3)", fontWeight: 700 }}>SOON</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MANAGE */}
        {view === "manage" && (
          <div className="fu">
            <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>Manage Courses</h2>
                <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 3, fontWeight: 500 }}>{active.length} active · {courses.length} total</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={function () { if (window.confirm("Reset all courses to sample data?")) { setCourses(SEED); setSemesters(["6th Sem", "4th Sem"]); try { localStorage.removeItem("cn_courses"); localStorage.removeItem("cn_semesters"); } catch (e) { } showToast("Data reset to sample courses."); } }} style={{ background: "transparent", border: "1.5px solid var(--border)", color: "var(--text3)", borderRadius: "var(--radius-sm)", padding: "10px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", transition: "all .2s" }} onMouseEnter={function (e) { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; }} onMouseLeave={function (e) { e.currentTarget.style.color = "var(--text3)"; e.currentTarget.style.borderColor = "var(--border)"; }}>↺ Reset</button>
                <button className="btng" onClick={openScan}>AI Scan</button>
                <button className="btnp" onClick={function () { setAddOpen(true); }}>+ Add Course</button>
              </div>
            </div>
            {allSems.length === 0 && <div style={{ textAlign: "center", padding: 48, color: "var(--text3)", fontSize: 14 }}><div style={{ fontSize: 36, marginBottom: 10 }}>📚</div>No courses yet.</div>}
            {allSems.map(function (sem) {
              var sc = courses.filter(function (c) { return c.semester === sem; });
              var col = getColor(sem, allSems);
              return (
                <div key={sem} style={{ marginBottom: 26 }}>
                  <div className="sh">
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: col.bg, flexShrink: 0, boxShadow: "0 0 8px " + col.bg }} />
                    <span style={{ fontSize: 14, fontWeight: 800, color: col.bg }}>{sem}</span>
                    <span className="pill" style={{ background: col.light, color: col.bg, border: "1px solid " + col.border, fontSize: 11 }}>{sc.filter(function (c) { return c.active; }).length}/{sc.length} active</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {sc.map(function (c) {
                      return (
                        <div key={c.id} className="card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 18px", opacity: c.active ? 1 : 0.4 }}>
                          <input type="checkbox" className="chk" checked={!!c.active} onChange={function () { toggleCourse(c.id); }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>{c.name} <span style={{ fontWeight: 500, color: "var(--text3)", fontSize: 12 }}>({c.code})</span></div>
                            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2, fontWeight: 500, display: "flex", gap: 10, flexWrap: "wrap" }}>
                              <span>{c.day} {c.time}</span><span>📍 {c.room}</span><span>⏱ {c.duration}h</span>
                            </div>
                          </div>
                          <button onClick={function () { openEdit(c); }} style={{ background: "rgba(59,130,246,0.1)", border: "1.5px solid rgba(59,130,246,0.25)", color: "#93c5fd", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", flexShrink: 0 }}>Edit</button>
                          <button onClick={function () { deleteCourse(c.id); }} style={{ background: "rgba(239,68,68,0.1)", border: "1.5px solid rgba(239,68,68,0.25)", color: "#f87171", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", flexShrink: 0 }}>Remove</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CLASH RESOLVER */}
      {clashOpen && (
        <div className="overlay" onClick={closeOnBg(function () { setClashOpen(false); })}>
          <div className="modal fu" style={{ maxWidth: 560 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,0.12)", border: "1.5px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚠</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>Resolve Clashes</div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Choose which course to keep for each conflict</div>
                </div>
              </div>
              <button onClick={function () { setClashOpen(false); }} style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text2)", fontSize: 20, cursor: "pointer", lineHeight: 1, padding: "5px 10px", borderRadius: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>x</button>
            </div>
            {clashes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "36px 0" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#86efac" }}>All clashes resolved!</div>
                <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>Your schedule is conflict-free.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {clashes.map(function (pair, i) {
                  var a = pair[0], b = pair[1];
                  return (
                    <div key={i} style={{ background: "var(--bg3)", border: "1.5px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: 18 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#f87171", letterSpacing: ".08em", marginBottom: 14 }}>CLASH {i + 1} · {a.day} at {a.time}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center" }}>
                        <div style={{ background: "var(--bg2)", border: "1.5px solid var(--border)", borderRadius: 10, padding: 14 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{a.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 2 }}>{a.code} · {a.semester}</div>
                          <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 12 }}>📍 {a.room} · {a.time} · {a.duration}h</div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={function () { resolveClash(a.id, b.id); }} style={{ flex: 1, background: "rgba(34,197,94,0.12)", border: "1.5px solid rgba(34,197,94,0.35)", color: "#86efac", borderRadius: 7, padding: "8px 0", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Keep</button>
                            <button onClick={function () { resolveClash(b.id, a.id); }} style={{ flex: 1, background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: 7, padding: "8px 0", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Drop</button>
                          </div>
                        </div>
                        <div style={{ textAlign: "center", color: "#f87171", fontWeight: 800, fontSize: 13, opacity: .7 }}>VS</div>
                        <div style={{ background: "var(--bg2)", border: "1.5px solid var(--border)", borderRadius: 10, padding: 14 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{b.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 2 }}>{b.code} · {b.semester}</div>
                          <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 12 }}>📍 {b.room} · {b.time} · {b.duration}h</div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={function () { resolveClash(b.id, a.id); }} style={{ flex: 1, background: "rgba(34,197,94,0.12)", border: "1.5px solid rgba(34,197,94,0.35)", color: "#86efac", borderRadius: 7, padding: "8px 0", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Keep</button>
                            <button onClick={function () { resolveClash(a.id, b.id); }} style={{ flex: 1, background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: 7, padding: "8px 0", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Drop</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ marginTop: 20, borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", justifyContent: "flex-end" }}>
              <button className="btng" onClick={function () { setClashOpen(false); }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* AI SCAN */}
      {scanOpen && (
        <div className="overlay" onClick={closeOnBg(function () { setScanOpen(false); })}>
          <div className="modal fu" style={{ maxWidth: 540 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(249,115,22,0.12)", border: "1.5px solid rgba(249,115,22,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✦</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>AI Timetable Scanner</div>
              </div>
              <button onClick={function () { setScanOpen(false); }} style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text2)", fontSize: 20, cursor: "pointer", lineHeight: 1, padding: "5px 10px", borderRadius: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>x</button>
            </div>
            <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 20, lineHeight: 1.6 }}>Add one slot per semester, upload photo, AI extracts all classes, then pick which ones you're taking.</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
              {slots.map(function (s, i) {
                return (
                  <button key={i} className={"tab-btn" + (activeSlot === i ? " act" : "")} onClick={function () { setActiveSlot(i); }}>
                    {s.semLabel || ("Sem " + (i + 1))}
                    {s.courses.length > 0 && <span style={{ marginLeft: 6, background: "rgba(249,115,22,0.2)", color: "var(--accent)", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{s.courses.filter(function (c) { return c._checked; }).length}/{s.courses.length}</span>}
                  </button>
                );
              })}
              <button className="tab-btn" onClick={addSlot} style={{ color: "var(--accent)", borderColor: "rgba(249,115,22,0.3)", background: "rgba(249,115,22,0.05)" }}>+ Add Semester</button>
            </div>
            {slots.length === 0
              ? <div style={{ textAlign: "center", padding: "36px 0", color: "var(--text3)", fontSize: 14 }}>Click <b style={{ color: "var(--accent)" }}>+ Add Semester</b> to get started</div>
              : slots[activeSlot] !== undefined && (
                <ScanSlot
                  slot={slots[activeSlot]}
                  onLabel={function (v) { updSlot(activeSlot, { semLabel: v, courses: [], error: null }); }}
                  onImage={function (f) { handleImg(activeSlot, f); }}
                  onRemove={function () { updSlot(activeSlot, { file: null, base64: null, courses: [], error: null }); }}
                  onScan={function () { scanSlot(activeSlot); }}
                  onToggle={function (ci) { togglePending(activeSlot, ci); }}
                  onAll={function (v) { selectAll(activeSlot, v); }}
                />
              )
            }
            <div style={{ display: "flex", gap: 10, marginTop: 22, borderTop: "1px solid var(--border)", paddingTop: 18 }}>
              <button className="btng" style={{ flex: 1 }} onClick={function () { setScanOpen(false); }}>Cancel</button>
              <button className="btnp" style={{ flex: 2 }} onClick={importAll} disabled={totalSel === 0}>
                {totalSel > 0 ? "Import " + totalSel + " Course" + (totalSel !== 1 ? "s" : "") : "Select courses to import"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD COURSE */}
      {addOpen && (
        <div className="overlay" onClick={closeOnBg(function () { setAddOpen(false); })}>
          <div className="modal fu" style={{ maxWidth: 480 }}>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 22, letterSpacing: "-.02em" }}>Add Course Manually</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[["COURSE NAME", "name", "e.g. Data Structures"], ["CODE", "code", "e.g. CS301"], ["ROOM", "room", "e.g. B-204"], ["INSTRUCTOR", "instructor", "e.g. Dr. Ahmed"]].map(function (t) {
                return (
                  <div key={t[1]}>
                    <label className="lbl">{t[0]}</label>
                    <input className="inp" placeholder={t[2]} value={newC[t[1]]} onChange={function (e) { setNewC(function (p) { var u = Object.assign({}, p); u[t[1]] = e.target.value; return u; }); }} />
                  </div>
                );
              })}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div><label className="lbl">DAY</label>
                  <select className="sel" value={newC.day} onChange={function (e) { setNewC(function (p) { return Object.assign({}, p, { day: e.target.value }); }); }}>
                    {DAYS.map(function (d) { return <option key={d}>{d}</option>; })}
                  </select>
                </div>
                <div><label className="lbl">TIME</label>
                  <select className="sel" value={newC.time} onChange={function (e) { setNewC(function (p) { return Object.assign({}, p, { time: e.target.value }); }); }}>
                    {TIME_SLOTS.map(function (t) { return <option key={t}>{t}</option>; })}
                  </select>
                </div>
                <div><label className="lbl">DURATION (h)</label>
                  <input
                    className="inp"
                    type="number"
                    min="0.1" max="6" step="0.01"
                    placeholder="e.g. 0.67 for 40 min"
                    value={newC.duration}
                    onChange={function (e) { setNewC(function (p) { return Object.assign({}, p, { duration: parseFloat(e.target.value) || 1 }); }); }}
                  />
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>40 min = 0.67 · 1.5h = 1.5 · Lab 2h = 2</div>
                </div>
                <div><label className="lbl">SEMESTER</label>
                  <select className="sel" value={newC.semester} onChange={function (e) { setNewC(function (p) { return Object.assign({}, p, { semester: e.target.value }); }); }}>
                    {semesters.map(function (s) { return <option key={s} value={s}>{s}</option>; })}
                    <option value="__new__">+ New semester</option>
                  </select>
                </div>
              </div>
              {newC.semester === "__new__" && (
                <div><label className="lbl">NEW SEMESTER NAME</label>
                  <input className="inp" placeholder="e.g. 5th Sem" value={newC._customSem || ""} onChange={function (e) { setNewC(function (p) { return Object.assign({}, p, { _customSem: e.target.value }); }); }} />
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button className="btng" style={{ flex: 1 }} onClick={function () { setAddOpen(false); }}>Cancel</button>
              <button className="btnp" style={{ flex: 2 }} onClick={addCourse} disabled={!newC.name || !newC.room || (newC.semester === "__new__" && !newC._customSem)}>Add Course</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT COURSE */}
      {editOpen && editC && (
        <div className="overlay" onClick={closeOnBg(function () { setEditOpen(false); })}>
          <div className="modal fu" style={{ maxWidth: 480 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.02em" }}>Edit Course</div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 3 }}>Update the details for <span style={{ color: "var(--accent)" }}>{editC.name || "this course"}</span></div>
              </div>
              <button onClick={function () { setEditOpen(false); }} style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text2)", fontSize: 20, cursor: "pointer", lineHeight: 1, padding: "5px 10px", borderRadius: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>x</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[["COURSE NAME", "name", "e.g. Data Structures"], ["CODE", "code", "e.g. CS301"], ["ROOM", "room", "e.g. B-204"], ["INSTRUCTOR", "instructor", "e.g. Dr. Ahmed"]].map(function (t) {
                return (
                  <div key={t[1]}>
                    <label className="lbl">{t[0]}</label>
                    <input className="inp" placeholder={t[2]} value={editC[t[1]] || ""} onChange={function (e) { var v = e.target.value; setEditC(function (p) { var u = Object.assign({}, p); u[t[1]] = v; return u; }); }} />
                  </div>
                );
              })}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div><label className="lbl">DAY</label>
                  <select className="sel" value={editC.day} onChange={function (e) { var v = e.target.value; setEditC(function (p) { return Object.assign({}, p, { day: v }); }); }}>
                    {DAYS.map(function (d) { return <option key={d}>{d}</option>; })}
                  </select>
                </div>
                <div><label className="lbl">TIME</label>
                  <select className="sel" value={editC.time} onChange={function (e) { var v = e.target.value; setEditC(function (p) { return Object.assign({}, p, { time: v }); }); }}>
                    {DEFAULT_SLOTS.map(function (t) { return <option key={t}>{t}</option>; })}
                  </select>
                </div>
                <div><label className="lbl">DURATION (h)</label>
                  <input
                    className="inp"
                    type="number"
                    min="0.1" max="6" step="0.01"
                    placeholder="e.g. 1.5"
                    value={editC.duration}
                    onChange={function (e) { var v = parseFloat(e.target.value) || 1; setEditC(function (p) { return Object.assign({}, p, { duration: v }); }); }}
                  />
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>40 min = 0.67 · 1.5h = 1.5 · Lab 2h = 2</div>
                </div>
                <div><label className="lbl">SEMESTER</label>
                  <select className="sel" value={editC.semester} onChange={function (e) { var v = e.target.value; setEditC(function (p) { return Object.assign({}, p, { semester: v }); }); }}>
                    {semesters.map(function (s) { return <option key={s} value={s}>{s}</option>; })}
                    <option value="__new__">+ New semester</option>
                  </select>
                </div>
              </div>
              {editC.semester === "__new__" && (
                <div><label className="lbl">NEW SEMESTER NAME</label>
                  <input className="inp" placeholder="e.g. 5th Sem" value={editC._customSem || ""} onChange={function (e) { var v = e.target.value; setEditC(function (p) { return Object.assign({}, p, { _customSem: v }); }); }} />
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button className="btng" style={{ flex: 1 }} onClick={function () { setEditOpen(false); }}>Cancel</button>
              <button className="btnp" style={{ flex: 2, background: "#3B82F6" }} onClick={saveEdit} disabled={!editC.name || !editC.room || (editC.semester === "__new__" && !editC._customSem)}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: toast.type === "err" ? "#1a0808" : "#081a0e", border: "1.5px solid " + (toast.type === "err" ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.4)"), borderRadius: 12, padding: "13px 22px", color: toast.type === "err" ? "#fca5a5" : "#86efac", fontSize: 14, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 999, whiteSpace: "nowrap", animation: "fu .3s ease" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
