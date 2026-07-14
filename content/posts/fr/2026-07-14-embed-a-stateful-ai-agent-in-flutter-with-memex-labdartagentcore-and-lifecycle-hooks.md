---
title: "Intégrer un agent d'IA stateful dans Flutter avec memex-lab/dart_agent_core et hooks de cycle de vie"
date: "2026-07-14"
excerpt: "Guide pratique pour ajouter un agent d'IA stateful à des applications Flutter avec memex-lab/dart_agent_core. Apprenez la planification, l'appel d'outils, le streaming de sorties partielles et la délégation à des sous-agents."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-14-embed-a-stateful-ai-agent-in-flutter-with-memex-labdartagentcore-and-lifecycle-hooks.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "Flutter"
  - "Dart"
  - "Agents"
  - "IA"
  - "stateful"
  - "memex-lab"
  - "dart_agent_core"
sources:
  - "https://github.com/memex-lab/dart_agent_core"
---

## TL;DR en langage simple

- Objectif : intégrer un agent d'IA stateful dans une app Flutter. Le projet de référence est le dépôt memex-lab/dart_agent_core (https://github.com/memex-lab/dart_agent_core).
- Ce que fait l'agent : garde un petit contexte local, planifie des étapes, appelle des outils, délègue des sous-tâches et peut streamer des sorties partielles vers l'interface.
- Résultat attendu en 15–30 minutes : cloner l'exemple, lancer l'app d'exemple et voir du texte partiel (streaming) s'afficher.

Checklist de démarrage rapide :
- [ ] repo cloné : https://github.com/memex-lab/dart_agent_core
- [ ] Flutter SDK installé (canal stable)
- [ ] fichier de config minimal ajouté aux assets de l'app

Exemple concret : triage de ticket
- L'utilisateur colle une stack trace. L'agent résume la stack, lance une recherche documentaire et renvoie un plan d'action court. L'interface affiche des tokens partiels pendant que l'agent continue de travailler.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez créer une démo Flutter qui embarque un agent stateful basé sur dart_agent_core.

Cet agent peut :
- planifier des réponses en plusieurs étapes,
- appeler des outils externes (par ex. une recherche documentaire),
- streamer des sorties partielles vers l'UI,
- déléguer des sous-tâches à des "skills" ou sous-agents.

Pourquoi c'est utile pour une petite équipe :
- Rapidité perçue : afficher le premier token vite améliore l'expérience utilisateur.
- Séparation des responsabilités : l'UI reste simple tandis que l'agent orchestre la logique.
- Contexte local : l'agent peut gérer des conversations multi-turn sans recharger un service externe à chaque fois.

Référence technique du projet : https://github.com/memex-lab/dart_agent_core

Plain-language explanation avant les détails avancés
- "Stateful" signifie que l'agent conserve un peu d'historique (contexte) dans l'app. Ce n'est pas forcément une base de données complète. C'est utile pour suivre une conversation ou un workflow multi-étapes.
- "Streaming" signifie que l'agent envoie des morceaux de texte au fur et à mesure. L'UI peut afficher ces morceaux sans attendre la fin du calcul.
- "Tool" ou "skill" désigne un composant que l'agent peut appeler pour faire une tâche précise (recherche, résumé, appel API).

## Avant de commencer (temps, cout, prerequis)

Estimations et cibles (guides pratiques) :
- Temps pour un prototype simple : ~2 heures.
- MVP plus complet : 2–8 heures selon l'intégration des outils.
- Latence cible (objectif perceptible) : viser un premier token rapide. Mesurez mediane et p95 en staging.
- Coûts : fixez un budget concret pour le staging (par exemple 5–50 $/jour selon usage).
- Rollout : commencer par un déploiement canary (ex. 10% d'utilisateurs).

Prérequis techniques :
- Flutter (canal stable), émulateur ou appareil réel.
- Projet Flutter où ajouter le package.
- Au moins une clé API pour un provider LLM (large language model). Stockez-la en secure storage (Keychain sur iOS / Keystore sur Android).
- Connaissances de base en Dart async/await et cycle de vie des widgets.

Checklist pré-vol :
- [ ] Flutter canal stable
- [ ] repo de référence : https://github.com/memex-lab/dart_agent_core
- [ ] pubspec.yaml prêt pour ajouter le package
- [ ] clés API en secure storage (Keychain / Keystore)

## Installation et implementation pas a pas

Remarque : vérifiez le README du dépôt https://github.com/memex-lab/dart_agent_core pour les détails exacts.

1) Cloner le dépôt et ouvrir l'exemple :

```bash
git clone https://github.com/memex-lab/dart_agent_core.git
cd dart_agent_core
# ouvrir le dossier example (nom du dossier exemple dans le repo)
```

2) Ajouter le package à votre app Flutter :

```bash
flutter pub add dart_agent_core
flutter pub get
```

3) Template de config minimal (exemple YAML) :

```yaml
# assets/agent_config.yaml (template)
providers:
  default:
    type: multi-provider
    max_tokens: 1000
tools:
  docs_search:
    timeout_ms: 2000
streaming:
  enabled: true
```

Explication : ce fichier décrit des paramètres basiques. Adaptez max_tokens, les timeouts et les providers selon vos fournisseurs LLM.

4) Brancher un contrôleur/manager dans un State. Écoutez un Stream de tokens et appelez setState() pour afficher le texte partiel. Exemple conceptuel (à vérifier dans le README du repo) :

