import { useEffect, useState } from 'react';
import { dailyContent } from '../data/dailyContent.js';
import { useDailyProgress } from '../hooks/useDailyProgress.js';
import HebrewCalendarGrid from '../components/HebrewCalendarGrid.jsx';
import ProgressWidget from '../components/ProgressWidget.jsx';
import TextViewer from '../components/TextViewer.jsx';

function Tanya() {
  const progress = useDailyProgress();
  const { dayInfo, selectDate, isToday, completedDays, completed, justCompleted } = progress;

  const [tanyaYomi, setTanyaYomi] = useState(null);

  useEffect(() => { document.title = 'תניא | חת"ת יומי'; }, []);

  // "תניא יומי" האמיתי מ-Sefaria — מחזור שנתי מדויק (לא-אחיד), שונה
  // מהמיפוי המקומי המקורב שמבוסס על 30 עמדות קבועות בחודש
  useEffect(() => {
    fetch('https://www.sefaria.org/api/calendars')
      .then((r) => r.json())
      .then((data) => {
        const item = data.calendar_items?.find((c) => c.title?.en === 'Tanya Yomi');
        if (item) setTanyaYomi(item);
      })
      .catch(() => {});
  }, []);

  const entries = dayInfo.days
    .map((d) => dailyContent.find((item) => item.day === d))
    .filter(Boolean);

  // עבור "היום" משתמשים ברפרנס האמיתי מ-Sefaria; עבור יום אחר שנבחר
  // בלוח — חוזרים למיפוי המקומי המקורב
  const useLiveToday = isToday && tanyaYomi;

  return (
    <section>
      <HebrewCalendarGrid
        completedDays={completedDays}
        selectedDay={dayInfo.day}
        onSelectDay={(_heDay, date) => selectDate(date)}
      />

      <div className={`card page-intro-card subject-hero tanya${justCompleted ? ' just-completed' : ''}`}>
        <div>
          <span className="pill">📕 תניא</span>
          <h2>
            {dayInfo.isCombinedDay ? `כ״ט–ל׳ ב${dayInfo.monthName}` : `יום ${dayInfo.dayHe} ב${dayInfo.monthName}`}
          </h2>
          <p>
            {isToday ? 'לפי היום העברי — היום' : 'לפי היום העברי שנבחר'} · {dayInfo.monthName} {dayInfo.yearHe}
          </p>
        </div>
        <div className="summary-badge">
          <strong>{completed ? '✓ הושלם' : 'פתוח'}</strong>
          <span>{completed ? 'יום זה סומן כהושלם' : 'עדיין לא סומן'}</span>
        </div>
      </div>

      <article className="card today-card">
        <h3>שיעור היום</h3>
        {useLiveToday ? (
          <div className="content-list">
            <span className="label">תניא יומי — {tanyaYomi.ref}</span>
            <TextViewer sefariaRef={tanyaYomi.ref} fallbackLabel="Sefaria.org" autoOpen />
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.day} className="content-list" style={{ marginBottom: '10px' }}>
              <span className="label">{entry.tanya}</span>
              <TextViewer sefariaRef={entry.tanyaRef} fallbackLabel="Sefaria.org" autoOpen />
            </div>
          ))
        )}
        {!isToday && (
          <p className="text-soft" style={{ fontSize: '0.85rem', marginTop: '10px' }}>
            ℹ️ עבור ימים שאינם היום, התוכן מבוסס על מחזור חודשי מקורב — ליום הנוכחי מוצג הרפרנס
            המדויק מלוח "תניא יומי" של Sefaria.
          </p>
        )}
        {dayInfo.isCombinedDay && (
          <p className="text-soft" style={{ fontSize: '0.85rem' }}>
            חודש חסר — יומיים כ״ט ול׳ נלמדים יחד, כמנהג חב״ד.
          </p>
        )}
      </article>

      <ProgressWidget progress={progress} doneLabel="סיימתי היום" />

      <div className="card notes-card">
        <h3>הסבר לימוד</h3>
        {entries.map((entry) => (
          <p key={entry.day}>{entry.notes.split('\n').find((l) => l.startsWith('תניא'))}</p>
        ))}
      </div>
    </section>
  );
}

export default Tanya;
