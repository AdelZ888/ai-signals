---
title: "AWS Strands Agents : conception agent→outil qui a réduit l’utilisation de tokens LLM d’environ 96%"
date: "2026-05-02"
excerpt: "Résumé et guide pratique pour équipes et développeurs : l’approche « agent→outil » de Strands externalise l’extraction et la synthèse hors des prompts, réduisant fortement l’usage mesuré de tokens et améliorant coût, testabilité et protection des données. Source : thenewstack.io/strands-agents-tool-design"
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-02-aws-strands-agents-an-agent-to-tool-design-that-cut-llm-token-use-by-96percent.jpg"
region: "UK"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "IA"
  - "agents"
  - "LLM"
  - "optimisation"
  - "coûts"
  - "vie privée"
  - "UK"
  - "ingénierie"
sources:
  - "https://thenewstack.io/strands-agents-tool-design/"
---

## TL;DR en langage simple

- Idée clé : extraire, normaliser, agréger et mettre en cache les parties répétitives d'un flux avant d'appeler le modèle, et réserver le LLM pour le jugement et la rédaction finale. Cela réduit fortement le volume de « tokens » envoyés et donc le coût. (Source : https://thenewstack.io/strands-agents-tool-design/)
- Chiffre notable : Strands rapporte ~96 % de réduction de l'usage de tokens sur le flux testé. (Source : https://thenewstack.io/strands-agents-tool-design/)
- Démarche pratique : mesurer d'abord (baseline), puis remplacer progressivement des fenêtres longues de texte par des extracteurs déterministes et un cache avant de solliciter le LLM. (Source : https://thenewstack.io/strands-agents-tool-design/)

## Ce qui a change

Plutôt que de donner au modèle l'historique exhaustif (longs threads, documents), l'approche consiste à :

- extraire des champs structurés (détecter entité / problème / gravité) via du code déterministe;
- condenser et normaliser ces champs (JSON, étiquettes) avant appel au LLM;
- mettre en cache les résultats inchangés pour éviter de recalculer des résumés ;
- laisser au LLM la décision finale et la génération textuelle.

L'idée, telle que décrite par Strands, est de réduire le nombre de tokens transmis par appel en transférant le travail répétitif hors du prompt. (Source : https://thenewstack.io/strands-agents-tool-design/)

## Pourquoi c'est important (pour les vraies equipes)

- Coût : moins de tokens transmis se traduit directement par des économies sur les factures facturées au token — Strands indique une réduction d'environ 96 % sur leur cas d'étude. (Source : https://thenewstack.io/strands-agents-tool-design/)
- Contrôle & audit : les extracteurs et agrégateurs sont du code versionnable et testable, plus simples à auditer que des prompts monolithiques.
- Sécurité : envoyer des résumés structurés réduit la quantité d'information partagée au fournisseur externe, utile pour conformité et pseudonymisation.

Ces bénéfices sont concrets pour les équipes qui traitent des volumes importants (support, modération, ingestion documentaire). (Source : https://thenewstack.io/strands-agents-tool-design/)

## Exemple concret: a quoi cela ressemble en pratique

Cas d'usage : tri automatique de tickets support.

Flux simplifié :

1. Extracteur (code) : parse le fil et renvoie un objet structuré (ex. {probleme: "connexion", gravite: "moyenne", version: "X"}).
2. Agrégateur : condense plusieurs messages en un résumé court et normalise les labels.
3. Cache : si le fil n'a pas changé depuis T0, réutiliser le résumé pré-calculé.
4. Agent LLM : reçoit le résumé + JSON et décide : répondre, escalader, demander précision.

Conséquence opérationnelle : au lieu d'envoyer l'historique complet (ex. plusieurs milliers de tokens), on envoie seulement les champs essentiels et un résumé compact, ce qui diminue les appels lourds au modèle et accélère le temps de traitement. (Source : https://thenewstack.io/strands-agents-tool-design/)

## Ce que les petites equipes et solos doivent faire maintenant

Actions concrètes, priorisées pour un·e fondateur·rice solo ou une petite équipe (3 points actionnables) :

1) Mesurer la baseline et choisir un candidat réalisable
- Activez un log simple qui enregistre : taille du prompt (tokens estimés) et nombre d'appels LLM pour 20–50 requêtes représentatives (collecte locale). (Source : https://thenewstack.io/strands-agents-tool-design/)

2) Prototyper un extracteur minimal en 1 journée
- Écrire un script qui, pour 5–20 exemples, produit : 1) un résumé de 1–2 lignes et 2) un petit JSON de champs clés. Tester manuellement sur ces exemples et vérifier que le LLM, avec ces entrées réduites, prend les mêmes décisions métier.

