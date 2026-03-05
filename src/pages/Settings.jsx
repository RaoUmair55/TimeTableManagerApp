import { useState, useEffect } from 'react';

const AVATARS = ['🎓', '📚', '🧑‍💻', '👨‍🔬', '👩‍🎓', '🦊', '🐼', '🚀'];
const PRESETS = [
    { name: 'Orange', color: '#F97316', rgb: '249,115,22' },
    { name: 'Blue', color: '#3B82F6', rgb: '59,130,246' },
    { name: 'Green', color: '#10B981', rgb: '16,185,129' },
    { name: 'Purple', color: '#8B5CF6', rgb: '139,92,246' },
    { name: 'Pink', color: '#EC4899', rgb: '236,72,153' }
];

export default function Settings() {
    const [settings, setSettings] = useState(() => {
        try {
            const s = localStorage.getItem('cn_settings');
            return s ? JSON.parse(s) : { name: '', uni: '', avatar: '🎓', accent: '#F97316', notify5: true, notify10: false, compactMode: false };
        } catch {
            return { name: '', uni: '', avatar: '🎓', accent: '#F97316', notify5: true, notify10: false, compactMode: false };
        }
    });

    const [coursesCount, setCoursesCount] = useState({ courses: 0, sems: 0 });
    const [perm, setPerm] = useState('default');
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (typeof Notification !== 'undefined') setPerm(Notification.permission);
        try {
            const c = JSON.parse(localStorage.getItem('cn_courses') || '[]');
            const s = JSON.parse(localStorage.getItem('cn_semesters') || '[]');
            setCoursesCount({ courses: c.length, sems: s.length });
        } catch { }
    }, []);

    const saveSettings = () => {
        localStorage.setItem('cn_settings', JSON.stringify(settings));
        document.documentElement.style.setProperty('--accent', settings.accent);
        const preset = PRESETS.find(p => p.color === settings.accent);
        if (preset) {
            document.documentElement.style.setProperty('--accent-rgb', preset.rgb);
        }
        if (settings.compactMode) {
            document.body.classList.add('compact-mode');
        } else {
            document.body.classList.remove('compact-mode');
        }
        // trigger updates for Navbar/components if needed
        window.dispatchEvent(new Event('storage'));

        setToast('Settings saved!');
        setTimeout(() => setToast(''), 3000);
    };

    const requestPerm = async () => {
        if (typeof Notification !== 'undefined') {
            const p = await Notification.requestPermission();
            setPerm(p);
        }
    };

    const exportData = () => {
        try {
            const data = localStorage.getItem('cn_courses');
            const blob = new Blob([data || '[]'], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'classnav_backup.json';
            a.click();
        } catch { }
    };

    const importData = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed = JSON.parse(ev.target.result);
                if (Array.isArray(parsed)) {
                    localStorage.setItem('cn_courses', JSON.stringify(parsed));
                    const sems = [...new Set(parsed.map(c => c.semester))];
                    localStorage.setItem('cn_semesters', JSON.stringify(sems));
                    setCoursesCount({ courses: parsed.length, sems: sems.length });
                    setToast('Data imported successfully!');
                    setTimeout(() => setToast(''), 3000);
                }
            } catch {
                alert('Invalid backup file');
            }
        };
        reader.readAsText(file);
    };

    const resetData = () => {
        if (window.confirm("Are you sure? This will delete all your courses and semesters. (This cannot be undone!)")) {
            localStorage.removeItem('cn_courses');
            localStorage.removeItem('cn_semesters');
            window.location.reload();
        }
    };

    return (
        <div style={{ padding: "clamp(16px,4vw,40px) clamp(14px,4vw,24px)", maxWidth: 800, margin: "0 auto", width: "100%" }}>
            <div className="settings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-.02em" }}>Settings</h1>
                <button onClick={saveSettings} className="btnp">Save Settings</button>
            </div>

            {toast && (
                <div className="card fu" style={{ padding: '12px 20px', background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)', color: '#86efac', marginBottom: 24, fontWeight: 600 }}>
                    ✓ {toast}
                </div>
            )}

            {/* Profile */}
            <section style={{ marginBottom: 48 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text2)' }}>Profile</h2>
                <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '100%' }}>
                            <label className="lbl">Name</label>
                            <input className="inp" placeholder="e.g. Alex" value={settings.name} onChange={e => setSettings({ ...settings, name: e.target.value })} />
                        </div>
                        <div style={{ flex: 1, minWidth: '100%' }}>
                            <label className="lbl">University</label>
                            <input className="inp" placeholder="e.g. MIT" value={settings.uni} onChange={e => setSettings({ ...settings, uni: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="lbl">Avatar</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {AVATARS.map(a => (
                                <button key={a} onClick={() => setSettings({ ...settings, avatar: a })} style={{ width: 44, height: 44, borderRadius: 12, border: `2px solid ${settings.avatar === a ? 'var(--accent)' : 'var(--border)'}`, background: settings.avatar === a ? 'rgba(var(--accent-rgb), 0.1)' : 'var(--bg3)', fontSize: 20, cursor: 'pointer', transition: 'all .2s' }}>
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Appearance */}
            <section style={{ marginBottom: 48 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text2)' }}>Appearance</h2>
                <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div>
                        <label className="lbl">Accent Color</label>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {PRESETS.map(p => (
                                <button key={p.color} onClick={() => setSettings({ ...settings, accent: p.color })} style={{ width: 36, height: 36, borderRadius: '50%', background: p.color, border: `3px solid ${settings.accent === p.color ? '#fff' : 'transparent'}`, outline: `2px solid ${settings.accent === p.color ? p.color : 'transparent'}`, cursor: 'pointer', transition: 'all .2s' }} aria-label={p.name} />
                            ))}
                        </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                        <input type="checkbox" className="chk" checked={settings.compactMode} onChange={e => setSettings({ ...settings, compactMode: e.target.checked })} />
                        <div>
                            <div style={{ fontWeight: 600 }}>Compact Mode</div>
                            <div style={{ fontSize: 13, color: 'var(--text3)' }}>Reduces padding on cards for smaller screens</div>
                        </div>
                    </label>
                </div>
            </section>

            {/* Notifications */}
            <section style={{ marginBottom: 48 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text2)' }}>Notifications</h2>
                <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>Browser Permission</div>
                            <div style={{ fontSize: 13, color: 'var(--text3)' }}>Status: <span style={{ color: perm === 'granted' ? '#86efac' : perm === 'denied' ? '#fca5a5' : '#fde047' }}>{perm}</span></div>
                        </div>
                        {perm !== 'granted' && <button onClick={requestPerm} className="btng" style={{ padding: '8px 16px', fontSize: 13 }}>Request Permission</button>}
                    </div>
                    <div style={{ height: 1, background: 'var(--border)' }} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                        <input type="checkbox" className="chk" checked={settings.notify5} onChange={e => setSettings({ ...settings, notify5: e.target.checked })} />
                        <div style={{ fontWeight: 600 }}>Notify me 5 min before class</div>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                        <input type="checkbox" className="chk" checked={settings.notify10} onChange={e => setSettings({ ...settings, notify10: e.target.checked })} />
                        <div style={{ fontWeight: 600 }}>Notify me 10 min before class</div>
                    </label>
                </div>
            </section>

            {/* Data */}
            <section style={{ marginBottom: 48 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text2)' }}>Data & Storage</h2>
                <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ fontSize: 14, color: 'var(--text3)', fontWeight: 500 }}>
                        Storing {coursesCount.courses} courses across {coursesCount.sems} semesters.
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <button onClick={exportData} className="btng" style={{ flex: 1, minWidth: 150 }}>Export Timetable</button>
                        <label className="btng" style={{ flex: 1, minWidth: 150, textAlign: 'center' }}>
                            Import JSON
                            <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
                        </label>
                    </div>
                    <button onClick={resetData} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Reset all data
                    </button>
                </div>
            </section>
        </div>
    );
}
