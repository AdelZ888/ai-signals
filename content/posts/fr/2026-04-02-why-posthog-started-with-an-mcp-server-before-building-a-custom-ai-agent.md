---
title: "Pourquoi commencer par un serveur MCP avant de créer un agent IA personnalisé — leçons pratiques"
date: "2026-04-02"
excerpt: "Résumé pratique (contexte US) : validez la demande pour des actions produit pilotées en langage naturel en exposant d’abord un endpoint étroit et authentifié (un « MCP server »). PostHog rapporte que 34 % des tableaux de bord créés par l’IA ont transité par leur MCP — utilisez ce signal avant d’investir dans un agent intégré complet."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-02-why-posthog-started-with-an-mcp-server-before-building-a-custom-ai-agent.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "MCP"
  - "IA"
  - "agents"
  - "LLM"
  - "produit"
  - "PostHog"
  - "développement"
sources:
  - "https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building"
---

## TL;DR en langage simple

- Les « agents » intégrés (assistant IA complet dans votre produit) sont puissants. Ils demandent toutefois beaucoup de temps et de maintenance. (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)
- Commencez par la solution la plus simple qui résout le besoin. Un MCP server (endpoint minimal et authentifié) est souvent suffisant. PostHog signale que 34 % des dashboards créés par l’IA sont passés par leur MCP server, et que ces créations représentaient 18 % de tous les dashboards. (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)
- Alternatives simples à tester d’abord : un appel direct à un LLM bien prompté, un serveur MCP, ou un workflow codé en dur pour les étapes prévisibles. (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)

Note méthodologique : synthèse des leçons publiées par PostHog après ~2 ans d’itération. (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)

## Ce que vous allez construire et pourquoi c'est utile

Vous allez construire un MCP server minimal. Il doit :

- recevoir une requête en langage naturel ;
- appeler un LLM ou modèle adapté pour générer une sortie structurée ;
- valider la sortie contre un schéma JSON strict et versionné ;
- retourner un aperçu (preview) et n’appliquer la modification qu’après confirmation explicite.

Pourquoi c’est utile :

- Valider la valeur produit sans construire un agent conversationnel complet. (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)
- Réduire le coût initial et la maintenance par rapport à un agent intégré. (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)
- Limiter les erreurs en production grâce à la validation de schéma.

Tableau de décision rapide

| Critère                         | MCP server                   | Agent intégré                |
|---------------------------------|------------------------------|-----------------------------|
| Temps d'implémentation          | Plus court                   | Plus long                   |
| Coût de maintenance             | Plus faible                  | Plus élevé                  |
| Convient aux non‑ingénieurs     | Limité                       | Meilleur                    |
| Conformité / contrôle UX        | Bon si conçu correctement    | Excellente si bien intégré  |

(Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)

## Avant de commencer (temps, cout, prerequis)

Prérequis techniques minimaux :

- API produit existante pour actions lecture/écriture à exposer.
- Gestion d’authentification, quotas et scopes pour l’endpoint MCP. (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)
- Observabilité : métriques sur requêtes, échecs de validation, conversions preview→apply.
- UI minimale pour afficher l’aperçu et demander confirmation.

Points organisationnels et durée :

- Décidez si vos utilisateurs cibles sont des ingénieurs. Si oui, un MCP server peut suffire. (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)
- PostHog a prototypé puis publié une première version d’assistant en ~6 mois, puis itéré sur ~2 ans. (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)

## Installation et implementation pas a pas

Objectif : prouver la valeur rapidement. Ne construisez pas tout d’un coup. (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)

Étapes pratiques :

1) Choisissez UNE action simple et à fort impact (ex. create-dashboard). (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)
2) Définissez et versionnez un schéma JSON strict pour la sortie du modèle.
3) Implémentez un endpoint MCP qui :
   - reçoit POSTs authentifiés ;
   - appelle le modèle ou LLM ;
   - valide la sortie contre le schéma ;
   - retourne un aperçu et n’applique qu’après confirmation explicite.
4) Déléguez les flux déterministes à du code hardcodé pour réduire coût et latence.
5) Lancez en feature flag / canary, mesurez adoption et itérez.

Exemple minimal — installation et test local (bash) :

```bash
# installer et lancer un serveur d'exemple
pip install flask requests
FLASK_APP=mcp_server.py flask run --port 8080

# tester une action create-dashboard
curl -X POST http://localhost:8080/actions/create-dashboard \
  -H "Authorization: Bearer $MCP_KEY" \
  -H "Content-Type: application/json" \
  -d '{"question":"How many signups last week?"}'
```

Exemple de schéma JSON strict attendu (versionné) :

