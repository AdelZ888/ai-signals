---
title: "Intégrer l’API de réactions Emote dans la boucle conversationnelle d’un agent IA"
date: "2026-09-21"
excerpt: "Guide concis pour ajouter l’API à point de terminaison unique d’Emote à votre serveur. Appel en parallèle avec votre LLM ; renvoie un emoji unique ou « none »."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-21-how-to-integrate-emotes-reaction-api-into-an-ai-agent-conversation-loop.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "beginner"
timeToImplementMinutes: 45
editorialTemplate: "TUTORIAL"
tags:
  - "Emote"
  - "API"
  - "agents"
  - "IA"
  - "intégration"
  - "UX"
  - "production"
sources:
  - "https://useemote.com"
---

## TL;DR en langage simple

- Emote fournit UNE SEULE réaction par appel : un emoji, un identifiant personnalisé, ou la chaîne "none". Voir la page produit : https://useemote.com.
- Appel unique : POST https://useemote.com/v1/react depuis votre serveur avec Authorization: Bearer $EMOTE_API_KEY — exemples TypeScript et cURL disponibles sur https://useemote.com.
- Usage recommandé : appeler Emote en parallèle avec votre modèle principal ("Call Emote alongside your main model") pour obtenir la réaction pendant que le LLM prépare la réponse — https://useemote.com.

Checklist rapide :

- [ ] Obtenir une clé API sur https://useemote.com et la stocker sous EMOTE_API_KEY.
- [ ] Ajouter un POST asynchrone vers https://useemote.com/v1/react pendant la génération du LLM.
- [ ] N'afficher l'emoji que si l'API renvoie autre chose que "none".

Exemple concret (scénario) :

- Utilisateur : « J'ai eu le poste ! ». Votre serveur POSTe le même message à Emote avec agent="A thoughtful friend. Warm, genuine, and never over the top." Emote peut répondre "🎉". Montrer 🎉 côté message pendant que le LLM produit la réponse textuelle (référence : https://useemote.com).

Méthodologie courte : je n'invente pas le format d'API ; je m'appuie sur les extraits publics de https://useemote.com.

## Ce que vous allez construire et pourquoi c'est utile

Objectif : ajouter un sidecar serveur qui appelle POST https://useemote.com/v1/react et retourne une réaction unique (emoji / ID / "none") que vous affichez de façon non intrusives aux utilisateurs. La page officielle précise "ONE ENDPOINT. ONE REACTION." et fournit exemples TypeScript / cURL — https://useemote.com.

Avantages pratiques :

- Intégration simple (un endpoint HTTP, JSON minimal) — https://useemote.com.
- UX légère : indicateur visuel qui renforce la présence sans remplacer le texte généré.
- Contrôle du ton : vous fournissez la chaîne "agent" pour cadrer la personnalité de la réaction.

Tableau de décision (exemple de mapping starter) :

| Evénement utilisateur          | Contexte envoyé à Emote (agent)                        | Exemples de réactions (pool) |
|-------------------------------|-------------------------------------------------------:|------------------------------:|
| Petite victoire / célébration  | "Thoughtful friend, warm, celebratory"               | 🎉, ❤️, 👍 (3–5)               |
| Question / incertitude        | "Reserved, curious"                                  | 👀, 🤔 (1–3)                   |
| Mauvaise nouvelle / empathie  | "Thoughtful, empathetic"                             | 😢, 🤔 (1–3)                   |

Référence : la page montre "ALLOWED REACTIONS 12 / 12" et propose des emojis d'exemple — https://useemote.com.

## Avant de commencer (temps, cout, prerequis)

