---
title: "Déverrouiller le Codex Harness : comment nous avons construit l'App Server"
date: "2026-02-06"
excerpt: "Tutoriel technique pour développeurs et fondateurs : implémenter un App Server JSON‑RPC bidirectionnel qui expose des hypothèses internes, stream des frames incrémentales et persiste des diffs pour approbation humaine. Combine des patterns pratiques avec deux signaux de recherche (PCE, Empirical‑MCTS). Les artefacts concrets non documentés dans les extraits de recherche sont marqués HYPOTHESIS."
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "codex"
  - "app-server"
  - "json-rpc"
  - "LLM"
  - "PCE"
  - "Empirical-MCTS"
  - "devops"
  - "AI"
sources:
  - "https://openai.com/index/unlocking-the-codex-harness"
  - "https://arxiv.org/abs/2602.04326"
  - "https://arxiv.org/abs/2602.04248"
---

## TL;DR builders

- Quoi : pattern d'App Server exposant un endpoint JSON‑RPC bidirectionnel, capable de représenter des hypothèses internes, de streamer des frames incrémentales et de persister des diffs en attente d'approbation humaine. Référence conceptuelle générale : https://openai.com/index/unlocking-the-codex-harness. Le papier PCE motive l'idée d'expliciter les hypothèses internes contenues dans les traces de raisonnement d'un LLM (https://arxiv.org/abs/2602.04326).

- Résumé des apports de recherche (extraits) : PCE propose de convertir les traces de raisonnement fragmentées en un arbre de décision structuré afin de scorer des chemins par vraisemblance, gain et coût pour guider la sélection d'actions sans communication lourde (https://arxiv.org/abs/2602.04326). Empirical‑MCTS argue pour une mémoire empirique globale qui accumule et distille motifs de recherche réussis afin d'améliorer les recherches futures (https://arxiv.org/abs/2602.04248).

- Points marqués HYPOTHESIS : tout nom de fichier, commande, manifeste Docker/Kubernetes ou chemin de dépôt cité ci‑dessous est indiqué comme HYPOTHESIS lorsqu'il ne figure pas explicitement dans les extraits de recherche.

```bash
# HYPOTHESIS: commandes de démarrage d'exemple (non extraites des papiers)
git clone https://example.org/codex-app-server.git
cd codex-app-server
docker-compose -f docker-compose.dev.yml up --build
```

- Pourquoi ce pattern : pour autoriser l'inspection des hypothèses latentes et scorer plusieurs chemins décisionnels avant d'exécuter une action coûteuse (PCE — https://arxiv.org/abs/2602.04326) ; et pour accumuler des motifs efficaces en mémoire afin d'optimiser les meta‑prompts et les stratégies de recherche (Empirical‑MCTS — https://arxiv.org/abs/2602.04248).

## Objectif et resultat attendu

Objectif : fournir un livrable développeur local montrant un App Server JSON‑RPC qui :
1) stream des frames d'avancement incrémentales, 2) expose des outils avec contrôles d'autorisation, 3) persiste des diffs en attente d'approbation humaine.

- Ce qui est garanti par les extraits : la nécessité d'expliciter et de structurer les hypothèses latentes dans un arbre de décision pour choisir des actions rationnelles est documentée dans PCE (https://arxiv.org/abs/2602.04326). L'importance d'une mémoire empirique et d'un agent d'optimisation est discutée dans Empirical‑MCTS (https://arxiv.org/abs/2602.04248).

- Ce qui est HYPOTHESIS (implémentation, noms de fichiers, scripts) : tout artefact de dépôt, commande Docker, chemin de test ou fichier de configuration cité dans les étapes ci‑dessous qui n'apparaît pas dans les extraits de recherche est une proposition d'implémentation pratique et doit être traité comme tel.

## Stack et prerequis

Recommandation d'environnement (HYPOTHESIS : tirée du plan d'implémentation pratique, non des extraits) :

