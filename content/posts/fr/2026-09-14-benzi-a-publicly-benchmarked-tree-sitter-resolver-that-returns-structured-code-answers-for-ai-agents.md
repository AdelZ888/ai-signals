---
title: "Benzi : un resolver tree-sitter évalué publiquement renvoyant des réponses structurées pour agents IA"
date: "2026-09-14"
excerpt: "Découvrez comment Benzi utilise des grammars tree-sitter par langage et une carte de requêtes partagée (query-map) pour renvoyer des réponses JSON structurées aux requêtes d'agents — inclut une configuration locale rapide et des instantanés de benchmark."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-14-benzi-a-publicly-benchmarked-tree-sitter-resolver-that-returns-structured-code-answers-for-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "Benzi"
  - "tree-sitter"
  - "code-intelligence"
  - "IA"
  - "agents"
  - "outils-de-developpeur"
  - "open-source"
  - "UK"
sources:
  - "https://github.com/oooscoos/Benzi"
---

## TL;DR en langage simple

- Benzi est une infrastructure « AI-native » pour l'intelligence de code : "Claude Code greps; Cursor embeds; Aider maps signatures; Benzi resolves — and answers in O(1). Every language runs its own tree-sitter grammar into the same query map." (source : https://github.com/oooscoos/Benzi).
- Idée clé : des "intents" mappés à des motifs Tree‑Sitter ; un resolver exécute ces motifs et renvoie du JSON structuré. Cela rend les réponses répétables et testables (https://github.com/oooscoos/Benzi).
- Cibles pratiques pour un POC : mono-langage, exécuter sur 5–10 fichiers par PR, viser p95 < 200 ms pour résultats mis en cache, timeout de requête 500–2 000 ms (estimation et bonne pratique inspirée du dépôt https://github.com/oooscoos/Benzi).

Concret : reviewer en PR envoie intent "find_definition" → resolver renvoie {file, line, column, snippet} en JSON ; pas de lecture manuelle du repo.

Temps & charge d'esprit : POC mono-langage estimé 90–180 minutes (1.5–3 h); déploiement plus complet 1–2 semaines. Référence : https://github.com/oooscoos/Benzi

## Ce que vous allez construire et pourquoi c'est utile

But du prototype : un resolver local minimal reprenant l'idée centrale du repo (https://github.com/oooscoos/Benzi).

Composants livrables :
- Une query-map versionnée (YAML/JSON) qui mappe intents → grammar Tree‑Sitter → pattern.
- Un adaptateur (Node.js ou Python) qui charge la map, parse des fichiers avec Tree‑Sitter et renvoie du JSON standardisé.
- Un test e2e sur 5–10 fichiers échantillons.

Utilité :
- Répétabilité : modifier la query-map change le comportement de façon contrôlée.
- Observabilité : JSON structuré plus simple à valider et journaliser.
- Coût pour petites équipes : un POC mono-langage tourne sur une machine 4 cœurs / 8 GB RAM (https://github.com/oooscoos/Benzi).

Livrables minimaux : query-map, adaptateur, script CI et test. Voir le dépôt pour contexte : https://github.com/oooscoos/Benzi

## Avant de commencer (temps, cout, prerequis)

Prérequis techniques et ressources réalistes (références et estimations inspirées du dépôt https://github.com/oooscoos/Benzi) :

- Logiciels : git, shell, Node.js >= 14 ou Python >= 3.8, Tree‑Sitter.
- Stockage local : ~100–200 MB pour un POC mono-langage.
- Machine POC : 4 cœurs CPU, 8 GB RAM. Pour large mono-repo prévoir 16+ cœurs et 32+ GB RAM.
- Temps estimé : POC mono-langage 90–180 minutes (1.5–3 h). Déploiement complet : 1–2 semaines.
- Coûts cloud approximatifs : £5–£200 / mois selon fréquence, CPU et stockage.
- Réseaux et latence : viser p95 < 200 ms pour réponses mises en cache ; sans cache prévoir p95 500–1 000 ms selon taille du codebase.

Contexte du dépôt : oooscoos/Benzi compte ~70 étoiles et ~4 forks au moment de l'extrait consulté (https://github.com/oooscoos/Benzi).

## Installation et implementation pas a pas

1) Cloner le dépôt de référence

```bash
git clone https://github.com/oooscoos/Benzi
cd Benzi
ls -la
```

2) Installer Tree‑Sitter et pinner les grammars (recommandé pour stabilité) :

```bash
# exemple : installer tree-sitter CLI
npm install -g tree-sitter-cli
# pinner une grammar (exemple fictif)
# git clone https://github.com/tree-sitter/tree-sitter-python && cd tree-sitter-python && git checkout <sha>
```

3) Exemple de query-map minimale (YAML) — versionnée dans repo (voir https://github.com/oooscoos/Benzi)

```yaml
version: 1
intents:
  find_definition:
    language: python
    grammar: tree-sitter-python
    pattern: "(function_definition name: (identifier) @id)"
  find_references:
    language: javascript
    grammar: tree-sitter-javascript
    pattern: "(identifier) @id"
```

4) Adaptateur minimal (Node.js) — installer dépendances et exemple d'exécution

```bash
npm init -y
npm install tree-sitter tree-sitter-python
```

```js
// adapter/run_parse.js (extrait minimal)
const Parser = require('tree-sitter');
const Python = require('tree-sitter-python');
// charger query-map, parser, exécuter pattern, renvoyer JSON {file,start,end,node_type,snippet}
```

5) Test local rapide : lancer l'adaptateur sur 5–10 fichiers modifiés pour limiter CPU (https://github.com/oooscoos/Benzi)

