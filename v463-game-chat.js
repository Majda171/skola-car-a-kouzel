/* Chat dostupný i při otevřené herní obrazovce a odesílání kódů místností. */
(()=>{'use strict';
function install(){
 const panels=[...document.querySelectorAll('#chessModal .chess-panel,#potionBrewModal .brew-panel,#potionDuelModal .brew-panel,#keeperModal .keeper-panel,#keeperDuelModal .kd-panel,#memoryModal [class*="panel"],#tchorickyModal [class*="panel"]')];
 for(const panel of panels){
   if(panel.querySelector('.v463-game-chat-button'))continue;
   const b=document.createElement('button');b.type='button';b.className='v463-game-chat-button';b.textContent='🦉 Soví pošta · chat';
   b.setAttribute('aria-label','Otevřít soví poštu během hry');
   b.addEventListener('click',async()=>{
     await window.BradaviceQuickChat?.open?.();
     const codes=['kdRoomCode','potionDuelRoomCode','chessRoomCode','memoryRoomCode','tchorickyRoomCode'];
     const code=codes.map(id=>document.getElementById(id)?.textContent?.trim())
       .find(x=>x&&/^[A-F0-9]{6}$/.test(x));
     if(code){
       const input=document.querySelector('#v449-chat-bar .v449-send input');
       if(input&&!input.value.trim())input.value='Připoj se do naší hry. Kód místnosti: '+code;
       input?.focus({preventScroll:true});
     }
   });
   panel.appendChild(b);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
