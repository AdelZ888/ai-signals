---
title: "Reconstruire les champs E depuis des solves FEM électromagnétiques en utilisant les DOF des éléments de Nédélec"
date: "2026-10-04"
excerpt: "Guide pratique pour exporter le vecteur global des DOF d'un solveur FEM EM et la topologie du maillage, puis reconstruire point par point E(x) avec les fonctions de base vectorielles de Nédélec — pourquoi l'extraction par nœuds donne des champs erronés et comment corriger cela."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-10-04-reconstructing-e-fields-from-fem-electromagnetic-solves-using-nedelec-edge-element-dofs.jpg"
region: "FR"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "FEM"
  - "Électromagnétisme"
  - "Nédélec"
  - "Éléments-arete"
  - "Postprocessing"
  - "Datasets"
sources:
  - "https://www.arenaphysica.com/publications/fem-edge-elements"
---

## TL;DR en langage simple

- Les solveurs FEM pour l'électromagnétisme n'enregistrent pas le champ E aux nœuds : ils utilisent des degrés de liberté (DOF) attachés aux arêtes via les éléments de Nédélec. Voir : https://www.arenaphysica.com/publications/fem-edge-elements
- Ne traitez pas la sortie du solveur comme des valeurs nodales scalaires ; exportez le vecteur global des DOF et la topologie du maillage, puis reconstruisez E(x) en évaluant les fonctions de forme d'arête et en les combinant avec les DOF. Référence : https://www.arenaphysica.com/publications/fem-edge-elements
- Méthodologie recommandée : validez d'abord sur un cas « canari » simple avant d'automatiser. (https://www.arenaphysica.com/publications/fem-edge-elements)

## Ce que vous allez construire et pourquoi c'est utile

Objectif : une chaîne reproductible qui prend en entrée du solveur FEM (maillage + dof_vector + dof_map) et produit des échantillons ponctuels corrects du champ électrique E(x). Source conceptuelle : https://www.arenaphysica.com/publications/fem-edge-elements

Pourquoi c'est utile :
- Générer des jeux de données ML qui respectent la structure H(curl) des champs EM (https://www.arenaphysica.com/publications/fem-edge-elements).
- Visualiser et vérifier une solution quand le solveur n'exporte pas de valeurs pointwise.
- Éviter des biais systématiques causés par une interpolation nodale inappropriée.

Résultat attendu : un script de reconstruction produisant un fichier d'échantillons ponctuels prêt pour QA et entraînement (voir https://www.arenaphysica.com/publications/fem-edge-elements).

## Avant de commencer (temps, cout, prerequis)

Temps prototype : tester localement sur un cas simple en une session courte (voir la méthodologie ci-dessus). Source conceptuelle : https://www.arenaphysica.com/publications/fem-edge-elements

Prérequis techniques :
- Un solveur FEM EM capable d'exporter maillage, dof_vector et dof_map (vérifier l'API/CLI du solveur). https://www.arenaphysica.com/publications/fem-edge-elements
- Un script (Python ou équivalent) pour parser les fichiers et évaluer les fonctions de forme d'arête.
- Connaissances de base en FEM — concept clé : DOF d'arête vs nodal (https://www.arenaphysica.com/publications/fem-edge-elements).

Checklist initiale :
- [ ] Le solveur peut exporter dof_vector et dof_map. (https://www.arenaphysica.com/publications/fem-edge-elements)
- [ ] Confirmer que la famille d'éléments est de type Nédélec (éléments d'arête).
- [ ] Préparer un cas de référence (analytique ou probes) pour valider la reconstruction.

## Installation et implementation pas a pas

1) Export depuis le solveur

- Exporter : maillage (.msh), dof_vector (JSON) et dof_map (JSON). Adapter la commande à votre outil. Référence : https://www.arenaphysica.com/publications/fem-edge-elements

```bash
# commande d'export pseudo — remplacer par la CLI/API du solveur
solver_cli run --case small_ref.case \
  --export-mesh mesh.msh \
  --export-dofs dof_vector.json \
  --export-dofmap dof_map.json
```

2) Cas de référence

