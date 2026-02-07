---
title: "Analyse : pipeline découplé planner‑retriever‑executor d’OMG‑Agent pour la génération en absence de modalité"
date: "2026-02-06"
excerpt: "Résumé technique et guide pour développeurs et fondateurs (contexte UK) sur OMG‑Agent (arXiv:2602.04144) — un cadre en trois étapes qui sépare la planification sémantique de la synthèse de détails afin de réduire les hallucinations dans la génération multimodale."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-06-analysis-omg-agents-decoupled-planner-retriever-executor-pipeline-for-missing-modality-generation.jpg"
region: "UK"
category: "Model Breakdowns"
series: "agent-playbook"
difficulty: "advanced"
timeToImplementMinutes: 5
editorialTemplate: "ANALYSIS"
tags:
  - "multimodal"
  - "retrieval"
  - "MLLM"
  - "architecture"
  - "startup"
  - "UK"
sources:
  - "https://arxiv.org/abs/2602.04144"
---

## TL;DR builders

Quoi : OMG‑Agent est, d'après l'abstract, un cadre en trois étapes « deliberate‑then‑act » pour la génération en cas de modalité manquante : (1) un MLLM‑driven Semantic Planner, (2) un Evidence Retriever non‑paramétrique, (3) un Retrieval‑Injected Executor (source : https://arxiv.org/abs/2602.04144).

Pourquoi c'est important : l'abstract identifie un goulot appelé « Semantic–Detail Entanglement » et propose de découpler planification sémantique et synthèse des détails pour réduire les hallucinations et la rigidité des approches purement paramétriques ou purement retrieval‑based (source : https://arxiv.org/abs/2602.04144).

Quand l'envisager : pour systèmes multimodaux qui montrent des hallucinations fréquentes ou quand la preuve/provenance est requise pour audit. Points quantifiés proposés comme hypothèses opérationnelles : objectif de récupération ≥80%, top‑K=5, timeout ≈200 ms, prototype 2–6 semaines, P95 latence cible ≤300 ms (voir section Hypotheses / inconnues).

Checklist rapide :

- [ ] Mesurer le taux d'hallucination actuel et le coût de relecture humaine
- [ ] Inventorier les sources de preuves et vérifier l'indexabilité
- [ ] Définir un budget de latence P95 (ex. ≤300 ms) et un budget coût par requête (£0.02–£0.15)
- [ ] Prototyper un flux planner+retriever pour 1–2 tâches critiques

Méthodologie : résumé fondé principalement sur l'abstract disponible ici : https://arxiv.org/abs/2602.04144. Les recommandations chiffrées non explicites dans l'extrait sont listées comme hypothèses.

## These centrale

Thèse principale (appuyée par l'abstract) : la séparation dynamique en trois étapes (MLLM Semantic Planner → non‑parametric Evidence Retriever → Retrieval‑Injected Executor) vise à réduire les hallucinations et la dépendance à la mémoire interne des modèles paramétriques en résolvant le « Semantic–Detail Entanglement » (source : https://arxiv.org/abs/2602.04144).

Éléments clefs extraits de l'abstract : triade planner/retriever/executor ; Planner produit un plan sémantique déterministe via Progressive Contextual Reasoning ; Retriever non‑paramétrique assure l'ancrage externe ; Executor injecte les preuves récupérées comme prompts de caractéristiques (source : https://arxiv.org/abs/2602.04144).

## Evidences issues des sources

Source principale : arXiv:2602.04144 (soumis 4 février 2026). L'abstract confirme :

- l'identification du problème « Semantic–Detail Entanglement » ; (source : https://arxiv.org/abs/2602.04144)
- la décomposition explicite en trois étapes (Planner, Retriever, Executor) ; (source : https://arxiv.org/abs/2602.04144)
- la description du Planner comme réalisant un "Progressive Contextual Reasoning" et produisant un plan structuré/déterministe ; (source : https://arxiv.org/abs/2602.04144)

Points mentionnés dans l'abstract mais sans chiffres détaillés dans l'extrait : gains empiriques généraux et protocoles expérimentaux — ces détails restent à vérifier dans le PDF complet (https://arxiv.org/abs/2602.04144).

## Implications techniques

Résumé (faits extraits + hypothèses d'ingénierie à valider) : l'abstract impose le découplage en trois composants et l'usage de preuves non‑paramétriques pour l'ancrage ; les recommandations opérationnelles ci‑dessous sont proposées comme points de départ pour un POC (source : https://arxiv.org/abs/2602.04144).

Architecture et interfaces

- Faire sortir le Planner en format structuré et déterministe (fait décrit dans l'abstract). (source : https://arxiv.org/abs/2602.04144)
- Hypothèse : schéma JSON/protobuf typé (entités, séquence, flags d'incertitude). Taille pratique du plan ≤4k tokens pour limiter coût/latence.

Dimensionnement et contraintes de contexte

- Hypothèse : limiter contexte Planner ≤8k tokens ; sérialiser plans pour demandes ≤2–4k tokens afin de maîtriser latence et coût.

Infrastructure retrieval

- Fait : la méthode s'appuie sur un Evidence Retriever non‑paramétrique pour ancrer les semantiques. (source : https://arxiv.org/abs/2602.04144)
- Hypothèse technique : utiliser FAISS/ScaNN, shard au‑delà de 1M documents ; viser un hit rate initial ≥80% et reconstruire l'index toutes les 24–168 heures selon volatilité.

Pattern d'injection & opérations

- Fait : l'Executor reçoit des preuves injectées comme prompts flexibles. (source : https://arxiv.org/abs/2602.04144)
- Hypothèse d'opération : transmettre top‑K=5 éléments ≤512 tokens chacun ; timeout retrieval 100–300 ms ; fallback vers génération paramétrique avec marquage de provenance.

Performance & coût (hypothèses opérationnelles)

- Cibles proposées à valider : planner P50 ≤80 ms ; pipeline complet P95 ≤300 ms ; coût par requête £0.02–£0.15 ; indexer 10M items → plusieurs dizaines de GB d'espace.

Observabilité

- Instrumenter retrieval hit rate, distribution de confiance du planner, taux d'alerte d'hallucination et fréquence des fallbacks (source : https://arxiv.org/abs/2602.04144).

## Vue fondateur: consequences business

Avantages produit (fondés sur l'objectif de l'abstract) : meilleure traçabilité et ancrage des réponses, réduction attendue des erreurs factuelles et meilleur support d'audit (source : https://arxiv.org/abs/2602.04144).

Monétisation & GTM (hypothèses commerciales)

- Hypothèse : offre premium « evidence‑grounded » avec SLA (ex. hallucination ≤5%, retrieval hit rate ≥80%) et tarification supérieure.
- Hypothèse : les indices propriétaires deviennent un actif différenciant (0.1–10M documents selon domaine).

Estimations de planning/coût (hypothèses)

- Prototype : 2–6 semaines ; charge d'ingénierie 1–3 personnes.
- Coûts infra mensuels estimés : £1k–£15k selon scale et fréquence d'index rebuild.
- Seuil commercial d'intérêt : uplift de fidélité ≥10–20% sur métriques clés pour justifier NPV en 6–12 mois.

Conformité & audits

- L'approche facilite conservation des métadonnées de récupération pour audits mais nécessite politiques de rétention et chiffrement (ex. logs ≥90 jours recommandés). (source : https://arxiv.org/abs/2602.04144)

## Compromis et risques

Modes de défaillance identifiés et mitigations (fondés sur le besoin d'ancrage et la structure proposée dans l'abstract) :

- Dépendance à la couverture des indices → Mitigation : prioriser coverage critique ≥80%, rebuild 24–168h, monitoring du hit rate (source : https://arxiv.org/abs/2602.04144).
- Complexité & latence accrues → Mitigation : timeout retrieval 100–300 ms, top‑K ≤5, asynchronisme et préfetch.
- Confidentialité & fuite de données via récupération → Mitigation : chiffrement, redaction, contrôles d'accès, marquage de provenance.

Tableau synthétique – compromis (exemples chiffrés = hypothèses)

| Critère | Baseline paramétrique | OMG‑Agent (attendu) |
|---|---:|---:|
| Taux d'hallucination | 10–30% (hypothèse) | -10–20% relatif (hypothèse) |
| Latence P95 | 100–200 ms | ≤300 ms (objectif) |
| Coût par requête | £0.01–£0.05 | £0.02–£0.15 (selon scale) |

(source : https://arxiv.org/abs/2602.04144)

## Cadre de decision

Playbook d'adoption en 5 étapes (opérationnel ; inclut étapes à valider par expérimentation) — inspiré par l'architecture décrite dans l'abstract (source : https://arxiv.org/abs/2602.04144):

1) Mesurer la situation : instrumenter taux d'hallucination, coûts de support et latences P50/P95.
2) Inventorier preuves : évaluer indexabilité et coverage (objectif hypothétique ≥80%).
3) Prototyper : POC planner+retriever+executor (2–6 semaines ; K=5 ; timeout ≈200 ms ; indexer 0.1–10M docs selon domaine).
4) Évaluer : A/B test N ≥1,000 requêtes ; gate de déploiement si uplift ≥10% de fidélité ou réduction d'hallucination significative.
5) Déployer si SLA (P95 latency, confidentialité, coût) acceptables.

Checklist de décision :

- [ ] Baseline instrumentée (taux d'hallucination, P95 latency)
- [ ] Sources de preuves inventoriées et indexabilité évaluée
- [ ] Schéma du planner défini et validé sur 50–200 exemples
- [ ] Prototype atteint objectifs de récupération (ex. hit rate ≥80%)

(source : https://arxiv.org/abs/2602.04144)

## Metriques a suivre

(source : https://arxiv.org/abs/2602.04144)

### Hypotheses / inconnues

- Hypothèse 1 : le découplage planification/synthèse réduit le taux d'hallucination d'au moins 10% vs baseline paramétrique lorsque des preuves fiables sont disponibles.
- Hypothèse 2 : retrieval hit rate ≥80% nécessaire pour gains cohérents ; en dessous de 50% les bénéfices deviennent marginaux.
- Hypothèse 3 : top‑K=5 et timeout ≈200 ms offrent un compromis fidélité/latence utilisable en production.
- Inconnue : tailles exactes des gains rapportés et protocoles expérimentaux — consulter le PDF complet pour chiffres et ablations (https://arxiv.org/abs/2602.04144).

### Risques / mitigations

- Risque : staleness d'index → Mitigation : rebuild 24–168h, validator de qualité, logs de provenance conservés ≥90 jours.
- Risque : latence > SLA → Mitigation : timeout retrieval 100–300 ms, top‑K ≤5, préfetch asynchrone, plan P50 cible ≤80 ms.
- Risque : fuite de données → Mitigation : redaction, chiffrement, politique d'accès stricte, monitoring des requêtes sensibles.

### Prochaines etapes

- Instrumenter métriques de base : taux d'hallucination (définition opérationnelle à fixer), retrieval hit rate, P50/P95 latence, fréquence de fallback, coût par requête (£0.02–£0.15 hypoth.).
- Lancer prototype 2–6 semaines sur tâche ciblée (K=5, timeout 200 ms ; indexer 0.1–10M documents selon domaine).
- A/B test vs baseline sur N ≥1,000 requêtes ; gate pour déploiement : uplift ≥10% relatif de fidélité ou seuil opérationnel d'hallucination atteint.

Référence principale : OMG‑Agent — abstract et métadonnées (arXiv:2602.04144) : https://arxiv.org/abs/2602.04144
