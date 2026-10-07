---
title: "LiquidAI d1-3B et d1-omni-600M : modèles décisionnels multimodaux conçus pour l'edge"
date: "2026-10-07"
excerpt: "Présentation et résultats des modèles décisionnels ouverts LiquidAI (d1-3B et d1-omni-600M) : réponses en une passe, prise en charge multimodale, latences mesurées sur Jetson (≈16–50 ms) et guide de déploiement pour petites équipes."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-10-07-liquidai-d1-3b-and-d1-omni-600m-multimodal-decision-models-built-for-edge-devices.jpg"
region: "FR"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "edge"
  - "modèles décisionnels"
  - "multimodal"
  - "LiquidAI"
  - "d1-3B"
  - "d1-omni-600M"
  - "NVIDIA Jetson"
sources:
  - "https://huggingface.co/blog/LiquidAI/open-d1"
---

## TL;DR en langage simple

- Ce qui est publié : LiquidAI a publié deux modèles décisionnels ouverts le 7 octobre 2026 : d1-3B (≈3 milliards de paramètres, texte + images) et d1-omni-600M (≈600 millions, texte + images ou texte + audio — expérimental). Source : https://huggingface.co/blog/LiquidAI/open-d1
- Qu'est‑ce qu'un « modèle décisionnel » : il calcule une seule réponse en une seule passe (forward pass). Il ne génère pas de texte token par token comme un modèle de chat. Cela réduit la latence et simplifie la gestion des timeouts. Source : https://huggingface.co/blog/LiquidAI/open-d1
- Latences rapportées (référence) pour d1-3B : 16 ms sur NVIDIA Jetson AGX Thor, 26 ms sur Jetson AGX Orin, 50 ms sur Jetson Orin Nano. Ces chiffres servent de jalons de validation, pas de garanties contractuelles. Source : https://huggingface.co/blog/LiquidAI/open-d1
- Choix rapide : utilisez d1-3B pour texte+image ; choisissez d1-omni-600M seulement si vous avez besoin d'audio et acceptez le statut expérimental. Mesurez sur vos appareils puis déployez en canari (ex. 5 %). Source : https://huggingface.co/blog/LiquidAI/open-d1

Exemple concret : vous voulez un filtre de sécurité image+texte sur un Jetson Orin Nano. Objectif initial : médiane ≤50 ms. Démarrez avec d1-3B, batch_size=1, FP16, 100 warmups puis 1 000 runs chronométrés. Comparez la médiane à 50 ms. Source : https://huggingface.co/blog/LiquidAI/open-d1

## Ce que vous allez construire et pourquoi c'est utile

Vous allez monter une chaîne d'inférence minimale qui tourne sur l'appareil (edge). Entrée : texte + image (ou texte + audio pour d1-omni-600M). Sortie : une décision unique (étiquette, oui/non ou réponse courte).

Pourquoi c'est utile :

- Latence réduite : la réponse arrive en une passe, utile quand l'expérience utilisateur exige <100 ms ou pour des boucles de contrôle.
- Logique simplifiée : pas de gestion de flux de tokens ni d'agrégation de stream.
- Adapté à l'edge : moins de coûts CPU/GPU et consommation énergétique réduite en évitant le décodage autoregressif.

Explication simple avant les détails techniques :

- Modèle décisionnel = modèle qui prend des entrées (texte, image, audio) puis renvoie directement une réponse unique. Il n'écrit pas du texte pas à pas.
- Multimodal = accepte plusieurs types d'entrée (ici texte + image, ou texte + audio pour la version expérimental).
- LFM = Liquid Foundation Models (famille de modèles de base utilisée par LiquidAI). Source : https://huggingface.co/blog/LiquidAI/open-d1

## Avant de commencer (temps, cout, prerequis)

Informations publiques tirées de la publication :

- Modalités prises en charge : d1-3B → texte + image. d1-omni-600M → texte + image ou texte + audio (expérimental). Source : https://huggingface.co/blog/LiquidAI/open-d1
- Tailles signalées : d1-3B ≈ 3 000 000 000 paramètres ; d1-omni-600M ≈ 600 000 000 paramètres. Source : https://huggingface.co/blog/LiquidAI/open-d1
- Résultats de benchmark : d1-3B = 82.9 (score moyen sur plusieurs jeux publics) ; d1-omni-600M = 78.4. d1-3B obtient un Decision Index de 48.57 (meilleur sous 10B). Source : https://huggingface.co/blog/LiquidAI/open-d1

Estimations pratiques pour une petite équipe :

- Configuration initiale et validation : 4–8 heures pour télécharger, configurer et exécuter des mesures simples.
- Optimisations et tests FP16/quantification : 1–3 jours.
- Déploiement canari et surveillance initiale : 1–3 jours.

Prérequis matériels et logiciels :

