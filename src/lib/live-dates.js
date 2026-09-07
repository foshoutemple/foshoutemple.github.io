import { todayInPhilly } from './temple.js';
import { nextPracticeDate } from './activity-calendar.js';
import regular from '../data/weekly-practice.json';

export function nextSundayDate(today = todayInPhilly()) {
  return nextPracticeDate(today, regular.excludedDates);
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