```dart
// Exemple conceptuel d'écoute de tokens (API réelle à vérifier dans le repo)
final controller = /* constructeur du package avec config */;
controller.onToken.listen((token) {
  setState(() => partialText += token);
});
controller.dispose();
```

5) Tester localement et en staging. Objectifs de test recommandés : mesurer latence mediane et p95 pour le premier token, et surveiller le coût par session.

Gates de déploiement (exemple) : canary 10% -> 50% -> 100% suivant métriques.

## Problemes frequents et correctifs rapides

Source de référence : https://github.com/memex-lab/dart_agent_core

- Pas de réponse du provider : vérifier la clé API dans le secure storage et exécuter une requête de probe.
- Pas de streaming visible : vérifier que l'UI est abonnée au Stream des tokens et que la config de streaming est activée.
- Timeouts / 504 sur les tools : augmenter timeout_ms (ex. 2000 -> 5000 ms) et ajouter retries avec backoff exponentiel.
- Coûts élevés : appliquer des caps de tokens par session (ex. 500–1000 tokens) et mettre des alertes budgétaires.

Tableau rapide de dépannage :

| Symptôme | Vérification rapide | Correctif |
|---|---:|---|
| Pas de réponse | Clé API présente et valide ? | Ajouter la clé au storage sécurisé et redémarrer l'app |
| Pas de streaming | Abonnement au Stream actif ? | Abonner l'UI au Stream et setState() sur chaque token |
| Tool 504 | timeout trop bas (p.ex. 2000 ms) | Augmenter timeout_ms à 5000 ms et ajouter retries |

Bonnes pratiques rapides : limiter max_tokens en développement. En production, ajuster selon budget et latence.

## Premier cas d'usage pour une petite equipe

Référence : https://github.com/memex-lab/dart_agent_core

Public visé : fondateurs solos et équipes de 1–3 personnes. Objectif : livrer un assistant de triage QA minimal, vite et à faible coût.

Étapes actionnables (MVP en ~2 heures) :
1) Implémentez 1 skill de résumé (summarizer) et 1 tool de recherche documentaire. Limitez max_tokens pour contrôler les coûts.
2) Activez le streaming pour améliorer la latence perçue (afficher le premier token rapidement).
3) Déployez en canary à 10% d'utilisateurs. Mesurez latence mediane, p95 et taux d'utilisation utile.
4) Stockez les clés dans Keychain/Keystore. Ne les mettez pas en clair dans le code.
5) Testez avec 50–200 exemples réels, mesurez utilité et latence avant d'élargir.

Checklist opérationnelle pour un solo :
- [ ] 1 skill et 1 tool développés (2–8 heures)
- [ ] Limite de tokens en dev (p.ex. 500)
- [ ] Déploiement canari restreint (10%)
- [ ] Run de staging + collecte de labels d'utilité (50–200 exemples)

## Notes techniques (optionnel)

- Extrait public du dépôt : "Dart framework for stateful AI agents: tool use, skills, sub-agent delegation, planning, streaming, evals, and multi-provider LLM support." (source : https://github.com/memex-lab/dart_agent_core)
- Persistance : le projet est orienté vers l'état in-app. Si vous voulez persister entre redémarrages, chiffrez les transcriptions ou stockez-les sur un backend externe.
- Hooks d'éval : capturez transcriptions, labels et latences. Définissez des SLO (objectifs de niveau de service) simples comme median latency et taux d'aide utile.

Méthodologie : j'ai gardé les affirmations alignées sur le résumé public du dépôt. Les détails d'API doivent être vérifiés dans le README du repo.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse : le dépôt fournit un framework pour outils, skills, délégation, planification, streaming, evals et support multi-provider LLM (source : https://github.com/memex-lab/dart_agent_core).
- Hypothèse : activer le streaming réduit la latence perçue (à vérifier en mesurant mediane et p95 en staging).
- Inconnue : les noms exacts des classes, signatures et événements exposés par l'API du package. Vérifier le README et les exemples dans le dépôt.

### Risques / mitigations

- Risque : coût LLM élevé. Mitigation : capper les tokens par session (ex. 500–1000), mettre des alertes budgétaires et des quotas.
- Risque : fuite de données sensibles. Mitigation : redaction/anonymisation, proxyiser les appels si nécessaire, et auditer les payloads.
- Risque : réponses incorrectes. Mitigation : évaluations régulières (evals), seuils d'utilité et contrôles humains pour les cas critiques.

### Prochaines etapes

- Ajouter monitoring pour décisions d'agent, appels d'outils et erreurs. Définir SLOs (ex. median latency < 500 ms, erreur < 2%).
- Durcir la production :
  - [ ] Déplacer les clés API vers le secure storage de la plateforme
  - [ ] Retirer les logs de debug et tokens de test
  - [ ] Ajuster max_tokens pour la production (p.ex. 500–1000)
  - [ ] Configurer quotas providers et alertes budgétaires (seuils à 70% / 90% du budget)
  - [ ] Mettre en place feature flags et rollout progressif (10% -> 50% -> 100%)
  - [ ] Planifier des évaluations périodiques (p.ex. toutes les 30 jours) et ajustements des skills

Référence finale : lisez le README du repo memex-lab/dart_agent_core pour les instructions d'intégration et les exemples (https://github.com/memex-lab/dart_agent_core).
