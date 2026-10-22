BRADAVICE V470 – KDO Z PŘÁTEL JE ONLINE
=======================================
Základ: kompletní Bradavice v469. Změny jsou omezeny na studentské přátele a Soví poštu.

NOVĚ
- Sociální síť (Nástěnka → Přátelé) má sekci Moji přátelé s informací Online / Offline.
- Zobrazuje se jen u přijatých, nezablokovaných přátel; čekající žádosti a cizí studenti status nemají.
- Přehled hlásí počet online potvrzených přátel.
- Ve zprávách a v rozbalovací Soví poště u her je aktuální stav adresáta.
- Po připojení/odpojení přítele se stav aktualizuje přes již existující Supabase Realtime Presence.
- Dokud se Realtime nepřipojí, zobrazuje se Zjišťuji stav; ne mylné Offline.
- Nevyžaduje nový SQL skript ani databázovou tabulku. Používá existující kanál bradavice-online.

TESTY
- JS syntaktická kontrola: všechny místní JS soubory.
- Ověření cest z HTML na lokální soubory.
- Test v izolovaném prohlížeči s napodobenou Supabase: dva přijatí přátelé,
  jeden online, jeden offline, živá výměna stavu, žádost čekající na přijetí,
  stejný stav v Soví poště, bez JavaScriptových chyb.
- Nepodařilo se provést integrační test dvou skutečných studentských účtů na živém webu.

NASAZENÍ
- Kompletní ZIP: nahraj obsah do kořene webu namísto v469 (předtím zazálohuj v469).
- Malá oprava: ve v469 nahraď / přidej soubory přiložené v malém ZIPu.
- Po nahrání obnov stránku Ctrl+F5. SQL v Supabase neměň.
- Pro reálný test: přihlaš dva spřátelené studenty ve dvou různých prohlížečích,
  přejdi na Přátelé a zkontroluj zapnutí/vypnutí online stavu při odchodu.
