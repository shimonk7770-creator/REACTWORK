import { useEffect, useMemo, useState } from 'react';
import { dailyContent } from '../data/dailyContent.js';

const STORAGE_KEY = 'reactwork-daily-state';

function DailyBoard() {
  const today = new Date().getDate();
  const [selectedDay, setSelectedDay] = useState(today);
  const [completed, setCompleted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [lastCompletedDay, setLastCompletedDay] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (saved.selectedDay) setSelectedDay(saved.selectedDay);
    setCompleted(!!saved.completed);
    setStreak(saved.streak || 0);
    setScore(saved.score || 0);
    setLastCompletedDay(saved.lastCompletedDay ?? null);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ selectedDay, completed, streak, score, lastCompletedDay })
    );
  }, [selectedDay, completed, streak, score, lastCompletedDay]);

  const current = useMemo(
    () => dailyContent.find((item) => item.day === Number(selectedDay)) || dailyContent[0],
    [selectedDay]
  );

  const isConsecutive = selectedDay === lastCompletedDay + 1;
  const nextGoal = selectedDay + 1 <= dailyContent.length ? `יום ${selectedDay + 1}` : 'סיום החודש';

  const markDone = () => {
    if (!completed) {
      setCompleted(true);
      setScore((prev) => prev + 10);
      setStreak((prev) => (isConsecutive ? prev + 1 : 1));
      setLastCompletedDay(selectedDay);
    }
  };

  const resetProgress = () => {
    setCompleted(false);
    setStreak(0);
    setScore(0);
    setLastCompletedDay(null);
  };

  return (
    <section>
      <div className="card page-intro-card">
        <div>
          <span className="pill">לוח לימוד</span>
          <h2>יום {selectedDay} בחודש</h2>
          <p>עקוב אחרי חומש, תהילים ותניא של היום. שמור רצף כדי לקבל ניקוד ולהתקדם.</p>
        </div>
        <div className="summary-badge">
          <strong>{completed ? 'הושלם' : 'פתוח'}</strong>
          <span>{completed ? 'יום היום הושלם' : 'עדיין לא סומן'}</span>
        </div>
      </div>

      <div className="daily-grid">
        <article className="card today-card">
          <h3>תוכן היום</h3>
          <p className="text-soft">בחר יום להצגת התכנים</p>
          <select value={selectedDay} onChange={(e) => setSelectedDay(Number(e.target.value))}>
            {dailyContent.map((item) => (
              <option key={item.day} value={item.day}>
                יום {item.day} - {item.title}
              </option>
            ))}
          </select>
          <div className="content-list">
            <div>
              <span className="label">חומש</span>
              <p>{current.chumash}</p>
            </div>
            <div>
              <span className="label">תהילים</span>
              <p>{current.tehillim}</p>
            </div>
            <div>
              <span className="label">תניא</span>
              <p>{current.tanya}</p>
            </div>
          </div>
        </article>

        <article className="card stats-card">
          <h3>נקודות רצף</h3>
          <div className="progress-block">
            <span className="small-label">רצף נוכחי</span>
            <strong>{streak} ימים</strong>
          </div>
          <div className="progress-block">
            <span className="small-label">ניקוד מצטבר</span>
            <strong>{score}</strong>
          </div>
          <p className="text-soft">הקש על הכפתור כדי לסמן את היום כהושלם ולצבור נקודות.</p>
          <div className="control-row">
            <button className="primary" onClick={markDone}>
              סמן כמושלם
            </button>
            <button className="secondary" onClick={resetProgress}>
              איפוס רצף
            </button>
          </div>
          <p className="next-goal">המטרה הבאה: {nextGoal}</p>
        </article>
      </div>

      <div className="card notes-card">
        <h3>הסבר לימוד ליום {current.day}</h3>
        <p>{current.notes}</p>
      </div>
    </section>
  );
}

export default DailyBoard;
