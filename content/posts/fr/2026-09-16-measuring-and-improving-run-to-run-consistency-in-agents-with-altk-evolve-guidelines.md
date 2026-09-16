---
title: "Mesurer et améliorer la cohérence run-to-run des agents avec les guidelines ALTK‑Evolve"
date: "2026-09-16"
excerpt: "Pipeline pratique pour mesurer la cohérence run-to-run (R=5), journaliser les trajectoires complètes et injecter de courtes guidelines ALTK‑Evolve à l'inférence pour réduire les « flips »."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-16-measuring-and-improving-run-to-run-consistency-in-agents-with-altk-evolve-guidelines.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "agents"
  - "fiabilité"
  - "ALTK‑Evolve"
  - "HuggingFace"
  - "consistency"
  - "développement"
sources:
  - "https://huggingface.co/blog/ibm-research/altk-evolve-consistency"
---

## TL;DR en langage simple

- Problème : un agent basé sur un modèle peut réussir une tâche une fois puis la rater à la répétition suivante, créant une instabilité « run-to-run ». Voir l'étude : https://huggingface.co/blog/ibm-research/altk-evolve-consistency
- Chiffres-clés rapportés : average_success = 77,4 %, per_task_all_run_success = 53,0 %, consistency_gap = 24,4 points; répétitions utilisées R = 5. Source : https://huggingface.co/blog/ibm-research/altk-evolve-consistency
- Approche proposée : ré-exécuter chaque tâche R fois, conserver les trajectoires gagnantes, distiller de courtes « consistency guidelines » et les injecter à l'inférence derrière un toggle pour un canary. Source : https://huggingface.co/blog/ibm-research/altk-evolve-consistency

Explication rapide : la moyenne masque les flips. Mesurez la cohérence run-to-run (fraction de tâches réussies sur toutes les répétitions), diagnostiquez les différences de trajectoire, puis injectez de petites directives extraites des trajectoires gagnantes pour stabiliser le comportement sans réentraînement. Voir : https://huggingface.co/blog/ibm-research/altk-evolve-consistency

Méthodologie (note brève) : privilégiez R = 5 pour la baseline comme dans l'étude, puis étendez si nécessaire. https://huggingface.co/blog/ibm-research/altk-evolve-consistency

## Ce que vous allez construire et pourquoi c'est utile

Vous allez construire une pipeline légère qui :

1. exécute chaque tâche R = 5 fois et journalise les trajectoires complètes (prompts, décisions du planificateur, appels d'outils) ;
2. identifie les tâches qui « flipent » (au moins une réussite et une échec) ;
3. distille des petites directives (guidelines) à partir des trajectoires gagnantes et les injecte à l'inférence via un feature flag pour un canary ;
4. mesure l'impact sur average_success et per_task_all_run_success, et calcule la consistency_gap. Source : https://huggingface.co/blog/ibm-research/altk-evolve-consistency

Pourquoi utile : l'étude montre que l'average_success (77,4 %) peut cacher qu'une tâche n'a été correcte sur toutes les exécutions que pour 53,0 % des tâches (consistency_gap = 24,4 points). Injecter des guidelines distillées réduit cette variabilité sans réentraîner le modèle. https://huggingface.co/blog/ibm-research/altk-evolve-consistency

## Avant de commencer (temps, cout, prerequis)

Prérequis techniques minimaux :

- Accès aux logs de trajectoire : prompt complet, état du planificateur, tool calls, label success (0/1). https://huggingface.co/blog/ibm-research/altk-evolve-consistency
- Capacité d'injecter un bundle de guidelines au moment de l'inférence (préfixe d'instruction ou contexte) via un toggle/feature flag. https://huggingface.co/blog/ibm-research/altk-evolve-consistency
- Compétences scripts : bash, Python ou notebook pour orchestrer répétitions et calculs de métriques.

Temps estimé : prototype en quelques heures si la journalisation existe, sinon quelques jours pour ajouter l'instrumentation. https://huggingface.co/blog/ibm-research/altk-evolve-consistency

Checklist d'avant-démarrage :

- [ ] Permission de capturer les trajectoires complètes.
- [ ] Toggle / feature flag prêt pour l'injection.
- [ ] Script ou notebook pour calculer average_success et per_task_all_run_success.

## Installation et implementation pas a pas

1) Mesurer la baseline

- Sélectionnez un jeu représentatif de tâches.
- Exécutez chaque tâche R = 5 fois et journalisez task_id, run_id, prompt, plan_state, tool_calls, success (0/1). Voir : https://huggingface.co/blog/ibm-research/altk-evolve-consistency

2) Calculer les métriques

