---
title: "Assembler un paquet CAISI compact prêt à soumission pour tests volontaires du US Commerce"
date: "2026-05-10"
excerpt: "Checklist pratique pour construire un paquet de sécurité prêt à soumission CAISI — metadata, 50 vecteurs de test, métriques automatisées, red-team 1 heure et plan de canary/rollback."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-10-assembling-a-compact-caisi-submit-package-for-voluntary-us-commerce-safety-testing.jpg"
region: "UK"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "sécurité"
  - "CAISI"
  - "MLOps"
  - "déploiement"
  - "reivew-volontaire"
sources:
  - "https://www.bbc.com/news/articles/cgjp2we2j8go?at_medium=RSS&at_campaign=rss"
---

## TL;DR en langage simple

- En termes très simples : le gouvernement américain, via le Center for AI Standards and Innovation (CAISI) du Department of Commerce, demande à certaines entreprises d'IA de laisser leurs nouveaux modèles être testés pour des risques avant d'être ouverts au public. Ces tests sont volontaires et visent à repérer des problèmes évidents comme des fuites de données, des contenus inappropriés ou des comportements imprévus. Source : https://www.bbc.com/news/articles/cgjp2we2j8go?at_medium=RSS&at_campaign=rss

- Pourquoi c'est important : un examen préalable aide à trouver des problèmes réplicables avant qu'ils n'affectent des utilisateurs (p. ex. images inappropriées, réponses trompeuses). Les entreprises coopèrent pour rendre ces examens plus systématiques.

- En langage technique bref : CAISI (Center for AI Standards and Innovation) a élargi des collaborations volontaires pour évaluer des modèles commerciaux — l'article BBC mentionne Google/DeepMind (Gemini), Microsoft (CoPilot) et xAI (Grok) — et indique qu'environ 40 évaluations ont déjà eu lieu.

Acronymes définis rapidement :
- CAISI = Center for AI Standards and Innovation (Centre du Département du Commerce américain).
- RPS = requêtes par seconde (requests per second).
- p90 = 90e centile de latence (le temps en ms sous lequel 90% des requêtes sont servies).

Méthodologie note courte : toutes les assertions factuelles sont basées sur l'extrait BBC lié ci‑dessus.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez créer un « paquet prêt à soumettre » pour une évaluation volontaire CAISI. Ce paquet aide l'évaluateur à reproduire vos tests et à mesurer des seuils de sécurité et de performance.

Éléments du paquet minimal (exemples chiffrés) :
- metadata.json (≤ 300 mots)
- test-vectors.csv (≥ 50 cas de test)
- metrics_report.csv (résultats automatisés, N = 5 exécutions par vecteur)
- redteam.md (compte rendu d'une session timeboxée de 60 minutes)
- rollout_gate.yaml (stratégie canary : 10% du trafic pendant 60 minutes, avec règles de rollback)

Pourquoi c'est utile : CAISI procède à des évaluations volontaires et collaboratives afin d'identifier capacités et risques — l'article BBC confirme l'élargissement à Google, Microsoft et xAI et le chiffre d'environ 40 évaluations antérieures. Source : https://www.bbc.com/news/articles/cgjp2we2j8go?at_medium=RSS&at_campaign=rss

## Avant de commencer (temps, cout, prerequis)

Estimation et ressources :
- Effort paquet minimal : ~3 heures (1 personne).
- Paquet complet + remédiations : ~8 heures.
- Coût cloud approximatif : $0–$300 selon infra et volume d'appels (p. ex. tests N = 5 vs N = 10).
- Accès requis : accès API ou accès aux poids du modèle.

Cibles numériques recommandées :
- Vecteurs de test : ≥ 50.
- Exécutions par vecteur : N = 5 (augmenter à N = 10 si instable).
- Objectif d'acceptation automatisée : ≥ 90% de réussite sur vecteurs représentatifs.
- Latence cible : médiane ≤ 200 ms ; p90 ≤ 300 ms ; alerter si p90 > 500 ms.
- Canary : 10% du trafic pendant 60 minutes ; rollback si seuils critiques dépassés.

Prérequis logiciels : harness de tests (p. ex. pytest), stockage chiffré et versionné, capacité d'exécution ≥ 10 rps pour tests de charge si besoin.

Contexte factuel : CAISI a conduit environ 40 évaluations et étend désormais les collaborations aux fournisseurs majeurs mentionnés dans l'article BBC. Source : https://www.bbc.com/news/articles/cgjp2we2j8go?at_medium=RSS&at_campaign=rss

## Installation et implementation pas a pas

1) Créer metadata.json (≤ 300 mots) : name, version, owner, intended_uses, known_limits, provenance_summary.

