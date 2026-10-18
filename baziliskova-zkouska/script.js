/* Baziliškova zkouška – standalone snake game. No backend or secret keys. */
(() => {
  'use strict';
  const GRID = 21;
  const STORAGE = 'baziliskova-zkouska-v1';
  const NAME_STORAGE = 'baziliskova-zkouska-name';
  const SOUND_STORAGE = 'baziliskova-zkouska-sound';
  const DB = window.BradaviceDB?.client;
  let rankedRound=null, rngState=0, replay='', cloudLeaders=null, cloudActive=false, starting=false;
  function randomCellIndex(length){
    if(!cloudActive)return Math.floor(Math.random()*length);
    rngState=(Math.imul(rngState,1664525)+1013904223)>>>0;
    return rngState%length;
  }
  async function refreshCloud(){
    if(!DB)return;
    try{const {data,error}=await DB.rpc('v453_snake_leaders');if(error)throw error;
      cloudLeaders=(data||[]).slice(0,3).map(x=>({name:x.student_name,score:x.best_score,house:x.house_code}));
      updateUI();
    }catch(e){console.warn('Školní rekordy zatím nejsou dostupné:',e.message)}
  }

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const $ = id => document.getElementById(id);
  const ui = {
    frame: $('arenaFrame'), overlay: $('gameOverlay'), overlayButton: $('overlayButton'),
    overlayHeading: $('overlayHeading'), overlayOverline: $('overlayOverline'),
    overlayDescription: $('overlayDescription'), overlayHint: $('overlayHint'),
    score: $('scoreValue'), best: $('bestValue'), leader: $('leaderValue'),
    progress: $('progressValue'), progressFill: $('progressFill'), leaderboard: $('leaderboard'),
    name: $('playerName'), boardStatus: $('boardStatusText'), status: document.querySelector('.board-status'),
    modeLabel: $('modeLabel'), classic: $('classicMode'), ruins: $('ruinsMode'),
    pause: $('pauseButton'), pauseMobile: $('pauseMobile'), restart: $('restartButton'),
    sound: $('soundButton'), soundGlyph: $('soundGlyph'), soundLabel: $('soundLabel'), toast: $('toast')
  };
  const DIRS = {
    up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
    left: { x: -1, y: 0 }, right: { x: 1, y: 0 }
  };
  const recordCache = safeRead(STORAGE, { classic: [], ruins: [] });
  const records = {
    classic: sanitizeRecords(recordCache.classic),
    ruins: sanitizeRecords(recordCache.ruins)
  };
  let soundOn = safeRead(SOUND_STORAGE, false) === true;
  let audioCtx = null;
  let toastTimer = null;
  let renderSize = 0;
  let renderDpr = 1;
  const state = {
    phase: 'ready', mode: 'classic', snake: [], direction: DIRS.right,
    nextDirection: DIRS.right, turnLocked: false, obstacles: [],
    food: null, rare: null, foodEaten: 0, score: 0,
    elapsed: 0, tickAccum: 0, lastFrame: 0, particles: [],
    recordBaseline: 0
  };

  function safeRead(key, fallback) {
    try { const found = localStorage.getItem(key); return found === null ? fallback : JSON.parse(found); }
    catch { return fallback; }
  }
  function safeWrite(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* Private browsing or storage disabled: game still works. */ }
  }
  function sanitizeRecords(list) {
    if (!Array.isArray(list)) return [];
    return list.filter(x => x && Number.isFinite(x.score) && x.score > 0 && typeof x.name === 'string')
      .map(x => ({ name: x.name.slice(0, 18), score: Math.floor(x.score), at: Number(x.at) || 0 }))
      .sort((a,b) => b.score - a.score || a.at - b.at).slice(0,3);
  }
  function playerName() { return ui.name.value.trim().replace(/\s+/g, ' ').slice(0,18) || 'Neznámý student'; }
  function fmt(n) { return String(n).padStart(3, '0'); }
  function hash(x,y) {
    let n = Math.imul(x + 239, 374761393) + Math.imul(y + 47, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  }
  function equal(a,b) { return a && b && a.x === b.x && a.y === b.y; }
  function recordTop() { return (state.mode==='classic'&&cloudLeaders?cloudLeaders[0]?.score:records[state.mode][0]?.score)||0; }
  function personalTop() {
    const name = playerName().toLocaleLowerCase('cs');
    return Math.max(0, ...records[state.mode].filter(r => r.name.toLocaleLowerCase('cs') === name).map(r => r.score));
  }
  function makeObstacles() {
    if (state.mode !== 'ruins') return [];
    return [
      [4,4],[5,4],[4,5], [15,4],[16,4],[16,5],
      [4,15],[4,16],[5,16], [16,15],[16,16],[15,16],
      [9,4],[10,4],[11,4], [9,16],[10,16],[11,16]
    ].map(([x,y]) => ({x,y}));
  }
  function freePosition() {
    const available = [];
    for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
      const p = {x,y};
      if (!state.snake.some(s => equal(s,p)) && !state.obstacles.some(o => equal(o,p))
          && !equal(state.food,p) && !equal(state.rare,p)) available.push(p);
    }
    return available.length ? available[randomCellIndex(available.length)] : null;
  }
  function readyGame() {
    state.phase = 'ready';
    state.snake = [{x:8,y:10},{x:7,y:10},{x:6,y:10},{x:5,y:10}];
    state.direction = DIRS.right; state.nextDirection = DIRS.right;
    state.turnLocked = false; state.obstacles = makeObstacles();
    state.food = null; state.rare = null; state.foodEaten = 0; state.score = 0;
    state.elapsed = 0; state.tickAccum = 0; state.particles = [];
    state.food = freePosition();
    state.recordBaseline = recordTop();
    setOverlay('ready'); updateUI();
  }
  function setOverlay(mode) {
    const overlay = {
      ready: ['TAJEMNÁ KOMNATA ČEKÁ','Probuď baziliška', 'Veď baziliška z hradních hlubin, sbírej zlaté runy a dávej pozor na kamenné zdi.', 'Vstoupit do komnaty', 'ENTER / MEZERNÍK • KLIKNI PRO START'],
      paused: ['ČAS SE ZASTAVIL', 'Zkouška pozastavena', 'Bazilišek vyčkává na tvůj další příkaz.', 'Pokračovat ve zkoušce', 'MEZERNÍK / P • POKRAČOVAT'],
      over: ['KOMNATA ROZHODLA', 'Zkouška skončila', `Dosáhl(a) jsi ${state.score} bodů. Další pokus může změnit osud!`, 'Zkusit znovu', 'ENTER / MEZERNÍK • NOVÁ HRA'],
      victory: ['STRÁŽCE KOMNATY', 'Komnata je tvá!', `Získal(a) jsi ${state.score} bodů. Na hrací ploše už není volné místo.`, 'Hrát znovu', 'ENTER / MEZERNÍK • NOVÁ HRA']
    }[mode];
    if (!overlay) { ui.overlay.classList.add('is-hidden'); ui.overlay.setAttribute('aria-hidden','true'); return; }
    ui.overlayOverline.textContent = overlay[0]; ui.overlayHeading.textContent = overlay[1];
    ui.overlayDescription.textContent = overlay[2];
    ui.overlayButton.innerHTML = ''; ui.overlayButton.append(document.createTextNode(overlay[3] + '  '));
    const arrow = document.createElement('span'); arrow.setAttribute('aria-hidden','true'); arrow.textContent = '↗'; ui.overlayButton.append(arrow);
    ui.overlayHint.textContent = overlay[4];
    ui.overlay.classList.remove('is-hidden'); ui.overlay.removeAttribute('aria-hidden');
  }
  async function start() {
    if (state.phase === 'playing' || starting) return;
    if (state.phase === 'paused') { resume(); return; }
    starting=true;rankedRound=null;cloudActive=false;replay='';
    if(state.mode==='classic'&&DB){
      try{const {data,error}=await DB.rpc('v453_snake_start');if(error)throw error;
        rankedRound=data.round_id;rngState=(Number(data.seed)>>>0);cloudActive=true;
      }catch(e){showToast('Školní rekordy zatím nejsou dostupné. Hraješ trénink bez kolejních bodů.');}
    }
    readyGame(); state.phase = 'playing';starting=false;
    state.lastFrame = performance.now();
    setOverlay(null); updateUI(); playSound('start');
  }
  function pause() {
    if (state.phase !== 'playing') return;
    state.phase = 'paused'; setOverlay('paused'); updateUI();
  }
  function resume() {
    if (state.phase !== 'paused') return;
    state.phase = 'playing'; state.lastFrame = performance.now();
    setOverlay(null); updateUI();
  }
  function togglePause() { if (state.phase === 'playing') pause(); else if (state.phase === 'paused') resume(); }
  function changeDirection(requested) {
    if (!requested || state.turnLocked) return;
    if (state.phase === 'ready') start();
    if (state.phase !== 'playing') return;
    if (requested.x === -state.direction.x && requested.y === -state.direction.y) return;
    if (requested.x === state.direction.x && requested.y === state.direction.y) return;
    state.nextDirection = requested;
    state.turnLocked = true;
  }
  function currentTickMs() { return Math.max(81, 166 - Math.floor(state.score/30)*5 - (state.mode==='ruins' ? 10 : 0)); }
  function step() {
    state.direction = state.nextDirection;
    state.turnLocked = false;
    const head = state.snake[0];
    const next = { x: head.x + state.direction.x, y: head.y + state.direction.y };
    if(cloudActive)replay+=state.direction===DIRS.up?'U':state.direction===DIRS.down?'D':state.direction===DIRS.left?'L':'R';
    const eatsFood = equal(next,state.food);
    const eatsRare = equal(next,state.rare);
    const growing = eatsFood || eatsRare;
    const collisionBody = growing ? state.snake : state.snake.slice(0,-1);
    if (next.x < 0 || next.y < 0 || next.x >= GRID || next.y >= GRID
        || collisionBody.some(p=>equal(p,next)) || state.obstacles.some(p=>equal(p,next))) {
      finish(false); return;
    }
    state.snake.unshift(next);
    if (!growing) state.snake.pop();
    if (eatsFood) {
      state.food = null; state.score += 10; state.foodEaten++;
      addParticles(next,'#e2bd72',22); playSound('eat');
      state.food = freePosition();
      if (!state.food) { finish(true); return; }
      if (!cloudActive && state.foodEaten % 5 === 0 && !state.rare) {
        const pos = freePosition();
        if (pos) { state.rare = { ...pos, expires: state.elapsed + 6500 }; showToast('Vzácný ametyst! Máš 6 sekund na jeho získání.'); }
      }
    }
    if (eatsRare) {
      state.score += 35; addParticles(next,'#b18fea',35); playSound('rare');
      state.rare = null;
      showToast('Ametyst získán · +35 bodů!');
    }
    if (growing) updateUI();
  }
  function finish(won) {
    state.phase = won ? 'victory' : 'over';
    playSound(won?'rare':'lose');
    const previousRecord = state.recordBaseline;
    if (state.score > 0) {
      records[state.mode].push({name:playerName(),score:state.score,at:Date.now()});
      records[state.mode] = sanitizeRecords(records[state.mode]);
      safeWrite(STORAGE, records);
    }
    if (state.score > previousRecord) {
      showToast(previousRecord === 0 ? 'První záznam v síni slávy!' : 'Pokořil(a) jsi rekord! V plné hře by kolej získala +150 bodů.');
    }
    setOverlay(won?'victory':'over'); updateUI();
    if(cloudActive && rankedRound){
      const roundId=rankedRound,moves=replay;
      rankedRound=null;cloudActive=false;
      DB.rpc('v453_snake_submit',{p_round_id:roundId,p_moves:moves}).then(async({data,error})=>{
        if(error)throw error;
        if(Number(data?.score)!==state.score)console.warn('Ověřené skóre se liší od místního.');
        showToast(data?.rewarded?'🏆 Školní rekord! Tvoje kolej získala 150 bodů.':data?.new_record?'Nový školní rekord!':'Výsledek uložen do školní kroniky.');
        await refreshCloud();
        if(data?.rewarded)window.BradaviceDB?.hydrateStudent?.().catch(()=>{});
      }).catch(e=>showToast('Výsledek nebyl zapsán do školní kroniky: '+e.message));
    }
  }
  function updateUI() {
    ui.score.textContent = fmt(state.score);
    ui.best.textContent = fmt(Math.max(personalTop(), state.score));
    ui.leader.textContent = fmt(Math.max(recordTop(), state.score));
    const goal = state.recordBaseline || 100;
    const pct = Math.min(100,Math.round((state.score/goal)*100));
    ui.progress.textContent = `${pct} %`; ui.progressFill.style.width = pct + '%';
    ui.modeLabel.textContent = state.mode === 'ruins' ? 'ZKOUŠKA RUIN' : 'KLASICKÁ ZKOUŠKA';
    ui.status.classList.toggle('playing',state.phase==='playing');
    ui.boardStatus.textContent = {
      ready:'STRÁŽCE SPÍ', playing:'STRÁŽCE SE POHYBUJE', paused:'ČAS SE ZASTAVIL',
      over:'ZKOUŠKA SKONČILA',victory:'KOMNATA POKOŘENA'
    }[state.phase];
    ui.pause.disabled = !(state.phase==='playing'||state.phase==='paused');
    ui.pause.textContent = state.phase==='paused' ? '▶  Pokračovat' : 'Ⅱ  Pauza';
    ui.pauseMobile.textContent = state.phase==='paused' ? '▶ Pokračovat' : 'Ⅱ Pozastavit';
    ui.pauseMobile.disabled = !(state.phase==='playing'||state.phase==='paused');
    ui.classic.classList.toggle('selected',state.mode==='classic');
    ui.ruins.classList.toggle('selected',state.mode==='ruins');
    ui.classic.setAttribute('aria-pressed',String(state.mode==='classic'));
    ui.ruins.setAttribute('aria-pressed',String(state.mode==='ruins'));
    ui.classic.disabled = state.phase==='playing' || state.phase==='paused';
    ui.ruins.disabled = state.phase==='playing' || state.phase==='paused';
    renderLeaderboard();
  }
  function renderLeaderboard() {
    ui.leaderboard.replaceChildren();
    const listing=state.mode==='classic'&&cloudLeaders?cloudLeaders:records[state.mode];
    if (!listing.length) {
      const empty = document.createElement('li'); empty.className = 'empty-record';
      empty.textContent = 'Zatím žádný záznam. První místo čeká!'; ui.leaderboard.append(empty); return;
    }
    for (const [i, record] of listing.entries()) {
      const li = document.createElement('li');
      const rank = document.createElement('span'); rank.className='rank'; rank.textContent = `0${i+1}`;
      const name = document.createElement('span'); name.className='record-name'; name.textContent=record.name;
      const score = document.createElement('span'); score.className='record-score'; score.textContent=fmt(record.score);
      li.append(rank,name,score); ui.leaderboard.append(li);
    }
  }
  function addParticles(pos,color,count) {
    for (let i=0;i<count;i++) {
      const a=Math.random()*Math.PI*2, speed=1+Math.random()*4;
      state.particles.push({x:pos.x+.5,y:pos.y+.5,vx:Math.cos(a)*speed,
        vy:Math.sin(a)*speed,color,life:450+Math.random()*420,maxLife:850,radius:1+Math.random()*2.6});
    }
  }
  function showToast(message) {
    ui.toast.textContent = message; ui.toast.classList.add('visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>ui.toast.classList.remove('visible'),3100);
  }
  function playSound(which) {
    if (!soundOn) return;
    try {
      const AC=window.AudioContext||window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state==='suspended') audioCtx.resume();
      const now=audioCtx.currentTime;
      const frequencies={start:[300,400,500],eat:[650,850],rare:[480,720,960,1160],lose:[210,150,105]}[which]||[500];
      frequencies.forEach((freq,i)=>{
        const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
        osc.type=which==='lose'?'sawtooth':'sine';
        osc.frequency.setValueAtTime(freq,now+i*.072);
        gain.gain.setValueAtTime(.00001,now+i*.072);
        gain.gain.exponentialRampToValueAtTime(.055,now+i*.072+.015);
        gain.gain.exponentialRampToValueAtTime(.00001,now+i*.072+.15);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now+i*.072); osc.stop(now+i*.072+.16);
      });
    } catch { /* Sound is optional; never interrupt play. */ }
  }
  function syncSound() {
    ui.sound.setAttribute('aria-pressed',String(soundOn));
    ui.sound.setAttribute('aria-label',soundOn?'Vypnout zvuky':'Zapnout zvuky');
    ui.soundGlyph.textContent=soundOn?'♫':'♪';
    ui.soundLabel.textContent=soundOn?'ZVUK ZAPNUT':'ZVUK VYPNUT';
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const side = Math.round(Math.min(rect.width, rect.height));
    if (!side) return;
    const dpr = Math.min(window.devicePixelRatio || 1,2);
    if (side === renderSize && dpr === renderDpr) return;
    renderSize = side; renderDpr = dpr;
    canvas.width = Math.round(side*dpr); canvas.height = Math.round(side*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function drawBoard(tile) {
    const size = tile * GRID;
    const bg = ctx.createLinearGradient(0, 0, size, size);
    bg.addColorStop(0, '#20241e'); bg.addColorStop(.5, '#18221d'); bg.addColorStop(1, '#0e1614');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, size, size);
    // Each chess-like tile is a worn, weathered block from the castle floor.
    for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
      const p = hash(x,y), left=x*tile, top=y*tile;
      const warm = p>.64 ? 'rgba(143,127,98,.105)' : p<.25 ? 'rgba(5,11,10,.24)' : 'rgba(62,76,63,.06)';
      ctx.fillStyle = warm;
      ctx.fillRect(left+tile*.038,top+tile*.038,tile*.925,tile*.925);
      ctx.strokeStyle = 'rgba(5,9,7,.51)'; ctx.lineWidth = Math.max(1, tile*.043);
      ctx.strokeRect(left+tile*.025,top+tile*.025,tile*.95,tile*.95);
      ctx.strokeStyle = 'rgba(180,153,101,.045)'; ctx.lineWidth = Math.max(.5,tile*.02);
      ctx.beginPath();ctx.moveTo(left+tile*.07,top+tile*.08);ctx.lineTo(left+tile*.85,top+tile*.08);ctx.stroke();
      if (p > .84) {
        ctx.strokeStyle = 'rgba(10,13,11,.25)';ctx.lineWidth=Math.max(.6,tile*.023);
        ctx.beginPath();ctx.moveTo(left+tile*.08,top+tile*.23);
        ctx.lineTo(left+tile*(.24+p*.2),top+tile*.49);
        ctx.lineTo(left+tile*.73,top+tile*(.42+p*.25));ctx.stroke();
      }
      if (p > .985) {ctx.fillStyle='rgba(160,139,91,.2)';ctx.fillRect(left+tile*.24,top+tile*.72,2,2);}
    }
    // A faded serpent-circle seal on ancient floor beneath gameplay.
    ctx.save();ctx.translate(size*.51,size*.50);
    ctx.strokeStyle='rgba(172,151,88,.075)';ctx.lineWidth=Math.max(1,tile*.12);
    ctx.beginPath();ctx.arc(0,0,size*.26,0,Math.PI*2);ctx.stroke();
    ctx.lineWidth=Math.max(1,tile*.05);
    ctx.beginPath();ctx.arc(0,0,size*.235,0,Math.PI*2);ctx.stroke();
    for(let n=0;n<12;n++){
      const a=n*Math.PI/6, r=size*.25;
      ctx.save();ctx.translate(Math.cos(a)*r,Math.sin(a)*r);ctx.rotate(a+Math.PI/2);
      ctx.beginPath();ctx.moveTo(-tile*.13,0);ctx.lineTo(0,-tile*.21);ctx.lineTo(tile*.13,0);
      ctx.stroke();ctx.restore();
    }
    ctx.restore();
    // Inset antique brass border and atmospheric vignette.
    ctx.strokeStyle='rgba(181,146,84,.34)';ctx.lineWidth=Math.max(1,tile*.072);
    ctx.strokeRect(tile*.13,tile*.13,size-tile*.26,size-tile*.26);
    const shade=ctx.createRadialGradient(size*.5,size*.45,size*.12,size*.5,size*.5,size*.68);
    shade.addColorStop(0,'rgba(0,0,0,0)');shade.addColorStop(1,'rgba(0,0,0,.55)');
    ctx.fillStyle=shade;ctx.fillRect(0,0,size,size);
  }
  function drawObstacles(tile) {
    for (const {x,y} of state.obstacles) {
      const px=x*tile,py=y*tile;
      ctx.fillStyle='#080f0d';ctx.fillRect(px+tile*.06,py+tile*.09,tile*.92,tile*.92);
      ctx.fillStyle='#45483c';ctx.fillRect(px+tile*.08,py+tile*.05,tile*.83,tile*.79);
      ctx.fillStyle='#66654e';ctx.fillRect(px+tile*.13,py+tile*.08,tile*.72,tile*.14);
      ctx.fillStyle='#2b3930';ctx.fillRect(px+tile*.13,py+tile*.23,tile*.72,tile*.55);
      ctx.strokeStyle='rgba(188,153,91,.42)';ctx.strokeRect(px+tile*.17,py+tile*.17,tile*.65,tile*.57);
      ctx.beginPath();ctx.moveTo(px+tile*.25,py+tile*.34);ctx.lineTo(px+tile*.61,py+tile*.56);ctx.lineTo(px+tile*.75,py+tile*.43);ctx.strokeStyle='#182820';ctx.lineWidth=1.3;ctx.stroke();
    }
  }
  function drawRune(food,tile,time,rare) {
    if (!food) return;
    const cx=(food.x+.5)*tile, cy=(food.y+.5)*tile;
    const pulse=.90+.09*Math.sin(time*(rare?.006:.004));
    ctx.save(); ctx.translate(cx,cy); ctx.scale(pulse,pulse);
    const radius=tile*(rare?.83:.66);
    const glow=ctx.createRadialGradient(0,0,1,0,0,radius);
    glow.addColorStop(0,rare?'rgba(153,98,241,.46)':'rgba(245,196,91,.47)');
    glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;
    ctx.fillRect(-radius,-radius,radius*2,radius*2);
    if (rare) {
      ctx.rotate(Math.sin(time*.001)*.13);
      ctx.beginPath();ctx.moveTo(0,-tile*.41);ctx.lineTo(tile*.3,-tile*.09);
      ctx.lineTo(tile*.24,tile*.24);ctx.lineTo(0,tile*.43);ctx.lineTo(-tile*.27,tile*.2);
      ctx.lineTo(-tile*.3,-tile*.07);ctx.closePath();
      ctx.fillStyle='#5b448d';ctx.strokeStyle='#e3c9ff';ctx.lineWidth=tile*.07;ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,-tile*.41);ctx.lineTo(0,tile*.43);ctx.moveTo(-tile*.3,-tile*.07);ctx.lineTo(tile*.3,-tile*.09);ctx.lineTo(0,tile*.1);ctx.closePath();ctx.strokeStyle='#d1b4f6';ctx.lineWidth=1.3;ctx.stroke();
    } else {
      ctx.rotate(Math.PI/4);
      ctx.fillStyle='#ca9950';ctx.strokeStyle='#ffe2a6';ctx.lineWidth=tile*.07;
      ctx.fillRect(-tile*.23,-tile*.23,tile*.46,tile*.46);
      ctx.strokeRect(-tile*.23,-tile*.23,tile*.46,tile*.46);
      ctx.rotate(-Math.PI/4);
      ctx.strokeStyle='#45391e';ctx.lineWidth=tile*.075;ctx.beginPath();
      ctx.moveTo(0,-tile*.2);ctx.lineTo(0,tile*.2);ctx.moveTo(-tile*.17,0);ctx.lineTo(tile*.17,0);ctx.stroke();
      ctx.fillStyle='#fff2ce';ctx.beginPath();ctx.arc(-tile*.11,-tile*.13,tile*.052,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  // A continuous scaly body and the actual illustrated basilisk head.
  // Gameplay still uses the same 21x21 grid; only the rendering has changed.
  function drawSnake(tile,time) {
    if (!state.snake.length) return;
    const points=state.snake;
    ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
    ctx.beginPath();
    points.forEach((p,i)=>{
      const x=(p.x+.5)*tile,y=(p.y+.5)*tile;
      if (i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    });
    ctx.shadowColor='#000';ctx.shadowBlur=tile*.42;ctx.shadowOffsetY=tile*.12;
    ctx.strokeStyle='#101b14';ctx.lineWidth=tile*.82;ctx.stroke();
    ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    ctx.strokeStyle='#5a7848';ctx.lineWidth=tile*.68;ctx.stroke();
    ctx.strokeStyle='#789552';ctx.lineWidth=tile*.37;ctx.stroke();
    for(let i=1;i<points.length;i++) {
      const p=points[i],cx=(p.x+.5)*tile,cy=(p.y+.5)*tile;
      const endScale=i===points.length-1?.55:1;
      ctx.save();ctx.translate(cx,cy);
      ctx.fillStyle=i%2?'#63814a':'#72915a';
      ctx.beginPath();ctx.ellipse(0,0,tile*.30*endScale,tile*.30*endScale,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#344d31';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(-tile*.13,-tile*.14);ctx.lineTo(0,-tile*.04);
      ctx.lineTo(tile*.13,-tile*.14);ctx.stroke();
      ctx.fillStyle='rgba(218,199,110,.29)';
      ctx.beginPath();ctx.arc(0,tile*.05,tile*.08,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    const h=points[0],x=(h.x+.5)*tile,y=(h.y+.5)*tile;
    const angle=state.direction.x===1?0:state.direction.x===-1?Math.PI:state.direction.y===-1?-Math.PI/2:Math.PI/2;
    ctx.translate(x,y);ctx.rotate(angle);
    // Eyes, frilled hood and jaw make the head read as a basilisk, not a square.
    ctx.fillStyle='#2b5138';ctx.beginPath();ctx.ellipse(-tile*.13,0,tile*.38,tile*.42,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#a7b875';ctx.lineWidth=tile*.06;ctx.beginPath();
    ctx.moveTo(-tile*.26,-tile*.31);ctx.lineTo(-tile*.36,-tile*.44);
    ctx.moveTo(-tile*.26,tile*.31);ctx.lineTo(-tile*.36,tile*.44);ctx.stroke();
    ctx.fillStyle='#668c52';ctx.beginPath();ctx.ellipse(tile*.07,0,tile*.43,tile*.30,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#a5b86b';ctx.beginPath();ctx.ellipse(tile*.2,0,tile*.25,tile*.22,0,0,Math.PI*2);ctx.fill();
    for(const sy of [-1,1]){
      ctx.fillStyle='#edcb65';ctx.beginPath();ctx.ellipse(tile*.20,sy*tile*.19,tile*.079,tile*.064,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#171915';ctx.fillRect(tile*.2-tile*.015,sy*tile*.19-tile*.045,tile*.03,tile*.09);
    }
    ctx.fillStyle='#3c5732';ctx.beginPath();ctx.arc(tile*.41,-tile*.07,tile*.03,0,Math.PI*2);ctx.arc(tile*.41,tile*.07,tile*.03,0,Math.PI*2);ctx.fill();
    if (state.phase==='playing' && Math.sin(time*.008)>.1) {
      ctx.strokeStyle='#db7c6f';ctx.lineWidth=tile*.055;ctx.beginPath();ctx.moveTo(tile*.44,0);
      ctx.lineTo(tile*.62,0);ctx.lineTo(tile*.72,-tile*.065);ctx.moveTo(tile*.62,0);ctx.lineTo(tile*.72,tile*.065);ctx.stroke();
    }
    ctx.restore();
  }
  function drawParticles(tile,dt) {
    state.particles = state.particles.filter(p=>p.life>0);
    for(const p of state.particles){
      p.life-=dt;p.x+=p.vx*dt/1000;p.y+=p.vy*dt/1000;
      ctx.globalAlpha=Math.max(0,p.life/p.maxLife);
      ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x*tile,p.y*tile,p.radius,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
  }
  function render(now,dt) {
    resizeCanvas(); if(!renderSize)return;
    const tile=renderSize/GRID;
    ctx.clearRect(0,0,renderSize,renderSize);
    drawBoard(tile);
    drawObstacles(tile);
    drawRune(state.food,tile,now,false);
    drawRune(state.rare,tile,now,true);
    drawSnake(tile,now);
    drawParticles(tile,dt);
  }
  function animationFrame(now) {
    let dt=state.lastFrame?Math.min(now-state.lastFrame,80):16;
    state.lastFrame=now;
    if(state.phase==='playing') {
      state.elapsed += dt; state.tickAccum += dt;
      if (state.rare && state.elapsed>=state.rare.expires) state.rare=null;
      let limit=0;
      while(state.tickAccum >= currentTickMs() && state.phase==='playing' && limit++<4) {
        state.tickAccum-=currentTickMs(); step();
      }
    }
    render(now,dt);
    requestAnimationFrame(animationFrame);
  }
  function switchMode(mode) {
    if (!['classic','ruins'].includes(mode) || state.phase==='playing' || state.phase==='paused') return;
    if (state.mode===mode) return;
    state.mode=mode;
    readyGame();showToast(mode==='ruins'?'Ruiny: pozor na kamenné pilíře!':'Klasika: volné herní pole.');
  }
  ui.overlayButton.addEventListener('click',()=>state.phase==='paused'?resume():start());
  ui.pause.addEventListener('click',togglePause);
  ui.pauseMobile.addEventListener('click',togglePause);
  ui.restart.addEventListener('click',start);
  ui.classic.addEventListener('click',()=>switchMode('classic'));
  ui.ruins.addEventListener('click',()=>switchMode('ruins'));
  ui.name.value = typeof safeRead(NAME_STORAGE,'') === 'string' ? safeRead(NAME_STORAGE,'') : '';
  ui.name.addEventListener('input',()=>{safeWrite(NAME_STORAGE,ui.name.value);updateUI();});
  ui.sound.addEventListener('click',()=>{ soundOn=!soundOn;safeWrite(SOUND_STORAGE,soundOn);syncSound();if(soundOn)playSound('start'); });
  document.querySelectorAll('[data-dir]').forEach(button=>{
    button.addEventListener('click',()=>changeDirection(DIRS[button.dataset.dir]));
  });
  window.addEventListener('keydown',event=>{
    const target=event.target;
    if(target instanceof HTMLElement && (target.matches('input,textarea,select') || target.isContentEditable))return;
    const key=event.key.toLowerCase();
    const map={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'};
    if (map[key]) {event.preventDefault();changeDirection(DIRS[map[key]]);return;}
    if(key===' ' || key==='p') {
      event.preventDefault();
      if(state.phase==='ready'||state.phase==='over'||state.phase==='victory')start();
      else togglePause();
    }
    if(key==='enter' && ['ready','over','victory'].includes(state.phase)){
      event.preventDefault();start();
    }
  });
  let pointerStart=null;
  canvas.addEventListener('pointerdown',event=>{
    pointerStart={x:event.clientX,y:event.clientY};
  });
  canvas.addEventListener('pointerup',event=>{
    if(!pointerStart)return;
    const dx=event.clientX-pointerStart.x,dy=event.clientY-pointerStart.y;
    pointerStart=null;
    if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;
    changeDirection(DIRS[Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up')]);
  });
  canvas.addEventListener('pointercancel',()=>{pointerStart=null;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.phase==='playing')pause();});
  window.addEventListener('resize',()=>{renderSize=0;});
  syncSound();readyGame();refreshCloud();requestAnimationFrame(animationFrame);
})();
