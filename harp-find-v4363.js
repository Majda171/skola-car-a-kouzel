(()=>{
 const harp=document.getElementById('philosopherHarpFind');if(!harp)return;
 const inv=()=>window.BradaviceInventory;
 const update=()=>{if(inv())harp.hidden=inv().has('harp')};
 harp.hidden=true;
 (async()=>{await new Promise(r=>{const check=()=>inv()?r():setTimeout(check,40);check()});await inv().ready;update();})();
 harp.addEventListener('click',async e=>{e.stopPropagation();const bag=inv();if(!bag||bag.has('harp'))return;
   harp.disabled=true;const result=await bag.collect('harp');harp.disabled=false;
   if(result.ok){harp.classList.add('found');window.BradaviceAchievements?.award?.('tajemstvi-hradu',{silent:true});setTimeout(update,650)}
   else{window.BradaviceAchievements?.toast?.(result.message||'Předmět se nepodařilo sebrat.');if(result.full)bag.open()}
 });
 window.addEventListener('bradavice:inventory-updated',update);
})();
