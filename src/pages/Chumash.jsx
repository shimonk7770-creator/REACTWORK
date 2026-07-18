import { useEffect, useState } from 'react';
import { chumashByDayOfWeek } from '../data/dailyContent.js';
import { useDailyProgress } from '../hooks/useDailyProgress.js';
import HebrewCalendarGrid from '../components/HebrewCalendarGrid.jsx';
import ProgressWidget from '../components/ProgressWidget.jsx';
import TextViewer from '../components/TextViewer.jsx';

const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function parseSefariaRef(ref) {
  const m = ref.match(/^(.+?)\s+(\d+):(\d+)-(?:(\d+):)?(\d+)$/);
  if (!m) return null;
  const [, book, c1, v1, c2, v2] = m;
  return { book, c1: Number(c1), v1: Number(v1), c2: c2 ? Number(c2) : Number(c1), v2: Number(v2) };
}

// ממזג שני רפרנסי Sefaria רציפים לטווח אחד (למשל עליות ו'+ז' של יום שישי)
function mergeSefariaRefs(refA, refB) {
  const a = parseSefariaRef(refA);
  const b = parseSefariaRef(refB);
  if (!a || !b) return refA;
  return `${a.book} ${a.c1}:${a.v1}-${b.c2}:${b.v2}`;
}

// בונה את רפרנס העלייה המדויקת ליום נבחר, מתוך extraDetails.aliyot
// שמחזירה Sefaria (טווח פסוקים לכל אחת מ-7 העליות). יום שישי = עליות
// ו'+ז' יחד, שבת = הפרשה כולה.
function refForDayOfWeek(calendarItem, dayOfWeek) {
  if (!calendarItem) return null;
  if (dayOfWeek === 6) return calendarItem.ref;
  const aliyot = calendarItem.extraDetails?.aliyot;
  if (!aliyot || aliyot.length < 7) return calendarItem.ref;
  if (dayOfWeek === 5) return mergeSefariaRefs(aliyot[5], aliyot[6]);
  return aliyot[dayOfWeek];
}

const BOOK_HE = {
  Genesis: 'בראשית', Exodus: 'שמות', Leviticus: 'ויקרא',
  Numbers: 'במדבר', Deuteronomy: 'דברים',
};
function bookNameFromRef(ref) {
  return BOOK_HE[ref?.split(' ')[0]] || '';
}

function Chumash() {
  const progress = useDailyProgress();
  const { dayInfo, dayOfWeek, selectedDate, selectDate, isToday, completedDays, completed, justCompleted } = progress;

  const [calendarItem, setCalendarItem] = useState(null);

  useEffect(() => { document.title = 'חומש | חת"ת יומי'; }, []);

  // שולפים את לוח השנה של Sefaria **לפי היום שנבחר בפועל** (לא תמיד "היום") —
  // כך ששבוע אחר בלוח מציג את הפרשה הנכונה שלו, לא תמיד פרשת השבוע הנוכחית.
  useEffect(() => {
    const y = selectedDate.getFullYear();
    const m = selectedDate.getMonth() + 1;
    const d = selectedDate.getDate();
    setCalendarItem(null);
    fetch(`https://www.sefaria.org/api/calendars?year=${y}&month=${m}&day=${d}`)
      .then((r) => r.json())
      .then((data) => {
        const item = data.calendar_items?.find((c) => c.title?.en === 'Parashat Hashavua');
        if (item) setCalendarItem(item);
      })
      .catch(() => {});
  }, [selectedDate]);

  const chumash = chumashByDayOfWeek[dayOfWeek];
  const parashaName = calendarItem?.displayValue?.he;
  const parashaBook = bookNameFromRef(calendarItem?.ref);
  const dayRef = refForDayOfWeek(calendarItem, dayOfWeek);

  return (
    <section>
      <HebrewCalendarGrid
        completedDays={completedDays}
        selectedDay={dayInfo.day}
        onSelectDay={(_heDay, date) => selectDate(date)}
      />

      <div className={`card page-intro-card subject-hero chumash${justCompleted ? ' just-completed' : ''}`}>
        <div>
          <span className="pill">📜 חומש</span>
          <h2>{parashaName ? `פרשת ${parashaName}` : '⏳ טוען פרשת השבוע...'}</h2>
          <p>
            {isToday ? 'היום' : `יום ${DAY_NAMES[dayOfWeek]}`} · {chumash.label}
            {parashaBook ? ` · ספר ${parashaBook}` : ''}
          </p>
        </div>
        <div className="summary-badge">
          <strong>{completed ? '✓ הושלם' : 'פתוח'}</strong>
          <span>{completed ? 'יום זה סומן כהושלם' : 'עדיין לא סומן'}</span>
        </div>
      </div>

      <article className="card today-card">
        <h3>עלייה יומית</h3>
        <p className="text-soft">{chumash.description}</p>
        {dayRef ? (
          <TextViewer sefariaRef={dayRef} fallbackLabel="Sefaria.org" autoOpen />
        ) : (
          <p className="text-viewer-status">⏳ טוען את פרשת השבוע...</p>
        )}
      </article>

      <ProgressWidget progress={progress} doneLabel="סמנתי כנלמד" />

      <div className="card notes-card">
        <h3>הסבר לימוד{parashaName ? ` — פרשת ${parashaName}` : ''}</h3>
        {calendarItem?.description?.he ? (
          <p>{calendarItem.description.he}</p>
        ) : (
          <p className="text-soft">⏳ טוען הסבר על הפרשה...</p>
        )}
      </div>
    </section>
  );
}

export default Chumash;
