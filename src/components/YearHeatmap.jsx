import { toLocalDateStr } from '../utils/hebrewDate.js';

const DOW_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

// בונה מפת "חממה" בסגנון GitHub contributions לשנה האחרונה (364 ימים),
// מסודרת בטורים שבועיים. history הוא מערך תאריכי ISO (YYYY-MM-DD).
function buildWeeks(history) {
  const historySet = new Set(history);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  // מיישרים להתחלת השבוע (ראשון) כדי שהטורים יהיו שלמים
  start.setDate(start.getDate() - start.getDay());

  const weeks = [];
  let cursor = new Date(start);
  while (cursor <= today) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      if (cursor > today) {
        week.push(null);
      } else {
        const dateStr = toLocalDateStr(cursor);
        week.push({ date: new Date(cursor), dateStr, done: historySet.has(dateStr) });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function YearHeatmap({ history = [] }) {
  const weeks = buildWeeks(history);
  const totalDone = new Set(history).size;

  return (
    <div className="heatmap-wrap">
      <div className="heatmap-scroll">
        <div className="heatmap-dow-col">
          {DOW_HE.map((d, i) => (
            <span key={i} className="heatmap-dow">{i % 2 === 1 ? d : ''}</span>
          ))}
        </div>
        <div className="heatmap-grid" dir="ltr">
          {weeks.map((week, wi) => (
            <div key={wi} className="heatmap-week">
              {week.map((day, di) => (
                day ? (
                  <span
                    key={di}
                    className={`heatmap-cell${day.done ? ' done' : ''}`}
                    title={`${day.dateStr}${day.done ? ' — הושלם' : ''}`}
                  />
                ) : <span key={di} className="heatmap-cell empty" />
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="text-soft" style={{ fontSize: '0.85rem', marginTop: '10px' }}>
        {totalDone} ימי לימוד בשנה האחרונה
      </p>
    </div>
  );
}

export default YearHeatmap;
