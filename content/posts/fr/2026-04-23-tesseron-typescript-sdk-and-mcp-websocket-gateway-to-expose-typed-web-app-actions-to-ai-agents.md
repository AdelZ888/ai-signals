---
title: "Tesseron : SDK TypeScript et passerelle WebSocket MCP pour exposer des actions typées aux agents IA"
date: "2026-04-23"
excerpt: "Tesseron est présenté comme un SDK TypeScript open‑source et une passerelle WebSocket compatible MCP pour exposer des actions typées de votre application web aux agents IA. Ce guide francophone, orienté UK, explique l'idée, les usages pratiques et propose une feuille de route pragmatique — en distinguant ce qui est confirmé dans le dépôt et ce qui reste une hypothèse."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-23-tesseron-typescript-sdk-and-mcp-websocket-gateway-to-expose-typed-web-app-actions-to-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "tesseron"
  - "TypeScript"
  - "WebSocket"
  - "MCP"
  - "SDK"
  - "agents-IA"
  - "open-source"
  - "développement"
sources:
  - "https://github.com/BrainBlend-AI/tesseron"
---

## TL;DR en langage simple

- Tesseron expose des actions typées d'une web‑app à des agents IA compatibles MCP via WebSocket. SDK TypeScript + passerelle MCP sont décrits dans le dépôt : https://github.com/BrainBlend-AI/tesseron (Source).
- Objectif immédiat : cloner https://github.com/BrainBlend-AI/tesseron, démarrer la gateway, enregistrer 1 action typée et valider le flux agent → passerelle → handler en local.
- Résumé opérationnel : 1) cloner, 2) installer dépendances, 3) builder si besoin, 4) lancer gateway + app + client test (3 terminaux recommandés), 5) vérifier réponse et types.

