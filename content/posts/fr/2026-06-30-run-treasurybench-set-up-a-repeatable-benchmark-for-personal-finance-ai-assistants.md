---
title: "Exécuter TreasuryBench : mettre en place un benchmark répétable pour assistants IA en finance personnelle"
date: "2026-06-30"
excerpt: "Guide pas à pas pour installer TreasuryBench (référentiel GitHub) : configurer une évaluation répétable d'assistants en finance personnelle avec personas synthétiques, lancer des runs pilotes, et sauvegarder des métadonnées pour reproductibilité et comparaisons."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-30-run-treasurybench-set-up-a-repeatable-benchmark-for-personal-finance-ai-assistants.jpg"
region: "US"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "benchmark"
  - "finance-personnelle"
  - "devops"
  - "startup"
  - "développeurs"
sources:
  - "https://github.com/Treasury-Technologies-Inc/treasurybench"
---

## TL;DR en langage simple

- TreasuryBench est un benchmark open‑source pour assistants de finance personnelle ; repo : https://github.com/Treasury-Technologies-Inc/treasurybench
- Objectif principal (d’après la page du dépôt) : évaluer des assistants ou modèles contre des personas synthétiques pour produire des mesures reproductibles (personal‑finance assistant benchmark) — voir https://github.com/Treasury-Technologies-Inc/treasurybench
- Usage résumé : lancer un pilote local, collecter les sorties (logs, run_id, réponses), et utiliser ces artefacts pour comparer fournisseurs ou versions avant un déploiement.

Méthodologie rapide : j’ai extrait la description du dépôt et la reformule en actions opérationnelles basées sur le README du repo : https://github.com/Treasury-Technologies-Inc/treasurybench

## Ce que vous allez construire et pourquoi c'est utile

Vous allez mettre en place un harness d’évaluation basé sur le dépôt https://github.com/Treasury-Technologies-Inc/treasurybench. Le résultat attendu : une suite reproductible qui exécute des scénarios/personas synthétiques contre un ou plusieurs endpoints d’assistants financiers.

Pourquoi c’est utile (points clefs) :

- Comparaisons reproductibles entre fournisseurs ou modèles sur la même suite de personas (fonctionnalité centrale du dépôt : https://github.com/Treasury-Technologies-Inc/treasurybench).
- Base pour contrôles de non‑régression et audits qualité avant rollout.
- Artefacts traçables (logs, run_id, réponses) pour post‑mortem et conservation historique.

Tableau comparatif (décision rapide) :

| Phase | Objectif | Sorties attendues |
|---|---:|---|
| Pilote local | Valider intégration | logs, run_id, échantillon de réponses |
| Baseline CI | Mesurer dérive | historiques, p95/p99, erreurs |
| Canary | Décision de production | métriques gates + exemples de réponses |

Source du dépôt et documentation : https://github.com/Treasury-Technologies-Inc/treasurybench

## Avant de commencer (temps, cout, prerequis)

Référence : https://github.com/Treasury-Technologies-Inc/treasurybench

Prérequis pratiques minimums :

- git installé et accès au dépôt https://github.com/Treasury-Technologies-Inc/treasurybench
- Accès réseau depuis le runner vers vos endpoints d’assistants
- Un emplacement sécurisé pour vos clés/API (ne jamais committer les clés dans le repo)

Estimations de temps (ordre de grandeur) : pilote local rapide = quelques heures ; automatisation de base (CI/cron + archivage) = 1 journée à 2 jours.

Checklist pré‑lancement :

- [ ] Cloner le dépôt et lire le README (https://github.com/Treasury-Technologies-Inc/treasurybench)
- [ ] Préparer un environnement isolé (virtualenv, container) et vérifier la connectivité
- [ ] Placer les clés/API dans un gestionnaire de secrets (variables d’environnement)

Lien utile : https://github.com/Treasury-Technologies-Inc/treasurybench

## Installation et implementation pas a pas

1) Cloner le dépôt et ouvrir la documentation :

```bash
git clone https://github.com/Treasury-Technologies-Inc/treasurybench.git
cd treasurybench
# Ouvrir README.md et scripts dans le repo : https://github.com/Treasury-Technologies-Inc/treasurybench
```

2) Préparer un environnement isolé (venv / container) et installer les dépendances indiquées dans le README du dépôt : https://github.com/Treasury-Technologies-Inc/treasurybench

3) Lancer un pilote court localement pour valider l’intégration et produire des artefacts : logs, run_id, réponses. Conservez ces fichiers pour la traçabilité.

Exemple de fichier de configuration minimal (illustratif) :

```json
{
  "dataset_version": "v1",
  "endpoints": [{ "name": "mon_assistant", "url": "https://api.example/assistant" }],
  "parallelism": 1
}
```

