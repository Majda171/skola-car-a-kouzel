(()=>{'use strict';
 const path=(location.pathname.split('/').pop()||'').toLowerCase();
 window.addEventListener('bradavice:dungbomb-use',()=>{
  if(!window.BradaviceInventory?.has('hnojova-bomba'))return;
  if(path==='kabinet-umbridge.html'){alert('Pro skutečnou sabotáž kabinetu využij úkol Freda a George. Použití mimo úkol body nepřidává.');return}
  const fog=document.createElement('div');fog.className='v450-stink';fog.setAttribute('aria-hidden','true');document.body.append(fog);setTimeout(()=>fog.remove(),5200);
  const toast=document.createElement('p');toast.className='v450-stink-toast';toast.textContent='💨 Rozlil se příšerný zápach! Raději zmiz, než tě někdo chytí.';document.body.append(toast);setTimeout(()=>toast.remove(),4500);
  // Decorative prank only; no points or incident without server-side confirmation.
 });
})();