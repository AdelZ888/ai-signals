---
title: "Musts — boucle de validation CI qui bloque les PR créées par l'IA jusqu'à validation"
date: "2026-05-25"
excerpt: "Guide pratique Musts : configurez une boucle de validation CI rapide (lint, tests, commandes) pour empêcher les pull requests ouvertes par des agents IA d'être mergées tant que les contrôles n'ont pas réussi. Inclut installation, exemples et conseils de déploiement."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-25-musts-a-ci-validation-loop-that-blocks-merging-of-ai-created-pull-requests-until-validators-pass.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "CI"
  - "validation"
  - "IA"
  - "pull-requests"
  - "GitHub Actions"
  - "DevOps"
sources:
  - "https://github.com/bitomule/musts"
---

## TL;DR en langage simple

- Musts est une boucle de validation open-source conçue pour empêcher des agents (humains ou basés sur intelligence artificielle) de déclarer un travail « terminé » avant que des vérifications automatisées aient réussi. Référence : https://github.com/bitomule/musts
- Principe : quand une pull request (PR) est ouverte, Musts exécute des validateurs (lint, tests unitaires, commandes personnalisées). Si un validateur échoue, la PR peut rester bloquée jusqu'à résolution.
- Démarrez petit : activez d'abord des validateurs rapides et déterministes. Objectif indicatif : porte rapide (gate) < 300000 ms (5 minutes). Cela évite d'augmenter inutilement le délai pour les réviseurs.

Exemple concret (scénario court) :
- Un assistant IA ouvre une PR qui modifie du code JS. Le pipeline Musts lance d'abord un validateur "lint" (format et style). Si le lint passe, la PR peut être revue. Si le lint échoue, l'agent corrige et met à jour la PR avant revue humaine.

Note simple avant détails avancés : ce guide explique d'abord en termes simples comment Musts s'intègre dans votre cycle de travail. Ensuite, il montre des exemples pratiques (fichiers de config, jobs CI) et comment gérer les problèmes courants.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez mettre en place une boucle de validation reproducible qui s'exécute à chaque PR. L'idée centrale : automatiser et rendre explicite le passage de contrôles avant qu'une PR soit considérée comme prête à merger. Voir le dépôt pour la vision et les sources : https://github.com/bitomule/musts

Pourquoi c'est utile :

- Moins de temps perdu : les PR qui échouent sont identifiées tôt. Ceci réduit le risque de révues humaines inutiles. (Chiffres cités comme objectifs indicatifs.)
- Retour plus rapide et cohérent : les contrôles automatisés s'exécutent de la même façon à chaque PR et produisent des résultats clairs.
- Décisions explicites : une petite matrice reliant le résultat des validateurs aux actions attendues clarifie la responsabilité des réviseurs.

Exemple de matrice d'acceptation (illustrative) :

| Résultat du validateur | Action | Revue humaine requise |
|---|---:|---:|
| pass | merge autorisé | non |
| warn | merge autorisé (optionnel) | 1 réviseur suggéré |
| fail | merge bloqué | requis (au moins 1 réviseur) |

(Remarque : adaptez ces règles à la politique de votre équipe — source d'inspiration : https://github.com/bitomule/musts)

## Avant de commencer (temps, cout, prerequis)

Checklist minimale (prérequis) :

- Un dépôt avec une commande de test qui fonctionne (par ex. npm test, pytest) et retourne 0 en succès.
- Un système d'intégration continue (CI) où vous pouvez ajouter des jobs et rendre des checks obligatoires (ex. GitHub Actions, GitLab CI).
- Permission pour modifier les règles de protection de branche (branch protection).
- Un agent ou une automatisation qui ouvre des PRs plutôt que de marquer le travail comme fait localement.

Temps et coûts (haut niveau, indicatif) :

- Effort d'intégration initial estimé : ~120 minutes (2 heures) pour un dépôt simple.
- Objectif de latence pour la porte rapide (gate) : < 300000 ms (5 minutes). Tests lourds peuvent être exécutés après merge.
- Coût : souvent faible pour les petites équipes; dépend du fournisseur CI et de l'utilisation des minutes.

Conseil : testez d'abord sur un dépôt non critique. Source : https://github.com/bitomule/musts

## Installation et implementation pas a pas

Explication en langage simple :
Quand une PR est ouverte, le CI lance le job Musts. Musts lit une configuration qui liste les validateurs. Chaque validateur est une commande (lint, tests...). Musts exécute chaque validateur, collecte les résultats et publie un statut check. La protection de branche peut exiger ce statut pour autoriser le merge. (Concept tiré de la description du projet : https://github.com/bitomule/musts)

Étapes pratiques minimales :

1) Récupérer le dépôt Musts pour lire la documentation et les exemples :

```bash
git clone https://github.com/bitomule/musts.git
cd musts
ls -la
```

2) Exemple illustratif de fichier de configuration (exemple hypothétique) :

