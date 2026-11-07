const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const read=file=>fs.readFileSync(path.join(__dirname,file),'utf8');
const treasures=read('v17-treasures.js');
const loader=read('ui-v435.js');
const sql=read('supabase/05_bradavice_nove_poklady_v19.sql');

const locations={
  'tajna-mistnost.html':['forgotten_room_chest',15,2],
  'tajemna-komnata.html':['secret_chamber_coins',40,0],
  'kamen-mudrcu-zrcadlo.html':['philosopher_hall_coins',70,0],
  'zapovezeny-les.html':['forbidden_forest_coins',10,0],
  'tajemna-cesta.html':['chamber_corridor_coins',5,0]
};
for(const [page,[id,amount,bombs]] of Object.entries(locations)){
  assert(treasures.includes(`'${page}':{id:'${id}'`),`Chybí nález ${id} na ${page}`);
  assert(loader.includes(`'${page}'`),`Nález se nenačte na ${page}`);
  assert(read(page).includes('ui-v435.js?v=20'),`Stránka ${page} používá starý loader`);
  if(id!=='chamber_corridor_coins'){
    assert(sql.includes(`when '${id}' then amount := ${amount};`),`Špatný počet galeonů: ${id}`);
    if(bombs)assert(sql.includes(`amount := ${amount}; bombs := ${bombs};`),`Chybí bomby v truhle ${id}`);
  }
}
assert(!treasures.includes("'chodby-stara-galerie.html':"),'V podzemní galerii nesmí zůstat stará truhla');
assert(!treasures.includes("'tajemna-komnata.html':{id:'salazar_chest'"),'Truhla nesmí být v Tajemné komnatě');
assert(treasures.includes("'v19_claim_treasure'"),'Nové nálezy musejí používat nové zabezpečené RPC');
assert(treasures.includes("w:'clamp(22px,2.1vw,36px)'"),'Galeony musí být malé a nenápadné.');
assert(loader.includes('v17-treasures.js?v=20'),'Změna velikosti galeonů musí obejít mezipaměť prohlížeče.');
assert(sql.includes('student_treasures')&&sql.includes('on conflict do nothing'),'Odměna musí být jednorázová');
const office=read('v446-umbridge.js');
const officeCss=read('v469-office.css');
const officeHtml=read('kabinet-umbridge.html');
assert(office.includes("UI?.render('',[['▶ Přehrát promluvu znovu'"),'Nahrávka nesmí mít falešný přepis');
assert(office.includes("new Audio('audio/umbridge-hnojovka-v17.mp3')"),'Hlas Umbridgeové musí zůstat');
assert(officeCss.includes('.umbridge-dialog.v19-voice-only'),'Hlasové ovládání se musí přesunout mimo postavu');
assert(officeHtml.includes('v446-umbridge.js?v=19')&&officeHtml.includes('v469-office.css?v=19'),'Kabinet musí načíst novou verzi');
console.log('V pořádku: 5 nálezů, odměny ze Supabase a nepřekrývající hlasové ovládání Umbridgeové.');
