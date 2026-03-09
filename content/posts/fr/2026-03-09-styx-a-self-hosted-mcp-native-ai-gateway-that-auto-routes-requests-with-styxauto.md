---
title: "Styx : passerelle AI auto‑routeuse auto‑hébergée (styx:auto) — guide pratique"
date: "2026-03-09"
excerpt: "Guide pratique pour auto‑héberger Styx, une passerelle AI « MCP‑native » qui route automatiquement (styx:auto) les requêtes vers plusieurs fournisseurs. Installation, tests de routage et conseils pour un POC rapide."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-09-styx-a-self-hosted-mcp-native-ai-gateway-that-auto-routes-requests-with-styxauto.jpg"
region: "FR"
category: "Tutorials"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 30
editorialTemplate: "TUTORIAL"
tags:
  - "styx"
  - "self-hosted"
  - "AI-gateway"
  - "MCP"
  - "routage"
  - "open-source"
  - "POC"
  - "devops"
sources:
  - "https://github.com/timmx7/styx"
---

## TL;DR en langage simple

- Styx se présente sur GitHub comme « MCP‑Native AI Gateway » : une passerelle auto‑hébergée qui reçoit les requêtes de votre application et les achemine vers n'importe quel fournisseur via un unique endpoint. (source: https://github.com/timmx7/styx)
- Fonctionnalités revendiquées publiquement : « intelligent auto‑routing » et support de « 65+ models ». (source: https://github.com/timmx7/styx)
- Bénéfices concrets : 1 URL à appeler depuis l'application, moins de SDK à intégrer, et une couche centrale de routage et de règles. (source: https://github.com/timmx7/styx)
- Action rapide : cloner le dépôt et lancer un POC (proof of concept, preuve de concept) local en ~30–60 minutes pour valider le routage et les règles.

Exemple court : vous avez un chatbot interne. L'application envoie toutes les requêtes à Styx (1 endpoint). Une règle simple redirige les prompts courts vers un modèle low‑cost et les prompts contenant du code vers un modèle haute qualité. Vous testez 20 requêtes et vérifiez latence et coût.

Plain‑language avant les détails avancés : Styx agit comme un répartiteur. Votre application n'a qu'une seule adresse à appeler. Styx décide, selon des règles que vous définissez, quel fournisseur ou quel modèle doit traiter chaque requête. Vous gardez les clés API chez vous et vous payez les fournisseurs comme d'habitude.

## Ce que vous allez construire et pourquoi c'est utile

Plain‑language : vous allez déployer une passerelle AI auto‑hébergée. Cette passerelle reçoit des requêtes depuis votre application et les route vers le fournisseur choisi selon des règles simples (longueur de prompt, mots‑clés, type de contenu, etc.). Le dépôt public décrit Styx comme un point d'entrée universel capable d'auto‑routing vers de nombreux modèles (65+ selon la page). (source: https://github.com/timmx7/styx)

Pourquoi c'est utile :
- Centraliser l'intégration : votre code n'appelle qu'un seul endpoint. Moins de SDK et moins de logique de sélection côté application. (source: https://github.com/timmx7/styx)
- Changer de fournisseur par configuration : vous modifiez une table de décision au lieu de refactoriser l'application.
- Contrôler coût et qualité : vous pouvez écrire des règles (par ex. <128 tokens → modèle low‑cost) pour économiser de l'argent ou prioriser la qualité.

Ce que vous produirez :
- Un POC local (recommandé : 2 CPU / 2 GB RAM) avec 2 fournisseurs configurés.
- Une table de décision JSON ou YAML simple pour le routage.

Référence principale : https://github.com/timmx7/styx

## Avant de commencer (temps, cout, prerequis)

Estimations temporelles (indicatives) :
- 5 minutes : cloner le dépôt et lister les fichiers.
- 30–60 minutes : monter un POC local basique et envoyer des requêtes.
- 2–8 heures : durcir la configuration, ajouter monitoring et CI pour un staging.

Coûts : le code est open‑source ; vous payez uniquement les appels aux fournisseurs (coûts variables selon les fournisseurs). (source: https://github.com/timmx7/styx)

Prérequis matériels et accès :
- Machine de dev recommandée : minimum 2 CPU, 2 GB RAM.
- Accès réseau sortant vers les APIs des fournisseurs.
- Git et Docker / docker compose (ou équivalent) installés.
- Emplacement sécurisé pour stocker clés API (gestionnaire de secrets recommandé).

Checklist avant démarrage :
- [ ] Cloner : https://github.com/timmx7/styx
- [ ] Préparer au moins 2 clés API fournisseurs
- [ ] Machine de test (min. 2 CPU / 2 GB RAM)

Notes sur les termes : MCP est le terme utilisé dans le dépôt (MCP‑Native). POC = proof of concept (preuve de concept). p95 = temps de latence au 95e percentile.

## Installation et implementation pas a pas

Important : vérifiez toujours le README du dépôt officiel pour les instructions exactes : https://github.com/timmx7/styx

1) Cloner le dépôt

```bash
git clone https://github.com/timmx7/styx
cd styx
ls -la
# Ouvrir README.md pour les instructions précises et les variables d'environnement
```

2) Exemple de fichier .env (illustratif)

```env
# Exemples illustratifs — vérifier les variables réelles dans le repo
STYX_ADMIN_KEY=example_admin_key
PROVIDER_KEY_OPENAI=sk-xxxx
PROVIDER_KEY_OTHER=pk-xxxx
```

Explication : placez vos clés API dans un fichier .env local ou utilisez un gestionnaire de secrets. Ne commitez jamais ces clés.

3) Démarrage local (exemple hypothétique)

