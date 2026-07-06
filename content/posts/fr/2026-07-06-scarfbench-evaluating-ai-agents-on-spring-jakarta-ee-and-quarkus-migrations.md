---
title: "ScarfBench : évaluer des agents IA sur les migrations Spring, Jakarta EE et Quarkus"
date: "2026-07-06"
excerpt: "ScarfBench est un benchmark ouvert pour évaluer des agents IA sur la migration d’applications Java d’entreprise (Spring, Jakarta EE, Quarkus). Il mesure la préservation du comportement, la réussite des builds et la sécurité d’exécution."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-06-scarfbench-evaluating-ai-agents-on-spring-jakarta-ee-and-quarkus-migrations.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "ScarfBench"
  - "Java"
  - "Migration"
  - "Agents IA"
  - "Hugging Face"
  - "Entreprise"
  - "DevOps"
  - "Spring"
sources:
  - "https://huggingface.co/blog/ibm-research/scarfbench"
---

## TL;DR en langage simple

- ScarfBench est un benchmark ouvert publié le 30 juin 2026. Source : https://huggingface.co/blog/ibm-research/scarfbench
- Il mesure la migration de frameworks Java d’entreprise entre Spring, Jakarta EE et Quarkus. Il vérifie trois axes : préservation du comportement, build réussi et résolution des dépendances d’exécution. Voir https://huggingface.co/blog/ibm-research/scarfbench
- Résultat attendu par exécution : code transformé, artefact de build (jar/war), logs et rapport de tests.
- Exemple simple : vous exécutez un agent qui transforme une petite appli Spring en Quarkus. Vous attendez : un jar créé, les tests unitaires et un smoke test réussis, et un diff lisible pour revue.

Notes rapides : LLM = "modèle linguistique de grande taille" (large language model). CI = intégration continue. JVM = Java Virtual Machine. CSV = valeurs séparées par des virgules.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez construire un pipeline reproductible qui exécute une tâche ScarfBench et produit des artefacts vérifiables. Source : https://huggingface.co/blog/ibm-research/scarfbench

Plain-language explanation avant les détails techniques : le but est simple. On demande à un agent d’effectuer une migration de framework sur une seule application. Puis on vérifie automatiquement que le code compilé marche toujours. Enfin on garde des preuves (logs, diffs, rapports) pour examen humain.

Concrètement, dès la première exécution vous devez obtenir :
- l’arbre source transformé par l’agent ;
- un artefact de build (jar/war) et build.log ;
- un rapport de tests (CSV ou XML) avec taux de réussite ;
- les logs de l’agent et les diffs pour revue humaine.

Pourquoi c’est utile :
- Vous remplacez le jugement instinctif par des critères mesurables.
- Vous réduisez le risque de régression en exigeant build + tests avant promotion.

Chiffres de départ conseillés (à ajuster) : 95 % pour la couverture unitaire minimale ; objectif build_success_rate = 99 % ; commencer par 1 tâche pilote et 2 variantes d’agent.

## Avant de commencer (temps, cout, prerequis)

Prérequis minimaux : git, Docker (plateforme de conteneurs), Maven ou Gradle (outils de build Java), accès à la page ScarfBench (https://huggingface.co/blog/ibm-research/scarfbench).

Temps approximatif :
- installation et take‑off initial : 2–4 heures ;
- exécution d’un run complet (build + tests + checks) : 5–20 minutes pour une petite app (varie avec la taille).

Coût estimé (hypothèse à valider) : ~5 $ par run pour usage d’API/compute pendant tests.

Checklist préparatoire :
- [ ] Cloner ou accéder aux matériaux ScarfBench (https://huggingface.co/blog/ibm-research/scarfbench)
- [ ] Préparer un répertoire d’exécution isolé avec snapshot de config
- [ ] Vérifier que l’application baseline a des tests unitaires et smoke‑tests

Commandes rapides d’inspection :

```bash
# consulter l'article ScarfBench
open "https://huggingface.co/blog/ibm-research/scarfbench"

# cloner un repo pilote (exemple local)
git clone https://github.com/your-org/scarfbench-pilot.git || true
```

Exemple minimal de config (adaptable) :

```yaml
# run/config.yml
agent:
  name: sample-agent
  timeout_seconds: 3600   # 60 minutes
  max_tokens: 8192
run:
  tasks: 1
metrics:
  required_unit_pass_pct: 95
```

## Installation et implementation pas a pas

1. Lisez la description du benchmark et choisissez une tâche auto‑contenue sur https://huggingface.co/blog/ibm-research/scarfbench.
2. Créez un répertoire d’exécution et enregistrez run/config.yml (ex. ci‑dessus).
3. Capturez le comportement baseline : build + tests unitaires + smoke tests en Docker pour obtenir des métriques de référence.

```bash
cd sample-app
# build et test baseline avec Maven (exemple)
mvn -T 1C clean test
# builder une image baseline pour smoke-tests
docker build -t sample-app:baseline .
docker run --rm --name sample-smoke sample-app:baseline sh -c "./run-smoke-tests.sh"
```

4. Lancez l’agent sur la tâche choisie ; sauvegardez par run : source transformé, build.log, artefacts, logs d’agent.

```json
{
  "agent": "your-agent-id",
  "timeout_seconds": 3600,
  "max_tokens": 8192
}
```

5. Reproduisez le build et les tests sur la sortie migrée dans le même conteneur baseline. Enregistrez les résultats en CSV et conservez les diffs pour la revue.
6. Appliquez une gate d’acceptation simple : build_success == true ET smoke tests OK.

Référence principale : https://huggingface.co/blog/ibm-research/scarfbench

## Problemes frequents et correctifs rapides

La page ScarfBench explique le périmètre et les défis du benchmark (https://huggingface.co/blog/ibm-research/scarfbench). Voici les problèmes récurrents et des correctifs rapides.

| Problème | Correctif rapide |
|---|---|
| Build échoue (dépendances non résolues) | Verrouiller versions dans pom.xml / build.gradle et relancer sous Docker |
| Tests passent localement mais échouent en CI | Reproduire l’OS/JVM/vars via Docker |
| Agent déclare la tâche terminée mais comportement changé | Bloquer promotion automatique ; revue manuelle des diffs |
| Temps d’exécution long de l’agent | Diviser la tâche, ajouter points de contrôle et time‑box à 60 min |

Checklist dépannage :
- Reproduire le build dans Docker avec la même image JVM.
- Comparer pom.xml / build.gradle baseline vs migré.
- Examiner les logs pour dependency_errors_count et startup_ms.

Source : https://huggingface.co/blog/ibm-research/scarfbench

## Premier cas d'usage pour une petite equipe

Plan court et concret pour fondateurs solo ou équipes 1–3 personnes. Source : https://huggingface.co/blog/ibm-research/scarfbench

Actions prioritaires (points actionnables) :
1. Choisir la plus petite tâche auto‑contenue qui a des tests unitaires + smoke tests. Objectif : 1 tâche, 1 run reproductible. Temps cible par run : <= 20 minutes.
2. Travailler dans Docker. Toujours exécuter baseline et build migré dans la même image pour éviter les écarts d’environnement.
3. Imposer une gate simple avant promotion : build_success == true ET unit_pass_pct >= 95 %. Effectuer un spot‑check manuel sur 2–3 tests critiques.
4. Limiter le coût et le temps de l’agent : time‑box 60 min (3600 s) par run et max_tokens 8192. Suivre agent_calls_count et run_duration_ms.
5. Automatiser l’archivage : stocker 1) code transformé, 2) build.log, 3) CSV de métriques et 4) diffs pour chaque run. Garder au moins 7 runs archivés pour comparaison.
6. Si vous êtes seul : script cron pour 1 run/jour, notification Slack en cas d’échec, et rollback plan simple (git tag + revert script).

