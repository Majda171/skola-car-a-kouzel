/* Snake v453. Společný žebříček nikdy nedůvěřuje číslici skóre poslané klientem:
   Supabase znovu simuluje celou partii z posloupnosti tahů. */
(()=>{'use strict';
 const W=18,H=14,N=W*H,STEP=125;
 const canvas=document.getElementById('v453SnakeCanvas');if(!canvas)return;
 const ctx=canvas.getContext('2d'),start=document.getElementById('v453SnakeStart'),pause=document.getElementById('v453SnakePause'),status=document.getElementById('v453SnakeStatus'),value=document.getElementById('v453SnakeScore'),best=document.getElementById('v453SnakeBest'),leaders=document.getElementById('v453SnakeLeaders');
 const client=window.BradaviceDB?.client;
 const delta={U:-W,D:W,L:-1,R:1};
 let timer=null,round=null,seed=0,segments=[7*W+9,7*W+8,7*W+7],apple=-1,heading='R',wanted='R',score=0,replay='',finished=true,paused=false,personal=0,spawnState=0;
 const msg=t=>{status.textContent=t};
 function nextRandom(){spawnState=(Math.imul(spawnState,1664525)+1013904223)>>>0;return spawnState}
 function spawn(){let candidate=nextRandom()%N;for(let i=0;i<N;i++){let v=(candidate+i)%N;if(!segments.includes(v))return v}return -1}
 function draw(){const cell=30;ctx.clearRect(0,0,540,420);const bg=ctx.createLinearGradient(0,0,0,420);bg.addColorStop(0,'#0b1817');bg.addColorStop(1,'#050b0e');ctx.fillStyle=bg;ctx.fillRect(0,0,540,420);
  ctx.lineWidth=.7;ctx.strokeStyle='#82714c20';for(let x=0;x<=W;x++){ctx.beginPath();ctx.moveTo(x*cell+.5,0);ctx.lineTo(x*cell+.5,H*cell);ctx.stroke()}for(let y=0;y<=H;y++){ctx.beginPath();ctx.moveTo(0,y*cell+.5);ctx.lineTo(W*cell,y*cell+.5);ctx.stroke()}
  if(apple>=0){const x=(apple%W+.5)*cell,y=(Math.floor(apple/W)+.5)*cell;ctx.shadowBlur=18;ctx.shadowColor='#8fffb1';ctx.fillStyle='#8edda7';ctx.beginPath();ctx.ellipse(x,y,7,9,-.3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}
  for(let i=segments.length-1;i>=0;i--){let p=segments[i],x=(p%W)*cell+3,y=Math.floor(p/W)*cell+3;ctx.fillStyle=i===0?'#dcbb71':'#457e5b';ctx.shadowBlur=i===0?12:3;ctx.shadowColor='#68dda4';ctx.beginPath();ctx.roundRect(x,y,cell-6,cell-6,8);ctx.fill();ctx.shadowBlur=0;
   if(i===0){ctx.fillStyle='#111d18';ctx.beginPath();ctx.arc(x+9,y+8,2.6,0,Math.PI*2);ctx.arc(x+19,y+8,2.6,0,Math.PI*2);ctx.fill()}}
 }
 function choose(dir){if(!delta[dir]||finished)return;if((heading==='U'&&dir==='D')||(heading==='D'&&dir==='U')||(heading==='L'&&dir==='R')||(heading==='R'&&dir==='L'))return;wanted=dir}
 function step(){heading=wanted;replay+=heading;const head=segments[0],x=head%W,y=Math.floor(head/W);let nx=x+(heading==='R'?1:heading==='L'?-1:0),ny=y+(heading==='D'?1:heading==='U'?-1:0);
  if(nx<0||nx>=W||ny<0||ny>=H){end('Bazilišek narazil do stěny.');return}
  const target=ny*W+nx,ate=target===apple;if(segments.slice(0,ate?undefined:-1).includes(target)){end('Bazilišek se zakousl do vlastního ocasu.');return}
  segments.unshift(target);if(ate){score++;apple=spawn();value.textContent=score;if(apple<0){end('Obsadil jsi celé bludiště!');return}}else segments.pop();draw();if(replay.length>=1600)end('Dosažen maximální čas hry.');
 }
 async function leaderboard(){if(!client){msg('Supabase není dostupné. Hru lze vyzkoušet až po načtení připojení.');return}try{const {data,error}=await client.rpc('v453_snake_leaders');if(error)throw error;leaders.replaceChildren();if(!data?.length){const li=document.createElement('li');li.textContent='Zatím nikdo nepřekonal Tajemnou komnatu.';leaders.append(li)}else data.slice(0,3).forEach(r=>{const li=document.createElement('li');li.textContent=`${r.student_name} (${r.house_code}) — ${r.best_score} vajec`;leaders.append(li)})}catch{leaders.replaceChildren();const li=document.createElement('li');li.textContent='Žebříček se zpřístupní po nastavení SQL v453.';leaders.append(li)}}
 async function begin(){if(timer)clearInterval(timer);timer=null;try{if(!client)throw Error('Databáze není dostupná');start.disabled=true;msg('Připravuji kouzelnickou partii…');const {data,error}=await client.rpc('v453_snake_start');if(error)throw error;round=data.round_id;seed=Number(data.seed);spawnState=seed>>>0;segments=[7*W+9,7*W+8,7*W+7];heading='R';wanted='R';score=0;replay='';value.textContent='0';apple=spawn();finished=false;paused=false;pause.disabled=false;pause.textContent='Pozastavit';start.textContent='Nová hra';start.disabled=false;msg('Sbírej vejce a vyhýbej se překážkám.');draw();timer=setInterval(step,STEP)}catch(e){start.disabled=false;pause.disabled=true;msg('Partii nelze zahájit: '+(e.message||'chyba připojení'))}}
 async function end(message){if(finished)return;finished=true;clearInterval(timer);timer=null;pause.disabled=true;msg(`${message} Získaných vajec: ${score}. Ověřuji výsledek…`);
  try{const {data,error}=await client.rpc('v453_snake_submit',{p_round_id:round,p_moves:replay});if(error)throw error;const confirmed=Number(data?.score??0);personal=Math.max(personal,confirmed);best.textContent=personal;msg(`${message} Ověřeno: ${confirmed} vajec.${data?.new_record?' 🏆 Nový školní rekord!':''}${data?.rewarded?' Tvoje kolej získává 150 bodů!':''}`);await leaderboard();if(data?.rewarded)window.BradaviceDB?.hydrateStudent?.().catch(()=>{})}catch(e){msg(`${message} ${score} vajec, ale výsledek nebyl uložen: ${e.message||'chyba'}`)}
 }
 start.addEventListener('click',begin);pause.addEventListener('click',()=>{if(finished)return;paused=!paused;if(paused){clearInterval(timer);timer=null;msg('Hra je pozastavená.');pause.textContent='Pokračovat'}else{timer=setInterval(step,STEP);msg('Hra pokračuje.');pause.textContent='Pozastavit'}});
 document.addEventListener('keydown',e=>{const keys={ArrowUp:'U',ArrowDown:'D',ArrowLeft:'L',ArrowRight:'R',w:'U',s:'D',a:'L',d:'R',W:'U',S:'D',A:'L',D:'R'};if(keys[e.key]){const tag=document.activeElement?.tagName;if(tag==='INPUT'||tag==='TEXTAREA')return;if(e.key.startsWith('Arrow'))e.preventDefault();choose(keys[e.key])}});
 document.querySelectorAll('[data-direction]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.direction)));
 let touchX=0,touchY=0;canvas.addEventListener('touchstart',e=>{touchX=e.touches[0].clientX;touchY=e.touches[0].clientY},{passive:true});canvas.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)+Math.abs(dy)<20)return;choose(Math.abs(dx)>Math.abs(dy)?dx>0?'R':'L':dy>0?'D':'U')},{passive:true});
 document.getElementById('v453SnakeRefresh').addEventListener('click',leaderboard);window.addEventListener('pagehide',()=>{clearInterval(timer)});draw();leaderboard();
})();
