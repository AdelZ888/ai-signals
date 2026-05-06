---
title: "Postbrain : mémoire longue durée orientée équipe pour agents IA de programmation (PostgreSQL + pg_vector)"
date: "2026-05-06"
excerpt: "Guide pratique en français (contexte US) pour exécuter Postbrain en local : mémoire d'équipe pour agents de code, basée sur PostgreSQL et pg_vector. Couvre installation, ingestion, problèmes fréquents et checklist de mise en production."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-06-postbrain-team-focused-long-term-memory-for-ai-coding-agents-postgresql-pgvector.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "postbrain"
  - "postgresql"
  - "pg_vector"
  - "mémoire-longue-durée"
  - "agents-IA"
  - "développement"
  - "guide-pratique"
sources:
  - "https://github.com/simplyblock/postbrain"
---

## TL;DR en langage simple

- Quoi : Postbrain est une mémoire longue pour agents de programmation. Il stocke des textes courts et leurs embeddings dans PostgreSQL avec pg_vector. (Source : https://github.com/simplyblock/postbrain)
- Pourquoi : l'agent récupère des règles et décisions partagées. Moins de répétitions. Économie de tokens et de temps.
- Résultat rapide : démo locale en ~120 minutes (2 h). Seed initial recommandé : 10 mémoires. Cible petite équipe : 1–4 personnes. (Source : https://github.com/simplyblock/postbrain)
- Prudence : prototype. Gardez local ou en staging. Ajoutez sauvegardes, ACLs (contrôles d'accès) et monitoring avant production. (Source : https://github.com/simplyblock/postbrain)

Exemple concret : une équipe produit stocke 10 règles de style et décisions d'API. Un agent interroge Postbrain pour répondre aux questions d'onboarding. Résultat : moins d'interruptions pour les développeurs seniors.

Plain-language explanation (avant les détails avancés) : Postbrain est essentiellement une base de connaissances optimisée pour la similarité sémantique. Vous installez une base PostgreSQL, activez l'extension pg_vector, exécutez les migrations du dépôt et vous pouvez ensuite stocker et rechercher des « mémoires » par similarité d'embedding. Les étapes suivantes expliquent précisément comment faire.

## Ce que vous allez construire et pourquoi c'est utile

Vous déployez une instance Postbrain locale. Elle repose sur PostgreSQL (base de données relationnelle) et l'extension pg_vector pour stocker des embeddings (vecteurs numériques qui représentent du texte). Le dépôt indique « built on Vela (with PostgreSQL and pg_vector) ». (Source : https://github.com/simplyblock/postbrain)

Ce que vous obtenez en pratique :
- Un magasin consultable de « mémoires » d'équipe. Démarrage : ~10 items. Montée en charge : 100+ items possible.
- Scopes et artefacts pour grouper par projet ou équipe.
- Un chemin pour promouvoir des éléments fréquemment utilisés vers des artefacts partagés.

Comparaison rapide (décision de promotion) :

| Stratégie | Seuil frequency | Seuil importance | Intervention humaine |
|---|---:|---:|---|
| Promotion manuelle | >= 3 | >= 0.75 | Oui (reviseur) |
| Promotion automatique | >= 5 | >= 0.85 | Optionnel (audit requis) |

Réglages suggérés (points de départ) : frequency >= 3, importance_score >= 0.75, retention = 365 jours, embedding dim = 1536. Validez ces chiffres sur vos 10–100 premiers items. (Source : https://github.com/simplyblock/postbrain)

## Avant de commencer (temps, cout, prerequis)

Temps estimé :
- Démo locale : ~120 minutes (2 h).
- Préparer un staging durci : +4–8 heures.

Coûts (estimation) :
- Local avec Docker : $0 (logiciels libres).
- Production managée : $20–$500+/mois selon CPU (unité centrale), stockage et sauvegardes.

Matériel local minimum recommandé : 4 cœurs CPU, 8 Go RAM, 5 Go disque.
Objectifs de performance pour petit dataset (10–100 items) : latence p95 (95e percentile) < 200 ms. Latence cible 50–200 ms.

Prérequis techniques : Git, Docker (Engine >= 20.10), Docker Compose, psql (client PostgreSQL), Node.js ou Python pour les exemples. (Source : https://github.com/simplyblock/postbrain)

Pre-flight checklist :
- [ ] git clone https://github.com/simplyblock/postbrain
- [ ] Docker installé et en fonctionnement
- [ ] Docker Compose disponible
- [ ] Accès psql vers le container vérifié

## Installation et implementation pas a pas

Plan général : démarrer PostgreSQL via Docker Compose, activer pg_vector, lancer les migrations (créent tables memories, artifacts, scopes), lancer le service d'exemple, ingérer 10–100 mémoires, valider la recherche sémantique. (Source : https://github.com/simplyblock/postbrain)

1) Cloner le dépôt et inspecter le README/migrations :

```bash
git clone https://github.com/simplyblock/postbrain
cd postbrain
ls -la
cat README.md
```

2) Exemple minimal de docker-compose (expose Postgres sur 5432) :

```yaml
# docker-compose.yml (minimal)
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: example
    ports:
      - "5432:5432"
    volumes:
      - ./pgdata:/var/lib/postgresql/data
```

Explication : ce fichier démarre un container Postgres 15. Il mappe le port 5432 et persiste les données dans ./pgdata.

3) Démarrer DB et activer pg_vector :

```bash
docker compose up -d db
# activer l'extension vector dans Postgres
docker exec -it $(docker ps -qf "ancestor=postgres:15") \
  psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

Explication : la commande CREATE EXTENSION installe pg_vector. Vérifiez l'installation avec \dx dans psql.

4) Lancer les migrations fournies (elles créent memories, artifacts, scopes). Inspectez les fichiers de migrations avant exécution. (Source : https://github.com/simplyblock/postbrain)

5) Démarrer le service d'exemple (selon le langage du dépôt) :

```bash
# exemple JS
npm install && npm run start
# ou Python
pip install -r requirements.txt && python app.py
```

Explication : suivez le README du dépôt pour le script exact. Le service d'exemple expose des endpoints pour insérer et rechercher des mémoires.

6) Ingestion initiale : seed ~10 mémoires (<500 tokens chacune). Exemple SQL d'insertion (adapter au schéma réel) :

```sql
INSERT INTO memories (scope_id, text, importance_score, frequency)
VALUES ('project-1', 'Adopter 2-space indentation pour JS', 0.8, 1);
```

Explication : adaptez les colonnes au schéma créé par les migrations. Conservez des items courts pour tester la recherche sémantique.

7) Valider une requête sémantique et mesurer latence sur 10–100 items :

```sql
EXPLAIN ANALYZE
SELECT id, text FROM memories
ORDER BY embedding <-> '[0.01,0.02,...]'::vector
LIMIT 5;
```

Explication : la clause <-> calcule la distance de similarité. EXPLAIN ANALYZE montre le temps d'exécution.

Gates de déploiement suggérés : canary 5% pendant 24 h -> 25% pendant 48 h -> 100% si p95 < 200 ms et recall >= 0.8. Rollback si p95 > 500 ms ou recall < 0.6.

## Problemes frequents et correctifs rapides

(Source de référence : https://github.com/simplyblock/postbrain)

- pg_vector manquant
  - Correctif : psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS vector;". Vérifier avec \dx dans psql.
- Connexion DB refusée
  - Correctif : vérifier POSTGRES_PASSWORD, port 5432, état du container et logs (docker compose logs db).
- Requêtes de similarité lentes sur grands jeux
  - Vérifier dimension embedding (ex. vector(1536)). Exécuter EXPLAIN ANALYZE sur un jeu de 10–100 items. Ajuster index (ivfflat/hnsw) et paramètres. Objectif p95 < 200 ms pour petits datasets.
- Mémoires mal scoppées
  - Correctif : valider scope_hierarchy et les requêtes parent/enfant dans les migrations et le code.

Checklist dépannage rapide :
- [ ] Confirmer extension installée (\dx)
- [ ] Lancer migrations sans erreur
- [ ] Tester requête sémantique avec EXPLAIN ANALYZE
- [ ] Canary à 5% avant déploiement complet

## Premier cas d'usage pour une petite equipe

Cible : fondateurs solo et équipes 1–4 personnes. (Source : https://github.com/simplyblock/postbrain)

Plan de démarrage chiffré :
1) Lancer la démo locale : ~120 minutes.
2) Seed initial : 10 mémoires à forte valeur, <500 tokens chacune.
3) Politique de promotion : réviseur humain obligatoire 2 semaines ; promouvoir si frequency >= 3 ou importance_score >= 0.75.
4) Job hebdomadaire pour recalculer frequency et importance (1x/semaine).
5) Mesurer impact sur 14 jours : cible réduction de 30% des questions d'onboarding et >= 70% taux de référence d'artefacts.

Checklist de déploiement simple :
- [ ] Lancer démo locale (120 minutes)
- [ ] Seed 10 mémoires (<500 tokens)
- [ ] Désigner un réviseur pour promotions
- [ ] Lancer job hebdomadaire de recalcul

Référence des seeds et migrations : https://github.com/simplyblock/postbrain

## Notes techniques (optionnel)

- Le dépôt précise « Long-term memory for AI coding agents ... built on Vela (with PostgreSQL and pg_vector). » (Source : https://github.com/simplyblock/postbrain)
- Inspectez le dossier migrations pour confirmer la présence des tables core (memories, artifacts, scopes, scope_hierarchy) avant d'insérer des données. (Source : https://github.com/simplyblock/postbrain)
- Si vous ajoutez une colonne embedding, confirmez la dimension (ex. 1536) et créez l'index adapté (ivfflat ou hnsw). Survol d'exemple :

```sql
ALTER TABLE memories ADD COLUMN IF NOT EXISTS embedding vector(1536);
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON memories USING ivfflat (embedding);
```

- Surveillez p95 (objectif < 200 ms), recall (objectif >= 0.8) et coûts mensuels (estimation $20–$500+/mois selon plan). Ces chiffres sont des points de départ à valider.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues
- Le dépôt contient scripts de migration et exemples d'API pour memories, artifacts et scopes : https://github.com/simplyblock/postbrain (validez localement).
- pg_vector peut être activé avec CREATE EXTENSION IF NOT EXISTS vector; dans Postgres.
- Les seuils numériques proposés (frequency >= 3, importance_score >= 0.75, retention = 365 jours, dim embedding = 1536) sont des points de départ. Testez-les sur 10–100 items.
- Les objectifs de perf (p95 < 200 ms) et gates (canary 5%) sont des recommandations à valider.

### Risques / mitigations
- Perte de données ou promotions erronées.
  - Mitigation : réviseur humain 2–4 semaines ; sauvegardes quotidiennes et PITR (point-in-time recovery).
- Pics de latence à l'échelle.
  - Mitigation : canary 5% pendant 24 h -> 25% pendant 48 h ; augmenter CPU DB >= 8 cœurs si nécessaire ; surveiller p95 et I/O ; rollback si p95 > 500 ms.
- Fuite de données/confidentialité.
  - Mitigation : ACLs (contrôles d'accès) sur scopes, chiffrement au repos et audit logging avant ouverture publique.

### Prochaines etapes
- Durcir la DB : backups quotidiens + PITR, pgbouncer, dashboards de monitoring (latence, I/O, requêtes lentes).
- Sécurité & accès : ACLs sur scopes, trails d'audit pour promotions, contrôle des accès API.
- Rétention & tests : fixer rétention par défaut (365 jours) ; ajouter tests E2E (end-to-end) pour promotion d'artefacts et précision sémantique sur jeu de validation (10–100 items).
- Gates de production : canary 5% -> 25% pendant 48 h -> 100% ; rollback si p95 > 500 ms ou recall < 0.6.

Checklist finale de production :
- [ ] Sauvegardes configurées (daily + PITR)
- [ ] ACLs et audit logging activés
- [ ] Tests de performance : p95 < 200 ms attendu
- [ ] Précision recall >= 0.8 sur jeu de validation (10–100 items)

Pour le code canonique, les migrations et les exemples, voir le dépôt principal : https://github.com/simplyblock/postbrain
