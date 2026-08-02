---
title: "Recréer le Playground web‑ai‑sdk pour prototyper des agents IA côté navigateur (contexte UK)"
date: "2026-08-02"
excerpt: "Reconstruisez localement le Playground web‑ai‑sdk pour prototyper des agents hébergés dans le navigateur qui appellent des outils (fetch, summarizer, WebMCP), stockent les conversations dans le navigateur et exportent des flux en JSON."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-02-recreate-the-web-ai-sdk-playground-to-prototype-browser-hosted-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 45
editorialTemplate: "TUTORIAL"
tags:
  - "web-ai-sdk"
  - "playground"
  - "agents"
  - "navigateur"
  - "prototype"
  - "résumé"
  - "outils"
  - "frontend"
sources:
  - "https://web-ai-sdk.dev/playground/"
---

## TL;DR en langage simple

- Quoi : un bac à sable dans le navigateur (UI = interface utilisateur). Il affiche les messages, les appels d'outils et les réponses dans une seule vue. (voir https://web-ai-sdk.dev/playground/)
- Pourquoi : prototypage rapide sans backend. Les conversations restent côté client. L'UI indique aussi que « On-device AI can make mistakes ». (voir https://web-ai-sdk.dev/playground/)
- Comment démarrer vite : ouvrez la démo, sélectionnez un exemple (« Summarize URL » ou « Fetch GitHub repo ») et observez la séquence : appel d'outil → sortie → réponse de l'agent. (voir https://web-ai-sdk.dev/playground/)
- Résultat rapide : exportez les conversations en JSON pour tests ou documentation. (voir https://web-ai-sdk.dev/playground/)

Exemple concret : vous avez l'URL d'un article. Choisissez « Summarize URL » dans la démo. L'agent invoque un outil de fetch (récupération), vous voyez la sortie de l'outil, puis la synthèse finale. Tout reste dans le navigateur.

Explication simple avant les détails techniques :

Le Playground montre comment une application peut orchestrer un agent (IA) et des outils. Un "outil" peut être une requête HTTP, un résumé automatique, ou un plugin. La page de démonstration illustre les messages, les appels et les réponses dans un seul flux. Cela aide au débogage et à la création de scénarios reproductibles sans serveur. (référence : https://web-ai-sdk.dev/playground/)

## Ce que vous allez construire et pourquoi c'est utile

Vous allez recréer un petit Playground local inspiré de l'exemple en ligne. Objectifs clairs :

- Une fenêtre de conversation qui affiche, dans l'ordre, message utilisateur → appel d'outil → sortie d'outil → réponse agent. (référence : https://web-ai-sdk.dev/playground/)
- Des outils plug‑in (par ex. fetch, summarizer, WebMCP) que l'agent peut invoquer depuis l'interface. (référence : https://web-ai-sdk.dev/playground/)
- Stockage local des conversations et export JSON pour fixtures et débogage. (référence : https://web-ai-sdk.dev/playground/)

Pourquoi c'est utile :

- Itération rapide sans déploiement serveur.
- Visibilité immédiate des appels d'outil pour diagnostiquer les erreurs.
- Possibilité d'exporter conversations comme artefacts de test ou documentation.

## Avant de commencer (temps, cout, prerequis)

Prérequis minimaux :

- Git installé pour cloner un exemple. (voir https://web-ai-sdk.dev/playground/)
- Un navigateur moderne avec localStorage activé. localStorage est le stockage local du navigateur pour conserver les conversations.
- Node.js si vous voulez lancer un serveur de développement local.

Définitions utiles :

- API = application programming interface (interface de programmation).
- CORS = Cross-Origin Resource Sharing (politiques de partage entre origines). Définir CORS si vous appelez des endpoints depuis le navigateur.

Cadre de décision rapide :

| Approche | Avantages | Inconvénients |
|---|---:|---|
| Local (navigateur) | Itération très rapide, coût initial faible (≈0) | Clés exposées si mal géré, contraintes CORS |
| Proxy serveur | Clés cachées, contrôle CORS | Déploiement et coût d'hébergement, latence possible |

Checklist pré-démarrage :

- [ ] Cloner le dépôt d'exemple et lire l'UI de référence (https://web-ai-sdk.dev/playground/).
- [ ] Vérifier que localStorage fonctionne dans le navigateur.
- [ ] Préparer un endpoint proxy si vous avez des clés API sensibles.

## Installation et implementation pas a pas

1. Clonez le dépôt d'exemple et inspectez l'UI du Playground (https://web-ai-sdk.dev/playground/).

```bash
# cloner l'exemple et aller dans le dossier
git clone https://github.com/obetomuniz/web-ai-sdk.git
cd web-ai-sdk
```

2. Installez les dépendances et lancez le serveur de développement.

```bash
# avec npm
npm install
npm run dev

# ou avec yarn
yarn install
yarn dev
```

3. Ouvrez l'URL locale fournie par le serveur. Repérez « New conversation », les exemples « Summarize URL » et « Fetch GitHub repo » et observez les appels d'outil inline (https://web-ai-sdk.dev/playground/).

4. Exécutez un exemple et regardez le panneau : vous verrez l'appel d'outil, sa sortie, puis la réponse de l'agent.

5. Exemple de configuration locale (ne mettez pas de secrets de production ici) :

```json
{
  "tools": [
    { "name": "fetcher", "type": "http", "endpoint": "https://example-proxy.local/fetch" },
    { "name": "summarizer", "type": "api", "endpoint": "https://example-summarizer.local/summarize" }
  ]
}
```

6. Exportez des conversations depuis l'UI en JSON pour créer des fixtures réutilisables. (voir https://web-ai-sdk.dev/playground/)

7. Pour production, placez les appels sensibles derrière un proxy serveur. Ajoutez authentification et en-têtes CORS appropriés.

## Problemes frequents et correctifs rapides

Problème : appels d'outil bloqués par CORS.
- Correctif : utiliser un proxy côté serveur ou régler les en-têtes CORS sur la cible. Inspectez l'onglet Network dans DevTools. (référence : https://web-ai-sdk.dev/playground/)

Problème : conversations qui disparaissent.
- Correctif : vérifier Application > Local Storage dans DevTools. Confirmez que des extensions ou des politiques de navigateur ne bloquent pas localStorage. (référence : https://web-ai-sdk.dev/playground/)

Problème : sorties incorrectes ou hallucinations (informations inventées).
- Correctifs : clarifier le prompt système, forcer une vérification par fetch avant les affirmations, ou ajouter une revue humaine pour sorties sensibles.

Problème : clés API exposées dans le bundle client.
- Correctif : déplacer la gestion des clés vers un proxy serveur. Ne jamais inclure de clés de production dans le code client.

Ressource : la démo Playground montre comment l'UI trace les appels d'outil en ligne. (voir https://web-ai-sdk.dev/playground/)

## Premier cas d'usage pour une petite equipe

Public cible : fondateurs solo et équipes de 1–3 personnes. (référence : https://web-ai-sdk.dev/playground/)

Trois actions concrètes et rapides :

1) Prototyper en 30–90 minutes dans le navigateur
- Ouvrez la démo (https://web-ai-sdk.dev/playground/). Choisissez « Summarize URL » ou « Fetch GitHub repo ». Clonez l'exemple localement et lancez le serveur de dev.

2) Créer des artefacts reproductibles (fixtures)
- Exécutez 5–20 scénarios représentatifs. Exportez chaque conversation en JSON depuis l'UI et stockez-les dans un dossier "fixtures" pour tests et démonstrations.

3) Protéger et valider
- Ajoutez un proxy serverless pour tout appel nécessitant une clé. Implémentez une validation minimale (schéma JSON ou règles simples) qui rejette une synthèse si des éléments obligatoires manquent.

Checklist opérationnelle :

- [ ] Prototyper un flux URL → summarizer → agent dans le navigateur (https://web-ai-sdk.dev/playground/).
- [ ] Exporter 5–20 fichiers JSON comme fixtures.
- [ ] Déployer un proxy pour appels sensibles et tester CORS.

Remarque : la vue inline des appels d'outil facilite le débogage et la formation. (voir https://web-ai-sdk.dev/playground/)

## Notes techniques (optionnel)

- UI observable : le Playground affiche messages, appels d'outil et réponses inline dans le panneau de conversation. Les exemples intégrés incluent Summarizer et WebMCP. (référence : https://web-ai-sdk.dev/playground/)
- Stockage : les conversations sont conservées côté client (localStorage) par défaut. Pour partage et rétention long terme, migrez vers un stockage serveur.
- Snippet planning proxy :

```ts
// exemple de mapping d'outils vers endpoints proxy (plan)
export const TOOLS = [
  { name: 'fetcher', url: '/api/fetch' },
  { name: 'summarizer', url: '/api/summarize' }
]
```

- Debug : utilisez l'onglet Network pour inspecter les en-têtes et les statuts HTTP. (voir https://web-ai-sdk.dev/playground/)

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Temps d'installation local estimé : 15–45 minutes pour faire tourner la démo de base. (hypothèse)
- Temps d'ajout d'un outil personnalisé : 30–90 minutes. (hypothèse)
- Nombre initial de fixtures recommandé : 5–20 exports JSON. (hypothèse)
- Définition « petite équipe » utilisée ici : 1–3 personnes. (hypothèse)
- Plan canari : démarrer à 5% d'utilisateurs internes sur 7 jours. Critères de succès hypothétiques : taux d'erreur <2%, p95 latency <1 000 ms. Si les seuils sont dépassés, rollback. (hypothèse)

### Risques / mitigations

- Risque : fuite de clés côté client.
  - Mitigation : proxy serveur, rotation de clés, audit des bundles.
- Risque : hausse d'erreurs/hallucinations en production.
  - Mitigation : garde‑fous (validation automatique), revue humaine, journaux détaillés.
- Risque : blocage CORS.
  - Mitigation : tester endpoints via DevTools, déployer proxy avec en-têtes CORS adaptés.
- Risque : dégradation de latence.
  - Mitigation : surveiller p50/p95, déclencher escalade si p95 > 1 000 ms.

### Prochaines etapes

1. Sécuriser : déplacez toutes les clés et quotas côté serveur. (voir https://web-ai-sdk.dev/playground/)
2. Instrumenter : collectez métriques de latence, erreurs et validation humaine. Définissez portes (gates) : p95 < 1 000 ms, taux d'erreur < 2% pour promotion.
3. Déployer en canari : 5% d'utilisateurs internes pendant 7 jours. Vérifier critères. Si erreur > 3% ou p95 augmente de >50%, rollback.
4. Rollback plan : conserver la dernière snapshot de configuration et des fixtures ; automatiser la bascule DNS/API vers la version stable en < 30 minutes si les gates échouent.
5. Itérer : augmenter la couverture des fixtures à 10–20 exemples canoniques et améliorer les prompts.

Référence principale pour l'UI et les comportements observables : https://web-ai-sdk.dev/playground/.
