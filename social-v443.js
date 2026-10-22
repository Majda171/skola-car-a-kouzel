(()=>{
  'use strict';
  const $=id=>document.getElementById(id), DB=window.BradaviceDB?.client;
  const tabs=[...document.querySelectorAll('[data-tab]')];
  let me=null, friendships=[], people=[], activePeer='', loadedTab='', poll=null;
  // Zachová rozbalené příspěvky i při automatickém obnovování feedu.
  const expandedWallPosts=new Set();
  const notice=$('socialNotice');
  const show=(msg,isError=false)=>{notice.textContent=msg;notice.style.color=isError?'#f0a497':'#d2be85'};
  const clean=(parent)=>{while(parent.firstChild)parent.removeChild(parent.firstChild)};
  const node=(tag,cls='',value='')=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value)e.textContent=value;return e};
  const fmt=s=>{try{return new Intl.DateTimeFormat('cs-CZ',{dateStyle:'short',timeStyle:'short'}).format(new Date(s))}catch{return ''}};
  function urlFor(str){try{const u=new URL(str);return u.protocol==='https:'?u.href:null}catch{return null}}
  async function requireStudent(){
    if(!DB)throw new Error('Školní pošta teď není dostupná.');
    const {data,error}=await DB.auth.getUser();if(error||!data?.user)throw new Error('Nejdřív se přihlas.');
    me=data.user;
  }
  async function switchTab(which){
    if(!['wall','friends','messages'].includes(which))which='wall';loadedTab=which;
    tabs.forEach(b=>b.classList.toggle('active',b.dataset.tab===which));
    for(const [name,id] of [['wall','wallSection'],['friends','friendsSection'],['messages','messagesSection']])$(id).hidden=name!==which;
    show('');
    if(which==='wall')await loadWall();
    if(which==='friends')await loadFriends();
    if(which==='messages'){await loadFriends(false);await loadMessages()}
  }
  async function loadWall(){
    const {data,error}=await DB.rpc('v443_wall_feed',{p_limit:50});if(error)throw error;
    const wrap=$('wallFeed');clean(wrap);
    if(!data?.length){wrap.append(node('p','','Na nástěnce zatím nikdo nic nepřipnul.'));return}
    for(const p of data){
      const post=node('article','wall-post');const hdr=node('header','post-author-row');
      const avatar=node('div','post-avatar',(p.author_name||'S').trim().charAt(0).toLocaleUpperCase('cs-CZ'));
      avatar.setAttribute('aria-hidden','true');
      const who=node('div','post-author-info');who.append(node('strong','',p.author_name||'Student'));
      const meta=node('div','post-meta');meta.append(node('span','house',p.house_name||'Bradavice'),node('span','post-separator',' · '),node('time','',fmt(p.created_at)));who.append(meta);
      hdr.append(avatar,who);post.append(hdr);
      // Stejně jako na sociálních sítích ukazujeme nejdříve jen čtyři řádky.
      // Vkládáme prostý text, nikoli HTML od ostatních studentů.
      const postId=String(p.id),isExpanded=expandedWallPosts.has(postId);
      const body=node('div','post-body'),content=node('p','post-content',p.message||'');
      if(!isExpanded)content.classList.add('post-content-collapsed');
      const toggle=node('button','post-expand',isExpanded?'Zobrazit méně':'Zobrazit více');
      toggle.type='button';toggle.setAttribute('aria-expanded',String(isExpanded));
      toggle.addEventListener('click',()=>{
        const expand=content.classList.contains('post-content-collapsed');
        content.classList.toggle('post-content-collapsed',!expand);
        if(expand)expandedWallPosts.add(postId);else expandedWallPosts.delete(postId);
        toggle.textContent=expand?'Zobrazit méně':'Zobrazit více';
        toggle.setAttribute('aria-expanded',String(expand));
      });
      body.append(content,toggle);post.append(body);
      const safeLink=p.link_url&&urlFor(p.link_url);if(safeLink){const a=node('a','post-link','🔗 Otevřít přiložený odkaz');a.href=safeLink;a.target='_blank';a.rel='noopener noreferrer nofollow';post.append(a)}
      if(p.image_path){
        const {data:img,error:imgError}=await DB.storage.from('bradavice-wall').createSignedUrl(p.image_path,3600);
        if(!imgError&&img?.signedUrl){const picture=node('img','post-image');picture.src=img.signedUrl;picture.alt='Obrázek přiložený studentem';picture.loading='lazy';post.append(picture)}
      }
      const tools=node('div','post-tools');
      const report=node('button','report-dot','⋯');report.type='button';report.title='Možnosti příspěvku – nahlásit';report.setAttribute('aria-label','Nahlásit příspěvek');report.onclick=()=>{if(confirm('Nahlásit tento příspěvek správci?'))reportContent('post',p.id)};tools.append(report);
      if(p.author_id===me.id){const remove=node('button','','Odstranit');remove.type='button';remove.onclick=async()=>{
        if(!confirm('Opravdu odstranit tento příspěvek?'))return;
        const {error}=await DB.from('v443_wall_posts').delete().eq('id',p.id);if(error){show(error.message,true);return}
        if(p.image_path)await DB.storage.from('bradavice-wall').remove([p.image_path]);
        await loadWall().catch(e=>show(e.message,true));
      };remove.className='post-delete';tools.append(remove)}
      post.append(tools);wrap.append(post);
      // Vykreslená výška rozhodne, zda má příspěvek skutečně skrytý text.
      // Krátké zprávy tak nemají zbytečné tlačítko „Zobrazit více“.
      if(!isExpanded){
        toggle.hidden=content.scrollHeight<=content.clientHeight+2;
      }
    }
  }
  async function reportContent(kind,id){
    const reason=prompt('Proč obsah nahlašuješ? (alespoň 5 znaků)');if(reason===null)return;
    if(reason.trim().length<5){show('Napiš alespoň 5 znaků důvodu.',true);return}
    const {error}=await DB.rpc('v443_report',{p_kind:kind,p_target:id,p_reason:reason.trim()});
    show(error?error.message:'Nahlášení bylo odesláno správci.',Boolean(error));
  }
  async function prepareImage(file){
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024)
      throw new Error('Vyber obrázek JPG, PNG nebo WebP do 8 MB.');
    const bitmap=await createImageBitmap(file);
    const scale=Math.min(1,900/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();
    const compressed=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.72));
    if(!compressed||compressed.size>1048576)throw new Error('Obrázek se nepodařilo zmenšit pod 1 MB. Zkus jiný.');
    // Prekresleni odstrani EXIF metadata z puvodni fotografie.
    return compressed;
  }
  $('wallForm').addEventListener('submit',async e=>{
    e.preventDefault();const form=e.currentTarget,button=form.querySelector('[type=submit]');
    const message=$('wallText').value.trim(),link=$('wallLink').value.trim(),file=$('wallImage').files[0];
    if(!message)return;const safeLink=link?urlFor(link):null;if(link&&!safeLink){show('Odkaz musí začínat https://',true);return}
    button.disabled=true;show('Připínám vzkaz…');let imagePath=null;
    try{
      if(file){const uploadFile=await prepareImage(file);imagePath=`${me.id}/${crypto.randomUUID()}.webp`;
        const {error}=await DB.storage.from('bradavice-wall').upload(imagePath,uploadFile,{contentType:'image/webp',upsert:false});if(error)throw error;
      }
      const {error}=await DB.from('v443_wall_posts').insert({author_id:me.id,message,link_url:safeLink,image_path:imagePath});
      if(error)throw error;
      form.reset();show('Vzkaz je na společné nástěnce.');await loadWall();
    }catch(err){if(imagePath)await DB.storage.from('bradavice-wall').remove([imagePath]);show(err.message||'Příspěvek se nepodařilo přidat.',true)}
    finally{button.disabled=false}
  });
  function relation(id){return friendships.find(f=>f.requester_id===id||f.addressee_id===id)}
  async function loadFriends(render=true){
    const [fr,users,blocks]=await Promise.all([
      DB.from('v443_friendships').select('id,requester_id,addressee_id,status,created_at').order('created_at',{ascending:false}),
      DB.rpc('v443_student_directory',{p_search:$('studentSearch').value.trim(),p_limit:60}),
      DB.from('v443_blocks').select('blocked_id')
    ]);
    if(fr.error)throw fr.error;if(users.error)throw users.error;if(blocks.error)throw blocks.error;
    friendships=fr.data||[];people=users.data||[];
    const blocked=new Set((blocks.data||[]).map(x=>x.blocked_id));
    // Dalsi studenti muzou prijit mimo filtr vyhledavani; jmena neukladame do osobnich cache.
    if(render){
      const req=$('friendsRequests'),dir=$('friendsDirectory');clean(req);clean(dir);
      const incoming=friendships.filter(f=>f.status==='pending'&&f.addressee_id===me.id);
      if(incoming.length){req.append(node('h2','','Čekající žádosti o přátelství'))}
      const personById=id=>people.find(p=>p.id===id);
      for(const f of incoming){
        const p=personById(f.requester_id);const row=node('article','student-row');row.append(node('strong','',p?.display_name||'Spolužák'));
        const actions=node('div','student-actions');
        const accept=node('button','','Přijmout');accept.onclick=()=>friendAction(f.requester_id,'accept');
        const reject=node('button','secondary','Odmítnout');reject.onclick=()=>friendAction(f.requester_id,'remove');actions.append(accept,reject);row.append(actions);req.append(row);
      }
      dir.append(node('h2','','Studenti Bradavic'));
      if(!people.length)dir.append(node('p','','Žádní studenti nebyli nalezeni.'));
      for(const p of people){const row=node('article','student-row');const descr=node('div');descr.append(node('strong','',p.display_name||'Student'),node('small','',p.house_name||'Bradavice'));row.append(descr);
        const actions=node('div','student-actions'),f=relation(p.id);let button;
        if(blocked.has(p.id)){button=node('button','secondary','Odblokovat');button.onclick=()=>friendAction(p.id,'unblock')}
        else if(!f){button=node('button','','Přidat do přátel');button.onclick=()=>friendAction(p.id,'request')}
        else if(f.status==='accepted'){button=node('button','secondary','Odebrat přítele');button.onclick=()=>friendAction(p.id,'remove');
          const write=node('button','','Napsat');write.onclick=async()=>{activePeer=p.id;await switchTab('messages');$('messagePeer').value=p.id;await loadMessages()};actions.append(write)
        } else if(f.requester_id===me.id){button=node('button','secondary','Zrušit žádost');button.onclick=()=>friendAction(p.id,'remove')}
        else {button=node('button','','Přijmout žádost');button.onclick=()=>friendAction(p.id,'accept')}
        actions.append(button);
        if(!blocked.has(p.id)){const block=node('button','secondary','Blokovat');block.onclick=()=>{if(confirm('Zablokovat studenta a ukončit případné přátelství?'))friendAction(p.id,'block')};actions.append(block)}
        row.append(actions);dir.append(row);
      }
    }
    const peers=$('messagePeer');clean(peers);const opt=node('option','','Vyber přítele…');opt.value='';peers.append(opt);
    const list=friendships.filter(f=>f.status==='accepted').map(f=>f.requester_id===me.id?f.addressee_id:f.requester_id);
    for(const id of list){if(blocked.has(id))continue;const person=people.find(p=>p.id===id);const o=node('option','',person?.display_name||`Student ${id.slice(0,8)}`);o.value=id;peers.append(o)}
    if(list.includes(activePeer)&&!blocked.has(activePeer))peers.value=activePeer;
    else{activePeer='';peers.value=''}
  }
  async function friendAction(other,action){
    const {error}=await DB.rpc('v443_friend_action',{p_other:other,p_action:action});
    if(error){show(error.message,true);return}show('Změna přátelství byla uložena.');
    try{await loadFriends();if(loadedTab==='messages')await loadMessages()}catch(e){show(e.message,true)}
  }
  $('searchFriends').addEventListener('submit',e=>{e.preventDefault();loadFriends().catch(err=>show(err.message,true))});
  $('messagePeer').addEventListener('change',()=>{activePeer=$('messagePeer').value;loadMessages().catch(err=>show(err.message,true))});
  async function loadMessages(){
    const wrap=$('dmList');clean(wrap);
    if(!activePeer){wrap.append(node('p','','Vyber přítele a začni konverzaci.'));return}
    const peer=activePeer;
    const match=`and(sender_id.eq.${me.id},recipient_id.eq.${peer}),and(sender_id.eq.${peer},recipient_id.eq.${me.id})`;
    const {data,error}=await DB.from('v443_direct_messages').select('id,sender_id,recipient_id,body,created_at').or(match).order('created_at',{ascending:false}).limit(100);
    if(error)throw error;if(peer!==activePeer)return;
    if(!data?.length){wrap.append(node('p','','Ještě jste si nenapsali žádnou zprávu.'));return}
    for(const m of data.reverse()){
      const mine=m.sender_id===me.id,d=node('article',`dm${mine?' mine':''}`);
      d.append(node('small','',`${mine?'Ty':'Přítel'} · ${fmt(m.created_at)}`),node('p','',m.body));
      const report=node('button','report-dot','⋯');report.type='button';report.title='Nahlásit zprávu';report.setAttribute('aria-label','Nahlásit zprávu');report.onclick=()=>reportContent('message',m.id);d.append(report);wrap.append(d);
    }
    wrap.scrollTop=wrap.scrollHeight;
  }
  $('dmForm').addEventListener('submit',async e=>{
    e.preventDefault();const body=$('dmText').value.trim();if(!activePeer||!body)return;
    const {error}=await DB.from('v443_direct_messages').insert({sender_id:me.id,recipient_id:activePeer,body});
    if(error){show(error.message,true);return} $('dmText').value='';await loadMessages();show('Sova doručila zprávu.');
  });
  tabs.forEach(t=>t.addEventListener('click',()=>switchTab(t.dataset.tab).catch(e=>show(e.message,true))));
  async function init(){try{await requireStudent();await switchTab(new URLSearchParams(location.search).get('tab')||'wall');poll=setInterval(()=>{if(!document.hidden){if(loadedTab==='wall')loadWall().catch(()=>{});if(loadedTab==='messages'&&activePeer)loadMessages().catch(()=>{})}},16000)}catch(err){show('Studentská síť není připravená: '+(err.message||err),true)}}
  window.addEventListener('pagehide',()=>{if(poll)clearInterval(poll)});
  init();
})();
