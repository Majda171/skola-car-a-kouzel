/* v449 – trvalé dopisy v oddělené sekci batohu; 8 hlavních míst zůstává. */
(()=>{'use strict';
 const DB=window.BradaviceDB?.client;
 if(!DB)return;
 let uid='',removed=false,has=false,section=null,working=false;
 const localKey=()=>`bradavice_v449_dopis_fred_george_${uid}`;
 const stateKey=()=>`bradavice_fred_george_v446_${uid}`;
 const buttons=(title,cb)=>{const b=document.createElement('button');b.type='button';b.textContent=title;b.onclick=cb;return b};
 function paint(){if(!section)return;section.hidden=!has||removed}
 async function status(){
  if(!uid)return;
  let local={};try{local=JSON.parse(localStorage.getItem(stateKey())||'{}')}catch{}
  has=Array.isArray(local.parts)&&local.parts.length===3;
  try{removed=localStorage.getItem(localKey())==='removed'}catch{}
  try{
   const {data:progress,error:progressErr}=await DB.from('v446_story_progress').select('parts').eq('student_id',uid).maybeSingle();
   if(!progressErr&&progress?.parts?.length===3)has=true;
   if(has){const {error}=await DB.rpc('v449_store_letter');if(error&&!['PGRST202','42883'].includes(error.code))console.info('Dopis zatím není synchronizovaný.',error.message)}
   const {data:letter,error}=await DB.from('v449_student_letters').select('dismissed_at').eq('student_id',uid).maybeSingle();
   if(!error&&letter){has=true;removed=Boolean(letter.dismissed_at);try{localStorage.setItem(localKey(),removed?'removed':'available')}catch{}}
  }catch{}
  paint();
 }
 function openLetter(){if(window.BradaviceStory446?.showLetter){window.BradaviceStory446.showLetter();return}
  // Na jiných stránkách hradu zobrazit stejně laděný pergamen; čas v Praze.
  const now=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Prague',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date());
  const [h,m]=now.split(':').map(Number),when=h*60+m>=975?'zítra':'dnes';
  const overlay=document.createElement('div');overlay.className='v446-note-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
  const paper=document.createElement('section');paper.className='v446-note v446-note-letter';const h2=document.createElement('h2');h2.textContent='Tajný dopis';
  const text=document.createElement('p');text.className='v446-letter-text';text.textContent=`Milý spolupachateli,\n\nposbíral jsi všechny tři útržky. Výtečně!\n\nUmbridgeová opustí kabinet ${when} od 16:00 do 16:15. Její koťátka si mezitím zaslouží pořádnou změnu ovzduší!\n\nVezmi bomby hnojůvky, vplíž se dovnitř a schovej je pod její stůl.\n\nMy jsme tam nebyli. Ty samozřejmě také ne.`;
  const sig=document.createElement('p');sig.className='v446-letter-signature';sig.textContent='Fred a George W.';
  const actions=document.createElement('div');actions.className='v446-note-actions';actions.append(buttons('Zavřít dopis',()=>overlay.remove()));paper.append(h2,text,sig,actions);overlay.append(paper);document.body.append(overlay);
 }
 async function removeLetter(){if(!confirm('Opravdu odstranit dopis od Freda a George z batohu? Splněný úkol zůstane zachovaný.'))return;
  if(working)return;working=true;
  try{const {data,error}=await DB.rpc('v449_dismiss_letter');if(error&&!['PGRST202','42883'].includes(error.code))throw error;
   removed=true;localStorage.setItem(localKey(),'removed');paint();
  }catch(e){alert('Dopis se nepodařilo odstranit. Zkus to později.');console.warn(e)}finally{working=false}
 }
 function mount(){if(section)return;const panel=document.querySelector('.bag-panel');if(!panel)return;
  section=document.createElement('section');section.className='v449-bag-letters';section.hidden=true;
  const title=document.createElement('h3');title.textContent='✉ Dopisy a vzkazy';const note=document.createElement('p');note.textContent='Nezabírají místo v osmimístném batohu.';
  const actions=document.createElement('div');actions.className='v449-letter-actions';actions.append(buttons('📜 Dopis od Freda a George W.',openLetter),buttons('Odstranit dopis',removeLetter));
  section.append(title,note,actions);const hint=panel.querySelector('#bagHint');if(hint)panel.insertBefore(section,hint);else panel.append(section);
  const css=document.createElement('link');css.rel='stylesheet';css.href='v446-story.css?v=449';document.head.append(css);
  const style=document.createElement('style');style.textContent='.v449-bag-letters{border:1px solid #b495665c;border-radius:8px;margin:15px 0;padding:12px;background:#241d1b;color:#f0d8b2}.v449-bag-letters h3{font:700 17px Georgia,serif;margin:0 0 4px}.v449-bag-letters p{font:12px Georgia,serif;margin:0 0 9px;color:#d2c5a8}.v449-letter-actions{display:flex;gap:8px;flex-wrap:wrap}.v449-letter-actions button{background:#7b6241;border:1px solid #c1a477;color:#f9ebd4;border-radius:5px;padding:7px 10px;cursor:pointer;font:13px Georgia,serif}.v449-bag-letters[hidden]{display:none}';document.head.append(style);paint()
 }
 window.addEventListener('bradavice:inventory-updated',()=>{mount();paint()});
 window.addEventListener('bradavice:letter-found',status);
 (async()=>{try{const {data}=await DB.auth.getUser();uid=data?.user?.id||'';if(!uid)return;await status();mount()}catch(e){console.warn('Uložení dopisů:',e)}})();
})();
