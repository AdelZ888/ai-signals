---
title: "Benchmarker les Search APIs en changeant de fournisseur tout en fixant le modèle et le prompt"
date: "2026-09-13"
excerpt: "Guide pratique pour construire un harness reproductible qui exécute un même agent en changeant uniquement la Search API. Comparez coût, latence et qualité des réponses pour choisir le meilleur fournisseur."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-13-benchmark-search-apis-by-swapping-providers-while-fixing-the-model-and-prompt.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "search-api"
  - "benchmark"
  - "agents"
  - "retrieval"
  - "IA"
  - "développeurs"
  - "startups"
  - "petites-équipes"
sources:
  - "https://artificialanalysis.ai/agents/search-api"
---

## TL;DR en langage simple

- Fait établi (source) : l'Artificial Analysis Search Index exécute le même agent en ne changeant que la Search API pour mesurer coût, durée et qualité des réponses. Le benchmark couvre 20 produits et 10 fournisseurs et agrège trois benchmarks publics (DeepSearchQA, BrowseComp, AA-Omniscience). Source : https://artificialanalysis.ai/agents/search-api.

- Ce que cela mesure (source) : coût par tâche (USD), temps par tâche (ms) et qualité (métriques comme F1 et exact-match). Le leaderboard combine ces mesures par moyenne égale des trois benchmarks publics. Source : https://artificialanalysis.ai/agents/search-api.

- Résumé pratique : construisez un harness qui fige le modèle et le prompt, remplace uniquement la Search API et compare coût, latence (médiane, p95, p99) et qualité vs une exécution "model-only" (baseline). Source : https://artificialanalysis.ai/agents/search-api.

Méthodologie courte : le benchmark exécute le même agent avec la seule variable étant la Search API, ce qui isole l'effet de l'index, du format des résultats et de la latence. Source : https://artificialanalysis.ai/agents/search-api.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez créer un banc d'essai reproductible (harness) qui :

- fixe le modèle candidat et le prompt (baseline model-only),
- remplace la Search API par un adaptateur par fournisseur,
- collecte métriques : cost_per_task_usd, time_per_task_ms (médiane/p95/p99) et quality (F1 / exact-match).

Pourquoi utile : si modèle & prompt sont identiques, toute différence mesurée provient de la Search API (index, snippets, fraîcheur, latence). Le benchmark d'Artificial Analysis suit exactement cette approche et compare 20 produits sur 10 fournisseurs. Source : https://artificialanalysis.ai/agents/search-api.

Bénéfices pratiques : décision informée entre coût (USD/task), vitesse (ms) et qualité (%) pour choisir un provider selon vos contraintes.

## Avant de commencer (temps, cout, prerequis)

Prérequis minimaux :

- Clés API : 1 clé pour le modèle de référence et 1 clé par Search API testée.
- Jeu de requêtes représentatives (fichier queries.json). Le benchmark indique une évaluation multi-provider ; taille pratique initiale suggérée dans nos hypothèses : 200 requêtes (voir hypothèses en fin). Source méthodologique : https://artificialanalysis.ai/agents/search-api.
- Environnement : Python 3.10+ ou Node.js 18+, Docker recommandé.
- Contrôle de coûts : prévoir un plafond d'essai (ex. $10–$50/jour selon besoin).

Estimation de charge (ordre de grandeur) :

- Mise en place + smoke-test : ~4 heures.
- Runs complets (200 requêtes) : 1–3 jours selon latence et quota.
- Logs/outputs par run : typiquement 1–10 MB.

Métriques attendues (définies par le benchmark) : coût par tâche (USD), temps par tâche en ms (médiane, p95, p99), qualité (F1 / exact-match). Source : https://artificialanalysis.ai/agents/search-api.

## Installation et implementation pas a pas

1) Récupérez le harness et installez les dépendances (exemple). Incluez la source méthodologique : https://artificialanalysis.ai/agents/search-api.

```bash
git clone https://example.com/test-harness.git
cd test-harness
pip install -r requirements.txt
```

2) Figez la configuration principale (exemple JSON, fenêtre de contexte = 4096 tokens). Normalisez la sortie des adaptateurs pour {title, snippet, url, score, freshness_score, latency_ms, search_cost_usd}.

```json
{
  "model": "candidate-model",
  "context_tokens": 4096,
  "queries_path": "queries.json",
  "output_dir": "results/"
}
```

3) Implémentez un adaptateur par fournisseur ; normalisez snippets à <= 512 tokens pour limiter coût en tokens. Testez localement avec 20 requêtes pour un smoke (≈10–30 minutes selon latence). Référence : https://artificialanalysis.ai/agents/search-api.

4) Lancer smoke puis run complet :

```bash
export MODEL_API_KEY=sk-...
python run_harness.py --config harness-config.json --providers none --out baseline.csv
python run_harness.py --config harness-config.json --providers providers.yml --out results/provider-XYZ.csv
```

5) Agrégez et calculez : cost_per_task_usd, time_per_task_ms (médiane) et accuracy_pct (exact-match ou F1 selon benchmark). Exemple de calcul :

```python
cost_per_task = (model_cost_usd + sum(search_costs_usd)) / tasks
time_per_task_ms = median(latencies_ms)
accuracy_pct = compute_exact_match(preds, gold)
```

Conseil : versionnez adaptateurs et config en Git et exécutez au moins 3 runs pour estimer variance.

## Problemes frequents et correctifs rapides

