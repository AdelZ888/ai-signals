---
title: "Mailto.Bot : boîtes mail instantanées et API email compatible MCP pour agents IA"
date: "2026-04-20"
excerpt: "Guide Mailto.Bot : créez des boîtes mail instantanées avec un seul POST, recevez les messages via webhooks ou MCP, et prototypez des workflows pilotés par agents sans gérer DNS ni SMTP."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-20-mailtobot-instant-mailboxes-and-mcp-enabled-email-api-for-ai-agents.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 45
editorialTemplate: "TUTORIAL"
tags:
  - "AI"
  - "email"
  - "API"
  - "MCP"
  - "développement"
  - "agents"
  - "productivité"
sources:
  - "https://mailto.bot"
---

## TL;DR en langage simple

- Mailto.Bot fournit une adresse e‑mail prête à l'emploi en une seule requête POST. Voir https://mailto.bot
- Vous pouvez envoyer et recevoir des messages via une API REST (JSON) ou en connectant un agent via MCP (Model Context Protocol) avec mailtobot://connect. Voir https://mailto.bot
- Pas de configuration DNS ni de vérification de domaine requise. Les messages s'auto‑expirent et les webhooks livrent le payload complet en JSON. Voir https://mailto.bot

Actions rapides (30 s)
- [ ] Créez un token API dans le tableau de bord Mailto.Bot. Voir https://mailto.bot
- [ ] POST /api/mailboxes pour obtenir une adresse (une requête, <60 s selon la doc). Voir https://mailto.bot
- [ ] Choisissez entre webhooks (JSON direct) ou mailtobot://connect (MCP). Voir https://mailto.bot

Exemple concret rapide
- Scénario : un agent d'onboarding crée une boîte my-agent@mailtobot.app par POST. Il envoie un message de bienvenue via l'API et reçoit les réponses via un webhook JSON. En 60 s, la boîte est opérationnelle. Voir https://mailto.bot

Note méthodologique : les points clés (création instantanée par 1 POST, support MCP, 9 outils, webhooks JSON, messages éphémères, snippets en 6 langues) sont tirés du résumé public de Mailto.Bot. Voir https://mailto.bot

## Ce que vous allez construire et pourquoi c'est utile

But concret

Vous allez créer un prototype minimal qui :
1. Crée une boîte instantanée via POST /api/mailboxes (une requête). Voir https://mailto.bot
2. Reçoit les messages entrants via webhooks (payload JSON complet) ou via MCP. Voir https://mailto.bot
3. Envoie des messages depuis l'API REST vers l'extérieur ou entre boîtes d'organisation. Voir https://mailto.bot

Pourquoi c'est utile pour un produit

- Lancement rapide : "From zero to working email in under a minute" (moins de 60 s) et intégration en 3 lignes de code selon la documentation publique. Voir https://mailto.bot
- Moins de glue : MCP (Model Context Protocol) fournit des outils natifs (9 outils) pour gérer boîtes et messages, ce qui réduit la logique côté client. Voir https://mailto.bot
- Intégration simple côté backend : webhooks "zero polling" pour recevoir les messages en temps réel. Voir https://mailto.bot

Explication simple avant les détails avancés

Mailto.Bot vous donne une adresse e‑mail prête à l'emploi à la demande. Vous n'avez pas besoin d'ajouter des enregistrements DNS ni de prouver la propriété d'un domaine. Vous gérez la boîte par API. Choisissez webhooks si vous voulez recevoir immédiatement des POST HTTP avec le message en JSON. Choisissez MCP (mailtobot://connect) si vous voulez que votre agent AI utilise des outils intégrés pour lire, envoyer et gérer les messages.

## Avant de commencer (temps, cout, prerequis)

Prérequis minimaux

- Compte Mailto.Bot et token API (généré dans le dashboard). Voir https://mailto.bot
- Endpoint webhook public (ngrok, un tunnel, ou une URL de staging accessible depuis internet). Voir https://mailto.bot
- Optionnel : agent/client compatible MCP si vous prévoyez d'utiliser mailtobot://connect. Voir https://mailto.bot

Checklist avant implémentation

- [ ] Générer un token API dans le dashboard Mailto.Bot. Voir https://mailto.bot
- [ ] Disposer d'une URL webhook publique et tester l'accessibilité.
- [ ] Préparer un stockage minimal (DB = base de données) si vous devez conserver des messages éphémères.

Coût et temps pour obtenir le premier e‑mail

- Time-to-first-mail : <60 s selon la documentation publique. Voir https://mailto.bot
- Exemples de code fournis en 6 languages (langages) pour démarrer rapidement. Voir https://mailto.bot

## Installation et implementation pas a pas

1) Créer une boîte (une requête)

