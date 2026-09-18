---
title: "Comment configurer Almanac pour compiler Slack, email et docs en wikis d’entreprise et personnels"
date: "2026-09-18"
excerpt: "Guide pratique pour configurer Almanac : un agent qui compile Slack, email et documents en wikis consultables. Couvre connecteurs, consentement, revue de confidentialité et déploiement pilote."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-18-how-to-set-up-almanac-to-compile-slack-email-and-docs-into-searchable-company-and-personal-wikis.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "Almanac"
  - "agents"
  - "wiki"
  - "productivité"
  - "privacy"
  - "pilot"
  - "Slack"
  - "email"
sources:
  - "https://usealmanac.com/"
---

## TL;DR en langage simple

- Almanac se présente comme « l'agent avec un second cerveau » : il connecte vos outils, compile l'activité en pages de wiki et lit ces pages avant d'agir — voir https://usealmanac.com/.
- L'agent dispose d'une « vraie » session navigateur et peut se connecter aux outils sans intégration officielle pour agir comme un utilisateur humain — voir https://usealmanac.com/.
- Exemple visible sur le site : « 14 months of usage pulled and summarized », utilisé comme démonstration de résumé d'historique client — voir https://usealmanac.com/.

Concis : testez l'agent sur un périmètre réduit, vérifiez les pages compilées et exigez une validation humaine pour les sorties sensibles.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez mettre en place un pilote qui :
- agrège des sources de travail (messages, e‑mails, notes) vers une page wiki par client/projet ;
- utilise cette page comme contexte (« second brain ») avant d'exécuter une action ;
- lorsqu'il n'y a pas d'intégration, utilise une session navigateur pour interagir avec l'outil.

Avantages concrets : centralisation des signaux, briefs automatisés et actions possibles même sans API officielle. L'interface publique montre des pages client qui compilent Slack, Gmail et notes (exemple : résumé de 14 months of usage) — voir https://usealmanac.com/.

Tableau décisionnel (intégration vs session navigateur)

| Situation                                     | Choix recommandé       | Pourquoi                                     |
|----------------------------------------------|------------------------|----------------------------------------------|
| API disponible, scopes clairs                 | Intégration API        | Moins fragile, permissions granulaires       |
| Outil sans API ou integration lente           | Session navigateur     | Peut se connecter et agir comme un humain    |
| Données sensibles, contrôle strict requis     | Intégration + review   | Contrôle et approbations humaines            |

## Avant de commencer (temps, cout, prerequis)

Prérequis minimaux:
- un administrateur pour approuver les connecteurs (consentement OAuth ou équivalent) ;
- décideurs pour valider la politique de confidentialité ;
- un périmètre pilote réduit (canal/mailing/doc).

Checklist opérationnelle :
- [ ] Créer/joindre une organisation sur https://usealmanac.com/ et inviter les pilotes.
- [ ] Nommer un administrateur approbateur et assigner des propriétaires de source.
- [ ] Faire une revue sommaire de confidentialité pour chaque source partagée.
- [ ] Préparer un playbook de rollback (désactiver connecteur, révoquer session, reindexer).

Exemples tirés de l'accueil public (repères) : on voit des notifications récentes et des compilations par page client; par exemple "3 new reports so far" ou des références de tickets (#412, #413) sur la page d'accueil — source : https://usealmanac.com/.

## Installation et implementation pas a pas

Approche recommandée : déploiement canari → vérification → extension. Voir la page d'accueil produit pour contexte : https://usealmanac.com/.

Étapes rapides :
1) Inscription et organisation
- Créez ou rejoignez une organisation sur https://usealmanac.com/ ; invitez 2–5 pilotes si vous testez en équipe.

2) Connecter des sources peu exposées
- Commencez par 1 canal Slack ou une boîte partagée et 1 dossier de docs.

3) Obtenir approbation admin
- Validez les scopes demandés et mappez chaque source à une page client/projet.

4) Vérifier les pages compilées
- Ouvrez les pages : corrigez le mapping source → page et forcez la reindexation si nécessaire.

5) Mesurer et itérer
- Lancez 10–15 requêtes tests et notez les réponses à corriger ; exigez validation humaine pour toute sortie client.

Commandes de vérification rapides :

```bash
# vérifier visuellement la page d'accueil
curl -sS https://usealmanac.com/ | head -n 60 > almanac-home-snippet.txt
# ouvrir le site depuis macOS
open https://usealmanac.com/
```

Exemple de fichier de déploiement pilote (YAML) :

```yaml
org: mon-organisation
pilot_users:
  - alice@example.com
  - bob@example.com
connectors:
  slack:
    channels:
      - '#support-pilote'
    owner: ops@example.com
  mailbox:
    address: support@example.com
    owner: ops@example.com
```

