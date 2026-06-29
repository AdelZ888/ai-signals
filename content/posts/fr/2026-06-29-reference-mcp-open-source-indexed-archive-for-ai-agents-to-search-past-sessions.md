---
title: "Reference MCP : archive indexée open-source pour que des agents IA consultent des sessions passées"
date: "2026-06-29"
excerpt: "Reference MCP est un dépôt open-source qui permet à des agents IA de rechercher des sessions précédentes afin de réutiliser décisions et preuves. Exécutez la démo en local, mais configurez d'abord rétention et contrôles d'accès."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-29-reference-mcp-open-source-indexed-archive-for-ai-agents-to-search-past-sessions.jpg"
region: "UK"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 30
editorialTemplate: "NEWS"
tags:
  - "AI"
  - "agents"
  - "open-source"
  - "devops"
  - "privacy"
  - "UK"
  - "engineering"
sources:
  - "https://github.com/kuberwastaken/reference"
---

## TL;DR en langage simple

- Le dépôt « Reference MCP » montre un modèle : un agent d'intelligence artificielle (IA) peut rechercher des sessions passées d'un autre agent (voir https://github.com/kuberwastaken/reference).
- Ce que cela apporte : réutiliser des raisonnements et des décisions déjà produits pour éviter de relancer des calculs longs ou de répéter des dialogues.
- Risques immédiats : indexer des sessions augmente la surface d'exposition — tokens, clés API, PII (informations personnelles identifiables). Il faut appliquer des contrôles avant d'ouvrir l'accès.
- À tester vite : cloner le repo, lancer la démo locale et créer 10–100 sessions sandbox pour observer le flux (https://github.com/kuberwastaken/reference).

Exemple rapide (scénario court) :
- Une revue de code génère une session qui note un risque d'API. Un autre agent interroge l'index, trouve le résumé et propose une action. Sans index, l'agent doit rejouer la revue ou demander un humain.

Remarque méthode : les fonctions de base décrites ici s'appuient sur le dépôt cité ; les chiffres sont des recommandations pour un pilote.

Explication simple avant les détails techniques :
- Concrètement, le dépôt permet de stocker des « sessions » (id, agent, date, résumé) et d'interroger ces sessions. Vous déployez et contrôlez le stockage. C'est un pattern, pas un service centralisé hébergé par le dépôt.

## Ce qui a change

- Le dépôt Reference MCP documente un artefact déployable qui indexe et rend interrogeables des sessions d'agents (source : https://github.com/kuberwastaken/reference).
- Ce n'est pas un service centralisé : l'intention est que vous déployiez et contrôliez la configuration (rétention, ACL — access control list, redaction) sur votre infrastructure.
- Composants visibles dans le repo : index de sessions (session_id, agent_id, timestamp, résumé/payload), moteur d'interrogation et exemples pour démarrer localement (voir le README sur https://github.com/kuberwastaken/reference).

## Pourquoi c'est important (pour les vraies equipes)

- Efficacité : un agent peut réutiliser un raisonnement stocké au lieu de relancer une analyse qui prend 5–60 minutes.
- Traçabilité : enregistrer session_id et échanges facilite les post-mortems et les audits. On peut rechercher une session précise au lieu de reconstituer tout l'historique.
- Flux multi‑agent : un agent aval peut interroger l'index et obtenir un résumé en lecture seule. Cela réduit les allers‑retours humains.
- Sécurité et gouvernance : l'indexation augmente la portée d'une fuite (tokens, clés, PII). Il faut définir ACL, redaction et règles de rétention avant la mise en production.

Toutes ces caractéristiques sont décrites et illustrées dans le repo de référence (https://github.com/kuberwastaken/reference).

## Exemple concret: a quoi cela ressemble en pratique

Scénario simple : la revue de code signale un risque d'API. L'agent de déploiement doit décider.

Étapes pratiques :
1. La revue crée une session S-20260620-42 (session_id, agent_id, timestamp, extrait et résumé).
2. La session est indexée avec des métadonnées (conforme à l'intention du dépôt : https://github.com/kuberwastaken/reference).
3. L'agent de déploiement interroge l'index, récupère le résumé et applique sa logique métier.
4. Règle opérationnelle possible : si la session a plus de 30 jours, exiger un accusé de réception humain avant toute action.

Bonnes pratiques pour un pilote : limiter l'index à 100–500 sessions et garder des résumés courts (<8000 tokens) pour maîtriser coût et latence.

Commande d'amorçage recommandée :

```bash
# Temps estimé : 15–30 minutes
git clone https://github.com/kuberwastaken/reference
cd reference
# suivre le README pour lancer la démo locale
```

## Ce que les petites equipes et solos doivent faire maintenant

Actions concrètes et prioritaires pour fondateurs solo / petites équipes. Référence technique : https://github.com/kuberwastaken/reference

1) Expérimenter localement (durée cible : 1–2 heures).
   - Cloner le repo (15–30 min) et lancer la démo. Créer 10–50 sessions d'essai pour valider le flux d'indexation et d'interrogation.
2) Piloter restreint (période recommandée : 30 jours).
   - Déployer sur une VM unique. Restreindre l'accès à 2–3 personnes ou agents. Vérifier la suppression automatique (TTL) sur un petit jeu de 100 sessions.
3) Mettre en place une redaction minimale avant indexation.
   - Appliquer 3 expressions régulières prioritaires : tokens API, adresses email, numéros de carte. Scanner un échantillon de ~100 sessions avant ouverture large.
4) Mesurer coût et latence.
   - Objectifs cibles pour le pilote : latence d'interrogation <200 ms et résumés <8000 tokens. Si la latence dépasse 200 ms, réduire la taille des résumés ou activer un cache.
