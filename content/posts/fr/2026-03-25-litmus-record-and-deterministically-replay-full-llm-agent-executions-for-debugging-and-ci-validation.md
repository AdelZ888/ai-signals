---
title: "Litmus — enregistrer et rejouer de façon déterministe des exécutions d'agents LLM pour debug et validation CI"
date: "2026-03-25"
excerpt: "Litmus permet d'enregistrer des exécutions complètes d'agents LLM (prompts, appels d'outils, sorties) pour les rejouer de façon déterministe, injecter des fautes et bloquer des régressions en CI."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-25-litmus-record-and-deterministically-replay-full-llm-agent-executions-for-debugging-and-ci-validation.jpg"
region: "UK"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "NEWS"
tags:
  - "LLM"
  - "reproductibilité"
  - "CI"
  - "observabilité"
  - "litmus"
  - "débogage"
  - "UK"
sources:
  - "https://github.com/rylinjames/litmus"
---

## TL;DR en langage simple

- Litmus est un « flight recorder » pour agents basés sur des LLM (LLM = large language model — modèle de langage de grande taille). Il enregistre une exécution complète (prompts, appels d'outils, sorties) et permet de la rejouer de façon déterministe. (https://github.com/rylinjames/litmus)
- Le projet expose aussi des primitives pour l'injection de fautes (fault injection), le scoring de fiabilité et le CI‑gating (CI = intégration continue). (https://github.com/rylinjames/litmus)
- Résultat attendu en 30–120 minutes : capturer une trace, la rejouer localement, et tester une ou deux injections d'erreurs.

Court scénario concret : vous avez un chatbot qui oriente mal 1 ticket sur 20. Avec Litmus vous capturez 10 traces (dont plusieurs fautives), vous rejouez localement et vous simulez un timeout pour vérifier la gestion d'erreur.

Remarque simple avant les détails avancés : record-and-replay (enregistrer puis rejouer) fige l'état d'une exécution. Cela permet d'explorer un bug en conditions contrôlées, de simuler pannes d'API et d'automatiser des contrôles en CI sans retomber sur la variabilité d'un LLM en production.

## Ce qui a change

Le dépôt décrit un workflow « record-and-replay » pour exécutions d'agents LLM : enregistrement détaillé et replay déterministe. Le README et la page du projet indiquent explicitement le support de fault injection, reliability scoring et CI gating comme primitives du projet. (https://github.com/rylinjames/litmus)

Points concrets tirés du repo :

- Enregistrement complet des inputs, outputs et des appels d'outils (hooks, API externes).
- Rejeu déclaré comme déterministe pour reproduire des runs identiques.
- Primitives documentées pour l'injection d'erreurs (fault injection) et pour intégrer ces tests dans des pipelines CI (gating). (https://github.com/rylinjames/litmus)

Ces éléments sont présentés comme capacités du projet ; détaillez les commandes et l'API dans le README du dépôt pour votre usage précis.

## Pourquoi c'est important (pour les vraies equipes)

Les logs classiques ne suffisent pas toujours contre des erreurs intermittentes ou des comportements non déterministes des LLM. Une trace complète permet de :

- Reproduire un incident hors production et réduire le temps d'investigation. Objectif pratique : 30–60% de réduction du temps pour des incidents reproductibles.
- Détecter et bloquer des régressions grâce à des gates CI basés sur des replays.
- Tester la résilience en simulant des pannes (timeouts, codes 5xx, absence d'outil) sans toucher la production.

Chiffres pratiques (recommandations) : commencer avec ~10 traces, rejouer chaque trace 1–3 fois, viser un seuil initial de fiabilité à ~0.8 (80%). Ces valeurs sont des points de départ à valider en contexte. (https://github.com/rylinjames/litmus)

## Exemple concret: a quoi cela ressemble en pratique

Cas d'usage : assistant support qui oriente mal 1 ticket sur 20 (5%).

Flux d'intervention pragmatique :

1. Capturer 10 traces représentatives du flux (par ex. 7 bonnes, 3 fautives). (https://github.com/rylinjames/litmus)
2. Rejouer localement chaque trace et vérifier la reproductibilité des sorties.
3. Utiliser la primitive d'injection pour simuler un timeout (ex. 2000 ms) et un échec d'API (code 503). Observer retries et dégradations.
4. Ajouter un job CI pré‑merge qui rejoue 5 traces rapides et une suite nocturne plus large (50+ traces) pour surveillance continue.

Checklist opérationnelle rapide :

- [ ] Capturer 10 traces représentatives. (https://github.com/rylinjames/litmus)
- [ ] Rejouer chaque trace localement 1–3 fois.
- [ ] Simuler 2 types d'erreurs (timeout 2s, 503) et vérifier la gestion.
- [ ] Ajouter un job CI pré‑merge (5 traces) et une suite nocturne (50+ traces).

Note : adaptez les commandes et l'API à partir du README officiel du dépôt. (https://github.com/rylinjames/litmus)

## Ce que les petites equipes et solos doivent faire maintenant

Conseils actionnables pour équipes de 1–4 personnes ou fondateurs solo :

1) Prioriser un flux critique et capturer 3–10 traces représentatives.
   - Cible : au moins 3 runs fautifs et quelques runs sains, total ~10 traces en une semaine.
   - Effort estimé : 30–90 minutes.

2) Rejouer localement et mettre en place un petit gate CI (5 traces).
   - Job CI pré‑merge : rejouer 5 traces courtes (<500 tokens par run) et échouer si le scoring qualitatif change significativement (par ex. >20% de variation).
   - Garder une suite complète en nightly (50+ traces) pour surveillance longue.

3) Protéger les données et limiter la rétention.
   - Appliquer une redaction avant stockage : masquer PII (données personnelles identifiables), clés et secrets.
   - Rétention par défaut : ≤7 jours ; étendre à 30–90 jours seulement si justifié et documenté.
   - Restreindre l'accès aux traces à un petit groupe (<5 personnes) et chiffrer les données au repos.

Astuce budget : commencer avec stockage local ou un niveau gratuit S3, migrer vers une solution payante si vous dépassez ~50 traces.

Référence : pattern record/replay décrit dans le repo Litmus. (https://github.com/rylinjames/litmus)

## Angle regional (UK)

Litmus fournit les primitives d'enregistrement et de replay ; le lieu de stockage et la gouvernance restent à l'équipe. (https://github.com/rylinjames/litmus)

Considérations pratiques pour le Royaume‑Uni :

- Stockage régional : privilégier des régions UK sur AWS/GCP/Azure si vous traitez des données sensibles.
- Rétention et accès : rétention courte (7–30 jours) et accès restreint (<5 personnes) pour réduire le risque réglementaire.
- Redaction/pseudonymisation : appliquer avant tout stockage long terme et documenter les raisons pour les audits.

Ces actions doivent être validées avec la revue juridique et la sécurité interne. (https://github.com/rylinjames/litmus)

## Comparatif US, UK, FR

Le mécanisme d'enregistrement/replay vient de Litmus ; ci‑dessous des choix opérationnels possibles par pays (point de départ). (https://github.com/rylinjames/litmus)

| Pays | Stockage de démarrage | Redaction requise ? | Remarques chiffrées |
|---|---:|---:|---|
| US | Région AWS us‑east (démarrage) | Oui — PII à masquer | Vérifier restrictions d'État, coûts estimés $0–$100/mo selon volume (https://github.com/rylinjames/litmus)
| UK | Région UK‑South / UK‑West | Oui — pseudonymisation recommandée | Rétention initiale 7–30 jours, revue si >50 traces/jour (https://github.com/rylinjames/litmus)
| FR | Région eu‑west / fr | Oui — minimiser identifiants | Conserver logs techniques 30–90 jours si besoin, documenter finalité (https://github.com/rylinjames/litmus)

Ces suggestions sont pragmatiques et doivent être adaptées aux exigences légales locales.

## Notes techniques + checklist de la semaine

### Hypotheses / inconnues

- Le repo Litmus affirme l'enregistrement et le replay déterministe, plus des primitives pour fault injection, reliability scoring et CI gating ; les détails d'API (CLI, formats, commandes exactes) doivent être vérifiés dans le README du dépôt. (https://github.com/rylinjames/litmus)
- Les seuils numériques (10 traces, 3 replays, 0.8 de scoring, 5–10 traces CI) sont des recommandations pragmatiques à valider sur vos propres traces.

### Risques / mitigations

- Risque : stockage de PII / secrets dans les traces.
  - Mitigation : redaction automatique, chiffrage au repos, accès restreint (<5 comptes), rétention courte (7–30 jours). (https://github.com/rylinjames/litmus)
- Risque : fausse confiance basée sur un petit échantillon.
  - Mitigation : commencer avec N=10 traces puis monter à 50+ avant un déploiement large ; rejouer 1–3 fois chaque trace pour confirmer le déterminisme.
- Risque : coût CI élevé.
  - Mitigation : gate léger pré‑merge (5 traces) et suite complète en nightly (50+ traces).

### Prochaines etapes

- [ ] Cloner / forker https://github.com/rylinjames/litmus et lire le README
- [ ] Capturer 10 traces (7 bons, 3 fautifs) sur votre flux critique
- [ ] Rejouer chaque trace 1–3 fois localement et documenter les différences
- [ ] Ajouter un job CI pré‑merge avec 5 traces et une nightly à 50+ traces
- [ ] Déployer redaction + politique de rétention (7–30 jours) et restreindre accès

Méthodologie : ce résumé est basé sur la description publique du projet Litmus. Les valeurs chiffrées sont des recommandations opérationnelles à valider en contexte. (https://github.com/rylinjames/litmus)
