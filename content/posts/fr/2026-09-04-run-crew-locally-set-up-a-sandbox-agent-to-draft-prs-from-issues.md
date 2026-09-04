---
title: "Exécuter Crew en local : configurer un agent sandbox pour rédiger des PR depuis des issues"
date: "2026-09-04"
excerpt: "Guide pas à pas pour exécuter localement le dépôt Crew, inspecter .claude/skills et .github, et configurer un agent IA étroit pour ébaucher des PR à partir d'issues tout en conservant une approbation humaine."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-04-run-crew-locally-set-up-a-sandbox-agent-to-draft-prs-from-issues.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "AI"
  - "agents"
  - "développement"
  - "crew"
  - "GitHub"
  - "sandbox"
sources:
  - "https://github.com/JamelHammoud/crew"
---

## TL;DR en langage simple

- Clonez le dépôt public pour inspecter la structure : https://github.com/JamelHammoud/crew. Le snapshot public montre la présence des dossiers .claude/ et .github/ dans le checkout.
- Objectif rapide : ajouter un "skill" (compétence) limité dans .claude/skills, le tester sur un fork et n'autoriser que des PR en draft ; un humain valide avant merge.
- Résultat attendu : l'agent prépare des ébauches de PR. Un humain relit et décide de merger.

Points clés rapides (chiffres utiles) : démarrage local en ~30–120 minutes, piloter sur 7–14 jours, limiter à 3–5 personnes pour un pilote initial. Voir le dépôt : https://github.com/JamelHammoud/crew.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez déployer localement (ou en environnement de test) un prototype qui automatise des tâches répétitives (tri d'issues, ébauches de PR) en ajoutant une compétence dans .claude/skills du repo https://github.com/JamelHammoud/crew. Le snapshot public indique la présence du dossier .claude/ (et de .github/) ce qui facilite l'ajout d'artifacts côté repo.

Pourquoi c'est utile :
- Réduction du temps sur tâches répétitives (gain estimé 10–30% du temps produit sur petites tâches simples).
- Conservation du contrôle humain sur le merge (workflow en draft + approbation manuelle).

Tableau décisionnel rapide (draft vs auto-merge)

| Critère | Mode draft (recommandé) | Auto-merge (risqué) |
|---|---:|---:|
| Contrôle humain | élevé | faible |
| Déploiement initial | 7–14 jours canary | à éviter pour P0 |
| Risque de régression | faible | élevé |
| Complexité d'audit | faible | élevée |

Référence repo : https://github.com/JamelHammoud/crew

## Avant de commencer (temps, cout, prerequis)

Prérequis minimum : Git, accès GitHub, un terminal, un fork pour tests. Le repo source : https://github.com/JamelHammoud/crew.

Temps estimé : 30–120 minutes pour une démo locale selon expérience (30 min = développeur familier ; 120 min = débutant + résolution de dépendances). Pilote recommandé : 7–14 jours.

Checklist préliminaire :
- [ ] Cloner le dépôt
- [ ] Vérifier la présence de .claude/ et .github/
- [ ] Préparer un fork pour tests
- [ ] Isoler un compte/service principal pour les tokens

Chiffres utiles à garder en tête : 1–3 personnes pour un proto solo/small-team, canary initial 1%–5% des issues, et seuil d'alerte >10 erreurs/24h.

Source et inspection : https://github.com/JamelHammoud/crew (le snapshot public montre .claude/ et .github/).

## Installation et implementation pas a pas

1) Cloner et vérifier la structure :

```bash
# cloner et vérifier les dossiers visibles dans le snapshot
git clone https://github.com/JamelHammoud/crew
cd crew
ls -la .claude .github || true
```

2) Lire le README du repo pour dépendances et instructions exactes : https://github.com/JamelHammoud/crew

3) Exemple minimal d'un skill (placer sous .claude/skills/) :

```yaml
# .claude/skills/issue-drafter.yaml (exemple)
name: issue-drafter
role: assistant
allowed_actions:
  - create_draft_pr
  - add_comment
limits:
  max_prs_per_day: 5
  max_tokens: 2048
approval_required: true
```

4) Démarrer et tester localement selon le README. Tester sur un fork : ouvrir une issue de test et valider qu'une PR draft est créée (ou que l'action propose une ébauche).

Commandes utiles de rollback / branching :

```bash
# revenir à un tag connu si nécessaire
git fetch --tags
git checkout tags/last-known-good -b rollback-test
```

Notes de sécurité rapides : ne stockez pas de clés dans le dépôt ; utilisez un gestionnaire de secrets et limitez les permissions aux scopes strictement nécessaires (ex. créer des PRs mais pas merge).

Référence : https://github.com/JamelHammoud/crew

## Problemes frequents et correctifs rapides

Source d'inspection : https://github.com/JamelHammoud/crew (snapshot public).

Problèmes fréquents et actions rapides :
- Absence ou mauvaise structure des skills → vérifier .claude/skills et le format YAML.
- Permissions insuffisantes côté token → créer un token avec scopes de création de PR mais sans permission de merge.
- Service local ne démarre pas (port occupé) → changer le port ou killer le process (vérifier timeouts <3000 ms si applicable).
- Coûts LLM élevés → réduire max_tokens (ex. 1024 au lieu de 2048) et abaisser temperature à 0.1–0.2.

