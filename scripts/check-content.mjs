import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'..');
const read=async(p)=>JSON.parse(await fs.readFile(path.join(root,p),'utf8'));
const copy=await read('src/data/copy.json'),days=await read('src/data/holy-days.json'),site=await read('src/data/site.json');
const leaves=(v,p='')=>typeof v==='string'?[p]:Object.entries(v).flatMap(([k,x])=>leaves(x,`${p}.${k}`));
const languages=['zh-hans','zh-hant','en'];
for(const lang of languages){assert.deepEqual(leaves(copy[lang]),leaves(copy.en));for(const field of leaves(copy[lang])){let v=copy[lang];for(const part of field.slice(1).split('.'))v=v[part];assert.ok(v.trim(),`${lang}${field} empty`);}}
assert.equal(site.email,'foshoutemple@gmail.com');
assert.equal(site.timezone,'America/New_York');
const ids=new Set();let previous='';
for(const event of days.events){assert.match(event.date,/^\d{4}-\d{2}-\d{2}$/);assert.equal(new Date(`${event.date}T12:00Z`).toISOString().slice(0,10),event.date);assert(!ids.has(event.id));ids.add(event.id);assert(event.date>=previous,'events must be chronological');previous=event.date;for(const lang of languages){assert(event.title[lang]);assert(event.lunar[lang]);}}
const out=path.join(root,'dist');
async function files(dir){return(await Promise.all((await fs.readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]))).flat();}
const pages=(await files(out)).filter(f=>f.endsWith('.html'));let checked=0;
for(const file of pages){const html=await fs.readFile(file,'utf8');assert(!html.includes('undefined'),'undefined rendered');for(const m of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)){const raw=m[1];if(/^(https?:|mailto:|data:|tel:)/.test(raw))continue;const relative=decodeURIComponent(raw.split('?')[0]);let target=relative.startsWith('/')?path.join(out,relative):path.resolve(path.dirname(file),relative);try{if((await fs.stat(target)).isDirectory())target=path.join(target,'index.html');await fs.access(target);checked++;}catch{throw new Error(`Broken internal URL ${raw} in ${path.relative(out,file)}`)}}}
const entry=await fs.readFile(path.join(out,'index.html'),'utf8');
const languageScript=[...entry.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('navigator.languages'));
assert(languageScript,'Language redirect script must exist');
for(const [preferences,saved,expected] of [
 [['zh-CN'],null,'zh-hans'],[['zh-TW'],null,'zh-hant'],[['zh-HK'],null,'zh-hant'],
 [['zh-Hant'],null,'zh-hant'],[['en-US'],null,'en'],[['fr-FR','en'],null,'en'],
 [['ja-JP'],null,'zh-hant'],[['en-US'],'zh-hans','zh-hans'],[['en-US'],'invalid','en'],
]){
 let destination;
 vm.runInNewContext(languageScript,{navigator:{languages:preferences,language:preferences[0]},localStorage:{getItem:()=>saved},location:{search:'?year=2027',hash:'#main',replace:url=>destination=url}});
 assert.equal(destination,`/${expected}/?year=2027#main`);
}
console.log(`PASS: ${languages.length} complete languages; ${days.events.length} dated observances; ${pages.length} pages; ${checked} internal links/assets; 9 browser-language cases.`);
