---
title: "Appliquer des allowlists d'outils et des politiques d'exécution pour agents IA avec CTRLRun dans GitHub Actions (contexte UK)"
date: "2026-09-24"
excerpt: "Ajoutez une étape CTRLRun à votre CI GitHub Actions pour appliquer des politiques d'exécution, produire des journaux d'audit par exécution et restreindre l'accès aux outils des agents. Guide pas à pas, checklist de déploiement et suggestions pour petites équipes."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-24-enforce-tool-allowlists-and-runtime-policies-for-ai-agents-with-ctrlrun-in-github-actions.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "ctrlrun"
  - "github-actions"
  - "agents-IA"
  - "sécurité"
  - "CI"
  - "audit"
sources:
  - "https://github.com/CTRLRun/ctrlrun"
---

## TL;DR en langage simple

- Ce qui change : ne vous fiez plus uniquement aux prompts pour contrôler un agent d'intelligence artificielle (IA). Placez une couche d'exécution sécurisée devant l'agent. Le projet CTRLRun fournit cette couche : https://github.com/CTRLRun/ctrlrun.
- Pourquoi c'est utile : vous limitez les appels externes non autorisés, vous obtenez une piste d'audit par exécution et vous pouvez déployer progressivement (sandbox → canary → production).
- Exemple concret : une action GitHub qui ouvre des Pull Requests (PR) peut être autorisée à créer une branche et ouvrir une PR, mais empêchée de merger automatiquement. CTRLRun sert de garde-fou entre l'agent et les actions réelles sur le dépôt.
- Prochaines étapes rapides : ajouter une étape d'intégration continue (CI, intégration continue) qui appelle l'Action du dépôt, créer une branche sandbox avec une politique, faire 3 exécutions tests, puis un canary 72 heures.

Temps de lecture : ~30 s. Mise en place initiale estimée : ~120 minutes.

Méthodologie : résumé basé sur le README et la page du dépôt https://github.com/CTRLRun/ctrlrun.

## Ce que vous allez construire et pourquoi c'est utile

Objectif : intégrer une étape CI qui exécute un agent IA derrière une couche d'application de politiques. CTRLRun se décrit comme "the execution safety layer for AI agents" et propose une GitHub Action pour l'intégration (voir https://github.com/CTRLRun/ctrlrun).

Bénéfices opérationnels :
- Contrôle explicite des outils accessibles par l'agent.
- Audit structuré par exécution pour enquêter après incident.
- Possibilité de bloquer des actions dangereuses avant qu'elles n'altèrent le code.

Tableau décisionnel simplifié (phase / cible / durée / seuils de montée en charge) :

| Phase     | Part du trafic | Durée minimale | Seuils clés à respecter |
|-----------|----------------|----------------|-------------------------|
| Sandbox   | 0%             | 3 runs         | chaque run ≤ 300 s (5 min) |
| Canary    | 5%             | 72 heures      | failed_action_rate < 1%, unauthorized_tool_attempts = 0 |
| Production| 25% → 100%     | progressif     | monitor avg_runtime_seconds, failed_action_rate |

Référence : Action et documentation du projet sur GitHub : https://github.com/CTRLRun/ctrlrun

## Avant de commencer (temps, cout, prerequis)

Estimations rapides (ordre de grandeur) :
- Mise en place initiale : ~120 minutes.
- Tests recommandés : 3 exécutions sandbox, puis un canary de 72 heures.
- Minutes CI estimées : prévoir ~500 minutes/mois pour un usage modeste (à ajuster selon plan).

Prérequis minimaux : dépôt GitHub avec droits sur les workflows, runner CI (GitHub-hosted ou self‑hosted), connaissance de base YAML/git, stockage des secrets. Prévoir une rotation régulière des clés (ex. ~30 jours). Voir le repo : https://github.com/CTRLRun/ctrlrun.

Checklist minimale avant run :
- [ ] Accès admin au dépôt ou droit d'écriture sur workflows
- [ ] Runner CI disponible et configuré
- [ ] Secrets définis (clés API courtes, rotation ~30 jours)
- [ ] Branche sandbox pour 3 tests initiaux

## Installation et implementation pas a pas

Approche recommandée : trois étapes — inspection, sandbox, canary.

1) Inspectez d'abord le dépôt et la page Action : https://github.com/CTRLRun/ctrlrun. Lisez le README et les exemples d'usage fournis.

