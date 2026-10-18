/* Volba oslovení dle registrace – respektuje „slečna“ / „pan“. */
(()=>{'use strict';
 function student(){try{return JSON.parse(localStorage.getItem('bradavice_student_v1')||'{}')}catch{return {}}}
 const female=()=>{const s=student();return ['slečna','slečno','girl','female','žena','f','divka','dívka'].includes(String(s.salutation||s.gender||s.pohlavi||'').trim().toLowerCase())};
 window.BradaviceOsloveni={female,choose:(girl,boy)=>female()?girl:boy,
  inflect:t=>String(t).replace(/chtěl\/a/g,female()?'chtěla':'chtěl').replace(/potuloval\/a/g,female()?'potulovala':'potuloval')
 .replace(/mohl\/a/g,female()?'mohla':'mohl').replace(/vrátil\/a/g,female()?'vrátila':'vrátil')
 .replace(/přijal\/a/g,female()?'přijala':'přijal')};
})();