/* Bradavice v453b — heslo od Protivy se zkouší až u SKUTEČNÉHO vstupu do koleje.
   Cizí návštěva pouze do společenské místnosti; RPC ověřuje heslo a uděluje 20 minut přístupu. */
(()=>{'use strict';
 const file=decodeURIComponent(location.pathname.split('/').pop());
 const entrances={
  'prihlaseniNeb.html':{house:'N',name:'Nebelvír',target:'#portraitTrigger',go:'nebelvir-spolecenska.html'},
  'prihlaseniHavraspar.html':{house:'H',name:'Havraspár',target:'#eagleTrigger',go:'havraspar-spolecenska.html'},
  'prihlaseniMrzimor.html':{house:'M',name:'Mrzimor',target:'.sud',go:'mrzimor-spolecenska.html'},
  'prihlaseniZmijozel.html':{house:'Z',name:'Zmijozel',target:'#secretWall',go:'zmijozel-spolecenska.html'}
 };
 const info=entrances[file];if(!info)return;
 const client=window.BradaviceDB?.client;
 let visitor=false,checked=false,submitting=false;
 const scene=document.querySelector('.entry-page .scene');if(!scene)return;
 const panel=document.createElement('section');panel.className='v453-visitor-password';panel.hidden=true;
 panel.innerHTML='<h2>Vstup do koleje</h2><form class="v453-visitor-form"><label for="v453VisitorGuess">Vyslov heslo</label><input id="v453VisitorGuess" maxlength="80" autocomplete="off" required><button type="submit">Vyslovit heslo</button></form><p class="v453-visitor-message" aria-live="polite"></p>';
 scene.append(panel);
 const text=panel.querySelector('.v453-visitor-message');const input=panel.querySelector('input');const submit=panel.querySelector('button');
 function open(){panel.hidden=false;input.focus({preventScroll:true});}
 function showPeeves(message){document.querySelector('.v453-peeves-prank')?.remove();
  const overlay=document.createElement('div');overlay.className='v453-peeves-prank';
  const box=document.createElement('section');const pic=document.createElement('img');pic.src='img/ghost-protiva.webp';pic.alt='Protiva';
  const p=document.createElement('p');p.textContent=message;
  const close=document.createElement('button');close.type='button';close.textContent='Protiva se rozchechtá a zmizí';close.addEventListener('click',()=>{overlay.remove();input.focus();});
  box.append(pic,p,close);overlay.append(box);document.body.append(overlay);close.focus();
 }
 panel.querySelector('form').addEventListener('submit',async e=>{
  e.preventDefault();if(!visitor||submitting)return;submitting=true;submit.disabled=true;text.textContent='Strážce ověřuje heslo…';
  try{
   if(!client)throw Error('Školní evidence není dostupná.');
   const {data,error}=await client.rpc('v453_flag_guess',{p_target_house:info.house,p_guess:input.value.trim()});if(error)throw error;
   if(data?.ok){text.textContent='Dveře se otevřely! Najdi vlajku dřív, než návštěva vyprší.';location.assign(info.go);return;}
   text.textContent=data?.locked?'Dnes už další hesla zkoušet nemůžeš. Přijď zítra.':`Heslo není správné. Zbývá pokusů: ${data?.remaining??'?'}.`;
   showPeeves(data?.locked?'„CHÁ CHÁ! Už žádné pokusy! Přijď zítra, ty potrhlý tajtrlíku!“':'„CHÁ CHÁ CHÁ! Nachytal jsem tě! Tys mi opravdu věřil? Ty potrhlý tajtrlíku!“');
  }catch(err){text.textContent='Heslo nebylo ověřeno: '+(err.message||'neznámá chyba')}
  finally{submitting=false;submit.disabled=false;}
 });
 // Vlastní studentský vstup necháváme zcela beze změny. Přes změnu lokálního profilu
 // nelze získat právo hosta – databáze ověřuje přihlášeného uživatele.
 const triggerNodes=()=>Array.from(document.querySelectorAll(info.target));
 const catchVisitor=e=>{if(!visitor)return;e.preventDefault();e.stopImmediatePropagation();if(!panel.hidden&&!e.target.closest(info.target))return;open();};
 triggerNodes().forEach(el=>el.addEventListener('click',catchVisitor,true));
 async function check(){try{
   if(!client)throw Error('Supabase není dostupná.');
   const {data,error}=await client.auth.getUser();if(error)throw error;const id=data?.user?.id;if(!id)throw Error('Student není přihlášen.');
   const {data:profile,error:err}=await client.from('profiles').select('house_code,banned_at').eq('id',id).maybeSingle();if(err)throw err;
   if(profile&&!profile.banned_at&&profile.house_code&&profile.house_code!==info.house){visitor=true;
    document.body.classList.add('v453-foreign-entry');
    // Jen ve vlastním pokoji funguje běžný kolejní mechanismus.
    const nativeForm=document.getElementById('loginForm');if(nativeForm){nativeForm.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();open();},true);}
   }
  }catch(e){console.warn('Ověření cizího kolejního vstupu:',e.message)}
  finally{checked=true;}
 }
 check();
})();
