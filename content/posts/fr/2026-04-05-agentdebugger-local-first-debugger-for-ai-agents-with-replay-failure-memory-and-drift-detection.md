---
title: "agent_debugger : débogueur local pour agents IA avec replay, mémoire d'échecs et détection de dérive"
date: "2026-04-05"
excerpt: "Guide concis en français (contexte UK) pour démarrer agent_debugger localement : capture et relecture de sessions d'agent, indexation des échecs récurrents, et mise en évidence intelligente des signaux et de la dérive. Référez-vous au dépôt pour les commandes et schémas exacts."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-05-agentdebugger-local-first-debugger-for-ai-agents-with-replay-failure-memory-and-drift-detection.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "agent_debugger"
  - "débogage"
  - "IA"
  - "local-first"
  - "replay"
  - "détection-de-dérive"
  - "mémoire-d'échecs"
sources:
  - "https://github.com/acailic/agent_debugger"
---

## TL;DR en langage simple

- agent_debugger est un outil « local-first » pour déboguer des agents d'IA. Il fournit le replay des exécutions, une mémoire d'échecs indexée, des mises en évidence intelligentes et une détection de dérive (source : https://github.com/acailic/agent_debugger).
- Ce que vous obtiendrez rapidement : fichiers de replay horodatés, métadonnées indexées et une interface utilisateur (UI) locale pour parcourir les traces.
- Pourquoi l'utiliser : reproduire un bug sans relancer tout le système. Ça économise du temps et réduit les allers-retours entre développeurs et produit.

Exemple concret : un agent qui renvoie systématiquement un mauvais numéro de facture. Au lieu de lancer plusieurs tests manuels, vous ouvrez le replay horodaté, voyez la séquence de prompts et d'appels d'outils, et identifiez la requête qui a cassé le flux.

## Ce que vous allez construire et pourquoi c'est utile

Objectif : un petit workflow local pour capturer, rejouer et prioriser les échecs d'un agent.

Bénéfices concrets :
- Replays rejouables pour examiner un run précis. Vous pouvez reproduire et analyser un incident en quelques minutes.
- Mémoire d'échecs pour regrouper incidents similaires. Elle réduit le bruit durant le triage.
- Détection de dérive pour capter des variations du comportement dans le temps.

Tableau décisionnel (priorité / effort / valeur) :

| Fonctionnalité        | Priorité | Effort estimé | Valeur attendue |
|-----------------------|----------:|---------------:|----------------:|
| Capture de replays    | Haute    | 1–3 jours      | Haute (×2)      |
| Indexation d'échecs   | Moyenne  | 2–5 jours      | Moyenne (×1.5)  |
| Détection de dérive   | Basse→Moy.| 3–10 jours     | Haute après 50 samples |

(Source : description du projet — https://github.com/acailic/agent_debugger)

## Avant de commencer (temps, cout, prerequis)

Temps estimé :
- Bootstrap local : 1–2 heures pour cloner et démarrer.
- Baseline en staging : 3–7 jours pour collecter ~50 runs.
- Intégration CI (intégration continue) minimale : 1–2 semaines.

Coût attendu :
- Local : ~0–5 USD (CPU / disque personnel). Prévoir ~2 GB initialement.
- APIs payantes si utilisées : variable selon le fournisseur.

Prérequis techniques :
- Git et accès au dépôt : https://github.com/acailic/agent_debugger
- Poste de développement ou VM avec 2+ CPU et 4+ GB RAM conseillé pour l'UI.
- Outils en ligne de commande (bash / PowerShell).

Checklist pré-vol :
- [ ] Cloner le dépôt : https://github.com/acailic/agent_debugger
- [ ] Lire le README et le quickstart
- [ ] Réserver ~2 GB disque pour replays

Note conformité : si vous enregistrez des données personnelles (PII — informations personnellement identifiables), appliquez anonymisation et retenez les traces peu de temps (par ex. 7 jours). Voir la section Hypotheses / inconnues plus bas et le dépôt : https://github.com/acailic/agent_debugger

Plain-language explanation before advanced details:
Ce qui suit donne des étapes simples pour démarrer. Les parties « avancées » expliquent des paramètres et bonnes pratiques. Si vous débutez, suivez d'abord le pas à pas d'installation puis revenez aux options avancées.

## Installation et implementation pas a pas

1) Cloner le dépôt et lire le README

```bash
git clone https://github.com/acailic/agent_debugger.git
cd agent_debugger
ls -la
sed -n '1,120p' README.md
```

2) Démarrer l'instance locale (exemples génériques — vérifier la commande exacte dans le README)

```bash
# exemple générique — adaptez selon README
./scripts/start-local-debugger.sh --config ./peaky-config.yaml
# ou via Docker si fourni
# docker-compose up -d
```

3) Instrumenter votre agent pour écrire des replays
- Sérialisez les échanges au format JSON. Incluez : timestamps en UTC, nom de l'outil appelé, prompt, réponse, et compteur de tokens si disponible.
- Écrivez chaque replay dans ./data/replays avec un nom horodaté, par exemple 2026-04-05T12:34:56Z.json.
- Vérifiez qu'un replay s'ouvre dans l'interface locale à l'adresse indiquée (ex. http://127.0.0.1:8080) — confirmez le port dans le README.

4) Workflow de démarrage
- Capturez 1 replay défaillant dans les 60 minutes pour valider le flux.
- Collectez jusqu'à 50 runs pour établir une baseline de dérive.
- Lancez la détection en mode dry-run pendant 7–14 jours avant d'activer des alertes automatiques.

5) Scripts d'inspection rapide (exemples)