- Node.js >= 18 ou Python 3.10+ pour le serveur et les clients (choix d'implémentation).
- Docker & docker‑compose pour la parité dev ; manifests Kubernetes pour production (HYPOTHESIS).
- Postgres pour persistance d'état et un magasin clé/valeur simple pour la mémoire empirique (HYPOTHESIS).
- Gestion des secrets via env ou k8s Secrets / Vault (HYPOTHESIS).

Raison du choix par rapport à la recherche : PCE requiert de pouvoir représenter et scorer plusieurs hypothèses/candidats avant exécution, ce qui implique un serveur capable de maintenir des représentations alternatives et des métriques associées (https://arxiv.org/abs/2602.04326). Empirical‑MCTS motive l'ajout d'une mémoire centrale pour distiller connaissances empiriques (https://arxiv.org/abs/2602.04248).

## Implementation pas a pas

Les étapes ci‑dessous donnent une feuille de route concrète ; les noms de fichiers/chemins sont étiquetés HYPOTHESIS quand ils ne proviennent pas des extraits.

1) Bootstrap du workspace (HYPOTHESIS) :

```bash
# HYPOTHESIS: exemple de démarrage dev
git clone https://example.org/codex-app-server.git
cd codex-app-server
docker-compose -f docker-compose.dev.yml up --build
```

2) Exemple de config dev (HYPOTHESIS) :

```yaml
# docker-compose.dev.yml (HYPOTHESIS)
version: '3.8'
services:
  app:
    build: ./src
    environment:
      - LLM_API_KEY=${LLM_API_KEY}
    ports:
      - 8080:8080
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=appdb
      - POSTGRES_USER=app
      - POSTGRES_PASSWORD=changeme
```

3) Handler JSON‑RPC (conception) :
- Accepter messages types: start, stream, complete (structure HYPOTHESIS).
- Représenter le raisonnement courant comme un arbre de décision : nœuds internes = hypothèses sur l'environnement ; feuilles = actions. Scorer chaque chemin par vraisemblance, gain et coût avant exécution (principe PCE — https://arxiv.org/abs/2602.04326).

4) Adapters et approbations (HYPOTHESIS) :
- Stocker les diffs produits dans une table "diffs" et exposer un webhook/API d'approbation.

5) Memory Repository et Optimization Agent (HYPOTHESIS mais motivé par Empirical‑MCTS) :
- Stocker fragments de recherche et meta‑prompts de haute qualité.
- Exécuter un agent d'optimisation en tâche de fond qui distille et promeut ces fragments (https://arxiv.org/abs/2602.04248).

6) Test d'acceptation local (HYPOTHESIS) :

```bash
# HYPOTHESIS: lancer un script de test d'acceptation
./tests/acceptance/test_rpc_flow.sh
```

7) Validation de conformité recherche : s'assurer que le serveur expose les hypothèses internes pour inspection (auditabilité) et que la mémoire enregistre les chemins décisionnels réussis afin d'être utilisés par un agent d'optimisation (PCE, Empirical‑MCTS ; https://arxiv.org/abs/2602.04326, https://arxiv.org/abs/2602.04248).

## Architecture de reference

Composants centraux (emplacements de fichiers proposés marqués HYPOTHESIS si non fournis) :

