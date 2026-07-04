---
title: "Attacher le MCP de Causari pour enregistrer et gérer les actions d'agents IA dans un dépôt git"
date: "2026-07-04"
excerpt: "Guide pour attacher le MCP (Micro Causality Proxy) de Causari à un agent de codage IA afin que les prompts, les identifiants de modèle, les lectures/écritures de fichiers et le raisonnement soient enregistrés avec une provenance causale bidirectionnelle pour tracer, revenir en arrière et bisecter."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-04-attach-causaris-mcp-to-record-and-manage-ai-coding-agent-actions-in-a-git-repository.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "causari"
  - "MCP"
  - "provenance"
  - "agents-IA"
  - "auditabilité"
  - "devops"
  - "sécurité"
sources:
  - "https://github.com/croviatrust/causari"
---

## TL;DR en langage simple

- Causari enregistre chaque action d’un agent IA : le prompt, l’identifiant du modèle, les lectures et écritures de fichiers, et le raisonnement. Ces actions deviennent traçables comme des « commits ». (Source : https://github.com/croviatrust/causari)
- Faites d’abord une preuve de concept (POC) sur un dépôt non‑production. Validez : enregistrement → trace → diff → revert → bisect. (Voir le README du dépôt : https://github.com/croviatrust/causari.)
- Ne laissez pas d’agents écrire directement sur la branche main. Définissez qui peut revert et qui approuve les merges avant toute mise en production.

Exemple concret court : un agent corrige une fonction sur une branche de test. Vous utilisez l’interface MCP pour retrouver le prompt et l’ID du modèle, puis vous annulez (revert) uniquement l’action de cet agent sans toucher aux contributions humaines.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez monter un POC court qui connecte le serveur MCP (serveur fourni dans le dépôt Causari) à un agent de codage IA. Le but est simple : chaque action d’agent doit être enregistrée et retrouvable. Cela inclut le prompt envoyé, le modèle utilisé, les fichiers lus et écrits, et les annotations de raisonnement. Le dépôt affirme ces capacités : https://github.com/croviatrust/causari.

Explication en langage plain avant les détails techniques : au lieu de laisser un agent modifier le code sans trace, Causari capte un journal structuré de chaque acte. Ce journal permet de remonter depuis une ligne de code modifiée jusqu’au prompt qui a demandé le changement, puis d’annuler ou d’isoler précisément cette modification si nécessaire.

Bénéfices concrets :

- Audit : partir d’une ligne modifiée et retrouver le prompt et l’ID du modèle. (Source : https://github.com/croviatrust/causari)
- Reversibilité fine : annuler une seule action d’agent sans perdre d’autres contributions humaines.
- Débogage : bisecter les étapes d’un agent pour trouver la régression exacte.

Chaque affirmation fonctionnelle ci‑dessus est décrite dans le dépôt Causari : https://github.com/croviatrust/causari.

## Avant de commencer (temps, cout, prerequis)

- Lire le README du repo avant tout : https://github.com/croviatrust/causari
- Prérequis minimaux : un dépôt git de test (fork), connaissances de base git, une machine ou conteneur pour exécuter le serveur MCP documenté dans le repo.
- Temps estimé pour un POC court : ~3 heures pour 1 ingénieur, 1–2 heures pour un réviseur. (Hypothèses détaillées plus bas.)
- Coûts principaux : instance MCP + stockage de provenance. Prévoir un budget initial test : $0–$50/mo pour un petit déploiement local ou cloud minimal (hypothèse indicative).

Checklist sécurité rapide :

- [ ] Utiliser un dépôt de test ou un fork (non production) — voir https://github.com/croviatrust/causari
- [ ] Créer une branche de sauvegarde (ex. main-backup)
- [ ] Définir approbateurs et politique de merge pour les PR d’agents
- [ ] Préparer un monitoring basique pour la santé MCP et l’alerte de taille de stockage

## Installation et implementation pas a pas

Vérifiez d’abord les commandes et scripts exacts dans le README du dépôt : https://github.com/croviatrust/causari. Ci‑dessous, les étapes sont écrites pour être faciles à suivre. Adaptez les commandes selon le README.

1) Cloner le dépôt et lire le README.

```bash
git clone https://github.com/croviatrust/causari.git
cd causari
less README.md
```

2) Démarrer le serveur MCP fourni (commande illustrative — adaptez selon le README).

```bash
# commande illustrative — utilisez celle indiquée dans README
./mcp-server --help
# ou via script fourni
./scripts/start-mcp.sh
```

3) Configurer l’agent pour émettre des événements vers l’endpoint MCP (exemple illustratif). Le repo indique que Causari enregistre prompts, IDs de modèle, lectures/écritures et métadonnées de raisonnement (https://github.com/croviatrust/causari).

```yaml
# example-agent-config.yaml (illustratif)
mcp_endpoint: "http://mcp.local:8080"
agent_id: "agent-01"
emit_prompts: true
emit_reads: true
emit_writes: true
```

4) Lancer l’agent sur une branche de fonctionnalité d’un fork. Limitez la première modification à 1 fichier. Vérifiez les traces via l’API/Interface du MCP.

5) Valider revert et bisect fournis par les outils. Exemple de requête pour lister 10 traces (ajustez selon le README) :

```bash
curl -s "http://mcp.local:8080/api/v1/traces?limit=10" | jq '.[] | {id,agent,model}'
```

Note : ces commandes sont des exemples. Toujours préférer les commandes et paramètres indiqués dans le README du projet : https://github.com/croviatrust/causari

## Problemes frequents et correctifs rapides

