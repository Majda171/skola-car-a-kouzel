/* v447: Umbridgeová. Server potvrzuje přesný odečet 50 bodů, nikdy pouze klient. */
(()=>{'use strict';
 const stage=document.getElementById('umbridgeOffice');if(!stage)return;
 const DB=window.BradaviceDB?.client, character=document.getElementById('umbridgeCharacter'),talk=document.getElementById('umbridgeTalk');
 const UI=window.BradaviceUmbridgeDialog;
 const key='bradavice_umbridge_visit_v446';let userId='guest';
 function notice(message){const bar=document.createElement('p');bar.className='v446-office-notice';bar.textContent=message;stage.append(bar);setTimeout(()=>bar.remove(),8500)}
 const pop=(title,body)=>{const ov=document.createElement('div');ov.className='v446-note-overlay';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');const pane=document.createElement('section');pane.className='v446-note';const h=document.createElement('h2');h.textContent=title;const p=document.createElement('p');p.textContent=body;const actions=document.createElement('div');actions.className='v446-note-actions';pane.append(h,p,actions);ov.append(pane);document.body.append(ov);return {ov,actions,p,close:()=>ov.remove(),btn(label,callback){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=callback;actions.append(b);return b}}};
 function counter(name){try{return Number(localStorage.getItem(`${key}_${userId}_${name}`)||0)}catch{return 0}}
 function setCounter(name,n){try{localStorage.setItem(`${key}_${userId}_${name}`,String(n))}catch{}}
 const types=['opisovani','razitka','kotatka','dekrety'];
 function punishment(type){
  const title={opisovani:'Opisování školního řádu',razitka:'Ministerské formuláře',kotatka:'Leštění porcelánových koťátek',dekrety:'Řazení vzdělávacích dekretů'}[type];
  const q=pop(title,'„Ehm, ehm. Jak je milé, že se můžeš věnovat něčemu užitečnému. Třeba tě to odnaučí neposlušnosti, drahoušku.“');let count=0;
  const progress=document.createElement('strong');progress.className='v446-progress';progress.textContent='0 / 6';q.p.after(progress);
  function finish(){q.p.textContent='„Vidíš, že to jde. A teď ta nejdůležitější část: přece mi poděkuješ, že jsem ti věnovala tolik svého drahocenného času.“';q.actions.replaceChildren();q.btn('Děkuji vám, paní profesorko.',q.close)}
  function advance(){count++;progress.textContent=`${count} / 6`;if(count>=6)finish()}
  if(type==='opisovani'){
   const phrase='Budu bez odmlouvání dodržovat všechna školní nařízení.';q.p.textContent=`Opiš šestkrát přesně tuto větu: ${phrase}`;const field=document.createElement('input');field.placeholder='Opiš větu přesně';field.className='v446-write';q.actions.before(field);
   q.btn('Odevzdat řádek',()=>{if(field.value.trim()!==phrase){q.p.textContent='„Ehm, ehm! Copak jsem řekla, že smíš improvizovat? Začni znovu.“ '+phrase;return}field.value='';advance()});
  }else if(type==='razitka'){
   const words=['Povolení k chůzi','Povolení ke smíchu','Povolení k otázce','Povolení k návštěvě knihovny','Povolení k přestávce','Povolení k dýchání'];
   const go=()=>{q.p.textContent=`Formulář ${count+1}: ${words[count]}. Orazítkuj jej!`;q.actions.replaceChildren();q.btn('SCHVÁLENO',()=>{advance();if(count<6)go()})};go();
  }else if(type==='kotatka'){q.p.textContent='„Opatrně vylešti všech šest mých drahých koťátek. Ani škrábanec! A žádné řeči.“';q.btn('Vyleštit talířek 🐱',advance)}
  else {q.p.textContent='„Seřaď šest vzdělávacích dekretů. Je to práce mnohem užitečnější než nějaké bezhlavé kouzlení.“';q.btn('Připnout další dekret',advance)}
 }
 async function syncPoints(){
  try{await Promise.all([window.BradaviceDB?.hydrateStudent?.(),window.BradaviceDB?.hydrateProgress?.(),window.BradaviceDB?.syncHouseStandingsLocal?.()]);window.dispatchEvent(new CustomEvent('bradavice:progress-synced'))}catch(e){console.warn('Aktualizace bodů:',e)}
 }
 async function escorted(){
  let code=null,old=false;try{code=sessionStorage.getItem('bradavice_filch_incident_v446');old=sessionStorage.getItem('bradavice_filch_escorted_v442')==='1'}catch{}
  if(!code&&!old)return;
  if(!code){notice('Filchovo zadržení zatím není potvrzené školní evidencí. Body zůstaly beze změny.');try{sessionStorage.removeItem('bradavice_filch_escorted_v442')}catch{};return;}
  const incident=code;
  if(stage.classList.contains('v446-empty')){notice('Filch tě dovedl před prázdný kabinet. Profesorka je pryč.');return}
  const visits=counter('visits')+1;setCounter('visits',visits);
  const intro=visits===1
   ? '„Ehm… ehm. Pan Filch tvrdí, že ses potuloval/a po třetím poschodí. Drahé dítě, je mi tak líto, že stále nechápeš význam pravidel. Ministerstvo přece nezakazuje věci jen tak pro nic za nic.“'
   : '„Ale, ale. Zase ty? Máš snad slabost pro můj kabinet, drahoušku? Očividně si ještě budeme muset něco vysvětlit. Velmi důkladně.“';
  let result='pending',working=true;
  UI?.render(intro,[["Chtěl/a jsem se jen rozhlédnout.",()=>reply(false)],["Omlouvám se, paní profesorko.",()=>reply(true)]], 'Probíhá ověření kázeňského trestu…');
  async function reply(apologize){
   const answer=apologize
    ? '„Ach, omluva! Jak rozkošné. Bohužel, drahoušku, pravidla zůstávají pravidly, i když se omluvíš tím nejlíbeznějším hláskem.“'
    : '„Rozhlédnout? Ehm, ehm! Zvědavost není v osnovách, pokud ji ministerstvo výslovně neschválí. Tvé nápady by zasloužily trochu usměrnění.“';
   const note=result==='deducted'?'Tvé koleji bylo odečteno 50 bodů.':result==='already'?'Trest za toto zadržení už byl zaúčtován.':result==='pending'?'Čeká se na potvrzení z databáze.':'Bodový trest se zatím nepodařilo zaúčtovat.';
   const next=()=>{
    const severe=Math.random()<.3;
    UI?.render(severe?'„A nyní trocha užitečné práce, drahoušku. Za domácí úkol to nepovažuj. To je milé drobné kázeňské opatření.“':'„A teď mi zmiz z očí. Nebo si snad přeješ, abychom v debatě pokračovali s panem Filchem?“',[[severe?'Přijmout školní trest':'Děkuji, paní profesorko.',()=>{UI?.close();if(severe)punishment(types[Math.floor(Math.random()*types.length)])}]], note);
   };
   UI?.render(answer+' „Tvoje kolej si musí vzít ponaučení.“',[["Rozumím, paní profesorko.",next]],note);
  }
  if(!DB){result='failed';UI?.status&&(UI.status.textContent='Databáze není připojená. Body se neodečetly.');return}
  try{
   const response=await DB.rpc('v446_filch_penalty',{p_incident:incident});
   if(response.error){throw response.error}
   result=response.data;
   if(result==='deducted'||result==='already'){
    try{sessionStorage.removeItem('bradavice_filch_incident_v446');sessionStorage.removeItem('bradavice_filch_escorted_v442')}catch{}
    await syncPoints();
    if(result==='deducted')notice('Umbridgeová ti právě odečetla 50 kolejních bodů.');
   }else{notice('Kázeňský trest se neodečetl: '+(result==='recent'?'jiný trest byl zaznamenán nedávno.':'databáze jej nepotvrdila.'))}
  }catch(e){result='failed';console.warn('Umbridge: trest od Filche:',e);notice('Odečet 50 bodů zatím není nastavený v Supabase; body se neodečetly.');}
  finally{
   working=false;
   if(UI?.status&&!document.getElementById('umbridgeDialog')?.hidden)UI.status.textContent=result==='deducted'?'Záznam v Supabase potvrzen: −50 bodů.':result==='already'?'Trest za toto zadržení již byl zaúčtován.':result==='recent'?'Opakovaný trest byl z bezpečnostních důvodů pozastaven.':'50 bodů zatím odečteno nebylo.';
  }
 }
 async function sabotage(){
  const story=window.BradaviceStory446;
  if(!story||story.parts.size!==3){notice('Nejdříve najdi všechny tři části pergamenu.');return}
  if(story.done){notice('Tuhle lumpárnu už máš za sebou.');return}
  if(!window.BradaviceInventory?.has('hnojova-bomba')){notice('K sabotáži potřebuješ mít v batohu bomby hnojůvky.');return}
  const q=pop('Operace Růžová katastrofa','Kabinet je prázdný. Schováš bomby hnojůvky pod pracovní stůl?');
  q.btn('Raději odejít',q.close);
  const activate=q.btn('Schovat bomby hnojůvky',async()=>{
   activate.disabled=true;
   if(!DB){q.p.textContent='Úkol čeká na dokončení databázového nastavení.';activate.disabled=false;return}
   const {data,error}=await DB.rpc('v446_sabotage');
   if(error||data!=='success'){q.p.textContent=error?.message||'Úkol zatím nelze dokončit. Zkontroluj aktivní časové okno, pergamen a nastavení Supabase.';activate.disabled=false;return}
   stage.classList.add('v446-stinky');story.markDone();await window.BradaviceInventory?.reload?.();
   q.p.textContent='Pod stolem se začíná šířit nevídaný zápach. Fred a George by na tebe byli pyšní. Teď rychle pryč!';q.actions.replaceChildren();q.btn('Utéct z kabinetu',()=>{q.close();location.href='chodby-horni.html'});
  });
 }
 async function init(){
  if(DB){const {data}=await DB.auth.getUser();userId=data?.user?.id||'guest'}
  const now=window.BradaviceStory446?.clock?.()??-1,away=now>=960&&now<975;
  if(away){stage.classList.add('v446-empty');if(character)character.hidden=true;
   if(talk){talk.textContent='Prozkoumat prázdný kabinet';talk.addEventListener('click',e=>{e.stopImmediatePropagation();sabotage()},true)}
   const copy=stage.querySelector('.umbridge-copy p');if(copy)copy.textContent='Kabinet je prázdný. Na stole leží opuštěná šálka čaje… Ideální chvíle pro malé pozdvižení.';
   const bomb=document.createElement('button');bomb.type='button';bomb.className='v446-bomb-place';bomb.textContent='Prohlédnout prostor pod stolem';bomb.onclick=sabotage;stage.append(bomb)
  }
  await escorted();
 }
 init().catch(e=>console.warn('Umbridge v447:',e));
})();
