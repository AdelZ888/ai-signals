---
title: "Prototype local NAEOS : cloner, configurer et exécuter un agent de codage IA (UK)"
date: "2026-08-22"
excerpt: "Guide pas à pas pour cloner NAEOS, connecter une clé d'API modèle, lancer un exemple en mode dry-run et obtenir un prototype d'agent reproductible — conçu pour fondateurs solo, petites équipes et développeurs."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-22-naeos-local-prototype-clone-configure-and-run-an-ai-coding-agent-example.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "NAEOS"
  - "prototype"
  - "agents"
  - "open-source"
  - "IA"
  - "développement"
sources:
  - "https://github.com/NAEOS-foundation/naeos"
---

## TL;DR en langage simple

- Le dépôt open-source NAEOS est sur GitHub : https://github.com/NAEOS-foundation/naeos. Le snapshot public montre 441 commits, 11 étoiles, 6 forks et 5 issues.
- Objectif rapide : cloner le repo, lancer un exemple local, et vérifier qu'un agent peut appeler un modèle en utilisant une clé fournie via la variable d'environnement MODEL_API_KEY. (API = interface de programmation d'applications.)
- Déroulé minimal : cloner (1 commande), installer dépendances (≈30–60 min), définir MODEL_API_KEY, faire un dry-run, vérifier les logs.

Exemple concret : vous clonez le repo, exportez MODEL_API_KEY et lancez le script d'exemple. Vous obtenez un log qui montre si l'agent a produit un draft de pull request (PR = pull request / demande de tirage) ou non.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez obtenir un prototype local basé sur le code de https://github.com/NAEOS-foundation/naeos. Le but est de prouver le flux « issue → ébauche de PR » tout en gardant l'humain dans la boucle.

Sorties attendues immédiatement :
- un log reproductible par test (fichier texte ou JSON),
- un fichier de configuration minimal (YAML/JSON) qui lit MODEL_API_KEY depuis l'environnement.

Bénéfices concrets :
- gain de temps pour tâches répétitives (p. ex. ébauche de PR),
- mesures simples à suivre : latence médiane (p50), latence 95e centile (p95) et taux d'erreur, plus taux d'acceptation humaine.

Pour référence et code source : https://github.com/NAEOS-foundation/naeos

### Explication simple

Avant les détails techniques : vous téléchargez le code, installez les dépendances, fournissez une clé d'API (MODEL_API_KEY) et lancez le script d'exemple. Le prototype ne change rien sur GitHub si vous activez le mode dry_run. Cela vous permet de tester la logique sans publier de PR.

(Notes sur les sigles : SLI = Service Level Indicator, indicateur de niveau de service. CI = intégration continue.)

## Avant de commencer (temps, cout, prerequis)

- Temps attendu pour un premier run : 90–150 minutes (1,5–2,5 heures).
- Coût d'itération léger : 5–50 USD par jour d'essai.
- Prérequis : Git, accès Internet, shell, et une clé API fournie via MODEL_API_KEY.
- Environnements recommandés : un environnement virtuel Python (venv) ou Node selon le runtime détecté dans le repo.

Vérifications rapides :
- [ ] Git installé
- [ ] Dépôt cloné : git clone https://github.com/NAEOS-foundation/naeos
- [ ] MODEL_API_KEY défini dans le shell
- [ ] Budget prototype fixé (ex. 5–50 USD)

Checks minimales en local : git clone doit réussir et le dossier doit contenir un README et/ou un dossier examples (vérifier sur https://github.com/NAEOS-foundation/naeos).

## Installation et implementation pas a pas

1) Cloner le dépôt et lister les fichiers :

```bash
# cloner le repo public
git clone https://github.com/NAEOS-foundation/naeos
cd naeos
ls -la | head -n 50
```

2) Lire le README pour repérer le script d'exemple (README dans le repo : https://github.com/NAEOS-foundation/naeos).

3) Installer dépendances (exemples) :

```bash
# Python : créer venv et installer
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Node : si package.json existe
# npm install
```

4) Créer une configuration minimale (ne pas committer les secrets) :

```yaml
# example-agent-config.yml
agent:
  name: naeos-prototype
  max_retries: 3
  canary_percent: 1
model:
  provider: example
  api_key_env: MODEL_API_KEY
  max_tokens: 2048
  timeout_ms: 2000
integrations:
  github:
    dry_run: true
```

5) Lancer un smoke test (remplacez par la commande exacte du README) :

```bash
export MODEL_API_KEY="sk-xxxx"
# exemple générique, remplacer par le runner du repo
./run_example.sh --config example-agent-config.yml
```

6) Itérer : commencez par canary 1 %, puis 10 % sur 7 jours avant 100 % si les SLI (indicateurs de niveau de service) sont satisfaisants. Voir le dépôt pour exemples : https://github.com/NAEOS-foundation/naeos.

Conseils pratiques : gardez dry_run = true tant que vous n'avez pas validé la qualité des drafts. Limitez max_tokens et la concurrence pour contrôler les coûts.

## Problemes frequents et correctifs rapides

