// Consume verified civil dates. Do not recalculate lunar dates in the browser.
export function buildLunarPracticeEvents(data, copy) {
  const localized = get => Object.fromEntries(['zh-hans', 'zh-hant', 'en'].map(lang => [lang, get(copy[lang].lunarPractice, lang)]));
  return data.dates.filter(record => !data.excludedDates.includes(record.date)).map(record => ({
    ...record,
    slug: `lunar-${record.date}`,
    time: Object.hasOwn(data.timeOverrides, record.date) ? data.timeOverrides[record.date] : data.time,
    title: localized(t => record.lunarDay === 1 ? t.firstTitle : t.fifteenthTitle),
    description: localized(t => t.description),
    lunar: localized((t, lang) => t.dateLabel
      .replace('{year}', String(record.lunarYear))
      .replace('{leap}', record.leapMonth ? t.leap : '')
      .replace('{month}', t.monthNames[record.lunarMonth - 1])
      .replace('{day}', lang === 'en' ? String(record.lunarDay) : record.lunarDay === 1 ? '初一' : '十五')),
  }));
}