Rôles compressés pour 1–3 personnes : opérateur/runner, relecteur (peer) et responsable CI. Voir https://huggingface.co/blog/ibm-research/scarfbench

## Notes techniques (optionnel)

Scope technique : modernisation d’applications Java d’entreprise. ScarfBench se concentre sur la migration entre Spring, Jakarta EE et Quarkus et met l’accent sur préservation du comportement, build et navigation des dépendances runtime. Source : https://huggingface.co/blog/ibm-research/scarfbench

Métriques conseillées :
- build_success (bool), unit_pass_pct (%, ex. 95), integration_pass_pct (%, ex. 90),
- startup_ms (ex. cible <= 500 ms), dependency_errors_count (entier), run_duration_ms (ex. <= 300000 ms), agent_calls_count (entier).

Exemple d’en‑tête CSV pour reporting :

```csv
task_id,agent,build_success,unit_pass_pct,integration_pass_pct,startup_ms,dependency_errors_count,run_duration_ms
```

Conserver diffs, logs et snapshots de config pour traçabilité. Voir https://huggingface.co/blog/ibm-research/scarfbench

## Que faire ensuite (checklist production)

- Intégrer le runner ScarfBench à votre CI et appliquer gates (ex. build_success == true ET unit_pass_pct >= seuil).
- Archiver diffs, configs de run et CSV de résultats pour audit et comparaison d’agents.
- Étendre le corpus en ajoutant d’autres tâches ScarfBench et comparer plusieurs variantes d’agents.
- Prioriser tâches qui exposent des problèmes de dépendances/runtime.

### Hypotheses / inconnues

Éléments à valider pendant le pilote (hypothèses opérationnelles) :
- timeout agent proposé : 60 minutes (3600 s)
- max_tokens par appel agent : 8192 tokens
- required_unit_pass_pct (seuil initial) : 95 %
- required_build_success_rate : 99 %
- taille de l’équipe pilote : 1–3 personnes
- taille du pilote initial : 1 tâche, 2 variantes d’agent
- cadence d’expérimentation : 1 run/jour par tâche
- cible startup_ms pour smoke test : <= 500 ms
- run_duration_ms attendu pour vérifications rapides : <= 300000 ms (5 min)
- budget approximatif par run (hypothèse) : 5 $/run

### Risques / mitigations

- Risque : modifications sémantiques non souhaitées par l’agent.
  - Mitigation : bloquer promotion automatique tant que build_success != true ou unit_pass_pct < seuil ; revue manuelle sur API sensibles.
- Risque : dépendances runtime non résolues.
  - Mitigation : smoke tests conteneurisés ; considérer dependency_errors_count > 0 comme blocage.
- Risque : coûts LLM hors contrôle.
  - Mitigation : time‑box à 60 min, limiter max_tokens et suivre agent_calls_count.
- Risque : régression en production.
  - Mitigation : déploiement canari, surveillance active et rollback basé sur git tags.

### Prochaines etapes

1. Déployez un pilote sur 1 tâche et 2 variantes d’agent. Mesurez build_success_rate et unit_pass_pct.
2. Automatiser le runner et ajouter alerting (échecs build / dependency_errors_count).
3. Étendre le corpus ScarfBench et comparer agents sur 10+ tâches avant décision de production.

Ressource principale pour mise en œuvre et détails : https://huggingface.co/blog/ibm-research/scarfbench
