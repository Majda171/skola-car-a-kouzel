/* Bradavice v479: prostorove oddelene trasy hradu, tajne lokace mimo navigaci. */
(()=>{'use strict';
 const routes=[
  ['nadvori.html','velka-sin.html','sin-slavy.html','chodby.html','chodby-schody.html'],
  ['chodby-portretni-galerie.html','chodby-stara-galerie.html','chodby-podzemni-1.html','kuchyne.html','ucebna-lektvaru.html','chodby-podzemni-2.html'],
  ['chodby-horni.html','kabinet-umbridge.html','ucebna-jasnovidectvi.html','knihovna.html','divci-umyvarna.html','ucebna-obrany.html','ucebna-premenovani.html','astronomicka-vez.html'],
  ['pozemky.html','skleniky.html','jezero.html','hagriduv-dum.html','vrba-mlaticka.html','zapovezeny-les.html','famfrpal.html']
 ];
 const labels={
  'nadvori.html':'Nádvoří','velka-sin.html':'Velká síň','sin-slavy.html':'Síň slávy','chodby.html':'Hradní chodby',
  'chodby-schody.html':'Hlavní schodiště','chodby-portretni-galerie.html':'Severní chodba',
  'chodby-stara-galerie.html':'Východní chodba','chodby-podzemni-1.html':'Podzemní chodba',
  'kuchyne.html':'Kuchyně','ucebna-lektvaru.html':'Učebna lektvarů','chodby-podzemni-2.html':'Hluboké sklepení',
  'chodby-horni.html':'Chodba třetího poschodí','kabinet-umbridge.html':'Kabinet Umbridgeové',
  'ucebna-jasnovidectvi.html':'Jasnovidectví','knihovna.html':'Knihovna','divci-umyvarna.html':'Dívčí umývárna',
  'ucebna-obrany.html':'Obrana proti černé magii','ucebna-premenovani.html':'Přeměňování',
  'astronomicka-vez.html':'Astronomická věž','pozemky.html':'Školní pozemky','skleniky.html':'Skleníky',
  'jezero.html':'Černé jezero','hagriduv-dum.html':'Hagridův dům','vrba-mlaticka.html':'Vrba mlátička',
  'zapovezeny-les.html':'Zapovězený les','famfrpal.html':'Famfrpálové hřiště',
  'prihlaseniNeb.html':'Vstup do Nebelvíru','prihlaseniMrzimor.html':'Vstup do Mrzimoru',
  'prihlaseniZmijozel.html':'Vstup do Zmijozelu','prihlaseniHavraspar.html':'Vstup do Havraspáru'
 };
 const entrances={
  'prihlaseniNeb.html':'chodby-portretni-galerie.html',
  'prihlaseniMrzimor.html':'chodby-podzemni-1.html',
  'prihlaseniZmijozel.html':'chodby-podzemni-2.html',
  'prihlaseniHavraspar.html':'chodby-horni.html'
 };
 const page=decodeURIComponent(location.pathname.split('/').pop()||'');
 document.querySelectorAll('.castle-side-nav').forEach(n=>n.remove());
 const row=routes.find(r=>r.includes(page)),idx=row?row.indexOf(page):-1;
 function arrow(href,side){
  const a=document.createElement('a');
  a.className='castle-side-nav castle-side-'+side;a.href=href;a.title=labels[href];
  a.setAttribute('aria-label','Přejít: '+labels[href]);
  const i=document.createElement('span');i.className='castle-side-arrow';
  i.textContent=side==='prev'?'‹':side==='next'?'›':'⌄';
  const t=document.createElement('small');t.textContent=labels[href];
  a.append(i,t);document.body.appendChild(a);
 }
 if(row){
  if(idx>0)arrow(row[idx-1],'prev');
  else if(page==='chodby-portretni-galerie.html'||page==='chodby-horni.html')arrow('chodby-schody.html','prev');
  else if(page==='pozemky.html')arrow('nadvori.html','prev');
  if(idx<row.length-1)arrow(row[idx+1],'next');
  if(page==='chodby-schody.html')arrow('chodby-horni.html','next');
  // Schodiste je skutecne rozcesti; nevede primo ze sklepeni do veze.
  if(page==='chodby-schody.html')arrow('chodby-portretni-galerie.html','branch');
  if(page==='nadvori.html')arrow('pozemky.html','branch');
  // Kolejni vstupy jsou slepe odbocky, nikoli pruchozi chodby.
  if(page==='chodby-portretni-galerie.html')arrow('prihlaseniNeb.html','branch');
  if(page==='chodby-podzemni-1.html')arrow('prihlaseniMrzimor.html','branch');
  if(page==='chodby-podzemni-2.html')arrow('prihlaseniZmijozel.html','branch');
  if(page==='chodby-horni.html')arrow('prihlaseniHavraspar.html','branch');
 }else if(entrances[page])arrow(entrances[page],'prev');
 if(row||entrances[page])
  document.querySelectorAll('main a.corridor-way-prev,main a.corridor-way-next').forEach(a=>a.remove());
})();
