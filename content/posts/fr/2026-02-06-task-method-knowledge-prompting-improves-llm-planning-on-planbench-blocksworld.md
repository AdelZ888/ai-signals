---
title: "Prompting Task‑Method‑Knowledge (TMK) — traduction et implications pour les développeurs et fondateurs (contexte UK)"
date: "2026-02-06"
excerpt: "Résumé professionnel en français (contexte UK) du papier arXiv « Knowledge Model Prompting Increases LLM Performance on Planning Tasks » (soumis 3 févr. 2026). Le document rapporte qu'un schéma de prompting TMK (Task / Method / Knowledge) améliore fortement les performances de planification des LLM sur PlanBench (Blocksworld) — passage rapporté de 31,5 % à 97,3 % sur instances symboliques opaques — et discute implications pratiques, risques et métriques à suivre."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-06-task-method-knowledge-prompting-improves-llm-planning-on-planbench-blocksworld.jpg"
region: "UK"
category: "Model Breakdowns"
series: "founder-notes"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "ANALYSIS"
tags:
  - "LLM"
  - "prompt-engineering"
  - "TMK"
  - "PlanBench"
  - "Blocksworld"
  - "IA"
  - "recherche"
  - "startup"
sources:
  - "https://arxiv.org/abs/2602.03900"
---

## TL;DR builders

