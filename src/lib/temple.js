import copy from '../data/copy.json';
import calendar from '../data/holy-days.json';
import site from '../data/site.json';

export { copy, calendar, site };
export const languages = ['zh-hans', 'zh-hant', 'en'];
export const languageNames = { 'zh-hans': '简体中文', 'zh-hant': '繁體中文', en: 'English' };
export const locales = { 'zh-hans': 'zh-CN', 'zh-hant': 'zh-TW', en: 'en-US' };
export const langTags = { 'zh-hans': 'zh-Hans', 'zh-hant': 'zh-Hant', en: 'en' };
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const asset = (path) => `${base}/${path.replace(/^\//, '')}`;
export const link = (lang, page = '') => `${base}/${lang}/${page ? `${page.replace(/^\/|\/$/g, '')}/` : ''}`;
export const dateObject = (date) => new Date(`${date}T12:00:00Z`);
export const dateText = (date, lang, options = {year:'numeric',month:'long',day:'numeric',weekday:'long'}) => new Intl.DateTimeFormat(locales[lang], {...options,timeZone:'UTC'}).format(dateObject(date));
export const monthText = (date, lang) => dateText(date, lang, {month:lang === 'en' ? 'short':'numeric'});
export const dayText = (date) => date.slice(8, 10);
export const todayInPhilly = () => new Intl.DateTimeFormat('en-CA', {timeZone:site.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const getUpcoming = (limit = 3) => calendar.events.filter(e => e.date >= todayInPhilly()).slice(0, limit);
export function resolveLanguage(preferences = []) {
  for (const language of preferences) {
    const l = language.toLowerCase();
    if (l.startsWith('zh')) return /hant|tw|hk|mo/.test(l) ? 'zh-hant' : 'zh-hans';
    if (l.startsWith('en')) return 'en';
  }
  return site.defaultLanguage;
}
