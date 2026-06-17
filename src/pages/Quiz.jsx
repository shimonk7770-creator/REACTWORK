import { useState } from 'react';

const questions = [
  {
    id: 1,
    question: 'מהו השם של פרשת השבוע הנוכחית?',
    options: ['ויצא', 'במדבר', 'בשלח', 'שמות'],
    answer: 'במדבר',
    difficulty: 'קל',
  },
  {
    id: 2,
    question: 'איזה ספר נמצא בראש סדר התורה?',
    options: ['בראשית', 'שמות', 'ויקרא', 'במדבר'],
    answer: 'בראשית',
    difficulty: 'בינוני',
  },
  {
    id: 3,
    question: 'כמה פרקים יש בספר תהילים?',
    options: ['100', '150', '126', '156'],
    answer: '150',
    difficulty: 'קשה',
  },
];

function Quiz() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const selectOption = (questionId, option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const submit = () => {
    let total = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        total += q.difficulty === 'קשה' ? 15 : q.difficulty === 'בינוני' ? 10 : 5;
      }
    });
    setScore(total);
    setSubmitted(true);
  };

  const getStatus = (question) => {
    if (!submitted) return '';
    if (answers[question.id] === question.answer) return 'correct';
    if (!answers[question.id]) return 'missing';
    return 'wrong';
  };

  return (
    <section>
      <div className="card page-intro-card">
        <span className="pill">חידון</span>
        <h2>חידון פרשת השבוע</h2>
        <p>ענה על השאלות ולמד את המסורת בדרך מהנה. כל שאלה מתומחרת לפי רמת הקושי.</p>
      </div>

      <div className="quiz-stack">
        {questions.map((question) => (
          <div key={question.id} className={`card quiz-card ${getStatus(question)}`}>
            <div className="quiz-card-header">
              <h3>{question.question}</h3>
              <span className="pill">{question.difficulty}</span>
            </div>
            <div className="control-row">
              {question.options.map((option) => (
                <button
                  key={option}
                  className={answers[question.id] === option ? 'primary' : 'secondary'}
                  type="button"
                  onClick={() => selectOption(question.id, option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {submitted && (
              <p className={`quiz-feedback ${getStatus(question)}`}>
                {getStatus(question) === 'correct'
                  ? 'נכון! מדהים.'
                  : getStatus(question) === 'wrong'
                  ? `לא נכון. התשובה היא ${question.answer}`
                  : 'לא ענית על השאלה.'}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="card quiz-footer-card">
        <button className="primary" onClick={submit}>שלח תשובות</button>
        {submitted && (
          <div className="result-block">
            <p>הניקוד שלך: <strong>{score}</strong></p>
            <p>{score >= 30 ? 'כל הכבוד! ברצף על הידע.' : 'עוד קצת ויעדית לרמה הבאה.'}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Quiz;
