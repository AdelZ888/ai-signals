---
title: "singular-lite : orchestrer des agents autonomes de coding en parallèle avec leases, gates et isolation git-worktree"
date: "2026-08-21"
excerpt: "Utilisez singular-lite pour faire tourner plusieurs agents autonomes sur un dépôt : git-worktrees par agent, contrôle de concurrence par « leases », plus gates et audits pour garder des merges revus par des humains et traçables. Projet open-source (GPL-3.0) — https://github.com/alex-reysa/singular-lite"
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-21-singular-lite-orchestrating-parallel-autonomous-coding-agents-with-leases-gates-and-git-worktree-isolation.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "orchestration"
  - "agents"
  - "git"
  - "CI"
  - "AI"
  - "open-source"
  - "singular-lite"
  - "devops"
sources:
  - "https://github.com/alex-reysa/singular-lite"
---

## TL;DR en langage simple

- singular-lite est un moteur open-source d'orchestration multi-agents pour dépôts Git. Les primitives visibles dans le dépôt incluent L0/L1/L2, leases (verrous), gates (points de contrôle), audits, isolation via git-worktree et dispatch détaché (detached dispatch). Source : https://github.com/alex-reysa/singular-lite
- Ce que cela apporte : isolation des modifications (git-worktree), contrôle de concurrence (leases), points de contrôle avant fusion (gates) et journalisation d'actions (audits). Ces primitives et le modèle d'agents sont décrits dans le dépôt : https://github.com/alex-reysa/singular-lite
- Recommandation rapide : testez sur un fork ou dépôt non critique et limitez les permissions des agents. Voir le README du projet : https://github.com/alex-reysa/singular-lite

Exemple très court : un agent L0 corrige le style dans un git-worktree isolé ; un agent L1 ajoute un test ; un lease empêche que les deux poussent simultanément ; un gate peut exiger revue humaine avant fusion.

## Ce que vous allez construire et pourquoi c'est utile

Objectif de la démo (à monter localement) : montrer le flux d'un contrôleur distribuant des tâches à des agents isolés qui utilisent leases, gates et audits. Références : https://github.com/alex-reysa/singular-lite

Tableau comparatif (primitives → rôle) :

| Primitive | Rôle principal | Résultat attendu |
|---|---:|---|
| L0 / L1 / L2 | Niveaux d'agent / responsabilités | Séparation des tâches et politiques d'autorisation |
| leases | Verrous/exclusivité | Évite les push concurrents sur la même ressource |
| gates | Points de contrôle | Bloque ou autorise des merges selon règles |
| audits | Journalisation | Traçabilité des actions et décision |
| git-worktree | Isolation de travail | Réduit les conflits locaux |

Pourquoi c'est utile : isolation (moins de conflits), concurrence contrôlée (verrous), traçabilité (audits). Tout cela est visible dans le code et la documentation du dépôt : https://github.com/alex-reysa/singular-lite

## Avant de commencer (temps, cout, prerequis)

Prérequis minimaux (fonctionnels) : connaissance basique de Git (branches, worktree), accès à un dépôt de test ou fork, une machine pour exécuter le contrôleur/agents. Voir le dépôt pour la structure et la licence : https://github.com/alex-reysa/singular-lite

Checklist avant d'exécuter :
- [ ] Fork ou dépôt de test prêt (ne pas expérimenter directement sur main)
- [ ] Accès à la machine d'exécution
- [ ] Lecture du README du dépôt (instructions de démarrage) — https://github.com/alex-reysa/singular-lite

## Installation et implementation pas a pas

1) Cloner le dépôt et inspecter le contenu :

```bash
git clone https://github.com/alex-reysa/singular-lite demo/singular-lite
cd demo/singular-lite
ls -la
```

2) Lire le README et la licence (GPL-3.0) et repérer les exemples et templates : https://github.com/alex-reysa/singular-lite

3) Exemple minimal de configuration d'agents (fichier YAML d'exemple). Adaptez selon vos besoins ; ce bloc est démonstratif :

```yaml
# agents.yaml (exemple demo)
agents:
  - name: l0-lint-fix
    role: L0
    max_leases: 1
    task: lint-fix
  - name: l1-add-test
    role: L1
    max_leases: 1
    task: add-test
  - name: l2-review-merge
    role: L2
    max_leases: 0
    task: review-merge
gates:
  protected_branches:
    - main
  merge_policy:
    manual_approval_first_n: 5
    test_pass_threshold: 95
```

4) Démarrer le contrôleur et lancer quelques agents selon le README. Vérifiez : logs, état des leases, git-worktrees créés, et entrées d'audit. Documentation et code : https://github.com/alex-reysa/singular-lite

5) Test pratique : demandez à un agent L0 de créer une PR; vérifiez que les modifications restent isolées dans un worktree et que des enregistrements d'audit sont générés.

## Problemes frequents et correctifs rapides