(Référence : https://github.com/NAEOS-foundation/naeos)

- Erreur d'installation / dépendances : recréez l'environnement, vérifiez Python ≥ 3.8 ou Node ≥ 14, installez requirements.txt / package.json.
- Clé API manquante : export MODEL_API_KEY="sk-..." ; vérifiez que la variable n'est pas committée.
- Limites de taux : réduisez la concurrence à 1–2 appels simultanés et ajoutez un backoff ; définissez max_retries: 3.
- Sorties inattendues : activez les logs DEBUG, lancez 10–20 runs locaux et analysez les premiers logs.

Seuils indicatifs à surveiller :
- erreur > 2 % → alerte ;
- latence médiane (p50) > 2000 ms → enquête ;
- p95 > 5000 ms → investigation.

## Premier cas d'usage pour une petite equipe

Dépôt pertinent : https://github.com/NAEOS-foundation/naeos

Contexte cible : fondateur solo ou équipe de 1–3 personnes qui veut générer des drafts de PR depuis des issues, tout en gardant le contrôle humain.

3+ actions concrètes pour une petite équipe :

1) Commencer en local et en dry-run
   - Activez integrations.github.dry_run = true dans la config.
   - Exécutez 10–20 exemples locaux et conservez chaque log.

2) Contrôler coûts et tokens
   - Fixez max_tokens entre 512–2048 selon la longueur attendue.
   - Plafonnement journalier : commencer à 5–10 USD par jour pour tests.
   - Concurrence : 1–2 appels simultanés au démarrage.

3) Processus d'acceptation humaine
   - Demandez approbation manuelle pour les 100 premiers drafts.
   - Visez un taux d'acceptation ≥ 70 % avant d'élargir l'automatisation.
   - Capturez et classez les rejets (au moins 50 exemples) pour affiner les prompts.

4) Déploiement progressif
   - Canary initial à 1 % ; si les SLIs (indicateurs) sont bons, passer à 10 % pendant 7 jours ; puis 100 %.

Tableau décisionnel simple :

| Type d'issue       | Automatisation        | Revue requise | Seuil d'acceptation visé |
|--------------------|-----------------------|---------------|--------------------------|
| Documentation      | Draft complet         | Optionnelle   | 95%                      |
| Bug mineur         | Draft + édition       | Requise       | 70%                      |
| Changement critique| Suggestion seulement  | Requise       | N/A                      |

Checklist rapide pour petite équipe :
- [ ] Exécuter 10–20 exemples locaux et sauvegarder les logs
- [ ] Garder dry_run = true pour les 100 premiers drafts
- [ ] Fixer max_tokens et plafond journalier (ex. 5–10 USD)
- [ ] Surveiller latence (p50/p95), error-rate (%) et human-acceptance (%)

## Notes techniques (optionnel)

- Métadonnées vérifiables du repo : 441 commits, 11 étoiles, 6 forks, 5 issues (source : https://github.com/NAEOS-foundation/naeos).
- Variables d'environnement : utilisez MODEL_API_KEY et ne commitez jamais .env dans le repo.

Exemple .env local (ne pas committer) :

```bash
# .env local
MODEL_API_KEY=sk-xxxx
```

Tests recommandés : 5–10 tests unitaires pour prompts et 3 tests d'intégration pour appels externes. Mesures à capturer : p50 (médiane), p95 (95e centile, valeur que 95 % des requêtes atteignent ou sont en dessous), taux d'erreur (%) et taux d'acceptation humaine (%).

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Le dépôt à https://github.com/NAEOS-foundation/naeos contient du code et des exemples réutilisables. Si le repo n'inclut pas de runner, il faudra écrire un script d'exécution (hypothèse).
- Estimations pratiques : 90–150 minutes, coût 5–50 USD pour itérations légères, volume d'essai 10–20 runs, contrôle humain sur 100 premiers drafts.

### Risques / mitigations

- Fuite de crédentiels : mitigation — variables d'environnement, coffre (Vault), rotation régulière des clés.
- Dépenses imprévues : mitigation — plafonds journaliers (ex. 5–10 USD), limite max_tokens (512–2048) et réduction de la concurrence (1–2 concurrents).
- Qualité insuffisante : mitigation — garder dry_run, exiger revue humaine, collecter rejets pour itération.
- Dépendance fournisseur : mitigation — abstraire la couche provider (api_key_env) et prévoir un fallback local si possible.

### Prochaines etapes

- Sécuriser les secrets : migrer MODEL_API_KEY vers un gestionnaire de secrets et retirer .env du repo.
- Ajouter tests : au moins 5 tests unitaires et 3 tests d'intégration ; exiger passage CI avant automation.
- Observabilité : installer dashboards pour p50, p95 (ms), error-rate (%) et human-acceptance (%) ; alertes si erreur > 2 % ou p50 > 2000 ms.
- Déployer par paliers : Canary 1 % → Ramp 10 % pendant 7 jours → 100 % si les SLIs sont respectés ; prévoir rollback si erreurs dépassent seuils.

Rappels utiles :

```bash
git clone https://github.com/NAEOS-foundation/naeos
cd naeos
ls -la
```

Configuration d'exemple (rappel) :

```yaml
agent:
  name: naeos-prototype
  max_retries: 3
  canary_percent: 1
model:
  provider: example
  api_key_env: MODEL_API_KEY
  max_tokens: 2048
  timeout_ms: 2000
integrations:
  github:
    dry_run: true
```

Pour vérifier le code source et les métadonnées : https://github.com/NAEOS-foundation/naeos

Bonne expérimentation — commencez petit, vérifiez chaque étape, puis montez en charge de façon contrôlée.
