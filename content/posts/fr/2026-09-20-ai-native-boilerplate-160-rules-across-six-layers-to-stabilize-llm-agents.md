---
title: "ai-native-boilerplate : stabiliser les agents LLM avec un petit jeu de règles versionné"
date: "2026-09-20"
excerpt: "Clonez le repo ai-native-boilerplate et placez un petit jeu de règles versionné devant votre agent (pré‑prompt) ou validez ses sorties (post‑validate). Le repo annonce 160+ règles réparties sur six couches pour rendre les agents plus prévisibles et auditables."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-20-ai-native-boilerplate-160-rules-across-six-layers-to-stabilize-llm-agents.jpg"
region: "FR"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "agents"
  - "LLM"
  - "boilerplate"
  - "règles"
  - "CI"
  - "développement"
sources:
  - "https://github.com/SrikanthVemulapally/ai-native-boilerplate"
---

## TL;DR en langage simple

- Clonez et parcourez le dépôt source pour comprendre la discipline et la taxonomie : https://github.com/SrikanthVemulapally/ai-native-boilerplate (le projet indique 160+ règles réparties en 6 couches).
- Objectif pratique : garder un fichier de règles versionné pour guider un agent LLM (pré‑prompt) ou valider sa sortie (post‑validation). Référence : https://github.com/SrikanthVemulapally/ai-native-boilerplate
- Commencez par peu de règles à fort impact, des tests rapides et un job CI qui bloque les PR en cas de violation critique.

Méthodologie rapide : prioriser, tester localement, automatiser la garde.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez versionner et appliquer un petit jeu de règles qui encadre les interactions avec un agent. Le dépôt référence et structure cette discipline : https://github.com/SrikanthVemulapally/ai-native-boilerplate (160+ règles, 6 couches : core discipline, design system, features, stacks, compliance, custom).

Bénéfices pratiques : prévisibilité, traçabilité (règles dans Git), possibilité de réutiliser la même configuration sur différents agents (le repo mentionne compatibilité avec Claude Code, Cursor, Windsurf, Copilot : https://github.com/SrikanthVemulapally/ai-native-boilerplate).

Cas d'usage typique : bloquer la divulgation de secrets dans des suggestions de code, appliquer un style minimal, rejeter patterns dangereux via un contrôle automatisé.

## Avant de commencer (temps, cout, prerequis)

- Inspectez le repo : https://github.com/SrikanthVemulapally/ai-native-boilerplate pour comprendre la taxonomie et exemples.
- Prérequis techniques : Git, terminal, accès API au fournisseur d'agent choisi, runner CI (ex. GitHub Actions).
- Compétences utiles : scripting (bash, Python ou Node), expressions régulières, écrire tests simples.
- Note opérationnelle : détails chiffrés (budget, volumétries, temps d'exécution) sont listés en hypothèses à la fin pour adaptation à votre contexte.

## Installation et implementation pas a pas

1) Cloner le dépôt

```bash
git clone https://github.com/SrikanthVemulapally/ai-native-boilerplate.git
cd ai-native-boilerplate
ls -la
```

2) Créer une config minimale de règles (versionnée)

```yaml
# rules/minimal.yaml
name: minimal-team-rules
version: 0.1
rules:
  - id: no-credentials
    priority: high
  - id: disallow-insecure-snippets
    priority: high
  - id: style_consistency
    priority: medium
```

3) Choisir le mode d'enforcement — tableau décisionnel

| Critère                | Pré‑prompt (guide)                         | Post‑validation (vérifie la sortie)            |
|------------------------|--------------------------------------------|------------------------------------------------|
| Contrôle immédiat      | Fort (influence le comportement)            | Moyen (réagit après réponse)                   |
| Coût en tokens         | Potentiellement élevé                       | Moins consommateur si prompt bref              |
| Complexité             | Simple à déployer, dur à maintenir si long  | Flexible, permet audits et corrections         |

Voir le repo pour la discipline et exemples : https://github.com/SrikanthVemulapally/ai-native-boilerplate

4) Exemple simple de post‑validation (pseudo‑code)

```python
# pseudo : appeler l'API, puis valider
response = call_agent(prompt)
if violates_rules(response.text, 'rules/minimal.yaml'):
    log_violation(response)
    raise Exception('Violation de règle')
else:
    return response.text
```

5) Tests de fumée et CI (exemple)

```bash
python tests/run_smoke_tests.py --rules rules/minimal.yaml --samples tests/samples.json
```

Exemple de job GitHub Actions (adapter) : https://github.com/SrikanthVemulapally/ai-native-boilerplate

```yaml
name: smoke-tests
on: [pull_request]
jobs:
  run-smoke-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run smoke tests
        run: python tests/run_smoke_tests.py --rules rules/minimal.yaml --samples tests/samples.json
        timeout-minutes: 5
```

6) Déploiement progressif

- Déployez d'abord en canary ou sur un pourcentage restreint du trafic, observez violations et latence, itérez. (Voir hypothèses chiffrées en fin.)

## Problemes frequents et correctifs rapides

Source : https://github.com/SrikanthVemulapally/ai-native-boilerplate

- L'agent ignore des pré‑prompts trop longs
  - Correctif : raccourcir les directives ; déplacer validations lourdes en post‑validation.
- Coût en tokens élevé pour prompts verbeux
  - Correctif : compacter directives, utiliser IDs/templates, ou exécuter des vérifs hors ligne.
