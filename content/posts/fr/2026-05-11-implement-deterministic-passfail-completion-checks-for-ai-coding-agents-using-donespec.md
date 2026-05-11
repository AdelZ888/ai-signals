---
title: "Mettre en place des contrôles PASS/FAIL déterministes pour agents IA avec DoneSpec"
date: "2026-05-11"
excerpt: "Utilisez DoneSpec pour transformer des sorties d'agents ambiguës en validateurs PASS/FAIL déterministes, ce qui permet de bloquer en CI, automatiser des retries et mesurer le taux de succès."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-11-implement-deterministic-passfail-completion-checks-for-ai-coding-agents-using-donespec.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "DoneSpec"
  - "validation déterministe"
  - "agents IA"
  - "CI"
  - "observabilité"
  - "UK"
sources:
  - "https://github.com/xryv/DoneSpec"
---

## TL;DR en langage simple

- DoneSpec est un projet open‑source pour la validation déterministe des sorties d'agents IA : https://github.com/xryv/DoneSpec. Le principe : l'agent écrit un artefact lisible par machine (JSON/NDJSON/texte) et un validateur automatique lit l'artefact et renvoie PASS (exit code 0) ou FAIL (exit code non‑zéro).
- Avantages concrets : verdict booléen traçable, intégration aisée en CI (par ex. GitHub Actions), réduction de la relecture humaine pour vérifications simples. Voir le dépôt de référence : https://github.com/xryv/DoneSpec.
- Estimations pratiques : contrôle minimal en ~1–3 heures ; spec et fixtures robustes en ~4–12 heures. Canary conseillé : 7 jours (168 heures) pour collecter métriques (~100 exécutions). Cibles opérationnelles : latence pour checks légers ~200–2000 ms ; timeout maximal recommandé = 300000 ms (5 minutes).

Exemple résumé : l'agent produit artifact.json contenant la clé "tests". Une spec YAML exige que "tests" soit non vide ; le validateur lit artifact.json et retourne 0 si OK, sinon non‑zéro. Vous joignez ce validateur au pipeline CI pour bloquer un merge en cas d'échec.

Méthode courte : produire une sortie lisible par machine + écrire un validateur qui rend un verdict clair et reproductible (référence : https://github.com/xryv/DoneSpec).

## Ce que vous allez construire et pourquoi c'est utile

Vous allez ajouter un validateur post‑exécution appelé « DoneSpec check » qui lit artifact.json produit par l'agent, applique une spec (YAML) et renvoie 0 = PASS / non‑zéro = FAIL. Le dépôt de référence et exemples sont ici : https://github.com/xryv/DoneSpec.

Pourquoi utile :
- Gate clair pour workflows CI (ex. GitHub Actions) — bloque un merge si la spec échoue.
- Observabilité simple : taux de réussite (pass‑rate %), latence moyenne (ms), nombre d'échecs (count). Ces métriques aident à décider d'exiger le check.
- Gain de temps : moins de relecture humaine pour tâches répétitives.

Ce que vous produirez initialement :
- Une spec YAML (ex. specs/my_spec.yaml) décrivant 1–5 invariants initiaux (visez <50 lignes).
- Au minimum 2 fixtures : fixtures/good.json et fixtures/bad.json ; objectif à moyen terme 10+ fixtures (5 bons / 5 mauvais).
- Un validateur CLI ou bibliothèque avec la plupart des checks exécutés en 200–2000 ms.

Référence et exemples : https://github.com/xryv/DoneSpec.

## Avant de commencer (temps, cout, prerequis)

Estimation temps & coût (indicatif) :
- Contrôle minimal : 1–3 heures.
- Spec robuste + fixtures : 4–12 heures.
- Pilot CI pour petite équipe : coût approximatif £0.10–£5.00 selon fréquence et durée des runs.
- Rétention d'artefacts recommandée : 30 jours pour rejouer et auditer.

Équipe et accès : 1–3 personnes pour un pilote. Accès requis : dépôt git et permission de modifier workflows CI (ex. GitHub Actions). Référence : https://github.com/xryv/DoneSpec.

Prérequis techniques :
- Agent ou test harness capable d'écrire JSON/NDJSON/texte.
- Système CI (GitHub Actions recommandé).
- Connaissances shell et Python/Bash (ou équivalent).

Checklist pré‑départ :
- [ ] Cloner le dépôt DoneSpec : https://github.com/xryv/DoneSpec
- [ ] Identifier le fichier de sortie de l'agent (préférer JSON)
- [ ] Créer au moins deux fixtures : fixtures/good.json et fixtures/bad.json (viser 10+ à terme)

Méthode recommandée : commencer par un invariant simple, itérer en cycles courts (3–7 jours).

## Installation et implementation pas a pas

Le dépôt de référence contient des exemples et scripts : https://github.com/xryv/DoneSpec.

1) Cloner et inspecter