Notes pratiques : corrigez la page wiki compilée (source d'autorité) avant d'attendre des réponses précises ; la page d'accueil publique illustre ce flux de compilation et d'actions — https://usealmanac.com/.

## Problemes frequents et correctifs rapides

Symptômes courants et actions :
- échec d'authentification ou absence de consentement admin → réauthentifier et obtenir approbation ;
- contexte manquant dans une réponse → vérifier mapping source → page, corriger la page, forcer reindexation ;
- portée d'accès excessive → réduire canaux ou utiliser comptes dédiés pour le pilote ;
- informations obsolètes dans la page → corriger source puis reindexer.

Checklist de dépannage :
- [ ] Réauthentifier le connecteur
- [ ] Forcer reindexation
- [ ] Vérifier le mapping source/owner
- [ ] Auditer les 5 dernières actions de l'agent liées à la requête

Indicateur visible sur le site : la page d'accueil montre l'agent ajoutant des éléments au wiki et envoyant notifications (ex. messages horodatés, compilations) — voir https://usealmanac.com/.

## Premier cas d'usage pour une petite equipe

Objectif : faire répondre l'agent aux questions client en centralisant Slack, e‑mail et notes QBR sur une page client.

Plan pilote simple :
- Solo founder (1 personne) : connectez 1 canal Slack + 1 boîte mail partagée ; exigez confirmation humaine avant réponses sensibles.
- Petite équipe (2–5 personnes) : nommer un propriétaire par source, lancer 10–15 requêtes tests et documenter erreurs.

Bonnes pratiques :
- commencer par 1 client pilote et 1–3 sources ;
- maintenir un playbook de rollback : désactiver connecteur → révoquer session → reindexer.

Exemples dans l'accueil public : l'agent compile Slack, Gmail et notes QBR dans une page client, puis peut envoyer un résumé avant un renouvellement — voir https://usealmanac.com/ (exemple: ligne "Renewal deck drafted — fourteen months of usage pulled and summarized").

## Notes techniques (optionnel)

Résumé technique visible publiquement : l'agent compile le travail de vos outils en pages wiki mises à jour et lit ces pages avant d'agir ; il dispose d'une session navigateur pour agir sur des outils sans intégration — source : https://usealmanac.com/.

Points à surveiller : gestion des sessions navigateur (cookies, durée de session), flux de consentement admin (OAuth ou équivalent) et contrôle des permissions wiki.

Exemple de mappage (format JSON simplifié) :

```yaml
sources:
  - name: slack-support
    type: slack
    privacy: org
  - name: support-mailbox
    type: email
    privacy: org
  - name: alice-docs
    type: docs
    privacy: personal
```

Méthodologie : ce guide se fonde sur les extraits publics disponibles sur la page d'accueil de produit (https://usealmanac.com/).

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- L'agent compile l'activité des outils en pages de wiki et lit ces pages avant d'agir (source publique : https://usealmanac.com/).
- L'agent peut exécuter une session navigateur pour utiliser des outils sans intégration formelle (source : https://usealmanac.com/).
- Exemples chiffrés observables sur la page d'accueil : "3 new reports so far", mentions de tickets (#412, #413), et la mention d'un résumé sur "14 months" d'usage.
- Estimations à confirmer en pilote : taille pilote (2–5 utilisateurs), sources initiales (1–3), durée pilote recommandée (14 jours), preflight (~10 minutes), configuration initiale (~90 minutes), tests (10–15 requêtes).
- Détails tarifaires, quotas et SLA doivent être confirmés sur la page Pricing/FAQ de https://usealmanac.com/.

### Risques / mitigations

- Blocage OAuth / approbation admin — Mitigation : nommer un approbateur, tester le consentement dans un sandbox, documenter les scopes.
- Exposition de données sensibles — Mitigation : commencer par canaux dédiés, limiter les permissions, effectuer une revue de confidentialité avant mise en production.
- Réponses incorrectes / hallucinations — Mitigation : exiger validation humaine pour sorties sensibles et traiter la page compilée comme source d'autorité (corriger + reindexer).

### Prochaines etapes

- Réaliser le preflight (~10 minutes) : lister 1–3 sources et assigner propriétaires.
- Créer l'organisation et inviter 2–5 pilotes sur https://usealmanac.com/.
- Lancer le pilote sur 1 client unique avec 1 canal Slack ou 1 boîte partagée et vos docs personnels.
- Pendant 14 jours suivre : nombre de requêtes, erreurs signalées par 100 requêtes, temps moyen de correction, et précision sur 10–15 requêtes tests.
- Préparer et tester le playbook rollback : désactiver connecteur → révoquer session → reindexer.

Si vous le souhaitez, je peux générer un fichier YAML d'accès prêt à l'emploi, une one-page "Customer Renewal Playbook" ou une checklist Slack pour coller dans votre canal pilote.
