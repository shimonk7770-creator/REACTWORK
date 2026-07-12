import { useEffect, useState } from 'react';
import { applyFontSize } from '../utils/fontSize.js';
import { applyTheme, loadTheme } from '../utils/theme.js';

const SETTINGS_KEY = 'reactwork-settings';
const DAILY_KEY = 'reactwork-daily-state';
const QUIZ_DIFFICULTIES = ['קל', 'בינוני', 'קשה'];
const FONT_SIZES = [
  { value: 'normal', label: 'רגיל' },
  { value: 'large',  label: 'גדול' },
  { value: 'xlarge', label: 'גדול מאוד' },
];
const THEMES = [
  { value: 'light', label: '☀️ בהיר' },
  { value: 'dark',  label: '🌙 כהה' },
];

function Settings() {
  useEffect(() => { document.title = 'הגדרות | חת"ת יומי'; }, []);
  const [remindersOn, setRemindersOn] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [fontSize, setFontSize] = useState('normal');
  const [theme, setTheme] = useState('light');
  const [stats, setStats] = useState({ streak: 0, score: 0, completedDays: 0, quizBest: 0 });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    if (s.remindersOn !== undefined) setRemindersOn(s.remindersOn);
    if (s.reminderTime) setReminderTime(s.reminderTime);
    if (s.fontSize) setFontSize(s.fontSize);
    setTheme(loadTheme());

    const d = JSON.parse(localStorage.getItem(DAILY_KEY) || '{}');
    const quizBest = QUIZ_DIFFICULTIES.reduce((sum, level) => {
      return sum + parseInt(localStorage.getItem(`reactwork-quiz-best:${level}`) || '0', 10);
    }, 0);
    setStats({
      streak: d.streak || 0,
      score: d.score || 0,
      completedDays: (d.completedDays || []).length,
      quizBest,
    });
  }, []);

  const saveSettings = () => {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...s, remindersOn, reminderTime }));
    localStorage.removeItem('reactwork-reminder-seen');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const changeTheme = (value) => {
    setTheme(value);
    applyTheme(value);
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...s, theme: value }));
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    applyFontSize(size);
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...s, fontSize: size }));
  };

  return (
    <section>
      <div className="hero-card settings-hero card">
        <span className="settings-icon">⚙️</span>
        <span className="pill">הגדרות</span>
        <h2 className="hero-title">נהלו את הלימוד שלכם</h2>
        <p className="hero-subtitle">שעת תזכורת קבועה וסטטיסטיקה אישית — הכל במקום אחד.</p>
      </div>

      <div className="stats-grid">
        <div className="card accent-card accent-purple">
          <h3>📊 סטטיסטיקה אישית</h3>
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
              <span className="small-label">סה״כ שיאי חידון (3 רמות)</span>
              <strong className="stat-number">{stats.quizBest}</strong>
              <span className="stat-unit">נקודות</span>
            </div>
          </div>

          <div className="progress-bar-wrap" style={{ marginTop: '8px' }}>
            <div className="progress-bar-head">
              <span className="small-label">התקדמות החודש</span>
              <span className="progress-pct">{Math.round((stats.completedDays / 30) * 100)}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(stats.completedDays / 30) * 100}%` }} />
            </div>
            <p className="progress-count">{stats.completedDays} מתוך 30 ימים הושלמו החודש</p>
          </div>
        </div>

        <div className="card accent-card accent-gold">
          <h3>⏰ תזכורת יומית</h3>
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

      <div className="card accent-card accent-red">
        <h3>♿ התאמה אישית</h3>
        <p className="text-soft">התאימו את התצוגה לצרכים שלכם.</p>

        <span className="small-label" style={{ marginTop: '14px', display: 'block' }}>ערכת נושא</span>
        <div className="option-pill-row">
          {THEMES.map((t) => (
            <button
              key={t.value}
              className={`option-pill${theme === t.value ? ' active' : ''}`}
              onClick={() => changeTheme(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <span className="small-label" style={{ marginTop: '18px', display: 'block' }}>גודל גופן</span>
        <div className="option-pill-row">
          {FONT_SIZES.map((f) => (
            <button
              key={f.value}
              className={`option-pill${fontSize === f.value ? ' active' : ''}`}
              onClick={() => changeFontSize(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card accent-card accent-blue">
        <h3>📖 מהו חת״ת?</h3>
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

      <div className="card accent-card accent-teal">
        <h3>💌 מקווים שנהנתם!</h3>
        <p>
          תודה שאתם משתמשים באתר וממשיכים ללמוד יום־יום. כל פרק תהילים, כל עלייה בחומש
          וכל קטע תניא — הם עוד לבנה בבניין. שיהיה בהצלחה, ושתזכו להמשיך ולהתחזק!
        </p>
        <div className="chitas-grid">
          <div className="chitas-item">
            <span className="label">📞 צרו קשר עם חב״ד</span>
            <p>
              מחפשים בית חב״ד קרוב אליכם, שיעור תורה, או עזרה בכל נושא?{' '}
              <a href="https://www.chabad.org.il" target="_blank" rel="noreferrer" className="text-viewer-link">
                חב״ד ישראל
              </a>{' '}
              ו-{' '}
              <a href="https://www.chabad.org" target="_blank" rel="noreferrer" className="text-viewer-link">
                Chabad.org
              </a>{' '}
              ישמחו לעזור בכל שאלה.
            </p>
          </div>
          <div className="chitas-item">
            <span className="label">🕯️ עשו עוד מצווה</span>
            <p>
              הדלקת נרות, הנחת תפילין, קביעת מזוזה, נתינת צדקה — כל מצווה קטנה מאירה עוד
              יותר. כמו שאומרים: "מצווה גוררת מצווה".
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Settings;
