import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const root = new URL('../', import.meta.url);
const read = file => readFile(new URL(file, root), 'utf8');
const manifest = JSON.parse(await read('scripts/calendar-sources/manifest.json'));
const years = JSON.parse(await read('src/data/holy-days.json')).years;
const monthNames = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
const dayNames = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
const gregorianMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const stem = '甲乙丙丁戊己庚辛壬癸', branch = '子丑寅卯辰巳午未申酉戌亥';
const cyclicalYear = year => `${stem[(year - 4) % 10]}${branch[(year - 4) % 12]}年`;
const isoDate = (year, month, day) => `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
const civilDate = date => new Date(`${date}T12:00:00+08:00`);
const icu = new Intl.DateTimeFormat('en-u-ca-chinese', {timeZone:'Asia/Hong_Kong', year:'numeric', month:'numeric', day:'numeric'});
assert.equal(icu.resolvedOptions().calendar, 'chinese', 'The independent Chinese-calendar implementation must be available.');

// Independently expand CWA's printed month starts and month lengths into civil dates.
// This also covers the preceding lunar year and its leap month at the year boundary.
const cwaBytes = await readFile(new URL(`scripts/calendar-sources/${manifest.cwa.file}`, root));
assert.equal(createHash('sha256').update(cwaBytes).digest('hex'), manifest.cwa.sha256);
const cwaDays = new Map();
const monthRows = [...cwaBytes.toString('utf8').matchAll(/^\s+(\d{4})\s+國([^\n]+)\n\s+民\s+\d+\s+農([^\n]+)/gm)];
assert.equal(monthRows.length, 3, 'Expected CWA lunar years 2025–2027.');
let previousMonthEnd;
for (const [, yearText, startsText, lengthsText] of monthRows) {
  const lunarYear = Number(yearText);
  const starts = [...startsText.matchAll(/(翌\s*)?(\d{1,2})\/(\d{1,2})/g)];
  const months = [...lengthsText.matchAll(/(閏\s*)?(正|\d{1,2})\s*月?([大小])/g)];
  assert.equal(starts.length, months.length);
  assert.equal(months.filter(month => !month[1]).length, 12);
  starts.forEach(([, followingYear, m, d], index) => {
    const [, leap, number, size] = months[index];
    const date = isoDate(lunarYear + (followingYear ? 1 : 0), m, d);
    const start = Date.parse(`${date}T12:00:00Z`);
    if (previousMonthEnd !== undefined) assert.equal(start, previousMonthEnd, `CWA month length / start mismatch: ${date}`);
    const length = size === '大' ? 30 : 29;
    for (let day = 1; day <= length; day++) {
      const civil = new Date(start + (day - 1) * 86400000).toISOString().slice(0, 10);
      assert(!cwaDays.has(civil));
      cwaDays.set(civil, {date:civil, lunarYear, lunarMonth:number === '正' ? 1 : Number(number), leapMonth:Boolean(leap), lunarDay:day});
    }
    previousMonthEnd = start + length * 86400000;
  });
}

async function source(year, format) {
  const record = manifest.files.find(item => item.year === year && item.format === format);
  assert(record, `Missing ${format} evidence for ${year}`);
  const bytes = await readFile(new URL(`scripts/calendar-sources/${record.file}`, root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), record.sha256, `Source changed: ${record.file}`);
  return bytes.toString('utf8').replace(/^\uFEFF/, '');
}

const dates = [];
const icuDifferences = [];
let verifiedDays = 0;
for (const year of years) {
  const csv = (await source(year, 'csv')).trim().split(/\r?\n/);
  assert.equal(csv.shift(), 'Gregorian Date,Chinese year (Gan-Zhi),Chinese year (Zodiac),Lunar month,Lunar Date');
  const text = new Map([...(await source(year, 'text')).matchAll(/^(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\S+)\s+(星期[日一二三四五六])/gm)]
    .map(([, y, m, d, lunarLabel, weekday]) => [isoDate(y, m, d), {lunarLabel, weekday}]));
  const yearDays = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;
  assert.equal(csv.length, yearDays, `CSV must cover every day in ${year}`);
  assert.equal(text.size, yearDays, `Text table must cover every day in ${year}`);
  csv.forEach((line, index) => {
    const [gregorian, ganzhi, zodiac, monthLabel, dayLabel, extra] = line.split(',');
    assert.equal(extra, undefined, `Unexpected CSV columns: ${line}`);
    assert(zodiac);
    const match = gregorian.match(/^(\d{1,2})-([A-Z][a-z]{2})-(\d{2})$/);
    assert(match, `Unrecognised Gregorian date: ${gregorian}`);
    assert.equal(Number(match[3]), year % 100);
    const date = isoDate(year, gregorianMonths.indexOf(match[2]) + 1, Number(match[1]));
    assert.equal(date, new Date(Date.UTC(year, 0, index + 1)).toISOString().slice(0, 10), 'No missing, duplicate, or shifted civil date.');
    const leapMonth = /^閏|^闰/.test(monthLabel);
    const lunarMonth = monthNames.indexOf(monthLabel.replace(/^閏|^闰/, '')) + 1;
    const lunarDay = dayNames.indexOf(dayLabel) + 1;
    const lunarYear = [year - 1, year].find(candidate => cyclicalYear(candidate) === ganzhi);
    assert(lunarMonth > 0 && lunarDay > 0 && lunarYear, `Unrecognised lunar fields: ${line}`);
    const printed = text.get(date);
    assert.equal(printed.lunarLabel, lunarDay === 1 ? monthLabel : dayLabel, `Official text / CSV disagreement: ${date}`);
    assert.equal(printed.weekday, `星期${'日一二三四五六'[civilDate(date).getUTCDay()]}`, `Weekday mismatch: ${date}`);
    const parts = Object.fromEntries(icu.formatToParts(civilDate(date)).map(part => [part.type, part.value]));
    const icuMonth = parts.month.match(/^(\d+)(bis)?$/);
    assert(icuMonth, `Unrecognised ICU month: ${parts.month}`);
    const record = {date, lunarYear, lunarMonth, leapMonth, lunarDay};
    assert.deepEqual(cwaDays.get(date), record, `CWA / HKO official date disagreement: ${date}`);
    const icuFields = [Number(parts.relatedYear), Number(icuMonth[1]), Boolean(icuMonth[2]), Number(parts.day)];
    const officialFields = [lunarYear, lunarMonth, leapMonth, lunarDay];
    // ICU is diagnostic only: ICU 78.3 shifts 2027's first lunar month by one day.
    // Public dates come from the two agreeing government sources, never Intl.
    if (JSON.stringify(icuFields) !== JSON.stringify(officialFields)) icuDifferences.push({date, icu:icuFields, official:officialFields});
    if (lunarDay === 1 || lunarDay === 15) dates.push(record);
    verifiedDays++;
  });
}
assert.deepEqual(dates, [...cwaDays.values()].filter(record => years.includes(Number(record.date.slice(0,4))) && [1,15].includes(record.lunarDay)));
assert.equal(new Set(dates.map(record => record.date)).size, dates.length);
for (let index = 1; index < dates.length; index++) {
  const previous = dates[index - 1], current = dates[index];
  const gap = (civilDate(current.date) - civilDate(previous.date)) / 86400000;
  assert.notEqual(current.lunarDay, previous.lunarDay, 'First and fifteenth days must alternate.');
  assert(previous.lunarDay === 1 ? gap === 14 : gap === 15 || gap === 16, `Invalid lunar half-month gap before ${current.date}`);
}

const dataFile = new URL('src/data/lunar-practice.json', root);
const reviewFile = new URL('LUNAR_PRACTICE_DATES.md', root);
const review = '# 农历初一、十五法会日期核对表\n\n'
  + `覆盖公历 ${years.join('、')} 全年，共 ${dates.length} 个日期。以香港天文台逐日 CSV、文本年历及中央气象署月首／大小月表交叉核对；依据与方法见 [CALENDAR_SOURCES.md](CALENDAR_SOURCES.md)。\n\n`
  + '以下为标准中国农历对应的公历日期，不按费城时差前移。寺院已确认每月初一、十五有法会；具体开始时间尚待公布。\n\n'
  + '| 公历日期 | 星期 | 农历年 | 农历日期 |\n|---|---|---|---|\n'
  + dates.map(record => `| ${record.date} | 星期${'日一二三四五六'[civilDate(record.date).getUTCDay()]} | ${record.lunarYear} | ${record.leapMonth ? '闰' : ''}${monthNames[record.lunarMonth - 1]}${dayNames[record.lunarDay - 1]} |`).join('\n') + '\n';
if (process.argv.includes('--write')) {
  let existing = {};
  try { existing = JSON.parse(await readFile(dataFile, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const data = {time:null, excludedDates:[], timeOverrides:{}, ...existing, years, dates};
  await writeFile(dataFile, `${JSON.stringify(data, null, 2)}\n`);
  await writeFile(reviewFile, review);
}
assert.equal(await readFile(reviewFile, 'utf8'), review, 'The review table must match the verified dates.');
const stored = JSON.parse(await readFile(dataFile, 'utf8'));
assert.deepEqual(stored.years, years);
assert.deepEqual(stored.dates, dates, 'Published lunar dates must exactly match the verified source-derived dates.');
const validTime = time => time === null || (typeof time === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time));
assert(validTime(stored.time), 'Use a confirmed HH:MM start time or null.');
assert(Array.isArray(stored.excludedDates));
assert.equal(new Set(stored.excludedDates).size, stored.excludedDates.length);
for (const date of stored.excludedDates) assert(dates.some(record => record.date === date), `Unknown excluded lunar date: ${date}`);
for (const [date, time] of Object.entries(stored.timeOverrides)) {
  assert(dates.some(record => record.date === date), `Unknown time override date: ${date}`);
  assert(validTime(time), `Invalid start time: ${date}`);
}
const counts = years.map(year => `${year}: ${dates.filter(record => record.date.startsWith(`${year}-`)).length}`).join('; ');
console.log(`PASS: ${verifiedDays} daily lunar conversions agree across HKO CSV, HKO text, and CWA's printed month-start/length table; ${dates.length} first/fifteenth dates (${counts}).`);
console.log(icuDifferences.length
  ? `ICU ${process.versions.icu} diagnostic: ${icuDifferences.length} differing civil dates (${icuDifferences[0].date}–${icuDifferences.at(-1).date}); verified official dates are used. See CALENDAR_SOURCES.md.`
  : `ICU ${process.versions.icu} diagnostic: all ${verifiedDays} dates also agree.`);
