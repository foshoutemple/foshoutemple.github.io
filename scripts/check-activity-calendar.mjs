import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {isMonthKey, shiftMonth, monthDays, monthActivities, nextPracticeDate} from '../src/lib/activity-calendar.js';
import {normalizeEventDate, publishedEvents} from '../src/lib/event-content.js';
import {buildLunarPracticeEvents, suppressOverlappingLunarEvents} from '../src/lib/lunar-practice.js';

const regular = JSON.parse(await fs.readFile(new URL('../src/data/weekly-practice.json', import.meta.url), 'utf8'));
for (const key of ['morningStart', 'morningEnd', 'afternoonStart']) assert.match(regular[key], /^(?:[01]\d|2[0-3]):[0-5]\d$/, `Invalid weekly practice time: ${key}`);
assert(regular.morningStart < regular.morningEnd && regular.morningEnd < regular.afternoonStart, 'Weekly practice times must be chronological.');
assert(Array.isArray(regular.excludedDates), 'Excluded Sunday dates must be an array.');
assert.equal(new Set(regular.excludedDates).size, regular.excludedDates.length, 'Excluded dates must be unique.');
for (const value of regular.excludedDates) {
  const date = normalizeEventDate(value, 'weekly-practice.json');
  assert.equal(new Date(`${date}T12:00:00Z`).getUTCDay(), 0, `An excluded weekly practice date must be a Sunday: ${date}`);
}

assert.equal(shiftMonth('2026-12', 1), '2027-01');
assert.equal(shiftMonth('2027-01', -1), '2026-12');
assert.equal(shiftMonth('1000-01', -1), '1000-01');
assert.equal(shiftMonth('9999-12', 1), '9999-12');
for (const value of ['2026-00', '2026-13', '2026-9', 'wrong', null]) assert(!isMonthKey(value));
assert.equal(monthDays('2028-02').filter(Boolean).length, 29, 'Leap day must be present.');
assert.equal(monthDays('2027-02').filter(Boolean).length, 28);
assert.equal(monthDays('2026-08').length, 42, 'A six-week month must not truncate its last days.');
assert.equal(monthDays('2026-11')[0], '2026-11-01', 'Weeks begin on Sunday.');
assert.deepEqual(monthActivities('2026-09').map(entry => entry.date), ['2026-09-06', '2026-09-13', '2026-09-20', '2026-09-27']);
assert.equal(nextPracticeDate('2026-09-06'), '2026-09-06');
assert.equal(nextPracticeDate('2026-09-06', ['2026-09-06','2026-09-13']), '2026-09-20', 'The homepage must skip excluded Sundays too.');
assert.equal(nextPracticeDate('2026-12-31'), '2027-01-03');

const translations = {'zh-hans':'测试', 'zh-hant':'測試', en:'Test'};
const frontmatter = {draft:false, slug:'special-service', date:'2026-09-13', title:translations, description:translations};
const events = publishedEvents({confirmed:{frontmatter}, draft:{frontmatter:{...frontmatter, slug:'private-draft', draft:true}}, nextMonth:{frontmatter:{...frontmatter, slug:'next-month', date:'2026-10-04'}}});
const both = monthActivities('2026-09', events);
assert.equal(both.filter(entry => entry.date === '2026-09-13').length, 2, 'A special service and regular practice can share a date.');
assert(!both.some(entry => entry.slug === 'private-draft' || entry.slug === 'next-month'));
const adjusted = monthActivities('2026-09', events, ['2026-09-13']);
assert.deepEqual(adjusted.filter(entry => entry.date === '2026-09-13').map(entry => entry.type), ['service'], 'Excluding regular practice must preserve the announced service.');
assert.equal(monthActivities('2026-09', [], ['2026-09-06','2026-09-13','2026-09-20','2026-09-27']).length, 0, 'A month can have no scheduled activities.');
console.log('PASS: activity calendar month/year boundaries, leap day, Sunday recurrence, shared dates, draft privacy and schedule exceptions.');