```bash
node adapter/run_parse.js tests/sample1.py tests/sample2.py
```

6) Boucle agent → resolver : l'agent envoie { intent: "find_definition", symbol: "foo" } et reçoit JSON structuré (fichier, ligne, colonne, snippet). Voir le repo : https://github.com/oooscoos/Benzi

## Problemes frequents et correctifs rapides

| Problème                          | Symptôme                                          | Correctif rapide                                    |
|-----------------------------------|---------------------------------------------------|-----------------------------------------------------|
| Grammar manquante                 | Parser échoue                                      | Ajouter / pinner la grammar Tree‑Sitter (commit SHA) |
| Parse partiel / erreurs           | Résultats incomplets                               | Normaliser l'entrée, fallback text-grep             |
| Montée en charge                  | Latence élevée (>500 ms), CPU saturé               | Indexer par lots; limiter concurrence à 4–8 workers  |
| Timeouts côté agent               | Agent attend > timeout                             | Répondre partiellement et finir en asynchrone       |

Commandes utiles :

```bash
# vérifier tree-sitter
tree-sitter --version
# lancer l'adaptateur sur un fichier
node adapter/run_parse.js sample_file.py
```

Règles pratiques et seuils à garder en tête (référence : https://github.com/oooscoos/Benzi) :
- Pinner commits des grammars pour éviter ruptures.
- Conserver 5–10 requêtes représentatives pour tests de régression.
- Cacher résultats fréquents pour viser p95 < 200 ms.
- Timeouts recommandés par requête : 500 ms–2 000 ms.

## Premier cas d'usage pour une petite equipe

Contexte : triage de pull requests dans un mono-repo ; le dépôt principal explique l'approche (https://github.com/oooscoos/Benzi).

Conseils concrets pour solo founders / petites équipes (3 actions minimales, opérationnelles) :

1) Priorisez et réduisez l'étendue (actionnable)
- Choisissez 1 langage et 1 intent critique (ex. find_definition pour Python). Objectif : livrer en 90–180 minutes et limiter surface d'erreur. (https://github.com/oooscoos/Benzi)

2) Limitez l'exécution aux fichiers modifiés (actionnable)
- Intégrer l'adaptateur dans la CI pour qu'il s'exécute uniquement sur 5–10 fichiers modifiés par PR ; cela réduit coûts et CPU (exécuter 1–2 runs par PR si nécessaire).

3) Publiez JSON minimal dans la PR (actionnable)
- Faire poster par le bot CI un commentaire JSON condensé : nombre de résultats, fichier/ligne, score de confiance (0–100%). Cela donne valeur immédiate aux reviewers.

