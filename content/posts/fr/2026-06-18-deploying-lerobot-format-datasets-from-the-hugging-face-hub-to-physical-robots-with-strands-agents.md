---
title: "Déployer des jeux de données au format LeRobot du Hub Hugging Face vers des robots physiques avec Strands Agents"
date: "2026-06-18"
excerpt: "Guide traduit et localisé montrant comment Strands Robots compose des AgentTools LeRobot pour prendre des démonstrations au format LeRobot sur Hugging Face Hub, les évaluer en simulation, appliquer une porte de déploiement et exécuter un canari supervisé sur du matériel réel."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-18-deploying-lerobot-format-datasets-from-the-hugging-face-hub-to-physical-robots-with-strands-agents.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "robotique"
  - "Strands"
  - "LeRobot"
  - "Hugging Face"
  - "simulation"
  - "déploiement"
  - "SDK"
  - "sécurité"
sources:
  - "https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware"
---

## TL;DR en langage simple

- Strands Robots est un SDK open source d'AWS (licence Apache-2.0) qui permet de composer une boucle agent pour relier un dépôt de démonstrations sur le Hugging Face Hub au simulateur et au matériel LeRobot (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware).
- Flux documenté dans le walkthrough : enregistrer des démonstrations → pousser sur le Hub → simuler avec les mêmes artefacts → évaluer une politique → déployer sur matériel (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware).
- Les composants LeRobot restent responsables de l'enregistrement et de la calibration bas‑niveau; Strands orchestre la boucle agent et le fan‑out via un maillage de pairs. Les backends d'inférence GR00T et LerobotLocal exposent une interface commune; certains checkpoints (ex. MolmoAct2) transitent via LerobotLocal selon l'article (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware).

Conseil express : commencez par cloner l'exemple Strands + LeRobot du walkthrough, pointez la SimulationTool vers votre repo dataset sur le Hub, et vérifiez que la simulation écrit le même format disque que vos enregistrements matériels (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware).

## Ce que vous allez construire et pourquoi c'est utile

H3 Explication simple

Vous composez un unique agent Strands qui orchestre cinq étapes continues décrites dans le walkthrough : enregistrement, push vers le Hub, simulation, évaluation/validation d'une politique, et déploiement/coordination sur matériel. L'objectif est de remplacer plusieurs outils isolés par une boucle unique et traçable (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware).

H3 Ce que contient la solution

- Un agent Strands configuré avec AgentTools LeRobot (enregistreur, simulateur, loaders, mesh). (source : https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware)
- Simulation et matériel partagent le même format LeRobotDataset (fichiers sur disque identiques), ce qui réduit la friction sim-to-real. (source : https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware)
- Deux backends d'inférence (GR00T et LerobotLocal) offrent une interface commune; certains checkpoints (MolmoAct2) passent via LerobotLocal. (source : https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware)
- Un maillage de pairs (peer mesh) permet de fancher l'agent vers plusieurs robots pour coordination et déploiement progressif. (source : https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware)

Pourquoi utile : centralisation, traçabilité des versions (dataset + checkpoint) et parité de format entre sim et réel, d'après le walkthrough (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware).

## Avant de commencer (temps, cout, prerequis)

H3 Temps et effort

- Le walkthrough du blog décrit 5 étapes opérationnelles à suivre pour relier Hub → sim → hardware; le temps réel dépend de vos données et de vos tests. Voir le guide pas à pas ici : https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware

H3 Prérequis matériels et logiciels

- Compte Hugging Face avec droits d'écriture pour créer/pousser un dataset sur le Hub (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware).
- Strands Robots SDK (open source, Apache-2.0) installé et accessible. (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware)
- Un appareil LeRobot réel ou un simulateur compatible qui lit/écrit le format LeRobotDataset (dataset.json + frames/). (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware)
- Un checkpoint de politique compatible avec LerobotLocal ou GR00T si vous voulez exécuter l'inférence (article mentionne GR00T et LerobotLocal et leur interface commune). (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware)

