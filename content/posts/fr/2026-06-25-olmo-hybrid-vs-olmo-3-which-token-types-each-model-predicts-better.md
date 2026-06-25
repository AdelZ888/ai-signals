---
title: "Olmo Hybrid vs Olmo 3 — quels types de tokens chaque modèle prédit mieux"
date: "2026-06-25"
excerpt: "Tests reproductibles au niveau des tokens montrant que les modèles hybrides (Olmo Hybrid) sont meilleurs sur les tokens qui portent du sens (noms, verbes, adjectifs, coréférence) tandis que le transformer (Olmo 3) garde l'avantage sur la copie littérale."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-25-olmo-hybrid-vs-olmo-3-which-token-types-each-model-predicts-better.jpg"
region: "FR"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "hybrides"
  - "transformers"
  - "évaluation"
  - "NLP"
  - "HuggingFace"
  - "Olmo"
  - "MLops"
  - "benchmark"
sources:
  - "https://huggingface.co/blog/allenai/hybrid-token-prediction"
---

## TL;DR en langage simple

- Les modèles hybrides (ex. Olmo Hybrid) prédisent mieux les tokens qui portent du sens : noms, verbes, adjectifs et tokens liés à la coréférence (savoir à qui/quoi un pronom renvoie). Un transformer bien apparié (ex. Olmo 3) reste meilleur pour les tokens qui copient littéralement un segment déjà présent dans l'entrée.
- Que faire vite : comparer deux checkpoints 7B token‑par‑token pour repérer quelles classes de tokens causent vos erreurs. Router les requêtes sensibles au sens vers le modèle qui s'en sort le mieux.
- Checklist rapide : extraire 2 000–4 000 tokens, annoter POS (partie du discours), marquer les tokens de copie et, si utile, la coréférence. Comparer exactitude et "logit gap" (écart de logit) pour décider.

Exemple concret : vous avez un assistant qui doit remplacer des pronoms par le bon nom d'entité. Si les erreurs viennent surtout des pronoms, l'Olmo Hybrid peut réduire ces fautes. Si l'erreur vient d'une copie littérale (répéter un passage déjà fourni), Olmo 3 peut être mieux.

Définitions courtes : POS = partie du discours (nom/verbe/adjectif/pronom). GPU = unité de traitement graphique. JSONL = JSON séparé par lignes. coref = coréférence (lier un pronom à l'entité qu'il désigne).

Note méthodologique : gardez le même tokenizer et les mêmes paramètres d'entrée pour que les différences reflètent surtout l'architecture, comme dans la comparaison Olmo : https://huggingface.co/blog/allenai/hybrid-token-prediction

Explication simple avant les détails avancés :
- On compare deux modèles proches (mêmes données, même tokenizer) mais d'architectures différentes. Ainsi, toute différence de performance vient surtout de l'architecture. L'article d'AllenAI montre que les hybrides excellent quand il faut comprendre et suivre le sens, tandis que les transformers excellent pour la copie mot à mot : https://huggingface.co/blog/allenai/hybrid-token-prediction

## Ce que vous allez construire et pourquoi c'est utile

Vous allez construire un pipeline d'évaluation compact qui compare deux modèles 7B appariés (Olmo 3 vs Olmo Hybrid) au niveau des tokens. L'objectif : identifier quelles catégories de tokens (sémantique vs copie littérale) causent le plus d'erreurs et définir une stratégie de routage ou de déploiement.

Pourquoi c'est utile :
- Vous saurez si vos erreurs viennent d'une mauvaise compréhension du sens ou d'une mauvaise copie d'un texte. L'étude montre que les hybrides gagnent sur les tokens porteurs de sens, tandis que les transformers tiennent l'avantage sur les répétitions littérales : https://huggingface.co/blog/allenai/hybrid-token-prediction
- Avec des métriques par classe, vous pouvez router uniquement les flux risqués au lieu de remplacer tout le produit. Cela réduit le périmètre des tests et le risque de déploiement.

Artefacts produits : token_category_map.csv, labeled_dataset.jsonl, metrics.json, comparison_plots.png. Référence : https://huggingface.co/blog/allenai/hybrid-token-prediction

## Avant de commencer (temps, cout, prerequis)

Estimations et checklist minimale pour une exécution reproductible.

- Temps : un run complet typique prend ~3 heures sur 1 GPU pour un jeu d'évaluation de 2 000–4 000 tokens ; prévoir 1–3 jours incluant revue et un canary court.
- Coût : budget attendu de ~20 $ à 200 $ pour de petits runs cloud selon type d'instance et durée.
- Matériel : 1 GPU avec >=24 GB de VRAM recommandé pour l'inférence sur des checkpoints 7B ; faisable sur CPU mais >10× plus lent.
- Taille des données : pour un test rapide 2 000–4 000 tokens ; viser >=500 tokens par classe de token pour une puissance statistique raisonnable.
- Logiciel : Python 3.10+, outils Hugging Face, un tagger POS (spaCy recommandé), outil de coréférence léger optionnel.

