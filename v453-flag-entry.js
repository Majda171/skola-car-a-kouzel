/* v454 – kolejní vstupy: stejná hádanka/sudy/heslo pro vlastní i cizí studenty.
   Odlišné je jen serverové povolení krátké návštěvy cizí společenské místnosti. */
(()=>{'use strict';
 const filename=decodeURIComponent(location.pathname.split('/').pop());
 const config={
  'prihlaseniNeb.html':{house:'N',go:'nebelvir-spolecenska.html'},
  'prihlaseniHavraspar.html':{house:'H',go:'havraspar-spolecenska.html'},
  'prihlaseniMrzimor.html':{house:'M',go:'mrzimor-spolecenska.html'},
  'prihlaseniZmijozel.html':{house:'Z',go:'zmijozel-spolecenska.html'}
 }[filename];if(!config)return;
 let visitor=false;let ready=null;let busy=false;
 const client=window.BradaviceDB?.client;
 async function who(){
  if(!client)return false;
  try{
   const {data,error}=await client.auth.getUser();if(error||!data?.user?.id)return false;
   const {data:profile,error:err}=await client.from('profiles').select('house_code,banned_at').eq('id',data.user.id).maybeSingle();
   if(err||profile?.banned_at)return false;
   visitor=Boolean(profile?.house_code&&profile.house_code!==config.house);
   document.body.classList.toggle('v454-foreign-entry',visitor);
   return visitor;
  }catch(e){console.warn('Ověření koleje:',e);return false;}
 }
 ready=who();
 async function guestCheck(answer,success){
  if(busy)return;busy=true;
  const msg=document.getElementById('errorMessage');
  if(msg){msg.classList.add('show');msg.textContent='Vstupní kouzlo se ověřuje…';}
  try{
   if(!client)throw Error('Školní evidence není dostupná.');
   const {data,error}=await client.rpc('v453_flag_guess',{p_target_house:config.house,p_guess:answer});if(error)throw error;
   if(data?.ok){
    if(msg)msg.textContent='Správně! Vstup do společenské místnosti je otevřen.';
    if(config.house==='H')window.BradaviceAchievements?.award('orli-hadanka');
    if(config.house==='N')window.BradaviceAchievements?.award('dama-otevrela');
    if(config.house==='Z')window.BradaviceAchievements?.award('septane-heslo');
    if(success)success();
    setTimeout(()=>location.assign(config.go),config.house==='M'?950:500);return;
   }
   if(msg){msg.textContent=data?.locked?'Dnes už žádný další pokus.':`Nesprávné řešení. Zbývá pokusů: ${data?.remaining??'?'}.`;}
  }catch(e){if(msg)msg.textContent='Přístup se nepodařilo ověřit: '+(e.message||'chyba');}
  finally{busy=false;}
 }
 window.BradaviceGuestEntry={
  get isVisitor(){return visitor;},
  async complete(answer,success){await ready;if(visitor)return guestCheck(answer,success);success?.();}
 };
 const form=document.getElementById('loginForm');
 if(form){form.addEventListener('submit',async e=>{
  await ready; if(!visitor)return;
 },false);
 // capture je nutný, protože původní setupPasswordForm má svou validaci.
 form.addEventListener('submit',function(e){
  if(!visitor)return;
  e.preventDefault();e.stopImmediatePropagation();
  const answer=document.getElementById('password')?.value?.trim()||'';
  if(answer)guestCheck(answer);
 },true);
 }
})();