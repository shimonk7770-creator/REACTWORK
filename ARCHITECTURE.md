# ARCHITECTURE — חת״ת יומי

מסמך ארכיטקטורה טכני מפורט של אפליקציית "חת״ת יומי".

---

## סקירה כללית

"חת״ת יומי" היא **Single Page Application (SPA)** בנויה על React 18 + Vite 5, ללא backend וללא בסיס נתונים חיצוני. כל המצב נשמר ב-`localStorage` בדפדפן המשתמש. הניווט בין העמודים מנוהל לחלוטין בצד הלקוח באמצעות React Router v6.

---

## Tech Stack — בחירות טכנולוגיות

| שכבה | טכנולוגיה | גרסה | נימוק הבחירה |
|---|---|---|---|
| UI Framework | **React** | 18 | Hooks מודרניים, קומפוננטים לשימוש חוזר, אקוסיסטם רחב |
| Build Tool | **Vite** | 5 | HMR מהיר, dev-server קל, bundle יעיל לפרויקטי SPA |
| Routing | **React Router** | v6 | Client-side routing ללא טעינת דף, תמיכה ב-nested routes |
| Language | **JavaScript ES2022** | — | גמישות MVP — אין עומס TypeScript בשלב ראשון |
| Styling | **CSS3 ידני** | — | שליטה מוחלטת בעיצוב RTL עברי; ספריות UI (MUI/Tailwind) לא תומכות ב-RTL בצורה מספקת |
| Persistence | **localStorage** | Web API | שמירה מקומית ללא צורך בשרת, מספיק ל-MVP חד-משתמש |

### ספריות שנבחר **לא** להשתמש בהן

| ספרייה | סיבה |
|---|---|
| Redux / Zustand | המצב קטן ומקומי — `useState` + `localStorage` מספיקים |
| Tailwind / MUI / Chakra | דורשות override ל-RTL עברי; CSS ידני נותן שליטה מלאה |
| Axios / React Query | אין API חיצוני בשלב זה |
| TypeScript | עדיפות למהירות פיתוח ב-MVP; ניתן להוסיף בגרסה הבאה |

---

## מבנה תיקיות

```
REACTWORK/
├── index.html               # נקודת כניסה — lang="he" dir="rtl"
├── vite.config.js           # הגדרות Vite
├── package.json
├── README.md
├── PRD.md                   # מסמך דרישות מוצר
├── WORKPLAN.md              # תוכנית עבודה ושלבים
├── ARCHITECTURE.md          # מסמך זה
└── src/
    ├── main.jsx             # ReactDOM.createRoot + BrowserRouter
    ├── App.jsx              # Shell: header, nav, routes, reminder banner
    ├── index.css            # Design system גלובלי (RTL, dark theme, אנימציות)
    ├── pages/
    │   ├── Home.jsx         # דף בית — hero + כרטיסי תכונות
    │   ├── DailyBoard.jsx   # לוח יומי — חומש/תהילים/תניא + streak + score
    │   ├── Quiz.jsx         # חידון — randomization + ניקוד לפי רמה
    │   └── Settings.jsx     # הגדרות — תזכורת יומית + סטטיסטיקה
    └── data/
        ├── dailyContent.js      # תוכן: chumashByDayOfWeek + dailyContent[30]
        ├── parashaData.js       # לוח פרשות ה׳תשפ״ו + getCurrentParasha()
        └── parashaQuestions.js  # ~700 שאלות מ-abc770.org + PARASHA_ALIASES + getQuestionsForParasha()
```

```
pages/
├── Home.jsx        # דף בית
├── DailyBoard.jsx  # לוח יומי
├── Quiz.jsx        # חידון
├── Settings.jsx    # הגדרות
└── NotFound.jsx    # דף 404 (Route path="*")
```

---

## היררכיית קומפוננטים

```
main.jsx
└── BrowserRouter
    └── App
        ├── ReminderBanner (מותנה — useState + useEffect on mount)
        ├── Header
        │   └── Nav (/, /daily, /quiz, /settings)
        ├── Routes
        │   ├── Route "/"         → Home
        │   ├── Route "/daily"    → DailyBoard
        │   ├── Route "/quiz"     → Quiz
        │   └── Route "/settings" → Settings
        └── Footer
```

---

## ניהול מצב (State Management)

האפליקציה **לא** משתמשת בשום state management גלובלי. כל עמוד מנהל את המצב שלו באופן עצמאי:

### DailyBoard — מצב מקומי

```js
useState: selectedDay, completedDays (Set), streak, score,
          lastCompletedDate, milestoneAlert,
          justCompleted, scoreAnim, streakAnim
```

### Quiz — מצב מקומי

```js
useState: questions (6 רנדומליות לפרשה), current, selected, revealed,
          score, results, done, bestScore, scoreAnim, isNewBest
```

### Settings — מצב מקומי

```js
useState: remindersOn, reminderTime, stats (streak/score/completedDays/quizBest), saved
```

### App — מצב גלובלי יחיד

```js
useState: reminderVisible  // האם להציג באנר תזכורת
```

---

