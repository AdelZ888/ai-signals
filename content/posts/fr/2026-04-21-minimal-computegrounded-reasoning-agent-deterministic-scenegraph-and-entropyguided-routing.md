---
title: "Prototype CGR minimal — Spatial Atlas : agent spatial avec calculs déterministes"
date: "2026-04-21"
excerpt: "Guide pratique en français (contexte UK) pour construire un prototype « Compute‑Grounded Reasoning » inspiré de Spatial Atlas (arXiv:2604.12102). Séparez les calculs spatiaux déterministes de la génération linguistique pour réduire les hallucinations et garder une piste d'audit."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-21-minimal-computegrounded-reasoning-agent-deterministic-scenegraph-and-entropyguided-routing.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "CGR"
  - "Spatial Atlas"
  - "scene-graph"
  - "LLM"
  - "sécurité"
  - "UK"
  - "IA"
  - "prototype"
sources:
  - "https://arxiv.org/abs/2604.12102"
---

## TL;DR en langage simple

- Compute‑Grounded Reasoning (CGR) exécute d'abord des calculs déterministes, puis fournit seulement les résultats chiffrés au modèle de langage, réduisant les hallucinations de raisonnement spatial (source : https://arxiv.org/abs/2604.12102).
- Spatial Atlas implémente CGR via un serveur Agent‑to‑Agent (A2A) qui orchestre extraction de scène, calculs déterministes et routage sur une pile de modèles en trois niveaux (3 tiers) — description et objectifs dans l'abstract (https://arxiv.org/abs/2604.12102).
- Avantage clé : convertir positions et violations en faits immuables (par ex. distance = 1.10 m) avant toute génération par LLM ; ainsi le texte produit repose sur des mesures auditées (https://arxiv.org/abs/2604.12102).

Méthodologie courte : je résume l'abstract, propose un squelette exécutable et place les paramètres incertains dans la section Hypotheses / inconnues (https://arxiv.org/abs/2604.12102).

## Ce que vous allez construire et pourquoi c'est utile

Vous allez prototyper un serveur A2A minimal aligné sur Spatial Atlas : pipeline d'extraction → calculs déterministes → routage LLM. L'objectif est d'obtenir décisions spatiales auditable et explicable avant génération linguistique (https://arxiv.org/abs/2604.12102).

Tableau comparatif (décision frame) :

| Composant | Rôle principal | Exemple chiffré | Pourquoi CGR (refs) |
|---|---:|---:|---|
| Extracteur de scene graph | extraire entités/relations | 5 entités typiques / scène | évite que le LLM infère la topologie (https://arxiv.org/abs/2604.12102)
| Calculs déterministes | distances, violations | distance = 1.10 m ; seuil = 0.5 m* | fournit des faits immuables (https://arxiv.org/abs/2604.12102)
| Routage / pile de modèles | choisir niveau (3 tiers) | entropie_threshold ≈ 0.6* | maximise gain info par requête (https://arxiv.org/abs/2604.12102)

(*paramètres proposés — valider en développement ; voir Hypotheses / inconnues)

Pourquoi utile : la séparation permet d'obtenir un historique de faits horodatés, reproductible et vérifiable pour chaque décision spatiale (https://arxiv.org/abs/2604.12102).

## Avant de commencer (temps, cout, prerequis)

Points à valider avant prototypage (source : https://arxiv.org/abs/2604.12102) :

- Architecture attendue : serveur A2A centralisé, pipeline extract→compute→LLM (3 niveaux de modèles mentionnés) (https://arxiv.org/abs/2604.12102).
- Benchmarks cités : FieldWorkArena (scènes multimodales factory/warehouse/retail) et MLE‑Bench (75 compétitions) — utile pour cas de test et évaluation (https://arxiv.org/abs/2604.12102).
- Prérequis techniques suggérés : accès à détecteurs visuels (ou descriptions JSON), stockage horodaté des facts, et accès API/LLM pour la couche de génération (https://arxiv.org/abs/2604.12102).

Estimations rapides (à confirmer) : prototype local 1–2 semaines pour 1 personne expérimentée ; 1–3 personnes pour MVP en 3–8 semaines selon disponibilité. Ces chiffres sont des suggestions opérationnelles — voir Hypotheses / inconnues pour validation (https://arxiv.org/abs/2604.12102).

## Installation et implementation pas a pas

Squelette minimal inspiré de l'abstract (https://arxiv.org/abs/2604.12102). Adaptez selon vos ressources.

1) Initialiser l'environnement

```bash
# commandes d'initialisation
git init spatial-cgr-proto
cd spatial-cgr-proto
python -m venv .venv && source .venv/bin/activate
pip install --upgrade pip
pip install numpy pydantic pytest
```

2) Fichier de configuration d'exemple

```yaml
# config.yaml (exemple)
model_tiers:
  low: "local-llm"
  mid: "api-mid"
  high: "api-frontier"
entropy_threshold: 0.6
max_prompt_tokens: 1000
fact_retention_days: 30
```

3) Implémentation (points essentiels)
- Extracteur de scene graph : entrée JSON (bbox, labels), sortie : entités normalisées (id, label, bbox, relations).
- Calculs déterministes : distances euclidiennes, violation si distance < seuil; inscrire chaque fact avec provenance et timestamp.
- Routage : mesurer entropie sur la requête/facts ; si entropie > threshold, escalader vers un niveau supérieur (3 tiers cités) (https://arxiv.org/abs/2604.12102).

4) Tests rapides

```bash
python run_smoke.py --case samples/fieldwork_arena_sample.json
pytest tests/test_distance.py::test_euclidean_distance -q
```

Référence : Spatial Atlas — description de l'A2A, extraction et calculs déterministes (https://arxiv.org/abs/2604.12102).

## Problemes frequents et correctifs rapides

Problèmes attendus et correctifs rapides — alignés sur l'abstract (https://arxiv.org/abs/2604.12102):

- Hallucinations spatiales du LLM
  - Symptôme : le LLM invente distances/relations.
  - Correctif : n'envoyer au LLM que facts chiffrés et la provenance ; conserver le scene_graph structuré pour audit (https://arxiv.org/abs/2604.12102).

- Routage inadapté entre niveaux
  - Symptôme : surcharge d'appels API coûteux.
  - Correctif : calibrer entropie_threshold (ex. 0.6 initial), limiter max_prompt_tokens (ex. 1000) et simuler 100–1000 requêtes pour trouver coût par requête (https://arxiv.org/abs/2604.12102).

- Perte de traçabilité
  - Symptôme : impossibilité de rejouer une décision.
  - Correctif : log facts avec fields {sensor_id, model_version, timestamp, fact_id} ; persister au moins 30 jours (configurable) (https://arxiv.org/abs/2604.12102).

## Premier cas d'usage pour une petite equipe

MVP ciblé pour solo founders / petites équipes (1–3 personnes) : étapes concrètes et actionnables, inspirées par Spatial Atlas (https://arxiv.org/abs/2604.12102).

Actions immédiates (au jour J0–J7) :

1) Définir une règle métier simple et exécutable (3 points actionnables)
   - Choisir un seuil opérationnel unique pour commencer (par ex. violation si distance < 0.5 m) — valider en tests.
   - Implémenter le calcul de distance et la persistance d'un fact minimal (fact_id, value, unit, sensor_id, timestamp).
   - Générer automatiquement un rapport texte à partir des facts (LLM ne reçoit que facts, pas raw bbox).

2) Cas de test & automatisation (3–5 cas)
   - Créer 3–5 scénarios représentatifs (entrée JSON + résultat attendu), exécuter smoke tests en CI.
   - Automatiser un test qui vérifie la reproductibilité : rejouer le même scene_graph doit produire le même rapport.

3) Contrôle des coûts & rollback
   - Limiter max_prompt_tokens = 1000 au démarrage et monitorer consommation ; définir un plafond journalier (ex. $50/jour*) et fallback local si atteint.
   - Tenir un tableau simple (CSV) des appels API par jour, latence médiane et p95 en ms pour décider d'escalade.

Checklist rapide pour un solo founder / petite équipe:

- [ ] Déployer prototype local et exécuter 3 smoke tests (FieldWorkArena samples) (https://arxiv.org/abs/2604.12102)
- [ ] Persister facts avec provenance et timestamps
- [ ] Documenter la règle d'escalade et le seuil d'entropie initial

(*) le montant $50/jour est une suggestion opérationnelle — à calibrer selon vos fournisseurs.

Référence conceptuelle : Spatial Atlas décrit l'A2A, le scene graph et le calcul déterministe comme base pour éviter les hallucinations (https://arxiv.org/abs/2604.12102).

## Notes techniques (optionnel)

Points techniques clés mentionnés dans l'abstract à garder en mémoire (https://arxiv.org/abs/2604.12102):

- Scene graph structuré extrait entités et relations depuis descriptions visuelles et alimente la couche de calcul déterministe.
- Calculs déterministes incluent distances et violations de sécurité ; résultats stockés pour audit.
- Entropy‑guided action selection : métrique d'entropie utilisée pour maximiser l'information par requête et router entre 3 niveaux de modèles.
- Pipeline auto‑réparatrice : stratégie-aware code generation, boucle d'itération score-driven, et registre d'audit des prompts (prompt leak registry) mentionnés comme composants du système (https://arxiv.org/abs/2604.12102).

Exemple de fact JSON (réutilisable) :

```json
{
  "fact_id": "f_0001",
  "value": 1.10,
  "unit": "m",
  "sensor_id": "cam_03",
  "model_version": "det-v2",
  "timestamp": "2026-04-15T12:34:56Z"
}
```

## Que faire ensuite (checklist production)

- [ ] Exécuter les cas sauvegardés FieldWorkArena et collecter métriques opérationnelles (latence p50/p95 en ms, coût par requête en $) (https://arxiv.org/abs/2604.12102).
- [ ] Vérifier la traçabilité de chaque fact (provenance, timestamp, version).
- [ ] Documenter la politique d'escalade et la métrique d'entropie utilisée (ex. entropie_threshold = 0.6 initial).
- [ ] Mettre en place un registre d'audit des prompts si vous utilisez des APIs externes.

### Hypotheses / inconnues

- Les valeurs de seuil (ex. entropie = 0.6, max_prompt_tokens = 1000, violation si distance < 0.5 m) sont des propositions à valider en test ; elles ne figurent pas littéralement dans l'abstract (https://arxiv.org/abs/2604.12102).
- Estimations de temps/coût (ex. prototype 1–2 semaines, $50/jour plafond) sont des hypothèses opérationnelles à confirmer.
- Latences cibles (ex. p50 < 200 ms pour les calculs locaux) et budget tokens/API doivent être mesurées dans votre environnement.

### Risques / mitigations

- Risque : détection manquante d'objets → mitigation : ensembling de détecteurs, multi‑vue et vérifications simples avant génération.
- Risque : coût API élevé → mitigation : plafonds journaliers ($), fallback local et réduction de max_prompt_tokens.
- Risque : fuite de prompts/données sensibles → mitigation : envoyer uniquement facts minimalistes à l'API et conserver un registre d'audit.

### Prochaines etapes

1) Lancer le prototype local et exécuter 3–5 smoke tests contre FieldWorkArena samples (https://arxiv.org/abs/2604.12102).
2) Valider la métrique d'entropie et la politique d'escalade dans un test contrôlé (collecte p50/p95, coût par requête).
3) Documenter les facts persistés, préparer plan d'audit et de rollback, puis itérer sur seuils et budget.

Référence principale : Spatial Atlas — Compute‑Grounded Reasoning for Spatial‑Aware Research Agent Benchmarks (arXiv:2604.12102, https://arxiv.org/abs/2604.12102).
