---
title: "Implémenter un annuaire consultable de compétences IA à la manière de Clelp avec Next.js et Supabase (notations réservées aux agents)"
date: "2026-02-16"
excerpt: "Tutoriel pas à pas pour créer un annuaire consultable à la manière de Clelp : interface Next.js, catalogue Supabase, API d'ingestion réservée aux agents et démonstration d'un serveur MCP — schéma, scripts de seed et notes de déploiement (contient des hypothèses clairement identifiées)."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-16-implement-a-clelp-style-searchable-ai-skills-directory-with-nextjs-and-supabase-agent-only-ratings.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 360
editorialTemplate: "TUTORIAL"
tags:
  - "next.js"
  - "supabase"
  - "ai"
  - "agents"
  - "clelp"
  - "mcp"
sources:
  - "https://clelp.ai"
---

## TL;DR builders

Ce guide décrit comment prototyper un annuaire consultable de « skills » évalués uniquement par des agents IA, en s'appuyant sur le positionnement public de Clelp (https://clelp.ai). Le site confirme l'idée d'une « review platform where AI rates AI » et mentionne un point d'entrée MCP et un exemple npx — les décisions d'architecture ci‑dessous sont des propositions opérationnelles **marquées comme hypothèses** lorsque non supportées par la source.

Méthodologie : j'appuie les éléments factuels sur l'extrait public de https://clelp.ai ; tout ce qui suit est une proposition technique à adapter et à valider en production.

## Objectif et resultat attendu

Objectif principal : fournir un annuaire consultable dont les évaluations proviennent uniquement d'agents (pas d'interventions humaines), avec recherche texte + filtres (type, catégorie, note minimale) et une API d'ingestion autorisée pour agents. La page Clelp (https://clelp.ai) présente le positionnement « agents qui évaluent des outils IA » et mentionne une API/serveur MCP.

Critères d'acceptation (hypothèses à valider) :

- Prototype seedé ≈ 100 skills disponible en lecture.
- Recherche texte + filtres : latence médiane cible < 100 ms, p95 < 200 ms.
- Endpoint d'ingestion : taux de succès cible > 98 % pour envois valides.
- Leaderboard : top 20 compétences affichées par note pondérée.

Tous les chiffres ci‑dessus sont des cibles proposées et doivent être validés contre vos SLA et contraintes d'infrastructure.

## Stack et prerequis

Note : la landing de Clelp mentionne un serveur MCP et une commande npx (source: https://clelp.ai). Le choix de pile ci‑dessous est une recommandation pratique (HYPOTHÈSE) pour un prototype.

Pile suggérée (hypothèse) :

- Next.js 14+ (SSR / RSC optionnels)
- Node.js 18+
- Supabase (Postgres, Auth, Storage)
- Un shim MCP / binaire npx pour agents

Prérequis opérationnels (hypothèse) :

- Projet Supabase (free tier possible pour prototype jusqu'à ~10k lignes)
- Variables d'environnement : SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_ROLE_KEY, AGENT_SIGNING_KEY
- Gestionnaire de secrets pour clés (KMS) — stocker AGENT_SIGNING_KEY hors repo

Exemple .env (hypothèse) :

```bash
# .env.local (exemple)
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key
AGENT_SIGNING_KEY=agent-private-key
```

Décision rapide — comparaison de méthodes de signature (résumé) :

| Méthode | Simplicité | Rotation | Taille payload |
|---|---:|---:|---:|
| HMAC-SHA256 | 5/5 | 4/5 | petit |
| JWT (RS256) | 4/5 | 5/5 | moyen |

(Chiffrer et choisir selon vos exigences de révocation et rotation.)

## Implementation pas a pas

La feuille de route suivante est une proposition d'implémentation étape par étape. Le site Clelp mentionne l'ingestion par agents et l'exemple npx (source: https://clelp.ai) ; le détail SQL/HTTP ci‑dessous est fourni comme scénario d'implémentation (HYPOTHÈSE).

1) Schéma DB (Supabase/Postgres) — seed ~100 compétences

```sql
-- skills_schema.sql (exemple hypothétique)
create table skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  type text,
  created_at timestamptz default now()
);

create table agent_reviews (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid references skills(id),
  agent_id text not null,
  rating int check (rating between 1 and 5),
  comment text,
  signed_payload jsonb,
  created_at timestamptz default now()
);

create extension if not exists pg_trgm;
create index idx_skills_name_desc_trgm on skills using gin ((coalesce(name,'') || ' ' || coalesce(description,'')) gin_trgm_ops);
```

2) Seeder BDD — générer seed_data.json (~100 entrées) et importer via utilitaire Supabase :

```bash
# commande hypothétique
npx supabase db seed --file seed_data.json
```

3) Endpoint de recherche (Next.js API) — exemple de query SQL (optimiser avec pg_trgm et vues matérialisées si charge > 10k rows) :

```ts
// pages/api/search.ts (snippet hypothétique)
const sql = `select s.*, coalesce(avg(ar.rating),0) as avg_rating
from skills s
left join agent_reviews ar on ar.skill_id = s.id
where (s.name || ' ' || s.description) ilike '%' || $1 || '%'
  and ($2::text is null or s.type = $2)
  and ($3::text is null or s.category = $3)
group by s.id
order by avg_rating desc
limit $4`;
```

4) Endpoint d'ingestion POST /api/ingest — exiger signature HMAC ou JWT, vérifier timestamp (rejeter si |now - ts| > 300 s) et insérer en transaction dans agent_reviews.

Exemple curl (hypothétique) :

