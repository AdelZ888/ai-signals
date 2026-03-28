---
title: "Performance de 16 modèles IDP sur 9 000+ documents réels : OCR, extraction de tableaux et benchmarks métiers"
date: "2026-03-28"
excerpt: "Le leaderboard IDP de Nanonets a évalué 16 modèles sur plus de 9 000 documents réels via trois benchmarks complémentaires (OCR difficile, structure/layout, extraction métier). Les résultats montrent que les performances sont dépendantes de la tâche et qu'il existe des compromis coût/qualité."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-28-performance-of-16-idp-models-on-9000-real-documents-ocr-table-and-business-benchmarks.jpg"
region: "UK"
category: "News"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "IDP"
  - "OCR"
  - "Document AI"
  - "NLP"
  - "compliance"
  - "UK"
  - "startup"
  - "finance"
sources:
  - "https://nanonets.com/blog/idp-leaderboard-1-5/"
---

## TL;DR en langage simple

- Nanonets a publié un « IDP Leaderboard » : 16 modèles testés sur plus de 9 000 documents réels, avec 3 benchmarks distincts. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- Chaque benchmark mesure une dimension différente : OCR, compréhension de la mise en page/tableaux et extraction métier. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- Point clé : aucun modèle n’est « meilleur partout » — le classement varie selon la tâche (par ex. #7 sur certains tests dépasse #1 sur d’autres). Nanonets indique que OCR2+ atteint des performances proches des leaders pour moins de 50 % du coût rapporté. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- Action immédiate recommandée : testez les modèles sur vos documents réels au lieu de vous fier à un score agrégé. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)

## Ce qui a change

- Portée du benchmark : 16 modèles, 9 000+ documents réels, 3 benchmarks complémentaires (OlmOCR Bench, OmniDocBench, IDP Core). (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- Objectif : mesurer les tâches opérationnelles qui comptent (OCR, extraction de tables, extraction de champs métier, DocVQA, ChartQA). (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- Conséquence pratique : la métrique globale devient insuffisante — choisissez le modèle en fonction de la tâche critique pour votre flux. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)

## Pourquoi c'est important (pour les vraies equipes)

- Variabilité des documents en production : les PDFs réels incluent factures, bordereaux, passeports, relevés bancaires, tableaux complexes — le leaderboard teste précisément ces types. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- Spécialisation par tâche : certains modèles excellent en OCR pur, d’autres en reconstruction de tables ou en extraction sémantique — le rapport montre des différences notables de comportement selon le benchmark. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- Coût vs performance : exemple rapporté — Nanonets OCR2+ proche des modèles de pointe à moins de 50 % du coût, ce qui influence le coût total d’exploitation (modèle + revue humaine + intégration). (source: https://nanonets.com/blog/idp-leaderboard-1-5/)

## Exemple concret: a quoi cela ressemble en pratique

Cas d’usage ciblé : extraire les lignes d’une facture, le fournisseur et le total.

- Étape 1 : identifier quel benchmark est le plus proche de vos documents (OlmOCR, OmniDocBench, IDP Core). (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- Étape 2 : sélectionner 2–3 modèles candidats listés sur le leaderboard et exécuter des tests ciblés sur vos documents critiques. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- Étape 3 : mesurer séparément les tâches : OCR (qualité de lecture), extraction de tables (rappel/précision sur lignes), extraction de champs (fournisseur, total, date). (source: https://nanonets.com/blog/idp-leaderboard-1-5/)

Tableau de décision rapide (comparaison des benchmarks)

| Benchmark | Objectif principal | Types de documents / tâches | Quand l'utiliser |
|---|---:|---|---|
| OlmOCR Bench | Résilience OCR sur pages difficiles | scans dégradés, petits caractères, multi‑colonnes | Si vos scans sont bruités |
| OmniDocBench | Compréhension de la mise en page | tableaux, formulaires, ordre de lecture | Si vous avez beaucoup de tables/colonnes |
| IDP Core | Extraction métier | factures, DocVQA, ChartQA, champs critiques | Si vous devez extraire champs business (AP, RH...) |

Faits essentiels extraits du rapport : 16 modèles testés, 9 000+ documents réels, 3 benchmarks, et plus de 20 cas d’usage IDP répertoriés. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)

## Ce que les petites equipes et solos doivent faire maintenant

- Prioriser un POC rapide et ciblé : choisissez 1 cas métier critique (ex. traitement des factures) et testez 2 modèles minimum issus du leaderboard sur vos documents réels. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- Mesurer les bonnes choses : séparez l’évaluation en au moins trois dimensions — OCR, extraction de tables, extraction de champs métier — et consignez les modes d’échec observés. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- Protéger les données pendant le test : utilisez des copies anonymisées ou des extraits non sensibles et documentez la résidence des données chez le fournisseur avant d’envoyer des fichiers. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- Itération légère : corrigez les règles ou étiquettes après un premier cycle de tests, puis ré‑évaluez pour réduire le travail de revue humaine. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)

(Conseil succinct pour solo founders / petites équipes : focalisez‑vous sur la réduction du temps humain par document, identifiez le coût total par document et choisissez le modèle qui réduit le coût opérationnel global.) (source: https://nanonets.com/blog/idp-leaderboard-1-5/)

## Angle regional (UK)

- Incluez dans votre POC des documents représentatifs du Royaume‑Uni (factures UK, formats d’adresse, mentions TVA) pour vérifier la normalisation et les cas spécifiques de mise en page. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- Vérifiez la capacité du modèle à gérer les formats locaux présents dans le leaderboard (invoices, receipts, passports, ID cards listés dans le rapport). (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- Avant production, documentez la résidence des données et les exigences contractuelles du fournisseur pour vos flux transfrontaliers. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)

## Comparatif US, UK, FR

- US : tester en incluant documents sectoriels si nécessaire (ex. dossiers santé) et segmenter les POC par secteur. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- UK : inclure formats locaux et vérifier la normalisation des champs TVA/adresse dans les tests. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- FR : surveiller la qualité d’extraction sur factures françaises et formats BAN/IBAN, et valider les cas de mise en page propres au marché. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)

Conseil pratique : segmentez vos échantillons par pays/langue et traitez chaque segment comme un mini‑POC pour détecter les écarts de performance liés aux formats locaux. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)

## Notes techniques + checklist de la semaine

### Hypotheses / inconnues

- Confirmé dans le rapport : 16 modèles testés, 9 000+ documents réels, 3 benchmarks (OlmOCR, OmniDocBench, IDP Core), variations de classement entre modèles (par ex. #7 > #1 sur certains tests), et indication que Nanonets OCR2+ atteint des performances proches des leaders pour <50 % du coût. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- À valider pendant vos POC (hypothèses à confirmer) : seuils métier cibles (ex. précision minimale exigée, F1 cible), latence maximale acceptable en ms, coût total par document en $ incluant revue humaine, et taille d’échantillon nécessaire pour une décision fiable.

### Risques / mitigations

- Risque : un score agrégé masque des erreurs critiques sur vos cas. Mitigation : mesurer OCR, tables et champs séparément et documenter modes d’échec. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- Risque : fuite de données. Mitigation : utiliser anonymisation, copies non sensibles, clauses contractuelles et vérifier la résidence des données. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- Risque : coûts cachés (revue humaine, intégration). Mitigation : estimer coût total par document et prioriser modèles qui réduisent le travail manuel.

### Prochaines etapes

- [ ] Identifier le benchmark le plus pertinent (OlmOCR / OmniDocBench / IDP Core). (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- [ ] Sélectionner 2–3 modèles candidats depuis le leaderboard. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- [ ] Préparer un échantillon représentatif (documents critiques par segment marché) et lancer un POC ciblé. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
- [ ] Mesurer séparément OCR, extraction de tables et champs métier ; documenter les modes d’échec et les coûts d’exploitation.
- [ ] Valider la conformité et la résidence des données avant mise en production.

Méthodologie courte : utilisez le benchmark du leaderboard le plus proche de vos documents et comparez les modèles sur des métriques métier pertinentes. (source: https://nanonets.com/blog/idp-leaderboard-1-5/)