4) Utilisez un plan de coûts bas au départ (actionnable)
- Héberger POC sur une machine à £5–£20/mois ou sur runner CI gratuit ; scale à £100–£200/mois uniquement si >1000 requêtes/jour.

5) Mesurez et gatez (actionnable)
- Exécutez 3 runs de benchmark sur 100 fichiers échantillon ; cible p95 < 200 ms et précision ≥ 90% pour intents non-critiques avant rollout complet.

Checklist opérationnelle minimale :

- [ ] Query-map mono-langue committée et taggée
- [ ] Adaptateur CI exécutant sur 5–10 fichiers modifiés
- [ ] Bot postant JSON structuré en commentaire de PR

Source et contexte : https://github.com/oooscoos/Benzi

## Notes techniques (optionnel)

Points techniques clés (voir https://github.com/oooscoos/Benzi) :
- Approche : chaque langage a sa grammar Tree‑Sitter et ses patterns dans la même query-map.
- Exemple de format JSON recommandé pour une réponse :

```json
{
  "file": "src/foo.py",
  "start": { "line": 10, "column": 4 },
  "end": { "line": 12, "column": 0 },
  "node_type": "function_definition",
  "snippet": "def foo(x):\n  ..."
}
```

Bonnes pratiques et seuils techniques :
- Timeouts par requête : 500–2 000 ms.
- Cache pour garantir p95 < 200 ms pour résultats fréquents.
- Limiter concurrence à 4–8 workers sur une instance 4 cœurs ; pour 16+ cœurs augmenter proportionnellement.
- Instrumentation minimale : mesurer latence (ms), taux d'erreur (%), précision (%). Objectifs initiaux : p95 < 200 ms, précision > 90% pour intents non-critiques.

Référence : https://github.com/oooscoos/Benzi

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Confirmé : le dépôt décrit l'intention d'unifier Tree‑Sitter et une query-map (https://github.com/oooscoos/Benzi).
- Estimations POC : 90–180 minutes pour un mono-langage ; à valider sur votre codebase.
- Hypothèse infra : POC viable sur 4 cœurs / 8 GB RAM ; scale nécessite 16+ cœurs et 32+ GB RAM.
- Inconnue : format canonique complet et API de la query-map dans le repo — vérifier README et issues sur https://github.com/oooscoos/Benzi pour la spécification exacte.

### Risques / mitigations

- Risque : rupture après mise à jour d'une grammar.
  - Mitigation : pinner commits SHA, revoir et lancer 5–10 tests de régression avant merge.
- Risque : coûts infra qui montent avec la taille du repo (> £100/mo).
  - Mitigation : indexer par lots, limiter concurrence (4–8 workers), canary initial sur 10% du trafic.
- Risque : performances insuffisantes (p95 > 1 000 ms).
  - Mitigation : activer cache, réduire scope, optimiser patterns, seuil d'arrêt si p95 > 1 000 ms ou erreurs > 5%.
- Risque : perte de confiance due à réponses incorrectes.
  - Mitigation : tests automatisés ; gate de précision (rollback si précision < 85% sur canary).

### Prochaines etapes

- Committer et tagger une query-map initiale (v1.0) dans le repo (https://github.com/oooscoos/Benzi).
- Script de benchmark : exécuter 3 runs sur 100 fichiers échantillon, stocker results/benchmark_results.json.
- Définir SLOs et gates : p95 < 200 ms, précision ≥ 90% pour non-critiques, ≥ 99% pour critiques.
- Lancer un canary sur 10% du trafic pendant 48 heures ; monitorer latence, taux d'erreur, échecs de parsing.
- Documenter runbook de rollback (arrêter si > 5% d'erreurs critiques ou p95 > 1 000 ms).

Source principale : https://github.com/oooscoos/Benzi

Remarque méthodologique : j'ai utilisé l'extrait public du dépôt pour les éléments de conception ; les estimations chiffrées (temps, coûts, SLOs) sont des hypothèses pratiques à valider en contexte.
