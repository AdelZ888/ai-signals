---
title: "ProvenanceGuard : éviter la conflation inter‑sources pour les agents LLM basés MCP"
date: "2026-10-01"
excerpt: "Ajoute une couche de vérification « aware » des sources pour les agents qui suivent le Model Context Protocol (MCP). Le vérificateur confirme chaque affirmation contre la sortie de l'outil nommé, retourne support_score et match_span, et signale les cas de conflation entre sources."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-10-01-provenanceguard-preventing-crosssource-conflation-in-mcp-llm-agents.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "provenance"
  - "MCP"
  - "vérification"
  - "LLM"
  - "agents"
  - "IA"
  - "développement"
  - "sécurité"
sources:
  - "https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source"
---

## TL;DR en langage simple

- Problème principal : les agents qui utilisent le Model Context Protocol (MCP) peuvent attribuer une information vraie à la mauvaise source — phénomène appelé « conflation inter‑source ». Voir le résumé ProvenanceGuard : https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source.
- Objectif : ajouter une couche de vérification "source‑aware" qui valide chaque affirmation uniquement contre la sortie d'outil (source_id + fragment) que l'agent prétend citer, et signaler ou réparer les attributions incorrectes.
- Résultat attendu : traçabilité claire (claim_id → source_id → match_span) et actions automatisées ou humaines selon confidence.

Checklist courte :
- [ ] provenance_config.json
- [ ] endpoint vérificateur (support_score + match_span)
- [ ] table de décisions (machine‑readable)

Méthodologie : résumé des garanties et du problème tel que décrit dans le billet ProvenanceGuard sur Hugging Face (https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source). Une note méthodologique succincte suffit ici.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez greffer une couche de vérification "source‑aware" à un agent MCP. MCP (Model Context Protocol) permet à un agent d'appeler plusieurs outils, d'inspecter des enregistrements structurés et de combiner métadonnées et passages textuels dans une réponse — ce flux est précisément le contexte décrit par ProvenanceGuard : https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source.

But: si la vérification est "source‑blind" (qui vérifie seulement sur l'ensemble poolé d'évidence), une affirmation vraie mais attribuée à la mauvaise source peut passer la validation. La couche source‑aware empêche ce mode d'échec en vérifiant chaque claim contre la sortie d'outil citée.

Livrables fonctionnels :
- endpoint de vérification qui reçoit (claim_id, claimed_source_id, claim_text) et renvoie un verdict, un score normalisé et un match_span ;
- configuration machine‑readable (provenance_config.json) ;
- table de décision orchestrant acceptation / clarification / escalade.

Référence conceptuelle : https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source

## Avant de commencer (temps, cout, prerequis)

Prérequis techniques essentiels :
- Agent MCP qui conserve source_id et le texte/metadonnées retournés par chaque outil.
- Traces structurées : pour chaque appel d'outil, stocker {source_id, text, metadata, offsets} dans la trace d'agent.
- Vérificateur capable de renvoyer un score normalisé et un match_span (offsets en tokens ou caractères).

Note rapide : les estimations opérationnelles (temps, coûts, seuils) sont listées en détail dans la section Hypotheses / inconnues plus bas. Voir aussi le billet ProvenanceGuard pour le contexte : https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source.

## Installation et implementation pas a pas

1) Instrumenter les sorties d'outil MCP
- Chaque outil doit retourner {source_id, text, metadata}. Conserver ces champs dans la trace pour chaque step.

2) Emettre les affirmations revendiquées
- Format recommandé pour les assertions : {claim_id, claimed_source_id, claim_text, reasoning_pointer}.

3) Vérifier chaque claim contre la source citée
- L'API vérificateur doit charger uniquement le fragment (ou fragments) de la source indiquée et calculer un verdict.

4) Appliquer la decision_table et prendre action
- Actions possibles : accepter, demander clarification, réparation automatique, escalade humaine.

5) Tester bout à bout et déployer canari
- Intégration, tests annotés et monitoring avant roll‑out complet.

Exemples de commandes et de config :

```bash
# démarrer le serveur vérificateur
uvicorn verifier.app:app --host 0.0.0.0 --port 8080 --workers 2

# test d'intégration rapide (script internal)
python tests/run_provenance_tests.py --samples 200 --dry-run
```

```json
{
  "sources": [
    {"id": "account_record", "aliases": ["acct", "account_v1"]},
    {"id": "policy_doc", "aliases": ["policy_v1", "refund_policy"]}
  ],
  "cache_ttl_ms_var": "[cache_ttl_ms]",
  "thresholds": {"accept": "[accept_threshold]", "clarify": "[clarify_threshold]"}
}
```

Decision table (structure) :

| Condition (score) | Action                 | Notes / opérateur |
|-------------------:|------------------------|-------------------|
| >= [accept_threshold] | Accepter et enregistrer | Persist claim_id → source_id → match_span |
| entre [clarify] et [accept] | Clarifier / réparer  | Tentative de réparation automatique |
| < [clarify]         | Escalader               | Revue humaine si critique |

