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

  return (
    <section>
      <div className="card">
        <h2>חידון פרשת השבוע</h2>
        <p>ענה על השאלות ותראה את הניקוד לפי רמת הקושי.</p>
      </div>

      {questions.map((question) => (
        <div className="card" key={question.id}>
          <h3>{question.question}</h3>
          <p className="highlight">רמת קושי: {question.difficulty}</p>
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
        </div>
      ))}

      <div className="card">
        <button className="primary" onClick={submit}>שלח תשובות</button>
        {submitted && (
          <div style={{ marginTop: '16px' }}>
            <p>הניקוד שלך: <strong>{score}</strong></p>
            <p>זמן להמשיך ללמוד ולהעשיר את הידע.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Quiz;
