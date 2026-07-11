---
title: "Reproduire et étendre brendenehlers/diplomacy-ai : exécutions rapides et reproductibles d'agents Diplomacy avec collecte d'artéfacts"
date: "2026-07-11"
excerpt: "Guide pas à pas (contexte Royaume‑Uni) pour cloner et exécuter les démos de brendenehlers/diplomacy-ai, sauvegarder des logs reproductibles, collecter les historiques de coups et comparer des configurations d'agents."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-11-reproduce-and-extend-brendenehlersdiplomacy-ai-quick-reproducible-diplomacy-agent-runs-and-artifact-collection.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "reproductibilité"
  - "Python"
  - "agents"
  - "diplomacy"
  - "développement"
  - "petite-équipe"
sources:
  - "https://github.com/brendenehlers/diplomacy-ai"
---

## TL;DR en langage simple

Objectif rapide : cloner le dépôt, lancer une démonstration locale et produire des artefacts (logs, seed, config) pour analyser comment des agents IA jouent à Diplomacy. Le dépôt se présente comme un bac à sable expérimental pour explorer « à quoi ressemblerait une partie de Diplomacy jouée par des agents IA » (https://github.com/brendenehlers/diplomacy-ai).

Actions immédiates (3–15 minutes chacune) :
- Cloner le dépôt et lire le README sur https://github.com/brendenehlers/diplomacy-ai.
- Isoler l'environnement Python (.venv) et noter python --version et pip list.
- Lancer 1 run canari (1 exécution) et sauvegarder logs/run-<timestamp>.json et la seed (ex. 42).

Checklist minimal :
- [ ] git clone https://github.com/brendenehlers/diplomacy-ai
- [ ] créer un environnement isolé et noter python --version
- [ ] exécuter 1 démonstration et sauvegarder la sortie dans logs/
- [ ] enregistrer la seed (ex. 42) et pip freeze > env.txt

Exemples de commandes rapides :

```bash
git clone https://github.com/brendenehlers/diplomacy-ai
cd diplomacy-ai
ls -la
```

Méthodologie courte : démarrer par 1 canari, capturer artefacts, then scale par batchs de 10 runs pour baseline.

## Ce que vous allez construire et pourquoi c'est utile

Résultat attendu localement après un run reproductible (description du dépôt : https://github.com/brendenehlers/diplomacy-ai) :
- Artefact horodaté par run (JSON/CSV) contenant logs et événements ;
- Historique des mouvements et échanges exploitable pour analyse ;
- Métriques simples : nombre de victoires (count), latence par décision (ms), nombre de messages de négociation.

Utilité pratique :
- Bac à sable pour comparer variables (prompt, policy, nombre d'agents) ;
- Baseline statistique avant changements (ex. 10 runs vs 10 runs) ;
- Artefacts persistants pour audits et debugging.

Tableau d'exemple pour comparer deux configurations (baseline vs expérience) :

| Métrique | Baseline (10 runs) | Expérience (10 runs) |
|---|---:|---:|
| Parties exécutées | 10 | 10 |
| Taux de victoire (%) | 30% | 45% |
| Moyenne messages de négociation | 7 | 9 |
| Latence médiane par décision (ms) | 180 | 220 |

Source de contexte : https://github.com/brendenehlers/diplomacy-ai

## Avant de commencer (temps, cout, prerequis)

Prérequis essentiels : accès réseau pour cloner https://github.com/brendenehlers/diplomacy-ai, connaissance basique CLI et Python, capacité à créer un virtualenv.

Estimations de temps (ordre de grandeur) :
- Smoke test local (1 canari) : 5–15 minutes ;
- Suite courte (10 matches) : 30–120 minutes selon CPU/IO ;
- Préparation pour 1–3 personnes : ~60 minutes pour config + premiers runs.

Seuils et budget indicatifs :
- Concurrency cible initiale : 1–2 (max 4) ;
- RAM cible pendant runs : < 80% ;
- Latence visée par décision : ≈ 200 ms ;
- Runs pour baseline statistique : ≥ 10 ;
- Plafond budgétaire LLM d'essai : £8–£100 ; alerte à 80% du plafond (ex. £50).

Remarques : toutes les étapes commencent par inspecter le README du projet (https://github.com/brendenehlers/diplomacy-ai) pour identifier entrypoints et fichiers fournis.

## Installation et implementation pas a pas

1) Cloner et inspecter le dépôt

```bash
git clone https://github.com/brendenehlers/diplomacy-ai
cd diplomacy-ai
ls -la
# lire README.md sur https://github.com/brendenehlers/diplomacy-ai
```

2) Créer un environnement Python isolé et installer dépendances (si le dépôt fournit requirements/pyproject)

```bash
python3 -m venv .venv    # crée 1 environnement isolé
source .venv/bin/activate
python --version         # noter version
pip install --upgrade pip
# si requirements.txt existe : pip install -r requirements.txt
```

3) Lancer 1 démonstration canari et conserver la sortie

```bash
mkdir -p logs
# adapter l'entrypoint selon README ; exemple générique :
python run_demo.py --output logs/run-$(date +%s).json || echo "Adapter le script selon README"
```

4) Exemple de configuration minimale (à placer en .gitignored)

```yaml
# config_example.yaml
seed: 42
concurrency: 1
agents_count: 7
llm_budget_gbp: 50
```

Bonnes pratiques par run : noter seed (ex. 42), pip freeze > env.txt, enregistrer timestamp et la configuration complète utilisée.

Source et contexte : https://github.com/brendenehlers/diplomacy-ai

## Problemes frequents et correctifs rapides

Consultez d'abord le README du dépôt (https://github.com/brendenehlers/diplomacy-ai). Cas fréquents et actions :

