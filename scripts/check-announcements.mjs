import assert from 'node:assert/strict';
import {announcementImageSource, latestUpdates, publishedEvents, publishedNews} from '../src/lib/event-content.js';

const text = {'zh-hans':'测试消息', 'zh-hant':'測試消息', en:'Test announcement'};
const base = {draft:false, slug:'announcement', date:'2026-09-08', title:text, description:text};
const image = {src:'/images/posters/assembly.png', width:1054, height:1492, alt:text};
const news = publishedNews({
  withImage:{frontmatter:{...base, image}},
  withoutImage:{frontmatter:{...base, slug:'text-only', date:'2026-09-06'}},
  privateDraft:{frontmatter:{draft:true, image:{src:'private-file'}}},
});
assert.equal(news.length, 2, 'Unpublished drafts must never enter the feed.');
assert.deepEqual(news[0].image, image, 'News must preserve image metadata and translations.');
assert.equal(news[1].image, null, 'Text-only announcements must remain supported.');

const events = publishedEvents({
  assembly:{frontmatter:{...base, date:'2026-09-10', publishedDate:'2026-09-07', time:null, image}},
  future:{frontmatter:{...base, slug:'later-assembly', date:'2026-12-01', publishedDate:'2026-09-05'}},
});
const before = JSON.stringify({news, events});
const merged = latestUpdates(news, events);
assert.deepEqual(merged.map(entry => `${entry.route}/${entry.slug}`), [
  'news/announcement', 'services/announcement', 'news/text-only', 'services/later-assembly',
], 'News and assemblies must merge by publication date, with distinct detail routes.');
assert.equal(merged[1].date, '2026-09-10', 'The feed must preserve the actual assembly date for the calendar.');
assert.equal(events[0].time, '10:00', 'An unspecified Dharma Assembly time uses the temple default.');
assert.equal(events[1].time, '10:00', 'An omitted Dharma Assembly time uses the temple default.');
assert.equal(JSON.stringify({news, events}), before, 'Merging must not mutate the original calendar or news data.');
assert.deepEqual(latestUpdates([], []), [], 'A combined feed can be empty.');

const publish = entry => publishedNews({entry:{frontmatter:entry}});
for (const invalid of [
  {...image, src:'https://example.com/image.png'},
  {...image, src:'/images/../private.png'},
  {...image, width:0},
  {...image, height:'1492'},
  {...image, alt:{...text, en:''}},
]) assert.throws(() => publish({...base, image:invalid}), /image\./, 'Invalid image metadata must fail before publication.');
assert.throws(() => publish({...base, publishedDate:'2026-02-30'}), /Invalid event date/);
const localizedImage = {...image, src:{
  'zh-hans':'/images/posters/assembly-zh-hans.png',
  'zh-hant':'/images/posters/assembly-zh-hant.png',
  en:'/images/posters/assembly-en.png',
}};
const localizedEvent = publishedEvents({entry:{frontmatter:{...base, image:localizedImage}}})[0];
assert.deepEqual(localizedEvent.image, localizedImage, 'Published assemblies preserve every localized poster source.');
assert.deepEqual(publish({...base, image:localizedImage})[0].image, localizedImage, 'General announcements can also use localized posters.');
for (const lang of ['zh-hans', 'zh-hant', 'en']) {
  assert.equal(announcementImageSource(localizedEvent.image, lang), localizedImage.src[lang], 'Each language resolves its own poster.');
  assert.equal(announcementImageSource(image, lang), image.src, 'Existing shared posters keep working in all languages.');
  for (const badSource of [undefined, '', 'https://example.com/poster.png', '/images/../private.png', '/images/%2e%2e/private.png']) {
    const invalidImage = {...localizedImage, src:{...localizedImage.src, [lang]:badSource}};
    assert.throws(() => publish({...base, image:invalidImage}), /image\.src\./, 'Every localized path must be present and remain under local public images.');
  }
}
assert.equal(announcementImageSource(null, 'en'), null, 'Text-only announcements still have no image.');
console.log('PASS: unified announcements, publication ordering, calendar dates, shared and language-specific posters, text-only entries and draft filtering.');
