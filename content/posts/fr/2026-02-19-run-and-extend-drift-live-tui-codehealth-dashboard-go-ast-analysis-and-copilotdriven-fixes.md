---
title: "Exécuter et étendre Drift : TUI de santé du code en temps réel, analyse AST Go et corrections pilotées par Copilot"
date: "2026-02-19"
excerpt: "Guide pratique pas à pas pour installer et exécuter le tableau de bord terminal live de Drift, inspecter l'analyseur AST Go, tester le flux interactif « drift fix » piloté par Copilot et ajouter une étape CI qui publie des rapports de santé."
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "drift"
  - "go"
  - "tui"
  - "code-health"
  - "copilot"
  - "ci"
  - "monitoring"
  - "dev-tools"
sources:
  - "https://drift.marquis.codes/"
---

## TL;DR builders

Ce guide concis (pour développeurs et fondateurs) explique comment installer et lancer drift localement, obtenir le TUI live avec sparklines sur 10 commits, déclencher des suggestions Copilot et intégrer une étape CI basique (source: https://drift.marquis.codes/).

Points clés extraits du snapshot officiel (chiffres visibles dans la doc):

- Installation en 1 commande (Homebrew) et «Three commands. Zero config.»
- Analyse full health et TUI live avec une fenêtre glissante de 10 commits (exemple affiché: 80x24 terminal, HEAD +12%).
- Health Score exemple: 78/100; détection de 3 issues; complexité d'une fonction montrée: 25; dépendances 42/42 up to date (source: https://drift.marquis.codes/).

Remarque méthodologique : les faits sont tirés du snapshot public référencé ci‑dessus. Si un détail n'y figure pas, il est remonté dans la section Hypothèses / inconnues.

```bash
# installation rapide (extrait montré)
brew install greatnessinabox/tap/drift

# analyse initiale
drift analyze

# monitor TUI en local
drift monitor
```

```yaml
# exemple basique de job CI (illustratif)
name: drift-analyze
on: [push, pull_request]
jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install drift
        run: brew install greatnessinabox/tap/drift || true
      - name: Run drift analyze
        run: drift analyze --output json > drift-report.json
```

## Objectif et resultat attendu

Objectif principal (source: https://drift.marquis.codes/): faire tourner drift localement, obtenir un Health Score et visualiser les sparklines sur 10 commits, puis tester un flux interactif de corrections via l'intégration Copilot.

Résultats mesurables attendus (artefacts observables dans la sortie du CLI):

- TUI opérationnel affichant un Health Score (ex.: 78/100) et sparklines couvrant 10 commits.
- Le CLI liste des issues (par ex. "Found 3 issue(s) to fix") et indique au moins un item de complexité (ex.: complexity: 25).
- Un artefact JSON produit par CI (drift-report.json) après un drift analyze (exécution illustrée sur la page: https://drift.marquis.codes/).

Livrables de vérification rapide : capture d'écran du TUI (80x24 exemple), fichier drift-report.json, trace d'exécution montrant "42/42 up to date" pour les dépendances (source: https://drift.marquis.codes/).

## Stack et prerequis

Prérequis extraits du snapshot (source: https://drift.marquis.codes/):

- Homebrew (ou go toolchain si compilation locale), Git, accès au dépôt à analyser.
- (Optionnel) GitHub Copilot CLI pour les flux interactifs / agents Copilot mentionnés sur la page.
- Runner CI (ex. GitHub Actions) pour automatiser drift analyze dans PRs.

Langages auto‑détectés (mentionnés dans le snapshot): Go, TypeScript, Python, Rust, Java, Ruby, PHP, C# (auto-detect shown on https://drift.marquis.codes/).

Registres consultés pour Dependency Freshness (extrait): Go proxy, npm, PyPI, crates.io, Maven Central, RubyGems, Packagist, NuGet (exemple: 42/42 up to date) — source: https://drift.marquis.codes/.

Sécurité / permissions : stocker tokens Copilot et secrets CI en secrets chiffrés et limiter les scopes; rotation régulière recommandée (pratique générale, voir page: https://drift.marquis.codes/).

## Implementation pas a pas

Étapes essentielles (sourcé: https://drift.marquis.codes/):

1) Récupérer et installer

```bash
git clone https://github.com/greatnessinabox/drift.git
cd drift
brew install greatnessinabox/tap/drift
```

2) Lancer une analyse et le monitor

```bash
# analyse complète (CLI auto-detecte le langage)
drift analyze
# ouvrir le TUI live
drift monitor
```

3) Vérifier les sorties clés à observer (exemples tirés du snapshot: 78/100 Health Score, 10 commits de sparklines, "Found 3 issue(s) to fix", complexité 25). Source: https://drift.marquis.codes/.

4) Flux interactif Copilot (démo dans le snapshot)

```bash
# lancer le flow interactif présenté
drift fix
copilot --agent drift-dev "suggest refactoring for Update()"
```

Note : le snapshot montre l'utilisation d'agents Copilot et la question de confirmation "Apply this suggestion? [y/N/s]" ; l'usage réel des agents/chemins d'authentification est organisé en pratique (source: https://drift.marquis.codes/). Les détails opérationnels d'authentification sont listés dans Hypothèses / inconnues.

5) Automatisation CI (extrait et illustratif; la page mentionne l'intégration CI/Actions)

- exécuter drift analyze dans un job CI et archiver drift-report.json pour analyse de tendance (exemple YAML ci‑dessus). Source: https://drift.marquis.codes/.

## Architecture de reference

Composants identifiés dans le snapshot (source: https://drift.marquis.codes/):

- CLI / TUI : exécution locale, monitor live (exemple terminal 80x24), sparklines sur 10 commits.
- Analyseurs par langage : full AST pour Go; heuristiques pour TS/Py/Rs/Java/Rb/PHP/C#.
- Agent Copilot CLI : utilisé pour suggestions et agents personnalisés (ex.: "copilot --agent drift-dev ...").
- Intégration CI : exécutions en PR, export JSON.

Tableau de référence — pondérations des métriques (extrait du snapshot):

| Métrique                  | Poids | Remarque (extrait)          |
|---------------------------|-------:|-----------------------------|
| Cyclomatic Complexity     |    30% | AST full pour Go; heuristique pour d'autres |
| Dependency Freshness      |    20% | vérifications contre registres (npm, PyPI, etc.) |
| Architecture Boundaries   |    20% | règles d'import (ex.: api -> db blocked) |
| Dead Code Detection       |    15% | exports sans appel détectés |

Flux de données (texte) : modification → analyseur → stockage métriques (fenêtre glissante 10 commits) → TUI sparklines; suggestions via Copilot CLI → revue humaine → PR (source: https://drift.marquis.codes/).

## Vue fondateur: ROI et adoption

Synthèse business (extrait du snapshot: https://drift.marquis.codes/):

- Détection précoce de régressions et visibilité continue (ex.: HEAD +12% sur 10 commits, Health Score 78/100). Ces indicateurs aident à éviter dettes techniques et coûts de refactor (mesure qualitative présentée sur la page: https://drift.marquis.codes/).
- Accélération du flux PR via suggestions Copilot (ex.: "Found 3 issue(s) to fix"). L'automatisation réduit lead time si intégrée prudemment.

Phases d'adoption recommandées (contrôlées): pilote (1–2 dépôts), opt‑in équipe, autorisation limitée des PR automatiques pour corrections triviales, revue manuelle pour items à complexité élevée (ex.: complexity >= 25 selon la sortie example). Source: https://drift.marquis.codes/.

KPI simples à suivre : Health Score (0–100), tendance sur 10 commits, nombre d'issues détectées (ex.: 3), % de dépendances à jour (ex.: 42/42 = 100%), temps détection→PR (mesurer en heures/jours en pratique).

## Pannes frequentes et debugging

Guides rapides de diagnostic (référence fonctionnalités sur https://drift.marquis.codes/):

1) Erreurs Copilot / drift fix

Symptôme : échec de "drift fix" ou code de sortie non nul.

Diagnostic : exécuter la commande Copilot directement et collecter logs.

```bash
copilot --agent drift-dev "suggest refactoring for Update()" > copilot.log 2>&1
echo $? > copilot.exitcode
```

Conserver drift-debug.log + copilot.log pour triage (source: https://drift.marquis.codes/).

2) Faux positifs / mismatches d'analyseurs

Symptôme : bruit important sur langages traités heuristiquement (TS/Py/Rs/Java/Rb/PHP/C#) — Go dispose d'une AST complète selon le snapshot.

Mitigation : exclure chemins ou limiter règles; si nécessaire, réduire la sensibilité pour atteindre un taux d'alerte cible (p.ex. viser < 10 faux positifs / 100 vérifications dans un pilote).

3) Problèmes de Dependency Freshness

Symptôme : valeurs incohérentes pour "Dependency Freshness".

Diagnostic : vérifier accès réseau aux registres (Go proxy, npm, PyPI, crates.io, Maven Central, RubyGems, Packagist, NuGet). Exemple attendu dans la doc: 42/42 up to date (source: https://drift.marquis.codes/).

4) TUI qui n'affiche pas la fenêtre glissante

Symptôme : absence de sparklines sur 10 commits ou UI figée.

Diagnostic : redémarrer "drift monitor", vérifier que l'historique local contient au moins 10 commits, confirmer largeur/hauteur du terminal (exemple affiché: 80x24) (source: https://drift.marquis.codes/).

## Checklist production

- [ ] Installer drift via Homebrew et vérifier la commande "drift analyze" (vérifier Health Score affiché)
- [ ] Lancer "drift monitor" et capturer une image du TUI (ex.: 80x24)
- [ ] Exécuter "drift fix" en mode interactif et sauvegarder copilot.log
- [ ] Ajouter job CI qui exporte drift-report.json et stocke l'artefact pour 30 jours
- [ ] Définir seuils initiaux (ex.: blocker si Health Score < 60; alerte si complexité > 25)

### Hypotheses / inconnues

- L'implantation exacte du fichier d'agent (p.ex. .github/agents/drift-dev) n'est pas décrite textuellement dans le snapshot ; le snapshot montre l'usage d'agents Copilot mais pas le chemin exact. (source: https://drift.marquis.codes/)
- Le flux d'authentification complet pour Copilot CLI et la gestion multi‑compte n'apparaissent pas dans l'instantané et doivent être précisés en test.
- Les règles de gating automatiques (p.ex. appliquer automatiquement suggestions < 10 tokens ou coût < $X) ne sont pas spécifiées dans le snapshot et restent à définir par l'équipe.

### Risques / mitigations

- Risque : application automatique sans revue → Mitigation : feature flag OFF, blocage par règle de protection de branche.
- Risque : fuite de secrets (agents / tokens) → Mitigation : secrets chiffrés, scopes minimaux, rotation chaque 90 jours.
- Risque : bruit élevé (faux positifs) → Mitigation : canary sur 1 dépôt, régler seuils pour viser < 10 faux positifs / 100 vérifs.

### Prochaines etapes

1) Piloter sur 1 dépôt pendant 10 commits pour valider la fenêtre glissante et collecter les métriques (Health Score, sparklines, #issues).
2) Activer l'extraction JSON en CI (drift-report.json) et centraliser les artefacts pour analyse hebdomadaire.
3) Rédiger règles d'usage pour Copilot (seuils de complexité, revue humaine requise au-delà de 25) et verrouiller les tokens en secrets.

Référence principale : https://drift.marquis.codes/.
