import { useState } from 'react';

export default function About() {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setForm({ name: '', email: '', message: '' });
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div style={{ padding: "clamp(20px,4vw,40px) clamp(14px,4vw,24px)", maxWidth: 800, margin: "0 auto", width: "100%" }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-.02em", marginBottom: 16 }}>About ClassNav</h1>
            <p style={{ color: "var(--text2)", fontSize: 16, lineHeight: 1.6, marginBottom: 48 }}>
                ClassNav was built to solve a real problem — university students juggling multiple semesters, complex timetables, and the daily chaos of finding the right room at the right time.
            </p>

            <div style={{ marginBottom: 48 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>The Problem We Solve</h2>
                <div style={{ display: "grid", gap: 16 }}>
                    {[
                        { q: "Which room am I in?", a: "Students check static PDFs mid-rush." },
                        { q: "Which classes am I taking this semester?", a: "Mix of active and inactive courses." },
                        { q: "I forgot I had class", a: "No smart reminders tied to a personal schedule." }
                    ].map((item, i) => (
                        <div key={i} className="card" style={{ padding: 20, display: "flex", gap: 16, alignItems: "flex-start" }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", marginTop: 6, flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>"{item.q}"</div>
                                <div style={{ fontSize: 14, color: "var(--text3)" }}>{item.a}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: 48 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Tech Stack</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {["React", "Vite", "Claude AI (timetable scanning)", "Browser Notifications API", "localStorage"].map(tech => (
                        <span key={tech} className="pill" style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text2)", padding: "8px 16px", fontSize: 13 }}>
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

            <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Contact / Feedback</h2>
                <form onSubmit={handleSubmit} className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                        <label className="lbl">Name</label>
                        <input required className="inp" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="lbl">Email</label>
                        <input required type="email" className="inp" placeholder="you@university.edu" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div>
                        <label className="lbl">Message</label>
                        <textarea required className="inp" placeholder="How can we improve?" rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ resize: "vertical" }} />
                    </div>
                    <button type="submit" className="btnp" style={{ marginTop: 8 }}>
                        {submitted ? "✓ Feedback Sent!" : "Send Feedback"}
                    </button>
                </form>
            </div>
        </div>
    );
}