H3 Remarque opérationnelle

Consultez d'abord le walkthrough du blog pour les exemples de configuration et scripts fournis : https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware

## Installation et implementation pas a pas

H3 Explication plain-language

Le guide officiel montre comment cloner l'exemple, créer un repo dataset sur le Hub, configurer un agent Strands avec les AgentTools LeRobot et lancer la boucle. Les commandes ci‑dessous reprennent l'essentiel du flux décrit dans le walkthrough (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware).

H3 Étapes essentielles

1) Cloner l'exemple et inspecter l'agent

```bash
git clone https://github.com/your-org/strands-example-agent.git
cd strands-example-agent
ls -la
```

2) Créer et pousser un LeRobotDataset sur le Hugging Face Hub

```bash
huggingface-cli repo create my-org/lerobot-demos --type dataset
# préparer dataset.json + frames/
git init
git remote add origin https://huggingface.co/datasets/my-org/lerobot-demos
git add .
git commit -m "Add LeRobotDataset"
git push origin main
```

3) Exemple minimal de configuration d'agent (strands_agent.yaml)

```yaml
agent:
  id: lerobot-agent-sample
  tools:
    - name: LeRobotRecorder
    - name: SimulationTool
      params:
        dataset_repo: "my-org/lerobot-demos"
        eval_episodes: 100
    - name: LerobotLocal
      params:
        checkpoint_path: "/path/to/checkpoint.pt"
    - name: MeshCoordinator
```

4) Lancer la boucle et collecter résultats

```bash
python -m strands_agent run --config strands_agent.yaml --output sim_results.json
cat sim_results.json
```

H3 Vérification importante

- La SimulationTool est conçue pour écrire LeRobotDatasets au même format disque que ceux enregistrés sur le matériel (voir walkthrough). (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware)
- Testez localement le chargement du checkpoint via LerobotLocal/GR00T avant toute diffusion via le mesh (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware).

## Problemes frequents et correctifs rapides

H3 Dépannage rapide (résumé)

- Erreur push HF / permissions : vérifier que vous avez bien un token avec permission d'écriture sur le repo dataset du Hub. Référez‑vous au guide de push dans le walkthrough (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware).
- Mismatch format sim vs matériel : la solution est d'utiliser la SimulationTool du walkthrough qui écrit le même format LeRobotDataset que le matériel ; comparez dataset.json et le dossier frames/ (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware).
- Échec chargement checkpoint : contrôler la compatibilité avec LerobotLocal/GR00T et valider le chemin de fichier comme montré dans l'exemple de configuration. (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware)
- Perte de pairs dans le maillage : vérifier logs du mesh et la configuration réseau; le walkthrough décrit l'usage d'un peer mesh pour fan‑out (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware).

H3 Contrôles et vérifications à faire

- Confirmer que le commit du dataset apparaît sur le Hub après push.
- Charger et valider localement le checkpoint avec LerobotLocal avant déploiement via Mesh.
- Inspecter les artefacts produits par la SimulationTool et vérifier qu'ils correspondent au format attendu.

## Premier cas d'usage pour une petite equipe

H3 Contexte et objectifs

Équipe : 1–3 personnes. Objectif : itérer rapidement une routine simple sur un bras LeRobot en minimisant le travail d'orchestration. Le walkthrough centralise les étapes d'enregistrement, simulation, évaluation et déploiement (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware).

H3 Plan d'action priorisé (concret pour solo founders / petites équipes)