```json
{
  "type": "object",
  "properties": {
    "dashboard": {
      "type": "object",
      "properties": {
        "title": {"type": "string"},
        "widgets": {"type": "array"}
      },
      "required": ["title","widgets"]
    }
  },
  "required": ["dashboard"]
}
```

(Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)

## Problemes frequents et correctifs rapides

Problème : hallucinations ou JSON invalide.
- Correctif : validation stricte du schéma ; si validation échoue, afficher un draft et ne pas écrire. (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)

Problème : coûts modèle ou latences élevées.
- Correctif : déplacer la logique déterministe vers du code dur ; appeler le modèle uniquement pour les parties ambiguës.

Problème : adoption faible.
- Correctif : exemples in‑app, invites guidées, mesurer ratio créations AI / total créations pour décider d’efforts supplémentaires. (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)

Checklist d’incident rapide :
- [ ] Vérifier la télémétrie : erreurs et latences.
- [ ] Rejouer localement une sélection de prompts échoués.
- [ ] Confirmer la validation de schéma et l’état du feature flag.
- [ ] Si nécessaire, basculer le feature flag.

(Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)

## Premier cas d'usage pour une petite equipe

Contexte : valider la valeur avec le moindre effort. Ce plan s’adresse aux solo‑founders et petites équipes. (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)

Plan en 3 actions immédiates :

1) Limitez le périmètre à UNE seule action à fort impact (ex. create-dashboard). Définissez un schéma JSON unique et versionnez‑le. (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)
2) Déployez un MCP server minimal sur une petite VM ou serverless. Ajoutez une UI qui montre systématiquement un aperçu avant application. Activez derrière un feature flag et exposez l’endpoint à un groupe restreint au début. (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)
3) Mesurez rapidement : nombre de requêtes, échecs de validation, taux preview→apply. Itérez sur prompts et schéma ; ne construisez un agent intégré que si les métriques montrent une demande claire. (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)

Conseils pratiques :
- Priorisez une UX preview/confirm utile plutôt que l’automatisation complète.
- Versionnez prompts et schémas pour pouvoir rollback en < 1 jour.
- Automatisez les tests de validation JSON pour éviter les régressions.

## Notes techniques (optionnel)

- Versionnez prompts, schémas et règles d’acheminement dans le contrôle de source pour audits et rollbacks. (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)
- Pour sorties fortement structurées (SQL, JSON, code), privilégiez des modèles spécialisés ou un post‑processing strict pour réduire les erreurs.

Exemple feature flag + rollout (YAML) :

```yaml
feature: mcp_create_dashboard
owner: product@acme
rollout:
  canary_percent: 5
  users: [internal, beta_group]
```

Exemple de métadonnées de prompt à logger :

```json
{
  "prompt_version": "v1.0",
  "schema_version": "s1",
  "model": "hosted-llm-v1"
}
```

(Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Données observées par PostHog : 34 % des dashboards créés par l’IA ont transité par leur MCP server ; ces créations représentaient 18 % de toutes les créations. (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)
- Timeline observée chez PostHog : prototype → première version en ~6 mois, puis itérations sur ~2 ans. (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)
- Chiffres hypothétiques à valider pendant le canary (à adapter selon vos résultats) :
  - cohorte canary : 5 % des utilisateurs ;
  - objectif initial preview→apply : 75 % ;
  - seuil de rollback : 5 % d’erreurs critiques ;
  - latence d’orchestration visée : médiane ~200 ms ;
  - cap tokens par appel : 1 024 tokens ;
  - fréquence qui justifie un agent intégré : ~100 requêtes agent‑driven / semaine ;
  - budget prototype indicatif : $50–$200 ; réserve production initiale : $500–$2,000 / mois.

Ces chiffres sont des hypothèses de départ à mesurer et ajuster.

### Risques / mitigations

- Risque : hallucinations ou sorties non conformes.
  - Mitigation : validation JSON stricte, preview/confirm obligatoire, logs d’audit.
- Risque : coût modèle qui augmente rapidement.
  - Mitigation : capper tokens, externaliser logique déterministe en code, monitorer dépenses par endpoint.
- Risque : construire un agent intégré trop tôt.
  - Mitigation : n’investissez que si les métriques MCP (requêtes/semaine, taux preview→apply) franchissent vos gates.

### Prochaines etapes

- [ ] Implémenter l’endpoint MCP minimal et pipeline prompt→JSON derrière un feature flag (loggez prompt_version et schema_version). (Source: https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building)
- [ ] Lancer un canary court (ex. 5 % d’utilisateurs ou beta interne) et collecter au moins 2 semaines de métriques.
- [ ] Si les gates sont atteints, planifier rollout et décider entre poursuivre avec MCP server ou investir dans un agent intégré.

Source principale : https://newsletter.posthog.com/p/what-we-wish-we-knew-before-building
