// לוח פרשות לשנת ה'תשפ"ו (2025–2026)
// כל רשומה = תאריך השבת שבה הפרשה נקראת בציבור
const PARASHA_SCHEDULE = [
  { date: '2025-10-18', name: 'בראשית',          book: 'בראשית' },
  { date: '2025-10-25', name: 'נח',               book: 'בראשית' },
  { date: '2025-11-01', name: 'לך לך',            book: 'בראשית' },
  { date: '2025-11-08', name: 'וירא',             book: 'בראשית' },
  { date: '2025-11-15', name: 'חיי שרה',          book: 'בראשית' },
  { date: '2025-11-22', name: 'תולדות',           book: 'בראשית' },
  { date: '2025-11-29', name: 'ויצא',             book: 'בראשית' },
  { date: '2025-12-06', name: 'וישלח',            book: 'בראשית' },
  { date: '2025-12-13', name: 'וישב',             book: 'בראשית' },
  { date: '2025-12-20', name: 'מקץ',              book: 'בראשית' },
  { date: '2025-12-27', name: 'ויגש',             book: 'בראשית' },
  { date: '2026-01-03', name: 'ויחי',             book: 'בראשית' },
  { date: '2026-01-10', name: 'שמות',             book: 'שמות'   },
  { date: '2026-01-17', name: 'וארא',             book: 'שמות'   },
  { date: '2026-01-24', name: 'בא',               book: 'שמות'   },
  { date: '2026-01-31', name: 'בשלח',             book: 'שמות'   },
  { date: '2026-02-07', name: 'יתרו',             book: 'שמות'   },
  { date: '2026-02-14', name: 'משפטים',           book: 'שמות'   },
  { date: '2026-02-21', name: 'תרומה',            book: 'שמות'   },
  { date: '2026-02-28', name: 'תצוה',             book: 'שמות'   },
  { date: '2026-03-07', name: 'כי תשא',           book: 'שמות'   },
  { date: '2026-03-14', name: 'ויקהל–פקודי',      book: 'שמות'   },
  { date: '2026-03-21', name: 'ויקרא',            book: 'ויקרא'  },
  { date: '2026-03-28', name: 'צו',               book: 'ויקרא'  },
  // שבת חוה"מ פסח (04/04) — קריאה מיוחדת, שמיני נדחית
  { date: '2026-04-11', name: 'שמיני',            book: 'ויקרא'  },
  { date: '2026-04-18', name: 'תזריע–מצורע',      book: 'ויקרא'  },
  { date: '2026-04-25', name: 'אחרי מות–קדושים',  book: 'ויקרא'  },
  { date: '2026-05-02', name: 'בהר–בחוקותי',      book: 'ויקרא'  },
  { date: '2026-05-09', name: 'במדבר',            book: 'במדבר'  },
  { date: '2026-05-16', name: 'נשא',              book: 'במדבר'  },
  // שבועות (23/05) — קריאה מיוחדת, בהעלותך נדחית
  { date: '2026-05-30', name: 'בהעלותך',          book: 'במדבר'  },
  { date: '2026-06-06', name: 'שלח',              book: 'במדבר'  },
  { date: '2026-06-13', name: 'קרח',              book: 'במדבר'  },
  { date: '2026-06-20', name: 'חוקת',             book: 'במדבר'  },
  { date: '2026-06-27', name: 'בלק',              book: 'במדבר'  },
  { date: '2026-07-04', name: 'פינחס',            book: 'במדבר'  },
  { date: '2026-07-11', name: 'מטות–מסעי',        book: 'במדבר'  },
  { date: '2026-07-18', name: 'דברים',            book: 'דברים'  },
  { date: '2026-07-25', name: 'ואתחנן',           book: 'דברים'  },
  { date: '2026-08-01', name: 'עקב',              book: 'דברים'  },
  { date: '2026-08-08', name: 'ראה',              book: 'דברים'  },
  { date: '2026-08-15', name: 'שופטים',           book: 'דברים'  },
  { date: '2026-08-22', name: 'כי תצא',           book: 'דברים'  },
  { date: '2026-08-29', name: 'כי תבוא',          book: 'דברים'  },
  { date: '2026-09-05', name: 'נצבים–וילך',       book: 'דברים'  },
  { date: '2026-09-12', name: 'האזינו',           book: 'דברים'  },
];

// מחזיר את פרשת השבוע הנוכחית (השבת הקרובה)
export function getCurrentParasha() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayOfWeek = today.getDay(); // 0=ראשון … 6=שבת
  const daysToShabbat = dayOfWeek === 6 ? 0 : 6 - dayOfWeek;
  const targetShabbat = new Date(today);
  targetShabbat.setDate(today.getDate() + daysToShabbat);

  let best = PARASHA_SCHEDULE[0];
  let minDiff = Infinity;
  for (const entry of PARASHA_SCHEDULE) {
    const d = new Date(entry.date);
    d.setHours(0, 0, 0, 0);
    const diff = Math.abs(d - targetShabbat);
    if (diff < minDiff) { minDiff = diff; best = entry; }
  }
  return best;
}