```bash
curl -X POST "https://api.mailtobot.app/api/mailboxes" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-agent"}'
```

Réponse JSON attendue (exemple) :

```json
{ "address": "my-agent@mailtobot.app" }
```

2) Envoyer un message de test via l'API

```bash
curl -X POST "https://api.mailtobot.app/api/mailboxes/my-agent/messages" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to":"user@example.com","subject":"hi","body":"Hello from agent"}'
```

La réponse contient un identifiant de message (ex : msg_01jf...). Voir https://mailto.bot

3) Choisir le mode d'intégration : Webhook vs MCP

- Webhooks : Mailto.Bot envoie un POST HTTP à votre endpoint pour chaque message entrant. Le payload est fourni en JSON complet (zero polling). Voir https://mailto.bot
- MCP (mailtobot://connect) : connectez un agent compatible. L'agent reçoit 9 outils natifs pour créer/lister/supprimer des boîtes, envoyer/lire/supprimer des messages et gérer les webhooks. Voir https://mailto.bot

Comparaison rapide

| Critère | Webhooks | MCP (mailtobot://connect) |
|---|---:|---:|
| Latence d'intégration | POST direct (zero polling) | intégration agent‑native |
| Code client | handler HTTP minimal | moins de glue côté agent |
| Outils exposés | réception JSON | 9 tools exposés par Mailto.Bot |

4) Handler webhook minimal (Node / Express)

```ts
// webhook-handler.ts
import express from 'express'
const app = express()
app.use(express.json())
app.post('/webhook', (req, res) => {
  // TODO: vérifier la signature WEBHOOK_SECRET
  const payload = req.body
  console.log('inbound message id', payload?.message?.id)
  // persister si besoin
  res.status(200).send('ok')
})
app.listen(8080)
```

Explication : ce handler réceptionne le POST envoyé par Mailto.Bot. Vérifiez la signature (WEBHOOK_SECRET) pour confirmer l'origine avant de persister quoi que ce soit.

5) Configuration d'exemple (variables d'environnement)

```yaml
# sample-config.yaml
API_TOKEN: "${MAILTO_API_TOKEN}"
WEBHOOK_SECRET: "${MAILTO_WEBHOOK_SECRET}"
MAILBOX_NAME: "onboarding-agent"
```

Voir https://mailto.bot

## Problemes frequents et correctifs rapides

401 / token invalide

- Régénérez un token depuis le dashboard et effectuez une rotation contrôlée. Voir https://mailto.bot

Webhook non reçu

- Vérifiez que l'URL publique est accessible (ngrok actif). Consultez le dashboard Mailto.Bot pour les logs et rejouez le payload localement. Voir https://mailto.bot

Limitation d'envoi hors organisation

- Par design, l'API favorise l'usage interne et peut limiter certains envois externes pour éviter les abus. Vérifiez les règles organisationnelles dans le dashboard. Voir https://mailto.bot

Besoin de stockage persistant

- Les messages s'auto‑expirent. Persistez uniquement les champs essentiels (id, from, to, sujet, date, extrait du corps) si vous avez besoin d'archivage. Voir https://mailto.bot

Commandes de debug utiles

```bash
# Lister les boîtes
curl -H "Authorization: Bearer $TOKEN" https://api.mailtobot.app/api/mailboxes

# Rejouer un webhook localement
curl -X POST $LOCAL_URL/webhook -H "Content-Type: application/json" -d @last_request.json
```

