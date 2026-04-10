---
title: "RemembrallMCP — mémoire vectorielle persistante en Rust pour agents IA avec Postgres, pgvector et MCP"
date: "2026-04-10"
excerpt: "Guide pratique pour démarrer RemembrallMCP : un service en Rust qui stocke des embeddings et des métadonnées dans Postgres avec l'extension pgvector, parle le protocole MCP et permet la « recall » pour des agents IA."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-10-remembrallmcp-rust-based-persistent-vector-memory-for-ai-agents-using-postgres-pgvector-and-mcp.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "Rust"
  - "Postgres"
  - "pgvector"
  - "MCP"
  - "vector-database"
  - "agents-IA"
  - "déploiement"
  - "embeddings"
sources:
  - "https://github.com/cdnsteve/remembrallmcp"
---

## TL;DR en langage simple

- RemembrallMCP est une couche mémoire persistante open source en Rust qui utilise PostgreSQL + pgvector et expose une interface MCP. Source : https://github.com/cdnsteve/remembrallmcp
- Usage typique : stocker des embeddings (vecteurs) et des métadonnées pour permettre des recherches par similarité et la réutilisation d'extraits texte par des agents ou bots.
- Gain pratique : évite de recalculer des embeddings, permet d'attacher auteur/timestamp/tags aux extraits et facilite l'intégration via MCP.

Note méthodologique courte : je m'appuie exclusivement sur les informations identifiées dans le dépôt cité (Rust, PostgreSQL + pgvector, protocole MCP) et je place les recommandations numériques non explicites dans la section Hypotheses / inconnues (dernier bloc).

## Ce que vous allez construire et pourquoi c'est utile

Vous déployez une instance locale (ou de test) de RemembrallMCP : le binaire Rust qui parle MCP et une base PostgreSQL avec l'extension pgvector. Référence du code : https://github.com/cdnsteve/remembrallmcp

Pourquoi c'est utile (extraits vérifiés dans le repo) :
- Couche mémoire persistante en Rust (présence du code en Rust dans le dépôt).
- Stockage dans PostgreSQL avec pgvector pour colonnes vectorielles.
- Interface exposée compatible MCP pour connecter des agents.

Valeur pratique immédiate : recherche par similarité, indexation d'extraits annotés (metadata JSON) et intégration simplifiée dans des pipelines d'agents via MCP (voir le dépôt pour l'API et le protocole : https://github.com/cdnsteve/remembrallmcp).

## Avant de commencer (temps, cout, prerequis)

Prérequis minimaux vérifiés dans le dépôt : accès au code source sur https://github.com/cdnsteve/remembrallmcp, une base PostgreSQL avec possibilité d'activer pgvector, et le code Rust si vous souhaitez compiler.

Table de décision rapide (choix de déploiement)

| Option | Avantage principal | Coût/complexité | Quand choisir |
|---|---:|---:|---|
| Build local Rust | Contrôle total, debug natif | Moyenne (toolchain Rust) | Développement et debugging rapproché |
| Container Docker | Déploiement reproductible | Faible si Docker déjà installé | Tests locaux et CI |
| Managed DB + binaire distant | Moins d'opérationnel | Potentiellement $ | Si on veut externaliser l'opérationnel |

Checklist minimale avant d'installer :
- [ ] Cloner le dépôt : git clone https://github.com/cdnsteve/remembrallmcp
- [ ] Accès à une instance PostgreSQL où activer pgvector
- [ ] Décider build local (Rust) vs image Docker

## Installation et implementation pas a pas

1) Récupérer le code

```bash
git clone https://github.com/cdnsteve/remembrallmcp
cd remembrallmcp
ls -la
```

2) Démarrer PostgreSQL (exemple Docker rapide)

```bash
# remplacer USER,PASS,DBNAME avant exécution
docker run --name rem_pg -e POSTGRES_USER=user -e POSTGRES_PASSWORD=pass -e POSTGRES_DB=db -d -p 5432:5432 postgres:14
```

3) Activer pgvector et préparer le schéma (commande SQL exécutable via psql)

```sql
-- se connecter à la base db puis :
CREATE EXTENSION IF NOT EXISTS pgvector;
-- Créez ensuite les tables attendues par le service en vous référant au README du dépôt
```

4) Construire et lancer le service Rust

- Si vous avez Rust toolchain :

```bash
cargo build --release
./target/release/remembrallmcp --help
```

- Si vous préférez Docker (si le dépôt fournit Dockerfile) :

```bash
docker build -t remembrallmcp .
docker run --rm -e DATABASE_URL="postgres://user:pass@host/db" -p 8080:8080 remembrallmcp
```

5) Configuration et variables d'environnement

- Lisez le README du dépôt sur https://github.com/cdnsteve/remembrallmcp pour les variables attendues (DATABASE_URL, ports, etc.).
- Testez d'abord en local avec un petit corpus (voir section Hypotheses pour tailles recommandées).

## Problemes frequents et correctifs rapides

Référence : code et README du dépôt https://github.com/cdnsteve/remembrallmcp

Symptômes et actions :
- Le service ne démarre pas : vérifier DATABASE_URL, variables d'environnement, logs du binaire ou du conteneur.
- pgvector absent : exécuter CREATE EXTENSION IF NOT EXISTS pgvector; dans la base.
- Erreurs d'authentification DB : vérifier user/password/host et droits de connexion.

