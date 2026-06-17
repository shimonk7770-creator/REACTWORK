import { useEffect, useState } from 'react';

const QUIZ_STORAGE_KEY = 'reactwork-quiz-best';

const allQuestions = [
  // קל (5 נקודות)
  { id: 1,  question: 'כמה ספרים יש בתורה?',                           options: ['3', '5', '7', '10'],                                             answer: '5',                          difficulty: 'קל' },
  { id: 2,  question: 'מהי הפרשה הראשונה בתורה?',                       options: ['נח', 'לך לך', 'בראשית', 'שמות'],                                 answer: 'בראשית',                     difficulty: 'קל' },
  { id: 3,  question: 'מה פירוש "חת״ת"?',                               options: ['חג תורה תפילה', 'חומש תהילים תניא', 'חנוכה תשרי תמוז', 'חדש תורה תפילה'], answer: 'חומש תהילים תניא', difficulty: 'קל' },
  { id: 4,  question: 'מי כתב את ספר התניא?',                           options: ['הבעש"ט', 'הרמב"ם', 'אדמו"ר הזקן', 'הרמ"א'],                     answer: 'אדמו"ר הזקן',               difficulty: 'קל' },
  { id: 5,  question: 'מי הם שלושת האבות?',                             options: ['אדם שת אנוש', 'אברהם יצחק יעקב', 'משה אהרן מרים', 'דוד שלמה שאול'], answer: 'אברהם יצחק יעקב',         difficulty: 'קל' },
  { id: 6,  question: 'איזה יום ברא ה׳ את האדם?',                       options: ['יום א׳', 'יום ד׳', 'יום ו׳', 'יום ז׳'],                          answer: 'יום ו׳',                    difficulty: 'קל' },
  { id: 7,  question: 'כמה פרקים יש בספר תהילים?',                      options: ['100', '126', '150', '180'],                                       answer: '150',                        difficulty: 'קל' },
  { id: 8,  question: 'מי כתב את ספר תהילים?',                          options: ['משה רבנו', 'דוד המלך', 'שלמה המלך', 'אברהם אבינו'],             answer: 'דוד המלך',                  difficulty: 'קל' },

  // בינוני (10 נקודות)
  { id: 9,  question: 'כמה מצוות יש בתורה?',                            options: ['248', '365', '613', '630'],                                       answer: '613',                        difficulty: 'בינוני' },
  { id: 10, question: 'כמה בנים היו ליעקב אבינו?',                      options: ['10', '11', '12', '13'],                                           answer: '12',                         difficulty: 'בינוני' },
  { id: 11, question: 'מי כתב את ספר הזוהר?',                           options: ['רבי עקיבא', 'רבי שמעון בר יוחאי', 'הרמב"ם', 'האריז"ל'],        answer: 'רבי שמעון בר יוחאי',        difficulty: 'בינוני' },
  { id: 12, question: 'מה שם ספר התניא המלא?',                          options: ['ספר של צדיקים', 'ספר של בינונים', 'ספר של חסידים', 'ספר של חכמים'], answer: 'ספר של בינונים',         difficulty: 'בינוני' },
  { id: 13, question: 'כמה שנים שהו בני ישראל במצרים?',                 options: ['100', '130', '210', '400'],                                       answer: '210',                        difficulty: 'בינוני' },
  { id: 14, question: 'מה שמה של הפרשה שבה מעמד הר סיני?',              options: ['בשלח', 'יתרו', 'משפטים', 'תרומה'],                               answer: 'יתרו',                       difficulty: 'בינוני' },
  { id: 15, question: 'כמה אמות היה ארון הקודש באורכו?',                 options: ['אמה וחצי', 'שתי אמות', 'שתיים וחצי', 'שלוש אמות'],              answer: 'שתיים וחצי',                difficulty: 'בינוני' },

  // קשה (15 נקודות)
  { id: 16, question: 'כמה פרקים יש בספר של בינונים (התניא)?',          options: ['40', '50', '53', '60'],                                           answer: '53',                         difficulty: 'קשה' },
  { id: 17, question: 'מהי "נפש האלוקית" לפי התניא?',                   options: ['השכל בלבד', 'הגוף והרוח', 'חלק אלוק ממעל', 'הנשמה הבהמית'],    answer: 'חלק אלוק ממעל',             difficulty: 'קשה' },
  { id: 18, question: 'כמה שערי בינה יש לפי הקבלה?',                    options: ['10', '32', '50', '72'],                                           answer: '50',                         difficulty: 'קשה' },
  { id: 19, question: 'מהו הספר הראשון שנדפס בדפוס בעברית?',             options: ['תורה', 'תהילים', 'התניא', 'הרמב"ם'],                            answer: 'תהילים',                     difficulty: 'קשה' },
  { id: 20, question: '"שמע ישראל" — מאיזו פרשה הפסוק?',                options: ['ואתחנן', 'עקב', 'ראה', 'שופטים'],                                answer: 'ואתחנן',                     difficulty: 'קשה' },
];

