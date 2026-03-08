---
title: "TracePact : enregistrez une trace « golden » des appels d'outils d’un agent IA et comparez les exécutions pour détecter les régressions en CI"
date: "2026-03-08"
excerpt: "TracePact est présenté comme un framework de tests comportementaux pour agents IA. Cette traduction explique, pour un public UK (équipes réduites, fondateurs, développeurs), comment protéger un scénario critique avec une trace canonique, rejouer le scénario en CI et comparer les traces pour attraper régressions structurelles et changements d’arguments."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-08-tracepact-record-golden-ai-agent-tool-call-traces-and-diff-runs-to-catch-regressions-in-ci.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "AI"
  - "tests comportementaux"
  - "CI"
  - "DevOps"
  - "TracePact"
  - "UK"
sources:
  - "https://github.com/dcdeve/tracepact"
---

## TL;DR en langage simple

- TracePact est un framework open source pour tester le comportement d'agents IA. Voir le dépôt : https://github.com/dcdeve/tracepact.
- Idée simple : capturer une "trace de référence" (golden trace) pour un scénario critique. À chaque pull request (PR), rejouer le scénario en intégration continue (CI, Continuous Integration) et comparer les traces.
- Diff structurel (nouvel appel, ordre modifié) = bloquant. Diff de valeur (arguments différents) = avertissement temporaire.
- Démarrez en mode "warn" pendant 14 jours pour apprendre le bruit, puis durcissez les règles.

Exemple concret : un agent IA qui déclenche un déploiement. La golden trace enregistre l'appel au pas « deploy ». Si une PR modifie l'ordre des appels et que "deploy" n'est plus appelé, la gate CI doit bloquer la PR.

## Ce que vous allez construire et pourquoi c'est utile

Objectif : ajouter une gate CI qui protège un flux critique d'un agent IA. Elle détecte les régressions comportementales avant la mise en production. Source du projet : https://github.com/dcdeve/tracepact.

Livrables pour un pilote minimal :

- 1 golden trace pour le happy‑path critique (un fichier par scénario).  
- 1 job CI qui rejoue le scénario pour chaque PR et produit artifacts/trace.json.  
- 1 comparateur qui classe les différences en « structurel » ou « argument ».  
- Politique : fail sur diffs structurels, warn sur diffs d'arguments pendant 14 jours.

Explication simple avant les détails techniques : une "trace" est un enregistrement structuré des actions d'un agent et des appels aux outils. Comparer deux traces permet de voir si l'agent a changé de manière significative. Cette comparaison est plus précise que de vérifier uniquement la sortie finale.

Tableau décisionnel (exemple)

| Type de diff | Impact CI | Action recommandée | Seuils / cible |
|---|---:|---|---:|
| Structurel (nouvel appel, ordre modifié) | Bloque (fail) | Investiguer et rollback si non désiré | 0 changements acceptés / PR |
| Argument (valeurs différentes) | Avertit (warn) | Autoriser pendant 14 jours, puis réévaluer | warn_count moyen <= 2 / PR |
| Bruit (timestamp, session_id) | Ignorer | Normaliser via ignore_keys | ignorer clefs listées (>=2 clefs) |

Mesures suggérées : block_count, warn_count, mean_time_to_detect (ms), mean_time_to_rollback (min). Canary recommandé : 10% des merges avant un déploiement global.

Référence projet : https://github.com/dcdeve/tracepact

## Avant de commencer (temps, cout, prerequis)

Temps estimé pour un pilote (équipe de 2–5 personnes) : 1–2 semaines.
Coût approximatif : configuration CI 8–24 heures/personne. Usage des runners privés : dépend du fournisseur (ex. $0.10 / runner‑hour est une hypothèse illustrative). Stockage des traces : négligeable pour 100–1 000 traces, peut croître selon la rétention.

Prérequis techniques :

