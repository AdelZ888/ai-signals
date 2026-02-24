---
title: "neuron v0.3 — crates Rust indépendants et composables pour agents IA"
date: "2026-02-24"
excerpt: "neuron v0.3 sépare la pile d'agent en crates Rust indépendants — Provider, Tool, ContextStrategy, AgentLoop et MCP — pour que vous puissiez choisir uniquement les pièces nécessaires et composer des agents."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-24-neuron-v03-independent-composable-rust-crates-for-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "Rust"
  - "IA"
  - "agents"
  - "neuron"
  - "MCP"
  - "observabilité"
sources:
  - "https://secbear.github.io/neuron/"
---

## TL;DR en langage simple

- neuron fournit des blocs logiciels réutilisables (crates) pour construire des agents d'IA en Rust. Chaque bloc est indépendant et remplaçable. (source: https://secbear.github.io/neuron/)
- Choisissez seulement les crates dont vous avez besoin : provider (fournisseur de modèle), outils, stratégie de contexte, boucle d'agent. Cela réduit la surface et les dépendances. (source: https://secbear.github.io/neuron/)
- Prototypage local conseillé : utilisez neuron-provider-ollama pour éviter les coûts cloud au départ. Passez au provider cloud quand vous avez besoin d'échelle. (source: https://secbear.github.io/neuron/)

Exemple concret (scénario rapide) :
- Vous êtes une petite équipe. Vous voulez un assistant qui exécute un linter et lance des tests. Vous créez un projet Rust, ajoutez neuron-tool et neuron-provider-ollama, écrivez un outil #[neuron_tool] qui lance le linter localement, et testez tout en local avant d'activer la persistance et l'observabilité. (source: https://secbear.github.io/neuron/)

Explication simple avant les détails avancés : neuron n'est pas un framework complet. C'est une boîte à outils. Chaque boîte (crate) implémente une responsabilité claire : parler au modèle, gérer le contexte, enregistrer des outils, exécuter la boucle d'agent. Vous assemblez seulement ce dont vous avez besoin. (source: https://secbear.github.io/neuron/)

## Ce que vous allez construire et pourquoi c'est utile

Objectif concret : un agent Rust modulaire. Il appelle un modèle (local ou cloud), exécute des outils (par ex. linter, tests), et gère le contexte (compaction de tokens, messages système). neuron fournit les briques pour ces fonctions. (source: https://secbear.github.io/neuron/)

Composants principaux et rôles (extraits de la doc) :

| Composant | Crate(s) exemples | Rôle principal |
|---|---:|---|
| Types & traits | neuron-types | Déclare Provider, Tool, ContextStrategy, Message |
| Provider | neuron-provider-openai, neuron-provider-anthropic, neuron-provider-ollama | Interface vers un modèle (cloud ou local) |
| Outils | neuron-tool, neuron-tool-macros | Registry d'outils et macro #[neuron_tool] |
| Contexte | neuron-context | Stratégies de compaction, comptage de tokens, injection de system prompt |
| Boucle d'agent | neuron-loop | AgentLoop configurable (streaming, annulation, outils parallèles) |
| MCP | neuron-mcp | Model Context Protocol : client/serveur via stdio + Streamable HTTP |
| Runtime & observabilité | neuron-runtime, neuron-otel | Sessions, DurableContext, spans GenAI (gen_ai.*) |

Pourquoi ce pattern aide :
- Remplaçabilité : changez le provider sans réécrire la logique de la boucle d'agent.
- Granularité : ajoutez uniquement les crates nécessaires pour réduire la surface d'attaque et la taille binaire.
- Observabilité : neuron-otel fournit des spans nommés gen_ai.* pour tracer les opérations GenAI. (source: https://secbear.github.io/neuron/)

Note : la boucle d'agent typique dans les frameworks converge souvent vers une centaine ou quelques centaines de lignes. La différenciation vient des blocs autour de cette boucle. (source: https://secbear.github.io/neuron/)

## Avant de commencer (temps, cout, prerequis)

Temps estimé pour un prototype minimal : 1–2 heures (hypothèse). Voir la section Hypotheses / inconnues en bas. (source: https://secbear.github.io/neuron/)

Prérequis techniques :
- Rust toolchain installé (rustup + cargo) et git.
- Confort avec async Rust (futures, tokio ou async-std).
- Clé API pour un provider cloud OU instance Ollama locale si vous préférez éviter le cloud. (source: https://secbear.github.io/neuron/)

Checklist rapide :
- [ ] rustup et cargo installés
- [ ] dépôt git initialisé
- [ ] clé API ou runtime Ollama local disponible
- [ ] liste des crates choisies (provider, neuron-tool, neuron-context, neuron-loop)

## Installation et implementation pas a pas

1) Créez le projet et vérifiez cargo : (source: https://secbear.github.io/neuron/)

```bash
cargo new my-neuron-agent && cd my-neuron-agent
cargo run --bin my-neuron-agent || true
```

2) Dépendances minimales (exemple de Cargo.toml). Adaptez les versions selon votre verrouillage :

```toml
[package]
name = "my-neuron-agent"
version = "0.1.0"
edition = "2021"

[dependencies]
neuron-types = "*"
neuron-tool = "*"
neuron-tool-macros = "*"
neuron-context = "*"
neuron-loop = "*"
# Ajoutez un provider selon votre besoin : neuron-provider-ollama / neuron-provider-openai / neuron-provider-anthropic
```

3) Configuration d'environnement (.env) — gardez les clés hors du code :

```env
# .env
NEURON_PROVIDER=ollama
OLLAMA_URL=http://127.0.0.1:11434
NEURON_LOG_LEVEL=info
```

4) Exemple Dockerfile pour build + run local. Adaptez selon les dépendances natives :

```dockerfile
FROM rust:1.70-slim
WORKDIR /app
COPY . .
RUN cargo build --release
CMD ["/app/target/release/my-neuron-agent"]
```

5) Exemple minimal d'outil avec la macro (squelette). Utilisez #[neuron_tool] pour exposer l'outil au registry d'outils. (source: https://secbear.github.io/neuron/)

