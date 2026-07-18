import { useEffect, useState } from 'react';
import { dailyContent } from '../data/dailyContent.js';
import { useDailyProgress } from '../hooks/useDailyProgress.js';
import HebrewCalendarGrid from '../components/HebrewCalendarGrid.jsx';
import ProgressWidget from '../components/ProgressWidget.jsx';
import TextViewer from '../components/TextViewer.jsx';

const stripTags = (s) => s.replace(/<[^>]*>/g, '').trim();

// מרכך את שדה he שמחזירה Sefaria (מחרוזת בודדת / מערך / מערך מקונן)
// למחרוזת טקסט אחת נטולת תגיות, כדי לבדוק את אורכו בפועל.
function flattenHe(he) {
  if (!he) return '';
  if (typeof he === 'string') return stripTags(he);
  const flat = Array.isArray(he[0]) ? he.flat() : he;
  return flat.map(stripTags).join(' ');
}

function Tanya() {
  const progress = useDailyProgress();
  const { dayInfo, selectedDate, selectDate, isToday, completedDays, completed, justCompleted } = progress;

  const [tanyaYomi, setTanyaYomi] = useState(null);
  const [tanyaError, setTanyaError] = useState(false);

  useEffect(() => { document.title = 'תניא | חת"ת יומי'; }, []);

  // "תניא יומי" האמיתי מ-Sefaria — נשלף **לפי היום שנבחר בפועל** (לא רק
  // "היום"), כך שכל תאריך בלוח מציג את שיעור התניא המדויק שלו, בדיוק
  // כמו תהילים. המיפוי המקומי המקורב (dailyContent.js) משמש רק אם הבקשה
  // נכשלת (למשל אין רשת).
  useEffect(() => {
    const y = selectedDate.getFullYear();
    const m = selectedDate.getMonth() + 1;
    const d = selectedDate.getDate();
    let cancelled = false;
    setTanyaYomi(null);
    setTanyaError(false);

    (async () => {
      try {
        const calRes = await fetch(`https://www.sefaria.org/api/calendars?year=${y}&month=${m}&day=${d}`);
        const calData = await calRes.json();
        const item = calData.calendar_items?.find((c) => c.title?.en === 'Tanya Yomi');
        if (!item) throw new Error('no tanya item');

        // בחלק מהימים (בעיקר איגרות הקודש) הרפרנס שמחזירה Sefaria מצביע
        // על פסוק בודד שהוא בפועל רק כותרת/הערה היסטורית קצרה שמקדימה
        // את האיגרת (למשל "אחר ביאתו מפטרבורג"), לא תוכן השיעור עצמו.
        // אם הטקסט שחוזר קצר באופן חריג, מרחיבים לרפרנס הפרק/האיגרת
        // השלמה (מסירים את ה-":מספר") במקום.
        let effectiveRef = item.ref;
        const singleVerse = /:\d+$/.test(item.ref);
        if (singleVerse) {
          const textRes = await fetch(
            `https://www.sefaria.org/api/texts/${encodeURIComponent(item.ref)}?lang=he&context=0&sheets=0`
          );
          const textData = await textRes.json();
          const flat = flattenHe(textData.he);
          if (flat.length < 80) effectiveRef = item.ref.replace(/:\d+$/, '');
        }

        if (!cancelled) setTanyaYomi({ ...item, ref: effectiveRef });
      } catch {
        if (!cancelled) setTanyaError(true);
      }
    })();

    return () => { cancelled = true; };
  }, [selectedDate]);

  const entries = dayInfo.days
    .map((d) => dailyContent.find((item) => item.day === d))
    .filter(Boolean);

  const useLive = !!tanyaYomi;

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
        {useLive ? (
          <div className="content-list">
            <span className="label">תניא יומי — {tanyaYomi.displayValue?.he || tanyaYomi.ref}</span>
            <TextViewer sefariaRef={tanyaYomi.ref} fallbackLabel="Sefaria.org" autoOpen />
          </div>
        ) : tanyaError ? (
          entries.map((entry) => (
            <div key={entry.day} className="content-list" style={{ marginBottom: '10px' }}>
              <span className="label">{entry.tanya}</span>
              <TextViewer sefariaRef={entry.tanyaRef} fallbackLabel="Sefaria.org" autoOpen />
            </div>
          ))
        ) : (
          <p className="text-viewer-status">⏳ טוען את שיעור התניא ליום זה...</p>
        )}
        {tanyaError && (
          <p className="text-soft" style={{ fontSize: '0.85rem', marginTop: '10px' }}>
            ℹ️ לא ניתן היה לטעון את לוח "תניא יומי" המדויק מ-Sefaria (למשל בעיית רשת) — מוצג במקום
            מיפוי מקומי מקורב, לפי היום העברי בחודש.
          </p>
        )}
        {dayInfo.isCombinedDay && (
          <p className="text-soft" style={{ fontSize: '0.85rem' }}>
            חודש חסר — יומיים כ״ט ול׳ נלמדים יחד, כמנהג חב״ד.
          </p>
        )}
      </article>

      <ProgressWidget progress={progress} doneLabel="סמנתי כנלמד" />

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
