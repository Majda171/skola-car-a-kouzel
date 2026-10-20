/* v463: ozvěna sklepení; uživatel může kdykoliv ztlumit. */
(()=>{'use strict';
const scene=document.querySelector('.corridor-underground-1,.corridor-underground-2');if(!scene)return;
const audio=new Audio('audio/dungeon-echo-v463.mp3');audio.loop=true;audio.volume=.36;audio.preload='auto';
const button=document.createElement('button');button.type='button';button.className='v463-dungeon-sound';
button.textContent='♪ Zapnout ozvěnu sklepení';button.setAttribute('aria-pressed','false');
scene.append(button);
let on=false;
async function play(){try{await audio.play();on=true;button.textContent='♫ Ztlumit ozvěnu sklepení';button.setAttribute('aria-pressed','true')}catch{}}
function pause(){audio.pause();on=false;button.textContent='♪ Zapnout ozvěnu sklepení';button.setAttribute('aria-pressed','false')}
button.addEventListener('click',()=>on?pause():play());
// Prohlížeče nepovolují automatický zvuk bez interakce, proto začne při prvním dotyku hráče.
document.addEventListener('pointerdown',e=>{if(on||e.target===button)return;play()},{once:true});
window.addEventListener('pagehide',()=>{audio.pause();});
})();
