/* Bradavice: tři samostatné interaktivní věštby, kompletní tarot 78 karet, bez API. */
(()=>{'use strict';
 const opener=document.getElementById('divinationStart'),teacher=document.getElementById('trelawney');if(!opener||!teacher)return;
 const folder='img/divination-v472/';
 const media={neutral:'trelawney-dramatic.webp',positive:'trelawney-happy.webp',negative:'trelawney-sad.webp'};
 const quotes={neutral:['„Mlhy se rozestupují… a co v nich spatřím, je vskutku neobyčejné!“','„Nesmíš přehlédnout ani nejmenší znamení, drahé dítě!“'],positive:['„Ach, jak zářivá budoucnost! Kéž by taková čekala nás všechny!“','„Vidím světlo! Štěstí tě možná navštíví zcela nečekaně!“'],negative:['„Ó, ne! Toto znamení… přála bych si, abych ho dnes nespatřila!“','„Něco temného se blíží. Však víš, věštby nejsou vždy radostné…“']};
 let shade,panel,main,face,speech,mode='',deck=[],turn=0,picked=[],question='';
 const music=new Audio('audio/jasnovidectvi-witches-cauldron.mp3');music.loop=true;music.volume=.24;
 // Hudba je součástí prostředí učebny, ne samostatně zapínaný efekt výkladu.
 // Prohlížeče někdy blokují automatické přehrávání před prvním gestem hráče.
 function startAmbient(){if(music.paused)music.play().catch(()=>{});}
 startAmbient();
 document.addEventListener('pointerdown',startAmbient,{passive:true});
 document.addEventListener('keydown',startAmbient);
 const shuffle=new Audio('audio/jasnovidectvi-michani-karet.mp3');shuffle.volume=.52;
 const pick=a=>a[Math.floor(Math.random()*a.length)];
 const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
 function say(tone='neutral',quote){face.src=folder+media[tone];speech.textContent=quote||pick(quotes[tone]);}
 function button(label,callback,root=main){const b=el('button','dv472-btn',label);b.type='button';b.addEventListener('click',callback);root.append(b);return b;}
 function close(){shade?.remove();shade=null;shuffle.pause();}
 function setup(){close();shade=el('div','dv472-overlay');shade.setAttribute('role','dialog');shade.setAttribute('aria-modal','true');shade.setAttribute('aria-label','Výklad profesorky Trelawneyové');panel=el('section','dv472-panel');main=el('div','dv472-main');const aside=el('aside','dv472-teacher');face=el('img');face.alt='Profesorka Trelawneyová';speech=el('blockquote');aside.append(face,speech);const x=el('button','dv472-close','×');x.type='button';x.setAttribute('aria-label','Zavřít věštění');x.onclick=close;panel.append(main,aside,x);shade.append(panel);document.body.append(shade);shade.addEventListener('pointerdown',e=>{if(e.target===shade)close()});say();}
 function title(s){main.append(el('h2','',s))}function p(s){main.append(el('p','',s))}function clear(){main.replaceChildren()}function actions(){return main.appendChild(el('div','dv472-actions'))}
 function result(titleText,content,tone){clear();title(titleText);say(tone);const pap=el('div','dv472-parchment',content);main.append(pap);const a=actions();button('Další věštba',menu,a);button('Ukončit výklad',close,a);save(titleText,content);}
 function save(name,text){try{const k='bradavice-vestby-v472',all=JSON.parse(localStorage.getItem(k)||'[]');all.unshift({date:new Date().toISOString(),name,text});localStorage.setItem(k,JSON.stringify(all.slice(0,16)))}catch{}}
 function menu(){mode='menu';clear();title('Učebna jasnovidectví');p('„Co dnes chceš spatřit? Ne všechny odpovědi potěší, drahé dítě…“');const a=actions();button('Křišťálová koule',crystal,a);button('Čajová sedlina',tea,a);button('Tarot na tři karty',tarot,a);p('Výklady jsou součástí kouzelnické hry, nikoli skutečné předpovědi.');try{const saved=JSON.parse(localStorage.getItem('bradavice-vestby-v472')||'[]');if(saved.length){const h=el('details','dv472-history');h.append(el('summary','','Můj věštecký deník'));for(const x of saved.slice(0,8)){const entry=el('div','dv472-entry');entry.append(el('small','',new Date(x.date).toLocaleDateString('cs-CZ')+' · '+x.name),el('div','',x.text));h.append(entry)}main.append(h)}}catch{}}
 function crystal(){mode='crystal';clear();title('Pohlédni do křišťálové koule');p('Prstem nebo myší odhrň mlhu z koule.');const wrap=el('div','dv472-object'),img=el('img');img.src=folder+'crystal.webp';img.alt='Křišťálová koule';const sign=pick([
  ['Mlha houstne a na okamžik v ní rozeznáš dvě postavy stojící proti sobě. Trelawneyová se nakloní blíž: „Přichází rozhovor, kterému se už dlouho vyhýbáš. Vyslechni druhého dřív, než odpovíš.“','neutral'],
  ['V hloubi skla se mihne osvětlená chodba, která se za dalším rohem ztrácí. „Vidím možnost, o níž zatím nemáš tušení,“ zašeptá profesorka. „Nepřichází sama; budeš se muset rozhodnout, zda do ní vstoupíš.“','positive'],
  ['Obraz v kouli ztmavne. Z dálky doléhají kroky, ale nikdo nepřichází. „Něco podstatného ti uniká,“ řekne Trelawneyová nezvykle vážně. „Než učiníš další krok, vrať se k tomu, co jsi přehlédl.“','negative'],
  ['Ve skle se vynoří staré zavřené dveře. Pomalu se pohnou, ale jejich druhá strana zůstává nejasná. „Změna je na dosah, drahé dítě. Ne každé otevření však znamená únik — někdy je to začátek odpovědnosti.“','neutral'],
  ['Mlha se stáhne do temného víru a pak náhle prořídne. „To, čeho se obáváš, nemusí dopadnout tak, jak sis představoval,“ usměje se profesorka. „Získej nejprve odvahu zeptat se.“','positive']
 ]);wrap.append(img);const canvas=el('canvas','dv472-mist');wrap.append(canvas);main.append(wrap);const ctx=canvas.getContext('2d'),n=330;canvas.width=n;canvas.height=n;ctx.fillStyle='rgba(188,171,217,.94)';ctx.fillRect(0,0,n,n);let count=0,drawing=false,done=false;const reveal=()=>{if(done)return;done=true;canvas.style.opacity='.02';say(sign[1]);setTimeout(()=>result('Co odhalila křišťálová koule',sign[0],sign[1]),1300)};function stroke(e){if(!drawing||done)return;const r=canvas.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*n,y=(e.clientY-r.top)/r.height*n;ctx.globalCompositeOperation='destination-out';ctx.beginPath();ctx.arc(x,y,25,0,Math.PI*2);ctx.fill();if(++count>40)reveal()};canvas.addEventListener('pointerdown',e=>{drawing=true;canvas.setPointerCapture(e.pointerId);stroke(e)});canvas.addEventListener('pointermove',stroke);canvas.addEventListener('pointerup',()=>drawing=false);const a=actions();button('Odhalit výjev',reveal,a);button('Zpět',menu,a);}
 function tea(){mode='tea';clear();title('Věštění z čajové sedliny');p('Roztoč šálek a pozorně se podívej, co se v něm rýsuje.');const img=el('img','dv472-tea');const shapes=[['V sedlině se podobá tvar ptáku.','Zpráva z dálky možná změní tvé plány.','neutral'],['Ve shluku lístků vidíš velikého psa.','Tvé obavy mohou mít větší stín než skutečnou moc.','negative'],['Sedlina připomíná cestu.','Nová příležitost se otevře, když uděláš první krok.','positive']];const idx=Math.floor(Math.random()*3),omen=shapes[idx];img.src=folder+['tea-one.webp','tea-two.webp','tea-three.webp'][idx];img.alt='Šálek s čajovou sedlinou';main.append(img);let spun=false;function spin(){if(spun)return;spun=true;img.classList.add('spin');setTimeout(()=>{p('Co v sedlině rozeznáváš?');const a=actions();for(const label of ['Pták','Pes','Cesta'])button(label,()=>{say(omen[2]);result('Výklad čajových lístků',omen[1]+' '+(label===['Pták','Pes','Cesta'][idx]?'Tvůj bystrý zrak zachytil znamení správně.':'Někdy se znamení ukáže jinak, než čekáme.'),omen[2])},a)},680)}img.addEventListener('click',spin);const a=actions();button('Otočit šálkem',spin,a);button('Zpět',menu,a);}
 const majorMeaning=[
  'odvaha vykročit do neznáma, ale také riziko přílišné důvěřivosti',
  'schopnost převzít iniciativu a využít to, co už máš k dispozici',
  'intuice, mlčení a odpověď skrytá pod povrchem',
  'růst, péče a něco, co potřebuje čas, aby dozrálo',
  'hranice, pevné rozhodnutí a zodpovědnost za vlastní kroky',
  'rady, tradice a nutnost rozhodnout, komu naslouchat',
  'volba mezi dvěma cestami a věrnost tomu, co opravdu cítíš',
  'odhodlání jít kupředu, i když okolnosti nejsou snadné',
  'pravda, spravedlivé důsledky a potřeba jednat čestně',
  'samota potřebná k nalezení vlastní odpovědi',
  'obrat okolností, který nelze celý naplánovat',
  'trpělivá odvaha a síla zachovat klid',
  'zastavení, které dovolí spatřit problém z jiné strany',
  'konec jedné etapy a prostor pro nový začátek',
  'umírněnost a hledání rovnováhy mezi krajnostmi',
  'pokušení, svazující návyk nebo slib s nepříjemnou cenou',
  'náhlé zboření iluzí, po kterém je možné stavět poctivěji',
  'tichá naděje a postupné zotavení po těžkém období',
  'nejistota, silné sny a skutečnost, kterou zatím nevidíš celou',
  'radost, otevřenost a příležitost přestat o sobě pochybovat',
  'probuzení, zásadní uvědomění a rozhodnutí nic dál neodkládat',
  'dovršení dlouhé cesty a možnost posunout se o úroveň dál'
 ];
 const suitMeaning={
  hole:'vlastní iniciativa, tvořivá síla a ochota riskovat',
  pohary:'city, blízkost a to, co zůstalo nevyřčené',
  mece:'pravda, napětí a rozhodnutí, kterému se nelze vyhýbat',
  pentakly:'praktické kroky, čas, práce a skutečné výsledky'
 };
 const rankMeaning=[
  'zárodek nové možnosti', 'vyhlížení dalšího kroku', 'rozhodování, zda opustit bezpečné místo',
  'stabilita, která může být oporou i překážkou', 'konflikt nebo zklamání, jež je třeba pojmenovat',
  'dílčí úspěch, kterému ještě nesmíš podlehnout', 'zkouška odhodlání a potřeba vybrat si',
  'rychlý vývoj událostí a nutnost reagovat', 'zkušenost získaná vytrvalostí',
  'vrchol dosavadní cesty a její důsledky', 'zpráva nebo první nesmělý pokus',
  'pohyb kupředu, možná trochu ukvapený', 'zralý úsudek a schopnost pečovat o druhé',
  'pevné vedení a odpovědnost za výsledek'
 ];
 const positions=['Minulost','Přítomnost','Budoucnost'];
 function theme(card){if(card.suit==='velka'){const n=Number(card.id.match(/-(\d{2})_/)?.[1]);return majorMeaning[n]||'důležitý zlom a možnost rozhodnout se jinak';}const n=Number(card.id.match(/-(\d{2})_/)?.[1]);return `${rankMeaning[n-1]||'proměna okolností'} v oblasti, kde rozhodují ${suitMeaning[card.suit]||'osobní rozhodnutí'}`;}
 function meaning(card,i){const v=theme(card);const lead=['Za tím, na co se ptáš, stojí','V současné situaci vystupuje do popředí','Pokud se nic zásadního nezmění, další vývoj ovlivní'][i];return `${positions[i]} — ${card.name}\n${lead} ${v}.`}
 async function tarot(){mode='tarot';clear();title('Tarot – minulost, přítomnost, budoucnost');p('Polož si otázku a zamíchej všech 78 karet. Potom postupně otoč tři.');const inp=el('input','dv472-question');inp.type='text';inp.placeholder='Na co se chceš zeptat? (nepovinné)';inp.maxLength=150;main.append(inp);const a=actions();button('Zamíchat balíček',async()=>{question=inp.value.trim();clear();title('Tři karty osudu');p('Můžeš odhalovat jednu kartu po druhé.');say('neutral','„Míchám… a cítím, že karty už znají tvoji otázku!“');try{const res=await fetch(folder+'manifest.json');if(!res.ok)throw Error('Karty nejsou k dispozici');deck=await res.json();}catch{p('Karty se nepodařilo načíst. Zkus obnovit stránku.');button('Zpět',menu,actions());return}for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}picked=deck.slice(0,3);turn=0;shuffle.currentTime=0;shuffle.play().catch(()=>{});const cards=el('div','dv472-cards');for(let i=0;i<3;i++){const c=el('button','dv472-card');c.type='button';c.setAttribute('aria-label','Odhalit kartu '+positions[i]);const im=el('img');im.src=folder+'rub.webp';im.alt='Rub tarotové karty';const label=el('strong','',positions[i]);c.append(im,label);c.addEventListener('click',()=>{if(turn!==i)return;im.src=folder+picked[i].image;im.alt=picked[i].name;label.textContent=positions[i]+': '+picked[i].name;turn++;say(i===1?'neutral':'positive',`„${positions[i]}… ${picked[i].name}! Karty hovoří, drahé dítě.“`);if(turn===3){const a=actions();button('Vyložit tři karty',completeTarot,a)}});cards.append(c)}main.append(cards);p('Polož otázku do srdce. První karta už čeká…');},a);button('Zpět',menu,a)}
 function completeTarot(){
  const lines=picked.map(meaning),themes=picked.map(theme),lower=themes.join(' ').toLowerCase();
  const tone=/konflikt|zklamání|pokušení|svazující|zboření|nejistota|napětí|těžkém/.test(lower)?'negative':/naděje|radost|růst|úspěch|zotavení|otevřenost/.test(lower)?'positive':'neutral';
  const subject=/lásk|vztah|miluj|partner|přátel/.test(question.toLowerCase())?'ve vztazích':/peněz|finance|prác|zaměstn|podnik|zakáz/.test(question.toLowerCase())?'v práci a materiálních záležitostech':/škol|zkouš|učen|stud/.test(question.toLowerCase())?'při studiu':'v této věci';
  const bridge=tone==='negative'?`Trelawneyová se zamračí. „Vidím zde napětí, ale ne neodvratnou pohromu. Nejtěžší zkouškou ${subject} může být přestat přehlížet to, co už dávno víš.“`:tone==='positive'?`Profesorka se pousměje. „To jsou slibné karty, drahé dítě. Přesto ti nic nespadne do klína samo. Příležitost ${subject} potřebuje i tvůj vlastní krok.“`:`Trelawneyová dlouze mlčí. „Karty nedávají jednoduché ano či ne. Ukazují, co tě přivedlo sem, co držíš ve vlastních rukou a kam tě mohou zavést další rozhodnutí.“`;
  const synthesis=`\n\nJak spolu karty souvisejí\nMinulost vysvětluje, proč se k otázce vracíš. Prostřední karta označuje to, co si zaslouží pozornost právě teď. Třetí není pevně daný osud — ukazuje jednu z možných cest, pokud budeš pokračovat stejně.\n\n${bridge}`;
  result('Trelawneyové výklad tří karet',(question?'Tvoje otázka: '+question+'\n\n':'')+lines.join('\n\n')+synthesis,tone)
 }
 function launch(){setup();menu()}opener.addEventListener('click',launch);teacher.addEventListener('click',launch);window.addEventListener('pagehide',()=>{music.pause();shuffle.pause()});
})();