```yaml
# .musts.yml (exemple)
validators:
  - id: lint
    cmd: "npm run lint"
    timeout_ms: 300000
    severity: fail
  - id: unit
    cmd: "npm test --silent"
    timeout_ms: 600000
    severity: fail
thresholds:
  flaky_retry: 2
```

3) Exemple de job GitHub Actions pour lancer Musts sur chaque PR :

```yaml
# .github/workflows/musts.yml
name: musts-validator
on: [pull_request]
jobs:
  musts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install deps
        run: npm ci
      - name: Run musts validators
        run: npx musts run --config .musts.yml
```

4) Exemple de script pour que l'agent attende le statut CI (polling) :

```bash
# poll-pr-status.sh
PR_NUMBER=$1
POLL_INTERVAL=30   # seconds
TIMEOUT=1800       # seconds (30 minutes)
elapsed=0
while [ $elapsed -lt $TIMEOUT ]; do
  status=$(gh pr view $PR_NUMBER --json status --jq '.status')
  if [ "$status" = "SUCCESS" ]; then
    echo "Validators passed"
    exit 0
  fi
  sleep $POLL_INTERVAL
  elapsed=$((elapsed + POLL_INTERVAL))
done
echo "Timeout waiting for validators"
exit 1
```

5) Enforcer la protection de branche : exigez le check Musts sur la branche protégée pour bloquer les merges tant que les validateurs ne sont pas passés.

Rollout recommandé : activez Musts dans un dépôt de test, observez pendant 7–14 jours, corrigez les faux positifs et la flakiness, puis étendez progressivement. Voir le dépôt : https://github.com/bitomule/musts

## Problemes frequents et correctifs rapides

Principaux problèmes et actions rapides (source et inspiration : https://github.com/bitomule/musts)

Flaky tests (tests instables)
- Symptôme : les tests échouent de façon intermittente et bloquent les merges.
- Correctifs rapides : identifier les tests instables, rendre les assertions plus robustes ou appliquer des retries ciblés (ex. retry policy = 2 tentatives, illustratif).

Validateurs lents
- Symptôme : la porte (gate) est lente et retarde les réviseurs.
- Correctifs rapides : séparer un gate rapide (lint, checks statiques) d'étapes plus lourdes post-merge ; visez < 300000 ms pour le gate rapide.

Agent ignorant la validation
- Symptôme : l'automatisation annonce une tâche comme "terminée" alors que le CI échoue.
- Correctifs rapides : obligez l'agent à ouvrir une PR et à attendre le statut CI ; renforcez la protection de branche pour empêcher les merges hors pipeline.

Cheat-sheet rapide :

| Symptôme | Correctif | Résultat visé |
|---|---|---:|
| Tests flakys | marquer + retry ciblé (2) | moins de blocages faux |
| Gate lent | déplacer checks lourds post-merge | revue plus rapide (< 5 min) |
| Agent contournant | exiger branch protection | interdiction de contournement |

(Remarque : certaines capacités, comme le marquage des tests en flaky, peuvent nécessiter des scripts si elles ne sont pas fournies nativement par Musts.)

## Premier cas d'usage pour une petite equipe

Contexte typique : un fondateur solo ou une petite équipe (1–3 personnes) qui laisse un assistant IA proposer des PRs et veut garder une friction minimale.

Trois étapes concrètes pour démarrer :

1) Démarrez dans un fork ou dépôt non critique et n'exécutez qu'un validateur rapide.
   - Action : ajoutez un validateur de lint seul et activez-le sur PRs.
   - Pourquoi : garder la porte sous la minute (objectif : < 60 s) et limiter le bruit.

