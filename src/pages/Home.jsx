import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chumashByDayOfWeek, dailyContent } from '../data/dailyContent.js';
import { getCurrentParasha } from '../data/parashaData.js';
import { getHebrewDayInfo } from '../utils/hebrewDate.js';

function Home() {
  useEffect(() => { document.title = 'חת"ת יומי'; }, []);

  const today = new Date();
  const dayInfo = getHebrewDayInfo(today);
  const chumash = chumashByDayOfWeek[today.getDay()];
  const parasha = getCurrentParasha();
  const entries = dayInfo.days
    .map((d) => dailyContent.find((item) => item.day === d))
    .filter(Boolean);

  return (
    <section>
      <div className="hero-card card">
        <span className="pill">✨ התחל היום</span>
        <h2 className="hero-title">חת״ת יומי במראה חדש</h2>
        <p>
          כל יום חומש, תהילים ותניא — כל אחד בעמוד מכובד משלו. צבור ניקוד על
          רצף, שאלון פרשה, ותזכורות שיעזרו לך לא לוותר.
        </p>
        <div className="hero-actions">
          <Link to="/chumash" className="subject-btn chumash">📜 התחל ללמוד חומש</Link>
          <Link to="/tehillim" className="subject-btn tehillim">📗 התחל ללמוד תהילים</Link>
          <Link to="/tanya" className="subject-btn tanya">📕 התחל ללמוד תניא</Link>
          <Link to="/quiz" className="secondary">חידון פרשה</Link>
        </div>
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
