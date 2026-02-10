---
title: "Asterbot — agent IA construit à partir de composants WASM sandboxés et interchangeables"
date: "2026-02-10"
excerpt: "Exécutez Asterbot — un agent IA où chaque capacité (recherche, mémoire, LLM, etc.) est fournie comme un composant WASM sandboxé et remplaçable via WASI. Ce guide explique l'approche, les tests d'acceptation et les hypothèses opérationnelles (UK context)."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-10-asterbot-an-ai-agent-built-from-sandboxed-swappable-wasm-components.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "wasm"
  - "wasi"
  - "agent-ia"
  - "sécurité"
  - "dev"
  - "startup"
  - "observabilité"
sources:
  - "https://github.com/asterai-io/asterbot"
---

## TL;DR builders

Ce que vous obtenez : un concept opérationnel d'Asterbot — « A modular AI agent built on WASM components. Every capability is sandboxed and swappable. » (source : https://github.com/asterai-io/asterbot). Le dépôt indique que chaque capacité est fournie comme un module WASM sandboxé et remplaçable.

Checklist rapide pour démarrer (haut niveau) :

- Cloner le dépôt et lire le README principal : https://github.com/asterai-io/asterbot
- Inspecter les manifests de composants et scripts pour confirmer le modèle d'exécution (WASM sandboxé).
- Préparer un runtime WASM local ou distant et un magasin de composants avant d'exécuter des modules; vérifier les scripts fournis dans le repo.
- Lancer les exemples ou tests locaux (si présents) et capturer un log avec code de sortie 0.

Remarque méthodologique : les éléments factuels cités reposent sur la description publique du dépôt ci‑dessus ; les commandes et variables non exposées dans le README sont listées comme hypothèses plus bas.

## Objectif et resultat attendu

Objectif : faire tourner l'artefact Asterbot localement pour vérifier la découverte et l'invocation d'au moins une capacité WASM sandboxée fournie par le code (https://github.com/asterai-io/asterbot).

Critères d'acceptation concrets :

- Clone du dépôt Asterbot (1 repo) et lecture du README principal.
- Inspection d'au moins 1 manifest de composant (sauvegardé localement).
- Exécution d'un exemple / test fourni (si présent) terminant sans erreur (code de sortie 0).
- Collecte d'un log montrant découverte et invocation d'un composant.

Livrables attendus : clone local, notes d'inspection, un log d'exécution. Pour conformité (p.ex. UK GDPR), anonymiser toute donnée de test si vous manipulez données personnelles.

Référence : https://github.com/asterai-io/asterbot

## Stack et prerequis

Composants et références principales :

- Dépôt source : https://github.com/asterai-io/asterbot (description officielle : modules WASM sandboxés et interchangeables).
- Runtime WASM local ou service d'exécution compatible (à valider dans le repo).
- Éventuel registre de composants (local ou distant).

Prérequis développeur minimum :

- Git (cloner, parcourir l'historique) — 1 opérateur suffit pour la validation initiale.
- Capacité à lire README et manifests YAML/JSON.
- Environnement pouvant exécuter des bins/scripts fournis (shell, permissions). 

Artefacts à vérifier dans le repo : README principal, dossiers components/ ou manifests/ et scripts d'exécution (build, run, tests). Voir : https://github.com/asterai-io/asterbot

## Implementation pas a pas

1. Cloner et préparer le repo

1.1. Récupérer le code :

```bash
git clone https://github.com/asterai-io/asterbot
cd asterbot
ls -la
```

1.2. Ouvrir README et chercher dossiers components/, examples/ ou tests/.

2. Inspecter manifests et scripts

2.1. Rechercher fichiers manifest (*.yaml, *.json) et lire les déclarations de permissions et interfaces.

3. Installer ou valider runtime WASM local

3.1. Si le repo fournit un script d'exécution, l'exécuter en mode dry‑run ; sinon, préparer un harness WASM type Wasmtime/Wasmer (hypothèse à valider dans le repo).

4. Exécuter un exemple / test (si disponible)

4.1. Lancer l'exemple et capturer stdout/stderr ; viser une terminaison avec code 0.

```bash
# ex. hypothétique — remplacer par le script réel trouvé dans le repo
./scripts/run-example.sh --verbose
# vérifier code de sortie
echo "Exit code: $?"
```

5. Reproduire la découverte et l'invocation d'un composant

5.1. Capturer un log montrant que l'agent découvre un module WASM et l'invoque.

6. Tests smoke répétés

6.1. Exécuter N=10 runs smoke pour estimer taux d'échec (objectif de réussite < 1% si disponible). Documenter MTTR visé (ex. réduire MTTR de 30% par rapport à l'existant — hypothèse de KPI à confirmer).

Notes : adaptez les commandes aux scripts et variables réellement présents dans https://github.com/asterai-io/asterbot

