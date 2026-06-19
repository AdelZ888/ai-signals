---
title: "RootSign : journaux d'audit infalsifiables pour agents IA (open-source)"
date: "2026-06-19"
excerpt: "RootSign est une bibliothèque open-source pour la journalisation infalsifiable des décisions et actions d'agents IA (provenance). Hypothèses : le dépôt peut contenir des intégrations pour CrewAI/LangGraph, un enchaînement de hachage cryptographique (ex. SHA‑256), checkpoints d'approbation humaine, redaction PII et un stockage local Postgres — à vérifier dans le dépôt."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-19-rootsign-cryptographic-tamper-evident-audit-logs-for-crewai-and-langgraph-agents.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "RootSign"
  - "audit"
  - "provenance"
  - "sécurité"
  - "agents IA"
  - "open-source"
sources:
  - "https://github.com/Providex-AI/rootsign"
---

## TL;DR en langage simple

RootSign est une bibliothèque open‑source pour une journalisation « tamper‑evident » des décisions et actions d'agents d'IA (référentiel : https://github.com/Providex-AI/rootsign).

En pratique rapide :
- Cloner le repo et lancer PostgreSQL via Docker (image postgres:15, port 5432).
- Instrumenter 1 endpoint critique et exécuter 100 sessions synthétiques pour un POC local.
- Vérifier l'export JSON et la vérification d'intégrité (objectif initial ≥ 99% de vérifications réussies).

Remarque méthodologique courte : ce guide synthétise le dépôt officiel (https://github.com/Providex-AI/rootsign) et propose un plan POC conservateur.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez ajouter une couche d'audit chaîne‑par‑chaîne autour d'un agent (source : https://github.com/Providex-AI/rootsign). Pour chaque session, RootSign enregistre l'ordre des décisions et, si disponible, les approbations humaines afin de pouvoir :

- Réaliser une traçabilité post‑incident via un export JSON lisible.
- Prouver qu'une approbation humaine a eu lieu avant une action sensible.
- Détecter des falsifications en vérifiant des empreintes/hashes lors de l'audit.

Objectifs chiffrés pour un pilote : 100 sessions, export JSON de chaque session, verification_pass_rate ≥ 99% avant montée en charge.

## Avant de commencer (temps, cout, prerequis)

Estimation pour un POC local (référentiel : https://github.com/Providex-AI/rootsign) :
- Temps développeur : ~90 minutes pour setup initial + 2–5 jours pour intégration CI/CD minimale.
- Collecte pilote : 7 jours pour obtenir 100 sessions si le trafic est faible.
- Coût : $0–50 si vous utilisez une VM ou poste local (Docker, PostgreSQL géré localement).
- Ressources techniques : Git, Docker, PostgreSQL (port 5432), accès au repo https://github.com/Providex-AI/rootsign.

Prérequis logiciels/minima :
- Docker (pour Postgres image postgres:15) ; port 5432 ouvert.
- Python/Node (selon outils fournis dans le repo) pour scripts d'export/validation.
- Une personne responsable (1 ingénieur), 1 relecteur produit.

Checklist rapide :
- [ ] Cloner https://github.com/Providex-AI/rootsign
- [ ] Démarrer Postgres et appliquer migrations
- [ ] Identifier 1 endpoint critique à instrumenter

## Installation et implementation pas a pas

1) Cloner le dépôt et inspecter le README : https://github.com/Providex-AI/rootsign

```bash
git clone https://github.com/Providex-AI/rootsign.git
cd rootsign
ls -la
```

2) Lancer PostgreSQL de test (Docker, image postgres:15, port 5432) :

```bash
docker run --name rootsign-pg -e POSTGRES_PASSWORD=pass -p 5432:5432 -d postgres:15
```

3) Appliquer les migrations trouvées dans le repo (rechercher un dossier migrations/ ou scripts SQL dans https://github.com/Providex-AI/rootsign).

4) Préparer une configuration minimale :

```yaml
# sample-instrumentation-config.yaml
db:
  url: postgresql://postgres:pass@localhost:5432/rootsigndb
  max_connections: 10
instrumentation:
  emit_actions: true
  emit_approvals: true
  retention_days: 7
```

5) Instrumenter 1 endpoint : émettre événements dans l'ordre d'exécution (actions → approbations → export). Testez localement 100 sessions.

6) Exécuter un script de test pour créer 100 sessions synthétiques et générer un export JSON :

```bash
# exécuter 100 sessions synthétiques (exemple)
python tools/run_synthetic_sessions.py --count 100 --output exported_sessions.json
```

7) Vérifier le taux de vérification (exemple) :

```bash
python tools/check_verification_rate.py --input exported_sessions.json
# cible initiale : verification_pass_rate >= 99
```

Notes pratiques : utilisez max_connections = 10 pendant le POC, passez à 10–50 en production selon charge. Conservez une rétention hot de 7 jours pour POC, 30 jours pour production.

## Problemes frequents et correctifs rapides

Source utile : https://github.com/Providex-AI/rootsign

