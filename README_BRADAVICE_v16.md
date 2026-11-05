# Bradavice v16 — samostatný hlavní projekt

Tento ZIP obsahuje **kompletní hru Bradavice**, **bez kopie Příčné ulice**. Příčná ulice se nachází v samostatném GitHub Pages projektu:

https://majda171.github.io/bradadavice_pricna_ulice/

## Co je upravené

- Přílet sovy a přijímací dopis (`prijeti.html`) zůstávají ve stávající podobě. K dopisu přibyl druhý pergamen s kompletním seznamem povinných školních potřeb (`letter-shopping-v16.js/.css`).
- Zavření přijímacího dopisu a tlačítko na seznamu vedou do skutečné Příčné ulice.
- Nový žák jde po registraci na dopis, pak do Příčné ulice. Pokud už začal nakupovat, při dalším přihlášení pokračuje v nákupech.
- Rozřazování (`rozrazeni.html`) pro nerozřazeného studenta povolí zahájit až při `student_shop_progress.school_ready = true` v Supabase. Předčasný vstup mu ukáže cestu zpět do Příčné ulice.
- Již rozřazení studenti si zachovávají svou kolej a přístup do hradu.
- `hrad.html` a profil odkazují na samostatně publikovanou Příčnou ulici. Profil čte galeony, hůlku a mazlíčka ze Supabase.
- Tajemná komnata: Raddleův deník, videovzpomínka, jeho monolog a tajný průchod za Aragogem jsou součástí tohoto projektu. Aragog není na běžné mapě; zpřístupní se až po Hagridově stopě. Fáze úkolu se navíc synchronizuje do Supabase (`student_raddle_progress`).

## Před použitím

**DŮLEŽITÉ**: V Supabase projektu používaném oběma hrami je třeba nejprve spustit SQL soubory z balíčku Příčné ulice ve správném pořadí:

1. `supabase/01_schema_a_funkce.sql` — vytvoření tabulek a funkcí.
2. `supabase/02_katalog.sql` — vytvoření katalogu obchodů.

Bez první migrace nebude možné ověřit nákupy a nové studenty hra nepustí na rozřazování. Skripty spouštěj v **Supabase SQL Editoru stejného projektu** jako hlavní Bradavice.

## Nahrání

Rozbal ZIP a nahraj všechny soubory a složky (včetně `index.html`, složky `img/`, `video/`, `audio/`) do kořene existujícího GitHub repozitáře Bradavic. Nahradí se jen stejně pojmenované soubory. **Nemaž předem celý repozitář ani existující databázi.**

## Kdo co obsahuje

- **Bradavice**: škola, soví dopis a seznam, rozřazování, Tajemná komnata, Zapovězený les, Aragog.
- **Příčná ulice**: obchody, Ollivander, 11 hůlek, společenské hábity, Gringottova banka, galeony a nákupy.

Kód byl lokálně zkontrolován, ale skutečné přihlášení/nákupy je nutné otestovat po dokončení SQL migrace a nasazení obou projektů.
