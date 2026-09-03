---
title: "Oconee Runtime : autorisation par action pour les agents IA dans le navigateur et les outils de codage"
date: "2026-09-03"
excerpt: "Les assistants dans le navigateur et les agents de développement peuvent désormais exécuter des commandes et modifier du code. Oconee Runtime recommande des vérifications de politique au moment de l'exécution (per-action runtime authorization) : refuser par défaut les écritures et l'accès aux identifiants, tagger et journaliser les actions."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-03-oconee-runtime-per-action-runtime-authorization-for-browser-ai-and-coding-agents.jpg"
region: "FR"
category: "News"
series: "security-boundary"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "IA"
  - "gouvernance"
  - "sécurité"
  - "runtime"
  - "agents"
  - "développement"
  - "CNIL"
  - "GDPR"
sources:
  - "https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents"
---

## TL;DR en langage simple

- Les assistants dans le navigateur et les « agents de codage » peuvent désormais agir, pas seulement générer du texte : exécution de commandes shell, modification de fichiers, installation de paquets, interactions avec des dépôts. Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents

- Contrôler les prompts et les réponses reste utile, mais insuffisant : il faut une médiation en runtime qui décide "allow / deny / escalate" au moment où l'agent veut agir. Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents

- Actions rapides recommandées pour commencer : inventorier les agents et leurs tokens, appliquer deny‑by‑default sur écritures, journaliser chaque décision et lancer un projet canari en lecture seule. Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents

- Exemple résumé : un plugin IDE propose un patch puis tente 3 actions séquentielles (installer, tester, pousser). Il faut intercepter chaque action, évaluer le contexte et journaliser la décision. Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents

## Ce qui a change

Les premiers contrôles cherchaient surtout à filtrer ce qui entrait et sortait du modèle (prompts, réponses, secrets). Aujourd'hui, les flux agentiques sont plus longs et actifs : Intent → Agent → Reasoning → Tool → Action → Resource. Un agent peut chaîner plusieurs actions (modifier des sources, installer un paquet, exécuter une commande, lire une configuration, pousser sur un dépôt). OWASP et l'extrait d'Oconee montrent que ces agents peuvent exécuter des commandes, installer des paquets, éditer des fichiers, lancer des tests et opérer sur des dépôts. La sécurité devient en partie un problème d'autorisation à l'exécution. Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents

## Pourquoi c'est important (pour les vraies equipes)

- Blast radius plus grand : une autorisation mal calibrée pour un agent peut produire plusieurs changements sur plusieurs ressources en une seule séquence. Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents

- Auditabilité par action : il faut tracer pour chaque action l'agent_id, la décision, la raison et l'horodatage pour enquêtes et remédiation. Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents

- Contexte d'autorisation requis : l'évaluation doit prendre en compte le token, le scope, l'environnement et l'état du dépôt — pas seulement le contenu du prompt. Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents

## Exemple concret: a quoi cela ressemble en pratique

Scénario court : un assistant IDE propose un patch, puis tente 3 actions séquentielles : (1) "npm install", (2) lancer les tests, (3) pousser un commit.

Pattern de médiation runtime : intercepter → authentifier l'agent → évaluer la politique → répondre allow/deny/escalate → journaliser.

Processus typique :
- Interception : l'agent émet "execute: npm install".
- Authentification : extraire agent_id, token, repo, branch.
- Évaluation : politique runtime calcule décision selon scope, risque et contexte.
- Décision et log : horodatage, action, ressource, décision, raison.

Points opérationnels recommandés (valeurs de départ) : latence d'évaluation cible ≈ 200 ms, hit-cache décisions ≈ 90%, rétention logs phase 1 = 30 jours, tolérance aux faux positifs pendant tuning ≤ 10%. Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents

## Ce que les petites equipes et solos doivent faire maintenant

Ces actions sont conçues pour un fondateur solo ou une équipe de 1–5 personnes ; priorité : réduire le risque rapidement sans bloquer la productivité.

1) Inventaire minimal (2–3 jours)
- Listez où tournent des agents : extensions navigateur, plugins IDE, hooks CI/CD. Notez pour chaque intégration le token utilisé, le scope et le propriétaire (même si c'est vous). Objectif : inventaire initial en ≤3 jours. Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents

2) Appliquer deny‑by‑default pour écritures critiques (immédiat)
- Sur 1 projet canari, bloquez par défaut les opérations qui modifient le dépôt ou installent paquets (écritures, pushes, installs). Ne permettez l'écriture qu'après approbation humaine. Cela réduit le blast radius tout en vous permettant d'itérer. Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents

3) Imposer tokens éphémères et propriétaires clairs (24 h si possible)
- Favorisez tokens courts (durée ≤24 h) et attribuez un propriétaire clair pour chaque token afin de pouvoir révoquer en ≤5 minutes si nécessaire. Objectif : limiter l'impact d'un token compromis. Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents

4) Tagging léger et journalisation (implémentation en 1 sprint)
- Chaque requête agent doit porter agent_id, type d'action et ressource ciblée ; stockez les logs dans un emplacement restreint. Rétention initiale recommandée : 30 jours pour tuning. Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents

5) Canari en lecture seule + réglage (1–2 sprints)
- Déployez la médiation en read‑only sur staging, acceptez jusqu'à 10% de faux positifs pendant l'ajustement, collectez métriques de latence et fréquence d'actions (ex. actions/jour). Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents

## Angle regional (FR)

La prescription technique (intercepter et évaluer en runtime) est la même en France, mais complétée par des obligations légales locales. En FR, prenez en compte les recommandations de la CNIL pour la protection des données personnelles : DPIA si traitement à risque, conservation et pseudonymisation des logs, et règles sur les transferts internationaux. Validez les exigences CNIL avec votre service juridique avant d'augmenter la rétention au‑delà de 30 jours. Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents

## Comparatif US, UK, FR

Opérationnel : même besoin d'interception et d'autorisation runtime.

Légalité et conformité :
- US : règles sectorielles (HIPAA, finance) et contrats clients souvent prescriptifs ; gardez des contrôles contractuels et des limites de scope des tokens.
- UK : règles proches de l'UE mais avec particularités post‑Brexit (ICO guidance) ; prévoir DPIA similaire si données personnelles impliquées.
- FR : CNIL peut exiger DPIA, limitation de conservation et pseudonymisation des logs.

Ces différences sont réglementaires ; les contrôles techniques recommandés restent ceux décrits par Oconee. Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents

## Notes techniques + checklist de la semaine

Oconee décrit une couche de médiation qui intercepte les demandes d'action, évalue la politique en runtime, renvoie allow/deny/escalate et journalise la décision. Pattern : intercepter → évaluer → répondre → journaliser. Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents

Tableau synthétique (valeurs de départ) :

| Composant | Valeur / objectif | Remarque |
|---|---:|---|
| Latence d'évaluation | 200 ms | cible pour UX acceptable |
| Hit cache décisions | 90% | réduire latence sur actions répétées |
| Rétention logs (phase 1) | 30 jours | tuning et triage |
| Tokens par intégration | ≤5 | limiter le blast radius |
| Faux positifs tolérés (tuning) | ≤10% | phase d'ajustement |
| Durée token éphémère recommandée | ≤24 h | rotation rapide |

Checklist opérationnelle (semaine 1) :

- [ ] Inventaire des agents + tokens (objectif : inventaire initial en 3 jours). Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents
- [ ] Déployer deny‑by‑default pour écritures / accès identifiants sur 1 canari
- [ ] Tagger & journaliser les actions agent (agent_id, action, ressource, décision)
- [ ] Mettre en place tokens éphémères et assigner propriétaires
- [ ] Déployer médiation en read‑only sur staging et accepter ≤10% faux positifs pendant réglage

### Hypotheses / inconnues

- Hypothèse : il est possible d'insérer une couche de médiation aux points où les agents appellent des outils externes (extensions navigateur, plugin IDE, sidecar CI). Ce pattern est central dans l'extrait Oconee. Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents
- Hypothèse : les chiffres proposés (200 ms, 30 jours, ≤5 tokens, ≤10% faux positifs, ≤24 h token, 90% cache hits) sont des points de départ opérationnels à tester en contexte.
- Hypothèse : obligations légales locales (DPIA, exigences CNIL/UK/US) ne sont pas détaillées dans l'extrait et doivent être validées avec le juridique.

### Risques / mitigations

- Risque : faux positifs perturbant la productivité. Mitigation : canari en read‑only, collecte de logs, itération rapide des règles, tolérance initiale ≤10%.
- Risque : latence d'évaluation qui casse le flux développeur. Mitigation : cache décisions, viser 200 ms et ~90% hits cache.
- Risque : exposition des logs contenant données sensibles. Mitigation : redaction/pseudonymisation, accès restreint, rétention courte (30 jours en phase de tuning).

### Prochaines etapes

- [ ] Réaliser l'inventaire des points d'entrée agents (navigateur, IDE, CI) et lister tokens + scopes (objectif : canari en ≤3 jours). Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents
- [ ] Déployer deny‑by‑default pour écritures et accès identifiants sur 1 projet canari avec journalisation complète
- [ ] Tagger les actions agent (agent_id, type d'action, ressource, décision) et acheminer les logs vers un stockage à accès restreint
- [ ] Tester et documenter un flux d'approbation humaine pour écritures en production
- [ ] Valider implications légales locales avec conformité / juridique si traitement de données personnelles

Méthodologie : synthèse basée uniquement sur l'extrait public d'Oconee Runtime cité ci‑dessus ; les valeurs numériques sont des points de départ à valider en contexte. Source : https://www.oconeeruntime.com/news/policy-enforcement-for-browser-ai-and-coding-agents
