---
title: "Contrôler les bots IA avec Cloudflare : bloquer, autoriser ou monétiser l'accès au web"
date: "2026-09-30"
excerpt: "Guide pratique pour détecter les agents automatisés, choisir une politique et déployer des règles Cloudflare + un petit point d'émission/validation de tokens. Idéal pour fondateurs, petites équipes et développeurs qui veulent protéger l'origine sans casser l'expérience utilisateur."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-30-cloudflares-approach-to-controlling-ai-bots-block-allow-or-monetize-web-access.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "Cloudflare"
  - "bots"
  - "sécurité"
  - "infrastructure"
  - "IA"
  - "développeurs"
  - "fondateurs"
sources:
  - "https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising"
---

## TL;DR en langage simple

- The Verge relaie une interview du PDG de Cloudflare qui affirme que les bots représentent aujourd'hui plus de 50 % du trafic web. https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising
- Objectif du guide : mesurer le trafic, choisir une politique claire, puis déployer des protections au niveau "edge" (périphérie). "Edge" signifie ici les services qui filtrent le trafic avant qu'il n'atteigne votre serveur d'origine.
- Méthode en trois étapes : observer d'abord, tester des challenges ensuite, bloquer enfin si nécessaire. Exemple concret : si un endpoint /products/ reçoit 1 200 requêtes/heure d'une même IP, commencez par journaliser, puis activez un challenge (CAPTCHA), puis bloquez si le comportement persiste.

Explication simple avant détails avancés : ce guide vous aide à repérer les agents automatisés (bots) et à appliquer des règles progressives. On privilégie la collecte de données d'abord. Ensuite, on teste avec des règles en mode "challenge" (poser une question au client) plutôt qu'un blocage immédiat. Enfin, on autorise proprement les partenaires via des tokens signés.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez définir et déployer un plan léger pour détecter et contrôler les agents automatisés (bots). Le plan combine :

- des règles sur l'edge (pare-feu, challenge, limitation de débit),
- un petit service d'émission et de validation de tokens côté origine pour partenaires,
- une démarche progressive : log → challenge → block.

Pourquoi c'est utile : cela réduit la charge serveur, limite le scraping abusif et protège les coûts d'hébergement. Le contexte de ce guide revient sur l'interview du PDG de Cloudflare publiée par The Verge. https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising

Table de décision (exemple simplifié)

| Type de trafic | Action recommandée | Remarques |
|---|---:|---|
| Crawler connu (Google, Bing) | Allow / whitelist | Vérifier User-Agent (UA) et plages IP publiques ; garder les logs |
| Scraping intensif / IP unique | Challenge / rate-limit | Journaliser d'abord pour vérifier |
| Attaque DDoS (attaque par déni de service distribué) | Block / rate-limit sévère | Activer rollback automatique |
| Partenaire payant | Token HMAC (hash-based message authentication code) / accès | TTL (time to live) court, contrat |

## Avant de commencer (temps, cout, prerequis)

- Compte Cloudflare avec le domaine proxifié via Cloudflare. https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising
- Jeton API (API = interface de programmation applicative) Cloudflare avec scope "edit" pour déployer des règles.
- Accès administrateur à votre serveur d'origine pour ajouter un endpoint de validation de tokens.
- Accès aux logs ou configuration Logpush pour analyser une période de référence.

Temps estimé :

- Analyse initiale des logs : 2–8 heures selon le volume.
- Rédaction de la table de décision et tests : 3–6 heures.
- Déploiement progressif (canary) : 1–3 jours.

Coûts attendus :

- Coûts Cloudflare selon votre plan (free → payant) ; coûts de stockage des logs si vous les poussez vers S3/GCS.

Checklist pré‑vol

- [ ] DNS proxifié via Cloudflare
- [ ] API token Cloudflare créé (scope edit)
- [ ] Accès admin à l'origine pour endpoint token
- [ ] Export des logs disponible pour une fenêtre de référence

## Installation et implementation pas a pas

Principe général : mesurer avant d'appliquer. Chaque action commence en mode "log" puis passe au "challenge" avant d'enforcer le blocage.

1) Mesurez la fenêtre de référence et identifiez les endpoints à haut volume. https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising

Exemple : lister vos zones Cloudflare (remplacez $CF_TOKEN)

```bash
curl -s -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" | jq '.result[] | {id, name}'
```

Explication : cette commande récupère la liste des zones (domaines) stockées sur votre compte Cloudflare. Vous en aurez besoin pour appliquer des règles par zone.

2) Rédigez la table de décision par endpoint (voir plus haut). Commencez par les trois endpoints les plus chargés.

3) Déployez une règle firewall en mode challenge/log avant passage en block. Exemple conceptuel JSON :

```json
{
  "action": "challenge",
  "filter": {"expression": "(http.request.uri.path contains \"/products/\") and cf.threat_score > 10"},
  "description": "Challenge for suspicious product scrapers"
}
```

Explication : ce schéma montre une règle qui challenge les requêtes vers /products/ si le score de menace Cloudflare (cf.threat_score) dépasse 10. D'abord, activez-la en mode de test et surveillez les logs.

4) Implémentez un endpoint d'émission de tokens côté origine si vous prévoyez des accès partenaires. Validez ces tokens soit à l'edge (Cloudflare Worker) soit côté origine.