Méthodologie courte : je m'appuie sur le README et l'intitulé du dépôt comme unique source (https://github.com/BrainBlend-AI/tesseron).

## Ce que vous allez construire et pourquoi c'est utile

Vous allez prototyper un démonstrateur local qui montre comment une web‑app peut exposer des actions typées à des agents MCP (via WebSocket) en vous appuyant sur le SDK TypeScript et la gateway mentionnés dans le dépôt https://github.com/BrainBlend-AI/tesseron.

Composants visibles (attendus d'après le dépôt) :
- SDK TypeScript côté application pour déclarer et typer les actions.
- Passerelle MCP‑compatible (WebSocket) qui relaie les requêtes des agents vers vos handlers.

Pourquoi c'est utile :
- Partage de contrats/types entre agent et app réduit les erreurs de format et facilite les tests de bout en bout (source : https://github.com/BrainBlend-AI/tesseron).
- Flux attendu : agent envoie requête typée → gateway la relaie → handler renvoie réponse typée.

Conseil de scope : démarrez avec une action READ‑ONLY (1 action) et testez la chaîne complète avant d'ajouter 2–3 actions supplémentaires.

## Avant de commencer (temps, cout, prerequis)

Lien principal à vérifier avant toute action : https://github.com/BrainBlend-AI/tesseron

Prérequis minimaux :
- Node.js (vérifier la version exacte dans le README du dépôt), npm/yarn/pnpm.
- Git pour cloner le dépôt.
- Connaissances de base TypeScript et WebSocket.
- Terminal et 1–3 terminaux ouverts pour exécuter gateway, app et client de test.

Estimations (à valider dans le README) :
- Temps prototype local : ~60–90 minutes.
- Travail pour mise en production initiale (CI + sécurité) : ~2–3 jours.
- Objectif de build CI : < 10 minutes (idée cible).

Tableau de décision rapide (dev vs prod)

| Choix | Dev (local) | Prod (préconisé) |
|---|---:|---:|
| Actions exposées | 1–3 (read‑only) | restreindre, approvals pour write |
| Authentification | clé simple ou none (test) | wss:// + JWT / clés scp |
| Monitoring | logs basiques | métriques (p95, erreurs), alertes  |

Checklist obligatoire avant prototype :
- [ ] Accès au dépôt https://github.com/BrainBlend-AI/tesseron
- [ ] Node.js + gestionnaire de paquets installés
- [ ] Terminal prêt (1–3 terminaux)

## Installation et implementation pas a pas

Les commandes ci‑dessous sont génériques — adaptez selon les scripts exacts trouvés dans https://github.com/BrainBlend-AI/tesseron.

1. Cloner le dépôt

```bash
git clone https://github.com/BrainBlend-AI/tesseron.git
cd tesseron
```

2. Installer les dépendances (choisissez npm / yarn / pnpm selon le repo)

```bash
npm install
# ou
# yarn install
# pnpm install
```

3. Compiler / builder le TypeScript si le repo l'exige

```bash
npm run build || npx tsc --build
```

4. Lancer la passerelle (gateway)

- Exécutez la commande de démarrage indiquée dans le README. Exemple :

```bash
npm run start:gateway
# ou exemple générique
node dist/gateway/index.js --config examples/config/gateway.yaml
```

5. Démarrer l'application qui enregistre des actions

```bash
npm run start:app
# Ou exécuter le fichier d'exemple TypeScript compilé
node dist/app/index.js
```

6. Lancer un client test (simuler un agent MCP)

- Ouvrez un 3e terminal et exécutez un script de test qui ouvre un WebSocket vers ws://localhost:PORT/mcp et appelle l'action.

Exemple minimal TypeScript d'enregistrement d'action (illustratif) :

```ts
// examples/shared/actions.ts
export interface FetchAccountInput { id: string }
export interface FetchAccountOutput { id: string; name: string; status: string }

// app.ts (pseudo‑code)
sdk.registerAction<FetchAccountInput, FetchAccountOutput>('fetchAccount', async (input) => {
  // logique applicative minimale
  return { id: input.id, name: 'Alice', status: 'active' }
})
```

Exemple de configuration YAML de la gateway (illustratif) :

```yaml
# examples/config/gateway.yaml
server:
  wsPath: /mcp
  port: 8080
protocol:
  version: 1
security:
  requireAuth: true
```

7. Vérifications post‑démarrage
- Vérifiez que la gateway écoute (port 8080 par exemple) et que la latence typique de l'action est < 500 ms en local.
- Validez que la réponse contient < 1000 tokens (si vous mesurez tokens côté agent) ; métrique illustrative.

## Problemes frequents et correctifs rapides

Toutes les recommandations ci‑dessous découlent des patterns TypeScript + WebSocket et du dépôt : https://github.com/BrainBlend-AI/tesseron

Problèmes courants et solutions rapides :
- WebSocket refuse la connexion : vérifier wsPath, port et que la gateway écoute sur le port attendu (ex. 8080). Utilisez :

```bash
lsof -iTCP -sTCP:LISTEN -P | grep LISTEN
```

- Types incompatibles entre agent et app : centraliser les interfaces dans un package partagé ou monorepo; exiger compilation croisée dans CI.
- Version MCP non alignée : comparer la version protocole dans la config de la gateway au client (v1/v2). Si mismatch, bloquez la connexion.
- Erreurs de build TypeScript : exécuter npm run build et corriger les erreurs; visez un délai de build CI < 10 minutes.

Surveillance et SLA simples (exemples chiffrés) :
- objectif p95 latency ≤ 300 ms en production initiale;
- alertes si taux d'erreur > 2% sur 5 minutes;
- garder logs tronqués à 5 KB par requête pour limiter fuite de données.

## Premier cas d'usage pour une petite equipe

Cible : fondateurs solo / équipes de 1–3 personnes qui veulent itérer vite et limiter la surface d'attaque (source : https://github.com/BrainBlend-AI/tesseron).

Actions concrètes et prioritaires (au moins 3, actionnable immédiatement) :

1) Restreindre l'exposition (1–3 actions)
- Exposez seulement 1 à 3 actions en lecture au démarrage (ex. fetchAccount). Cela réduit risques et charges de revue.

2) Processus de développement léger
- Merges sur main uniquement si compilation TypeScript OK et 1–2 tests unitaires passent. Automatiser build dans CI (objectif : < 10 min).

3) Tests end‑to‑end locaux en 3 terminaux
- Terminal A : gateway (port 8080), Terminal B : app qui enregistre l'action, Terminal C : client agent simulé. Valider un cycle complet en < 5 minutes.

