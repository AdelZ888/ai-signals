# AI Signals v2 — Hub de données sur les modèles d'IA

- **Date :** 2026-10-11
- **Statut :** spec à valider
- **Repo :** `AdelZ888/ai-signals` — domaine `aisignals.dev` — hébergement Vercel

---

## 1. Contexte

AI Signals est aujourd'hui un blog IA 100 % automatisé : ~2 articles/jour (news réécrites + tutoriels) générés par `gpt-5-mini`, en miroir EN/FR, soit **946 pages en 8 mois**. Résultat : zéro visiteur.

Diagnostic :

- **Contenu.** Chaque article réécrit une seule source (ex. un article BBC), recopie l'URL source après chaque puce et se remplit de sections génériques. C'est le profil exact du *scaled content abuse* que Google déclasse, et le lecteur préfère la source originale.
- **Design.** Rejeté par le propriétaire.
- **Pipeline** (état au 2026-10-11) :
  - ~15 % des runs `Auto Publish AI Blog` restent bloqués 6h puis sont annulés, et l'article généré est perdu. `scripts/automate.mjs` ne fait jamais `process.exit()` ; le pipeline tuto, qui passe par `discover-topics.mjs` (avec `process.exit(0)`), n'a jamais bloqué.
  - Les pushes n'ont pas de retry (perte d'un article sur un 500 GitHub le 2026-10-07).
  - Les 3 workflows X échouent depuis le 2026-05-19 (`402 credits depleted`) sans alerte, car ils sont absents de `alert-on-failure.yml`.
  - La newsletter a été envoyée une seule fois, à 0 destinataire.

## 2. Objectifs

| | |
|---|---|
| 🎯 Objectif | Revenu passif via le trafic organique Google (pub display ; affiliation plus tard) |
| ⏱️ Temps humain | **Zéro** en régime de croisière : tout est automatique |
| 🌍 Marché | **Anglais uniquement** |
| 🧠 Thème | Prix et specs des modèles d'IA, mis à jour chaque jour |
| 📈 Succès | Pages indexées, puis trafic organique en croissance mois après mois, puis validation AdSense et premiers revenus |

**Hors périmètre (v1) :** français, X/Twitter, page services et formulaire de leads, tutoriels, images générées par IA, benchmarks, affiliation, comptes utilisateurs.

## 3. Décisions validées

| Sujet | Décision |
|---|---|
| Approche | Hub de données programmatique (approche A) |
| Direction visuelle | **Terminal** : sombre, monospace, dense |
| Fiche modèle | Dashboard 2 colonnes sur desktop, rapport 1 colonne sur mobile ; toggle desktop mémorisé en `localStorage` |
| Thème | Sombre uniquement |
| Anciennes pages | Supprimées, réponse `410 Gone` |
| Services / leads | Supprimés |
| X | Supprimé (3 workflows + script + dépendance) |
| Visuels Gemini / Vercel Blob | Supprimés |
| Modèle de rédaction | **`gpt-6.1-sol`** (présence vérifiée sur le compte OpenAI le 2026-10-11) |
| Choix des sujets | Score de "cliquabilité" déterministe (§7.1) |
| Newsletter | Gardée : digest hebdo automatique (abonnés Beehiiv, envoi Resend, mécanisme actuel réutilisé) |

## 4. Architecture

```
                   ┌──────────────── GitHub Actions ────────────────┐
models.dev (MIT) ─►│ refresh-data (quotidien)                        │
genai-prices (MIT)►│  fetch → validate → normalize → diff → events   │──► commit data/ ──► Vercel build (SSG)
                   │ editorial (quotidien, après refresh)            │
                   │  events → score → article flash (gpt-6.1-sol)   │──► commit content/
                   │ weekly-digest (lundi)                           │──► commit + newsletter (Resend)
                   │ health-check (6h) · alert-on-failure (tous)     │
                   └─────────────────────────────────────────────────┘
```

Il n'y a ni base de données ni serveur applicatif : les données vivent dans le repo et tout le site est généré en statique à chaque build.

