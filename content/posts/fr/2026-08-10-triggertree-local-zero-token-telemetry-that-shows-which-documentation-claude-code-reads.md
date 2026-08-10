---
title: "trigger_tree — Télémétrie locale et zéro-jeton montrant quels documents Claude Code lit"
date: "2026-08-10"
excerpt: "Ajoutez trigger_tree à votre dépôt pour collecter de la télémétrie par exécution, 100 % locale et sans jetons. Produisez cartes de chaleur/froid, une note de santé numérique et des preuves pour guider des corrections de routeurs ou de docs."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-10-triggertree-local-zero-token-telemetry-that-shows-which-documentation-claude-code-reads.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "trigger_tree"
  - "télémétrie"
  - "Claude Code"
  - "documentation"
  - "CI"
  - "GitHub Actions"
  - "local-first"
  - "zéro-tokens"
sources:
  - "https://github.com/Hedde/trigger_tree"
---

## TL;DR en langage simple

- trigger_tree est un outil de télémétrie pour Claude Code qui produit des heat/cold maps, une "health grade" et des recommandations pour corriger des routeurs, en fonctionnement 100 % local et "zero tokens" selon le dépôt : https://github.com/Hedde/trigger_tree.

- Objectif immédiat : exécuter trigger_tree dans un job CI sur une branche de test, récupérer des artefacts lisibles (heatmap, health grade, decision-table.csv) et n'ajouter aux commits que des résumés révisés.

Checklist rapide (exemple) :
- Créer une branche de test et ajouter un workflow CI qui exécute trigger_tree (ou l'outil local équivalent) : 1 branche, 1 workflow.
- Récupérer les artefacts (heatmap, health grade, decision-table.csv) depuis le job CI (rétention recommandée d'exemple : 14 jours).
- Faire une modification réversible, relancer et comparer (3 runs de confirmation recommandés comme bonne pratique).

Méthodologie courte : baser les décisions sur exécutions et artefacts locaux (voir le repo pour l'intention) : https://github.com/Hedde/trigger_tree.

## Ce que vous allez construire et pourquoi c'est utile

Ce que vous obtiendrez : par exécution, des sorties lisibles indiquant quels fichiers de votre dépôt ont été consultés par l'agent (heatmap, grade, tables de décision) — fonctionnalités décrites dans le dépôt : https://github.com/Hedde/trigger_tree.

Utilité pratique :
- Remplacer des hypothèses par des preuves par exécution (quel fichier a réellement été lu).
- Prendre des changements petits, réversibles et auditables (tweak de routeur, déplacer une page de doc).
- Mesurer l'impact sur plusieurs runs (par ex. 3 runs minimum pour confirmation).

## Avant de commencer (temps, cout, prerequis)

Prérequis minimaux :
- Un dépôt où vous pouvez ajouter un workflow CI (GitHub Actions recommandé) : https://github.com/Hedde/trigger_tree.
- Autorisation pour exécuter GitHub Actions ou un runner CI capable d'exécuter des binaires locaux.
- Une branche de test jetable et permissions pour uploader des artefacts CI.

Consignes de sécurité/confidentialité :
- Ne commitez pas de traces brutes dans le dépôt. Stockez-les comme artefacts CI restreints (ex. retention-days: 14).
- Partagez uniquement des résumés validés (heatmap, health grade, decision-table.csv).

Estimation rapide (point de départ) : installation et premier run ~60 minutes, job ciblé <300 s (5 minutes) si vous limitez la portée. Ces valeurs sont à valider dans votre contexte et figurent parmi les hypothèses listées plus bas. Voir le projet : https://github.com/Hedde/trigger_tree.

## Installation et implementation pas a pas

1) Choisir un répertoire d'artefacts (ex. diagnostics/trigger_tree). Ne commitez pas les traces brutes.

2) Exemple de workflow GitHub Actions (ajoutez le fichier dans .github/workflows/) :

```yaml
name: trigger_tree diagnostics
on:
  push:
    branches: [ test-trigger-tree ]
  workflow_dispatch: {}

jobs:
  trigger_tree_run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run trigger_tree (example)
        run: |
          mkdir -p diagnostics/trigger_tree
          # lancer l'outil local qui écrit des résumés dans diagnostics/
          ./tools/trigger_tree --output diagnostics/trigger_tree
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: trigger_tree-diagnostics
          path: diagnostics/trigger_tree
          retention-days: 14
```

3) Commandes de base pour démarrer (exemple) :

```bash
git checkout -b test-trigger-tree
git add .github/workflows/trigger_tree.yml
git commit -m "Add trigger_tree diagnostics workflow"
git push --set-upstream origin test-trigger-tree
# déclencher via workflow_dispatch ou en poussant
```

4) Example de CSV lisible par un réviseur (decision-table.csv) :

| file_path | read_count | suggested_action |
|---|---:|---|
| docs/guide.md | 18 | promote_to_index |
| CONTRIBUTING.md | 2 | deprioritize |

5) Inspecter les artefacts : télécharger la heatmap, la note de santé et decision-table.csv depuis l'onglet Artifacts du job CI, puis appliquer un petit changement et relancer.

Ressource et intention du projet : https://github.com/Hedde/trigger_tree.

## Problemes frequents et correctifs rapides

