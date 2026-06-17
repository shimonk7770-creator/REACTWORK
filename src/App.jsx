import { Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home.jsx';
import DailyBoard from './pages/DailyBoard.jsx';
import Quiz from './pages/Quiz.jsx';

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>חת"ת יומי</h1>
          <p>חומש, תהילים, תניא ותוכן חידון פרשה</p>
        </div>
        <nav className="app-nav">
          <NavLink to="/" end>בית</NavLink>
          <NavLink to="/daily">לוח יומי</NavLink>
          <NavLink to="/quiz">חידון פרשה</NavLink>
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
        <p>מפותח עבור פרויקט חת"ת יומי - שמרנו כל שלב ב-Git</p>
      </footer>
    </div>
  );
}

export default App;
