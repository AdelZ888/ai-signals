---
title: "Transformer les principes classiques d'ingénierie logicielle en fichiers « skill » pour guider des agents IA de revue de code"
date: "2026-02-26"
excerpt: "Encoder des leçons de livres comme Clean Code ou DDIA en petits fichiers « skill » pour que des agents IA donnent des retours cohérents et traçables. Flux proposé : lint rapide → revue guidée → humain."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-26-turn-classic-software-engineering-principles-into-skill-files-to-guide-ai-code-review-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "revue-de-code"
  - "ingénierie-logicielle"
  - "LLM"
  - "CI"
sources:
  - "https://news.ycombinator.com/item?id=47098555"
---

## TL;DR en langage simple

- Idée : convertir des principes de livres classiques en fichiers "skill" structurés que des agents IA utilisent pour faire des revues (voir la discussion : https://news.ycombinator.com/item?id=47098555).
- Bénéfice : une "lentille" explicite concentre l'attention du modèle, réduit les retours hors sujet et rend les suggestions traçables (source : https://news.ycombinator.com/item?id=47098555).
- Risque principal : "context collapse" — appliquer une lentille inadaptée produit du bruit (voir la même discussion : https://news.ycombinator.com/item?id=47098555).
- Pattern recommandé, résumé : lint déterministe → reviewer-agent guidé par un skill → meta-evaluator qui agrège et déduplique (https://news.ycombinator.com/item?id=47098555).

Méthodologie courte : commencer petit, définir 1–3 skills initiaux et séparer niveaux de critique (lint rapide, revue guidée, méta-évaluation) (https://news.ycombinator.com/item?id=47098555).

## Ce que vous allez construire et pourquoi c'est utile

Vous allez implémenter un pipeline de revue assistée par IA composé de :
- un répertoire versionné de "skills" (fichiers de règles opinionnées),
- un manifeste de contexte qui mappe dépôt/langage/taille de diff → skills à appliquer,
- trois rôles exécutables : lint-agent (déterministe), reviewer-agent (LLM guidé par un skill), meta-evaluator (agrège, taggue skill_id, déduplique).

Pourquoi c'est utile (résumé de la discussion) :
- Cohérence et traçabilité : chaque suggestion peut référencer un skill_id et l'heuristique appliquée (https://news.ycombinator.com/item?id=47098555).
- Moins d'hallucinations : une lentille explicite concentre le modèle sur heuristiques connues (https://news.ycombinator.com/item?id=47098555).
- Contrôle contextuel : sélectionner les skills selon le langage et l'échelle évite le "pedantry" hors contexte (https://news.ycombinator.com/item?id=47098555).

Exemple d'usage illustratif (source de l'idée : https://news.ycombinator.com/item?id=47098555) : un skill "clean_code_basic" propose des heuristiques de nommage ; le reviewer-agent produit une suggestion et le meta-evaluator enregistre skill_id et confiance pour traçabilité.

## Avant de commencer (temps, cout, prerequis)

Prérequis minimaux discutés :
- Un dépôt Git avec PRs et CI pour brancher les runs automatiques (https://news.ycombinator.com/item?id=47098555).
- Un dossier versionné skills/ contenant les fichiers de règles (https://news.ycombinator.com/item?id=47098555).
- Accès à une API LLM ou runtime local selon vos contraintes (https://news.ycombinator.com/item?id=47098555).
- Rôles humains assignés : propriétaire des skills et responsable QA (https://news.ycombinator.com/item?id=47098555).

Recommandation opérationnelle tirée du fil : pilote court et canari — commencez limité pour contrôler coût et impact (https://news.ycombinator.com/item?id=47098555).

## Installation et implementation pas a pas

1) Créez un manifeste minimal qui décrit quand appliquer quel skill (langage, règle de routing, seuils de taille de diff). Source d'inspiration : https://news.ycombinator.com/item?id=47098555.

2) Rédigez un skill compact : forme opinionnée, exemples avant/après, heuristiques listées.

Exemple YAML minimal (inspiré de la discussion) :

```yaml
id: clean_code_basic
source: https://news.ycombinator.com/item?id=47098555
priority: high
heuristics:
  - id: naming
    description: Use intention-revealing names.
  - id: single_responsibility
    description: Prefer single-purpose functions.
examples:
  - before: "f()"
    after: "calculateInvoiceTotal()"
```

3) Implémentez les trois agents conceptuels (pattern discuté sur HN) :
- lint-agent : passes rapides et déterministes (ex : regex, linters existants).
- reviewer-agent : prompt guidé par le skill vers un LLM.
- meta-evaluator : agrège, taggue skill_id et confidence_pct, déduplique.

Exemples de commandes :

```bash
# lint-agent rapide sur fichiers modifiés
python agents/lint_agent.py --changed-files "$(git diff --name-only origin/main)"

# reviewer-agent manuel pour PR avec un skill donné
python agents/reviewer_agent.py --skill skills/clean_code.yaml --manifest context/manifest.json
```

4) Intégrez au CI : lint-agent sur chaque PR, reviewer-agent en canari/feature-flag (https://news.ycombinator.com/item?id=47098555).

5) Collectez logs et métriques : violations, suggestions appliquées, feedback développeur, tokens consommés — ces métriques servent à itérer (https://news.ycombinator.com/item?id=47098555).

## Problemes frequents et correctifs rapides

Problèmes décrits dans la discussion et correctifs pratiques (https://news.ycombinator.com/item?id=47098555) :

- Context collapse
  - Symptôme : remarques hors sujet ou trop pédantes.
  - Correctif : filtrer les skills par langage et par échelle du changement ; n'exécuter qu'un sous-ensemble pertinent.

- Revue superficielle / répétitive
  - Symptôme : mêmes remarques à chaque passe.
  - Correctif : séparer niveaux de critique (lint rapide → revue modèle → méta-évaluation pour dédupliquer), comme suggéré sur HN (https://news.ycombinator.com/item?id=47098555).

- Refactorings bruyants
  - Correctif : exiger tests verts et approbation humaine avant merge automatique.

- Coûts API / tokens
  - Correctif : limiter couverture en canari, utiliser modèles moins chers pour passes fréquentes, monitorer la consommation (https://news.ycombinator.com/item?id=47098555).

## Premier cas d'usage pour une petite equipe

Adapté aux solo founders / petites équipes — conseils concrets et actionnables (inspirés par la discussion : https://news.ycombinator.com/item?id=47098555) :

- Action 1 — Démarrage ultra-minimal : créez 1 skill ciblé sur un dossier critique (ex. payments/ ou core/). Gardez le skill court et explicite (une poignée d'heuristiques).
- Action 2 — Lint en local et en CI : branchez un lint-agent déterministe (pre-commit + CI) pour attraper les problèmes rapides sans coût LLM.
- Action 3 — Reviewer manuel d'abord : exécutez reviewer-agent manuellement ou derrière un feature-flag sur 1 PR pilote avant d'automatiser.
- Action 4 — Contrôle des coûts : privilégiez runs manuels ou canari pour les premiers 2–4 sprints; loggez les tokens et décisions.
- Action 5 — Intégration continue légère : utilisez des hooks git pour exécuter lint-agent en <1s localement (ou en mode asynchrone dans CI) afin d'éviter interruptions de flux.

Checklist rapide :
- [ ] Ajouter skills/clean_code.yaml (répertoire versionné)
- [ ] Commit context/manifest.json (routing minimal)
- [ ] Brancher lint-agent à la CI (pre-commit + CI)
- [ ] Exécuter reviewer-agent manuellement sur une PR pilote (collecter feedback)

Plus de détails et la discussion d'origine : https://news.ycombinator.com/item?id=47098555.

## Notes techniques (optionnel)

Format et orchestration suggérés (références : https://news.ycombinator.com/item?id=47098555) :
- Structure d'un skill : id, source (URL), priority, heuristics[], examples[].
- Pattern d'orchestration recommandé : producer (détecte changements) → reviewer (applique un skill) → meta-evaluator (agrège/score/stocke).

Exemple JSON de sortie de meta-evaluator (utile pour stockage/dashboards) :

```json
{
  "skill_id": "clean_code_basic",
  "file": "src/payments.py",
  "line_start": 120,
  "line_end": 135,
  "suggestion": "Rename f() to calculate_invoice_total",
  "confidence_pct": 92
}
```

Métriques à suivre (suggestion tirée du fil) : violations/LOC, taux de faux positifs, % suggestions appliquées, consommation tokens (https://news.ycombinator.com/item?id=47098555).

## Que faire ensuite (checklist production)

| Type de dépôt | Skills initiales | Coverage recommandé | Notes |
|---|---:|---:|---|
| Bibliothèque utilitaire | 1–2 skills ciblés | feature-flag / canari | privilégier lint déterministe (https://news.ycombinator.com/item?id=47098555) |
| Service backend critique | 3–6 skills | canari contrôlé | reviews guidées sur diffs larges (https://news.ycombinator.com/item?id=47098555) |
| Prototype produit | 1 skill exploratoire | manuel | éviter l'automatisation avant validation (https://news.ycombinator.com/item?id=47098555) |

Source d'inspiration et discussion : https://news.ycombinator.com/item?id=47098555

### Hypotheses / inconnues

Les chiffres ci‑dessous sont des hypothèses opérationnelles à valider en pilote (à confirmer — ces valeurs ne figurent pas littéralement dans le fil mais résument des recommandations pratiques vues en discussion) :

- longueur d'un skill : 4–8 heuristiques
- couverture canari pour reviewer-agent : 1–10% des PRs
- durée pilote initiale recommandée : 14 jours de collecte
- taille d'un agent/runner pour itérations rapides : <200 lignes de code
- seuil grand-diff pour reviewer-agent : >100 lignes modifiées
- objectif métrique initial : violations/100 LOC <3
- taux faux positifs cible : <20%
- consommation tokens pilote visée : <100000 tokens/semaine

### Risques / mitigations

- Risque : mauvaise lentille appliquée (context collapse).
  - Mitigation : valider le manifeste avant exécution, n'activer que les skills pertinents pour le langage/contexte (https://news.ycombinator.com/item?id=47098555).

- Risque : bruit et fatigue développeur.
  - Mitigation : démarrer par lint déterministe et limiter la fréquence des runs modèle; séparer niveaux de critique (https://news.ycombinator.com/item?id=47098555).

- Risque : coûts API non maîtrisés.
  - Mitigation : utiliser modèles bas coût pour passes fréquentes, limiter couverture à un canari et monitorer dépenses (https://news.ycombinator.com/item?id=47098555).

### Prochaines etapes

1. Créer skills/clean_code.yaml et pousser sur une branche feature.
2. Ajouter context/manifest.json avec une table de décision simple qui mappe types de dépôts à skill ids.
3. Brancher lint-agent à la CI ; garder reviewer-agent derrière un feature flag et activer en canari pour les premiers cycles.
4. Collecter métriques et feedback pendant la période pilote (~2 semaines) : tokens consommés, % suggestions appliquées, temps médian de review.
5. Itérer sur wording des skills, priorités et règles de décision ; ne pas automatiser merges risqués sans tests verts et revue humaine.

Lecture complémentaire et discussion d'origine : https://news.ycombinator.com/item?id=47098555.
