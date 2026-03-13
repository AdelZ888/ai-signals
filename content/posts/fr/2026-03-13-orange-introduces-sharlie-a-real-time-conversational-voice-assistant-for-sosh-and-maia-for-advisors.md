---
title: "Orange annonce Sharlie (assistant vocal temps réel) et MAIA : ce que les équipes produit et techniques doivent savoir"
date: "2026-03-13"
excerpt: "Orange a présenté MAIA (assistant pour conseillers) et Sharlie (assistant vocal conversationnel en temps réel pour Sosh). Ce document explique simplement les changements, l'impact opérationnel et une checklist actionnable pour petites équipes et développeurs en France."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-13-orange-introduces-sharlie-a-real-time-conversational-voice-assistant-for-sosh-and-maia-for-advisors.jpg"
region: "FR"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "IA"
  - "service client"
  - "Orange"
  - "Sosh"
  - "assistant vocal"
  - "MAIA"
  - "Sharlie"
  - "opérations"
sources:
  - "https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html"
---

## TL;DR en langage simple

- Orange a annoncé le 12 mars 2026 deux services d'IA générative : MAIA (assistant pour conseillers humains) et Sharlie (assistant vocal pour les clients Sosh). Source : https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html
- Sharlie est présenté comme un assistant vocal conversationnel en temps réel et pourrait prendre en charge ~20 % des contacts Sosh selon l'annonce. Source : https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html
- En clair : Sharlie écoute (ASR), comprend (NLU), interroge les données clients et répond en voix synthétique (TTS), avec règles d'escalade vers un humain.

Méthodologie : synthèse et interprétation guidée par l'article Numerama ci‑dessus.

## Ce qui a change

- Passage d'un modèle centré sur le conseiller humain vers un modèle hybride où une IA vocale peut gérer directement une fraction des appels clients (MAIA = outil d'assistance, Sharlie = prise en charge directe). Source : https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html
- Opérationnellement, les chaînes ASR → NLU → back‑office → TTS et les règles de consentement/escalade deviennent critiques.
- Conséquence attendue : redéploiement de priorités produit (voix, NLU), exigences de conformité et supervision continue.

## Pourquoi c'est important (pour les vraies equipes)

- Visibilité publique : une grande entreprise qui communique sur un déploiement crée des attentes internes et externes (clients, régulateurs). Source : https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html
- Impacts concrets pour équipes produit/support : roadmap technique orientée voix, définition de SLA, définition claire des seuils d'escalade, et tableaux de bord qualité (latence, taux de transfert, CSAT).

Exemples de KPI à surveiller (suggestions opérationnelles) :
- part d'appels gérés par l'IA : objectif soft‑launch 5–10 % du trafic
- latence NLU médiane cible : < 300 ms
- WER (ASR) cible : < 15 % sur canaux calmes
- CSAT cible post‑appel : ≥ 80 %

Les valeurs ci‑dessus sont des recommandations à valider en test (voir Hypotheses / inconnues).

## Exemple concret: a quoi cela ressemble en pratique

Scénario inspiré de l'annonce :
1) Un client Sosh appelle au sujet d'une facture ; l'appel est pris par Sharlie.
2) L'agent vocal présente son statut (IA) et demande le consentement à l'enregistrement et au traitement. Source : https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html
3) ASR convertit la parole en texte, NLU identifie l'intention « contestation facture », le back‑office est interrogé.
4) Si le score de confiance < seuil (ex. 0.7) ou si la demande implique remboursement, transfert vers un conseiller humain avec fiche récapitulative.
5) Si l'IA résout, envoi d'un court sondage CSAT vocal et stockage des logs.

Règles opérationnelles simples (extrait de scénario recommandé) :
- Consultation de facture simple → géré par Sharlie.
- Modification d'offre → handled by Sharlie + confirmation humaine.
- Remboursement/contestations financières → transfert obligatoire.

## Ce que les petites equipes et solos doivent faire maintenant

Contrainte : vous n'avez pas les ressources d'Orange. Priorisez fiabilité, coûts et conformité. Trois actions concrètes et actionnables :

1) Lancer un pilote textuel sur 1 intention faible‑risque (ex. "état de compte") : prototyper en chat en 1–2 semaines, valider 100–200 conversations avant passage voix. Durée recommandée : 2–4 semaines de PoC.

2) Mettre en place un basculement humain minimal et testable : prévoir 1 script de transfert, 1 fiche récapitulative automatique (5 champs : identifiant client, intention, extrait de dialogue, score confiance, raison du transfert). Tester 20 transferts en mode shadow avant activation.

