import assert from 'node:assert/strict';
import {latestUpdates, publishedEvents, publishedNews} from '../src/lib/event-content.js';

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
console.log('PASS: unified announcements, publication ordering, calendar dates, text-only entries, translated images and draft filtering.');
