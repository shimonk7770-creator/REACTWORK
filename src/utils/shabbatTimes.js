import { HebrewCalendar, Location } from '@hebcal/core';

const CITY_KEY = 'reactwork-city';
const DEFAULT_CITY = 'Jerusalem';

export function loadCityName() {
  return localStorage.getItem(CITY_KEY) || DEFAULT_CITY;
}

export function saveCityName(name) {
  localStorage.setItem(CITY_KEY, name);
}

// מוצא את זמני כניסת/יציאת השבת הקרובה + אירועים מיוחדים בשבועיים הקרובים,
// לפי עיר נתונה (ברירת מחדל ירושלים). מחזיר null אם העיר לא נמצאה.
export function getUpcomingShabbat(cityName = DEFAULT_CITY) {
  const location = Location.lookup(cityName);
  if (!location) return null;

  const start = new Date();
  const end = new Date(start.getTime() + 14 * 86_400_000);
  const events = HebrewCalendar.calendar({
    start, end, location, il: location.getIsrael(),
    candlelighting: true, sedrot: true, yomTov: true,
  });

  const candleEvt   = events.find((e) => e.getDesc() === 'Candle lighting');
  const havdalahEvt = events.find((e) => e.getDesc() === 'Havdalah');
  const parashaEvt  = events.find((e) => e.getDesc().startsWith('Parashat'));

  const upcoming = events
    .filter((e) => !['Candle lighting', 'Havdalah'].includes(e.getDesc()))
    .filter((e) => e !== parashaEvt)
    .slice(0, 4)
    .map((e) => ({ title: e.render('he'), date: e.getDate().greg() }));

  return {
    cityHe: location.getName(),
    candleLighting: candleEvt ? { time: candleEvt.render('he').replace('הַדְלָקַת נֵרוֹת: ', ''), date: candleEvt.getDate().greg() } : null,
    havdalah: havdalahEvt ? { time: havdalahEvt.render('he').replace('הַבְדָּלָה: ', ''), date: havdalahEvt.getDate().greg() } : null,
    parashaHe: parashaEvt ? parashaEvt.render('he').replace('פָּרָשַׁת ', '') : null,
    upcoming,
  };
}
