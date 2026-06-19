import { useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  useEffect(() => { document.title = 'חת"ת יומי'; }, []);
  return (
    <section>
      <div className="hero-card card">
        <span className="pill">התחל היום</span>
        <h2>חת״ת יומי במראה חדש</h2>
        <p>
          כל יום חומש, תהילים ותניא במקום אחד. צבור ניקוד על רצף, שאלון פרשה,
          ותזכורות שיעזרו לך לא לוותר.
        </p>
        <div className="hero-actions">
          <Link to="/daily" className="primary">פתח את לוח היומי</Link>
          <Link to="/quiz" className="secondary">חידון פרשה</Link>
        </div>
      </div>

      <div className="features-grid">
        <article className="feature-card card">
          <div className="feature-icon">📖</div>
          <h3>לוח יום מעוצב</h3>
          <p>
            חומש לפי יום בשבוע, תהילים לפי יום בחודש ותניא — הכל במקום אחד,
            ברור ונוח.
          </p>
          <Link to="/daily" className="feature-link">לוח יומי ←</Link>
        </article>

        <article className="feature-card card">
          <div className="feature-icon">🔥</div>
          <h3>ניקוד ורצף</h3>
          <p>
            מסמן יום כהושלם — מקבל 10 נקודות. שמור רצף יומי וצפה בהתקדמות
            שלך לאורך החודש.
          </p>
          <Link to="/daily" className="feature-link">לצבירת ניקוד ←</Link>
        </article>

        <article className="feature-card card">
          <div className="feature-icon">🧠</div>
          <h3>חידון פרשה</h3>
          <p>
            6 שאלות רנדומליות מ-20 שאלות על תורה. שלוש רמות קושי — קל, בינוני
            וקשה עם ניקוד לפי רמה.
          </p>
          <Link to="/quiz" className="feature-link">לחידון ←</Link>
        </article>

        <article className="feature-card card">
          <div className="feature-icon">🔔</div>
          <h3>תזכורות והגדרות</h3>
          <p>
            הגדר שעת לימוד קבועה וקבל תזכורת בתוך האפליקציה. עיין בסטטיסטיקה
            האישית שלך.
          </p>
          <Link to="/settings" className="feature-link">להגדרות ←</Link>
        </article>
      </div>
    </section>
  );
}

export default Home;
