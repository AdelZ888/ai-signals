---
title: "Vennio API v1.4.0 — requêter disponibilités, créer des réservations et gérer les webhooks pour applications et agents IA"
date: "2026-05-10"
excerpt: "Utilisez Vennio API v1.4.0 pour interroger la disponibilité multi-calendrier, créer des réservations (y compris flux payants Stripe) et traiter les webhooks booking.created — obtenez un flux fonctionnel en ~60–90 minutes (hypothèse)."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-10-vennio-api-v140-implement-availability-queries-direct-bookings-and-webhooks-for-apps-and-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "Vennio"
  - "API"
  - "scheduling"
  - "calendriers"
  - "webhooks"
  - "Stripe"
  - "développeurs"
  - "IA"
sources:
  - "https://docs.vennio.app"
---

## TL;DR en langage simple

- Vennio est une infrastructure de planification accessible par API REST. Base de production : https://api.vennio.app. Documentation principale : https://docs.vennio.app. La version stable indiquée est v1.4.0 et les endpoints de la série v1 sont rétrocompatibles. Source : https://docs.vennio.app.
- Flux minimal pour créer une réservation : 3 appels API — GET /v1/availability/slots, présenter des créneaux, POST /v1/bookings. Après le POST, Vennio crée l'événement, envoie les e‑mails de confirmation et émet le webhook booking.created. Source : https://docs.vennio.app.
- Capacités clés mentionnées : requêtes de disponibilité multi‑calendriers, réservations directes avec confirmation et envoi d'e‑mails, Venn Links (pages partageables), paiements via Stripe (checkout_url → pending_payment → confirmation automatique), webhooks en temps réel et synchronisation CRM. Source : https://docs.vennio.app.

Explication rapide : demandez les créneaux (GET /v1/availability/slots), laissez l'utilisateur choisir, créez la réservation (POST /v1/bookings). Vennio gère la création d'événement et les webhooks. Voir la doc : https://docs.vennio.app.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez exposer un endpoint back‑end simple qui :

- interroge la disponibilité via GET /v1/availability/slots pour un ou plusieurs comptes calendaires ; source : https://docs.vennio.app ;
- affiche quelques options à l'utilisateur/agent et recueille sa sélection ;
- crée la réservation via POST /v1/bookings et traite le webhook booking.created pour finaliser le workflow (CRM, notifications, suivi). Source : https://docs.vennio.app.

Pourquoi : automatiser la planification élimine les échanges manuels, réduit les conflits de 2‑way scheduling et assure l'envoi d'e‑mails/confirms automatiquement. Les Venn Links permettent aussi des pages publiques si vous préférez cette UX. Source : https://docs.vennio.app.

Tableau récapitulatif (référence rapide aux capacités documentées)

| Fonctionnalité | Endpoint / objet | Référence |
|---|---:|---|
| Requête de disponibilité | GET /v1/availability/slots | https://docs.vennio.app |
| Réservation via API | POST /v1/bookings | https://docs.vennio.app |
| Page de réservation partagée | Venn Links | https://docs.vennio.app |
| Paiements avant confirmation | checkout_url → pending_payment | https://docs.vennio.app |

## Avant de commencer (temps, cout, prerequis)

Prérequis techniques et comptes (s'appuyer sur la doc) :

- clé API Vennio (VENNIO_API_KEY) et accès au tableau de bord Vennio — voir https://docs.vennio.app ;
- au moins un calendrier connecté (Google Calendar ou Microsoft 365) pour tester l'accès et le consentement ;
- si paiement requis : compte Stripe pour tester les flux checkout_url / pending_payment (référence : https://docs.vennio.app) ;
- endpoint webhook HTTPS public (ngrok utile pour le dev). Base API prod = https://api.vennio.app ; dev local possible sur http://localhost:3001. Source : https://docs.vennio.app.

Opérations recommandées avant mise en prod : séparer clés dev / prod, configurer logs et monitoring des webhooks et erreurs (réessayage et alerting).

## Installation et implementation pas a pas

1) Récupérer et stocker la clé API

- Obtenez VENNIO_API_KEY via le tableau de bord Vennio et stockez‑la dans votre coffre à secrets. Voir : https://docs.vennio.app.

2) Variables d'environnement (exemple)

```json
{
  "VENNIO_API_KEY": "sk_test_xxx",
  "WEBHOOK_URL": "https://votreapp.example.com/webhooks/vennio",
  "BASE_URL": "https://api.vennio.app"
}
```

3) Démarrer un serveur local et exposer pour tests

```bash
# démarrer l'API locale fournie (ex. doc) puis exposer
cd api && node server.js    # serveur local écoutant sur 3001
ngrok http 3001             # expose http://localhost:3001 sur internet
```

(La doc mentionne la base locale: http://localhost:3001 et la prod: https://api.vennio.app — voir https://docs.vennio.app.)

4) Connecter des calendriers et gérer le consentement

- Suivez le flux de consentement et surveillez les événements consent.changed envoyés par Vennio via webhooks. Source : https://docs.vennio.app.

5) Appeler l'endpoint disponibilité (exemple)

```bash
curl -H "Authorization: Bearer $VENNIO_API_KEY" \
  "https://api.vennio.app/v1/availability/slots?from=2026-05-11T00:00:00Z&to=2026-05-18T00:00:00Z&duration=30"
```

- Présentez les créneaux retournés à l'utilisateur en convertissant les timestamps ISO8601 dans son fuseau local. Voir la doc : https://docs.vennio.app.

6) Créer la réservation

- Après sélection, appelez POST /v1/bookings. Pour les Venn Links payants, inspectez checkout_url et l'état pending_payment ; la confirmation peut arriver automatiquement après le paiement via Stripe Checkout. Source : https://docs.vennio.app.