(Remplacez par les formats et champs réels décrits dans le README du dépôt : https://github.com/Treasury-Technologies-Inc/treasurybench)

## Problemes frequents et correctifs rapides

Référence : https://github.com/Treasury-Technologies-Inc/treasurybench

Points de contrôle et solutions rapides :

- Installation qui échoue : isolez l’environnement (virtualenv / container) et relisez les étapes du README du dépôt.
- Erreurs d’authentification HTTP : vérifier variables d’environnement et gestionnaire de secrets. Ne pas committer les clés.
- Harness renvoyant des formats inattendus : inspecter les logs produits par le run_id et comparer avec l’exemple du dépôt.

Bonnes pratiques opérationnelles :

- Conserver le commit SHA du harness utilisé pour chaque run pour assurer reproductibilité.
- Archiver inputs et outputs suffisants pour reproduire un test (en respectant la confidentialité).

Plus de détails et issues : https://github.com/Treasury-Technologies-Inc/treasurybench

## Premier cas d'usage pour une petite equipe

Référence : https://github.com/Treasury-Technologies-Inc/treasurybench

Objectif pour 1–3 personnes : obtenir un signal actionnable avec un minimum d’effort.

Actions concrètes (au moins 3 points actionables pour solo / petite équipe) :

1) Définir 3 personas prioritaires et 5 scénarios critiques par persona. Concentrez‑vous sur les cas qui impactent directement la sécurité financière des utilisateurs.
2) Lancer un pilote local de 10–50 appels (échantillon) pour valider qu’on reçoit bien : run_id, logs, et réponses structurées ; corriger intégration si nécessaire.
3) Automatiser un job simple (CI ou cron) qui exécute ce pilote chaque nuit et archive les résultats dans un bucket ou artefact CI.
4) Mettre en place 2 alertes basiques : échec du job et augmentation brutale du taux d’erreur détecté dans les outputs du run.
5) Documenter la procédure de rollback minimale : référence du commit SHA et endpoint précédent à réactiver.

Checklist opérationnelle exemple :

- [ ] Choisir 3 personas et 5 scénarios par persona
- [ ] Exécuter pilote local et vérifier artefacts
- [ ] Installer un job nocturne qui archive les résultats
- [ ] Définir 2 alertes (job fail / error spike)

Consultez le dépôt pour les scripts d’exécution et formats : https://github.com/Treasury-Technologies-Inc/treasurybench

## Notes techniques (optionnel)

Référence : https://github.com/Treasury-Technologies-Inc/treasurybench

Points techniques à conserver en mémoire :

- Conserver le commit SHA du harness et la version du dataset pour chaque run (garantit comparabilité).
- Ne jamais committer de clés ; limiter l’accès aux artefacts sensibles.
- Enregistrer métriques basiques par run : nombre d’appels, latence moyenne, p95, taux d’erreur, tokens estimés (si applicable).

Voir les artefacts et exemples dans le dépôt : https://github.com/Treasury-Technologies-Inc/treasurybench

## Que faire ensuite (checklist production)

Référence : https://github.com/Treasury-Technologies-Inc/treasurybench

### Hypotheses / inconnues

Les éléments suivants sont des hypothèses opérationnelles et des seuils proposés à valider en testant le dépôt (https://github.com/Treasury-Technologies-Inc/treasurybench) :

- Taille pilote recommandée : 5 personas → montée à 50–200 appels par run pour charge.
- Parallélisme initial proposé : 3 workers ; augmenter par paliers de +2 jusqu’à 10 workers si nécessaire.
- Intervalle de throttling suggéré sans accord : 3000 ms entre appels.
- Plafond budget par run (exemple) : $50 ; alerte à 80% du plafond.
- Seuils gate proposés : error_rate <= 5%, avg_latency_ms <= 3000 ms, harmful_advice_rate <= 1%.
- Progression canary proposée : 1% → 5% → 25% → 100% du trafic.
- Conservation historique recommandée : garder au moins 3 baselines précédentes.
- Paramètres retry/backoff : initial_ms = 500, factor = 2, jitter_ms = 1000, max_retries = 5.

### Risques / mitigations

- Coûts imprévus (tokens / appels) : mitigation → estimer tokens * appels * prix avant run ; stop automatique si dépassement.
- Sorties non déterministes / drift : mitigation → conserver commit SHA, fixer temperature=0 pour tests si applicable, et conserver baselines historiques.
- Fuite de secrets : mitigation → gestionnaire de secrets centralisé et accès limité (<= 5 personnes recommandé).
- Rollback lent : mitigation → automatiser le rollback et tester la procédure en run d’exercice.

### Prochaines etapes

- Cloner le dépôt et exécuter un pilote initial (5–50 appels) : https://github.com/Treasury-Technologies-Inc/treasurybench
- Mettre en place un job qui arrête un run si cost_estimate > $50 ou si error_rate > 5% (paramètres à valider dans l’environnement).
- Intégrer un run baseline dans CI (job nocturne ou gate PR minimal) et conserver 3 dernières baselines.
- Valider plan de canary/rollback en staging en suivant la progression 1% → 5% → 25% → 100% en automatisant les gates.

Pour les détails d’implémentation et les scripts exacts, référez‑vous au README et aux fichiers du dépôt : https://github.com/Treasury-Technologies-Inc/treasurybench