```rust
use neuron_tool_macros::neuron_tool;

#[neuron_tool]
async fn run_linter(ctx: ToolContext, req: LintRequest) -> ToolResult<LintResponse> {
    // logique minimale : appeler un linter local ou retourner un verdict
}
```

6) Lancer en local :

```bash
# charger .env puis lancer
export "+$(cat .env | xargs)"
cargo run
```

Conseils : commencez avec neuron-provider-ollama pour prototyper localement. Ensuite, ajoutez fiabilité, durabilité et observabilité avant de migrer en production. (source: https://secbear.github.io/neuron/)

## Problemes frequents et correctifs rapides

Erreurs typiques et solutions : (source: https://secbear.github.io/neuron/)

- Comptage de tokens incorrect : activez ou ajustez la stratégie de compaction dans neuron-context.
- Proc-macro qui ne s'étend pas : vérifiez que neuron-tool-macros est bien déclaré en dépendance et que l'édition Rust est compatible.
- Authentification provider : vérifiez les variables d'environnement et testez une requête simple vers le provider.
- Handshake MCP (Model Context Protocol) échoue : vérifiez les versions MCP et activez les logs MCP (stdio/HTTP).

Rollback rapide : retirez le provider ou la feature problématique. Le découpage en crates facilite le retour à une configuration connue.

## Premier cas d'usage pour une petite equipe

Cible : solo founder ou équipe 1–3 personnes qui veut un assistant code capable d'exécuter linters et tests.

Ordre recommandé des actions :
1. Prototyper en local avec Ollama. Ne dépensez rien en cloud pour les premières itérations. (source: https://secbear.github.io/neuron/)
2. Limiter les dépendances : commencer avec neuron-tool, neuron-context et le provider choisi. Conserver 1–5 outils au début.
3. Écrire un outil minimal (run_linter) et le tester manuellement en moins de 30 minutes. Utiliser #[neuron_tool] pour l'intégration.
4. Activer DurableContext (neuron-runtime) seulement si vous avez besoin de sessions persistantes.
5. Pinner les versions des crates dans Cargo.toml. Déployer un canary progressif avant le déploiement complet.
6. Observabilité simple : activer neuron-otel et visualiser les spans gen_ai.* dans un dashboard.

Checklist opérationnelle :
- [ ] Prototype local en 1–2 heures
- [ ] run_linter implémenté et testé
- [ ] CI exécute build et tests (CI = intégration continue ; recommander timeout tests agent_loop = 30000 ms)

## Notes techniques (optionnel)

Points clés extraits de la documentation officielle : (source: https://secbear.github.io/neuron/)

- neuron-types définit les traits Provider, Tool, ContextStrategy et le type Message.
- neuron-loop fournit une boucle d'agent configurable : streaming, annulation, et exécution parallèle d'outils.
- neuron-mcp supporte stdio et Streamable HTTP pour l'orchestration cross-process.
- neuron-otel propose une instrumentation OpenTelemetry (OTEL) avec spans GenAI nommés gen_ai.*.

Méthodologie recommandée : prototyper local, puis ajouter durabilité (DurableContext) et garde‑fous avant montée en charge.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Temps prototype minimal : 1–2 heures (hypothèse).
- Démo robuste (télémétrie + garde‑fous) : 3–6 heures (hypothèse).
- Plan canary suggéré : 5% → 25% → 100% (hypothèse opérationnelle).
- Triggers de rollback d'exemple : taux d'erreur > 2% ou latence 95e percentile > 500 ms (hypothèse).
- Objectifs SLO (Service Level Objective) exemples : taux d'erreur < 1%, 95p latence < 500 ms (hypothèse).
- Timeout agent_loop pour tests : 30000 ms (hypothèse de test).
- Parallel_tools recommandé à tester : 4 outils concurrents (hypothèse).
- Nombre approximatif de crates listées dans la doc : ~12 (extrait conceptuel). (source: https://secbear.github.io/neuron/)

### Risques / mitigations

- Risque : coûts API élevés. Mitigation : prototyper local (Ollama), appliquer throttling et monitorer les dépenses.
- Risque : perte d'information lors de la compaction. Mitigation : tests token-aware et sauvegarde des éléments critiques.
- Risque : incompatibilités de versions ou macros. Mitigation : pinner les versions et vérifier l'édition Rust.
- Risque : MCP cross-process instable. Mitigation : valider en staging sur stdio et Streamable HTTP et activer logs verbeux.

### Prochaines etapes

- Implémenter run_linter et un second outil (run_tests). Tester en local sans DurableContext puis avec DurableContext.
- Activer neuron-otel et mapper les spans gen_ai.* dans vos dashboards.
- Verrouiller dépendances et déployer canary selon le plan de pourcentages (voir Hypotheses).
- Automatiser la rotation des clés provider et mettre en place des contrôles d'accès.

Pour la liste complète des crates et la documentation détaillée, consultez : https://secbear.github.io/neuron/.