Unités de code (une responsabilité par unité, testable seule) :

Tout le code est en TypeScript. La logique pure vit dans `src/lib/`, avec des imports relatifs suffixés `.ts`. Elle est partagée entre le site Next.js et les scripts, que Node 24 exécute directement grâce au type stripping.

| Unité | Rôle | Entrée → sortie |
|---|---|---|
| `src/lib/data/normalize.ts` | Filtrer et normaliser | JSON models.dev → `Model[]` |
| `src/lib/data/validate.ts` | Garde-fous | `Model[]` + veille → ok / erreurs |
| `src/lib/data/diff.ts` | Détecter les changements | veille + jour → `Event[]` |
| `src/lib/data/crosscheck.ts` | Contrôle croisé genai-prices | `Model[]` + genai-prices → warnings |
| `src/lib/data/store.ts` | Lire et écrire `data/models/*` | fichiers ↔ objets |
| `scripts/data/refresh.ts` | Orchestrer (avec `process.exit` explicite) | — |
| `scripts/data/backfill-history.ts` | Reconstituer l'historique (one-shot) | git de models.dev → `history/` |
| `src/lib/editorial/score.ts` | Scorer les événements | `Event[]` → `ScoredEvent[]` |
| `src/lib/editorial/factsheet.ts` / `guards.ts` | Fact sheet, filtre de titres, grounding | données → JSON / verdicts |
| `scripts/editorial/run.ts` | Rédiger un article flash | événements → markdown validé |
| `scripts/editorial/weekly-digest.ts` | Récap hebdo + newsletter | événements de la semaine → markdown + email |
| `src/lib/site/catalog.ts` | Lecture des données côté site | `data/models/*` → helpers typés |
| `src/lib/site/selection.ts` | Paires de comparatifs, classements, alternatives | `Model[]` → listes |

`scripts/generate-post.mjs` (2 474 lignes) n'est pas réutilisé.

## 5. Données

### 5.1 Sources

| Source | Licence | Usage |
|---|---|---|
| **models.dev** — `https://models.dev/api.json` (repo `sst/models.dev`) | MIT | **Source principale** : 226 fournisseurs, ~8 500 entrées. Fournit prix (input, output, cache, paliers de contexte), limites, modalités, date de sortie, coupure des connaissances, `open_weights`, `reasoning`, `tool_call`, `structured_output`, `status`, `family`, `canonical_model_id` |
| **pydantic/genai-prices** | MIT | Contrôle croisé des prix des labs majeurs. Un écart de plus de 5 % est loggé en warning, sans être bloquant |

**OpenRouter est exclu** : ses CGU (§7 et §12) interdisent de copier ou réutiliser leurs données. L'attribution "Data: models.dev (MIT)" figure en footer et sur `/about`, avec la notice de licence.

### 5.2 Périmètre

- **Modèles :** sortie texte (LLM, entrée multimodale incluse), avec `cost.input` et `cost.output` définis. Exclus en v1 : embeddings, image, audio, realtime.
- **Identité d'un modèle :** le `canonical_model_id` de models.dev (`lab/model`). Si une entrée d'un fournisseur first-party n'en a pas, on utilise `lab/id`.
- **Labs** (préfixes canoniques, vérifiés le 2026-10-11) : `openai, anthropic, google, xai, mistral, deepseek, alibaba, zhipuai, moonshotai, minimax, cohere, meta`. Le fournisseur first-party porte le même ID que le lab, sauf `zhipuai → zai`.
- **Prix de référence :** celui de l'entrée first-party si elle existe avec un coût > 0. Sinon, le prix le plus bas parmi les hébergeurs de l'allow-list ; c'est le cas des modèles open-weights comme Gemma ou Llama, avec l'affichage "from $X via {host}".
- **Hébergeurs (tableau "prix par hébergeur") :** allow-list `amazon-bedrock, azure, google-vertex, togetherai, fireworks-ai, deepinfra, groq, cerebras, nebius, baseten, novita-ai, cloudflare-workers-ai, nvidia, scaleway`. Tous ces IDs ont été vérifiés.
- **Exclus :** passerelles et revendeurs (`openrouter, nano-gpt, llmgateway*, vercel, kilo, edenai, requesty, poe, …`) et plans `*-cn`. Seule l'allow-list compte : un fournisseur absent est ignoré.
- **Snapshots datés** (`claude-opus-4-5-20251101`, `qwen3-…-2507`) : fusionnés comme alias du modèle de base quand celui-ci existe avec des prix identiques.
- **Volume mesuré le 2026-10-11 :** 296 modèles (228 avec un prix first-party, 68 via hébergeurs uniquement), avant fusion des snapshots. models.dev ne fournit pas de prix "batch" : il n'y en a pas en v1.

