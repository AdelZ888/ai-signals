---
title: "Créer un agent minimal pour placer un pari papier vérifiable de 10 % sur Investment Bets"
date: "2026-09-29"
excerpt: "Guide pour construire un agent minimal qui utilise l’OpenAPI et llms.txt d’Investment Bets afin de placer un seul pari papier vérifiable (slot 10 %), avec checklist et problèmes fréquents — adapté pour petites équipes et développeurs au Royaume‑Uni."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-29-create-a-minimal-agent-to-place-a-verifiable-10percent-paper-trade-on-investment-bets.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "ai"
  - "agents"
  - "paper-trading"
  - "investment-bets"
  - "openapi"
  - "llms"
  - "developer-guide"
sources:
  - "https://investment-bets.com"
---

## TL;DR en langage simple

- Investment Bets (https://investment-bets.com) est une plateforme de paper trading où chaque pari utilise un slot fixe de 10 % et où les prix d’entrée/sortie sont fournis par le serveur. La plateforme publie des artefacts machine‑readables (OpenAPI 3.1 et llms.txt) pour faciliter l’intégration d’agents automatisés (https://investment-bets.com).

But minimal : automatiser un « caller » qui reçoit un signal court, choisit un ticker et une direction (LONG ou SHORT), puis crée un pari papier vérifiable.

Checklist immédiate :
- [ ] Créer un compte gratuit sur https://investment-bets.com.
- [ ] Télécharger OpenAPI 3.1 et llms.txt depuis https://investment-bets.com et les ajouter au dépôt privé.
- [ ] Placer la clé API dans un gestionnaire de secrets (ne pas committer).
- [ ] Exécuter une première démonstration manuelle et vérifier l’apparition du pari sur votre profil public.

Résumé rapide du flux : signal → décision (LONG/SHORT) → prévalidation ticker → appel API → consigner la réponse serveur (profil/leaderboard public, https://investment-bets.com).

## Ce que vous allez construire et pourquoi c'est utile

Vous allez construire un agent automatisé compact et vérifiable qui :
1. lit une source de signal très courte (ex. "earnings_beats"),
2. décide d’un ticker + direction (LONG/SHORT),
3. crée un pari papier vérifiable sur Investment Bets (https://investment-bets.com).

Pourquoi c’est utile (faits extraits du site) :
- exposition fixe 10 % par slot (comparabilité des retours) ;
- prix d’entrée/sortie enregistrés côté serveur (historique public vérifiable) ;
- artefacts API publiés (OpenAPI 3.1, llms.txt) pour intégration d’agents (https://investment-bets.com).

Bénéfice principal : un agent simple, audit‑able et partageable qui produit un track record public et vérifiable.

## Avant de commencer (temps, cout, prerequis)

Temps estimé : 60–120 minutes pour obtenir une exécution de bout en bout si vous maîtrisez Python ou JavaScript.

Coût : compte gratuit disponible sur https://investment-bets.com ; coûts additionnels possibles pour hébergement, logs et rotation de clés selon votre fournisseur cloud.

Prérequis techniques :
- notions HTTP/JSON et un langage (Python/Node.js) ;
- accès au compte API sur https://investment-bets.com ;
- environnement d’exécution (cron, scheduler, serveur léger).

Checklist pré‑départ :
- [ ] Compte créé sur https://investment-bets.com
- [ ] OpenAPI 3.1 + llms.txt récupérés et ajoutés au repo privé
- [ ] Clé API stockée dans un gestionnaire de secrets
- [ ] Table de décision courte (ex. ≤ 10 signaux) dans le dépôt

Exemple .env (config local) :

```bash
# .env local (exemple)
INVEST_BETS_API_KEY=sk_demo_xxx123
RUN_ONCE=true
API_BASE_URL=https://investment-bets.com
```

Exemple de table de décision (YAML) :

```yaml
signals:
  earnings_beats: LONG
  guidance_cut: SHORT
  neutral_news: SKIP
max_open_slots: 10
```

## Installation et implementation pas a pas

1) Récupérer les artefacts publics

- Télécharger la spécification OpenAPI 3.1 et llms.txt publiées par Investment Bets (https://investment-bets.com).

Exemple de commandes :

```bash
curl -sS https://investment-bets.com/openapi.json -o openapi.json
curl -sS https://investment-bets.com/llms.txt -o llms.txt
```

2) Obtenir et stocker la clé API

- Suivre la procédure du site (https://investment-bets.com). Ne pas committer la clé.

3) Ecrire un agent démo

- Restreindre la logique : une fonction qui prend un signal, mappe vers {ticker, direction}, effectue une prévalidation, puis appelle l’endpoint de création de pari décrit dans OpenAPI.
- Consigner run_id, requête/réponse, timestamp UTC et version de la table de décision.

4) Validation et audit

- Après création, vérifier la présence du pari sur le profil public (leaderboard) publié par la plateforme (https://investment-bets.com) et stocker la réponse serveur pour preuve.

Exemple minimal d’audit (YAML) :

```yaml
run_id: run_demo_001
bet_request:
  ticker: AAPL
  direction: LONG
response_status: 201
server_recorded: true
```

5) Déploiement progressif

- Garder le flag de mise en production OFF par défaut ; déployer canary et activer progressivement.

Ressource principale : OpenAPI 3.1 et llms.txt sur https://investment-bets.com.

## Problemes frequents et correctifs rapides

Référence publique : exposition par slot 10 %, prix côté serveur, et leaderboard (https://investment-bets.com).

| Problème observé | Cause possible | Correctif recommandé |
|---|---:|---|
| Pari absent du profil | délai de propagation ou erreur client | re‑poller le profil public, conserver la réponse API initiale |
| Erreur d’authentification | clé manquante/expirée | vérifier gestionnaire de secrets et headers HTTP |
| Symbole introuvable | saisie ou mapping incorrect | préflight de résolution du ticker avant création |

Règles opérationnelles rapides (à valider avant production via l’OpenAPI) :
- journaliser chaque run de façon immuable ;
- réduire la surface d’automatisation tant que les vérifications manuelles sont positives ;
- garder la table de décision dans le contrôle de versions privé.

## Premier cas d'usage pour une petite equipe

La plateforme publie OpenAPI 3.1 et llms.txt et propose un scoring par slot de 10 % (https://investment-bets.com). Pour un fondateur solo ou une petite équipe (1–3 personnes), voici des conseils concrets et actionnables :

1) Commencez en mode manuel et limité
- Exécutez le flux manuellement pendant quelques jours pour valider les mappings signal→ticker et vérifier que les paris apparaissent sur votre profil public (https://investment-bets.com).

2) Automatisation incrémentale
- Automatiser d’abord la prévalidation du ticker et la consignation auditable ; n’automatisez la création effective du pari qu’après 3 jours de tests manuels satisfaisants.

3) Garde‑fous simples et rapides à implémenter
- Ajouter un feature flag local ou un fichier de pause (halt) qui stoppe toute création en moins d’une minute ; conserver un bouton/endpoint d’arrêt accessible à l’équipe.

4) Processus léger de revue
- Toute modification de la table de décision doit passer par une PR et une relecture d’au moins 1 pair ; conserver la table ≤ 10 signaux pour garder la complexité faible.

5) Observabilité minimale
- Journaliser request/response et vérifier l’apparition publique du pari (profil/leaderboard) ; stocker ces logs en lecture seule pour 1 an.

