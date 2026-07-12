# ARCHITECTURE — חת״ת יומי

מסמך ארכיטקטורה טכני מפורט של אפליקציית "חת״ת יומי".

---

## סקירה כללית

"חת״ת יומי" היא **Single Page Application (SPA)** בנויה על React 18 + Vite 6, ללא backend וללא בסיס נתונים חיצוני. כל המצב נשמר ב-`localStorage` בדפדפן המשתמש. הניווט בין העמודים מנוהל לחלוטין בצד הלקוח באמצעות React Router v6. תוכן הלימוד (חומש/תהילים/תניא) נטען **בזמן אמת מ-Sefaria API**, עם נפילה חזרה לתוכן מקומי מקורב כשאין רשת או כשמדובר ביום שאינו היום הנוכחי.

---

## Tech Stack — בחירות טכנולוגיות

| שכבה | טכנולוגיה | גרסה | נימוק הבחירה |
|---|---|---|---|
| UI Framework | **React** | 18 | Hooks מודרניים, קומפוננטים לשימוש חוזר, אקוסיסטם רחב |
| Build Tool | **Vite** | 6 | HMR מהיר, dev-server קל, bundle יעיל לפרויקטי SPA |
| Routing | **React Router** | v6 | Client-side routing ללא טעינת דף, תמיכה ב-nested routes |
| תאריך עברי | **@hebcal/core** | 6.5 | HDate, לוח שנה, זמני שבת/חגים — ללא צורך לממש חישוב אסטרונומי בעצמנו |
| Language | **JavaScript ES2022** | — | גמישות MVP — אין עומס TypeScript בשלב ראשון |
| Styling | **CSS3 ידני** | — | שליטה מוחלטת בעיצוב RTL עברי; ספריות UI (MUI/Tailwind) לא תומכות ב-RTL בצורה מספקת |
| Persistence | **localStorage** | Web API | שמירה מקומית ללא צורך בשרת, מספיק ל-MVP חד-משתמש |
| תוכן לימוד | **Sefaria REST API** | — | מקור חי ומהימן לטקסט חומש/תהילים/תניא ולוח פרשות/עליות מדויק |
| PWA | **Service Worker ידני** | — | network-first, קובץ אחד פשוט — ללא Workbox, מספיק לצורך התקנה + עבודה חלקית אופליין |

### ספריות שנבחר **לא** להשתמש בהן

| ספרייה | סיבה |
|---|---|
| Redux / Zustand | המצב קטן ומקומי — `useState` + `localStorage` מספיקים |
| Tailwind / MUI / Chakra | דורשות override ל-RTL עברי; CSS ידני נותן שליטה מלאה |
| Axios / React Query | קריאות בודדות (`fetch`) לכל היותר; אין צורך ב-caching/retry מורכב |
| TypeScript | עדיפות למהירות פיתוח ב-MVP; ניתן להוסיף בגרסה הבאה |
| Workbox | Service Worker פשוט אחד (network-first) מספיק להיקף ה-PWA כאן |

---

## מבנה תיקיות