5) Gouvernance légère.
   - Chiffrer les payloads au repos, n'autoriser que les producteurs à écrire (ACL) et conserver des logs d'accès. Coût pilote estimé : VM à $10–50/mois selon le fournisseur.

Ces actions permettent de valider le pattern en 1–2 jours de travail pour un solo ou une petite équipe, tout en gardant le périmètre contrôlé.

## Angle regional (UK)

- Réglementaire : appliquer le UK GDPR (loi britannique sur la protection des données, équivalent local du GDPR européen) — principes de minimisation, documentation des finalités et responsabilité du traitement. Le dépôt aide à comprendre l'objet technique du stockage (https://github.com/kuberwastaken/reference).
- Paramètres recommandés pour un pilote UK : rétention pilote = 30 jours, pseudonymisation des identifiants, scan des PII sur un échantillon de 100 sessions avant ouverture large.

Checklist opérationnelle UK (immédiat) :
- Activer la pseudonymisation des contenus de session.
- Documenter la finalité et le responsable du traitement (record of processing activity).
- Scanner 100 sessions pour détecter la PII avant élargissement.

Remarque : validez ces actions avec votre équipe juridique locale.

## Comparatif US, UK, FR

Source technique : https://github.com/kuberwastaken/reference

| Région | Rétention pilote | Mesures additionnelles | Accès conseillé |
|---|---:|---|---|
| US (général) | 30 jours | ACL, redaction, suppression API | lecture seule pour agents aval |
| UK | 30 jours | pseudonymisation, documentation d'objectif, scan PII (~100 sessions) | ACL + contrôle documentaire |
| FR | 30 jours | minimisation stricte, consentement si PII sensibles | ACL + logs d'accès détaillés |

Ces valeurs sont des points de départ pour un pilote. Adaptez selon le cadre légal et le contexte métier.

## Notes techniques + checklist de la semaine

### Hypotheses / inconnues

- Le dépôt https://github.com/kuberwastaken/reference décrit le pattern d'index de sessions et l'intention de permettre à des agents d'interroger des sessions d'autres agents. Le schéma exact, les formats de résumé et les règles de redaction ne sont pas entièrement spécifiés dans l'extrait ; ils seront validés lors du déploiement.
- Les seuils chiffrés cités ici (latence <200 ms, résumés <8000 tokens, rétention = 30 jours, pilote 10–100 sessions, 2–3 personnes/agents) sont des recommandations d'ingénierie pour un pilote. Ils doivent être confirmés par des tests.

### Risques / mitigations

Risques principaux :
- Exposition de secrets (tokens, clés API) — mitigation : redaction regex avant indexation, chiffrement au repos, suppression automatique.
- Conservation excessive de PII — mitigation : TTL automatique (ex. 30 jours) et pseudonymisation.
- Propagation d'erreurs entre agents — mitigation : ajouter un champ « confidence » et exiger une validation humaine si la confiance est faible.

Mesures opérationnelles proposées : limiter l'index à 100–500 sessions pour un pilote, garder des résumés courts (<8000 tokens), mesurer la latence cible (<200 ms), chiffrer les données et appliquer ACL write-only pour les producteurs.

### Prochaines etapes

- [ ] git clone https://github.com/kuberwastaken/reference — 15–30 minutes
- [ ] Lancer la démo locale et créer 10–100 sessions d'essai — 30–60 minutes
- [ ] Limiter l'accès à un pilote de 2–3 personnes/agents — 15 minutes
- [ ] Implémenter redaction automatique (regex API tokens, emails, numéros) et scanner 100 sessions — 1–2 heures
- [ ] Configurer job TTL (rétention = 30 jours) et tester suppression sur 100 sessions — 1 heure
- [ ] Mesurer latence d'interrogation (objectif <200 ms) et ajuster résumés si nécessaire

Rappel : le dépôt technique (https://github.com/kuberwastaken/reference) est le point de départ. Adaptez la gouvernance et validez la conformité juridique avant ouverture large.