3) Déployer en sécurité et itérer rapidement
- Mettre le changement sous feature flag et router une part réduite du trafic (ex. 5–10 %) ; vérifier taux d'erreur et métriques métier. Si problème : rollback immédiat.

Checklist actionnable :
- [ ] Capturer baseline tokens + appels LLM
- [ ] Sélectionner 1 flux répétitif (tickets, FAQ, formulaires)
- [ ] Écrire et tester extracteur sur 5–20 exemples
- [ ] Déployer sous feature flag et monitorer

(Source : https://thenewstack.io/strands-agents-tool-design/)

## Angle regional (UK)

- Minimisation des données : privilégier l'extraction et la pseudonymisation localement ; n'envoyer au modèle que le nécessaire. (Source : https://thenewstack.io/strands-agents-tool-design/)
- Documentation exigée : fournir un schéma simple montrant quels champs restent locaux et quels champs sont transmis pour faciliter revues et audits.
- Budgétisation : suivre la métrique "tokens-per-request" pour prévoir l'OPEX variable et justifier les transferts de données aux régulateurs locaux.

Ces recommandations répondent aux attentes de traçabilité et de justification de traitement souvent recherchées au Royaume‑Uni. (Source : https://thenewstack.io/strands-agents-tool-design/)

## Comparatif US, UK, FR

| Région | Approche opérationnelle (typique) | Focus principal |
|---|---:|---|
| US | contrats et intégration rapide | vitesse d'accès aux données |
| UK | minimisation + documentation | preuve de besoin et audit |
| FR | précaution sur données personnelles | anonymisation locale |

Note : résumé de tendances observées; adapter au contexte local. (Source : https://thenewstack.io/strands-agents-tool-design/)

## Notes techniques + checklist de la semaine

### Hypotheses / inconnues

- 96 % : réduction d'usage de tokens rapportée par Strands sur leur flux mesuré (cas d'étude). (Source : https://thenewstack.io/strands-agents-tool-design/)
- Taille d'échantillon recommandée pour tests initiaux (hypothèse) : N = 50–200 requêtes par variante pour obtenir un signal utile.
- Routage initial (hypothèse) : 5–10 % du trafic pour validation sans risque.
- Exemples pour prototypage (hypothèse) : 5–20 exemples pour itération rapide.
- Seuils opérationnels proposés (hypothèses) : latence cible < 200 ms pour l'extracteur local, TTL cache = 3600 s (1 h) par défaut, alerte si tokens-per-request augmente de > 30 %.
- Coûts : la valeur $/1k tokens varie selon fournisseur — traiter toute estimation $ comme hypothèse à valider.

Méthodologie : j'ai résumé l'approche technique et extrait le chiffre clé de l'article Strands (voir source ci‑dessus) ; les autres seuils numériques sont des hypothèses opérationnelles à tester.

### Risques / mitigations

- Perte d'information lors de l'extraction -> mitigation : tests A/B, possibilité de toujours joindre le thread complet via fallback si le LLM signale incertitude.
- Cache obsolète -> mitigation : TTL explicites, invalidation conditionnelle basée sur hash du fil.
- Refactor trop large -> mitigation : commencer par 1 flux à fort volume et faible complexité.
- Surveillance insuffisante -> mitigation : dashboards tokens-per-request, latence médiane, taux d'incertitude du LLM.

### Prochaines etapes

- [ ] Capturer la baseline : tokens par requête et nombre d'appels modèle pour 20–50 requêtes représentatives.
- [ ] Choisir un flux candidat et extraire 5–20 exemples.
- [ ] Prototyper un extracteur minimal (résumé + JSON) et tester localement sur 10–20 cas.
- [ ] Déployer sous feature flag et router 5–10 % du trafic pour validation pendant 1–2 semaines.
- [ ] Mettre en place dashboards (tokens-per-request, latence, taux de succès métier) et décider rollback ou déploiement progressif.

Bref : le cas Strands montre qu'on peut fortement réduire l'usage de tokens (~96 %) en déplaçant le travail déterministe hors du prompt. Mesurez d'abord, prototypez vite et validez par petits incréments. (Source : https://thenewstack.io/strands-agents-tool-design/)