(Remarques basées sur le README et expériences d’usage : https://github.com/croviatrust/causari.)

- MCP injoignable
  - Symptôme : timeouts réseau, HTTP non 200.
  - Correctif : vérifier mcp_endpoint, DNS, security groups. Tester avec curl et le health endpoint.

- Aucun événement enregistré
  - Symptôme : l’agent tourne mais rien n’apparaît.
  - Correctif : activer emit_prompts / emit_writes, vérifier que l’agent POST vers l’API MCP et inspecter les logs du serveur.

- Éditions massives
  - Symptôme : beaucoup de fichiers modifiés par un run.
  - Correctif : restreindre l’agent à un répertoire, configurer un check CI qui bloque plus de 10 fichiers modifiés, exiger revue humaine.

- Croissance du stockage
  - Symptôme : la provenance grossit rapidement.
  - Correctif : appliquer rétention, archiver avant 50 GB, et tester la restauration.

Pour détails et commandes exactes, référez‑vous au README du projet : https://github.com/croviatrust/causari.

## Premier cas d'usage pour une petite equipe

Cible : fondateurs solo et petites équipes (1–3 personnes). Objectif : validation rapide avec faible risque.

Actions concrètes, ordonnées :

1) Isoler le test (actionnable)
   - Forkez le repo et créez une branche de fonctionnalité.
   - Lancez un seul agent contre cette branche. Limitez la première modification à 1 fichier.

2) Bloquer les merges automatiques (actionnable)
   - Configurez la CI pour empêcher tout merge automatique provenant d’un agent.
   - Pour un fondateur solo : relisez et mergez manuellement chaque PR d’agent.

3) Tester le revert (actionnable)
   - Créez une modification contrôlée par l’agent.
   - Suivez la trace dans MCP, puis exécutez le revert d’une seule action. Mesurez le temps nécessaire (objectif initial : < 2 heures pour rollback complet).

4) Conserver la simplicité opérationnelle
   - Démarrer avec 1 agent, 1 endpoint modèle, 1 instance MCP.
   - Limite d’exécution pour tests : 10 runs/jour jusqu’à stabilisation.

Référence des capacités : README du projet (https://github.com/croviatrust/causari).

## Notes techniques (optionnel)

Voir le dépôt principal pour la description du MCP et des traces : https://github.com/croviatrust/causari

Tableau indicatif de modes de déploiement (pour décision rapide) :

| Mode | Instances | Complexité | Recommandé pour |
|------|-----------:|-----------|-----------------|
| Local / Dev | 1 | faible | POC, 1 personne |
| Production simple | 1–2 | moyen | petites équipes (1–10) |
| HA / Cluster | >=3 | élevé | équipes > 10, SLA strict |

Exemple JSON d’archivage illustratif (vérifier schéma réel dans le repo) :

```json
{
  "provenance": {
    "retention_days": 90,
    "archive_bucket": "s3://my-provenance-archive",
    "archive_trigger_gb": 50
  }
}
```

Pour les commandes exactes et le schéma, consultez le README du projet : https://github.com/croviatrust/causari

## Que faire ensuite (checklist production)

- [ ] Revue de sécurité des logs de provenance terminée
- [ ] RBAC / authentification configurés pour le MCP (voir repo pour capacités de base : https://github.com/croviatrust/causari)
- [ ] Politique de rétention et d’archivage documentée
- [ ] Gating CI et CODEOWNERS définis pour les PR d’agents
- [ ] Monitoring + alerting en place pour la santé du MCP et la taille du store
- [ ] Playbook de rollback testé de bout en bout

### Hypotheses / inconnues

- Les capacités principales (enregistrement des prompts, ID modèle, lectures, écritures, raisonnement ; trace/diff/revert/bisect ; serveur MCP fourni) sont documentées dans le README du projet : https://github.com/croviatrust/causari. Ces éléments sont pris comme base factuelle.
- Valeurs numériques proposées comme points de départ (à valider) :
  - Durée POC suggérée : ~3 heures
  - Taille d’équipe POC : 1–2 ingénieurs + 1 réviseur
  - Canary initial : 5% des dépôts ou 2% du trafic PR
  - Rétention exemple : 90 jours
  - Déclencheur d’archivage : 50 GB
  - Garde‑fous fichier : >10 fichiers modifiés requiert revue humaine
  - Quota auto‑merge d’exemple : 2 merges/semaine
  - SLA rollback initial visé : 2 heures
  - Limite d’exécutions agent pour tests initiaux : 10 runs/jour
  - Intervalle de sondage health : 30s, alerte après 5 échecs

Ces chiffres sont des hypothèses opérationnelles. Validez-les pendant le POC.

### Risques / mitigations

- Risque : traces contenant secrets ou données à caractère personnel (PII). Mitigation : redaction ou chiffrement des traces, accès restreint.
- Risque : croissance du stockage et coûts. Mitigation : rétention, archivage automatique avant seuil (ex. 50 GB), alertes.
- Risque : éditions massives. Mitigation : restreindre portée des agents, checks CI, revue humaine si >10 fichiers.
- Risque : fusion automatique d’éditions incorrectes. Mitigation : désactiver auto‑merge initialement, exiger approbation humaine.

### Prochaines etapes

1) Lancer un POC sur un dépôt non‑production en suivant le README (https://github.com/croviatrust/causari). Visez un test court et une petite équipe.
2) Configurer contrôles d’accès et intégrer le health endpoint au monitoring (sondage toutes les 30s, alerte après 5 échecs).
3) Tester revert et bisect : créer une modification contrôlée, tracer jusqu’au prompt via MCP, puis rétablir une seule action.
4) Rédiger la politique opérationnelle initiale : approbateurs, rétention, SLA rollback, quota d’auto‑merge ; stocker la politique dans le runbook du dépôt.

Référence principale : https://github.com/croviatrust/causari
