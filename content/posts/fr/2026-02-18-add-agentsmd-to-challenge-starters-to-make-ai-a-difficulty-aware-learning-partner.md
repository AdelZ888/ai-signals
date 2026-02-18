---
title: "Ajouter AGENTS.md aux starters de challenges pour faire de l'IA un tuteur sensible à la difficulté"
date: "2026-02-18"
excerpt: "Playbook pratique inspiré du déploiement Frontend Mentor : inclure AGENTS.md (et optionnellement CLAUDE.md) dans les starters, contrôler par CI, et orienter les assistants IA pour qu'ils tutorent par niveau de difficulté."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-18-add-agentsmd-to-challenge-starters-to-make-ai-a-difficulty-aware-learning-partner.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "AI"
  - "documentation"
  - "frontend"
  - "CI"
  - "developer-experience"
  - "learning"
sources:
  - "https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge"
---

## TL;DR builders

Every Frontend Mentor challenge now inclut un fichier AGENTS.md pour orienter les assistants IA vers un rôle pédagogique plutôt que la production de solutions complètes (Source: https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge).

Résumé opérationnel rapide pour équipes techniques et fondateurs : ajouter un AGENTS.md dans chaque dossier starter/ (et un alias CLAUDE.md si vous ciblez Claude). Artefacts prioritaires : template AGENTS.md, job CI qui bloque les PRs manquantes, checklist PR. Principes clefs : hint-first, guidage progressif, ton socratique — « AI should guide your thinking, not replace it. » (Source: https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge).

Méthodologie courte : reproduire la convention décrite, piloter sur un petit échantillon (voir chiffres ci‑dessous), mesurer, itérer.

- Résultat attendu immédiat : chaque starter/ contient AGENTS.md (+ optionnel CLAUDE.md).
- Artefacts initiaux : 1 template central, 1 job CI, 1 checklist.

## Objectif et resultat attendu

Objectif principal (déclaré par Frontend Mentor) : transformer les agents IA en partenaires d'apprentissage adaptés à la difficulté des challenges en ajoutant AGENTS.md et CLAUDE.md dans les starters (Source: https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge).

Résultats opérationnels attendus (recommandations à traiter comme hypothèses à valider) :

