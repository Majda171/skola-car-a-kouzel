const form=document.getElementById('studentLogin');
const msg=document.getElementById('loginMessage');
form.addEventListener('submit',async e=>{
  e.preventDefault(); msg.textContent='';
  const email=document.getElementById('loginEmail').value.trim().toLowerCase();
  const password=document.getElementById('loginPassword').value;
  const button=form.querySelector('.login-submit');
  button.disabled=true; button.textContent='Otevírám bránu…';
  try{
    if(!window.BradaviceDB?.client) throw new Error('Databázové připojení není dostupné.');
    await window.BradaviceDB.signIn(email,password);
    const student=await window.BradaviceDB.hydrateAll();
    if(!student) throw new Error('Profil studenta se nepodařilo načíst.');
    const access=await window.BradaviceDB.getAccessState();
    if(access?.banned){window.location.href='vylouceni.html';return;}
    const next=new URLSearchParams(location.search).get('next');
    const DIAGON='https://majda171.github.io/bradadavice_pricna_ulice/';
    const STATION=DIAGON+'kings-cross.html';
    // Starší přihlašovací návrat z Příčné ulice může ještě obsahovat původní návrhovou URL.
    const returnToDiagon=next===DIAGON || next==='https://majda171.github.io/pricna-ulice/' || next==='pricna-ulice/index.html';
    if(student.sortingCompleted){window.location.href=returnToDiagon?DIAGON:(next||'hrad.html');return}
    if(returnToDiagon){window.location.href=DIAGON;return}
    try{
      const {data:shop,error:shopError}=await window.BradaviceDB.client.rpc('v16_shop_state');
      if(shopError)throw shopError;
      const shoppingStarted=shop?.grantClaimed || Object.keys(shop?.purchases||{}).length>0;
      if(shop?.schoolReady){
        const {data:station,error:stationError}=await window.BradaviceDB.client.rpc('v17_station_status');
        if(stationError)throw stationError;
        window.location.href=station?.stationCompleted?'rozrazeni.html':STATION;
      }else window.location.href=shoppingStarted?DIAGON:'prijeti.html';
    }catch(error){console.warn('Školní nákupy se nepodařilo ověřit',error);window.location.href='prijeti.html'}
  }catch(error){
    console.error(error);
    const raw=String(error?.message||'').toLowerCase();
    if(raw.includes('invalid login')||raw.includes('invalid credentials')) msg.textContent='E-mail nebo heslo není správné.';
    else msg.textContent='Přihlášení se nepodařilo. Zkontrolujte připojení a zkuste to znovu.';
    button.disabled=false; button.textContent='Vstoupit do Bradavic';
  }
});