```bash
docker compose up --build -d
docker compose logs -f
```

Explication : ces commandes compilent et démarrent les conteneurs. Surveillez les logs pour vérifier l'initialisation et les erreurs.

4) Déployer la table de décision JSON/YAML et configurer 2 fournisseurs. Tester avec ~10 requêtes initiales pour valider le routage.

5) Stratégie de montée en charge (canary) :
- Canary 1 : 10% du trafic durant 24 h ; gates : p95 < 1 000 ms, taux d'erreur < 0,5%, coût delta < $5/jour.
- Canary 2 : 50% du trafic ; gate : p95 < 1 000 ms, variance coûts < 20%.
- Full : 100% après validations (p.ex. 48 h au total).

Consultez le dépôt pour les commandes exactes et l'API d'administration : https://github.com/timmx7/styx

## Problemes frequents et correctifs rapides

(Basé sur scénarios opérationnels courants ; vérifiez toujours les logs et la doc du dépôt : https://github.com/timmx7/styx)

- Le conteneur ne démarre pas :
  - Vérifiez que le daemon Docker est actif et qu'aucun port n'est en conflit.
  - Consultez les logs : docker compose logs.
  - Confirmez que .env contient les variables requises.

- La passerelle ne contacte pas l'API fournisseur :
  - Vérifiez l'accès réseau sortant et les règles de firewall.
  - Vérifiez les clés API, quotas et limites de rate du fournisseur.

- Routage vers un modèle trop coûteux :
  - Ajoutez des règles basées sur tokens (ex. <128 tokens) ou sur mots‑clés.
  - Déployez en canary 10% avant forte montée en charge.

- Secrets committés dans la CI :
  - Utilisez un gestionnaire de secrets et scannez la pipeline pour détecter les fuites.

Seuils/métriques recommandés :
- p95 latency : alerter si > 1 000 ms.
- Taux d'erreur : alerter si > 0,5%.
- Usage tokens : alerter à 100k tokens/jour, escalade à 1M tokens/jour.
- Coûts : alerte si delta journalier > $5 en canary, > $50 en production, cap d'urgence $200/jour pour tests.

Source d'orientation : https://github.com/timmx7/styx

## Premier cas d'usage pour une petite equipe

Contexte ciblé : solo founder ou équipe de 2–3 personnes qui veut lancer rapidement un chatbot ou un assistant interne, tout en contrôlant coût et complexité. (Référence : positionnement public du projet : https://github.com/timmx7/styx)

3 actions concrètes et immédiates :

1) Minimiser la surface d'intégration (30–90 minutes)
- Démarrez avec 1 endpoint unique lié à la passerelle. Configurez un provider principal et un provider de fallback (2 fournisseurs au total).
- Testez 10–20 requêtes manuelles pour vérifier routage et latence.

2) Prioriser le contrôle des coûts (15–45 minutes)
- Règle simple : prompts <128 tokens → modèle low‑cost ; prompts contenant code → modèle high‑quality.
- Imposer un quota initial : 100k tokens/jour en dev; escalade à 1M tokens/jour si OK.
- Mettre un cap d'urgence à $200/jour et alertes journalières à $50.

