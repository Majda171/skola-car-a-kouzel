BRADAVICE v473 – cílená revize balíku v472
==========================================

OPRAVENO / DOPLNĚNO
- Protivův úkol: odstraněna automatická přemístění po rozhovoru s McGonagallovou a Krvavým baronem. Student musí fyzicky dojít do Síně oslavy úmrtí a vrátit se k profesorce. Baronův rozhovor je delší, 15 bodů oznamuje McGonagallová při odevzdání. Serverové připsání zůstává ve stávající RPC.
- Kabinet Umbridgeové: trest razítkování nyní postupně ukazuje 15 ministerských lejster; na každém hráč otiskne razítko SCHVÁLENO. Nevyplňují se formuláře.
- Kuchyně: neprůhledná keramická konvice přemístěna na centrální pracovní stůl.
- Hnojůvky: po odpálení na hradní chodbě běží sedmisekundová lhůta na útěk. Pokud hráč zůstane, objeví se Filch a spustí stávající serverové zadržení. Jeho běžný výskyt zůstává náhodný.
- Tajemná komnata: před baziliškem přidána čtyřdílná runová pečeť. Při chybě se postup pečeti vrací na začátek. Původní souboj mečem a zničení deníku zůstaly zachovány.
- Sabotáž: po serverově potvrzeném úspěchu se v sekci Dopisy a vzkazy zpřístupní pochvalný dopis Freda a George. Dříve získaný tajný dopis zůstává zachován.

TECHNICKÁ KONTROLA
- Ověřena syntaxe všech 84 JavaScriptů v kořenové složce i souboru baziliškovy hry pomocí Node.js.
- Zkontrolováno 2240 lokálních odkazů zdrojů z HTML a CSS v kořenové složce: 0 chybějících cílů.
- Test integrity ZIPu je proveden při vytvoření finálního balíku.
- Z balíku byly vynechány jen jednoznačně vývojové/duplicitní podklady: __v472_qa.html a baziliskova-zkouska/assets/bazilisek-original.webp. Ostatní neověřeně nepoužívané soubory ponechány, aby se nerozbilo dynamické načítání.

CO JEŠTĚ NUTNÉ DOKONČIT / OVĚŘIT
- Jednorázový bonus +50 kolejních bodů a balíček 50 spotřebních bomb vyžadují odpovídající serverovou migraci Supabase. Dodaný v472 neobsahuje definice RPC ani schéma databáze. DOPIS JE PŘIPRAVEN, ALE BODY ANI 50 KUSŮ NEJSOU TOUTO VERZÍ AUTOMATICKY PŘIPSÁNY; nelze to bezpečně předstírat pouze v prohlížeči.
- Polohu čokoládové žabky nelze spolehlivě rekonstruovat bez referenčního obrázku původní pozice. Proto nebyla svévolně změněna.
- Nebyl proveden živý test autentizace a zápisů do Supabase. Nebyl dostupný testovací prohlížeč; vizuální ověření na obrazovce je nutné.
- Ostatní soubory není vhodné mazat pouze podle statických referencí: inventář i minihry načítají některé assets dynamicky.

PŮVODNÍ v472 zůstává nedotčený. Tento balík zachovává strukturu webu pro GitHub Pages.
