/* v18 — Filch vždy doprovodí přistiženého studenta k Umbridgeové.
   Databáze rozhoduje o bodovém postihu, nikoli o tom, zda se příběh posune. */
(()=>{
  // Filch může přijít kvůli bombě kamkoli na hradě; náhodně se dál potuluje jen chodbami.
  const scene=document.querySelector('main.corridor-stage')||document.querySelector('main');
  if(!scene)return;
  if(getComputedStyle(scene).position==='static')scene.style.position='relative';
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  const randomCorridor=Boolean(document.querySelector('main.corridor-stage'));
  const thirdFloor=page==='chodby-horni.html';
  // Výskyt je náhodný při vstupu; na třetím poschodí je přísnější dohled.
  const visitKey='bradavice_filch_last_visit_v452';
  let lastVisit=0;try{lastVisit=Number(sessionStorage.getItem(visitKey)||0)}catch{}
  const randomAppearance=randomCorridor&&Date.now()-lastVisit>=25*60*1000&&Math.random()<(thirdFloor ? 0.27 : 0.20);
  if(randomAppearance)try{sessionStorage.setItem(visitKey,String(Date.now()))}catch{}
  let bombIncident=false;
  let escorting=false;
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
  const closeDialog=()=>{
    if(escorting||bombIncident||thirdFloor)return;
    dialog.hidden=true;document.body.style.overflow='';button.focus();
  };
  const escortToUmbridge=async()=>{
    if(escorting)return;
    escorting=true;
    next.disabled=true;
    close.hidden=true;
    p.textContent='Filch tě pevně popadne za rameno a odvádí tě do kabinetu profesorky Umbridgeové…';
    next.textContent='Cesta ke kabinetu…';
    // Ulož pokračování ještě před dotazem; ani výpadek nebo cooldown DB nesmí
    // nechat hráče v již skončené scéně zadržení.
    try{
      sessionStorage.setItem('bradavice_filch_escorted_v442','1');
      sessionStorage.setItem('bradavice_filch_origin_v17',bombIncident?'dungbomb':'patrol');
      if(bombIncident)sessionStorage.setItem('bradavice_filch_punishment_pending_v17','1');
      sessionStorage.removeItem('bradavice_filch_incident_v446');
    }catch(e){console.warn('Filch: záznam pokračování',e)}
    try{
      const db=window.BradaviceDB?.client;
      if(!db)throw new Error('Školní evidence není dostupná.');
      const {data,error}=await Promise.race([
        db.rpc('v449_filch_start'),
        new Promise((_,reject)=>setTimeout(()=>reject(new Error('Časový limit školní evidence')),2500))
      ]);
      if(error)throw error;
      // V režimu cooldown nelze body strhnout znovu; doprovod i školní trest
      // za právě použitou hnojůvku však musí pokračovat.
      const incident=typeof data==='string'?data:(data?.incident_id||data?.id);
      if(/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(String(incident||''))){
        sessionStorage.setItem('bradavice_filch_incident_v446',incident);
      }else if(data!=='cooldown'){
        console.warn('Filch: nepodařilo se potvrdit číslo zadržení',data);
      }
    }catch(e){console.warn('Filch: doprovod pokračuje bez potvrzeného odečtu bodů',e)}
    // Neověřený incident nezakládá nárok na bodový trest, ale neblokuje děj.
    window.location.assign('kabinet-umbridge.html');
  };
  const openDialog=(automatic=false)=>{
    p.textContent=bombIncident?'„TAK TADY JSI! Bomby hnojůvky! Okamžitě se mnou půjdeš k profesorce Umbridgeové!“':thirdFloor
      ? '„Tak tebe jsem tu chtěl načapat! Třetí poschodí není místo pro potulování. Půjdeš se mnou. Profesorka Umbridgeová si tě pěkně podá!“'
      : messages[Math.floor(Math.random()*messages.length)];
    next.textContent=thirdFloor||bombIncident?'Jít s Filchem k Umbridgeové':'Rozumím, pane Filchi';
    close.hidden=thirdFloor||bombIncident;
    dialog.hidden=false;document.body.style.overflow='hidden';next.focus({preventScroll:true});
    if(automatic&&(thirdFloor||bombIncident)){
      next.textContent='Filch tě odvádí k Umbridgeové…';next.disabled=true;
      setTimeout(()=>{if(!dialog.hidden)escortToUmbridge()},1400);
    }
  };
  button.addEventListener('click',()=>openDialog(false));if(thirdFloor&&randomAppearance)setTimeout(()=>openDialog(true),1300);
  window.addEventListener('bradavice:dungbomb-alarm',()=>{bombIncident=true;button.hidden=false;openDialog(true)});
  next.addEventListener('click',()=>{if(thirdFloor||bombIncident)escortToUmbridge();else closeDialog()});
  close.addEventListener('click',closeDialog);
  dialog.addEventListener('click',e=>{if(e.target===dialog)closeDialog()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden)closeDialog()});
})();
