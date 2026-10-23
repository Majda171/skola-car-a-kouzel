/* Bradavice v468 – boční šipky pouze mezi běžnými lokacemi.
 * Tajné, herní, interiérové a úkolové místnosti jsou přístupné jedině
 * skrz své skutečné klikatelné vchody. Není možné obejít kolejní zkoušky.
 * Seřazení tras: vstupní patro → chodby → sklepení → vyšší patra → pozemky.
 */
(()=>{'use strict';
 const route=[
  [
    "nadvori.html",
    "Nádvoří"
  ],
  [
    "velka-sin.html",
    "Velká síň"
  ],
  [
    "sin-slavy.html",
    "Síň slávy"
  ],
  [
    "chodby.html",
    "Hradní chodby"
  ],
  [
    "chodby-schody.html",
    "Hlavní schodiště"
  ],
  [
    "chodby-portretni-galerie.html",
    "Severní chodba"
  ],
  [
    "chodby-stara-galerie.html",
    "Východní chodba"
  ],
  [
    "chodby-podzemni-1.html",
    "Podzemní chodba"
  ],
  [
    "kuchyne.html",
    "Kuchyně"
  ],
  [
    "ucebna-lektvaru.html",
    "Učebna lektvarů"
  ],
  [
    "chodby-podzemni-2.html",
    "Hluboké sklepení"
  ],
  [
    "chodby-horni.html",
    "Horní chodby"
  ],
  [
    "ucebna-jasnovidectvi.html",
    "Jasnovidectví"
  ],
  [
    "knihovna.html",
    "Knihovna"
  ],
  [
    "ucebna-obrany.html",
    "Obrana proti černé magii"
  ],
  [
    "ucebna-premenovani.html",
    "Přeměňování"
  ],
  [
    "astronomicka-vez.html",
    "Astronomická věž"
  ],
  [
    "pozemky.html",
    "Školní pozemky"
  ],
  [
    "skleniky.html",
    "Skleníky"
  ],
  [
    "jezero.html",
    "Černé jezero"
  ],
  [
    "hagriduv-dum.html",
    "Hagridův dům"
  ],
  [
    "vrba-mlaticka.html",
    "Vrba mlátička"
  ],
  [
    "zapovezeny-les.html",
    "Zapovězený les"
  ],
  [
    "famfrpal.html",
    "Famfrpálové hřiště"
  ]
];
 const page=decodeURIComponent(location.pathname.split('/').pop()||'');
 // Staré šipky vždy odstranit, i na vyloučených stránkách.
 document.querySelectorAll('.castle-side-nav').forEach(el=>el.remove());
 const idx=route.findIndex(item=>item[0]===page);
 if(idx<0)return;
 const scenePrev=document.querySelector('main a.corridor-way-prev[href]');
 const sceneNext=document.querySelector('main a.corridor-way-next[href]');
 const hasSceneDirections=Boolean(scenePrev||sceneNext);
 function destination(source,fallback){
   if(!source)return fallback;
   const href=source.getAttribute('href');
   if(!href||href.startsWith('#')||/^(javascript:|https?:)/i.test(href))return null;
   const name=source.textContent.trim()||route.find(item=>item[0]===href)?.[1]||'Další část hradu';
   return [href,name];
 }
 function arrow(item,side){
   const a=document.createElement('a');
   a.className='castle-side-nav castle-side-'+side;
   a.href=item[0];a.title=item[1];
   a.setAttribute('aria-label',(side==='prev'?'Předchozí':'Další')+' lokace: '+item[1]);
   const icon=document.createElement('span');icon.className='castle-side-arrow';icon.textContent=side==='prev'?'‹':'›';
   const label=document.createElement('small');label.textContent=item[1];
   a.append(icon,label);document.body.appendChild(a);
 }
 // Na konci žádný nelogický teleport na začátek, lze se vracet opačnou šipkou.
 const prev=destination(scenePrev,hasSceneDirections?null:idx>0?route[idx-1]:null);
 const next=destination(sceneNext,hasSceneDirections?null:idx+1<route.length?route[idx+1]:null);
 if(prev)arrow(prev,'prev');
 if(next)arrow(next,'next');
 // Nahrazujeme pouze dva skutečně vykreslené průchody, ostatní vstupy
 // (včetně mapy, kolejí a tajných úkolů) ponecháváme nedotčené.
 if(scenePrev&&prev)scenePrev.remove();
 if(sceneNext&&next)sceneNext.remove();
})();
