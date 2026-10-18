/* Ufňukaná Uršula – rozhovor bez databázových změn. */
(()=>{'use strict';
 const ursula=document.getElementById('v451Myrtle');if(!ursula)return;
 function talk(title,text,choices){
  const mask=document.createElement('div');mask.className='v450-dialog-shade';mask.setAttribute('role','dialog');mask.setAttribute('aria-modal','true');mask.setAttribute('aria-label',title);
  const panel=document.createElement('section');panel.className='v450-dialog';const h=document.createElement('h2');h.textContent=title;const p=document.createElement('p');p.textContent=text;
  const actions=document.createElement('div');actions.className='v450-dialog-actions';for(const [label,callback] of choices){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>{mask.remove();callback?.()});actions.append(b)}
  panel.append(h,p,actions);mask.append(panel);document.body.append(mask);actions.firstChild?.focus();mask.addEventListener('click',e=>{if(e.target===mask)mask.remove()});mask.addEventListener('keydown',e=>{if(e.key==='Escape')mask.remove()})
 }
 const menu=()=>talk('Ufňukaná Uršula','„Co na mě tak zíráš? Všichni se sem chodí jen posmívat! A jestli se budeš smát mým brýlím, utopím se v záchodě ještě jednou!“',[
  ['Proč tu pořád pláčeš?',()=>talk('Uršula','„Když jsem byla ještě živá, neměla jsem skoro žádné přátele. Olivie Hornbyová se mi zase smála kvůli brýlím… Utekla jsem sem. A už jsem odtud nikdy živá neodešla!“', [['To mě mrzí',menu],['Vrátit se',null]])],
  ['Co se ti tehdy stalo?',()=>talk('Uršula','„Slyšela jsem hlas. Podivný, syčivý hlas. Otevřela jsem kabinku… a u umyvadel jsem zahlédla obrovské žluté oči. Pak už si pamatuji jen to, že jsem byla mrtvá. A nikdo mě ani nehledal!“', [['U kterého umyvadla?',()=>talk('Uršula','„U toho s podivným malým hadem na kohoutku! Ale proč tě to tak zajímá? Zase tu chcete něco vyvádět!“',[['Poděkovat',null]])],['Rozumím',null]])],
  ['Slyšela jsi o Tajemné komnatě?',()=>talk('Uršula','„Komnata, komnata! Všichni mluví o něčem tajném, ale na mě se nikdo neptá. Já vím jen o tom hlasu a o očích. Na to umyvadlo si raději dávej pozor.“',[['Poděkovat',null]])],
  ['Odejít',null]
 ]);
 ursula.addEventListener('click',menu);
})();
