---
title: "LeftGlove — serveur MCP (npx) qui encapsule ShiftLefter pour l'exploration web par agents et humains"
date: "2026-04-16"
excerpt: "Installez LeftGlove localement (ex. via npx) pour lancer un serveur MCP qui encapsule ShiftLefter et fournit une interface partagée agent/humain afin d'explorer, cataloguer et exporter pages, formulaires et interactions."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-16-leftglove-an-mcp-server-npx-that-wraps-shiftlefter-for-agent-and-human-web-exploration.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "leftglove"
  - "shiftlefter"
  - "mcp"
  - "exploration-web"
  - "qa"
  - "automation"
  - "devops"
  - "startup"
sources:
  - "https://github.com/stephenchilcote-gauntlet/leftglove"
---

## TL;DR en langage simple

- LeftGlove est présenté sur GitHub comme « an MCP server wrapping ShiftLefter ». Il fournit une API HTTP pour des agents automatisés et une interface utilisateur (UI) pour des humains. Source : https://github.com/stephenchilcote-gauntlet/leftglove
- But principal : explorer et cataloguer les pages et interactions web. Utile pour trouver formulaires, flux et points de friction avant d'automatiser des vérifications. Source : https://github.com/stephenchilcote-gauntlet/leftglove
- Estimations opérationnelles (à valider) : démarrage local rapide (~5 min estimés pour lancer le serveur), installation complète 45–90 min, première passe utile 30–60 min, catalogue basique 2–4 h.

Exemple concret : vous êtes une petite équipe QA. Vous lancez LeftGlove localement, fournissez 8 URLs prioritaires. En 30–60 min, LeftGlove découvre les formulaires et les parcours de connexion. Vous faites une revue humaine, marquez 3 checks à automatiser, puis ajoutez ces vérifs au pipeline CI.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez déployer localement un serveur MCP (mediator) qui fait l'intermédiaire entre :
- des agents programmatiques qui parcourent des pages web, et
- une UI pour des réviseurs humains.

Le dépôt officiel le décrit ainsi : https://github.com/stephenchilcote-gauntlet/leftglove

Pourquoi c'est utile :
- Centraliser plusieurs scripts ad hoc dans une seule application. 
- Permettre une validation humaine avant de transformer une découverte en règle automatique.
- Raccourcir le cycle « découverte → revue → automatisation ». 

Source et référence principale : https://github.com/stephenchilcote-gauntlet/leftglove

## Avant de commencer (temps, cout, prerequis)

Temps estimé et coût (estimations à vérifier) :
- Installation locale : 45–90 min.
- Intégration initiale au workflow : 2–4 h.
- Option cloud (VM légère) : $0.01–$0.30 / h (estimation indicative).

Prérequis minimaux :
- Node.js installé (vérifiez avec node --version).
- Navigateur moderne pour l'UI (interface utilisateur).
- Un port libre (par ex. 3000).
- Autorisation explicite pour scanner les cibles (respectez la politique de sécurité et la légalité).

Checklist rapide :
- [ ] Node installé (node --version).
- [ ] Port choisi (ex. 3000) libre.
- [ ] Liste d'URL cibles (1–25 items) prête et autorisée.

Référence : https://github.com/stephenchilcote-gauntlet/leftglove

## Installation et implementation pas a pas

1) Préparer l'hôte
- Vérifiez Node et la disponibilité du port 3000.

```bash
node --version    # ex: v18.x ou v20.x recommandés
lsof -i :3000     # confirmer que le port 3000 est libre
```

2) Récupérer le code
- Clonez le dépôt et installez les dépendances.

```bash
git clone https://github.com/stephenchilcote-gauntlet/leftglove.git
cd leftglove
npm install
```

3) Config minimale (illustratif)
- Exemple JSON de configuration. Adaptez avant usage en production. Le dépôt contient les fichiers réels et la documentation : https://github.com/stephenchilcote-gauntlet/leftglove

```json
{
  "port": 3000,
  "allowedOrigins": ["http://localhost:8080"],
  "agentApiKey": "change-me",
  "maxConcurrentSessions": 3
}
```

4) Fournir les cibles
- Commencez avec 1–25 URLs autorisées.

```json
{
  "targets": [
    "https://example.local/page1",
    "https://example.local/page2"
  ]
}
```

5) Lancer et tester
- Démarrez le serveur et ouvrez l'UI sur http://localhost:3000 (ou le port configuré).

```bash
npm start
# test rapide (adapté selon l'API réelle)
curl -s -o /dev/null -w "%{http_code} %{time_total}s" -H "Authorization: Bearer change-me" "http://localhost:3000/agent/ping"
```

Référence : https://github.com/stephenchilcote-gauntlet/leftglove

Plain-language explanation before advanced details:
- En pratique, LeftGlove expose des endpoints HTTP que des agents utilisent pour lancer des explorations. L'UI permet à une personne de voir les résultats, d'approuver ou de rejeter des découvertes. Avant d'augmenter la charge, commencez en local avec une ou deux sessions concurrentes. Cela limite les ressources utilisées et facilite le débogage.

## Problemes frequents et correctifs rapides

