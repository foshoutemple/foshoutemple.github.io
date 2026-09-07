export function isMonthKey(value) {
  return typeof value === 'string' && /^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(value);
}

export function nextPracticeDate(today, excludedDates = []) {
  const date = new Date(`${today}T12:00:00Z`);
  const excluded = new Set(excludedDates);
  date.setUTCDate(date.getUTCDate() + (7 - date.getUTCDay()) % 7);
  while (excluded.has(date.toISOString().slice(0, 10))) date.setUTCDate(date.getUTCDate() + 7);
  return date.toISOString().slice(0, 10);
}

export function shiftMonth(month, offset) {
  if (!isMonthKey(month) || !Number.isInteger(offset)) throw new Error('Invalid calendar month.');
  const [year, number] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, number - 1 + offset, 1));
  const next = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  return isMonthKey(next) ? next : month;
}

export function monthDays(month) {
  if (!isMonthKey(month)) throw new Error('Invalid calendar month.');
  const [year, number] = month.split('-').map(Number);
  const start = new Date(Date.UTC(year, number - 1, 1)).getUTCDay();
  const count = new Date(Date.UTC(year, number, 0)).getUTCDate();
  return Array.from({length: Math.ceil((start + count) / 7) * 7}, (_, index) => {
    const day = index - start + 1;
    return day < 1 || day > count ? null : `${month}-${String(day).padStart(2, '0')}`;
  });
}

export function monthActivities(month, events = [], excludedDates = []) {
  const excluded = new Set(excludedDates);
  const regular = monthDays(month)
    .filter(date => date && new Date(`${date}T12:00:00Z`).getUTCDay() === 0 && !excluded.has(date))
    .map(date => ({date, type: 'weekly', slug: 'sunday'}));
  const services = events.filter(event => event.date.startsWith(`${month}-`)).map(event => ({...event, type: 'service'}));
  return [...regular, ...services].sort((a, b) => a.date.localeCompare(b.date) || a.type.localeCompare(b.type) || a.slug.localeCompare(b.slug));
}
