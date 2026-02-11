---
title: "Guide prototype : Cart Assistant qui préremplit les paniers Uber Eats à partir de listes textuelles ou photo"
date: "2026-02-11"
excerpt: "Guide pratique pour construire un MVP Cart Assistant capable d'accepter une liste texte ou une photo (OCR), d'extraire et normaliser les articles avec un LLM, de mapper vers des SKUs en privilégiant l'historique de commande utilisateur, et de préremplir un panier pour revue avant paiement."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-11-prototype-guide-cart-assistant-that-prefills-uber-eats-grocery-carts-from-text-or-photo-shopping-lists.jpg"
region: "US"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 480
editorialTemplate: "TUTORIAL"
tags:
  - "ai"
  - "ocr"
  - "llm"
  - "nlp"
  - "grocery"
  - "prototype"
  - "product"
  - "ux"
sources:
  - "https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping"
---

## TL;DR builders

Ce que vous allez prototyper : un MVP « Cart Assistant » qui accepte une saisie en texte libre ou une photo de liste de courses, extrait les articles (pipeline OCR + NLU), normalise et mappe chaque article vers un SKU en privilégiant les marques historiques de l'utilisateur, puis préremplit le panier pour que l'utilisateur révise et confirme avant le checkout. Ce comportement reprend l'annonce d'Uber Eats (11 fév. 2026) : l'assistant prend en charge des invites textuelles ou des images et invite l'utilisateur à « double‑check your order before putting it through » (voir https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping).

Flux clés (résumé) :
- invite texte → proposition de panier
- upload d'image → OCR → proposition de panier
- étape explicite de revue/confirmation avant passation de commande

Composants MVP (checklist rapide) : UI (texte + upload image + modal de revue), pipeline OCR, service NLU/LLM (prompts), service de mapping marque/SKU (lecture historique), API add‑to‑cart, hooks télémétrie.

Remarque méthodologique : l'article de The Verge sert de référence comportementale (prise en charge texte/image et obligation de vérification par l'utilisateur). Les métriques opérationnelles et seuils techniques proposés ci‑dessous sont des hypothèses d'ingénierie.

## Objectif et resultat attendu

Objectif principal : livrer un prototype qui convertit de manière fiable une entrée texte ou une photo en panier prérempli, en utilisant l'historique de commande pour privilégier les marques connues de l'utilisateur (comportement confirmé par The Verge : https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping).

Résultat attendu (UX) : l'utilisateur saisit « lait, œufs, céréales » ou télécharge une photo d'une liste manuscrite/imprimée et obtient une modal de revue contenant le panier prérempli avant confirmation.

Critères d'acceptation (artefacts / recommandations — HYPOTHESES techniques) :
- Hypothèse : précision d'extraction ≥ 90% sur jeu de tests ciblés (items correctement extraits et normalisés).
- Hypothèse : confiance médiane OCR ≥ 0.85 ; retenter la capture si < 0.60.
- Hypothèse : taux d'association à la marque préférée ≥ 70% quand l'historique est disponible.
- Hypothèse : taux d'override utilisateur < 20% dans les 30 premiers jours.

(Comportement texte/image et contrôle UX mentionnés dans la source : https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping.)

## Stack et prerequis

Stack minimal recommandé (hypothèses de mise en œuvre) :
- Frontend : Web ou mobile (champ texte, upload image, modal de revue).
- OCR : Tesseract ou service cloud (Azure/Google/AWS). Hypothèse : cloud OCR donne meilleurs taux sur photos réelles.
- LLM / NLU : modèle d'instruction pour normalisation de liste (prompting). Budget hypothétique : 100k tokens/mois ; 50–200 tokens par item.
- Backend : orchestration (lambda/containers), catalogue produit & SKU resolver, service personnalisation (lecture historique), API panier.
- Observabilité : métriques, logs, traces, dashboards (SLOs).

Sécurité & confidentialité : consentement explicite pour lire l'historique, RBAC (ex. PERSONALIZATION_READ_ROLE), purge images TTL 24h, redaction PII dans les logs.

Exemple de variables d'environnement (à garder en déploiement) :