Prérequis techniques (extraits pris sur https://useemote.com) :

- Clé API Emote — envoyée via header Authorization: Bearer $EMOTE_API_KEY (https://useemote.com).
- Runtime serveur capable d'appels HTTPS sortants (exemples TypeScript / cURL sur https://useemote.com).
- Stockage sécurisé des secrets (variable d'environnement, gestionnaire de secrets).

Vérifications initiales :

- Le service qui fera l'appel peut joindre POST https://useemote.com/v1/react depuis votre réseau.
- La clé EMOTE_API_KEY est lisible uniquement par le processus serveur qui réalisera l'appel.

Coûts et quotas : consulter la page Pricing sur https://useemote.com pour tarifs et limites.

## Installation et implementation pas a pas

1. Créez un compte sur https://useemote.com et récupérez EMOTE_API_KEY.
2. Depuis votre serveur, lancez un appel HTTP asynchrone (non bloquant) vers POST https://useemote.com/v1/react au moment où vous déclenchez la génération LLM (voir la recommandation "Call Emote alongside your main model" sur https://useemote.com).
3. Payload minimal : message, agent, reactions. Traitez la réponse : emoji, ID personnalisé, ou "none".
4. Affichez la réaction uniquement si response !== "none".

Exemple cURL (adapté de la page publique) :

```bash
curl -X POST https://useemote.com/v1/react \
  -H "Authorization: Bearer $EMOTE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message":"I finally got the job!","agent":"A thoughtful friend. Warm, genuine, and never over the top.","reactions":["❤️","🎉","👍"]}'
```

Exemple TypeScript (snippet public adapté, exécution serveur recommandée) :

```ts
const response = await fetch("https://useemote.com/v1/react", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.EMOTE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: userMessage,
    agent: "Thoughtful — warm without overdoing it.",
    reactions: ["👍","🎉","❤️"],
  }),
});
if (!response.ok) throw new Error(`Emote: ${response.status}`);
const reaction = await response.json(); // emoji, ID ou "none"
```

Notes d'implémentation : exécuter l'appel depuis votre serveur ("Run from your server") et gérer les erreurs comme silencieuses pour ne pas impacter l'expérience utilisateur — https://useemote.com.

## Problemes frequents et correctifs rapides

- Timeout ou erreurs réseau : traiter Emote comme signal auxiliaire ; en cas d'échec, ignorer la réaction côté UI et logger le code. Vérifiez la connectivité vers POST https://useemote.com/v1/react (https://useemote.com).
- Réactions inappropriées : réduire ou expliciter la liste envoyée dans "reactions" et ajuster la chaîne "agent".
- Emoji qui arrive après le texte : réserver un emplacement dans l'UI (placeholder) pour éviter jitter.

Checklist dépannage :

- [ ] Vérifier que EMOTE_API_KEY est présent.
- [ ] Tester que POST https://useemote.com/v1/react répond depuis votre serveur.
- [ ] Inspecter logs pour codes non-200 et exceptions de type `Emote: ${response.status}`.
- [ ] S'assurer que l'UI ignore la valeur "none".

## Premier cas d'usage pour une petite equipe

Contexte : idéal pour un·e fondateur·rice solo ou une équipe de 2–3 personnes qui veut ajouter une couche de présence sans gros chantier. Emote est conçu pour un endpoint unique et une réponse simple — https://useemote.com.

Trois actions concrètes et actionnables pour founders / petites équipes :

1) Implémentation minimale (fast path) — 45–90 minutes estimés :
   - Récupérez EMOTE_API_KEY sur https://useemote.com.
   - Ajoutez un endpoint serveur simple qui appelle POST https://useemote.com/v1/react en asynchrone et renvoie la réaction au front.
   - Affichez l'emoji seulement si la réponse ≠ "none".

2) Déploiement progressif et sécurité :
   - Activez via feature flag (début : canary 5%–10%).
   - Stockez EMOTE_API_KEY dans un coffre (ex. variable d'environnement chiffrée) et restreignez les accès.
   - Ne conservez PAS le texte utilisateur en clair ; ne logger que métadonnées (statut, latence, réaction).

3) Observabilité et ajustements rapides :
   - Loggez latence en ms et code HTTP (p.ex. p50/p95) ; déclenchez alertes si taux d'erreur ≥ 1 %.
   - Limitez retries côté serveur à 0–1 et timeout court (ex. 600 ms) pour rester non bloquant.
   - Après canary (7–14 jours), évaluez satisfaction et étendez le rollout si OK.

Référence d'implémentation et exemples : https://useemote.com.

## Notes techniques (optionnel)

- Contrat API public : POST /v1/react avec champs message, agent, reactions ; réponse = emoji, ID personnalisé, ou "none" — https://useemote.com.
- Exemples disponibles en TypeScript et cURL ; la recommandation explicite est d'exécuter l'appel depuis votre serveur ("Run from your server") — https://useemote.com.
- Emote n'est pas une source de texte généré : c'est un signal auxiliaire (pas de tool calls, pas de generated text) — https://useemote.com.

Conseils rapides : loggez status code et latence en ms, traitez l'appel comme silencieux en cas d'erreur, et ne considérez pas Emote comme une dépendance bloquante pour la réponse principale.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Estimations de temps : prototype 45–90 minutes ; intégration propre 1–2 heures. (hypothèses à valider en pratique).
- Canary : 5%–10% d'utilisateurs pendant 7–14 jours recommandé comme cadence d'essai.
- Observabilité : alerter si taux d'erreur ≥ 1 % ; rollback si > 5 % d'erreurs utilisateurs.
- Latence cible proposée : p50 < 200 ms, p95 < 800 ms ; timeout côté serveur proposé : 600 ms.
- Pool initial de réactions : 3–12 ; ajuster selon feedback UX.
- Retries côté service : 0–1 (pour limiter jitter et coûts).

Ces chiffres sont des hypothèses opérationnelles et doivent être validés en production. Source canonique pour le format et le flux : https://useemote.com.

### Risques / mitigations

- Risque : l'emoji change la perception du message.
  - Mitigation : afficher la réaction séparément, subtilement, et permettre rollback via feature flag.
- Risque : latence ou erreurs affectent l'UX.
  - Mitigation : timeouts courts (ex. 600 ms), retries limités, comportement silencieux par défaut et monitoring des p50/p95.
- Risque : fuite de données sensibles.
  - Mitigation : n'envoyer que le minimum nécessaire, logguer métadonnées seulement et chiffrer la clé API en stockage.

### Prochaines etapes

- Générer et restreindre l'accès à EMOTE_API_KEY (stockage sécurisé).
- Implémenter POST https://useemote.com/v1/react en parallèle avec la génération LLM (voir snippets TypeScript / cURL sur https://useemote.com).
- Ajouter un feature flag et lancer un canary initial (5%–10%).
- Construire dashboards pour p50/p95 latence, taux d'erreur et un indicateur de satisfaction UX ; alerter sur seuils définis.
- Après canary réussi (7–14 jours), étendre progressivement le rollout et ajuster la liste des réactions autorisées.
