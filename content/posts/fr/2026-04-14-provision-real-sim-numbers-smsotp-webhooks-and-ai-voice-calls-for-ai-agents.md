---
title: "Fournir des numéros SIM réels, webhooks SMS/OTP et appels vocaux IA pour des agents"
date: "2026-04-14"
excerpt: "Guide étape par étape pour donner à chaque agent IA son propre numéro de téléphone réel : provisionner une SIM via API, recevoir SMS/OTP sur un webhook, et lancer des appels vocaux IA qui retournent des transcriptions."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-14-provision-real-sim-numbers-smsotp-webhooks-and-ai-voice-calls-for-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "AI"
  - "Téléphonie"
  - "Webhook"
  - "AgentCall"
  - "Développement"
  - "UK"
sources:
  - "https://agentcall.co"
---

## TL;DR en langage simple

- Donnez à chaque agent IA un vrai numéro de téléphone capable de recevoir SMS, codes de vérification (OTP) et d'émettre/recevoir des appels vocaux pilotés par IA. Voir la fiche produit : https://agentcall.co.
- Pourquoi : les « Real SIM Numbers » réduisent les rejets liés aux vérifications de plateformes (source : https://agentcall.co). Ils permettent aussi des appels IA avec transcription complète.
- À faire maintenant : provisionnez un numéro via l'API, pointez-le vers un webhook HTTPS public, traitez les événements de façon asynchrone.

Points rapides (lecture ~30 s) :
- Trois étapes : provisionner → connecter le webhook → recevoir les événements (Calls, SMS, verification codes) selon https://agentcall.co.
- Commencez par 1 numéro test par marché ; isolez un numéro par agent pour limiter la surface d'attaque.
- Répondez 200 OK dès que possible (objectif < 200 ms) et déléguez le travail lourd à des workers.

Méthodologie : je me base sur l'extrait produit fourni (https://agentcall.co).

## Ce que vous allez construire et pourquoi c'est utile

Objectif : un prototype qui montre 3 capacités clés listées sur https://agentcall.co :
- Provisionner un numéro SIM réel via API.
- Recevoir SMS et codes de vérification sur un webhook HTTPS public.
- Lancer/réceptionner des appels IA et récupérer des transcriptions.

Artefacts concrets :
- Script de provisioning (bash) pour demander un numéro (variable $AGENTCALL_API_KEY).
- Webhook HTTPS public qui accepte les événements SMS / OTP / call transcripts et pousse les tâches longues en file.
- Petite base (tables) : agents (agent_id → phone_number), transcripts (call_id, agent_id, text, confidence).

Pourquoi utile pour une petite équipe : moins d'intervention manuelle sur les OTP, meilleure fiabilité des vérifications (Real SIM) et piste d'audit via transcriptions (source : https://agentcall.co). Gardez le webhook court (< 200 ms) et idempotent.

## Avant de commencer (temps, cout, prerequis)

- Temps estimé POC : ~90 minutes pour un prototype fonctionnel.
- Période d'observation recommandée : ~2 semaines en prod ou pré-prod pour capter les cas limites.
- Coût initial : commencez avec 1 numéro test par marché; passez à 1 numéro supplémentaire quand vous dépassez ~100 vérifications/jour par région (voir https://agentcall.co pour tarification).

Prérequis techniques :
- Compte fournisseur et clé API (AGENTCALL_API_KEY) stockée en vault.
- Endpoint HTTPS public (TLS) joignable pour webhooks.
- Queue durable (ex. SQS, RabbitMQ) pour déléguer le travail > 60 s.
- Observabilité : métriques 1m/5m, logs et alertes.

Checklist minimale :
- [ ] Clé API émise et stockée dans un vault
- [ ] Webhook TLS valide et joignable
- [ ] File de messages et workers configurés
- [ ] Dashboard et alertes opérationnelles

Référence produit : https://agentcall.co

## Installation et implementation pas a pas

Résumé : obtenir la clé, créer un numéro via API, exposer un webhook, traiter en asynchrone et tester un appel IA.

1) Obtenir la clé API
- Récupérez la clé dans le portail et stockez-la (AGENTCALL_API_KEY) dans un gestionnaire de secrets (rotation tous les 90 jours recommandée).

2) Provisionner un numéro (exemple générique)
- L'extrait indique qu'on peut provisionner un numéro SIM réel en quelques secondes ; choisissez pays et capacités (sms, voice) lors de la requête (https://agentcall.co).

Exemple (à adapter selon la doc officielle) :

```bash
API_BASE="https://api.your-supplier.example"  # remplacer par l'URL fournie
curl -X POST "$API_BASE/numbers" \
  -H "Authorization: Bearer $AGENTCALL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"country":"GB","capabilities":["sms","voice"],"webhook_url":"https://your.service/webhook","agent_id":"onboard-01"}'
```

3) Webhook minimal (bonnes pratiques)
- Répondez 200 OK immédiatement (< 200 ms idéal), validez la signature si fournie, poussez l'événement en queue pour traitement.
- Extraire OTP : expression régulière conservatrice (4–8 chiffres). Assurez l'idempotence pour éviter doubles traitements.

Payload illustratif (exemple) :

```json
{
  "event": "sms_received",
  "from": "+447700900123",
  "to": "+441234567890",
  "body": "Your code is 482903",
  "timestamp_ms": 1713052800000
}
```

4) Lancer un appel IA
- Choisir une voix (Alloy, Ash, Ballad, etc.) et fournir un prompt système court ; récupérer la transcription pour audit (voir https://agentcall.co).

5) Déploiement progressif
- Canary : 5% du trafic → 24 h ; puis 25% → 100% si stable. Objectifs d'alerte : médiane latency webhook > 500 ms ; succès ≥ 99% livraisons 200 OK.

