BRADAVICE v457 – pracovní/testovací sestavení nad verzí v456

Provedené změny:
- Vstupy cizích studentů do Nebelvíru, Zmijozelu, Mrzimoru i Havraspáru po zkoušce vedou na kolejní nástěnku, nikoliv přímo do společenské místnosti. Zkoušky a SQL zůstávají beze změny.
- Odstraněna nežádoucí busta v severní chodbě, portrét ve východní chodbě a hypogryf jako scenický objekt vedle Hagridova domu. Nedotčeny jiné samostatné úkoly, kde se hypogryf vyskytuje.
- Truhla v hlubokém sklepení a astronomická sféra posunuty blíže k podlaze, do perspektivy sceny.
- Mrzimorská šála v sedmém patře na trase k tajné místnosti (sběratelský předmět; používá stejné inventární ID 'scarf').
- Původní pozadí kabinetu Umbridgeové se neměnilo. Postava se opticky skrývá za stolem. Při serverem potvrzené sabotáži používá novou znechucenou variantu.
- Bomby hnojůvky mají shodný efekt kouře a zvuku pro hráče, sabotáž kabinetu i Protivu. Použity výhradně dodané materiály (bez generování nových obrázků).
- Druhý úkol Protivy: náhodná událost v Hradních chodbách, Filch, McGonagallová, Krvavý baron v Hlubokém sklepení, návrat a dokončení. Průběh se ukládá pro konkrétní přihlášený účet v prohlížeči.
- WebP grafika prověřena a objemnější soubory částečně znovu optimalizovány pouze při rozumné úspoře. Nezměněné umělecké obrazy zachovávají původní podobu.
- Boční navigace v456 nezměněna; tajné a úkolové lokace nadále mimo šipky.

Nedořešená vazba: Druhý úkol Protivy NEPŘIPISUJE kolejní body. Body musí potvrdit Supabase; bez připravené RPC by jejich pouhé přičtení ve webu bylo falešné. Úkol lze projít a dokončit.

Kontroly: syntaxe upravovaných JS souborů a existence nových assetů. V tomto prostředí nebylo úspěšně možné dokončit úplný živý test přihlášení, databázových pravidel a prohlížeče. Než nahrajete web, ponechte zálohu poslední fungující verze.
