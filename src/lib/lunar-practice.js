// Consume verified civil dates. Do not recalculate lunar dates in the browser.
export function buildLunarPracticeEvents(data, copy) {
  const defaultTime = data.time ?? '10:00';
  const localized = get => Object.fromEntries(['zh-hans', 'zh-hant', 'en'].map(lang => [lang, get(copy[lang].lunarPractice, lang)]));
  return data.dates.filter(record => !data.excludedDates.includes(record.date)).map(record => ({
    ...record,
    slug: `lunar-${record.date}`,
    time: Object.hasOwn(data.timeOverrides, record.date) ? data.timeOverrides[record.date] : defaultTime,
    title: localized(t => record.lunarDay === 1 ? t.firstTitle : t.fifteenthTitle),
    description: localized(t => t.description),
    lunar: localized((t, lang) => t.dateLabel
      .replace('{year}', String(record.lunarYear))
      .replace('{leap}', record.leapMonth ? t.leap : '')
      .replace('{month}', t.monthNames[record.lunarMonth - 1])
      .replace('{day}', lang === 'en' ? String(record.lunarDay) : record.lunarDay === 1 ? '初一' : '十五')),
  }));
}

// A published Buddha/Bodhisattva birthday assembly takes precedence over the
// recurring first/fifteenth-day assembly on the same civil date. Holy-day
// records use type: "birth"; an announced assembly can opt in explicitly with
// replacesLunarPractice: true.
export function suppressOverlappingLunarEvents(lunarEvents, priorityEvents = []) {
  const priorityDates = new Set(priorityEvents
    .filter(event => event?.type === 'birth' || event?.replacesLunarPractice === true)
    .map(event => event.date));
  return lunarEvents.filter(event => !priorityDates.has(event.date));
}
