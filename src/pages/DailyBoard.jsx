import { useEffect, useMemo, useState } from 'react';
import { chumashByDayOfWeek, dailyContent } from '../data/dailyContent.js';

const STORAGE_KEY = 'reactwork-daily-state';
const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function DailyBoard() {
  const now = new Date();
  const todayDate = now.getDate();
  const todayDayOfWeek = now.getDay(); // 0 = ראשון … 6 = שבת

  const [selectedDay, setSelectedDay] = useState(todayDate);
  const [completedDays, setCompletedDays] = useState(new Set());
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (saved.selectedDay) setSelectedDay(saved.selectedDay);
    setCompletedDays(new Set(saved.completedDays || []));
    setStreak(saved.streak || 0);
    setScore(saved.score || 0);
    setLastCompletedDate(saved.lastCompletedDate ?? null);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedDay,
        completedDays: [...completedDays],
        streak,
        score,
        lastCompletedDate,
      })
    );
  }, [selectedDay, completedDays, streak, score, lastCompletedDate]);

  const current = useMemo(
    () => dailyContent.find((item) => item.day === Number(selectedDay)) || dailyContent[0],
    [selectedDay]
  );

  const chumash = chumashByDayOfWeek[todayDayOfWeek];
  const completed = completedDays.has(selectedDay);

  const markDone = () => {
    if (completed) return;
    const todayStr = now.toDateString();
    const yesterdayStr = new Date(now - 86_400_000).toDateString();
    const newSet = new Set(completedDays);
    newSet.add(selectedDay);
    setCompletedDays(newSet);
    setScore((prev) => prev + 10);
    setStreak((prev) => (lastCompletedDate === yesterdayStr ? prev + 1 : 1));
    setLastCompletedDate(todayStr);
  };

  const resetProgress = () => {
    setCompletedDays(new Set());
    setStreak(0);
    setScore(0);
    setLastCompletedDate(null);
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
          <strong>{completed ? '✓ הושלם' : 'פתוח'}</strong>
          <span>{completed ? 'יום זה סומן כהושלם' : 'עדיין לא סומן'}</span>
        </div>
      </div>

      <div className="daily-grid">
        <article className="card today-card">
          <h3>תוכן היום</h3>
          <p className="text-soft">בחר יום בחודש להצגת תהילים ותניא</p>
          <select value={selectedDay} onChange={(e) => setSelectedDay(Number(e.target.value))}>
            {dailyContent.map((item) => (
              <option key={item.day} value={item.day}>
                יום {item.day}{completedDays.has(item.day) ? ' ✓' : ''}
              </option>
            ))}
          </select>

          <div className="content-list">
            <div>
              <span className="label">חומש — {chumash.label}</span>
              <p className="text-soft">{chumash.description}</p>
              <p className="day-of-week-note">יום {DAY_NAMES[todayDayOfWeek]}</p>
            </div>
            <div>
              <span className="label">תהילים — פרקים {current.tehillim}</span>
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
            <strong>{score} נקודות</strong>
          </div>
          <div className="progress-block">
            <span className="small-label">הושלמו החודש</span>
            <strong>{completedDays.size} / 30</strong>
          </div>
          <p className="text-soft">סמן כל יום כהושלם כדי לשמור על הרצף ולצבור נקודות.</p>
          <div className="control-row">
            <button className="primary" onClick={markDone} disabled={completed}>
              {completed ? 'הושלם ✓' : 'סמן כמושלם'}
            </button>
            <button className="secondary" onClick={resetProgress}>
              איפוס
            </button>
          </div>
        </article>
      </div>

      <div className="card notes-card">
        <h3>הסבר לימוד ליום {current.day}</h3>
        {current.notes.split('\n').map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </section>
  );
}

export default DailyBoard;
