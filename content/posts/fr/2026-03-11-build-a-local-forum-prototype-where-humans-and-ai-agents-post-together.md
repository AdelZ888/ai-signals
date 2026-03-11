---
title: "Construire un prototype de forum local où humains et agents IA publient ensemble"
date: "2026-03-11"
excerpt: "Créez un forum local où des utilisateurs humains et des agents IA « seedés » publient ensemble. Reprenez les catégories visibles sur deadinternet.forum, exposez une API POST simple et prévoyez un interrupteur d’arrêt (kill-switch)."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-11-build-a-local-forum-prototype-where-humans-and-ai-agents-post-together.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "forum"
  - "agents"
  - "IA"
  - "prototype"
  - "sécurité"
  - "développement"
sources:
  - "https://www.deadinternet.forum/"
---

## TL;DR en langage simple

- Objectif : déployer localement un prototype de forum mixte (humains + agents IA) pour tester comportement et modération sans exposition publique. Référence et structure : https://www.deadinternet.forum/.
- Pourquoi : observer des agents en bac à sable, itérer rapidement sur prompts et règles, et garder un « kill‑switch » central pour couper toute activité en moins de 5 minutes si nécessaire.
- Résultat attendu : instance locale reproduisant la structure publique (ex. 128 threads et 594 posts visibles dans le snapshot) pour produire métriques comparables.

Exemple rapide : lancer 3 agents dans 10 threads « Tech & Code » pendant 24 h avec quota par agent = 10 posts/heure, monitorer alertes soft à 100 posts/heure et emergency à 200 posts/heure.

Méthodologie : j'ai utilisé le snapshot public référencé (https://www.deadinternet.forum/) comme guide de structure et ton.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez construire un petit forum local (SQLite ou Postgres) où humains et agents publient et interagissent selon des règles contrôlées. Le snapshot de référence (https://www.deadinternet.forum/) montre la hiérarchie utile : catégories → threads → posts (ex. "General Discussion", "Tech & Code", "Shitpost Central").

Bénéfices pragmatiques :
- Limiter la portée des erreurs en testant en local (canary sur 5–10% des threads).
- Boucle d'itération courte : modifier prompts, déployer en < 10 minutes via git tags et feature flags.
- Mesurer indicateurs comparables (nombre de threads = 128, posts totaux = 594 dans le snapshot) pour calibrer activité.

Référence et ton : https://www.deadinternet.forum/.

## Avant de commencer (temps, cout, prerequis)

Estimation temps/cout :
- Prototype local : 3–6 heures.
- Durcissement basique : 1–2 jours.
- Coût d'hébergement initial : £0–£30 / mois (petit VPS) — à valider.

Prérequis minimaux (checklist) :
- [ ] Repo git initialisé (versionnement de prompts et configs).
- [ ] Accès admin sur la machine (VPS ou local).
- [ ] Compte LLM ou binaire modèle local, clé/secret stocké chiffré.
- [ ] Runbook minimal : kill‑switch documenté et reachable.

Contraintes recommandées : utiliser SQLite en dev (temps de setup < 30 min) et Postgres en production ; prévoir logs conservés 14 jours pour posts et sorties d'agent.

Référence : structure publique et catégories visibles sur https://www.deadinternet.forum/.

## Installation et implementation pas a pas

1) Initialiser le projet

Commandes d'exemple (Node.js) :

```bash
git clone https://example/repo.git
cd repo
npm install
cp .env.example .env.dev
ENV_FILE=.env.dev npm run start
```

2) Schéma minimal (SQLite) — createur rapide :

```sql
-- schema_minimal.sql
CREATE TABLE users(id TEXT PRIMARY KEY, display_name TEXT, is_agent BOOLEAN);
CREATE TABLE categories(id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE threads(id INTEGER PRIMARY KEY, category_id INTEGER, title TEXT, created_at INTEGER);
CREATE TABLE posts(id INTEGER PRIMARY KEY, thread_id INTEGER, user_id TEXT, content TEXT, created_at INTEGER);
```

3) Poller d'agents (logique essentielle)

- Endpoint principal : POST /api/posts (payload : { "agent_id"?, "user_id"?, "thread_id", "content" }).
- Poller : choisir threads ouverts, respecter allowed_categories, vérifier quotas avant post.

Exemple minimal de poller (TypeScript pseudo) :

```ts
// poller.ts (simplifié)
setInterval(async () => {
  const threads = await fetchOpenThreads();
  for (const agent of agents) {
    if (!agent.enabled) continue;
    if (agent.posts_last_hour >= 10) continue; // quota par_agent_max = 10
    const thread = chooseThread(threads, agent.allowed_categories);
    if (thread && shouldPost(agent, thread)) {
      await postAsAgent(agent, thread.id, agent.composeReply(thread));
    }
  }
}, 5000); // poll_interval = 5s
```

4) Rollout / rollback

- Canary : démarrer sur 5–10% des threads (ou 5–10 threads) pendant 24–72 h.
- Rollback plan : feature flag AGENTS_ENABLED = false, restore snapshot, et délai cible de désactivation complète < 5 minutes.

Tableau décisionnel :

| Phase | Portée initiale | Condition d'extension | Action de rollback |
|---|---:|---|---|
| Canary | 5–10% des threads (5–10 threads) | métriques stables 24–72 h | pause agents + restore snapshot |
| Étendue | 50–100% des threads | après 24–72 h de stabilité | désactivation progressive par feature flag |

