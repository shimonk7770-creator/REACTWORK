import { useEffect, useMemo, useState } from 'react';
import { getHebrewDayInfo } from '../utils/hebrewDate.js';

const STORAGE_KEY = 'reactwork-daily-state';

export const MILESTONES = [
  { days: 7,  bonus: 50,  emoji: '🎉', label: 'שבוע שלם!'    },
  { days: 14, bonus: 100, emoji: '⭐', label: 'שבועיים ברצף!' },
  { days: 21, bonus: 150, emoji: '🌟', label: 'שלושה שבועות!' },
  { days: 30, bonus: 200, emoji: '🏆', label: 'חודש שלם!'    },
];

// הוק משותף לניהול "יום נבחר" + רצף/ניקוד — משמש בכל עמודי
// חומש/תהילים/תניא, כך ששלושתם מדברים על אותו יום ואותו רצף לימוד.
// ה"יום" נגזר תמיד מהתאריך העברי (HDate), לא מהתאריך הלועזי.
export function useDailyProgress() {
  const [selectedDate,      setSelectedDate]      = useState(() => new Date());
  const [completedDays,     setCompletedDays]     = useState(new Set());
  const [streak,            setStreak]            = useState(0);
  const [score,             setScore]             = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState(null);
  const [milestoneAlert,    setMilestoneAlert]    = useState(null);
  const [justCompleted,     setJustCompleted]     = useState(false);
  const [scoreAnim,         setScoreAnim]         = useState(false);
  const [streakAnim,        setStreakAnim]        = useState(false);

  const todayInfo = useMemo(() => getHebrewDayInfo(new Date()), []);
  const dayInfo   = useMemo(() => getHebrewDayInfo(selectedDate), [selectedDate]);
  const isToday   = selectedDate.toDateString() === new Date().toDateString();
  const dayOfWeek = selectedDate.getDay();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    setCompletedDays(new Set(saved.completedDays || []));
    setStreak(saved.streak || 0);
    setScore(saved.score || 0);
    setLastCompletedDate(saved.lastCompletedDate ?? null);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ completedDays: [...completedDays], streak, score, lastCompletedDate })
    );
  }, [completedDays, streak, score, lastCompletedDate]);

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

  const resetProgress = () => {
    setCompletedDays(new Set());
    setStreak(0);
    setScore(0);
    setLastCompletedDate(null);
    setMilestoneAlert(null);
  };

  return {
    todayInfo,
    selectedDate, selectDate, isToday,
    dayInfo, dayOfWeek,
    completedDays, completed,
    streak, streakEmoji, streakAnim,
    score, scoreAnim,
    justCompleted,
    nextMilestone, milestoneAlert, setMilestoneAlert,
    markDone, resetProgress,
  };
}
