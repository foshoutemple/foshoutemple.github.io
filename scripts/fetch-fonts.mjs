import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname,'..');
const copy = JSON.parse(await fs.readFile(path.join(root,'src/data/copy.json'),'utf8'));
const events = JSON.parse(await fs.readFile(path.join(root,'src/data/holy-days.json'),'utf8'));
const allText = JSON.stringify([copy,events])+'佛壽寺简体繁體年月日0123456789';
const han = [...new Set(allText.match(/[\u3400-\u9fff]/g))].join('');
const fonts = [
 {family:'Noto Serif SC',name:'Temple Serif SC',weight:500,text:han,file:'noto-serif-sc.ttf'},
 {family:'Noto Serif TC',name:'Temple Serif TC',weight:500,text:han,file:'noto-serif-tc.ttf'},
 {family:'EB Garamond',name:'Temple Serif Latin',weight:500,file:'eb-garamond.ttf'},
];
const css=[];
for (const font of fonts) {
 const url=new URL('https://fonts.googleapis.com/css2');
 url.searchParams.set('family',`${font.family}:wght@${font.weight}`);url.searchParams.set('display','swap');if(font.text)url.searchParams.set('text',font.text);
 const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}});if(!response.ok)throw new Error(`Font CSS ${response.status}`);
 const body=await response.text();
 const matches=[...body.matchAll(/url\((https:[^)]+)\)/g)];if(!matches.length)throw new Error('No font URL');
 const source=matches.at(-1)[1];const data=await fetch(source);if(!data.ok)throw new Error(`Font data ${data.status}`);
 await fs.writeFile(path.join(root,'public/fonts',font.file),Buffer.from(await data.arrayBuffer()));
 css.push(`@font-face{font-family:'${font.name}';font-style:normal;font-weight:400 700;font-display:swap;src:url('./${font.file}') format('truetype');}`);
 console.log(`${font.family}: downloaded`);
}
await fs.writeFile(path.join(root,'public/fonts/fonts.css'),css.join('\n')+'\n');
await fs.writeFile(path.join(root,'public/fonts/SOURCES.txt'),'Fonts: Noto Serif SC, Noto Serif TC, EB Garamond. Source: Google Fonts. Licensed under the SIL Open Font License. Chinese files contain a subset of the current website text. Run scripts/fetch-fonts.mjs after substantial new Chinese headings.\n');