### 5.3 Schéma normalisé

```ts
type Model = {
  slug: string;              // "claude-haiku-5-5"
  lab: string;               // "anthropic"
  name: string;              // "Claude Haiku 5.5"
  family: string | null;
  releaseDate: string | null;      // ISO
  knowledgeCutoff: string | null;
  status: "active" | "deprecated" | "beta";
  openWeights: boolean;
  price: {                   // USD par 1M tokens
    input: number; output: number;
    cacheRead?: number; cacheWrite?: number;
    tiers?: { minContext: number; input: number; output: number }[];
  };
  blended: number;           // (3*input + output) / 4 — sert aux tris et aux "vs"
  context: number; maxOutput: number | null;
  modalitiesIn: string[];    // text, image, pdf, audio, video
  priceSource: string;       // fournisseur du prix de référence ("anthropic", "togetherai"…)
  capabilities: { reasoning: boolean; toolCall: boolean; structuredOutput: boolean };
  hosts: { provider: string; input: number; output: number }[];
  aliases: string[];
};

type Event = {
  date: string; slug: string; lab: string;
  type: "new_model" | "price_change" | "context_change" | "deprecated" | "removed";
  before?: Partial<Model>; after?: Partial<Model>;
  pctChange?: number;        // pour price_change, sur `blended`
};
```

### 5.4 Stockage (dans le repo)

```
data/models/latest.json            # Model[] du jour
data/models/history/YYYY-MM.jsonl  # Event[] en ajout uniquement
data/models/meta.json              # lastSuccessAt, sourceCommit, counts
```

### 5.5 Historique au lancement (backfill)

Le repo `sst/models.dev` contient un fichier TOML par modèle, versionné depuis 2025-06 (ex. 11 commits sur `claude-haiku-4-5.toml`). `backfill-history.mjs` parcourt l'historique git des fichiers des labs de l'allow-list, extrait les prix et génère les `Event[]` passés. **Les courbes d'historique ne seront donc pas vides au lancement.** Ce script est exécuté une seule fois, puis versionné pour pouvoir être rejoué. Il est time-boxé : si la structure TOML a trop varié, on lance avec un historique partiel.

### 5.6 Garde-fous (`validate.mjs`)

Le refresh est abandonné **sans rien écrire**, avec une alerte, si :

- le nombre de modèles dans le périmètre baisse de plus de 20 % par rapport à la veille ;
- un prix est négatif, non numérique, ou dépasse 1 000 $/1M ;
- plus de 30 % des modèles changent de prix le même jour ;
- la source est indisponible ou n'est pas du JSON valide.

## 6. Pages

