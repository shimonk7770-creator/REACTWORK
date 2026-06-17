import { useEffect, useState } from 'react';

const SETTINGS_KEY = 'reactwork-settings';
const DAILY_KEY = 'reactwork-daily-state';
const QUIZ_KEY = 'reactwork-quiz-best';

function Settings() {
  const [remindersOn, setRemindersOn] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [stats, setStats] = useState({ streak: 0, score: 0, completedDays: 0, quizBest: 0 });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    if (s.remindersOn !== undefined) setRemindersOn(s.remindersOn);
    if (s.reminderTime) setReminderTime(s.reminderTime);

    const d = JSON.parse(localStorage.getItem(DAILY_KEY) || '{}');
    const quizBest = parseInt(localStorage.getItem(QUIZ_KEY) || '0', 10);
    setStats({
      streak: d.streak || 0,
      score: d.score || 0,
      completedDays: (d.completedDays || []).length,
      quizBest,
    });
  }, []);

  const saveSettings = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ remindersOn, reminderTime }));
    localStorage.removeItem('reactwork-reminder-seen');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <section>
      <div className="card page-intro-card">
        <div>
          <span className="pill">הגדרות</span>
          <h2>הגדרות ותזכורות</h2>
          <p>נהל את שעת הלימוד שלך ועיין בסטטיסטיקה האישית.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card">
          <h3>סטטיסטיקה אישית</h3>
          <div className="stat-row">
            <div className="progress-block">
              <span className="small-label">רצף לימוד</span>
              <strong className="stat-number">{stats.streak}</strong>
              <span className="stat-unit">ימים</span>
            </div>
            <div className="progress-block">
              <span className="small-label">ניקוד מצטבר</span>
              <strong className="stat-number">{stats.score}</strong>
              <span className="stat-unit">נקודות</span>
            </div>
          </div>
          <div className="stat-row">
            <div className="progress-block">
              <span className="small-label">ימים שהושלמו</span>
              <strong className="stat-number">{stats.completedDays}</strong>
              <span className="stat-unit">ימים</span>
            </div>
            <div className="progress-block">
              <span className="small-label">שיא חידון</span>
              <strong className="stat-number">{stats.quizBest}</strong>
              <span className="stat-unit">נקודות</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>תזכורת יומית</h3>
          <p className="text-soft">
            הגדר שעה קבועה ללימוד. כאשר תפתח את האפליקציה בזמן הקרוב לשעה שהגדרת, תקבל
            תזכורת לתוך האפליקציה.
          </p>

          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={remindersOn}
              onChange={(e) => setRemindersOn(e.target.checked)}
            />
            <span>תזכורת יומית פעילה</span>
          </label>

          {remindersOn && (
            <div className="progress-block" style={{ marginTop: '20px' }}>
              <span className="small-label">שעת תזכורת</span>
              <input
                type="time"
                value={reminderTime}
                dir="ltr"
                onChange={(e) => setReminderTime(e.target.value)}
              />
            </div>
          )}

          <div style={{ marginTop: '22px' }}>
            <button className="primary" onClick={saveSettings}>
              {saved ? 'נשמר בהצלחה!' : 'שמור הגדרות'}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>מהו חת״ת?</h3>
        <p>
          <strong>ח</strong>ומש, <strong>ת</strong>הילים ו<strong>ת</strong>ניא — לימוד יומי
          שמקיף את כל חמשת חומשי תורה, ספר תהילים וספר התניא בכל שנה.
        </p>
        <div className="chitas-grid">
          <div className="chitas-item">
            <span className="label">חומש</span>
            <p>שבע עליות מחולקות על שבעת ימי השבוע לפי פרשת השבוע. כל יום לומדים עלייה אחת עם פירוש רש״י.</p>
          </div>
          <div className="chitas-item">
            <span className="label">תהילים</span>
            <p>כל ספר תהילים (150 פרקים) מחולק לפי ימי החודש לשלושים חלקים. כל יום לומדים את החלק המתאים.</p>
          </div>
          <div className="chitas-item">
            <span className="label">תניא</span>
            <p>ספר התניא מחולק לפי ימי השנה. בכל יום לומדים קטע קבוע — כך מסיימים את הספר כולו מדי שנה.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Settings;
