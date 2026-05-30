---
title: "Conductor : orchestration déterministe YAML‑first pour workflows multi‑agents IA"
date: "2026-05-30"
excerpt: "Guide pratique (contexte Royaume‑Uni) expliquant Conductor — un CLI open‑source de Microsoft — qui encode l'orchestration multi‑agent en YAML et Jinja2 pour obtenir des exécutions reproductibles et plus faciles à tester. Comprend exemple minimal, étapes d'installation, dépannage et checklist de mise en production."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-30-conductor-yaml-first-deterministic-orchestration-for-reproducible-multi-agent-ai-workflows.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "Conductor"
  - "orchestration"
  - "multi-agent"
  - "YAML"
  - "Jinja2"
  - "IA"
  - "open-source"
  - "devops"
sources:
  - "https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/"
---

## TL;DR en langage simple

- Conductor est un outil open‑source (CLI — interface en ligne de commande) sous licence MIT. Il orchestre des workflows multi‑agents définis en YAML (un format de configuration lisible). L'orchestration est déterministe : mêmes entrées → mêmes sorties. Jinja2 sert pour l'évaluation des expressions et des branchements. (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/)
- Pourquoi l'utiliser : contrôle et reproductibilité. Vous décrivez le routage et les dépendances de façon déclarative au lieu de laisser un grand modèle de langage (LLM — large language model) décider dynamiquement. Cela facilite les tests, l'intégration continue (CI) et la traçabilité. (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/)
- Test rapide conseillé : créez un petit workflow YAML et exécutez‑le plusieurs fois localement contre des stubs (endpoints factices) pour vérifier la reproductibilité. (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/)

Exemple concret (scénario court) : vous avez un pipeline de revue de code automatisée. Étape 1 : linter (vérifie le style). Étape 2 : correcteur (propose des corrections). Étape 3 : résumé des changements. Avec Conductor, vous décrivez ces étapes en YAML, liez les sorties aux entrées suivantes, et obtenez trois exécutions identiques si les entrées sont identiques.

Plain‑language avant les détails avancés : Conductor vous donne une feuille de route claire pour séquencer des services. Vous listez les étapes et les dépendances. Un moteur exécute les étapes dans l'ordre défini. Les conditions (if/else) utilisent des templates Jinja2, pas une intelligence qui décide au fil de l'eau. Le résultat : moins de surprises en production.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez produire un pipeline « YAML‑first » qui orchestre plusieurs agents spécialisés. Un agent est un service qui reçoit une requête et renvoie du JSON. Conductor vous permet de :

