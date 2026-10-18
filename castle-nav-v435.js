(()=>{
  const page=location.pathname.split('/').pop()||'';
  const route=[
    'nadvori.html','chodby.html','chodby-schody.html','chodby-portretni-galerie.html','prihlaseniNeb.html',
    'chodby-stara-galerie.html','chodby-podzemni-1.html','prihlaseniMrzimor.html','kuchyne.html','chodby-podzemni-2.html','prihlaseniZmijozel.html',
    'chodby-horni.html','ucebna-jasnovidectvi.html','kabinet-umbridge.html','prihlaseniHavraspar.html','komnata-nejvyssi-potreby.html','knihovna.html','ucebna-premenovani.html','ucebna-obrany.html',
    'astronomicka-vez.html','sin-slavy.html','velka-sin.html','ucebna-lektvaru.html','skleniky.html','pozemky.html','jezero.html','hagriduv-dum.html','vrba-mlaticka.html','zapovezeny-les.html'
  ];
  const names={
    'nadvori.html':'Nádvoří','chodby.html':'Hradní chodby','chodby-schody.html':'Schodiště','chodby-portretni-galerie.html':'Severní chodba','prihlaseniNeb.html':'Stěna s Baculatou dámou',
    'chodby-stara-galerie.html':'Východní chodba','ucebna-jasnovidectvi.html':'Učebna jasnovidectví','nickova-oslava.html':'Nickova oslava','chodby-podzemni-1.html':'Podzemní chodba','prihlaseniMrzimor.html':'Sudy · vstup do Mrzimoru','kuchyne.html':'Stěna u kuchyně','chodby-podzemni-2.html':'Hluboké sklepení','prihlaseniZmijozel.html':'Kamenná stěna · Zmijozel',
    'chodby-horni.html':'Horní galerie','kabinet-umbridge.html':'Kabinet Dolores Umbridgové','prihlaseniHavraspar.html':'Vstup do Havraspáru','komnata-nejvyssi-potreby.html':'Chodba 7. patra','knihovna.html':'Knihovna','ucebna-premenovani.html':'Přeměňování','ucebna-obrany.html':'Obrana proti černé magii',
    'astronomicka-vez.html':'Astronomická věž','sin-slavy.html':'Síň slávy','velka-sin.html':'Velká síň','ucebna-lektvaru.html':'Lektvary','skleniky.html':'Skleníky','pozemky.html':'Pozemky','jezero.html':'Černé jezero','hagriduv-dum.html':'Hagridův dům','vrba-mlaticka.html':'Vrba mlátička','zapovezeny-les.html':'Zapovězený les'
  };
  const i=route.indexOf(page);if(i<0)return;
  const make=(href,dir)=>{if(!href)return null;const a=document.createElement('a');a.className=`castle-side-nav castle-side-${dir}`;a.href=href;a.setAttribute('aria-label',`${dir==='prev'?'Předchozí':'Další'} lokace: ${names[href]||href}`);a.innerHTML=`<span class="castle-side-arrow">${dir==='prev'?'‹':'›'}</span><small>${names[href]||''}</small>`;a.addEventListener('click',()=>document.documentElement.classList.add('castle-leaving'));return a};
  const scenePrev=document.querySelector('main a.corridor-way-prev[href]');
  const sceneNext=document.querySelector('main a.corridor-way-next[href]');
  const prev=make(scenePrev?.getAttribute('href')||route[i-1],'prev');
  const next=make(sceneNext?.getAttribute('href')||route[i+1],'next');
  if(prev)document.body.append(prev);
  if(next)document.body.append(next);
  // Only the side navigation handles previous/next rooms. Keep secret branches as scene hotspots.
  document.querySelectorAll('main a.corridor-way-prev,main a.corridor-way-next,main a.corridor-way.map-return').forEach(a=>a.remove());
  document.querySelectorAll('main a[href]').forEach(a=>{if(a.classList.contains('v451-hotspot')||a.classList.contains('v450a-scene-hotspot'))return;const href=a.getAttribute('href');if((href===prev?.getAttribute('href')||href===next?.getAttribute('href'))&&/corridor-discovery-link|scene-way|continue-link/.test(a.className))a.remove()});
})();
