import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { name: 'Home', path: '/' },
        { name: 'App', path: '/app' },
        { name: 'About', path: '/about' },
        { name: 'Settings', path: '/settings' }
    ];

    const closeMenu = () => setIsOpen(false);

    return (
        <>
            <div style={{
                borderBottom: "1px solid var(--border)",
                padding: "0 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 62,
                position: "sticky",
                top: 0,
                background: "rgba(15,17,23,0.93)",
                backdropFilter: "blur(20px)",
                zIndex: 100,
                gap: 12
            }}>
                <NavLink to="/" style={{ display: "flex", alignItems: "center", gap: 11, flexShrink: 0, textDecoration: "none" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#F97316,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0, boxShadow: "0 4px 12px rgba(249,115,22,0.4)", color: "#fff" }}>◈</div>
                    <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-.03em", color: "var(--text)" }}>ClassNav</span>
                </NavLink>

                {/* Desktop Nav */}
                <nav style={{ display: "none", gap: 4 }} className="desktop-nav">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) => "nav-btn" + (isActive ? " act" : "")}
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="mobile-toggle"
                    style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", display: "flex", alignItems: "center" }}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div style={{
                    position: "fixed",
                    top: 62,
                    left: 0,
                    right: 0,
                    background: "rgba(22,27,39,0.98)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid var(--border)",
                    padding: "16px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    zIndex: 99
                }}>
                    <style>{`
          @media (min-width: 768px) {
            .mobile-menu-container { display: none !important; }
          }
        `}</style>
                    <div className="mobile-menu-container" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {links.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) => "nav-btn" + (isActive ? " act" : "")}
                                onClick={closeMenu}
                                style={{ justifyContent: "flex-start", fontSize: 15, padding: "12px 16px" }}
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