- Appareil cible : NVIDIA Jetson AGX Thor, Jetson AGX Orin ou Jetson Orin Nano (ou équivalent). "Edge" = exécution locale sur l'appareil plutôt que dans le cloud.
- Pile logicielle : JetPack/CUDA compatible. Runtime d'inférence avec support FP16 (ex. ONNX Runtime, Torch‑TRT ou runtimes optimisés constructeur).
- Accès aux fichiers modèles publiés (page de release). Source : https://huggingface.co/blog/LiquidAI/open-d1

Checklist minimale :

- [ ] Choix du modèle (d1-3B ou d1-omni-600M).
- [ ] Appareil cible et seuil de latence fixés (ex. ≤50 ms sur Orin Nano).
- [ ] Runtime d'inférence choisi et version bloquée.

## Installation et implementation pas a pas

Suivez ces étapes pour obtenir une pipeline d'inférence locale et mesurable. (Sources et méthode : publication LiquidAI). Source : https://huggingface.co/blog/LiquidAI/open-d1

1) Préparer l'appareil

- Installer le conteneur officiel du constructeur ou s'assurer que la version de JetPack/CUDA correspond au runtime. Utilisez la documentation NVIDIA pour votre modèle Jetson.

2) Télécharger le modèle

- Choisissez d1-3B ou d1-omni-600M et vérifiez la somme de contrôle après téléchargement. La page de publication indique les fichiers. Source : https://huggingface.co/blog/LiquidAI/open-d1

Exemple (remplacez par le CLI / URL fournis par la release) :

```bash
MODEL=d1-3B
mkdir -p /opt/models/$MODEL
# Exemple indicatif : utiliser huggingface-cli ou curl vers l'URL de la release
# huggingface-cli repo download user/$MODEL --revision main --output /opt/models/$MODEL
# sha256sum /opt/models/$MODEL/model.bin
```

3) Installer un runtime d'inférence

- ONNX Runtime, Torch‑TRT ou un runtime optimisé constructeur. Assurez-vous du support FP16 (virgule flottante 16 bits) et des Tensor Cores si disponibles.

4) Prétraiter les entrées

- Images : redimensionner à la résolution cible du modèle, appliquer center-crop si demandé, convertir en FP16 si le runtime le supporte, normaliser selon la fiche technique du modèle.
- Texte : utiliser le tokenizer compatible avec le backbone LFM indiqué dans la release. Source : https://huggingface.co/blog/LiquidAI/open-d1

5) Exécuter une inférence de base et mesurer

- Batch size = 1 (exigence courante pour la latence sur edge).
- Warmup : 100 runs. Mesures : 1 000 runs. Enregistrez la médiane, le p95 et le taux de succès.
- Comparez la médiane aux références de l'article (16 ms / 26 ms / 50 ms) comme contrôle sanitaire. Source : https://huggingface.co/blog/LiquidAI/open-d1

6) Optimiser si nécessaire

- Tester FP16, réduire la résolution d'image, appliquer des optimisations du runtime (fusions de graphe, TensorRT, etc.). Mesurer toujours l'impact sur la précision vs la latence.

7) Conteneuriser et ajouter des portes de déploiement

- Exposer un endpoint HTTP/gRPC avec checks de santé et métriques (latency_ms, p95_ms, success_rate).
- Ajouter routage feature-flag pour canari (commencer par 5 %).

Exemple de configuration (YAML) :

```yaml
model:
  name: d1-3B
  modalities: [text, image]
  batch_size: 1
device:
  type: AGX-Orin
  fp_mode: FP16
rollout:
  canary_percent: 5    # 5% initial canary
  latency_gate_ms: 50  # gate example
metrics:
  capture: [latency_ms, p95_ms, success_rate]
```

## Problemes frequents et correctifs rapides

- Erreurs de runtime (mismatch CUDA / JetPack) : utiliser le conteneur constructeur ou pinner la version de JetPack/CUDA.
- Latence supérieure aux valeurs rapportées : forcer batch_size = 1, activer FP16, réduire la résolution d'image, désactiver logs debug.
- Fichiers modèles corrompus : retélécharger et vérifier checksum.
- Prétraitement audio (d1-omni-600M, expérimental) : vérifier fréquence d'échantillonnage, conversion mono et attente de l'encodeur. Source : https://huggingface.co/blog/LiquidAI/open-d1