| Symptom | Cause probable | Correctif rapide |
|---|---:|---|
| Le serveur ne démarre pas | Port occupé ou Node incompatible | Vérifiez node --version ; libérez le port ; redémarrez (≤ 5 min) |
| UI inaccessible | CORS / allowedOrigins manquante | Ajouter l'origine et redémarrer (10–30 s) |
| Agents renvoient 500 / timeouts | Timeouts ou ressources insuffisantes | Augmenter timeout de 10–20 s ; réduire concurrence à 1–3 |
| Faible couverture | Profondeur de crawl insuffisante | Ajouter cibles explicites ; relancer 1–3 fois |

Commandes utiles :

```bash
# vérifications de base
node --version
lsof -i :3000
# logs
tail -n 200 logs/leftglove.log
```

Seuils opérationnels recommandés (illustratifs) :
- Latence cible pour endpoints métadonnées : 200–500 ms.
- Latence d'interaction page : 500 ms–5 s.
- Seuil d'erreur acceptable avant rollback : 1% sur 1 h.

Référence : https://github.com/stephenchilcote-gauntlet/leftglove

## Premier cas d'usage pour une petite equipe

Contexte : solo founder ou équipe de 1–3 personnes. Le dépôt décrit LeftGlove comme un serveur MCP enveloppant ShiftLefter et offrant une interface agent/humain : https://github.com/stephenchilcote-gauntlet/leftglove

Actions concrètes (au moins 3 points actionnables) :

1) Démarrage ciblé (rapide)
- Choisissez 5–10 pages prioritaires. Lancez LeftGlove localement. Faites une première passe en 30–60 min (estimation).

2) Conserver les ressources basses
- Configurez maxConcurrentSessions = 1–2. Surveillez CPU > 80% ou mémoire > 75% et réduisez la concurrence si nécessaire.

3) Revue humaine rapide et priorisation
- Organisez une séance de revue de 30–60 min. Taggez ou approuvez les découvertes. Sélectionnez 3–5 checks « smoke » à automatiser.

4) Automatiser progressivement
- Exportez les 3–5 vérifications critiques et intégrez-les au pipeline CI (intégration continue). Ciblez un seuil d'erreur < 1% pour la promotion en production.

5) Reproductibilité
- Sauvegardez targets.json et la config. Relance reproductible en 5–10 min (est.).

Budget temps pour une petite équipe (est.) : setup 45–90 min ; découverte + revue 30–60 min ; automatisation 1–2 h.

Référence : https://github.com/stephenchilcote-gauntlet/leftglove

## Notes techniques (optionnel)

Résumé d'architecture et recommandations (source) : https://github.com/stephenchilcote-gauntlet/leftglove

- LeftGlove est présenté comme un serveur MCP qui enveloppe ShiftLefter et expose une API HTTP pour les agents et une UI pour les humains.
- Recommandation opérationnelle (illustrative) : maxConcurrentSessions 1–5 en développement ; 10–50 en production après tests.
- Conservez les logs 30 jours et faites rotation des clés API toutes les 90 jours (recommandation pratique).

Exemple de configuration production (illustratif) :

```json
{
  "port": 443,
  "tls": {"certPath": "/etc/ssl/certs/fullchain.pem", "keyPath": "/etc/ssl/private/key.pem"},
  "maxConcurrentSessions": 10,
  "logsRetentionDays": 30
}
```

Sécurité : stocker les clés en variables d'environnement et restreindre allowedOrigins à une liste de confiance.

Référence : https://github.com/stephenchilcote-gauntlet/leftglove

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Fait confirmé dans le dépôt : LeftGlove est décrit comme « an MCP server wrapping ShiftLefter » et comme interface agent/humain. Source : https://github.com/stephenchilcote-gauntlet/leftglove
- Les valeurs opérationnelles et chiffres listés ici sont des estimations pratiques et nécessitent validation dans le code et la documentation du dépôt. À vérifier : durées estimées, recommandations de concurrence, seuils d'alerte, latences cibles, rétention des logs, rotation des clés, coûts VM.

Méthodologie : validez le schéma de configuration et les endpoints dans le dépôt avant production.

### Risques / mitigations

- Risque : exposition du serveur à des tiers. Mitigation : activer TLS, utiliser clé API, restreindre allowedOrigins, placer derrière un reverse proxy.
- Risque : consommation excessive CPU/mémoire par des navigateurs headless. Mitigation : limiter maxConcurrentSessions (1–3) sur petites VM ; alerter CPU > 80% ; passer à un scale-out horizontal si nécessaire.
- Risque : découvertes bruitées et faux positifs. Mitigation : gates de revue humaine ; seuil d'approbation avant promotion (ex. 80% d'accord pour automatiser).

### Prochaines etapes

1) Valider la CLI et le schéma de configuration dans le dépôt : https://github.com/stephenchilcote-gauntlet/leftglove
2) Écrire un job CI minimal : démarrer LeftGlove dans un conteneur, appeler un endpoint agent (200 OK) et vérifier le nombre de découvertes attendu.
3) Canary : déployer sur 1 VM, exécuter ~100 vérifs sur 24 h avec maxConcurrentSessions = 1. Élargir si stable.
4) Opérationnaliser : définir rétention logs (30 jours), alertes sur taux d'erreur et latence médiane, planifier rotation des clés tous les 90 jours.

Référence principale : https://github.com/stephenchilcote-gauntlet/leftglove
