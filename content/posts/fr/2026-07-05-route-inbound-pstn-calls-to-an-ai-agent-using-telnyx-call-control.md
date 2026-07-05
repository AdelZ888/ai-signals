---
title: "Routage d'appels PSTN entrants vers un agent IA avec Telnyx Call Control (contexte UK)"
date: "2026-07-05"
excerpt: "Suivez une boucle Call Control pilotée par webhooks pour répondre aux appels entrants sur un numéro Telnyx, insérer ASR/inférence IA, puis parler ou raccrocher — exemple minimal Python/Flask et actions answer→speak→hangup."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-05-route-inbound-pstn-calls-to-an-ai-agent-using-telnyx-call-control.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "Telnyx"
  - "Voice AI"
  - "PSTN"
  - "Call Control"
  - "Webhook"
  - "Flask"
  - "UK"
sources:
  - "https://telnyx.com/resources/route-phone-calls-ai-agent"
---

## TL;DR en langage simple

- Telnyx reçoit un appel depuis le PSTN (réseau téléphonique public commuté) ou SIP (Session Initiation Protocol) et envoie des webhooks (événements HTTP) à votre application : call.initiated, call.answered, etc. Cela permet de piloter l'appel à distance. (https://telnyx.com/resources/route-phone-calls-ai-agent)
- Votre application répond aux webhooks avec des actions Call Control : answer (répondre), speak (parler), transfer (transférer), hangup (raccrocher). Placez l'appel d'inférence IA (ASR = reconnaissance vocale automatique, NLU = compréhension du langage naturel, TTS = synthèse vocale) dans la même boucle. (https://telnyx.com/resources/route-phone-calls-ai-agent)
- Telnyx fournit des numéros dans 140+ pays et des transports média comme WebSocket et SIP. Telnyx Voice AI annonce une latence inférieure à 500 ms pour des agents vocaux managés. (https://telnyx.com/resources/route-phone-calls-ai-agent)

Checklist express (lecture 30–60 s) :
- [ ] L'appel arrive sur votre numéro Telnyx et vous voyez les webhooks dans la console Telnyx.
- [ ] Votre webhook reçoit call.initiated et extrait call_control_id.
- [ ] Vous envoyez une action "answer", puis "speak" ou "hangup" selon le flux.

Exemple concret rapide : un petit support FAQ. Un client appelle votre numéro Telnyx. Telnyx envoie call.initiated → votre app envoie "answer" → après transcription (ASR) l'agent IA décide de répondre (speak) ou de transférer (transfer) vers un humain.

Plain-language note avant les détails avancés : si vous débutez, pensez à trois rôles séparés : l'opérateur/transport (Telnyx), votre application qui garde l'état et exécute des commandes, et l'IA qui prend les décisions de dialogue. Les webhooks connectent ces trois rôles.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez construire une boucle « webhook-driven Call Control ». En résumé :
- Telnyx gère la couche transport (numéros, PSTN/SIP). (https://telnyx.com/resources/route-phone-calls-ai-agent)
- Telnyx envoie des webhooks à votre application quand un appel arrive. Votre application garde l'état du call_control_id et envoie des actions via l'API Call Control (answer, speak, transfer, hangup). (https://telnyx.com/resources/route-phone-calls-ai-agent)
- L'inférence IA (ASR, NLU, génération de réponse, TTS) s'exécute dans la même boucle d'événements, entre answer et speak/transfer.

Flux principal attendu :
- Appelant → numéro Telnyx → call.initiated webhook → votre app envoie "answer" → call.answered → ASR / inference IA → votre app envoie "speak" / "transfer" / "hangup". (https://telnyx.com/resources/route-phone-calls-ai-agent)

Pourquoi c'est utile :
- Vous ne gérez pas le trunk opérateur. Telnyx fournit des numéros dans 140+ pays. (https://telnyx.com/resources/route-phone-calls-ai-agent)
- Vous pouvez itérer rapidement sur la logique de dialogue sans toucher à l'opérateur.
- Vous choisissez le mode média selon la latence : ASR post-answer pour prototype, ou streaming WebSocket / Telnyx Voice AI pour une latence interactive (<500 ms annoncée). (https://telnyx.com/resources/route-phone-calls-ai-agent)

Note technique rapide : le guide d'exemple officiel utilise Python + Flask et montre la boucle call.initiated → answer → call.answered → speak → hangup. (https://telnyx.com/resources/route-phone-calls-ai-agent)

## Avant de commencer (temps, cout, prerequis)

Prérequis indispensables :
- Compte Telnyx et au moins 1 numéro Telnyx (activation possible instantanée, disponible dans 140+ pays). (https://telnyx.com/resources/route-phone-calls-ai-agent)
- Une Call Control Application créée dans la console Telnyx ; configurer les callbacks vers une URL HTTPS publique. (https://telnyx.com/resources/route-phone-calls-ai-agent)
- Une URL HTTPS publique pour les webhooks (ngrok peut servir en développement). Une petite app web pour recevoir les webhooks et appeler l'API (ex. Python + Flask). (https://telnyx.com/resources/route-phone-calls-ai-agent)

Estimations :
- Prototype fonctionnel : ~60–120 minutes.
- Coût initial de test : environ $1–$20 selon durée et région (estimation d'usage pour tests).
- Latence cible : si vous visez une expérience fluide, visez une latence médiane <500 ms en utilisant streaming ou Telnyx Voice AI. (https://telnyx.com/resources/route-phone-calls-ai-agent)

Bonnes pratiques conseillées pour commencer : 1 numéro, 1 Call Control Application, 3 retries côté serveur avec backoff initial 200 ms.

## Installation et implementation pas a pas

1) Préparez les secrets (ne pas committer) :

```yaml
# config.yml (exemple)
TELNYX_API_KEY: "REPLACE_WITH_KEY"
CALL_CONTROL_APP_ID: "REPLACE_WITH_APP_ID"
WEBHOOK_URL: "https://votre-host.exemple.com/webhook"
```

2) Dans la console Telnyx : achetez 1 numéro et créez une Call Control Application. Pointez les callbacks vers WEBHOOK_URL. (https://telnyx.com/resources/route-phone-calls-ai-agent)

3) Lancez l'exemple Python/Flask fourni par Telnyx pour observer la suite d'événements (call.initiated → answer → call.answered → speak → hangup). (https://telnyx.com/resources/route-phone-calls-ai-agent)

4) Implémentez la boucle minimale :
- À call.initiated : extraire call_control_id et envoyer "answer".
- À call.answered : choisir entre ASR post-answer (faire une requête de transcription) ou streaming WebSocket ; exécutez l'inférence IA puis envoyez "speak"/"transfer".
- En fin d'appel : envoyer "hangup".

Exemple curl minimal pour answer :

```bash
curl -X POST "https://api.telnyx.com/v2/calls/{call_control_id}/actions" \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"type": "answer"}'
```

5) Validez en appelant votre numéro depuis le PSTN et vérifiez les webhooks dans la console Telnyx. (https://telnyx.com/resources/route-phone-calls-ai-agent)

Plain-language reminder before advanced options : commencez par le chemin le plus simple (answer → ASR post-answer → speak). Ajoutez le streaming ou Telnyx Voice AI quand vous avez besoin d'une interaction plus réactive.

## Problemes frequents et correctifs rapides

- Webhooks manquants : vérifiez que WEBHOOK_URL est publique et que Telnyx voit un statut 200/2xx pour la livraison. (https://telnyx.com/resources/route-phone-calls-ai-agent)
- call_control_id invalide / 401 : utilisez le call_control_id exact fourni par le webhook et vérifiez la clé API. Limitez les clés en dev.
- Latence ou mauvaise qualité audio : vérifiez les codecs et taux d'échantillonnage. Si la latence dépasse vos seuils, utilisez WebSocket streaming ou Telnyx Voice AI. (https://telnyx.com/resources/route-phone-calls-ai-agent)
- Débits élevés : implémentez 3 retries exponentiels (200 ms → 400 ms → 800 ms) et rendez vos actions idempotentes.

Exemple de configuration JSON côté app :

```json
{
  "telnyx_api_key": "REPLACE",
  "call_control_app_id": "REPLACE",
  "webhook_endpoint": "https://votre-host.exemple.com/webhook",
  "retries": 3,
  "backoff_ms": [200, 400, 800]
}
```

## Premier cas d'usage pour une petite equipe

Scénario ciblé : un fondateur solo ou une petite équipe (1–3 personnes) veut lancer un agent vocal pour répondre à des FAQ et escalader vers un humain.

Actions concrètes et rapides :

1) Provision et validation (30–60 minutes) :
   - Acheter 1 numéro Telnyx et créer 1 Call Control Application. Configurer le webhook et vérifier la réception de call.initiated via la console. (https://telnyx.com/resources/route-phone-calls-ai-agent)

2) Déployer l'exemple Python/Flask localement (15–30 minutes) :
   - Exposer l'URL avec ngrok. Appeler le numéro pour valider la boucle answer→speak→hangup. Faire 1–3 appels tests/heure.

3) Intégrer l'IA dans la même boucle (60–120 minutes d'itération) :
   - Commencer avec 3–5 intents prioritaires. Mapper chaque intent à une réponse TTS ou à une action de transfert.
   - Journaliser toutes les transcriptions et garder les logs 7–30 jours pour itération.

4) Plan d'escalade humain :
   - Si la confiance NLU < 70% ou après 2 échecs, transfer vers un humain ou voicemail.

5) KPI initiaux :
   - Taux de réussite d'intent > 70%, latence médiane < 500 ms si streaming/Voice AI, erreurs webhooks < 0.1%.

Tableau décisionnel (résumé) :

| Approche | Latence typique | Complexité | Quand l'utiliser |
|---|---:|---|---|
| ASR post-answer | 500–1500 ms | faible | prototype, 1–3 intents |
| Streaming WebSocket | 200–600 ms | moyen | interactivité, viser <500 ms |
| Telnyx Voice AI (managé) | sub-500 ms (annoncé) | faible infra | production si SLA latence requis |

## Notes techniques (optionnel)

- Média & transport : Telnyx supporte WebSocket média, SIP et PSTN. Pour latence basse privilégiez WebSocket. (https://telnyx.com/resources/route-phone-calls-ai-agent)
- Telnyx Voice AI : multi-modèles et latence annoncée <500 ms pour des agents managés, utile si vous voulez éviter d'héberger des modèles en edge. (https://telnyx.com/resources/route-phone-calls-ai-agent)
- État & idempotence : les webhooks suivent une séquence (call.initiated → call.answered → ...). Conservez un store d'état par call_control_id et appliquez 3 retries max.
- Bonnes pratiques : commencer avec 1 numéro, limiter les tests à 1–3 appels/h en phase alpha, canary 1–5% avant déploiement complet, conserver logs de transcription 7–30 jours.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Prototype complet (answer→speak→hangup) : ~60–120 minutes selon compétences.
- Coût initial d'essai : $1–$20 en fonction de la durée et de la région.
- La latence finale dépendra de votre infra ; Telnyx annonce sub-500 ms pour Voice AI mais votre application et le réseau peuvent ajouter 100–300 ms. (https://telnyx.com/resources/route-phone-calls-ai-agent)
- Hypothèse opérationnelle : commencer avec 3–5 intents réduit les faux positifs en phase alpha.

### Risques / mitigations

- Risque : webhooks perdus ou retardés → Mitigation : monitorer les livraisons Telnyx, retries idempotents (200/400/800 ms), alertes sur séquences manquantes.
- Risque : latence élevée sous charge → Mitigation : tests de montée en charge, utiliser WebSocket streaming ou Telnyx Voice AI, canary 1–5% avant rollout complet. (https://telnyx.com/resources/route-phone-calls-ai-agent)
- Risque : fuite de clés/API → Mitigation : secrets manager, rotation régulière, scopes limités.
- Risque : décisions IA inexactes → Mitigation : démarrer avec 3–5 intents, journaliser 100% des transcriptions et itérer pendant 2–4 semaines.

### Prochaines etapes

- Sécuriser secrets : déplacer clés dans un secrets manager, mettre en place rotation 30 jours.
  - [ ] secrets manager configuré
  - [ ] clés scindées/rotatées (scope limité)

- Observabilité : métriques webhook, histogrammes de latence, taux d'erreur ; alertes si latence médiane > 500 ms ou erreurs > 0.5%.
  - [ ] dashboards en place
  - [ ] alertes configurées

- Déployer canary : 1–5% du trafic pendant 24–72 h avec fallback humain et feature flag.
  - [ ] canary lancé
  - [ ] rollback testé

Checklist production rapide :
- [ ] Provisionner numéro Telnyx et Call Control Application. (https://telnyx.com/resources/route-phone-calls-ai-agent)
- [ ] Valider l'accessibilité du webhook (ngrok ou équivalent) et vérifier logs de livraison.
- [ ] Tester la boucle answer→speak→hangup avec un appel PSTN réel (1–3 tests/h).
- [ ] Brancher l'inférence IA, limiter à 3–5 intents en alpha, journaliser transcriptions.

Pour l'exemple canonique et la boucle Call Control détaillée, voir le guide Telnyx : https://telnyx.com/resources/route-phone-calls-ai-agent
