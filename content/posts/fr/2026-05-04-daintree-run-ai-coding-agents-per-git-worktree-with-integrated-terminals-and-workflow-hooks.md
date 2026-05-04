---
title: "Daintree — exécuter des agents de codage IA par worktree git avec terminaux intégrés et hooks de workflow"
date: "2026-05-04"
excerpt: "Daintree exécute des agents de codage IA (Claude, Gemini, Codex) dans des git worktrees isolés, injecte le contexte de fichiers et fournit un terminal intégré plus des hooks de workflow pour des changements sûrs et examinables."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-04-daintree-run-ai-coding-agents-per-git-worktree-with-integrated-terminals-and-workflow-hooks.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "agents"
  - "git"
  - "worktree"
  - "Daintree"
  - "devops"
  - "sécurité"
sources:
  - "https://github.com/daintreehq/daintree"
---

## TL;DR en langage simple

- Daintree est un environnement de délégation open‑source pour orchestrer des agents de codage IA. Voir : https://github.com/daintreehq/daintree
- Les sessions d'agent s'attachent à des git worktrees : chaque agent travaille dans une copie isolée du dépôt, peut lire le code, exécuter des commandes et proposer des commits/PRs sans toucher directement la branche principale. Voir : https://github.com/daintreehq/daintree
- Fonctionnalités clés (extrait du dépôt) : gestion de sessions pour différents modèles, association session ↔ worktree, terminal intégré, injection de contexte dans les prompts, et automatisation de workflows. Voir : https://github.com/daintreehq/daintree

Actions immédiates recommandées :
- Cloner le dépôt et lire le README. Voir : https://github.com/daintreehq/daintree
- Créer un worktree dédié pour votre premier agent de test
- Conserver vos clés API hors du dépôt (fichier local ignoré par git) et exiger une revue humaine avant fusion

Exemple rapide (flux idéal) : un développeur crée un worktree agent/refactor‑alice, l'agent propose un refactoring, ouvre une PR depuis ce worktree ; un relecteur humain valide avant fusion. Voir : https://github.com/daintreehq/daintree

## Ce que vous allez construire et pourquoi c'est utile

Objectif : mettre en place, localement ou en staging, un environnement où des agents IA peuvent proposer des modifications isolées dans des git worktrees, exécuter des commandes via un terminal intégré et automatiser commits/PRs de façon contrôlée. Source : https://github.com/daintreehq/daintree

Composants confirmés dans le dépôt :
- Gestion de sessions pour modèles variés (ex. Claude, Gemini, Codex). Voir : https://github.com/daintreehq/daintree
- Association d'une session à un git worktree pour isolation du contexte. Voir : https://github.com/daintreehq/daintree
- Terminal intégré et injection de fichiers/extraits dans les prompts. Voir : https://github.com/daintreehq/daintree
- Hooks d'automatisation pour commits/PRs et workflows. Voir : https://github.com/daintreehq/daintree

Décision de pilotage (exemple de matrice de rôle)

| Rôle de l'agent | Tâche principale | Actions autorisées | Approbation requise |
|---|---:|---|---|
| Exploration | Prototype | Créer fichiers dans worktree | 1 réviseur humain |
| Refactor | Réécriture ciblée | Commit dans worktree | CI + 1 réviseur |
| Automatisation | Formatage / style | Commit auto possible | Feature flag |

## Avant de commencer (temps, cout, prerequis)

Préparez‑vous à lire le README et à vérifier les prérequis listés dans le dépôt : https://github.com/daintreehq/daintree

Prérequis minimaux (vérifier contre le README du dépôt) :
- git avec support des worktrees (fonctionnalité git core)
- terminal shell et accès Internet
- clés API pour le(s) fournisseur(s) IA que vous utiliserez (à stocker hors du dépôt)

Vérifications à faire avant de lancer :
- [ ] Cloner le dépôt localement (voir README)
- [ ] Ajouter les fichiers de config locaux à .gitignore
- [ ] Préparer un worktree de test

Budget : prévoyez un petit crédit pour appels API selon votre fournisseur ; consultez la facturation fournisseur et adaptez le pilote. Voir : https://github.com/daintreehq/daintree

## Installation et implementation pas a pas

Note courte : Daintree attache une session IA à un git worktree ; consultez le README pour les commandes exactes et options. Voir : https://github.com/daintreehq/daintree

1) Cloner le dépôt

```bash
git clone https://github.com/daintreehq/daintree
cd daintree
less README.md
```

2) Installer les dépendances

Consultez le README pour la commande exacte selon le runtime. Exemple générique :

```bash
# Exemple générique — remplacez par la commande indiquée dans le README
# node / python / go selon le projet
npm install || pip install -r requirements.txt
```

3) Exemple de configuration locale (NE PAS committer)

Créez un fichier local pour vos clés et paramètres, ignoré par git. Remplacez les valeurs par vos secrets en local.

```yaml
# config.local.yml (exemple)
providers:
  claude:
    key: "YOUR_CLAUDE_KEY"
server:
  port: "<voir README>"
  concurrency: "<voir README>"
```

4) Créer et utiliser un worktree de test

```bash
# depuis la racine du dépôt
git worktree add ../agent/test-1 main
cd ../agent/test-1
git status
```

