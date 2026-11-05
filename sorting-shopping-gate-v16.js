/* Noví studenti projdou po přijímacím dopise Příčnou ulicí před rozřazováním.
 * Existujících rozřazených studentů se omezení netýká.
 */
(()=>{'use strict';
  const DIAGON='https://majda171.github.io/bradadavice_pricna_ulice/';
  const STATION=DIAGON+'kings-cross.html';
  const button=document.getElementById('startButton');
  if(!button)return;
  button.disabled=true;
  button.textContent='Ověřuji školní výbavu…';
  function status(title,description,link){
    const intro=document.querySelector('.intro-copy');if(!intro)return;
    document.getElementById('sortingShopStatus')?.remove();
    const panel=document.createElement('section');panel.id='sortingShopStatus';panel.className='sorting-shop-status';
    const h=document.createElement('h2');h.textContent=title;
    const p=document.createElement('p');p.textContent=description;
    panel.append(h,p);
    if(link){const a=document.createElement('a');a.href=link;a.textContent=link===STATION?'Nastoupit na King’s Cross →':'Vydat se do Příčné ulice →';panel.append(a)}
    intro.append(panel);
  }
  (async()=>{
    try{
      const client=window.BradaviceDB?.client;
      if(!client)throw new Error('Není dostupné připojení ke studentské databázi.');
      const {data:user,error:userError}=await client.auth.getUser();
      if(userError)throw userError;
      if(!user?.user)return;
      const {data:profile,error:profileError}=await client.from('profiles').select('house_code').eq('id',user.user.id).single();
      if(profileError)throw profileError;
      if(profile?.house_code){button.disabled=false;button.textContent='Nasadit klobouk';return;}
      const {data:shop,error:shopError}=await client.rpc('v16_shop_state');
      if(shopError)throw shopError;
      if(shop?.schoolReady){
        const {data:station,error:stationError}=await client.rpc('v17_station_status');
        if(stationError)throw stationError;
        if(station?.stationCompleted){button.disabled=false;button.textContent='Nasadit klobouk';return;}
        button.hidden=true;
        status('Ještě cesta do Bradavic','Výbavu už máš. Teď tě čeká nádraží King’s Cross, nástupiště 9¾ a Bradavický expres.',STATION);
        return;
      }
      button.hidden=true;
      status('Nejdřív školní nákupy','Moudrý klobouk počká. Před rozřazováním si musíš obstarat povinnou výbavu v Příčné ulici a nechat ji zkontrolovat Hagridem.',DIAGON);
    }catch(error){
      console.warn('Ověření školní výbavy pro rozřazování',error);
      button.hidden=true;
      status('Postup do školy teď nelze ověřit','Zkus obnovit stránku. V Supabase musejí být spuštěny také nové funkce nádraží (soubor 03_nadrazi_poklady_a_sovi_posta.sql).',null);
    }
  })();
})();
