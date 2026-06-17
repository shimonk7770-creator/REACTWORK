import { useEffect, useMemo, useState } from 'react';
import { dailyContent } from '../data/dailyContent.js';

const STORAGE_KEY = 'reactwork-daily-state';

function DailyBoard() {
  const today = new Date().getDate();
  const [selectedDay, setSelectedDay] = useState(today);
  const [completed, setCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (saved.selectedDay) {
      setSelectedDay(saved.selectedDay);
    }
    setCompleted(!!saved.completed);
    setStreak(saved.streak || 0);
    setScore(saved.score || 0);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ selectedDay, completed, streak, score })
    );
  }, [selectedDay, completed, streak, score]);

  const current = useMemo(
    () => dailyContent.find((item) => item.day === Number(selectedDay)) || dailyContent[0],
    [selectedDay]
  );

  const markDone = () => {
    if (!completed) {
      setCompleted(true);
      setScore((prev) => prev + 10);
      setStreak((prev) => prev + 1);
    }
  };

  const resetProgress = () => {
    setCompleted(false);
    setStreak(0);
    setScore(0);
  };

  return (
    <section>
      <div className="card">
        <h2>לוח לימוד יומי</h2>
        <p>בחר את היום בחודש ועקוב אחרי החומש, תהילים ותניא של אותו יום.</p>
      </div>

      <div className="stats-grid">
        <article className="card">
          <h3>היום הנבחר</h3>
          <p className="highlight">{current.title}</p>
          <select value={selectedDay} onChange={(e) => setSelectedDay(Number(e.target.value))}>
            {dailyContent.map((item) => (
              <option key={item.day} value={item.day}>
                יום {item.day}
              </option>
            ))}
          </select>
        </article>

        <article className="card">
          <h3>נקודות רצף</h3>
          <p>סטreak: <strong>{streak}</strong></p>
          <p>ניקוד מצטבר: <strong>{score}</strong></p>
          <button className="primary" onClick={markDone}>
            סמן כמושלם להיום
          </button>
          <button className="secondary" onClick={resetProgress}>
            איפוס קבוצה
          </button>
        </article>
      </div>

      <div className="card">
        <h3>פרטי לימוד ליום {current.day}</h3>
        <ul>
          <li>
            <strong>חומש:</strong> {current.chumash}
          </li>
          <li>
            <strong>תהילים:</strong> {current.tehillim}
          </li>
          <li>
            <strong>תניא:</strong> {current.tanya}
          </li>
        </ul>
        <p>{current.notes}</p>
      </div>
    </section>
  );
}

export default DailyBoard;