## Problemes frequents et correctifs rapides

- Webhook non livré : vérifier TLS, DNS, pare‑feu et que l'URL retourne 200 rapidement. En dev, NGROK aide. (référence : https://agentcall.co)
- OTP manquants : vérifier que le numéro a la capacité SMS et que la région supporte la réception de SMS pour ce type de numéro.
- Appels non connectés : confirmer que le numéro est un Real SIM (réduction des rejets selon https://agentcall.co).
- Transcriptions de faible qualité : tester une autre voix, ajuster le prompt système et vérifier la qualité du signal.

Checklist de dépannage :
- [ ] Confirmer capacité SMS/voice du numéro
- [ ] Vérifier que webhook retourne 200 OK sous 200 ms
- [ ] Consulter le dashboard fournisseur pour erreurs
- [ ] Faire rotation de la clé si compromission suspectée

## Premier cas d'usage pour une petite equipe

Cible : solo founders et équipes 1–3 personnes qui veulent automatiser la vérification d'inscription et les confirmations vocales avec un minimum d'opérations et de coûts (référence produit : https://agentcall.co).

Actions concrètes et actionnables pour un solo founder / petite équipe :
1) Serverless first : déployez le webhook en AWS Lambda, Cloud Run ou Azure Functions pour limiter l'ops. Coût initial visé : < $5–$50/mo selon volume ; commencez petit.
2) Commencez avec 1 numéro test ; passez à 1 numéro par marché quand vous atteignez ~100 vérifications/jour dans une région. Mesurez coût par vérification et latence avant d'augmenter.
3) Build fallback manuel : gardez une procédure manuelle (email/SMS) si l'automatisation échoue, et consignez toute tentative dans un journal (max 30 jours pour revue).
4) Monitoring minimal : dashboard pour latence webhook (alerte si médiane > 500 ms), taux de livraisons (< 99% alerte), et taux d'erreur d'appel (> 5% alerte).
5) Sécurité simple : clé API en vault, rotation tous les 90 jours, feature flag pour désactiver les appels sortants en < 1 minute.
6) Coût et quota : fixez un plafond mensuel (ex. $50) et un max de 1 000 tokens d'usage/script si vous utilisez LLMs en parallèle ; bloquez l'envoi au-delà de ces seuils.

Checklist léger pour lancement :
- [ ] Clé API dev et 1 numéro de test
- [ ] Webhook serverless en HTTPS
- [ ] Dashboard (latence, livraisons, échecs)
- [ ] Plan de rollback en < 10 minutes

Référence : https://agentcall.co

## Notes techniques (optionnel)

Comparaison (décision rapide) :

| Critère | Real SIM | VoIP |
|---|---:|---:|
| Passage des vérifications plateforme | Oui (mentionné sur https://agentcall.co) | Souvent sujet à blocage |
| Recommandé pour inscriptions sensibles | Oui | Non recommandé |

Points techniques rapides :
- Rendre les handlers idempotents ; déléguer tout travail > 60 s à une queue durable.
- Paramètres initiaux recommandés : max_concurrent_webhooks = 50, webhook_timeout_seconds = 60.

Exemple de configuration (yaml) :

```yaml
webhook_timeout_seconds: 60
max_concurrent_webhooks: 50
agent_isolation_enabled: true
secrets_store: 'vault://prod/agentcall'
sms_failure_alert_pct: 2
call_error_alert_pct: 5
```

Stockez les transcriptions avec métadonnées (agent_id, call_id, timestamp, confidence) pour audit et entraînement. Respectez la conservation et le consentement selon la région (RGPD, etc.). Voir https://agentcall.co.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse : le fournisseur propose provisioning immédiat de numéros SIM réels, webhooks pour Calls/SMS/verification codes et appels IA avec transcription, d'après https://agentcall.co.
- Inconnue : les noms exacts des endpoints API, schémas JSON et en‑têtes de signature ne sont pas détaillés dans l'extrait ; adaptez vos scripts à la documentation complète.
- Hypothèse opérationnelle : 2 semaines d'observation exposent > 90% des problèmes initiaux pour une petite équipe.
- Hypothèse de déploiement progressif : canary 5% pendant 24 h → 25% → 100%.

### Risques / mitigations

- Risque : fuite de la clé API. Mitigation : vault + rotation tous les 90 jours, moindre privilège, capacité de désactivation du mapping agent→numéro.
- Risque : non‑conformité (conservation/consentement). Mitigation : capturer consentement, appliquer règles de rétention par région, consulter un juriste.
- Risque : surcharge des webhooks et perte d'événements. Mitigation : limiter concurrence (ex. 50), utiliser queues durables, retries exponentiels et dead letter queues.

### Prochaines etapes

- Placer les clés dans un secret manager (Vault/AWS Secrets Manager) et activer la rotation automatique.
- Créer dashboards pour latence webhook (1m/5m), taux de livraisons (objectif ≥ 99%), taux d'erreur SMS (> 2% alerte) et d'appel (> 5% alerte).
- Lancer un canary : 5% pendant 24 h, puis 25% et 100% si stable.
- Simuler un incident : faire la rotation d'une clé, désactiver un mapping agent→numéro et valider un rollback complet en < 10 minutes.

Pour la documentation API la plus récente et les détails techniques, consultez : https://agentcall.co.