- JSON‑RPC App Server (src/)
- Adaptateurs d'outils (src/tools/)
- Service d'approbation (ex.: examples/approvals/) — HYPOTHESIS
- Magasin d'état relationnel (Postgres)
- Memory Repository & Memory Optimization Agent (HYPOTHESIS ; concept motivé par Empirical‑MCTS : https://arxiv.org/abs/2602.04248)
- Observabilité : Prometheus / Grafana (HYPOTHESIS)

Séquence opérationnelle résumée : Client -> /rpc start -> serveur construit arbre d'hypothèses -> serveur stream des frames -> serveur score/choisit un chemin (vraisemblance + gain − coût) -> si appel d'outil requis, adapter l'appel -> persister diff -> attendre approbation.

Mapping recherche : PCE définit la conversion des traces LLM en arbre de décision et le scoring des chemins pour planifier sous incertitude (https://arxiv.org/abs/2602.04326). Empirical‑MCTS motive la conservation et l'optimisation d'une mémoire globale pour améliorer les recherches successives (https://arxiv.org/abs/2602.04248).

## Vue fondateur: ROI et adoption

Itinéraire d'adoption (séquence recommandée — éléments d'opération HYPOTHESIS) :
- Playground interne + documentation et quickstart.
- Beta fermée derrière feature flag.
- Canary rollout progressif (10 %) puis expansion.

Tableau décisionnel (cadre ROI rapide) :

| Option                | Effort estimé | Risque | Bénéfice attendu | Source |
|-----------------------|---------------:|--------|------------------|--------|
| Beta interne          | Faible         | Moyen  | Itération UX sur diffs | https://openai.com/index/unlocking-the-codex-harness |
| Approbation humaine   | Modéré         | Faible | Contrôle sécurité | https://arxiv.org/abs/2602.04326 |
| Application automatique| Faible         | Élevé  | Déploiement rapide | HYPOTHESIS |

Comment la recherche soutient le ROI :
- PCE : réduire communications coûteuses en évaluant localement plusieurs hypothèses et en choisissant une action basée sur scoring (https://arxiv.org/abs/2602.04326).
- Empirical‑MCTS : accumuler motifs valides en mémoire pour améliorer la performance au fil du temps et diminuer les coûts d'exploitation (https://arxiv.org/abs/2602.04248).

## Pannes frequentes et debugging

Modes de défaillance courants et actions recommandées (noms de métriques/fichiers HYPOTHESIS s'ils n'existent pas) :

- Streaming bloqué / frames manquantes : corréler client_trace_id avec logs serveur ; réémettre frames manquantes. (Opération HYPOTHESIS.)
- Timeouts d'outils / sorties non sûres : appliquer timeouts, circuit breakers, et exporter durées/erreurs vers Prometheus (HYPOTHESIS). Voir principe PCE pour prioriser actions locales avant communications coûteuses (https://arxiv.org/abs/2602.04326).
- Chemins mal scorés : inspecter la représentation de l'arbre et la fonction de scoring — PCE recommande scoring par vraisemblance/gain/coût (https://arxiv.org/abs/2602.04326).
- Memory drift (mémoire qui n'améliore pas les performances) : vérifier que le Memory Optimization Agent distille correctement les fragments de haute qualité (Empirical‑MCTS — https://arxiv.org/abs/2602.04248).

Remarque : si un artefact concret mentionné ici n'existe pas dans votre dépôt, traitez la procédure de debugging associée comme HYPOTHESIS.

## Checklist production

- [ ] Définir SLOs et alertes Prometheus (HYPOTHESIS: monitoring/alerts.yml).
- [ ] Canary deploy à 10% et valider tests d'acceptation (HYPOTHESIS: manifests/k8s/canary.yaml).
- [ ] Garantir stockage sécurisé des secrets (k8s Secrets ou Vault).
- [ ] Déployer dashboards Grafana et configs de scrape Prometheus.
- [ ] Ajouter runbooks et smoke tests dans docs/runbooks/ et tests/smoke/ (HYPOTHESIS si ces chemins n'existent pas).

Garde‑fous inspirés par la recherche : exiger que le système expose les hypothèses internes pour audit (PCE — https://arxiv.org/abs/2602.04326) et maintenir un repository mémoire plus un mécanisme d'évolution de meta‑prompts pour réduire le réglage manuel (Empirical‑MCTS — https://arxiv.org/abs/2602.04248). Pour le cadrage général et les exemples de patterns d'ingénierie, voir aussi https://openai.com/index/unlocking-the-codex-harness.

Note finale sur la preuve : les extraits arXiv cités fournissent les orientations algorithmiques principales (PCE pour planification consciente de l'incertitude ; Empirical‑MCTS pour évolution via mémoire). Toute assertion opérationnelle détaillée non présente dans ces extraits est marquée explicitement HYPOTHESIS.
