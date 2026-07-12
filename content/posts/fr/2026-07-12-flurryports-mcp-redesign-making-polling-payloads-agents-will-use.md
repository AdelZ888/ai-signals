---
title: "Refonte MCP de FlurryPORT : rendre le polling utile pour les agents IA"
date: "2026-07-12"
excerpt: "Expériences de FlurryPORT montrant que les agents de codage ignorent les surfaces MCP/stdio trop maigres. Ajoutez des résumés humains, actions explicites, métadonnées de quota/burst et conservation des signatures de webhook pour augmenter l'utilisation."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-12-flurryports-mcp-redesign-making-polling-payloads-agents-will-use.jpg"
region: "UK"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "IA"
  - "MCP"
  - "webhooks"
  - "FlurryPORT"
  - "provenance"
  - "développement"
  - "startups"
  - "UK"
sources:
  - "https://blog.spill.coffee/p/trust-the-harbor-pilot"
---

## TL;DR en langage simple

- Un polling MCP (Model Context Protocol) trop basique est souvent ignoré par les agents IA ; rendre le payload « récompensant » augmente l'usage du tool. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)
- Exemple concret recommandé : ne pas renvoyer seulement { "captureCount": 12 } mais fournir aussi des champs actionnables et de contexte (ex. `capturesRemaining: 88`, `burst.perMinute: 30`, `burst.usedThisMinute: 22`, `notices`, `actions`). (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)
- Conserver la provenance/signatures lors des replays de webhooks facilite le debug et l'audit. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)

Méthodologie : résumé basé uniquement sur l'extrait « Trust the harbor pilot » (Gene Beal). (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)

## Ce qui a change

Gene Beal a testé une implémentation MCP connectée à FlurryPORT ; FlurryPORT capture les webhooks entrants sur une URL stable et les rejoue vers l'application locale en conservant les signatures. Dans ces tests, un agent IA a fréquemment contourné l'outil minimal et essayé d'appeler d'autres endpoints imaginés. La conclusion : un payload minimal (par ex. { "captureCount": 12 }) n'est pas assez attractif pour l'agent — il faut fournir des affordances explicites. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)

## Pourquoi c'est important (pour les vraies equipes)

- Adoption plus rapide : des `actions` explicites réduisent l'incertitude et augmentent la probabilité que l'agent choisisse le tool. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)
- Respect des limites : exposer `burst` et `capturesRemaining` permet à l'agent d'anticiper et d'éviter d'exploser des quotas (horizon chiffré). (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)
- Observabilité / sécurité : rejouer les webhooks avec les signatures intactes facilite le lien entre événement source et replay, accélérant diagnostics et audits. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)

Priorité pratique pour une équipe produit : 1) rendre le polling immédiatement actionnable (actions + notices + quotas), 2) préserver la provenance/signatures pour replays. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)

## Exemple concret: a quoi cela ressemble en pratique

Minimal versus enrichi — extrait et adaptation directe de l'exemple de l'article. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)

| Comparaison | Payload minimal | Payload enrichi (préférable) |
|---|---:|---|
| Exemple | `{ "captureCount": 12 }` | `{ "captureCount": 12, "capturesRemaining": 88, "burst": { "perMinute": 30, "usedThisMinute": 22 }, "notices": ["8 captures until session cap"], "actions": [{ "label": "Claim session", "id": "claim-session-123" }] }` |

Pourquoi le payload enrichi fonctionne mieux : `notices` fournit un message lisible que l'agent peut réutiliser, `capturesRemaining` donne un horizon chiffré, `burst` explicite la limite de taux (par ex. 30/min) et `actions` donne une affordance exécutable (ici 1 action dans l'exemple). Conserver les signatures originales pour les replays permet de relier le replay à l'événement source pour le débogage. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)

## Ce que les petites equipes et solos doivent faire maintenant

