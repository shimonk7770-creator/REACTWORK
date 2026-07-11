import { useEffect, useRef, useState } from 'react';
import { getQuestionsForParasha } from '../data/parashaQuestions.js';
import { getCurrentParasha } from '../data/parashaData.js';

const QUESTIONS_PER_ROUND = 10;

const POINTS = { קל: 5, בינוני: 10, קשה: 15 };

const DIFFICULTY_INFO = {
  קל:     { icon: '🌱', desc: 'שאלות בסיסיות להתחלה נעימה' },
  בינוני: { icon: '⚡', desc: 'רמה מאתגרת אך נגישה לרוב הלומדים' },
  קשה:    { icon: '🔥', desc: 'לבקיאי הפרשה — הכי מאתגר' },
};

const BADGES = [
  { min: 1,    emoji: '🏆', text: 'ציון מושלם!' },
  { min: 0.8,  emoji: '🌟', text: 'כמעט מושלם!' },
  { min: 0.6,  emoji: '👍', text: 'עבודה טובה!' },
  { min: 0,    emoji: '📖', text: 'כדאי לתרגל עוד קצת' },
];

const SAYINGS = [
  'כל שאלה שנענית היא עוד צעד בהבנת הפרשה.',
  '"יגעת ומצאת — תאמין" — ההתמדה משתלמת.',
  'עוד סבב אחד ואתם ממש בקיאים!',
  'תורה נקנית בחזרה — כל סבב נוסף מחזק את הזיכרון.',
  'כל הכבוד על ההשתתפות — זה כבר ניצחון.',
];

