import { Link } from 'react-router-dom';

export default function Landing() {
    const scrollToFeatures = () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
            {/* Hero Section */}
            <section style={{
                position: 'relative',
                padding: '120px 24px 80px',
                textAlign: 'center',
                overflow: 'hidden'
            }}>
                {/* Glow */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80vw',
                    height: '80vw',
                    maxWidth: '800px',
                    maxHeight: '800px',
                    background: 'radial-gradient(circle, rgba(var(--accent-rgb),0.15) 0%, rgba(15,17,23,0) 70%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }} />

                <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
                    <h1 style={{
                        fontSize: 'clamp(40px, 8vw, 64px)',
                        fontWeight: 800,
                        letterSpacing: '-.03em',
                        lineHeight: 1.1,
                        marginBottom: 24,
                        color: 'var(--text)'
                    }}>
                        Never miss a class.<br />
                        <span style={{ color: 'var(--accent)' }}>Never forget a room.</span>
                    </h1>

                    <p style={{
                        fontSize: 'clamp(16px, 4vw, 20px)',
                        color: 'var(--text2)',
                        lineHeight: 1.6,
                        marginBottom: 40,
                        maxWidth: 600,
                        margin: '0 auto 40px'
                    }}>
                        ClassNav keeps your university schedule organized across multiple semesters — with AI timetable scanning, live class detection, and smart reminders.
                    </p>

                    <div className="hero-cta" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/app" className="btnp" style={{ textDecoration: 'none', padding: '16px 32px', fontSize: 16, display: 'inline-flex', alignItems: 'center' }}>
                            Get Started →
                        </Link>
                        <button className="btng" style={{ padding: '16px 32px', fontSize: 16 }} onClick={scrollToFeatures}>
                            Learn More ↓
                        </button>
                    </div>

                    {/* Floating mock card */}
                    <div className="card fu" style={{
                        marginTop: 64,
                        maxWidth: 400,
                        margin: '64px auto 0',
                        textAlign: 'left',
                        padding: 32,
                        background: 'linear-gradient(135deg, rgba(var(--accent-rgb),0.08), rgba(22,27,39,0.9))',
                        borderColor: 'rgba(var(--accent-rgb),0.3)',
                        boxShadow: '0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(var(--accent-rgb),0.1)',
                        transform: 'perspective(1000px) rotateX(4deg)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <div className="ldot" />
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', letterSpacing: '.08em' }}>IN SESSION</span>
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Data Structures</div>
                        <div style={{ fontSize: 14, color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace", marginBottom: 20, fontWeight: 500 }}>Room B-204 · 09:00 - 10:30</div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: '60%', height: '100%', background: 'var(--accent)', borderRadius: 3 }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 56 }}>
                    <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 16 }}>Everything you need.</h2>
                    <p style={{ color: 'var(--text2)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>Built specifically for the chaos of university life.</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 24
                }}>
                    {[
                        { icon: '🤖', title: 'AI Timetable Scanner', desc: 'Photo scan your timetable, AI extracts every class instantly.' },
                        { icon: '📅', title: 'Multi-Semester Support', desc: 'Mix classes from different semesters in one single schedule.' },
                        { icon: '🔔', title: 'Smart Reminders', desc: 'Browser notifications 5 minutes before every class starts.' },
                        { icon: '⚡', title: 'Live Class Detection', desc: "See exactly what class you're in right now with a live progress bar." },
                        { icon: '⚠️', title: 'Clash Detector', desc: 'Automatically finds and helps you resolve scheduling conflicts.' },
                        { icon: '💾', title: 'Works Offline', desc: 'Everything is stored securely on your device. No account needed.' }
                    ].map((f, i) => (
                        <div key={i} className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.05)' }}>
                                {f.icon}
                            </div>
                            <div>
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, letterSpacing: '-.01em' }}>{f.title}</h3>
                                <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section style={{ padding: '100px 24px', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 64 }}>
                        <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 16 }}>How it works</h2>
                        <p style={{ color: 'var(--text2)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>Three simple steps to an organized semester.</p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: 32,
                        textAlign: 'center'
                    }}>
                        {[
                            { step: '01', title: 'Upload', desc: 'Take a photo or screenshot of your complex university timetable.' },
                            { step: '02', title: 'Extract', desc: 'Our AI scans the image and perfectly structures all your classes.' },
                            { step: '03', title: 'Track', desc: 'Get smart reminders, track live sessions, and never get lost again.' }
                        ].map((s, i) => (
                            <div key={i} style={{ padding: 24, position: 'relative' }}>
                                <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--border2)', marginBottom: 20, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{s.step}</div>
                                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{s.title}</h3>
                                <p style={{ color: 'var(--text3)', fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section style={{ padding: '120px 24px', textAlign: 'center', background: 'var(--bg)' }}>
                <div className="card" style={{ maxWidth: 700, margin: '0 auto', padding: '64px 32px', background: 'linear-gradient(180deg, var(--bg2) 0%, var(--bg) 100%)' }}>
                    <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 24 }}>
                        Ready to take control of your schedule?
                    </h2>
                    <p style={{ color: 'var(--text2)', marginBottom: 40, fontSize: 16 }}>Join thousands of students organizing their uni life.</p>
                    <Link to="/app" className="btnp" style={{ textDecoration: 'none', padding: '18px 40px', fontSize: 16, display: 'inline-block' }}>
                        Open ClassNav →
                    </Link>
                </div>
            </section>
        </div>
    );
}