Commandes utiles :

```bash
# vérifier tables et connexions
psql "postgres://user:pass@localhost/db" -c "\dt"
# logs (conteneur)
docker logs rem_pg --tail 200
```

Indicateurs opérationnels à surveiller (exemples de métriques) : latence médiane, p95, taux d'erreur 5xx, utilisation CPU/mémoire. Ajustez les seuils en fonction de la charge de vos tests.

## Premier cas d'usage pour une petite equipe

Contexte : une petite équipe ou un fondateur solo veut un bot qui retrouve des commentaires ou notes déjà écrites (PR, design notes, tickets). Le dépôt source pertinent : https://github.com/cdnsteve/remembrallmcp

Conseils concrets pour fondateurs solo / petites équipes (3 actions minimum, actionnables) :

1) Commencer petit et itératif
- Action : indexer 30–200 extraits pertinents (PR, notes, réponses fréquentes) pour un premier test local.
- Pourquoi : réduit le temps d'investissement initial et permet valider la valeur sans infrastructure lourde.

2) Standardiser et documenter le flux d'indexation
- Action : définir un script unique (bash/Python) qui normalise texte, ajoute metadata {author,timestamp,tags} puis envoie les embeddings au service via MCP ou l'API fournie.
- Exemple d'appel (pseudo) à intégrer dans votre pipeline :

```bash
# script d'indexation simplifié
python tools/index.py --source ./exports --db-url "$DATABASE_URL"
```

3) Canary et rollback simples
- Action : déployer en lecture seule sur 10 % du trafic (ou sur un groupe pilote) pendant 24 h, mesurer latence et qualité des retours avant d'activer les écritures.
- Pourquoi : limite le blast radius en cas de mauvais scoring ou fuite de données.

4) Automatiser sauvegarde et ré-indexation
- Action : planifier un dump quotidien des métadonnées et des vecteurs (ou export JSON) et tester la restauration une fois par semaine.

5) Mesurer simplicité d'usage
- Action : créer 5 scénarios utilisateur (rechercher une réponse, trouver auteur, regrouper par tag) et valider qu'au moins 3/5 retournent résultats utiles ; itérer sur le prétraitement.

Checklist rapide pour une petite équipe :
- [ ] Index initial 30–200 extraits
- [ ] Script d'indexation reproductible
- [ ] Canary lecture seule 10 % pendant 24 h

Référence : code et protocole dans le dépôt https://github.com/cdnsteve/remembrallmcp

## Notes techniques (optionnel)

Architecture vérifiée : service Rust ↔ PostgreSQL (+ pgvector) ; interface MCP exposée par le service (voir repo : https://github.com/cdnsteve/remembrallmcp).

Modèle de données (résumé compatible avec le dépôt) :
- text : contenu de l'extrait
- metadata : JSON (auteur, timestamp, tags)
- vector : colonne pgvector

Conseils de performance (général) :
- Créez un index vectoriel adapté à pgvector pour éviter scans complets sur volumes croissants.
- Pour corpus très volumineux (>100k vecteurs), testez partitioning/sharding en environnement contrôlé.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Le dépôt décrit une couche mémoire persistante en Rust utilisant PostgreSQL + pgvector et expose MCP comme protocole d'interface. Source : https://github.com/cdnsteve/remembrallmcp
- Valeurs opérationnelles proposées (à valider en test) :
  - Temps d'installation initial estimé : 30–120 minutes
  - Taille corpus de test initial : 20–500 documents
  - Nombre de requêtes de validation : 20–100 requêtes
  - Canary : 10 % du trafic pendant 24 heures
  - Rétention snapshot recommandée : 7–30 jours
  - Objectifs indicatifs de qualité : recall@10 >= 60 %
  - Objectifs indicatifs de latence : latence médiane <200 ms, p95 <500 ms
  - Seuil pour reconsidérer l'architecture : >100,000 vecteurs

Ces chiffres sont des hypothèses opérationnelles non explicitement listées dans le repo et doivent être validées par vos tests.

### Risques / mitigations

- Risque : exposition de données sensibles. Mitigation : chiffrement au repos, ACL DB, restreindre accès MCP et démarrer en lecture seule.
- Risque : mismatch de modèle d'embeddings entre indexation et requête. Mitigation : standardiser le modèle, documenter sa version et ré-indexer si nécessaire.
- Risque : coût ou latence à grande échelle. Mitigation : surveiller p95 et recall, prévoir rollback et envisager solutions spécialisées si >100k vecteurs.

### Prochaines etapes

1. git clone https://github.com/cdnsteve/remembrallmcp et lire le README pour détails d'implémentation.
2. Démarrer PostgreSQL avec pgvector activé, puis lancer une instance locale du service (build Rust ou image Docker si fournie).
3. Indexer un corpus de test (voir Hypotheses pour tailles) et exécuter 20–100 requêtes de validation pour mesurer recall@10, latence médiane et p95.
4. Lancer un canary lecture seule (par exemple 10 % du trafic) pendant 24 h pour valider comportement avant d'autoriser les écritures.
5. Documenter procédures de sauvegarde, plans de rollback et seuils d'alerte (p95, recall@10, erreurs 5xx).

Pour les détails d'implémentation et exemples fournis par le projet : https://github.com/cdnsteve/remembrallmcp
