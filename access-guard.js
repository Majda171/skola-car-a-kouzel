/* Bradavice v448b – spolehliva kontrola prihlaseni bez nahodneho odhlasovani. */
(() => {
  'use strict';
  const root = document.documentElement;
  const page = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
  const publicPages = new Set([
    'index.html','registrace.html','prihlaseni-student.html',
    'zapomenute-heslo.html','obnoveni-hesla.html','admin-login.html','vylouceni.html'
  ]);
  if (publicPages.has(page) || page.startsWith('admin')) return;

  // Stranka zustane zamcena az do skutecneho overeni na serveru.
  root.classList.add('access-pending');
  const next = encodeURIComponent(page + (location.search || '') + (location.hash || ''));
  const loginUrl = `prihlaseni-student.html?next=${next}`;
  let completed = false;
  let attemptNo = 0;
  let panelText = '';
  let panelRetry = false;
  let panelVisible = false;
  let panel = null;

  function renderPanel() {
    if (!panelVisible || completed) return;
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', renderPanel, {once:true});
      return;
    }
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'bradavice-access-status';
      panel.setAttribute('role','status');
      panel.setAttribute('aria-live','polite');
      const title = document.createElement('h2');
      title.textContent = 'Brána Bradavic';
      const text = document.createElement('p');
      text.className = 'access-status-message';
      const buttons = document.createElement('div');
      buttons.className = 'access-status-actions';
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'access-status-retry';
      retry.textContent = 'Zkusit znovu';
      retry.addEventListener('click',()=>runVerification());
      const signin = document.createElement('a');
      signin.href = loginUrl;
      signin.textContent = 'Přejít k přihlášení';
      buttons.append(retry,signin);
      panel.append(title,text,buttons);
      document.body.append(panel);
    }
    panel.querySelector('.access-status-message').textContent = panelText;
    panel.querySelector('.access-status-retry').hidden = !panelRetry;
    panel.hidden = false;
  }

  function status(message, retry=false) {
    if (completed) return;
    panelVisible = true;
    panelText = message;
    panelRetry = retry;
    renderPanel();
  }

  function finish(url=null) {
    if (completed) return;
    completed = true;
    attemptNo += 1;
    panel?.remove();
    panel = null;
    if (url) location.replace(url);
    else root.classList.remove('access-pending');
  }

  const hasStoredSession = () => {
    try {
      return Object.keys(localStorage).some(k => /^sb-[a-z0-9]+-auth-token/.test(k));
    } catch { return false; }
  };

  async function verify(id) {
    const current = () => !completed && id===attemptNo;
    const DB = window.BradaviceDB;
    const client = DB?.client;
    if (!client) {
      if (current()) status('Připojení k Supabase se nepodařilo načíst. Zkus obnovit stránku nebo ověření zopakovat.',true);
      return;
    }
    let sessionUser;
    try {
      const {data,error} = await client.auth.getSession();
      if (!current()) return;
      if (error) throw error;
      if (!data?.session?.user) {
        // Pri obnove tokenu muze zustat lokalni zaznam; nerozhodujeme o odhlaseni naslepo.
        if (hasStoredSession()) status('Přihlášení se zatím nepodařilo obnovit. Zkus ověření znovu.',true);
        else finish(loginUrl);
        return;
      }
      sessionUser=data.session.user;
    } catch (err) {
      if (current()) status('Připojení je pomalé nebo dočasně nedostupné. Student zůstává přihlášený; zkus to znovu.',true);
      console.warn('Bradavice: getSession se nepodarilo overit.',err);
      return;
    }
    try {
      const {data,error}=await client.auth.getUser();
      if (!current()) return;
      if (error) throw error;
      if (!data?.user || data.user.id !== sessionUser.id) {
        status('Účet se nepodařilo bezpečně ověřit. Zkus obnovit přihlášení.',true);
        return;
      }
      const verifiedUser=data.user;
      const {data:profile,error:profileError}=await client.from('profiles')
        .select('house_code,is_admin,banned_at,ban_reason')
        .eq('id',verifiedUser.id).maybeSingle();
      if (!current()) return;
      if (profileError) throw profileError;
      if (!profile) {
        status('Studentský profil nebyl nalezen. Zkus opakovat ověření nebo se přihlásit znovu.',true);
        return;
      }
      if (profile.banned_at) {finish('vylouceni.html');return;}
      const sortingPages = new Set([
        'prijeti.html','rozrazeni.html','Nebelvir.html',
        'Havraspar.html','Mrzimor.html','Zmijozel.html'
      ]);
      if (!profile.house_code && !profile.is_admin && !sortingPages.has(page)) {
        finish('rozrazeni.html');return;
      }
      try { await DB.hydrateStudent?.({user:verifiedUser,profile}); }
      catch (err) {console.warn('Bradavice: nepodarilo se obnovit lokalni HUD; vstup uz byl overen.',err);}
      if (current()) finish();
    } catch (err) {
      if (current()) status('Ověření účtu nebo profilu se nezdařilo. Tvůj účet nebyl odhlášen; zkus to znovu.',true);
      console.warn('Bradavice: docasna chyba pri overovani studenta.',err);
    }
  }

  function runVerification() {
    if (completed) return;
    const id=++attemptNo;
    panelVisible=false;
    if(panel)panel.hidden=true;
    // Pomalý server nesmí studenta po osmi sekundách automaticky vykopnout.
    const slowTimer=setTimeout(()=>{
      if (!completed && id===attemptNo) status('Ověřuji studentský účet. Supabase odpovídá pomaleji, než je obvyklé…',false);
    },4500);
    const retryTimer=setTimeout(()=>{
      if (!completed && id===attemptNo) status('Ověření trvá příliš dlouho. Zkus jej znovu; rozehrané úkoly v databázi zůstanou zachované.',true);
    },18000);
    Promise.resolve(verify(id)).finally(()=>{
      clearTimeout(slowTimer);
      clearTimeout(retryTimer);
    });
  }

  // INITIAL_SESSION s prázdnou session není odhlášení. Na tento počáteční
  // stav nesmíme reagovat přesměrováním.
  try {
    window.BradaviceDB?.client?.auth?.onAuthStateChange?.((event)=>{
      if (event==='SIGNED_OUT') finish(loginUrl);
    });
  } catch (err) {console.warn('Bradavice: nelze sledovat změnu session.',err);}
  runVerification();
})();
