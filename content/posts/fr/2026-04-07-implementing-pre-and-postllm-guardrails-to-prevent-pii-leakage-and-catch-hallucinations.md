---
title: "Implémenter des garde‑fous pré‑ et post‑LLM pour éviter les fuites de PII et attraper les hallucinations"
date: "2026-04-07"
excerpt: "Guide pas à pas pour ajouter deux garde‑fous autour de chaque appel LLM : un pré‑LLM qui redige/filtre pour empêcher la fuite de PII et un post‑LLM qui vérifie les sorties et rattrape les hallucinations avant qu'elles n'atteignent l'utilisateur."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-07-implementing-pre-and-postllm-guardrails-to-prevent-pii-leakage-and-catch-hallucinations.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "agents"
  - "sécurité"
  - "PII"
  - "LLM"
  - "garde‑fous"
  - "devops"
sources:
  - "https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails"
---

## TL;DR en langage simple

- Mettez en place deux garde‑fous. Un pré‑LLM qui inspecte et nettoie l'entrée avant d'appeler le modèle. Un post‑LLM qui vérifie la réponse avant de l'afficher. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)
- Le pré‑LLM bloque ou redige la PII (informations personnelles identifiables : emails, numéros de carte, tokens). Le post‑LLM détecte les affirmations sans preuve et relance la logique de l'agent ou masque la sortie. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)
- Avantages rapides : moins de fuite de données et moins d'hallucinations visibles par l'utilisateur. Gardez des logs audités pour chaque décision. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

Exemple concret : une compagnie aérienne utilise un pré‑LLM pour redacter automatiquement les PII dans les conversations de support client avant d'envoyer le texte à un fournisseur de modèle externe. Une autre équipe utilise un post‑LLM qui détecte les affirmations non sourcées et demande au moteur d'apporter des preuves avant d'afficher la réponse. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

## Ce que vous allez construire et pourquoi c'est utile

- Objectif : intercepter les données à deux points (pré‑LLM et post‑LLM) pour empêcher l'exfiltration de PII et corriger les réponses non soutenues avant diffusion. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)
- Composants principaux :
  - Pré‑LLM (middleware/proxy) : détection et rédaction de PII, blocage de secrets, détection d'injection de prompt. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)
  - Post‑LLM (vérificateur) : extraction d'affirmations, vérification de preuve, et décision automatisée (deliver / retry_with_evidence / redact_and_deliver / block_and_escalate). (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)
- Pourquoi c'est utile : cela transforme des erreurs silencieuses en décisions auditées et actionnables. Exemple : redaction de PII avant envoi à un fournisseur externe ; reprise automatique des affirmations non soutenues. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

Plain-language explanation avant détails avancés :
Ce système place des contrôles à deux moments : d'abord sur ce que vous envoyez au modèle (pour éviter d'exposer des données sensibles), puis sur ce que le modèle renvoie (pour éviter d'afficher des erreurs ou des affirmations sans preuve). Pensez au pré‑LLM comme un filtre de sécurité et au post‑LLM comme un relecteur automatique qui peut demander une correction ou bloquer la sortie.

## Avant de commencer (temps, cout, prerequis)

- Prérequis techniques : capacité à insérer un hook middleware (proxy HTTP centralisé ou SDK d'interception) et pipeline d'audit/logs. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)
- Données de validation : un bac à sable contenant exemples normaux, cas limites et attaques pour tester les règles. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)
- Observabilité minimale : logs structurés et métriques pour tracer chaque décision (request_id, règles déclenchées, action choisie). (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)
- Note courte de méthodologie : ce guide suit le pattern d'interception pré‑LLM et post‑LLM décrit par Arthur.ai. Adaptez seuils et budgets à votre contexte. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

## Installation et implementation pas a pas

1) Définir la logique de décision

- Créez decision_table.csv qui mappe le résultat du vérificateur à une action (deliver, retry_with_evidence, redact, block_and_escalate). (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

2) Créer les règles (exemples)

