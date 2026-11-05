/* V17: tajné truhly a galeony, trvalá odměna vždy jen jednou na studentský účet. */
(()=>{'use strict';
 const page=decodeURIComponent(location.pathname.split('/').pop()||'');
 const treasure={
  'tajemna-komnata.html':{id:'salazar_chest',kind:'chest',x:72,y:73,w:'clamp(98px,12vw,180px)',title:'Stará truhla u Salazarova obrazu',reward:'V truhle leželo 10 galeonů!'},
  'tajemna-cesta.html':{id:'chamber_corridor_coins',kind:'coins',x:60,y:81,w:'clamp(65px,8vw,110px)',title:'Ztracené galeony na cestě',reward:'Našel/a jsi 5 galeonů!'},
  'chodby-stara-galerie.html':{id:'underground_dungbomb_chest',kind:'chest',x:67,y:82,w:'clamp(90px,10vw,160px)',title:'Zapomenutá truhlička v galerii',reward:'Našel/a jsi tři bomby hnojůvky!'}
 }[page];
 if(!treasure)return;
 const DB=window.BradaviceDB?.client,host=document.querySelector('main');if(!host)return;
 const css=document.createElement('link');css.rel='stylesheet';css.href='v17-treasures.css?v=17';document.head.append(css);
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
   const {data,error}=await DB.rpc('v17_claim_treasure',{p_treasure_id:treasure.id});if(error)throw error;
   claimed=true;
   if(treasure.kind==='chest')img.src='img/odmeny/truhla_otevrena_bez_pasku.webp';
   note(data?.already?'Tenhle poklad už jsi vyzvedl/a.':treasure.reward);
   if(data?.dungbombs)await window.BradaviceInventory?.reload?.();
   window.dispatchEvent(new Event('bradavice:treasure-claimed'));
   setTimeout(()=>{button.hidden=true},1600);
  }catch(e){note(e?.message||'Poklad se nepodařilo vyzvednout.');button.disabled=false;console.warn(e)}
  finally{busy=false}
 });
 init();
})();
