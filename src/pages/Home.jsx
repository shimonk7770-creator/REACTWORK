import { Link } from 'react-router-dom';

function Home() {
  return (
    <section>
      <div className="hero-card card">
        <span className="pill">התחל היום</span>
        <h2>חת"ת יומי במראה חדש</h2>
        <p>
          כל יום חומש, תהילים ותניא במקום אחד. צבור ניקוד על רצף, שאלון פרשה, ותזכורות שיעזרו לך לא לוותר.
        </p>
        <div className="hero-actions">
          <Link to="/daily" className="primary">פתח את לוח היומי</Link>
          <Link to="/quiz" className="secondary">חידון פרשה</Link>
        </div>
      </div>

      <div className="features-grid">
        <article className="feature-card card">
          <h3>לוח יום מעוצב</h3>
          <p>כל יום בחודש מוצג עם פרטי לימוד ברורים וחוויית מעבר נעימה.</p>
        </article>

        <article className="feature-card card">
          <h3>ניקוד ורצף</h3>
          <p>מקבל ניקוד על כל יום שמסומן כהושלם, כדי לשמור מוטיבציה.</p>
        </article>

        <article className="feature-card card">
          <h3>חידון פרשה</h3>
          <p>שאלות איכותיות ברמות קושי שונות כדי לעזור לזכור את הפרשה.</p>
        </article>
      </div>
    </section>
  );
}

export default Home;
