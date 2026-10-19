/* v457: Druhý úkol s Protivou. Samostatný příběh, nezasahuje do kolejních vstupů. */
(()=>{'use strict';
 const page=decodeURIComponent(location.pathname.split('/').pop()||'');
 if(!['chodby.html','chodby-podzemni-2.html'].includes(page))return;
 const host=document.querySelector('main');if(!host)return;
 if(getComputedStyle(host).position==='static')host.style.position='relative';
 const DB=window.BradaviceDB?.client;
 let storageKey='bradavice_protiva_baron_v457_guest';
 let state='new';
 function read(){try{return localStorage.getItem(storageKey)||'new'}catch{return 'new'}}
 function save(next){state=next;try{localStorage.setItem(storageKey,next)}catch{}}
 function dialogue(title,body,buttons){
   document.querySelector('.v457-quest-dialog')?.remove();
   const overlay=document.createElement('div');overlay.className='v457-quest-dialog';
   overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
   const panel=document.createElement('section'),h=document.createElement('h2'),p=document.createElement('p'),actions=document.createElement('div');
   h.textContent=title;p.textContent=body;panel.append(h,p,actions);overlay.append(panel);document.body.append(overlay);
   for(const [label,callback] of buttons){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>{overlay.remove();callback?.()});actions.append(b)}
   actions.querySelector('button')?.focus();
 }
 function encounter(){
   save('filch');
   window.BradaviceDungBombs?.blast({actor:'protiva',message:'💥 Protiva právě odpálil bomby hnojůvky!'});
   dialogue('Protivovy nekalosti','Z konce chodby se ozvalo ohlušující PRÁSK! Protiva se chechtá pod stropem a zelený oblak pohlcuje podlahu. „Filchík zuří, Filchík křičí, Protiva mu chodbu ničí!“',[
    ['Co se děje?',()=>dialogue('Argus Filch','„Ten zatracený poltergeist! Všude ten příšerný zápach! Jestli ho ještě jednou nachytám…“ Filch málem klopýtne přes rozházené bomby hnojůvky.',[['Promluvit s profesorkou',mcgonagall]])]
   ]);
 }
 function mcgonagall(){
  dialogue('Profesorka McGonagallová','„PROTIVO! Okamžitě toho nechte!“ Protiva jí vyplázne jazyk a zmizí za rohem. Profesorka se obrátí k tobě: „Tohohle ničemu umí zkrotit jedině Krvavý baron. Prosím, najdi ho ve sklepení a vyřiď mu, že jej žádám, aby Protivu opět usměrnil.“',[
   ['Vyrazit do sklepení',()=>{save('seek-baron');location.href='chodby-podzemni-2.html'}]
  ]);
 }
 function baron(){
  dialogue('Krvavý baron','„Co ode mne žádáš, studente?“ Vyřídíš mu prosbu profesorky McGonagallové. Duch Zmijozelu přísně přikývne: „Zase Protiva. Zdá se, že zapomněl na náš poslední rozhovor. Velmi dobře. Postarám se o něj.“',[
   ['Poděkovat a vrátit se do chodby',()=>{save('return');location.href='chodby.html'}]
  ]);
 }
 function complete(){
  dialogue('Protivův strach','Krvavý baron zastoupí Protivovi cestu. „Vznešený barone! Vždyť to byla jen nevinná legrace!“ Baron klidně řekne: „Protivo.“ „Ano, pane! Už letím, pane! Hodný Protiva!“ Poltergeist s kvílením zmizí skrz strop.',[
   ['Promluvit s McGonagallovou',()=>dialogue('Profesorka McGonagallová','„Výborně. Na hradě snad alespoň na nějaký čas zavládne klid. Děkuji za pomoc.“ Úkol Protivovy nekalosti je dokončen. Bodovou odměnu je nutné propojit se školní evidencí; žádné body se teď nepřipisují jen v prohlížeči.',[['Dokončit úkol',()=>save('done')]])]
  ]);
 }
 async function init(){
   if(DB){try{const {data}=await DB.auth.getUser();if(data?.user?.id)storageKey='bradavice_protiva_baron_v457_'+data.user.id}catch{}}
   state=read();
   if(page==='chodby.html'){
     if(state==='new'&&Math.random()>=.35)return;
     if(!['new','filch','return'].includes(state))return;
     const trigger=document.createElement('button');trigger.type='button';trigger.className='v457-quest-trigger';
     trigger.textContent=state==='return'?'Za McGonagallovou · dokončit úkol':state==='filch'?'McGonagallová čeká na vysvětlení':'Hluk na chodbě · zjistit, co se stalo';
     trigger.addEventListener('click',()=>{trigger.remove();if(state==='return')complete();else if(state==='filch')mcgonagall();else encounter()});host.append(trigger);
   }
   if(page==='chodby-podzemni-2.html'&&state==='seek-baron'){
     const trigger=document.createElement('button');trigger.type='button';trigger.className='v457-baron';trigger.title='Krvavý baron';
     const img=document.createElement('img');img.src='img/ghost-krvavy-baron.webp';img.alt='';
     const label=document.createElement('span');label.textContent='Oslovit Krvavého barona';trigger.append(img,label);
     trigger.addEventListener('click',baron);host.append(trigger);
   }
 }
 init().catch(e=>console.warn('Protivův druhý úkol:',e));
})();