- average_success = moyenne des succès sur tous les (tâche, exécution).
- per_task_all_run_success = fraction des tâches qui ont réussi sur les R exécutions.
- consistency_gap = average_success − per_task_all_run_success.

3) Diagnostiquer les flips

- Repérez les tâches avec au moins une réussite et au moins un échec.
- Comparez trajectoires gagnantes vs ratées : différences de prompt, branche du planificateur, choix d'outil.

4) Distiller des guidelines

- À partir des trajectoires gagnantes, rédigez 2–6 bullets concises (phrases impératives courtes) qui décrivent le chemin stable.
- Stockez et versionnez ce bundle (JSON/YAML).

5) Injection et canary

- Préfixez le contexte du planificateur avec le bundle ou passez-le via le paramètre d'inférence.
- Activez via un toggle pour un canary restreint et mesurez.

6) Mesurer l'impact

- Relancez la batterie de tests R fois avec et sans guidelines.
- Comparez average_success et per_task_all_run_success ; visez une réduction de la consistency_gap. Source : https://huggingface.co/blog/ibm-research/altk-evolve-consistency

Exemples de commandes et configuration

```bash
# run_baseline.sh — lancer N tâches avec R répétitions et stocker les trajectoires
python run_baseline.py --tasks tasks.csv --repeats 5 --out baseline_results.csv
```

```yaml
# inference_config.yaml
inject_consistency_guidelines: true
guidelines_path: "repo:/guidelines/guidelines.json"
```

Code minimal pour calcul des métriques (extrait d'exemple) :

```python
# compute_metrics.py
import csv
from statistics import mean

def compute(baseline_csv):
    rows = list(csv.DictReader(open(baseline_csv)))
    tasks = {}
    for r in rows:
        tasks.setdefault(r['task_id'], []).append(int(r['success']))
    avg = mean(sum(v)/len(v) for v in tasks.values())
    all_run = sum(1 for v in tasks.values() if all(x == 1 for x in v))/len(tasks)
    return avg, all_run, avg - all_run
```

Table de suivi (exemple)

| Metric | Baseline (ex.) | Objectif post-guidelines |
|---|---:|---:|
| average_success | 77.4% | ≥ 77.4% |
| per_task_all_run_success | 53.0% | améliorer |
| consistency_gap | 24.4 pp | réduire |

Source : https://huggingface.co/blog/ibm-research/altk-evolve-consistency

## Problemes frequents et correctifs rapides

- Variabilité sans différence de prompt : fixez un seed ou testez un décodage plus déterministe pour vérifier si l'échantillonnage est la cause. https://huggingface.co/blog/ibm-research/altk-evolve-consistency
- Appels d'outils alternant : ajoutez une guideline qui préfère l'outil fiable (extraite d'une trajectoire gagnante). https://huggingface.co/blog/ibm-research/altk-evolve-consistency
- Guidelines trop longues → perte d'average_success : raccourcissez-les, formulez-les comme préférences (soft constraints) et A/B testez.
- Métriques bruyantes sur petits échantillons : augmentez le nombre de tâches ou de répétitions et publiez intervalles de confiance. https://huggingface.co/blog/ibm-research/altk-evolve-consistency

Causes typiques et mitigations rapides : outil externe instable → préférer l'outil fiable dans la guideline ; branche du planificateur différente → injecter la séquence stable ; échantillonnage élevé → réduire variance pour tester l'effet.

## Premier cas d'usage pour une petite equipe

Contexte : équipes très réduites cherchant un gain de fiabilité sans réentraîner. Voir : https://huggingface.co/blog/ibm-research/altk-evolve-consistency

Actions concrètes et immédiatement actionnables (solo founders / small teams) :

1) Identification rapide des cas à forte valeur
- Choisissez une dizaine d'inputs métier critiques (factures litigieuses, requêtes clients fréquentes, etc.). Exécutez chaque input R = 5 fois, journalisez trajectoires, et classez par impact métier. Voir : https://huggingface.co/blog/ibm-research/altk-evolve-consistency

2) Distillation manuelle en 1–2 itérations
- Pour 3–5 cas qui flipent, ouvrez les trajectoires gagnantes, notez 1–3 différences répétées (outil préféré, phrase d'entrée, ordre d'actions) et transformez-les en 2–4 bullets clairs. Mettez ces bullets dans guidelines.json et committez.