Tableau de référence de latence (guide approximatif fourni par l'article) :

| Appareil             | Médiane (ms) | p95 (ms) | Porte (ms) |
|---------------------:|-------------:|---------:|-----------:|
| Jetson AGX Thor      | 16           | 22       | 20         |
| Jetson AGX Orin      | 26           | 40       | 50         |
| Jetson Orin Nano     | 50           | 90       | 100        |

Source : https://huggingface.co/blog/LiquidAI/open-d1

## Premier cas d'usage pour une petite equipe

Scénario : vous êtes solo‑founder ou équipe de 2–3 personnes et vous voulez un vérificateur de sécurité image+texte sur Orin Nano avec un gate de latence ≤50 ms.

Étapes prioritaires et actionnables :

1) Démarrer avec d1-3B sur un Orin Nano de développement. Mesurer baseline : 100 warmup + 1 000 runs timés. Sauvegarder médiane et p95 dans un CSV. Objectif : reproduire la médiane ≈50 ms avant montée en charge. Source : https://huggingface.co/blog/LiquidAI/open-d1

2) Utiliser les conteneurs constructeurs préconstruits et un runtime éprouvé (ONNX Runtime ou runtime optimisé) pour éviter le debugging d'environnement. Garder batch_size = 1 et activer FP16 rapidement pour mesurer l'impact.

3) Déploiement canari + rollback : 5 % de trafic durant 24 h. Garde‑fous exemples :
   - médiane ≤50 ms (Orin Nano),
   - p95 ≤100 ms,
   - augmentation d'erreur ≤0,5 point de pourcentage. Rollback si un gate échoue (ex. rollback en <5 minutes).

4) Conserver la portée limitée : réponses courtes ou étiquettes uniques ; post‑processing minimal.

5) Automatiser les métriques : CSV avec [device, model, fp_mode, median_ms, p95_ms, runs=1000]. Un artefact par build.

6) Si besoin d'audio plus tard, considérer d1-omni-600M comme expérimental : valider séparément le prétraitement audio avant l'intégrer au canari. Source : https://huggingface.co/blog/LiquidAI/open-d1

Livrables MVP :
- 1 image Docker ou unit systemd,
- 1 fichier CSV de métriques (1 000 runs par device),
- 1 table de correspondance décision → action (mapping input → expected output).

## Notes techniques (optionnel)

- Backbones d'entraînement : d1-3B est entraîné depuis LFM2.5-VL-3B, un VLM (vision-language model) decoder‑only. d1-omni-600M est entraîné depuis LFM2.5-Encoder-350M, un encodeur bidirectionnel enrichi d'encodeurs vision et audio. Cela explique les différences de modalités prises en charge. Source : https://huggingface.co/blog/LiquidAI/open-d1
- Comportement d'un modèle décisionnel : une seule passe → une réponse unique. Concevez vos timeouts et checks de santé selon cette sémantique plutôt que sur du streaming de tokens.
- Benchmarks : tests sur sept jeux publics couvrant lecture, détection de toxicité, classification d'intention, Q&R médical et compréhension cross-lingue. Scores moyens rapportés : 82.9 (d1-3B), 78.4 (d1-omni-600M). Source : https://huggingface.co/blog/LiquidAI/open-d1

Remarque opérationnelle : les seuils de latence publiés doivent servir de jalons de validation interne, pas de promesses de disponibilité contractuelle. Source : https://huggingface.co/blog/LiquidAI/open-d1

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse : les médianes indiquées (16 ms, 26 ms, 50 ms) sont représentatives pour des entrées texte+image similaires sur les mêmes classes d'appareils. Votre charge réelle peut varier selon résolution et longueur de texte. Source : https://huggingface.co/blog/LiquidAI/open-d1
- Hypothèse : l'activation de FP16 et les optimisations graph réduiront la latence médiane d'environ 20–40 % sur GPU avec Tensor Cores — mesurer par appareil.

### Risques / mitigations

- Risque : d1-omni-600M est en release de recherche pour l'audio. Mitigation : restreindre à trafic canari et valider le prétraitement audio avant production. Source : https://huggingface.co/blog/LiquidAI/open-d1
- Risque : mismatch JetPack/CUDA provoquant échec d'exécution. Mitigation : pinner l'environnement, utiliser les conteneurs constructeurs.
- Risque : hausse du taux d'erreur après déploiement. Mitigation : rollback automatique si l'erreur augmente de >2 points ou si les gates de latence échouent pendant 10 minutes consécutives.

### Prochaines etapes

- Lancer les benchmarks par appareil : 100 runs de warmup + 1 000 runs mesurés. Enregistrer médiane et p95 dans le CSV (inclure device, version du modèle, mode FP).
- Mettre en place déploiement canari : 5 % pendant 24 h → 25 % pendant 6 h → 100 % si les gates passent. Exemples de gates : médiane ≤50 ms (Orin Nano), p95 ≤2× médiane gate, augmentation d'erreur ≤2 points.
- Conteneuriser l'application avec checksum modèle piné. Ajouter endpoint /health qui retourne median_ms, p95_ms et success_rate.

Référence complète et détails de la release : https://huggingface.co/blog/LiquidAI/open-d1