- Erreurs 429 / rate limit : backoff exponentiel, réduire la concurrence, cache local. Voir méthodologie : https://artificialanalysis.ai/agents/search-api.
- Formats hétérogènes : validez adaptateurs avec un schema-validator avant runs.
- Pas d'amélioration vs baseline : vérifier que les snippets sont injectés dans le prompt et que la tokenisation (ex. 4096 tokens) n'a pas tronqué les entrées.
- Bruit sur latence : utiliser médiane, p95 et p99 ; investiguer les 5% supérieurs.
- Fraîcheur : loggez freshness_score et échantillonnez les URLs retournées.

Correctif rapide (cache + 3 retries) :

```bash
python run_harness.py --config harness-config.json --cache enabled --retry 3
```

Indicateurs à monitorer immédiatement : médiane_ms, p95_ms, p99_ms, coût/task (USD) et accuracy_pct (%).

## Premier cas d'usage pour une petite equipe

Contexte : fondateur solo ou équipe de 1–5 personnes qui veut déployer un assistant interne mixant docs internes et web. Référence méthodologique : https://artificialanalysis.ai/agents/search-api.

Actions concrètes prioritaires (exécutables par une petite équipe)

1) Test minimal reproductible (déployer en 2–8 heures)
   - Extraire 200 requêtes représentatives (ou 20 pour un smoke rapide).
   - Lancer smoke de 20 requêtes (~10–30 min), puis run de 200 requêtes (1–8 heures selon latence).
   - Mesurer médiane_ms, p95_ms, cost_per_task_usd et accuracy_pct.

2) Instrumentation légère (faible coût et simple à maintenir)
   - Pour chaque requête, logger latency_ms, search_cost_usd, snippet (<=512 tokens), url et freshness_score.
   - Stocker CSV par provider avec colonnes : provider, task_id, latency_ms, search_cost_usd, accuracy_pct.
   - Plafonner dépenses tests : budget d'essai $10/jour ; alerte à $50/24h.

3) Déploiement progressif et règles simples de rollback
   - Canary : 5% du trafic pendant 24h ; monitorer p95 et coût/jour.
   - Règles de rollback rapides : p95 > 500 ms OU coût quotidien > $50 ⇒ basculer sur fallback model-only.

4) Automatisation minimale (scripts prêts en 1 jour)
   - Script pour exécuter smoke (20 queries) et run complet (200 queries) et produire leaderboard CSV.
   - Exemple de commande smoke :

```bash
python run_harness.py --config harness-config.json --queries 20 --out smoke.csv
python run_harness.py --config harness-config.json --queries 200 --out full_run.csv
```

Tableau synthétique d'aide à la décision (exemples illustratifs) :

| Provider | médiane_ms | p95_ms | cost_per_task_usd | accuracy_pct |
|---|---:|---:|---:|---:|
| provider-A | 120 | 450 | 0.015 | 86 |
| provider-B | 220 | 900 | 0.009 | 82 |

(Remarque : valeurs illustratives; adaptez vos seuils). Source méthodologique : https://artificialanalysis.ai/agents/search-api.

## Notes techniques (optionnel)

- Le benchmark agrège trois benchmarks publics (DeepSearchQA — F1, BrowseComp — exact-match, AA-Omniscience — accuracy) par moyenne égale ; il compare aussi à une baseline "model-only" (ex. GPT-5.6 Luna medium dans le snapshot). Source : https://artificialanalysis.ai/agents/search-api.
- Verrouillez tokenizer/context window (ex. 4096 tokens), normalisez snippets à <= 512 tokens et exécutez les expériences en Docker pour reproductibilité.
- Méthodologie courte : conserver la même candidate model/prompt et n'autoriser que la Search API à varier.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse confirmée par la source : 20 produits et 10 fournisseurs évalués ; agrégation par moyenne égale des 3 benchmarks publics. Source : https://artificialanalysis.ai/agents/search-api.
- Hypothèses opérationnelles proposées (à valider dans votre contexte) :
  - Taille initiale du jeu de requêtes : 200 (augmenter jusqu'à 1 000 si besoin).
  - Smoke test initial : 20 requêtes.
  - Context window par défaut : 4 096 tokens.
  - Caps budgétaires d'essai : $10/jour (seuil souple), alerte à $50/24h.
  - Canary initial : 5% du trafic pendant 24h.
  - Seuils de latence : p95 > 500 ms (alerte), p99 > 2 000 ms (critique).
  - Nombre minimal d'exécutions pour stabilité : 3 runs complets par provider.

### Risques / mitigations

- Risque : pic de coût (> $50/24h). Mitigation : cap budgétaire automatique, alertes et arrêt des runs.
- Risque : latence tail élevée (p95/p99). Mitigation : canary 5%, réduire concurrence, fallback model-only si p95 > 500 ms.
- Risque : pas d'amélioration qualité vs baseline. Mitigation : augmenter dataset (jusqu'à 1 000 queries), ajuster injection des snippets, comparer aux runs "model-only".

### Prochaines etapes

- [ ] Automatiser les runs reproductibles et stocker résultats (CSV/JSON) dans un stockage versionné.
- [ ] Construire un dashboard minimal affichant médiane, p95, coût et accuracy (ex: Grafana ou simple UI CSV->table).
- [ ] Configurer alertes sur budget et latence (p95/p99).
- [ ] Tester adaptateurs sur 20 requêtes (smoke) puis sur 200 requêtes (run complet).
- [ ] Documenter plan de rollback et exécuter un test de canary (5% pendant 24h).

Livrables recommandés avant production : provider-decision-table.csv, leaderboard.csv, recommendation.md et un plan de rollback testé. Pour plus de contexte méthodologique, voir : https://artificialanalysis.ai/agents/search-api.
