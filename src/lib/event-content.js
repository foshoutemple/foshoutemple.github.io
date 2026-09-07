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

function publishedEntries(modules, reservedSlugs = []) {
  const slugs = new Set(reservedSlugs);
  return Object.entries(modules)
    .filter(([, module]) => module.frontmatter?.draft === false)
    .map(([source, module]) => {
      const entry = module.frontmatter;
      if (typeof entry.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug) || slugs.has(entry.slug)) {
        throw new Error(`Invalid or duplicate slug in ${source}: use a unique lowercase name with hyphens.`);
      }
      slugs.add(entry.slug);
      for (const field of ['title', 'description']) {
        for (const lang of ['zh-hans', 'zh-hant', 'en']) {
          if (typeof entry[field]?.[lang] !== 'string' || !entry[field][lang].trim()) {
            throw new Error(`Missing ${field}.${lang} in ${source}: published entries need all three languages.`);
          }
        }
      }
      return {...entry, date: normalizeEventDate(entry.date, source)};
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function publishedEvents(modules) {
  return publishedEntries(modules, ['sunday']);
}

export function publishedNews(modules) {
  return publishedEntries(modules);
}
