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
assert(load('letter-v42.js').includes("location.replace('pricna-ulice/index.html')"));
assert(load('pricna-ulice/app.js').includes('href="../rozrazeni.html"'));
assert(load('hrad.html').includes('href="pricna-ulice/index.html"'));
assert(load('inventory-v445.js').includes('MAX=12'));
for(let i=1;i<=11;i++){
 const n=String(i).padStart(2,'0');
 assert(exists(`pricna-ulice/zbozi/hulky/novinka_${n}.webp`),`Chybí nová hůlka ${i}`);
}
console.log('OK — všech 6 scén, tajná stezka bez mapy, deník, video, monolog, 11 hůlek, 12 míst a přechody.');
