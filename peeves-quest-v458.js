/* Bradavice v459 – druhý úkol Protivy s bezpečným serverovým zápisem bodů.
   Stav a body potvrzuje výhradně Supabase RPC v458_peeves_baron_step.
   Nic se nepřičítá v prohlížeči ani přes localStorage. */
(() => {
  'use strict';
  const page = decodeURIComponent(location.pathname.split('/').pop() || '');
  if (!['chodby.html', 'chodby-podzemni-2.html', 'nickova-oslava.html'].includes(page)) return;
  const host = document.querySelector('main');
  if (!host) return;
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
  const client = window.BradaviceDB?.client;
  let stage = 'new';
  let working = false;

  function dialogue(title, body, buttons, options = {}) {
    document.querySelector('.v457-quest-dialog')?.remove();
    const overlay = document.createElement('div');
    overlay.className = 'v457-quest-dialog';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    const panel = document.createElement('section');
    if (options.compact) panel.classList.add('v457-quest-dialog-compact');

    if (options.portrait?.src) {
      const figure = document.createElement('figure');
      figure.className = 'v457-quest-portrait' + (options.portrait.className ? ` ${options.portrait.className}` : '');
      const img = document.createElement('img');
      img.src = options.portrait.src;
      img.alt = options.portrait.alt || '';
      figure.append(img);
      panel.append(figure);
    }

    const textWrap = document.createElement('div');
    textWrap.className = 'v457-quest-copy';
    const h = document.createElement('h2');
    const p = document.createElement('p');
    const actions = document.createElement('div');
    h.textContent = title;
    p.textContent = body;
    textWrap.append(h, p, actions);
    panel.append(textWrap);
    overlay.append(panel);
    document.body.append(overlay);

    for (const [label, callback] of buttons) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.addEventListener('click', () => {
        if (working) return;
        overlay.remove();
        callback?.();
      });
      actions.append(button);
    }
    actions.querySelector('button')?.focus();
  }

  function errorBox(e, retry) {
    console.warn('Protivovy nekalosti: nepodařilo se uložit krok', e);
    dialogue('Školní evidence',
      'Úkol se teď nepodařilo uložit. Body se nepřipsaly. Zkus to později. ' + (e?.message || ''),
      [['Zkusit znovu', retry], ['Zavřít', null]]);
  }

  async function advance(action, onSuccess) {
    if (working) return;
    if (!client) {
      errorBox(new Error('Databáze není dostupná.'), () => advance(action, onSuccess));
      return;
    }
    working = true;
    try {
      const { data, error } = await client.rpc('v458_peeves_baron_step', { p_action: action });
      if (error) throw error;
      if (!data || typeof data.stage !== 'string') throw new Error('Databáze nevrátila stav úkolu.');
      stage = data.stage;
      onSuccess?.(data);
    } catch (e) {
      errorBox(e, () => advance(action, onSuccess));
    } finally {
      working = false;
    }
  }

  function encounter() {
    advance('start', () => {
      window.BradaviceDungBombs?.blast({ actor: 'protiva', duration: 10200, message: '💥 Protiva právě odpálil bomby hnojůvky!' });
      setTimeout(()=>dialogue('Protivovy nekalosti',
        'Z konce chodby se ozvalo ohlušující PRÁSK! Protiva se chechtá pod stropem a zelený oblak pohlcuje podlahu. „Filchík zuří, Filchík křičí, Protiva mu chodbu ničí!“',
        [['Co se děje?', () => dialogue('Argus Filch',
          '„Ten zatracený poltergeist! Všude ten příšerný zápach! Jestli ho ještě jednou nachytám…“ Filch málem klopýtne přes rozházené bomby hnojůvky.',
          [['Vyjít na chodbu', () => showMcGonagallScene(false)]])]]),1900);
    });
  }

  function mcgonagall() {
    document.querySelector('.v463-mcgonagall-scene')?.remove();
    dialogue('Profesorka McGonagallová',
      '„PROTIVO! Okamžitě toho nechte!“ Protiva jí vyplázne jazyk a zmizí za rohem. Profesorka se obrátí k tobě: „Tohohle ničemu umí zkrotit jedině Krvavý baron. Najdi ho v Síni oslavy úmrtí ve sklepení a vyřiď mu, že jej žádám, aby Protivu opět usměrnil.“',
      [['Rozumím, najdu Krvavého barona', () => advance('seek_baron', () => dialogue('Úkol zapsán', 'Krvavého barona musíš najít sám. Hledej cestu do Síně oslavy úmrtí v hlubokém sklepení.', [['Vydat se na cestu', null]]))]],
      { portrait: { src: 'img/mcgonagall-v42.webp', alt: 'Profesorka McGonagallová', className: 'is-mcgonagall' } });
  }

  function baron() {
    dialogue('Krvavý baron',
      '„Kdo ruší klid mrtvých?“ Baronův hlas se rozlehne síní. Vyřídíš mu vzkaz profesorky McGonagallové. „Protiva,“ zopakuje a na okamžik sklopí oči. „Ten duch nezná hranice. Už dávno zapomněl, že škola není jeho hřiště. Profesorce vyřiď, že její žádost jsem vyslechl. Nemusíš mít strach: až mě Protiva spatří, bude vědět, co má udělat.“ Jeho stříbřitá postava se nakloní blíž. „Ale pamatuj si, studente, že odvaha nespočívá v působení zmatku. Někdy je třeba učinit pořádek i tam, kde se všichni ostatní bojí.“',
      [['Poděkovat baronovi', () => advance('baron_found', () => dialogue('Vzkaz pro profesorku', 'Najdi profesorku McGonagallovou na hlavní chodbě a osobně jí předej baronovu odpověď.', [['Rozumím', null]]))]]);
  }

  function complete() {
    dialogue('Protivův strach',
      'Krvavý baron zastoupí Protivovi cestu. „Vznešený barone! Vždyť to byla jen nevinná legrace!“ Baron klidně řekne: „Protivo.“ „Ano, pane! Už letím, pane! Hodný Protiva!“ Poltergeist s kvílením zmizí skrz strop.',
      [['Odevzdat úkol profesorce', () => dialogue('Profesorka McGonagallová',
        '„Takže Krvavý baron souhlasil? Výborně. Na hradě snad alespoň na nějaký čas zavládne klid. Za tvou pomoc při zkrocení Protivy připíšu tvé koleji patnáct bodů.“',
        [['Dokončit úkol', () => advance('complete', async data => {
          if (data.awarded) {
            dialogue('Úkol splněn', 'Za pomoc při zkrocení Protivy získáváš 15 kolejních bodů! Body byly připsány do školní evidence.', [['Pokračovat', null]]);
          } else {
            dialogue('Úkol již splněn', 'Tento úkol už máš dokončený. Kolejní body se podruhé nepřipisují.', [['Pokračovat', null]]);
          }
          try {
            await window.BradaviceDB?.hydrateAll?.();
            window.dispatchEvent(new Event('bradavice:progress-synced'));
          } catch (e) { console.warn('Synchronizace po odměně se nezdařila.', e); }
        })]],
        { portrait: { src: 'img/mcgonagall-v42.webp', alt: 'Profesorka McGonagallová', className: 'is-mcgonagall' } })]]);
  }

  function addTrigger(label, className, handler) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    button.addEventListener('click', () => { button.remove(); handler(); });
    host.append(button);
  }

  function showMcGonagallScene(isReturn=false) {
    if(page!=='chodby.html' || document.querySelector('.v463-mcgonagall-scene'))return;
    const character=document.createElement('button');character.type='button';
    character.className='v463-mcgonagall-scene';
    character.setAttribute('aria-label','Promluvit s profesorkou McGonagallovou');
    const img=document.createElement('img');img.src='img/mcgonagall-v42.webp';img.alt='Profesorka McGonagallová';
    character.append(img);
    character.addEventListener('click',()=>{
      character.remove();
      if(isReturn) complete();else mcgonagall();
    });
    host.append(character);
  }

  function addBaronGhost() {
    if (document.querySelector('.v457-baron-ghost')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'v457-baron-ghost';
    button.title = 'Krvavý baron';
    button.setAttribute('aria-label', 'Oslovit Krvavého barona');
    const img = document.createElement('img');
    img.src = 'img/ghost-krvavy-baron.webp';
    img.alt = '';
    button.append(img);
    button.addEventListener('click', () => { button.remove(); baron(); });
    host.append(button);
  }

  async function init() {
    if (!client) return;
    const { data: userResult, error: authError } = await client.auth.getUser();
    if (authError || !userResult?.user?.id) return;
    const { data, error } = await client.rpc('v458_peeves_baron_step', { p_action: 'status' });
    if (error) throw error;
    stage = data.stage;

    if (page === 'chodby.html') {
      if (stage === 'new' && Math.random() >= .35) return;
      if (stage === 'new') addTrigger('Hluk na chodbě · zjistit, co se stalo', 'v457-quest-trigger', encounter);
      else if (stage === 'filch') showMcGonagallScene(false);
      else if (stage === 'return') showMcGonagallScene(true);
    }

    // Do Síně oslavy úmrtí vede pouze skutečný vchod v hlubokém sklepení.

    if (page === 'nickova-oslava.html' && stage === 'seek-baron') {
      addBaronGhost();
    }
  }

  init().catch(e => {
    console.warn('Protivův druhý úkol – načtení:', e);
    // Nezobrazovat nepravdivý úspěch při chybě serveru.
  });
})();
