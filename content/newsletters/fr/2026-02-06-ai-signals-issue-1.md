---
date: '2026-02-06'
issueNumber: 1
tags:
  - Newsletter
  - Weekly
title: 'AI Signals — Édition hebdo #1'
excerpt: >-
  Défense agentique, RL agentique pratique, App Server Codex; revue
  MCTS/épistémique; checklist actionnable pour builders et fondateurs.
---
## TL;DR

- Nouveaux risques agentiques : la coercition par prompt déplace l'attaque vers les workflows — il faut placer des gardes à la frontière (moteur de politiques, sandbox, canaux attestés).
- RL agentique devient praticable pour GPT-OSS : priorisez boucles d'entraînement courtes, métriques économiques et pipelines d'évaluation reproductibles.
- App Server JSON‑RPC (Codex Harness) = pattern pour exposer hypothèses, stream incrémental et persistance de diffs pour approbation humaine.
- Recherches à suivre : Empirical‑MCTS (mémoire causale), contrôle épistémique actif, omission de pensée/observation pour efficience.

## Cette semaine sur AI Signals (liens internes)

- [Les règles échouent dans le prompt, réussissent à la frontière](https://aisignals.dev/fr/posts/2026-02-06-rules-fail-at-the-prompt-succeed-at-the-boundary) — tutoriel déployable : moteur de politique + sandbox + canaux attestés, configs et métriques (UK).
- [GPT-OSS et RL agentique: ce que les builders peuvent vraiment shipper](https://aisignals.dev/fr/posts/2026-02-06-unlocking-agentic-rl-training-for-gpt-oss-a-practical-retrospective) — décomposition pratique, priorités d'implémentation et critères économiques (FR).
- [Déverrouiller le Codex Harness : comment nous avons construit l'App Server](https://aisignals.dev/fr/posts/2026-02-06-unlocking-the-codex-harness-how-we-built-the-app-server) — tutoriel technique App Server JSON‑RPC, streaming de frames et persistance de diffs (US).

## Modeles: ce qui a bouge

- Empirical‑MCTS (ArXiv): MCTS qui conserve et réutilise motifs de raisonnement entre instances — utile pour agents qui doivent accumuler « savoir procédural ». Lire: https://arxiv.org/abs/2602.04248
- Uncertainty‑aware planning pour agents incarnés (ArXiv): transforme sorties LLM en planificateur qui gère incertitude et interactions multi‑agent. Lire: https://arxiv.org/abs/2602.04326
- Agent‑Omit (ArXiv): apprendre quand omettre pensées/observations pour gagner en coût sans perdre en performance — pattern essentiel pour production agentique. Lire: https://arxiv.org/abs/2602.04284
- Papers utiles additionnels: Active Epistemic Control (planification épistémique) et Adaptive Compute Allocation (allocation de coût au test‑time). Voir https://arxiv.org/abs/2602.03974 et https://arxiv.org/abs/2602.03975

## Agents: patterns utiles

- Frontière de confiance (concrete): 1) moteur de politique centralisé pour décisions sensibles, 2) sandbox isolée pour actions à haut risque, 3) canaux attestés pour side‑effects. Détails et configs : article interne sur « règles échouent… ». [voir tutoriel interne]
- App Server JSON‑RPC (pattern): exposer hypothèses, stream de frames incrémentales, stocker diffs signés pour approbation humaine — réduit surprises lors des actions agentiques. Exemple d'implémentation dans l'article Codex Harness.
- Empirical‑MCTS comme cache de raisonnement: journaliser branches MCTS utiles et réinvoquer comme prior/heuristic sur requêtes similaires.
- Thought/Observation Omission Gate: entraînez un policy head binaire qui décide d'expliciter "pensées" ou non; optimiser sur coût‑latence vs gain de performance (cf. Agent‑Omit).
- Contrôle épistémique actif: interrogez l'environnement pour fermer incertitudes critiques avant de prendre engagements coûteux (Active Epistemic Control).

## Outils & repos

- Intégrer un App Server JSON‑RPC : patterns et endpoints détaillés dans le post "Codex Harness" (interne).
- MCTS & planning: utiliser libs C++/Rust existantes + wrapper Python pour LLMs ; prototypes disponibles dans les codes des papiers Empirical‑MCTS. Lire: https://arxiv.org/abs/2602.04248
- RL agentique pour GPT‑OSS: privilégiez petits loops avec clear reward shaping, tronçons off‑policy pour stabilité; outils pratiques: RLlib, CleanRL, TRL (adapté).
- Observabilité & audits: stocker diffs signés, frames streamées et métriques coût/risque (log structurel pour audits). Exemple d'artefacts dans le tutoriel App Server.
- Vérification rapide: fuzzing de prompts + attaques de coercition (reprendre vecteurs décrits dans MIT Tech Review). Voir contexte: https://www.technologyreview.com/2026/01/28/1131003/rules-fail-at-the-prompt-succeed-at-the-boundary/

## Angle startup

- Risque produit : les attaques agentiques sont transversales (tech, finance, infra). Mesurez exposition par surfaces d'action (APIs, agents auto‑schedulés, intégrations tierces).
- Priorités d’investissement (ordre recommandé) : 1) boundary enforcement minimal + audit trails, 2) App Server pour visibilité et approbation humaine, 3) boucle RL contrôlée pour features à valeur directe.
- Métriques à suivre pour le board : temps moyen de mitigation d'une action agentique, coût moyen d'une décision automatisée, % d'actions qui passent par approbation humaine.
- Go‑to‑market: vendre sécurité opérationnelle et réduction de risque comme différenciateur pour integrateurs enterprise; pack minimal = sandbox + logs signés + SLA d'audit.
- Coût vs risque : fournir fondateurs une matrice simple (impact x probabilité) et un seuil d'investissement itératif — voir cadre coût/risque du tutoriel frontière (interne, UK).

## Quoi shipper la semaine prochaine

- POC « frontière minimale » : deployer un moteur de politique qui bloque 5 actions à haut risque + log diffs signés. Mesurer latence et faux positifs.
- App Server MVP : JSON‑RPC endpoint qui stream des frames et persiste diffs; ajouter UI d'approbation humaine (button approve/reject) et audit trail.
- Expérimentation RL courte : 1 environnement, off‑policy replay, reward shaping simple; évaluer si la métrique business converge sur 2 itérations.
- Instrumenter MCTS : log des branches utiles (Empirical‑MCTS) et réutiliser les patterns les plus fréquents comme prior pour réduire coût compute.
- Test d'attaque prompt‑coercion : créer 10 scénarios d'injection ciblant workflows agentiques et mesurer taux de succès avant/après la frontière.

https://aisignals.dev/fr/#newsletter
