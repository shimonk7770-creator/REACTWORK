import { useState } from 'react';
import { HDate, HebrewCalendar, gematriya, Locale } from '@hebcal/core';

const DOW_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'שבת'];
const MONTHS_HE = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

// מסיר ניקוד (טעמי מקרא ותנועות, ֑-ׇ) כדי שאפשר יהיה
// להשוות/לחתוך מחרוזות עבריות מנוקדות שמחזיר hebcal (למשל
// "פָּרָשַׁת דְּבָרִים"), תוך שמירה על המקף העברי (maqaf, ־)
// כמקף רגיל (למשל "מטות־מסעי"). נכתב עם \uXXXX מפורש ולא תווים
// גולמיים כדי להימנע מבעיות נורמליזציה של combining marks.
// משווה לפי קוד-נקודה מספרי (לא regex עם תווי ניקוד גולמיים בקוד) —
// כדי להימנע מבעיות קידוד/נורמליזציה של combining marks עבריים.
const MAQAF_CODE = 0x05be;
const NIKUD_MIN = 0x0591;
const NIKUD_MAX = 0x05c7;
const stripNikud = (s) => Array.from(s).map((ch) => {
  const code = ch.codePointAt(0);
  if (code === MAQAF_CODE) return '-';
  if (code >= NIKUD_MIN && code <= NIKUD_MAX) return '';
  return ch;
}).join('');

function getMonthEvents(year, month) {
  const start = new HDate(new Date(year, month, 1));
  const end   = new HDate(new Date(year, month + 1, 0));
  const evts  = HebrewCalendar.calendar({
    start, end, il: true,
    yomTov: true, holidays: true, roshChodesh: true, sedrot: true,
  });
  const map = {};
  evts.forEach((ev) => {
    const d = ev.getDate().greg();
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!map[key]) map[key] = [];
    map[key].push(ev.renderBrief('he'));
  });
  return map;
}

function HebrewCalendarGrid({ completedDays = new Set(), selectedDay = null, onSelectDay = null }) {
  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const { year, month } = view;
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const events   = getMonthEvents(year, month);

  // בניית תאי הגריד (כולל ריקים בהתחלה)
  const startDow = firstDay.getDay(); // 0=Sun
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(d);

  const prevMonth = () => setView(v => {
    const m = v.month === 0 ? 11 : v.month - 1;
    const y = v.month === 0 ? v.year - 1 : v.year;
    return { year: y, month: m };
  });
  const nextMonth = () => setView(v => {
    const m = v.month === 11 ? 0 : v.month + 1;
    const y = v.month === 11 ? v.year + 1 : v.year;
    return { year: y, month: m };
  });

  return (
    <div className="card hcal-card">
      {/* כותרת + ניווט */}
      <div className="hcal-header">
        <button className="hcal-nav" onClick={prevMonth}>‹</button>
        <div className="hcal-title">
          <span className="hcal-month-name">{MONTHS_HE[month]} {year}</span>
          <span className="hcal-month-he">
            {Locale.gettext(new HDate(firstDay).getMonthName(), 'he')}
            {' – '}
            {Locale.gettext(new HDate(lastDay).getMonthName(), 'he')}
            {' '}
            {gematriya(new HDate(firstDay).getFullYear())}
          </span>
        </div>
        <button className="hcal-nav" onClick={nextMonth}>›</button>
      </div>

      {/* ימי שבוע */}
      <div className="hcal-grid">
        {DOW_HE.map((d) => (
          <div key={d} className={`hcal-dow${d === 'שבת' ? ' shabbat-col' : ''}`}>{d}</div>
        ))}

        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="hcal-cell empty" />;

          const date     = new Date(year, month, day);
          const hdate    = new HDate(date);
          const heDay    = gematriya(hdate.getDate());
          const isToday  = date.toDateString() === today.toDateString();
          const isDone   = completedDays.has(hdate.getDate()) &&
                           date.getMonth() === today.getMonth() &&
                           date.getFullYear() === today.getFullYear();
          const isSat      = date.getDay() === 6;
          const key        = `${year}-${month}-${day}`;
          const dayEvts    = events[key] || [];
          const isSelected = selectedDay != null && hdate.getDate() === selectedDay;
          const clickable  = typeof onSelectDay === 'function';
          const parashaEvt = isSat ? dayEvts.find((e) => stripNikud(e).startsWith('פרשת')) : null;
          const parashaName = parashaEvt ? stripNikud(parashaEvt).replace(/^פרשת\s*/, '') : null;

          return (
            <div
              key={day}
              className={[
                'hcal-cell',
                isToday    ? 'today'    : '',
                isDone     ? 'done'     : '',
                isSat      ? 'shabbat'  : '',
                isSelected ? 'selected' : '',
                clickable  ? 'clickable' : '',
              ].join(' ').trim()}
              onClick={clickable ? () => onSelectDay(hdate.getDate(), date) : undefined}
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : undefined}
              onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onSelectDay(hdate.getDate(), date); } : undefined}
            >
              <span className="hcal-greg">{day}</span>
              <span className="hcal-heb">{heDay}</span>
              {isDone && <span className="hcal-check">✓</span>}
              {parashaName && <span className="hcal-parasha">{parashaName}</span>}
              {dayEvts.length > 0 && (
                <span className="hcal-dot" title={dayEvts.join(' · ')} />
              )}
            </div>
          );
        })}
      </div>

      {/* מקרא */}
      <div className="hcal-legend">
        <span className="legend-item"><span className="leg-today" />היום</span>
        <span className="legend-item"><span className="leg-done" />הושלם</span>
        <span className="legend-item"><span className="leg-dot" />אירוע</span>
        {typeof onSelectDay === 'function' && (
          <span className="legend-item hcal-hint">👆 לחצו על יום לצפייה בתוכן שלו</span>
        )}
      </div>
    </div>
  );
}

export default HebrewCalendarGrid;
