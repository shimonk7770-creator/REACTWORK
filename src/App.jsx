import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Chumash from './pages/Chumash.jsx';
import Tehillim from './pages/Tehillim.jsx';
import Tanya from './pages/Tanya.jsx';
import Quiz from './pages/Quiz.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';
import { applyFontSize, loadFontSize } from './utils/fontSize.js';

function App() {
  const [reminderVisible, setReminderVisible] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setNavOpen(false); }, [location.pathname]);

  useEffect(() => { applyFontSize(loadFontSize()); }, []);

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('reactwork-settings') || '{}');
    if (!settings.remindersOn || !settings.reminderTime) return;

    const now = new Date();
    const [h, m] = settings.reminderTime.split(':').map(Number);
    const reminderMinutes = h * 60 + m;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const diff = Math.abs(currentMinutes - reminderMinutes);
    const today = now.toDateString();
    const lastSeen = localStorage.getItem('reactwork-reminder-seen');

    if (diff <= 60 && lastSeen !== today) {
      setReminderVisible(true);
      localStorage.setItem('reactwork-reminder-seen', today);
    }
  }, []);

  return (
    <div className="app-shell">
      {reminderVisible && (
        <div className="reminder-banner">
          <span>הגיע זמן הלימוד שלך! כנס ללוח היומי וסמן את היום.</span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link to="/tehillim" className="reminder-cta" onClick={() => setReminderVisible(false)}>
              ללימוד היומי
            </Link>
            <button className="reminder-close" onClick={() => setReminderVisible(false)}>
              ×
            </button>
          </div>
        </div>
      )}

      <header className="app-header">
        <Link to="/" className="brand-logo">
          <span className="brand-icon">📖</span>
          <span className="brand-name">חת״ת יומי</span>
        </Link>

        <button
          className={`nav-toggle${navOpen ? ' open' : ''}`}
          onClick={() => setNavOpen((o) => !o)}
          aria-label="תפריט ניווט"
          aria-expanded={navOpen}
        >
          <span /><span /><span />
        </button>

        <nav className={`app-nav${navOpen ? ' open' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>בית</NavLink>
          <NavLink to="/chumash" className={({ isActive }) => (isActive ? 'active' : '')}>חומש</NavLink>
          <NavLink to="/tehillim" className={({ isActive }) => (isActive ? 'active' : '')}>תהילים</NavLink>
          <NavLink to="/tanya" className={({ isActive }) => (isActive ? 'active' : '')}>תניא</NavLink>
          <NavLink to="/quiz" className={({ isActive }) => (isActive ? 'active' : '')}>חידון פרשה</NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>הגדרות</NavLink>
        </nav>
      </header>

      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chumash" element={<Chumash />} />
          <Route path="/tehillim" element={<Tehillim />} />
          <Route path="/tanya" element={<Tanya />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>שמירה מקומית ב-localStorage · ניהול רצף וניקוד · חת״ת יומי</p>
      </footer>
    </div>
  );
}

export default App;
