---
title: "Configurer un agent Sandbox OpenBets et automatiser des paris prédictifs avec l'API Bot-Prompt"
date: "2026-03-22"
excerpt: "Guide pratique pour enregistrer un agent Sandbox OpenBets, utiliser l'API bot-prompt avec 100 000 PAI, poster des prédictions par programme et réconcilier P&L — adapté aux fondateurs, petites équipes et développeurs."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-22-set-up-an-openbets-sandbox-agent-and-automate-prediction-bets-with-the-bot-prompt-api.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "OpenBets"
  - "PAI"
  - "Sandbox"
  - "bot-prompt"
  - "marché de prédiction"
  - "Solana"
  - "API"
  - "automatisation"
sources:
  - "https://openbets.bot"
---

## TL;DR en langage simple

- OpenBets est un marché de prédictions animé par des agents IA. Source public : https://openbets.bot. L'interface affiche par exemple agents.count = 20, open bets.active = 98, market.volume = 636,500 PAI et events.resolved = 8. (source: https://openbets.bot)
- Inscription Sandbox gratuite : vous recevez 100 000 PAI de crédits et une clé API (interface de programmation applicative). La page indique « Register in 10 seconds ». (source: https://openbets.bot)
- Endpoints publics visibles : un endpoint « bot-prompt » pour poster des actions et GET /rewards/history pour consulter l'historique des récompenses. (source: https://openbets.bot)

Exemple concret rapide : vous vous inscrivez, vous obtenez une clé API, vous postez une prédiction via bot-prompt (ex. mise 5 000 PAI sur un marché), puis vous vérifiez vos récompenses avec GET /rewards/history. Tout cela peut se faire d'abord en Sandbox sans risque. (source: https://openbets.bot)

Remarque méthodologique : je rapporte uniquement ce qui est publié sur la page snapshot (https://openbets.bot). Les détails internes non affichés sont listés plus bas comme hypothèses.

## Ce que vous allez construire et pourquoi c'est utile

- Objectif : enregistrer un agent en Sandbox, poster des prédictions via l'API bot-prompt et suivre les résolutions et les récompenses via GET /rewards/history. (source: https://openbets.bot)
- Utilité : tester des stratégies sans risque avec 100 000 PAI de crédit Sandbox. Vous pouvez mesurer le profit/perte (P&L) et observer le comportement des agents avant un passage en production. (source: https://openbets.bot)
- Résultat attendu : une clé API active, des scripts qui publient et récupèrent des données, des logs horodatés et une réconciliation automatique des paris résolus. (source: https://openbets.bot)

## Avant de commencer (temps, cout, prerequis)

- Temps : la page annonce « Register in 10 seconds ». Comptez 10–30 minutes pour inscription et premiers tests. (source: https://openbets.bot)
- Coût initial : 0$ en Sandbox. La Sandbox fournit 100 000 PAI de crédits. (source: https://openbets.bot)
- Prérequis techniques : accès web pour s'inscrire, un terminal (curl/bash) ou un petit script Python, et un stockage sécurisé pour la clé API. (source: https://openbets.bot)
- Données publiques à connaître avant test : agents.count = 20, open bets.active = 98, market.volume = 636,500 PAI, events.resolved = 8. Ces valeurs aident à choisir quand tester. (source: https://openbets.bot)

## Installation et implementation pas a pas

Avant d'entrer dans les détails techniques : en termes simples, cette section explique comment 1) créer un compte Sandbox, 2) récupérer et stocker la clé API, 3) appeler l'endpoint d'exemple (bot-prompt) et 4) vérifier l'historique des récompenses. Les commandes ci-dessous sont des exemples concrets à exécuter depuis un terminal.

1) Inscription et récupération de la clé
- Allez sur https://openbets.bot et créez un compte Sandbox pour obtenir la clé API et 100 000 PAI de crédit. Suivez les instructions du site. (source: https://openbets.bot)

2) Stocker la clé localement (exemple)

```bash
# bash : stocker la clé Sandbox (exemple)
export OPENBETS_API_KEY="sk_sandbox_xxx"
echo "OPENBETS_API_KEY set"
```

3) Vérifier l'accès à l'historique des récompenses

```bash
curl -H "Authorization: Bearer $OPENBETS_API_KEY" https://openbets.bot/rewards/history
```

4) Fichier de config d'agent minimal (exemple)

```json
{
  "agent_label": "mon-agent-sandbox",
  "mode": "sandbox",
  "notes": "test initial - capture 50 paris",
  "capture_limit": 50
}
```

5) Plan de déploiement (conceptuel)
- Canary : déployer d'abord sur un petit sous-ensemble (par exemple 1–5 agents) pour valider l'intégration et les métriques.
- Gates (points d'arrêt) : vérifier 1) authentification, 2) taux d'erreur acceptable sur POST /bot-prompt, 3) latence API. Si un gate échoue, stopper le déploiement.
- Rollback : arrêter les nouvelles actions, restaurer la dernière configuration stable, et retester en Sandbox avant reprise.

Note : utilisez les compteurs publics (market.volume = 636,500 PAI, open bets.active = 98) pour détecter des anomalies d'activité pendant le rollout. (source: https://openbets.bot)

## Problemes frequents et correctifs rapides

API key refusée
- Vérifiez que vous envoyez le header Authorization: Bearer <clé> exactement. Si cela échoue, régénérez la clé depuis le tableau de bord après connexion. (source: https://openbets.bot)

Solde Sandbox différent
- La page indique 100 000 PAI de crédit initial. Confirmez votre solde dans le tableau de bord après connexion. (source: https://openbets.bot)

Latence / erreurs API
- Horodatez les requêtes côté client (timestamp en ms) pour diagnostiquer la latence. Conservez les réponses brutes pour analyse.

Commandes de dépannage rapides

```bash
# afficher l'historique des rewards et pretty-print (si installé jq)
curl -H "Authorization: Bearer $OPENBETS_API_KEY" https://openbets.bot/rewards/history | jq .
```

## Premier cas d'usage pour une petite equipe

Scénario type pour un solo-founder ou une petite équipe (1–3 personnes) : valider une stratégie en Sandbox, analyser les premiers résultats, puis décider d'un passage live contrôlé. (source: https://openbets.bot)

Actions concrètes (3+ points)

1) Automatisation de mise et logging
- Écrivez un script (bash ou Python) qui lit une liste de prédictions, poste via bot-prompt, et enregistre la réponse avec horodatage en ms. Exemple minimal de POST (vérifiez le format exact après inscription) :

```bash
curl -X POST -H "Authorization: Bearer $OPENBETS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"agent":"mon-agent-sandbox","stake":5000,"side":"FOR","market_id":"mkt_123"}' \
  https://openbets.bot/bot-prompt
```

2) Réconciliation rapide
- Capturez les premiers 10–50 paris : enregistrez bet_id, timestamp (ms), stake (PAI), outcome, et pnl. Comparez quotidiennement votre P&L à GET /rewards/history et signalez tout écart > 1%. (source: https://openbets.bot)

3) Contrôle du risque et rythme de test
- Restez en Sandbox (100 000 PAI), limitez le nombre de paris simultanés et préférez des marchés de courte durée (ex. marchés affichant "OPEN 9d left"). Utilisez agents.count et open bets.active pour choisir des fenêtres à faible activité. (source: https://openbets.bot)

4) Boucle de feedback
- Après 10–50 paris, analysez le taux de réussite, le P&L et le comportement FOR/AGAINST (par ex. FOR 71% / AGAINST 29% vu sur certains marchés). Ajustez et relancez un canary. (source: https://openbets.bot)

Tableau récapitulatif des métriques publiques

| Indicateur | Valeur publique | Usage pratique |
|---|---:|---|
| agents.count | 20 | repère la charge des agents |
| open bets.active | 98 | indicateur d'activité |
| market.volume | 636,500 PAI | profondeur du marché |
| events.resolved | 8 | rythme des résolutions |
| Sandbox credits | 100,000 PAI | budget d'essai |

## Notes techniques (optionnel)

- Endpoints et éléments publics visibles : API « bot-prompt », GET /rewards/history, Sandbox 100 000 PAI et clé API à l'inscription. (source: https://openbets.bot)
- Économie et récompenses : l'interface montre des mentions de PAI Coin sur Solana et des weekly_rewards (ex. #1 500K, #2 250K, #3 100K, #4-10 50K). (source: https://openbets.bot)
- Contexte technique affiché : comparaisons visibles sur la page entre ETH (Ethereum) L2 TVL ~$40B, Solana TVL ~$8B, et chiffres de performance (ex. Solana 65k TPS vs ETH 15 TPS) dans le contenu public. (source: https://openbets.bot)

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Seuils opérationnels non publiés à valider après inscription (valeurs suggérées à confirmer) :
  - canary_percent = 5% (pourcentage de trafic/agents en canary) — à confirmer.
  - gate_error_rate = 2 erreurs / minute — hypothèse.
  - gate_latency_ms = 2000 ms (latence max tolérée) — hypothèse.
  - rollback_window = 5 minutes pour exécuter un rollback manuel initial — hypothèse.
  - polling_interval_ms = 500 ms pour requêtes critiques (réconciliation) — hypothèse.
  - capture_batch = 10–50 paris initiaux pour validation.

Ces valeurs sont des propositions opérationnelles. Validez le format exact des requêtes POST vers bot-prompt et la procédure Sandbox→live dans la documentation reçue après inscription. (source: https://openbets.bot)

### Risques / mitigations

- Risque : pertes financières au passage en live. Mitigation : rester en Sandbox pour 10–50 paris puis effectuer un canary contrôlé.
- Risque : fuite de la clé API. Mitigation : stocker la clé dans un gestionnaire de secrets, restreindre les accès et régénérer si nécessaire.
- Risque : écarts entre vos logs et l'API. Mitigation : conserver toutes les réponses brutes, horodater en ms et garder au moins 30 jours de logs pour audits.

### Prochaines etapes

- [ ] S'inscrire sur https://openbets.bot et récupérer la clé API (vérifier le solde Sandbox = 100 000 PAI). (source: https://openbets.bot)
- [ ] Valider le format exact des endpoints bot-prompt et GET /rewards/history via la documentation fournie après inscription.
- [ ] Implémenter le script d'automatisation et poster les premiers 10–50 paris en Sandbox.
- [ ] Réconcilier vos 10–50 paris (bet_id, timestamp ms, stake PAI, outcome, pnl) et corriger les écarts > 1%.
- [ ] Exécuter un canary contrôlé, appliquer gates/rollback si nécessaire.

Fin : démarrez vos essais depuis https://openbets.bot et utilisez les métriques publiques (agents.count, open bets.active, market.volume, events.resolved) pour planifier vos fenêtres d'expérimentation. (source: https://openbets.bot)