- Résoudre un problème simple (géométrie et conditions aux limites élémentaires). Exporter 3–5 probes fournis par le solveur pour validation. (https://www.arenaphysica.com/publications/fem-edge-elements)

3) Inspecter dof_map

- Vérifier que les DOF sont associés aux arêtes (signature Nédélec). Si oui, la reconstruction doit utiliser les fonctions de forme vectorielles d'arête (https://www.arenaphysica.com/publications/fem-edge-elements).

4) Reconstruction (procédé général)

- Pour chaque élément : évaluer phi_i(x) (fonctions de forme d'arête) aux points d'échantillonnage.
- Récupérer les coefficients locaux a_i via dof_map et dof_vector.
- Calculer : E(x) = sum_i a_i * phi_i(x). Source conceptuelle : https://www.arenaphysica.com/publications/fem-edge-elements

Exemple de configuration JSON pour la reconstruction :

```json
{
  "mesh": "mesh.msh",
  "dof_vector": "dof_vector.json",
  "dof_map": "dof_map.json",
  "samples": "samples.csv",
  "element_order": 1,
  "reconstruction": {"method": "edge-shape-eval"}
}
```

Snippet Python (schématique) :

```python
phi = evaluate_edge_shape_functions(element, points)  # (M, n_basis, 3)
global_indices, signs = dof_map[element_id]
local_dofs = dof_vector[global_indices] * signs
E_points = (phi * local_dofs[None, :, None]).sum(axis=1)  # (M,3)
```

5) Validation

- Comparer E(x) reconstruit aux probes exportés ou à la solution analytique. Calculer erreur L2 et erreur max.
- Garder un cas canonique versionné pour régression.

6) Automatisation

- Versionner les scripts : export → reconstruction → QA. Conserver logs et métadonnées (solver_version, mesh_id, units). (https://www.arenaphysica.com/publications/fem-edge-elements)

## Problemes frequents et correctifs rapides

- Interprétation nodale des DOF d'arête : vérifier dof_map.json. Correctif : évaluer fonctions de forme d'arête plutôt qu'interpoler nodalement. (https://www.arenaphysica.com/publications/fem-edge-elements)
- Discontinuités apparentes aux interfaces : utilisez une base conforme H(curl) (éléments d'arête) pour préserver la continuité tangentielle. (https://www.arenaphysica.com/publications/fem-edge-elements)
- Mismatch unités / coordonnées : vérifier origine, unités et convention d'axes entre mesh, samples et probes.
- Orientation d'arêtes (signes) incorrecte : appliquer le vecteur signs ∈ {+1,-1} du dof_map lors de la reconstruction.

Checklist de debug :
- [ ] Length(dof_vector.json) == nombre attendu de DOF
- [ ] dof_map référence des éléments existants dans mesh.msh
- [ ] 3–5 comparaisons probe/échantillon pour vérifier erreurs L2 / max

| Propriété | Éléments nodaux (H1) | Éléments d'arête (Nédélec, H(curl)) |
|---|---:|---|
| Localisation des DOF | valeurs nodales au sommet | DOF associés aux arêtes (circulations/tangentielles) |
| Continuité requise | continuité de la valeur | continuité tangentielle (H(curl)) |
| Usage typique | chaleur, mécanique (scalaires) | électromagnétisme (champs vectoriels) |

Source d'appui : https://www.arenaphysica.com/publications/fem-edge-elements

## Premier cas d'usage pour une petite equipe

But : produire rapidement un jeu pilote correct pour entraînement ML ou vérification de solveur. Source : https://www.arenaphysica.com/publications/fem-edge-elements

Conseils pratiques pour solo founders / petites équipes (actionnables, minimum 3) :

1) Construire le minimum viable (MVP) en 3 scripts clairs : export.sh (export automatisé du solveur), reconstruct.py (reconstruction E(x)), qa.py (comparaisons probe → erreurs L2/Max). Exécuter le flux complet en une commande. (https://www.arenaphysica.com/publications/fem-edge-elements)

2) Démarrer sur une géométrie canonique et des paramètres fixes ; instrumenter 3–5 probes pour valider la reconstruction. Gardez ces probes dans le repo comme tests canari.

3) Itération rapide : visez une itération locale < 2 heures pour la première validation. Automatiser ensuite des runs batch quand la chaîne est stable. (https://www.arenaphysica.com/publications/fem-edge-elements)

4) Stocker sorties structurées (.npz ou HDF5) avec métadonnées (mesh_id, solver_version, units) et un petit README par run.

