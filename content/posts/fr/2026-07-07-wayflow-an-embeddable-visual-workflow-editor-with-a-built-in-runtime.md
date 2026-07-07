---
title: "Wayflow — un éditeur de workflow visuel embarquable avec runtime intégré"
date: "2026-07-07"
excerpt: "Intégrez en un appel un espace de travail visuel complet dans votre application web. Éditez un graphe JSON exécutable en navigateur ou sur serveur — inclut LLM, branches, étapes « human-in-the-loop » et nœuds personnalisés."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-07-wayflow-an-embeddable-visual-workflow-editor-with-a-built-in-runtime.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "wayflow"
  - "workflow"
  - "éditeur-visuel"
  - "LLM"
  - "embeddable"
  - "développement"
  - "runtime"
sources:
  - "https://wayflow.build/"
---

## TL;DR en langage simple

- Wayflow est un éditeur de workflow visuel embarquable pour le web qui monte l'espace de travail complet (canvas, palette de nœuds, panneau de configuration et contrôles d'exécution) en une seule fonction : createWorkflowEditor(). Voir https://wayflow.build/.
- Le runtime d'exécution est fourni « in the box » : vous pouvez prototyper dans le navigateur puis exécuter le même graph.json côté serveur. Voir https://wayflow.build/.
- Wayflow est écrit en TypeScript, livré avec types et vise zéro dépendance d'exécution; la bibliothèque est publiée sous licence MIT. Voir https://wayflow.build/.

Méthodologie : j'ai ancré les points ci‑dessous sur la documentation officielle (voir le lien ci‑dessus).

## Ce que vous allez construire et pourquoi c'est utile

Vous intégrerez un éditeur visuel prêt à l'emploi dans votre application et utiliserez le moteur d'exécution associé pour faire tourner les mêmes graphes en prototype et en production. Concrètement :

- Un appel JavaScript monte l'éditeur (createWorkflowEditor()).
- Le graphe exporté (graph.json) est l'artefact canonique que le runtime lit et exécute.
- Les nœuds peuvent mélanger LLM, appels d'outils, branching, map‑over‑list et étapes déterministes dans le même graphe. Voir https://wayflow.build/.

Bénéfices pragmatiques : accélération de l'itération (non‑ingénieurs créent des flux), un seul format d'artefact pour prod/dev, et possibilité de combiner IA et logique déterministe.

## Avant de commencer (temps, cout, prerequis)

Prérequis techniques (minimum) :

- Une page web ou app JS/TS où monter un élément DOM. Wayflow fonctionne en Vanilla JS et avec React/Vue/Svelte/Angular/Solid. Voir https://wayflow.build/.
- Capacité à stocker/servir graph.json depuis un backend ou objet de configuration.
- Si vous utilisez des LLMs : prévoir un runtime serveur pour garder les clés hors du client.

Temps & coûts (ordres de grandeur) :

| Tâche                                 | Temps estimé       | Coût approximatif initial |
|---------------------------------------|--------------------|---------------------------|
| Prototype local (nœuds de base)       | 1–2 jours (1 dev)   | $0–$50                    |
| Runtime serveur minimal + adaptateurs | 1–2 semaines        | $50–$200/mois             |
| Monitoring + CI (validation graph)    | 1–3 jours           | $0–$100/mois              |

Exemples de paramètres opérationnels à choisir (référence pour roadmap) : 1 000 requêtes/mois, budget initial $50–$200/mois, test canary = 5% trafic, p95 latence cible = 500 ms, erreur acceptable < 1% avant rollback, retries = 3, token budget initial = 100000 tokens/mois. Ces chiffres servent de point de départ; adaptez‑les à votre contexte. Voir https://wayflow.build/.

## Installation et implementation pas a pas

1) Installer le package

```bash
npm install wayflow@0.3.0
```

2) Monter l'éditeur (one‑liner)

```ts
import { createWorkflowEditor } from 'wayflow'
const editor = createWorkflowEditor(document.getElementById('editor'))
```

(quickstart et exemples sur https://wayflow.build/.)

3) Construire, exporter, exécuter

- Créez des nœuds (LLM, tool‑call, branching, map‑over‑list, étapes déterministes) sur le canvas.
- Exportez graph.json comme artefact canonique.
- Exécutez localement le runtime inclus pour valider le comportement avant de déplacer les appels sensibles côté serveur. Voir https://wayflow.build/.

4) Example d'export / sauvegarde

```ts
// exporter
const graph = editor.exportGraph()
await fetch('/save', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(graph) })
```

```ts
// recharger
const g = await fetch('/graph.json').then(r => r.json())
editor.loadGraph(g)
```

5) Passer en production

- Déployez un runtime serveur pour héberger adaptateurs provider‑neutral et protéger les clés.
- Enregistrez les nœuds personnalisés côté serveur et dans l'éditeur.
- Planifiez un déploiement progressif (canary 5% → gates → rollout). Voir https://wayflow.build/.

## Problemes frequents et correctifs rapides

Symptômes et actions immédiates (check de 60–120 s) :

