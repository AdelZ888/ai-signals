---
title: "Audit et implémentation d’agents négociateurs LLM pour la chaîne d’approvisionnement"
date: "2026-08-12"
excerpt: "Guide pratique en français pour construire, tester et auditer des agents de négociation basés sur LLMs dans des scénarios d’approvisionnement — résumé des résultats expérimentaux (9 840 négociations) et checklist opérationnelle."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-12-auditing-llm-negotiators-in-supply-chains-private-information-bargaining-across-9840-trials.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "LLM"
  - "négociation"
  - "agents"
  - "chaîne d'approvisionnement"
  - "audit"
  - "IA"
  - "prompting"
  - "sécurité"
sources:
  - "https://arxiv.org/abs/2608.07538"
---

## TL;DR en langage simple

- Les LLM peuvent négocier automatiquement. (source: https://arxiv.org/abs/2608.07538)
- Résumé rapide et chiffré de l’étude : 9 modèles évalués ; 9 840 négociations ; accord dans 98,9 % des cas ; agents capturent 95,4 % du surplus non actualisé. (source: https://arxiv.org/abs/2608.07538)
- Les agents prennent en moyenne 2,98 tours, contre 1,25 pour le benchmark théorique. Ce retard réduit le surplus actualisé de ~21–34 %. (source: https://arxiv.org/abs/2608.07538)
- Les modèles de base acceptent parfois des contrats irrationnels (≈19,2 %), alors que les modèles haut de gamme le font à 0,0–0,6 %. (source: https://arxiv.org/abs/2608.07538)
- L’identité du provider change la division du surplus. Et la "patience" codée dans le prompt explique ≈90 % de la variance dans cette division. (source: https://arxiv.org/abs/2608.07538)

Méthodologie courte : synthèse et recommandations proviennent des résultats chiffrés de l’étude citée ci‑dessus. (source: https://arxiv.org/abs/2608.07538)

## Ce que vous allez construire et pourquoi c'est utile

Vous montez une pile minimale agent↔agent pour négocier quantité & prix. (source: https://arxiv.org/abs/2608.07538)
Objectifs concrets :
- Lancer deux agents LLM qui échangent des offres. (source: https://arxiv.org/abs/2608.07538)
- Journaliser chaque message et chaque offre pour audit et réplication. (source: https://arxiv.org/abs/2608.07538)
- Vérifier automatiquement la rentabilité avant toute acceptation autonome (profit‑verifier). L’étude indique que cette garde‑fou est cruciale pour limiter les acceptations irrationnelles. (source: https://arxiv.org/abs/2608.07538)
- Mesurer des métriques comparables à l’étude : taux d’accord, tours moyens, capture du surplus. (source: https://arxiv.org/abs/2608.07538)

Pourquoi cela sert : traçabilité, contrôle des pertes (20–34 % d’érosion possible), et possibilité de choisir un provider selon l’objectif de partage du gain. (source: https://arxiv.org/abs/2608.07538)

## Avant de commencer (temps, cout, prerequis)

- Prérequis : clé API d’un provider LLM, capacité à appeler l’API, stockage de logs (JSON), et un environnement de test isolé. (source: https://arxiv.org/abs/2608.07538)
- Repères utiles de l’étude : 9 modèles testés ; 9 840 runs ; accords 98,9 % ; rounds moyens 2,98 vs 1,25 benchmark. (source: https://arxiv.org/abs/2608.07538)
- Estimations rapides (à valider en pilote) : prototype simple en 1–2 jours ; pilote instrumenté en 1–2 semaines. Ces chiffres sont indicatifs et à confirmer en test. (source: https://arxiv.org/abs/2608.07538)

## Installation et implementation pas a pas

But minimal : faire dialoguer deux agents, garder tous les artefacts, exiger vérification de profit avant acceptation. (source: https://arxiv.org/abs/2608.07538)

1) Préparez l’environnement

```bash
git clone https://example.com/negotiation-starter.git
cd negotiation-starter
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export API_KEY="<votre_cle>"
```

(source: https://arxiv.org/abs/2608.07538)

2) Format minimal d’une offre

- Exemple structuré : price (float), quantity (int), action (offer|accept|reject), justification (string). (source: https://arxiv.org/abs/2608.07538)

3) Exemple de configuration (extrait illustratif)

```json
{
  "profit_verifier": {"mode": "block-or-flag", "expression": "(price - cost) * expected_quantity"},
  "experiment": {"log_format": "jsonl", "capture_seeds": true}
}
```

4) Boucle tour‑par‑tour (pseudocode)

- Chaque tour : obtenir réponse du provider, parser offre, loguer message + seed + timestamp, exécuter profit‑verifier, accepter/escale. (source: https://arxiv.org/abs/2608.07538)

5) Instrumentation minimale à collecter

- taux d’accord (%), tours moyens (count), capture du surplus (%), taux d’acceptations irrationnelles (%), provider identity. (source: https://arxiv.org/abs/2608.07538)

## Problemes frequents et correctifs rapides

(source: https://arxiv.org/abs/2608.07538)

- Convergence lente (trop de tours) : rendre la stratégie de concession explicite dans le prompt. L’étude note que les tours supplémentaires causent une perte de surplus de ~21–34 % par rapport au benchmark. (source: https://arxiv.org/abs/2608.07538)
- Acceptations perdantes : activer le profit‑verifier. L’étude observe ≈19,2 % d’acceptations irrationnelles sur modèles de base (0,0–0,6 % pour modèles haut de gamme). (source: https://arxiv.org/abs/2608.07538)
- Variabilité entre providers : exécuter des provider‑swap et mesurer la part acheteur/vendeur—l’étude rapporte des différences marquées. (source: https://arxiv.org/abs/2608.07538)
- Latence/API : monitorer latence p95/p99 et appliquer backoff exponentiel si nécessaire.

Tableau récapitulatif (self‑play observé dans l’étude) :

| Provider (self‑play) | Part acheteur (%) |
|---|---:|
| OpenAI | 40 |
| Google | 50 |
| Alibaba (Qwen) | 70 |

(source: https://arxiv.org/abs/2608.07538)

Checklist dépannage rapide :
- seed reproductible et dataset de test enregistré
- logging activé pour chaque run (JSON immuable)
- profit‑verifier avec tests unitaires
- provider‑swap expérimentations enregistrées

## Premier cas d'usage pour une petite equipe

(source: https://arxiv.org/abs/2608.07538)

Public visé : fondateurs solo et équipes 1–3.

Actions concrètes et immédiatement applicables (basées sur les résultats de l’étude) :

- Implémentez un profit‑verifier avant toute acceptation autonome. L’étude identifie ce garde‑fou comme essentiel pour réduire les acceptations irrationnelles (≈19,2 % sur baselines). (source: https://arxiv.org/abs/2608.07538)

- Journalisez prompts, seeds et chaque message. Les 9 840 runs de l’étude ont reposé sur ces artefacts pour l’analyse. Conservez logs en JSON pour réplication. (source: https://arxiv.org/abs/2608.07538)

- Faites des tests de self‑play / provider‑swap localement. Mesurez la part acheteur/vendeur par provider. L’étude montre que l’identité du provider peut déplacer la part de 7–18 points. (source: https://arxiv.org/abs/2608.07538)

- Traitez la "patience stratégique" du prompt comme un hyperparamètre à tuner. L’étude trouve que ce paramètre explique ≈90 % de la variance dans la division du surplus. (source: https://arxiv.org/abs/2608.07538)

Ces quatre actions permettent à une petite équipe d’obtenir des signaux robustes sans déployer en production immédiatement. (source: https://arxiv.org/abs/2608.07538)

## Notes techniques (optionnel)

(source: https://arxiv.org/abs/2608.07538)

- Conservez prompts, seeds et timestamps. L’étude a exploité ces artefacts sur 9 840 runs pour analyser comportement et variance. (source: https://arxiv.org/abs/2608.07538)
- Exposez la patience du prompt comme paramètre mesurable. Selon l’étude, c’est le principal levier pour la division du surplus (~90 % de la variance expliquée). (source: https://arxiv.org/abs/2608.07538)
- Mesurez l’érosion due au retard : l’étude rapporte une érosion estimée de 21–34 % du surplus actualisé quand les négociations sont plus longues que le benchmark. (source: https://arxiv.org/abs/2608.07538)

## Que faire ensuite (checklist production)

- [ ] Mettre en place un profit‑verifier et intégrer le blocage/alerte.
- [ ] Activer logging JSON immuable pour chaque run (prompts + seeds + réponses).
- [ ] Lancer des runs de self‑play et provider‑swap (au moins quelques dizaines de runs pour commencer).
- [ ] Mesurer : taux d’accord, tours moyens, capture du surplus, taux d’acceptations irrationnelles.
- [ ] Documenter prompts et version provider pour chaque expérience.

### Hypotheses / inconnues

- Taille de pilote recommandée : 100–1 000 runs pour signaux stables (hypothèse opérationnelle à valider). (source: https://arxiv.org/abs/2608.07538)
- Seuils opérationnels proposés (à valider empiriquement) : taux d’offres irrationnelles < 1 % ; taux d’accord cible > 95 % ; tours moyens ≤ 2. Ces seuils sont des objectifs de gouvernance, non des résultats de l’étude. (voir section méthodologie).
- Coûts en tokens / $ / latences (ms) varient fortement selon provider. Chiffres concrets doivent provenir de votre pilote.

### Risques / mitigations

- Risque : acceptations perdantes (≈19,2 % sur baselines). Mitigation : profit‑verifier obligatoire et revue humaine des alertes. (source: https://arxiv.org/abs/2608.07538)
- Risque : choix du provider modifiant la distribution du surplus (écart observé 7–18 points). Mitigation : provider‑swap et affectation des rôles selon objectifs stratégiques. (source: https://arxiv.org/abs/2608.07538)
- Risque légal/contractuel : acceptations automatisées peuvent créer obligations. Mitigation : limiter autonomie initiale et mettre en place revues juridiques.

### Prochaines etapes

1) Lancer un pilote local (quelques dizaines à quelques centaines de runs). Collecter prompts, seeds, logs.
2) Comparer vos métriques aux repères : accords 98,9 % ; rounds 2,98 vs 1,25 ; capture du surplus 95,4 % (référence étude). (source: https://arxiv.org/abs/2608.07538)
3) Ajuster la patience du prompt et mesurer l’impact (levier clé : ≈90 % de variance expliquée). (source: https://arxiv.org/abs/2608.07538)
4) Étendre progressivement si les KPI sont stables. Garder gates et rollback en place.

Référence principale : Chen Liang & Fasheng Xu, "When LLM Agents Negotiate: Private Information and Dynamic Bargaining in Supply Chains", arXiv:2608.07538 (https://arxiv.org/abs/2608.07538).
