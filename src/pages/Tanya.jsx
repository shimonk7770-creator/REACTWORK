import { useEffect, useState } from 'react';
import { dailyContent } from '../data/dailyContent.js';
import { useDailyProgress } from '../hooks/useDailyProgress.js';
import HebrewCalendarGrid from '../components/HebrewCalendarGrid.jsx';
import ProgressWidget from '../components/ProgressWidget.jsx';
import TextViewer from '../components/TextViewer.jsx';

async function fetchTanyaYomiRef(y, m, d) {
  const res = await fetch(`https://www.sefaria.org/api/calendars?year=${y}&month=${m}&day=${d}`);
  const data = await res.json();
  const item = data.calendar_items?.find((c) => c.title?.en === 'Tanya Yomi');
  return item || null;
}

// Sefaria מחזירה רק את פסוק ההתחלה של כל יום, לא טווח. הטווח האמיתי
// של אותו יום הוא מפסוק ההתחלה שלו עד ועד בכלל פסוק ההתחלה של המחר
// (אומת ישירות מול he.chabad.org — כולל מקרים שבהם היום חוצה לאיגרת
// חדשה). בונים רפרנס-טווח משילוב שני הפסוקים.
function buildDayRangeRef(todayRef, tomorrowRef) {
  const m1 = todayRef.match(/^(.+?)\s+(\d+):(\d+)$/);
  const m2 = tomorrowRef?.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (!m1) return todayRef;
  if (!m2 || m1[1] !== m2[1]) return todayRef; // אין מחר בטווח, או שעברנו לאיגרת/חלק אחר לגמרי
  const [, prefix, c1, v1] = m1;
  const [, , c2, v2] = m2;
  return `${prefix} ${c1}:${v1}-${c2}:${v2}`;
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
    const tomorrow = new Date(selectedDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    let cancelled = false;
    setTanyaYomi(null);
    setTanyaError(false);

    (async () => {
      try {
        const [item, nextItem] = await Promise.all([
          fetchTanyaYomiRef(y, m, d),
          fetchTanyaYomiRef(tomorrow.getFullYear(), tomorrow.getMonth() + 1, tomorrow.getDate()),
        ]);
        if (!item) throw new Error('no tanya item');
        const effectiveRef = buildDayRangeRef(item.ref, nextItem?.ref);
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