const lunarData = JSON.parse(await fs.readFile(new URL('../src/data/lunar-practice.json', import.meta.url), 'utf8'));
const holyDays = JSON.parse(await fs.readFile(new URL('../src/data/holy-days.json', import.meta.url), 'utf8'));
const copy = JSON.parse(await fs.readFile(new URL('../src/data/copy.json', import.meta.url), 'utf8'));
const lunar = buildLunarPracticeEvents({...lunarData, time:null, excludedDates:[], timeOverrides:{}}, copy);
assert.equal(lunar.length, lunarData.dates.length);
assert.equal(lunar.find(e => e.date === '2026-09-25').time, '10:00', 'Missing global time falls back to the temple default.');
assert.equal(buildLunarPracticeEvents(lunarData, copy).length, lunarData.dates.length - lunarData.excludedDates.length);
for (const event of lunar) for (const lang of ['zh-hans', 'zh-hant', 'en']) {
  for (const key of ['title', 'description', 'lunar']) assert(event[key][lang] && !/[{}]/.test(event[key][lang]), `${event.slug}: complete localized ${key}`);
}
assert.equal(lunar.find(e => e.date === '2026-01-03').lunarYear, 2025, 'January carryover retains the previous lunar year.');
assert.equal(lunar.find(e => e.date === '2027-02-06').lunar['zh-hant'], '農曆2027年正月初一', 'Do not use the ICU one-day shift.');
assert.equal(lunar.find(e => e.date === '2027-02-20').lunarDay, 15);
assert(!lunar.some(e => e.date === '2027-02-07' || e.date === '2027-02-21'));
const withoutBirthdayOverlap = suppressOverlappingLunarEvents(lunar, holyDays.events);
const birthdayOverlapDates = holyDays.events.filter(event => event.type === 'birth' && lunar.some(lunarEvent => lunarEvent.date === event.date)).map(event => event.date);
assert(birthdayOverlapDates.length, 'The verified holy-day data must exercise birthday/lunar-date precedence.');
for (const date of birthdayOverlapDates) assert(!withoutBirthdayOverlap.some(event => event.date === date), `Birthday assembly must replace the recurring lunar assembly on ${date}.`);
const announcedBirthday = {...frontmatter, date:'2026-09-25', replacesLunarPractice:true};
assert(!suppressOverlappingLunarEvents([...lunar, {...lunar[0], date:'2026-09-25'}], [announcedBirthday]).some(event => event.date === '2026-09-25'), 'An announced birthday assembly must replace a same-day recurring lunar assembly.');
assert.equal(monthActivities('2026-05', lunar).filter(e => e.date === '2026-05-17').length, 2, 'A lunar assembly and Sunday practice can share a date.');
assert.equal(monthActivities('2026-09', [...lunar, {...frontmatter, date:'2026-09-11'}]).filter(e => e.date === '2026-09-11').length, 2, 'A special announcement must not erase a lunar assembly on the same date.');
const adjustedLunar = buildLunarPracticeEvents({...lunarData, time:'10:00', excludedDates:['2026-09-11'], timeOverrides:{'2026-09-25':'11:00','2026-10-10':null}}, copy);
assert(!adjustedLunar.some(e => e.date === '2026-09-11'));
assert.equal(adjustedLunar.find(e => e.date === '2026-09-25').time, '11:00');
assert.equal(adjustedLunar.find(e => e.date === '2026-10-10').time, null, 'An explicit pending time overrides a default time.');
assert.equal(adjustedLunar.find(e => e.date === '2026-10-24').time, '10:00');
assert.throws(() => publishedEvents({collision:{frontmatter:{...frontmatter,slug:lunar[0].slug}}}, lunar.map(e => e.slug)), /duplicate slug/);
console.log('PASS: lunar-year carryover, official 2027 new year, translations, shared dates, time overrides, cancellations and route collisions.');
