---
title: "Mesurer les taux de résolution des agents IA avec Terminal-Bench-Science v0.1 sur 70 workflows scientifiques experts"
date: "2026-08-28"
excerpt: "Guide pratique pour reproduire le benchmark Terminal-Bench-Science v0.1, exécuter les 70 tâches publiées, calculer les taux de résolution (meilleur modèle ≈ 30 %) et construire un pipeline d’évaluation léger et auditable."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-28-measure-ai-agent-resolution-rates-with-terminal-bench-science-v01-across-70-expert-scientific-workflows.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "benchmark"
  - "Terminal-Bench-Science"
  - "agents"
  - "évaluation"
  - "recherche"
  - "audit"
sources:
  - "https://www.terminal-bench-science.ai/announcement"
---

## TL;DR en langage simple

- Terminal-Bench-Science v0.1 est un benchmark continu mené par des chercheurs (dont une équipe de Stanford) et construit par l’équipe derrière Terminal-Bench. Il évalue des agents IA sur des workflows scientifiques réels (Annonce : https://www.terminal-bench-science.ai/announcement).
- Portée connue : release initiale = Terminal-Bench-Science 0.1 avec 70 tâches et un leaderboard public ; le meilleur modèle testé atteint ≈ 30 % de taux de résolution sur ces tâches (Annonce : https://www.terminal-bench-science.ai/announcement).
- Ce document montre comment mettre en place un pipeline minimal d’évaluation reproductible : exécuter tâches, conserver sorties brutes, calculer taux de résolution et garder preuve pour adjudication humaine (Annonce : https://www.terminal-bench-science.ai/announcement).

Méthodologie (bref) : conservez les sorties brutes, rapportez des statistiques robustes (par ex. médiane + écart-type) et archivez métadonnées pour audit.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez construire un pipeline léger qui :
- envoie des tâches Terminal-Bench-Science v0.1 à un ou plusieurs agents ;
- enregistre prompts, réponses brutes et métadonnées (hash, horodatage, version du modèle) ;
- calcule le taux de résolution par agent pour comparer au leaderboard public (Annonce : https://www.terminal-bench-science.ai/announcement).

Pourquoi c’est utile : les 70 tâches sont tirées de workflows réels contribué par des chercheurs ce qui rend l’évaluation plus pertinente pour du travail de recherche que des exercices standardisés (Annonce : https://www.terminal-bench-science.ai/announcement).

Exemple d’usage minimal : valider si un agent peut aider sur une étape répétitive d’un protocole ou d’un nettoyage de données, en conservant la trace complète pour revue humaine.

(Annonce : https://www.terminal-bench-science.ai/announcement)

## Avant de commencer (temps, cout, prerequis)

Lisez d’abord l’annonce officielle : https://www.terminal-bench-science.ai/announcement

Prérequis essentiels : clés API pour les agents à tester, espace de stockage pour JSON bruts et métadonnées, script d’exécution basique.

Points pratiques à vérifier avant un run (Annonce : https://www.terminal-bench-science.ai/announcement) :
- avoir accès aux définitions de tâches et au protocole de scoring ;
- établir un emplacement d’archivage (répertoire, bucket) pour toutes les sorties ;
- définir qui fait l’adjudication humaine si nécessaire.

(Annonce : https://www.terminal-bench-science.ai/announcement)

## Installation et implementation pas a pas

But minimal : lire la tâche, demander à l’agent, sauvegarder réponse et métadonnées, puis appliquer le scoring ou envoyer pour adjudication humaine (Annonce : https://www.terminal-bench-science.ai/announcement).

1) Récupérer les informations publiques et le README officiel :

```bash
git clone https://www.terminal-bench-science.ai/announcement ./tbs-info
ls -la ./tbs-info
```

2) Exemple de configuration d’agent (exemple générique) :

```yaml
# agent_configs.yaml
agents:
  - id: agent-example
    endpoint: https://api.vendor.example/v1
    model: example-model
    temperature: 0.0
    # max_tokens et retries sont des paramètres d'implémentation
    max_tokens: 8192
    retries: 3
    backoff_ms: 500
```

3) Préparer environnement et dossiers :

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
mkdir -p results/raw results/csv
```

4) Lancer un run minimal : appeler votre script d’exécution qui lit la tâche, envoie la requête, stocke JSON + métadonnées et produit un CSV résumé (Annonce : https://www.terminal-bench-science.ai/announcement).

5) Conserver : JSON brut, horodatage, hash du commit, version du modèle et fichier CSV d’analyse sommaire.

(Annonce : https://www.terminal-bench-science.ai/announcement)

## Problemes frequents et correctifs rapides

- Authentification / quotas : implémentez retries et backoff (exponentiel avec jitter) ; ne commettez jamais de clés dans le dépôt.
- Format de tâche variable : validez le JSON/YAML localement avant envoi.
- Contestation du scoring : conservez sorties brutes et mettez en place une file d’adjudication humaine.
- Variabilité des runs : utilisez des répétitions et rapportez des statistiques robustes (médiane + écart-type).
- Surveillance coûts/usage : tracez consommation de tokens et dépenses API, et définissez plafonds opérationnels.

(Annonce : https://www.terminal-bench-science.ai/announcement)

## Premier cas d'usage pour une petite equipe

Contexte : équipe 1–3 personnes souhaitant évaluer rapidement si un assistant IA apporte de la valeur sur des tâches répétitives ou rédactionnelles (Annonce : https://www.terminal-bench-science.ai/announcement).

Conseils concrets pour fondateurs solo / petites équipes :

- Prioriser les tâches business-critical : sélectionnez 2–4 tâches représentatives qui, si automatisées, rendent un gain direct (ex. rédaction d’un protocole, nettoyage d’un fichier, synthèse d’un rapport).
- Script d’exécution minimal : automatiser un petit harness qui lit la tâche, appelle l’API, sauvegarde JSON + métadonnées, et exporte un CSV sommaire pour lecture rapide.
- Gate humain obligatoire : toute sortie que vous comptez utiliser en production doit être relue par un expert avant exécution expérimentale ou décisionnelle.

Commandes concrètes pour une petite équipe :

```bash
# exécute une tâche et collecte les sorties
python run_benchmark.py --task tasks/task-001.json --agent-config agent_configs.yaml --out results/raw --repeat 3
```

```bash
# produire un tableau récapitulatif simple
python summarize_results.py --in results/raw --out results/csv/leaderboard.csv --fields agent_id,task_id,resolution_flag
```

(Annonce : https://www.terminal-bench-science.ai/announcement)

## Notes techniques (optionnel)

- Terminal-Bench-Science 0.1 est présenté comme un benchmark continu avec 70 tâches et un leaderboard public ; le meilleur modèle testé atteint ≈ 30 % de résolution sur cette release (Annonce : https://www.terminal-bench-science.ai/announcement).
- Stocker les artefacts essentiels : JSON brut, CSV résumé, hash du harness, horodatage, version modèle et notes d’adjudication.
- Exposer un endpoint de synthèse qui calcule le taux de résolution par agent à partir des CSV/JSON archivés.

(Annonce : https://www.terminal-bench-science.ai/announcement)

## Que faire ensuite (checklist production)

- [ ] Smoke test court : récupérer tâches v0.1 et exécuter une sélection pour vérifier intégration.
- [ ] Archiver sorties brutes et métadonnées pour audit et reproduction.
- [ ] Mettre en place une file d’adjudication humaine pour les décisions de production.
- [ ] Instrumenter monitoring coûts et usage API (alertes sur consommation unexpected).
- [ ] Planifier réévaluations périodiques du benchmark et pinner les versions des modèles/artefacts.

(Annonce : https://www.terminal-bench-science.ai/announcement)

### Hypotheses / inconnues

Les valeurs opérationnelles suivantes sont des recommandations proposées ici (elles ne figurent pas dans l’annonce officielle) ; adaptez-les à votre contexte :

| Élément | Valeur proposée | Commentaire |
|---|---:|---|
| Taille release TBS | 70 tâches | information issue de l’annonce (v0.1) |
| Résolution leader | ~30 % | valeur reportée pour le meilleur modèle (annonce) |
| Répétitions | 3–5 runs | pratique courante pour estimer variance |
| Max tokens (ex. agent) | 4096–8192 tokens | paramètre d’implémentation typique |
| Latence médiane cible | < 2000 ms | seuil opérationnel proposé |
| Budget plafond par expérience | $20–$100 | recommandation de contrôle des coûts |
| Archive initiale pour audit | 100 interactions | conserver premiers cas pour vérification |
| Erreurs acceptables | < 5 % | seuil opérationnel proposé |
| Hallucinations tolérées | < 10 % sur échantillon | seuil de suivi, pas une norme officielle |

### Risques / mitigations

- Fuite de données sensibles via API → mitigation : anonymisation, suppression des champs sensibles, préférer endpoints privés/on‑prem si possible.
- Résultats erronés ou dangereux pour la recherche → mitigation : revue humaine obligatoire avant tout déploiement expérimental ; conserver artefacts pour forensic.
- Coûts hors contrôle → mitigation : limites budgétaires, monitoring en temps réel et alertes lorsqu’un seuil ($100 par expérience proposé ci‑dessus) est dépassé.
- Metrics bruyantes → mitigation : répéter N = 3–5 et rapporter médiane + écart‑type, garder sorties brutes pour adjudication.

### Prochaines etapes

1. Court terme (1–3 jours) : cloner informations publiques, exécuter un smoke test, exporter CSV sommaire.

```bash
python run_benchmark.py --task tasks/task-001.json --agent-config agent_configs.yaml --out results/raw --repeat 3
python summarize_results.py --in results/raw --out results/csv/leaderboard.csv
```

2. Moyen terme (1–2 semaines) : pilote étendu, file d’adjudication humaine, suivi coûts et latence, pinner versions et archiver métadonnées.

3. Long terme (mensuel) : réévaluations régulières du benchmark, automatisation du monitoring et procédures de rollback.

Pour la portée officielle, les tâches et le leaderboard public, consultez l’annonce : https://www.terminal-bench-science.ai/announcement
