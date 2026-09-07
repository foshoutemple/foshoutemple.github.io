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

function localizedText(value, field, source) {
  for (const lang of ['zh-hans', 'zh-hant', 'en']) {
    if (typeof value?.[lang] !== 'string' || !value[lang].trim()) {
      throw new Error(`Missing ${field}.${lang} in ${source}: published entries need all three languages.`);
    }
  }
}

function announcementImage(image, source) {
  if (image == null) return null;
  if (typeof image !== 'object' || typeof image.src !== 'string' ||
      !/^\/images\/[^?#\\%]+\.(?:png|jpe?g|webp|avif)$/i.test(image.src) ||
      image.src.split('/').some(part => part === '.' || part === '..')) {
    throw new Error(`Invalid image.src in ${source}: use a local image under /images/.`);
  }
  for (const dimension of ['width', 'height']) {
    if (!Number.isInteger(image[dimension]) || image[dimension] <= 0) {
      throw new Error(`Invalid image.${dimension} in ${source}: use the original image dimensions.`);
    }
  }
  localizedText(image.alt, 'image.alt', source);
  return image;
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
      for (const field of ['title', 'description']) localizedText(entry[field], field, source);
      const date = normalizeEventDate(entry.date, source);
      const publishedDate = entry.publishedDate == null ? date : normalizeEventDate(entry.publishedDate, source);
      if (entry.replacesLunarPractice != null && typeof entry.replacesLunarPractice !== 'boolean') {
        throw new Error(`Invalid replacesLunarPractice in ${source}: use true or false.`);
      }
      // Fo Shou Temple's default Dharma Assembly start is 10:00 Philadelphia time.
      // An explicitly supplied time (including a future exception) remains unchanged.
      const time = entry.time == null ? '10:00' : entry.time;
      return {...entry, date, publishedDate, time, image: announcementImage(entry.image, source)};
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function publishedEvents(modules, reservedSlugs = []) {
  return publishedEntries(modules, ['sunday', ...reservedSlugs]);
}

export function publishedNews(modules) {
  return publishedEntries(modules);
}

export function latestUpdates(news, events) {
  return [
    ...news.map(entry => ({...entry, route: 'news'})),
    ...events.map(entry => ({...entry, route: 'services'})),
  ].sort((a, b) => (b.publishedDate || b.date).localeCompare(a.publishedDate || a.date)
    || b.date.localeCompare(a.date) || a.route.localeCompare(b.route) || a.slug.localeCompare(b.slug));
}
