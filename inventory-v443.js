(()=>{
  'use strict';
  const DB=window.BradaviceDB;
  const catalogue={
    harp:{label:'Stará harfa',icon:'🎼',description:'Hudba dokáže uspat Chloupka.'},
    flute:{label:'Kouzelná flétna',icon:'🪈',description:'Alternativní melodie pro Chloupka.'},
    scarf:{label:'Kolejní šála',icon:'🧣',description:'Připomínka domova a koleje.'},
    'silver-key':{label:'Stříbrný klíč',icon:'🗝️',description:'Zatím neobjevený předmět.'},
    'old-scroll':{label:'Starý pergamen',icon:'📜',description:'Zatím neobjevený předmět.'}
  };
  const owned=new Set();let me=null,dbWorking=false,readyResolve;
  const ready=new Promise(resolve=>readyResolve=resolve);
  const storageKey=()=>`bradavice_inventory_v443_${me?.id||'guest'}`;
  function localSet(){try{return JSON.parse(localStorage.getItem(storageKey())||'[]')}catch{return[]}}
  function persist(){if(!me)return;try{localStorage.setItem(storageKey(),JSON.stringify([...owned]))}catch{}}
  function has(id){return owned.has(id)};
  function repaint(){
    const grid=document.getElementById('bagItems');if(grid){grid.replaceChildren();for(const [id,item] of Object.entries(catalogue)){
      const e=document.createElement('div');e.className=`bag-item${has(id)?'':' locked'}`;
      const icon=document.createElement('span');icon.className='bag-emoji';icon.textContent=has(id)?item.icon:'❔';
      const name=document.createElement('strong');name.textContent=has(id)?item.label:'Neznámý předmět';
      const desc=document.createElement('small');desc.textContent=has(id)?item.description:'Zatím nenalezeno';e.append(icon,name,desc);grid.append(e);
    }}
    document.querySelectorAll('[data-inventory-pickup]').forEach(btn=>{btn.hidden=has(btn.dataset.inventoryPickup)})
    window.dispatchEvent(new CustomEvent('bradavice:inventory-updated',{detail:{owned:[...owned]}}));
  }
  async function sync(id){if(!DB?.client||!me)return false;
    const {error}=await DB.client.rpc('v443_collect_item',{p_item_id:id});if(error){console.warn('Batoh: synchronizace zatím není dostupná:',error.message);return false}return true;
  }
  async function collect(id){
    if(!me||!catalogue[id]||has(id))return false;
    // Ulozit mistne jeste pred siti; kdyz spojeni spadne, pri pristi navsteve to zkusime znovu.
    owned.add(id);persist();repaint();
    await sync(id);
    window.BradaviceAchievements?.toast?.(`${catalogue[id].label} je ve tvém kouzelném batohu.`);
    return true;
  }
  function createPanel(){
    if(!me||document.querySelector('.bag-trigger'))return;
    const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='inventory-v443.css?v=443';document.head.append(sheet);
    const trigger=document.createElement('button');trigger.className='bag-trigger';trigger.type='button';trigger.textContent='🎒';trigger.title='Můj kouzelný batoh';trigger.setAttribute('aria-label',trigger.title);
    const overlay=document.createElement('div');overlay.className='bag-overlay';overlay.hidden=true;
    const panel=document.createElement('section');panel.className='bag-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Kouzelný batoh');
    const close=document.createElement('button');close.className='bag-close';close.type='button';close.textContent='×';close.setAttribute('aria-label','Zavřít batoh');
    const title=document.createElement('h2');title.textContent='Kouzelný batoh';const sub=document.createElement('p');sub.textContent='Zvenku obyčejný. Uvnitř mnohem větší, než se zdá.';
    const grid=document.createElement('div');grid.className='bag-items';grid.id='bagItems';const hint=document.createElement('p');hint.className='bag-hint';hint.id='bagHint';
    panel.append(close,title,sub,grid,hint);overlay.append(panel);document.body.append(trigger,overlay);
    function hide(){overlay.hidden=true;document.body.style.overflow='';trigger.focus()}
    trigger.addEventListener('click',()=>{overlay.hidden=false;document.body.style.overflow='hidden';close.focus()});close.addEventListener('click',hide);
    overlay.addEventListener('click',e=>{if(e.target===overlay)hide()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)hide()});
    hint.textContent=dbWorking?'Předměty jsou propojené s tvým studentským účtem.':'Předměty jsou teď uložené místně. Pro synchronizaci na další zařízení je nutná databázová aktualizace.';
    document.addEventListener('click',e=>{const el=e.target.closest?.('[data-inventory-pickup]');if(!el)return;e.preventDefault();collect(el.dataset.inventoryPickup)});
    repaint();
  }
  async function init(){try{
    if(!DB?.client)return;
    const {data,error}=await DB.client.auth.getUser();if(error||!data?.user)return;
    me=data.user;
    for(const id of localSet()){if(catalogue[id])owned.add(id)}
    const legacy=String(me.id).replace(/[^a-zA-Z0-9@._-]/g,'_');
    if(localStorage.getItem(`bradavice_inventory_harp_v4363_${legacy}`)==='owned')owned.add('harp');
    const {data:rows,error:invErr}=await DB.client.from('student_inventory').select('item_id').eq('student_id',me.id);
    if(!invErr){dbWorking=true;for(const row of rows||[]){if(catalogue[row.item_id])owned.add(row.item_id)}}
    if(dbWorking){for(const id of owned)await sync(id)}
    persist();
    createPanel();repaint();
  }catch(e){console.warn('Batoh:',e)}finally{readyResolve()}}
  window.BradaviceInventory={ready,has,collect,items:()=>[...owned]};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