2) Préparez une branche sandbox. Ajoutez un fichier de politique (policy) et les secrets nécessaires (clé d'outil, token d'intégration). Testez la connectivité avant d'autoriser des runs qui modifient l'état du dépôt.

3) Exécutez 3 runs en sandbox. Objectif : 3 runs réussis et rapides (chaque run ≤ 300 s). Si tout est vert, lancez un canary de 72 heures sur un dépôt non critique ou sur 5% du trafic.

Notes opérationnelles :
- Timeout initial conseillé pour le job CI : 30 minutes (timeout-minutes = 30). Augmentez à 60 minutes si nécessaire.
- Budget CI : planifier ~500 minutes/mois pour démarrage; ajustez selon l'utilisation réelle.

Référence pour l'Action et les exemples : https://github.com/CTRLRun/ctrlrun

### Explication simple avant les détails techniques

Avant d'aller dans les paramètres avancés : CTRLRun intercepte les commandes de l'agent et valide chaque action contre une politique. Pensez à CTRLRun comme à un agent de sécurité entre l'IA et vos systèmes. Il permet de : bloquer les actions interdites, enregistrer ce que l'agent a tenté, et appliquer des limites de durée.

Utilisez la sandbox pour vérifier les politiques et la connectivité. Ne passez en canary que si les logs d'audit montrent que l'agent respecte les règles.

## Problemes frequents et correctifs rapides

