/* v447: Konverzace Dolores Jane Umbridgové. Filchovo zadržení řídí v446-umbridge.js. */
(()=>{'use strict';
 const c=document.getElementById('umbridgeCharacter'),b=document.getElementById('umbridgeTalk'),d=document.getElementById('umbridgeDialog'),x=document.getElementById('umbridgeDialogClose'),t=document.getElementById('umbridgeDialogText');
 if(!d||!t)return;
 const actions=document.createElement('div');actions.className='v447-umbridge-actions';t.after(actions);
 const status=document.createElement('p');status.className='v447-umbridge-status';actions.after(status);
 function close(){d.hidden=true;actions.replaceChildren();status.textContent=''}
 const sequences=[
  {intro:'„Ehm, ehm. Máš snad povolení vstupovat do kabinetu bez předchozího ohlášení, drahoušku? Ach, to jsem si myslela.“',choices:[
   ['Chtěl/a jsem se jen na něco zeptat.','„Ptát se můžeš tehdy, až budeš znát správnou odpověď. Pravidla existují právě proto, aby se děti nemusely unavovat samostatným myšlením.“'],
   ['Promiňte, paní profesorko.','„Vidíš? Když chceš, dokážeš být docela způsobné dítě. Ještě jednou a sepíšu o tobě hlášení.“']
  ]},
  {intro:'„Víš, co je na bradavických studentech nejúnavnější? Ta vaše neodolatelná touha být výjimeční. Ministerstvo si však cení pořádku, nikoli výjimečnosti.“',choices:[
   ['Myslel/a jsem, že se tu máme učit kouzlit.','„Ehm, ehm! Tady se učíme to, co ministerstvo uzná za vhodné. Bezpečnost především. Hůlku laskavě nech tam, kde je.“'],
   ['Rozumím, paní profesorko.','„Ach, konečně trocha zdravého rozumu. O tomhle přístupu by se měli dozvědět i tvoji spolužáci.“']
  ]},
  {intro:'„Růžová je velmi uklidňující barva, nemyslíš? Především v místnosti, kde se rozhoduje o kázeňských opatřeních.“',choices:[
   ['Máte opravdu krásná koťátka.','„Ach ano. Koťátka jsou nevinná a poslušná. Na rozdíl od některých studentů. Rozumíme si, viď, drahoušku?“'],
   ['Raději už půjdu.','„Jak příjemné! Poprvé dnes někdo učinil správné rozhodnutí bez mého výslovného příkazu.“']
  ]}
 ];
 let step=0;
 function render(message,choices=[],note=''){
  t.textContent=window.BradaviceOsloveni?.inflect(message)??message;actions.replaceChildren();status.textContent=note;d.hidden=false;
  choices.forEach(([label,cb])=>{const button=document.createElement('button');button.type='button';button.textContent=window.BradaviceOsloveni?.inflect(label)??label;button.onclick=cb;actions.append(button)});
 }
 function talk(){
  if(d.hidden===false && actions.childElementCount)return;
  const q=sequences[step++%sequences.length];
  render(q.intro,q.choices.map(([label,answer])=>[label,()=>render(answer,[['Děkuji, paní profesorko.',close]])]));
 }
 c?.addEventListener('click',()=>{if(!document.getElementById('umbridgeOffice')?.classList.contains('v446-empty'))talk()});
 b?.addEventListener('click',()=>{if(!document.getElementById('umbridgeOffice')?.classList.contains('v446-empty'))talk()});
 x?.addEventListener('click',close);
 window.BradaviceUmbridgeDialog={render,close,status};
})();
