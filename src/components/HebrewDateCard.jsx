import { HDate, HebrewCalendar } from '@hebcal/core';

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function HebrewDateCard() {
  const now = new Date();
  const hdate = new HDate(now);

  const dayName = DAYS_HE[now.getDay()];
  const hebrewDate = hdate.render('he');

  const gregorianStr = now.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // אירועים של היום: חגים, פרשה, ראש חודש וכו׳
  const events = HebrewCalendar.calendar({
    start: hdate,
    end: hdate,
    il: true,
    sedrot: true,
    yomTov: true,
    holidays: true,
    roshChodesh: true,
    shabbatMevarchim: true,
    omer: true,
  }).map((ev) => ev.renderBrief('he')).filter(Boolean);

  return (
    <div className="card hebrew-date-card">
      <div className="hdc-top">
        <div className="hdc-day-name">יום {dayName}</div>
        <div className="hdc-hebrew">{hebrewDate}</div>
        <div className="hdc-gregorian">{gregorianStr}</div>
      </div>

      {events.length > 0 && (
        <div className="hdc-events">
          {events.map((ev, i) => (
            <span key={i} className="hdc-event-pill">{ev}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default HebrewDateCard;
