import { useEffect, useMemo, useState } from 'react';
import { chumashByDayOfWeek, dailyContent } from '../data/dailyContent.js';
import { getCurrentParasha } from '../data/parashaData.js';
import HebrewCalendarGrid from '../components/HebrewCalendarGrid.jsx';

const STORAGE_KEY = 'reactwork-daily-state';
const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const MILESTONES = [
  { days: 7,  bonus: 50,  emoji: '🎉', label: 'שבוע שלם!'         },
  { days: 14, bonus: 100, emoji: '⭐', label: 'שבועיים ברצף!'      },
  { days: 21, bonus: 150, emoji: '🌟', label: 'שלושה שבועות!'      },
  { days: 30, bonus: 200, emoji: '🏆', label: 'חודש שלם!'          },
];

function DailyBoard() {
  const now = new Date();
  const todayDate    = now.getDate();
  const todayDayOfWeek = now.getDay();

  const [selectedDay,       setSelectedDay]       = useState(todayDate);
  const [completedDays,     setCompletedDays]     = useState(new Set());
  const [streak,            setStreak]            = useState(0);
  const [score,             setScore]             = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState(null);
  const [milestoneAlert,    setMilestoneAlert]    = useState(null);
  const [justCompleted,     setJustCompleted]     = useState(false);
  const [scoreAnim,         setScoreAnim]         = useState(false);
  const [streakAnim,        setStreakAnim]         = useState(false);

  useEffect(() => { document.title = 'לוח יומי | חת"ת יומי'; }, []);

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
      JSON.stringify({ selectedDay, completedDays: [...completedDays], streak, score, lastCompletedDate })
    );
  }, [selectedDay, completedDays, streak, score, lastCompletedDate]);

  const current   = useMemo(
    () => dailyContent.find((item) => item.day === Number(selectedDay)) || dailyContent[0],
    [selectedDay]
  );
  const chumash   = chumashByDayOfWeek[todayDayOfWeek];
  const parasha   = getCurrentParasha();
  const completed = completedDays.has(selectedDay);

  const nextMilestone = MILESTONES.find((m) => m.days > streak);

  const streakEmoji = streak >= 30 ? '🏆' : streak >= 21 ? '🌟' : streak >= 14 ? '⭐' : streak >= 7 ? '🎉' : '';

  const markDone = () => {
    if (completed) return;
    const todayStr     = now.toDateString();
    const yesterdayStr = new Date(now - 86_400_000).toDateString();

    const newSet    = new Set(completedDays);
    newSet.add(selectedDay);
    setCompletedDays(newSet);

    const newStreak  = lastCompletedDate === yesterdayStr ? streak + 1 : 1;
    setStreak(newStreak);
    setLastCompletedDate(todayStr);

    const milestone = MILESTONES.find((m) => m.days === newStreak);
    setScore((prev) => prev + 10 + (milestone?.bonus ?? 0));

    // אנימציות
    setJustCompleted(true);
    setScoreAnim(true);
    setStreakAnim(true);
    setTimeout(() => setJustCompleted(false), 1300);
    setTimeout(() => setScoreAnim(false),     800);
    setTimeout(() => setStreakAnim(false),     700);

    if (milestone) {
      setMilestoneAlert(milestone);
      setTimeout(() => setMilestoneAlert(null), 6000);
    }
  };

  const resetProgress = () => {
    setCompletedDays(new Set());
    setStreak(0);
    setScore(0);
    setLastCompletedDate(null);
    setMilestoneAlert(null);
  };

  return (
    <section>
      <HebrewCalendarGrid completedDays={completedDays} />

      {milestoneAlert && (
        <div className="milestone-banner">
          <span className="milestone-emoji">{milestoneAlert.emoji}</span>
          <div className="milestone-text">
            <strong>{milestoneAlert.label}</strong>
            <p>השלמת {milestoneAlert.days} ימים ברצף — +{milestoneAlert.bonus} נקודות בונוס!</p>
          </div>
          <button className="milestone-close" onClick={() => setMilestoneAlert(null)}>×</button>
        </div>
      )}

      <div className={`card page-intro-card${justCompleted ? ' just-completed' : ''}`}>
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
            <div className="parasha-block">
              <span className="label">חומש — פרשת <span className="parasha-name">{parasha.name}</span></span>
              <p>{chumash.label} · יום {DAY_NAMES[todayDayOfWeek]} · ספר {parasha.book}</p>
              <p className="text-soft" style={{ fontSize: '0.88rem', marginTop: '4px' }}>{chumash.description}</p>
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
            <div className="streak-row">
              <strong className={`streak-num${streakAnim ? ' streak-bounce' : ''}`}>{streak}</strong>
              <span className="streak-unit">ימים</span>
              {streakEmoji && <span className="streak-badge">{streakEmoji}</span>}
            </div>
          </div>

          <div className="progress-block">
            <span className="small-label">ניקוד מצטבר</span>
            <strong className={scoreAnim ? 'score-bump' : ''}>{score} נקודות</strong>
          </div>

          <div className="progress-bar-wrap">
            <div className="progress-bar-head">
              <span className="small-label">התקדמות החודש</span>
              <span className="progress-pct">{Math.round((completedDays.size / 30) * 100)}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(completedDays.size / 30) * 100}%` }} />
            </div>
            <div className="progress-markers">
              {[7, 14, 21, 30].map((m) => (
                <span
                  key={m}
                  className={`progress-marker ${completedDays.size >= m ? 'reached' : ''}`}
                  style={{ right: `${((30 - m) / 30) * 100}%` }}
                  title={`${m} ימים`}
                />
              ))}
            </div>
            <p className="progress-count">{completedDays.size} מתוך 30 ימים הושלמו החודש</p>
          </div>

          <div className="milestone-progress">
            <span className="small-label">יעד בונוס הבא</span>
            {nextMilestone ? (
              <p>
                {nextMilestone.emoji} עוד {nextMilestone.days - streak} ימים ל{nextMilestone.label}
                <br />
                <span className="bonus-note">+{nextMilestone.bonus} נקודות בונוס!</span>
              </p>
            ) : (
              <p>🏆 השגת את כל יעדי הבונוס!</p>
            )}
          </div>

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