## Premier cas d'usage pour une petite equipe

Cible : fondateur solo ou équipe de 1–3 personnes qui veulent gérer l'onboarding par e‑mail sans maintenir SMTP (Simple Mail Transfer Protocol) ni DNS. Voir https://mailto.bot

Conseils opérationnels concrets

1) Démarrage express (10–30 min) : créez une mailbox via POST /api/mailboxes, puis attachez un webhook public (ngrok ou staging) pour recevoir les réponses. Voir https://mailto.bot
2) Persistance minimale : gardez seulement les champs essentiels (id message, from, to, sujet, date, corps réduit). Minimisez la rétention si vous comptez sur l'éphémérité du service.
3) Smoke test : ajoutez un script qui envoie 1 message et vérifie la réception webhook en <60 s pour valider le pipeline avant chaque déploiement.
4) Sécurité pratique : conservez séparément un token de staging et un token de production. Documentez une procédure simple de rotation et limitez les privilèges des tokens si possible.
5) Itération : commencez par webhooks pour lancer vite. Passez à MCP (mailtobot://connect) si vous voulez que l'agent interagisse directement avec les 9 outils. Voir https://mailto.bot

Checklist rapide pour un fondateur solo

- [ ] Créer mailbox de test et récupérer l'adresse.
- [ ] Déployer handler webhook et valider réception.
- [ ] Ajouter persistance minimale pour les champs essentiels.
- [ ] Mettre en place un script de smoke test (1 envoi → 1 réception).

## Notes techniques (optionnel)

Points à retenir (API)

- Endpoints clés : POST /api/mailboxes, POST /api/mailboxes/{mailbox}/messages, et webhooks pour le JSON entrant. Voir https://mailto.bot
- Snippets : Mailto.Bot fournit des snippets pré‑remplis en 6 languages et un dashboard pour gérer boîtes, messages et tokens. Voir https://mailto.bot
- MCP : mailtobot://connect donne accès à 9 outils listés par le service. Voir https://mailto.bot

Sécurité et opérations

- Vérifiez les signatures de webhook via WEBHOOK_SECRET.
- Conservez les tokens hors du code source et prévoyez une procédure de révocation.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Mailto.Bot crée des boîtes instantanées avec 1 POST /api/mailboxes et retourne une adresse (extrait public). Voir https://mailto.bot
- Mailto.Bot offre une intégration MCP via mailtobot://connect et expose 9 outils pour boîtes, messages et webhooks (extrait public). Voir https://mailto.bot
- Mailto.Bot fournit des webhooks en temps réel avec payload JSON complet et un stockage de messages éphémère (auto‑expiration) (extrait public). Voir https://mailto.bot

Hypothèses opérationnelles (à valider en staging) : latence de livraison webhook, SLA (Service Level Agreement), limites d'envoi externes, politiques d'expiration (durées exactes). Par exemple, planifiez des tests de soak (ex. 72 heures) et des rollouts progressifs (ex. 5% → 25% → 100%) avant production complète.

### Risques / mitigations

- Risque : token exposé → Mitigation : rotation régulière, tokens à moindre privilège, procédure de révocation d'urgence.
- Risque : perte de messages (échéance d'expiration) → Mitigation : persister les champs essentiels dès la réception webhook.
- Risque : comportement d'envoi restreint hors organisation → Mitigation : valider les politiques d'envoi en staging et utiliser des boîtes internes pour le développement.

### Prochaines etapes

1. Créez un token de staging depuis le dashboard Mailto.Bot et notez l'adresse mailbox. Voir https://mailto.bot
2. Déployez le handler webhook minimal et lancez le script de smoke test (1 envoi → 1 réception). Vérifiez le premier round‑trip en <60 s.
3. Validez MCP si nécessaire : testez mailtobot://connect avec votre agent pour vérifier l'accès aux 9 outils.
4. Exécutez des tests prolongés en staging (soak) et définissez vos paliers de déploiement et seuils d'alerte.

Bonne mise en œuvre — commencez petit, automatisez le smoke test et persistez uniquement ce dont vous avez besoin. Voir https://mailto.bot