- Token HMAC : signature courte, facile à vérifier. HMAC signifie "Hash-based Message Authentication Code".
- TTL (time to live) court, par exemple 60–300 secondes.
- Protégez les clés dans un gestionnaire de secrets (Cloudflare KV, HashiCorp Vault, AWS Secrets Manager).

5) Déploiement progressif : activez la journalisation, puis le challenge, puis l'enforcement si les métriques restent stables. Exemple de palier canary : 1% → 10% → 50% → 100%.

## Problemes frequents et correctifs rapides

Contexte : points inspirés de l'interview du PDG de Cloudflare rapportée par The Verge. https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising

- Blocage de moteurs de recherche.
  - Correctif : whitelist des IP/UA des crawlers vérifiés. Confirmez via la Search Console et les logs.
- Faux positifs élevés.
  - Correctif : repasser en mode challenge/log. Collecter plus de données avant d'augmenter l'agressivité.
- Rejeu de tokens (replay attacks).
  - Correctif : lier le token à un nonce ou à l'adresse IP, et utiliser un TTL court.
- Coûts de logging qui augmentent.
  - Correctif : réduire la rétention, échantillonner les événements ou pousser les logs vers du stockage froid.
- Latence ajoutée.
  - Correctif : mesurer la latence au niveau edge ; optimiser la logique du Worker ; garder les vérifications rapides.

## Premier cas d'usage pour une petite equipe

Public : fondateurs solo et petites équipes (1–3 personnes). Concentrez‑vous sur les 2–3 endpoints qui causent la charge.

Étapes actionnables

1) Exportez la fenêtre de référence et identifiez les 3 endpoints les plus volumineux. https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising
2) Appliquez une règle Cloudflare en mode challenge/log sur ces endpoints.
3) Ajoutez un endpoint minimal d'émission de tokens pour partenaires si nécessaire.
4) Surveillez requêtes/min, taux 4xx/5xx et consommation CPU de l'origine. Remontez les alertes à l'équipe.

Runbook initial (liste courte)

- [ ] Identifier top 3 endpoints
- [ ] Déployer règle challenge/log
- [ ] Émettre 3 tokens de test pour partenaires
- [ ] Surveiller métriques critiques pendant la période d'observation

## Notes techniques (optionnel)

Architecture proposée : Cloudflare (firewall + rate limit + Workers) → Worker de validation token → origine. https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising

Extrait conceptuel d'un Worker (validation token minimal) :

```javascript
addEventListener('fetch', event => {
  event.respondWith(handle(event.request))
})

async function handle(req){
  // extraire token, valider signature HMAC, vérifier TTL
  // si valide, forward vers origine
  return fetch(req)
}
```

Explication simple : le Worker intercepte la requête au niveau edge. Il lit le token (par ex. en header), vérifie la signature HMAC et la date d'expiration (TTL). Si tout est bon, il laisse passer la requête vers l'origine. Stockez les clés dans un gestionnaire de secrets.

Instrumentez les métriques et les logs avant d'enforcer. Mesurez taux de challenge accepté, taux de blocage, et impact sur latence.

## Que faire ensuite (checklist production)

- [ ] Finaliser la table de décision par endpoint
- [ ] Documenter les filtres Cloudflare et les playbooks de rollback
- [ ] Lancer un canary sur un domaine et tenir un on‑call 72 h
- [ ] Si vous vendez l'accès, contractualiser les partenaires et émettre des tokens de test

### Hypotheses / inconnues

- "Bots >50%" : affirmation rapportée dans l'interview du PDG de Cloudflare via The Verge. https://www.theverge.com/podcast/1000344/cloudflare-matthew-prince-google-zero-ai-web-advertising
- Paramètres à valider sur vos logs : fenêtre de référence (p.ex. 7 jours) ; canary progressif (1% → 10% → 50% → 100%) ; durée d'observation (24–72 h par palier) ; taux limites exemples (120 req/min) ; token TTL exemple (60–300 s).

### Risques / mitigations

- Risque : blocage de vrais utilisateurs ou moteurs de recherche.
  - Mitigation : phase log/challenge d'abord, rollback automatique, whitelist IP/UA et vérification via Search Console.
- Risque : tokens rejoués.
  - Mitigation : TTL courts, nonce/IP binding, rotation de clés (ex. tous les 7 jours).
- Risque : augmentation des coûts liés au logging.
  - Mitigation : limiter la rétention ou échantillonner les événements.
- Risque : dégradation du SEO ou baisse de trafic organique.
  - Mitigation : monitorer indicateurs SEO et inverser les règles si impact détecté.

### Prochaines etapes

1) Valider les hypothèses sur 7 jours de logs.
2) Rédiger la table de décision finale et préparer les règles Cloudflare exportables.
3) Lancer un canary 7 jours avec surveillance active et on‑call 72 h.
4) Si besoin, je peux générer :
   - un JSON prêt à l'import pour les règles firewall (zone ID requis),
   - un exemple minimal de Cloudflare Worker ou Node.js pour valider des tokens HMAC.

Indiquez la zone Cloudflare (ID) et le format de clé souhaité si vous voulez ces artefacts.
