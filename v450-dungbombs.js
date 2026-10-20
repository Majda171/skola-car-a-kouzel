/* v459: sdílený efekt bomb hnojůvky – delší smrad a opakovaný zvuk pro studenta, Protivu i Umbridgeovou */
(()=>{'use strict';
 const path=(location.pathname.split('/').pop()||'').toLowerCase();

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
 });
})();
