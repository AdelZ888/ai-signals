---
title: "Reproduire les évaluations ITBench‑AA SRE et produire des rapports JSON prêts pour l'audit"
date: "2026-05-29"
excerpt: "Tutoriel reproductible pour exécuter les tâches SRE d'ITBench‑AA et produire des rapports JSON prêts pour l'audit (accuracy, avg_turns, false_positive_rate, task_count). Les modèles de pointe ont obtenu moins de 50 %."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-29-reproduce-itbenchaa-sre-evaluations-and-produce-auditready-json-reports.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "ITBench‑AA"
  - "SRE"
  - "benchmark"
  - "IA"
  - "LLM"
  - "reproductibilité"
  - "HuggingFace"
  - "IBM"
sources:
  - "https://huggingface.co/blog/ibm-research/itbench-aa"
---

## TL;DR en langage simple

- ITBench‑AA est le premier benchmark pour tâches « agentiques » IT d'entreprise, construit avec IBM et publié sur Hugging Face. Il mesure des tâches SRE où les modèles lisent des logs, tracent des dépendances et proposent des entités racines (source : https://huggingface.co/blog/ibm-research/itbench-aa).
- Résultat clé : tous les modèles de pointe rapportés obtiennent < 50 % d'accuracy sur les tâches SRE (Claude Opus 4.7 ≈ 47 %, GPT‑5.5 (xhigh) ≈ 46 %, Qwen3.7 Max ≈ 42 %) ; les trajectoires montrent de fortes variations (jusqu'à ≈ 3× en nombre de tours). (https://huggingface.co/blog/ibm-research/itbench-aa)
- Pression opérationnelle : GPT‑5.5 (xhigh) moyenne ≈ 31 tours par tâche, Gemini 3.1 Pro Preview ≈ 83 tours — plus de tours n'implique pas meilleure précision. (https://huggingface.co/blog/ibm-research/itbench-aa)

Objectif concret de ce guide : fournir un harnais reproductible qui exécute l'ensemble SRE d'ITBench‑AA et produit, pour chaque modèle testé, un artefact JSON contenant au minimum {"accuracy", "avg_turns", "false_positive_rate", "task_count"} pour audit et décision.

## Ce que vous allez construire et pourquoi c'est utile

Vous construirez un petit système d'évaluation reproductible :

- Envoi des mêmes tâches SRE canonique à un ou plusieurs modèles-agent. (https://huggingface.co/blog/ibm-research/itbench-aa)
- Enregistrement des trajectoires complètes (timestamp, rôle, message, tokens approximatifs, coût estimé) pour chaque tâche.
- Calcul de métriques simples : accuracy (%), avg_turns (nombre moyen de tours), false_positive_rate (%) et task_count (nombre de tâches). (https://huggingface.co/blog/ibm-research/itbench-aa)

Utilité immédiate : comparer vos modèles aux chiffres publiés (leaders ≈ 47 %, 46 %, 42 %), détecter modes d'échec (p.ex. over‑investigation) et produire un artefact d'audit pour refuser/autoriser automatisation. (https://huggingface.co/blog/ibm-research/itbench-aa)

## Avant de commencer (temps, cout, prerequis)

Prérequis minimaux :

- Accès au dataset SRE d'ITBench‑AA et à la rubric d'évaluation ; vérifiez hashes et version pour comparabilité. (https://huggingface.co/blog/ibm-research/itbench-aa)
- Un endpoint modèle (local ou cloud) ou un binaire open source pour itérations à faible coût.
- Environnement Python 3.10+, stockage pour inputs/outputs et journalisation JSON.

Temps estimé (ordre de grandeur) :

- Smoke test 10 tâches : 10–30 minutes selon latence (latence typique observée : 100–2000 ms par requête selon endpoint).
- Run complet : dépend de task_count (ex. 100–1000 tâches) et du coût par appel ; évaluer avec un lot pilote. (https://huggingface.co/blog/ibm-research/itbench-aa)

Coûts : varient fortement par fournisseur et modèle. Commencez par un petit lot (ex. 20 tâches) pour estimer coût marginal avant un run à grande échelle.

## Installation et implementation pas a pas

1) Récupérer les tâches canoniques
- Téléchargez l'ensemble SRE référencé par ITBench‑AA et vérifiez les hashs/version. (https://huggingface.co/blog/ibm-research/itbench-aa)

2) Préparer un répertoire d'exécution
- Structure recommandée : inputs/, outputs/, logs/, results/, traces/ ; conservez une copie immuable des inputs.

3) Configurer endpoints et secrets
- Placez clés dans un coffre (env vars ou vault) — ne commitez pas dans Git. Enregistrez endpoint, nom du modèle, max_tokens estimés et timeout.

4) Lancer un smoke test
- Démarrez avec 10 tâches représentatives ; sauvegardez un JSON par modèle incluant metrics et trajectoires.

5) Calculer métriques via la rubric canonique
- accuracy = fraction des tasks où l'entité racine finale correspond à la rubric.
- avg_turns = moyenne des tours par tâche.
- false_positive_rate = % d'entités racines plausibles mais incorrectes.

Commandes d'exemple (adapter aux chemins/endpoints) :

```bash
# cloner un harnais (exemple) et lancer un smoke test
git clone https://example.com/itbench-aa-harness.git
cd itbench-aa-harness
python run_itbench.py --config config/itbench_aa_sre.yml --model my-llm
```

Exemple de fragment de config (illustratif) :

```yaml
tasks_dir: tasks/
output_dir: results/
models:
  - name: my-llm
    endpoint: https://api.provider.example/v1
    max_tokens: 8000
    timeout_ms: 30000
```

Conseils pratiques : conservez inputs/outputs immuables, implémentez retries avec backoff, journalisez tokens et coûts par appel pour étude (p.ex. tokens ~ 500–8000 selon tâche et contexte).

(https://huggingface.co/blog/ibm-research/itbench-aa)

## Problemes frequents et correctifs rapides

- Coupures API / quotas : ajouter retries exponentiels, backoff (p.ex. 1s, 2s, 4s) et monitorer quotas. (https://huggingface.co/blog/ibm-research/itbench-aa)
- Logs mal formatés : normalisez en amont et ajoutez tests unitaires pour le parseur.
- Boucles d'agent / tours excessifs : imposez une politique max_turns côté harnais et marquez les tâches > médiane×2 pour revue — le benchmark observe jusqu'à ~3× de variance entre modèles. (https://huggingface.co/blog/ibm-research/itbench-aa)
- Résultats non concordants : vérifiez que vous utilisez le dataset et la rubric canoniques et comparez hashes. (https://huggingface.co/blog/ibm-research/itbench-aa)

Exemple de politique d'agent (yaml) :

```yaml
agent_policy:
  max_turns: 40
  retries: 3
  backoff_seconds: 2
  timeout_ms: 30000
```

## Premier cas d'usage pour une petite equipe

Contexte : équipe solo ou 1–3 personnes voulant valider rapidement si un modèle peut proposer des diagnostics fiables avant d'autoriser toute remediation automatique. (https://huggingface.co/blog/ibm-research/itbench-aa)

Actionables (au moins 3 points concrets) :

1. Exécuter un smoke test de 10 tâches sélectionnées dans l'ensemble canonique. Produisez un rapport JSON par modèle contenant {"accuracy", "avg_turns", "false_positive_rate", "task_count"} et gardez les trajectoires brutes. (https://huggingface.co/blog/ibm-research/itbench-aa)

2. Marquer automatiquement pour revue humaine les tâches dont le nombre de tours dépasse la médiane observée × 2 ou qui présentent une confiance faible ; priorisez ces revues pour les 20 premières erreurs. Le benchmark montre des variations de ~3× en tours entre modèles, ce qui justifie cette heuristique. (https://huggingface.co/blog/ibm-research/itbench-aa)

3. Mettre en place un artefact d'audit simple : logs, JSON par modèle et un tableau de bord montrant accuracy (%), avg_turns (count), false_positive_rate (%) et task_count. Utilisez ce pack d'artefacts pour décider "no deploy / humain‑in‑loop / canary".

Checklist rapide pour solo / petite équipe :

- [ ] Télécharger les tâches SRE canoniques et vérifier hashes. (https://huggingface.co/blog/ibm-research/itbench-aa)
- [ ] Lancer smoke test 10 tâches et produire un rapport JSON par modèle.
- [ ] Marquer et prioriser pour revue humaine les tâches avec tours > médiane×2.
- [ ] Ne pas activer de remediation automatique sans artefact d'audit et confirmation humaine.

Tableau résumé (valeurs publiées) :

| Modèle (rapporté) | Accuracy | Avg turns | Note |
|---|---:|---:|---|
| Claude Opus 4.7 | 47% | — | Leader rapporté à ≈47% (<50%). (https://huggingface.co/blog/ibm-research/itbench-aa) |
| GPT‑5.5 (xhigh) | 46% | 31 tours | Avg 31 tours rapportés. (https://huggingface.co/blog/ibm-research/itbench-aa) |
| Qwen3.7 Max | 42% | — | Rapporté ≈42% (<50%). (https://huggingface.co/blog/ibm-research/itbench-aa) |

## Notes techniques (optionnel)

- accuracy = fraction des tâches où l'entité racine finale proposée correspond à la rubric canonique. (https://huggingface.co/blog/ibm-research/itbench-aa)
- avg_turns = moyenne du nombre d'échanges par tâche ; la variance observée peut atteindre ≈3× entre modèles (ex. 31 vs 83 tours). (https://huggingface.co/blog/ibm-research/itbench-aa)
- false_positive_rate = % d'entités racines plausibles mais incorrectes, à extraire via la rubric ou règles post‑hoc.

Instrumentation recommandée : stocker par message le timestamp (ms), rôle, texte, tokens estimés et coût estimé. Conservez seeds et hashes pour reproductibilité. (https://huggingface.co/blog/ibm-research/itbench-aa)

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse : reproduire exactement les métriques publiées nécessite l'utilisation du dataset et de la rubric canoniques ; validez en comparant hashes et en testant un sous‑ensemble. (https://huggingface.co/blog/ibm-research/itbench-aa)
- Hypothèses opérationnelles à valider en test : seuils d'acceptation (p.ex. 70 % accuracy), paramètres agent (max_turns = 40, timeout_ms = 30000, retries = 3) et limites budgétaires pour runs (ex. lot pilote 20 tâches). Ces valeurs sont des suggestions à tester en contexte et ne figurent pas littéralement dans le rapport. 

### Risques / mitigations

- Risque : remediation automatique déclenchée par une cause racine plausible mais incorrecte.
  - Mitigation : exiger confirmation humaine en production jusqu'à ce qu'un critère d'acceptation robuste soit atteint ; canaryer progressivement.

- Risque : fuites de clés API ou quotas interrompant les runs.
  - Mitigation : coffre à secrets, rotation de clés, retries/backoff et monitoring de quotas. (https://huggingface.co/blog/ibm-research/itbench-aa)

- Risque : données de production très différentes du benchmark.
  - Mitigation : normaliser logs, ajouter tests de parsing et exécuter runs d'intégration sur échantillons de production.

### Prochaines etapes

- Exécuter un benchmark complet pour chaque modèle candidat (p.ex. 100–500 tâches) et produire rapports JSON par modèle ; comparer aux leaders publiés (≈47 %, 46 %, 42 %) en tenant compte de la variance. (https://huggingface.co/blog/ibm-research/itbench-aa)
- Définir l'artefact de décision (no deploy / humain‑in‑loop / canary / full deploy) basé sur accuracy, avg_turns et patterns de faux positifs.
- Automatiser runs récurrents (cron) et conserver historique JSON pour détecter dérive et régressions.

Exemple de cron job (hebdomadaire) :

```bash
# exemple : exécuter le harnais chaque lundi à 03:00
0 3 * * 1 /usr/bin/python /opt/itbench/run_itbench.py --config /opt/itbench/config/itbench_aa_sre.yml >> /var/log/itbench/weekly.log 2>&1
```

Méthodologie (brève) : ce guide vise à reproduire l'évaluation SRE d'ITBench‑AA et à produire des artefacts d'audit ; pour la provenance complète des données et la rubric, consultez la page officielle : https://huggingface.co/blog/ibm-research/itbench-aa