- Définir les étapes et le routage dans un fichier YAML. (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/)
- Gérer les conditions et les branches avec Jinja2 (templates d'expression). (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/)
- Obtenir un comportement déterministe : des mêmes entrées produiront les mêmes sorties si les agents sont eux‑mêmes déterministes. (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/)

Pourquoi c'est utile :

- Reproductibilité des runs. Utile pour debug et conformité.
- Tests plus faciles et intégration continue (CI) plus fiable.
- Traçabilité : chaque étape et son input/output sont explicites.

Comparatif synthétique :

| Critère | Orchestration déclarative (YAML) | Orchestration dynamique (LLM) |
|---|---:|---:|
| Reproductibilité | Élevée (déclarative) | Variable |
| Contrôle des branches | Déclaratif (Jinja2) | Décisionnel (LLM) |
| Facilité de tests | Favorable (CI friendly) | Plus complexe |

(source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/)

## Avant de commencer (temps, cout, prerequis)

Prérequis techniques simples :

- Confort en ligne de commande et Git. (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/)
- Savoir lire/écrire YAML. Connaissances de base en Jinja2 (templates) sont utiles. (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/)
- Capacité à exécuter des stubs HTTP locaux (pour isoler les agents lors du prototypage).

Temps estimé : un prototype simple peut être construit en ≈ 60 minutes pour cloner, lire le README et lancer un exemple local. Coût : nul si vous utilisez des stubs locaux ; coût d'API réel dépendra de vos agents externes.

## Installation et implementation pas a pas

Explication simple avant les détails : l'idée générale est d'installer le CLI Conductor, de définir des endpoints pour chaque agent (stubs ou services réels), d'écrire un fichier YAML qui décrit les étapes, puis d'exécuter et vérifier que l'exécution est identique quand l'entrée l'est.

Étapes claires :

1. Cloner le dépôt officiel et lire le README pour la version et les prérequis.

```bash
git clone https://github.com/microsoft/conductor.git
cd conductor
# lire README.md et suivre l'installation de la CLI indiquée
```

2. Installer la CLI indiquée dans le README et vérifier la version.

```bash
# commande illustrative — vérifier README du repo pour la commande exacte
./conductor --version
```

3. Préparer des stubs HTTP locaux pour vos agents (pour les tests). Démarrez 1–3 stubs simples retournant JSON ou utilisez des endpoints mock.

4. Écrire un workflow YAML minimal en vous appuyant sur la syntaxe du projet (Jinja2 pour les expressions). Exemple minimal illustratif :

```yaml
id: example_workflow
inputs:
  - text
steps:
  - id: step_lint
    agent: linter
    inputs:
      text: "{{ inputs.text }}"
  - id: step_summary
    agent: summarizer
    run_after:
      - step_lint
    inputs:
      lint: "{{ steps.step_lint.output }}"
```

Note : les clés exactes et options peuvent varier selon la version du CLI. Consultez le README du dépôt. (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/)

5. Lancer le workflow localement contre vos stubs et inspecter la sortie. Répétez la même exécution plusieurs fois avec le même payload pour vérifier la stabilité.

```bash
# commande illustrative pour exécution locale
conductor run --workflow example_workflow.yaml --input '{"text":"Bonjour"}' --verbose
```

6. Ajouter un test automatisé et un job CI qui exécute le workflow sur des entrées canoniques et compare les sorties pour détecter toute non‑répétabilité.

## Problemes frequents et correctifs rapides

(Solutions pratiques basées sur le modèle d'orchestration décrit.)

- Jinja2 n'évalue pas une expression : validez le template hors exécution. Prévisualisez avec un contexte de test.
- Une branche n'est pas prise : activez le mode verbose et inspectez les valeurs d'entrée/intermédiaires pour confirmer la condition.
- Résultats non déterministes : stubbez l'agent et relancez. Vérifiez que l'agent ne génère pas d'aléa (seed manquant, horodatage, etc.).

Commandes utiles (exemples génériques) :

```bash
# validation syntaxique hypothétique
conductor lint --workflow example_workflow.yaml
# exécution verbose pour debug
conductor run --workflow example_workflow.yaml --input '{"text":"x"}' --verbose
```

(source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/)

## Premier cas d'usage pour une petite equipe

Public cible : fondateur·rice solo ou petite équipe (2–4 personnes). Objectif : prototype rapide, coûts faibles.

Plan d'action concret :

1. Prototyper localement avec stubs pour chaque agent. Cela évite les coûts d'API durant la mise au point.
2. Démarrer avec un workflow très simple (2–4 étapes). Revoir et complexifier progressivement.
3. Désigner une personne responsable du workflow initial pour gérer les changements et la documentation.
4. Ajouter un job CI minimal : exécuter le workflow sur des entrées de référence et comparer les sorties.

Ces étapes permettent d'obtenir un prototype utile rapidement sans infrastructure lourde. (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/)

## Notes techniques (optionnel)

Points techniques clés extraits de l'annonce officielle :

- Conductor propose une approche déclarative (YAML) pour orchestrer des workflows multi‑agents. (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/)
- Jinja2 est utilisé pour l'évaluation d'expressions et le routage conditionnel. (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/)
- Projet livré comme CLI open‑source dans l'organisation Microsoft, licence MIT. (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/)

Bonnes pratiques recommandées : instrumenter chaque étape (latence, erreurs), stocker logs et entrées/sorties canoniques, stubber les agents externes lors des tests unitaires.

Exemple illustratif de métriques (format YAML) :

```yaml
metrics:
  collect_per_step: true
  latency_buckets_ms: [50,100,200,500,1000,2000]
```

## Que faire ensuite (checklist production)

- [ ] Cloner le dépôt Conductor et lire le README officiel (vérifier la version CLI et les options). (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/)
- [ ] Écrire un workflow minimal et valider localement contre des stubs.
- [ ] Ajouter un job CI qui exécute les mêmes entrées et compare les sorties.
- [ ] Mettre en place collecte des métriques et des logs par étape.
- [ ] Migrer les secrets vers un gestionnaire sécurisé avant toute mise en production.

### Hypotheses / inconnues

Les éléments ci‑dessous sont des hypothèses pour démarrer ; ils ne sont pas détaillés dans le billet source :

- Nombre de stubs pour prototypage : 3 (hypothèse : ports 9001–9003).
- Taille initiale recommandée du workflow : ≤ 6 étapes pour faciliter la revue.
- Répétitions de test local recommandées : 5 runs identiques pour une vérification rapide ; 50 runs en CI pour durcir la régression.
- Objectifs opérationnels exemples : 95% des étapes sous 500 ms, 90e percentile < 2000 ms.
- Timeout par étape d'exemple : 30 000 ms (30 s) (hypothèse).
- Estimation coût d'un petit jeu d'appels API réels pour test : £8–£12 (~$10) (hypothèse).
- Stratégie de rollout proposée : canary 10% trafic ; rollback si erreurs > 5% (hypothèses).

### Risques / mitigations

- Risque : non‑déterminisme venant des agents externes (modèles non seedés). Mitigation : stubber en tests, exiger seed fixe et contrôle temporel côté agent, et inclure tests répétitifs en CI.
- Risque : fuite de secrets depuis YAML. Mitigation : utiliser un gestionnaire de secrets (Vault / Key Vault) et ne pas stocker les secrets en clair dans le dépôt.
- Risque : latences élevées à l'échelle. Mitigation : instrumenter dès le départ, définir timeouts (p.ex. 30 s) et seuils d'alerte, et optimiser les agents critiques.

### Prochaines etapes

1. Cloner le dépôt Conductor et lire le README officiel pour obtenir la version exacte et les sous‑commandes du CLI. (source: https://opensource.microsoft.com/blog/2026/05/14/conductor-deterministic-orchestration-for-multi-agent-ai-workflows/)
2. Créer un repo de démarrage contenant : un workflow d'exemple, 3 stubs Dockerisés (ports hypothétiques 9001–9003) et un script CI qui exécute 50 runs en stage et rapporte pass/fail.
3. Valider les métriques et gates : canary 10% / 10 PRs, acceptance ≥95%, rollback si >5% d'erreurs (hypothèses).

Si vous voulez, je peux générer le dépôt de démarrage (workflow d'exemple, trois stubs Dockerisés et script CI) pour accélérer la mise en route.
