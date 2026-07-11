import { useEffect, useRef, useState } from 'react';
import { getQuestionsForParasha } from '../data/parashaQuestions.js';
import { getCurrentParasha } from '../data/parashaData.js';

const QUIZ_STORAGE_KEY = 'reactwork-quiz-best';
const QUESTIONS_PER_ROUND = 10;

const POINTS = { קל: 5, בינוני: 10, קשה: 15 };

function getDifficulty(idx) {
  if (idx < 6)  return 'קל';
  if (idx < 12) return 'בינוני';
  return 'קשה';
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function seenStorageKey(parashaName) {
  return `reactwork-quiz-seen:${parashaName}`;
}

function loadSeen(parashaName) {
  try {
    return new Set(JSON.parse(localStorage.getItem(seenStorageKey(parashaName)) || '[]'));
  } catch {
    return new Set();
  }
}

function saveSeen(parashaName, seenSet) {
  localStorage.setItem(seenStorageKey(parashaName), JSON.stringify([...seenSet]));
}

// בונה סבב חדש שמעדיף שאלות שעדיין לא נשאלו על פרשה זו. כשכל הבנק
// נוצל — המחזור מתאפס וממשיכים משאלות "טריות" שוב.
function buildRound(parashaName, seen) {
  const pool = getQuestionsForParasha(parashaName);
  const allIndices = shuffle([...Array(pool.length).keys()]);
  const unseen = allIndices.filter((i) => !seen.has(i));

  let chosenIndices;
  let nextSeen;
  if (unseen.length >= QUESTIONS_PER_ROUND) {
    chosenIndices = unseen.slice(0, QUESTIONS_PER_ROUND);
    nextSeen = new Set([...seen, ...chosenIndices]);
  } else {
    // לא נשארו מספיק שאלות טריות — מתחילים מחזור חדש
    chosenIndices = allIndices.slice(0, Math.min(QUESTIONS_PER_ROUND, allIndices.length));
    nextSeen = new Set(chosenIndices);
  }

  const questions = chosenIndices.map((origIdx) => {
    const item = pool[origIdx];
    const wrongPool = pool.filter((_, i) => i !== origIdx);
    const wrongAnswers = shuffle(wrongPool).slice(0, 3).map((w) => w.a);
    return {
      id: origIdx,
      question: item.q,
      answer: item.a,
      options: shuffle([item.a, ...wrongAnswers]),
      difficulty: getDifficulty(origIdx),
    };
  });

  return { questions, nextSeen };
}

function Quiz() {
  useEffect(() => { document.title = 'חידון פרשה | חת"ת יומי'; }, []);

  const parasha = getCurrentParasha();

  const seenRef = useRef(loadSeen(parasha.name));
  const [questions, setQuestions] = useState(() => {
    const { questions: qs, nextSeen } = buildRound(parasha.name, seenRef.current);
    seenRef.current = nextSeen;
    saveSeen(parasha.name, nextSeen);
    return qs;
  });
  const [current,   setCurrent]   = useState(0);
  const [selected,  setSelected]  = useState(null);
  const [revealed,  setRevealed]  = useState(false);
  const [score,     setScore]     = useState(0);
  const [results,   setResults]   = useState([]);
  const [done,      setDone]      = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [scoreAnim, setScoreAnim] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    const saved = parseInt(localStorage.getItem(QUIZ_STORAGE_KEY) || '0', 10);
    setBestScore(saved);
  }, []);

  useEffect(() => {
    if (!done) return;
    const saved = parseInt(localStorage.getItem(QUIZ_STORAGE_KEY) || '0', 10);
    if (score > saved) {
      setBestScore(score);
      setIsNewBest(true);
      localStorage.setItem(QUIZ_STORAGE_KEY, String(score));
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

  const restart = () => {
    const { questions: qs, nextSeen } = buildRound(parasha.name, seenRef.current);
    seenRef.current = nextSeen;
    saveSeen(parasha.name, nextSeen);
    setQuestions(qs);
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setResults([]);
    setDone(false);
    setIsNewBest(false);
  };

  const maxScore = questions.reduce((s, q) => s + POINTS[q.difficulty], 0);
  const progress = results.length / QUESTIONS_PER_ROUND;

  const resultMsg = () => {
    const pct = score / maxScore;
    if (pct === 1)   return { emoji: '🏆', text: 'מושלם! כל התשובות נכונות!' };
    if (pct >= 0.75) return { emoji: '🌟', text: 'יפה מאוד! כמעט הכל נכון.' };
    if (pct >= 0.5)  return { emoji: '👍', text: 'לא רע, אבל יש עוד מה ללמוד.' };
    return                   { emoji: '📖', text: 'כדאי לחזור על החומר ולנסות שוב.' };
  };

  if (done) {
    const msg = resultMsg();
    return (
      <section>
        <div className="card page-intro-card">
          <div>
            <span className="pill">חידון</span>
            <h2>תוצאות הסבב</h2>
            <p className="text-soft">פרשת {parasha.name}</p>
          </div>
          {bestScore > 0 && (
            <div className="summary-badge">
              <strong>שיא: {bestScore}</strong>
              <span>הניקוד הטוב ביותר שלך</span>
            </div>
          )}
        </div>

        <div className="card quiz-result-card">
          <div className="result-emoji">{msg.emoji}</div>
          <p className="result-score">
            {score} <span className="result-max">/ {maxScore}</span>
          </p>
          <p className="result-msg">{msg.text}</p>
          {isNewBest && <p className="result-record">🎉 שיא אישי חדש!</p>}
        </div>

        <div className="card">
          <h3>סיכום שאלות</h3>
          <div className="quiz-summary-list">
            {questions.map((q, i) => {
              const r = results[i];
              return (
                <div key={q.id} className={`quiz-summary-item ${r?.correct ? 'correct' : 'wrong'}`}>
                  <span className="summary-icon">{r?.correct ? '✓' : '✗'}</span>
                  <div className="summary-body">
                    <p className="summary-q">{q.question}</p>
                    {!r?.correct && (
                      <p className="summary-ans">תשובה נכונה: {q.answer}</p>
                    )}
                  </div>
                  <span className={`pill pill-difficulty pill-${q.difficulty}`}>{q.difficulty}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card quiz-footer-card">
          <button className="primary" onClick={restart}>סבב חדש</button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="card page-intro-card">
        <div>
          <span className="pill">חידון</span>
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
