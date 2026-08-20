---
title: "Wasted Cycles — profileur local (wall‑clock) pour les blocages machine dans les boucles d'agents IA"
date: "2026-08-20"
excerpt: "Un outil local-first qui mesure le temps écoulé (wall‑clock) pour identifier ce qui bloque les boucles d'agents IA (builds, tests, CI, containers). Binaire vérifié par checksum, export JSON, support GitHub Actions pour latences de workflow."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-20-wasted-cycles-local-wall-clock-profiler-for-machine-blocking-stalls-in-ai-coding-agent-loops.jpg"
region: "UK"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 30
editorialTemplate: "NEWS"
tags:
  - "profilage"
  - "CI"
  - "GitHub Actions"
  - "devops"
  - "agents IA"
  - "wasted-cycles"
sources:
  - "https://zozo123.github.io/wasted-cycles/"
---

## TL;DR en langage simple

- Quoi : Wasted Cycles est un outil local qui mesure le temps écoulé réel (wall‑clock) pour repérer où la machine reste bloquée (builds, tests, CI, conteneurs, paquets, sous‑agents). (Source : https://zozo123.github.io/wasted-cycles/)
- Pourquoi : il sépare le temps machine du temps d'attente humain et donne une petite liste classée des bloqueurs à corriger en priorité. (Source : https://zozo123.github.io/wasted-cycles/)
- Installer et lancer en 2 commandes :

```sh
curl -fsSL https://zozo123.github.io/cycles | sh   # installe (checksum vérifié)
wasted-cycles --days 7                             # profiler 7 jours
```

Exemple concret rapide (démo publique) : AGENT LOOP = 4h59m ; BLOCKED = 2h05m ; Build = 1h06m ; Tests = 47m. Ces chiffres indiquent ce qu'il faut prioriser. (Source : https://zozo123.github.io/wasted-cycles/)

Checklist immédiate :
- [ ] vérifier la checksum du binaire avant exécution
- [ ] lancer `wasted-cycles --days 7` et exporter le JSON
- [ ] noter AGENT LOOP et BLOCKED depuis BREAKDOWN

Méthodologie courte : l'outil mesure le wall‑clock, exclut le temps humain et classe les blocages selon les événements et commandes. (Source : https://zozo123.github.io/wasted-cycles/)

## Ce qui a change

- Distribution : installateur avec binaire checksum‑vérifié, exécution depuis un répertoire temporaire, pas de compte requis, support du pinning de version. (Source : https://zozo123.github.io/wasted-cycles/)
- Métrique : le signal central est le wall‑clock (temps écoulé réel). L'attente humaine est exclue. (Source : https://zozo123.github.io/wasted-cycles/)
- Classification : les blocages sont répartis en builds, tests, CI, conteneurs, paquets et sous‑agents. (Source : https://zozo123.github.io/wasted-cycles/)
- GitHub Actions : commande dédiée pour inspecter runs complétés, queue delay, median, p95, temps non‑terminé et workflows consommant le plus d'élapsed time. (Source : https://zozo123.github.io/wasted-cycles/)
- Sessions : gaps > 2h démarrent une nouvelle session ; gaps courts plafonnés à 30 minutes et apparaissent en inférence dans le JSON. (Source : https://zozo123.github.io/wasted-cycles/)

## Pourquoi c'est important (pour les vraies equipes)

- Signal utile : vous évitez d'optimiser des métriques non pertinentes (par ex. temps d'une revue humaine). Wasted Cycles montre le temps machine réellement perdu. (Source : https://zozo123.github.io/wasted-cycles/)
- Priorisation claire : corrigez d'abord le poste qui consomme le plus de machine‑time (ex. un build de 1h06m plutôt qu'une micro‑amélioration). (Source : https://zozo123.github.io/wasted-cycles/)
- Reproductibilité : export JSON conservable comme baseline avant/après. Utilisez la même fenêtre `--days` pour comparer. (Source : https://zozo123.github.io/wasted-cycles/)

Chiffres démonstration (extrait public) : AGENT LOOP 4h59m ; BLOCKED 2h05m ; Model work 1h28m ; Build 1h06m ; Tests 47m. Ces valeurs montrent l'ordre de priorité. (Source : https://zozo123.github.io/wasted-cycles/)

## Exemple concret: a quoi cela ressemble en pratique

1) Audit initial (30–60 minutes)

```sh
wasted-cycles --days 30
```

- Ouvrez BREAKDOWN dans l'export JSON. Relevez AGENT LOOP et BLOCKED. (Source : https://zozo123.github.io/wasted-cycles/)

2) Interprétation simple
- Si Build = 1h06m et Tests = 47m, commencez par réduire le build. Le classement BREAKDOWN montre la priorité. (Source : https://zozo123.github.io/wasted-cycles/)
- Pour GitHub Actions, surveillez : QUEUE DELAY (ex. 0s), MEDIAN (ex. 38s), P95 (ex. 33m), WORKFLOW LATENCY (ex. 22h29m) et taux de succès (ex. 84/84 → 100%). (Source : https://zozo123.github.io/wasted-cycles/)

3) Boucle rapide « changer → mesurer »
- Appliquez un correctif ciblé (cache dépendances, pinner image, paralléliser tests).
- Réexécutez avec la même fenêtre (`--days`) et comparez les JSON.
- Conservez les exports comme preuve (artefacts CI, stockage chiffré).

## Ce que les petites equipes et solos doivent faire maintenant

Actions concrètes pour fondateurs solo ou équipes ≤ 5. Chaque point est actionnable en 15–120 minutes.

1) Baseline simple (30–60 minutes)
- Vérifiez la checksum puis lancez `wasted-cycles --days 7`. Exporte le JSON. (Source : https://zozo123.github.io/wasted-cycles/)
- Objectif : obtenir AGENT LOOP et BLOCKED en baseline.

2) Choisir 1 correction faible‑risque (15–120 minutes)
- Exemples : activer le cache de dépendances, pinner une image de build, ou paralléliser une suite de tests lourde.
- Mesurez l'impact : visez une réduction de BLOCKED visible (par ex. 20–30%).

3) Automatisation minimale (30–90 minutes)
- Script CI ou cron : exécuter `wasted-cycles --days 7`, archiver le JSON (artéfact CI ou coffre chiffré).
- Utilisez ces exports pour prouver un gain et éviter les régressions.

4) Règle de prudence
- Limitez‑vous à 1–2 changements par semaine si vous êtes seul. Gardez un ticket par changement pour pouvoir rollback si nécessaire.

Checklist solo :
- [ ] Exécuter `wasted-cycles --days 7` (baseline)
- [ ] Créer 1 ticket avec le JSON baseline et le plan d'action
- [ ] Implémenter 1 correctif faible risque
- [ ] Re‑mesurer avec la même fenêtre et attacher le nouveau JSON

(Source : https://zozo123.github.io/wasted-cycles/)

## Angle regional (UK)

- Local par défaut : l'outil s'exécute localement et n'upload pas automatiquement les traces, utile pour les équipes UK qui veulent garder les données en interne. (Source : https://zozo123.github.io/wasted-cycles/)
- Conseil opérationnel UK : vérifier la checksum, exécuter dans un répertoire isolé et archiver les exports JSON dans un coffre auditable.

Checklist UK :
- [ ] vérifier la checksum avant exécution
- [ ] exécuter dans un répertoire temporaire isolé
- [ ] archiver les exports JSON dans un coffre interne
- [ ] consigner l'auteur et la date de l'audit

(Source : https://zozo123.github.io/wasted-cycles/)

## Comparatif US, UK, FR

| Juridiction | Priorité typique | Pourquoi Wasted Cycles aide | Premier pas recommandé |
|---|---:|---|---|
| US | coûts & vélocité dev | profiler le p95 des Actions et les runners pour réduire la latence de build | `wasted-cycles github owner/repo --days 30` (Source : https://zozo123.github.io/wasted-cycles/) |
| UK | confidentialité & contrôle op | binaire local + checksum évite uploads ; traces conservées localement | vérifier checksum & exécuter localement (Source : https://zozo123.github.io/wasted-cycles/) |
| FR / EU | conformité & revue juridique | exécution locale réduit les transferts de données | exécuter localement et archiver JSON pour audit (Source : https://zozo123.github.io/wasted-cycles/) |

Notes rapides : surveillez MEDIAN (ms → ex. 38s), P95 (ex. 33m), et WORKFLOW LATENCY total (ex. 22h29m) pour prioriser les améliorations. (Source : https://zozo123.github.io/wasted-cycles/)

## Notes techniques + checklist de la semaine

### Hypotheses / inconnues
- Les cibles opérationnelles (par ex. « réduire BLOCKED de 30% ») doivent être fixées localement ; l'outil fournit les mesures mais pas les seuils. (Source : https://zozo123.github.io/wasted-cycles/)
- Règles de session : gaps > 2h → nouvelle session ; gaps courts plafonnés à 30 min et visibles dans le JSON. (Source : https://zozo123.github.io/wasted-cycles/)
- Classification : se base sur champs d'événement et commandes exécutées ; les prompts collés dans les logs ne sont pas comptés. (Source : https://zozo123.github.io/wasted-cycles/)

### Risques / mitigations
- Risque : exécuter le binaire sans vérification de checksum. Mitigation : vérifier et archiver la checksum avant exécution. (Source : https://zozo123.github.io/wasted-cycles/)
- Risque : confondre wall‑clock et minutes facturées par un fournisseur CI. Mitigation : corréler wall‑clock (p.ex. 38s median, 33m p95) avec facturation si nécessaire.
- Risque : optimiser sur un échantillon bruité. Mitigation : utiliser la même fenêtre `--days` (ex. 7 ou 30 jours) avant/après.

### Prochaines etapes
- [ ] Vérifier la checksum et lancer `wasted-cycles --days 7`. Sauvegarder l'export JSON. (Source : https://zozo123.github.io/wasted-cycles/)
- [ ] Si vous utilisez GitHub Actions : exécuter `wasted-cycles github owner/repo --days 30` et noter QUEUE DELAY, MEDIAN (ex. 38s), P95 (ex. 33m), WORKFLOW LATENCY (ex. 22h29m) et taux de succès (ex. 84/84 → 100%). (Source : https://zozo123.github.io/wasted-cycles/)
- [ ] Créer un ticket de remediation avec le JSON baseline.
- [ ] Implémenter le changement, re‑mesurer avec la même fenêtre et vérifier la différence dans AGENT LOOP / BLOCKED.

Si vous voulez, je peux fournir un template de ticket minimal ou un petit script pour vérifier la checksum et archiver automatiquement les exports JSON.
