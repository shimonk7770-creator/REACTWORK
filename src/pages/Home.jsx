import { Link } from 'react-router-dom';

function Home() {
  return (
    <section>
      <div className="card">
        <h2>ברוכים הבאים ל-חת"ת היומי</h2>
        <p>
          כאן אפשר לעקוב אחרי לימוד יומי של חומש, תהילים ותניא, לצבור ניקוד על רצף
          יומי ולשחק בחידון פרשת השבוע.
        </p>
      </div>

      <div className="stats-grid">
        <article className="card">
          <h3>לוח יומי</h3>
          <p>צפה בתוכן היומי לפי היום בחודש עם חומש, תהילים ותניא.</p>
          <Link to="/daily" className="primary">פתח את לוח היומי</Link>
        </article>

        <article className="card">
          <h3>חידון פרשה</h3>
          <p>שאלות טריוויה על פרשת השבוע עם ניקוד ורמות קושי.</p>
          <Link to="/quiz" className="primary">עבור לחידון</Link>
        </article>
      </div>
    </section>
  );
}

export default Home;