5) Démarrer l'agent / daemon

Vérifiez la commande exacte dans le README du dépôt et ajustez selon votre environnement. Voir : https://github.com/daintreehq/daintree

6) Test rapide

Demandez un petit changement via l'interface fournie, lancez vos tests et ouvrez une PR depuis le worktree vers la branche principale pour vérifier le flux.

## Problemes frequents et correctifs rapides

Authentification (erreurs 401)
- Vérifiez que les clés sont présentes dans votre fichier de config local et non commité. Regénérez la clé si nécessaire. Voir : https://github.com/daintreehq/daintree

Worktree cassé / HEAD détaché

```bash
git worktree list
git worktree prune
```

Port occupé
- Si le port serveur est déjà utilisé, modifiez la configuration locale (voir README) et redémarrez le service. Voir : https://github.com/daintreehq/daintree

Débit / latence des API
- Limitez le nombre d'agents concurrents et implémentez retry/backoff côté client ; pour des conseils détaillés, consultez le README du dépôt. Voir : https://github.com/daintreehq/daintree

## Premier cas d'usage pour une petite equipe

Cible : pilote pour fondateurs solo ou équipes de 2–3 personnes souhaitant tester rapidement la valeur des agents IA sans complexifier l'organisation. Voir : https://github.com/daintreehq/daintree

Conseils pratiques et actions concrètes (au moins 3 points actionnables) :

- Isoler un seul worktree canari
  - Créez un worktree unique (par ex. agent/canary) pour tous les essais initiaux ; cela limite la surface d'impact et simplifie le suivi.
  - Exemple de commande :

```bash
git worktree add ../agent/canary main
cd ../agent/canary
```

- Forcer une revue humaine et tests locaux avant fusion
  - Travaillez toujours dans le worktree, ouvrez une PR vers main et exigez au minimum une revue humaine. Ajoutez un script local qui exécute lint + tests rapides avant d'ouvrir la PR.

- Protéger les secrets et contrôler les coûts
  - Ne stockez pas de clés dans le dépôt. Utilisez un fichier .env ignoré ou un gestionnaire de secrets minimal.
  - Ajoutez des règles simples pour limiter le nombre d'exécutions automatisées pendant le pilote (ex. un seul run par jour ou par push).

- Mesurer et itérer en petite échelle
  - Collectez un feedback quotidien (1–3 retours par personne) pendant la semaine pilote et documentez les échecs fréquents pour ajuster prompts et permissions.

- Règles opérationnelles pour 1–3 personnes
  - Pas de fusion automatique ; exigez revue humaine.
  - Conserver les configs d'exemple dans repo (sans secrets). Voir : https://github.com/daintreehq/daintree

## Notes techniques (optionnel)

Points confirmés par le dépôt : sessions pour plusieurs modèles, attachement à des worktrees, terminal intégré et injection de contexte ; pour détails d'implémentation, consultez le code et le README : https://github.com/daintreehq/daintree

Méthodologie : ce guide synthétise la description publique du dépôt. Vérifiez toujours le README et les fichiers de configuration pour les commandes exactes.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues
- Hypothèse : Daintree fournit la gestion de sessions pour Claude, Gemini et Codex et attache chaque session à un git worktree avec injection de contexte et terminal intégré (source : https://github.com/daintreehq/daintree).
- Hypothèse : la structure exacte des commandes d'installation, les noms de paramètres (port, concurrency, retry) et les valeurs par défaut ne sont pas exposées dans l'extrait public et varient selon la version ; confirmez dans le README du dépôt.
- Hypothèses chiffrées (à vérifier dans le README / config réel) : 1–3 heures pour un premier test, port par défaut éventuel 8080, concurrence par défaut 3 agents, backoff initial 500 ms, plafond budgétaire pilote $50, token budget 1000 tokens/session, seuil CI cible 80% tests passés, latence cible 200 ms, pilote de 7 jours.

### Risques / mitigations
- Risque : fuite de secrets. Mitigation : .gitignore strict, vault ou gestionnaire de secrets, suppression des historiques si fuite détectée.
- Risque : coûts API incontrôlés. Mitigation : plafonds budgétaires, limitation du nombre d'agents concurrents (ex. 1–3 pendant pilote), alertes de dépense et quotas par clé.
- Risque : fusion de code non vérifié. Mitigation : exiger au moins un réviseur humain et un gate CI avec seuil de tests (ex. 80% vert) avant toute fusion.

### Prochaines etapes
- Déplacer les clés vers un gestionnaire de secrets et supprimer les copies locales.
- Ajouter des scripts pré‑PR qui lancent lint + tests rapides et empêchent l'ouverture de PRs sans ces checks.
- Lancer un pilote de 7 jours avec 1–3 personnes, collecter métriques et retours, et itérer.
- Documenter le workflow dans le README local et committer les exemples de configuration (sans secrets).

Checklist go‑live :
- [ ] Secrets dans un vault et supprimés des copies locales
- [ ] Gates CI appliquent lint/tests locaux = pass
- [ ] Approbation humaine requise pour PRs d'agents
- [ ] Monitoring et alertes budgétaires configurés
- [ ] Pilote effectué et retours collectés

Référence et point de départ : https://github.com/daintreehq/daintree
