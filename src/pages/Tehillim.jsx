import { useEffect } from 'react';
import { dailyContent } from '../data/dailyContent.js';
import { useDailyProgress } from '../hooks/useDailyProgress.js';
import HebrewCalendarGrid from '../components/HebrewCalendarGrid.jsx';
import ProgressWidget from '../components/ProgressWidget.jsx';
import TextViewer from '../components/TextViewer.jsx';

function Tehillim() {
  const progress = useDailyProgress();
  const { dayInfo, selectDate, isToday, completedDays, completed, justCompleted } = progress;

  useEffect(() => { document.title = 'תהילים | חת"ת יומי'; }, []);

  const entries = dayInfo.days
    .map((d) => dailyContent.find((item) => item.day === d))
    .filter(Boolean);

  return (
    <section>
      <HebrewCalendarGrid
        completedDays={completedDays}
        selectedDay={dayInfo.day}
        onSelectDay={(_heDay, date) => selectDate(date)}
      />

      <div className={`card page-intro-card subject-hero tehillim${justCompleted ? ' just-completed' : ''}`}>
        <div>
          <span className="pill">📗 תהילים</span>
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
        <h3>פרקי היום</h3>
        {entries.map((entry) => (
          <div key={entry.day} className="content-list" style={{ marginBottom: '10px' }}>
            <span className="label">תהילים — פרקים {entry.tehillim}</span>
            <TextViewer sefariaRef={entry.tehillimRef} fallbackLabel="Sefaria.org" autoOpen />
          </div>
        ))}
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
          <p key={entry.day}>{entry.notes.split('\n').find((l) => l.startsWith('תהילים'))}</p>
        ))}
      </div>
    </section>
  );
}

export default Tehillim;
