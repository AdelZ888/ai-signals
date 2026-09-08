---
title: "Fraise : mémoire persistante mono-binaire pour agents — remember/recall et récupération hybride (graphe+vecteurs)"
date: "2026-09-08"
excerpt: "Fraise est un service mémoire mono-binaire pour agents IA qui stocke de courts faits temporels dans un graphe bipartite et renvoie des résultats recall limités et classés (remember/recall) pour réduire les tokens lus."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-08-fraise-single-binary-persistent-memory-for-agents-using-rememberrecall-and-hybrid-graphvector-retrieval.jpg"
region: "FR"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "Fraise"
  - "mémoire"
  - "agents"
  - "retrieval"
  - "vector"
  - "graphe"
  - "API"
  - "opensource"
sources:
  - "https://docs.getfraise.dev"
---

## TL;DR en langage simple

- Fraise est une couche mémoire pour agents. Elle propose deux commandes simples : remember pour écrire et recall pour lire. (https://docs.getfraise.dev)
- Les réponses sont limitées et classées. Cela réduit le nombre de tokens renvoyés à l'agent et donc le coût. (https://docs.getfraise.dev)
- La récupération est hybride : texte intégral, graphe et vecteurs. Les souvenirs récents sont favorisés. (https://docs.getfraise.dev)
- Action rapide : installer (binaire ou Docker), démarrer le serveur, vérifier /health, faire un remember puis un recall. (https://docs.getfraise.dev)

Scénario concret rapide : vous êtes une petite équipe de support. Quand un ticket change de statut, vous envoyez un remember "ticket #123 escalated to L2 by alice". Plus tard, l'agent fait recall escalations entity:acme top:5 since:90d pour retrouver les escalades récentes. (https://docs.getfraise.dev)

Explication simple avant les détails techniques : Fraise garde de courts "souvenirs" structurés. Quand un agent demande de la mémoire, Fraise renvoie un petit sous-ensemble trié par pertinence et par temporalité. C'est conçu pour alimenter des assistants automatisés sans leur donner tout l'historique à chaque prompt. (https://docs.getfraise.dev)

## Ce que vous allez construire et pourquoi c'est utile

Vous allez déployer une mémoire persistante pour agents. Elle stocke de brefs faits avec un horodatage et renvoie un petit nombre d'éléments pertinents quand l'agent interroge la mémoire. (https://docs.getfraise.dev)

Pourquoi c'est utile :
- Réduit l'historique injecté dans chaque prompt. (https://docs.getfraise.dev)
- Contrôle le coût en tokens en limitant le nombre d'items renvoyés (top:N) et la fenêtre temporelle (since). (https://docs.getfraise.dev)

Propriétés clés (extraites de la doc) :
- Langage minimal : remember et recall. (https://docs.getfraise.dev)
- Récupération hybride : texte intégral + graphe + vecteurs, avec classement et résultats plafonnés. (https://docs.getfraise.dev)
- API HTTP exposée : /query, /explain, /stats, /health. (https://docs.getfraise.dev)

Exemples rapides (concrets) :
- Déclencheur : changement de facturation
  - Exemple de remember : "acme moved to annual billing on 2026-08-01"
  - Exemple de recall : recall billing entity:acme top:3 since:30d
- Déclencheur : escalation d'un ticket
  - Exemple de remember : "ticket #123 escalated to L2 by alice"
  - Exemple de recall : recall escalations entity:acme top:5 since:90d

Référence principale : https://docs.getfraise.dev

## Avant de commencer (temps, cout, prerequis)

- Durée estimée pour un prototype local : 30–120 minutes. (https://docs.getfraise.dev)
- Coût initial minimal : $0 (Docker local) à quelques $/mois pour une VM basique. (https://docs.getfraise.dev)
- Ressources recommandées pour un pilote : ~1 vCPU et ~2 GB de RAM (hypothèse à valider en test de charge). (https://docs.getfraise.dev)
- Prérequis : machine macOS ou Linux, ou hôte Docker. Accès réseau pour l'API HTTP et permissions d'écriture sur le stockage choisi. (https://docs.getfraise.dev)
- Critères d'acceptation d'une démo locale : /health OK, roundtrip remember → recall, accès à /explain pour diagnostiquer. (https://docs.getfraise.dev)

Notes rapides sur les métriques : p50 = médiane, p95 = 95e percentile, p99 = 99e percentile. Utilisez /stats pour lire ces valeurs. (https://docs.getfraise.dev)

## Installation et implementation pas a pas

1) Choix d'installation : Homebrew, Docker, paquets Linux, binaires de release ou compilation depuis la source. (https://docs.getfraise.dev)

```bash
# Homebrew (macOS)
brew install fraise

# Docker (exemple générique)
docker run --rm -p 8080:8080 ghcr.io/getfraise/fraise:latest
```

2) Démarrer le serveur et vérifier /health

```bash
# Exemple local (démarrer en arrière-plan)
fraise serve --config ./config/config.yaml &
# Vérifier l'endpoint santé
curl -sS http://localhost:8080/health | jq .
```

- Interprétez /health : si l'endpoint retourne OK, le service répond. Sinon regardez les logs. (https://docs.getfraise.dev)

3) Exemple minimal de configuration (fichier YAML). La doc couvre les modes serveur, stockage et scheduler en détail. (https://docs.getfraise.dev)

```yaml
server:
  http_addr: 0.0.0.0:8080
storage:
  path: /var/lib/fraise/data
scheduler:
  enabled: true
```

4) Configuration de l'agent : pointez la mémoire HTTP de votre agent vers /query. Exemple de timeout en millisecondes. (https://docs.getfraise.dev)

```json
{
  "memory": {
    "type": "http",
    "url": "http://localhost:8080/query",
    "timeout_ms": 3000
  }
}
```

5) Ingestion et requêtes minimales

```bash
# remember (POST JSON)
curl -X POST http://localhost:8080/query -d '{"q":"remember \"acme moved to annual billing on 2026-08-01\" topic:billing entity:acme"}'

# recall
curl -X POST http://localhost:8080/query -d '{"q":"recall billing entity:acme since:30d top:5"}' | jq .
```

- /explain fournit des détails sur pourquoi un document a été classé à sa position. /stats donne latences et charges. (https://docs.getfraise.dev)

6) Mesures et diagnostics : surveillez p50/p95/p99 via /stats. Utilisez /explain pour comprendre les scores et ajuster les filtres. (https://docs.getfraise.dev)

7) Déploiement progressif (canary) : routez 5% → 25% → 100% du trafic en surveillant pertinence et latence. (https://docs.getfraise.dev)

## Problemes frequents et correctifs rapides

- Le serveur ne démarre pas / port occupé : vérifier processus existant, changer server.http_addr, vérifier droits sur storage.path. (https://docs.getfraise.dev)
- Recalls non pertinents : appeler /explain pour voir le scoring. Augmenter top (par ex. 3 → 10) ou élargir since (30d → 90d). (https://docs.getfraise.dev)
- Latence élevée : inspecter /stats (p50/p95/p99). Si p95 > 500 ms, vérifier CPU/mémoire et envisager scale-up ou ajuster la configuration des embeddings. (https://docs.getfraise.dev)
- Persistance perdue : vérifier que storage.path est sur un disque persistant et que les permissions sont correctes. (https://docs.getfraise.dev)
- Coûts en tokens élevés : réduire top, raccourcir since, ou pré-filtrer par topic avant d'envoyer la requête au modèle.

Tableau dépannage rapide :

| Symptôme | Vérification (30 s) | Prochaine étape (5–30 min) |
|---|---:|---|
| Pas de /health | Le processus tourne ? | Consulter logs et config des ports |
| Recalls hors sujet | Appeler /explain | Ajuster top/since/topic |
| Latence élevée | Regarder /stats p95 | Scale CPU ou tuner scheduler |

Référence : https://docs.getfraise.dev

## Premier cas d'usage pour une petite equipe

Public cible : solo founder ou équipe de 1–3 personnes qui veut un prototype rapide pour support client ou suivi d'événements. (https://docs.getfraise.dev)

Actions concrètes recommandées (au moins 3) :
1) Déployer en Docker en 30–60 minutes. Démarrez avec 1 conteneur sur une machine avec ~1 vCPU et ~2 GB RAM. (https://docs.getfraise.dev)
2) Seed contrôlé : injectez 10–30 événements par client. Limitez chaque item à < 512 tokens pour garder les prompts compacts. (https://docs.getfraise.dev)
3) Paramètres conservateurs : commencez avec recall top:3 et since:30d. Mesurez la pertinence manuelle sur 50–100 requêtes. (https://docs.getfraise.dev)
4) Automatiser les vérifications : script d'ingestion + test quotidien qui exécute 50 writes et 500 reads simulés. Exposez /stats pour p50/p95/p99. (https://docs.getfraise.dev)
5) Plan canary : 5% → 25% → 100% sur 1–2 semaines. Cible de pertinence manuelle > 80%. (https://docs.getfraise.dev)

Checklist opérationnelle pour petite équipe :
- [ ] Conteneur Docker ou binaire en route (https://docs.getfraise.dev)
- [ ] Données initiales injectées (10–30 items par entité)
- [ ] Paramètres testés : recall top:3, since:30d
- [ ] Procédure de vérification manuelle documentée

## Notes techniques (optionnel)

- Concepts clefs décrits dans la doc : remember/recall, retrieval hybride (texte intégral, graph, vecteurs), ranking et temporality. (https://docs.getfraise.dev)
- Endpoints importants : /query, /explain, /stats, /health. /explain montre les facteurs de score ; /stats donne p50/p95/p99. (https://docs.getfraise.dev)
- Architecture : multi-graph et scheduler. Surveillez la concurrence et adaptez la config selon la charge. (https://docs.getfraise.dev)
- Embeddings : la doc couvre dimensions et précision. Ces choix affectent la latence et l'empreinte mémoire. (https://docs.getfraise.dev)

## Que faire ensuite (checklist production)

### Hypotheses / inconnues
- Hypothèse : une instance unique peut servir un prototype avec quelques centaines d'écritures/jour et quelques milliers de lectures/jour sans sharding — à valider par un test de charge. (https://docs.getfraise.dev)
- Hypothèse matérielle initiale : 1 vCPU, 2 GB RAM pour pilote ; ajuster si p95 dépasse 500 ms. (https://docs.getfraise.dev)
- Hypothèse d'usage : garder chaque mémoire courte (< 512 tokens) et seed initial de 10–30 événements par entité pour les tests. (https://docs.getfraise.dev)
- Hypothèse coûts : viser coût en tokens par session bas (varie selon le modèle de langage utilisé). (https://docs.getfraise.dev)

### Risques / mitigations
- Risque : pertinence insuffisante. Mitigation : utiliser /explain, augmenter top (3→10) ou élargir since (30d→90d). (https://docs.getfraise.dev)
- Risque : perte de données après redémarrage. Mitigation : stocker données sur disque persistant, automatiser backups et tester restaurations. (https://docs.getfraise.dev)
- Risque : pics CPU/mémoire. Mitigation : monitorer /stats et définir règles d'autoscaling (ex. CPU > 70% pendant 5 min déclenche scale-up). (https://docs.getfraise.dev)

### Prochaines etapes
- Activer authentification et configurer stockage persistant. (https://docs.getfraise.dev)
- Mettre en place dashboards pour p50/p95/p99, taux d'erreur, taille d'index et coût en tokens par session. (https://docs.getfraise.dev)
- Lancer un test canary (5% → 25% → 100%) sur 1–2 semaines, mesurer pertinence manuelle (> 80% cible) et coûts. (https://docs.getfraise.dev)
- Documenter le runbook opérationnel et automatiser start/stop/backup.

Checklist production rapide :
- [ ] TLS + authentification activés
- [ ] Backups planifiés et testés
- [ ] Dashboards pour latences et pertinence en place
- [ ] Feature flag pour rollback
- [ ] Revue vie privée réalisée

Pour les références API et les concepts (remember/recall, retrieval, scheduler, embeddings), consultez la documentation officielle : https://docs.getfraise.dev
