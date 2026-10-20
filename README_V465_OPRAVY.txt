BRADAVICE v465 – opravy na základě testování hry

ZÁKLAD: v464. Žádná úprava SQL není kvůli v465 potřeba; pro online famfrpálový duel stále musí být předem nainstalované SQL z v463.

Změny:
- Cizí kolej: po serverem povoleném vstupu lze z nástěnky vstoupit do společenské místnosti pro vlajku, ložnice zůstává zamčená. Všechny čtyři koleje.
- Úkol s Protivou: odstraněné rušivé popisky u McGonagallové a Krvavého barona. Vchod do Síně oslavy úmrtí je stále skrytý, žádné nové tlačítko ve sklepení.
- Bomby hnojůvky: žádný popisek po hodu, pouze zvuk a kouř; další nálezy v různých chodbách. Po použití se bomba spotřebuje.
- Šachy: zvuk jen při dokončeném tahu, zobrazení figurek ve správných políčkách, bez změny velikosti šachovnice.
- Lektvary: kroky receptu v pořadí po řádcích – 1 vlevo, 2 vpravo, 3 vlevo…
- Třetí poschodí: skrytý klikací vstup do kabinetu Umbridgeové, nikoli nová navigační šipka. Zmijozel zůstává v podzemí.
- Chloupek: pět sekund na použití harfy / flétny.
- Tajemná komnata: tlačítko Baziliškovy zkoušky pod nadpisem.
- Famfrpál: přístupná herní tlačítka pod nadpisem.
- Ze školních pozemků zmizela samostatně přidávaná sova; soví pošta zůstala.
- Skrytý vstup Mrzimoru má stále klikací oblast bez rušivého popisku u nadpisu.

KONTROLY
- 82 JavaScriptových souborů bez syntaktické chyby.
- 2091 lokálních HTML odkazů na existující soubory.
- Simulovaný test šachů: kliknutí na figurku bez zvuku, platný tah s jedním zvukem.
- Simulovaný test návštěvníka Havraspáru: společenská místnost se odemkne, ložnice ne.
- Simulované testy scén Protivy: McGonagallová viditelná, chybné tlačítko u Baronovy cesty se nevykreslí.

NENÍ OTESTOVÁNO NA ŽIVÉ HŘE: výsledek serverového RPC proti skutečné Supabase; uživatelský průchod čtyřmi kolejemi a integrace online duelu dvou reálných účtů.
Před nasazením ponech zálohu v464 a po nahrání obnov stránku pomocí Ctrl + F5.
