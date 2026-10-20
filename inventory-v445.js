(()=>{
'use strict';
if(window.BradaviceInventory)return;
const DB=window.BradaviceDB,MAX=8;
const catalogue={
  "harp": {label:"Stará harfa",description:"Hudba dokáže na chvíli uspat Chloupka.",image:"img/philosopher-harp.webp"},
  "flute": {label:"Kouzelná flétna",description:"Starý nástroj, jehož melodie má zvláštní účinky.",image:"img/inventar/fletna.webp"},
  "scarf": {label:"Kolejní šála",description:"Hřejivá připomínka vlastní koleje.",image:""},
  "bertikovy-fazolky": {label:"Bertíkovy fazolky",description:"V každé fazolce se může skrývat překvapení.",image:"img/inventar/bertikovy-fazolky.webp"},
  "kouzelna-hulka": {label:"Opuštěná hůlka",description:"Někdo tu nechal hůlku. Komu asi patří?",image:"img/inventar/kouzelna-hulka.webp"},
  "letecke-koste": {label:"Staré létající koště",description:"Koště vypadá, že má své nejlepší závody za sebou.",image:"img/inventar/letecke-koste.webp"},
  "mandragora": {label:"Malá mandragora",description:"Vypadá nevinně, ale její křik může být nebezpečný.",image:"img/inventar/mandragora.webp"},
  "lektvar-cerveny": {label:"Červený lektvar",description:"Přes tmavé sklo není poznat, co přesně obsahuje.",image:"img/inventar/lektvar-cerveny.webp"},
  "lektvar-ruzovy": {label:"Růžový lektvar",description:"Lahvička s jemným růžovým obsahem a neznámým účinkem.",image:"img/inventar/lektvar-ruzovy.webp"},
  "sachova-kralovna": {label:"Šachová královna",description:"Zatoulaná figurka z kouzelnické šachové soupravy.",image:"img/inventar/sachova-kralovna.webp"},
  "lucerna": {label:"Stará lucerna",description:"Může se hodit tam, kam nedosahuje denní světlo.",image:"img/inventar/lucerna.webp"},
  "hnojova-bomba": {label:"Bomby hnojůvky",description:"Raději se neptej, co je uvnitř.",image:"img/inventar/hnojova-bomba.webp"},
  "cokoladova-zabka": {label:"Čokoládová žabka",description:"Ve zlatém obalu se něco vrtí.",image:"img/inventar/cokoladova-zabka.webp"},
  "obludne-obludarium": {label:"Obludné obludárium",description:"Kniha se podivně svíjí a možná i kouše.",image:"img/inventar/obludne-obludarium.webp"},
  "stary-pergamen": {label:"Starý pergamen",description:"Je na něm slabý otisk písma. Možná součást většího tajemství.",image:"img/inventar/stary-pergamen.webp"},
};
const owned=new Set(),pending=new Set();let me=null,dbWorking=false,serverAvailable=false,readyDone=false;
let resolveReady;const ready=new Promise(r=>resolveReady=r);
const storageKey=()=>`bradavice_inventory_v443_${me?.id||'guest'}`;
const legacyKey=()=>`bradavice_inventory_harp_v4363_${String(me?.id||'guest').replace(/[^a-zA-Z0-9@._-]/g,'_')}`;
const has=id=>owned.has(id),items=()=>[...owned];
function localItems(){try{return JSON.parse(localStorage.getItem(storageKey())||'[]')}catch{return []}}
function persist(){if(!me)return;try{localStorage.setItem(storageKey(),JSON.stringify(items()))}catch{}}
function scarfImage(){
 let house='';try{const s=JSON.parse(localStorage.getItem('bradavice_student_v1')||'{}');house=String(s?.house||s?.house_code||s?.houseCode||s?.kolej||'').toLowerCase()}catch{}
 if(/mrz|huff|(^m$)/.test(house))return 'img/inventar/sala-mrzimor.webp';
 if(/zmij|slyth|(^z$)/.test(house))return 'img/inventar/sala-zmijozel.webp';
 return '';
}
function iconFor(id){return id==='scarf'?scarfImage():catalogue[id]?.image||''}
function toast(s){window.BradaviceAchievements?.toast?.(s);}
function inform(s){const hint=document.getElementById('bagHint');if(hint)hint.textContent=s;toast(s)}
function repaint(){
 const grid=document.getElementById('bagItems');
 if(grid){grid.replaceChildren();for(const id of owned){const item=catalogue[id];if(!item)continue;
   const slot=document.createElement('div');slot.className='bag-item';const image=iconFor(id);
   if(image){const img=document.createElement('img');img.src=image;img.alt='';img.loading='lazy';slot.append(img)}else{const ico=document.createElement('span');ico.textContent='🧣';ico.className='bag-emoji';slot.append(ico)}
   const title=document.createElement('strong');title.textContent=item.label;const desc=document.createElement('small');desc.textContent=item.description;
   const remove=document.createElement('button');remove.type='button';remove.textContent='Odložit';remove.className='bag-discard';remove.setAttribute('aria-label',`Odložit: ${item.label}`);
   remove.addEventListener('click',async()=>{if(!confirm(`Odložit předmět „${item.label}“ z batohu? V hradě ho bude možné znovu najít.`))return;
      remove.disabled=true;const result=await discard(id);if(!result.ok){remove.disabled=false;inform(result.message||'Předmět se nepodařilo odložit.')} });
   if(id==='hnojova-bomba'){
      const use=document.createElement('button');use.type='button';use.textContent='💨 Použít';use.className='bag-discard';use.setAttribute('aria-label','Použít bomby hnojůvky');
      use.addEventListener('click',async()=>{
        if(location.pathname.endsWith('/kabinet-umbridge.html')){
          inform('V kabinetu se bomby používají v úkolu Freda a George.');return;
        }
        use.disabled=true;
        closeBag();
        // Nejdříve spustit výbuch, teprve potom odebrat použitou bombu.
        window.dispatchEvent(new Event('bradavice:dungbomb-use'));
        const result=await discard('hnojova-bomba');
        if(!result.ok)console.warn('Použitá bomba nebyla odebrána z batohu:',result.message);
      });slot.append(use);
   }
   slot.append(title,desc,remove);grid.append(slot);
 }
 for(let i=owned.size;i<MAX;i++){const slot=document.createElement('div');slot.className='bag-item bag-empty';slot.setAttribute('aria-label','Volné místo');slot.textContent='✧';grid.append(slot)} }
 const usage=document.getElementById('bagUsage');if(usage)usage.textContent=`Obsazeno ${owned.size} / ${MAX} míst`;
 const cap=document.getElementById('bagCapacity');if(cap){cap.max=MAX;cap.value=Math.min(owned.size,MAX)}
 document.querySelectorAll('[data-inventory-pickup]').forEach(el=>{el.hidden=has(el.dataset.inventoryPickup)})
 window.dispatchEvent(new CustomEvent('bradavice:inventory-updated',{detail:{owned:items(),capacity:MAX}}));
}
async function checkRpc(){if(!DB?.client||!me)return false;
 try{const {data,error}=await DB.client.rpc('v445_collect_item',{p_item_id:'__check__'});
 // SQL recognizes check sentinel only for diagnostics; no insert takes place.
 if(error)return false;return data==='ready';}catch{return false}}
async function collect(id){
 if(!me||!catalogue[id])return {ok:false,message:'Nejdříve se přihlas jako student.'};
 if(owned.has(id))return {ok:true,already:true};
 if(pending.has(id))return {ok:false,message:'Předmět se právě ukládá.'};
 if(owned.size>=MAX)return {ok:false,full:true,message:'Kouzelný batoh je plný (8/8). Nejdříve některou věc odlož.'};
 pending.add(id);
 try{
 if(serverAvailable){const {data,error}=await DB.client.rpc('v445_collect_item',{p_item_id:id});
  if(error)return {ok:false,message:'Předmět se nepodařilo uložit do Supabase. Zkus to znovu.'};
  if(data==='full'){await reloadFromServer();return {ok:false,full:true,message:'Batoh je na serveru plný. Nejprve odlož jiný předmět.'}};
  if(!['collected','already'].includes(data))return {ok:false,message:'Ukládání se nepodařilo.'};
 }
 owned.add(id);persist();repaint();toast(`${catalogue[id].label} je v kouzelném batohu.`);return {ok:true};
 }finally{pending.delete(id)}
}
async function discard(id){if(!me||!owned.has(id))return {ok:false};if(pending.has(id))return {ok:false};pending.add(id);
 try{if(serverAvailable){const {data,error}=await DB.client.rpc('v445_discard_item',{p_item_id:id});if(error||data!==true)return {ok:false,message:'Odložení se nepodařilo uložit.'}}
 owned.delete(id);if(id==='harp'){try{localStorage.removeItem(legacyKey());const st=JSON.parse(localStorage.getItem('bradavice_student_v1')||'{}');for(const x of [st?.email,st?.supabaseUserId,me?.email].filter(Boolean))localStorage.removeItem(`bradavice_inventory_harp_v4363_${String(x).replace(/[^a-zA-Z0-9@._-]/g,'_')}`)}catch{}}
 persist();repaint();return {ok:true};
 }finally{pending.delete(id)}}
async function reloadFromServer(){if(!serverAvailable)return;const {data,error}=await DB.client.from('student_inventory').select('item_id').eq('student_id',me.id);if(error)return;owned.clear();for(const row of data||[])if(catalogue[row.item_id])owned.add(row.item_id);persist();repaint()}
let overlay,closeBtn,trigger;
function openBag(){if(!overlay)return;overlay.hidden=false;document.body.style.overflow='hidden';closeBtn.focus()}
function closeBag(){if(!overlay)return;overlay.hidden=true;document.body.style.overflow='';trigger?.focus()}
function createPanel(){if(!me||document.querySelector('.bag-trigger'))return;
 const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='inventory-v445.css?v=446';document.head.append(sheet);
 trigger=document.createElement('button');trigger.className='bag-trigger';trigger.type='button';trigger.title='Můj kouzelný batoh';trigger.setAttribute('aria-label',trigger.title);
 const icon=document.createElement('img');icon.src='img/inventar/kouzelny-batoh.webp';icon.alt='';trigger.append(icon);
 overlay=document.createElement('div');overlay.className='bag-overlay';overlay.hidden=true;
 const panel=document.createElement('section');panel.className='bag-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Kouzelný batoh');
 closeBtn=document.createElement('button');closeBtn.className='bag-close';closeBtn.type='button';closeBtn.textContent='×';closeBtn.setAttribute('aria-label','Zavřít batoh');
 const title=document.createElement('h2');title.textContent='Kouzelný batoh';const sub=document.createElement('p');sub.textContent='Zvenku nenápadný, uvnitř ukrývá osm míst.';
 const usage=document.createElement('p');usage.id='bagUsage';usage.className='bag-usage';const progress=document.createElement('progress');progress.id='bagCapacity';progress.max=MAX;
 const grid=document.createElement('div');grid.className='bag-items';grid.id='bagItems';const hint=document.createElement('p');hint.className='bag-hint';hint.id='bagHint';
 panel.append(closeBtn,title,sub,usage,progress,grid,hint);overlay.append(panel);document.body.append(trigger,overlay);
 trigger.addEventListener('click',openBag);closeBtn.addEventListener('click',closeBag);overlay.addEventListener('click',e=>{if(e.target===overlay)closeBag()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)closeBag()});
 hint.textContent=serverAvailable?'Předměty jsou uložené u tvého studentského účtu.':'Pozor: čeká se na SQL aktualizaci v445. Nálezy se prozatím ukládají pouze v tomto prohlížeči.';
 repaint();
}
async function init(){try{
 if(!DB?.client)return;
 const {data,error}=await DB.client.auth.getUser();if(error||!data?.user)return;me=data.user;
 // Převzetí stávajících nálezů z v443 a staré harfy.
 for(const id of localItems())if(catalogue[id])owned.add(id);
 // Starší hra mohla klíč harfy tvořit i z e-mailu místo UUID.
 const extraLegacy=(()=>{try{const st=JSON.parse(localStorage.getItem('bradavice_student_v1')||'{}');return [st?.supabaseUserId,st?.email,me?.email]}catch{return [me?.email]}})();
 const legacyKeys=[legacyKey(),...extraLegacy.filter(Boolean).map(x=>`bradavice_inventory_harp_v4363_${String(x).replace(/[^a-zA-Z0-9@._-]/g,'_')}`)];
 if(legacyKeys.some(k=>localStorage.getItem(k)==='owned'))owned.add('harp');
 const {data:rows,error:invErr}=await DB.client.from('student_inventory').select('item_id').eq('student_id',me.id);
 dbWorking=!invErr;
 if(dbWorking){for(const row of rows||[])if(catalogue[row.item_id])owned.add(row.item_id)}
 serverAvailable=dbWorking && await checkRpc();
 if(serverAvailable){
 // Import starého inventáře je omezen novým serverovým limitem, nemění existující položky.
 for(const id of [...owned]){if((rows||[]).some(r=>r.item_id===id))continue;
   const {data:status,error:e}=await DB.client.rpc('v445_collect_item',{p_item_id:id});if(e||status==='full')break;
 }
 await reloadFromServer();
 }
 persist();createPanel();repaint();
 }catch(e){console.warn('Kouzelný batoh:',e)}finally{readyDone=true;resolveReady()}}
window.BradaviceInventory={ready,has,collect,discard,items,capacity:MAX,open:openBag,canCollect:()=>owned.size<MAX,reload:reloadFromServer,catalogue};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();