```bash
git clone https://github.com/xryv/DoneSpec.git
cd DoneSpec
ls -la
```

2) Créer une spec minimale et des fixtures
- Choisir 1 invariant simple (ex. la clé "tests" existe et length >= 1).
- Ajouter : specs/my_spec.yaml, fixtures/good.json, fixtures/bad.json.

3) Brancher le validateur dans l'agent
- Option A (in‑process) : importer une librairie et retourner True/False.
- Option B (out‑of‑process) : exécuter un CLI qui lit artifact.json et quitte avec code 0/1.

4) Exemple de job GitHub Actions (minimal) — variantes et exemples dans le dépôt : https://github.com/xryv/DoneSpec

```yaml
name: donespec-check
on: [pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run agent in test mode
        run: ./scripts/run-agent.sh --output artifact.json --mode test
      - name: Run DoneSpec validator
        run: |
          python3 tools/donespec_validator.py --spec specs/my_spec.yaml --input artifact.json
```

5) Validation locale et cibles de latence

```bash
python3 tools/donespec_validator.py --spec specs/my_spec.yaml --input fixtures/good.json
# attendre exit 0
python3 tools/donespec_validator.py --spec specs/my_spec.yaml --input fixtures/bad.json || echo "EXPECTED FAIL"
```

Cibles opérationnelles : latence moyenne <2000 ms pour checks simples. Timeout recommandé par check : 300000 ms (5 minutes).

## Problemes frequents et correctifs rapides

Tableau de décision rapide (diagnostic → action) :

| Symptôme | Cause probable | Action immédiate |
|---|---:|---|
| Faux négatif | Spec trop stricte / données non normalisées | Détendre assertions, normaliser timestamps, ajouter fixtures (>=5) |
| Faux positif | Spec trop lâche | Renforcer invariants (clés requises, checksums), ajouter fixtures (objectif 10+) |
| CI coûteux/lent | Checks lourds sur chaque PR | Déplacer en nightly, fixer timeout = 300000 ms |
| Instabilité | Environnements non figés | Pinner runtime (ex. node=18.x, python=3.11) ou Docker |

Correctifs rapides résumés :
- Trop de faux négatifs : simplifier la spec, normaliser la sortie.
- Trop de faux positifs : renforcer la spec, augmenter la couverture de fixtures.
- CI gourmand : limiter fréquence et séparer checks rapides (<2000 ms) et checks lourds (jusqu'à 300000 ms).

Référence d'exemples et scripts : https://github.com/xryv/DoneSpec.

## Premier cas d'usage pour une petite equipe

Cible : solo founders et petites équipes (1–3 personnes). Le dépôt contient modèles et scripts réutilisables : https://github.com/xryv/DoneSpec.

Conseils pragmatiques :

1) Prioriser un invariant à fort impact (livrable en 1–3 heures)
- Exemple : "artifact.json contient la clé tests avec length >= 1". Écrire spec + deux fixtures en 60–180 minutes.

2) Automatisation minimale et réutilisable
- Écrire un petit CLI Python (30–120 lignes) qui lit JSON et retourne exit 0/1. Réutiliser localement et en CI.