Symptômes fréquents et actions :
- Connexion DB refusée (port 5432) : vérifier que le conteneur tourne, relancer ; tester avec pg_isready.
- Migrations manquantes : localiser migrations/ dans le repo et exécuter les fichiers SQL.
- Échecs de vérification : valider l'ordre d'émission des événements et contrôler le "clock skew" entre services (tolérance recommandée ≤ 500 ms pour les horodatages dans un même datacenter).
- Fuite de PII dans exports : appliquer redaction automatique avant export (par ex. supprimer champs sensibles ≥ 1 marqueur).

Diagnostics rapides :

```bash
docker logs rootsign-pg
pg_isready -h localhost -p 5432
```

Décisions POC vs production :

| Critère | POC (court) | Production (minimum) |
|---|---:|---:|
| Sessions ciblées | 100 sessions | 10 000 sessions/mois |
| Rétention hot | 7 jours | 30 jours |
| Verification pass target | 99% | 99.9% |
| Dépendances | 1 DB (Postgres) | Réplication + backups |

## Premier cas d'usage pour une petite equipe

Contexte : vous êtes un solo‑founder ou une petite équipe (1–3 personnes) et vous voulez une preuve d'approbation pour les escalades traitées par un bot de triage. Référentiel : https://github.com/Providex-AI/rootsign

Plan d'action concret (3+ actions immédiates) :
1) Minimal deploy local (actionable) : clonez le repo et lancez Postgres en Docker (image postgres:15). Objectif : obtenir un export JSON pour 1 session en < 60 minutes.
2) Script d'automatisation (actionable) : créez un script de 100 sessions synthétiques et une assertion simple qui échoue si verification_pass_rate < 99%. Mesurez latence moyenne des opérations d'écriture DB ; cible initiale < 200 ms par écriture.
3) Protection des données (actionable) : redigez un pipeline de redaction qui retire PII avant export — testez sur 10% des sessions manuellement. Chiffrez les exports au repos (AES‑256) et limitez l'accès à ≤ 3 comptes.
4) Déploiement progressif (actionable) : canary à 1% du trafic puis 10% si verification_pass_rate ≥ 99% sur 24h. Si échec, rollback immédiat.
5) Responsibility & coûts : 1 ingénieur responsable, objectif coûts < $50/mois pour le POC; surveillez max_connections et la consommation CPU (alerte si > 70% sur la VM).

Checklist pilote (petite équipe) :
- [ ] Cloner repo : https://github.com/Providex-AI/rootsign
- [ ] Démarrer DB et appliquer migrations
- [ ] Instrumenter 1 endpoint
- [ ] Lancer 100 sessions synthétiques
- [ ] Vérifier verification_pass_rate ≥ 99%
- [ ] Revue manuelle 10% des sessions

## Notes techniques (optionnel)

Référentiel principal : https://github.com/Providex-AI/rootsign

Points techniques à surveiller :
- Métriques clés : verification_pass_rate, missing_hash_count, approvals_per_hour.
- Rétention recommandée (exemples) : POC = 7 jours, production hot = 30 jours, archive = 365 jours.
- Connexions DB : max_connections = 10–50 selon charge ; démarrer à 10 pour le POC.

Commande d'analyse exemple :

```bash
# vérifier le taux de vérification sur les exports (exemple)
python tools/check_verification_rate.py --input exported_sessions.json
```

Assurez‑vous que les scripts de migration et l'outil de vérification existent dans https://github.com/Providex-AI/rootsign avant production.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Confirmé : RootSign est une bibliothèque open‑source pour journalisation tamper‑evident (https://github.com/Providex-AI/rootsign).
- Hypothèse : le dépôt contient des exemples et outils CLI pour export/validation. À confirmer en lisant le repo.
- Hypothèse : intégrations ou adaptateurs pour frameworks d'agent sont disponibles ; à valider.
- Hypothèse : algorithme de hachage (par ex. SHA‑256) et format des empreintes sont documentés dans le code source ; à vérifier.

### Risques / mitigations

- Risque : échecs de vérification à grande échelle. Mitigation : canary 1% → 10% si verification_pass_rate ≥ 99% sur 24–72h.
- Risque : DB = SPOF. Mitigation : utiliser une DB managée avec réplication, backups horaires et pooler ; objectif RTO < 1h.
- Risque : fuite de PII. Mitigation : redaction avant export, chiffrement AES‑256 des exports, accès limité à ≤ 3 comptes initialement.
- Risque : coût inattendu (> $200/mois). Mitigation : monitorer coûts et ramener charges IO si écriture > 500 ops/s.

### Prochaines etapes

- Inspecter le dépôt officiel et confirmer la présence des scripts/migrations : https://github.com/Providex-AI/rootsign
- Créer une branche pilote et instrumenter 1 endpoint. Objectif : 100 sessions et verification_pass_rate ≥ 99%.
- Définir métriques et alertes (alerte si verification_pass_rate < 99%, missing_hash_count > 0, latence d'écriture > 200 ms).
- Rédiger runbook opérationnel et assigner 1 ingénieur responsable + 1 relecteur produit.

Commencez par cloner le dépôt et valider les hypothèses listées avant toute mise en production. Bonne chance.
