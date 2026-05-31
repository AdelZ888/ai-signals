---
title: "CoinSignal benchmark : précision, hit rate et calibration sur 13 modèles de prédiction crypto"
date: "2026-05-31"
excerpt: "Résumé et guide pratique pour utiliser le leaderboard public de CoinSignal (https://coinsignal.co/benchmark) : quelles métriques regarder, quoi valider en pilote, et quels risques surveiller — adapté aux équipes UK et aux développeurs non spécialistes."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-31-coinsignal-benchmark-accuracy-hit-rate-and-calibration-across-13-crypto-prediction-models.jpg"
region: "UK"
category: "Model Breakdowns"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "ANALYSIS"
tags:
  - "crypto"
  - "benchmark"
  - "modèles"
  - "CoinSignal"
  - "ML"
  - "trading"
  - "UK"
sources:
  - "https://coinsignal.co/benchmark"
---

## TL;DR en langage simple

- CoinSignal publie un classement public des modèles de prédiction crypto. Voir le dashboard live : https://coinsignal.co/benchmark.
- Le leaderboard expose des métriques vérifiables : avg_accuracy, recent_accuracy (10 derniers appels), hit_rate, consistency, conf_gap et counts d'échantillons (samples). Ces champs sont visibles sur la page : https://coinsignal.co/benchmark.
- Les chiffres du snapshot montrent un best avg_accuracy de 73.8 % et une best recent_accuracy ≈ 78.5 % ; 13 modèles sont comparés et les samples par modèle vont de ~195 à 1 114 (conf_gap observés entre −8.7 % et +8.6 %). Source : https://coinsignal.co/benchmark.
- Utilisez le leaderboard comme point de départ : reproduisez localement les métriques pour vos coins cibles et lancez des shadow tests avant toute exécution réelle.

## Question centrale et reponse courte

Question : Peut‑on utiliser le benchmark public de CoinSignal comme « oracle » pour déployer du trading en production ? Référence : https://coinsignal.co/benchmark.

Réponse courte : Non, pas sans vérification. Le leaderboard fournit des indicateurs transparents et des données publiques mais il agrège plusieurs coins et présente des tailles d'échantillon variables (195–1 114). Reproduisez et validez coin par coin, puis pilotez en shadow pendant une période significative (p.ex. 30 jours) avant d'autoriser l'exécution d'ordres. Voir : https://coinsignal.co/benchmark.

## Ce que montrent vraiment les sources

- Règle de classement (extrait) : « le score favorise d'abord la précision, puis le hit rate, la consistance, la calibration de confiance, et un nombre d'échantillons suffisant pour faire confiance au résultat. » Source : https://coinsignal.co/benchmark.
- Métriques exposées : avg_accuracy (moyenne de direction_score, range_closeness et range_overlap), recent_accuracy (moyenne des 10 derniers appels vérifiés), hit_rate (part des prédictions >= 70 %), consistency, conf_gap et recency. Tous ces champs figurent sur : https://coinsignal.co/benchmark.
- Chiffres clairs du snapshot : best avg_accuracy = 73.8 % ; best recent_accuracy ≈ 78.5 % ; modèles comparés = 13 ; samples par modèle ≈ 195–1 114 ; conf_gap observés ≈ −8.7 % à +8.6 %. Source : https://coinsignal.co/benchmark.

Tableau récapitulatif (données extraites du snapshot public)

| Métrique observée | Valeur (snapshot) | Source |
|---|---:|---|
| Best avg_accuracy | 73.8 % | https://coinsignal.co/benchmark |
| Best recent_accuracy (10 derniers) | ≈ 78.5 % | https://coinsignal.co/benchmark |
| Nombre de modèles comparés | 13 | https://coinsignal.co/benchmark |
| Samples par modèle (min→max) | ~195 → 1 114 | https://coinsignal.co/benchmark |
| conf_gap observés | −8.7 % → +8.6 % | https://coinsignal.co/benchmark |

Note méthodologique courte : j'utilise uniquement les champs publiés sur la page publique de CoinSignal pour les chiffres ci‑dessous (https://coinsignal.co/benchmark).

## Exemple concret: ou cela compte

Contexte : petite équipe (1–3 personnes) qui veut évaluer un modèle pour BTC et ETH. Référence : https://coinsignal.co/benchmark.

