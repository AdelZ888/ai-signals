---
title: "Reproduire la Release 01 du Neutrality Project : pipeline pour évaluer la neutralité politique des IA"
date: "2026-07-12"
excerpt: "Guide pour reproduire la Release 01 du Neutrality Project : exécuter des modèles sur 6 axes politiques, mesurer moyennes par axe, taux de refus et intervalles de confiance à 95 %."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-12-reproducing-the-neutrality-project-release-01-pipeline-to-assess-ai-political-neutrality.jpg"
region: "US"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "neutralité"
  - "benchmark"
  - "pipeline"
  - "modèles"
  - "reproductibilité"
  - "sécurité"
  - "audit"
sources:
  - "https://neutralityproject.org/results.html"
---

## TL;DR en langage simple

- Release 01 a testé 18 modèles sur 6 axes politiques avec 3 987 questions. (Source : https://neutralityproject.org/results.html)
- 97 positions sur 108 mesurées tombent à gauche du centre. La moyenne rapportée est −0,41. (Source : https://neutralityproject.org/results.html)
- Exemple clé : Phi‑4 a refusé 26 % des questions. Le plus fort "lean" observé est −0,82 sur l'axe environnement. Le plus proche du centre est −0,11. (Source : https://neutralityproject.org/results.html)
- Ce guide explique comment envoyer les mêmes questions à plusieurs modèles, stocker les réponses brutes, marquer les refus et produire des métriques comparables. (Source : https://neutralityproject.org/results.html)

Bref et utile : lancez un petit run sur un sous‑ensemble, calculez la fraction de refus par axe et la moyenne par axe. Comparez ces chiffres au benchmark public. (Source : https://neutralityproject.org/results.html)

## Ce que vous allez construire et pourquoi c'est utile

Vous allez créer un pipeline reproductible qui :

- envoie exactement les mêmes questions à plusieurs modèles ; (Source : https://neutralityproject.org/results.html)
- conserve les réponses brutes pour audit ; (Source : https://neutralityproject.org/results.html)
- marque les refus et convertit les réponses en scores numériques sur 6 axes ancrés ; (Source : https://neutralityproject.org/results.html)

Utilité : comparer fournisseurs de façon cohérente et distinguer "lean" intrinsèque de la suppression due aux garde‑fous. (Source : https://neutralityproject.org/results.html)

Petite note méthodologique : Release 01 publie moyennes par dimension et propage ±1 écart‑type — reproduisez cette méthode pour une meilleure comparabilité. (Source : https://neutralityproject.org/results.html)

## Avant de commencer (temps, cout, prerequis)

Prérequis minimaux :

- accès API ou runtime pour exécuter requêtes vers chaque modèle ; (Source : https://neutralityproject.org/results.html)
- Git pour versionner prompts, ancres et manifests ; (Source : https://neutralityproject.org/results.html)
- jeu de questions Release 01 (questions + métadonnées) comme point de départ. (Source : https://neutralityproject.org/results.html)

Estimation de temps pour un run exploratoire : 30–180 minutes selon le nombre de modèles (1–10) et le batching. Coût indicatif hypothétique pour un run court : $10–$100 (à valider selon fournisseur). Tokens par requête dépend du prompt (max_tokens à définir). (Source : https://neutralityproject.org/results.html)

Checklist de démarrage :

- [ ] Télécharger le jeu Release 01 et le sauvegarder (questions.csv). (Source : https://neutralityproject.org/results.html)
- [ ] Préparer les clés API ou l'accès runtime pour chaque modèle. (Source : https://neutralityproject.org/results.html)
- [ ] Versionner prompt_config.yml, anchors_v1.csv et model_manifest.csv dans Git. (Source : https://neutralityproject.org/results.html)

## Installation et implementation pas a pas

1) Récupérer le jeu de données

- Télécharger le pack Release 01 et sauvegarder comme questions.csv. (Source : https://neutralityproject.org/results.html)

2) Définir les modèles et endpoints

- Créer model_manifest.csv listant modèles, endpoints et méthodes d'authentification. (Source : https://neutralityproject.org/results.html)

3) Verrouiller prompts et ancres

- Stocker prompt_config.yml et anchors_v1.csv, taguer en Git. (Source : https://neutralityproject.org/results.html)

```yaml
# prompt_config.yml (exemple minimal)
prompt_template: |
  Répondez brièvement à la question. Ne pas ajouter de contexte politique.
  Question: "{question}"
  Retour JSON: {"answer":"...","refusal":false}
stop: "\n"
max_tokens: 256
```

4) Exécuter les requêtes avec scripts résumables

- Implémenter retries, backoff exponentiel, batching et reprise. Logger latences et erreurs. Sauvegarder raw_responses pour audit. (Source : https://neutralityproject.org/results.html)

```bash
#!/usr/bin/env bash
set -euo pipefail
MODEL="$1"
QUESTIONS="questions.csv"
OUTDIR="raw_responses/${MODEL}"
mkdir -p "$OUTDIR"
python run_benchmark.py --model "$MODEL" --questions "$QUESTIONS" --out "$OUTDIR" --batch-size 20
```

5) Parser et scorer

- Produire scored_results.csv contenant : model, question_id, axis, score, refusal_flag, raw_response. (Source : https://neutralityproject.org/results.html)

6) Calculer métriques de synthèse

- Pour chaque (model, axis) calculer moyenne, % de refus, erreur standard et intervalle de confiance à 95 %. Release 01 propage ±1 écart‑type ; documentez votre méthode pour comparabilité. (Source : https://neutralityproject.org/results.html)

7) Analyse en deux couches

- Séparer orientation (lean) et suppression (refus). Rapporter fraction de refus par axe et moyenne par axe. (Source : https://neutralityproject.org/results.html)

8) Visualiser et résumer

- Tracer la moyenne des six axes pour produire une "neutrality map" et, si pertinent, une carte 3D des composantes. (Source : https://neutralityproject.org/results.html)

Récapitulatif des métriques publiées :

| statistique | valeur |
|---|---:|
| modèles testés | 18 |
| axes ancrés | 6 |
| questions totales (Release 01) | 3 987 |
| positions à gauche du centre | 97 / 108 |
| position moyenne (tous modèles) | −0,41 |
| refus signalé (ex. Phi‑4) | 26 % |
| plus fort lean (ex. environnement) | −0,82 |
| plus proche du centre (moyenne) | −0,11 |

(Source : https://neutralityproject.org/results.html)

## Problemes frequents et correctifs rapides

- Taux de refus élevé (> 20 %) : simplifiez le prompt et explicitez la sortie JSON. Vérifiez si les refus sont concentrés sur certains axes. (Source : https://neutralityproject.org/results.html)
- Intervalles de confiance larges (> 0,15) : augmenter l'échantillon par axe ou appliquer bootstrap ; documenter la méthode. (Source : https://neutralityproject.org/results.html)
- Débits et erreurs API : utiliser batching (par ex. 20 requêtes), retries et backoff exponentiel ; journaliser latences (médiane cible 120 ms, tolérance max 500 ms). (Source : https://neutralityproject.org/results.html)
- Ancres non reproductibles : versionner anchors_v1.csv et exécuter une calibration avant la campagne. (Source : https://neutralityproject.org/results.html)

## Premier cas d'usage pour une petite equipe

Objectif : obtenir un signal rapide, auditable et actionnable pour choisir ou évaluer un fournisseur sans reproduire l’intégralité du benchmark public. (Source : https://neutralityproject.org/results.html)

Actions concrètes pour un·e fondateur·rice solo ou une petite équipe (3–5 personnes) :

1) Run signal (30–180 minutes)

- Sélectionnez un sous‑ensemble de 50–200 questions représentant les 6 axes. (Source : https://neutralityproject.org/results.html)
- Exécutez run_benchmark.py pour 1–3 modèles prioritaires. Conservez raw_responses et scored_results.csv. Exemple :

```bash
python run_benchmark.py --model grok-1 --questions subset_100.csv --out results/grok-1 --batch-size 25
```

2) Règles de shortlist simples et actionables

- Définissez 3 règles claires :
  a) Refus total < 10 % → candidat acceptable. (hypothèse opérationnelle)
  b) |mean lean| < 0,15 → neutre assez proche du centre. (hypothèse opérationnelle)
  c) CI largeur < 0,15 → estimation stable. (hypothèse opérationnelle)
- Appliquez ces règles au run signal et créez une shortlist de 1–2 modèles. (Source : https://neutralityproject.org/results.html)

3) Automatiser un job léger de calibration (CI/CD)

- Intégrer un job CI qui exécute 50–100 questions la nuit. Stocker run_manifest.json, prompt_config.yml et raw_responses pour traçabilité. Pousser metrics_summary.csv vers un dashboard interne. (Source : https://neutralityproject.org/results.html)

4) Décision et archivage

- Archivez prompt_config.yml, anchors_v1.csv et scored_results.csv pendant la durée requise par votre conformité (ex. 90 jours). Préparez une page de décision simple avec : moyennes par axe, % refus total, verdict shortlist. (Source : https://neutralityproject.org/results.html)

5) Communication rapide

- Fournissez aux parties prenantes 1 page contenant : 6 moyennes par axe, % refus par axe, et décision recommandée. Gardez les données brutes accessibles pour audit. (Source : https://neutralityproject.org/results.html)

## Notes techniques (optionnel)

- Ancrage : Release 01 utilise des échelles auto‑ancrées par modèle. Chaque modèle a son échelle interne ; reproduire cet ancrage améliore la comparabilité. (Source : https://neutralityproject.org/results.html)
- Méthode courte : publier moyenne et erreur standard, propager ±1 écart‑type pour comparaison directe au benchmark. (Source : https://neutralityproject.org/results.html)

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Durée et coût exacts à valider : run exploratoire 30–180 min ; coût hypothétique $10–$100 pour un run court. Tokens et max_tokens selon fournisseur (à confirmer). (Source : https://neutralityproject.org/results.html)
- Seuils opérationnels proposés (à adapter) : gate refus initial 10 % (hypothèse), suppression signalée si refus > 20 % (hypothèse), |mean lean| gate 0,15 (hypothèse), largeur CI max acceptable 0,15 (hypothèse).
- Canary rollout suggéré : 1 % → 5 % → 100 % ; cadence de calibration nocturne 50–100 questions. Run complet Release 01 ≈ 3 987 questions. Objectifs latence : médiane 120 ms, max tolérable 500 ms.

### Risques / mitigations

- Dérive après mise en production (mises à jour fournisseur). Mitigation : tests hebdomadaires ou mensuels et job CI de calibration (50–100 questions) ; conserver run_manifest.json pour traçabilité. (Source : https://neutralityproject.org/results.html)
- Échantillons insuffisants → CI large. Mitigation : exiger largeur CI maximale avant rollout et augmenter l'échantillon par axe si nécessaire. (Source : https://neutralityproject.org/results.html)
- Problèmes d'audit / conformité. Mitigation : stocker scored_results.csv, suppression_flags.json et raw_responses pendant la période requise par votre conformité interne. (Source : https://neutralityproject.org/results.html)

### Prochaines etapes

- Automatiser run_benchmark.py dans CI et pousser metrics_summary.csv vers un dashboard à chaque changement de modèle ou prompt.
- Monter en charge : exécuter le jeu complet Release 01 (~3 987 questions) pour reproduire l'échelle du benchmark public si nécessaire. (Source : https://neutralityproject.org/results.html)
- Gouvernance : créer un template de transparence incluant suppression_flags.json et planifier réévaluations périodiques.

Référence principale : Neutrality Project — Results Release 01 (https://neutralityproject.org/results.html).
