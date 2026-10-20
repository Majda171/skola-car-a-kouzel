/* v463: společné zvuky obou kotlíkových her; fungují po uživatelském kliknutí. */
(()=>{'use strict';
const base='audio/';
const splash=new Audio(base+'potion-ingredient-v463.mp3');splash.preload='auto';splash.volume=.72;
const bubbling=new Audio(base+'potion-bubbling-v463.mp3');bubbling.preload='auto';bubbling.volume=.37;
let stopTimer=null;
function ingredient(){try{splash.pause();splash.currentTime=0;splash.play().catch(()=>{});}catch{}}
function heat(){try{clearTimeout(stopTimer);bubbling.pause();bubbling.currentTime=0;bubbling.play().catch(()=>{});stopTimer=setTimeout(stop,6800);}catch{}}
function stop(){clearTimeout(stopTimer);bubbling.pause();bubbling.currentTime=0;}
window.BradavicePotionSound={ingredient,heat,stop};
window.addEventListener('pagehide',stop);
})();
