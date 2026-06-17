export const dailyContent = Array.from({ length: 30 }, (_, index) => {
  const day = index + 1;
  return {
    day,
    title: `יום ${day}`,
    chumash: `פרשת החומש של יום ${day}`,
    tehillim: `פרקי תהילים ליום ${day}`,
    tanya: `לקח מתוך תניא ליום ${day}`,
    notes: `טקסט להסבר קצר על היום ${day}`,
  };
});