3) Automatiser les opérations minimales (1–3 heures)
- Stocker clés dans un gestionnaire de secrets et activer rotation tous les 30–90 jours.
- Ajouter monitoring basique : p95, taux d'erreur, tokens (alerte si p95 > 1 000 ms ou taux d'erreur > 0,5%).
- Déployer en canary 10% pendant 24 h avant d'augmenter à 50% puis 100%.

Checklist courte pour un solo founder :
- [ ] POC local avec 2 fournisseurs (min. 2 CPU / 2 GB RAM)
- [ ] Règles cost/quality appliquées (<128 tokens, détection code)
- [ ] Dashboards p95, taux d'erreur, tokens et alertes configurés

Exemple de table de décision (illustrative) :

| Type de prompt | Signal | Tier préféré | Split initial |
|---|---:|---|---:|
| FAQ courte | longueur < 128 tokens | low‑cost | 100% |
| Code / Dev | contient bloc de code | high‑quality | 100% |
| Par défaut | fallback | auto | 10% low‑cost / 90% high‑quality |

Si vous voulez, je peux générer un docker‑compose override et une config JSON/YAML de routage selon vos fournisseurs cibles.

## Notes techniques (optionnel)

- Positionnement public du projet : « MCP‑Native AI Gateway », « intelligent auto‑routing », « 65+ models ». (source: https://github.com/timmx7/styx)
- Recommandations d'instrumentation : p95 < 1 000 ms, taux d'erreur < 0,5%, alertes tokens à 100k / 1M.
- Pattern utile : fallback automatique si un fournisseur dépasse p95 ou a un taux d'erreur élevé.

Méthode : résumé basé sur l'extrait public du dépôt ; commandes et variables sont des exemples. Vérifiez le repo pour les noms exacts et les variables d'environnement.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse confirmée par le dépôt : positionnement public et fonctionnalités déclarées ("MCP‑Native", "intelligent auto‑routing", "65+ models"). (source: https://github.com/timmx7/styx)
- Inconnues opérationnelles à vérifier dans le repo : noms exacts des variables d'environnement, fichiers docker compose, et API d'administration.

### Risques / mitigations

- Risque : fuite de secrets. Mitigation : gestionnaire de secrets, rotation 30–90 jours, accès admin restreint.
- Risque : dépenses élevées. Mitigation : canary 10%, alertes journalières ($50), cap d'urgence $200/jour.
- Risque : latence élevée. Mitigation : fallback vers modèle low‑latency, probes santé (health checks), autoscaling.
- Risque : point de défaillance unique (SPOF). Mitigation : plusieurs instances + load balancer.

### Prochaines etapes

1. Cloner et inspecter le dépôt officiel : https://github.com/timmx7/styx (≈5 minutes).
2. Provisionner un hôte test (min. 2 CPU, 2 GB RAM recommandé) et un coffre pour secrets.
3. Lancer un POC local (30–60 minutes) ; tester ~10–20 requêtes et valider la table de décision.
4. Configurer monitoring p95, taux d'erreur et tokens ; définir alertes sur seuils listés.
5. Canary 10% pendant ≥24 h, puis 50% (≈48 h), puis 100% si p95 < 1 000 ms et taux d'erreur < 0,5%.

Exemple JSON de routage (illustratif) :

```json
{
  "rules": [
    {"match": {"max_tokens": 128}, "route": "low_cost"},
    {"match": {"contains_code": true}, "route": "high_quality"}
  ],
  "fallback": "low_cost"
}
```

Pour avancer : indiquez vos 2 fournisseurs cibles, vos objectifs p95 (ms) et budget ($/jour). Je fournis ensuite un docker‑compose override et la config JSON/YAML adaptés.
