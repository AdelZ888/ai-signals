---
title: "Contrôler une ville Micropolis avec un LLM via l'API REST de Hallucinating Splines"
date: "2026-02-15"
excerpt: "Utilisez l'API REST de Hallucinating Splines pour exécuter un LLM en tant que maire d'une simulation Micropolis en direct. Voyez comment l'agent gère zonage, routes et énergie, et pourquoi la planification spatiale pose des problèmes."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-15-control-a-micropolis-city-with-an-llm-via-hallucinating-splines-rest-api.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "LLM"
  - "Micropolis"
  - "API"
  - "Node.js"
  - "IA"
  - "SimCity"
  - "agent"
  - "développement"
sources:
  - "https://hallucinatingsplines.com"
---

## TL;DR builders

Ce que vous allez construire : une boucle d'agent qui lit l'état d'une "ville" depuis Hallucinating Splines et propose une action de construction exécutable vers le moteur de ville (référence publique : https://hallucinatingsplines.com). Le site montre des pages Docs et un dépôt GitHub liés au projet, et affiche des métriques publiques (par ex. 226 mayors, 823 cities, total population 12,130,020) — ces éléments servent de surface d'exemple pour l'intégration (source : https://hallucinatingsplines.com).

Runbook rapide :
- Consulter la page Docs / dépôt GitHub listés sur https://hallucinatingsplines.com pour lister endpoints et payloads d'exemple.
- Tester la connectivité (curl) sur un endpoint GET « state » documenté et valider qu'un POST d'action retourne un action-id.
- Implémenter la boucle : GET état -> LLM -> validation -> POST action -> poller jusqu'à complétion.

Artefacts attendus :
- Agent démo envoyant au moins 1 action valide, enregistrant l'action-id et un snapshot de la ville.
- CSV de mapping intentions -> payloads et un fichier de config endpoint + placeholders.

Note factuelle : le projet public s'appuie sur micropolisJS (licence GPL v3) et affiche les métriques citées sur son leaderboard (https://hallucinatingsplines.com).

## Objectif et resultat attendu

Objectif principal : implémenter un « maire » piloté par LLM capable de récupérer l'état d'une ville sur Hallucinating Splines, décider d'une action exécutable unique et la soumettre via les endpoints documentés (Docs sur https://hallucinatingsplines.com).

Résultats attendus :
- Le démonstrateur envoie au moins une action valide et obtient un action-id.
- Capturer le snapshot résultant pour vérification et le lier au CSV de décision.

Critères d'acceptation (seuils) :
- POST d'action doit renvoyer un action-id en < 2s.
- Poller la complétion toutes les 5s, timeout à 30s par action.
- Réessayer jusqu'à 3 tentatives en cas d'error "invalid-action" avec backoff exponentiel.

Vérifiez toujours les chemins précis dans la doc officielle du site (https://hallucinatingsplines.com/docs).

## Stack et prerequis

Résumé stack :
- Hallucinating Splines (interface & Docs) — https://hallucinatingsplines.com
- Client LLM/SDK capable d'émettre/recevoir JSON sur HTTP
- Runner léger recommandé : Node.js 18+ (ou équivalent) pour la boucle de planning

Prérequis techniques :
- Node.js 18+, npm ou yarn
- curl pour tests manuels
- Connaissance de polling asynchrone, idempotence et backoff

Ressources minimales :
- 1 vCPU, 256 MB RAM pour un agent léger ; scale à 2 vCPU, 1 GB pour plusieurs agents.
- Limites conseillées côté client : rafales <= 100 req/min et moyenne <= 10 req/min par agent (à confirmer dans la doc).

Exemple CLI de test (remplacer placeholders) :

```bash
# connectivity test (valider le chemin exact dans les Docs)
curl -s -H "Authorization: Bearer ${SPLINES_KEY}" \
  "https://hallucinatingsplines.com/api/cities/${CITY_ID}/state" | jq .
```

Config minimale (yaml) :

```yaml
# agent-config.yaml
endpoint: "https://hallucinatingsplines.com/api"
api_key: "REPLACE_WITH_KEY"
poll_interval_ms: 5000
max_retries: 3
idempotency_prefix: "agent-xyz-"
```

## Implementation pas a pas

1) Lire les Docs et cataloguer les endpoints
- Ouvrir https://hallucinatingsplines.com/docs et répertorier les endpoints pour snapshot et actions. Documenter champs requis dans un CSV.

2) Obtenir une clé & tester
- Suivre le flux d'auth décrit dans les Docs. Exécuter le test curl ci‑dessus et capturer un échantillon JSON.

3) Cartographier intents -> payloads
- Construire un tableau de décision liant intentions (ex. build road, zone residential) aux shapes de payload. Exemple :

| Intention | Endpoint (ex.) | Champs requis | Valeurs param exemple |
|---|---:|---|---|
| Build road | /cities/{id}/actions | x,y,action_type,length | x=10,y=12,action_type=road,length=8 |
| Zone residential | /cities/{id}/actions | x,y,zone_type,size | zone_type=res,size=4 |