```bash
# lister replays
ls -lh ./data/replays || echo "Aucun replay local trouvé — vérifier README: https://github.com/acailic/agent_debugger"
# diagnostic si fourni
[ -x ./scripts/diagnose.sh ] && ./scripts/diagnose.sh --check-replays || echo "Consultez le README"
```

## Problemes frequents et correctifs rapides

Problème : replay non chargé dans l'UI
- Vérifiez que le JSON respecte le schéma attendu (timestamps, tool_calls, tokens si utilisés).
- Essayez d'ouvrir un exemple fourni par le dépôt et comparez les champs.

Problème : l'UI ne démarre pas
- Vérifiez les logs d'exécution.
- Contrôlez le port (ex. 8080), la mémoire disponible (au moins 1 GB libre) et les dépendances listées dans le README : https://github.com/acailic/agent_debugger

Problème : trop de faux positifs en détection de dérive
- Augmentez la taille de la baseline à 50–100 échantillons.
- Démarrez en dry-run pendant 7–14 jours avant d'activer des alertes.

Problème : stockage saturé
- Échantillonnez : conservez 5–10% des sessions ou seulement les runs échoués.
- Appliquez une politique de rétention : par ex. 7 jours pour traces sensibles, 30 jours pour le reste.

## Premier cas d'usage pour une petite equipe

Objectif : obtenir une preuve reproductible d'un bug et le corriger rapidement.

Processus léger (pour solo founders / petites équipes) :

- Action 1 — Priorité immédiate (0–2 heures) : cloner le dépôt, démarrer localement et capturer 1 replay d'un bug critique. Vérifiez l'ouverture du replay dans l'UI (ex. port 8080).
- Action 2 — Limiter le bruit (1 jour) : n'enregistrer que les sessions échouées ou 5–10% des sessions en staging. Réserver ~2 GB disque.
- Action 3 — Triage court (quotidien, 10–30 min) : revoir les 3–5 replays les plus fréquents, tagger la sévérité (P0, P1, P2) et assigner une action.
- Action 4 — Auto-protection (1–3 jours) : anonymiser toute PII avant stockage et définir des règles de rétention (7–30 jours).
- Action 5 — Automatisation minimale (1–2 semaines) : capturer replays des runs CI échoués uniquement et ajouter une règle de regroupement automatique.

Conseils pratiques :
- Une personne responsable suffit au départ (1 owner).
- Limitez les alertes à moins de 10 par jour pour éviter la fatigue.
- Priorisez les corrections qui couvrent ≥ 3 occurrences identiques ou qui impactent ≥ 10% du trafic.

(Documentation et exemples : https://github.com/acailic/agent_debugger)

## Notes techniques (optionnel)

- Le dépôt se décrit comme « local-first » et liste les fonctions principales : replay, mémoire d'échecs, smart highlights et détection de dérive. Voir : https://github.com/acailic/agent_debugger
- Schéma et champs clés : utilisez timestamps en UTC, incluez compteurs de tokens si disponibles et marqueurs d'appels d'outils. Ces éléments aident les algorithmes de mise en évidence (highlights).
- CI / stockage : enregistrez de préférence les échecs. Échantillonnage recommandé : 5–10% ou uniquement les runs échoués pour limiter l'utilisation disque.

Exemple de configuration (TEMPLATE — vérifier les clés exactes dans le dépôt) :

```yaml
# peaky-config.yaml — template, confirmer les clés dans le dépôt
server:
  host: 127.0.0.1
  port: 8080
storage:
  path: ./data/replays
  retention_days: 30
drift:
  baseline_samples: 50
  alert_threshold_pct: 10
```

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Fonctionnalités annoncées par le dépôt : replay, mémoire d'échecs, smart highlights, drift detection (source : https://github.com/acailic/agent_debugger).
- Valeurs chiffrées ci‑dessous sont des hypothèses de planification :
  - Capturer 1 replay défaillant pendant le bootstrap dans 60 minutes.
  - Réserver ~2 GB de disque pour stockage initial.
  - Utiliser le port local 8080 comme exemple.
  - Construire une baseline d'environ 50 échantillons pour la détection de dérive.
  - Échantillonner 5–10% des sessions, ou n'enregistrer que les sessions échouées.
  - Seuil d'alerte initial proposé : 10%, viser 5% après validation.
  - Rétention : 7 jours pour traces sensibles, 30 jours pour traces non sensibles.

### Risques / mitigations

- Risque : enregistrement de PII. Mitigation : anonymiser, appliquer rétention courte (7 jours) et contrôler l'accès.
- Risque : alertes trop fréquentes (fatigue opérationnelle). Mitigation : dry-run 7–14 jours, augmenter la baseline, revue humaine avant automatisation.
- Risque : surcharge de stockage/CI. Mitigation : échantillonnage (5–10%) ou n'enregistrer que les échecs ; limiter la rétention à 7–30 jours.

### Prochaines etapes

Court terme (24–72 heures) :
- [ ] Cloner le dépôt et lire le README : https://github.com/acailic/agent_debugger
- [ ] Démarrer une instance locale et confirmer qu'un replay s'ouvre dans l'UI (ex. port 8080)
- [ ] Capturer et tagger au moins 1 replay défaillant lors du bootstrap

Moyen terme (1–2 semaines) :
- Instrumenter staging pour collecter ~50 runs, tester la détection en dry-run, affiner les seuils (10% → 5%).

Long terme (1–3 mois) :
- Intégrer la capture de replays pour runs CI échoués, ajouter des gardes canary basés sur la mémoire d'échecs et formaliser les règles de rétention et d'accès.

Pour tous les détails d'implémentation (commandes exactes, schémas JSON, scripts), consultez le dépôt officiel : https://github.com/acailic/agent_debugger