(Référez-vous au repo pour le détail d'implémentation : https://github.com/CTRLRun/ctrlrun)

- Agent tente un appel d'outil non autorisé
  - Correctif rapide : bloquer la mise en production, inspecter l'audit, ajouter le connecteur seulement après validation en sandbox.
  - Alerte : unauthorized_tool_attempts > 0 ⇒ alerter immédiatement.

- Timeout du workflow
  - Correctif : augmenter max_runtime_seconds (ex. 300 → 600) et timeout-minutes (30 → 60). Surveiller avg_runtime_seconds et alerter si > 2× baseline.

- Logs d'audit trop volumineux
  - Correctif : réduire le taux d'échantillonnage (ex. 0.10 → 0.02) et appliquer une rétention (ex. 90 jours).

- Erreurs d'authentification externes
  - Correctif : vérifier secrets, exécuter test de connectivité, remplacer clés expirées et mettre en place rotation (~30 jours).

Seuils suggérés au démarrage : failed_action_rate < 1%, unauthorized_tool_attempts = 0, canary initial = 5% pendant 72 heures. Voir le repo pour l'Action : https://github.com/CTRLRun/ctrlrun.

## Premier cas d'usage pour une petite equipe

Contexte : une petite équipe (1–3 personnes) veut un bot PR qui ouvre des PRs et règle des issues, mais ne merge jamais sans approbation humaine. CTRLRun fournit une Action et une couche d'exécution pour agents que vous pouvez intégrer : https://github.com/CTRLRun/ctrlrun.

Conseils actionnables :
1. Créez un fichier de politique minimal sur une branche sandbox. Vérifiez le format exact dans le repo.
2. Limitez le registre initial à ≤ 5 outils. Lancez 3 tests sandbox (chaque run ≤ 300 s).
3. Porte d'approbation : 1 approbateur pour un fondateur solo, 2 approbateurs pour une petite équipe avant toute action sur branches protégées.
4. Rotation des clés : ~30 jours recommandé pour clés courtes.
5. Rollout : 3 runs sandbox → canary 72 h (5%) → 25% → production si failed_action_rate < 1% et unauthorized_tool_attempts = 0.

Checklist rapide pour petites équipes :
- [ ] Ajouter politique sur branche sandbox
- [ ] Ajouter workflow GitHub Actions qui appelle l'Action du repo
- [ ] Exécuter 3 runs tests (≤ 300 s chacun)
- [ ] Vérifier l'audit et confirmer unauthorized_tool_attempts = 0
- [ ] Configurer approbations (1–2 personnes)

Source : page du projet et Action GitHub — https://github.com/CTRLRun/ctrlrun

## Notes techniques (optionnel)

Points avancés et valeurs recommandées :
- Rétention d'audit : conserver 90 jours pour investigations (ajuster selon obligations réglementaires).
- Échantillonnage des traces : sample_rate typique 0.02–0.10 pour limiter stockage.
- Taille initiale du registre : démarrer ≤ 10 outils.
- Limites d'exécution : max_runtime_seconds conseillé initialement = 300 s (5 min). N'augmentez à 600 s que si nécessaire.

Métriques à surveiller : failed_action_rate (objectif < 1%), unauthorized_tool_attempts (objectif = 0), avg_runtime_seconds (alerter si > 2× baseline).

Voir l'Action et la documentation fournie : https://github.com/CTRLRun/ctrlrun

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse : le dépôt https://github.com/CTRLRun/ctrlrun expose une GitHub Action et de la documentation d'intégration (vérifier le README du dépôt pour les détails exacts).
- Hypothèse : les noms de fichiers et clés de configuration évoqués dans ce guide (ex. ctrlrun.yaml, champ max_runtime_seconds, sample_rate, allowlist) sont des exemples opérationnels. Confirmez le schéma et les clefs exactes dans le repo avant production.
- Hypothèse : les connecteurs (ex. « git-connector-v1 ») mentionnés dans les exemples sont conceptuels ; consultez le registre officiel du projet pour les connecteurs réels.
- Hypothèse opérationnelle : recommandations temporelles et seuils (3 runs sandbox, canary 72 heures, 5% canary, failed_action_rate < 1%) sont des valeurs initiales à adapter.

### Risques / mitigations

- Risque : un appel d'outil non autorisé atteint la production.
  - Mitigation : exiger approbation humaine (1–2 approbateurs), désactiver workflows et révoquer credentials si incident.
- Risque : mauvaise configuration provoque interruption CI.
  - Mitigation : déploiement progressif (sandbox → canary 5% pendant 72 h → 25% → 100%), monitors actifs.
- Risque : explosion du volume d'audit et coûts de stockage.
  - Mitigation : réduire sample_rate (ex. 0.10 → 0.02), appliquer rétention 90 jours, monitorer storage.

Seuils exemples : failed_action_rate < 1%, unauthorized_tool_attempts = 0, canary initial = 5% pendant 72 h.

### Prochaines etapes

- [ ] Inspecter https://github.com/CTRLRun/ctrlrun et confirmer la méthode d'intégration (temps estimé : 30–60 minutes).
- [ ] Ajouter politique de test sur branche sandbox (temps cible : 120 minutes pour mise en place initiale).
- [ ] Lancer 3 exécutions tests et analyser ./ctrlrun-audit.json ou l'artefact d'audit fourni.
- [ ] Configurer porte d'approbation (1–2 approbateurs) pour branches protégées.
- [ ] Démarrer canary 72 heures sur un dépôt non critique (5% du trafic), surveiller failed_action_rate et unauthorized_tool_attempts.

Référence de départ : https://github.com/CTRLRun/ctrlrun

(Brève note méthodologique : ce guide synthétise les informations publiques du README du projet et propose des valeurs opérationnelles par défaut — vérifiez le schéma exact et les capacités dans le dépôt avant production.)

```yaml
# Exemple illustratif (valeurs à confirmer dans le repo)
# ctrlrun.yaml (illustration)
policy:
  max_runtime_seconds: 300
  sample_rate: 0.10
  allowlist: [create-branch, open-pr]
```

```bash
# connectivity-test.sh (illustration)
set -e
curl -f -H "Authorization: Bearer $TOOL_API_KEY" https://api.example-tool.internal/v1/health || exit 1
echo "Connectivity OK"
```