Ce qu'il faut retenir (synthèse basée sur la soumission arXiv citée): le papier « Knowledge Model Prompting Increases LLM Performance on Planning Tasks » (Erik Goh, John Kos, Ashok Goel; soumis 3 févr. 2026) applique le cadre Task‑Method‑Knowledge (TMK) au prompting des LLM et rapporte un accroissement substantiel des performances sur le benchmark PlanBench — domaine Blocksworld. Le résultat phare rapporté est une augmentation de l'exactitude en planification sur instances symboliques opaques de 31,5 % (baseline) à 97,3 % (TMK) sur les cas évalués (source: https://arxiv.org/abs/2602.03900).

Actions rapides pour builders (à tester immédiatement, source: https://arxiv.org/abs/2602.03900):

- [ ] Sélectionner 10–100 tâches de planification représentatives (minimum 10, recommandé 50–100).
- [ ] Construire un template TMK avec les champs Task / Method / Knowledge.
- [ ] Lancer un A/B contrôlé (au moins N=200 pour décision finale recommandée) contre vos prompts actuels.
- [ ] Mesurer: taux de succès par instance, correction par étape, actions invalides, tokens par requête.

Remarque méthodologique courte: reproduisez d'abord sur les mêmes splits PlanBench/Blocksworld avant généralisation; le papier fournit les chiffres ci‑dessous (https://arxiv.org/abs/2602.03900).

## These centrale

Thèse centrale (extrait de l'abstract et du texte soumis): TMK (Task‑Method‑Knowledge) est un patron de prompting qui encode non seulement « quoi faire » et « comment le faire », mais aussi « pourquoi » une action est prise. Selon les auteurs, TMK capture des structures causales, téléologiques et hiérarchiques et fournit explicitement des mécanismes de décomposition de tâche; il se distingue d'autres cadres hiérarchiques (p.ex. HTN, BDI) par le champ explicite « Knowledge ». Source: https://arxiv.org/abs/2602.03900.

## Evidences issues des sources

Preuve primaire: arXiv — Erik Goh, John Kos, Ashok Goel, soumis 3 février 2026 (https://arxiv.org/abs/2602.03900).

Points factuels extraits directement de la soumission:

- Domaine d'évaluation: PlanBench, Blocksworld (instances symboliques opaques). Source: https://arxiv.org/abs/2602.03900.
- Chiffres rapportés (paper): baseline d'un modèle de raisonnement = 31,5 % d'exactitude sur ces instances; avec prompting TMK = 97,3 % d'exactitude sur les mêmes instances. Source: https://arxiv.org/abs/2602.03900.
- Observation: les auteurs mentionnent des « inversions de performance significatives » entre modèles de raisonnement. Source: https://arxiv.org/abs/2602.03900.

Courte note méthodologique: ces valeurs proviennent de l'abstract et doivent être reproduites sur les mêmes tâches pour valider la transposabilité.

## Implications techniques

Ce qui peut être directement soutenu par la source et recommandations prudentes (référence: https://arxiv.org/abs/2602.03900):

- Supporté: dans les expériences sur Blocksworld, le passage à un prompting structuré TMK a fait passer l'exactitude de 31,5 % à 97,3 % sur instances opaques.
- Implication pratique: un prompt structuré (Task / Method / Knowledge) peut fortement améliorer la décomposition de tâches et la justification causale sans réentraîner le modèle — à valider localement.
- Attention: les auteurs signalent des inversions de performance selon le modèle; testez 1–3 versions/modèles pour détecter régressions.

Exemple de template (à reproduire et ajuster — concept tiré du papier):

Task: énoncer l'état final précis (cible).

Method: décomposer la stratégie en sous‑tâches ordonnées.

Knowledge: lister invariants/contraintes/relations causales justifiant chaque action.

Paramètres opérationnels recommandés à tester: 1–3 few‑shots par slot; mesurer l'augmentation en tokens (voir Metriques). Source: https://arxiv.org/abs/2602.03900.

## Vue fondateur: consequences business

Conséquences produit et go‑to‑market (dérivées du fait que TMK peut améliorer fortement la planification en Blocksworld; source: https://arxiv.org/abs/2602.03900):

- Avantage produit potentiel: si gains similaires surviennent sur vos cas d'usage, vous pourriez atteindre une fiabilité de planification ≥ 90 % (seuil opérationnel proposé) sans fine‑tuning majeur.
- Différenciation commerciale: pouvoir présenter une amélioration relative ≥ 50 % ou un succès absolu de plan ≥ 90 % sur cas critiques est un argument fort pour l'automatisation multi‑étapes.
- Coûts et latence: attendre une augmentation du nombre de tokens par requête (hypothèse: +256 à +2048 tokens selon template) et une possible augmentation de la latence médiane (mesurer p50 et p95).

Recommandations de passage produit (hypothèses opérationnelles, valider par A/B):

- Critère de montée en charge: amélioration relative ≥ 50 % ou succès absolu ≥ 90 % sur échantillon représentatif.
- Critère de rollback: augmentation du taux de plans invalides > 5 % ou latence médiane excédant le SLA en ms (p.ex. SLA = 300 ms).

Source: https://arxiv.org/abs/2602.03900.

## Compromis et risques

Risques et compromis (avec référence explicite au papier sur les inversions de performance: https://arxiv.org/abs/2602.03900):

- Variabilité par modèle: le papier mentionne des inversions significatives entre modèles; risque de régression sur 1–3 modèles du pool. Mitigation: test multi‑modèle avant déploiement.
- Overhead tokens/latence: prompts TMK plus verbeux → coûts d'inférence plus élevés (estimer coûts en $/1k tokens) et latence p95; planifier limite acceptable (p.ex. coût < $0.10 par requête ou latence p95 < 1000 ms selon SLA).
- Généralisation limitée: Blocksworld est un domaine symbolique structuré; gains peuvent chuter sur données ambiguës ou bruitées. Mitigation: valider sur N≥200 exemples représentatifs avant rollout.

Mitigations proposées:

- Validator post‑plan pour rejeter plans manifestement invalides.
- Rollout progressif (feature flag) avec seuils d'alerte (rollback si taux invalides >5 %).
- Possibilité d'optimiser le template (réduire few‑shots) si tokens ou coût excessifs.

Source: https://arxiv.org/abs/2602.03900.

## Cadre de decision

Règles empiriques proposées pour la décision (cadre expérimental — source: https://arxiv.org/abs/2602.03900):

- Quand appliquer TMK: tâches nécessitant décomposition multi‑étapes explicite et justification causale (ex. planification symbolique, orchestration de workflows).
- Quand préférer fine‑tuning / autre approche: si A/B TMK n'apporte pas amélioration significative (critère: amélioration relative < 50 %) ou si contraintes tokens/latence rendent l'approche non viable.

Processus recommandé (chiffres et seuils):

1. Sélectionner N tâches représentatives (N=200 recommandé).
2. A/B: prompts actuels vs TMK sur 200 instances.
3. Mesurer: taux de succès, correction par étape, tokens moyen, latence p50/p95, coût $/req.
4. Critère de montée: amélioration relative ≥ 50 % OU succès absolu ≥ 90 % → piloto.

Tableau de décision (extrait, source: https://arxiv.org/abs/2602.03900):

| Critère | Baseline (paper) | TMK (paper) |
|---|---:|---:|
| Exactitude (instances opaques) | 31.5% | 97.3% |
| Domaine testé | Blocksworld | Blocksworld |


## Metriques a suivre

Inclure la soumission arXiv dans le dossier décisionnel: https://arxiv.org/abs/2602.03900

### Hypotheses / inconnues

- Hypothèse 1 (documentée par le papier): TMK peut porter l'exactitude sur instances symboliques opaques à 97,3 % (baseline 31,5 %) sur les tâches évaluées. Source: https://arxiv.org/abs/2602.03900.
- Hypothèse 2 (opérationnelle): TMK augmentera les tokens par requête (estimation testable: +256 à +2048 tokens selon template).
- Hypothèse 3 (modèle): 1–3 modèles dans votre pool peuvent voir leur performance inversée sous TMK; prévoir tests multi‑modèle.

Métriques quantitatives prioritaires (à collecter):

- Taux de succès de plan par instance (%) — objectif pilote ≥ 90 %.
- Correction par étape (per‑step correctness %).
- Taux d'actions invalides / hallucinations (%), seuil d'alerte 5 %.
- Tokens moyen par requête (tokens), delta attendu +256–+2048.
- Latence médiane et p95 (ms), ex. SLA p50 ≤ 300 ms, p95 ≤ 1000 ms.
- Coût par requête ($), cible opérationnelle < $0.10 selon usage.

### Risques / mitigations

- Risque: pas d'amélioration sur données réelles. Mitigation: refus de rollout sans A/B sur N≥200 exemples.
- Risque: latence ou coût inacceptables. Mitigation: réduire few‑shots, compresser section Knowledge, envisager fine‑tuning si volume élevé.
- Risque: hallucinations en production. Mitigation: validator automatisé, seuil rollback si taux invalides >5 %.

### Prochaines etapes

- Étape 0 (0–2 jours): implémenter template TMK minimal (Task/Method/Knowledge) et tester 20 tâches canoniques.
- Étape 1 (3–10 jours): A/B sur N=200 tâches représentatives, tester 2–3 modèles pour détecter inversions; collecter métriques listées.
- Étape 2 (10–21 jours): si amélioration ≥50 % relative ou succès ≥90 % sur tâches structurées, lancer pilote en prod (feature flag) avec monitoring étroit et critères de rollback.

Source principale: arXiv — Erik Goh, John Kos, Ashok Goel, « Knowledge Model Prompting Increases LLM Performance on Planning Tasks », soumis 3 février 2026: https://arxiv.org/abs/2602.03900
