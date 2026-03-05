import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import AppPage from './pages/App';
import Settings from './pages/Settings';
import About from './pages/About';

import { useEffect } from 'react';

function Layout() {
  const location = useLocation();
  const isAppRoute = location.pathname === '/app';

  useEffect(() => {
    try {
      const s = localStorage.getItem('cn_settings');
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed.accent) {
          document.documentElement.style.setProperty('--accent', parsed.accent);
          const PRESETS = [
            { name: 'Orange', color: '#F97316', rgb: '249,115,22' },
            { name: 'Blue', color: '#3B82F6', rgb: '59,130,246' },
            { name: 'Green', color: '#10B981', rgb: '16,185,129' },
            { name: 'Purple', color: '#8B5CF6', rgb: '139,92,246' },
            { name: 'Pink', color: '#EC4899', rgb: '236,72,153' }
          ];
          const preset = PRESETS.find(p => p.color === parsed.accent);
          if (preset) document.documentElement.style.setProperty('--accent-rgb', preset.rgb);
        }
        if (parsed.compactMode) {
          document.body.classList.add('compact-mode');
        } else {
          document.body.classList.remove('compact-mode');
        }
      }
    } catch (e) { }
  }, [location.pathname]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {!isAppRoute && <Navbar />}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<AppPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      {!isAppRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
