---
title: "HieraticBench v0.1 — benchmark public pour identifier le hiératique (écriture cursive égyptienne ancienne)"
date: "2026-10-06"
excerpt: "HieraticBench v0.1 est un snapshot public et une page de classement qui montre que de nombreux modèles modernes identifient à tort le hiératique comme du tibétain, de l’arabe ou « Not a known writing system ». Utilisez-le pour tester rapidement vos modèles avant production."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-10-06-hieraticbench-v01-a-268-item-benchmark-for-identifying-and-transcribing-hieratic-ancient-egyptian-cursive.jpg"
region: "FR"
category: "Tutorials"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "OCR"
  - "hiératique"
  - "évaluation"
  - "benchmark"
  - "vision-par-ordinateur"
  - "LLM"
  - "petites-equipes"
sources:
  - "https://hieraticbench.vercel.app/"
---

## TL;DR en langage simple

- Quoi : HieraticBench v0.1 est un snapshot public et un leaderboard pour tester si des IA reconnaissent le hiératique. Page publique : https://hieraticbench.vercel.app/.
- Problème observé : sur ce snapshot, plusieurs grands modèles donnent des étiquettes hors-sujet (ex. «Tibetan», «Arabic», «Not a known writing system») pour des images de hiératique — exemples listés sur https://hieraticbench.vercel.app/.
- Risque : déployer un fournisseur qui produit ces sorties peut générer erreurs confiantes en production et coûts inutiles.

Exemple concret rapide : testez 3–5 images du snapshot public, enregistrez toutes les réponses brutes et appliquez une règle simple (si confidence < 0.60 → revue humaine).

Méthodologie : reproduisez via le snapshot public référencé ci‑dessus (https://hieraticbench.vercel.app/) et conservez raw_responses pour audit.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez créer une chaîne d'évaluation reproductible qui :
- envoie chaque image de test à un modèle (local ou API),
- enregistre la prédiction et, si disponible, la confiance,
- exporte results.csv (1 ligne par image) et metrics.json (top-1, top-3, confusions),
- conserve raw_responses.json (toutes les réponses brutes).

Pourquoi : le leaderboard public v0.1 contient des exemples d'échecs répétables (voir https://hieraticbench.vercel.app/). Automatiser ces tests empêche que des sorties erronées arrivent aux utilisateurs ou à des processus en aval.

Sorties attendues : results.csv, metrics.json, artifacts/raw_responses.json.

## Avant de commencer (temps, cout, prerequis)

Prérequis minimaux : Python 3.9+ ou Docker, accès réseau au snapshot public https://hieraticbench.vercel.app/, git, clés API optionnelles.

Estimation temps / coût :
- Test fumée (3–5 images) : 15–60 minutes.
- Passe initiale (10–50 images) : 60–120 minutes.
- Budget découverte API suggéré : ≈ $20 ; pilote multi‑fournisseur ≈ $100+.

Paramètres initiaux recommandés : timeout_ms = 5000 ms, retries = 5, backoff_initial = 200 ms, batch_size = 8, top_k = 3.

Pré-exécution (checklist) :
- [ ] Cloner le snapshot/leaderboard : https://hieraticbench.vercel.app/.
- [ ] Préparer environnement isolé (Docker ou virtualenv).
- [ ] Décider modèle local vs API et provisionner budget (~$20 pour exploration).

## Installation et implementation pas a pas

1) Cloner et inspecter le snapshot public :

```bash
# cloner le site/snapshot pour inspection
git clone https://hieraticbench.vercel.app/ hieraticbench-site
cd hieraticbench-site
ls -la
```

2) Exemple Docker pour reproductibilité :

```bash
# build + run (exemple générique)
docker build -t hieraticbench:local .
docker run --rm -v "$(pwd)/dataset:/data" hieraticbench:local \
  /bin/sh -c "python -m your_eval_module --manifest /data/manifest.json"
```

3) Exécution minimale (1–10 images) :
- Téléchargez 1–10 images depuis https://hieraticbench.vercel.app/.
- Lancez un test de fumée (1 image) pour vérifier connectivité et format.

4) Format attendu de sortie :
- results.csv : id, chemin, label_attendu, label_pred, confidence
- raw_responses.json : réponses brutes
- metrics.json : top-1, top-3, confusions

Conseils pratiques : prétraitement déterministe (gris + resize fixe), timeout_ms = 5000 ms, retries = 5, conserver artefacts horodatés.

## Problemes frequents et correctifs rapides

Observation documentée : des modèles indiquent «Tibetan», «Arabic» ou «Not a known writing system» pour des images de hiératique — voir la page publique https://hieraticbench.vercel.app/ pour exemples.

Correctifs rapides :
- Allowlist/post-traitement : mapper labels hors-scope → "unknown" pour revue humaine.
- Prétraitement constant : niveaux de gris + redimensionnement fixe pour réduire variance.
- Rate-limit & retry : batcher requêtes, backoff exponentiel sur 429/5xx.