2) Maintenez une supervision humaine légère.
   - Action : exigez 1 réviseur humain seulement pour les échecs bloquants ; autorisez l'auto-merge pour les PRs qui passent.

3) Automatisez la surveillance et le rollback rapide.
   - Action : faites en sorte que l'agent poll le statut CI (ex. script ci-dessus) et annule ou labelise les PRs qui dépassent un timeout (ex. 1800 s = 30 min).

Checklist pratique de déploiement initial :

- [ ] Ajouter .musts.yml avec un unique validateur rapide (lint).
- [ ] Ajouter un job CI pour exécuter Musts sur pull_request.
- [ ] Configurer la protection de branche pour exiger le check Musts sur une branche non critique.
- [ ] Faire ouvrir les PRs par l'agent et implémenter un polling du statut avant de déclarer la tâche complète.

Pour modèles et templates : https://github.com/bitomule/musts

## Notes techniques (optionnel)

- Placez le fichier .musts.yml à la racine du dépôt pour que les jobs CI le découvrent facilement (pratique courante, voir repo : https://github.com/bitomule/musts).
- Exécutez les validateurs sur des runners CI sandboxés lorsque le code vient d'agents externes ou d'IA : limitez les permissions et le trafic réseau pour réduire les risques.
- Collectez et conservez les logs d'exécution et artefacts (coverage, rapports) pour faciliter le debug des échecs. Gardez au moins 14 jours d'artefacts pour enquêtes post-mortem.

Remarque de sécurité : évaluez la surface d'attaque avant d'autoriser l'exécution automatique de code non humain dans vos runners. Privilégiez des runners isolés et des règles réseau strictes.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse : le dépôt Musts fournit la notion générale de boucle de validation et des exemples de démarrage (https://github.com/bitomule/musts).
- Hypothèse : les formats d'exemple (.musts.yml, champs timeout_ms, flaky_retry) fournis plus haut sont des suggestions d'implémentation ; vérifiez la documentation du dépôt pour la syntaxe exacte.
- Hypothèse chiffrée (illustrative) : cible initiale = 2 validateurs dans le gate ; durée cible du gate < 300000 ms (5 minutes) ; effort d'intégration initial ≈ 120 minutes ; retry policy = 2 tentatives ; intervalle de polling agent = 30 s ; timeout d'attente agent = 1800 s ; période de canary = 7 jours, collecte métriques = 14 jours.

### Risques / mitigations

- Risque : augmentation de la latence de merge (> 10 minutes en bout de chaîne).
  - Mitigation : limiter le gate aux validateurs rapides et déplacer les contrôles lourds en post-merge.

- Risque : tests instables provoquant des blocages faux positifs (taux de flakiness > 5%).
  - Mitigation : ajouter des retries ciblés, marquer les tests instables pour correction et investir dans la réduction de la flakiness.

- Risque : exécution de code non fiable ou hostile via l'agent.
  - Mitigation : utiliser des runners sandboxés, restreindre les permissions, limiter l'accès réseau et exécuter d'abord des contrôles statiques.

### Prochaines etapes

- Canary : activez Musts sur un dépôt non critique pendant 7 jours et collectez métriques pendant 14 jours.
- Mesurez : taux de passage des validateurs (%), taux de faux positifs (%), latence médiane de merge (minutes), charge des réviseurs (PRs/semaine).
- Rollout : si les seuils d'acceptation sont atteints (ex. passage > 80%, flakiness < 5%, latence médiane < 5 minutes), étendez progressivement à d'autres dépôts.
- Amélioration continue : automatisez la détection et la réparation des tests flakys, enrichissez les rapports de Musts et fournissez des templates de tickets pour les échecs récurrents.

Pour démarrer et consulter exemples et issues : https://github.com/bitomule/musts