3) Instrumenter dès le début : logs structurés, métriques clés et budget. Exemples chiffrés pour piloter (à valider) : plafond coûts mensuels $500–$2,000, token budget 100k–1M tokens/mois, latence cible NLU < 300 ms, taux d'erreur ASR < 20 % pendant le pilote.

Checklist opérationnelle pour solo/fondator (exécutable en 1 mois) :
- [ ] Choisir 1 intention pilote et écrire 10 scripts client (phrases) représentatives
- [ ] Prototyper en chat (text) et atteindre 80 % de bonnes réponses sur 100 échantillons
- [ ] Implémenter transfert humain + fiche récapitulative (5 champs)
- [ ] Activer logging (CSAT, taux de transfert, latence médiane)
- [ ] Limiter coût mensuel initial (cap à $500) et surveiller consommation tokens

Sources et inspiration : annonce Numerama sur Sharlie : https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

## Angle regional (FR)

- L'annonce concerne le marché français et la marque Sosh d'Orange : attentes fortes sur la clarté du consentement et la conservation des échanges. Source : https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html
- Priorités locales : message de consentement en français clair, traces horodatées et stockage conforme, robustesse ASR pour accents régionaux.

Recommandation rapide : démarrer le pilote sur 1 région ou canal (par ex. canal web ou numéro dédié) et limiter le soft‑launch à 5 % du trafic national pendant 2–4 semaines.

## Comparatif US, UK, FR

| Critère | US | UK | FR |
|---|---:|---:|---:|
| Sensibilité au consentement | formulaires fréquents | auditabilité élevée | forte exigence de clarté vocale |
| Focus réglementaire | notices & privacy | auditabilité post‑Brexit | conservation et consentement explicite |
| Lancement conseillé | tests utilisateurs larges | documentation & compliance | phrase de consentement claire en FR |

(Source comparatif inspiré par l'annonce de déploiement d'Orange et implications marché : https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html)

Règle simple : réduire la complexité en lançant d'abord sur le marché majoritaire de vos clients.

## Notes techniques + checklist de la semaine

Points techniques essentiels référencés : ASR, NLU, TTS, règles d'escalade et consentement vocal — issus de l'annonce Numerama sur Sharlie. Source : https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

- Objectifs de monitoring à définir : containment % (objectif initial 20 %), latence médiane < 300 ms, WER < 15–20 %, CSAT ≥ 80 %, soft‑launch 5–10 % trafic.
- Exemples de limites budgétaires à configurer pour un pilote : $500/mo (solo) → $2,000/mo (petite équipe). Token cap initial : 100k–1M tokens/mo.

- [ ] Semaine 1 : définir 1 intention pilote + scripts (10–20 phrases)
- [ ] Semaine 2 : PoC textuel, activer logging, définir fiche transfert (5 champs)
- [ ] Semaine 3 : activer voix en shadow mode, mesurer WER et latence
- [ ] Semaine 4 : soft‑launch 5–10 % trafic si KPIs atteints

### Hypotheses / inconnues

Confirmé par la source : annonce publique le 12/03/2026 et ambition ~20 % des contacts pris en charge par Sharlie. Source : https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html

Hypothèses à valider en test (chiffres fournis ici comme points de départ, non déclarés explicitement dans l'annonce) : seuil confiance pour handoff = 0.7, latence NLU cible < 300 ms, WER cible < 15 %, soft‑launch 5–10 % trafic, budget pilote $500–$2,000/mo, token cap 100k–1M/mo.

### Risques / mitigations

- Perte de contexte au transfert → mitigation : fiche de transfert standardisée (5 champs) et logging.
- ASR dégradé sur accents/bruit → mitigation : commencer sur canaux calmes, mesurer WER, augmenter jeux de données locaux.
- Coûts runtime élevés (ASR/TTS/tokens) → mitigation : feature gates, caps budgétaires, seuils d'escalade.
- Consentement mal compris → mitigation : tests A/B sur message vocal et logging explicite du consentement.

### Prochaines etapes

1) Relire l'article Numerama et centraliser la doc publique d'Orange : https://www.numerama.com/tech/2204641-orange-devoile-sharlie-le-nouveau-conseiller-de-sosh-nest-pas-humain.html
2) Choisir 1 intention pilote textuelle et définir critères d'acceptation (coverage 80 %, CSAT ≥ 80 % sur 100 tests).
3) Construire PoC textuel, activer logging, tester basculement humain en shadow mode et mesurer : containment %, latence médiane, WER, coûts.
4) Si KPIs atteints, soft‑launch 5–10 % du trafic pendant 2–4 semaines, puis montée progressive.

Si vous souhaitez, je peux convertir la checklist en un runbook jour‑par‑jour sur 4 semaines, fournir 10 scripts clients et un script vocal de consentement en français.