Règles de triage initiales (exemples chiffrés) :
- Flagger toute prédiction avec confidence < 0.60.
- Prioriser pour revue les 10 images avec le plus d'échecs.
- Conserver un jeu canari de 5–20 images pour tests de non‑régression.

## Premier cas d'usage pour une petite equipe

Objectif : donner un plan minimal, actionnable, pour un(e) fondateur(trice) solo ou une équipe 1–3 personnes (référence snapshot public : https://hieraticbench.vercel.app/).

Action 1 — Test de fumée (15–60 minutes)
- Choisir 3–5 images représentatives depuis https://hieraticbench.vercel.app/.
- Envoyer 1 requête par image, enregistrer raw_responses.json et results.csv.
- Si l'API est payante, provisionner ≈ $20 pour cette phase.

Action 2 — Script d'automatisation minimal (30–90 minutes)
- Écrire un script (≈50–200 lignes) qui : charge 1–10 images, envoie les requêtes, sauve responses et produit metrics.json (top-1, top-3).
- Paramètres conseillés : top_k = 3, timeout_ms = 5000 ms, retries = 5.

Action 3 — Post-traitement & triage (30–180 minutes)
- Implémenter une allowlist simple : {"hieratic","demotic","unknown"} ; toute autre sortie → "unknown".
- Règle opérationnelle : si >2/3 des tests sur 3 images échouent pour un fournisseur, le marquer pour revue.

Action 4 — Dépannage rapide (1–3 heures)
- Retester échecs avec 3 variantes de prétraitement (resize, contraste, crop).
- Comparer avec un deuxième fournisseur si disponible.
- Bascule temporaire vers revue humaine si taux d'items marqués > 15%.

Action 5 — Conservation et suivi (continu)
- Stocker results.csv, raw_responses.json, metrics.json dans artifacts/ ; tag par timestamp et hash git.
- Indicateurs initiaux : target top-1 = 70%, taux d'items marqués ≤ 15%.

Exemples de config rapide (YAML) :

```yaml
# minimal-config.yaml
env: local
dataset_path: ./dataset
output_csv: ./artifacts/results.csv
postprocess_allowlist: ["hieratic","demotic","unknown"]
```

## Notes techniques (optionnel)

La page publique donne un leaderboard et des exemples d'échecs — référence : https://hieraticbench.vercel.app/.

Schéma minimal results.csv :

| id | image_path | gold_script | pred_script | confidence |
|---:|-----------:|:-----------:|:-----------:|-----------:|
| 1 | dataset/img001.png | hieratic | hieratic | 0.92 |
| 2 | dataset/img002.png | hieratic | tibetan | 0.34 |
| 3 | dataset/img003.png | hieratic | unknown | 0.45 |

Paramètres techniques suggérés : top_k = 3, timeout_ms = 5000 ms, batch_size = 8, retries = 5, backoff_initial = 200 ms.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse : le snapshot public v0.1 contient des exemples visibles sur https://hieraticbench.vercel.app/ ; valider le nombre exact d'items avant production.
- Seuils opérationnels proposés (à valider) : target top-1 accuracy = 70%, seuil faible confiance = 0.60, fraction d'items faibles ≤ 15%.
- Budgets estimés : exploration ≈ $20 ; pilote multi‑fournisseur ≈ $100+.
- Paramètres d'évaluation suggérés : top_k = 3 ; timeout_ms = 5000 ms ; batch_size = 8 ; retries = 5 ; canary initial = 5% (ou 5–20 images).

### Risques / mitigations

- Risque : modèles identifient le hiératique comme scripts non liés (documenté sur le leaderboard). Mitigation : allowlist + revue humaine + journalisation de raw_responses.json.
- Risque : dépassement de budget API. Mitigation : cap budgétaire (ex. $20 pour découverte), batcher requêtes, limiter retries et appliquer backoff.
- Risque : déploiement avec confiance sur‑estimée. Mitigation : gates, canary (5% du trafic) et flagger toute prédiction < 0.60 pour revue.
- Risque : régression après mise à jour du modèle. Mitigation : test non‑régression sur canary (5–20 images), conservation d'artefacts pour rollback.

### Prochaines etapes

- Ajouter un job CI qui exécute l'évaluation à chaque push et archive results.csv, raw_responses.json, metrics.json.
- Formaliser portes de décision : critères de canary (ex. pas de baisse >10 points de top-1), conditions de rollback, runbook.
- Prioriser corrections : prétraitement déterministe → fine‑tuning (si jeux étiquetés disponibles) → expert‑in‑the‑loop.
- Surveiller périodiquement la page publique https://hieraticbench.vercel.app/ pour comparer vos résultats aux exemples publics.

Checklist rapide de production :
- [ ] Job CI ajouté et artefacts archivés.
- [ ] Jeu canari de 5–20 images prêt.
- [ ] Seuils validés en pré‑prod (top-1 target 70%, seuil_confidence 0.60).

Référence principale : https://hieraticbench.vercel.app/.