1. Composer un agent minimal : installez et configurez LeRobotRecorder + SimulationTool + LerobotLocal + MeshCoordinator dans un seul fichier strands_agent.yaml. Utilisez l'exemple du walkthrough comme base (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware).
2. Enregistrer et pusher un jeu de démonstrations localement sur le Hub : démarrez par un corpus restreint, vérifiez que la SimulationTool réécrit le même format disque, puis itérez depuis ce dataset unique (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware).
3. Valider localement le checkpoint avant déploiement : chargez-le via LerobotLocal/GR00T et exécutez quelques épisodes en simulation pour vérifier l'intégration. Le walkthrough montre comment connecter ces backends d'inférence (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware).
4. Déployer en canari (single-robot) et observer : utilisez le mesh pour cibler un seul robot d'abord, collectez artefacts et logs, puis étendez le déploiement si tout est conforme (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware).
5. Automatiser les répétitions utiles : script simple qui exécute "push dataset → run simulation → collect results → pin SHAs" pour gagner 1–2 heures par itération.

H3 Checklist pré-exécution

- [ ] Agent Strands construit à partir de l'exemple du walkthrough. (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware)
- [ ] Dataset sur le Hub vérifié et accessible.
- [ ] Checkpoint chargé localement via LerobotLocal/GR00T et testé en simulation.

## Notes techniques (optionnel)

H3 Points techniques clés

| Composant | Fait confirmé dans le walkthrough | Commentaire rapide |
|---|---:|---|
| Strands Robots SDK | Open source, AWS, Apache-2.0 (walkthrough) | Orchestration d'AgentTools (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware) |
| LeRobotDataset | Simulation et matériel partagent le même format disque | Simplifie sim-to-real (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware) |
| GR00T / LerobotLocal | Exposent interface commune; MolmoAct2 via LerobotLocal | Backends d'inférence documentés dans l'article (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware) |

H3 Architecture en bref

L'agent combine AgentTools LeRobot : l'enregistreur/générateur de démonstrations, la SimulationTool (qui produit LeRobotDatasets), les backends d'inférence (GR00T/LerobotLocal) et un MeshCoordinator pour le fan‑out vers plusieurs robots (https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware).

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Durée estimée pour suivre le walkthrough en mode guidé : ~240 minutes (4 heures) — hypothèse opératoire.
- Taille initiale recommandée du dataset : ~50 démonstrations — hypothèse.
- Nombre d'épisodes de validation en simulation conseillé comme point de départ : 100 épisodes — hypothèse.
- Seuil de succès proposé avant canary : ~85% de réussite (hypothèse de validation).
- Canary matériel initial : 1 robot pour M = 50 épisodes d'observation (hypothèse de procédure).
- Latence d'inférence cible pour boucles interactives : < 200 ms (hypothèse technique).
- Rotation de tokens / credentials : tous les 30 jours (hypothèse sécurité).
- Coût approximatif de référence : $0.05 par 1k inférences (hypothèse budgétaire).

Méthodologie courte : les éléments ci‑dessus marqués « hypothèse » proviennent d'efforts opérationnels usuels et doivent être validés dans votre contexte avant production.

### Risques / mitigations

- Risque : erreurs sim→real malgré parité de format.
  - Mitigation : itérer sur démonstrations réelles, valider checkpoints en simulation puis en canary.
- Risque : checkpoint incompatible avec LerobotLocal/GR00T.
  - Mitigation : tester le chargement localement et conserver un manifeste de SHAs pour rollback.
- Risque : fuite de credentials.
  - Mitigation : ne pas committer de secrets, utiliser vault/tokens et appliquer rotation régulière.

### Prochaines etapes

- Pinner SHAs du dataset et du checkpoint dans un manifeste de déploiement pour rollback rapide.
- Mettre en place une télémétrie minimale : task_success, episode_length, collision_count; créer alertes sur valeurs anormales (ex. >5 collisions en 50 épisodes).
- Automatiser le pipeline: push dataset → run simulation → gate d'évaluation → canary → échelle.
- Relire et suivre le walkthrough complet pour exemples, scripts et fichiers d'exemple : https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware

Fin. Si vous voulez, je peux générer un strands_agent.yaml prêt à l'emploi adapté à 1–3 personnes ou un petit script d'automatisation pour la chaîne sim→canary.