2) Préparer test-vectors.csv (≥ 50 cas). Colonnes suggérées : id,label,input,expected_behavior. Couvrez sécurité, vie privée, injections de prompt et cas multimodaux si applicables.

3) Exécuter la suite automatisée : pour chaque vecteur, exécuter N = 5 runs (ou N = 10 si non déterministe). Collecter : toxicity_rate (%), hallucination_rate (%), sensitive_leakage_rate (%), median_latency_ms, p90_latency_ms, throughput_rps.

4) Red‑team timeboxée : 60 minutes, ≤ 10 scénarios ciblés. Documenter PoC et mitigations.

5) Préparer rollout_gate.yaml avec seuils pass/fail (ex. toxicity_rate ≤ 2%, hallucination_rate ≤ 5%, sensitive_leakage_rate ≤ 0.5%), stratégie canary (10% / 60 min) et triggers de rollback.

Exemple minimal metadata (JSON) :

```json
{ "name": "assistant-exemple", "version": "v1.0.0", "owner": "contact@example.com", "intended_uses": ["support-client"], "known_limits": ["peut halluciner sur faits rares"], "provenance_summary": "données publiques et internes" }
```

Commandes d'exécution exemples :

```bash
# lancer la suite de tests (N = 5)
python tests/run_suite.py --vectors test-vectors.csv --runs 5 --out metrics_report.csv
# empaqueter pour soumission
zip -r submit_package.zip metadata.json test-vectors.csv metrics_report.csv redteam.md rollout_gate.yaml
```

Tableau de décision rapide :

| Métrique | Seuil recommandé | Action si dépassé |
|---:|---:|---|
| toxicity_rate | ≤ 2% | bloquer / investigation |
| hallucination_rate | ≤ 5% | activer grounding / bloquer prompts à risque |
| p90_latency_ms | ≤ 300 ms | scalabilité / monitorer |
| sensitive_leakage_rate | ≤ 0.5% | triage manuel |

Checklist d'emballage :
- [ ] metadata.json (≤ 300 mots)
- [ ] ≥ 50 vecteurs de test
- [ ] metrics_report.csv (N = 5)
- [ ] redteam.md (60 minutes)
- [ ] rollout_gate.yaml (10%/60 min)

Pour le contexte institutionnel, voir l'article BBC sur l'expansion des évaluations CAISI : https://www.bbc.com/news/articles/cgjp2we2j8go?at_medium=RSS&at_campaign=rss

## Problemes frequents et correctifs rapides

Problèmes courants et réponses immédiates :

- Tests non déterministes : augmenter N de 5 à 10, utiliser la médiane, conserver logs bruts 30 jours.
- Métadonnées incomplètes : ajouter owner, version, provenance_summary (≤ 300 mots).
- Hallucinations > 5% : activer grounding, templates de refus ; re-tester N = 10.
- Sexualisation d'images (ex. cas médiatisé de Grok) : triage immédiat et rollback du canary si > 1% des échantillons sont problématiques.
- Latence p90 > 500 ms : rollback si impact client > 10% des requêtes.

Actions rapides (checklist) :
- [ ] Reprendre tests instables avec N = 10
- [ ] Ajouter filtres post‑processing défensifs
- [ ] Documenter mitigations dans redteam.md
- [ ] Re-emballer et re-soumettre

Contexte : l'article BBC note que CAISI étend ses collaborations à Google/DeepMind (Gemini), Microsoft (CoPilot) et xAI (Grok), et qu'environ 40 évaluations ont été menées. Source : https://www.bbc.com/news/articles/cgjp2we2j8go?at_medium=RSS&at_campaign=rss

## Premier cas d'usage pour une petite equipe

Cible : fondateurs solo ou équipes de 1–3 personnes déployant un assistant client.

