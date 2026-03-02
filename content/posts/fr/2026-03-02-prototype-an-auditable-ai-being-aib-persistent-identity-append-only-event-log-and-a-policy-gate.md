---
title: "Prototyper un AIB auditable : identité persistante, journal append-only et une porte de politique"
date: "2026-03-02"
excerpt: "Guide pratique pour assembler un prototype d’« AI Being » (AIB) avec identité persistante, journal immuable d’événements, boucle de comportement et porte de politique pour l’auditabilité. Contient étapes pas-à-pas, scripts et conseils pour petites équipes."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-02-prototype-an-auditable-ai-being-aib-persistent-identity-append-only-event-log-and-a-policy-gate.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "aib"
  - "ia"
  - "audit"
  - "prototype"
  - "identité"
  - "événements"
  - "LLM"
  - "sécurité"
sources:
  - "https://news.ycombinator.com/item?id=47014795"
---

## TL;DR en langage simple

- Objectif : construire en prototype un "AI Being" (AIB) avec une identité persistante et un journal append-only (ajout seulement) pour rendre les actions traçables et responsables. Source : https://news.ycombinator.com/item?id=47014795
- Résultat attendu : chaque décision est enregistrée immuable, signée et horodatée. On peut vérifier qui a fait quoi, quand et pourquoi. Source : https://news.ycombinator.com/item?id=47014795
- Architecture minimale : service d'identité, journal append-only, boucle de comportement, porte de politique, tableau d'audit. But d'itération : pouvoir réécrire un composant en ≤ 4 heures.
- Estimations rapides : prototype local ~4 heures ; alpha 8–24 heures ; coût initial $10–$100 selon usage du LLM (modèle de langage). Canary (test en production limité) : 7 jours avec 5 utilisateurs ; stabilité initiale après ~48 heures. Source : https://news.ycombinator.com/item?id=47014795

Exemple concret : une petite équipe (2 personnes) déploie un assistant persistant. Le service attribue un ID à l'agent, l'agent propose une modification de contenu, l'action est écrite dans events.jsonl avec signature et séquence. Si la décision dépasse un seuil de risque, elle va en revue humaine avant d'être appliquée.

Plain-language rapide : ce guide montre comment assembler un prototype qui garde trace immuable des actions d'un agent AI et qui limite son autonomie pour la rendre vérifiable et sûre.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez assembler un prototype qui démontre trois capacités clés mises en avant dans la discussion : identité persistante, journal append-only et évolution observable (historique vérifiable). Source : https://news.ycombinator.com/item?id=47014795

Composants ciblés :

- Service d'identité (minting + clé de signature).
- Journal append-only (events.jsonl ou table Postgres).
- Boucle de comportement (lit N derniers événements, résume, appelle un LLM — modèle de langage).
- Porte de politique (seuils numériques et file de revue humaine).
- Tableau d'audit en lecture seule.

Tableau décisionnel prototype vs production :

| Composant | Prototype (rapide) | Production (robuste) |
|---|---:|---:|
| Stockage événements | events.jsonl (1 fichier) | Postgres avec séquence (>= 1M lignes) |
| Vérification | script local (ms-level checksum) | CI + snapshots ancrés externes |
| Rotation clés | manuelle | HSM / rotation automatique (30–90 jours) |

Référence : discussion publique sur identité persistante et transparence — https://news.ycombinator.com/item?id=47014795

Plain-language avant détails avancés : les sections suivantes donnent des étapes concrètes pour démarrer. Vous n'avez pas besoin d'une infrastructure complète pour le prototype. Le but est de prouver le concept : un agent identifiable qui écrit des événements signés et dont l'historique peut être vérifié.

## Avant de commencer (temps, cout, prerequis)

Prérequis minimaux : Git, Python 3.10+ ou Node 18+, SQLite ou Postgres, clé API LLM ou runtime local, gestion basique des secrets. Source : https://news.ycombinator.com/item?id=47014795

