---
title: "Detent : orchestrer les issues « Ready » d’un projet GitHub avec des worktrees Git isolés et un merge train sérialisé"
date: "2026-06-28"
excerpt: "Detent est un binaire Go unique qui surveille un board GitHub Projects, crée un worktree Git isolé par issue « Ready », exécute un agent de code, passe une porte de validation et place les PR validées dans un merge train sérialisé, avec tableaux de bord web et terminal."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-28-detent-orchestrating-github-projects-ready-issues-with-isolated-git-worktrees-and-a-serialized-merge-train.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "detent"
  - "github"
  - "git"
  - "worktree"
  - "merge-train"
  - "automation"
  - "CI"
  - "agents"
sources:
  - "https://github.com/digitaldrywood/detent"
---

## TL;DR en langage simple

- Detent est un binaire Go unique qui regarde un GitHub Projects board et transforme chaque issue marquée « Ready » en un run isolé. Il crée un git worktree par issue, lance un agent de codage, applique une porte de validation (CI — intégration continue — et approbation humaine) puis aligne les PR (Pull Request, demande de fusion) prêtes dans un merge train visible en web/terminal. Source : https://github.com/digitaldrywood/detent

- Bénéfices : isolation par issue, fusions sérialisées (merge train) et dashboards pour surveiller l’état. Source : https://github.com/digitaldrywood/detent

- Début recommandé : un seul dépôt non critique, un seul board, une colonne « Ready », concurrence = 1. Source : https://github.com/digitaldrywood/detent

- Exemple concret (scénario court) : vous êtes une petite équipe de 2 personnes. Vous configurez Detent sur un dépôt test. Une issue marquée « Ready » déclenche la création d’un worktree, l’agent propose des commits. La PR va à la CI, un relecteur humain approuve, puis la PR entre dans le merge train et fusionne proprement.

## Ce que vous allez construire et pourquoi c'est utile

### Explication simple

Vous allez déployer un orchestrateur qui lit un tableau GitHub Projects. Pour chaque issue « Ready », il :
- crée un git worktree isolé (espace de travail git séparé) ;
- exécute un agent de codage qui propose commits et une Pull Request (PR) ;
- exige des validations (CI et approbation humaine) ;
- aligne les PR prêtes dans un merge train pour les fusionner une à une.

Cette chaîne est décrite dans le dépôt principal : https://github.com/digitaldrywood/detent

### Détails pratiques

- Surveillance : Detent observe un GitHub Projects board et une colonne choisie (ex. « Ready »).
- Isolation : chaque issue reçoit son propre git worktree pour réduire les interférences entre changements.
- Validation : les PR passent par votre CI (intégration continue) et par des relectures humaines avant d’entrer dans le merge train.
- Visibilité : états et progression sont exposés via dashboards web et en terminal.

Pourquoi c’est utile pour de petites équipes : moins d’effets de bord entre branches, fusions ordonnées et traçables, et maintien d’un contrôle humain avant fusion. Source : https://github.com/digitaldrywood/detent

## Avant de commencer (temps, cout, prerequis)

Prérequis minimums :

- Un GitHub Projects board et un dépôt à surveiller. Voir : https://github.com/digitaldrywood/detent
- Un hôte (VM ou serveur) capable d’exécuter un binaire Go et d’utiliser git worktrees.
- Un token GitHub avec permissions sur Projects et le dépôt. Stockez-le en secret.
- Au moins un relecteur humain pour valider les PR générées.

Temps estimé pour un pilote : 1–4 heures pour préparer et démarrer, si les accès et l’hôte sont prêts. Coût : testable sur une VM bas coût (ex. $5–$20/mois selon fournisseur). Source : https://github.com/digitaldrywood/detent

## Installation et implementation pas a pas

La séquence ci‑dessous est un guide d’implémentation. Vérifiez les flags et la syntaxe dans le README upstream : https://github.com/digitaldrywood/detent

1. Créez ou identifiez un GitHub Projects board et créez une colonne « Ready » (1 colonne pilote).
2. Choisissez un dépôt non critique et créez une branche pilote.
3. Provisionnez un hôte et installez le binaire Detent (single Go binary). Pour vérifier :

```bash
# vérifier que le binaire est présent et répondre aux flags
./detent --help
```

4. Préparez un clone propre du dépôt (Detent utilise git worktrees) :

```bash
git clone git@github.com:my-org/my-repo.git
cd my-repo
# vérifiez les worktrees existants
git worktree list
```

5. Fournissez le token GitHub via un gestionnaire de secrets ou un fichier monté. Ne laissez pas le token en clair.
6. Configurez l’URL du board, le repo surveillé et la validation. Exemple de config illustrative (vérifier la syntaxe exacte dans le README du projet) :

```yaml
repo: my-org/my-repo
project_board_url: https://github.com/orgs/my-org/projects/1
watch_column: "Ready"
concurrency: 1
validation:
  require_ci: true
  require_approvals: 1
merge_target: pilot/agent
```

7. Lancez le binaire et suivez les dashboards web/terminal. Source : https://github.com/digitaldrywood/detent

Conseils de pilotage : gardez concurrency bas (1) et bloquez la branche de production pendant le pilote.

## Problemes frequents et correctifs rapides

Comportements attendus et remèdes rapides (référencés depuis le dépôt) : https://github.com/digitaldrywood/detent