Checklist avant run :
- [ ] Confirmer que les deux modèles utilisent le même tokenizer dans config.yaml (vocabulaire et tokens spéciaux alignés).
- [ ] GPU disponible avec >=24GB VRAM.
- [ ] POS tagger installé et testé sur un échantillon de 200 tokens.
- [ ] dataset.jsonl préparé (2 000–4 000 tokens).

Note méthodologique courte : garder tokenizer, paramètres et conditions d'échantillonnage identiques entre modèles pour que les différences reflètent surtout l'architecture, comme dans les expériences Olmo : https://huggingface.co/blog/allenai/hybrid-token-prediction

## Installation et implementation pas a pas

1) Cloner et installer les outils.

```bash
git clone https://example.com/olmo-token-eval.git
cd olmo-token-eval
pip install -r requirements.txt
```

(Conserver la référence dans vos notes : https://huggingface.co/blog/allenai/hybrid-token-prediction)

2) Config minimal (modifier pour vos checkpoints).

```yaml
# config.yaml
model_a: "olmo-3-7b"         # transformer
model_b: "olmo-hybrid-7b"    # hybrid
batch_size: 8
device: "cuda:0"
min_samples_per_class: 500
```

3) Préparer et labelliser les tokens (processus simple) :
- Produire labeled_dataset.jsonl où chaque ligne contient : texte original, token, POS, is_copy (le token apparaît verbatim dans la fenêtre précédente de 256 tokens), et optionnellement coref_id.
- Utiliser spaCy pour le POS et un passage de coréférence léger si vous voulez lier les pronoms.

4) Lancer l'inférence pour les deux modèles et enregistrer les logits pour le token vrai.

```bash
python evaluate_tokens.py --config config.yaml --input labeled_dataset.jsonl \
  --out modelA_logits.jsonl --which model_a
python evaluate_tokens.py --config config.yaml --input labeled_dataset.jsonl \
  --out modelB_logits.jsonl --which model_b
```

5) Calculer métriques par classe et logit-gap.

```bash
python analyze_metrics.py --modelA modelA_logits.jsonl --modelB modelB_logits.jsonl \
  --out metrics.json
```

Métriques à calculer par classe de token : exactitude (accuracy), couverture top-5 (top-5 coverage), écart moyen de logit (moyenne de logit_hybrid - logit_transformer pour le token correct) et intervalles de confiance bootstrap à 95 %. Voir : https://huggingface.co/blog/allenai/hybrid-token-prediction

6) Plan de décision et de déploiement (exemple) :
- Démarrer un canary à 5 % du trafic pendant 24–72 heures en ciblant uniquement les flux riches en sémantique.
- Rollback immédiat si l'exactitude sur tokens sémantiques chute de >1 % ou si la latence augmente de >15 %.

## Problemes frequents et correctifs rapides

- Mismatch de tokenizer (logits non comparables) : vérifier la config du tokenizer et exécuter tokenizer_check.py sur un échantillon de 200 tokens.
- POS bruyants : normaliser avec token_category_map.csv et relire ~200 tokens manuellement pour corriger les erreurs systématiques.
- Tailles d'échantillon trop petites : augmenter le jeu d'évaluation pour atteindre >=500 tokens par classe ou utiliser bootstrap pour estimer les intervalles de confiance à 95 %.
- OOM GPU : réduire batch_size de 8 → 4 → 2 ou opter pour un GPU avec >=48 GB VRAM pour les gros batches.
- Mislabelling des tokens de copie dû à la tokenization : exécuter span-aligner.py pour aligner les spans du texte brut avec les tokens du tokenizer.

Rappels rapides : 500 tokens par classe, 2 000–4 000 tokens pour un run rapide, >=24 GB VRAM, batch_size 8, cible ~3 heures pour un run, canary 5 % sur 24–72 heures. Référence : https://huggingface.co/blog/allenai/hybrid-token-prediction

## Premier cas d'usage pour une petite equipe

Contexte : équipe produit+ML de 2–3 personnes qui construit un assistant devant résoudre les pronoms et privilégier un libellé d'entité précis plutôt que la copie aveugle.

Plan concret (3–7 jours calendaires) :

1) Jour 1 — Extraire et labelliser un jeu ciblé :
- Extraire ~2 000–4 000 tokens depuis des logs récents focalisés sur les flux importants.
- Exécuter le POS tagging et marquer is_copy pour les tokens qui apparaissent littéralement dans la fenêtre précédente de 256 tokens.
- Relire manuellement ~200 tokens pour valider les labels.

