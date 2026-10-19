/* Bradavice v453b – Protiva vybírá vždy jednu kolej. Vstup a body potvrzuje výhradně Supabase. */
(()=>{'use strict';
 const db=window.BradaviceDB?.client;
 const houseNames={N:'Nebelvír',H:'Havraspár',M:'Mrzimor',Z:'Zmijozel'};
 const images={N:'vlajka-n-v453.webp',H:'vlajka-h-v453.webp',M:'vlajka-m-v453.webp',Z:'vlajka-z-v453.webp'};
 const entries={N:'prihlaseniNeb.html',H:'prihlaseniHavraspar.html',M:'prihlaseniMrzimor.html',Z:'prihlaseniZmijozel.html'};
 const $=id=>document.getElementById(id);
 let own=null,captured=[],target=null;
 const msg=text=>{const p=$('v453FlagStatus');if(p)p.textContent=text;};
 async function rpc(name,args){if(!db)throw Error('Připojení k Supabase není dostupné.');const {data,error}=await db.rpc(name,args);if(error)throw error;return data;}
 function pennant(code,label){const wrapper=document.createElement('figure');wrapper.className='v453-pennant';wrapper.dataset.house=code;
  const img=document.createElement('img');img.src='img/'+images[code];img.alt='Vlajka koleje '+houseNames[code];wrapper.append(img);
  if(label){const caption=document.createElement('figcaption');caption.textContent=label;wrapper.append(caption);}return wrapper;}
 function showCollection(root){if(!root)return;root.replaceChildren();if(!own)return;for(const c of ['N','H','M','Z'])if(c===own||captured.includes(c))root.append(pennant(c,houseNames[c]+(c===own?' · vlastní':'')));}
 async function refresh(){if(!$('v453FlagStatus'))return;
  try{
   const data=await rpc('v453_flag_status');own=data.house_code;captured=Array.isArray(data.captured)?data.captured:[];
   target=['N','H','M','Z'].find(code=>code!==own&&!captured.includes(code))||null;
   showCollection($('v453Captured'));
   const title=$('v453TargetName');if(title)title.textContent=target?`Protiva si vyhlédl ${houseNames[target]}`:'Všechny čtyři vlajky jsou doma!';
   const targetText=$('v453TargetText');if(targetText)targetText.textContent=target?`Protiva ti může prozradit údajné heslo do koleje ${houseNames[target]}. Pak se vydej k jejímu skutečnému vchodu a tam heslo vyzkoušej.`:'Podařilo se ti získat všechny tři cizí vlajky. Tvoje sbírka je úplná.';
   const button=$('v453AskPeeves');if(button){button.disabled=!target;button.textContent=target?'Promluvit s Protivou':'Sbírka dokončena';}
   msg(data.full_set?'Všechny čtyři vlajky získány. Gratulujeme!':`Ve sbírce máš ${captured.length+1} ze 4 vlajek.`);
  }catch(e){msg(`Vlajkový úkol se zatím nepodařilo načíst: ${e.message||'Neznámá chyba'}`)}
 }
 async function getClue(){if(!target)return;const talk=$('v453PeevesText');const btn=$('v453AskPeeves');if(btn)btn.disabled=true;
  if(talk)talk.textContent='Protiva poletuje chodbou a cosi si mumlá…';
  try{
   const text=await rpc('v453_peeves_clue',{p_target_house:target});
   if(talk)talk.textContent=`„Studentíku, tajtrlíku! Do ${houseNames[target]}? Heslo je prý ‚${text}‘! Cha chá, ale jestli se mnou naletíš, to ti předem nepovím!“`;
   const route=$('v453ClueRoute');if(route){route.hidden=false;route.textContent=`Najdi vstup koleje ${houseNames[target]} na hradě a řekni tam: „${text}“.`}
  }catch(e){if(talk)talk.textContent=`Protiva tentokrát mlčí. ${e.message||''}`;}
  finally{if(btn)btn.disabled=false;}
 }
 if($('v453AskPeeves')){$('v453AskPeeves').addEventListener('click',getClue);refresh();}

 // Přidání vlajky pouze uvnitř serverem povolené herní návštěvy.
 async function showRoom(){const room=document.body?.dataset?.house;
  if(!room||document.body.dataset.space!=='lounge')return;
  if(!document.body.classList.contains('access-ready')){
   await new Promise(resolve=>{const obs=new MutationObserver(()=>{if(document.body.classList.contains('access-ready')){obs.disconnect();resolve();}});obs.observe(document.body,{attributes:true,attributeFilter:['class']});});
  }
  if(document.body.classList.contains('house-locked'))return;
  const scene=document.querySelector('.house-scene');if(!scene)return;
  try{
   const current=await rpc('v453_flag_status');own=current.house_code;captured=Array.isArray(current.captured)?current.captured:[];
   if(document.body.classList.contains('house-guest')){
    if(captured.includes(room))return;
    const flag=document.createElement('button');flag.type='button';flag.className='v453-house-flag';flag.setAttribute('aria-label','Sebrat vlajku koleje '+houseNames[room]);flag.title='Sebrat kolejní vlajku';flag.append(pennant(room));scene.append(flag);
    flag.addEventListener('click',async()=>{
     flag.disabled=true;
     try{const result=await rpc('v453_flag_take',{p_target_house:room});
      alert(result.captured?`Získáváš vlajku ${houseNames[room]}! Tvoje kolej dostává 100 bodů.${result.completed?' Navíc dalších 250 za úplnou sbírku!':''}`:'Tuto vlajku už máš.');
      flag.remove();window.BradaviceDB?.hydrateStudent?.().catch(()=>{});
     }catch(e){flag.disabled=false;alert('Vlajku se nepodařilo získat: '+(e.message||'Neznámá chyba'));}
    });
   }else{
    const rack=document.createElement('aside');rack.className='v453-home-flags';const name=document.createElement('strong');name.textContent='Získané kolejní vlajky';rack.append(name);
    const collection=document.createElement('div');collection.className='v453-home-collection';rack.append(collection);scene.append(rack);showCollection(collection);
   }
  }catch(e){console.warn('Vlajky:',e.message);}
 }
 if(document.body?.dataset?.space==='lounge')showRoom();
})();
