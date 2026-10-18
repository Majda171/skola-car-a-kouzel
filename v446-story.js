/* v446: Slozeni tri utrzku Freda a George. Dulezita rozhodnuti overuje Supabase. */
(()=>{'use strict';
 const page=decodeURIComponent(location.pathname.split('/').pop()||'');
 const fragments={'knihovna.html':{id:'knihovna',x:38,y:83},'velka-sin.html':{id:'velka-sin',x:43,y:85},'chodby-horni.html':{id:'treti-poschodi',x:85,y:69}};
 const storage='bradavice_fred_george_v446_';
 let userId='guest',parts=new Set(),done=false;
 const DB=window.BradaviceDB?.client;
 const popup=(title,message,buttons)=>{
  const isLetter=title==='Tajný dopis Freda a George';
  const wrap=document.createElement('div');wrap.className='v446-note-overlay';wrap.setAttribute('role','dialog');wrap.setAttribute('aria-modal','true');
  wrap.setAttribute('aria-label',title);
  const pane=document.createElement('section');pane.className='v446-note';if(isLetter)pane.classList.add('v446-note-letter');
  const h=document.createElement('h2');h.textContent=isLetter?'Tajný dopis':title;
  const p=document.createElement('p');p.textContent=message;
  if(isLetter){p.className='v446-letter-text';const sign=document.createElement('p');sign.className='v446-letter-signature';sign.textContent='Fred a George W.';pane.append(h,p,sign)}
  else pane.append(h,p);
  const controls=document.createElement('div');controls.className='v446-note-actions';
  const close=()=>wrap.remove();
  for(const [label,action] of buttons){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=()=>{close();action?.()};controls.append(b)}
  pane.append(controls);wrap.append(pane);document.body.append(wrap);
  wrap.addEventListener('click',e=>{if(e.target===wrap&&!isLetter)close()});
  const first=controls.querySelector('button');first?.focus({preventScroll:true});pane.scrollTop=0;
 };
 const localKey=()=>storage+userId;
 function save(){try{localStorage.setItem(localKey(),JSON.stringify({parts:[...parts],done}))}catch{}}
 function clock(){const pieces=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Prague',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).filter(x=>x.type==='hour'||x.type==='minute').map(x=>[x.type,Number(x.value)]));return pieces.hour*60+pieces.minute}
 const timeForVisit=()=>clock()>=16*60+15?'zítra od 16:00 do 16:15':'dnes od 16:00 do 16:15';
 const message=()=>`Milý spolupachateli,

posbíral jsi všechny tři útržky. Výtečně! Teď ta zábavnější část.

Umbridgeová opustí kabinet ${timeForVisit()}. Její milovaná koťátka si mezitím zaslouží změnu ovzduší. Pořádnou!

Vezmi bomby hnojůvky, vplíž se dovnitř a schovej je pod její stůl. Hlavně se nenech načapat.

My jsme tam nebyli. Ty samozřejmě také ne.`;
 function readLetter(){popup('Tajný dopis Freda a George',message(),[['Rozumím!',null]])}
 async function preserveLetter(){
   if(parts.size!==3)return;
   try{if(DB){const {error}=await DB.rpc('v449_store_letter');if(error && error.code!=='PGRST202')console.warn('Uložení dopisu na server:',error.message)}}catch(e){console.warn('Dopis se zatím uchovává pouze v prohlížeči.',e)}
   window.dispatchEvent(new Event('bradavice:letter-found'));
 }
 async function collectPart(id,button){if(parts.has(id))return;popup('Roztržený pergamen','Mezi předměty leží útržek pergamenu s podivnými poznámkami. Vezmeš si ho?',[['Vzít útržek',async()=>{
   if(DB){const {error}=await DB.rpc('v446_find_fragment',{p_part:id});if(error)console.info('Připravujeme ukládání pergamenu do Supabase; prozatím se uloží lokálně.')}
   parts.add(id);save();button.hidden=true;
   if(parts.size===3){await preserveLetter();readLetter()}else popup('Útržek uložen',`Nalezené části: ${parts.size} / 3. Pergamen nezabírá místo v osmimístném batohu.`,[['Pokračovat',null]])
 }],['Nechat být',null]])}
 async function start(){
  if(DB){const {data}=await DB.auth.getUser();if(data?.user?.id)userId=data.user.id}
  try{const old=JSON.parse(localStorage.getItem(localKey())||'{}');parts=new Set(old.parts||[]);done=!!old.done}catch{}
  if(DB){const {data,error}=await DB.from('v446_story_progress').select('parts,sabotage_at').maybeSingle();if(!error){if(data){for(const id of data.parts||[])parts.add(id);done=!!data.sabotage_at}for(const id of [...parts])await DB.rpc('v446_find_fragment',{p_part:id});save()}}
  if(parts.size===3)await preserveLetter();
  const spec=fragments[page];if(!spec)return;
  const host=document.querySelector('main.place-scene, main.corridor-stage, main');if(!host)return;
  if(getComputedStyle(host).position==='static')host.style.position='relative';
  const b=document.createElement('button');b.type='button';b.className='v446-paper-fragment';b.title='Podivný útržek papíru';b.setAttribute('aria-label','Prozkoumat útržek pergamenu');b.style.left=spec.x+'%';b.style.top=spec.y+'%';const img=document.createElement('img');img.src='img/predmety/stary-pergamen.webp';img.alt='';b.append(img);host.append(b);b.hidden=parts.has(spec.id);b.addEventListener('click',e=>{e.stopPropagation();collectPart(spec.id,b)});
 }
 window.BradaviceStory446={get parts(){return parts},get done(){return done},markDone(){done=true;save()},showLetter:readLetter,clock,get hasLetter(){return parts.size===3},get userId(){return userId}};
 start().catch(console.warn);
})();
