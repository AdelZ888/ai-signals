---
title: "Voicetest : banc de tests open-source unifiant Retell, VAPI, LiveKit et Bland via un AgentGraph IR"
date: "2026-02-17"
excerpt: "Simulez des conversations sur Retell, VAPI, LiveKit et Bland avec Voicetest : normalisation des configs via un AgentGraph IR, notation par juges LLM et contrôles de conformité."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-17-voicetest-open-source-test-harness-that-unifies-retell-vapi-livekit-and-bland-via-an-agentgraph-ir.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "voicetest"
  - "voice-ai"
  - "testing"
  - "LLM"
  - "AgentGraph"
  - "CI/CD"
  - "DuckDB"
  - "LiveKit"
sources:
  - "https://news.ycombinator.com/item?id=47048811"
---

## TL;DR builders

Voicetest en une phrase (source) : une harness open‑source (Apache 2.0) pour tester des agents vocaux en important un AgentGraph depuis Retell, VAPI, LiveKit ou Bland (ou en définissant un graphe), en écrivant des scénarios, en simulant des conversations et en évaluant chaque tour par des juges LLM qui renvoient un score 0.0–1.0 avec une motivation écrite (source : https://news.ycombinator.com/item?id=47048811).

Composants cités dans le snapshot : UI web de démo, CLI, TUI, REST API, DuckDB pour la persistance et un environnement Docker Compose incluant LiveKit, Whisper (STT) et Kokoro (TTS). L'option « pass‑through » vers Claude Code pour l'évaluation des juges est mentionnée comme possibilité (source : https://news.ycombinator.com/item?id=47048811).

Quick start (commande extraite du snapshot) :

```bash
uv tool install voicetest
voicetest demo --serve
```

Remarque méthodologique : ce document se fonde sur le snapshot fourni (https://news.ycombinator.com/item?id=47048811) ; tout exemple opérationnel non explicitement cité est indiqué comme hypothèse dans la section finale.

## Objectif et resultat attendu

Objectif (d'après le snapshot) : disposer d'un banc de tests pour agents vocaux qui normalise différents formats via un AgentGraph IR pour exécuter des scénarios et produire des évaluations automatiques (score 0.0–1.0) par tour avec justification textuelle (source : https://news.ycombinator.com/item?id=47048811).

Résultats attendus :

- Un AgentGraph importé ou défini représentant le flux de l'agent (Retell, VAPI, LiveKit, Bland).
- Un jeu de scénarios décrivant conversations attendues et attentes par tour.
- Résultats persistés (DuckDB) avec scores et motifs des juges pour traçabilité.

Objectifs mesurables (à valider en pilote) : définir un pass_score par scénario et une règle CI pour gates (voir Hypothèses / inconnues), et consigner la baseline pendant une période pilote (source : https://news.ycombinator.com/item?id=47048811).

## Stack et prerequis

Éléments explicitement mentionnés dans le snapshot (source : https://news.ycombinator.com/item?id=47048811) :

- Interfaces : 3 types cités — CLI, TUI, REST API.
- UI de démo pour exploration locale.
- Persistance : DuckDB.
- Dev environment : Docker Compose incluant LiveKit, Whisper STT, Kokoro TTS.
- CI/CD : mention de GitHub Actions pour intégration.
- Option d'évaluation : pass‑through vers Claude Code (pour éviter la gestion multi‑clefs).

Prérequis pratiques (à préparer avant la démo) : Git, Docker/Docker Compose, uv tool (pour installer l'outil), navigateur moderne, espace disque pour DuckDB. (source : https://news.ycombinator.com/item?id=47048811)

## Implementation pas a pas

Les étapes suivantes combinent le quick start réel cité dans le snapshot et des étapes d'usage courantes. Les commandes figurant dans le snapshot sont indiquées ; les étapes d'intégration sont proposées comme guide d'implémentation.

1. Cloner le dépôt officiel et inspecter la doc :
   - git clone https://github.com/voicetestdev/voicetest
   - lire README et dossier demo (source : https://news.ycombinator.com/item?id=47048811).
2. Installer l'outil via uv tool (commande extraite du snapshot) :

   ```bash
   uv tool install voicetest
   voicetest demo --serve
   ```

   Cela doit lancer une UI de démonstration locale (localhost) selon l'auteur (source : https://news.ycombinator.com/item?id=47048811).
3. Lancer l'environnement Docker Compose fourni pour avoir LiveKit, Whisper et Kokoro en local (si vous utilisez la démo fournie) : vérifier docker-compose.yml dans le repo (source : https://news.ycombinator.com/item?id=47048811).
4. Importer ou définir un AgentGraph : utiliser l'abstraction AgentGraph IR pour convertir du format Retell/VAPI/LiveKit/Bland vers l'IR (fonctionnalité décrite dans le snapshot) et sauvegarder agent_graph.json (source : https://news.ycombinator.com/item?id=47048811).
5. Écrire un scénario de test par flux (exemple de YAML fourni ici comme modèle — HYPOTHÈSE) :

```yaml
name: billing_flow_smoke
pass_score: 0.80
turns:
  - user: "What is my current balance?"
    expect: "agent-provide-balance"
  - user: "How do I pay my bill?"
    expect: "agent-provide-payments-info"
```

6. Exécuter la suite de scénarios en local et persister les résultats (exemple d'exécution hypothétique) :

```bash
voicetest run --scenario tests/scenarios/sample_scenario.yaml \
  --agent agent_graph.json \
  --output results/voicetest.db
```

   Les résultats doivent inclure scores par tour, justifications du juge et métadonnées (DuckDB mentionné comme store dans le snapshot) (source : https://news.ycombinator.com/item?id=47048811).
7. Intégrer en CI : ajouter un job GitHub Actions qui lance voicetest et exporte les résultats. Stocker clefs LLM en secrets et considérer le pass‑through Claude Code si pertinent (source : https://news.ycombinator.com/item?id=47048811).
8. Itérer : ajuster scénarios, seuils d'acceptation, et juges selon les résultats de la période pilote.

## Architecture de reference

L'AgentGraph IR est la clé — il normalise les configurations des plateformes listées pour permettre des tests uniformes (source : https://news.ycombinator.com/item?id=47048811).

| Composant        | Rôle principal                                      | Source citée |
|------------------|----------------------------------------------------|--------------|
| AgentGraph IR    | Représentation intermédiaire et conversion entre formats (Retell, VAPI, LiveKit, Bland) | https://news.ycombinator.com/item?id=47048811 |
| Voicetest core   | Simulateur de conversation + orchestration des juges LLM | https://news.ycombinator.com/item?id=47048811 |
| Judge backend    | LLM qui renvoie score 0.0–1.0 et justification      | https://news.ycombinator.com/item?id=47048811 |
| STT/TTS          | Whisper (STT) / Kokoro (TTS) en dev compose        | https://news.ycombinator.com/item?id=47048811 |
| Persistance      | DuckDB pour stocker runs et métadonnées             | https://news.ycombinator.com/item?id=47048811 |
| CI               | GitHub Actions pour intégrer les runs en pipeline  | https://news.ycombinator.com/item?id=47048811 |

Conseil opératif : utiliser le docker compose fourni pour relier LiveKit, Whisper, Kokoro, le core et DuckDB, puis ajouter un job CI qui exécute voicetest et publie les résultats.

## Vue fondateur: ROI et adoption

Arguments alignés avec le snapshot (https://news.ycombinator.com/item?id=47048811) :

- Automatisation de QA vocale — réduction des tests manuels où les ingénieurs « appellent et écoutent ». Voicetest permet d'automatiser via scénarios et juges LLM (source : https://news.ycombinator.com/item?id=47048811).
- Normalisation multi‑plateforme grâce à l'AgentGraph IR : diminue la duplication des suites de tests quand vous déployez sur plusieurs plateformes.
- Intégration CI (GitHub Actions) : possibilité d'instaurer des gates pour prévenir les régressions avant production (source : https://news.ycombinator.com/item?id=47048811).

Parcours d'adoption recommandé : exploration locale → pilote (agent critique) → soft CI gate → extension. Mesurer gains en % de réduction de QA manuelle et nombre de régressions détectées automatiquement pendant la phase pilote (valider chiffres en pilote — source : https://news.ycombinator.com/item?id=47048811).

## Pannes frequentes et debugging

Modes d'échec identifiés et actions pratiques (inspirés du snapshot et des pratiques sur ces stacks) :

- Import AgentGraph incorrect : vérifier le fichier agent_graph.json et les logs de conversion. Reproduire localement avec la même version du repo (source : https://news.ycombinator.com/item?id=47048811).
- Variance des juges / hallucinations : archiver les réponses brutes du juge, comparer versions d'API LLM, envisager pass‑through Claude Code si la licence le permet (option mentionnée dans le snapshot) (source : https://news.ycombinator.com/item?id=47048811).
- STT/TTS (Whisper/Kokoro) : consulter logs des conteneurs Docker Compose et rejouer échantillons audio via la TUI fournie (source : https://news.ycombinator.com/item?id=47048811).
- Flaky CI : isoler scénarios instables et utiliser quarantaine + retries contrôlés dans GitHub Actions (source : https://news.ycombinator.com/item?id=47048811).

Checklist rapide de debug (conseil pratique) : reproduire localement, capturer audio brut et sortie brute du juge, comparer 3 runs pour variabilité, archiver artifacts pour postmortem.

## Checklist production

(source : https://news.ycombinator.com/item?id=47048811)

- [ ] Cloner le dépôt officiel et lancer la demo locale (uv tool + voicetest demo --serve).
- [ ] Valider que DuckDB stocke les résultats et que la UI montre les runs.
- [ ] Importer au moins 1 AgentGraph représentatif (Retell/VAPI/LiveKit/Bland) et exécuter un scénario smoke.
- [ ] Configurer un job GitHub Actions en mode soft‑gate (logs + export de résultats), stocker clefs en secrets.
- [ ] Collecter baseline sur période pilote avant tout hard gate (voir Hypothèses / inconnues).

### Hypotheses / inconnues

- Seuils opérationnels recommandés (HYPOTHÈSES à valider en pilote) : pass_score initial = 0.80 (80%), canary sur 5% du trafic, période pilote = 14 jours (2 semaines), exiger 3 runs comparables avant promotion, temps d'attente STT/TTS timeout = 5 000 ms, retry = 2 tentatives supplémentaires, analyser dérive si >10% de delta inter‑run. Ces chiffres sont des propositions d'ingénierie et ne figurent pas dans le snapshot (source contextuelle : https://news.ycombinator.com/item?id=47048811).
- Exemple de commandes détaillées (voicetest run ...) et YAML fournis plus haut sont des modèles — vérifier la doc officielle du projet pour la syntaxe exacte (https://news.ycombinator.com/item?id=47048811).

### Risques / mitigations

- Risque : variance élevée des scores des juges → Mitigation : journaliser réponses brutes, réduire température, exiger multipleruns, ou utiliser Claude Code pass‑through.
- Risque : STT/TTS instables en charge → Mitigation : réglage des timeouts (ex. 5 000 ms) et des retries (ex. 2), scaler ou basculer sur service managé.
- Risque : fuite de clefs LLM → Mitigation : stocker en gestionnaire de secrets CI, limiter accès et favoriser pass‑through centralisé quand possible.

### Prochaines etapes

- Cloner le dépôt et lancer la demo locale immédiatement (uv tool install + voicetest demo --serve) (source : https://news.ycombinator.com/item?id=47048811).
- Piloter un agent critique pendant 14 jours pour collecter baseline (scores moyens, taux d'échec par tour, nombre de régressions détectées automatiquement).
- Valider et affiner thresholds (pass_score, pourcentage canary) puis convertir soft‑gate en hard‑gate selon résultats.

Références : snapshot Hacker News (https://news.ycombinator.com/item?id=47048811) ; repo et documentation officiels mentionnés dans le snapshot (https://github.com/voicetestdev/voicetest, https://voicetest.dev).