Calendrier suggéré :
- Jour 0 (≤ 3 heures) : metadata.json + 50 vecteurs de base.
- Jour 1 (≤ 4 heures) : lancer la suite automatique (N = 5), corriger échecs majeurs.
- Jour 2 (≤ 1 heure) : red‑team 60 minutes, finaliser paquet.
- Jour 7 : canary 10% pendant 60 minutes ; rollback si seuils dépassés.

Objectifs CI/ops :
- Durée des runs CI par commit ≤ 15 minutes.
- Persister metrics_report.csv pendant ≥ 12 mois.
- Concentrez ~70% des tests sur 5 parcours utilisateurs critiques.

Checklist démarrage :
- [ ] metadata.json
- [ ] 50 vecteurs de test
- [ ] metrics_report.csv (N = 5)
- [ ] redteam 60 minutes complété
- [ ] submit_package.zip stocké et chiffré

Contexte opérationnel : voir l'article BBC pour la justification du cadre de tests volontaires CAISI : https://www.bbc.com/news/articles/cgjp2we2j8go?at_medium=RSS&at_campaign=rss

## Notes techniques (optionnel)

Recommandations techniques : harness Python (pytest), scripts bash pour orchestration, stockage S3 chiffré (AES-256-GCM). Visez < 15 minutes par run CI et conservez séries temporelles métriques ≥ 12 mois.

Exemple de configuration d'encryption pour l'archive soumise :

```json
{
  "encryption": "AES-256-GCM",
  "key_fingerprint": "AB:CD:EF:01:23",
  "instructions": "Encrypt submit_package.zip with recipient public key"
}
```

Paramètres chiffrés et opérations :
- Rétention métriques : 12 mois minimum.
- Throughput cible en test de charge : ≥ 10 rps.
- Alarmes critiques : toxicity_rate > 4% OU p90_latency_ms > 500 ms -> rollback immédiat.

Référence : article BBC sur CAISI et l'expansion des évaluations vers Google, Microsoft et xAI : https://www.bbc.com/news/articles/cgjp2we2j8go?at_medium=RSS&at_campaign=rss

## Que faire ensuite (checklist production)

Le bloc ci‑dessous regroupe hypothèses, principaux risques et prochaines étapes opérationnelles. Source cadre : https://www.bbc.com/news/articles/cgjp2we2j8go?at_medium=RSS&at_campaign=rss

### Hypotheses / inconnues

- CAISI continuera des évaluations volontaires ; l'extrait signale ≈ 40 évaluations menées à ce jour.
- Vous avez (ou obtiendrez) un accès API ou aux poids nécessaires pour exécuter ≥ 50 vecteurs localement.
- Les seuils numériques fournis (toxicity_rate ≤ 2%, hallucination_rate ≤ 5%, p90_latency_ms ≤ 300 ms, canary 10%/60 min) sont des recommandations opérationnelles à valider avec l'équipe d'évaluation.

### Risques / mitigations

- Risque : demande d'artefacts sensibles (detail provenance). Mitigation : fournir résumé succinct et procédure d'accès contrôlé ; conserver archive hors‑ligne chiffrée.
- Risque : canary révèle régression sur ≤ 10% du trafic. Mitigation : rollback immédiat, post‑mortem sous 24 heures, attendre ≥ 48 heures avant nouvelle tentative.
- Risque : tests instables -> faux positifs. Mitigation : augmenter N à 10, prendre médiane, garder logs bruts 30 jours.

### Prochaines etapes

- Automatiser la suite de métriques en CI (objectif ≤ 15 minutes/exécution) et stocker métriques ≥ 12 mois.
- Planifier red‑teams régulières (60 minutes, trimestrielles) et tenir un journal des mitigations.
- Mettre en place alertes opérationnelles : toxicity_rate > 4% OU p90_latency_ms > 500 ms -> rollback.
- Versionner chaque submit_package.zip et conserver archives 12 mois pour audit.

Source principale : article BBC sur l'expansion des évaluations CAISI et la collaboration volontaire entre le Department of Commerce et des entreprises d'IA (Google/DeepMind, Microsoft, xAI) : https://www.bbc.com/news/articles/cgjp2we2j8go?at_medium=RSS&at_campaign=rss
