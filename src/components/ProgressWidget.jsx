function ProgressWidget({ progress, doneLabel = 'סמן כנלמד' }) {
  const {
    streak, streakEmoji, streakAnim,
    score, scoreAnim,
    completedDays, completed,
    nextMilestone, milestoneAlert, setMilestoneAlert,
    markDone, resetProgress,
  } = progress;

  return (
    <article className="card stats-card">
      {milestoneAlert && (
        <div className="milestone-banner">
          <span className="milestone-emoji">{milestoneAlert.emoji}</span>
          <div className="milestone-text">
            <strong>{milestoneAlert.label}</strong>
            <p>השלמת {milestoneAlert.days} ימים ברצף — +{milestoneAlert.bonus} נקודות בונוס!</p>
          </div>
          <button className="milestone-close" onClick={() => setMilestoneAlert(null)}>×</button>
        </div>
      )}

      <h3>נקודות רצף</h3>

      <div className="progress-block">
        <span className="small-label">רצף נוכחי</span>
        <div className="streak-row">
          <strong className={`streak-num${streakAnim ? ' streak-bounce' : ''}`}>{streak}</strong>
          <span className="streak-unit">ימים</span>
          {streakEmoji && <span className="streak-badge">{streakEmoji}</span>}
        </div>
      </div>

      <div className="progress-block">
        <span className="small-label">ניקוד מצטבר</span>
        <strong className={scoreAnim ? 'score-bump' : ''}>{score} נקודות</strong>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-head">
          <span className="small-label">התקדמות החודש</span>
          <span className="progress-pct">{Math.round((completedDays.size / 30) * 100)}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(completedDays.size / 30) * 100}%` }} />
        </div>
        <div className="progress-markers">
          {[7, 14, 21, 30].map((m) => (
            <span
              key={m}
              className={`progress-marker ${completedDays.size >= m ? 'reached' : ''}`}
              style={{ right: `${((30 - m) / 30) * 100}%` }}
              title={`${m} ימים`}
            />
          ))}
        </div>
        <p className="progress-count">{completedDays.size} מתוך 30 ימים הושלמו החודש</p>
      </div>

      <div className="milestone-progress">
        <span className="small-label">יעד בונוס הבא</span>
        {nextMilestone ? (
          <p>
            {nextMilestone.emoji} עוד {nextMilestone.days - streak} ימים ל{nextMilestone.label}
            <br />
            <span className="bonus-note">+{nextMilestone.bonus} נקודות בונוס!</span>
          </p>
        ) : (
          <p>🏆 השגת את כל יעדי הבונוס!</p>
        )}
      </div>

      <div className="control-row">
        <button className="primary" onClick={markDone} disabled={completed}>
          {completed ? 'הושלם ✓' : doneLabel}
        </button>
        <button className="secondary" onClick={resetProgress}>
          איפוס
        </button>
      </div>
    </article>
  );
}

export default ProgressWidget;