4) Contrôles d'accès minimaux
- Commencez par une clé simple ou JWT scoped ; n'autorisez pas d'actions d'écriture sans approval humaine. Déployez write actions via feature flag et un rollout canary de 10%.

5) Monitoring minimal
- Comptez invocations (count), mesurez duration_ms par action (ex. 120 ms pour fetchAccount en test), loggez status et taille en tokens (ex. 350 tokens) pour diagnostiquer rapidement.

Ressource centrale : repository et exemples sur https://github.com/BrainBlend-AI/tesseron

## Notes techniques (optionnel)

- Partage de types : favorisez un package interne ou un workspace monorepo pour garantir compatibilité compile‑time entre agent et app (voir le dépôt https://github.com/BrainBlend-AI/tesseron pour le SDK TS mentionné).
- Instrumentation minimale : collectez count, duration_ms, p95 et erreurs. Exemple JSON de métrique :

```json
{
  "action": "fetchAccount",
  "duration_ms": 120,
  "status": "ok",
  "size_tokens": 350
}
```

- Sécurité production : migrer en wss://, authentifier agents et scoper les clés. Pour tout paramètre précis, vérifier la doc et les fichiers du dépôt : https://github.com/BrainBlend-AI/tesseron

## Que faire ensuite (checklist production)

- [ ] Vérifier le README et les exemples du dépôt (https://github.com/BrainBlend-AI/tesseron).
- [ ] Monter le prototype local et valider 1 action end‑to‑end en moins de 90 minutes.
- [ ] Ajouter CI : compilation TypeScript + 1–3 tests unitaires, objectif build < 10 min.
- [ ] Instrumentation : count, duration_ms (ms), p95, erreurs; stocker logs tronqués (< 5 KB par requête).
- [ ] Mettre en place authentification (JWT/clés) et scoping minimaliste.
- [ ] Déployer en canary (10%) pendant 24 h, monitorer erreurs et latence.
- [ ] Documenter rollback et plan de sécurité.

### Hypotheses / inconnues

Les éléments suivants doivent être confirmés dans le README et le code du dépôt https://github.com/BrainBlend-AI/tesseron :
- Versions Node.js / TypeScript recommandées et scripts exacts (npm run start:gateway, etc.).
- Schéma détaillé du protocole MCP et versions prises en charge (v1/v2).
- Présence d'exemples prêts à l'emploi et chemins exacts des scripts (dist/, examples/...).
- Coût serveur estimé (ex. $5–$20/mo pour petite instance) est une estimation à valider.

### Risques / mitigations

- Risque : exposition d'actions d'écriture sans contrôles => Mitigation : garder read‑only initial, approvals humaines, feature flags, canary 10%.
- Risque : dérive de types entre agent et service => Mitigation : package partagé + CI qui compile les deux côtés; bloquer merge si compilation échoue.
- Risque : fuite d'informations via logs => Mitigation : tronquer/anonymiser, limiter logs à 5 KB par requête, chiffrer stockage.
- Risque : latence élevée en prod => Mitigation : objectifs p95 ≤ 300 ms, alertes si erreurs > 2% sur 5 min.

### Prochaines etapes

1) Confirmer les scripts et versions dans https://github.com/BrainBlend-AI/tesseron.
2) Cloner et lancer prototype local (3 terminaux recommandés) et valider un jour de tests (cible : 60–90 min pour un run complet).
3) Ajouter CI (build < 10 min) et tests de compilation croisée des types.
4) Mettre en place authentification, déployer canary 10% pendant 24 h, puis élargir si stable.

Si vous voulez, je peux cloner le dépôt et adapter les commandes/snippets exactement aux scripts trouvés dans le repo.