## Architecture de reference

Vue haute‑niveau : agent (plan de contrôle) + composants WASM sandboxés + manifests / registre. Source : https://github.com/asterai-io/asterbot

Décisions conceptuelles (cadre de décision) :

| Critère / option | Magasin local | Registre central |
|---|---:|---:|
| Latence en dev | ~0 requête réseau | + réseau (ms à 100s ms) |
| Partage & versioning | 1 développeur -> rapide | 5–100 utilisateurs -> nécessaire |
| Sécurité / auth | simple (isolé) | requiert auth et rotation clés |

Observations : pour l'itération rapide, un magasin local évite dépendances réseau ; pour production et partage, un registre central avec signature des manifests est recommandé.

Référence technique : https://github.com/asterai-io/asterbot

## Vue fondateur: ROI et adoption

Proposition de valeur vérifiable via le repo : la modularité WASM réduit la surface d'attaque en confinant chaque capacité (mention explicite dans https://github.com/asterai-io/asterbot). Cette architecture favorise le remplacement rapide des capacités sans redéployer l'agent central.

Indicateurs initiaux à mesurer (exemples à valider) : taux d'erreur, latence 95e centile, coût d'opération. Ces KPIs et le plan d'adoption précis (nombres de composants, % de trafic canary) sont listés comme hypothèses à vérifier dans la section Hypotheses / inconnues.

Référence : https://github.com/asterai-io/asterbot

## Pannes frequentes et debugging

Sources courantes d'anomalies et actions (guide pragmatique) — voir aussi le dépôt pour logs et scripts d'aide : https://github.com/asterai-io/asterbot

- Composant non découvert : vérifier chemins, permissions et registre (local).  
- Mismatch manifest / runtime : contrôler les champs du manifest et les revendications d'interface.  
- Panic du module WASM (exit non‑zéro) : exécuter le module dans un harness isolé pour reproduire.

Workflow de debug recommandé : collecter logs stdout/stderr, relancer en mode trace (si supporté), isoler le module en local. Seuils d'alerte exemples : rollback si taux d'erreur > 2% pendant 15 minutes ; alerter si 95e centile de latence > 1000 ms.

Référence pour l'artefact : https://github.com/asterai-io/asterbot

## Checklist production

- CI : étape de build produisant les artefacts composants (.wasm).
- Sécurité : exiger manifests signés pour composants publiés.
- Observabilité : logs d'audit pour découverte et invocation; rétention initiale 30 jours (à ajuster).

- [ ] Cloner le dépôt et lire README + manifests
- [ ] Construire un composant en .wasm via la CI
- [ ] Exécuter tests smoke (objectif hypothétique : 100% des tests critiques) 
- [ ] Activer télémétrie et définir rétention (ex. 30 jours)

Plan de déploiement/rollback (concept) : canary + feature flag ; gates temporels typiques : 15 min → 72 h selon criticité.

### Hypotheses / inconnues

Les points ci‑dessous sont des hypothèses ou éléments à vérifier dans https://github.com/asterai-io/asterbot :

- Noms exacts des scripts d'exécution et flags runtime (ex. ./scripts/run-example.sh — hypothèse).  
- Format précis des manifests et la présence d'un registre source (local vs remote).  
- Présence de tests unitaires / harness : nombre de tests critiques, couverture (objectif supposé 100%).  

Exemples de commandes hypothétiques :

```bash
# Hypothèse d'exécution locale — remplacer par le script réel
./scripts/run-example.sh --component ./components/example.wasm --trace
```

Exemple de config runtime hypothétique :

```yaml
# runtime-config.yaml (hypothétique)
filesystem:
  allowed_paths: ['./components/data']
network: false
logging:
  level: INFO
```

Seuils proposés à valider : rollback trigger > 2% erreurs sur 15 min; 95e centile latence seuil = 1000 ms; canary % : 20% → 50% → 100% sur fenêtres 15 min à 72 h.

### Risques / mitigations

- Risque : paramètres et scripts non documentés dans le repo. Mitigation : audit immédiat du README et des scripts, exécution en bac à sable.  
- Risque : composant avec permissions excessives. Mitigation : appliquer principe du moindre privilège, signer manifests.  
- Risque : incompatibilités runtime WASM. Mitigation : test de compatibilité local et harness reproduisant l'environnement de production.

### Prochaines etapes

1. Inspecter intégralement https://github.com/asterai-io/asterbot : README, manifests, scripts d'exécution.  
2. Remplacer les commandes/configurations hypothétiques par les valeurs et scripts réels trouvés dans le repo.  
3. Effectuer un run de fumée (N=10) ; atteindre objectif de succès (<1% échec) ou documenter erreurs et corriger.  

Référence principale : https://github.com/asterai-io/asterbot
