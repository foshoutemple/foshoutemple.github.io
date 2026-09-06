export function normalizeEventDate(value, source) {
  const invalid = () => new Error(`Invalid event date in ${source}: expected a valid YYYY-MM-DD date.`);
  let date;
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) throw invalid();
    date = value.toISOString().slice(0, 10);
  } else if (typeof value === 'string') {
    date = value.trim();
  } else {
    throw invalid();
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw invalid();
  const parsed = new Date(`${date}T12:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) throw invalid();
  return date;
}

export function publishedEvents(modules) {
  return Object.entries(modules)
    .filter(([, module]) => module.frontmatter && !module.frontmatter.draft)
    .map(([source, module]) => ({
      ...module.frontmatter,
      date: normalizeEventDate(module.frontmatter.date, source),
    }));
}