Référence conceptuelle et cas d'usage expliqués dans ProvenanceGuard : https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source

## Problemes frequents et correctifs rapides

Problème : fausse acceptation parce que le fait existe "quelque part" dans le pool.
- Cause : vérificateur source‑blind. Correctif : restreindre la vérification au fragment déclaré par claimed_source_id et valider le match_span.

Problème : alias de sources conflictuels.
- Correctif : table d'alias (provenance_config.json), et échec explicite si ambiguïté non résolue.

Problème : latence additionnelle importante.
- Correctif : batcher les vérifications, utiliser un cache de fragments cités, augmenter le parallélisme worker.

Problème : vérificateur trop conservateur.
- Correctif : combiner signaux (recouvrement de span + similarité sémantique) et ajouter règles de réparation automatique.

Logs minimaux recommandés : claim_id, claimed_source_id, support_score, match_span, action_taken. Contexte conceptuel : https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source

## Premier cas d'usage pour une petite equipe

Scénario : petite équipe support (3 personnes) déploie un agent qui répond aux demandes de remboursement. L'agent peut citer soit le dossier client (account_record) soit la politique interne (policy_doc). Le risque identifié dans ProvenanceGuard — la « conflation inter‑source » — est précisément la perte d'auditabilité si l'agent attribue la règle au mauvais document : https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source.

Plan minimal (étapes conceptuelles) :
- Instrumenter les outils pour ajouter source_id dans chaque réponse.
- Faire émettre des claims structurés par l'agent.
- Appeler le vérificateur par claim et appliquer la table de décision.
- Mettre en place revue humaine pour les cas non soutenus.

Conseil pratique pour une petite équipe ou un fondateur solo : commencer par matching d'exact‑span et logs détaillés, puis itérer vers une vérification sémantique.

## Notes techniques (optionnel)

- Conserver source_id et offsets dans la trace MCP est indispensable pour toute vérification source‑aware (principe décrit par ProvenanceGuard) : https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source.
- Limiter la taille des fragments chargés pour contrôle coût/latence ; privilégier fragments ≤ [max_fragment_tokens] pour l'indexation et le scoring.
- Utiliser un scoring hybride (ex. recouvrement de span + similarité d'embeddings) lorsque les paraphrases sont fréquentes.

Exemple de test de performance :

```bash
# tester latence batch
python perf/test_latency.py --batch-size 16 --requests 1000
```

```yaml
verifier:
  workers: [workers_count]
  cache_ttl_ms: [cache_ttl_ms]
  thresholds:
    accept: [accept_threshold]
    clarify: [clarify_threshold]
  max_fragment_tokens: [max_fragment_tokens]
```

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Seuils initiaux suggérés (à valider) : accept ≥ 0.8, clarify = 0.5, escalade < 0.5.
- Délais et volumes pour la mise en route : prototype ≈ 4 heures ; déploiement progressif + monitoring initial ≈ 24–48 heures.
- Tests annotés recommandés : 200 échantillons pour calibration rapide ; 1 000 échantillons pour validation de robustesse.
- Canaries et montée en charge : 10 % → 50 % → 100 % du trafic ; phases de canary typiques : 48–72 heures chacune.
- Coûts indicatifs : ~0,002 $ par scoring ; à 1 000 scorings/jour ≈ 2 $/jour.
- Performances/limites : max_fragment_tokens ≈ 512 tokens ; cache_ttl_ms proposé : 60000 ms ; latence additionnelle cible médiane ≤ 100 ms par assertion si non batché.
- Critères de gate avant full roll‑out : misattribution cible < 5 % mesurée sur 200 échantillons, latence additionnelle médiane < 100 ms.

### Risques / mitigations

- Risque : l'agent mentionne la mauvaise source (conflation). Mitigation : exiger match_span et comparer metadata ; implémenter réparation automatique ou attribution multi‑source si nécessaire.
- Risque : hausse de latence et coûts. Mitigation : cache (TTL = 60000 ms), batching, réduire max_fragment_tokens à 512, surveiller coût par scoring et mettre alertes à 20 % d'augmentation mensuelle.
- Risque : qualité du vérificateur (faux positifs/négatifs). Mitigation : revue humaine pour les premiers 1 000 items ou 2 semaines ; audits roulants de 200 échantillons.

### Prochaines etapes

- Produire provenance_config.json et decision_table (machine‑readable).
- Exécuter test d'intégration sur 200 échantillons ; ajuster thresholds (ex. accept 0.8 → 0.85 si trop permissif).
- Déployer canari à 10 % pendant 48–72 h ; mesurer misattribution et latence ; augmenter à 50 % puis 100 % si gates OK.
- Planifier audits hebdomadaires pendant 4 semaines et maintenir une table d'alias des sources.

Source principale et contexte conceptuel : ProvenanceGuard, Hugging Face (https://huggingface.co/blog/MultiverseComputingCAI/getting-the-source-right-not-just-the-fact-source).
