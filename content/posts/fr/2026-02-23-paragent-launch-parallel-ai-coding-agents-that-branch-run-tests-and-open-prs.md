---
title: "Paragent : Lancer des agents IA parallèles qui créent des branches, exécutent des tests et ouvrent des PRs"
date: "2026-02-23"
excerpt: "Connectez Paragent à un dépôt GitHub, fournissez vos clés LLM (BYO), et lancez des agents parallèles (Free : 2, Pro : 10) qui créent des branches, exécutent votre suite de tests et ouvrent des PRs pour revue."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-23-paragent-launch-parallel-ai-coding-agents-that-branch-run-tests-and-open-prs.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 45
editorialTemplate: "TUTORIAL"
tags:
  - "paragent"
  - "ai"
  - "github"
  - "automation"
  - "llm"
  - "ci"
  - "devops"
  - "startup"
sources:
  - "https://paragent.app/"
---

## TL;DR builders

- Installez l'application GitHub Paragent et connectez un dépôt via le flux d'installation (« 30-second setup ») — voir https://paragent.app/.
- Fournissez vos propres clés d'API LLM (OpenAI, Anthropic ou Gemini) en mode BYO : les exécutions d'agents consommeront votre quota/facturation fournisseur (https://paragent.app/).
- Choisissez un plan selon la concurrence attendue : Free (1 dépôt, 2 agents concurrents), Pro ($14/mo, 5 dépôts, 10 agents concurrents), Agency ($99/mo par siège, repos illimités, agents illimités, 5 sièges inclus) — détails sur https://paragent.app/.
- Lancez des agents en parallèle : Paragent crée une branche par agent, exécute la vérification et ouvre une PR. Paragent indique qu'il « never store[s] prompts or code » et qu'il « doesn't touch main » (source : https://paragent.app/).
- Ne mergez qu'après CI verte et revue humaine.

Checklist rapide :

- [ ] Installer le GitHub App Paragent sur un dépôt de test (https://paragent.app/)
- [ ] Configurer vos clés BYO dans l'espace Paragent
- [ ] Vérifier que la CI s'exécute sur les PRs (suite de vérification)
- [ ] Désigner au moins 1 relecteur humain par PR d'agent

Note méthodologique : ce guide synthétise le snapshot public de Paragent (https://paragent.app/) et transforme les assertions observées en étapes opérationnelles; les recommandations non explicitement citées sont listées comme hypothèses plus bas.

## Objectif et resultat attendu

Objectif primaire (source : https://paragent.app/) : permettre à des développeurs de décrire une fonctionnalité en langage naturel et de laisser des agents cloud lancer des branches, écrire le code, exécuter les tests puis ouvrir une PR.

Résultats attendus (d'après Paragent) :

- Une PR distincte par agent/branche avec le diff et le résultat de la suite de vérification (https://paragent.app/).
- Chaîne d'automatisation : branche fraîche -> plan -> code -> tests -> PR (process décrit sur https://paragent.app/).
- Amélioration possible du throughput : Paragent cite un chiffrage commercial « 1 feature/jour » -> « 5+ features per day » comme comparaison (https://paragent.app/).

Garde-fou : n'intégrez une PR d'agent que si la CI est verte et qu'un relecteur humain a approuvé.

## Stack et prerequis

- Dépôt GitHub avec CI (tests unitaires / intégration) exécutée sur les PRs (https://paragent.app/).
- Droits admin sur le dépôt pour installer la GitHub App Paragent et vérifier les scopes (https://paragent.app/).
- Compte Paragent et plan adapté : Free (0$, 1 repo, 2 concurrents), Pro ($14/mo, 5 repos, 10 concurrents), Agency ($99/mo par siège, illimité, 5 sièges) — https://paragent.app/.
- Clés d'API LLM (BYO) : OpenAI, Anthropic ou Gemini; la facturation des appels modèles revient à votre fournisseur (https://paragent.app/).
- Revue conformité : Paragent indique être « SOC 2 ready » et affirme ne pas stocker prompts ni code — validez contractuellement ces points avant large déploiement (https://paragent.app/).

Remarques opérationnelles (à traiter comme hypothèses si non validées localement) :

- Cible recommandée pour le pilote : tests unitaires qui s'exécutent en <10 minutes en moyenne pour accélérer les boucles.
- Commencez le pilote sur 1 dépôt et 1–2 relecteurs humains.

## Implementation pas a pas

1. Préparer un dépôt sandbox (https://paragent.app/)

   1.1. Choisir un dépôt non critique où la CI fonctionne déjà sur les PRs.
   1.2. Rédiger une description de fonctionnalité en anglais clair, par exemple : "Add Stripe checkout to the pricing page." (format cité sur https://paragent.app/).

2. Installer l'application GitHub Paragent (https://paragent.app/)

   2.1. Suivre le flux d'installation « 30-second setup » et autoriser les permissions minimales (lecture de l'arborescence, création de branches/PRs).
   2.2. Vérifier que l'app n'a pas de permission d'écriture sur main et que les protections de branche sont en place.

3. Configurer vos clés BYO dans Paragent (https://paragent.app/)

   3.1. Ajouter votre clé OpenAI/Anthropic/Gemini dans l'UI ou le connector BYO.
   3.2. Confirmer que la facturation des appels modèles se fait via votre fournisseur (BYO).

4. Lancer un pilote (canary + gates) (https://paragent.app/)

   4.1. Canary : lancez 1–2 agents en parallèle sur Free (2 concurrents) ou jusqu'à 10 agents sur Pro pour un pilote plus ambitieux.
   4.2. Gate 1 : CI verte obligatoire. Gate 2 : au moins 1 approbation humaine.
   4.3. Évaluer 5–10 PRs initiales ; si >=3/5 réussissent, envisager montée en charge.

5. Revue et itération (https://paragent.app/)

   5.1. Inspecter diffs et logs, demander modifications via la PR.
   5.2. Stabiliser les tests instables avant d'augmenter la concurrence.

Exemples pratiques (bash) :

```bash
# clone your sandbox repo
gh repo clone my-org/my-sandbox-repo
cd my-sandbox-repo
# set a GitHub Actions secret locally (optional) for testing
export OPENAI_API_KEY="sk-..."
gh secret set OPENAI_API_KEY -R my-org/my-sandbox-repo --body "$OPENAI_API_KEY"
# Open the Paragent setup page
xdg-open https://paragent.app/
```

Exemple de config connector (illustratif) :

```yaml
# sample Paragent BYO connector (illustrative)
provider: openai
api_key_secret_name: OPENAI_API_KEY
concurrency_limit: 10  # matches Pro plan concurrency
allowed_repos:
  - my-org/my-sandbox-repo
```

(Adapt to the actual UI shown on https://paragent.app/.)

## Architecture de reference

Vue globale (branch-per-agent) décrite par Paragent (https://paragent.app/) :

- Orchestrateur Paragent (cloud) : lance des agents isolés en parallèle jusqu'à la limite de concurrence du plan (par ex. 2, 10, illimité) — source : https://paragent.app/.
- Branche-agent par feature : chaque agent crée une branche fraîche, planifie l'implémentation, modifie le code, exécute la verification, puis ouvre une PR (https://paragent.app/).
- CI / Verification : votre pipeline s'exécute sur la PR; le verrou d'intégration est l'état vert de la CI + approbation humaine (https://paragent.app/).

Flux simplifié :

Agent request -> Paragent orchestration -> nouvelle branche git -> agent modifie + exécute tests -> PR ouverte -> CI -> revue -> merge/close (voir https://paragent.app/).

Sécurité & secrets : BYO keys (vos clés), permissions GitHub App : vérifier les scopes lors de l'installation (https://paragent.app/).

| Composant | Rôle | Exemple chiffré |
|---|---|---:|
| Orchestrateur | Lance agents en parallèle | jusqu'à 10 agents (Pro) ou illimité (Agency) |
| Plan Free | Capacité d'entrée | 1 dépôt, 2 agents concurrents, $0 forever |
| Plan Pro | Montée en charge | $14 /month, 5 dépôts, 10 concurrents |

## Vue fondateur: ROI et adoption

Principes de coût et parcours de montée en charge (source : https://paragent.app/) :

- Coûts fixes : abonnement plan (Free/Pro/Agency). Coûts variables : consommation LLM via vos clés (BYO) facturée par votre fournisseur (https://paragent.app/).
- Parcours recommandé : pilote 1 dépôt sur Free (2 agents), mesurer la qualité sur 5–10 PRs ; si satisfaisant, passer à Pro ($14/mo) pour 10 agents concurrents (https://paragent.app/).

KPIs opérationnels à instrumenter :

- % de PRs agents passant la CI sur fenêtre rolling (mesurer sur 5–10 PRs initiales).
- Temps moyen de revue par PR (minutes).
- Coût API par fonctionnalité livrée ($/feature) depuis vos logs fournisseur.
- Nombre de features livrées par semaine (Paragent cite un cas commercial « 5+ features per day » pour illustrer potentiel) — source : https://paragent.app/.

Règle de décision (exemple opérationnel) : si >=3/5 PRs passent la CI et la revue, augmenter la concurrence et considérer Pro ($14/mo) (https://paragent.app/).

## Pannes frequentes et debugging

Modes d'échec courants et procédures (référence : https://paragent.app/) :

- CI rouge sur PR d'agent : consulter les logs de l'agent, reproduire localement la branche d'agent, corriger et demander changements via la PR.
- Tests flaky : prioriser la stabilisation des tests; sinon marquer certains tests non bloquants.
- Permissions manquantes : vérifier la page d'installation GitHub App et les scopes accordés (https://paragent.app/).
- Erreurs / quotas LLM : comme BYO, les quotas viennent de votre fournisseur ; surveiller consommation et erreurs côté OpenAI/Anthropic/Gemini.

Checklist de debugging (à exécuter pour chaque PR problématique) :

- [ ] Examiner les logs d'exécution attachés à la PR (https://paragent.app/)
- [ ] Reproduire et exécuter la CI localement sur la branche d'agent
- [ ] Vérifier les permissions de l'application GitHub
- [ ] Contrôler les quotas et erreurs récentes côté fournisseur LLM
- [ ] Si nécessaire, fermer la branche et relancer l'agent avec un prompt ajusté

## Checklist production

### Hypotheses / inconnues

- Hypothèse : Paragent utilise vos clés API (BYO) et la facturation des appels modèles est gérée par votre fournisseur (assertion présente sur https://paragent.app/).
- Hypothèse : la déclaration publique « we never store prompts or code » est une promesse apparente sur le site; validez-la contractuellement et techniquement avant un déploiement large (https://paragent.app/).
- Hypothèse opérationnelle : viser des tests unitaires <10 minutes pour boucles rapides; seuils pilotes cités (ex. >=3/5 PRs green) sont des exemples et doivent être adaptés.

### Risques / mitigations

- Risque : CI flaky -> adoption freinée. Mitigation : sprint de stabilisation des tests et marquage de tests non bloquants.
- Risque : dépassement budgétaire LLM. Mitigation : activer alertes budgétaires côté fournisseur, commencer à basse concurrence (1–2 agents) et monitorer $/feature.
- Risque : permissions erronées. Mitigation : vérifier scopes GitHub App à l'installation et maintenir protections sur main.
- Risque : fuite de données sensibles via prompts. Mitigation : restreindre données envoyées aux agents et obtenir garanties contractuelles de conservation/données (https://paragent.app/).

### Prochaines etapes

1. Lancer un pilote sur 1 dépôt avec 2 agents (plan Free) et collecter 5 PRs pour évaluation (https://paragent.app/).
2. Instrumenter métriques : taux de succès CI, temps moyen de revue (min), coût API par PR ($), nombre de features livrées/semaine.
3. Si >=3/5 PRs passent CI et revue, envisager Pro ($14/mo) pour monter à 10 agents concurrents et réévaluer sur 20 PRs.
4. En cas d'échec, mettre en pause, corriger tests/flaky, revoir permissions et relancer le canary.

Remarque finale : tous les éléments produit/plan/prix cités ici proviennent du snapshot public de Paragent (https://paragent.app/). Utilisez le plan Free pour un premier essai (1 dépôt, 2 concurrents) et n'élargissez le périmètre qu'après validation des critères de qualité et conformité.