Actions concrètes, rapides et réalisables par un solo founder ou une petite équipe (chacune appuyée par l'extrait source) : (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)

1. Implémentez un champ `actions` simple dans le payload de polling : chaque action = { "label", "id" }. Mesurez `action_invoke_count` côté serveur pour voir si l'agent l'utilise. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)
2. Exposez les métadonnées de quota : `capturesRemaining`, `burst.perMinute` et `burst.usedThisMinute`. Ces 3 champs prennent peu de place mais changent le comportement de l'agent. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)
3. Ajoutez des `notices` courtes (une ligne lisible) qui signalent l'urgence ou l'état, plutôt que de compter sur des nombres bruts. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)
4. Pour les environnements de replay locaux, conservez `original_signature` et reliez-le au ticket/trace lors du debug. Anonymisez les signatures avant toute publication. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)
5. Mesurez rapidement : avant/après le changement, comparez `tool-usage_rate` et `action_invoke_count`. Même des volumes faibles (p.ex. 12 sessions) suffisent pour repérer une tendance initiale. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)

Ces tâches sont conçues pour être implémentées en quelques heures à quelques jours par une seule personne : ajout d'un champ JSON, instrumentation d'un compteur, et conservation de la signature au replay. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)

## Angle regional (UK)

Au Royaume‑Uni, la valeur ajoutée opérationnelle est directe : relier un replay signé à un ticket d'incident aide les équipes support et compliance. Conserver les signatures intactes lors du replay facilite l'intégration avec les processus d'audit internes et les revues post‑incident. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)

Considérez ces points pratiques pour une petite équipe UK : garder un lien immuable entre replay et événement source, documenter la procédure de redaction/anonymisation pour démonstrations externes, et instruire 1 personne (ou rota de 2) pour les replays lors des incidents. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)

## Comparatif US, UK, FR

Le principe technique est identique : rendre le polling utile (actions/notices/quotas) et préserver la provenance des webhooks. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)

Différences opérationnelles à surveiller localement : exigences d'audit et règles sur la protection des données (PII) en France vs. obligations de traçabilité en UK/US. Validez les obligations légales avant d'exposer des signatures ou des metadata en clair. Voir la section Hypotheses / inconnues pour éléments à confirmer. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)

## Notes techniques + checklist de la semaine

### Hypotheses / inconnues

- Hypothèse : enrichir le payload (`actions`, `notices`, `capturesRemaining`, `burst`) augmente l'utilisation du tool par les agents comparé à un payload minimal. À valider par métriques. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)
- Hypothèse : conserver `original_signature` réduit le temps moyen d'investigation ; mesurer le temps de diagnostic avant/après. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)
- Hypothèse opérationnelle (à tester) : un canary sur 5–10% des sessions permet de vérifier l'impact sans gros risque; viser une augmentation initiale de +10–30% des invocations d'actions comme signal de succès. Ces chiffres sont des hypothèses à valider. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)

### Risques / mitigations

- Risque : fuite de PII via `notices` ou métadonnées. Mitigation : redaction/anonymisation avant exposition publique et règles strictes sur les champs inclus. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)
- Risque : saturation des endpoints d'action si l'agent invoque trop souvent. Mitigation : déclarer `burst` et appliquer throttling côté serveur (exposer limites visibles pour que l'agent anticipe). (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)
- Risque : changements incompatibles. Mitigation : rollout progressif et instrumentation (`action_invoke_count`, `tool-usage_rate`). (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)

### Prochaines etapes

- [ ] Ajouter `actions` (label + id) au payload de polling et instrumenter `action_invoke_count`. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)
- [ ] Exposer `capturesRemaining` et `burst.{perMinute,usedThisMinute}` en environnement de test. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)
- [ ] Introduire `notices` lisibles; préparer au moins 1 message par état (ex. seuil proche du cap). (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)
- [ ] Conserver `original_signature` pour replays internes et documenter la procédure d'anonymisation pour démos publiques. (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)
- [ ] Lancer les tests et comparer avant/après sur métriques clés (`tool-usage_rate`, `action_invoke_count`). (Source : https://blog.spill.coffee/p/trust-the-harbor-pilot)

Référence : "Trust the harbor pilot" par Gene Beal (FlurryPORT) — https://blog.spill.coffee/p/trust-the-harbor-pilot