Commande d'exemple :

```bash
python3 tools/donespec_validator.py --spec specs/my_spec.yaml --input artifact.json
```

3) Canary court et métriques simples
- Lancer le check en mode optionnel pendant 7 jours (168 heures). Viser ~100 exécutions pour estimer stabilité.
- Mesurer : pass‑rate (%), latence moyenne (ms). Basculer en enforcement si pass‑rate ≥95% sur ~100 runs.

4) Règles de simplicité
- Garder la spec <50 lignes. Limiter les messages d'erreur à ≤200 tokens pour faciliter lecture.
- Conserver artefacts 30 jours pour rejouer et debug.

Checklist rapide pour un solo founder :
- [ ] Cloner https://github.com/xryv/DoneSpec
- [ ] Écrire specs/my_spec.yaml (1 invariant) et fixtures/good.json + fixtures/bad.json
- [ ] Ajouter un job CI optionnel pour 7 jours et collecter ~100 runs
- [ ] Automatiser un petit rapport : pass‑rate (%), latence (ms), count failures

## Notes techniques (optionnel)

- Principe : écrire la sortie de l'agent sur disque pour déterminisme et rejouabilité (référence : https://github.com/xryv/DoneSpec).
- Intégration : in‑process (lib importée) ou out‑of‑process (CLI). Les deux doivent produire un exit code clair (0/1).
- Tests : corpus de fixtures (objectif 10+) pour mesurer faux positifs/faux négatifs.

Boucle de test simple :

```bash
for f in fixtures/*.json; do
  python3 tools/donespec_validator.py --spec specs/my_spec.yaml --input "$f" || echo "FAILED: $f"
done
```

Logging minimal recommandé : horodatage ISO, verdict PASS/FAIL, raison courte (<200 tokens). Voir exemples dans le dépôt : https://github.com/xryv/DoneSpec.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse : le dépôt DoneSpec (https://github.com/xryv/DoneSpec) fournit exemples et implémentation de référence pour la validation déterministe ; ce guide s'appuie sur ce modèle.
- Hypothèse de temps : contrôle minimal 1–3 heures ; spec robuste 4–12 heures.
- Hypothèse de canary : 7 jours (168 heures) et cible ≈100 runs avant enforcement.
- Hypothèse de seuils : passer en exigence si pass‑rate ≥95% sur ~100 runs ; rollback si pass‑rate <90%.
- Hypothèse de latence : checks légers 200–2000 ms ; limite lourde 300000 ms (5 minutes).
- Hypothèse de coût CI : ~£0.10–£5.00 pour un petit pilote selon fréquence.

### Risques / mitigations

- Risque : enforcement prématuré → friction. Mitigation : canary 7 jours, mesurer pass‑rate et latence avant exigence.
- Risque : dérive de la spec quand l'agent évolue. Mitigation : revue formelle des changements, changelog et approbation d'un propriétaire.
- Risque : coût CI élevé / ralentissement des PRs. Mitigation : timeout par check (ex. 300000 ms), déplacer checks lourds en nightly ou par lot.
- Risque : faux positifs/négatifs élevés. Mitigation : enrichir fixtures (viser 10+), ajouter invariants robustes (clés requises, checksums), normaliser sorties.

### Prochaines etapes

Court terme (1–7 jours)
- Cloner https://github.com/xryv/DoneSpec, écrire une spec minimale, créer 2 fixtures, ajouter un job CI optionnel et lancer un canary (7 jours / 168 heures).

Moyen terme (2–4 semaines)
- Étendre les fixtures à 10+, affiner la spec, ajouter un tableau de bord simple pour pass‑rate (%), latence (ms) et count failures (count).

Long terme (1–3 mois)
- Rendre les checks DoneSpec requis après stabilisation (ex. ≥95% sur ~100 runs), maintenir un changelog et automatiser rollback si pass‑rate <90%.

Référence finale : https://github.com/xryv/DoneSpec
