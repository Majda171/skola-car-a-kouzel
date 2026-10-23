/* Kompatibilita se staršími stránkami: jedna společná navigace. */
(()=>{'use strict';
  if(document.querySelector('script[data-bradavice-modern-nav]'))return;
  const script=document.createElement('script');
  script.src='castle-nav-v456.js?v=474';
  script.dataset.bradaviceModernNav='1';
  document.body.appendChild(script);
})();
