(()=>{'use strict';
 const db=window.BradaviceDB?.client;if(!db)return;
 let status='not-started',card=null,started=false;
 async function reload(){try{const {data,error}=await db.rpc('v450_nick_status');if(!error)status=data||'not-started'}catch{}paint()}
 function paint(){const bag=document.querySelector('.bag-panel');if(!bag)return;
  if(!card){card=document.createElement('section');card.className='v450-quest-bag';card.setAttribute('aria-label','Úkolové předměty');const title=document.createElement('h3');title.textContent='📜 Úkolové předměty';const row=document.createElement('div');row.className='v450-quest-food';const img=document.createElement('img');img.src='img/nick-zkazene-jidlo-v450.webp';img.alt='';const content=document.createElement('p');content.textContent='Zkažená hostina pro Skorobezhlavého Nicka. Odnes ji do sklepení.';row.append(img,content);card.append(title,row);bag.querySelector('#bagHint')?.before(card);if(!card.isConnected)bag.append(card)}
  card.hidden=status!=='food';
 }
 document.addEventListener('DOMContentLoaded',()=>{reload();setTimeout(paint,350)});
 window.addEventListener('bradavice:inventory-updated',paint);window.addEventListener('bradavice:nick-updated',reload);
})();