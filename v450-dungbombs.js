/* v457: jeden sdílený efekt bomb hnojůvky – student, Protiva, Umbridgeová */
(()=>{'use strict';
 const path=(location.pathname.split('/').pop()||'').toLowerCase();
 function blast({actor='student',message}={}){
  const sound=new Audio('audio/hnojovka-prasknuti-v457.mp3');sound.volume=.68;
  sound.play().catch(()=>{});
  const clouds=document.createElement('img');clouds.src='img/smrad-zeleny-v457.webp';clouds.alt='';
  clouds.className='v457-fog-image';clouds.setAttribute('aria-hidden','true');document.body.append(clouds);
  const fog=document.createElement('div');fog.className='v450-stink';fog.setAttribute('aria-hidden','true');document.body.append(fog);
  setTimeout(()=>{fog.remove();clouds.remove()},5400);
  if(message!==false){const toast=document.createElement('p');toast.className='v450-stink-toast';toast.textContent=message||(actor==='protiva'?'💨 Protiva rozházel bomby hnojůvky!':'💨 Bomba hnojůvky praskla a chodbu zaplavil zápach!');document.body.append(toast);setTimeout(()=>toast.remove(),4600);}
 }
 window.BradaviceDungBombs={blast};
 window.addEventListener('bradavice:dungbomb-use',()=>{
  if(!window.BradaviceInventory?.has('hnojova-bomba'))return;
  if(path==='kabinet-umbridge.html'){alert('Sabotáž kabinetu patří do úkolu Freda a George; samotné použití bomby body nepřidává.');return;}
  blast({actor:'student'}); // pouze vizuální žert bez neověřených bodů
 });
})();
