/* Bradavice v452: další Nickova laskavost – samostatný úkol navazující na oslavu.
   Postup potvrzuje Supabase; v klientu nejsou udělovány žádné body. */
(()=>{'use strict';
 const page=location.pathname.split('/').pop().toLowerCase();
 if(!['knihovna.html','nickova-oslava.html','sin-slavy.html','tajna-mistnost.html'].includes(page))return;
 const client=window.BradaviceDB?.client;
 const isLibrary=page==='knihovna.html',isParty=page==='nickova-oslava.html',isHall=page==='sin-slavy.html',isSecret=page==='tajna-mistnost.html';
 let status='not-started',feastDone=false,ready=false,busy=false;
 let female=false;
 try{const student=JSON.parse(localStorage.getItem('bradavice_student_v1')||'{}');female=String(student.salutation||'').toLocaleLowerCase('cs-CZ').includes('sleč')}catch{}
 const dear=()=>female?'má milá přítelkyně':'můj milý příteli';
 const greeted=()=>female?'už jsi mi pomohla':'už jsi mi pomohl';
 const patted=()=>female?'snažila':'snažil';
 const denied=()=>female?'sama':'sám';
 function dialog(title,text,actions){
  document.querySelector('.v452-dialog-mask')?.remove();
  const overlay=document.createElement('div');overlay.className='v452-dialog-mask';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',title);
  const card=document.createElement('section');card.className='v452-dialog';const head=document.createElement('h2');head.textContent=title;const paragraph=document.createElement('p');paragraph.textContent=text;
  const row=document.createElement('div');row.className='v452-dialog-actions';
  for(const [label,fn] of actions){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>{overlay.remove();if(fn)fn()});row.append(b)}
  card.append(head,paragraph,row);overlay.append(card);document.body.append(overlay);row.querySelector('button')?.focus({preventScroll:true});overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove()});overlay.addEventListener('keydown',e=>{if(e.key==='Escape')overlay.remove()});
 }
 const say=(t,msg)=>dialog(t,msg,[['Rozumím',null]]);
 async function advance(action){if(!ready||busy)return;busy=true;try{const {data,error}=await client.rpc('v452_nick_favor_step',{p_action:action});if(error)throw error;status=data;display();if(action==='report')say('Skorobezhlavý Nick','„Busta v Síni slávy je jednou z nejstarších památek školy. Jen poklepej a uvidíš. A ode mne to nemáš!“')}catch(e){say('Školní evidence','Nepodařilo se uložit úkol. Zkus to později. ('+(e.message||'Neznámá chyba')+')')}finally{busy=false}}
 function libraryTalk(){
  if(!ready)return say('Nick','Tuto novou laskavost nejdřív musíme společně nastavit v Supabase.');
  if(status==='not-started')return dialog('Skorobezhlavý Nick',`„Zdravím tě, ${dear()}! ${female?'Už jednou jsi mi pomohla':'Už jednou jsi mi pomohl'} s mou slavností a já bych tě teď chtěl požádat o ještě jednu maličkou laskavost. Sir Patrick Delaney-Podmore a jeho Hon bezhlavých se dostaví na oslavu. Mohl${female?'a':''} by ses u něj za mě přimluvit? Zmínit, jaká je škoda, že mě opět nepřijali? Vždyť ten nepatrný kousek šlachy, který mi přidržuje hlavu, snad ani nestojí za řeč! Třeba mě konečně vezmou na svůj lov.“`,[['Pokusím se za vás přimluvit',()=>advance('start')],['Promluvíme si později',null]]);
  if(status==='asked')return dialog('Skorobezhlavý Nick','„Už se vracíš? Ach, doufám, že jsi zastihl sira Patricka. Podívej se po něm v síni oslavy. Můj osud visí doslova na jediné šlaše!“',[['Ještě ho vyhledám',null]]);
  if(status==='refused')return dialog('Skorobezhlavý Nick','„Tak co, '+dear()+'? Vyslyšel tě sir Patrick? Snad konečně uzná, že moje hlava je téměř bezhlavá!“',[['Bohužel, řekl, že pravidla jsou pravidla.',()=>dialog('Skorobezhlavý Nick',`„Ach. Takže mě zase nevezmou. To nám tedy nevyšlo, viď? Ale nevadí. Za to, že ses za mě ${patted()}, ti prozradím malé tajemství. V Síni slávy stojí busta starého kouzelníka. Poklepej na ni… a dál už uvidíš! Měj se! A ode mne to nemáš.“`,[['Poděkovat Nickovi',()=>advance('report')]])],['Ještě vám to nechci říkat',null]]);
  return dialog('Skorobezhlavý Nick','„Psst… Busta v Síni slávy. Klepnutí stačí. Ale samozřejmě jsme o ničem nemluvili!“',[['Rozumím',null]]);
 }
 function patrickTalk(){
  if(!ready)return say('Sir Patrick','Něco se pokazilo při načítání školní evidence.');
  if(status==='not-started')return say('Sir Patrick Delaney-Podmore','„Hon bezhlavých přijímá jen ducha, jehož hlava skutečně opustila tělo. Promiň, teď mě čekají hosté.“');
  if(status==='asked')return dialog('Sir Patrick Delaney-Podmore',`„Mluvíš za sira Nicholase? Ach ano, jeho nešťastná záležitost s nedokončeným oddělením hlavy. Je mi líto, ${female?'děvče':'hochu'}, ale pravidla jsou pravidla. Dokud se mu hlava drží, byť na jediné šlaše, nemůže se účastnit Honu bezhlavých.“`,[['To je škoda. Vyřídím mu to.',()=>advance('refuse')],['Nechám si to rozmyslet',null]]);
  return say('Sir Patrick Delaney-Podmore','„Má odpověď se nezměnila. Pravidla Honu bezhlavých jsou naprosto jasná.“');
 }
 function bustTalk(){if(!ready)return say('Stará busta','Busta mlčí. Školní evidence nového úkolu ještě není připravená.');if(status!=='revealed')return say('Stará busta kouzelníka','Bronzová tvář tiše hledí před sebe. Snad existuje způsob, jak ji probudit…');return dialog('Stará busta kouzelníka','Když třikrát poklepeš na podstavec, kámen slabě zaduní. Za bustou se odsunuje část zdi. Objevuje se úzký průchod.',[['Vstoupit do tajné místnosti',()=>{location.href='tajna-mistnost.html'}],['Zatím zůstat',null]])}
 function display(){
  const nick=document.getElementById('v452LibraryNick');if(nick)nick.hidden=!(feastDone&&ready&&status==='not-started');
  const patrick=document.getElementById('v452Patrick');if(patrick)patrick.hidden=!feastDone;
  const lock=document.getElementById('v452CryptLock');if(lock)lock.hidden=(ready&&status==='revealed');
 }
 async function init(){
  if(!client){display();return}
  try{
   const [{data:feast,error:feastErr},{data:progress,error:questErr}]=await Promise.all([
     client.rpc('v450_nick_status'),client.rpc('v452_nick_favor_status')]);
   if(feastErr)throw feastErr;feastDone=feast==='completed';
   if(!questErr){ready=true;status=progress||'not-started'}
  }catch(e){console.warn('Nick – pokračování:',e.message)}
  display();
  if(isLibrary&&feastDone&&ready&&status==='not-started'){
   try{if(!sessionStorage.getItem('v452_nick_greeted')){sessionStorage.setItem('v452_nick_greeted','1');setTimeout(()=>{if(!document.hidden)libraryTalk()},1400)}}catch{}
  }
 }
 if(isLibrary)document.getElementById('v452LibraryNick')?.addEventListener('click',libraryTalk);
 if(isParty)document.getElementById('nickGhost')?.addEventListener('click',e=>{if(ready && (status==='asked'||status==='refused'||status==='revealed')){e.stopImmediatePropagation();libraryTalk()}},true);
 if(isParty)document.getElementById('nickTalk')?.addEventListener('click',e=>{if(ready&&(status==='asked'||status==='refused'||status==='revealed')){e.stopImmediatePropagation();libraryTalk()}},true);
 if(isParty)document.getElementById('v452Patrick')?.addEventListener('click',patrickTalk);
 if(isHall)document.getElementById('v452Bust')?.addEventListener('click',bustTalk);
 init();
})();
