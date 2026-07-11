import { useEffect, useState } from 'react';
import { chumashByDayOfWeek } from '../data/dailyContent.js';
import { getCurrentParasha } from '../data/parashaData.js';
import { useDailyProgress } from '../hooks/useDailyProgress.js';
import HebrewCalendarGrid from '../components/HebrewCalendarGrid.jsx';
import ProgressWidget from '../components/ProgressWidget.jsx';
import TextViewer from '../components/TextViewer.jsx';

const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function Chumash() {
  const progress = useDailyProgress();
  const { dayInfo, dayOfWeek, selectedDate, selectDate, isToday, completedDays, completed, justCompleted } = progress;

  const [chumashRef, setChumashRef] = useState(null);

  useEffect(() => { document.title = 'חומש | חת"ת יומי'; }, []);

  useEffect(() => {
    fetch('https://www.sefaria.org/api/calendars')
      .then((r) => r.json())
      .then((data) => {
        const item = data.calendar_items?.find((c) => c.title?.en === 'Parashat Hashavua');
        if (item?.ref) setChumashRef(item.ref);
      })
      .catch(() => {});
  }, []);

  const chumash = chumashByDayOfWeek[dayOfWeek];
  const parasha = getCurrentParasha();

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
          <h2>פרשת {parasha.name}</h2>
          <p>
            {isToday ? 'היום' : `יום ${DAY_NAMES[dayOfWeek]}`} · {chumash.label} · ספר {parasha.book}
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
        {chumashRef ? (
          <TextViewer sefariaRef={chumashRef} fallbackLabel="Sefaria.org" autoOpen />
        ) : (
          <p className="text-viewer-status">⏳ טוען את פרשת השבוע...</p>
        )}
      </article>

      <ProgressWidget progress={progress} doneLabel="סמנתי כנלמד" />
    </section>
  );
}

export default Chumash;
