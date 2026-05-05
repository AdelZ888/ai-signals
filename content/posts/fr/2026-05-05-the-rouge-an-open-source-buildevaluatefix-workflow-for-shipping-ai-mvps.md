---
title: "The Rouge — un workflow open-source build→evaluate→fix pour livrer des MVPs IA"
date: "2026-05-05"
excerpt: "Présentation du dépôt The Rouge : un workflow open-source qui transforme des idées en récits MVP via une phase de spécification et des boucles répétables build→evaluate→fix avec contrôles externes et règles d'escalade."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-05-the-rouge-an-open-source-buildevaluatefix-workflow-for-shipping-ai-mvps.jpg"
region: "FR"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "workflow"
  - "MVP"
  - "open-source"
  - "développement itératif"
  - "évaluation"
sources:
  - "https://github.com/gregario/the-rouge"
---

## TL;DR en langage simple

- The Rouge propose une méthode itérative : construire une petite version, évaluer avec des signaux externes, corriger, répéter jusqu'à atteindre la qualité. Citation du dépôt : « Not one-shot code generation. Iterative product development: build, evaluate against external signals, fix, repeat until the quality bar is met. » (Source : https://github.com/gregario/the-rouge)
- Travaillez en courtes boucles. Un petit changement → appel au modèle → vérification externe → corriger ou accepter.
- Sauvegardez pour chaque exécution : prompt, sortie, évaluation, logs. Minimum utile : prompt.txt, output.json, evaluation.json, run.log.
- Escaladez vers une revue humaine après un petit nombre d'échecs consécutifs (ex. après 2 échecs).

Actions rapides pour démarrer :
- Cloner le dépôt et lire le README.md.
- Lancer une démonstration pour voir les artefacts enregistrés.
- Documenter la règle d'escalade humaine.

Exemple concret :
- Scénario court : une petite équipe veut générer automatiquement des réponses FAQ. Ils créent une story « générer 5 FAQ d'après un article ». Ils automatisent un test JSON qui valide le format et le contenu minimal. Ils exécutent la boucle. Si le test échoue 2 fois de suite, un humain relit le prompt et corrige. Ils conservent toutes les exécutions pour rejouer et auditer.

Commandes minimales (pour obtenir le dépôt localement) :

```bash
# clone et inspection
git clone https://github.com/gregario/the-rouge.git
cd the-rouge
ls -la
head -n 40 README.md
```

Note simple avant les détails avancés : suivez ce pattern comme une expérience contrôlée. Changez une variable à la fois (prompt, température, post-traitement). Cela rend les résultats interprétables et facilite le diagnostic. (Source : https://github.com/gregario/the-rouge)

## Ce que vous allez construire et pourquoi c'est utile

Vous allez appliquer la boucle courte build → evaluate → fix sur une unique fonctionnalité (« story »). L'objectif est de produire des artefacts rejouables : prompts, sorties, évaluations, logs et métriques. Ce pattern provient du dépôt The Rouge et vise à « répéter jusqu'à atteindre la barre de qualité ». (Source : https://github.com/gregario/the-rouge)

Pourquoi c'est utile :
- Les vérifications répétables réduisent les surprises au déploiement. Elles facilitent l'audit.
- Un évaluateur externe (test unitaire, validation JSON, vérification UI headless) isole la logique métier des variations du modèle.
- Les petites équipes automatisent les cas courants et n'interviennent que sur les échecs persistants.

Termes courts : MVP = produit minimum viable (Minimum Viable Product). API = interface de programmation applicative (Application Programming Interface). JSON = JavaScript Object Notation.

Rappel : adaptez la boucle à vos tests, à votre profil de risque et à vos outils. Ce n'est pas un script unique, mais un pattern. (Source : https://github.com/gregario/the-rouge)

## Avant de commencer (temps, cout, prerequis)

Prérequis minimaux : git, un shell POSIX (bash ou zsh), un éditeur de texte. Savoir lancer un script et lire des logs. Si vous appelez des modèles hébergés, prévoyez une clé API (Application Programming Interface) et un compte fournisseur. (Source : https://github.com/gregario/the-rouge)

Estimations pratiques :
- Temps initial : 60–180 minutes (1–3 heures) pour cloner, lire le README et exécuter une boucle de démonstration.
- Budget exploratoire : 5–50 USD ; exemple conservateur : 20 USD.
- Itérations conseillées par story : 1–5 ; escalade après 2 échecs consécutifs.

Tableau décisionnel rapide (exemple) :

| Besoin                         | Durée estimée | Budget estimé |
|--------------------------------|---------------:|--------------:|
| Cloner + lire README           | 10–20 minutes  | $0            |
| Première boucle end-to-end     | 60–120 minutes | $5–20         |
| Tests d'extension / canari     | 24–48 heures   | $20–100       |

Préparations concrètes :
1. Cloner le dépôt et identifier le point d'entrée.
2. Créer un répertoire par story pour les artefacts (ex. story-001).
3. Choisir un harness d'évaluation externe : test unitaire, schéma JSON, ou vérification UI headless. (Source : https://github.com/gregario/the-rouge)

## Installation et implementation pas a pas

Runbook simplifié — adaptez selon la structure du dépôt après clonage.

1) Cloner et examiner le projet :

```bash
git clone https://github.com/gregario/the-rouge.git
cd the-rouge
```

2) Créer un répertoire de travail pour les artefacts. Conseil : nommer dossiers story-001, story-002.

3) Brancher un mécanisme d'évaluation externe. Options : test unitaire, validation par schéma JSON, vérification UI headless. L'évaluation doit être externe et autant que possible déterministe.