Référence : organisation par catégories et threads sur https://www.deadinternet.forum/.

## Problemes frequents et correctifs rapides

1) Inondation par les agents
- Symptôme : > 200 posts/heure global ou > 10 posts/heure par agent.
- Correctif : activer kill‑switch, réduire poll_interval à 10s+, isoler agent fautif, restaurer snapshot.

2) Hallucinations / hors‑sujet
- Symptôme : réponses incohérentes ou hors‑ton.
- Correctif : resserrer system_prompt, réduire temperature de 0.6→0.2, max_tokens = 256–512, ajouter vérifications post‑génération.

3) Fuite de clés ou trafic anormal
- Symptôme : pics de consommation > 80% du budget quotidien.
- Correctif : rotation de clés, allowlist IP, limiter quotas tokens (alerte à 80% du budget), désactiver accès non‑essentiel.

Config d'urgence (exemple YAML) :

```yaml
feature_flags:
  AGENTS_ENABLED: false
rate_limits:
  per_agent_per_hour: 10
  global_soft_throttle_per_hour: 100
  emergency_pause_threshold_per_hour: 200
```

Référence : catégories et ton référencés via https://www.deadinternet.forum/.

## Premier cas d'usage pour une petite equipe

Cible : fondateur solo ou équipe de 1–3 personnes. Priorités : sécurité, itération rapide, surface réduite.

Actions concrètes et actionnables (3+ points) :

1) Rôle unique de contrôle (opérateur/modérateur)
   - Désignez 1 personne responsable du flag AGENTS_ENABLED et des décisions d'arrêt.
   - Cette personne vérifie les logs et les alertes 2×/jour pendant la fenêtre initiale de 72 h.

2) Réduction de surface et quotas stricts
   - Limitez les agents à 1–2 catégories (ex. "Tech & Code" + 1 autre) et excluez les sections 18+.
   - Définissez quotas : per_agent_max = 10 posts/heure, global_soft_throttle = 100 posts/heure, emergency_pause = 200 posts/heure.

3) Seed contrôlé et versionnement
   - Créez 10–20 threads seed pour cadrer le ton ; utilisez-les comme canary pendant 24 h.
   - Versionnez chaque prompt et config (git tag). En cas de régression, rollback via git + feature flag en < 10 minutes.

4) Observabilité minimale
   - Exposez /health (status agents) et métriques basiques : posts/heure, % signalés, tokens consommés, latence moyenne.
   - Alertes : soft à 100 posts/heure, hard à 200 posts/heure ; notification SMS/email pour l'opérateur.

Pourquoi cela marche pour 1–3 personnes : faible surface décisionnelle, boucle d'itération courte (< 1 heure pour changelog → déploiement), et kill‑switch managé par une seule personne.

Référence structurelle : https://www.deadinternet.forum/.

## Notes techniques (optionnel)

- Endpoints recommandés : /health (200 + état agents), /api/posts, /admin/flags.
- Logs : conservez 14 jours d'index pour posts et réponses d'agent pour faciliter forensic.

Exemple de persona (JSON) :

```json
{
  "agent_id": "bot-1",
  "display_name": "I'M AI - SKILL.MD",
  "system_prompt": "Comporte-toi comme un participant de forum : concis, parfois enjoué, évite le contenu sexuel hors 18+.",
  "allowed_categories": ["Tech & Code", "Shitpost Central"]
}
```

Référence pour les labels et le ton : https://www.deadinternet.forum/.

## Que faire ensuite (checklist production)

- [ ] Durcir l'authentification : remplacer clés dev par OAuth / gestionnaire de secrets.
- [ ] Instrumenter un dashboard (posts/heure, % signalés, nombre de posters uniques, tokens consommés, latence moyenne < 500 ms pour endpoints dépendant LLM).
- [ ] Prévoir des tests canary en production contrôlée (canary initial = 24 h sur 5–10% des threads).
- [ ] Rédiger et valider un runbook d'incident (kill‑switch, rollback, communications internes).

### Hypotheses / inconnues

- Activité publique observée : 128 threads et 594 posts (source : https://www.deadinternet.forum/).
- Paramètres recommandés à valider : 3 agents seed, 10–20 threads initiaux, période d'observation = 72 heures, budget token MVP = 50k–200k tokens totaux.
- LLM : max_tokens par réponse = 256–512, température test = 0.2 pour précision puis 0.6 pour exploration.
- Polling/cadence suggérés : poll_interval = 5–10 s, délai_min entre posts d'un même agent = 1200 ms.
- Seuils d'alerte proposés : soft = 100 posts/heure, emergency = 200 posts/heure, per_agent_max = 10 posts/heure.

### Risques / mitigations

- Risque : toxicité ou contenu adulte non contrôlé. Mitigation : catégorisation 18+ et opt‑in, modérateur humain, kill‑switch AGENTS_ENABLED.
- Risque : fuite de clés API. Mitigation : rotation de clés, allowlist IP, stockage chiffré et alertes à 80% du budget.
- Risque : dépassement budgétaire LLM. Mitigation : quotas de tokens, alertes journalières, seuil d'arrêt automatique.

### Prochaines etapes

1) Valider hypothèses en canary pendant 72 heures (3 agents, 10–20 threads).
2) Instrumenter métriques critiques et configurer alertes soft/hard.
3) Tester runbook : effectuer un arrêt complet via feature flag et restaurer un snapshot en < 5 minutes.

Référence finale : organisation et ton de la communauté miroir public — https://www.deadinternet.forum/.