- dépôt git avec branche protégée pour la golden ;
- CI modifiable (par ex. GitHub Actions, GitLab CI, Jenkins) ;
- capacité d'exécuter l'agent en mode non‑interactif et d'écrire artifacts/trace.json.

Artefacts à préparer : golden/trace.json (ou ndjson), job CI produisant artifacts/trace.json, emplacement de publication du diff (commentaire PR, artefact CI ou S3).

Source et contexte : https://github.com/dcdeve/tracepact

## Installation et implementation pas a pas

Explication simple avant les détails avancés : vous allez capturer une trace de référence, automatiser la capture sur chaque PR, comparer les traces, puis appliquer une politique (fail/warn). Les étapes ci‑dessous vont vous guider.

1) Capturer la golden trace pour le scénario happy‑path (un fichier par scénario).  
2) Ajouter un job CI qui réexécute ce scénario pour chaque PR.  
3) Exécuter un diff structuré entre golden et nouvelle trace ; classer les différences.  
4) Appliquer la policy : fail sur diffs structurels, warn sur diffs d'arguments pendant 14 jours.

Exemple de capture locale (3 commandes minimalistes) :

```bash
# 1) pinner image, 2) lancer scénario, 3) vérifier artefact
export CI_IMAGE=python:3.11
./run_agent_scenario.sh --scenario=happy_path --out=golden/trace.json
ls -l golden/trace.json
```

Comparaison illustrative (outil local) :

```bash
python tools/trace_diff.py golden/trace.json artifacts/trace.json --summary > diff-summary.txt
cat diff-summary.txt
# Attendre < 500 ms pour l'opération de diff sur traces courtes (objectif)
```

Exemple de workflow GitHub Actions (snippet) :

```yaml
# .github/workflows/trace-gate.yml (illustratif)
name: trace-gate
on: [pull_request]
jobs:
  trace_check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run scenario
        run: ./run_agent_scenario.sh --scenario=happy_path --out=artifacts/trace.json
      - name: Diff traces
        run: python tools/trace_diff.py golden/trace.json artifacts/trace.json --summary
```

Bonnes pratiques rapides :

- Normaliser timestamps et IDs (ex. ignore_keys = ["timestamp","session_id"]).
- Protéger la branche contenant la golden.
- Commencer par warnings et évoluer vers blocages après une période d'apprentissage (ex. 14 jours).

Référence projet : https://github.com/dcdeve/tracepact

## Problemes frequents et correctifs rapides

- Bruit (timestamps, session_id) : ajouter ces clés à ignore_keys et réenregistrer la golden.
- Réordonnements acceptables : rendre la comparaison insensible à l'ordre pour certains appels critiques.
- Flakiness CI : pinner images/versions et exécuter sur la même image que lors de la capture initiale.

Checklist d'investigation rapide :

- Réexécuter localement (latence cible < 200 ms par appel critique pour validation rapide).  
- Vérifier si la golden a été capturée dans une image différente ; si oui, retenter dans la même image.  
- Ajouter règles de normalisation et retester ; viser warn_count moyen <= 2 par PR.

Source : https://github.com/dcdeve/tracepact

## Premier cas d'usage pour une petite equipe

Cible : fondateur·rice solo ou équipe de 1–3 personnes. Plan d'action concret :

1) Capture en 3 commandes : pinner l'image, lancer le scénario, committer la golden. (ex. 3 étapes, 5–15 minutes pour un happy‑path court).  
2) Installer un workflow PR qui commente le résumé du diff et ne bloque pas immédiatement.  
3) Pendant 14 jours : collecter métriques (block_count, warn_count, mean_time_to_detect en ms, mean_time_to_rollback en min). Objectif initial : warn_count moyen <= 2 / PR.

Exemple compact pour capture et commit :

```bash
export CI_IMAGE=python:3.11
./run_agent_scenario.sh --scenario=happy_path --out=golden/trace.json
git add golden/trace.json && git commit -m "Add golden trace" && git push origin main
```