```yaml
OCR_API_KEY: "${OCR_API_KEY}"
LLM_API_KEY: "${LLM_API_KEY}"
CART_API_ENDPOINT: "https://api.example.com/cart"
PERSONALIZATION_READ_ROLE: "personalization-reader"
OCR_CONF_THRESHOLD: 0.85
```

(Rappel source comportementale : https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping.)

## Implementation pas a pas

1. Préparer l'UI
   1.1 Ajouter champ texte + uploader image + modal de revue.
   1.2 Afficher aide : « Vous pouvez taper une liste ou télécharger une photo. »
   1.3 Inclure un lien d'aide vers la référence produit (https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping) pour le design UX « vérifiez avant d'envoyer ». 

2. Pipeline image / OCR
   2.1 Upload → stockage temporaire (TTL = 24h) → appel OCR.
   2.2 Rejeter images avec confiance OCR < 0.60 ; accepter par défaut ≥ 0.85. Retry max = 3.

3. Parsing NLU avec LLM
   3.1 Envoyer texte OCR (ou entrée texte brute) au LLM avec instruction stricte : retourner JSON structuré [name, qty, unit, confidence].
   3.2 Budget prompt ≈ 50–150 tokens ; réponse limitée à 300 tokens.

4. Personnalisation & mapping SKU
   4.1 Interroger le service personnalisation pour retrouver SKU préféré selon historique (ex. ≥ 2 achats dans 180 jours).
   4.2 Si prix historique > 30% du best seller, proposer alternative affichée.

5. Peuplement du panier et revue
   5.1 Appeler API add‑to‑cart ; pré‑check d'inventaire synchronisé.
   5.2 Modal de revue affiche marque, prix, qty, et bouton « éditer ». L'utilisateur doit confirmer avant checkout (UX conforme à la source : https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping).

6. Télémétrie et SLOs (hypothèses)
   6.1 Logger confiance OCR, confiance parsing LLM, raison personnalisation, latences, overrides.
   6.2 SLOs recommandés (hypothèses) : parsing time < 1s (texte), latence médiane chemin complet < 2s.

7. Itération
   7.1 A/B tests sur prompts ; collecter 100 cas d'échec pour tuning.

Exemples d'appels (bash + payload attendu) :

```bash
# upload image and request OCR
curl -X POST "https://storage.example.com/upload" \
  -H "Authorization: Bearer $UPLOAD_KEY" \
  -F "file=@list.jpg" \
  -F "ttl=86400"
```

```json
{
  "prompt": "Extract items from this list. Return JSON [{\"name\":..., \"qty\":..., \"unit\":..., \"confidence\":...}]",
  "max_tokens": 300
}
```

(Conformité UX source : https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping.)

## Architecture de reference

Flux logique (image/texte → OCR/LLM → items canoniques → personnalisation → résolution SKU → panier → revue). Composants : UI, stockage upload (TTL 24h), service OCR, service LLM/NLU, service personnalisation, catalogue produit, API panier, observabilité. Source comportementale : https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping.