| Type | Route | Volume estimé | Contenu clé | Indexation |
|---|---|---|---|---|
| Accueil | `/` | 1 | Recherche, tableau des modèles populaires, derniers changements, plus fortes variations | index |
| Index | `/models`, `/providers`, `/compare`, `/best` | 4 | Listes complètes, indispensables pour que Google découvre toutes les pages | index |
| Fiche modèle | `/models/[lab]/[slug]` | ~300-400 | Chiffres clés, historique des prix (SVG), calculateur, prix par hébergeur (open-weights), alternatives, liens "vs", FAQ factuelle, bannière si déprécié (+ successeur) | `noindex` si données incomplètes (pas de prix ou pas de contexte) |
| Fournisseur | `/providers/[lab]` | ~12 | Tous ses modèles, fourchette de prix, chronologie des sorties | index |
| Comparatif | `/compare/[a]-vs-[b]` | ≤ 300 | Tableau côte à côte, coûts sur 3 scénarios types, verdict factuel calculé | index ; ordre alphabétique canonique, `b-vs-a` redirige en permanent (308 via `permanentRedirect`, traité comme un 301 par Google) |
| Classement | `/best/[slug]` | ~15-20 | Liste triée par règle | `noindex` si moins de 5 entrées |
| Calculateur | `/calculator` | 1 | Tokens in/out et volume → coût comparé sur tous les modèles (composant client) | index |
| Changements | `/changes` | 1 | Flux de tous les `Event`, paginé | index |
| Articles | `/news` + `/news/[slug]` | ≤ 4/semaine + 1 digest | Liste paginée, articles flash et digest hebdo (§7) | index |
| Newsletter | `/newsletter` + formulaire en footer | 1 | Inscription au digest hebdo ; les routes `api/newsletter/subscribe` et `api/newsletter/unsubscribe` sont conservées | index |
| À propos | `/about` | 1 | Méthodologie, sources, licence, mentions légales | index |

**Sélection des comparatifs** (`selection.ts`, déterministe) :

1. Pool "notable" : labs de l'allow-list, statut actif, sortie depuis moins de 18 mois, le modèle le plus récent de chaque `family`.
2. Paires dans la même tranche de prix (`blended` < 0,5 $ / 0,5-3 $ / > 3 $), entre labs différents.
3. Chaque nouveau modèle face à son prédécesseur (même famille) et face à ses 3 concurrents les plus proches en `blended`.
4. Plafond de 300 paires ; priorité aux paires de labs tier 1 (§7.1).

**Classements v1 :** `cheapest-llm-api`, `cheapest-vision-model`, `cheapest-reasoning-model`, `longest-context-window`, `cheapest-1m-context-model`, `best-open-weights-models`, `cheapest-tool-calling-model`, `cheapest-structured-output-model`, `cheapest-gpt-alternative`, `cheapest-claude-alternative`, `cheapest-gemini-alternative`, `newest-ai-models`.

**Alternatives d'une fiche modèle :** les 3-5 modèles actifs avec des capacités ≥ (modalités, raisonnement, tool calling) et un contexte ≥ 50 % de celui du modèle, triés par `blended` croissant.

## 7. Moteur éditorial

### 7.1 Score de cliquabilité

Chaque `Event` reçoit un score (0-100) **déterministe et testé** :