```
REACTWORK/
├── index.html               # נקודת כניסה — lang="he" dir="rtl"
├── vite.config.js           # server.port מכבד process.env.PORT (למניעת קונפליקטים)
├── package.json
├── README.md
├── PRD.md                   # מסמך דרישות מוצר
├── tasks.md                 # תוכנית עבודה ושלבים (checkboxes, לפי סדר פיתוח אמיתי)
├── ARCHITECTURE.md          # מסמך זה
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── icon.svg               # אייקון להתקנה (SVG, לא PNG)
│   └── sw.js                    # Service Worker — network-first, רק ב-production
└── src/
    ├── main.jsx             # ReactDOM.createRoot + BrowserRouter + רישום SW
    ├── App.jsx              # Shell: header, תפריט המבורגר (מובייל), routes, reminder banner
    ├── index.css            # Design system גלובלי (RTL, בהיר/כהה, רספונסיבי, אנימציות)
    ├── pages/
    │   ├── Home.jsx          # דף בית — hero + סרטון פתיחה + מחשבה יומית + זמני שבת
    │   ├── Chumash.jsx        # עמוד חומש (לפי יום בשבוע + עלייה מדויקת)
    │   ├── Tehillim.jsx        # עמוד תהילים (לפי יום עברי בחודש)
    │   ├── Tanya.jsx             # עמוד תניא (Sefaria Tanya Yomi להיום / מקומי ליום אחר)
    │   ├── Quiz.jsx               # חידון — רמות קושי + 10 שאלות ייחודיות לסבב
    │   ├── Settings.jsx            # הגדרות — תזכורות, עיר, נגישות, מצב לילה, heatmap
    │   └── NotFound.jsx              # דף 404
    ├── components/
    │   ├── HebrewCalendarGrid.jsx    # לוח שנה עברי לחיץ, משותף לשלושת עמודי הלימוד
    │   ├── ProgressWidget.jsx         # כרטיס רצף/ניקוד + שיתוף, פס תחתון קומפקטי
    │   ├── TextViewer.jsx              # טעינת/הצגת טקסט מ-Sefaria API
    │   └── YearHeatmap.jsx              # מפת רצף שנתית (GitHub-contributions style)
    ├── hooks/
    │   └── useDailyProgress.js          # הוק משותף: יום נבחר, רצף/ניקוד/היסטוריה
    ├── utils/
    │   ├── hebrewDate.js                 # getHebrewDayInfo(), toLocalDateStr()
    │   ├── fontSize.js                     # שמירה/החלה של הגדלת גופן
    │   ├── theme.js                          # שמירה/החלה של מצב לילה
    │   └── shabbatTimes.js                    # זמני כניסת/יציאת שבת לפי עיר
    └── data/
        ├── dailyContent.js                     # תוכן מקומי: תהילים/תניא (30 יום), חומש (7 ימים)
        ├── parashaData.js                        # לוח פרשות ה׳תשפ״ו + getCurrentParasha()
        ├── parashaQuestions.js                     # ~700 שאלות מ-abc770.org + שבתות כפולות
        └── dailyThoughts.js                          # 12 מחשבות יומיות מתחלפות
```

---

## היררכיית קומפוננטים

```
main.jsx
└── BrowserRouter
    └── App
        ├── ReminderBanner (מותנה — useState + useEffect on mount)
        ├── Header
        │   └── Nav (/, /chumash, /tehillim, /tanya, /quiz, /settings)
        │       └── תפריט המבורגר (dropdown) במסכים צרים, נסגר אוטומטית בניווט (useLocation)
        ├── Routes
        │   ├── Route "/"          → Home
        │   ├── Route "/chumash"   → Chumash
        │   ├── Route "/tehillim"  → Tehillim
        │   ├── Route "/tanya"     → Tanya
        │   ├── Route "/quiz"      → Quiz
        │   ├── Route "/settings"  → Settings
        │   └── Route "*"          → NotFound
        └── Footer
```

כל אחד מ-Chumash/Tehillim/Tanya מורכב מ: `useDailyProgress()` (מצב משותף — יום נבחר, רצף, ניקוד) + `HebrewCalendarGrid` (בחירת יום) + `TextViewer` (תוכן מ-Sefaria) + `ProgressWidget` (רצף/ניקוד/שיתוף, פס תחתון).

---

## ניהול מצב (State Management)

האפליקציה **לא** משתמשת בשום state management גלובלי (אין Redux/Context למצב עסקי). כל עמוד מנהל את המצב שלו, ושלושת עמודי הלימוד חולקים הוק משותף:

### useDailyProgress — משותף ל-Chumash/Tehillim/Tanya

```js
useState: selectedDate, completedDays (Set), streak, score,
          lastCompletedDate, history (string[]), milestoneAlert,
          justCompleted, scoreAnim, streakAnim
```
נטען synchronously ב-`useState` lazy initializer (לא ב-`useEffect`) כדי למנוע מירוץ בין קריאה לכתיבה בעת הטעינה הראשונית.

### Quiz — מצב מקומי

```js
useState: level (רמת קושי נבחרת), questions (10 ייחודיות לסבב), current,
          selected, revealed, score, results, done, bestScore (לפי רמה),
          scoreAnim, isNewBest
```

### Settings — מצב מקומי

```js
useState: remindersOn, reminderTime, city, fontSize, theme,
          stats (streak/score/completedDays/quizBest), saved
```

### App — מצב גלובלי מינימלי

```js
useState: reminderVisible, navOpen (תפריט המבורגר)
```

---

## localStorage — סכמת שמירה

