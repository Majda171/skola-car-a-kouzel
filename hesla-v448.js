/* Bradavice v448 – bezpečné studentské obnovení hesla přes Supabase Auth v2 */
(()=>{'use strict';
  const client=window.BradaviceDB?.client;
  const $=(id)=>document.getElementById(id);
  const setText=(node,text,status)=>{if(!node)return;node.textContent=text;node.dataset.status=status||''};
  const sender=$('requestPasswordForm');
  const returnUrl=()=>new URL('obnoveni-hesla.html',window.location.href).toString();
  if(sender){
    const feedback=$('requestFeedback'),button=$('sendResetButton');
    sender.addEventListener('submit',async e=>{
      e.preventDefault();
      if(!sender.reportValidity())return;
      const email=$('resetEmail').value.trim().toLowerCase();
      button.disabled=true;button.textContent='Posílám zprávu…';setText(feedback,'');
      try{
        if(!client)throw new Error('Připojení teď není dostupné');
        const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:returnUrl()});
        if(error)throw error;
        setText(feedback,'Pokud tento e-mail patří studentskému účtu, přijde na něj odkaz pro nastavení nového hesla. Zkontroluj i Spam.','success');
      }catch(error){
        console.warn('Obnovení hesla – žádost neuspěla:',error?.status||'');
        const tooOften=error?.status===429||/rate limit|too many requests|over_email_send_rate_limit/i.test(error?.message||'');
        setText(feedback,tooOften?'Soví pošta je dočasně přetížená. Počkej chvíli a zkus to později.':'Odkaz se nepodařilo odeslat. Zkus to později, případně kontaktuj správce školy.','error');
      }finally{button.disabled=false;button.textContent='Poslat odkaz soví poštou'}
    });
  }
  const form=$('setPasswordForm');
  if(!form)return;
  const feedback=$('recoveryFeedback'),wait=$('recoveryWait'),result=$('recoveryResult');
  const submit=$('updatePasswordButton'),newPassword=$('newStudentPassword'),confirm=$('confirmStudentPassword');
  const KEY='bradavice_password_recovery_started',ERR='bradavice_password_recovery_error';
  let ready=false,checking=false;
  const eraseRecovery=()=>{try{sessionStorage.removeItem(KEY);sessionStorage.removeItem(ERR)}catch{}};
  const linkWasOpened=()=>{try{return Date.now()-Number(sessionStorage.getItem(KEY)||0)<60*60*1000}catch{return false}};
  function showExpired(){form.hidden=true;wait.hidden=true;setText(feedback,'Odkaz je neplatný nebo už vypršel. Vyžádej si prosím nový odkaz.','error');eraseRecovery();}
  async function verify(){
    if(ready||checking)return;
    checking=true;
    try{
      if(!client){setText(feedback,'Nepodařilo se spojit se školou. Zkontroluj připojení k internetu.','error');wait.hidden=true;return}
      if(!linkWasOpened()){showExpired();return}
      let params=new URLSearchParams(location.search);
      if(params.get('token_hash')&&params.get('type')==='recovery'){
        const {error}=await client.auth.verifyOtp({type:'recovery',token_hash:params.get('token_hash')});
        if(error){showExpired();return}
      }
      const {data:sessionData,error:sessionError}=await client.auth.getSession();
      if(sessionError||!sessionData?.session?.user){showExpired();return}
      const {data,error}=await client.auth.getUser();
      if(error||!data?.user||data.user.id!==sessionData.session.user.id){showExpired();return}
      ready=true;wait.hidden=true;form.hidden=false;setText(feedback,'Odkaz byl ověřen. Teď si můžeš nastavit nové heslo.','success');
      // Remove any URL tokens/codes from browser history only after Supabase has finished consuming them.
      if(location.hash||location.search)history.replaceState(null,'',location.pathname);
      newPassword.focus();
    }catch(e){console.warn('Ověření odkazu se nepodařilo:',e?.name||'');wait.hidden=true;setText(feedback,'Ověření odkazu se nepodařilo. Zkus znovu otevřít odkaz z e-mailu.','error')}
    finally{checking=false}
  }
  if(client){
    client.auth.onAuthStateChange((event)=>{
      if(event==='PASSWORD_RECOVERY'){
        try{sessionStorage.setItem(KEY,String(Date.now()))}catch{}
        setTimeout(verify,0);
      }
    });
  }
  if((()=>{try{return sessionStorage.getItem(ERR)==='1'}catch{return false}})())showExpired();
  else verify();
  $('toggleNewPassword').addEventListener('click',()=>{
    const visible=newPassword.type==='password';
    newPassword.type=visible?'text':'password';confirm.type=visible?'text':'password';
    $('toggleNewPassword').textContent=visible?'Skrýt hesla':'Zobrazit hesla';
    $('toggleNewPassword').setAttribute('aria-pressed',String(visible));
  });
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!ready||!client||!form.reportValidity())return;
    const password=newPassword.value,confirmation=confirm.value;
    if(password!==confirmation){setText(feedback,'Hesla se neshodují.','error');confirm.focus();return}
    if(password.length<8){
      setText(feedback,'Heslo musí mít minimálně 8 znaků.','error');newPassword.focus();return;
    }
    submit.disabled=true;submit.textContent='Ukládám nové heslo…';setText(feedback,'');
    try{
      const {error}=await client.auth.updateUser({password});
      if(error)throw error;
      eraseRecovery();ready=false;form.reset();form.hidden=true;
      newPassword.type='password';confirm.type='password';
      result.hidden=false;
      const p=document.createElement('p');p.textContent='Heslo bylo úspěšně změněno. Ke svému účtu se teď přihlas novým heslem.';
      const a=document.createElement('a');a.href='prihlaseni-student.html';a.textContent='Přejít k přihlášení';
      result.replaceChildren(p,a);setText(feedback,'','');
      try{await client.auth.signOut({scope:'local'})}catch(err){console.warn('Místní odhlášení po obnovení hesla se nepodařilo:',err?.name||'')}
    }catch(error){
      console.warn('Aktualizace hesla se nepodařila:',error?.status||'');
      const raw=String(error?.message||'').toLowerCase();
      setText(feedback,raw.includes('same password')||raw.includes('different')?'Nové heslo musí být jiné než to předchozí.':'Heslo se nepodařilo změnit. Ověř, že odkaz stále platí, a případně si vyžádej nový.','error');
    }finally{submit.disabled=false;submit.textContent='Uložit nové heslo'}
  });
})();
