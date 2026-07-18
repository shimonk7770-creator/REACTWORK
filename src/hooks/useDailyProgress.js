import { useEffect, useMemo, useState } from 'react';
import { getHebrewDayInfo, toLocalDateStr } from '../utils/hebrewDate.js';

const STORAGE_KEY = 'reactwork-daily-state';

export const MILESTONES = [
  { days: 7,  bonus: 50,  emoji: '🎉', label: 'שבוע שלם!'    },
  { days: 14, bonus: 100, emoji: '⭐', label: 'שבועיים ברצף!' },
  { days: 21, bonus: 150, emoji: '🌟', label: 'שלושה שבועות!' },
  { days: 30, bonus: 200, emoji: '🏆', label: 'חודש שלם!'    },
];

function loadStoredState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

// מחשב רצף אמיתי (ימים רצופים) מתוך היסטוריית תאריכים, במקום סתם לאפס
// ל-0 — נדרש אחרי הסרת יום בודד מההיסטוריה (resetToday).
function computeStreakFromHistory(historyDates) {
  if (!historyDates.length) return { streak: 0, lastCompletedDate: null };
  const sorted = [...historyDates].sort();
  let streak = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const diffDays = Math.round((new Date(sorted[i]) - new Date(sorted[i - 1])) / 86_400_000);
    if (diffDays === 1) streak++;
    else break;
  }
  return { streak, lastCompletedDate: new Date(sorted[sorted.length - 1]).toDateString() };
}

// הוק משותף לניהול "יום נבחר" + רצף/ניקוד — משמש בכל עמודי
// חומש/תהילים/תניא, כך ששלושתם מדברים על אותו יום ואותו רצף לימוד.
// ה"יום" נגזר תמיד מהתאריך העברי (HDate), לא מהתאריך הלועזי.
//
// המצב נטען מ-localStorage ישירות ב-useState הראשוני (לא ב-useEffect) —
// כדי שהיום הנבחר יישאר עקבי גם במעבר בין עמודי חומש/תהילים/תניא, בלי
// "הבזק" של היום הנוכחי שדורס את השמירה לפני שהיא נטענת.
export function useDailyProgress() {
  const [selectedDate,      setSelectedDate]      = useState(() => {
    const saved = loadStoredState();
    return saved.selectedDateISO ? new Date(saved.selectedDateISO) : new Date();
  });
  const [completedDays,     setCompletedDays]     = useState(() => new Set(loadStoredState().completedDays || []));
  const [streak,            setStreak]            = useState(() => loadStoredState().streak || 0);
  const [score,             setScore]             = useState(() => loadStoredState().score || 0);
  const [lastCompletedDate, setLastCompletedDate] = useState(() => loadStoredState().lastCompletedDate ?? null);
  // היסטוריה מלאה של תאריכים (ISO) שסומנו כהושלמו — לא מתאפסת מדי חודש,
  // בשונה מ-completedDays שמייצג רק את התקדמות החודש הנוכחי. משמשת למפת
  // הרצף השנתית.
  const [history,           setHistory]           = useState(() => loadStoredState().history || []);
  const [milestoneAlert,    setMilestoneAlert]    = useState(null);
  const [justCompleted,     setJustCompleted]     = useState(false);
  const [scoreAnim,         setScoreAnim]         = useState(false);
  const [streakAnim,        setStreakAnim]        = useState(false);

  const todayInfo = useMemo(() => getHebrewDayInfo(new Date()), []);
  const dayInfo   = useMemo(() => getHebrewDayInfo(selectedDate), [selectedDate]);
  const isToday   = selectedDate.toDateString() === new Date().toDateString();
  const dayOfWeek = selectedDate.getDay();

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        completedDays: [...completedDays], streak, score, lastCompletedDate, history,
        selectedDateISO: selectedDate.toISOString(),
      })
    );
  }, [completedDays, streak, score, lastCompletedDate, history, selectedDate]);

  const completed = completedDays.has(dayInfo.day);
  const nextMilestone = MILESTONES.find((m) => m.days > streak);
  const streakEmoji = streak >= 30 ? '🏆' : streak >= 21 ? '🌟' : streak >= 14 ? '⭐' : streak >= 7 ? '🎉' : '';

  const selectDate = (date) => setSelectedDate(date);

  const markDone = () => {
    if (completed) return;
    const now = new Date();
    const todayStr     = now.toDateString();
    const yesterdayStr = new Date(now - 86_400_000).toDateString();

    const newSet = new Set(completedDays);
    newSet.add(dayInfo.day);
    setCompletedDays(newSet);

    const dateStr = toLocalDateStr(selectedDate);
    if (!history.includes(dateStr)) setHistory((prev) => [...prev, dateStr]);

    const newStreak = lastCompletedDate === yesterdayStr ? streak + 1 : 1;
    setStreak(newStreak);
    setLastCompletedDate(todayStr);

    const milestone = MILESTONES.find((m) => m.days === newStreak);
    setScore((prev) => prev + 10 + (milestone?.bonus ?? 0));

    setJustCompleted(true);
    setScoreAnim(true);
    setStreakAnim(true);
    setTimeout(() => setJustCompleted(false), 1300);
    setTimeout(() => setScoreAnim(false),     800);
    setTimeout(() => setStreakAnim(false),     700);

    if (milestone) {
      setMilestoneAlert(milestone);
      setTimeout(() => setMilestoneAlert(null), 6000);
    }
  };

  // מבטל את הסימון של היום שנצפה כרגע בלבד — שאר הימים שסומנו בחודש/
  // בהיסטוריה (ולכן גם מפת הרצף השנתית) נשארים ללא שינוי.
  const resetToday = () => {
    if (!completed) return;
    const newSet = new Set(completedDays);
    newSet.delete(dayInfo.day);
    setCompletedDays(newSet);

    const dateStr = toLocalDateStr(selectedDate);
    const newHistory = history.filter((d) => d !== dateStr);
    setHistory(newHistory);

    const { streak: newStreak, lastCompletedDate: newLast } = computeStreakFromHistory(newHistory);
    setStreak(newStreak);
    setLastCompletedDate(newLast);

    setScore((prev) => Math.max(0, prev - 10));
    setMilestoneAlert(null);
  };

  return {
    todayInfo,
    selectedDate, selectDate, isToday,
    dayInfo, dayOfWeek,
    completedDays, completed, history,
    streak, streakEmoji, streakAnim,
    score, scoreAnim,
    justCompleted,
    nextMilestone, milestoneAlert, setMilestoneAlert,
    markDone, resetToday,
  };
}