Checklist dépannage :
- [ ] Confirmer commandes du README
- [ ] Vérifier .claude/skills
- [ ] Valider scopes du token
- [ ] Tester rollback via tag

## Premier cas d'usage pour une petite equipe

Contexte : vous êtes 1–3 fondateurs ou une petite équipe (solo ou équipe réduite). Objectif : automatiser tri d'issues et ébauches de PR avec risque minimal.

Actions concrètes et actionnables pour solo founders / petites équipes :
1) Scope minimal et permissions restreintes
   - Limitez le skill à create_draft_pr et add_comment seulement.
   - N'accordez pas de permission de merge au token : testez avec un compte de service qui ne peut créer que des PR draft.

2) Validation humaine obligatoire et quota journalier
   - Activez approval_required dans la config et fixez max_prs_per_day = 3–5.
   - Exigez que chaque PR draft soit revue par au moins 1 personne avant merge.

3) Canary et observabilité simple
   - Lancez sur 1 repo forké pendant 7–14 jours et limitez la fraction d'issues traitées à 1%–5% au départ.
   - Loggez appels modèles et erreurs ; alertez si >10 erreurs en 24h.

4) Scripts conviviaux pour le founder solo
   - Préparez 3 commandes : deploy, rollback, et clean-logs.
   - Gardez un alias git pour revenir en 1 commande au tag stable.

5) Mesures de succès et seuils rapides
   - Valider 10 PRs de test qualitatives avant élargissement.
   - Latence cible p95 <500 ms pour les métadonnées et timeouts modèle <3000 ms.

Checklist pour déploiement initial (solo) :
- [ ] Préparer un fork de test
- [ ] Créer un token avec scopes limités
- [ ] Déployer skill en draft-only
- [ ] Valider 10 PRs de test

Référence repo : https://github.com/JamelHammoud/crew

## Notes techniques (optionnel)

Références structurelles issues du snapshot public : https://github.com/JamelHammoud/crew — le snapshot montre .claude/ et .github/ et un historique de commits conséquents (13,295 commits, 26 stars, 1 fork selon l'extrait public).

Bonnes pratiques techniques : pinner un commit/tag avant rollout, journaliser les appels LLM, contrôler max_tokens et temperature pour maîtriser coûts et variabilité (ex. max_tokens 1024–2048, temperature 0.1–0.2).

Exemple de configuration prête pour test :

```yaml
# .claude/skills/quick-drafter.yaml
name: quick-drafter
role: assistant
allowed_actions:
  - create_draft_pr
limits:
  max_prs_per_day: 3
  max_tokens: 1024
  temperature: 0.1
approval_required: true
```

Voir le dépôt pour la structure : https://github.com/JamelHammoud/crew

## Que faire ensuite (checklist production)

Voir le dépôt et le README avant tout rollout : https://github.com/JamelHammoud/crew

### Hypotheses / inconnues

- Les paramètres chiffrés ci‑dessus (max_prs_per_day = 3–5, max_tokens = 1024–2048, temperature = 0.1–0.2, canary 1%–5%, pilote 7–14 jours, seuil d'alerte >10 erreurs/24h, timeouts <3000 ms, latence p95 <500 ms) sont des recommandations opérationnelles et non des valeurs extraites du code du dépôt. Elles sont listées ici comme hypothèses conservatrices.
- Les éléments de configuration exacts et le format YAML applicables dépendent du moteur d'orchestration décrit dans le README du dépôt (vérifier à l'usage).
- Le snapshot public indique : 13,295 commits, 26 stars, 1 fork et la présence des dossiers .claude/ et .github/ (source : https://github.com/JamelHammoud/crew).

### Risques / mitigations

- Risque : merges non souhaités → Mitigation : tokens sans droit de merge, approval_required true.
- Risque : fuite de secrets → Mitigation : gestionnaire de secrets et rotation régulière.
- Risque : coûts LLM hors contrôle → Mitigation : limiter max_tokens, réduire temperature, quota journalier (3–5 PRs/jour).
- Risque : mauvaise qualité à volume élevé → Mitigation : canary 1%–5% puis escalade progressive.

### Prochaines etapes

- Migrer clés vers un gestionnaire de secrets.
- Pinner le dépôt sur un commit/tag stable avant rollout.
- Mettre en place monitoring (PRs/jour, erreurs/24h, latences p95).
- Documenter la checklist de revue humaine et automatiser rollback via tag local.

Checklist finale de production :
- [ ] Migrer clés hors dépôt
- [ ] Pinner un commit/tag stable
- [ ] Mettre en place monitoring et alertes
- [ ] Valider 10 PRs de qualité en pilote

Note méthodologique : ce guide s'appuie sur l'extrait public du dépôt https://github.com/JamelHammoud/crew ; récupérez toujours les commandes et la configuration exactes depuis le README du dépôt au moment du déploiement.
