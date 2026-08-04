---
title: "Agents sur appareil avec LFM2.5–2.6B : appel d'outils, mesures et checklist de déploiement"
date: "2026-08-04"
excerpt: "Guide pour exécuter des agents LFM2.5–2.6B sur portables, téléphones et petits serveurs. Configuration d'appel d'outils, mesures de base (~220 tok/s M5 Max, ~113 tok/s Ryzen), mémoire et checklist de passage en production."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-04-on-device-agents-with-lfm25-26b-tool-calling-performance-baselines-and-rollout-checklist.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "LFM2.6B"
  - "on-device"
  - "agents"
  - "Hugging Face"
  - "quantization"
  - "edge"
  - "IA"
sources:
  - "https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b"
---

## TL;DR en langage simple

- LFM2.5–2.6B permet d'exécuter des agents entièrement sur l'appareil. Source : https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b
- Il sait appeler des outils et enchaîner plusieurs étapes. Cela garde les données privées sur le device. (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)
- Performances publiées : 220 tok/s sur Apple M5 Max, 113 tok/s sur AMD Ryzen. Empreinte d'inférence annoncée < 2.5 GB. (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)

Checklist rapide (1 minute)
- [ ] Télécharger LFM2.5 ou LFM2.6B depuis la page officielle (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)
- [ ] Choisir un runtime et un format de quantification compatibles
- [ ] Préparer un adaptateur outil minimal (lecteur local)
- [ ] Faire un smoke test et mesurer tok/s, mémoire, p50/p90/p99

Exemple ultra‑court : installer LFM2.5 localement, brancher un lecteur de PDF, demander un résumé. Mesurer la latence (ms) et la mémoire (GB) avant d'élargir. (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)

## Ce que vous allez construire et pourquoi c'est utile

Ce que vous construisez (concret)
1. Charger LFM2.5 ou LFM2.6B en local sur un laptop ou serveur CPU. (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)
2. Exposer un adaptateur d'outil minimal : lecteur de fichiers local ou shim de recherche.
3. Orchestrer un workflow simple : appel d'outil → agrégation → réponse finale.

Pourquoi c'est utile (faits extraits)
- Confidentialité : tout reste sur l'appareil, pas d'appels cloud. (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)
- Économie : suppression des coûts d'inférence cloud si tout se tient sur device. (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)
- Référence de performance : 220 tok/s (Apple M5 Max), 113 tok/s (AMD Ryzen), empreinte d'inférence ciblée < 2.5 GB. (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)

Définitions rapides
- SFT = 2 rondes de Supervised Fine‑Tuning (SFT). (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)
- MOPD = Multi‑domain On‑Policy Distillation. (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)
- Agentic RL = apprentissage par renforcement en environnement agentique. (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)

## Avant de commencer (temps, cout, prerequis)

Matériel recommandé et attentes (référence : https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)

| Matériel | Baseline tok/s attendu | Empreinte mémoire cible |
|---|---:|---:|
| Apple M5 Max | ~220 tok/s | < 2.5 GB |
| AMD Ryzen (CPU) | ~113 tok/s | < 2.5 GB |
| Laptop modeste | 20–100 tok/s (variable) | peut dépasser 2.5 GB selon quantification |

Contraintes techniques clés (extraites)
- Pré‑entraînement sur ~34T tokens. (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)
- Fenêtre de contexte étendue à 128K tokens lors d'une phase intermédiaire. (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)
- Pipeline post‑entraînement en 4 étapes : SFT (2 rondes), teacher specialization, MOPD, Agentic RL. (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)

Pré‑requis pratiques
- Compte Hugging Face et accès au modèle (page officielle). (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)
- Runtime compatible avec quantification (ex. formats q4_0).
- Stockage pour les poids (~taille variable selon format) et réseau pour le téléchargement.

Estimations de temps (à valider localement)
- Téléchargement + configuration initiale : 10–60 minutes selon réseau.
- Smoke test initial : 5–20 minutes.
- Canary sur 1–3 appareils : 1–3 jours pour collecter métriques utiles.

## Installation et implementation pas a pas

Méthodologie courte : suivre la page officielle pour références et chiffres. (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)

1) Télécharger les poids et préparer l'environnement

```bash
# Connexion HF et préparation (exemple)
hf login
mkdir lfm2-local && cd lfm2-local
# Télécharger les artefacts selon instructions du modèle
```

2) Choisir runtime & quantification — recommandations simples
- Visez un format de quantification qui garde l'empreinte < 2.5 GB.
- Comparez vos mesures locales aux baselines : 220 tok/s (M5 Max), 113 tok/s (Ryzen). (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)

3) Exemple de fichier de quantification

```yaml
# quant-config.yaml
format: q4_0
mmap: true
threads: 4
block_size: 128
```

4) Implémenter l'adaptateur d'outil minimal
- Commencez par un lecteur local. Limitez la portion de texte fournie au modèle (ex. 8K tokens max).
- Validez les chemins et journalisez chaque appel.

