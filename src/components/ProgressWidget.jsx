function ProgressWidget({ progress, doneLabel = 'סמן כנלמד' }) {
  const {
    streak, streakEmoji, streakAnim,
    score, scoreAnim,
    completedDays, completed,
    nextMilestone, milestoneAlert, setMilestoneAlert,
    markDone, resetProgress,
  } = progress;

  const handleReset = () => {
    if (window.confirm('לאפס את כל הרצף, הניקוד והימים שסימנת? לא ניתן לבטל פעולה זו.')) {
      resetProgress();
    }
  };

  const shareStreak = () => {
    const text = streak > 0
      ? `אני ברצף של ${streak} ימי לימוד חת"ת (חומש, תהילים ותניא)! 🔥📖 בואו תצטרפו גם אתם.`
      : 'מתחיל/ה ללמוד חת"ת (חומש, תהילים ותניא) כל יום — בואו תצטרפו! 📖';
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <article className="card stats-card-compact">
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

      <div className="stats-row-compact">
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

        <div className="progress-block progress-block-grow">
          <div className="progress-bar-head">
            <span className="small-label">התקדמות החודש</span>
            <span className="progress-pct">{Math.round((completedDays.size / 30) * 100)}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${(completedDays.size / 30) * 100}%` }} />
          </div>
        </div>

        {nextMilestone && (
          <div className="progress-block next-milestone-compact">
            <span className="small-label">יעד הבא</span>
            <p>{nextMilestone.emoji} עוד {nextMilestone.days - streak} ל{nextMilestone.label}</p>
          </div>
        )}

        <div className="control-row control-row-compact">
          <button className="primary" onClick={markDone} disabled={completed}>
            {completed ? 'הושלם ✓' : doneLabel}
          </button>
          <button className="secondary" onClick={handleReset}>
            איפוס
          </button>
          <button className="secondary share-btn" onClick={shareStreak}>
            שיתוף 📤
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProgressWidget;