- 100% des nouveaux starters livrés incluent AGENTS.md.
- Pattern de réponse des agents adapté par niveau : indices progressifs, aide debugging, solution complète seulement sur demande explicite.
- CI qui bloque les PRs si un ou plusieurs starter/ omettent AGENTS.md (ex. seuil de 1 fichier manquant déclenche l'échec).

KPI proposés (à instrumenter avant le pilot) :

- Couverture PR vs starters : target initiale 90% sur le pilote de 10–20 challenges.
- Taux d'incidence de solutions complètes durant le pilote : objectif <5%.
- Amélioration hypothétique de complétion utilisateur : +10% (à valider en A/B).

(Source de base et intentions : https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge)

## Stack et prerequis

Composants minimaux :

- Hébergement Git (GitHub/GitLab) avec structure challenges/*/starter/.
- CI capable d'exécuter checks (GitHub Actions, GitLab CI) — runtime job ciblé : 1 job, durée attendue <3000 ms pour le scan initial par PR si optimisé.
- Gouvernance : 1–3 réviseurs par catégorie de contenu.
- Encodage : UTF‑8, LF, sans BOM.

Outils conseillés et artefacts :

- Template AGENTS.md centralisé et versionné.
- Optionnel : CLAUDE.md alias pointant vers la même guidance.
- Job CI de linting qui vérifie la présence et les champs minimaux (titre, learner-profile, hint-policy).

Tableau de comparaison rapide des options d'intégration (décision frame) :

| Option | Complexité | Latence d'accès | Cas d'usage | Coût estimé |
|---|---:|---:|---|---:|
| Fichiers uniquement (starter/) | faible | 0 ms (local) | projets open-source, offline | $0 |
| Endpoint JSON exporté | moyen | 20–200 ms (cacheable) | assistants hébergés, contrôle centralisé | $50–$200/mois |

(Source sur la convention : https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge)

## Implementation pas a pas

1) Rédiger les templates

- Créer un template AGENTS.md (200–800 tokens recommandé) et, si besoin, CLAUDE.md alias. Inclure règle explicite « ne pas produire de solution complète » et politique d'indices (ex. 3 hints avant solution complète).

2) Mapper comportements par difficulté

- Définir Beginner / Intermediate / Advanced et actions autorisées (hint-first, debug, critique). Ce mapping est une recommandation testable.

3) Ajout en masse (script d'exemple)

```bash
# find all starter folders and add AGENTS.md from templates/
for d in $(find . -type d -name starter); do
  cp templates/AGENTS.md "$d/AGENTS.md"
  git add "$d/AGENTS.md"
done
git commit -m "chore: add AGENTS.md starter guidance"
git push origin add-agents
```

4) Enforcement CI (modèle)

```yaml
name: check-agents-files
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: find missing AGENTS.md
        run: |
          missing=0
          for d in $(find . -type d -name starter); do
            if [ ! -f "$d/AGENTS.md" ]; then
              echo "MISSING: $d/AGENTS.md"
              missing=$((missing+1))
            fi
          done
          if [ "$missing" -gt 0 ]; then
            echo "Found $missing missing AGENTS.md files"
            exit 1
          fi
```

5) Pilote & feedback

- Piloter sur 10–20 challenges pendant 14–28 jours, exécuter 10 tests de prompt par niveau et journaliser les réponses.

6) Rollout

- Canary : 7–14 jours par cohorte, puis extension par lots de 50–100 challenges/semaine si les KPIs sont satisfaisants.

(Source et justification : https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge)

## Architecture de reference

Disposition repo recommandée :

- challenges/
  - challenge-foo/
    - starter/
      - index.html
      - src/
      - AGENTS.md
      - CLAUDE.md (optionnel)

Couche CI/QA : job lint qui scanne tous les starter/ et vérifie présence + champs minimaux. Si manques, la PR échoue et un rapport est posté.

Deux options d'intégration runtime :

- Option A — fichiers seulement : AGENTS.md reste dans starter/ et est lu par l'agent/outil.
- Option B — endpoint export : convertir AGENTS.md en JSON et servir via un endpoint (mettre en cache, rate limit, TTL 60–3600 s selon besoin).

Pipeline logique : repo -> CI check -> staged merge -> canary (7–14 j) -> full rollout par lots (50–100 challenges/semaine).

(Source : https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge)

## Vue fondateur: ROI et adoption

Proposition de valeur pour le produit :

- Différenciation : UX pédagogique réduisant le copy‑paste et favorisant l'apprentissage actif.
- Adoption initiale : pilote de 10–20 challenges sur 2–4 semaines pour mesurer engagement.

Parcours d'adoption suggéré :

1. Pilote : 10–20 challenges, 14–28 jours.
2. Critères de succès (exemples) : completions +10% vs contrôle, <5% de réponses donnant la solution complète.
3. Revue every 90 jours pour ajuster templates et politiques.

Coûts indicatifs (hypothèses) :

- Implémentation initiale : 40–120 dev hours.
- Maintenance : ~2–6 heures/semaine pour owners de contenu.

KPIs à instrumenter : starts, completions, rétention 30/90 jours, signalements d'abus, incidence de solutions complètes.

(Source de la pratique : https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge)

## Pannes frequentes et debugging

Modes d'échec courants et actions rapides (contrôles) :

- Fichier absent ou mal nommé : vérifier "AGENTS.md" exact, UTF‑8, pas de BOM.
- Agent ignore la guidance : exécuter tests standardisés (10 prompts par niveau) et inspecter la fenêtre de contexte/limitations de tokens (par ex. 4k–32k tokens selon l'agent).
- Guidance trop permissive : renforcer la règle (ex. 3 hints obligatoires) et mesurer l'impact.

Checklist de debugging :

- [ ] Confirmer AGENTS.md dans tous les starter/ (job CI).
- [ ] Lancer 10 tests de prompt par niveau et journaliser les sorties.
- [ ] Vérifier que <5% des réponses renvoient une solution complète pendant le pilote.

Si le CI produit des faux positifs, ajouter fixtures et tests unitaires reproduisant le cas.

(Source : https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge)

## Checklist production

### Hypotheses / inconnues

- Hypothèse : la majorité des usagers utilise des assistants capables de lire les fichiers du repo (ex. GitHub Copilot, Claude, ChatGPT avec plugin). (À valider pour votre auditoire.)
- Hypothèse : un pilote de 10–20 challenges et 14–28 jours suffira pour détecter un changement de comportement mesurable des agents.
- Hypothèse : une fenêtre canary de 7–14 jours par lot permet d'identifier régressions majeures.
- Note factuelle : Frontend Mentor a ajouté AGENTS.md et CLAUDE.md aux starters (Source: https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge).

### Risques / mitigations

- Risque : les agents ignorent les fichiers -> Mitigation : itérer formulation, ajouter CLAUDE.md, tests automatisés.
- Risque : perception d'utilité réduite -> Mitigation : A/B testing, option opt‑in pour afficher la solution complète après demande explicite.
- Risque : CI instable -> Mitigation : tests reproductibles, logs et fixtures.

### Prochaines etapes

- Créer templates AGENTS.md / CLAUDE.md et préparer PR pilote sur ~10 challenges.
- Ajouter job CI minimal (exemple YAML ci‑dessous) et tests de prompts (10 exemples/niveau).
- Lancer pilote 14–28 jours, collecter métriques quantitatives (starts, completions, <5% solutions complètes, rétention 30/90 jours) et retours qualitatifs, puis décider du rollout par lots (50–100 challenges/semaine).

Exemple YAML du job CI (répété pour intégration rapide) :

```yaml
# voir section Implementation pas a pas pour le job complet
name: check-agents-files
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: validate AGENTS.md files
        run: ./scripts/check-agents.sh
```

(Source général et motivation : https://www.frontendmentor.io/articles/agents-md-files-in-every-challenge)
