/* Přiložený seznam k přijímacímu dopisu; po sově se jde nakupovat, ne rovnou na rozřazování. */
(()=>{'use strict';
  const DIAGON='https://majda171.github.io/bradadavice_pricna_ulice/';
  const letter=document.querySelector('.magic-letter-shell > .magic-letter');
  const shell=document.querySelector('.magic-letter-shell');
  if(!letter||!shell)return;
  const originalIntro=Array.from(document.querySelectorAll('.magic-letter-copy p')).find(p=>p.textContent.includes('Po příchodu do Velké síně'));
  if(originalIntro)originalIntro.textContent='Než se dostavíte na rozřazování, navštivte Příčnou ulici a pořiďte si školní výbavu podle přiloženého seznamu. Teprve pak Vás v Bradavicích přivítá Moudrý klobouk.';
  const note=letter.querySelector('.magic-letter-note');
  if(note)note.textContent='K dopisu je přiložen seznam školních potřeb. Prohlédněte si jej před cestou do Příčné ulice.';
  const showButton=document.createElement('button');showButton.type='button';showButton.className='letter-list-switch';showButton.textContent='✦ Otevřít přiložený seznam pomůcek ✦';
  (note||letter.querySelector('.magic-letter-copy')||letter).before(showButton);
  const sheet=document.createElement('article');sheet.className='magic-letter letter-list-parchment';sheet.hidden=true;
  sheet.innerHTML=`<img class="magic-letter-crest" src="img/bradavice-erb.webp" alt="Znak Bradavic">
    <p class="magic-letter-school">Bradavice · škola čar a kouzel</p>
    <h1>Seznam školních potřeb</h1>
    <p class="letter-list-lead">První ročník · Veškeré pomůcky obstaráte v Příčné ulici.</p>
    <div class="letter-list-groups">
      <section><h2>Oblečení</h2><ul>
      <li>Tři černé pracovní hábity</li><li>Černá špičatá čapka</li><li>Ochranné rukavice</li><li>Černý zimní plášť</li></ul>
      <h2>Další pomůcky</h2><ul>
      <li>Cínový kotlík, velikost 2</li><li>Sada skleněných lahviček</li><li>Astronomický dalekohled</li><li>Mosazné váhy</li><li>Brk, inkoust a pergamen</li><li>Jedna kouzelnická hůlka</li></ul></section>
      <section><h2>Povinné učebnice</h2><ul>
      <li>Příručka kouzelnických slov a zaklínadel (1. stupeň)</li>
      <li>Dějiny čar a kouzel</li><li>Teorie kouzelnického umění</li><li>Úvod do přeměňování</li>
      <li>Tisíc kouzelnických bylin a hub</li><li>Kouzelnické odvary a lektvary</li>
      <li>Fantastická zvířata a kde je najít</li><li>Černá magie – příručka sebeobrany</li></ul>
      <p class="letter-list-note">Společenské hábity a mazlíček jsou nepovinné. Hůlku si student nevybírá – ona si vybere jeho.</p></section>
    </div>
    <div class="letter-list-actions"><button type="button" class="letter-list-back">← Zpět k dopisu</button>
    <a class="letter-list-continue" href="${DIAGON}">Vyrazit do Příčné ulice →</a></div>`;
  shell.append(sheet);
  showButton.addEventListener('click',()=>{letter.hidden=true;sheet.hidden=false;window.scrollTo({top:0,behavior:'smooth'});});
  sheet.querySelector('.letter-list-back').addEventListener('click',()=>{sheet.hidden=true;letter.hidden=false;window.scrollTo({top:0,behavior:'smooth'});});
})();