```yaml
# redaction_rules.yaml
rules:
  - id: cc-number
    priority: 10
    pattern: '(?:\b(?:3[47][0-9]{13}|4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12})\b)'
    action: redact
    redact_with: '[REDACTED_CREDIT_CARD]'
  - id: email
    priority: 5
    pattern: '\b[\w.%-]+@[\w.-]+\.[A-Za-z]{2,6}\b'
    action: redact
allowlist:
  - '\b(?:internal-bot@company.com)\b'
```

- Explication : commencez par quelques règles simples et priorisez‑les. Les regex (expressions régulières) sont rapides et précises pour certains formats (ex. numéros de carte). (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

3) Exemple de config du vérificateur

```json
{
  "checks": {
    "leak_check": {"enabled": true},
    "claim_support": {"min_similarity": 0.6, "min_supported_fraction": 0.8},
    "safety": {"forbidden_categories": ["self_harm","data_exfiltration"]}
  },
  "actions": {"pass": "deliver", "soft_fail": "retry_with_evidence", "hard_fail": "block_and_escalate"}
}
```

- Explication : la configuration traduit les scores du vérificateur en actions concrètes. Ajustez les seuils (min_similarity, min_supported_fraction) selon vos tests. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

4) Implémenter le middleware pré‑LLM

- Fonctions attendues : appliquer rules déterministes (regex), exécuter un NER léger (reconnaissance d'entités nommées), émettre un événement d'audit {request_id, rule_ids_triggered, redaction_summary}. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

5) Implémenter le vérificateur post‑LLM et la boucle de correction

- Vérifications : détection de fuite, extraction d'affirmations, récupération de preuves, décision automatique ou escalade vers un humain (HITL : human‑in‑the‑loop). (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

6) Tests et déploiement progressif

- Tests unitaires et d'intégration sur jeux d'exemples représentatifs ; canary rollout progressif recommandé. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

Exemple de commande pour démarrer un proxy local et tester une redaction :

```bash
# run local proxy (exemple)
./start-guardrail-proxy --port 8080 --config ./redaction_rules.yaml
# test avec curl
curl -s -X POST http://localhost:8080/check -d '{"text":"Card 4111-1111-1111-1111"}'
```

| verifier_result | severity_score | action               | notify |
|-----------------|----------------|----------------------|--------|
| PASS            | 0              | deliver              | none   |
| SOFT_FAIL       | 40             | retry_with_evidence  | team   |
| FAIL            | 90             | block_and_escalate   | ops    |

## Problemes frequents et correctifs rapides

- Sur‑rédaction (faux positifs)
  - Symptôme : contenu légitime supprimé.
  - Correctif : ajouter une allowlist, rendre les seuils plus conservateurs, proposer une validation utilisateur. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

- Patterns PII manquants (faux négatifs)
  - Symptôme : PII non détectée.
  - Correctif : normalisation avant checks (ex. supprimer séparation non standard), enrichissement du jeu d'exemples. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

- Contournement d'injection de prompt
  - Symptôme : formulation adversariale visant à manipuler le comportement.
  - Correctif : ajouter des contrôles sémantiques (similarité avec vecteurs d'attaque connus) et escalader les cas ambigus. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

- Impact sur la latence
  - Symptôme : checks augmentent la latence de réponse.
  - Correctif : séparer chemin rapide déterministe et chemin lent asynchrone ; monitorer p50/p95/p99. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

## Premier cas d'usage pour une petite equipe

Contexte : vous êtes solo founder ou une petite équipe (1–3 personnes). Misez sur une surface d'attaque réduite et des outils simples. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

Actions concrètes (au moins 3 étapes actionnables) :

1) Déployez un pré‑LLM minimal et rapide
  - Implémentez 3–5 regex critiques (emails, numéros de carte, tokens API). Loggez {request_id, rules_triggered}. Gardez la logique sous 1 fichier YAML pour pouvoir rollback. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

