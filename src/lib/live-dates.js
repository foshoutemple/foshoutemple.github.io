import { dateObject, todayInPhilly } from './temple.js';

export function nextSundayDate(today = todayInPhilly()) {
  const sunday = dateObject(today);
  sunday.setUTCDate(sunday.getUTCDate() + (7 - sunday.getUTCDay()) % 7);
  return sunday.toISOString().slice(0, 10);
}

const observers = new Set();
let lastDate;

export function onPhillyDateChange(update) {
  if (!observers.size) {
    lastDate = todayInPhilly();
    const refresh = () => {
      const today = todayInPhilly();
      if (today === lastDate) return;
      lastDate = today;
      observers.forEach(observer => observer(today));
    };
    window.setInterval(refresh, 60_000);
    window.addEventListener('pageshow', refresh);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) refresh();
    });
  }
  observers.add(update);
  update(todayInPhilly());
}