Estimations et seuils proposés (à valider pendant l'alpha) :

- Prototype bout‑à‑bout : ~4 heures.
- Alpha (quelques utilisateurs) : 8–24 heures de travail.
- Coût initial tests hébergés : $10–$100 selon volume d'appels LLM.
- Canary : 7 jours avec 5 utilisateurs ; monitorer 48 heures pour stabilité.
- Seuils opérationnels proposés : snapshot every 100 entries ; max_event_chain = 10 ; token budget/session = 5000 (fallback 2500) ; SLO écriture >= 99.9% ; alerte mismatch identité > 0.1% sur 24 h.

Source d'inspiration : https://news.ycombinator.com/item?id=47014795

## Installation et implementation pas a pas

1) Bootstrap dépôt et structure (~10 min). Mentionnez la source dans le README: https://news.ycombinator.com/item?id=47014795

```bash
mkdir aib-prototype && cd aib-prototype
git init
mkdir identity events behavior dashboard
cat > README.md <<'MD'
Prototype AIB - identité persistante + journal append-only
Source: https://news.ycombinator.com/item?id=47014795
MD
```

2) Service d'identité minimal (30–90 min)
- Endpoint POST /mint -> { persistent_id, signed_assertion }.
- Pour le prototype, stocker une clé privée locale ; prévoir rotation en production (30–90 jours). HSM = hardware security module (module matériel pour stocker des clés) quand vous passez en production.

3) Journal append-only (20–60 min)
- Option rapide : events.jsonl (1 ligne JSON par événement) avec champs : timestamp ISO, seq (int), actor_id, payload, sha256.

```python
# verify_events.py (esquisse)
import hashlib, json
prev_seq = -1
with open('events/events.jsonl') as f:
    for line in f:
        e = json.loads(line)
        h = hashlib.sha256(json.dumps(e['payload']).encode()).hexdigest()
        assert h == e['sha256']
        assert e['seq'] == prev_seq + 1
        prev_seq = e['seq']
```

Explication : ce script vérifie que chaque événement a un hash correct et que les séquences sont monotones. C'est la base pour garantir l'intégrité du journal.

4) Boucle de comportement (30–120 min)
- Lire N derniers événements (par défaut N = 10).
- Résumer à <= 1024 tokens, appeler LLM avec token budget 5000 (fallback 2500).
- Si policy_gate renvoie score >= 0.8, mettre l'action en revue humaine.

```yaml
# config.yaml (exemple)
trigger_window: 10
token_budget_per_session: 5000
fallback_tokens: 2500
policy_review_threshold: 0.8
max_event_chain: 10
anchor_every: 100
```

Note : LLM signifie large language model (modèle de langage large). Le "budget de tokens" limite la quantité d'informations envoyées au modèle pour contrôler les coûts.

5) Porte de politique & revue humaine (20–90 min)
- Définir motifs interdits + seuil numérique dans policy.json.
- File de revue limitée (taille suggérée : 10). Actions approuvées génèrent un événement signé "approved".

6) Dashboard & ancrage (30–180 min)
- UI lecture seule : afficher les 100 derniers événements (timestamp ISO, seq, actor_id, sha256).
- Ancrer snapshots tous les 100 événements (ou cadence choisie) en stockant le hash du snapshot.

Référence : https://news.ycombinator.com/item?id=47014795

## Problemes frequents et correctifs rapides

- Boucles runaway : détecter auto-triggers répétés. Paramètre conseillé : max_event_chain = 10. Action : couper triggers et revenir à snapshot stable. Source : https://news.ycombinator.com/item?id=47014795

- Logs corrompus : exécuter verify_events.py ; restaurer depuis dernier snapshot ancré ; rejouer depuis snapshot précédent. Cadence d'ancrage recommandée : 100 écritures.

- Dépassement budget tokens : réduire token_budget_per_session (p.ex. 5000 -> 2500) ; activer cache d'embeddings ; raccourcir résumés à <= 1024 tokens.

- Dérive d'identité : rejeter événements si signature invalide ; alerter si taux d'échec > 0.1% sur 24 h.

Scripts recommandés : logs-health-check.sh (vérifie 50 derniers événements), verify_events.py, identity-ci-check.yml.

Source d'orientation : https://news.ycombinator.com/item?id=47014795

## Premier cas d'usage pour une petite equipe

Scénario simple : une équipe de 1–3 personnes veut un assistant persistant qui conserve une identité unique et laisse une trace signée de ses suggestions. Source : https://news.ycombinator.com/item?id=47014795

Conseils concrets pour solo founders / petites équipes (actionables) :