```
reactwork-daily-state              → { completedDays[], streak, score, lastCompletedDate,
                                        history[], selectedDateISO }
reactwork-settings                 → { remindersOn, reminderTime, fontSize, theme }
reactwork-city                     → string (ברירת מחדל: Jerusalem)
reactwork-quiz-best:<רמה>          → number (שיא ניקוד לכל רמה בנפרד)
reactwork-quiz-seen:<פרשה>:<רמה>   → number[] (אינדקסים שכבר נשאלו, פרשה+רמה)
reactwork-reminder-seen            → string (תאריך — כדי לא להציג פעמיים ביום)
```

**גישה:** קריאה synchronous ב-`useState` initializer (לא `useEffect`), כתיבה ב-`useEffect` שתלוי בכל state רלוונטי.

---

## זרימת נתונים (Data Flow)

```
Sefaria API (/api/texts, /api/calendars)        dailyContent.js / parashaData.js (static, גיבוי)
        ↓                                                        ↓
   TextViewer.jsx  ←──────────────────────── Chumash/Tehillim/Tanya.jsx
        ↑
hebrewDate.js: getHebrewDayInfo(selectedDate)
        ↓
useDailyProgress() ←→ localStorage (streak, score, completedDays, history)
        ↓
   HebrewCalendarGrid (onSelectDay)          ProgressWidget (תצוגה + שיתוף)

parashaQuestions.js (בנק שאלות) → Quiz.jsx ←→ localStorage (quiz-best, quiz-seen)

Settings.jsx ←→ localStorage (settings, city) ──→ fontSize.js / theme.js (מוחל על <html>)
                                               └──→ shabbatTimes.js → Home.jsx (כרטיס זמני שבת)

App.jsx ←→ localStorage (reminder seen today) → ReminderBanner
main.jsx → navigator.serviceWorker.register('/sw.js')  (production בלבד)
```

---

## אלגוריתמים מרכזיים

### 1. סנכרון יום לפי לוח עברי (`getHebrewDayInfo`)

```
1. חשב HDate מהתאריך הלועזי הנבחר
2. קבע את יום החודש העברי (1–30) ואת אורך החודש (29/30)
3. אם החודש חסר (29 יום) — יום 29 ו-30 מוצגים כ"יום מאוחד" (isCombinedDay)
4. תהילים/תניא נבחרים לפי המפתח הזה, לא לפי תאריך לועזי
```

### 2. עלייה מדויקת לפי יום (`refForDayOfWeek`)

```
1. שלוף מ-Sefaria calendars את extraDetails.aliyot (טווח פסוקים ל-7 העליות)
2. יום א׳–ה׳ בשבוע → עלייה 1–5 בהתאמה
3. יום ו׳ (שישי) → מיזוג עליות 6+7 (mergeSefariaRefs)
4. שבת → הרפרנס המלא של הפרשה
```

### 3. לוגיקת רצף (`markDone`)

```
1. בדוק אם lastCompletedDate === אתמול → streak + 1, אחרת streak = 1
2. הוסף 10 נקודות בסיס
3. אם newStreak === milestone (7/14/21/30) → הוסף bonus points (50/100/150/200)
4. הוסף את היום ל-history (למפת הרצף השנתית) אם עוד לא קיים בה
5. הצג milestone-banner + אנימציות לאחר timeout
```

### 4. בניית סבב חידון ללא כפילויות (`buildRound`)

```
1. חלק את בנק השאלות לפרשה לפי רמת קושי (tier) ולפי "נשאלו כבר" (seen)
2. סדר עדיפות: (ברמה + לא נשאלו) → (ברמה + נשאלו) → (לא ברמה + לא נשאלו) → (לא ברמה + נשאלו)
3. קלף (Fisher-Yates) בתוך כל קבוצה, ואז חבר לפי סדר העדיפות
4. בחר 10 הראשונות — מבטיח שאלות ייחודיות גם כשבבנק פחות מ-10 שאלות ברמה המדויקת
```

### 5. מפת רצף שנתית (`YearHeatmap`)

```
1. חשב 364 ימים אחורה מהיום, מיושר לתחילת שבוע
2. עבור כל יום — בדוק אם toLocalDateStr(day) קיים בהיסטוריה (Set לבדיקה מהירה)
3. סדר בטורים שבועיים (7 שורות × ~52 טורים), כל תא צבוע לפי done/empty
```

---

## עיצוב (Design System)

כל הסגנונות ב-`src/index.css` (קובץ יחיד, ללא CSS Modules):

