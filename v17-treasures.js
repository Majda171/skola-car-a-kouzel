/* V19: drobné galeony a truhla ve skutečné Zapomenuté místnosti.
   Každý nález se připíše přes Supabase jen jednou na studentský účet. */
(()=>{'use strict';
 const page=decodeURIComponent(location.pathname.split('/').pop()||'');
 const treasure={
  'tajna-mistnost.html':{id:'forgotten_room_chest',kind:'chest',x:68,y:85,w:'clamp(90px,9vw,145px)',title:'Stará truhla v Zapomenuté místnosti',reward:'V truhle je 15 galeonů a 2 bomby hnojůvky!'},
  'tajemna-komnata.html':{id:'secret_chamber_coins',kind:'coins',x:67,y:85,w:'clamp(36px,4vw,65px)',title:'Galeony v Tajemné komnatě',reward:'Našel/a jsi 40 galeonů!'},
  'tajemna-cesta.html':{id:'chamber_corridor_coins',kind:'coins',x:60,y:81,w:'clamp(36px,4vw,65px)',title:'Ztracené galeony na cestě',reward:'Našel/a jsi 5 galeonů!'},
  'kamen-mudrcu-zrcadlo.html':{id:'philosopher_hall_coins',kind:'coins',x:26,y:84,w:'clamp(36px,4vw,65px)',title:'Galeony u Zrcadla z Erisedu',reward:'Našel/a jsi 70 galeonů!'},
  'zapovezeny-les.html':{id:'forbidden_forest_coins',kind:'coins',x:61,y:86,w:'clamp(36px,4vw,65px)',title:'Zapomenuté galeony v lese',reward:'Našel/a jsi 10 galeonů!'}
 }[page];
 if(!treasure)return;
 const DB=window.BradaviceDB?.client,host=document.querySelector('main');if(!host)return;
 const css=document.createElement('link');css.rel='stylesheet';css.href='v17-treasures.css?v=19';document.head.append(css);
 const button=document.createElement('button');button.type='button';button.className='v17-find v17-find-'+treasure.kind;
 button.setAttribute('aria-label',treasure.title);button.title=treasure.title;
 button.style.left=treasure.x+'%';button.style.top=treasure.y+'%';button.style.width=treasure.w;
 const img=document.createElement('img');img.alt='';img.src=treasure.kind==='coins'?'img/odmeny/tri_galeony.webp':'img/odmeny/truhla_zavrena_bez_pasku.webp';
 button.append(img);if(getComputedStyle(host).position==='static')host.style.position='relative';host.append(button);
 const note=(text)=>{document.querySelector('.v17-find-notice')?.remove();const el=document.createElement('div');el.className='v17-find-notice';el.setAttribute('role','status');el.textContent=text;const close=document.createElement('button');close.type='button';close.textContent='×';close.title='Zavřít';close.addEventListener('click',()=>el.remove());el.append(close);document.body.append(el);setTimeout(()=>el.remove(),8200)};
 let claimed=false,busy=false;
 async function init(){try{
   if(!DB){button.disabled=true;return}
   const {data:auth}=await DB.auth.getUser();if(!auth?.user){button.hidden=true;return}
   const {data,error}=await DB.rpc('v17_treasure_state');if(error)throw error;
   claimed=(data?.claimed||[]).includes(treasure.id);button.hidden=claimed;
 }catch(e){button.disabled=true;console.warn('Hradní nálezy:',e);note('Nálezy čekají na aktualizaci SQL v17.')}}
 button.addEventListener('click',async()=>{
  if(busy||claimed)return;busy=true;button.disabled=true;
  try{
   const rpc=treasure.id==='chamber_corridor_coins'?'v17_claim_treasure':'v19_claim_treasure';
   const {data,error}=await DB.rpc(rpc,{p_treasure_id:treasure.id});if(error)throw error;
   claimed=true;
   if(treasure.kind==='chest')img.src='img/odmeny/truhla_otevrena_bez_pasku.webp';
   note(data?.already?'Tenhle poklad už jsi vyzvedl/a.':treasure.reward);
   if(data?.dungbombs)await window.BradaviceInventory?.reload?.();
   window.dispatchEvent(new Event('bradavice:treasure-claimed'));
   setTimeout(()=>{button.hidden=true},1600);
  }catch(e){note(e?.message||'Poklad se nepodařilo vyzvednout. Ověř SQL pro nové nálezy v19.');button.disabled=false;console.warn(e)}
  finally{busy=false}
 });
 init();
})();
