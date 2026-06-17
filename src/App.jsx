import { Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home.jsx';
import DailyBoard from './pages/DailyBoard.jsx';
import Quiz from './pages/Quiz.jsx';

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-group">
          <span className="brand-badge">חת"ת יומי</span>
          <h1>למוטיבציה יומיומית בחומש, תהילים ותניא</h1>
          <p>עוקבים אחרי היום הנוכחי, צוברים ניקוד ונשארים ברצף עם עיצוב מודרני בעברית.</p>
        </div>

        <nav className="app-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>בית</NavLink>
          <NavLink to="/daily" className={({ isActive }) => (isActive ? 'active' : '')}>לוח יומי</NavLink>
          <NavLink to="/quiz" className={({ isActive }) => (isActive ? 'active' : '')}>חידון פרשה</NavLink>
        </nav>
      </header>

      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/daily" element={<DailyBoard />} />
          <Route path="/quiz" element={<Quiz />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>שמירה מקומית ב-localStorage, ניהול רצף וניקוד, ושמירה קבועה ב-Git.</p>
      </footer>
    </div>
  );
}

export default App;