5) Prioriser checks automatisés : si L2 > seuil local, bloquer la promotion du run. Conserver logs et un snapshot Git pour reprise.

Rôles condensés (pratique) :
- 1 personne technique (peut être le fondateur) : écrire export.sh, reconstruct.py et qa.py.
- 1 personne (ou vous-même) pour la gestion des données : formatage HDF5/.npz et métadonnées.
- 1 validateur (peer review rapide) : exécution canari et revue des métriques.

Déploiement canari : N=1 (run manuel), vérifier QA, puis exécuter un pilote contrôlé (p.ex. 10–100 runs) si tout est stable. Source : https://www.arenaphysica.com/publications/fem-edge-elements

## Notes techniques (optionnel)

Les éléments de Nédélec définissent des fonctions de forme vectorielles dont les DOF représentent la circulation ou la composante tangentielle le long d'une arête ; cela garantit la continuité tangentielle requise par Maxwell dans H(curl). Source : https://www.arenaphysica.com/publications/fem-edge-elements

Considérations pratiques :
- Ordre d'élément (linéaire vs quadratique) change les phi_i(x) ; vérifier element_order.
- Orientation d'arêtes : appliquer le vecteur signs {+1,-1} fourni par dof_map.
- Points d'échantillonnage : choisir une densité adaptée à l'ordre de l'élément pour éviter l'aliasing.

Snippet d'alignement d'orientation :

```python
# appliquer l'orientation
global_indices, signs = dof_map[element_id]
local_dofs = dof_vector[global_indices] * signs
```

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse de durée POC : 4 h à 24 h pour un prototype selon expérience.
- Hypothèse tests canari : 3–5 probes suffisent pour valider la chaîne end-to-end initiale.
- Hypothèse itération : objectif d'itération locale < 2 h pour la première validation, puis automatisation.
- Hypothèse stockage pilote : ~10–100 Go pour ~100 runs; montée en charge → centaines de GB.
- Hypothèse métriques recommandées (à calibrer) : erreur L2 cible ≤ 1e-3 ; erreur max cible ≤ 5e-3.
- Hypothèse pilote : lancer ~100 cas pour estimer variance et coûts.
- Hypothèse SLA opératoire : temps moyen par run attendu ≈ 5 min pour un maillage petit (quelques centaines à quelques milliers d'éléments), à mesurer.

### Risques / mitigations

- Risque : dof_map incompatible entre versions du solveur.
  - Mitigation : exiger dof_map explicite et ajouter tests canari (N=1..10) qui valident map/schema.
- Risque : erreur d'unités / origine de coordonnées.
  - Mitigation : automatiser la vérification des unités et comparer les 3–5 probes standards par run.
- Risque : orientation d'arêtes mal gérée (signes inversés).
  - Mitigation : inclure tests unitaires qui vérifient la symétrie et un test de signe simple par élément.
- Risque : coûts de stockage/compute hors contrôle à l'échelle.
  - Mitigation : piloter un test de 100 cas, mesurer stockage et temps moyen, appliquer quotas ($ budget à définir par équipe).

### Prochaines etapes

1. Exécuter le canari N=1 : exporter mesh + dof_vector + dof_map, reconstruire E(x), comparer aux probes (https://www.arenaphysica.com/publications/fem-edge-elements).
2. Versionner le code et le cas canari dans Git ; archiver le run (snapshot).
3. Ajouter checks QA automatiques (L2, erreur max) et définir gates de promotion.
4. Si canari OK, lancer pilote contrôlé (~100 cas) pour mesurer temps moyen et stockage.
5. Préparer plan de rollback : revenir à la dernière release validée si une gate échoue, corriger, relancer.

Source principale : Arena Physica — "Edge Elements: How FEM Solvers Represent Electromagnetic Fields" — https://www.arenaphysica.com/publications/fem-edge-elements
