BRADAVICE V454 — OPRAVY, 19. 10. 2026
==================================

Tento komplet navazuje na v453d a zachovává ostatní dříve vytvořené stránky a grafiky.

CO JE V KÓDU UPRAVENO
- Jednotná síť bočních šipek na 40 běžně přístupných hradních a venkovních lokacích.
- Oprava přeskakování: původní skript podle některých místních odkazů měnil pořadí šipek.
- Chloupka lze najít z Východní chodby; text na chodbě lépe rozlišuje dveře a sestup do podzemí.
- Přístup k oběma podzemním chodbám, kuchyním, vstupům do čtyř kolejí, horním chodbám atd.
- Vstupy do kolejí zachovávají své původní mechanismy i pro hosty: N a Z heslo týdne; H orlí hádanka; M sudy [2,4,3].
- Přístup cizího studenta do společenské místnosti potvrdí server až po původní zkoušce.
- Protiva nerozdává automaticky hesla: serverové SQL nabídne radu náhodně cca ve 30 % rozhovorů a z těchto rad cca každá čtvrtá bude správná. Typ rady odpovídá koleji.
- Nová optimalizovaná průhledná busta (WebP) v Síni slávy; obraz Godrika nad ní ve výklenku; přizpůsobený nadpis.
- Oddělené pozice zvuku a batohu na mobilu i desktopu.
- Změněné soubory používají nové URL verze, aby se nemíchala cache starých úprav.

TŘI DŮLEŽITÉ POZNÁMKY
1. Tento ZIP je KOMPLET pro nasazení webových souborů. Před přepsáním webu si udělej zálohu.
2. V samostatném souboru BRADAVICE_V454_SQL_OPRAVA_KOLEJNI_VSTUPY_A_PROTIVA.sql
   jsou nutné serverové změny; spusť je v Supabase SQL Editoru až po původním SQL v453.
   Nepatří do veřejné webové složky. Bez nového SQL se hostovské vstupy budou chovat chybně.
3. Propojení 40 běžných lokací bočními šipkami tvoří souvislou průchozí trasu.
   Uzamčené příběhové scény, tajné komnaty a kolejní ložnice nejsou přes boční šipky
   veřejně přístupné — jejich stávající zkoušky a vstupy zůstávají zachované.

NAPLÁNOVANÉ, JEŠTĚ NEIMPLEMENTOVANÉ
Samostatná dějová událost s Protivou, bombami hnojůvky, Filchem,
McGonagallovou a Krvavým baronem (aby nová událost nenarušila opravy navigace).

KONTROLA
Prověřena existence cílů pro všech 40 lokací a dostupných HTML odkazů,
syntaxe upravených JS souborů. Živé přihlášení/Supabase a reálný vzhled
v prohlížeči nelze v tomto prostředí ověřit, proto je vhodné nasazení vyzkoušet.