1) Démarrer local et garder les coûts bas
- Utilisez SQLite et events.jsonl pour les 7 premiers jours. Objectif coût local ≤ $20 pour essais. Pilote de 5 utilisateurs en canary recommandé.

2) Prioriser la traçabilité minimale (3 tâches)
- Implémenter mint ID (30–60 min) et écrire une règle : tout événement doit inclure seq (int) et sha256 (vérification automatisée).
- Mettre en place verify_events.py et l'exécuter toutes les 24 h (cron).
- Ancrer snapshots every 100 entries ; conserver 3 backups distincts.

3) Limiter l'autonomie en production
- Fixer max_event_chain = 10 et policy_review_threshold = 0.8.
- Capping LLM : 5000 tokens/session, fallback 2500 tokens.
- Mettre un bouton d'arrêt manuel (kill switch) accessible à une seule personne.

4) Itérer vite : objectif 4 heures pour un prototype fonctionnel
- Tâches prioritaires : identity mint + events log + boucle simple qui lit 10 derniers événements et écrit un nouvel événement signé.

Ces choix réduisent le coût initial ($10–$100), limitent les risques et suivent la logique d'identité persistante et de transparence évoquée sur Hacker News : https://news.ycombinator.com/item?id=47014795

## Notes techniques (optionnel)

- Event sourcing : conservez chaque transition ; snapshot tous les 100 writes pour accélérer les replays. Source : https://news.ycombinator.com/item?id=47014795
- Intégrité : signatures sur événements via clé privée persistante ; vérification via clé publique ; hachage SHA-256 ; séquences monotones.
- LLM : token budget/session = 5000, fallback 2500 ; résumés <= 1024 tokens ; cache embeddings pour réduire coûts.
- Opérations : SLO écriture événements >= 99.9% ; alerte mismatch identité > 0.1% sur 24 h ; profondeur file de revue <= 10.

Référence : discussion sur AIB persistant et transparent — https://news.ycombinator.com/item?id=47014795

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse centrale : le fil met l'accent sur identité persistante et journal immuable comme moyen de rendre un AIB responsabilisable. Source : https://news.ycombinator.com/item?id=47014795
- Hypothèses chiffrées à valider en alpha :
  - Temps d'assemblage prototype : ~4 heures.
  - Alpha stable : 8–24 heures.
  - Coût initial tests hébergés : $10–$100.
  - Token budget/session proposé : 5000 (fallback 2500).
  - Max event chain pour éviter auto-déclenchement : 10.
  - Cadence d'ancrage : every 100 entries.
  - SLO écriture événements cible : >= 99.9%.
  - Canary : 7 jours ; stabilité minimale 48 heures.

Ces valeurs sont des propositions de prototypage inspirées par la discussion publique et doivent être testées en pratique. Source : https://news.ycombinator.com/item?id=47014795

### Risques / mitigations

- Risque : autonomie incontrôlée / boucle runaway (>10 événements auto-générés). Mitigations : max_event_chain = 10 ; flag global de rollout ; script d'arrêt ; file de revue humaine (taille <= 10).
- Risque : corruption des logs. Mitigations : verify_events.py ; snapshots ancrés toutes les 100 écritures ; backups au moins x3.
- Risque : coûts LLM imprévus. Mitigations : caps par session (5000 -> 2500) ; monitoring coûts ; seuil d'alerte $50/jour.
- Risque : compromission clé privée. Mitigations : stocker clés en gestionnaire de secrets / HSM ; rotation 30–90 jours ; playbook d'incident.

### Prochaines etapes

- [ ] Créer et sécuriser les clés de signature (HSM ou gestionnaire de secrets).
- [ ] Démarrer le service d'identité et minter IDs de test (1–2 heures estimées).
- [ ] Lancer un canary de 7 jours avec 5 utilisateurs internes ; monitorer 48 heures de stabilité.
- [ ] Vérifier les hachages d'événements et ancrer toutes les 100 entrées.
- [ ] Préparer un playbook d'incident et la documentation de rotation des secrets.

Commande d'exemple pour rollback (k8s) :

```bash
kubectl set env deployment/aib --containers=aib ROLLOUT_GATE=false
./scripts/mark_canary_failed.sh --reason 'anomaly_rate>1%'
```

Référence finale : discussion communautaire sur la construction d'un AIB persistant et transparent — https://news.ycombinator.com/item?id=47014795