Règles opérationnelles simples :

- Toute modification de golden via PR avec au moins 1 réviseur ;
- Si la gate bloque (>0 diffs structurels), ouvrir un ticket de rollback ; délai cible de rollback < 60 min ;
- Après 14 jours et stabilité (< 2 warnings/PR, 0 failures), promouvoir warnings en blocages.

Voir la page projet pour le cadre conceptuel : https://github.com/dcdeve/tracepact

## Notes techniques (optionnel)

Explication simple d'abord : cette section donne des détails techniques pour rendre la gate plus robuste. Si vous débutez, suivez d'abord le flux minimal décrit ci‑dessus puis revenez aux réglages avancés.

- Trace = enregistrement structuré des actions d’un agent et des appels aux outils (rôle décrit dans le dépôt) : https://github.com/dcdeve/tracepact.
- Exemple de configuration (illustratif) :

```json
{
  "ignore_keys": ["timestamp", "session_id"],
  "critical_tools": ["run_tests", "deploy_step"],
  "max_trace_length": 100,
  "warn_threshold": 2
}
```

Conseils pratiques :

- Pour traces volumineuses : capturez les N premiers appels (N = 50–100) pour la gate rapide et conservez la trace complète pour inspection post‑échec.  
- Si vous capturez des prompts, tronquez à 512 tokens pour limiter stockage et exposition.  
- Performance cible : < 500 ms pour le diff de traces courtes et < 200 ms par appel critique pour validation locale.

Nota : ces exemples sont illustratifs ; vérifiez les noms CLI et la structure exacte dans le dépôt : https://github.com/dcdeve/tracepact

## Que faire ensuite (checklist production)

Référence pour toutes les vérifications : https://github.com/dcdeve/tracepact

- [ ] Valider les noms CLI, flags et clés de config contre le dépôt TracePact (1 tâche prioritaire).  
- [ ] Déployer la gate CI minimale et la faire tourner 14 jours (période pilote recommandée).  
- [ ] Capturer métriques : block_count, warn_count, time-to-detect (ms), time-to-rollback (min).  
- [ ] Affiner les règles de normalisation jusqu’à warn_count moyen <= 2 par PR.  
- [ ] Ajouter une deuxième golden trace pour un autre scénario critique après stabilisation du pilote.

### Hypotheses / inconnues

- Hypothèse : TracePact est décrit comme framework de tests comportementaux pour agents IA (confirmé par la page GitHub : https://github.com/dcdeve/tracepact).  
- Hypothèse : les snippets CLI et les clés JSON dans ce document sont illustratifs et doivent être vérifiés contre la version active du dépôt.  
- Inconnue : format exact des traces (json vs ndjson), hooks d’extension disponibles (comparators/normalizers) et la CLI formelle.

### Risques / mitigations

- Risque : faux positifs dus aux champs éphémères (timestamps, session_id).  
  - Mitigation : normaliser/ignorer ces clés et réenregistrer la golden.  
- Risque : perte de signal si la comparaison devient trop permissive.  
  - Mitigation : définir explicitement critical_tools et conserver l'ordre pour eux.  
- Risque : variation de comportement entre environnements CI.  
  - Mitigation : pinner images/versions, exécuter canary sur 10% des merges avant rollout total.

### Prochaines etapes

- [ ] Valider noms CLI, flags et clefs de config contre le dépôt TracePact : https://github.com/dcdeve/tracepact
- [ ] Lancer pilote 14 jours sur branche protégée (objectif : warn_count <= 2 / PR).  
- [ ] Mesurer et ajuster jusqu’à warn_count <= 2 par PR et 0 block failures non désirés.  
- [ ] Documenter procédure de rollback (objectif : < 60 min pour retour en arrière).

Fin. Consultez le dépôt source pour vérification technique finale : https://github.com/dcdeve/tracepact.