Étapes concrètes :
- Exporter le leaderboard depuis https://coinsignal.co/benchmark au moment T et stocker un CSV/JSON.
- Reproduire localement avg_accuracy, recent_accuracy (10 derniers), hit_rate et conf_gap pour BTC et ETH uniquement.
- Lancer un shadow test : collecter decisions, timestamps et scores pendant une fenêtre d'essai (p.ex. 30 jours ou l'équivalent horaire) sans exécuter d'ordres réels.
- Comparer vos mesures coin par coin à celles publiées (par ex. vérifier si avg_accuracy locale s'approche du 73.8 % observé sur le snapshot pour des modèles similaires).

Signaux de décision rapide : si vos métriques coin‑par‑coin divergent de >5 points % sur avg_accuracy ou si conf_gap local dépasse ±5 % de manière soutenue, prolonger ou arrêter le pilote. Source : https://coinsignal.co/benchmark.

## Ce que les petites equipes doivent surveiller

Voir le leaderboard pour définitions et exemples : https://coinsignal.co/benchmark.

Points opérationnels prioritaires :
- Extraire et versionner le leaderboard (CSV/JSON) au moment de l'analyse.
- Reproduire les métriques exposées : direction_score, range_closeness, range_overlap → avg_accuracy ; recent_accuracy = 10 dernières fenêtres ; hit_rate = part >= 70 %.
- Shadow tests : collecter decisions + confidence + window_status + timestamp ; simuler P&L.
- Surveillance : alerter si samples par modèle < 250 (bruit statistique) ou si conf_gap dépasse ±5 % pendant 48 h consécutives.
- Limiter la shortlist à 1–3 modèles validés localement avant tout déploiement.

Référence des champs et métriques : https://coinsignal.co/benchmark.

## Compromis et risques

Extraits pertinents : https://coinsignal.co/benchmark.

Observations factuelles (snapshot) :
- avg_accuracy top = 73.8 % ; recent top ≈ 78.5 % ; 13 modèles sont comparés ; samples par modèle ≈ 195–1 114 ; conf_gap observés ≈ −8.7 % à +8.6 %.

Principaux compromis :
- Transparence vs. granularité : le leaderboard publie des agrégats sur plusieurs coins ; la performance globale peut masquer de mauvaises performances sur BTC ou ETH.
- Taille d'échantillon vs. confiance : certains modèles ont ~195 samples (bruit élevé) tandis que d'autres dépassent 1 000 samples.
- Calibration : conf_gap varie jusqu'à ±8.6 %, ce qui affecte la confiance exploitable pour le sizing.

Rappels pratiques : toutes les décisions opérationnelles doivent être fondées sur des tests coin‑par‑coin et des seuils documentés (voir checklist). Source : https://coinsignal.co/benchmark.

## Notes techniques (pour lecteurs avances)

- Définitions et agrégation : avg_accuracy = (direction_score + range_closeness + range_overlap)/3 ; recent_accuracy = moyenne des 10 derniers appels vérifiés ; hit_rate = part des prédictions >= 70 % (champs documentés sur https://coinsignal.co/benchmark).
- Seules les fenêtres « completed » avec scores d'exactitude sont incluses dans les comptes d'échantillons affichés (d'où les valeurs 195–1 114 samples). Source : https://coinsignal.co/benchmark.

Exemple SQL court (reproduit à adapter à votre schéma) :

```sql
SELECT model_name,
  COUNT(*) AS samples,
  (AVG(direction_score) + AVG(range_closeness) + AVG(range_overlap))/3.0 AS avg_accuracy
FROM verified_predictions
WHERE window_status = 'completed'
GROUP BY model_name;
```

Opérations recommandées : calculer rolling windows (p.ex. rolling 720 fenêtres ≈ 30 jours si échantillonnage horaire) et surveiller drift de avg_accuracy > 5 points et conf_gap absolu > 5 %.

Référence : https://coinsignal.co/benchmark.

## Checklist de decision et prochaines etapes

- [ ] Télécharger et sauvegarder le leaderboard actuel depuis https://coinsignal.co/benchmark.
- [ ] Reproduire localement avg_accuracy, recent_accuracy (10 derniers), hit_rate et conf_gap pour BTC et ETH.
- [ ] Lancer un shadow test en collectant direction_score, range_closeness, range_overlap, confidence, timestamp et window_status.
- [ ] Comparer vos métriques par coin avec celles du snapshot public (best avg_accuracy 73.8 %, best recent ≈ 78.5 %, samples 195–1 114, conf_gap −8.7 %→+8.6 %). Source : https://coinsignal.co/benchmark.
- [ ] Documenter les gates de passage en production et les critères de rollback.

### Hypotheses / inconnues

- Hypothèse A (extraction publique) : le snapshot affiche best avg_accuracy = 73.8 %, best recent ≈ 78.5 %, 13 modèles comparés, samples par modèle ≈ 195–1 114, conf_gap ≈ −8.7 % à +8.6 %. Source : https://coinsignal.co/benchmark.
- Hypothèse B (critères opérationnels à valider) : seuils de pré‑production à tester (exemples à valider en pilote) — avg_accuracy >= 70 %, samples >= 500, ou 30 jours d'observations/≈720 fenêtres horaires.
- Hypothèse C : comportements coin‑par‑coin peuvent diverger fortement de l'agrégé ; confirmez pour BTC/ETH avant toute allocation de capital.

### Risques / mitigations

- Risque : optimisation pour le leaderboard (performance sur l'agrégat mais pas sur vos coins).
  - Mitigation : tests indépendants, shortlist de 1–3 modèles validés localement.
- Risque : mauvaise calibration (conf_gap élevé jusqu'à ±8.6 % sur le snapshot).
  - Mitigation : recalibrer probabilités et surveiller conf_gap en continu.
- Risque : bruit statistique si samples faibles (~195).
  - Mitigation : exiger plus d'échantillons ou prolonger pilote.

### Prochaines etapes

1. Sauvegarder un snapshot CSV/JSON du leaderboard (https://coinsignal.co/benchmark).
2. Reproduire les métriques publiques pour BTC et ETH et lancer un shadow test de 30 jours (ou 720 fenêtres horaires).
3. Évaluer selon les hypothèses ci‑dessus et décider d'un gate opérationnel (documenter seuils et rollback).

Référence principale pour définitions et leaderboard live : https://coinsignal.co/benchmark.
