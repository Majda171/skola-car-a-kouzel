BRADAVICE v468 – společná oprava po v467
=============================================

1. NÁDVOŘÍ: Na stromě je opět viditelný puštík. Kliknutí otevře Soví poštu,
   pokud je přihlášený studentský chat dostupný, jinak přejde na zprávy.
   Hagridův hrabák na nádvoří zůstává samostatný.
2. TAJEMNÁ KOMNATA: Baziliškova zkouška má odkaz přímo pod nadpisem v popisu
   scény a nikoli plovoucí tlačítko v rohu.
3. BAZILIŠKOVA ZKOUŠKA: Potrava má výraznější kontrast a herní kód ověřuje
   platnost pozice potravy; při neočekávaném zmizení vytvoří další potravu.
   Ověřeno simulací 120 po sobě jdoucích sběrů a 500 vytvoření potravy
   s dlouhým baziliškem při 360 bodech v obou režimech. Ostrá Supabase
   interakce tím není automaticky potvrzena.
4. NAVIGACE: Vstupy do kolejí již nejsou v posloupnosti bočních šipek.
   Zmijozel/Mrzimor jsou v podzemí, Havraspár nahoře, Nebelvír u portrétu.
   Jejich mechanismy (hesla/hádanka/sudy) ani herní body se neměnily.
5. UMBRIDGOVÁ: Nová vizuální vrstva skrývá spodní část postavy za stolem,
   aby nezůstaly viditelné visící nohy. Původní pozadí kabinetu zůstává.
6. Starší opravy: Kompletní balík vychází z v467 včetně v466 úprav hrabáků,
   v465, v464 a předchozích verzí. Neinstalovat patch na starší v465.

INSTALACE:
- Pokud máš v467: nahraj obsah ZIPu 'jen opravy' do kořene webu a přepiš soubory.
- Pokud verzi neznáš: zazálohuj současný web a použij kompletní v468.
- Neměň databázi kvůli této sadě oprav; nepřidává žádné nové SQL.
- V prohlížeči zkus tvrdé obnovení (Ctrl+F5).

KONTROLA:
- 83 JavaScriptů: syntaxe OK.
- 2104 lokálních souborových odkazů: žádné chybějící soubory.
- Integritní test ZIP: OK.
- Simulace logiky potravy: OK.
- Vizuální test v prohlížeči: omezený (místní stránky blokovalo testovací prostředí).
- Živý Supabase test: neprováděn. Nepovažuj to za potvrzení ostrého serveru.