4) Lancer une story et enregistrer les artefacts : prompt.txt, output.json, evaluation.json, run.log. Mesures utiles : tokens_used (compter), latency_ms (mesurer), iteration_count.

5) Si échec : corriger (prompt, instruction, post-traitement) puis relancer. Arrêter quand quality_gate est atteint ou quand la règle d'escalade est déclenchée.

Exemple de configuration de départ :

```yaml
# example-config.yaml
api_key: "REPLACE_WITH_KEY"
model: "example-model"
temperature: 0.2
quality_gate: 0.90
workdir: "./work"
max_iterations: 5
budget_usd: 20
```

Exemple d'observabilité (run log JSON) :

```json
{
  "iteration": 1,
  "tokens_used": 412,
  "latency_ms": 240,
  "evaluation_pass": false
}
```

(Source : exemples et pattern du dépôt https://github.com/gregario/the-rouge)

## Problemes frequents et correctifs rapides

Symptôme : la boucle répète la même erreur 2–3 fois
- Correctif : inspecter prompt + output + evaluation. Si échec répété (>=2), escalader vers revue humaine.

Symptôme : sorties à forte variance
- Correctif : réduire la variance en baissant temperature, en fixant le modèle, ou en utilisant une stratégie plus déterministe.

Symptôme : vérificateur externe échoue après mise à jour d'environnement
- Correctif : pinner (verrouiller) les versions du vérificateur, valider dépendances réseau et exécuter en local.

Symptôme : dépenses inattendues / tokens élevés
- Correctif : suivre les tokens par exécution, limiter tokens par appel (ex. 2 048 tokens), définir un garde-budget (ex. $20–$50) et alerter à +30% de la baseline.

Astuce opérationnelle : exiger 2 runs verts consécutifs avant progression en production. Escalader après 2 échecs consécutifs. (Source : https://github.com/gregario/the-rouge)

## Premier cas d'usage pour une petite equipe

Public cible : fondateur solo ou petite équipe (1–3 personnes) souhaitant livrer une story MVP (produit minimum viable) étroite en limitant les risques. (Source : https://github.com/gregario/the-rouge)

Étapes concrètes :
1. Rédiger une spécification d'une phrase et la stocker avec les artefacts.
2. Automatiser une vérification externe (test unitaire ou schéma JSON) et l'utiliser comme porte d'entrée.
3. Définir règle d'escalade : mettre en pause après 2 échecs consécutifs.
4. Rendre les exécutions observables (dossier ou journal) pour rejouer les régressions.
5. Commencer par une seule story de bout en bout puis étendre.

Répartition des rôles (1–3 personnes) :
- Spécification : propriétaire / fondateur.
- Opérateur de boucle : exécute l'automatisation et capture les artefacts.
- Relecteur : tranche lors des escalades.

Checklist minimale :
- [ ] Spécification écrite et stockée.
- [ ] Vérification externe automatisée et validée localement.
- [ ] Première boucle exécutée et artefacts sauvegardés.

## Notes techniques (optionnel)

Garde-fous pattern :
- Traitez chaque itération comme une transaction discrète : prompt → modèle → évaluation externe → correction.
- Persistez : prompt, sortie, résultat d'évaluation, iteration_count, tokens_used, who_escalated.

Observabilité recommandée : enregistrer iteration_count, evaluation_outcome, tokens_used, latency_ms. Logger les escalades humaines avec timestamp et raison. Calculer P95 (95e centile, "95th percentile") et la médiane ; alerter si médiane + P95 > 1000 ms.

Commande d'exemple pour exécuter une boucle (illustratif) :

```bash
# exécute une démonstration one-off en utilisant le runner du dépôt (exemple)
./scripts/run-loop.sh --story=example-catalog --max-iterations=3 --budget-usd=20
```

(Source et pattern : https://github.com/gregario/the-rouge)

## Que faire ensuite (checklist production)

Suivez ces étapes de préparation à la production. Le dépôt décrit le pattern itératif et sert de référence : https://github.com/gregario/the-rouge

1. Cloner et lire README.md (10–20 minutes).
2. Créer une configuration locale à partir de l'exemple et choisir des valeurs conservatrices (max_iterations = 3; quality_gate = 0.90).
3. Lancer une story de démonstration ; capturer artefacts et établir une baseline pour tokens et latence.
4. Ajouter observabilité et garde-budget ; alerter si consommation de tokens par exécution augmente de > 30% par rapport à la baseline.
5. Préparer un déploiement contrôlé : feature flag, canari 1%–5%, gates métriques et script de rollback automatisé.

### Hypotheses / inconnues

- Temps d'exploration initial : ~120 minutes (≈2 heures). (Hypothèse)
- Cap d'itérations : 1–5 itérations ; escalader après 2 échecs consécutifs. (Hypothèse)
- Quality gates suggérés : 0.90 (90%) pour pré-release, 0.95 (95%) pour release étendue. (Hypothèse)
- Exposition canari : 1%–5% d'utilisateurs pendant 24–48 heures. (Hypothèse)
- Garde-budget pour runs exploratoires : 20 USD; scaler entre 5–50+ USD selon besoin. (Hypothèse)
- Cap tokens par appel : 2 048 tokens (garde-fou d'exemple). (Hypothèse)
- Tokens de réponse courants : 256–512 pour sorties courtes. (Hypothèse)
- Garde latence : surveiller la médiane et alerter si médiane + P95 > 1000 ms. (Hypothèse)

### Risques / mitigations

- Risque : dépenses API hors contrôle. Mitigation : garde-budget hard, cap tokens par appel et limite d'itérations (1–5).
- Risque : checks instables (flaky). Mitigation : exiger 2 runs verts consécutifs avant canari et revue humaine après échecs répétés.
- Risque : impact utilisateur pendant canari. Mitigation : canari réduit (1%–5%), monitoring 24–48 heures, triggers de rollback (ex : taux d'erreur > 0.5%).

(Source : pattern et recommandation du dépôt The Rouge — https://github.com/gregario/the-rouge)

### Prochaines etapes

- Cloner le dépôt et lire README.md (10–20 minutes) : https://github.com/gregario/the-rouge
- Créer une config locale, choisir valeurs conservatrices (max_iterations = 3; quality_gate = 0.90) et sécuriser clés API.
- Exécuter une story de démonstration ; capturer artefacts et établir baseline tokens/latence.
- Implémenter garde-budget et capteurs de tokens ; alerter si > 30% d'augmentation vs baseline.
- Planifier déploiement contrôlé : feature flag, canari 1%–5%, gates métriques et script/commande de rollback.

(Fin.)