- Aucune sortie produite
  - Vérifier le log CI pour l'étape de l'outil, confirmer le chemin et le code de sortie.
- Heatmap tout "froid"
  - Reproduire avec une requête ciblée connue ; vérifier que l'agent a bien exécuté la session.
- Fichiers inattendus référencés
  - Normaliser les chemins dans le job CI (résoudre symlinks, définir la racine du repo).
- Coût CI élevé
  - Restreindre l'exécution aux branches de test, réduire la rétention (ex. 7–14 jours), exécuter runs courts (<300 s idéalement).

Pour l'intention et les artefacts décrits : https://github.com/Hedde/trigger_tree.

## Premier cas d'usage pour une petite equipe

Objectif : pour un solo founder ou une petite équipe (1–3 personnes), vérifier rapidement si l'agent lit le README et agir avec minimum de friction.

Conseils concrets et actionnables (au moins 3) :
1) Prioriser un seul fichier cible et un seul changement : exemple concret — focalisez-vous sur README.md. Générer 1 run smoke, inspecter decision-table.csv, agir si read_count < 5 (seuil pratique).
2) Minimiser le coût et la complexité : utilisez workflow_dispatch pour lancer manuellement et limiter à 1 run par test, réduire retention-days à 7 et garder le job <300 s pour contrôler les coûts CI.
3) Automatiser le feedback minimal : exportez uniquement la heatmap PNG et decision-table.csv (moins de 1 Mo si possible) pour revue rapide ; committez seulement la modification réversible (routeur tweak ou déplacement de 1 fichier).
4) Boucle courte de validation : appliquer la modification, relancer 3 runs consécutifs, comparer la variation de read_count et health_grade (si disponible) avant de promouvoir.
5) Si vous êtes solo : basculez le canary à 100 % local d'abord (tests manuels), puis 10 % des sessions si vous automatisez un déploiement progressif.

Checklist rapide :
- [ ] Ajouter le workflow sur une branche de test privée
- [ ] Lancer une session smoke et collecter les artefacts
- [ ] Inspecter la heatmap et decision-table.csv pour le fichier choisi
- [ ] Appliquer un petit changement réversible et relancer (3 runs)

Documentation et intention du projet : https://github.com/Hedde/trigger_tree.

## Notes techniques (optionnel)

Résumé technique : le dépôt indique que l'outil produira des heat/cold maps, une health grade et des corrections de routeurs appuyées par preuves, le tout en exécution locale (100 % local, zero tokens) : https://github.com/Hedde/trigger_tree.

Exemple simple de fichier de seuils (illustratif) :

```yaml
# thresholds.yaml (exemple)
health_grade_min: 60      # score minimal acceptable
min_runs: 3               # nombre minimal de runs pour décision
cold_threshold_reads: 5   # lectures <5 => "froid"
promote_reads: 20         # lectures >=20 => considérer promotion
```

Conserver ces seuils dans la CI permet d'échouer un job ou d'ouvrir une alerte si les métriques ne sont pas atteintes. Voir le dépôt pour l'intention : https://github.com/Hedde/trigger_tree.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Le dépôt revendique heat/cold maps et health grade en local, ainsi que des recommandations : source officielle : https://github.com/Hedde/trigger_tree. Les chiffres ci‑dessous sont des hypothèses opérationnelles à valider dans votre contexte.
- Temps d'installation initiale estimé : ~60 minutes.
- Taille d'exemple utilisée pour l'estimation : ~100 fichiers.
- Nombre recommandé de runs de confirmation : 3 runs.
- Seuil « froid » proposé : < 5 lectures.
- Seuil « promotion » proposé : >= 20 lectures.
- Couverture docs déclenchant audit : 30 % (hypothèse).
- Fraction canary recommandée : 10 %.
- Rétention d'artefacts par défaut suggérée : 14 jours.
- Durée cible d'un job pour limiter coût : < 300 s (5 minutes).
- Gate health_grade proposé : >= 60 et amélioration minimale de +10 points pour élargir un déploiement.

### Risques / mitigations

- Risque : artefacts contiennent données sensibles.
  - Mitigation : ne pas committer les traces brutes, restreindre l'accès aux artefacts CI, n'exposer que les résumés.
- Risque : augmentation des minutes CI / coûts ($). 
  - Mitigation : exécuter sur branches de test, réduire retention-days (7–14), limiter la durée du job à <300 s.
- Risque : sur-ajustement à requêtes synthétiques.
  - Mitigation : exiger min_runs = 3 et tester en canary (10 % des sessions) avant déploiement large.
- Risque RGPD / données personnelles.
  - Mitigation : anonymiser/filtrer les entrées utilisateur et limiter l'accès aux artefacts.

### Prochaines etapes

- Ajouter le workflow trigger_tree sur une branche de test privée et pousser le commit (voir : https://github.com/Hedde/trigger_tree).
- Exécuter le nombre de sessions recommandé (3) et collecter les artefacts : heatmap, health grade, decision-table.csv.
- Examiner les preuves et appliquer une seule modification petite et réversible (routeur ou doc).
- Lancer un canary (suggestion : 10 %), surveiller l'impact, et étendre si la health_grade augmente de >=10 points.

Ressource principale : https://github.com/Hedde/trigger_tree