Exemple fragment Kubernetes (env & probes) :

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cart-assistant
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: assistant
        image: registry.example.com/cart-assistant:v1.2.0
        envFrom:
        - secretRef:
            name: cart-assistant-secrets
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 15
```

Tableau métriques (recommandations — HYPOTHESES pour seuils) :

| Métrique | Objectif | Seuil d'alerte |
|---|---:|---:|
| Précision parsing | ≥ 90% | < 85% |
| Confiance OCR médiane | ≥ 0.85 | < 0.70 |
| Taux override utilisateur | < 20% | > 30% |
| Succès add‑to‑cart | ≥ 99% | < 98% |
| Latence médiane (texte) | < 1s | > 2s |

(Référence UX : https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping.)

## Vue fondateur: ROI et adoption

Le levier ROI principal : réduction de friction → hausse des conversions (comportement produit d'Uber Eats soutenant le cas d'usage texte/image, source : https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping).

Hypothèses commerciales proposées :
- Hypothèse : uplift de conversion initial ciblé +5–15% en A/B tests.
- Hypothèse : AOV augmente de +3–8% lorsque la marque correspond à la préférence utilisateur.
- Hypothèse : amélioration de la rétention hebdomadaire chez acheteurs réguliers.

Parcours de déploiement recommandé (exemples) :
- Canary fermé : 1% des utilisateurs grocery.
- Pilot : 10% pour 30 jours avec télémétrie renforcée.
- Rollout complet après validation des gates.

Gates de promotion (exemples / HYPOTHESES) :
- Gate 1 (canary 1%) : add‑to‑cart success ≥ 99%, override rate ≤ 20%, delta conversion ≥ +3%.
- Gate 2 (pilot 10%) : maintien des métriques Gate 1 pendant 14 jours et NPS UX ≥ 40.

(Référence UX : https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping.)

## Pannes frequentes et debugging

Modes de panne courants et remédiations (pratiques) — basés sur risques techniques classiques, seuils donnés comme hypothèses :

- OCR failing (manuscrit flou) : détecter via confiance OCR < 0.60. Remédiation : demander retake, proposer saisie manuelle. Retry limit = 3.
- NLU hallucinations (items inventés) : imposer schéma JSON strict ; si confiance LLM < 0.50, poser clarification à l'utilisateur.
- Mismatch personnalisation : historique obsolète → exiger ≥ 2 achats dans 180 jours pour confiance.
- Inventaire/prix divergent : pré‑check d'inventaire lors population panier ; en cas d'échec, proposer remplaçant.
- Pics de latence (LLM/OCR lents) : circuit breaker & UX fallback (parsing texte simple), alerter si latence médiane > 2s.

Checklist debug rapide :
- Reproduire avec même photo/texte et vérifier confiance OCR et sortie brute OCR.
- Inspecter prompt/response LLM ; exécuter temperature=0.0 pour sortie déterministe.
- Confirmer que la requête personnalisation renvoie counts et timestamps d'achats.
- Vérifier logs API add‑to‑cart et checks inventaire.

(Rappel source produit : https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping.)

## Checklist production

### Hypotheses / inconnues

- Les utilisateurs privilégient les marques de leur historique et acceptent des remplacements correctement étiquetés. (Hypothèse — non explicitement confirmée par la source.)
- Les cibles de précision (> 90%) sont atteignables en combinant OCR + prompt engineering avec un jeu d'entraînement restreint. (Hypothèse technique.)
- Un canary à 1% des utilisateurs grocery permettra d'identifier les principaux problèmes UX et fiabilité en 14 jours. (Hypothèse opérationnelle.)

### Risques / mitigations

- Risque vie privée : lecture de l'historique des commandes (PII). Mitigation : consentement explicite, RBAC, TTL 24h pour images, redaction PII dans logs.
- Risque UX : taux d'override élevé (> 20%). Mitigation : afficher clairement la sélection de marque, bouton d'édition rapide, collecte motif d'override.
- Risque coût : dépenses LLM/OCR élevées. Mitigation : cache prompts communs, batch des requêtes, cap tokens par parsing (ex. 300 tokens max).

### Prochaines etapes

- Lancer canary 1% avec feature flags et monitorer gates pendant 14 jours.
- Lancer A/B test 2 bras mesurant conversion, delta AOV et taux override ; suivre rétention 7 & 30 jours.
- Itérer prompts OCR/NLU à partir des 100 cas d'échec les plus fréquents.

Tâches immédiates :
- [ ] Implémenter UI texte + image et flux d'opt‑in / consentement
- [ ] Router uploads vers pipeline OCR avec TTL 24h
- [ ] Ajouter parser LLM et validation schéma JSON
- [ ] Implémenter table décisionnelle de personnalisation et résolveur SKU
- [ ] Mettre en place dashboards et alertes télémétriques

Exemple de template de prompt (TS snippet) :

```ts
export const parsePrompt = (text: string) => `Extract items from the user list. Return ONLY valid JSON array of {name, qty, unit, confidence}. Input: "${text}"`;
```

Note finale : respecter le contrôle UX souligné dans l'article source — toujours exiger que l'utilisateur vérifie le panier prérempli avant le checkout (voir https://www.theverge.com/transportation/876540/uber-eats-ai-chatbot-cart-assistant-grocery-shopping).