2) Mettez en place un post‑LLM léger pour les affirmations
  - Vérifiez les affirmations contre un index local (FAQ ou top‑N docs). Si l'affirmation n'est pas soutenue, renvoyez une réponse de sécurité type "Je ne suis pas sûr" et placez la demande en file pour revue humaine. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

3) Automatisation limitée + revue humaine
  - Nommez un propriétaire unique. Faites une revue hebdo de 30 minutes des cas bloqués. Priorisez corrections sur les règles qui causent > 5 faux positifs par semaine. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

4) Canary simple
  - Lancer le guardrail sur 1% du trafic, puis 5%, puis 10%. Monitorer PII_block_count et verifier_latency_p95. Monter en charge seulement après validation manuelle. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

## Notes techniques (optionnel)

- Placement (trade‑offs) : proxy centralisé = audit plus simple ; agent en périphérie = moins d'exposition initiale mais distribution de config plus complexe. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)
- Mix de détection recommandé : regex pour tokens haute précision, NER/classifieurs pour contexte, vérif sémantique pour injections. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)
- Observabilité et métriques suggérées : PII_block_rate, PII_false_positive_rate, verifier_outcomes, verifier_latency_p50/p95/p99, config_change_count. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)

## Que faire ensuite (checklist production)

- [ ] Finaliser et committer les artefacts : redaction_rules.yaml, prompt_injection_rules.yaml, output_verifier_config.json, decision_table.csv. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)
- [ ] Créer dashboards et alertes pour PII_block_rate, hallucination_rate, verifier_latency_p95/p99, canary_percent.
- [ ] Plan de canary : définir paliers et points de validation manuelle.
- [ ] Publier un runbook : propriétaire, rollback, tests, changelog, cadence d'échantillonnage pour revue manuelle.

### Hypotheses / inconnues

- Deux types de garde‑fous (pré‑LLM, post‑LLM) : confirmé par la synthèse d'Arthur.ai. (source: https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)
- Jeux d'exemples nécessaires pour validation : hypothèse 200–1 000 exemples représentatifs.
- Durée de développement initial : hypothèse 2–4 semaines‑ingénieur pour un noyau pré/post complet.
- Labellisation initiale : hypothèse 1–2 semaines‑ingénieur pour 200–500 exemples.
- Coûts opérationnels approximatifs : hypothèse 50–500 $/mois pour vérifications légères ; 500–5 000 $/mois si recours intensif à LLMs pour fact‑checking.
- Seuils techniques proposés comme point de départ (à calibrer) : similarité min 0.6, min_supported_fraction 0.8, confiance NER 0.85, latence pré‑LLM cible 500 ms p99, vérificateur synchrone ≤ 800 ms p99, canary paliers ex. 1% -> 10%.

### Risques / mitigations

- Risque : faux positifs bloquent utilisateurs. Mitigation : allowlist, seuils conservateurs, validation utilisateur.
- Risque : PII non détectée ou nouvelles injections. Mitigation : normalisation des entrées, checks sémantiques, mise à jour continue des règles.
- Risque : régression de latence. Mitigation : chemin rapide déterministe, vérifications lourdes asynchrones, fallback instrumenté.
- Risque : dérive de configuration. Mitigation : dépôt de config signé, releases versionnées, health checks automatiques.

### Prochaines etapes

1. Finaliser artefacts de configuration et les stocker dans un dépôt signé.
2. Préparer dashboards/alertes et planifier revues hebdomadaires des métriques clefs.
3. Exécuter canary selon paliers définis ; valider manuellement avant chaque montée en charge.
4. Publier le runbook (propriétaire, rollback, tests, changelog, cadence d'échantillonnage) et assigner la gouvernance.

Sources : Best Practices for Building Agents | Part 5: Guardrails — Arthur.ai (https://www.arthur.ai/blog/best-practices-for-building-agents-guardrails)
