---
title: "Entreprise pilotée par KPI : CEO IA, managers agents et l'incident k3s sur Mac mini"
date: "2026-09-09"
excerpt: "Un fondateur a prototypé une entreprise où l’on donne un KPI à un ensemble d’agents IA (un CEO agent + managers). Exemple : « +10 % de trafic hebdo » pour twitee.co. Le prototype tournait sur k3s sur un Mac mini ; un pic de trafic l’a fait tomber et un agent a ensuite demandé un budget pour monter en charge. (Source : Hacker News)"
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-09-kpi-driven-agent-company-running-an-ai-ceo-and-managers-for-twiteeco-and-a-k3s-mac-mini-incident.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "ia"
  - "agents"
  - "kpi"
  - "prototype"
  - "devops"
  - "kubernetes"
  - "startup"
  - "automatisation"
sources:
  - "https://news.ycombinator.com/item?id=49608984"
---

## TL;DR en langage simple

- Idée clé : donner un seul KPI mesurable à une hiérarchie d'agents pilotés par un LLM (un « CEO » agent, des « managers », des spécialistes). Exemple cité : « augmenter le trafic de 10% chaque semaine ». (Source : https://news.ycombinator.com/item?id=49608984)
- Fonctionnement observé : le CEO agent publie un rapport quotidien ; les managers décomposent en tâches ; les spécialistes (agents ou humains) exécutent ou demandent approbation pour dépenses. (Source : https://news.ycombinator.com/item?id=49608984)
- Incident concret : prototype sur Mac mini avec k3s est tombé lors d'un pic de trafic ; l'agent a demandé un budget au lieu d'autoscaler. (Source : https://news.ycombinator.com/item?id=49608984)
- Règles pratiques initiales recommandées issues du fil : porte d'approbation humaine pour toute dépense > $100/jour, conserver 90 jours de logs, fenêtres d'évaluation de 7 jours, tokens max ≈ 1,024. (Source : https://news.ycombinator.com/item?id=49608984)

Méthode : résumé des points et recommandations principaux tirés du fil Hacker News ci‑dessus. (Source : https://news.ycombinator.com/item?id=49608984)

## Ce que vous allez construire et pourquoi c'est utile

Vous allez prototyper une boucle opérationnelle pilotée par KPIs où :
- Un KPI unique (par ex. daily_users) guide le CEO agent.
- Le CEO propose une stratégie quotidienne et publie un rapport avec preuves.
- Les managers créent tickets/tests et demandent approbation pour actions coûteuses.
- Les spécialistes exécutent en staging ; toute modification production coûteuse demande approbation humaine.

Pourquoi utile :
- Concentration sur un objectif (ex. +10% hebdo) évite dispersion. (Source : https://news.ycombinator.com/item?id=49608984)
- Historique clair : rapports quotidiens avec preuve réduisent actions « silencieuses ». (Source : https://news.ycombinator.com/item?id=49608984)
- En cas d'incident, on suit la recommandation avant/après l'événement. (Source : https://news.ycombinator.com/item?id=49608984)

## Avant de commencer (temps, cout, prerequis)

Prérequis minimaux pour un prototype rapide (tous mentionnés ou illustrés dans la discussion) :
- Un dépôt (repo) pour stocker le KPI et prompts (fichier lisible par machine). (Source : https://news.ycombinator.com/item?id=49608984)
- Un endpoint métrique unique (JSON/CSV) servant de source de vérité. (Source : https://news.ycombinator.com/item?id=49608984)
- Porte d'approbation humaine (webhook, flag, commit) pour dépenses > $100/jour ou ajout de capacité. (Source : https://news.ycombinator.com/item?id=49608984)
- Intégration avec un LLM et un orchestrateur d'agents (prototype mentionné sur GitHub). (Source : https://news.ycombinator.com/item?id=49608984)

Temps & coûts estimés (ordres de grandeur cités dans le fil) :
- Prototype minimal : 4 heures–3 jours si maîtrise des outils. (Source : https://news.ycombinator.com/item?id=49608984)
- Période de surveillance initiale : 24h–72h d'observation active. (Source : https://news.ycombinator.com/item?id=49608984)
- Rétention des logs recommandée : 90 jours. (Source : https://news.ycombinator.com/item?id=49608984)

## Installation et implementation pas a pas

Étapes essentielles et testables (liées au prototype cité) :

1. Committez un fichier KPI lisible par machine ; ex. cible +10%/7j. (Source : https://news.ycombinator.com/item?id=49608984)
2. Définissez 3 rôles : CEO (agent), Managers (agents), Spécialistes (agents/humains). (Source : https://news.ycombinator.com/item?id=49608984)
3. Branchez un endpoint métrique unique et exigez que chaque rapport cite la requête exacte utilisée. (Source : https://news.ycombinator.com/item?id=49608984)
4. Ajoutez porte d'approbation humaine pour dépenses/scaling en production (cap $100/jour recommandé). (Source : https://news.ycombinator.com/item?id=49608984)
5. Déployez en environnement contrôlé ; observez logs et rapports quotidiens.

Commandes d'exemple (référence au prototype GitHub cité) :

```bash
# Clonez le prototype et démarrez localement (exemple cité dans la discussion)
git clone https://github.com/nohuman-labs/agent-company
cd agent-company
./start-local-orchestrator.sh --env=dev --max-tokens=1024
```

Exemple de fichier KPI (commit JSON) :

```json
{
  "name": "Increase traffic",
  "metric": "daily_users",
  "baseline": 1200,
  "target": "+10% per 7d",
  "evaluation_window_days": 7,
  "evidence_url": "https://example.com/metrics?series=daily_users&window=7"
}
```

Plan de rollout/rollback recommandé (valeurs-tests) : canary = 1 instance ou 5% du trafic pendant 24h ; gates = 2 revues humaines + 3 checks automatiques ; rollback si erreurs +20% ou latence > 30%. (Source : https://news.ycombinator.com/item?id=49608984)

Paramètres opérationnels suggérés à valider en test : cooldown scale 60s–300s ; seuils basés sur 3 intervalles consécutifs ; cap d'approbation initial = $100/jour ; tokens max = 1,024. (Source : https://news.ycombinator.com/item?id=49608984)

## Problemes frequents et correctifs rapides

Incident illustratif : pic de trafic nocturne a fait tomber un Mac mini ; l'agent a demandé budget après coup au lieu d'autoscaler. (Source : https://news.ycombinator.com/item?id=49608984)

Correctifs rapides :
- Bloquer provisioning automatisé sans approbation humaine (cap = $100/jour par défaut). (Source : https://news.ycombinator.com/item?id=49608984)
- Exiger preuve : chaque proposition doit inclure l'URL/API et la requête exacte. (Source : https://news.ycombinator.com/item?id=49608984)
- Limiter appels LLM : quota tokens 1,024 par génération, cache des plans et batch max 5 requêtes. (Source : https://news.ycombinator.com/item?id=49608984)
- Éviter actions nocturnes non surveillées : restreindre autoscale hors plages surveillées (ex. 08:00–20:00). (Source : https://news.ycombinator.com/item?id=49608984)
- Journal immuable append‑only, conserver 90 jours de traces. (Source : https://news.ycombinator.com/item?id=49608984)

Seuils opérationnels d'alerte suggérés : latence > 200 ms ; erreurs augmentées de +20% sur la fenêtre canary. (Source : https://news.ycombinator.com/item?id=49608984)

## Premier cas d'usage pour une petite equipe

Workflow conservateur pour fondateur solo / petite équipe (dérivé du fil) :
- Publiez un seul fichier KPI dans le repo. (Source : https://news.ycombinator.com/item?id=49608984)
- Interdisez toute action d'augmentation de capacité sans demande d'approbation formelle (commit/webhook). (Source : https://news.ycombinator.com/item?id=49608984)
- Faites tourner le système pendant heures surveillées (éviter la nuit au départ ; 24h–72h de surveillance initiale). (Source : https://news.ycombinator.com/item?id=49608984)
- Conservez un journal immuable des plans et approbations (90 jours recommandé). (Source : https://news.ycombinator.com/item?id=49608984)

Exemple concret du fil : prototype sur Mac mini + k3s (Kubernetes léger) avec KPI « +10% hebdo » ; l'agent a demandé un budget après le pic. (Source : https://news.ycombinator.com/item?id=49608984)

## Notes techniques (optionnel)

Tableau décisionnel simple (rôles, pouvoirs, limites) :

| Rôle     | Pouvoirs (exemples)                          | Limitations / seuils clés              |
|----------|-----------------------------------------------|----------------------------------------|
| CEO      | Decomposer KPI, produire rapport quotidien    | Doit demander approbation si coût > $100/jour ; tokens ≤ 1,024 |
| Manager  | Prioriser expériences, créer tickets staging  | Pas de déploiement prod sans 2 revues humaines ; batch ≤ 5 requêtes |
| DevOps   | Tests, monitoring, exécution en staging       | Ajout nœuds prod nécessite approbation ; cooldown 60s–300s |

Bonnes pratiques techniques résumées (sources citées) : limiter appels LLM, activer cache, quotas tokens 1,024, batchification max 5, journal append‑only avec rétention 90 jours. (Source : https://news.ycombinator.com/item?id=49608984)

Exemple de configuration de quota LLM (snippet) :

```yaml
llm_quota:
  max_tokens_per_call: 1024
  max_calls_per_minute: 10
  batch_size_max: 5
```

Autre paramètre recommandé à tester : canary size = 1 instance ou 5% du trafic, canary duration = 24h, rollback trigger = erreurs +20% ou latence > 30%. (Source : https://news.ycombinator.com/item?id=49608984)

## Que faire ensuite (checklist production)

(Source : https://news.ycombinator.com/item?id=49608984)

### Hypotheses / inconnues

- Hypothèse centrale : confier uniquement des KPIs réduit le micro‑management et permet aux agents de piloter les opérations quotidiennes. (Source : https://news.ycombinator.com/item?id=49608984)
- Observé : des agents peuvent détecter un pic (ex. +200% trafic) et demander budget au lieu d'agir automatiquement. (Source : https://news.ycombinator.com/item?id=49608984)
- Chiffres à valider en tests : fenêtre KPI = 7 jours ; baseline exemple = 1,200 utilisateurs/jour ; objectif = +10%/7d ; prototype temps = 4h–3d ; rétention logs = 90 jours ; cap d'approbation initial = $100/jour ; critères de gate = 3 intervalles consécutifs ; cooldown scale = 60s–300s ; tokens max = 1,024.

### Risques / mitigations

- Risque : autoscaling nocturne qui surcharge une machine unique.
  - Mitigation : désactiver autoscale hors plages surveillées (par ex. 08:00–20:00) ; exiger approbation pour scale > cap ($100/jour). (Source : https://news.ycombinator.com/item?id=49608984)
- Risque : actions coûteuses déclenchées sans preuve.
  - Mitigation : exiger evidence_url/API + requête exacte + score de confiance + approbation humaine. (Source : https://news.ycombinator.com/item?id=49608984)
- Risque : oscillations de scaling.
  - Mitigation : n = 3 intervalles consécutifs avant action ; fenêtre de cooldown 60s–300s. (Source : https://news.ycombinator.com/item?id=49608984)
- Risque : coûts LLM non maîtrisés.
  - Mitigation : quotas, cache, batchification (batch max 5), tokens max 1,024. (Source : https://news.ycombinator.com/item?id=49608984)

### Prochaines etapes

- [ ] Lancer un dry‑run : publier un KPI dans le repo, pointer les agents vers une source métrique unique, valider qu'un rapport quotidien avec preuve est produit. (Source : https://news.ycombinator.com/item?id=49608984)
- [ ] Implémenter la porte d'approbation (webhook/commit) et vérifier qu'aucune action facturable n'est effectuée sans approbation (cap $100/jour). (Source : https://news.ycombinator.com/item?id=49608984)
- [ ] Déployer un canary (1 instance / 5% du trafic) pour tout changement infra/feature ; définir gates + rollback automatique (24h). (Source : https://news.ycombinator.com/item?id=49608984)
- [ ] Tenir un post‑mortem après le dry‑run et ajuster prompts, table décisionnelle et seuils d'approbation.

Pour la discussion complète et le prototype cité : https://news.ycombinator.com/item?id=49608984
