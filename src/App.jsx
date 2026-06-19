import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import DailyBoard from './pages/DailyBoard.jsx';
import Quiz from './pages/Quiz.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {
  const [reminderVisible, setReminderVisible] = useState(false);

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
            <Link to="/daily" className="reminder-cta" onClick={() => setReminderVisible(false)}>
              ללוח היומי
            </Link>
            <button className="reminder-close" onClick={() => setReminderVisible(false)}>
              ×
            </button>
          </div>
        </div>
      )}

      <header className="app-header">
        <div className="brand-group">
          <span className="brand-badge">חת״ת יומי</span>
          <h1>למוטיבציה יומיומית בחומש, תהילים ותניא</h1>
          <p>עוקבים אחרי היום הנוכחי, צוברים ניקוד ונשארים ברצף עם עיצוב מודרני בעברית.</p>
        </div>

        <nav className="app-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            בית
          </NavLink>
          <NavLink to="/daily" className={({ isActive }) => (isActive ? 'active' : '')}>
            לוח יומי
          </NavLink>
          <NavLink to="/quiz" className={({ isActive }) => (isActive ? 'active' : '')}>
            חידון פרשה
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
            הגדרות
          </NavLink>
        </nav>
      </header>

      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/daily" element={<DailyBoard />} />
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
