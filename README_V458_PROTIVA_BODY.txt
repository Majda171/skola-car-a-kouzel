BRADAVICE v458 – PROTIVOVY NEKALOSTI: OPRAVA ZAPISOVÁNÍ 15 KOLEJNÍCH BODŮ
==============================================================================

Tato verze NAVAZUJE na testovací Bradavice v457. Nemění navigaci hradu, vstupy do kolejí,
Umbridgeovou, stávající zvuky ani grafiku. Mění pouze druhý úkol s Protivou.

CO SE MĚNÍ
- Úkol ukládá stav v Supabase; nelze přeskakovat jeho kroky.
- Krátce řečeno: Protiva a Filch -> McGonagallová -> Krvavý baron -> návrat za profesorkou.
- Po potvrzeném dokončení získá student +15 kolejních bodů.
- Jednou za studenta; opakované kliknutí další body nepřipisuje.
- Nejsou-li dostupné Supabase nebo potřebná SQL funkce, úkol nevydává falešnou odměnu.
- Pro bodování se používá již existující serverová funkce add_points_internal.

DŮLEŽITÉ: NEJPRVE SUPABASE, POTOM WEB
1. Zálohuj databázi nebo alespoň stávající funkce/tabulky, jak jsi zvyklá.
2. V Supabase SQL Editoru spusť JEDNOU soubor:
   BRADAVICE_V458_SQL_PROTIVA_DRUHY_UKOL_15_BODU.sql
3. SQL soubor NENAHRÁVEJ na veřejný GitHub ani k webovým souborům.
4. Po úspěšném SQL nahraj kompletní webový ZIP v458, anebo pouze opravný ZIP pro v457.
5. Přihlas se jako student a otestuj celý úkol na obou lokacích.

OPRAVNÝ WEBOVÝ ZIP OBSAHUJE POUZE
- chodby.html
- chodby-podzemni-2.html
- peeves-quest-v458.js
- README_BRADAVICE_V458_PROTIVA_BODY.txt

POZOR: Verze v457 ukládala průběh jen do prohlížeče. Dříve uložený lokální stav
se z bezpečnostních důvodů automaticky nepřenáší do Supabase a neuděluje body.
Pokud už student úkol ve v457 dokončil, musí ho pro serverovou odměnu projít znovu.

TESTOVÁNÍ A OMEZENÍ
- Syntaktická kontrola JS a ZIPů: provedena.
- Kontrola HTML odkazů: provedena.
- Lokální test napojení na skutečnou Supabase databázi a přidělení živých bodů:
  neproveden (nemáme přístup k tvému administrátorskému SQL Editoru ani testovacímu účtu).
- Při nahrávání si ponech zálohu v457.