| Symptôme | Cause probable | Correctif rapide |
|---|---:|---|
| Detent ne lit pas le board | URL erronée ou token insuffisant | Vérifier l’URL du board et les permissions du token |
| Échec création worktree | Clone local corrompu ou droits FS | Nettoyer le clone, corriger permissions, supprimer worktrees obsolètes |
| Merge train bloqué | CI ou approbation manquante | Inspecter logs CI, demander approbation ou corriger le test |
| PRs de faible qualité | Prompt/agent mal configuré | Exiger validation humaine et améliorer prompts |

Règles opérationnelles simples :

- Si la CI passe → ajouter la PR au merge train.
- Si une review est requise → pause et notifier le relecteur.
- Si échec → ouvrir une issue de suivi et rejeter la PR.

Source : https://github.com/digitaldrywood/detent

## Premier cas d'usage pour une petite equipe

Cible : fondateurs solos et équipes de 1–3 personnes. Guide concret pour un pilote sécurisé. Source : https://github.com/digitaldrywood/detent

1) Scoper strictement le pilote
- Limitez le périmètre à 1 dépôt non critique, 1 board, 1 colonne « Ready ».
- Limitez la durée d’un run d’agent (ex. fenêtre = 120 minutes par issue).
- Pilotez sur 3–5 issues représentatives avant d’élargir.

2) Forcer l’humain avant fusion
- Configurez concurrency = 1 et require_approvals = 1.
- Activez CI obligatoire pour toutes les PRs générées.
- Bloquez la branche de production ; fusionnez d’abord sur une branche pilote.

3) Opérations et observabilité simples
- Désignez un opérateur quotidien pour vérifier dashboards.
- Mesurez 3 métriques : taux de réussite CI des PRs agent, latence médiane du merge train, nombre de PRs rejetées par review.
- Nettoyez les worktrees obsolètes quotidiennement ou après 24–72 heures.

Actions immédiates pour un solo founder :
- Exécuter le pilote pendant 14 jours sur un repo test (3–5 issues).
- Notifier manuellement les approbateurs via Slack/email pour chaque PR.
- Préparer un rollback simple : branche « pilot/agent » + procédure de revert si la CI échoue.

Source : https://github.com/digitaldrywood/detent

## Notes techniques (optionnel)

Architecture synthétique : Detent est livré comme un single Go binary qui orchestre :
- la surveillance d’un GitHub Projects board ;
- la création de git worktrees (un par issue prête) ;
- l’exécution d’un agent de codage ;
- l’application d’une porte de validation (CI + approbation) ;
- la sérialisation des merges via un merge train.

Les états sont exposés en dashboards web et terminal. Source : https://github.com/digitaldrywood/detent

Bonnes pratiques techniques :
- Journaliser localement et centraliser les logs.
- Nettoyer régulièrement les worktrees anciens.
- Vérifier les droits système (FS) du clone.
- Valider les flags CLI et la structure de config dans le README upstream : https://github.com/digitaldrywood/detent

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse centrale : le dépôt décrit un binaire Go unique qui orchestre watch board → worktree → agent → validation → merge train (Source : https://github.com/digitaldrywood/detent).
- Paramètres recommandés à valider pendant le pilote :
  - Timebox single test = 120 minutes
  - Pilote total = 14 jours
  - Taille d’échantillon pilote = 3–5 issues
  - Ressources hôte recommandées (à confirmer) = 2 vCPU, 2 GB RAM, ~5 GB disque libre
  - Usage worktree estimé = 100–500 MB par worktree
  - Concurrence initiale = 1 slot
  - SLA d’examen des échecs CI = 60 minutes
  - Rétention logs proposée = 30 jours
- Les flags CLI exacts et la syntaxe doivent être vérifiés dans le README/release du projet : https://github.com/digitaldrywood/detent

### Risques / mitigations

- Risque : l’agent propose des changements cassés.
  - Mitigation : CI obligatoire + approbation humaine + déployer d’abord sur branche pilote.
- Risque : remplissage disque par worktrees (ex. < 5 GB libre).
  - Mitigation : politique de nettoyage 24–72 heures et alertes sur seuils (alerte si espace libre < 5 GB).
- Risque : fuite de tokens.
  - Mitigation : gestionnaire de secrets, moindre privilège et rotation régulière des tokens.
- Risque : merge train ralenti impactant autres workflows.
  - Mitigation : garder concurrence basse, monitorer latence médiane et augmenter capacité progressivement.

### Prochaines etapes

- Lancer un pilote de 14 jours sur un dépôt test (concurrency = 1). Collecter métriques : taux CI des PRs agent, latence médiane du merge train, nombre de PRs rejetées.
- Tenir une rétro à la fin du pilote et décider d’étendre vers d’autres dépôts/colonnes.
- Durcir pour production : monitoring, journal d’audit, gestionnaire de secrets et runbook d’incident.
- Si passage en production : prévoir scalabilité (hosts multiples, quotas, limites de taux).

Checklist rapide :

- [ ] Pilote réalisé pendant 14 jours
- [ ] Taux CI des PRs agent >= seuil choisi
- [ ] Latence médiane merge‑train acceptable
- [ ] Secrets stockés dans un gestionnaire central
- [ ] Runbook et rollback testés

Référence centrale : https://github.com/digitaldrywood/detent