5) Smoke test et mesures
- Mesurez tok/s, mémoire de pointe (GB), latences p50/p90/p99 (ms).
- Exemple de commande pour mesurer mémoire :

```bash
/usr/bin/time -v python run_agent.py --prompt "Résume le dossier X"
```

- Objectifs à valider : tok/s proche des baselines, mémoire < 2.5 GB, p90 acceptable pour votre UX.

## Problemes frequents et correctifs rapides

Source et baselines : https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b

- OOM (Out Of Memory)
  - Correctif : ré‑quantifier vers un format plus compact, activer mmap, réduire threads de 8→4→2.
  - Cible : ramener l'empreinte d'inférence sous 2.5 GB.
- Débit inférieur aux attentes
  - Correctif : utiliser un runtime optimisé pour votre architecture. Mesurez tok/s avant/après (ex. +50% possible selon runtime).
- Échecs d'appel d'outil / timeouts
  - Correctif : isoler l'adaptateur, augmenter timeout à 5–30 s selon l'opération, ajouter validation et journalisation.
- Instabilité multi‑étapes
  - Correctif : tests unitaires pour chaque étape, traces par étape et réexécution avec seeds contrôlés.

Commande utile pour traces :

```bash
python run_agent.py --prompt-file sample_prompt.txt --dump-trace trace.json
```

## Premier cas d'usage pour une petite equipe

Public cible : 1–3 personnes (fondateur·rice solo ou petite équipe). Référence : https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b

Étapes concrètes
1. Installer LFM2.5/LFM2.6B local et activer un adaptateur de lecture.
2. Quantifier pour viser une empreinte < 2.5 GB. Mesurer tok/s et latence.
3. Workflow initial : lecture → extraction → résumé. Limitez à 1–3 adaptateurs.
4. Journaliser chaque appel et analyser p50/p90/p99 et taux d'erreur (%) sur 24–72 heures.

Bonnes pratiques
- Versionner les poids et configs (ex. tag v1, v2). Garder un historique de 3–5 versions.
- Déployer d'abord sur 1–3 appareils (canary) pendant 48–72 heures.
- Définir seuils de rollback : latence > 2× baseline ou taux d'erreur > 5%.

## Notes techniques (optionnel)

Points tirés de la page officielle : (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)
- Pré‑entraînement sur ~34T tokens.
- Fenêtre de contexte étendue à 128K tokens lors d'une phase intermédiaire.
- Pipeline post‑entraînement en 4 étapes : 2 rondes de SFT, teacher specialization, MOPD, puis Agentic RL.
- Baselines d'inférence : ≈220 tok/s (Apple M5 Max), ≈113 tok/s (AMD Ryzen), empreinte d'inférence < ≈2.5 GB.

Méthodologie : j'utilise uniquement les chiffres et étapes explicitement cités sur la page officielle. (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)

## Que faire ensuite (checklist production)

- [ ] Versionner artefacts : modèles, quant-config.yaml, scripts d'adaptateur.
- [ ] Capturer métriques clés : tok/s, mémoire de pointe (GB), p50/p90/p99 (ms), taux d'erreur (%).
- [ ] Canary : 1–3 appareils pendant 48–72 heures pour collecter télémétrie.
- [ ] Définir critères de rollback (ex. latence > 2× baseline, erreur > 5%) et automatiser rollback.
- [ ] Mettre en place alerting si p90 dépasse seuil (ex. p90 > 2× p50).

### Hypotheses / inconnues
- Temps exact pour un POC : dépend du réseau et du disque ; estimation 10–60 minutes pour téléchargement initial.
- Paramètres de quantification nécessaires pour atteindre ≤ 2.5 GB varient selon runtime et format (à valider). (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)
- Taille exacte de LFM2.6B (paramètres) doit être vérifiée dans le dépôt modèle.
- Débit sur d'autres CPU/architectures variera ; la page cite ≈113 tok/s pour Ryzen comme référence. (https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)

### Risques / mitigations
- OOM ou latence élevée : mitigation = re‑quantifier, activer mmap, réduire threads, monter en hardware.
- Fuite de données via adaptateur : mitigation = validation d'accès, allow‑list, revue de code, blocage réseau non autorisé.
- Régressions multi‑étapes : mitigation = tests unitaires, traces détaillées, revue humaine.
- Arrêt de déploiement (rollback) : définir seuils mesurables (ex. latence > 2× baseline, erreur > 5%).

### Prochaines etapes
1. Prototyper avec un seul adaptateur de lecture et tagger les artefacts (modèle + quant-config).
2. Lancer smoke tests et collecter : tok/s, mémoire de pointe (GB), p50/p90/p99 (ms), taux d'erreur (%) sur 24–72 h.
3. Ajuster quantification (format, threads, block_size) pour réduire l'empreinte si nécessaire.
4. Canary rollout sur 1–3 appareils. Appliquer critères d'arrêt et rollback.  

Référence principale : https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b
