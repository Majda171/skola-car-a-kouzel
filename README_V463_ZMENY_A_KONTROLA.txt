BRADAVICE v463 – SPOLEČNÁ AKTUALIZACE (testovací sestavení)
============================================================
ZÁKLAD: poslední kompletní v462. Stávající navigace, kolejní podmínky,
staré úkoly, šachová pravidla a původní Brankářský pohár nebyly přepisovány.

ZAVEDENÉ ZMĚNY
1. McGonagallová: po Filchově dialogu je klikací postavou v hradní chodbě
   (stejný obrázek jako v učebně přeměňování). Po návratu od Krvavého barona
   se znovu objeví pro dokončení druhého úkolu s Protivou.
2. Protiva: druhý úkol vede přes Síň oslavy úmrtí, nikoli přes duplikát Barona
   na prázdném pozadí sklepení. Výbuch má delší zelený kouř a opakovaný zvuk;
   dialog nezatmavuje celý efekt. Studentovy bomby používají stejný efekt.
3. Protivovy vlajky: na stránce výpravy je vidět skutečná hradní chodba.
   Při chybném vstupu po předchozí radě Protivy se přehraje jeho zlomyslný smích.
4. Duchové v Síni oslavy úmrtí: velký Nick a sir Patrick v popředí,
   sir Patrick mimo ovládací panel; Krvavý baron je dost velký na kliknutí.
5. Šachy: 12 nových kamenných figur (oba odstíny) a nová mramorová šachovnice,
   optimalizované WebP s průhledností. Nezměněné rozměry herní šachovnice
   ani pravidla. Pohyb figurky spouští zvuk těžkého kamene.
6. Kotlík: při vložení přísady zazní šplouchnutí, při zahřátí bublání,
   a to při praktické hodině i lektvarovém duelu.
7. Tajemná komnata: otevření Raddlova deníku spustí dodanou hudbu,
   když se zároveň objeví Tom Raddle.
8. Podzemní chodby / Hluboké sklepení: atmosférická ozvěna podzemí.
   Prohlížeč zvuk automaticky bez interakce nepovolí – přidán přepínač.
9. Soví pošta: zvednutá nad herní okna, včetně samostatné Baziliškovy
   zkoušky; tlačítko uvnitř her a automatické
   vložení známého kódu místnosti do zprávy.
10. Famfrpál: nový duel 2 současných studentů na 90 sekund, stejné střely,
    proměnlivá rychlost, živé skóre. Potlesk po každých 5 chycených střelách
    V ŘADĚ. Nový režim je oddělený od původního poháru.
11. Archivní opravy z v460/v462 zůstávají: odstraněný portrét u Chloupka,
    odstraněná busta ze severní chodby a hipogryf u Hagridova domu,
    správná kolejní nástěnka a navigace mimo tajné lokace.
12. Všech 401 rastrových obrázků v balíku je ve formátu WebP. Původní
    nevyužité šachové obrázky byly vyřazeny, nové jsou ve img/chess-v463.

ZPROVOZNĚNÍ
A. Zálohuj aktuální publikované Bradavice.
B. V Supabase SQL Editoru spusť mimo GitHub soubor
   BRADAVICE_V463_SQL_BRANKARSKY_DUEL.sql.
   Funkci odměny za druhý úkol s Protivou z v458 je třeba mít již zavedenou.
C. Nahraj celý obsah ZIPu v463 do stejné úrovně jako index.html.
D. Po nahrání proveď tvrdé obnovení prohlížeče (Ctrl+F5).
E. Duel testuj pomocí DVOU přihlášených studentských účtů na dvou zařízeních.

KONTROLNÍ TESTY PŘED PŘEDÁNÍM
- 82 JavaScriptových souborů prošlo kontrolou syntaxe (node --check).
- 2095 existujících HTML odkazů a zdrojů prověřeno – bez chybějícího souboru
  (základní kontrola cest, ne ověření vzdálených služeb).
- Izolovaný test v prohlížeči s modelovou databází: založení duelu,
  start z časového stavu serveru, připsání chycené střely a otevření postavy
  McGonagallové v chodbě prošly.
- Nové obrázky mají průhledné WebP tam, kde je to potřeba.

OMEZENÍ
- Ostré dvouúčastnické propojení a SQL nebylo možné otestovat na tvé
  skutečné Supabase. Nepřipisují se žádné nové školní body za samotný duel.
- Vizuální render skutečného nasazeného webu se nepodařil otevřít; finální
  rozložení je potřeba po nasazení vizuálně zkontrolovat.
- Zpětná kompatibilita zachována: SQL v463 NEMĚNÍ body, tabulky
  ostatních her, uživatele ani stávající kolejní přístup.
