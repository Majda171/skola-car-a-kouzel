/* Bradavice v454 – jedna konzistentní síť bočních šipek na všech veřejných lokacích.
   Soukromé koleje ani uzamčené tajné úkolové místnosti nejsou zkratkou obejitelné. */
(()=>{'use strict';
 const route=[["nadvori.html", "Nádvoří"], ["chodby.html", "Hradní chodby"], ["chodby-schody.html", "Hlavní schodiště"], ["chodby-portretni-galerie.html", "Severní chodba"], ["prihlaseniNeb.html", "Baculatá dáma"], ["chodby-stara-galerie.html", "Východní chodba"], ["kamen-mudrcu-chloupek.html", "Zakázané dveře – Chloupek"], ["divci-umyvarna.html", "Dívčí umývárna"], ["chodby-podzemni-1.html", "Podzemní chodba"], ["kuchyne.html", "Kuchyně"], ["prihlaseniMrzimor.html", "Sudová stěna – Mrzimor"], ["chodby-podzemni-2.html", "Hluboké sklepení"], ["prihlaseniZmijozel.html", "Kamenná stěna – Zmijozel"], ["nickova-oslava.html", "Nickova oslava"], ["chodby-horni.html", "Horní chodby"], ["prihlaseniHavraspar.html", "Orlí klepadlo – Havraspár"], ["ucebna-jasnovidectvi.html", "Jasnovidectví"], ["kabinet-umbridge.html", "Kabinet Umbridgové"], ["komnata-nejvyssi-potreby.html", "Chodba 7. patra"], ["knihovna.html", "Knihovna"], ["ucebna-premenovani.html", "Přeměňování"], ["ucebna-obrany.html", "Obrana proti černé magii"], ["astronomicka-vez.html", "Astronomická věž"], ["sin-slavy.html", "Síň slávy"], ["velka-sin.html", "Velká síň"], ["ucebna-lektvaru.html", "Lektvary"], ["skleniky.html", "Skleníky"], ["pozemky.html", "Školní pozemky"], ["jezero.html", "Černé jezero"], ["hagriduv-dum.html", "Hagridův dům"], ["hagriduv-dum-uvnitr.html", "Hagridova chýše"], ["vrba-mlaticka.html", "Vrba mlátička"], ["zapovezeny-les.html", "Zapovězený les"], ["famfrpal.html", "Famfrpálové hřiště"], ["tchoricky.html", "Tchoříčci"], ["reditelna.html", "Ředitelna"], ["kolejni-pohar.html", "Kolejní pohár"], ["ucebny.html", "Učebny"], ["turnaje.html", "Turnaje"], ["hry.html", "Hry"]];
 const page=decodeURIComponent(location.pathname.split('/').pop()||'');
 const at=route.findIndex(p=>p[0]===page);if(at===-1)return;
 // Brání zdvojeným navigacím načteným starší verzí skriptu.
 document.querySelectorAll('.castle-side-nav').forEach(el=>el.remove());
 const link=(target,dir)=>{
  if(!target)return;
  const a=document.createElement('a');a.className=`castle-side-nav castle-side-${dir}`;
  a.href=target[0];a.setAttribute('aria-label',(dir==='prev'?'Předchozí':'Další')+' lokace: '+target[1]);
  a.setAttribute('title',target[1]);
  const symbol=document.createElement('span');symbol.className='castle-side-arrow';symbol.textContent=dir==='prev'?'‹':'›';
  const label=document.createElement('small');label.textContent=target[1];
  a.append(symbol,label);document.body.append(a);
 };
 // Ukázat obě boční šipky vždy; z poslední lokace opět na začátek.
 link(route[(at-1+route.length)%route.length],'prev');
 link(route[(at+1)%route.length],'next');
 // Odstranit pouze duplicitní šipky scény, NIKDY reálná místa, tajné průchody či interakce.
 document.querySelectorAll('main a.corridor-way-prev,main a.corridor-way-next').forEach(a=>a.remove());
})();