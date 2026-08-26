---
title: "Chat IA intégré : Gemini, une seule Cloud Function Google et Firestore (5–15 $/mois)"
date: "2026-08-26"
excerpt: "Guide pratique pour ajouter un chat IA sur votre site qui cite vos articles. Utilise les embeddings Gemini, une Cloud Function Google unique, Firestore et un passage RSS horaire. Coût estimé : ~5–15 $/mois."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-26-on-site-ai-chat-using-gemini-a-single-google-cloud-function-and-firestore-dollar5-15month.jpg"
region: "FR"
category: "Tutorials"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "Gemini"
  - "Google Cloud"
  - "Firestore"
  - "RAG"
  - "Serverless"
  - "embeddings"
  - "frontend"
sources:
  - "https://emergencemachine.com/building-an-ai-chat-for-my-blog/"
---

## TL;DR en langage simple

- Vous pouvez ajouter un chat IA à votre blog. Il répond en citant et en résumant vos articles. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)
- Architecture compacte : frontend JavaScript vanilla (~2 000 lignes, sans dépendances) + 1 Cloud Function (Python 3.12) + Firestore. Hébergement frontend possible sur mutualisé ≈4 $/mois. Coût observé ≈5–15 $/mois selon usage. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)
- RAG (retrieval-augmented generation = récupération augmentée) en 2 couches : RSS horaire (rafraîchit en ≤60 min, ≤15 articles) pour la fraîcheur, et index vectoriel (embeddings 768 dimensions, chunks ≈1 500 caractères, top 4) pour la précision et les citations. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)

Exemple concret : un fondateur pose une question sur la tarification SaaS. Le chat RAG récupère des passages pertinents de deux articles, les résume, puis propose une application concrète. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)

Checklist minimale :
- [ ] Frontend SSE (Server-Sent Events) en JS
- [ ] Cloud Function Python 3.12
- [ ] Firestore pour embeddings, sessions, compteurs rate_limit et analytics

Méthodologie : résumé basé sur l'implémentation documentée dans la source ci‑dessus. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)

## Ce que vous allez construire et pourquoi c'est utile

Vous allez construire un chat IA serverless qui répond en citant le contenu de votre blog. Les réponses combinent : extrait d'article, résumé et raisonnement contextualisé pour le lecteur. Cela aide les lecteurs à appliquer vos idées à leur cas (ex. stratégie produit, géopolitique, pricing). (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)

Explication simple avant les détails techniques :
- RAG = on récupère des passages pertinents dans vos articles, puis l'IA utilise ces passages comme contexte pour générer une réponse sourcée.
- RSS (flux) donne la fraîcheur : il suffit de récupérer les nouveaux billets toutes les heures.
- L'index vectoriel donne la précision : on transforme le texte en vecteurs (embeddings) et on recherche les morceaux les plus proches par similarité.

Architecture résumé (simple) : frontend JS vanilla (SSE pour le streaming) + 1 Cloud Function Python qui gère : vérification reCAPTCHA, rate limiting, récupération (RSS + vector search), classification de la requête, streaming Gemini, gestion de session, alertes asynchrones. Firestore sert de base de données unique. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)

Tableau résumé des couches RAG :

| Couche | Objectif | Fréquence / taille | Paramètres clés |
|---|---:|---:|---:|
| RSS (couche 1) | Fraîcheur | toutes les 60 minutes, ≤15 articles | simple, rapide, couvre ~80% des cas |
| Vector index (couche 2) | Précision & citations | chunks ≈1 500 caractères, embeddings 768 dims, top 4 | nécessite indexation et stockage |

(Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)

## Avant de commencer (temps, cout, prerequis)

Estimations et prérequis tirés de la référence : (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)

- Temps prototype : ≈4 heures pour un démonstrateur. Variante RSS-only possible en 2–4 heures.
- Coûts observés : hébergement frontend ≈4 $/mois ; coût total ≈5–15 $/mois selon usage.
- Plateforme : compte Google Cloud Platform (GCP) avec Cloud Functions + Firestore ; clé API Gemini pour embeddings & streaming.
- Paramètres répétés : embeddings = 768 dimensions, chunks ≈1 500 caractères, top 4 chunks retournés, RSS fetch toutes les 60 minutes, ≤15 posts.
- Opérations : canary interne ≤10 utilisateurs avant montée en charge ; seuil suspicion attaques >100 requêtes/min par IP.

Prérequis logiciels et accès : compte GCP, accès à l'API Gemini, flux RSS public du blog, compétences JS/PHP minimales pour intégrer une UI SSE. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)

## Installation et implementation pas a pas

1) Frontend
- Écrivez un client SSE en JavaScript vanilla. Le client doit afficher le texte au fil de l'eau (tokens) et gérer les reconnections. Intégrez un template PHP simple si vous êtes sur WordPress. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)

2) Backend — 1 Cloud Function (Python 3.12)
- Déployez une fonction unique qui regroupe : reCAPTCHA Enterprise, rate limiting via Firestore, RAG (RSS + vector search), classification de requête, streaming Gemini, gestion des sessions, et alertes asynchrones (ex. Telegram). Une fonction mono-rôle réduit la surface de maintenance. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)

3) Schéma Firestore (collections recommandées)
- embeddings/{id} — vecteur 768 dims + métadonnées
- sessions/{sessionId} — état du chat
- rate_limits/{ip} — compteurs par IP
- security_analytics/{eventId}

4) Ingestion RAG
- Job RSS horaire : fetch toutes les 60 minutes, injecte ≤15 articles.
- Index vectoriel : chunk ≈1 500 caractères, embeddings gemini-embedding-001, stocker vecteurs 768-d, récupérer top 4 par cosinus.
- Fallback : si la recherche vectorielle échoue (cold start, timeout), retomber sur le contexte RSS. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)

