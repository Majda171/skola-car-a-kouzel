/* v17: Soví pošta na nádvoří – po sabotáži odměna a další zásilky 10 bomb za 4 G. */
(()=>{'use strict';
 const owl=document.getElementById('courtyardOwlPost');if(!owl)return;
 const db=()=>window.BradaviceDB?.client;
 const ordinaryMail=()=>{const mail=window.BradaviceQuickChat;if(mail?.open)mail.open();else location.href='social.html?tab=messages';};
 const rpc=async name=>{if(!db())throw Error('Soví pošta není připojená.');const {data,error}=await db().rpc(name);if(error)throw error;return data};
 const style=document.createElement('style');style.textContent=`
 .v17-owl-overlay{position:fixed;inset:0;z-index:19000;display:grid;place-items:center;padding:18px;background:#020306ce;backdrop-filter:blur(5px)}
 .v17-owl-card{width:min(560px,100%);max-height:85vh;overflow:auto;box-sizing:border-box;padding:28px;border:2px solid #b48e57;border-radius:10px;background:linear-gradient(135deg,#312819,#15130f);box-shadow:0 20px 85px #000;color:#f4e4c1;font:17px/1.6 Georgia,serif}
 .v17-owl-card h2{font:31px Georgia,serif;margin:0 0 15px}.v17-owl-card p{margin:0 0 16px}.v17-owl-actions{display:flex;gap:9px;flex-wrap:wrap}
 .v17-owl-actions button{border:1px solid #b48e57;border-radius:6px;background:#74552a;color:#fff4d5;padding:11px 14px;font:600 14px Georgia,serif;cursor:pointer}
 .v17-owl-actions button:disabled{opacity:.6;cursor:wait}.v17-owl-result{color:#e8c68a;font-weight:bold;min-height:1.6em}`;document.head.append(style);
 async function show(){
   const overlay=document.createElement('div');overlay.className='v17-owl-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
   const card=document.createElement('section');card.className='v17-owl-card';
   const title=document.createElement('h2');title.textContent='🦉 Soví pošta';
   const intro=document.createElement('p');intro.textContent='Sova čeká na tvůj vzkaz.';
   const result=document.createElement('p');result.className='v17-owl-result';result.setAttribute('role','status');
   const actions=document.createElement('div');actions.className='v17-owl-actions';
   const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;actions.append(b);return b};
   const close=()=>overlay.remove();overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
   card.append(title,intro,actions,result);overlay.append(card);document.body.append(overlay);
   button('Běžná soví pošta',()=>{close();ordinaryMail()});button('Zavřít',close);
   try{
     const {data:progress,error:e}=await db().from('v446_story_progress').select('sabotage_at').maybeSingle();if(e)throw e;
     if(!progress?.sabotage_at){intro.textContent='Můžeš poslat vzkaz. Fred a George svou kamarádskou nabídku zpřístupní až po společné akci.';return}
     intro.textContent='Fred a George píší: „Povedená akce u Umbridgeové! Připravili jsme slíbenou odměnu. A pro kamaráda teď máme zásilku hnojůvek za polovinu ceny.“';
     const {data:delivery,error:de}=await db().from('student_special_rewards').select('reward_id').eq('reward_id','weasley_sabotage_10').maybeSingle();if(de)throw de;
     if(!delivery){
       const reward=button('Převzít 10 hnojůvek za splněnou akci',async()=>{
         reward.disabled=true;result.textContent='Sova přilétá s odměnou…';
         try{const status=await rpc('v17_claim_weasley_reward');result.textContent=status?.already?'Odměnu už máš vyzvednutou.':'Sova ti doručila 10 bomb hnojůvky. Najdeš je v batohu.';reward.remove();await window.BradaviceInventory?.reload?.();window.dispatchEvent(new Event('bradavice:weasley-delivery'))}
         catch(e){result.textContent=e.message||'Odměnu nelze doručit.';reward.disabled=false}
       });
     }
     const order=button('Napsat Fredovi a Georgovi · 10 bomb za 4 G',async()=>{
       order.disabled=true;result.textContent='Posílám objednávku po sově…';
       try{const status=await rpc('v17_order_weasley_dungbombs');result.textContent=`Sova doručila 10 bomb hnojůvky! Zbývá ti ${status.balance} G.`;await window.BradaviceInventory?.reload?.();window.dispatchEvent(new Event('bradavice:weasley-delivery'))}
       catch(e){result.textContent=e.message||'Objednávku nelze vyřídit.'}finally{order.disabled=false}
     });
   }catch(e){intro.textContent='Soví pošta se nemůže spojit se školní evidencí.';result.textContent=e.message||'Zkus to později.';console.warn('Soví pošta:',e)}
 }
 owl.addEventListener('click',show);
})();
