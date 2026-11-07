/* Lokální test návaznosti bez přihlášení: node overeni_spojeni_v15.cjs */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const load=f=>fs.readFileSync(path.join(root,f),'utf8');
const exists=f=>fs.existsSync(path.join(root,f));
const pages=['divci-umyvarna.html','hagriduv-dum.html','zapovezeny-les.html','tajemna-cesta.html','tajemna-komnata.html','aragogova-mytina.html'];
for(const name of pages){
 const html=load(name);
 assert(html.includes('raddle-story-v15.js'),`${name}: chybí logika`);
 assert(html.includes('raddle-story-v15.css'),`${name}: chybí vzhled`);
 for(const [,href] of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
  if(/^(?:https?:|data:|mailto:)/.test(href))continue;
  const local=href.split('?')[0];if(!local)continue;
  assert(exists(local),`${name}: chybí odkazovaný soubor ${local}`);
 }
}
assert(load('zapovezeny-les.html').includes('id="aragogHiddenTrail"'));
assert(!load('hrad.html').includes('aragogova-mytina.html'),'Aragog nesmí být na mapě.');
assert(load('divci-umyvarna.html').includes('id="raddleWashDiary"'));
assert(load('chamber-v4367.js').includes('audio/raddle-monolog-v15.mp3'));
assert(load('raddle-story-v15.js').includes('video/tom-raddle-vzpominka-v15.mp4'));
assert(load('raddle-story-v15.js').includes('if(phase()>=4)location.href'));
assert(exists('video/tom-raddle-vzpominka-v15.mp4'));
assert(exists('audio/raddle-monolog-v15.mp3'));
assert(exists('img/aragogova-mytina-v15.webp'));
assert(load('letter-v42.js').includes("location.replace('https://majda171.github.io/bradadavice_pricna_ulice/')"));
assert(load('hrad.html').includes('href="https://majda171.github.io/bradadavice_pricna_ulice/"'));
const story=load('raddle-story-v15.js');
assert(story.includes("['Co se ti stalo?',()=>{"),'Uršula se musí nejprve nechat zeptat, co se stalo.');
assert(story.includes("Tamhle leží, mezi umyvadly"),'Uršula má ukázat na deník.');
assert(!story.includes('Podívat se po knize')&&!story.includes('Zajdi se zeptat Hagrida'),'Úkol nesmí dávat explicitní návod.');
assert(story.includes("modal('Vzpomínka skončila'")&&story.includes("[['Zavřít']]);"),'Vzpomínka končí bez úkolového tlačítka.');
assert(load('inventory-v445.js').includes('MAX=40'));
console.log('OK — všech 6 scén, tajná stezka bez mapy, přirozený dialog Uršuly, deník, video, 40 míst v batohu a přechody.');