- L'éditeur s'affiche mais le runtime échoue : vérifier que vous chargez exactement le graph.json exporté et que les nœuds personnalisés sont enregistrés dans le runtime.
- Échecs sur nœuds LLM en prototype : assurez‑vous que les clés ne sont pas exposées dans le client; migrez les appels vers le serveur.
- Nœud personnalisé non exécuté : validez l'enregistrement TypeScript côté éditeur et runtime.

Correctifs rapides :

- Valider la forme JSON (schéma) de graph.json en CI avant merge.
- Geler la version (par ex. wayflow@0.3.0) dans package.json.
- Déplacer secrets dans un coffre ou runtime serveur.

Débogage utile : collecter run IDs, logs par nœud, et latences (p50/p95). Le modèle « run » et le runtime sont décrits sur https://wayflow.build/.

## Premier cas d'usage pour une petite equipe

Cas concret recommandé pour débuter : triage automatique de tickets support (réception → résumé par LLM → routage conditionnel → approbation humaine → réponse). Voir https://wayflow.build/.

Actions détaillées, pensées pour un·e fondateur·rice solo ou une équipe 1–3 personnes (actionnables) :

1) Prototyper 100 % en navigateur en 1–2 jours
- Montez l'éditeur localement, construisez un flux minimal (input → résumé LLM → condition → approbation → output) et lancez 10–50 runs pour valider les chemins.
- Avantage : 0 serveur initial, itération rapide (moins de 24–48 h pour un MVP).

2) Externaliser les appels sensibles en un runtime serveur minimal (1–2 semaines)
- Déployez un service qui accepte un run ID et exécute les nœuds LLM avec les clés côté serveur. Gardez ≤ 3 fournisseurs d'API au début.
- Objectifs operatoires : p95 < 500 ms pour appels internes, retries = 3, timeout par appel = 2 000 ms.

3) Versionner, reviewer et automatiser (CI) le graph.json
- Committez graph.json dans le repo, ajoutez une checklist de revue (tests de non‑régression, cas négatifs, métriques attendues) et une validation JSON en CI.
- Processus : merge seulement si 100 % des checks passent et si un reviewer humain approuve.

Conseils opérationnels supplémentaires :
- Commencez avec 1 nœud LLM actif puis itérez par incréments de 1–3 nœuds.
- Instrumentez logs de run (run ID, nœud, latence ms) et surveillez le taux d'erreur (objectif initial < 1%).
- Déployez un canary à 5 % de trafic puis 25% puis 100% si gates OK.

Voir https://wayflow.build/ pour références techniques.

## Notes techniques (optionnel)

- One call mount : createWorkflowEditor() instancie le canvas, la palette, le panneau de config et les contrôles d'exécution en une seule commande. Voir https://wayflow.build/.
- Runtime inclus : exécution de graph.json possible en navigateur pour prototypage; le même graph.json est réutilisable côté serveur en production.
- Types & dépendances : Wayflow fournit des types TypeScript et vise zero runtime dependencies. Voir https://wayflow.build/.
- Nœuds disponibles (extrait) : LLM, tool‑calling, branching, map‑over‑list, étapes déterministes.
- Provider‑neutral : adaptateurs qui acceptent clés de différents fournisseurs afin d'éviter un verrouillage propriétaire.

Exemple minimal d'adaptateur côté serveur (illustratif) :

```json
{
  "adapters": {
    "example-provider": { "apiKey": "REDACTED_ON_SERVER", "timeout_ms": 2000 }
  }
}
```

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Prototype local basique = 1–2 jours pour 1 développeur.
- Runtime serveur minimal + adaptateurs = 1–2 semaines.
- Volume initial testé = 1 000 requêtes/mois; budget hypothétique = $50–$200/mois.
- Paramètres opérationnels à valider : canary = 5% initial, p95 cible = 500 ms, erreur acceptable < 1%, retries = 3, rollback cible < 15 minutes, token budget initial = 100000 tokens/mois.
- Ces nombres sont des estimations de planification et doivent être ajustés pour votre contexte.

### Risques / mitigations

- Fuite de clés côté client → mitigation : exécuter appels sensibles uniquement depuis le runtime serveur ou un coffre (vault).
- Latence des fournisseurs LLM → mitigation : timeouts (ex. 2 000 ms), retries = 3, fallback vers logique déterministe.
- graph.json corrompu ou incompatible → mitigation : validation schéma en CI + tests d'exécution automatique (10–100 runs de smoke tests).

### Prochaines etapes

- [ ] Monter un prototype local avec wayflow@0.3.0 et exporter un graph.json canonique.
- [ ] Déployer un runtime serveur minimal pour héberger adaptateurs et garder les clés sécurisées.
- [ ] Ajouter une validation CI pour graph.json (schéma + exécution de test simple).
- [ ] Instrumenter logs de run, métriques d'erreur et latence (p50, p95) et définir alertes (ex. >1% erreur ou p95 > 1 000 ms).
- [ ] Planifier un rollout canary (5% → 25% → 100%) et définir critères de rollback (< 1% erreur, rollback < 15 minutes).
- [ ] Pinner la dépendance Wayflow dans package.json et documenter la stratégie de migration.

Référence principale et documentation : https://wayflow.build/.
