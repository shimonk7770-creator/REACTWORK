import { useEffect } from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  useEffect(() => { document.title = 'דף לא נמצא | חת"ת יומי'; }, []);

  return (
    <section style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div className="card" style={{ maxWidth: '420px', margin: '0 auto' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📭</div>
        <h2>הדף לא נמצא</h2>
        <p className="text-soft">הכתובת שביקשת אינה קיימת באפליקציה.</p>
        <div style={{ marginTop: '28px' }}>
          <Link to="/" className="primary">חזרה לדף הבית</Link>
        </div>
      </div>
    </section>
  );
}

export default NotFound;
