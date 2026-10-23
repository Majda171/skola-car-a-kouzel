(()=>{
 const diary=document.getElementById('chamberDiary'),raddle=document.getElementById('chamberRaddle'),basilisk=document.getElementById('chamberBasilisk'),sword=document.getElementById('chamberSword'),fang=document.getElementById('chamberFang'),msg=document.getElementById('chamberMessage'),intro=document.getElementById('chamberIntro'),mono=document.getElementById('raddleMonologue'),monoText=document.getElementById('raddleMonologueText');
 if(!diary||!raddle||!basilisk||!sword||!fang)return;
 const student=(()=>{try{return JSON.parse(localStorage.getItem('bradavice_student_v1')||'null')}catch{return null}})();
 const sid=String(student?.supabaseUserId||student?.email||'guest').replace(/[^a-zA-Z0-9@._-]/g,'_');
 const KEY=`bradavice_chamber_sequence_v4367_${sid}`;
 let stage=Math.max(0,Math.min(4,Number(localStorage.getItem(KEY)||0))),locked=false;
 const tell=t=>{if(msg)msg.textContent=t};
 const save=n=>{stage=n;localStorage.setItem(KEY,String(n))};
 function revealRaddle(){
   raddle.hidden=false;raddle.classList.add('entering');
   if(intro)intro.textContent='Z deníku se vynořila průsvitná postava mladého studenta.';
   tell('„Nejsem člověk. Jsem vzpomínka — otisk Toma Raddla, který v tomto deníku zůstal.“');
 }
 const MONO=['„Tak přece jen někdo deník otevřel.“','„Jméno je Tom Raddle. To, co vidíš, je vzpomínka uchovaná mezi těmito stránkami.“','„Tahle komnata čekala velmi dlouho na někoho, kdo se odváží vstoupit.“','„Mnozí slyšeli jen šeptat její jméno. Jen málokdo ale spatřil, co se skrývá uvnitř.“','„A teď ti ukážu, proč se jí ostatní tolik báli.“'];
 function playMonologue(done){
   let i=0;
   if(mono)mono.hidden=false;
   const next=()=>{
     if(i>=MONO.length){
       setTimeout(()=>{ if(mono)mono.hidden=true; done?.(); }, 700);
       return;
     }
     if(monoText)monoText.textContent=MONO[i++];
     setTimeout(next,3100);
   };
   next();
 }
 function runePuzzle(){
   if(stage!==1||document.getElementById('chamberRuneChallenge'))return;
   const overlay=document.createElement('div');overlay.id='chamberRuneChallenge';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Zkouška hadích run');
   overlay.style.cssText='position:fixed;inset:0;z-index:20000;background:#050b09eF;display:grid;place-items:center;padding:18px;color:#ecd9ac';
   const card=document.createElement('section');card.style.cssText='width:min(540px,100%);padding:28px;text-align:center;background:linear-gradient(145deg,#23352e,#080f0d);border:2px solid #9d8c5e;border-radius:14px;box-shadow:0 20px 80px #000';
   const heading=document.createElement('h2');heading.textContent='Pečeť Salazara Zmijozela';
   const clue=document.createElement('p');clue.textContent='Čtyři znaky chrání komnatu. Otevři cestu v pořadí: světlo noci, hadí jazyk, oko strážce a poslední hvězda. Chybná runa pečeť znovu uzavře.';
   const status=document.createElement('p');status.setAttribute('role','status');status.textContent='Rozluštěno 0 ze 4 znaků';
   const symbols=[['☾','Měsíc'],['ᛋ','Had'],['◉','Oko'],['✶','Hvězda'],['◆','Kámen'],['♜','Věž']];const order=['Měsíc','Had','Oko','Hvězda'];let step=0;
   const buttons=document.createElement('div');buttons.style.cssText='display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:20px';
   for(const [glyph,name] of symbols){const b=document.createElement('button');b.type='button';b.textContent=glyph;b.setAttribute('aria-label',name);b.style.cssText='background:#304c40;color:#f1e0a7;border:1px solid #ad9462;border-radius:8px;padding:16px;font-size:30px;cursor:pointer';b.onclick=()=>{if(name===order[step]){step++;status.textContent=`Rozluštěno ${step} ze 4 znaků`;if(step===4){overlay.remove();summon();}}else{step=0;status.textContent='Pečeť se uzavřela. Začni od prvního znaku.';}};buttons.append(b)}
   card.append(heading,clue,status,buttons);overlay.append(card);document.body.append(overlay);buttons.querySelector('button')?.focus();
 }
 function summon(){
   if(stage<1||stage>=3)return;
   save(2);basilisk.hidden=false;basilisk.classList.add('appear');sword.hidden=false;
   tell('Raddle se usměje. „Pohleď na dědice komnaty.“ Z hlubin se ozve syčení a bazilišek se zvedne z temnoty. Použij meč.');
 }
 function killBasilisk(){
   if(stage!==2||locked)return;locked=true;
   basilisk.classList.add('defeated');tell('Čepel zasáhla baziliška. Nestvůra se hroutí a mizí v temnotě…');
   setTimeout(()=>{basilisk.hidden=true;sword.hidden=true;fang.hidden=false;save(3);locked=false;tell('Po baziliškovi zůstal jediný dlouhý zub. Deník stále leží na podlaze.');},850);
 }
 function destroyDiary(){
   if(stage!==3||locked)return;locked=true;save(4);diary.classList.add('pierced');fang.hidden=true;
   tell('Zub prorazil deník. Inkoust se rozpil a Raddle začíná blednout.');
   raddle.classList.add('fading');
   window.BradaviceAchievements?.award?.('tajemstvi-hradu',{silent:true});
   window.BradaviceAchievements?.completeQuest?.('tajemna-komnata',{title:'Tajemná komnata'});
   setTimeout(()=>{raddle.hidden=true;locked=false;tell('Raddle zmizel. V komnatě zůstalo jen ticho a zničený deník.');},2900);
 }
 function overlaps(a,b){const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();return x.left<y.right&&x.right>y.left&&x.top<y.bottom&&x.bottom>y.top}
 function makeDrag(el,target,onDrop){
   let active=false,startX=0,startY=0,dx=0,dy=0;
   el.addEventListener('pointerdown',e=>{if(el.hidden)return;active=true;startX=e.clientX;startY=e.clientY;dx=dy=0;el.setPointerCapture?.(e.pointerId);el.classList.add('dragging');e.preventDefault()});
   el.addEventListener('pointermove',e=>{if(!active)return;dx=e.clientX-startX;dy=e.clientY-startY;el.style.translate=`${dx}px ${dy}px`;e.preventDefault()});
   const end=e=>{if(!active)return;active=false;el.classList.remove('dragging');const ok=overlaps(el,target);el.style.translate='';if(ok)onDrop();else tell(el===sword?'Meč musí zasáhnout baziliška.':'Baziliščím zubem musíš probodnout deník.');try{el.releasePointerCapture?.(e.pointerId)}catch{}};
   el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
 }
 const diarySound=new Audio('audio/raddle-diary-v463.mp3');
 diarySound.volume=.55;diarySound.preload='none';
 function startDiarySound(){try{diarySound.pause();diarySound.currentTime=0;diarySound.play().catch(()=>{});}catch{}}
 window.addEventListener('pagehide',()=>diarySound.pause());
 diary.addEventListener('click',()=>{
   if(stage===0){save(1);startDiarySound();revealRaddle();playMonologue(()=>runePuzzle())}
   else if(stage===1){startDiarySound();revealRaddle();playMonologue(()=>runePuzzle())}
   else if(stage===4)tell('Deník je zničený. Raddle už z něj nemůže promluvit.');
 });
 makeDrag(sword,basilisk,killBasilisk);makeDrag(fang,diary,destroyDiary);
 // Obnova přesně podle studenta.
 if(stage>=1)revealRaddle();
 if(stage===1)setTimeout(()=>playMonologue(()=>runePuzzle()),1400);
 if(stage===2){basilisk.hidden=false;sword.hidden=false}
 if(stage===3){raddle.hidden=false;basilisk.hidden=true;sword.hidden=true;fang.hidden=false;tell('Bazilišek je pryč. Přetáhni jeho zub na deník.')}
 if(stage>=4){diary.classList.add('pierced');basilisk.hidden=true;sword.hidden=true;fang.hidden=true;raddle.hidden=true;if(intro)intro.textContent='Deník leží zničený na podlaze.';tell('Raddle zmizel. Tajemná komnata znovu ztichla.')}
})();
