---
title: "Agon — exécuter des agents IA concurrents dans des worktrees Git isolés et appliquer automatiquement les corrections validées"
date: "2026-08-07"
excerpt: "Installez Agon pour lancer plusieurs modèles de code IA sur la même tâche dans des worktrees Git isolés, valider les propositions, appliquer automatiquement le gagnant et suivre la compétence des modèles avec Glicko-2 pour router le travail futur."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-07-agon-run-competing-ai-code-agents-in-isolated-git-worktrees-and-auto-apply-validated-fixes.jpg"
region: "FR"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "développement"
  - "automatisation"
  - "git"
  - "open-source"
sources:
  - "https://github.com/KERNlang/agon"
---

## TL;DR en langage simple

- Agon met plusieurs modèles d'IA en concurrence sur la même tâche, chaque tentative s'exécute dans un worktree Git isolé; le gagnant peut être appliqué automatiquement et un classement Glicko‑2 suit les performances. Source : https://github.com/KERNlang/agon
- Usage typique : un runner lance des contests, un harness de validation (script) juge la proposition, et Agon applique le changement si les règles sont respectées. Source : https://github.com/KERNlang/agon
- Recommandation rapide pour évaluer : démarrer par un PoC court et timeboxed, vérifier tests + linter avant tout auto‑apply, et limiter l'impact des modifications (isoler fichiers). Méthodologie : ce guide synthétise l'instantané public du dépôt Agon (https://github.com/KERNlang/agon).

## Ce que vous allez construire et pourquoi c'est utile

Vous allez monter un pipeline minimal inspiré d'Agon qui : lance des agents (modèles), exécute chaque proposition dans un worktree Git isolé, valide la proposition via un script (harness) et applique le meilleur changement automatiquement quand les règles sont satisfaites. Les concepts-clés (worktrees, sélection du gagnant, leaderboard Glicko‑2) sont décrits dans le dépôt : https://github.com/KERNlang/agon

Pourquoi c'est utile pour une petite équipe : répétabilité des expérimentations, métriques objectives pour mesurer quel modèle produit les meilleurs correctifs, et automatisation pour réduire les reviews manuelles sur petites tâches. Conserver la branche principale propre grâce aux worktrees réduit le risque de régressions et facilite le rollback. Source : https://github.com/KERNlang/agon

## Avant de commencer (temps, cout, prerequis)

Prérequis techniques (vérifiés contre le dépôt Agon) :

- Git avec support des worktrees (Agon isole les tentatives dans des worktrees) — https://github.com/KERNlang/agon
- Un dépôt cible contenant un harness/validate script qui renvoie 0 sur succès
- Accès aux endpoints de modèles (clés API stockées en secrets CI)
- Un compte de service/bot avec droits limités pour merges/auto‑applies

Checklist de préparation :

- [ ] Cloner https://github.com/KERNlang/agon
- [ ] Ajouter les clés API aux secrets du runner
- [ ] Préparer quelques tâches PoC courtes (idéalement 1 fichier modifié)
- [ ] Créer un agon-config.yaml minimal à la racine

Estimation temporelle indicative : PoC initial 3 heures, campagne de staging 14 jours (valeurs heuristiques à valider localement). Voir le dépôt pour le design général : https://github.com/KERNlang/agon

## Installation et implementation pas a pas

Résumé : cloner Agon, adapter agon-config.yaml, créer un script de validation, puis exécuter le runner localement ou dans CI. Référence : https://github.com/KERNlang/agon

1) Cloner le dépôt et lire le README :

```bash
git clone https://github.com/KERNlang/agon
cd agon
less README.md
```

2) Préparer le dépôt cible et un script de validation simple (doit renvoyer 0 si tout passe). Exemple de validate.sh :

```bash
# scripts/validate.sh
#!/bin/sh
pytest -q || exit 2
eslint . || exit 3
exit 0
```

3) Exemple minimal d'agon-config.yaml (adapter endpoints et secrets) :

```yaml
# agon-config.yaml (exemple minimal)
agents:
  - name: model-a
    endpoint: "https://api.example.com/v1"
  - name: model-b
    endpoint: "https://api.other/v1"
task:
  validate: ./scripts/validate.sh
  max_lines_auto_apply: 5
ratings:
  initial_rating: 1500
  minimum_contests: 10
```

(Structure et concepts inspirés du dépôt : https://github.com/KERNlang/agon.)

4) Lancer le runner localement (commande d'exemple — adapter au binaire fourni dans le dépôt) :

```bash
./bin/agon run --config ./agon-config.yaml --tasks ./poc-tasks
```

5) Intégration CI (exemple GitHub Actions) — garder les clés dans secrets :

```yaml
# .github/workflows/agon-run.yml
on: [issues]
jobs:
  run-agon:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Agon
        run: |
          ./bin/agon run --config agon-config.yaml
        env:
          API_KEY: ${{ secrets.MODEL_API_KEY }}
```

