import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer style={{
            background: "#0d1017",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "48px 24px",
            marginTop: "auto"
        }}>
            <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#F97316,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff" }}>◈</div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-.02em", color: "var(--text)" }}>ClassNav</div>
                            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2, fontWeight: 500 }}>Built for students</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                        <Link to="/" style={{ color: "var(--text2)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Home</Link>
                        <Link to="/app" style={{ color: "var(--text2)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>App</Link>
                        <Link to="/about" style={{ color: "var(--text2)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>About</Link>
                        <Link to="/settings" style={{ color: "var(--text2)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Settings</Link>
                    </div>
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 24, textAlign: "center", fontSize: 12, color: "var(--text3)", fontWeight: 500 }}>
                    © {new Date().getFullYear()} ClassNav. All data stored locally on your device.
                </div>
            </div>
        </footer>
    );
}
