---
title: "Bouygues & Perplexity Pro — plan d'action pour ingénieurs, développeurs et fondateurs (contexte UK inclus)"
date: "2026-02-04"
excerpt: "Bouygues Telecom interrompt l'accès gratuit à Perplexity Pro le 11 février 2026 : guide opérationnel et technique localisé pour équipes produit, ingénierie et fondateurs souhaitant répliquer ou gérer un pic d'activation."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-04-bouygues-telecom-ends-free-perplexity-pro-access-on-11-feb-2026-activate-from-your-customer-account.jpg"
region: "UK"
category: "News"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "Perplexity"
  - "Bouygues"
  - "IA"
  - "telecom"
  - "SaaS"
  - "ingénierie"
  - "startup"
  - "UK"
sources:
  - "https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html"
---

## TL;DR builders

- Fait avéré (source) : Bouygues Telecom met fin à l'accès gratuit d'un an à Perplexity Pro le 11 février 2026 ; les abonnés éligibles peuvent encore l'activer depuis leur espace client jusqu'à cette date (https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html).
- Actions immédiates recommandées (hypothèses opérationnelles) : préparer un plan de montée en charge, vérifier la présence du CTA dans l'espace client, instrumenter la chaîne d'activation et préparer scripts/FAQ pour le support.

Remarque méthodologique : la date et le canal d'activation proviennent du reportage Numerama ; les seuils et recettes opérationnelles ci‑dessous sont indiqués comme hypothèses pratiques à valider.

## Ce qui a change

- Confirmation factuelle : l'offre Perplexity Pro proposée gratuitement par Bouygues pendant 1 an prend fin le 11/02/2026 ; activation possible via l'espace client Bouygues jusqu'à cette date (https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html).

Implications synthétiques :
- Fenêtre courte pour CTA / rappels : T‑J-7, T‑J-2, T‑J-1 recommandés.
- Priorités produit/tech : visibilité de l'offre dans le portail, instrumentation des événements clefs, scripts support prêts.
- Hypothèse opérationnelle : pic d'activations attendu autour de la date butoir (à quantifier en tests).  

## Demontage technique (pour ingenieurs)

Contexte produit : Perplexity Pro est décrit comme un moteur de recherche IA affichant ses sources, utile pour synthèses et génération de contenu (https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html).

Points d'attention techniques (à valider) :

- Auth & provisioning
  - Modèle attendu : flag d'entitlement par compte (ex. perplexity_pro_entitled) + timestamp d'expiration (entitlement_expires_at).
  - Token de provisioning one‑time possible (fenêtre p.ex. 24h) ; prévoir chemin de réémission.
  - Révocation immédiate : endpoint pour désactiver le CTA.

- Télémétrie & observabilité
  - Événements à instrumenter : view_offer, click_activate, provisioning_request, provisioning_success, provisioning_failure, confirmation_sent.
  - Seuils (HYPOTHÈSES) :
    - provisioning_failure_rate : alerter si > 5% pendant 30 min.
    - API error rate : alerter si +3% absolu en 15 min.
    - provisioning_latency_p95 : cible <= 300 ms ; alerte si > 600 ms pendant 15 min.
    - SLO recommandé (hypothèse) : 99% de succès hors pics.

- Privacy & sécurité
  - Enregistrement du consentement (ex. gdpr_consent = true) au moment de l'activation.
  - Vérifier conformité au contrat de partage de données avec Perplexity.

Tableau décisionnel exemple :

| Métrique | Plage normale | Seuil d'alerte | Action |
|---|---:|---:|---|
| provisioning_success_rate | 95%–100% | < 95% pendant 30m | Pause CTA + incident |
| provisioning_latency_p95 | < 300 ms | > 600 ms pendant 15m | Banniere maintenance |
| provisioning_failure_rate | < 2% | > 5% pendant 30m | Rollback CTA |

Référence : article Numerama sur Bouygues (https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html).

## Plan d'implementation (pour developpeurs)

Flux d'activation minimal (<= 3 étapes) — source contexte : Numerama (https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html) :
1) Bannière/promo dans l'espace client → modal d'activation
2) Clic unique : consentement + requête de provisioning back‑end
3) Page de confirmation + email de récapitulatif

Instrumentation requise (événements) : view_banner, click_activate, provisioning_request, provisioning_success, provisioning_failure, email_confirmed.

Contraintes UX minimales :
- Maximum 3 clics entre atterrissage et confirmation.
- Email de confirmation envoyé sous 5 minutes après provisioning_success (objectif HYPOTHÈSE).
- Chemin d'échec : retry automatique jusqu'à 3 tentatives, puis transfert vers support manuel.

Artefacts à préparer : copy bannière in‑app + 1 CTA clair ; email de confirmation (<= 160 caractères pour le SMS rappel optionnel).

Support & rollback : canned responses pour top 5 problèmes ; gate de rollback automatique si failure_rate > 5% pendant 30 min.

Exemple d'événement (pseudo‑JSON) :

