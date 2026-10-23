BRADAVICE v474 – OPRAVA NAVIGACE
================================

- Starší stránky s castle-nav-v435.js nyní načítají stejnou implementaci navigace jako novější stránky. Tím se odstranily rozdílné mapy cest a možnost obejít vstupy do kolejí starými šipkami.
- Navigace na chodbách bere přednostně skutečné odkazy předchozí/další, které jsou uvedeny ve scéně, místo aby je nahradila sousedními položkami univerzálního seznamu lokací.
- Tam, kde scénické průchody existují, se nevymýšlí další nepodložené šipky. Originální scénický průchod je nahrazen odpovídající boční šipkou právě jednou.
- Odkazy na mapu, tajné průchody, vstupy do kolejí a herní hotspoty se nemažou.
- Koleje zůstávají přístupné pouze přes původní mechanismy: Nebelvír/Zmijozel heslo, Mrzimor sudy, Havraspár hádanka.

PŘÍLOHA: změny v473 jsou zachovány. Vizuální průchod všemi obrazovkami a živé testy Supabase zatím nebyly provedeny.