- Règles contradictoires
  - Correctif : prioriser via champ priority et documenter la table de précédence.
- CI instable (flaky)
  - Correctif : politique de retry et seuil d'échecs consécutifs avant blocage.
- Erreurs d'API ou permissions
  - Correctif : valider credentials, ajouter timeouts et gestion des codes d'état.

Plus d'éléments et la taxonomie complète : https://github.com/SrikanthVemulapally/ai-native-boilerplate

## Premier cas d'usage pour une petite equipe

Référence principale : https://github.com/SrikanthVemulapally/ai-native-boilerplate

Contexte : dépôt petit à moyen où un LLM suggère du code ou des réponses aux issues. Objectifs clés : empêcher fuite de secrets, maintenir cohérence, bloquer patterns dangereux.

Conseils concrets pour solo founders / petites équipes (actionnables) :

- Déployer une règle "no-credentials" dans le repo (commit et protégez la branche). Configurez un fichier avec patterns regex et tests unitaires associés. Cette règle doit être visible et modifiable dans Git.
- Préférer la post‑validation au début : appelez l'agent, validez localement la sortie, et retournez un message structuré au développeur si violation — cela réduit la complexité d'intégration et facilite les rollbacks.
- Automatiser un gate PR basique : un job CI qui exécute un petit jeu d'exemples (prompts/samples) et qui crée un commentaire de PR listant la règle déclenchée et une suggestion corrective.
- Itérer rapidement : testez en local, puis sur la branche canary (ou sur des PR internes) avant d'enfermer en production.

Artefacts recommandés : rules-config.yaml, banned-patterns.txt (regex), .github/workflows/merge-guard.yml, tests/samples.json. Voir le dépôt pour modèles et structure : https://github.com/SrikanthVemulapally/ai-native-boilerplate

## Notes techniques (optionnel)

- Taxonomie du dépôt : 6 couches (core discipline, design system, features, stacks, compliance, custom) — utilisez cette segmentation pour prioriser et scoper : https://github.com/SrikanthVemulapally/ai-native-boilerplate
- Compatibilité multi‑agent : le repo indique fonctionnement avec Claude Code, Cursor, Windsurf, Copilot — prévoir une couche d'adaptation pour normaliser prompts/réponses.
- Observabilité : collecter métriques par règle (violations), taux de réussite des tests, erreurs API et logs d'audit pour révisions de conformité.
- Architecture proposée : enforcement hybride (contrôles critiques synchrones, audits asynchrones) pour limiter l'impact UX tout en conservant sécurité et traçabilité.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Dépôt source et portée : 160+ règles en 6 couches (source : https://github.com/SrikanthVemulapally/ai-native-boilerplate).
- Chiffres opérationnels proposés (à valider dans votre environnement) :
  - Temps initial pour un pilote minimal : ~2 heures pour cloner et créer une config minimale.
  - Taille initiale du jeu de règles à lancer : 1–5 règles à fort impact.
  - Volume d'appels d'échantillonnage proposé : commencer à ~200 appels ; étendre à 500 si besoin.
  - Canary proposé : 5–10% du trafic pendant 24–48 heures.
  - Budget token pour pré‑prompts compacts (suggestion) : ~1 000 tokens maximum par session d'injection.
  - Politique de retry recommandée : 2 retries avant d'échouer.
  - Seuil d'alerte pour violation critique : 3% des appels sur 1 heure.
  - Objectif de taux de réussite des smoke tests : ≥97%.
  - Timeout CI suggéré : 300s (5 minutes).

Ces valeurs sont des hypothèses opérationnelles proposées pour planifier pilotage et budget ; adaptez selon vos coûts fournisseurs et votre SLA.

### Risques / mitigations

- Risque : mise à jour du modèle modifie le comportement et invalide tests.
  - Mitigation : verrouiller la version du modèle sur canary et exécuter la suite complète lors de toute mise à jour.
- Risque : latence due à post‑validation synchrone.
  - Mitigation : ne rendre bloquants que les contrôles critiques ; déléguer le reste en audit asynchrone.
- Risque : bruit/flakiness CI.
  - Mitigation : exiger N échecs consécutifs (ex. 2) avant blocage et augmenter l'échantillonnage.
- Risque : dépassement de budget de tests.
  - Mitigation : plafonner les appels de test en CI et monitorer coût par run.

### Prochaines etapes

- [ ] Copier et versionner un fichier rules-config minimal dans votre repo (protéger la branche).
- [ ] Implémenter le wrapper d'enforcement (choisir pré‑prompt ou post‑validate).
- [ ] Écrire des tests de fumée (échantillon initial proposé dans les hypothèses) et les connecter au CI.
- [ ] Ajouter un gate PR qui bloque sur les régressions de règles critiques (politique 2 échecs consécutifs recommandée).
- [ ] Lancer un canary (pourcentage proposé dans les hypothèses) pendant 24–48 heures ; surveiller taux de violation, latence et coûts.
- [ ] Préparer un playbook de rollback (rollback immédiat si violation critique > seuil indiqué).

Commandes utiles :

```bash
# cloner rapidement le boilerplate
git clone https://github.com/SrikanthVemulapally/ai-native-boilerplate.git
```

Références principales : https://github.com/SrikanthVemulapally/ai-native-boilerplate