7) Tester les webhooks

- Gérez booking.created, booking.cancelled et consent.changed. Persistez les événements et déclenchez vos workflows (CRM, notifications). Source : https://docs.vennio.app.

## Problemes frequents et correctifs rapides

Symptômes courants et actions immédiates (voir la doc : https://docs.vennio.app) :

- Aucun créneau retourné : vérifier consentement et connexion du calendrier (surveillez consent.changed). Voir : https://docs.vennio.app.
- Fuseaux horaires erronés : traiter en UTC côté API, afficher en TZ local côté client ; vérifier les timestamps ISO8601 renvoyés par l'API.
- Webhooks non reçus : vérifier que l'endpoint HTTPS est accessible, certificat TLS valide, ou utiliser ngrok en dev. Confirmer via les logs Vennio et vos logs applicatifs.
- Paiement bloqué en pending_payment : valider le flux Stripe Checkout et les webhooks Stripe en sandbox.

Bonnes pratiques rapides : journaliser tous les webhooks (pour replay), implémenter une file de réessai et alerter si échecs répétés.

## Premier cas d'usage pour une petite equipe

Cible : fondateurs solo et équipes de 2–3 personnes qui veulent automatiser entretiens, démos ou appels d'onboarding.

Actions concrètes, immédiatement réalisables :

1) Prototyper le flux minimal (30–90 minutes estimés selon votre stack) :
   - Implémentez l'appel GET /v1/availability/slots pour 1 ou 2 comptes calendaires et affichez les créneaux retournés. Source : https://docs.vennio.app.
   - Validez en appelant la commande curl fournie précédemment pour voir la réponse brute.

2) Ajouter un webhook minimal :
   - Exposez /webhooks/vennio et gérez booking.created pour créer automatiquement une fiche contact (ou envoyer un message Slack). Utilisez ngrok en dev pour vérifier la livraison des webhooks. Source : https://docs.vennio.app.

3) Créer des bookings via API pour garder le contrôle UX :
   - Après sélection côté client, appelez POST /v1/bookings depuis votre backend, persistez l'objet booking créé et traitez booking.created pour mises à jour CRM. Source : https://docs.vennio.app.

4) Sécuriser et séparer environnements :
   - Stockez une clé VENNIO_API_KEY par environnement, et testez les webhooks en dev avant basculement en production. Voir la doc : https://docs.vennio.app.

Ces étapes sont délibérément minimales pour permettre à une équipe de 1–3 personnes de livrer un prototype fonctionnel rapidement tout en restant conforme aux capacités documentées : https://docs.vennio.app.

## Notes techniques (optionnel)

- Version API stable mentionnée : v1.4.0. Les endpoints v1 sont rétrocompatibles. Base prod : https://api.vennio.app ; dev local : http://localhost:3001. Source : https://docs.vennio.app.
- Endpoints centraux cités dans la doc : GET /v1/availability/slots et POST /v1/bookings. Les réservations payantes renvoient checkout_url et peuvent rester en status pending_payment jusqu'au paiement via Stripe Checkout. Source : https://docs.vennio.app.

Méthodologie : ce guide se limite aux extraits officiels fournis dans la documentation publique : https://docs.vennio.app.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Flux documenté : 3 appels pour un booking complet (GET availability, sélection, POST booking) — extrait doc : 3 appels. Source : https://docs.vennio.app.
- Hypothèses opérationnelles à valider en environnement réel (estimations à confirmer) :
  - prototype rapide : 60–90 minutes ;
  - hardening avant production : 3–8 heures ;
  - tests d'acceptation : exécuter au moins 5 tests minimaux ;
  - fenêtre UX recommandée (hypothèse) : 7 jours ;
  - durée créneau par défaut (hypothèse) : 30 minutes ;
  - canary : ~5% des utilisateurs ou 5 personnes pendant 48 heures ;
  - latence cible création booking : < 2 000 ms ;
  - délai cible réception booking.created en smoke : < 30 s ;
  - taux webhook visé : > 95% de livraison.
- Inconnue technique à confirmer : format exact des signatures de webhooks, règles d'idempotence et fenêtre de replay — vérifier la doc complète sur https://docs.vennio.app.

### Risques / mitigations

- Risque : webhooks perdus. Mitigation : retries exponentiels, journalisation et possibilité de replay sur au moins 7 jours.
- Risque : doublons de réservation. Mitigation : idempotence côté client (clé unique par tentative) et vérifications backend avant persistance.
- Risque : paiements non confirmés (pending_payment). Mitigation : tests en sandbox Stripe, vérification du checkout_url et écoute des webhooks Stripe jusqu'à confirmation.

### Prochaines etapes

- [ ] Créer la clé API Vennio et la stocker dans le vault (VENNIO_API_KEY) — voir https://docs.vennio.app.
- [ ] Exposer un webhook HTTPS et vérifier la réception avec ngrok (ou URL prod) ; vérifier les events booking.created et consent.changed. Source : https://docs.vennio.app.
- [ ] Connecter 1 calendrier test (Google/Microsoft) et valider le consentement via la plateforme Vennio. Source : https://docs.vennio.app.
- [ ] Implémenter GET /v1/availability/slots → présenter des options → POST /v1/bookings (flux documenté : https://docs.vennio.app).
- [ ] Lancer 5 tests smoke et mesurer latence création booking et réception booking.created (objectifs listés en Hypotheses / inconnues).
- [ ] Canary : activer pour ~5% des utilisateurs (ou 5 personnes) pendant 48 heures et surveiller erreurs et latence.

Pour la référence complète et les exemples d'implémentation détaillés, consultez la documentation officielle : https://docs.vennio.app.