5) Routage modèle simple
- Ajoutez un classifieur pour choisir un modèle bon marché pour FAQs et un modèle de streaming (plus cher) pour réponses longues et raisonnées. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)

6) Sécurité & coûts
- Activez reCAPTCHA Enterprise côté serveur et stockez compteurs de rate limiting par IP. Définissez des seuils (ex. suspicion >100 req/min).
- Utilisez une fonction secondaire pour la surveillance budgétaire : envoyer une alerte à 10 $ et couper les appels au modèle à 15 $/mois. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)

7) Déploiement exemple

```bash
gcloud functions deploy blogChat --runtime=python312 \
  --trigger-http --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=$GEMINI_API_KEY,FIRESTORE_PROJECT=$PROJECT_ID,RECAPTCHA_KEY=$RECAPTCHA_KEY"
```

```json
{
  "GEMINI_API_KEY": "your_key_here",
  "FIRESTORE_PROJECT": "your-project-id",
  "RECAPTCHA_KEY": "recaptcha_key",
  "TELEGRAM_ALERT_TOKEN": "optional_alert_token"
}
```

Observabilité recommandée : mesurer latence embedding (ms), latence modèle (ms), erreurs SSE ; retries vector search = 3 tentatives (200ms, 500ms, 1000ms). Canary ≤10 users. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)

## Problemes frequents et correctifs rapides

- Cold starts / embeddings manquants : activez le fallback RSS-only pour garantir une réponse même si l'index vectoriel est froid. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)
- SSE bloqué : envoyez des heartbeats toutes les 15–30 s ; côté client, reconnect initial 5 s, backoff max 60 s.
- Pics de trafic / spam : vérifier reCAPTCHA serveur et collection rate_limits/{ip} ; bloquer les rafales >100 req/min par IP.
- Timeouts vector search : retry 3x (200ms → 500ms → 1 000ms), sinon fallback RSS et planifier réindexation.
- Facturation inattendue : la fonction secondaire doit couper les appels modèle à seuils configurés (alerte 10 $ ; pause 15 $/mois). (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)

Checklist debug rapide :
- [ ] Reproduire avec sessionId et requête exemple
- [ ] Confirmer embeddings/{id} longueur == 768
- [ ] Vérifier que le job RSS a tourné dans les 60 dernières minutes et a récupéré ≤15 posts

## Premier cas d'usage pour une petite equipe

Conseils concrets pour solo founders et équipes de 1–3 personnes. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)

1) Lancer un prototype RSS-only (2–4 heures)
- Déployez le job RSS qui fetch toutes les 60 minutes et injecte ≤15 articles.
- Montez un frontend SSE minimal pour valider UX et streaming. Objectif : tester 1–2 scénarios utilisateurs en ≤4 heures.

2) Mesurer et contrôler coûts (actionnable)
- Instrumentez dépenses mensuelles et mettez une alerte à 10 $ ; configurez pause automatique à 15 $/mois.
- Mesurez latence embedding (ms) et génération ; cible initiale <500 ms pour embedding + <1 000 ms pour génération si possible.

3) Indexer progressivement (pratique)
- Commencez par 5–20 articles clés. Chunkez ≈1 500 caractères et vérifiez qualitativement les résultats top 4 avant d'étendre.
- Ajoutez 10–20 articles par semaine si pertinence >70 % sur top‑4.

4) Opérations simplifiées
- Utilisez 1–2 fonctions max : la principale (tout-en-un) + une secondaire pour sécurité/budget.
- Canary interne : ≤10 utilisateurs avant rollout public.

5) Automatiser tâches répétées
- Scheduler RSS toutes les 60 minutes (Cloud Scheduler ou cron).
- Réindexation asynchrone si retries vector search >3.

## Notes techniques (optionnel)

- Embeddings : gemini-embedding-001, vecteurs 768 dimensions. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)
- Chunking : ≈1 500 caractères par chunk pour articles fondamentaux. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)
- Retrieval : récupérer les 4 meilleurs chunks par similarité cosinus (top 4). (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)
- Runtime : Cloud Function Python 3.12 ; frontend JS vanilla (~2 000 LOC) sur mutualisé (~4 $/mois exemple). (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)

Paramètres opérationnels recommandés : heartbeat SSE 15–30 s ; reconnect initial 5 s, backoff max 60 s ; suspect rate >100 req/min ; retries vector search = 3 (200ms, 500ms, 1000ms). (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse : accès API Gemini et flux RSS exploitable. Les valeurs (5–15 $/mois, RSS 60 minutes) proviennent de la référence et peuvent varier selon trafic et volume de requêtes. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)

### Risques / mitigations

- Risque : coût modèle élevé. Mitigation : alerte à 10 $ et pause auto à 15 $/mois via une fonction secondaire. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)
- Risque : index vectoriel froid/indisponible. Mitigation : fallback RSS et file de réindexation en arrière-plan. (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)
- Risque : attaques/spam. Mitigation : reCAPTCHA Enterprise + rate limiting IP (seuil suspicion >100 req/min). (Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)

### Prochaines etapes

- [ ] Lancer un canary interne ≤10 utilisateurs sous feature flag.
- [ ] Indexer 5–20 articles clés d'abord (chunk ≈1 500 chars) et valider pertinence top‑4.
- [ ] Instrumenter latence embedding (ms), latence modèle (ms), et dépenses mensuelles vs baseline 5–15 $/mois.
- [ ] Automatiser job RSS toutes les 60 minutes et configurer retries (3 tentatives : 200ms, 500ms, 1 000ms).
- [ ] Préparer rollback : pause à 15 $/mois et plan de réindexation en cas de cold start.

(Source: https://emergencemachine.com/building-an-ai-chat-for-my-blog/)
