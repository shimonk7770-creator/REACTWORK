import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { chumashByDayOfWeek, dailyContent } from '../data/dailyContent.js';
import { getCurrentParasha } from '../data/parashaData.js';
import { getHebrewDayInfo } from '../utils/hebrewDate.js';
import { getUpcomingShabbat, loadCityName } from '../utils/shabbatTimes.js';
import { getTodaysThought } from '../data/dailyThoughts.js';

const DOW_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function Home() {
  useEffect(() => { document.title = 'חת"ת יומי'; }, []);

  const today = new Date();
  const dayInfo = getHebrewDayInfo(today);
  const chumash = chumashByDayOfWeek[today.getDay()];
  const parasha = getCurrentParasha();
  const entries = dayInfo.days
    .map((d) => dailyContent.find((item) => item.day === d))
    .filter(Boolean);

  const [shabbat, setShabbat] = useState(null);
  useEffect(() => {
    try { setShabbat(getUpcomingShabbat(loadCityName())); } catch { setShabbat(null); }
  }, []);

  return (
    <section>
      <div className="hero-card hero-card-big card">
        <span className="hero-wave">👋</span>
        <span className="pill">ברוך הבא</span>
        <h1 className="hero-title">בוא נלמד היום</h1>
        <p className="hero-subtitle">
          חת״ת יומי — חומש, תהילים ותניא בעיצוב חדש ומכובד, עם ניקוד רצף,
          חידון פרשה ותזכורות שיעזרו לך לא לוותר.
        </p>
        <p className="hero-rebbe-note">
          💡 על פי הוראת הרבי, נהוג ללמוד <strong>חת״ת</strong> — חומש, תהילים ותניא — בכל יום.
          כאן תמצאו את שלושתם במקום אחד, מסונכרנים ליום העברי.
        </p>
        <div className="hero-actions">
          <Link to="/chumash" className="subject-btn chumash">📜 התחל ללמוד חומש</Link>
          <Link to="/tehillim" className="subject-btn tehillim">📗 התחל ללמוד תהילים</Link>
          <Link to="/tanya" className="subject-btn tanya">📕 התחל ללמוד תניא</Link>
          <Link to="/quiz" className="subject-btn quiz">🧠 חידון פרשה</Link>
        </div>
      </div>

      <div className="card daily-thought-card">
        <span className="thought-mark">״</span>
        <p>{getTodaysThought(today)}</p>
      </div>

      <div className="card today-glance-card">
        <span className="pill">📆 היום, {dayInfo.dayHe} ב{dayInfo.monthName}</span>
        <h3>מה לומדים היום</h3>
        <div className="chitas-grid">
          <div className="chitas-item">
            <span className="label">📜 חומש</span>
            <p>{chumash.label} מפרשת {parasha.name}.</p>
          </div>
          <div className="chitas-item">
            <span className="label">📗 תהילים</span>
            <p>פרקים {entries.map((e) => e.tehillim).join(', ')}.</p>
          </div>
          <div className="chitas-item">
            <span className="label">📕 תניא</span>
            <p>{entries.map((e) => e.tanya).join('; ')}.</p>
          </div>
        </div>
      </div>

      {shabbat && (shabbat.candleLighting || shabbat.havdalah) && (
        <div className="card accent-card accent-gold">
          <span className="pill">🕯️ זמני שבת — {shabbat.cityHe}</span>
          <h3>{shabbat.parashaHe ? `פרשת ${shabbat.parashaHe}` : 'שבת קרובה'}</h3>
          <div className="chitas-grid">
            {shabbat.candleLighting && (
              <div className="chitas-item">
                <span className="label">🕯️ כניסת שבת</span>
                <p>יום {DOW_HE[shabbat.candleLighting.date.getDay()]} · {shabbat.candleLighting.time}</p>
              </div>
            )}
            {shabbat.havdalah && (
              <div className="chitas-item">
                <span className="label">✨ יציאת שבת</span>
                <p>יום {DOW_HE[shabbat.havdalah.date.getDay()]} · {shabbat.havdalah.time}</p>
              </div>
            )}
          </div>
          {shabbat.upcoming.length > 0 && (
            <p className="text-soft" style={{ fontSize: '0.85rem', marginTop: '12px' }}>
              בקרוב: {shabbat.upcoming.map((u) => u.title).join(' · ')}
            </p>
          )}
          <p className="text-soft" style={{ fontSize: '0.8rem', marginTop: '8px' }}>
            ניתן לשנות עיר ב<Link to="/settings" className="text-viewer-link">הגדרות</Link>.
          </p>
        </div>
      )}

      <div className="card video-card">
        <span className="pill">🎬 סרטון היום</span>
        <div className="video-embed-wrap">
          <iframe
            className="video-embed"
            src="https://www.youtube.com/embed/ormF3yMohnI?autoplay=1&mute=1&rel=0"
            title="סרטון חת״ת יומי"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      <div className="features-grid">
        <article className="feature-card card">
          <div className="feature-icon">📜</div>
          <h3>חומש</h3>
          <p>
            העלייה היומית של פרשת השבוע עם פירוש רש״י, לפי היום בשבוע.
          </p>
          <Link to="/chumash" className="feature-link">לעמוד החומש ←</Link>
        </article>

        <article className="feature-card card">
          <div className="feature-icon">📗</div>
          <h3>תהילים</h3>
          <p>
            פרקי היום מחולקים לפי היום העברי בחודש — מסונכרן ללוח העברי.
          </p>
          <Link to="/tehillim" className="feature-link">לעמוד התהילים ←</Link>
        </article>

        <article className="feature-card card">
          <div className="feature-icon">📕</div>
          <h3>תניא</h3>
          <p>
            שיעור התניא היומי, מסודר לפי היום העברי לאורך מחזור החודש.
          </p>
          <Link to="/tanya" className="feature-link">לעמוד התניא ←</Link>
        </article>

        <article className="feature-card card">
          <div className="feature-icon">🧠</div>
          <h3>חידון פרשה</h3>
          <p>
            10 שאלות על פרשת השבוע, שלוש רמות קושי — קל, בינוני וקשה.
          </p>
          <Link to="/quiz" className="feature-link">לחידון ←</Link>
        </article>
      </div>
    </section>
  );
}

export default Home;