function pickSaying() {
  return SAYINGS[Math.floor(Math.random() * SAYINGS.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// מחלק את הבנק לשלישים לפי מיקום — כך שכל רמת קושי מקבלת נתח יחסי,
// גם כשמדובר בבנק מאוחד של שבת כפולה (למשל מטות–מסעי).
function tierForIndex(idx, poolLength) {
  const third = poolLength / 3;
  if (idx < third)     return 'קל';
  if (idx < third * 2) return 'בינוני';
  return 'קשה';
}

function seenStorageKey(parashaName, difficulty) {
  return `reactwork-quiz-seen:${parashaName}:${difficulty}`;
}

function bestStorageKey(difficulty) {
  return `reactwork-quiz-best:${difficulty}`;
}

function loadSeen(parashaName, difficulty) {
  try {
    return new Set(JSON.parse(localStorage.getItem(seenStorageKey(parashaName, difficulty)) || '[]'));
  } catch {
    return new Set();
  }
}

function saveSeen(parashaName, difficulty, seenSet) {
  localStorage.setItem(seenStorageKey(parashaName, difficulty), JSON.stringify([...seenSet]));
}

// בונה סבב של עד 10 שאלות, תמיד ייחודיות (בלי כפילות בתוך אותו סבב).
// כל בנק פרשה מתחלק ל-3 שלישים (~5–7 שאלות כל אחד), כך שרמת קושי
// בודדת כמעט אף פעם לא מכילה 10 שאלות ייחודיות משלה — לכן בונים
// סדר עדיפות: טריות ברמה הנבחרת ← נצפו ברמה הנבחרת ← טריות ברמות
// אחרות ← נצפו ברמות אחרות, וחותכים ל-10. שאלות "מושאלות" מרמה אחרת
// עדיין מתויגות ומנוקדות לפי הרמה שנבחרה (לא לפי מקור השאלה בפועל).
function buildRound(parashaName, difficulty, seen) {
  const pool = getQuestionsForParasha(parashaName);
  const allIndices = pool.map((_, i) => i);
  const inTier = (i) => tierForIndex(i, pool.length) === difficulty;

  const priorityOrder = [
    ...shuffle(allIndices.filter((i) => inTier(i) && !seen.has(i))),
    ...shuffle(allIndices.filter((i) => inTier(i) && seen.has(i))),
    ...shuffle(allIndices.filter((i) => !inTier(i) && !seen.has(i))),
    ...shuffle(allIndices.filter((i) => !inTier(i) && seen.has(i))),
  ];

  const chosenIndices = priorityOrder.slice(0, Math.min(QUESTIONS_PER_ROUND, pool.length));

  let nextSeen = new Set([...seen, ...chosenIndices]);
  if (nextSeen.size >= pool.length) nextSeen = new Set(); // מיצינו את כל הבנק — מחזור חדש בפעם הבאה

  const questions = chosenIndices.map((origIdx, pos) => {
    const item = pool[origIdx];
    const wrongPool = pool.filter((_, i) => i !== origIdx);
    const wrongAnswers = shuffle(wrongPool).slice(0, 3).map((w) => w.a);
    return {
      uid: pos,
      id: origIdx,
      question: item.q,
      answer: item.a,
      options: shuffle([item.a, ...wrongAnswers]),
      difficulty,
    };
  });

  return { questions, nextSeen };
}

function Quiz() {
  useEffect(() => { document.title = 'חידון פרשה | חת"ת יומי'; }, []);

  const parasha = getCurrentParasha();

  const [difficulty, setDifficulty] = useState(null);
  const seenRef = useRef(new Set());
  const [questions, setQuestions] = useState([]);
  const [current,   setCurrent]   = useState(0);
  const [selected,  setSelected]  = useState(null);
  const [revealed,  setRevealed]  = useState(false);
  const [score,     setScore]     = useState(0);
  const [results,   setResults]   = useState([]);
  const [done,      setDone]      = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [scoreAnim, setScoreAnim] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);
  const [saying,    setSaying]    = useState('');

  const startQuiz = (level) => {
    seenRef.current = loadSeen(parasha.name, level);
    const { questions: qs, nextSeen } = buildRound(parasha.name, level, seenRef.current);
    seenRef.current = nextSeen;
    saveSeen(parasha.name, level, nextSeen);

    setDifficulty(level);
    setQuestions(qs);
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setResults([]);
    setDone(false);
    setIsNewBest(false);
    setBestScore(parseInt(localStorage.getItem(bestStorageKey(level)) || '0', 10));
  };

  useEffect(() => {
    if (!done) return;
    setSaying(pickSaying());
    const saved = parseInt(localStorage.getItem(bestStorageKey(difficulty)) || '0', 10);
    if (score > saved) {
      setBestScore(score);
      setIsNewBest(true);
      localStorage.setItem(bestStorageKey(difficulty), String(score));
    }
  }, [done]);

  const q = questions[current];
  const isLast = current === questions.length - 1;

  const choose = (opt) => {
    if (revealed) return;
    const correct = opt === q.answer;
    setSelected(opt);
    setRevealed(true);
    setResults((prev) => [...prev, { correct, chosen: opt, answer: q.answer }]);
    if (correct) {
      setScore((prev) => prev + POINTS[q.difficulty]);
      setScoreAnim(true);
      setTimeout(() => setScoreAnim(false), 750);
    }
  };

  const next = () => {
    if (isLast) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  const restart = () => startQuiz(difficulty);
  const chooseOtherLevel = () => setDifficulty(null);
  const quitQuiz = () => {
    if (results.length === 0 || window.confirm('לצאת מהחידון הנוכחי? ההתקדמות בסבב הזה תאבד.')) {
      setDifficulty(null);
    }
  };

  const maxScore = questions.length * POINTS[difficulty];
  const progress = results.length / QUESTIONS_PER_ROUND;
  const pct = maxScore ? score / maxScore : 0;
  const badge = BADGES.find((b) => pct >= b.min);
  const showConfetti = done && pct >= 0.8;

  // ─── מסך בחירת רמת קושי ───
  if (!difficulty) {
    return (
      <section>
        <div className="card page-intro-card">
          <div>
            <span className="pill">חידון</span>
            <h2>בחרו רמת קושי</h2>
            <p className="text-soft">פרשת {parasha.name} · 10 שאלות בכל רמה</p>
          </div>
        </div>

        <div className="difficulty-grid">
          {Object.keys(DIFFICULTY_INFO).map((level) => (
            <button
              key={level}
              className={`difficulty-card difficulty-${level}`}
              onClick={() => startQuiz(level)}
            >
              <span className="difficulty-icon">{DIFFICULTY_INFO[level].icon}</span>
              <h3>{level}</h3>
              <p>{DIFFICULTY_INFO[level].desc}</p>
              <span className="pill">{POINTS[level]} נק׳ לשאלה</span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  // ─── מסך תוצאות ───
  if (done) {
    return (
      <section>
        <div className="card page-intro-card">
          <div>
            <span className={`pill pill-difficulty pill-${difficulty}`}>{difficulty}</span>
            <h2>תוצאות הסבב</h2>
            <p className="text-soft">פרשת {parasha.name}</p>
          </div>
          {bestScore > 0 && (
            <div className="summary-badge">
              <strong>שיא: {bestScore}</strong>
              <span>הניקוד הטוב ביותר שלך ברמת {difficulty}</span>
            </div>
          )}
        </div>

        <div className="card quiz-result-card">
          {showConfetti && (
            <div className="confetti-wrap">
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={i}
                  className="confetti-piece"
                  style={{
                    left: `${Math.random() * 100}%`,
                    background: ['#f5a623', '#8b6fd8', '#3f8fdb', '#22a3a3', '#2fa876'][i % 5],
                    animationDelay: `${Math.random() * 0.6}s`,
                  }}
                />
              ))}
            </div>
          )}
          <div className="result-emoji">{badge.emoji}</div>
          <p className="result-score">
            {score} <span className="result-max">/ {maxScore}</span>
          </p>
          <p className="result-msg">{badge.text}</p>
          {isNewBest && <p className="result-record">🎉 שיא אישי חדש ברמת {difficulty}!</p>}

          <div className="badge-row">
            <span className="badge-pill">{badge.emoji} {badge.text}</span>
          </div>
          <p className="quiz-saying">💬 {saying}</p>
        </div>

        <div className="card">
          <h3>סיכום שאלות</h3>
          <div className="quiz-summary-list">
            {questions.map((q, i) => {
              const r = results[i];
              return (
                <div key={q.uid} className={`quiz-summary-item ${r?.correct ? 'correct' : 'wrong'}`}>
                  <span className="summary-icon">{r?.correct ? '✓' : '✗'}</span>
                  <div className="summary-body">
                    <p className="summary-q">{q.question}</p>
                    {!r?.correct && (
                      <p className="summary-ans">תשובה נכונה: {q.answer}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card quiz-footer-card">
          <button className="primary" onClick={restart}>סבב חדש ברמת {difficulty}</button>
          <button className="secondary" onClick={chooseOtherLevel}>בחרו רמה אחרת</button>
        </div>
      </section>
    );
  }

  // ─── מסך שאלה ───
  return (
    <section>
      <div className="card page-intro-card">
        <div>
          <button className="quiz-quit-btn" onClick={quitQuiz}>‹ חזרה לבחירת רמה</button>
          <span className={`pill pill-difficulty pill-${difficulty}`}>{difficulty}</span>
          <h2>חידון פרשת {parasha.name}</h2>
          <p className="text-soft">שאלה {current + 1} מתוך {QUESTIONS_PER_ROUND}</p>
        </div>
        <div className="summary-badge">
          <strong className={scoreAnim ? 'score-bump' : ''}>{score}</strong>
          <span>נקודות</span>
        </div>
      </div>

      <div className="quiz-progress-bar">
        <div className="quiz-progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      <div className="card quiz-card-main">
        <div className="quiz-card-header">
          <span className={`pill pill-difficulty pill-${q.difficulty}`}>
            {q.difficulty} · {POINTS[q.difficulty]} נק׳
          </span>
          <span className="quiz-counter">{current + 1} / {QUESTIONS_PER_ROUND}</span>
        </div>

        <h2 className="quiz-question">{q.question}</h2>

        <div className="quiz-options">
          {q.options.map((opt) => {
            let cls = 'quiz-option';
            if (revealed) {
              if (opt === q.answer)      cls += ' quiz-opt-correct';
              else if (opt === selected) cls += ' quiz-opt-wrong';
              else                       cls += ' quiz-opt-dim';
            }
            return (
              <button key={opt} className={cls} onClick={() => choose(opt)}>
                {opt}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className={`quiz-feedback ${selected === q.answer ? 'correct' : 'wrong'}`}>
            {selected === q.answer
              ? <span>✓ נכון! +{POINTS[q.difficulty]} נקודות</span>
              : <span>✗ התשובה הנכונה: <strong>{q.answer}</strong></span>
            }
          </div>
        )}
      </div>

      {revealed && (
        <div className="card quiz-footer-card">
          <button className="primary" onClick={next}>
            {isLast ? 'לתוצאות ›' : 'השאלה הבאה ›'}
          </button>
        </div>
      )}
    </section>
  );
}

export default Quiz;