| Critère | Points |
|---|---|
| Lab tier 1 (`openai, anthropic, google, xai, deepseek, meta, mistral, alibaba`) | +40 |
| Lab tier 2 (le reste de l'allow-list) | +15 |
| `new_model` d'une nouvelle génération (numéro de version supérieur dans la famille) | +30 |
| `new_model` simple (nouvelle taille ou variante "mini/flash" d'une famille connue) | +15 |
| `price_change` : ≥ 50 % / ≥ 20 % / ≥ 10 % | +30 / +20 / +10 |
| Accroche "moins cher qu'un modèle phare tier 1 de même classe" | +15 |
| `context_change` ≥ ×2 | +10 |
| Snapshot daté, variante batch/free/exp, statut beta | exclu |

- **Score ≥ 60 :** article flash. **Sinon :** l'événement figure seulement dans le digest hebdo et sur `/changes`.
- **Plafonds anti-volume :** 1 article flash par jour et 4 par semaine au maximum, en priorisant le score le plus élevé. L'objectif est la qualité, pas le volume.
- Les poids sont des constantes dans `score.mjs`, ajustables sans toucher au reste.

### 7.2 Article flash

1. **Fact sheet** (JSON) construite **uniquement à partir de nos données** : l'événement, le modèle avant/après, les 3 concurrents directs, les coûts sur 3 scénarios (chatbot 10M/2M, RAG 50M/5M, agent 20M/10M tokens par mois), et l'historique.
2. **Titres :** `gpt-6.1-sol` propose 5 titres. Un filtre déterministe rejette ceux qui contiennent un nombre absent de la fact sheet, un superlatif non démontré par les données ("cheapest" doit être vrai dans le pool), ou un motif putaclic interdit (`you won't believe`, `shocking`, `insane`, `!!`…). Parmi les titres restants, on garde celui qui contient le nom du modèle, un chiffre concret et une comparaison. Exemple : *"Claude Haiku 5.5 Cuts Prices 20%: Now Cheaper Than GPT-6.1 Mini"*. On vise le clic par la précision, jamais par la tromperie.
3. **Corps** (400-700 mots, anglais) : écrit par `gpt-6.1-sol` à partir de la fact sheet. Structure : ce qui a changé, ce que ça coûte en pratique (tableau des scénarios), comparaison avec les concurrents, à qui ça s'adresse, liens internes vers la fiche modèle et les comparatifs.
4. **Validation de grounding** : chaque nombre de l'article doit exister dans la fact sheet, aux arrondis près. En cas d'échec, une passe de réparation ; si l'échec persiste, on publie une **version template sans LLM** (tableaux et phrases générées à partir des données).
5. **Coût estimé :** moins de 0,10 $ par article, et moins de 2 $ par mois au total.

### 7.3 Digest hebdomadaire

Chaque lundi : un article `/news/weekly-ai-pricing-YYYY-wNN` qui liste tous les événements de la semaine (tableaux générés à partir des données). L'intro de 2-3 phrases est écrite par `gpt-6.1-sol` et soumise à la même validation de grounding. Le même contenu est envoyé aux abonnés de la newsletter.

### 7.4 Configuration OpenAI

`OPENAI_MODEL=gpt-6.1-sol`, avec un `timeout` de 120 s et 3 retries. Si l'appel LLM échoue, on bascule sur la version template, et un article ne se perd jamais. Les embeddings de déduplication sont supprimés : la déduplication se fait par `slug` + type d'événement.

## 8. Design system

| Token | Valeur |
|---|---|
| `--bg` | `#0a0e0b` |
| `--fg` | `#c8f5d8` |
| `--fg-strong` | `#e9fff1` |
| `--muted` | `#7ea58c` |
| `--dim` | `#4f6e5a` |
| `--line` | `#1d2a21` |
| `--line-soft` | `#121a15` |
| `--accent` / baisse de prix | `#22c55e` |
| hausse de prix | `#f97316` |
| tag "prix" | `#f59e0b` |

- **Typo :** JetBrains Mono via `next/font` (auto-hébergée), chiffres tabulaires. Pour la prose : `max-width: 72ch` et `line-height: 1.7`.
- **Composants :** `TerminalNav` (logo `> ai_signals_`), `Box` (titre `// …`), `StatGrid`, `DataTable` (triable côté client sur les pages liste), `PriceChart` (SVG serveur, sans librairie), `CostCalculator` (client), `EventFeed`, `LayoutToggle`, `AdSlot`, `FaqList`.
- **Toggle de mise en page :** un seul HTML, deux grilles CSS (`data-layout="dashboard|report"` sur le conteneur). Le défaut est `dashboard` à partir de 1 024 px et `report` en dessous. Le toggle n'est visible que sur desktop et son choix est stocké en `localStorage` (lecture et écriture dans un try/catch).
- **AdSlot :** dimensions réservées pour éviter tout décalage de mise en page (CLS), bordure pointillée sobre, **jamais au-dessus des chiffres clés**. Le composant reste désactivé tant que `NEXT_PUBLIC_ADSENSE_CLIENT` n'est pas défini.
- **Images OG :** la route `/api/og` existante est réécrite au style terminal (texte uniquement, sans IA).
- **Accessibilité :** contraste AA vérifié pour `--fg` et `--muted` sur `--bg`, focus visible, tableaux avec `<th scope>`.

## 9. SEO technique

- **Titres :**
  - fiche modèle : `"{Name} Pricing, Context Window & Specs ({Mon YYYY})"` ;
  - comparatif : `"{A} vs {B}: Price & Specs Compared ({Mon YYYY})"` ;
  - classement : `"{N} Cheapest {X} ({Mon YYYY})"`.
- **Meta descriptions :** générées à partir des chiffres réels.
- **Sitemaps :** un index plus un sitemap par type de page ; `lastmod` = date réelle du dernier `Event` qui concerne la page, jamais la date du build.
- **Données structurées :** `BreadcrumbList` partout, `Article` sur `/news/*`, `Dataset` sur `/about#data`. Pas de `FAQPage` : Google réserve ces rich results aux sites gouvernementaux et de santé.
- **Maillage interne :** fiche modèle ↔ fournisseur ↔ comparatifs ↔ classements ↔ alternatives ; les articles pointent vers les fiches.
- **`410 Gone`** via `src/proxy.ts` (convention Next 16, qui remplace `middleware.ts`) pour `/posts/*`, `/fr`, `/fr/*`, `/tags/*`, `/regions/*`, `/tutorials`, `/search`, `/start-here`, `/services`, `/newsletter/rss.xml` et `/newsletter/*` (hors `/newsletter` lui-même). `/news` reste en 200 : la route est réutilisée pour les nouveaux articles.
- **Divers :** `robots.ts` mis à jour, RSS `/rss.xml` = flux des articles et du digest, suppression de `/fr/rss.xml` et des `hreflang`.
- **Canonical** sur toutes les pages, `noindex` sur les pages pauvres (§6).

## 10. Monétisation et conformité

- **AdSense :** intégré derrière `NEXT_PUBLIC_ADSENSE_CLIENT`. Le compte est **créé et validé par le propriétaire**.
- **Consentement :** la CMP gratuite d'AdSense ("Privacy & messaging") est obligatoire pour l'UE et le UK. GA4 est conservé (`G-SEGRLC8HGJ`), avec le Consent Mode branché sur la CMP.
- **Hébergement :** le plan Vercel Hobby interdit l'usage commercial. On lance sans pub ; à l'activation d'AdSense, il faudra passer sur Vercel Pro ou migrer. **Décision laissée au propriétaire** à ce moment-là.
- **Affiliation :** v2. On prévoit seulement un emplacement de lien "Try it" (désactivé) sur la fiche modèle.

## 11. Workflows

| Workflow | Déclencheur | Timeout | Notes |
|---|---|---|---|
| `daily-update.yml` | cron quotidien 06:00 UTC + manuel | 30 min | Un seul job : refresh, puis éditorial (au plus 1 article flash), lint, tests, build, smoke, et un seul commit |
| `weekly-digest.yml` | lundi 08:00 UTC | 20 min | Article et newsletter |
| `health-check.yml` | toutes les 6h | 10 min | Nouvelles URLs ; alerte si `meta.lastSuccessAt` a plus de 72h |
| `alert-on-failure.yml` | `workflow_run` de **tous** les workflows ci-dessus | 10 min | Email via Resend (`send-alert.mjs` réutilisé) |

**Règles communes :**
- `timeout-minutes` sur chaque job ;
- les scripts se terminent par un `process.exit(code)` explicite ;
- push = `git pull --rebase` + 3 tentatives espacées ;
- `concurrency: data-writes` partagé par tous les workflows qui commitent ;
- Node 24 (comme en local, avec le type stripping natif pour exécuter les scripts `.ts` sans build) ;
- `lint` et `build` avant chaque commit de contenu.

**Secrets conservés :** `OPENAI_API_KEY`, `RESEND_API_KEY`, `NEWSLETTER_*`, `BEEHIIV_*`, `ALERT_TO`.

**Secrets à retirer :** `GEMINI_*`, `BLOB_READ_WRITE_TOKEN`, `X_*`, `SERVICES_*` (à supprimer par le propriétaire dans les réglages GitHub).

## 12. Suppressions

- **Workflows :** `auto-publish.yml`, `auto-publish-tutorial.yml`, `auto-newsletter.yml`, `auto-send-newsletter.yml` (remplacés par `weekly-digest.yml`), `auto-post-x-content.yml`, `auto-post-x-engagement.yml`, `auto-post-x-weekly-thread.yml`.
- **Scripts :** `automate.mjs`, `discover-topics.mjs`, `generate-post.mjs`, `generate-newsletter.mjs`, `compact-queue.mjs`, `cover-images.mjs`, `backfill-cover-images.mjs`, `backfill-60-days.mjs`, `posts-index.mjs`, `rebuild-posts-index.mjs`, `send-x.mjs`. `send-newsletter.mjs` est adapté au digest.
- **Contenu et données :** `content/posts/**`, `content/newsletters/**`, `data/topics-queue.json`, `data/posts-index.*.json`, `data/x-posted.json`, `data/newsletter-sent.json` (remplacé par un log du digest). Tout reste récupérable dans l'historique git.
- **Pages et composants :** tout `src/app/fr/**`, `posts`, `tags`, `regions`, `tutorials`, `search`, `start-here`, `services`, `api/services`, `newsletter/[slug]`, `newsletter/rss.xml`. La page `news` existante est réécrite pour les nouveaux articles et `newsletter/page.tsx` est restylée ; les composants `services-cta`, `service-lead-form`, `theme-toggle`, `locale-document`, `exit-subscribe`, `post-toc`, `related-posts`, `share-snippet`, `reading-progress` ; `src/lib/i18n.ts`, `posts.ts`, `newsletters.ts`.
- **Dépendances :** suppression de `twitter-api-v2`, `@vercel/blob`, `rss-parser`, `github-slugger`, `slugify`. `gray-matter` et `remark` restent pour `/news`. **Ajout de `remark-gfm`**, sans lequel les tableaux markdown ne s'affichent pas. C'était d'ailleurs le cas sur l'ancien site : les tableaux des articles apparaissaient en texte brut.

## 13. Tests et vérification

- **`node:test`** (sans nouvelle dépendance), sur des fixtures tirées d'un vrai snapshot models.dev :
  - `normalize` : périmètre, alias, batch, blended ;
  - `validate` : chaque garde-fou ;
  - `diff` : chaque type d'événement ;
  - `score` : chaque critère, exclusions, plafonds ;
  - `selection` : paires, classements, alternatives ;
  - filtre de titres et validation de grounding.
- **Script de smoke post-build :** vérifie que chaque type de page renvoie 200, que les anciennes URLs renvoient 410, que les sitemaps sont valides, et qu'aucune page indexée n'est vide.
- **Vérification visuelle** dans le navigateur (desktop et mobile) avant la mise en ligne.
- **Simulation du pipeline éditorial** en dry-run sur les événements des 30 derniers jours, issus du backfill : on contrôle le nombre d'articles produits et la qualité des titres avant d'activer le cron.

## 14. Risques

| Risque | Mitigation |
|---|---|
| models.dev change de format ou disparaît | Garde-fous (§5.6) et alerte ; schéma isolé dans `normalize.mjs` ; genai-prices peut servir de source de repli |
| Données models.dev erronées | Contrôle croisé avec genai-prices ; lien "report an error" (mailto) sur chaque fiche |
| Google considère les pages programmatiques comme pauvres | `noindex` des pages pauvres, paires sélectionnées, données réellement différentes d'une page à l'autre, historique unique |
| Domaine déjà pénalisé | 410 massifs puis resoumission du sitemap ; réévaluation à 3-4 mois, avec domaine neuf si rien ne bouge |
| Concurrence (Artificial Analysis, etc.) | Viser la longue traîne : comparatifs, classements de niche, prix par hébergeur |
| Usage commercial sur Vercel Hobby | Pub désactivée tant que la question n'est pas tranchée (§10) |

## 15. Actions manuelles du propriétaire

1. Supprimer les secrets GitHub obsolètes (`GEMINI_*`, `BLOB_READ_WRITE_TOKEN`, `X_*`, `SERVICES_*`).
2. Après la mise en ligne : resoumettre le sitemap dans Google Search Console.
3. Quand le site a du contenu indexé : créer le compte AdSense et demander la validation, puis décider de l'hébergement (Vercel Pro ou migration).