- Agents en conflit sur la même branche
  - Correctif : vérifier l'utilisation de git-worktree et restreindre l'acquisition de leases (primitives exposées dans le dépôt). Voir le repo : https://github.com/alex-reysa/singular-lite

- Gate qui bloque un merge (politique stricte ou tests instables)
  - Correctif : basculer temporairement sur approbation manuelle ou ajuster la configuration de la gate (policy). Les gates sont des primitives configurables dans le projet.

- Agents « détachés » inactifs
  - Correctif : redémarrer les agents et le contrôleur ; vérifier les logs et les permissions d'accès au dépôt.

Checklist dépannage rapide :
- [ ] Contrôleur en cours d'exécution
- [ ] Leases visibles et conformes à la configuration
- [ ] git-worktrees créés pour les tâches actives
- [ ] Entrées d'audit récentes listées

Plus d'information dans le code et la doc : https://github.com/alex-reysa/singular-lite

## Premier cas d'usage pour une petite equipe

Public cible : fondateurs solo et petites équipes souhaitant automatiser tâches répétitives à faible risque. Référence : https://github.com/alex-reysa/singular-lite

Conseils pratiques pour démarrer :
- Commencer par une seule tâche de faible portée (par ex. corrections de lint/format) en L0.
- Limiter les permissions des tokens agents (principe du moindre privilège).
- Garder une gate manuelle pour les premières fusions automatisées.

Procédure de base à tester : créer un agent L0 qui ouvre des PR de correction, observer les audits, puis introduire un L1 qui ajoute des tests. Voir le dépôt pour les primitives utilisées : https://github.com/alex-reysa/singular-lite

## Notes techniques (optionnel)

Principales primitives : L0/L1/L2, leases, gates, audits, git-worktree isolation, detached dispatch. Tous exposés/mentionnés dans le dépôt : https://github.com/alex-reysa/singular-lite

Exemple de variables d'environnement (illustratif) :

```json
{
  "LLM_KEY_ENV": "OPENAI_API_KEY",
  "AGENT_RUNTIME": "node",
  "AUDIT_PATH": "./audits"
}
```

Remarques de sécurité courtes : exécuter les agents avec le moindre privilège possible et stocker les clés dans un gestionnaire de secrets. Respectez la licence GPL-3.0 fournie dans le dépôt : https://github.com/alex-reysa/singular-lite

Méthodologie : synthèse basée sur l'extrait public du dépôt référencé ci‑dessus.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

Les éléments numériques et seuils ci‑dessous sont des suggestions opérationnelles à valider en interne (non extraits automatiquement du code) ; le dépôt documente toutefois les primitives clés : https://github.com/alex-reysa/singular-lite

- Agents initialement : 3 agents (ex. 1 L0, 1 L1, 1 L2).
- Période d'observation recommandée : 7–14 jours.
- Rétention d'audit suggérée : 30 jours.
- Paramètre d'exemple pour gate : manual_approval_first_n = 5.
- Seuil de test d'exemple : test_pass_threshold = 95%.
- max_leases recommandé au départ : 1–2 par agent.
- Backoff pour tentatives d'exécution : 30 s entre essais (exemple).
- Alerte opérationnelle : déclencher si >3 merges échoués sur 24 h ou taux d'erreur agent >5%.
- Estimation coût VM pour tests : 1–5 $/jour (indicatif).
- Exemple de limite de tokens pour LLM externe : 2048 tokens par requête (si utilisé).

### Risques / mitigations

- Risque : merges non souhaités — Mitigation : activer gates et approbation manuelle (manual_approval_first_n) et protéger les branches. Référence : https://github.com/alex-reysa/singular-lite
- Risque : conflits concurrents entre agents — Mitigation : utiliser leases et isolation via git-worktree (primitives du dépôt).
- Risque : fuites de secrets par agents — Mitigation : comptes/token limités et gestionnaire de secrets.
- Risque : obligations de licence GPL-3.0 — Mitigation : inclure LICENSE et consulter l'équipe juridique avant déploiement en production (voir repo).

### Prochaines etapes

- Lancer une démo locale : cloner https://github.com/alex-reysa/singular-lite et suivre le README.
- Créer et tester agents.yaml (ex. fourni plus haut) sur un dépôt non-production pendant la fenêtre d'observation indiquée.
- Instrumenter la surveillance : alertes pour échecs de merge (>3 / 24 h), taux d'erreur agent (>5%), et échecs d'écriture d'audit.
- Après une période stable, augmenter la concurrence graduellement (par exemple +1 max_leases tous les 7 jours) et étendre les tâches automatisées par paliers.

Checklist production final :
- [ ] Logs d'audit vérifiés et rétention configurée (>= 30 jours)
- [ ] Protection de branche activée pour main et branches de release
- [ ] Approbation manuelle requise pour premières fusions automatisées
- [ ] Alertes configurées : échecs de merge, taux d'erreur agent, échec d'audit
- [ ] Revue légale pour conformité GPL-3.0 (inclusion du fichier LICENSE)

Référence principale : https://github.com/alex-reysa/singular-lite