```
{
  "event": "provisioning_request",
  "user_id": "1234",
  "timestamp": "2026-02-10T12:34:56Z",
  "source": "customer_portal",
  "metadata": { "offer_id": "perplexity_pro_bouygues" }
}
```

## Vue fondateur: cout, avantage, distribution

- Coût & modèle : l'activation gratuite via un telco subventionne l'acquisition ; la facturation des API/requêtes reste à modéliser. Hypothèse : mesurer coût unitaire par utilisateur activé (MAU) et coût par requête.

Tableau de décision (exemple à remplir) :

| Variable | Valeur exemple | Notes |
|---|---:|---|
| Activations attendues | 10 000 (HYPOTHÈSE) | à valider par attribution |
| Requêtes moyennes / utilisateur / jour | 5 (HYPOTHÈSE) | monitorer l'usage réel |
| Durée du trial | 365 jours (fait : offre d'un an) | source Numerama |
| Coût estimé par requête | $X (HYPOTHÈSE) | dépend du contrat API |

- Avantage concurrentiel : distribution via portail telco (bills, emails, SMS) favorise acquisition et réengagement.
- Priorité distribution : portail client > email transactionnel > SMS pour rappels et deadlines.

Référence factuelle : Numerama — fin de l'offre Bouygues (https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html).

## Angle regional (UK)

Applicabilité : l'exemple Bouygues est français ; pour une mise en œuvre au Royaume‑Uni, adapter légal, marketing et support tout en conservant le flow d'activation noté (source contexte Bouygues : https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html).

Checklist rapide pour UK :
- [ ] Revue conformité données vs UK GDPR
- [ ] Localisation en‑GB : textes de consentement et privacy
- [ ] Fuseaux horaires et gestion d'horodatage
- [ ] Opt‑in SMS adapté aux pratiques UK
- [ ] Intégration facturation & abonnements locale
- [ ] SLA/support local (heures, langue)

Notes : vérifier exigences de résidence des données et transferts internationaux si Perplexity reçoit des données utilisateur.

## Comparatif US, UK, FR

Résumé synthétique (FR ancré sur l'exemple Bouygues — source Numerama : https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html) :

| Marché | Partenaires typiques | Canaux | Contraintes privacy | Gate de déploiement recommandé |
|---|---|---|---|---|
| FR | Telcos (ex. Bouygues) | Portail client, SMS, email | EU GDPR ; bundling telco courant | Flags d'entitlement + consent enregistré |
| UK | Telcos & retailers | App, email, SMS | UK GDPR ; opt‑in SMS spécifique | Local consent + support SLA |
| US | ISPs, app stores | App store flows, bundles | Fragmenté (état par état) | Intégration app‑store + facturation intégrée |

Points chiffrés/hypothèses utiles :
- Durée trial observée : 365 jours (1 an).
- Seuil opérationnel proposé : alerte si failure_rate > 5% pendant 30 min.
- Latence cible provisioning_p95 : <= 300 ms.

## Checklist a shipper cette semaine

### Hypotheses / inconnues

- Hypothèse confirmée par la source : Bouygues cesse l'offre gratuite Perplexity Pro le 11/02/2026 et l'activation est disponible via l'espace client (https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html).
- Hypothèses à valider : nombre d'activations (ex. 10 000), usage moyen (ex. 5 requêtes/jour), SLOs (99% cible), latence p95 cible (<= 300 ms), fenêtre token 24h, retry max 3 tentatives.

### Risques / mitigations

- Risque : pic de provisioning et erreurs le jour J.
  - Mitigation : gate de rollback automatique (désactiver CTA si failure_rate > 5% pendant 30 min), staffing de support renforcé, bannière explicative.
- Risque : volume support non gérable.
  - Mitigation : publier FAQ + scripts, prioriser tickets, SLA 24–72h selon criticité.
- Risque : consentements non conformes.
  - Mitigation : validation légale du texte de consentement, enregistrement du flag de consentement.

### Prochaines etapes

- [ ] Vérifier présence de la bannière/offre dans l'espace client (deadline : immédiate).
- [ ] Instrumenter & QA des événements (view_banner, click_activate, provisioning_request, provisioning_success/failure) — deadline : +48h.
- [ ] Préparer templates email/SMS ; viser email de confirmation < 5 minutes après succès (objectif HYPOTHÈSE).
- [ ] Publier FAQ / scripts support ; planifier staffing T‑48h → T+48h autour de la date butoir.
- [ ] Déployer dashboard monitoring avec alertes (seuils HYPOTHÈSES à confirmer en test).
- [ ] Exécuter runbook rollback et test de désactivation CTA en moins de 5 minutes.

Référence principale : Numerama — article sur la fin de l'offre Bouygues pour Perplexity Pro (https://www.numerama.com/tech/2173427-vous-etes-client-bouygues-cest-maintenant-ou-jamais-pour-activer-perplexity-pro-gratuitement.html).

Si vous voulez, je peux convertir ces tâches en tickets Jira/Asana ou générer les templates email/SMS et les scripts support en français et en‑GB.
