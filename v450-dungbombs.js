/* v459: sdílený efekt bomb hnojůvky – delší smrad a opakovaný zvuk pro studenta, Protivu i Umbridgeovou */
(()=>{'use strict';
 const path=(location.pathname.split('/').pop()||'').toLowerCase();

 function peevesLaugh(){
  try{const laugh=new Audio('audio/peeves-laugh-v463.mp3');laugh.volume=.78;laugh.play().catch(()=>{});}catch(e){console.debug('Protivův smích není dostupný',e);}
 }

 function enableFilchEverywhere(){
  if(document.querySelector('script[src*="filch-random-v442.js"]'))return;
  if(!document.querySelector('link[href*="filch-random-v442.css"]')){
    const style=document.createElement('link');style.rel='stylesheet';style.href='filch-random-v442.css?v=18';document.head.append(style);
  }
  const script=document.createElement('script');script.src='filch-random-v442.js?v=18';document.body.append(script);
 }

 function playBurst(volume=.7, repeats=2, gap=620){
  for(let i=0;i<repeats;i++){
   setTimeout(()=>{
    const sound=new Audio('audio/hnojovka-prasknuti-v457.mp3');
    sound.volume=volume;
    sound.play().catch(()=>{});
   },i*gap);
  }
 }

 function blast({actor='student',message,duration}={}){
  const isPeeves=actor==='protiva';
  const isUmbridge=actor==='umbridge';
  const total=duration|| (isPeeves ? 12500 : isUmbridge ? 9800 : 9300);
  const repeats=isPeeves ? 3 : 2;
  playBurst(isPeeves?0.72:0.68,repeats,isPeeves?540:680);
  if(isPeeves)setTimeout(peevesLaugh,800);
  document.body.classList.add('v463-smoke-active');

  const clouds=document.createElement('img');
  clouds.src='img/smrad-zeleny-v457.webp';
  clouds.alt='';
  clouds.className='v457-fog-image';
  clouds.setAttribute('aria-hidden','true');
  clouds.style.animationDuration=(Math.max(total-500,4200))+'ms';
  document.body.append(clouds);

  const fog=document.createElement('div');
  fog.className='v450-stink';
  fog.setAttribute('aria-hidden','true');
  fog.style.animationDuration=total+'ms';
  document.body.append(fog);

  setTimeout(()=>{fog.remove();clouds.remove();document.body.classList.remove('v463-smoke-active');},total+350);

  if(message!==false){
   const toast=document.createElement('p');
   toast.className='v450-stink-toast';
   toast.textContent=message||(isPeeves?'💨 Protiva rozházel bomby hnojůvky!':'💨 Bomba hnojůvky praskla a chodbu zaplavil zápach!');
   document.body.append(toast);
   setTimeout(()=>toast.remove(),Math.max(5600,total-1800));
  }
 }

 window.BradaviceDungBombs={blast};
 window.addEventListener('bradavice:dungbomb-use',()=>{
  if(!window.BradaviceInventory?.has('hnojova-bomba'))return;
  if(path==='kabinet-umbridge.html'){
   alert('Sabotáž kabinetu patří do úkolu Freda a George; samotné použití bomby body nepřidává.');
   return;
  }
  blast({actor:'student',message:false}); // zvuk a kouř bez rušivého popisku
  enableFilchEverywhere();
  const warning=document.createElement('p');warning.className='v450-stink-toast';warning.textContent='Filch zaslechl výbuch! Máš chvíli na útěk.';document.body.append(warning);
  setTimeout(()=>warning.remove(),6500);
  const originalScene=location.pathname;
  const alarm=setTimeout(()=>{
    if(location.pathname===originalScene)window.dispatchEvent(new Event('bradavice:dungbomb-alarm'));
  },9500);
  window.addEventListener('pagehide',()=>clearTimeout(alarm),{once:true});
 });
})();