```bash
curl -X POST https://your-site.example.com/api/ingest \
  -H "Content-Type: application/json" \
  -H "X-Agent-Signature: sha256=..." \
  -d '{"agent_id":"agent-123","skill_id":"...","rating":5,"comment":"useful","ts":1670000000}'
```

5) Démonstration MCP / shim npx — Clelp mentionne un MCP server et un exemple npx (source: https://clelp.ai). Exemple d'usage hypothétique :

```bash
npx -y clelp-mcp-server --ingest-url=https://your-site.example.com/api/ingest --signing-key=$AGENT_SIGNING_KEY
```

6) Tests & CI : workflow GitHub Actions simple pour exécuter tests et déployer en preview (voir extrait hypothétique ci‑dessous).

```yaml
# .github/workflows/ci.yml (extrait hypothétique)
name: CI
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          node-version: '18'
      - run: pnpm install && pnpm test
```

## Architecture de reference

La landing Clelp confirme l'idée d'un MCP server et d'une ingestion API (source: https://clelp.ai). Le diagramme ci‑dessous est une hypothèse d'architecture pour prototype/scale.

Flux simplifié (hypothèse) : agent -> MCP shim (npx) -> ingestion API -> Supabase -> indexer/workers -> frontend

Tableau coût / échelle (hypothèse pour prototype) :

| Composant | Prototype (coût $/mo) | Échelle cible | Latence cible |
|---|---:|---:|---:|
| Supabase DB | $0–$25 | 100–10k rows | p95 < 200 ms |
| Ingestion API (serverless) | $0–$50 | 5–500 req/day | médiane < 150 ms |
| Frontend (Next.js) | $0–$30 | 10–1 000 vues/day | SSR médiane < 150 ms |

Conseils d'optimisation (hypothèse) : pré‑agréger notes, utiliser materialized views rafraîchies toutes les 6 h, surveiller p95 latencies et slow queries > 500 ms.

## Vue fondateur: ROI et adoption

La proposition de valeur exposée sur https://clelp.ai est de centraliser des évaluations d'outils par des agents, créant un effet réseau (source: https://clelp.ai). Les hypothèses commerciales ci‑dessous doivent être validées par l'équipe produit :

KPI et cibles (hypothèse) :

- Nouveaux agents intégrés / mois : 5 le premier mois, 20 à M6.
- Clés API initiales : restreindre à 50 pour contrôle qualité.
- Vues mensuelles de skills : viser 1 000 vues à M3.
- Top leaderboard : afficher top 20 compétences.

Go‑to‑market (hypothèse) : onboarding privé des premiers N agents, mise en avant sur leaderboard, collecte de 100 à 1 000 tokens de feedback initial.

## Pannes frequentes et debugging

S'appuyer sur les signaux opérationnels et les métriques suivantes (hypothèse) :

- Signatures invalides > 10/jour → probable compromission ou bug client.
- Requêtes anormales > 500 req/h → activer rate limiting et quarantaine.
- Slow query / p95 DB wait > 200 ms ou queries > 500 ms → ajouter index ou revoir plan.

Actions de mitigation (hypothèse) :

- Exiger signature HMAC/JWT ; rejeter si timestamp older than 300 s.
- Reindex toutes les 6 h ; refresh complet si CTR chute > 20 %.
- Pool de connexions DB et alerte si connexions utilisées > 80 %.

Checklist rapide de debugging (hypothèse) :

- Vérifier logs ingestion (erreurs de vérification de signature).
- Analyser slow query logs (queries > 500 ms).
- Contrôler âge des vues matérialisées et forcer refresh si nécessaire.

(Source du positionnement MCP/ingest : https://clelp.ai)

## Checklist production

### Hypotheses / inconnues

- Hypothèse : les agents soumettront des reviews via MCP/shim npx (la page Clelp mentionne un MCP server et un exemple npx : https://clelp.ai). Documenter format et authentification exacts.
- Hypothèse : la free tier de Supabase supporte le prototype (jusqu'à ~10k lignes) ; vérifier quotas réels.
- Inconnue : exigences précises UK GDPR applicables à votre cas (consulter votre DPO si données personnelles traitées).

### Risques / mitigations

- Risque : compromission de la clé de signature. Mitigation : rotation régulière, liste de révocation, révocation automatique (plan de rollback) ; garder rotation < 30 jours.
- Risque : spam / faux agents. Mitigation : vetting initial, rate limiting (par clé → 500 req/h), anomalies detection, quarantaine automatique.
- Risque : dégradation recherche. Mitigation : monitorer CTR et latences p95 (< 200 ms cible), reindex si chute > 20 %.

Checklist avant ouverture publique (hypothèse) :

- [ ] Stocker AGENT_SIGNING_KEY dans KMS/secret manager
- [ ] Limiter ingestion aux agents feature-flagged (N initial = 50)
- [ ] Backup DB et test de restore (objectif restore < 30 minutes)
- [ ] Configurer monitoring : p95 latency < 200 ms, ingestion success rate > 98 %, connexions DB < 80 %
- [ ] Publier Terms & Privacy (vérifier conformité UK)

### Prochaines etapes

- Lancer canary 48 h avec 5 agents et mesurer : ingestion success >= 98 %, p95 latency < 300 ms (objectif initial).
- Monter à 50 agents puis ramp‑up public sur 7 jours via feature flags (10% → 50% → 100%).
- Introduire pondération avancée du ranking : décay temporel, qualité d'agent, signaux comportementaux.

Référence / inspiration principale : https://clelp.ai (positionnement « agents that rate AI tools », mention MCP/npx).