const POINTS = { קל: 5, בינוני: 10, קשה: 15 };
const QUESTIONS_PER_ROUND = 6;

function pickRandom(arr, n) {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    const saved = parseInt(localStorage.getItem(QUIZ_STORAGE_KEY) || '0', 10);
    setBestScore(saved);
    startNewRound();
  }, []);

  const startNewRound = () => {
    setQuestions(pickRandom(allQuestions, QUESTIONS_PER_ROUND));
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const selectOption = (id, option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [id]: option }));
  };

  const submit = () => {
    let total = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) total += POINTS[q.difficulty];
    });
    setScore(total);
    setSubmitted(true);
    if (total > bestScore) {
      setBestScore(total);
      localStorage.setItem(QUIZ_STORAGE_KEY, String(total));
    }
  };

  const getStatus = (q) => {
    if (!submitted) return '';
    if (answers[q.id] === q.answer) return 'correct';
    return answers[q.id] ? 'wrong' : 'missing';
  };

  const maxScore = questions.reduce((s, q) => s + POINTS[q.difficulty], 0);
  const answeredCount = Object.keys(answers).length;

  const resultMessage = () => {
    const pct = score / maxScore;
    if (pct === 1)   return '🏆 מושלם! כל התשובות נכונות!';
    if (pct >= 0.75) return '🌟 יפה מאוד! כמעט הכל נכון.';
    if (pct >= 0.5)  return '👍 לא רע, אבל יש מה ללמוד.';
    return '📖 כדאי לחזור על החומר ולנסות שוב.';
  };

  return (
    <section>
      <div className="card page-intro-card">
        <div>
          <span className="pill">חידון</span>
          <h2>חידון פרשת השבוע</h2>
          <p>6 שאלות רנדומליות מתוך בנק של 20 שאלות — קל / בינוני / קשה.</p>
        </div>
        {bestScore > 0 && (
          <div className="summary-badge">
            <strong>שיא: {bestScore}</strong>
            <span>הניקוד הטוב ביותר שלך</span>
          </div>
        )}
      </div>

      <div className="quiz-stack">
        {questions.map((q, idx) => (
          <div key={q.id} className={`card quiz-card ${getStatus(q)}`}>
            <div className="quiz-card-header">
              <h3>{idx + 1}. {q.question}</h3>
              <span className={`pill pill-difficulty pill-${q.difficulty}`}>{q.difficulty}</span>
            </div>
            <div className="control-row">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  className={answers[q.id] === opt ? 'primary' : 'secondary'}
                  type="button"
                  onClick={() => selectOption(q.id, opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
            {submitted && (
              <p className={`quiz-feedback ${getStatus(q)}`}>
                {getStatus(q) === 'correct'
                  ? `✓ נכון! +${POINTS[q.difficulty]} נקודות`
                  : getStatus(q) === 'wrong'
                  ? `✗ לא נכון. התשובה הנכונה: ${q.answer}`
                  : '⚠ לא ענית על שאלה זו.'}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="card quiz-footer-card">
        {!submitted ? (
          <>
            <p className="text-soft">{answeredCount} מתוך {QUESTIONS_PER_ROUND} שאלות נענו</p>
            <button className="primary" onClick={submit}>
              שלח תשובות
            </button>
          </>
        ) : (
          <>
            <div className="result-block">
              <p className="result-score">
                {score} <span className="result-max">/ {maxScore}</span>
              </p>
              <p className="result-msg">{resultMessage()}</p>
              {score > bestScore - POINTS.קשה && score === bestScore && bestScore > 0 && (
                <p className="result-record">🎉 שיא אישי חדש!</p>
              )}
            </div>
            <button className="secondary" onClick={startNewRound}>
              סבב שאלות חדש
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export default Quiz;
