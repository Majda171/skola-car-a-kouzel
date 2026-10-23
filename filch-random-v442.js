/* v442 — Náhodná setkání Filche. Zadržení a doprovod k Umbridgeové pouze ve třetím poschodí. */
(()=>{
  const scene=document.querySelector('main.corridor-stage');
  if(!scene)return;
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  const thirdFloor=page==='chodby-horni.html';
  // Výskyt je náhodný při vstupu; na třetím poschodí je přísnější dohled.
  const visitKey='bradavice_filch_last_visit_v452';
  let lastVisit=0;try{lastVisit=Number(sessionStorage.getItem(visitKey)||0)}catch{}
  const randomAppearance=Date.now()-lastVisit>=25*60*1000&&Math.random()<(thirdFloor ? 0.27 : 0.20);
  if(randomAppearance)try{sessionStorage.setItem(visitKey,String(Date.now()))}catch{}
  let bombIncident=false;
  const positions={
    'chodby.html':'3%',
    'chodby-schody.html':'5%',
    'chodby-portretni-galerie.html':'2%',
    'chodby-stara-galerie.html':'6%',
    'chodby-horni.html':'4%',
    'chodby-podzemni-1.html':'2%',
    'chodby-podzemni-2.html':'6%'
  };
  const button=document.createElement('button');
  button.type='button';button.className='filch-wandering';
  button.style.setProperty('--filch-right',positions[page]||'3%');
  button.setAttribute('aria-label','Argus Filch – promluvit');
  const portrait=document.createElement('img');
  portrait.src='img/filch-user-v439.webp';portrait.alt='Argus Filch';
  button.appendChild(portrait);scene.appendChild(button);
  button.hidden=!randomAppearance;
  const dialog=document.createElement('div');dialog.className='filch-wandering-dialog';
  dialog.hidden=true;dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');
  dialog.setAttribute('aria-label','Setkání s Argusem Filchem');
  const card=document.createElement('section');card.className='filch-wandering-card';
  const close=document.createElement('button');close.type='button';close.className='filch-wandering-close';
  close.setAttribute('aria-label','Zavřít dialog');close.textContent='×';
  const title=document.createElement('strong');title.textContent='Argus Filch';
  const p=document.createElement('p');
  const next=document.createElement('button');next.type='button';next.className='filch-wandering-continue';
  card.append(close,title,p,next);dialog.append(card);document.body.appendChild(dialog);
  const messages=[
    '„Copak to tu máme? Zase někdo, kdo se potlouká po chodbách. Dávej si pozor, mám oči všude!“',
    '„Ukaž ruce! Snad jsi zase nezkoušel/a nějaká kouzla na školním majetku?“',
    '„Tady se nebude běhat! A jestli se tu něco ztratí, vím, koho si předvolám.“'
  ];
  const closeDialog=()=>{dialog.hidden=true;document.body.style.overflow='';button.focus()};
  const openDialog=(automatic=false)=>{
    p.textContent=bombIncident?'„TAK TADY JSI! Bomby hnojůvky! Okamžitě se mnou půjdeš k profesorce Umbridgeové!“':thirdFloor
      ? '„Tak tebe jsem tu chtěl načapat! Třetí poschodí není místo pro potulování. Půjdeš se mnou. Profesorka Umbridgeová si tě pěkně podá!“'
      : messages[Math.floor(Math.random()*messages.length)];
    next.textContent=thirdFloor||bombIncident?'Jít s Filchem k Umbridgeové':'Rozumím, pane Filchi';
    dialog.hidden=false;document.body.style.overflow='hidden';next.focus({preventScroll:true});if(automatic&&(thirdFloor||bombIncident)){next.textContent='Filch tě odvádí k Umbridgeové…';next.disabled=true;setTimeout(()=>{if(!dialog.hidden){next.disabled=false;next.click()}},1100)}
  };
  button.addEventListener('click',()=>openDialog(false));if(thirdFloor&&randomAppearance)setTimeout(()=>openDialog(true),1300);
  window.addEventListener('bradavice:dungbomb-alarm',()=>{bombIncident=true;button.hidden=false;openDialog(true)});
  next.addEventListener('click',async()=>{
    if((thirdFloor||bombIncident)&&next.textContent==='Odejít')return;
    if(thirdFloor||bombIncident){
      // Incident vydava Supabase; klient si nesmi vymyslet identifikator pro odpocet bodu.
      next.disabled=true;p.textContent='Pan Filch zapisuje zadržení do školní evidence…';
      try{
        const db=window.BradaviceDB?.client;if(!db)throw new Error('Školní evidence není dostupná.');
        const {data,error}=await db.rpc('v449_filch_start');if(error)throw error;
        if(data==='cooldown'){
          p.textContent='„Ehm! Dneska už si tě zapisuju. Tentokrát mazej do své koleje a znovu mě nedráždi!“';
          next.textContent='Odejít';next.onclick=closeDialog;next.disabled=false;return;
        }
        if(!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/.test(String(data||'')))throw new Error('Databáze nepotvrdila zadržení.');
        sessionStorage.setItem('bradavice_filch_incident_v446',data);
        sessionStorage.setItem('bradavice_filch_escorted_v442','1');
        location.href='kabinet-umbridge.html';
      }catch(e){p.textContent='Školní evidence teď neodpovídá. Bodový trest nebyl zahájen; zkus to později.';console.warn('Filch:',e.message)}
      finally{next.disabled=false}
      return;
    }
    closeDialog();
  });
  close.addEventListener('click',closeDialog);
  dialog.addEventListener('click',e=>{if(e.target===dialog)closeDialog()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden)closeDialog()});
})();