## localStorage — סכמת שמירה

```
reactwork-daily-state    → { selectedDay, completedDays[], streak, score, lastCompletedDate }
reactwork-settings       → { remindersOn, reminderTime }
reactwork-quiz-best      → number (שיא ניקוד חידון)
reactwork-reminder-seen  → string (תאריך — כדי לא להציג פעמיים ביום)
```

**גישה:** קריאה ב-`useEffect` ריק (mount בלבד), כתיבה ב-`useEffect` שתלוי בכל state רלוונטי.

---

## זרימת נתונים (Data Flow)

```
dailyContent.js (static)     parashaData.js (static)
       ↓                             ↓
  DailyBoard.jsx  ←──────────── getCurrentParasha()
       ↑↓
  localStorage (reactwork-daily-state)

  Quiz.jsx ↔ localStorage (reactwork-quiz-best)

  Settings.jsx ↔ localStorage (reactwork-settings)
                           ↑
  App.jsx ←────────────────┘ (reminderTime, remindersOn)
       ↓
  ReminderBanner (localStorage: reactwork-reminder-seen)
```

---

## אלגוריתמים מרכזיים

### 1. חישוב פרשת השבוע (`getCurrentParasha`)

```
1. מצא את השבת הקרובה (אם היום שבת — היום, אחרת מצא את השבת הבאה)
2. חפש ב-PARASHA_SCHEDULE (45 שבתות ה׳תשפ״ו) את הרשומה הקרובה ביותר לתאריך זה
3. החזר { name, book } של הפרשה
```

לוח הפרשות מקודד ידנית ל-5786 ומתחשב בדילוגים (שבת חול המועד פסח, שבועות).

### 2. לוגיקת רצף (`markDone`)

```
1. בדוק אם lastCompletedDate === אתמול → streak + 1, אחרת streak = 1
2. הוסף 10 נקודות בסיס
3. אם newStreak === milestone (7/14/21/30) → הוסף bonus points (50/100/150/200)
4. הצג milestone-banner + אנימציות לאחר timeout
```

### 3. רנדומיזציה של שאלות החידון

```
1. קלף את בנק 20 השאלות (Fisher-Yates shuffle)
2. בחר 6 ראשונות
3. כל סבב חדש — קלף מחדש
```

---

## עיצוב (Design System)

כל הסגנונות ב-`src/index.css` (קובץ יחיד, ללא CSS Modules):

| נושא | ערך |
|---|---|
| כיוון | RTL (`dir="rtl"` על `<html>`) |
| תמה | Dark (`#1a1a2e` background) |
| צבע ראשי | `#ffbd4b` (זהב) |
| צבע משני | `#6eaf5e` (ירוק) |
| פונט | System font stack |
| Breakpoint נייד | `max-width: 600px` |

### אנימציות

| שם | רכיב | תיאור |
|---|---|---|
| `fadeInUp` | כל עמוד + כרטיסים | כניסה מלמטה בטעינה |
| `completedPulse` | `.just-completed` | ניצוץ ירוק בסימון יום |
| `scoreBump` | `.score-bump` | קפיצת מספר הניקוד |
| `streakBounce` | `.streak-bounce` | קפיצת מספר הרצף |
| `feedbackSlide` | `.quiz-feedback` | כניסת פידבק מימין |
| `slideDown` | `.milestone-banner` | הופעת באנר מיילסטון |
| `button:active` | כל הכפתורים | scale(0.94) בלחיצה |

---

## החלטות ארכיטקטוניות מרכזיות

### 1. SPA ללא backend
**החלטה:** כל הנתונים ב-localStorage, ללא שרת.
**נימוק:** MVP חד-משתמש — אין צורך בסנכרון, אין עלויות תשתית.
**מגבלה:** נתוני משתמש לא עוברים בין מכשירים.

### 2. CSS ידני ללא ספריית UI
**החלטה:** index.css יחיד, ללא Tailwind/MUI/Bootstrap.
**נימוק:** שליטה מלאה בעיצוב RTL; ספריות UI מניחות LTR כברירת מחדל.

### 3. תוכן סטטי מוכלל בקוד
**החלטה:** תהילים/תניא/חומש מקודדים ב-`dailyContent.js`, פרשות ב-`parashaData.js`.
**נימוק:** אין API חיצוני לתוכן תורני — הנתונים יציבים ומוגבלים בגודלם.

### 4. completedDays כ-Set
**החלטה:** שמירת כל יום שהושלם כ-Set, לא boolean יחיד.
**נימוק:** המשתמש יכול להשלים כל יום בחודש באופן עצמאי — צריך לעקוב אחרי כל 30 ימים.

---

## נתיבי הרחבה עתידיים

- **PWA + Service Worker** — עבודה offline ו-push notifications אמיתיות
- **TypeScript** — הוספת טיפוסים לבטיחות קוד
- **Multi-user** — backend (Supabase/Firebase) לסנכרון בין מכשירים
- **תוכן דינמי** — API לתוכן תורני עדכני
- **שנת ה׳תשפ״ז** — עדכון `parashaData.js` ללוח חדש
