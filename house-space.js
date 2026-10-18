(() => {
  const house = document.body.dataset.house;
  const type = document.body.dataset.space;
  const STUDENT_KEY='bradavice_student_v1';
  const dashboards={N:'Nebelvir.html',H:'Havraspar.html',M:'Mrzimor.html',Z:'Zmijozel.html'};
  const names={N:'Nebelvír',H:'Havraspár',M:'Mrzimor',Z:'Zmijozel'};
  const otherPages={
    N:{lounge:'nebelvir-spolecenska.html',bedroom:'nebelvir-loznice.html'},
    H:{lounge:'havraspar-spolecenska.html',bedroom:'havraspar-loznice.html'},
    M:{lounge:'mrzimor-spolecenska.html',bedroom:'mrzimor-loznice.html'},
    Z:{lounge:'zmijozel-spolecenska.html',bedroom:'zmijozel-loznice.html'}
  };
  const readStudent=()=>{try{return JSON.parse(localStorage.getItem(STUDENT_KEY))}catch{return null}};
  async function ensureAccess(){
    // Autorizace se NIKDY neodvozuje z localStorage, který lze ručně změnit.
    // I hostovaný přístup ke vlajce musí potvrdit Supabase pro přihlášeného uživatele.
    let ok=false,guest=false;
    const db=window.BradaviceDB?.client;
    if(db){
      try{
        const {data:authData,error:authError}=await db.auth.getUser();
        if(authError)throw authError;
        const uid=authData?.user?.id;
        if(uid){
          const {data:profile,error:profileError}=await db.from('profiles')
            .select('house_code,banned_at').eq('id',uid).maybeSingle();
          if(profileError)throw profileError;
          if(profile&&!profile.banned_at){
            if(profile.house_code===house)ok=true;
            else if(type==='lounge'){
              const {data:allowed,error:visitError}=await db.rpc('v453_flag_can_enter',{p_target_house:house});
              if(!visitError&&allowed===true){ok=true;guest=true;}
            }
          }
        }
      }catch(err){console.warn('Kolejní vstup se nepodařilo ověřit.',err)}
    }
    document.body.classList.remove('loading');
    document.body.classList.add('access-ready');
    if(guest){
      document.body.classList.add('house-guest');
      const sw=document.getElementById('switchSpace');if(sw)sw.hidden=true;
      document.querySelectorAll('.house-chat-door').forEach(el=>el.hidden=true);
      const dashboard=document.getElementById('houseDashboard');if(dashboard)dashboard.href='vlajkova-vyprava.html';
    }
    if(!ok){
      document.body.classList.add('house-locked');
      const name=document.getElementById('lockedHouseName');
      if(name)name.textContent=names[house]||'této koleje';
    }
  }
  ensureAccess();

  const dashboard=document.getElementById('houseDashboard');
  if(dashboard&&!document.body.classList.contains('house-guest')) dashboard.href=dashboards[house]||'koleje.html';
  const switchLink=document.getElementById('switchSpace');
  if(switchLink){
    const target=type==='lounge'?'bedroom':'lounge';
    switchLink.href=otherPages[house]?.[target]||dashboards[house];
    switchLink.textContent=target==='bedroom'?'Do ložnice':'Do společenské místnosti';
  }

  const toast=document.getElementById('magicToast');
  let timer;
  function say(text){
    if(!toast)return;
    toast.textContent=text;toast.classList.add('show');
    clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove('show'),2800);
  }

  document.querySelectorAll('.interactive-prop').forEach(prop=>{
    prop.addEventListener('click',()=>{
      const action=prop.dataset.action||'glow';
      prop.classList.remove('glow','shake');void prop.offsetWidth;
      if(action==='chest'){
        const img=prop.querySelector('img');
        const open=prop.dataset.open==='1';
        img.src=open?'img/prop-chest-closed.webp':'img/prop-chest-open.webp';
        prop.dataset.open=open?'0':'1';
        prop.classList.add('glow');
      }else if(action==='mandrake'){
        prop.classList.add('shake');
      }else{
        prop.classList.add(action==='shake'?'shake':'glow');
      }
      say(prop.dataset.message||'Něco v místnosti zareagovalo na tvou hůlku.');
      try{localStorage.setItem(`bradavice_house_interaction_v30_${house}_${type}_${prop.dataset.id||action}`,'1')}catch{}
    });
  });
})();
