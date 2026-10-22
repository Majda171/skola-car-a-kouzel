BRADAVICE v469 — KABINET UMBRIDGOVÉ, VSTUP A HLÁŠKY

Změny oproti v468:
• Kabinet má nové uživatelem vybrané pozadí img/umbridge-office-v469.webp.
• Umbridgeová stojí celou postavou vpravo od stolu na podlaze; nepoužívá starý výřez stolu ani průhlednou masku nohou.
• V chodbě třetího poschodí odstraněn falešný obdélník na sloupu. Kabinet je přístupný jasným odkazem pod popisem chodby. Nejde o falešný obrázek dveří.
• Výsledek Filchova odečtu 50 bodů se oznamuje jen v dialogu Umbridgeové, nikoliv současně v dalším oznámení. Serverová kontrola i skutečný odečet zůstávají beze změny.
• Ve zprávách pro hráče nahrazeny technické zmínky o Supabase, SQL a migracích neutrálními a srozumitelnými hláškami. Interní databázový kód zůstává zachován.
• Ostatní navigace, šachy, hry, kolejní vstupy ani body se neměnily.

KONTROLA:
• Parsování všech JavaScriptů pomocí node --check proběhlo bez chyby.
• Ověřena přítomnost pozadí, odkazů, zrušení falešného rámečku i odstranění druhého oznámení.
• Lokální odkazy v HTML ověřeny proti souborům balíku.
• Vizuální rozmístění postavy bylo zkontrolováno na složeném náhledu podle desktopových rozměrů.
• Živý účet / produkční Supabase nebyly otestovány. Doporučuji před nasazením zálohovat předchozí verzi.

INSTALACE:
Kompletní ZIP: nahrát jeho obsah místo staré verze.
Dílčí ZIP: nahradit jen obsažené soubory přes přesné relativní cesty, včetně img/umbridge-office-v469.webp.
Po nahrání obnovit stránku Ctrl+F5.
