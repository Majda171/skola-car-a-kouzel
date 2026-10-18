(()=>{
  const room=document.getElementById('fluffyRoom'),dog=document.getElementById('fluffyDog'),useHarp=document.getElementById('fluffyHarp'),useFlute=document.getElementById('fluffyFlute'),next=document.getElementById('trapdoorNext'),msg=document.getElementById('fluffyMessage'),audio=document.getElementById('fluffyHarpAudio'),timerEl=document.getElementById('fluffyDangerTimer');
  if(!room||!dog||!useHarp||!next||!audio)return;
  const readStudent=()=>{try{return JSON.parse(localStorage.getItem('bradavice_student_v1')||'null')}catch{return null}};
  const sid=String(readStudent()?.supabaseUserId||readStudent()?.email||'guest').replace(/[^a-zA-Z0-9@._-]/g,'_');
  const STATE=`bradavice_philosopher_fluffy_v436_${sid}`,HARP=`bradavice_inventory_harp_v4363_${sid}`,SEEN=`bradavice_fluffy_seen_v4363_${sid}`;
  localStorage.setItem(SEEN,'seen');
  let passed=false,sleepTick=null,entryTick=null,redirectTimer=null,escaping=false;
  const ownsHarp=()=>Boolean(window.BradaviceInventory?.has('harp'));
  const ownsFlute=()=>Boolean(window.BradaviceInventory?.has('flute'));
  function refreshInstruments(){useHarp.hidden=!ownsHarp();if(useFlute)useFlute.hidden=!ownsFlute()}

  const paintEntry=n=>{if(timerEl){timerEl.hidden=false;timerEl.textContent=`${n} s`;timerEl.classList.toggle('danger',n<=3)}};
  function clearEntry(){clearInterval(entryTick);entryTick=null;if(timerEl)timerEl.hidden=true}
  function wake(text='Chloupek je vzhůru a znovu hlídá padací dveře.'){
    clearInterval(sleepTick);sleepTick=null;dog.src='img/philosopher-fluffy-awake.webp';dog.classList.remove('sleeping');next.classList.remove('visible');useHarp.disabled=false;useHarp.classList.remove('playing');if(useFlute){useFlute.disabled=false;useFlute.classList.remove('playing')}localStorage.setItem(STATE,'awake');if(msg)msg.textContent=text;
  }
  function escapeToHagrid(reason='Chloupek se vrhl vpřed. Musíš pryč!'){
    if(passed||escaping)return;escaping=true;clearEntry();wake(reason);
    redirectTimer=setTimeout(()=>{location.href='hagriduv-dum.html?chloupek=utekl'},850);
  }
  function startEntryDanger(){
    clearEntry();let left=8;paintEntry(left);
    if(msg)msg.textContent=(ownsHarp()||ownsFlute())?'Chloupek tě zpozoroval. Rychle zahraj na svůj hudební nástroj!':'Chloupek tě zpozoroval. Tady není nic, čím bys ho dokázal/a uklidnit.';
    entryTick=setInterval(()=>{left--;paintEntry(Math.max(0,left));if(left<=0)escapeToHagrid('Chloupek přestal čekat a vyrazil po tobě!')},1000);
  }
  function sleep(){
    clearEntry();escaping=false;dog.src='img/philosopher-fluffy-sleep.webp';dog.classList.add('sleeping');next.classList.add('visible');localStorage.setItem(STATE,'sleeping');useHarp.disabled=true;useHarp.classList.add('playing');if(useFlute){useFlute.disabled=true;useFlute.classList.add('playing')}
    const total=Math.max(1,Math.ceil(Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:16));let left=total;
    if(timerEl){timerEl.hidden=false;timerEl.classList.remove('danger');timerEl.textContent=`${left} s`}
    if(msg)msg.textContent=`Chloupek usnul. Dokud hraje hudba, můžeš projít padacími dveřmi.`;
    clearInterval(sleepTick);sleepTick=setInterval(()=>{left--;if(timerEl)timerEl.textContent=`${Math.max(0,left)} s`;if(left>0&&!passed&&msg)msg.textContent=`Chloupek spí. Hudba dohraje za ${left} s.`},1000);
  }
  refreshInstruments();
  const playInstrument=async (kind)=>{
    if(!(kind==='harp'?ownsHarp():ownsFlute())){refreshInstruments();return}
    clearEntry();passed=false;escaping=false;clearTimeout(redirectTimer);
    audio.pause();audio.src=kind==='flute'?'audio/chloupek-fletna-v443.ogg':'audio/chloupek-harfa-v4367.mp3';audio.load();
    try{await audio.play();sleep();window.BradaviceAchievements?.award?.('tajemstvi-hradu',{silent:true})}
    catch{if(msg)msg.textContent='Hudba se nepodařila spustit. Zkus to okamžitě znovu.';refreshInstruments();startEntryDanger()}
  };
  useHarp.addEventListener('click',()=>playInstrument('harp'));
  useFlute?.addEventListener('click',()=>playInstrument('flute'));
  window.BradaviceInventory?.ready.then(refreshInstruments);
  window.addEventListener('bradavice:inventory-updated',refreshInstruments);
  audio.addEventListener('ended',()=>escapeToHagrid('Hudba dohrála. Chloupek otevřel všech šest očí — musíš pryč!'));
  next.addEventListener('click',e=>{
    if(!dog.classList.contains('sleeping')||audio.ended||audio.paused){e.preventDefault();escapeToHagrid();return}
    passed=true;clearEntry();clearInterval(sleepTick);clearTimeout(redirectTimer);localStorage.setItem(STATE,'passed');audio.pause();
  });
  window.addEventListener('pagehide',()=>{clearEntry();clearInterval(sleepTick);clearTimeout(redirectTimer)});
  // Při KAŽDÉM vstupu do místnosti běží osm sekund, než Chloupek zaútočí.
  startEntryDanger();
})();