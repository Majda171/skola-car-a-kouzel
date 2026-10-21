/* v468: puštík z nádvoří otevírá stejnou Soví poštu jako herní lišta. */
(()=>{'use strict';
 const owl=document.getElementById('courtyardOwlPost');if(!owl)return;
 owl.addEventListener('click',()=>{
  const quickmail=window.BradaviceQuickChat;
  if(quickmail?.open) quickmail.open();
  else location.href='social.html?tab=messages';
 });
})();
