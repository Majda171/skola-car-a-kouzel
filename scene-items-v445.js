(()=>{
'use strict';
const scenes={"velka-sin.html":[{"id":"bertikovy-fazolky","img":"img/predmety/bertikovy-fazolky.webp","x":17,"y":70,"w":78,"opacity":0.84,"kind":"pickup"},{"id":"cokoladova-zabka","img":"img/predmety/cokoladova-zabka.webp","x":69,"y":75,"w":64,"opacity":0.82,"kind":"pickup"}],"knihovna.html":[{"id":"flute","img":"img/predmety/fletna.webp","x":76,"y":63,"w":50,"opacity":0.68,"kind":"pickup"},{"id":"obludne-obludarium","img":"img/predmety/obludne-obludarium.webp","x":17,"y":62,"w":73,"opacity":0.83,"kind":"pickup"},{"id":"sachova-kralovna","img":"img/predmety/sachova-kralovna.webp","x":82,"y":42,"w":35,"opacity":0.78,"kind":"pickup"}],"skleniky.html":[{"id":"mandragora","img":"img/predmety/mandragora.webp","x":82,"y":66,"w":81,"opacity":0.78,"kind":"pickup"}],"mrzimor-spolecenska.html":[{"id":"scarf","img":"img/predmety/sala-mrzimor.webp","x":75,"y":80,"w":95,"opacity":0.8,"kind":"pickup"}],"zmijozel-spolecenska.html":[{"id":"scarf","img":"img/predmety/sala-zmijozel.webp","x":77,"y":79,"w":95,"opacity":0.8,"kind":"pickup"}],"ucebna-lektvaru.html":[{"id":"lektvar-cerveny","img":"img/predmety/lektvar-cerveny.webp","x":79,"y":61,"w":47,"opacity":0.8,"kind":"pickup"}],"divci-umyvarna.html":[{"id":"lektvar-ruzovy","img":"img/predmety/lektvar-ruzovy.webp","x":77,"y":73,"w":49,"opacity":0.77,"kind":"pickup"}],"chodby-portretni-galerie.html":[{"id":"stary-pergamen","img":"img/predmety/stary-pergamen.webp","x":81,"y":76,"w":64,"opacity":0.77,"kind":"pickup"}],"zapovezeny-les.html":[{"id":"lucerna","img":"img/predmety/lucerna.webp","x":13,"y":74,"w":53,"opacity":0.89,"kind":"pickup"},{"id":"karkulinky","img":"img/predmety/karkulinky.webp","x":87,"y":48,"w":84,"opacity":0.75,"kind":"encounter","description":"Malí tvorové si šeptají a ve tmě rychle mizí.","title":"Karkulinky"}],"chodby-podzemni-1.html":[{"id":"hnojova-bomba","img":"img/predmety/hnojova-bomba.webp","x":76,"y":76,"w":58,"opacity":0.76,"kind":"pickup"}],"chodby-stara-galerie.html":[{"id":"kouzelna-hulka","img":"img/predmety/kouzelna-hulka.webp","x":78,"y":79,"w":82,"opacity":0.77,"kind":"pickup"}],"famfrpal.html":[{"id":"letecke-koste","img":"img/predmety/letecke-koste.webp","x":79,"y":74,"w":108,"opacity":0.81,"kind":"pickup"}],"komnata-nejvyssi-potreby-uvnitr.html":[{"id":"truhlicka-zdobena","img":"img/predmety/truhlicka-zdobena.webp","x":74,"y":72,"w":80,"opacity":0.82,"kind":"encounter","description":"Truhlička je zamčená. Možná se jednou podaří zjistit, co ukrývá.","title":"Truhlicka zdobena"}],"chodby-podzemni-2.html":[{"id":"truhla-drevena","img":"img/predmety/truhla-drevena.webp","x":75,"y":75,"w":110,"opacity":0.82,"kind":"encounter","description":"Těžká truhla se ani nehne. Zatím ji raději necháš na místě.","title":"Truhla drevena"}],"astronomicka-vez.html":[{"id":"astronomicka-sfera","img":"img/predmety/astronomicka-sfera.webp","x":77,"y":76,"w":78,"opacity":0.82,"kind":"encounter","description":"Starobylý astronomický přístroj ukazuje zvláštní polohu hvězd.","title":"Astronomicka sfera"}],"hagriduv-dum.html":[{"id":"hypogryf","img":"img/predmety/hypogryf.webp","x":88,"y":79,"w":76,"opacity":0.67,"kind":"encounter","description":"Hypogryf se na tebe hrdě dívá. Nejdřív se mu musíš správně uklonit.","title":"Hypogryf"}],"hagriduv-dum-uvnitr.html":[{"id":"tlustocervi","img":"img/predmety/tlustocervi.webp","x":17,"y":86,"w":68,"opacity":0.72,"kind":"encounter","description":"Hagrid má pro tyhle neobvyklé tvory slabost.","title":"Tlustočervi"}],"nadvori.html":[{"id":"sova-pustik","img":"img/predmety/sova-pustik.webp","x":64,"y":23,"w":65,"opacity":0.84,"kind":"encounter","description":"Puštík čeká na nový dopis.","title":"Sova puštík"}],"pozemky.html":[{"id":"sova-bila","img":"img/predmety/sova-bila.webp","x":82,"y":61,"w":40,"opacity":0.7,"kind":"encounter","description":"Bílá sova tiše pozoruje okolí.","title":"Sova bila"}]};
const page=decodeURIComponent(location.pathname.split('/').pop()||'');const placement=scenes[page];if(!placement)return;
const inv=window.BradaviceInventory;if(!inv)return;
const host=document.querySelector('main.place-scene,main.scene,main[class*="scene"],main');if(!host)return;
if(getComputedStyle(host).position==='static')host.style.position='relative';
const catalogue=inv.catalogue;
let dialog=null,lastFocus=null;
function close(){if(dialog){dialog.remove();dialog=null}lastFocus?.focus()}
function openDialog(item,button){lastFocus=button;close();lastFocus=button;
 const entry=catalogue[item.id];const collectible=item.kind==='pickup';
 dialog=document.createElement('div');dialog.className='scene-item-modal';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label',collectible?'Nalezený předmět':'Zajímavý nález');
 const card=document.createElement('section');card.className='scene-item-card';const exit=document.createElement('button');exit.type='button';exit.className='scene-item-close';exit.textContent='×';exit.setAttribute('aria-label','Zavřít');exit.addEventListener('click',close);
 const img=document.createElement('img');img.src=item.img;img.alt='';const heading=document.createElement('h2');heading.textContent=collectible?entry.label:item.title;
 const desc=document.createElement('p');desc.textContent=collectible?entry.description:item.description;
 const status=document.createElement('p');status.className='scene-item-status';status.setAttribute('aria-live','polite');
 const actions=document.createElement('div');actions.className='scene-item-actions';
 if(collectible){const take=document.createElement('button');take.type='button';take.textContent='Vzít do batohu';take.addEventListener('click',async()=>{
   take.disabled=true;const result=await inv.collect(item.id);if(result.ok){button.classList.add('scene-collected');close();setTimeout(()=>button.hidden=true,500)}else{
    status.textContent=result.message||'Předmět se nepodařilo sebrat.';take.disabled=false;
    if(result.full){const bag=document.createElement('button');bag.type='button';bag.textContent='Otevřít batoh';bag.addEventListener('click',()=>{close();inv.open()});actions.append(bag);}}
 });actions.append(take)}
 if(item.id==='sova-pustik'){
   const write=document.createElement('button');write.type='button';write.textContent='✉ Napsat dopis';
   write.addEventListener('click',()=>{close();if(window.BradaviceQuickChat?.open)window.BradaviceQuickChat.open('messages');else location.href='social.html?tab=messages'});
   const inbox=document.createElement('button');inbox.type='button';inbox.textContent='🦉 Příchozí pošta';
   inbox.addEventListener('click',()=>{close();if(window.BradaviceQuickChat?.open)window.BradaviceQuickChat.open('messages');else location.href='social.html?tab=messages'});
   actions.append(write,inbox);
 }
 const leave=document.createElement('button');leave.type='button';leave.textContent=collectible?'Nechat být':'Zavřít';leave.addEventListener('click',close);actions.append(leave);
 card.append(exit,img,heading,desc,status,actions);dialog.append(card);document.body.append(dialog);exit.focus();dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
}
for(const spot of placement){const button=document.createElement('button');button.type='button';button.className='scene-item';button.title=spot.kind==='pickup'?`Prozkoumat: ${catalogue[spot.id]?.label}`:'Prozkoumat zajímavost';button.setAttribute('aria-label',button.title);
 button.style.left=`${spot.x}%`;button.style.top=`${spot.y}%`;button.style.width=`clamp(27px, ${spot.w/12}vw, ${spot.w}px)`;button.style.setProperty('--scene-opacity',spot.opacity);button.dataset.itemId=spot.id;
 const img=document.createElement('img');img.src=spot.img;img.alt='';img.loading='lazy';button.append(img);button.hidden=true;host.append(button);
 button.addEventListener('click',e=>{e.stopPropagation();openDialog(spot,button)});
 function update(){button.hidden=spot.kind==='pickup'&&inv.has(spot.id)};
 inv.ready.then(update);window.addEventListener('bradavice:inventory-updated',update);
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dialog)close()});
})();