| נושא | ערך |
|---|---|
| כיוון | RTL (`dir="rtl"` על `<html>`) |
| תמה | בהירה וצבעונית כברירת מחדל; מצב לילה מלא דרך `:root[data-theme='dark']` |
| צבע ראשי | זהב `#ffbd4b` |
| צבעי אקסנט | סגול / כחול / טורקיז / אדום — לכרטיסי הגדרות ונושאי לימוד |
| פונט | Heebo (Google Fonts) + system fallback |
| הגדלת גופן | `[data-font-size='large'|'xlarge']` על `<html>` — כל השאר יחסי ב-`rem` |
| Breakpoints | `≤600px` מובייל (תפריט המבורגר), `≤900px` טאבלט, מעל — דסקטופ |

### אנימציות עיקריות

| שם | רכיב | תיאור |
|---|---|---|
| `fadeInUp` | כל עמוד + כרטיסים | כניסה מלמטה בטעינה, לרוב עם stagger |
| `completedPulse` | `.just-completed` | ניצוץ ירוק בסימון יום |
| `scoreBump` / `streakBounce` | ניקוד/רצף | קפיצת המספר בעדכון |
| `feedbackSlide` | `.quiz-feedback` | כניסת פידבק מימין בחידון |
| `slideDown` | `.milestone-banner` | הופעת באנר מיילסטון |
| כפתורים | כל הכפתורים | `scale(0.94)` בלחיצה |

---

## החלטות ארכיטקטוניות מרכזיות

### 1. SPA ללא backend
**החלטה:** כל הנתונים ב-localStorage, ללא שרת.
**נימוק:** MVP חד-משתמש — אין צורך בסנכרון בין מכשירים, אין עלויות תשתית.
**מגבלה:** נתוני משתמש לא עוברים בין מכשירים (מתועד ב-PRD.md כ-Out of scope).

### 2. Sefaria כמקור חי, עם גיבוי מקומי
**החלטה:** טקסט חומש/תהילים/תניא נטען מ-Sefaria API בזמן אמת; `dailyContent.js` משמש רק גיבוי/קירוב ליום שאינו היום הנוכחי (כי ל-Tanya Yomi המדויק יש רק ערך ל"היום" ב-API).
**נימוק:** דיוק תורני גבוה יותר ממיפוי סטטי ידני, תוך שמירה על UX שעובד גם בלי רשת.

### 3. CSS ידני ללא ספריית UI
**החלטה:** `index.css` יחיד, ללא Tailwind/MUI/Bootstrap.
**נימוק:** שליטה מלאה בעיצוב RTL; ספריות UI מניחות LTR כברירת מחדל.

### 4. פיצול ל-3 עמודי לימוד נפרדים
**החלטה:** Chumash/Tehillim/Tanya כל אחד עמוד עצמאי (לא לוח משולב אחד), חולקים הוק (`useDailyProgress`) ורכיבים (`HebrewCalendarGrid`, `TextViewer`, `ProgressWidget`).
**נימוק:** לתת "כבוד" ומרחב עיצובי נפרד לכל אחד משלושת חלקי חת"ת, ועדיין לשמור רצף/ניקוד משותף אחד.

### 5. completedDays כ-Set, history כמערך נפרד
**החלטה:** `completedDays` (מפתח ליום עברי בחודש) מתאפס מדי חודש; `history` (תאריכי ISO מקומיים) לא מתאפס לעולם.
**נימוק:** הראשון תומך בלוגיקת "יום נלמד החודש", השני תומך במפת רצף שנתית שצריכה טווח ארוך.

### 6. Service Worker פשוט, נרשם רק ב-production
**החלטה:** `sw.js` בעל אסטרטגיית network-first אחת, נרשם רק כש-`import.meta.env.PROD` הוא true.
**נימוק:** מספיק להתקנה + עבודה חלקית אופליין; רישום ב-dev היה שובר HMR של Vite.

---

## נתיבי הרחבה עתידיים

- **TypeScript** — הוספת טיפוסים לבטיחות קוד
- **Multi-user** — backend (Supabase/Firebase) לסנכרון בין מכשירים
- **Push notifications אמיתיות** — כרגע יש רק באנר תזכורת בכניסה לאפליקציה, לא push אמיתי
- **שנת ה׳תשפ״ז** — עדכון `parashaData.js` ללוח חדש
- **הרחבת בנק שאלות החידון** — מקור נוסף מעבר ל-abc770.org (ר' מגבלות ב-README.md)
