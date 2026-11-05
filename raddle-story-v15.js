/* Tajemná komnata v15 – navazující děj na jednom studentském účtu.
 * 0: před Uršulou, 1: deník na podlaze, 2: deník v batohu,
 * 3: viděná vzpomínka, 4: Hagridova stopa, 5: Aragogova výpověď,
 * 6: Uršulino svědectví; poté lze otevřít umyvadlo.
 * Quest je uložen ke studentskému účtu v Supabase i v lokální záloze.
 */
(()=>{
  'use strict';
  const student=(()=>{try{return JSON.parse(localStorage.getItem('bradavice_student_v1')||'{}')}catch{return {}}})();
  const userId=String(student.supabaseUserId||student.email||'guest').replace(/[^a-zA-Z0-9@._-]/g,'_');
  const key='bradavice_raddle_story_v15_'+userId;
  const page=decodeURIComponent(location.pathname.split('/').pop());
  const db=window.BradaviceDB?.client;
  const phase=()=>Math.max(0,Math.min(6,Number(localStorage.getItem(key)||0)));
  const setPhase=(n)=>{if(n>phase()){
    localStorage.setItem(key,String(n));window.dispatchEvent(new Event('bradavice:raddle-progress'));
    db?.rpc('v16_advance_raddle_phase',{p_phase:n}).then(({error})=>{if(error)console.warn('Raddle: serverový postup',error)});
  }};
  async function synchronizePhase(){
    if(!db)return;
    try{
      const {data:userData,error:userError}=await db.auth.getUser();
      if(userError||!userData?.user)return;
      const {data,error}=await db.from('student_raddle_progress').select('phase').eq('student_id',userData.user.id).maybeSingle();
      if(error)throw error;
      const saved=Number(data?.phase||0);
      if(saved>phase()){
        localStorage.setItem(key,String(saved));
        window.dispatchEvent(new Event('bradavice:raddle-progress'));
        refreshWash();await synchronizeDiary();
      }else if(phase()>saved){
        const result=await db.rpc('v16_advance_raddle_phase',{p_phase:phase()});
        if(result.error)console.warn('Raddle: synchronizace postupu',result.error);
      }
    }catch(e){console.warn('Raddle: načtení postupu ze Supabase',e)}
  }

  function modal(title,body,choices){
    document.getElementById('raddleQuestModal')?.remove();
    const mask=document.createElement('div');mask.id='raddleQuestModal';mask.className='raddle-quest-shade';mask.setAttribute('role','dialog');mask.setAttribute('aria-modal','true');mask.setAttribute('aria-label',title);
    const card=document.createElement('section');card.className='raddle-quest-card';
    const heading=document.createElement('h2');heading.textContent=title;
    const paragraph=document.createElement('p');paragraph.textContent=body;
    const actions=document.createElement('div');actions.className='raddle-quest-actions';
    for(const [label,action] of choices){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>{mask.remove();action?.();});actions.append(b)}
    card.append(heading,paragraph,actions);mask.append(card);document.body.append(mask);actions.firstElementChild?.focus();
    mask.addEventListener('keydown',e=>{if(e.key==='Escape' && choices.some(([label])=>/Zavřít|Později|Vrátit/.test(label))) mask.remove()});
    return mask;
  }

  async function inventoryReady(){
    for(let tries=0;tries<35;tries++){
      const inventory=window.BradaviceInventory;
      if(inventory){await inventory.ready;return inventory}
      await new Promise(resolve=>setTimeout(resolve,150));
    }
    return null;
  }

  async function synchronizeDiary(){
    const inventory=await inventoryReady();if(!inventory)return;
    if(phase()===2&&!inventory.has('raddle-denik'))await inventory.collect('raddle-denik');
    if(phase()!==2&&inventory.has('raddle-denik'))await inventory.discard('raddle-denik');
  }

  async function collectDiary(){
    setPhase(2);refreshWash();
    await synchronizeDiary();
    modal('Starý deník','Na omšelém obalu je vyryté jméno T. R. Raddle. Deník se uložil do kouzelného batohu. Otevři batoh a vyber „Prozkoumat“.',[['Rozumím']]);
  }

  function exploreDiary(){
    if(phase()!==2)return;
    window.BradaviceInventory?.close?.();
    const mask=document.createElement('div');mask.id='raddleMemoryOverlay';mask.className='raddle-memory-shade';mask.setAttribute('role','dialog');mask.setAttribute('aria-modal','true');
    const card=document.createElement('section');card.className='raddle-memory-card';
    const heading=document.createElement('h2');heading.textContent='Tom Raddle';
    const lead=document.createElement('p');lead.textContent='„Ahoj, já jsem Tom Raddle a ukážu ti tajemství, pořádně se dívej.“';
    const video=document.createElement('video');video.src='video/tom-raddle-vzpominka-v15.mp4';video.poster='img/chamber-diary-transparent-v4367.webp';video.playsInline=true;video.controls=true;video.preload='metadata';
    const caption=document.createElement('p');caption.className='raddle-memory-hint';caption.textContent='Vzpomínka z roku 1943. Dokoukej ji do konce, aby se odemkla další stopa.';
    const close=document.createElement('button');close.type='button';close.textContent='Zavřít a vrátit se k deníku';close.addEventListener('click',()=>{video.pause();mask.remove()});
    video.addEventListener('ended',async()=>{
      setPhase(3);
      await synchronizeDiary();
      mask.remove();
      modal('Vzpomínka skončila','Tom Raddle obvinil Hagrida. Deník se rozplynul a zmizel z batohu. Ale co když vzpomínka neříká celou pravdu? Zajdi se zeptat Hagrida.',[['Půjdu za Hagridem']]);
    },{once:true});
    card.append(heading,lead,video,caption,close);mask.append(card);document.body.append(mask);
    video.play().catch(()=>{caption.textContent='Klikni na přehrávání videa. Po skončení vzpomínky se deník odebere z batohu.'});
  }

  function refreshWash(){
    const book=document.getElementById('raddleWashDiary');if(book)book.hidden=phase()!==1;
    const progress=document.getElementById('raddleWashHint');if(!progress)return;
    progress.textContent=phase()===1?'Mezi umyvadly leží kniha, která sem před chvílí dopadla.':phase()===2?'Záhadný deník je v kouzelném batohu.':phase()===3?'Vzpomínka vyvolává pochybnosti.':phase()===4?'V lese se ukrývá neznámé svědectví.':phase()===5?'Aragogovo svědectví je překvapivé.':phase()>=6?'Něco tu zůstalo skryté.':'';
  }

  function onWashroom(){
    const ursula=document.getElementById('v451Myrtle');
    const book=document.getElementById('raddleWashDiary');
    book?.addEventListener('click',()=>{if(phase()===1)collectDiary()});
    ursula?.addEventListener('click',e=>{
      if(phase()===0){e.preventDefault();e.stopImmediatePropagation();setPhase(1);refreshWash();
        book?.classList.add('diary-arriving');
        modal('Ufňukaná Uršula','„Au! Někdo po mně hodil nějakou starou knihu! To už se tu vážně nemůžu ani v klidu vyplakat?“ Kniha dopadla mezi umyvadla. Otevři oči a podívej se po ní.',[['Podívat se po knize']]);}
      else if(phase()===5){e.preventDefault();e.stopImmediatePropagation();setPhase(6);refreshWash();
        modal('Uršulino svědectví','„Vzpomínám si! Někdo mluvil zvláštním syčivým hlasem… a pak jsem u jednoho umyvadla zahlédla obrovské žluté oči. Ten kohoutek měl na sobě malého hada!“, zašeptá Uršula.',[['Prozkoumat kohoutek']]);}
    },true);
    const tap=document.getElementById('snakeTap');
    tap?.addEventListener('click',e=>{
      if(phase()<6){e.preventDefault();e.stopImmediatePropagation();
        modal('Hadí znamení','Kohoutek je chladný a nehybný. Ještě neznáš celé tajemství.',[['Vrátit se']]);}
    },true);
    refreshWash();
  }

  function onHagrid(){
    document.getElementById('quest')?.addEventListener('click',e=>{
      if(phase()===3){e.preventDefault();e.stopImmediatePropagation();setPhase(4);
        modal('Rubeus Hagrid','„Já komnatu nikdy neotevřel! Raddle to na mě svedl. Aragog, můj starý přítel, ví, co se tehdy opravdu stalo. Bydlí hluboko v Zapovězeném lese. Najdi v houští úzký temný průchod. Ale dej si pozor!“',[["Najdu Aragoga"]]);}
      else if(phase()===4){e.preventDefault();e.stopImmediatePropagation();modal('Rubeus Hagrid','„Hledej v Zapovězeném lese. Tam, kde stromy zakrývají starou úzkou stezku. Aragog se skrývá mimo známé cesty.“',[["Díky, Hagride"]]);}
    },true);
  }

  function onForest(){
    const trail=document.getElementById('aragogHiddenTrail');if(!trail)return;
    const show=()=>{trail.hidden=phase()<4;trail.setAttribute('aria-label','Temná stezka v hustém houští')};
    show();window.addEventListener('bradavice:raddle-progress',show);
    trail.addEventListener('click',()=>{if(phase()>=4)location.href='aragogova-mytina.html'});
  }

  function onAragog(){
    if(phase()<4){location.replace('zapovezeny-les.html');return;}
    document.getElementById('aragogTalk')?.addEventListener('click',()=>{
      setPhase(5);
      modal('Aragog','„Jsem nevinný. Hagrid mě chránil a já té dívce neublížil. Ve tmě se tehdy probudilo něco jiného… něco, čeho jsem se bál i já.“',[["Odejít z mýtiny",()=>location.href='zapovezeny-les.html'],["Zůstat ještě chvíli"]]);
    });
  }

  window.RaddleQuest={phase,setPhase,exploreDiary,refreshWash};
  if(page==='divci-umyvarna.html')onWashroom();
  if(page==='hagriduv-dum.html')onHagrid();
  if(page==='zapovezeny-les.html')onForest();
  if(page==='aragogova-mytina.html')synchronizePhase().then(onAragog);
  if(page==='tajemna-cesta.html'||page==='tajemna-komnata.html')
    synchronizePhase().then(()=>{if(phase()<6)location.replace('divci-umyvarna.html')});
  else if(page!=='aragogova-mytina.html')synchronizePhase();
  if(['divci-umyvarna.html','hagriduv-dum.html','zapovezeny-les.html','tajemna-cesta.html','tajemna-komnata.html'].includes(page))synchronizeDiary().catch(console.warn);
})();
