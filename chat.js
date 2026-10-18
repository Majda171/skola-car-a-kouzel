(()=>{
  const list=document.getElementById('chatList'),form=document.getElementById('chatForm'),input=document.getElementById('chatMessage'),status=document.getElementById('chatStatus'),tabs=[...document.querySelectorAll('[data-scope]')];
  let scope=new URLSearchParams(location.search).get('scope')==='house'?'house':'school',timer=null,channel=null,loading=false,pending=false;
  const DB=window.BradaviceDB;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function fmt(d){try{return new Intl.DateTimeFormat('cs-CZ',{dateStyle:'short',timeStyle:'short'}).format(new Date(d))}catch{return''}}
  async function load(force=false){
    if((document.hidden&&!force)||!DB)return;
    if(loading){pending=true;return}
    loading=true;const requestScope=scope;
    try{
      const rows=await DB.getChatMessages(requestScope,80);
      if(requestScope!==scope)return;
      list.innerHTML=rows.length?rows.slice().reverse().map(x=>`<article class="chat-message"><header><strong>${esc(x.author_name||'Student')} · ${esc(x.house_name||'Bradavice')}</strong><span>${fmt(x.created_at)}</span></header><p>${esc(x.message)}</p></article>`).join(''):'<div class="chat-empty">Zatím tu není žádná zpráva.</div>';
      list.scrollTop=list.scrollHeight;status.textContent='';
    }catch(e){console.error(e);if(requestScope===scope)status.textContent='Chat se nepodařilo načíst. Zkus obnovit stránku.'}
    finally{loading=false;if(pending){pending=false;load()}}
  }
  async function unsubscribe(){
    if(channel&&DB?.client){try{await DB.client.removeChannel(channel)}catch{}channel=null}
  }
  async function subscribe(){
    await unsubscribe();
    if(!DB?.client?.channel)return;
    channel=DB.client.channel(`bradavice-chat-v42-${scope}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'chat_messages'},()=>load())
      .subscribe();
  }
  function setScope(next){
    scope=next==='house'?'house':'school';
    tabs.forEach(b=>b.classList.toggle('active',b.dataset.scope===scope));
    const u=new URL(location.href);u.searchParams.set('scope',scope);history.replaceState(null,'',u);
    load();subscribe();
  }
  tabs.forEach(b=>b.onclick=()=>setScope(b.dataset.scope));
  form.onsubmit=async e=>{
    e.preventDefault();const msg=input.value.trim();if(!msg)return;status.textContent='Odesílám…';
    try{await DB.postChatMessage(scope,msg);if(scope==='house')window.BradaviceAchievements?.award?.('kolejni-hlas',{silent:true});input.value='';await load(true)}
    catch(err){console.error(err);status.textContent=err?.message||'Zprávu se nepodařilo odeslat.'}
  };
  setScope(scope);
  timer=setInterval(()=>load(),12000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)load()});
  window.addEventListener('beforeunload',()=>{clearInterval(timer);unsubscribe()});
})();
