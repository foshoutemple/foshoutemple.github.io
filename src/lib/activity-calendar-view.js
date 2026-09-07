import {copy, dateText, dayText, link} from './temple.js';
import {monthDays, monthActivities} from './activity-calendar.js';

const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[character]));
const arrow = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';

export function activityCalendarView(month, events, regular, lang, selectedDate, today) {
  const t = copy[lang].activityCalendar;
  const entries = monthActivities(month, events, regular.excludedDates);
  const title = entry => entry.type === 'weekly' ? t.weeklyTitle : entry.title[lang];
  const time = entry => entry.type === 'weekly'
    ? `${regular.morningStart}–${regular.morningEnd} · ${regular.afternoonStart}`
    : entry.time || t.pendingTime;
  const cells = monthDays(month).map(date => {
    if (!date) return '<td class="activity-outside" aria-hidden="true"></td>';
    const items = entries.filter(entry => entry.date === date);
    const number = `<time datetime="${date}"${date === today ? ' aria-current="date"' : ''}>${Number(dayText(date))}</time>`;
    const classes = `activity-day${date === today ? ' activity-is-today' : ''}${date === selectedDate ? ' activity-selected' : ''}`;
    if (!items.length) return `<td class="${classes}"><div class="activity-day-inner">${number}</div></td>`;
    const name = `${dateText(date, lang)} · ${items.map(title).join(' · ')}`;
    const details = items.map(entry => `<span class="activity-grid-event activity-${entry.type}"><span class="activity-mark" aria-hidden="true"></span><span class="activity-grid-title">${escape(title(entry))}</span></span>`).join('');
    return `<td class="${classes}"><button type="button" class="activity-day-inner" data-activity-date="${date}" aria-label="${escape(name)}" aria-pressed="${date === selectedDate}" aria-controls="activity-agenda">${number}<span class="activity-day-items">${details}</span></button></td>`;
  });
  const tableRows = Array.from({length: cells.length / 7}, (_, index) => `<tr>${cells.slice(index * 7, index * 7 + 7).join('')}</tr>`).join('');
  const displayed = selectedDate ? entries.filter(entry => entry.date === selectedDate) : entries;
  const agenda = displayed.length ? `<ul class="activity-event-list">${displayed.map(entry => `
    <li><a class="activity-event-row" href="${escape(link(lang, `services/${entry.slug}`))}">
      <time class="activity-event-date" datetime="${entry.date}"><strong>${Number(dayText(entry.date))}</strong><span>${escape(dateText(entry.date, lang, {weekday:'short'}))}</span></time>
      <div class="activity-event-copy"><h4>${escape(title(entry))}</h4><p>${escape(time(entry))}</p></div>
      <span class="activity-event-type activity-${entry.type}"><span class="activity-mark" aria-hidden="true"></span>${escape(entry.type === 'weekly' ? t.regularLabel : t.serviceLabel)}</span>${arrow}
    </a></li>`).join('')}</ul>` : `<p class="activity-empty">${escape(t.empty)}</p>`;
  return {
    tableRows,
    agenda,
    monthLabel: dateText(`${month}-01`, lang, {year:'numeric', month:'long'}),
    agendaLabel: selectedDate ? dateText(selectedDate, lang) : t.monthEvents,
  };
}
