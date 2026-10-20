/* Bradavice v449: lišta dostupná během hry; pouze přátelé a RLS na serveru. */
(()=>{'use strict';
 if(document.querySelector('#v449-chat-bar'))return;
 const quickmailBase=document.currentScript?.src ? new URL('.',document.currentScript.src).href : new URL('.',location.href).href;
 const client=window.BradaviceDB?.client;
 if(!client)return;
 let me=null,peers=[],peer='',unread=new Set(),lastSeen=new Set(),started=false,busy=false;
 const el=(tag,cls='',txt='')=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt)e.textContent=txt;return e};
 const bar=el('aside','v449-chat-bar');bar.id='v449-chat-bar';bar.setAttribute('aria-label','Kouzelnická soví pošta');
 const toggle=el('button','v449-chat-toggle','🦉 Soví pošta');toggle.type='button';toggle.setAttribute('aria-expanded','false');
 const badge=el('span','v449-unread');badge.hidden=true;toggle.append(badge);
 const panel=el('section','v449-chat-panel');panel.hidden=true;
 const heading=el('div','v449-chat-heading');const title=el('strong','','Soukromá soví pošta');const close=el('button','v449-x','×');close.setAttribute('aria-label','Sbalit soví poštu');heading.append(title,close);
 const select=el('select');select.setAttribute('aria-label','Vyber přítele');const messages=el('div','v449-messages');messages.setAttribute('aria-live','polite');
 const invite=el('button','v449-invite','⚔️ Vložit kód hry');invite.type='button';
 invite.onclick=()=>{
   const known=['kdRoomCode','potionDuelRoomCode','chessRoomCode','memoryRoomCode','tchorickyRoomCode']
     .map(id=>document.getElementById(id)?.textContent?.trim())
     .find(c=>c&&/^[A-F0-9]{6}$/.test(c));
   const code=known||prompt('Zadej kód herní místnosti, který chceš poslat kamarádovi:');
   if(code===null)return;const safe=code.trim().slice(0,80);if(!safe)return;
   input.value='Připoj se ke mně do hry! Kód místnosti: '+safe;input.focus();
  };
 const form=el('form','v449-send');const input=el('input');input.required=true;input.maxLength=1000;input.placeholder='Napiš zprávu nebo kód duelu…';input.setAttribute('aria-label','Zpráva');
 const send=el('button','','Odeslat');send.type='submit';form.append(input,send);
 const feedback=el('p','v449-feedback');feedback.setAttribute('role','status');const link=el('a','v449-all','Nástěnka · Přátelé · Všechny dopisy ↗');link.href=new URL('social.html?tab=messages',quickmailBase).href;
 panel.append(heading,select,invite,messages,form,feedback,link);bar.append(toggle,panel);document.body.append(bar);
 const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('v449-quickmail.css?v=463',quickmailBase).href;document.head.append(css);
 const open=async()=>{panel.hidden=false;toggle.setAttribute('aria-expanded','true');await ready();await loadFriends();await loadMessages();input.focus({preventScroll:true})};
 const shut=()=>{panel.hidden=true;toggle.setAttribute('aria-expanded','false')};
 toggle.onclick=()=>panel.hidden?open():shut();close.onclick=shut;
 function setNotice(message){feedback.textContent=message}
 async function ready(){if(me)return true;const {data,error}=await client.auth.getUser();if(error||!data?.user){setNotice('Přihlas se jako student.');return false}me=data.user;return true}
 async function loadFriends(){if(!me)return;
  const {data,error}=await client.from('v443_friendships').select('requester_id,addressee_id,status').eq('status','accepted');
  if(error){setNotice('Přátele se nepodařilo načíst.');return}
  peers=(data||[]).map(f=>f.requester_id===me.id?f.addressee_id:f.addressee_id===me.id?f.requester_id:null).filter(Boolean);
  select.replaceChildren();const first=el('option','','Vyber přítele…');first.value='';select.append(first);
  let names=[];try{const {data:directory}=await client.rpc('v443_student_directory',{p_search:'',p_limit:60});names=directory||[]}catch{}
  for(const id of peers){const p=names.find(x=>x.id===id);const option=el('option','',p?.display_name||'Student '+id.slice(0,8));option.value=id;select.append(option)}
  if(peers.includes(peer))select.value=peer;else{peer=peers[0]||'';select.value=peer}
  if(!peers.length)setNotice('Nejdřív přijmi nebo pošli žádost o přátelství.');
 }
 async function loadMessages(){if(!me||!peer){messages.textContent='Vyber přítele.';return}
  const chosen=peer;const filter=`and(sender_id.eq.${me.id},recipient_id.eq.${chosen}),and(sender_id.eq.${chosen},recipient_id.eq.${me.id})`;
  const {data,error}=await client.from('v443_direct_messages').select('id,sender_id,body,created_at').or(filter).order('created_at',{ascending:false}).limit(40);
  if(chosen!==peer)return;if(error){setNotice('Konverzaci se nepodařilo načíst.');return}
  messages.replaceChildren();for(const m of (data||[]).reverse()){
   const msg=el('div','v449-bubble'+(m.sender_id===me.id?' mine':''));msg.append(el('span','',m.body));messages.append(msg)
  }
  messages.scrollTop=messages.scrollHeight;
  // Dokončení čtení je serverově potvrzené; pokud SQL chybí, existující zprávy stále fungují.
  try{await client.rpc('v449_mark_read',{p_peer:peer})}catch{}
  await checkUnread();
 }
 async function checkUnread(){if(busy||!me||document.hidden)return;busy=true;
  try{
   // Bez RLS účastníků by tento dotaz neměl být povolen. Nenatahuje obsah zpráv.
   let {data,error}=await client.from('v443_direct_messages').select('id,sender_id,created_at,read_at').eq('recipient_id',me.id).is('read_at',null).order('created_at',{ascending:false}).limit(50);
   if(error){const fallback=await client.from('v443_direct_messages').select('id,sender_id,created_at').eq('recipient_id',me.id).order('created_at',{ascending:false}).limit(20);
    if(fallback.error)return;
    const key='bradavice_v449_seen_'+me.id;let seen=[];try{seen=JSON.parse(localStorage.getItem(key)||'[]')}catch{}
    data=(fallback.data||[]).filter(x=>!seen.includes(x.id));
    // Starší verze DB: jen lokální upozornění, ne skutečné potvrzení přečtení.
    if(!started){try{localStorage.setItem(key,JSON.stringify((fallback.data||[]).map(x=>x.id)))}catch{}data=[]}
   }
   const ids=new Set((data||[]).map(x=>x.id));const count=ids.size;
   badge.hidden=count===0;badge.textContent=count>9?'9+':String(count);
   if(started&&[...ids].some(id=>!lastSeen.has(id))){const alert=el('div','v449-toast','🦉 Přiletěla nová soví pošta.');document.body.append(alert);setTimeout(()=>alert.remove(),5200)}
   lastSeen=ids;started=true;
  }catch(e){console.warn('Nová soví pošta:',e)}finally{busy=false}
 }
 select.addEventListener('change',()=>{peer=select.value;loadMessages()});
 form.onsubmit=async e=>{e.preventDefault();const body=input.value.trim();if(!me||!peer||!body)return;
  send.disabled=true;setNotice('Sova je na cestě…');try{const {error}=await client.from('v443_direct_messages').insert({sender_id:me.id,recipient_id:peer,body});if(error)throw error;
   input.value='';await loadMessages();setNotice('Sova doručila zprávu.')
  }catch(e){setNotice(e?.message||'Odeslání selhalo.')}finally{send.disabled=false}
 };
 window.BradaviceQuickChat={open,close:shut};
 ready().then(ok=>{if(ok)checkUnread()});
 const timer=setInterval(async()=>{if(document.hidden)return;if(!me)await ready();await checkUnread();if(!panel.hidden&&peer)await loadMessages()},20000);
 window.addEventListener('pagehide',()=>clearInterval(timer));
})();
