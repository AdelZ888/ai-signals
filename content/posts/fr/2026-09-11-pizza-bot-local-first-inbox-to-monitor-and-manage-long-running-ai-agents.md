---
title: "Pizza Bot : boîte de réception local-first pour surveiller et gérer des agents IA longue durée (contexte UK)"
date: "2026-09-11"
excerpt: "Exécution locale d'une instance Pizza Bot pour surveiller et contrôler des tâches d'agents IA longue durée. Le dépôt inclut des étapes d'installation, une checklist de validation et des notes sur DeepAgents / LangGraph."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-11-pizza-bot-local-first-inbox-to-monitor-and-manage-long-running-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "pizza-bot"
  - "agents-IA"
  - "local-first"
  - "DeepAgents"
  - "LangGraph"
  - "observabilité"
  - "devtools"
  - "startup"
sources:
  - "https://github.com/pizza-bot-app/pizza-bot"
---

## TL;DR en langage simple

- Pizza Bot est décrit dans le dépôt GitHub comme « A local-first inbox for long-running AI agents, built with DeepAgents and LangGraph. » (source : https://github.com/pizza-bot-app/pizza-bot).
- But : ce document est un guide pratique minimal — il synthétise ce que vous ferez et les risques; les détails d'implémentation (ports, version Node, paramètres) sont listés en fin de document sous « Hypotheses / inconnues » pour validation avec le README du dépôt. Méthodologie : j'utilise l'extrait public du dépôt comme base (snapshot) et je déplace les hypothèses non confirmées vers la section finale.
- Résumé opérationnel : cloner le dépôt, lire le README upstream (https://github.com/pizza-bot-app/pizza-bot), valider localement, puis décider d'un canary court avant toute mise en production.

## Ce que vous allez construire et pourquoi c'est utile

Objectif : lancer une instance de développement de Pizza Bot pour tester et observer des agents IA longue durée en local (voir le dépôt : https://github.com/pizza-bot-app/pizza-bot).

Pourquoi c'est utile :
- Observabilité centralisée des jobs longue durée.
- Contrôle manuel des tâches (annuler / relancer / inspecter) avant d'exposer un workflow en production.
- Mode "local-first" pour limiter les fuites de données pendant les essais (référence : dépôt https://github.com/pizza-bot-app/pizza-bot).

Comparaison rapide (décision frame)

| Option | Confidentialité | Coût initial | Facilité de partage |
|---|---:|---:|---:|
| Local (poste dev) | élevée | faible | faible (manuel) |
| VM partagée | modérée | dépend du provider | facile (accès réseau) |

Source du projet : https://github.com/pizza-bot-app/pizza-bot

## Avant de commencer (temps, cout, prerequis)

- Lire d'abord le README du dépôt : https://github.com/pizza-bot-app/pizza-bot.
- Checklist minimale avant lancement :
  - [ ] Cloner le dépôt public.
  - [ ] Ouvrir le README et repérer la section d'installation.
  - [ ] Réserver un dossier de travail pour les données locales (backup recommandé).
  - [ ] Créer un bref runbook d'1 page pour démarrage/rollback.

Remarque : les paramètres précis (versions Node, ports par défaut, etc.) peuvent varier selon la branche ; confirmez-les dans le README upstream (https://github.com/pizza-bot-app/pizza-bot) avant d'exécuter toute commande.

## Installation et implementation pas a pas

Processus logique (haut niveau) :
1. Cloner le dépôt.
2. Consulter la doc du dépôt pour l'outil de paquet recommandé (npm / pnpm) et la version Node.
3. Installer les dépendances localement.
4. Lancer en mode développement et valider l'interface et l'API.
5. Poster une tâche test et vérifier son cycle de vie dans l'UI.

Référence : https://github.com/pizza-bot-app/pizza-bot

(Remarque : les commandes d'exemple et une configuration type sont listées dans la section "Hypotheses / inconnues" à la fin — validez-les avec le README du dépôt avant usage.)

## Problemes frequents et correctifs rapides

Source pour diagnostics : logs locaux et README du dépôt (https://github.com/pizza-bot-app/pizza-bot).

Symptômes usuels et actions rapides (procédure générale) :
- L'application ne démarre pas : vérifier que l'outil de package installé et la version Node sont conformes au README.
- Rien n'arrive dans l'inbox : vérifier les routes API exposées et la configuration de stockage locale.
- UI affiche des états incomplets : vérifier les permissions sur les fichiers de données et redémarrer le service.

Checklist de diagnostic rapide :
- [ ] Confirmer la version de Node recommandée dans le dépôt.
- [ ] Relancer l'installation des dépendances.
- [ ] Vérifier les logs de démarrage.

Pour tout incident, collectez : stdout/stderr du serveur, copie du payload envoyé, et état du stockage local avant toute modification.

## Premier cas d'usage pour une petite equipe

Cible : fondateurs solo ou équipe de 1–3 personnes qui veulent valider des agents IA localement (voir dépôt : https://github.com/pizza-bot-app/pizza-bot).

Plan simple en 5 étapes (conceptuel) :
1. Cloner le dépôt et lire le README pour les prérequis.
2. Démarrer une instance locale en mode dev.
3. Poster 1–10 jobs tests et observer le comportement.
4. Documenter les échecs et ajuster les retries / timeouts (paramètres à définir selon vos essais).
5. Lancer un canary court interne et décider du passage en VM partagée.

Petite équipe — checklist opérationnelle :
- [ ] Propriétaire assigné pour le service.
- [ ] Runbook partagé et accessible.
- [ ] Validation d'une période de test (à définir) et métriques de sortie.

Référence projet : https://github.com/pizza-bot-app/pizza-bot

## Notes techniques (optionnel)

Extraits utiles du snapshot du dépôt :
- Description principale : « A local-first inbox for long-running AI agents, built with DeepAgents and LangGraph. » (https://github.com/pizza-bot-app/pizza-bot).
- Popularité snapshot : 79 étoiles, 6 forks sur la branche par défaut (extrait public).

Conseil d'observabilité (générique) : exposez métriques pour au moins ces indicateurs : profondeur de file, latence moyenne par job, taux d'échec, et compte des jobs traités.

Exemple de health poll générique (à adapter selon le README) :

```bash
# Exemple : boucle de vérification health (exemple générique)
while true; do
  curl -fsS http://localhost:PORT/health || echo "service down"
  sleep 30
done
```

(Adaptez PORT et la route health selon la configuration du dépôt ; voir : https://github.com/pizza-bot-app/pizza-bot)

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

Les éléments suivants sont des hypothèses pratiques et des propositions de valeurs par défaut à valider contre le README et la configuration réelle du dépôt : https://github.com/pizza-bot-app/pizza-bot

- Durées et portée : validation locale estimée 60–120 minutes (1–2 heures). Canary proposé : 7 jours.
- Taille et coût : coût local 0 $ (poste dev). VM partagée estimée ≈ $5–$50 / mois (à valider).
- Environnement : Node.js version 16+ (hypothèse — vérifier le README). Espace disque estimé 100–500 MB pour dépendances et données locales.
- Exemples de paramètres opérationnels (à confirmer) : retries = 3, retry_delay = 60 s, target max job time = 600 s, gate queue depth = 50, health poll = 30 s, token budget suggestion 500–1000 tokens.
- Popularité snapshot : 79 étoiles, 6 forks (extrait public).

Exemples de commandes et config (exemples à valider dans le dépôt) :

```bash
# Exemples génériques — valider avant usage
git clone https://github.com/pizza-bot-app/pizza-bot.git
cd pizza-bot
# installer (npm ou pnpm selon README)
npm install
```

```yaml
# Exemple de configuration locale (illustratif)
PORT: 3000
STORAGE_PATH: ./data/pizza-bot.db
INBOX_ENDPOINT: http://localhost:3000/api/inbox
```

### Risques / mitigations

- Risque : fuite de données sensibles si le stockage local n'est pas protégé. Mitigation : chiffrer sauvegardes, restreindre permissions filesystem et accès réseau.
- Risque : augmentation du taux d'erreur >10% en production. Mitigation : canary 7 jours, observabilité et alarmes (warning 5%, critique 10%), et procédures de rollback.
- Risque : dépassement de coût sur VM partagée. Mitigation : définir un plafond de coût et alertes de facturation.

### Prochaines etapes

- Valider dans le README du dépôt (https://github.com/pizza-bot-app/pizza-bot) : versions recommandées et commandes d'installation exactes.
- Mettre en place un runbook et assigner un propriétaire (objectif restauration <30 minutes si possible).
- Ajouter métriques et dashboards : job count, avg latency, failure rate, queue depth.
- Lancer un canary interne (7 jours) avec conditions de succès proposées : failure rate <5%, avg job time <600 s, queue depth <50.

Source principale : https://github.com/pizza-bot-app/pizza-bot (snapshot public utilisé).