Mesures utiles à collecter après chaque contest : taux de merge (%), nombre de reverts (count), latence des runs (ms), coût API par jour ($), évolution du leaderboard Glicko‑2 (score). Ces mesures aident à décider du routage futur (concepts présents dans le dépôt : https://github.com/KERNlang/agon).

## Problemes frequents et correctifs rapides

Symptômes courants et actions rapides (référence conceptuelle : https://github.com/KERNlang/agon) :

- Conflits de worktree : sérialiser les tasks qui touchent les mêmes fichiers ou refuser l'auto‑apply et créer une PR. Si >2 conflits/jour, passez en mode sérialisé.
- Auto‑merge indésirable : exiger revue humaine pour changements volumineux (par ex. >20 lignes ou >2 fichiers). 
- Bruit dans les ratings : augmenter minimum_contests (ex. ≥10–20) avant de router automatiquement.
- Pics de coûts API : throttle et alertes budgétaires (détecter si dépense journalière > $200).

Correctifs pratiques :

- Détecter modifications concurrentes et basculer automatiquement en PR lors de collisions.
- Re-run tests jusqu'à 3 tentatives avec backoff exponentiel pour tests intermittents.
- Mettre en place quotas (par ex. 100 requêtes/heure par agent) et token bucket pour limiter tokens consommés.

## Premier cas d'usage pour une petite equipe

Public visé : fondateurs solo et petites équipes (1–4 développeurs). Objectif : automatiser correctifs mineurs et réduire la charge des revues manuelles. Source : https://github.com/KERNlang/agon

Plan d'action pragmatique (3 actions concrètes) :

1) PoC timeboxed
- Lancez un PoC court (par ex. 3 heures) pour valider l'intégration. Travaillez sur 3–5 tâches courtes et répétables (préférer 1 fichier modifié par tâche).

2) Guardrails stricts avant auto‑apply
- N'autorisez l'auto‑apply que si le script de validation renvoie 0 et si la modification reste limitée (heuristique : ≤5 lignes ou 1 fichier). Sinon créer automatiquement une PR pour revue humaine.

3) Surveillance simple et rollback
- Configurez alertes de base (ex. notification si un merge est reverté plus d'une fois dans 24 h) et un rollback automatique en cas d'échec critique détecté après merge.

Table de décision opératoire (heuristiques pour petite équipe) :

| Taille (lignes) | Fichiers touchés | Action |
|---:|---:|---:|
| 0–5 | 1 | Auto‑apply si tests passent
| 6–20 | 1–2 | Créer PR ; 1 reviewer requis
| >20 ou >2 fichiers | any | Revue humaine requise |

Source pour le concept d'isolation et orchestration : https://github.com/KERNlang/agon

## Notes techniques (optionnel)

- Isolation : chaque proposition s'exécute dans un worktree Git séparé — cela protège la branche principale et facilite rollback. Source : https://github.com/KERNlang/agon
- Ratings : Agon applique un système de notation (Glicko‑2) pour suivre les performances des agents ; initial_rating couramment utilisé ≈1500, et on recommande généralement minimum_contests non nul pour réduire le bruit. Source : https://github.com/KERNlang/agon
- Sécurité : considérez la sortie des modèles comme code non fiable — exécutez SAST, scans secrets et limitez les droits du bot/service. Source : https://github.com/KERNlang/agon
- Scalabilité : augmentez les seuils (minimum_contests) et la télémétrie si vous montez à +10 agents pour réduire variance et oscillations de routage.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Confirmé dans le snapshot : Agon met en concurrence des modèles dans des worktrees Git isolés, sélectionne un gagnant qui peut être auto‑appliqué, et suit les modèles via Glicko‑2 — https://github.com/KERNlang/agon.
- Hypothèses opérationnelles (à valider localement) : PoC ≈ 3 heures, campagne de staging ≈ 14 jours, canary progressif 5% → 20% → 100%, alerte budget journalière $200, throttle ≈100 req/h par agent, quota tokens ≈10k tokens/jour, minimum_contests = 10. Ces chiffres sont des heuristiques et doivent être testés.
- Détails techniques à confirmer dans le dépôt vivant : format exact d'agon-config.yaml, emplacement/binaire du runner, et valeurs par défaut de Glicko‑2 — consultez https://github.com/KERNlang/agon pour la version la plus récente.

### Risques / mitigations

- Risque : code incorrect auto‑appliqué — Mitigation : exiger tests unitaires + linter, gates canary (p. ex. 5% pendant 48 h puis 20% pendant 72 h), et surveillance post‑merge.
- Risque : notes bruitées si trop peu de contests — Mitigation : n'activer le routage automatique qu'après >=10 contests par agent.
- Risque : coûts API élevés — Mitigation : quotas journaliers (ex. 10k tokens/jour), throttle (100 req/h), et alertes si dépense > $200/jour.
- Risque : conflits de worktree — Mitigation : sérialiser tâches qui modifient les mêmes fichiers ou forcer création de PR.

### Prochaines etapes

- [ ] Lancer un PoC timeboxed (3 h) : cloner https://github.com/KERNlang/agon, ajouter agon-config.yaml, exécuter 2 modèles sur 3–5 tâches courtes.
- [ ] Mener une campagne de staging (≈14 jours) pour collecter métriques : taux de merge réussi (%), nombre de reverts (count), latence des runs (ms), coût par jour ($).
- [ ] Implémenter canary progressif si les gates tiennent : 5% pendant 48 h → 20% pendant 72 h → 100% après validation.
- [ ] Activer le routage seulement quand un agent atteint >=10 contests et que la variance des scores est stable.

Référence principale : https://github.com/KERNlang/agon

(Mémo : ce guide synthétise l'instantané public du dépôt Agon ; validez les valeurs opérationnelles en local.)