3) Canary local et retour rapide
- Activez le toggle en local ou sur 1–2 sessions réelles (offline) ; comparez rapidement average_success et per_task_all_run_success. Si improvement confirmé, déployez plus largement ; sinon rollbackez. https://huggingface.co/blog/ibm-research/altk-evolve-consistency

Conseils opérationnels pour petites équipes :

- Traitez les guidelines comme du code : petits commits, tests rapides, revue par pair si possible.
- Automatisez un rapport CSV/JSON qui calcule les métriques et génère un diff entre baseline et canary.
- Priorisez 3–5 cas à fort impact plutôt que d'essayer de corriger tout le corpus.

## Notes techniques (optionnel)

- Formules : average_success = mean(success_{task,run}), per_task_all_run_success = (# tâches réussies sur R exécutions) / N_tasks, consistency_gap = average_success − per_task_all_run_success. https://huggingface.co/blog/ibm-research/altk-evolve-consistency
- Champs à logger recommandés : prompt, plan_state, tool_calls, success_label, error_logs des outils. Ces logs facilitent la distillation et le diagnostic. https://huggingface.co/blog/ibm-research/altk-evolve-consistency
- Note sur ALTK‑Evolve : le système présenté automatise l'extraction de guidelines depuis des trajectoires passées et leur injection à l'inférence, avec des gains mesurables de cohérence selon l'article. https://huggingface.co/blog/ibm-research/altk-evolve-consistency

## Que faire ensuite (checklist production)

- [ ] Mesurer baseline et sauvegarder les trajectoires complètes (utiliser R = 5 comme point de départ). https://huggingface.co/blog/ibm-research/altk-evolve-consistency
- [ ] Distiller et committer guidelines (guidelines.json) dans le dépôt.
- [ ] Implémenter toggle / feature flag pour l'injection.
- [ ] Définir plan de canary (propriétaire, durée, critères de succès).
- [ ] Mettre en place alertes et dashboard pour average_success et consistency_gap.

### Hypotheses / inconnues

- Valeurs confirmées par l'étude : R = 5, average_success = 77,4 %, per_task_all_run_success = 53,0 %, consistency_gap = 24,4 points. https://huggingface.co/blog/ibm-research/altk-evolve-consistency
- Hypothèses opérationnelles à valider dans votre contexte : canary traffic cible (ex. 5 %), latence d'inférence acceptable (ex. 200 ms), budget coût par 1k tokens (ex. $0.02), nombre minimal d'exemples par tâche pour stabilité (ex. 20). Ces chiffres sont des hypothèses à vérifier.
- Inconnues à mesurer : variation par modèle (seed), impact sur latence et coût, nombre d'itérations de distillation automatiques nécessaires.

### Risques / mitigations

- Risque : guidelines trop contraignantes → baisse d'average_success.
  - Mitigation : formuler en préférences (soft), A/B tester et prévoir rollback automatique.
- Risque : métriques bruyantes sur petits échantillons.
  - Mitigation : augmenter R ou N_tasks, publier intervalles de confiance.
- Risque : dépendance sur outils tiers instables.
  - Mitigation : préférer ou forcer l'outil fiable via guideline, ajouter health checks.

### Prochaines etapes

1. Implémenter le script baseline et lancer R = 5 sur vos tâches prioritaires (collecte logs). https://huggingface.co/blog/ibm-research/altk-evolve-consistency
2. Extraire trajectoires gagnantes, rédiger 2–4 bullets de guideline, stocker guidelines.json et protéger derrière un feature flag.
3. Lancer un canary restreint ; monitorer average_success et per_task_all_run_success ; promouvoir ou rollbacker selon critères définis.

Source principale : article Hugging Face / IBM Research sur ALTK‑Evolve et la cohérence run-to-run — https://huggingface.co/blog/ibm-research/altk-evolve-consistency