Checklist pour fondateurs solo / petite équipe :
- [ ] Mode manuel validé (plusieurs runs manuels)
- [ ] Prévalidation ticker automatisée
- [ ] Feature flag + endpoint halt
- [ ] Table de décision ≤ 10 signaux et PR pour changements

Pour l’intégration, référez‑vous toujours aux artefacts publiés sur https://investment-bets.com.

## Notes techniques (optionnel)

Faits publiés : OpenAPI 3.1 et llms.txt sont disponibles publiquement sur https://investment-bets.com.

Bonnes pratiques techniques :
- générer un client typé depuis l’OpenAPI 3.1 pour réduire les erreurs ;
- limiter l’agent aux opérations décrites dans llms.txt/OpenAPI ;
- stocker les clés en vault et appliquer une rotation régulière.

Exemple minimal d’appel (pseudo‑bash) :

```bash
# Exemple simplifié d'appel POST (adapter avec openapi.json)
curl -X POST "https://investment-bets.com/api/bets" \
  -H "Authorization: Bearer $INVEST_BETS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"ticker":"AAPL","direction":"LONG"}'
```

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Confirmé par le site : slot fixe = 10 % et artefacts OpenAPI 3.1 + llms.txt publiés (https://investment-bets.com).
- Hypothèses opérationnelles recommandées (à valider contre OpenAPI avant production) :
  - 1 pari par exécution (MAX_BETS_PER_RUN = 1).
  - cadence de test initiale : 4 exécutions/jour (intervalle 6 h).
  - limite locale de slots ouverts : 10 (correspond au site pour slots concurrents).
  - canary initial : 5 % du trafic sur 48 h avant montée en charge.
  - timeout de polling pour vérification public : 60 s (12 tentatives × 5 s).
  - seuil d’erreur pour suspendre l’agent : 2 % sur 15 min.
  - alerte unresolved tickers si > 0.5 % sur 24 h.
  - conserver logs immuables pendant 365 jours ; rotation de clés recommandée tous les 90 jours.
  - taille cible du demo agent : < 300 lignes de code.

(Vérifiez les chemins, noms de champs et modèles d’authentification exacts dans openapi.json/llms.txt sur https://investment-bets.com.)

### Risques / mitigations

- Rafale de paris accidentelle → mitigation : feature flag OFF, MAX_BETS_PER_RUN = 1, kill‑switch, canary 5 % sur 48 h.
- Tickers non résolus → mitigation : préflight resolve + fallback list + alertes si taux unresolved dépassé.
- Instabilité API → mitigation : surveillance du taux d’erreur et suspension automatique si seuil atteint.
- Fuite de stratégie via profil public → mitigation : séparer code public/privé et ne pas publier la table sensible.

### Prochaines etapes

1. Créer un compte gratuit et télécharger OpenAPI + llms.txt depuis https://investment-bets.com.
2. Implémenter le demo agent (idéalement < 300 lignes) et lancer une exécution de test avec logs request/response.
3. Vérifier l’apparition du pari sur le profil public via polling (voir hypothèses ci‑dessus pour seuils recommandés).
4. Mettre en place monitoring minimal (taux d’erreur, unresolved tickers, délai sync leaderboard).
5. Déployer avec garde‑fous (feature flag, canary 5 % / 48 h) puis montée progressive.

Méthodologie : les faits de plateforme cités proviennent du snapshot public d’Investment Bets (https://investment-bets.com).