- Dépendances manquantes ou mauvaise version Python : recréez .venv, réinstallez, vérifiez python --version ; viser compatibilité avec la version notée.
- Entrypoint non évident : chercher README, examples/ ou scripts run_*. Si introuvable, ouvrir une issue upstream.
- Exécutions lentes ou RAM élevée : réduire concurrency (p.ex. de 4 → 1), limiter batch_size ≤ 50, viser RAM < 80%.
- Coûts API LLM : mocker policies locales en CI, limiter appels et définir plafond (ex. £50) ; surveiller tokens (ex. 50k tokens max en test).
- Sorties manquantes : augmenter verbosity logs et relancer 1–3 runs debug.

Seuils d'alerte rapides : RAM > 80% → réduire charge ; latence par décision > 200 ms → activer cache ou baisser concurrency ; variance métriques > 10% → pinner la seed et relancer ≥ 10 matches.

Source de référence : https://github.com/brendenehlers/diplomacy-ai

## Premier cas d'usage pour une petite equipe

Plan concret et actionnable pour 1–3 personnes (source : https://github.com/brendenehlers/diplomacy-ai) :

1) Priorité 1 — Run minimal reproductible (30–60 minutes)
- Cloner le repo, lire README et identifier l'entrypoint ; lancer 1 démonstration canari (1 run) et noter seed (ex. 42).
- Capturer artefacts : logs/, run-<timestamp>.json, env.txt (pip freeze), et la config utilisée.
- Documenter le run dans README-CHECKLIST.md (versions, seed, timestamp).

2) Priorité 2 — Baseline batch courte (1–2 heures)
- Lancer 10 matches avec une policy locale/mock pour établir baseline (run_count = 10).
- Collecter métriques : win_count, negotiation_count, latence médiane (ms). Cible : variance ≤ 10% avant conclusions.

3) Priorité 3 — Automatisation légère et garde‑budget (30–90 minutes)
- Ajouter un job CI smoke qui exécute 1 match mock (durée cible < 5 minutes) et vérifie création des artefacts.
- Définir un seuil d'arrêt budgétaire pour API LLM (ex. £50) et une alerte à 80% du plafond.
- Démarrer avec concurrency = 1–2, batchs ≤ 50 runs pour éviter saturation mémoire.

Conseils pratiques pour solo / petite équipe (au moins 3 points actionnables) :
- Point A : Toujours pinner la seed (ex. 42) et noter python --version et pip freeze > env.txt pour reproductibilité.
- Point B : Prioriser mocks locaux pour les premiers 10 runs (réduire coûts et variabilité) ; n'activer LLM que pour tests ciblés.
- Point C : Automatiser 1 smoke CI (durée < 5 minutes) pour empêcher régressions et gagner 5–15 minutes par merge.

Source : https://github.com/brendenehlers/diplomacy-ai

## Notes techniques (optionnel)

- Intent du dépôt : bac à sable exploratoire pour parties de Diplomacy par agents IA (https://github.com/brendenehlers/diplomacy-ai).
- Reproductibilité : journaliser seed (ex. 42), python --version, pip freeze et config par run est recommandé.
- Indicateurs opérationnels utiles : run_count 10, canary 1, batch ≈ 50, RAM cible < 80%, latence cible ≈ 200 ms.
- Coûts LLM : surveiller tokens et définir un plafond (ex. 50k tokens) avant tests à grande échelle.

Méthode courte : canari → baseline 10 runs → itérer sur une variable à la fois.

Source : https://github.com/brendenehlers/diplomacy-ai

## Que faire ensuite (checklist production)

- [ ] Ajouter README‑CHECKLIST.md dans votre fork avec commandes exactes et exemples de run (seed, versions, pip freeze). (voir https://github.com/brendenehlers/diplomacy-ai)
- [ ] Créer un test CI smoke qui exécute 1 match mock et vérifie artefacts (logs/, move-history).
- [ ] Exécuter ≥ 10 matches pour obtenir une baseline et produire un tableau comparatif.
- [ ] Si vous utilisez des APIs LLM, configurer suivi des tokens et plafond budgétaire avant > 50 runs.

### Hypotheses / inconnues

- Hypothèse : le dépôt a un README expliquant l'objectif et quelques exemples — la description publique indique bien le but expérimental (https://github.com/brendenehlers/diplomacy-ai).
- Hypothèse : noms de fichiers utilisés dans les exemples (requirements.txt, run_demo.py) sont illustratifs ; adaptez selon les fichiers réellement fournis.
- Hypothèse : la topologie exacte des scripts et options CLI peut varier ; vérifiez le README et les exemples du dépôt.

### Risques / mitigations

- Risque : coûts d'API LLM inattendus. Mitigation : mocker en CI, fixer plafond (ex. £50–£100), alerter à 80%.
- Risque : non‑déterminisme des runs. Mitigation : pinner seed (ex. 42) et exécuter ≥ 10 matches pour moyenne.
- Risque : saturation mémoire. Mitigation : canari (1 run), limiter concurrency à 1–4, viser RAM < 80%.
- Risque : absence d'entrypoint clair. Mitigation : inspecter README et examples/ puis ouvrir issue upstream.

### Prochaines etapes

1. Forkez https://github.com/brendenehlers/diplomacy-ai et ajoutez README‑CHECKLIST.md.
2. Implémentez un test CI qui lance 1 match mock (durée cible < 5 minutes) et vérifie artefacts.
3. Exécuter 10 runs pour obtenir une baseline et produire un tableau comparatif.
4. Si vous utilisez des LLM externes : configurer suivi des tokens et un plafond budgétaire avant d'exécuter > 50 runs.