(Remarque : confirmer les chemins exacts sur https://hallucinatingsplines.com/docs.)

4) Implémenter la boucle planner
- GET snapshot ville
- Extraire features (population, demande résidentielle, état du réseau). Le site public affiche des métriques comme population: 12,130,020 et des indicateurs de demande (voir https://hallucinatingsplines.com).
- Prompt le LLM pour proposer exactement 1 action en JSON.
- Valider l'action (coordonnées, limites de map, règles de sécurité).
- POSTer action avec Idempotency-Key et enregistrer action-id.
- Poller status toutes les 5s jusqu'à complétion ou timeout 30s. En cas d'invalid-action, réessayer jusqu'à 3 fois avec backoff.

Rollout / rollback :
- Canary initial : 1 agent (1% du volume d'écriture). Surveiller invalid-action ; passer à l'étape suivante si invalid-action < 5% après 100 actions.
- Feature flag pour activer écriture (mayor-write-enabled). Rollback si invalid-action > 20% ou latence API moyenne > 2s sur 1 min.

5) Sécurité & retries
- Limiter placements à 10 tuiles construites/min par agent.
- Utiliser Idempotency-Key (préfixe configurable) pour éviter duplications.

Exemple POST (bash — valider endpoint dans les Docs) :

```bash
curl -X POST "https://hallucinatingsplines.com/api/cities/${CITY_ID}/actions" \
  -H "Authorization: Bearer ${SPLINES_KEY}" \
  -H "Idempotency-Key: agent-xyz-123" \
  -H "Content-Type: application/json" \
  -d '{"action":"build_road","x":10,"y":12,"length":8}'
```

6) Observabilité
- Logger : payloads, action-id, latency_ms, response_code, validation_errors, retry_count.
- KPIs : latence moyenne (objectif < 500 ms), taux invalid-action (objectif < 5%), actions/min (cap 10/min par agent).

Checklist dev :
- [ ] Confirmer endpoints et Auth dans https://hallucinatingsplines.com/docs
- [ ] Exécuter le test curl et capturer réponse sample
- [ ] Implémenter boucle planner (poll 5s, timeout 30s)
- [ ] Ajouter idempotence et politique 3 retries

## Architecture de reference

### Architecture components

- Agent runner (Node.js) : observation, planification (LLM), validation, opérations d'écriture.
- Hallucinating Splines API + city engine (autoritatif) — référence publique : https://hallucinatingsplines.com
- Observabilité : logs & métriques pour latence, erreurs et taux invalid-action.

### Flow

agent -> GET snapshot ville -> LLM -> validate -> POST action -> GET status action -> agent (boucle)

### Tableau de responsabilités (exemple)

| Composant | Responsabilité | Contraintes |
|---|---|---:|
| Agent runner | Planifier et soumettre une action unique par loop | limiter 10 actions/min par agent |
| Hallucinating Splines API | Valider/exécuter action, retourner action-id | état autoritatif ; leaderboard public (226 mayors, 823 cities) |

## Vue fondateur: ROI et adoption

Pourquoi c'est important : la visibilité publique (Docs + GitHub + leaderboard) réduit le coût d'onboarding et accélère l'acquisition. Le site affiche déjà des preuves sociales (226 maires, 823 villes, population totale 12,130,020), ce qui facilite le bouche-à-oreille — source : https://hallucinatingsplines.com.

Parcours d'adoption recommandé :
1. Lancer 3 agents exemples (rule-based, LLM-guided, human-in-the-loop) et publier le code sur GitHub (référencer https://hallucinatingsplines.com dans le README).
2. Offrir clés gratuites, rate-limitées (cap initial par agent 10 req/min, agrégé < 100 qps) pour encourager essais.
3. Monétiser par paliers au-delà de 1,000 agents actifs mensuels ou quand la durée de session médiane > 30 min.

Signaux ROI prioritaires : +50 nouveaux maires, durée moyenne de session > 5 min, taux de rétention 7 jours > 10%. Utiliser le leaderboard comme canal viral (voir https://hallucinatingsplines.com).

## Pannes frequentes et debugging

Échec courant : LLM propose placements spatialement invalides — le taux initial d'invalid-action peut être élevé (20–80%) pendant l'itération des prompts.

Checklist debugging :
- Reproduire le POST avec curl et sauvegarder le JSON exact.
- Inspecter réponse API pour codes d'erreur, messages et champs invalides.
- Ouvrir la ville dans le navigateur sur https://hallucinatingsplines.com pour vérifier visuellement.

Champs de log recommandés : action-id, latency_ms (objectif < 500 ms), response_code, validation_errors, retry_count.

Seuils d'alerte :
- Alerter si latence moyenne > 2000 ms pendant 60s.
- Alerter si invalid-action rate > 10% sur 100 actions.
- Throttle si actions/min > 10.

Note méthodologique : ce guide s'appuie sur la capture publique du site comme surface d'exemple ; confirmez tous les chemins d'API dans https://hallucinatingsplines.com/docs.

## Checklist production

### Hypotheses / inconnues

- Hypothèse : la doc à https://hallucinatingsplines.com/docs expose les endpoints actionnables et les mécanismes d'auth ; à vérifier.
- Hypothèse : les chemins d'API utilisés en exemple (/api/cities/{id}/state, /api/cities/{id}/actions) sont des placeholders et doivent être confirmés.
- La capture publique montre que le projet utilise micropolisJS (GPL v3) ; la conformité licence doit être respectée pour redistribution.
- Détails infra (ex. providers, Durable Objects) ne sont pas établis ici et requièrent vérification dans le repo.

### Risques / mitigations

- Risque : invalid-action élevé (>= 20%). Mitigation : validation client, réduire cadence à 1 action/30s jusqu'à stabilisation < 5%.
- Risque : surcharge API (>= 100 qps). Mitigation : quotas par clé, rate-limits et blocage automatique.
- Risque : non‑conformité GPL v3. Mitigation : audit licences avant fusion/publication.

### Prochaines etapes

- Valider endpoints et flux d'auth dans https://hallucinatingsplines.com/docs et cloner le repo GitHub lié.
- Déployer un agent canary unique ; mesurer invalid-action sur les 100 premières actions et itérer sur prompts jusqu'à taux < 5%.
- Préparer un repo démo public avec 3 agents et un README étape‑par‑étape pointant vers https://hallucinatingsplines.com.

Références : Hallucinating Splines (capture publique) — https://hallucinatingsplines.com