2) Jour 2 — Lancer les deux modèles et inspecter les résultats :
- Lancer l'inférence sur 1 GPU (>=24 GB VRAM). Compter ~3 heures pour l'exécution.
- Produire metrics.json et comparison_plots.png. Se concentrer sur accuracy, top-5 coverage et average logit-gap pour noms, pronoms, verbes, adjectifs et tokens de copie.

3) Jours 3–7 — A/B et rollout court :
- Si un avantage clair existe sur les tokens sémantiques, activer un canary à 5 % pendant 24–72 heures sur les flux sémantiques.
- Surveiller l'exactitude par classe, le taux d'erreur global et la latence. Visez un impact latence <10 % pendant le canary ; faire rollback si latence >15 % ou drop d'exactitude >1 %.

Exemple de tableau de décision (remplir après le run) :

| Token class | Delta-accuracy (hybrid - transformer) | Preferred model |
|-------------|---------------------------------------:|----------------:|
| Nouns       | (à remplir)                            | (à remplir)     |
| Pronouns    | (à remplir)                            | (à remplir)     |
| Adjectives  | (à remplir)                            | (à remplir)     |
| Copy tokens | (à remplir)                            | (à remplir)     |

Conseils pour solo-founder :
- Automatiser l'annotation ; ne relire manuellement qu'une centaine à deux cents tokens.
- Utiliser un canary à 5 % pour limiter coût et risque.
- Budget cible : <200 $ pour l'expérience ; utiliser instances spot/preemptibles pour réduire la dépense.

Source et lecture complémentaire : https://huggingface.co/blog/allenai/hybrid-token-prediction

## Notes techniques (optionnel)

- Dans les expériences Olmo, l'équipe a comparé un transformer 7B (Olmo 3) et un hybride 7B (Olmo Hybrid) en contrôlant tokenizer et recette d'entraînement ; les différences observées reflètent donc majoritairement l'architecture : https://huggingface.co/blog/allenai/hybrid-token-prediction
- Métriques par token : accuracy, top-5 coverage, average logit-gap (moyenne de logit_hybrid - logit_transformer pour le token correct).
- Tests statistiques : utiliser bootstrap pour obtenir des intervalles de confiance à 95 % ; pour l'exactitude sur les mêmes exemples, des tests appariés (ex. McNemar) peuvent être utiles.
- Catégories de tokens : dériver depuis POS tags et un heuristique de détection de copie (fenêtre précédente de 256 tokens). L'étiquetage de coréférence améliore la qualité sur les pronoms mais reste optionnel.
- Outils recommandés : spaCy pour POS, JSONL pour jeux de données, scripts de plot légers pour visualiser les résultats, et journalisation minimale pour les fenêtres de canary (24–72 heures).

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse : les modèles hybrides ont tendance à mieux performer sur les tokens sémantiques (noms/verbres/adjectifs/pronoms) tandis que les transformers conservent un avantage sur les tokens de copie littérale. Cette observation provient des expériences rapportées : https://huggingface.co/blog/allenai/hybrid-token-prediction
- Hypothèse opérationnelle : seuils recommandés utiles pour la prise de décision — échantillon >=500 tokens par classe, jeu rapide 2 000–4 000 tokens, canary 5 % pendant 24–72 heures, run unique ~3 heures sur 1 GPU >=24 GB VRAM, gate latence <10 %.
- Inconnue : la robustesse des gains sur d'autres tailles de modèles (p.ex. 13B, 70B) ; à vérifier par expérimentations similaires.

### Risques / mitigations

- Risque : conclusions erronées dues à de petits échantillons. Mitigation : exiger >=500 tokens par classe et calculer IC bootstrap à 95 %.
- Risque : régression de latence en production. Mitigation : canary 5 %, seuil de tolérance latence <10 % avant élargissement.
- Risque : mismatch de tokenizer rendant la comparaison invalide. Mitigation : unifier configs tokenizer et valider sur un échantillon manuel de 200 tokens.
- Risque : dépassement budgétaire. Mitigation : fixer un plafond de dépense (20 $–200 $ recommandé) et utiliser instances spot.

### Prochaines etapes

- Lancer l'expérience recommandée sur 2 000–4 000 tokens et produire metrics.json et comparison_plots.png.
- Déployer un canary à 5 % pour 24–72 heures en routant les flux sémantiques vers le modèle gagnant sous feature flag.
- Si la porte passe (delta-accuracy soutenu et latence <10 %), monter progressivement jusqu'à 100 % et ajouter des alertes d'exactitude par classe.
- Archiver les artefacts : metrics.json, token_category_map.csv, labeled_dataset.jsonl et un résumé d'une page pour les parties prenantes.

Référence : https://huggingface.co/blog/allenai/hybrid-token-prediction
