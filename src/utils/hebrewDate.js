import { HDate, gematriya, Locale } from '@hebcal/core';

// מחרוזת תאריך מקומית YYYY-MM-DD — בכוונה לא toISOString(), כי זו
// ממירה ל-UTC ועלולה "להזיז" את התאריך ביום באזורי זמן חיוביים
// (למשל ישראל UTC+3), מה שגורם לחוסר-התאמה בהיסטוריית ימי לימוד.
export function toLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// מחזיר את מספר היום העברי בחודש (1–30) לתאריך נתון, כולל טיפול
// בחודשים חסרים (29 יום) — בהם יום כ"ט ול' נלמדים יחד לפי מנהג חב"ד.
export function getHebrewDayInfo(date = new Date()) {
  const hdate = new HDate(date);
  const day = hdate.getDate();
  const monthLength = hdate.daysInMonth();
  const isCombinedDay = monthLength === 29 && day === 29;
  const days = isCombinedDay ? [29, 30] : [day];

  return {
    hdate,
    day,
    monthLength,
    isCombinedDay,
    days,
    monthName: Locale.gettext(hdate.getMonthName(), 'he'),
    yearHe: gematriya(hdate.getFullYear()),
    dayHe: gematriya(day),
  };
}
