---
title: "Prototyper des démos vision→action avec le modèle omnimodal NVIDIA Cosmos 3"
date: "2026-06-01"
excerpt: "Guide pratique (UK) pour exécuter Cosmos 3 : donner une image ou un court clip + un prompt, obtenir du raisonnement en texte ou des trajectoires en pixels pour robot. Inclut étapes d'installation, démos et conseils de sécurité."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-01-prototype-vision-to-action-demos-using-nvidia-cosmos-3-omnimodal-world-model.jpg"
region: "UK"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "NVIDIA"
  - "Cosmos 3"
  - "omnimodal"
  - "vision"
  - "robotique"
  - "IA"
  - "prototype"
  - "UK"
sources:
  - "https://research.nvidia.com/labs/cosmos-lab/cosmos3/"
---

## TL;DR en langage simple

- Cosmos 3 est un modèle omnimodal qui relie texte, images, vidéo, audio et actions dans une seule architecture (source: https://research.nvidia.com/labs/cosmos-lab/cosmos3/).
- Il sait expliquer une scène (vision‑langage) et produire des sorties actionnables — par exemple une trajectoire en coordonnées pixels pour un préhenseur (ex. (490, 419) -> (710, 500)) (source: https://research.nvidia.com/labs/cosmos-lab/cosmos3/).
- Pour démarrer rapidement : clonez le dépôt officiel, lisez la model card et lancez une démo fournie pour inspecter les formats d’entrée/sortie (source: https://research.nvidia.com/labs/cosmos-lab/cosmos3/).
- Sécurité : testez d’abord en simulation et n’envoyez jamais de commandes matérielles en production sans revue humaine (source: https://research.nvidia.com/labs/cosmos-lab/cosmos3/).

## Ce que vous allez construire et pourquoi c'est utile

Vous allez prototyper un flux simple : image/clip vidéo + instruction → texte explicatif ou sortie actionnable (trajectoire, commande). Cosmos 3 combine perception, raisonnement et génération d’actions, ce qui réduit le code glue entre composants (source: https://research.nvidia.com/labs/cosmos-lab/cosmos3/).

Tableau récapitulatif (décision rapide)

| Entrée | Sortie attendue | Cas d'usage | Exemple (coords) |
|---|---:|---|---:|
| Image statique + prompt | Explication + points d'intérêt | Debug, annotation | (490,419) -> (710,500) (source: https://research.nvidia.com/labs/cosmos-lab/cosmos3/) |
| Clip vidéo + prompt | Trajectoire temporelle | Pick‑and‑place temporel | Série de coords en pixels |
| Audio + vidéo + prompt | Description multimodale | Scénarios AV complexes | transcript + actions |

Pourquoi utile : un seul modèle peut couvrir vision‑langage reasoning, génération et sorties liées à la dynamique, simplifiant integrations rapides (source: https://research.nvidia.com/labs/cosmos-lab/cosmos3/).

## Avant de commencer (temps, cout, prerequis)

Prérequis minimaux (vérifier la model card avant téléchargement) :

- Accès au dépôt et à la model card officielle (source: https://research.nvidia.com/labs/cosmos-lab/cosmos3/).
- Machine avec Python 3.8+ et, si possible, un GPU CUDA. GPU recommandé : 1 GPU avec 16–32 GB VRAM (estimation), sinon test en CPU possible mais lent.
- Compétences : Python de base, CLI, et capacité à lire une model card/licence.

Checklist rapide :

- [ ] Cloner le dépôt officiel.
- [ ] Avoir l’autorisation/licence pour télécharger les poids.
- [ ] Environnement Python isolé prêt.
- [ ] Procédure de revue sécurité documentée avant tests hardware.

Temps et coûts indicatifs (valeur à valider localement) :

- Premier run fonctionnel : ≈ 2–6 heures (dépend de la disponibilité des artefacts).
- Jeu d’évaluation initial : 10–50 exemples.
- Budget cloud GPU : variable; prévoyez 1–10 heures GPU selon tests. (source: https://research.nvidia.com/labs/cosmos-lab/cosmos3/)

## Installation et implementation pas a pas

1. Lire README, model card et rapport technique sur la page officielle (source: https://research.nvidia.com/labs/cosmos-lab/cosmos3/).
2. Cloner le dépôt et créer un environnement Python isolé.

```bash
# clone and prepare environment (exemple)
git clone https://research.nvidia.com/labs/cosmos-lab/cosmos3.git
cd cosmos3
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

3. Télécharger les poids et artefacts indiqués dans la model card et renseigner le chemin dans un fichier de configuration.

```yaml
# example config.yaml
model:
  weights_path: /path/to/cosmos3/weights
  device: cuda:0
  batch_size: 1
inference:
  demo: pick_place
  output_dir: ./outputs
```

Remarques opérationnelles : batch_size=1 minimise les risques d’OOM ; utilisez cuda:0 si vous avez 1 GPU. (source: https://research.nvidia.com/labs/cosmos-lab/cosmos3/)

4. Lancer une démo fournie pour inspecter formats d’entrée/sortie (exemple de prompt public : "Put the flower into the red bottle").

```bash
python demos/run_demo.py --config config.yaml --input examples/flower_bottle.jpg \
  --prompt "Put the flower into the red bottle"
```

5. Vérifier les sorties (vidéo, logs, fichier trajectoire). Ne connectez pas de matériel réel avant validation en simulation et revue humaine.

## Problemes frequents et correctifs rapides

(source: https://research.nvidia.com/labs/cosmos-lab/cosmos3/)

- Accès/licence aux poids : suivre la model card — ne pas distribuer sans autorisation.
- OOM GPU : réduisez batch_size à 1, activez mixed precision (AMP) ou passez à un GPU avec + VRAM (p. ex. 24 GB).
- Format d’entrée invalide : validez dimensions et tokens avec les exemples du dépôt.
- Sortie dangereuse (trajectoires hors limites) : simuler, clamp les coordonnées et ajouter contrôles anti‑collision.

Exemples de correctifs rapides (config) :

```yaml
# quick-tune.yaml
model:
  batch_size: 1
  device: cuda:0
inference:
  precision: amp
```

Commandes utiles :

```bash
# relancer demo avec config réduite
python demos/run_demo.py --config quick-tune.yaml --input examples/flower_bottle.jpg
```

Conseil de dépannage : si vous avez OOM, réduisez batch_size à 1 et surveillez l’usage VRAM (ms-level logs ou outils système).

## Premier cas d'usage pour une petite equipe

Scénario ciblé : prototype pick‑and‑place guidé par vision pour solo founder ou petite équipe (1–3 personnes). (source: https://research.nvidia.com/labs/cosmos-lab/cosmos3/)

Rôles minimaux et actions concrètes pour un solo founder / petite équipe :

1) Prioriser un pipeline minimal en 1 journée (actionable) :
   - Etape A (0–4 heures) : cloner le dépôt, installer l’environnement et lancer la démo officielle pour comprendre formats d’entrée/sortie (source: https://research.nvidia.com/labs/cosmos-lab/cosmos3/).
   - Etape B (4–8 heures) : exécuter 10 exemples en simulation et collecter sorties + logs.
2) Construire un jeu d’évaluation rapide (actionable) :
   - Créez 10–50 cas réels/simulés, mesurez taux de réussite et latence médiane (cible initiale ≈ 500 ms pour interaction, à valider localement).
3) Automatiser la validation et le versioning (actionable) :
   - Pinner les poids et configs (hash), stocker outputs et logs par run (au moins 3 runs par changement majeur).
4) Sécurité et intégration hardware (actionable) :
   - Toujours simuler ; limiter les coordonnées (clamp) ; exiger revue humaine avant mise en route matérielle.
5) Déploiement canary minimal (actionable) :
   - Déployer sur 1–10% des unités et surveiller 5 minutes ; rollback si métriques < seuils (ex. succès < 70%).

Livrables pour une petite équipe/solo : config.yaml, prompts.txt, dossier outputs/ (vidéo + trajectoire), rapport d’évaluation (10–50 cas) et checklist sécurité.

## Notes techniques (optionnel)

Cosmos 3 utilise une architecture unifiée "Mixture of Tokens (MoT)" combinant composants autoregressifs et diffusion pour langue, image, vidéo, audio et actions ; les démonstrations montrent reasoning vision‑langage et sorties dynamiques pour politiques robotisées (source: https://research.nvidia.com/labs/cosmos-lab/cosmos3/).

Artefacts à récupérer : code du dépôt, model card et rapport technique listés sur la page officielle (source: https://research.nvidia.com/labs/cosmos-lab/cosmos3/).

Remarque méthodologique : mesurez latence, VRAM et taux de réussite dans votre environnement — les chiffres publics servent de référence mais doivent être validés localement.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Temps estimé pour un premier run fonctionnel ≈ 2–6 heures — à valider localement.
- Taille d’équipe d’exemple = 1–3 personnes.
- Seuil de succès simulé recommandé avant tests réels ≈ 70%.
- GPU minimum pratique pour inference rapide = 1 GPU (16–32 GB VRAM estimés).
- VRAM confortable estimée ≈ 24 GB ; batch_size sûr initial = 1.
- Jeu d’évaluation rapide : 10–50 exemples.
- Latence interactive cible médiane ≈ 500 ms (mesurer localement).

Validez chaque hypothèse contre la model card et vos propres mesures. (source: https://research.nvidia.com/labs/cosmos-lab/cosmos3/)

### Risques / mitigations

- Risque : trajectoires hors limites ou dangereuses.
  - Mitigation : simulation obligatoire, clamp de coordonnées, contrôles anti‑collision, revue humaine.
- Risque : restrictions d’accès aux poids ou licence incompatible.
  - Mitigation : suivre la model card, obtenir autorisations avant usage commercial.
- Risque : OOM / latence excessive.
  - Mitigation : réduire batch_size, activer mixed precision (AMP), provisionner plus de VRAM.
- Risque : régression après mise à jour.
  - Mitigation : pinner artefacts, versionner configs, exécuter tests de régression (10–50 cas).

### Prochaines etapes

1. Cloner le dépôt officiel et exécuter les démos localement ou sur GPU cloud ; collecter outputs + config + logs (1 run initial en 2–6 heures). (source: https://research.nvidia.com/labs/cosmos-lab/cosmos3/)
2. Lancer une évaluation simulée de 10–50 exemples ; mesurer taux de réussite et latence ; itérer sur prompts et clamps.
3. Mettre en place un déploiement canary (10% cible) et surveiller pendant 5 minutes ; rollback si métriques < seuils.
4. Auditer conformité à la model card et à la licence avant toute utilisation commerciale.

Méthode rapide : apprenez d’abord les formats d’entrée/sortie à partir des démos publiques avant d’implémenter des intégrations matérielles personnalisées. (source: https://research.nvidia.com/labs/cosmos-lab/cosmos3/)
