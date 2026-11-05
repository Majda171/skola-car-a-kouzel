# Bradavice v15 — Příčná ulice, Ollivander a Tajemná komnata

## Propojená Příčná ulice

- Obě hry jsou nyní ve **stejné složce a pod jednou doménou**. Po přijetí dopisu vede cesta do `pricna-ulice/index.html`.
- Hagrid v Příčné ulici kontroluje školní výbavu; po dokončení nákupů nabídne přechod na rozřazování do Bradavic.
- V mapě Bradavic je odkaz pro návrat na Příčnou ulici. Na studentském profilu se zobrazují galeony, nakoupené věci, vybraná hůlka a mazlíček.
- Stejný přihlášený student se identifikuje přes Supabase účet. Nákupy a jejich přehled jsou zatím sdílené **lokálně v prohlížeči na téže doméně**; viz technické upozornění dole.
- V Příčné ulici zůstává 13 různých společenských hábitů včetně výrazně netradičních dívčích variant a nejlevnějšího staromódního chlapeckého hábitu.

## Ollivander

- Jeho postava stojí na podlaze v realistickém měřítku; není oříznutá za pultem.
- Katalog obsahuje 11 nových hůlek s dodanými obrázky. Otočené a upravené soubory jsou v `pricna-ulice/zbozi/hulky/novinka_01.webp` až `novinka_11.webp`.
- Zůstává filmová zkouška několika hůlek s efekty předtím, než si hůlka vybere studenta.
- Starší hůlky 12–15 se při čtení starého místního uložení převedou na nové odpovídající položky, aby koupená výbava nezmizela.

## Tajemná komnata — přesný postup

1. V **dívčí umývárně** kliknout na Uršulu. Kniha přiletí, spadne a lze ji sebrat.
2. **Deník Toma Raddla** se uloží do kouzelného batohu. U něho kliknout na **Prozkoumat**.
3. Zazní úvod „Ahoj, já jsem Tom Raddle a ukážu ti tajemství, pořádně se dívej“ a spustí se `video/tom-raddle-vzpominka-v15.mp4`. Po dokoukání deník z batohu zmizí.
4. U **Hagridova domu** kliknout na Hagrida a vyslechnout jeho vysvětlení. Pošle studenta hledat Aragoga.
5. Jít do **Zapovězeného lesa**, najít **nenápadný průchod mezi stromy** a kliknout na něj. Skrytá lokace `aragogova-mytina.html` **není na mapě**, ani v seznamu míst. Přístup se odemkne až po rozhovoru s Hagridem.
6. Kliknout na obrovského pavouka v doupěti, vyslechnout jeho svědectví a vrátit se za Uršulou.
7. Uršula připomene zvláštní hlas, žluté oči a hada na kohoutku. Teprve potom se kohoutek otevře a odhalí cestu ke komnatě.
8. V **Tajemné komnatě** leží další deník. Po kliknutí se objeví Raddle a zazní dodaný monolog `audio/raddle-monolog-v15.mp3`. Potom následuje hadí pečeť, bazilišek, přetažení meče na baziliška a zubu na deník. Deník se zničí a Raddle zmizí.

## Instalace

1. Rozbal obsah archivu **jako celek** do kořenové složky webu se hrou Bradavice. Složka `pricna-ulice` musí zůstat v kořeni vedle souborů `hrad.html`, `prijeti.html` a `rozrazeni.html`.
2. Zachovej existující konfiguraci své databáze Supabase. Není nutné nově vytvářet účty — propojení používá stávající přihlášení.
3. Otevři hru přes **HTTP/HTTPS** na jedné doméně. Spouštění přes `file://` nezajistí přihlášení ani spolehlivé ukládání.
4. Otestuj cestu od dopisu přes nákupy do školy a posloupnost Tajemné komnaty.

## Technické omezení, které zůstává k dořešení

**Do dodané databáze Supabase jsem nezasahovala.** Nové nákupy, galeony, nová hůlka, mazlíček a kroky příběhu se pro tuto verzi ukládají do prohlížeče pod identitou účtu. Na stejné doméně a ve stejném prohlížeči funguje propojení mezi oběma částmi. Aby se údaje synchronizovaly i mezi počítačem a mobilem a aby platby nešlo obejít úpravou lokálního stavu, bude potřeba doplnit databázové tabulky a transakční funkce s RLS.

Kouzelný batoh má v rozhraní **12 míst**. Stávající serverová funkce `v445_collect_item` však může mít původní omezení **8 míst**; pro plné online ukládání všech dvanácti bude třeba upravit serverovou funkci. Deník funguje jako místní příběhový předmět a na serverovou migraci nečeká.

Nová skriptová logika: `raddle-story-v15.js`, `raddle-story-v15.css`, `pricna-guard-v15.js`, `pricna-school-bridge-v15.js`, `pricna-school-bridge-v15.css`.
