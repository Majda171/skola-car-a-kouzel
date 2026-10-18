/* v451 – zachová databázové přechody v450_nick_step; přirozené dialogy a postupný příchod duchů. */
(()=>{'use strict';
 const path=(location.pathname.split('/').pop()||'').toLowerCase(),isNick=path==='nickova-oslava.html',isKitchen=path==='kuchyne.html',isCellar=path==='chodby-podzemni-2.html';if(!isNick&&!isKitchen&&!isCellar)return;
 const client=window.BradaviceDB?.client,stage=document.getElementById('nickScene'),dobby=document.getElementById('v450Dobby');
 let state='not-started',pending=false,guestsShown=false;
 const music=new Audio('audio/nick-oslava-v450.mp3');music.loop=true;music.volume=.32;
 function modal(title,text,actions){
  const overlay=document.createElement('div');overlay.className='v450-dialog-shade';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',title);
  const box=document.createElement('section'),h=document.createElement('h2'),p=document.createElement('p'),buttons=document.createElement('div');box.className='v450-dialog';buttons.className='v450-dialog-actions';h.textContent=title;p.textContent=text;
  actions.forEach(([label,fn])=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=()=>{overlay.remove();fn?.()};buttons.append(b)});
  box.append(h,p);if(title==='Dobby'&&/plesniv|tác|zkažen/.test(text)){const platter=document.createElement('img');platter.src='img/nick-zkazene-jidlo-v450.webp';platter.alt='Podnos plesnivého jídla';platter.className='v450-food-preview';box.append(platter)}box.append(buttons);overlay.append(box);document.body.append(overlay);buttons.firstElementChild?.focus({preventScroll:true});overlay.onclick=e=>{if(e.target===overlay)overlay.remove()};overlay.addEventListener('keydown',e=>{if(e.key==='Escape')overlay.remove()})
 }
 function guests(arriving){if(!isNick||guestsShown)return;guestsShown=true;const layer=document.getElementById('v451PartyGuests');if(!layer)return;
  const images=['ghost-seda-dama.webp','ghost-mnich.webp','ghost-krvavy-baron.webp','ghost-protiva.webp','ufnukana-ursula-v451.webp'];
  images.forEach((src,i)=>{const img=document.createElement('img');img.className='v451-party-ghost'+(arriving?'':' v451-resident');img.alt='';img.src='img/'+src;img.style.animationDelay=arriving?`${1.3+i*2.2}s,${5.1+i*2.2}s`:'0s,0s';layer.append(img)});
 }
 async function refresh(){if(!client){state='offline';paint();return}try{const {data,error}=await client.rpc('v450_nick_status');if(error)throw error;state=data||'not-started'}catch(e){state='offline';console.info('Nickův úkol čeká na SQL pro v450:',e?.message)}paint()}
 async function move(action){if(!client||pending)return;pending=true;try{const {data,error}=await client.rpc('v450_nick_step',{p_action:action});if(error)throw error;state=data;paint(action==='finish');window.dispatchEvent(new Event('bradavice:nick-updated'))}catch(e){modal('Školní evidence úkolů','Nepodařilo se uložit postup do Supabase. Nic se nezměnilo. '+(e.message||''),[['Rozumím',null]])}finally{pending=false}}
 function celebrate(arriving=false){if(!isNick)return;stage.classList.add('v450-celebration');document.getElementById('nickSceneHint').textContent='Slavnostní tabule se zaplnila. Do síně připlouvají duchové a hudba zve k oslavě.';
  const button=document.getElementById('nickMusic');button.hidden=false;button.textContent='♪ Zapnout hudbu oslavy';guests(arriving);
  const play=music.play();play?.then?.(()=>button.textContent='♫ Ztlumit hudbu').catch?.(()=>{button.textContent='♪ Zapnout hudbu oslavy'})
 }
 function paint(arriving=false){if(isNick){if(state==='completed'){celebrate(arriving)}else{stage?.classList.remove('v450-celebration');const e=document.getElementById('nickSceneHint');if(e)e.textContent=state==='food'?'V batohu máš zkažené jídlo. Nick bude mít radost.':state==='accepted'?'Oslava se blíží a Nick se stále trochu strachuje.':'Starobylá síň čeká na svůj podivný slavnostní večer.'}}
  if(isKitchen&&dobby)dobby.hidden=!document.getElementById('kitchenScene')?.classList.contains('open')}
 function beginNick(){modal('Skorobezhlavý Nick','„Á, mladý student! Je mi ctí. Právě připravuji oslavu pětistého výročí svého úmrtí. Představ si, zemřel jsem jednatřicátého října roku 1492. Dorazí duchové z celé země! Jenže… slavnostní stůl je dosud zoufale prázdný.“',[['Proč slavíte své úmrtí?',()=>modal('Nick','„Smrt je pro ducha poněkud zásadním mezníkem. A pět set let si zaslouží velkolepou slavnost! Doufám, že přijde i sir Patrick Delaney-Podmore a jeho Hon bezhlavých… Přestože mě stále odmítají přijmout.“',[['A co občerstvení?',offerNick],['To musí být nepříjemné',()=>modal('Nick','„Má hlava je prý příliš pevně připojena. Jen ten nepatrný kousek kůže a šlach! Považuješ to za spravedlivé?“',[['Snad letos změní názor',offerNick],['Rozloučit se',null]])]])],['Potřebujete s něčím pomoct?',offerNick],['Promluvíme si později',null]])}
 function offerNick(){modal('Nick','„Pro duchy není čerstvá hostina k ničemu. Potřebujeme něco opravdu zkaženého – tak prohnilého, aby se k nám dostala alespoň vzpomínka na chuť. Jen netuším, zda to zvládnu připravit včas.“',[['Rád ti s přípravou pomohu',()=>move('start')],['Teď ne',null]])}
 function nickConversation(){if(state==='offline')return modal('Úkol ještě není připravený','Nejdřív spolu nastavíme SQL pro Nickův úkol v Supabase. Nyní by se jeho postup bezpečně neuložil.',[['Zavřít',null]]);
  if(state==='not-started')return beginNick();
  if(state==='accepted')return modal('Skorobezhlavý Nick','„Ale, už jsi zpátky? Výborně! Co mi neseš?“', [['Zatím nic…',()=>modal('Nick','„Ach, to je mrzuté. A já už doufal, že naše slavnostní tabule nebude prázdná. Možná by ses mohl porozhlédnout ve školní kuchyni… tam se občas najde jídlo, které už nikdo živý nechce.“',[['Zkusím se porozhlédnout',null],['Proč zkažené jídlo?',()=>modal('Nick','„Duchové nedokážou jíst jako živí. Ale hnilobou prostoupené pokrmy nám aspoň vzdáleně připomenou někdejší chuť.“',[['Rozumím',null]])]])], ['Ještě hledám',null]]);
  if(state==='food')return modal('Skorobezhlavý Nick','„Při všech svatých! To je vůně rozkladu! Tohle bude nejlepší hostina za posledních pět století. Položíš jídlo na stůl?“',[['Předat zkažené jídlo',()=>move('finish')],['Ještě chvíli počkat',null]]);
  return modal('Skorobezhlavý Nick','„Jak nádherná oslava! Sir Patrick možná ani letos nezmění názor, ale podívej, kolik duchů přišlo. A jak jsem slíbil: ve sklepení jsou staré průchody skryté za stěnami a portréty. Děkuji ti, příteli!“',[['Děkuji, sire Nicholasi',null]])
 }
 function dobbyMenu(){if(state==='offline')return modal('Dobby','„Dobby by velmi rád pomohl, ale školní evidence úkolů teď neodpovídá, pane či slečno!“',[['Rozumím',null]]);
  return modal('Dobby','„Dobby vás vítá ve školní kuchyni! Jak vám může Dobby posloužit, pane či slečno? Dobby vám rád pomůže se vším, co je v jeho silách!“',[
   ['Můžeš mi povědět o kuchyni?',()=>modal('Dobby','„Domácí skřítkové tady připravují dobroty pro celý hrad. A když se někdo dostane dovnitř, Dobby má radost, že jej může přivítat!“',[['Zeptat se na jídlo',dobbyFood],['Poděkovat',null]])],
   ['Sháním občerstvení pro ducha',dobbyFood],['Děkuji, Dobby',null]
  ])
 }
 function dobbyFood(){if(state==='not-started')return modal('Dobby','„Pro ducha, pane? To je zvláštní! Dobby zaslechl, že sir Nicholas chystá oslavu. Možná by bylo dobré si s ním nejdříve promluvit.“',[['Poděkovat',null]]);
  if(state==='accepted')return modal('Dobby','„Pro Skorobezhlavého Nicka? Dobby ví přesně, co duchům chutná! V komoře zůstalo plesnivé pečivo, shnilé ovoce a ryba, která už tři týdny nevoní. Dobby to samozřejmě nedává živým studentům!“',[['To zní dokonale, převezmu tác',()=>move('take_food')],['Jak to, že takové jídlo máte?',()=>modal('Dobby','„Dobby nic nevyhazuje, dokud si není jistý, že se to nebude hodit některému z duchů. Pro pana Nicka je Dobby velmi rád uschoval!“',[['Převzít tác',()=>move('take_food')],['Vrátím se později',null]])],['Zatím ne',null]]);
  if(state==='food')return modal('Dobby','„Dobby vám tác už dal. Doufám, že pan Nick bude potěšen! Takových hostin Dobby ještě mnoho nepřipravoval.“',[['Poděkovat',null]]);
  return modal('Dobby','„Dobby slyšel, že oslava dopadla překrásně! Dobby je tak šťastný, že mohl pomoci!“',[['Poděkovat',null]])
 }
 if(isNick||isCellar){document.getElementById('nickGhost')?.addEventListener('click',nickConversation);document.getElementById('nickTalk')?.addEventListener('click',nickConversation);document.getElementById('nickMusic')?.addEventListener('click',()=>{if(music.paused){music.play().then(()=>document.getElementById('nickMusic').textContent='♫ Ztlumit hudbu').catch(()=>{})}else{music.pause();document.getElementById('nickMusic').textContent='♪ Zapnout hudbu oslavy'}})}
 if(isKitchen&&dobby){dobby.addEventListener('click',dobbyMenu);const scene=document.getElementById('kitchenScene');if(scene){const observer=new MutationObserver(()=>{dobby.hidden=!scene.classList.contains('open')});observer.observe(scene,{attributes:true,attributeFilter:['class']})}}
 window.addEventListener('pagehide',()=>{music.pause();music.currentTime=0});refresh();
})();
