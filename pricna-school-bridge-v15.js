/* Příčná ulice: profil v Bradavicích čte Supabase a na tomto zařízení i místní výbavu. */
(()=>{'use strict';
  const names={hulka_01:'Čarodějova ořechová s ametystem',hulka_02:'Kořenová tisová s měděnou vazbou',hulka_03:'Ošumělá březová',hulka_04:'Ebenová s gotickou rukojetí',hulka_05:'Jasanová s květy',hulka_06:'Runová dubová',hulka_07:'Druidická z vrby',hulka_08:'Třešňová s měděným sluncem',hulka_09:'Stříbrošedá s akvamarínem',hulka_10:'Mahagonová s hadím reliéfem',hulka_11:'Ze zlatého dubu'};
  const petImages={
    mazlicek_sova:'sova_palena.webp',mazlicek_kocka:'kocka_mourovata.webp',mazlicek_ropucha:'ropucha.webp',
    mazlicek_sova_palena_nova:'sova_palena-v17.webp',mazlicek_sova_snezna:'sova_snezna-v17.webp',
    mazlicek_vyr_velky:'vyr_velky-v17.webp',mazlicek_kocka_cerna:'kocka_cerna-v17.webp',
    mazlicek_kocka_mourovata_nova:'kocka_mourovata-v17.webp',mazlicek_kocka_rezava:'kocka_rezava-v17.webp'
  };
  const PET_BASE='https://majda171.github.io/bradadavice_pricna_ulice/zbozi/mazlicci/';
  function getState(){
    try{
      const s=JSON.parse(localStorage.getItem('bradavice_student_v1')||'{}');
      const id=s.supabaseUserId||s.id||s.email;
      const key='bradavice_pricna_ulice_demo_v1'+(id?'_'+String(id).replace(/[^a-zA-Z0-9_-]/g,'_'):'');
      return JSON.parse(localStorage.getItem(key)||'null');
    }catch{return null}
  }
  let remoteState=null;
  const read=()=>remoteState||getState();
  window.BradaviceShop={getState:read,owns:(id)=>{const s=read();return Boolean((s?.schoolPurchases?.[id]||s?.inventory?.[id])>0)},get balance(){return Number(read()?.balance||0)},get wandId(){return read()?.profile?.wandId||''},get pet(){return read()?.profile?.pet||null}};
  function fill(info,state){
    info.replaceChildren();
    const entries=state?[
      ['Galeony',`${Number(state.balance||0)} G`],
      ['Moje hůlka',names[state.profile?.wandId]|| (state.profile?.wandId?'Vybraná hůlka':'Zatím žádná')],
      ['Školní mazlíček',state.profile?.pet?.name||'Zatím žádný'],
      ['Nakoupené položky',`${Object.keys({...state.schoolPurchases,...state.inventory}).length} druhů zboží`],
      ['Nástup do Bradavic',state.schoolReady?'Připravený':'Zbývají nákupy']
    ]:[['Školní výbava','V Příčné ulici zatím nic zakoupeno.']];
    for(const [key,value] of entries){const row=document.createElement('div');row.className='history-row';const k=document.createElement('span');k.textContent=key;const v=document.createElement('strong');v.textContent=value;row.append(k,v);info.append(row)}
    const pet=state?.profile?.pet;
    if(pet?.id&&petImages[pet.id]){
      const card=document.createElement('figure');card.className='diagon-pet-card';
      const img=document.createElement('img');img.src=PET_BASE+petImages[pet.id];img.alt=pet.name||'Můj školní mazlíček';img.loading='lazy';
      const label=document.createElement('figcaption');label.textContent=pet.name||'Můj školní mazlíček';
      card.append(img,label);info.append(card);
    }
  }
  async function loadRemote(info){
    try{
      const db=window.BradaviceDB?.client;if(!db)return;
      const {data:userInfo}=await db.auth.getUser();if(!userInfo?.user)return;
      const {data,error}=await db.rpc('v16_shop_state');if(error)throw error;
      const all=data.purchases||{},schoolPurchases={},inventory={};
      for(const [id,qty] of Object.entries(all)){
        // V profilu ukazujeme všechny položky bez ohledu na typ obchodu.
        schoolPurchases[id]=qty;
      }
      remoteState={balance:data.balance,grantClaimed:data.grantClaimed,schoolPurchases,inventory,
        schoolReady:data.schoolReady,profile:{wandId:data.wandId,pet:data.petId?{id:data.petId,name:data.petName||''}:null}};
      fill(info,remoteState);
      window.dispatchEvent(new CustomEvent('bradavice:shop-synced',{detail:remoteState}));
    }catch(e){console.warn('Účet Příčné ulice – zobrazení profilu',e)}
  }
  function render(){
    const target=document.querySelector('.profile-main');if(!target||document.getElementById('diagonSchoolProfile'))return;
    const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='pricna-school-bridge-v15.css?v=17';document.head.append(sheet);
    const section=document.createElement('section');section.className='profile-panel';section.id='diagonSchoolProfile';
    const kicker=document.createElement('p');kicker.className='kicker';kicker.textContent='Propojená Příčná ulice';
    const title=document.createElement('h2');title.textContent='Moje nákupy a výbava';
    const info=document.createElement('div');info.className='diagon-summary-lines';
    fill(info,getState());
    const link=document.createElement('a');link.href='https://majda171.github.io/bradadavice_pricna_ulice/';link.className='diagon-profile-link';link.textContent='Přejít do Příčné ulice →';
    section.append(kicker,title,info,link);target.prepend(section);
    loadRemote(info);
    window.addEventListener('bradavice:treasure-claimed',()=>loadRemote(info));
    window.addEventListener('bradavice:weasley-delivery',()=>loadRemote(info));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();
