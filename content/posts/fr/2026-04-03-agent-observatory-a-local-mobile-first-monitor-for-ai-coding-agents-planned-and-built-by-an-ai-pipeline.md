---
title: "Agent Observatory — moniteur local et mobile-first pour agents de codage IA planifié et construit par un pipeline d'IA"
date: "2026-04-03"
excerpt: "Rapport de terrain : Agent Observatory est un moniteur local à processus unique qui ingère la télémétrie OpenTelemetry (OTEL), envoie des alertes mobiles via Web Push et peut arrêter/redémarrer des agents de codage IA — planifié et majoritairement implémenté par un pipeline d'IA. Voir le rapport : https://ren.phytertek.com/blog/building-the-panopticon-from-inside/"
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-03-agent-observatory-a-local-mobile-first-monitor-for-ai-coding-agents-planned-and-built-by-an-ai-pipeline.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 360
editorialTemplate: "TUTORIAL"
tags:
  - "AI"
  - "observabilité"
  - "OpenTelemetry"
  - "WebSocket"
  - "WebPush"
  - "Bun"
  - "agents"
  - "sécurité"
sources:
  - "https://ren.phytertek.com/blog/building-the-panopticon-from-inside/"
---

## TL;DR en langage simple

- Agent Observatory est un serveur local qui surveille vos agents d'IA : collecte d'événements, tableau de bord en temps réel et notifications push mobiles quand un agent plante ou se fige. Source : https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.
- Pourquoi l'utiliser : si vous lancez plusieurs agents en parallèle (l'auteur mentionne exécuter 5 agents en parallèle), vous ne pouvez pas suivre tous les terminaux ; l'Observatory suit les agents et permet d'arrêter ou redémarrer depuis votre téléphone. Source : https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

Méthodologie : résumé concis basé sur le rapport cité ci‑dessus.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez mettre en place un serveur local minimal qui :
- reçoit des traces et événements via OpenTelemetry (OTEL) ;
- normalise les sessions et diffuse l'état des agents via WebSocket vers un dashboard React ;
- gère les subscriptions Web Push et envoie des notifications pour événements critiques (crash, stall) ;
- expose des endpoints locaux pour arrêter ou redémarrer un agent (contrôle désactivé par défaut depuis l'extérieur).

Composants clés observés dans le rapport : Bun (serveur), ingestion OTEL, dashboard React via WebSocket, Web Push, Cloudflare Tunnel optionnel ; le projet cité contient 115 commits, ~26 000 lignes TypeScript et 1 103 tests qui passent. Source : https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

## Avant de commencer (temps, cout, prerequis)

Prérequis minimum :
- une machine de développement (le rapport décrit un MacBook ; Linux est possible) ;
- Bun installé (le rapport mentionne Bun) ou Node selon vos préférences ;
- un navigateur moderne compatible Web Push et un téléphone pour recevoir les notifications ;
- au moins un agent capable d'émettre des traces OTEL ou la possibilité d'envoyer du JSON de test.

Checklist de départ :
- [ ] Créer un dépôt local pour l'Observatory.
- [ ] Installer Bun ou Node et choisir une implémentation WebSocket.
- [ ] Préparer un endpoint OTEL (collector local ou récepteur direct).
- [ ] Vérifier la réception Web Push sur un appareil de test.
- [ ] Garder le contrôle distant désactivé par défaut.

Pour le design et l'intention (single process, mobile-first, pas de dépendances cloud par défaut), voir le rapport : https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

## Installation et implementation pas a pas

1) Scaffold minimal et lancement

```bash
mkdir agent-observatory && cd agent-observatory
git init
echo "console.log('observatory running')" > index.ts
# Lancer avec Bun si disponible (mentionné dans le rapport)
bun run index.ts
```

2) OTEL Collector minimal

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      http:
      grpc:
processors:
  batch:
exporters:
  logging:
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [logging]
```

Explication : ce collecteur accepte OTLP (HTTP & gRPC) et affiche les traces dans les logs pour tests. Source : https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

3) Exemple de payload test (POST JSON)

```json
{"session_id":"agent-01","status":"crash","timestamp":1680000000000}
```

Le serveur doit convertir les spans OTEL en objets de session lisibles par le dashboard et les broadcast via WebSocket.

4) Dashboard / WebSocket

- Le serveur transforme spans → sessions simplifiées.
- Broadcast via WebSocket aux clients connectés.
- Le client React installe un service worker pour Web Push et affiche la liste des sessions.

5) Web Push

- Le navigateur crée une subscription et l'envoie au serveur.
- Le serveur stocke la subscription (chiffrée localement de préférence) et envoie une notification pour événements critiques.

6) Contrôle local

- Endpoints recommandés : POST /control/kill, POST /control/restart.
- Par défaut, exiger un token local et refuser l'accès externe. N'activez l'accès distant qu'après validation canary.

7) Tunnel Cloudflare (optionnel)

- Activez le tunnel uniquement après une période de canary locale validée. Le rapport mentionne Cloudflare Tunnel comme option pour accès distant. Source : https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

Tableau de comparaison observé vs choix

| Composant           | Observé dans le rapport | Quand le choisir                             |
|---------------------|------------------------:|----------------------------------------------|
| Bun (serveur)       | Oui                     | Développement local, démarrage rapide        |
| Node (alternative)  | Non précisé             | Si l'équipe préfère l'écosystème Node        |
| OTEL Collector      | Oui                     | Normaliser traces/événements                 |
| Cloudflare Tunnel   | Option                  | Accès distant contrôlé après canary          |

Source : https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

## Problemes frequents et correctifs rapides

- Pas de notifications push sur le téléphone
  - Cause : service worker non enregistré ou permissions bloquées.
  - Correctif : ré-enregistrer le service worker, vérifier permissions du navigateur et resubscriber.

- Télémétrie absente
  - Cause : collector OTEL non démarré ou mauvaise URL d'export.
  - Correctif : vérifier otel-collector-config.yaml et logs du collector.

- Déconnexions WebSocket
  - Cause : crash serveur, timeouts du tunnel, absence de keepalive.
  - Correctif : redémarrer le serveur, ajouter ping/pong keepalive, régler timeouts du tunnel.

- Agent en boucle (runaway)
  - Mitigation immédiate : appeler POST /control/kill localement.
  - Durable : ajouter détection de stall et règles conservatrices pendant la phase canary.

Contexte et intention du design (mobile-first, single process, pas de dépendances cloud par défaut) : https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

## Premier cas d'usage pour une petite equipe

Contexte : fondateur solo ou petite équipe qui veut tester plusieurs agents en parallèle sans déployer en cloud (le rapport illustre un usage sur une seule machine développeur).

Actions concrètes et prioritaires :

1) Mode alert-only local (jour 1)
- Déployez l'observatory en local. Activez uniquement les notifications. Ne donnez pas la capacité d'arrêter à distance au début.
- Objectif : détecter crashs sans introduire risque d'exposition.

2) Désigner 1 opérateur et tester la chaîne d'alerte (jour 1–2)
- Choisissez une personne et un téléphone pour recevoir les pushs ; vérifiez la chaîne complète (agent → OTEL → server → push).

3) Instrumenter et noter les faux positifs (jour 2–3)
- Tenir un log des faux positifs et ajuster les seuils avant d'autoriser des commandes automatiques.

4) Passage progressif au contrôle distant (après canary)
- Après une période de validation, activez le tunnel Cloudflare pour un seul opérateur via feature flag.

Checklist rapide pour petite équipe :
- [ ] Lancer en mode alert-only.
- [ ] Confirmer réception mobile des pushs.
- [ ] Documenter faux positifs et ajuster règles.
- [ ] Ouvrir tunnel pour 1 opérateur après validation.

Référence : https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.

## Notes techniques (optionnel)

- Stack observé : Bun serveur local, ingestion OpenTelemetry (OTEL), dashboard React via WebSocket, Web Push, Cloudflare Tunnel optionnel — conçu pour fonctionner sans cloud en usage courant. Source : https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.
- Le rapport mentionne que le projet a été planifié par un pipeline d'IA nommé "Dark Factory" et validé contre le cadre "Five Conditions" ; métriques du dépôt cité : 115 commits, ~26 000 lignes de TypeScript, 1 103 tests qui passent.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Temps minimal pour une reproduction locale : ~6 heures de travail focalisé (hypothèse à valider sur votre matériel).
- Durée recommandée pour le canary alert-only : 48–72 heures (valeur proposée pour observation initiale).
- Concurrence d'agents initialement recommandée pour test : 3–5 agents en parallèle (hypothèse basée sur besoin décrit pour gérer plusieurs terminaux).
- Objectif de latence des alertes : médiane < 10 s entre l'événement et la push (valeur cible à mesurer).
- Seuils de détection suggérés : pas de progression pendant 30 s ou utilisation CPU soutenue > 80% → déclenche circuit-breaker (à ajuster selon vos agents).
- Tolérance aux faux positifs pendant canary : à définir (ex. < 10% d'alertes invalides pendant période de test).
- Coût indicatif pour tunnel hobby : variable ($0–$20/mois selon offre) — à confirmer avant production.

(Remarque : ces valeurs sont des hypothèses pratiques à valider sur votre setup local.)

### Risques / mitigations

- Exposition accidentelle de l'API de contrôle à Internet.
  - Mitigation : contrôle local par défaut ; activer tunnel via feature flag ; rotation immédiate des secrets si incident.
- Fatigue d'alerte (trop de faux positifs).
  - Mitigation : commencer conservateur, consigner chaque faux positif durant canary, ajuster seuils.
- Incompatibilités Web Push entre navigateurs/OS.
  - Mitigation : tester la matrice cible et fournir un guide d'onboarding pour opérateurs.
- Déconnexions du tunnel interrompant le contrôle.
  - Mitigation : prévoir fallback local et runbook pour révoquer tunnels et faire rotation des tokens.

### Prochaines etapes

- Implémenter la reproduction minimale décrite et lancer un canary alert-only de 48–72 heures.
- Ajouter des tests CI de fumée pour : ingestion OTEL, broadcast WebSocket, enregistrement du service worker, endpoints de contrôle protégés.
- Si canary satisfaisant, activer contrôle distant pour 1 opérateur via feature flag ; élargir progressivement.
- Prioriser une v2 : stockage long‑terme de télémétrie, RBAC multi‑opérateur, journaux d'audit et workflows d'approbation pour actions critiques.

Checklist technique de production :
- [ ] Gating CI pour tests de fumée
- [ ] Stockage chiffré des clés/secrets
- [ ] Journalisation d'audit pour appels à l'API de contrôle
- [ ] RBAC / workflow d'approbation pour opérateurs
- [ ] Runbook d'incident : révocation de tunnels, rotation de tokens

Référence principale : https://ren.phytertek.com/blog/building-the-panopticon-from-inside/.
