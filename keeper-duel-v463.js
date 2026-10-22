/* Bradavice v463: současný brankářský duel dvou studentů přes Supabase RPC.
   Střely i časový limit určuje server; lokální klient vykresluje animaci. */
(()=>{'use strict';
const open=document.getElementById('openKeeperDuel');
const modal=document.getElementById('keeperDuelModal');
if(!open||!modal)return;
const db=window.BradaviceDB?.client;
const $=id=>document.getElementById(id);
const arena=$('kdArena'),player=$('kdKeeper'),ball=$('kdBall'),startBox=$('kdLobby'),game=$('kdGame'),status=$('kdStatus');
const score=$('kdScore'),opScore=$('kdOpponentScore'),streakEl=$('kdStreak'),timeEl=$('kdTime'),codeEl=$('kdRoomCode');
const notice=$('kdNotice'),joinInput=$('kdJoinCode');
const coords=[{x:32.65,y:35.15},{x:49.4,y:22.8},{x:66.25,y:40.2}];
const positions=[{x:32.65,y:52},{x:49.4,y:40},{x:66.25,y:57}];
const hoops=[...arena.querySelectorAll('.kd-hoop')];
const soundHit=new Audio('audio/famfrpal-camral-v450b.mp3');soundHit.volume=.66;
const applause=new Audio('audio/famfrpal-potlesk-v450.mp3');applause.volume=.8;
let room='',seat='',state=null,startAt=0,clockOffset=0,selected=-1;
let raf=0,poll=null,clock=null,flight=false,pending=false,closing=false,shot=null,processed=-1;
let ended=false;
const play=a=>{try{a.pause();a.currentTime=0;a.play().catch(()=>{})}catch{}};
const call=async(action,params={})=>{
 if(!db)throw Error('Připojení k duelu teď není dostupné.');
 const {data,error}=await db.rpc('v463_keeper_duel',{p_action:action,p_code:room||null,p_shot_index:null,p_lane:null,...params});
 if(error)throw error;
 if(!data||!data.code)throw Error('Databáze nevrátila stav duelu.');
 clockOffset=Date.parse(data.server_now)-Date.now();
 return data;
};
function say(t){status.textContent=t}
function resetUI(){
 cancelAnimationFrame(raf);flight=false;pending=false;selected=-1;processed=-1;shot=null;ended=false;
 ball.hidden=true;hoops.forEach(h=>h.classList.remove('selected'));
 score.textContent='0';opScore.textContent='0';streakEl.textContent='0';timeEl.textContent='1:30';
 player.style.left='50%';player.style.top='68%';notice.textContent='';
}
function choose(index){if(!flight||pending)return;selected=index;hoops.forEach((h,i)=>h.classList.toggle('selected',i===index));player.style.left=positions[index].x+'%';player.style.top=positions[index].y+'%'}
function update(data){
 if(!data||data.code!==room||closing)return;
 state=data;seat=data.seat;
 if(data.starts_at)startAt=Date.parse(data.starts_at);
 score.textContent=data.saves;opScore.textContent=data.opponent_saves;streakEl.textContent=data.streak;
 if(data.status==='ended')finish(data);
 else if(data.status==='waiting'){say('Pošli šestimístný kód spolužákovi. Čekám na druhého hráče.');}
 else if(data.status==='playing' && !ended){
   startBox.hidden=true;game.hidden=false;
   const rem=Math.max(0,startAt+90000-(Date.now()+clockOffset));
   if(rem>90000){say('Duel začne za chvíli. Oba studenti startují současně.');}
   else if(rem>0 && !flight&&!pending && (!shot||shot.index!==data.next_index)) launch(data);
 }
}
function showClock(){if(!state||ended)return;const ms=Math.max(0,startAt+90000-Date.now()-clockOffset);const sec=Math.ceil(ms/1000);timeEl.textContent=`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
 if(state.status==='playing' && Date.now()+clockOffset>=startAt && !flight&&!pending&&!ended&&!shot)launch(state);
 if(ms<=0 && state.status==='playing')refresh();
}
function launch(data){
 if(ended||flight||pending||Date.now()+clockOffset<startAt||Date.now()+clockOffset>=startAt+90000)return;
 if(shot&&shot.index===data.next_index)return;
 const index=data.next_index;
 shot={index,target:data.next_target,duration:data.next_duration_ms};
 processed=index;selected=-1;flight=true;
 player.style.left='50%';player.style.top='68%';hoops.forEach(h=>h.classList.remove('selected'));
 ball.hidden=false;
 const end=coords[shot.target],beg=performance.now();
 const curve=((index%3)-1)*6;
 const duration=shot.duration;
 function frame(now){
  if(!flight||ended)return;
  const t=Math.min(1,(now-beg)/duration),u=1-t;
  const x=u*u*50+2*u*t*((50+end.x)/2+curve)+t*t*end.x;
  const y=u*u*82+2*u*t*(Math.min(82,end.y)-8)+t*t*end.y;
  ball.style.left=x+'%';ball.style.top=y+'%';ball.style.transform=`translate(-50%,-50%) scale(${.5+t*.6})`;
  if(t<1)raf=requestAnimationFrame(frame);else hit();
 }
 raf=requestAnimationFrame(frame);
}
async function hit(){
 if(ended||!shot)return;
 flight=false;pending=true;
 const lane=selected;
 try{
  // Nechycenou střelu zapisuje libovolná neúspěšná obruč: vždy je odlišná od serverového cíle.
  const submitted=lane>=0?lane:(shot.target+1)%3;
  const data=await call('catch',{p_shot_index:shot.index,p_lane:submitted});
  if(data.last_caught){play(soundHit);say('CHYCENO!');if(data.streak>0&&data.streak%5===0){play(applause);notice.textContent=`👏 ${data.streak} zákroků v řadě!`;
    setTimeout(()=>{if(notice.textContent.includes('zákroků'))notice.textContent=''},3000);
  }}else{say('GÓL! Série chycených střel se přerušila.');}
  shot=null;pending=false;ball.hidden=true;
  update(data);
  if(data.status==='playing' && Date.now()+clockOffset<startAt+90000){setTimeout(()=>{if(!ended&&!flight&&!pending)launch(data)},230)}
 }catch(e){pending=false;shot=null;ball.hidden=true;say('Střelu se nepodařilo zapsat: '+e.message+'. Zkouším obnovit duel.');setTimeout(refresh,900)}
}
function finish(data){
 if(ended)return;
 ended=true;cancelAnimationFrame(raf);flight=false;ball.hidden=true;
 let result='Remíza';
 if(data.winner==='host'||data.winner==='guest')result=data.winner===seat?'Vyhráváš!':'Vyhrává soupeř.';
 notice.textContent=`Konec duelu · ${result} Ty ${data.saves} : ${data.opponent_saves} soupeř.`;
 say('Čas vypršel. Počet chycených střel rozhodl duel.');
}
async function refresh(){if(!room||closing)return;
 try{const data=await call('status');if(data.next_index!==state?.next_index&&!pending&&flight){cancelAnimationFrame(raf);flight=false;shot=null;ball.hidden=true}update(data)}
 catch(e){say('Kontrola duelu: '+e.message)}
}
async function create(){
 try{resetUI();room='';const data=await call('create');room=data.code;seat=data.seat;codeEl.textContent=room;startBox.hidden=false;game.hidden=true;update(data);beginWatch()}
 catch(e){say('Nelze vytvořit duel: '+e.message)}
}
async function join(){
 const code=joinInput.value.trim().toUpperCase().replace(/[^A-F0-9]/g,'').slice(0,6);
 if(code.length!==6){say('Zadej šestimístný kód duelu.');return}
 room=code;
 try{resetUI();const data=await call('join');codeEl.textContent=room;update(data);beginWatch()}
 catch(e){say('Nelze se připojit: '+e.message);room=''}
}
function beginWatch(){clearInterval(poll);clearInterval(clock);poll=setInterval(refresh,1000);clock=setInterval(showClock,250);refresh()}
function close(){closing=true;clearInterval(poll);clearInterval(clock);cancelAnimationFrame(raf);flight=false;pending=false;modal.hidden=true;document.body.style.overflow='';closing=false;room='';state=null;shot=null;resetUI()}
function openModal(){modal.hidden=false;document.body.style.overflow='hidden';closing=false;resetUI();startBox.hidden=false;game.hidden=true;codeEl.textContent='—';say('Vytvoř duel a pošli kód spolužákovi, nebo se připoj k jeho místnosti.');}
$('kdCreate').addEventListener('click',create);
$('kdJoin').addEventListener('click',join);
$('kdClose').addEventListener('click',close);
$('kdCopy').addEventListener('click',async()=>{if(!room)return;try{await navigator.clipboard.writeText(room);say('Kód zkopírován. Pošli ho spolužákovi.')}catch{say('Kód duelu: '+room)}});
joinInput.addEventListener('input',()=>joinInput.value=joinInput.value.toUpperCase().replace(/[^A-F0-9]/g,'').slice(0,6));
hoops.forEach((h,i)=>h.addEventListener('click',()=>choose(i)));
open.addEventListener('click',openModal);
modal.addEventListener('click',e=>{if(e.target===modal)close()});
document.addEventListener('keydown',e=>{if(modal.hidden)return;if(e.key==='Escape')close();if(e.key==='1'||e.key==='ArrowLeft')choose(0);if(e.key==='2'||e.key==='ArrowUp')choose(1);if(e.key==='3'||e.key==='ArrowRight')choose(2)});
window.addEventListener('pagehide',()=>{clearInterval(poll);clearInterval(clock);cancelAnimationFrame(raf)});
})();
