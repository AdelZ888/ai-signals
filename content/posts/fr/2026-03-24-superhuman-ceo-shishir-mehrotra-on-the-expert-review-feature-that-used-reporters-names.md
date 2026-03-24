---
title: "Le PDG de Superhuman, Shishir Mehrotra, sur la fonctionnalité « Expert Review » qui a utilisé des noms de journalistes"
date: "2026-03-24"
excerpt: "Traduction et guide pratique pour équipes techniques et fondatrices : la presse a signalé qu'une fonctionnalité IA présentait du contenu comme venant de journalistes nommés. Le PDG de Superhuman a répondu et proposé des actions. Ce document traduit le reportage de The Verge en étapes opérationnelles — recommandations marquées quand elles ne sont pas explicitement dans l'enquête."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-24-superhuman-ceo-shishir-mehrotra-on-the-expert-review-feature-that-used-reporters-names.jpg"
region: "US"
category: "News"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "NEWS"
tags:
  - "IA"
  - "incident-response"
  - "persona"
  - "confiance"
  - "produit"
  - "Superhuman"
  - "legal"
  - "US"
sources:
  - "https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation"
---

## TL;DR en langage simple

- The Verge a documenté un cas où une fonction d'IA a produit du contenu présenté comme venant d'une personne réelle, et a publié une interview du PDG à propos de l'incident : https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation
- Le problème clé : attribution (dire d'où vient le contenu généré) versus usurpation d'identité (présenter l'IA comme si c'était une vraie personne). L'article et l'entretien le mettent en lumière : https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation
- Risque immédiat : perte de confiance, afflux de tickets support et exposition publique rapide. Recommandations opérationnelles conservatrices : triage en ~30 minutes, statut public en <180 minutes, remédiation visible <72 heures.
- Actions pratiques à démarrer tout de suite : 1) pauser les « personas » (flag runtime), 2) afficher une attribution claire (« IA — Conseiller senior »), 3) prévoir un rollback one‑click et documenter l'incident.
- Exemple court : un mode « conseiller expert » affiche un nom connu. Un journaliste le repère et publie. Vous pausez la fonctionnalité, remplacez le nom par « IA — Conseiller senior » et publiez un court statut.

Explication simple avant détails avancés :
- En langage courant, il s'agit d'une IA qui « parle à la place » d'une personne. Les gens confondent facilement une sortie IA présentée comme une citation réelle. Cela brise la confiance rapidement. Les étapes suivantes sont des mesures opérationnelles concrètes pour réduire l'exposition et prouver que vous avez réagi.

## Ce qui a change

The Verge rapporte un cas public d'impersonation par une fonctionnalité IA et publie une interview du PDG qui discute la ligne entre attribution et usurpation : https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

Ce que cela change pour les équipes produit et ops :
- Les personas IA doivent être traités comme des fonctionnalités à haut risque. Elles nécessitent des garde‑fous en runtime et une procédure d'incident réutilisable.
- Immediate best practice : documenter une timeline d'incident et mettre en place un toggle (flag) pour désactiver rapidement la fonctionnalité.

Exemple de table de suivi d'incident (à garder dans votre log) :

| Étape | Exemple de champ | Valeur (à remplir) |
|---|---:|---|
| Date de sortie | ISO date | 2026-03-XX |
| Date de découverte | ISO date | 2026-03-XX |
| Canal de découverte | ex. article, réseaux | article reporter |
| Atténuation initiale | pause / opt‑out / restreindre | pause (exemple) |
| Objectif temps‑remédiation | heures | 72 |
| Résolution finale | supprimé / révisé / politique | en cours |

Source et contexte : https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

## Pourquoi c'est important (pour les vraies equipes)

- Un journaliste ou une personne dont le nom/voix est utilisé sans accord peut amplifier le problème publiquement. The Verge a montré une confrontation publique avec le PDG sur ce thème : https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation
- Effet attendu : pic de support et visibilité médiatique dans les premières 24 heures. Selon exposition, tickets support ×3–×10.
- Recommandations opérationnelles (valeurs conservatrices) :
  - Triage initial : viser confirmation en ~30 minutes.
  - Communication publique initiale : publier un statut en <180 minutes (3 heures).
  - Remédiation visible : viser <72 heures.
  - Rollback technique : one‑click capable de s'exécuter en <5 minutes, interface utilisateur (UI) reflétant le changement en ~200 ms.
  - Audit : conserver le contexte de prompt (au moins 1 024 tokens — un token = unité de texte) pendant 90 jours pour enquêtes internes.

Référence : https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

## Exemple concret: a quoi cela ressemble en pratique

Scénario réduit : vous avez un mode « conseiller expert » qui marque des suggestions avec des noms. Un journaliste repère l'usage d'un nom et publie une alerte — situation couverte par The Verge et la discussion avec le PDG : https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

Décisions rapides et quand les appliquer :
- Pauser la fonctionnalité si l'exposition est large. Objectif opérationnel : action initiale en 30–180 minutes.
- Remplacer noms par rôles génériques (« IA — Conseiller senior ») pour réduire l'effet réputationnel.
- Supprimer la fonctionnalité si, après revue légale, le risque reste élevé.
- Répondre publiquement uniquement avec preuves et avis légal.

Rollback minimal (pseudo) :

```
# bascule one-click (pseudo)
SET feature_flags.persona_enabled = false
PUBLISH /deploy/feature_flags persona_enabled=false
# UI doit appliquer le changement en ~200 ms si polling/ws bien configuré
```

Contexte : https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

## Ce que les petites equipes et solos doivent faire maintenant

Basé sur le cas rapporté par The Verge : https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

Pour équipes de 1–5 personnes (fondateur solo ou micro‑équipe), priorisez actions rapides, peu coûteuses et à fort effet :

1) Pauser la sortie persona en 30–180 minutes
- Action technique : flippez un flag runtime (feature_flags.persona_enabled=false) ou retirez le template persona de la rotation.
- Vérifiez que le changement se propage en <5 minutes en prod/canary.

2) Remplacer noms par rôles et afficher attribution claire (30–60 minutes)
- Produit/UI : ajouter un bandeau visible « IA générée — Conseiller senior » sur tout rendu. Afficher pendant ≥3 secondes au premier rendu ou en bannière persistante.

3) Mettre en place un opt‑out utilisateur et un rollback global one‑click (72 h pour tests)
- Exposez persona_enabled=false comme réglage admin et préférence utilisateur.
- Écrivez et testez un script one‑click end‑to‑end et une procédure de rollback documentée.

Checklist rapide à copier :
- [ ] Pauser les sorties persona (30–180 minutes)
- [ ] Remplacer noms par rôles et ajouter attribution visible (30–60 minutes)
- [ ] Inventorier les 50 templates les plus utilisés et marquer références à individus (24–48 heures)
- [ ] Publier un message public court expliquant l'action initiale (30–60 minutes)
- [ ] Tester rollback one‑click et mesurer propagation <5 minutes

Si possible, planifiez une consultation juridique courte (30 minutes) et consignez la recommandation dans votre log d'incident.

## Angle regional (US)

Conseils opérationnels pour lancements aux États‑Unis (information opérationnelle, pas un avis juridique) : https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

- Exiger une revue interne avant toute réactivation publique d'une fonctionnalité persona ; horodatez qui a autorisé la réactivation.
- Tenir un journal d'incident avec preuve de rollback ; préparer à montrer actions correctives dans <72 heures si demandé par parties prenantes.
- Préparer modèles de relations publiques (RP) : courte déclaration, FAQ client, capture de la preuve de rollback pour exécutifs.

Métrique opérationnelle recommandée : délai entre découverte publique et remédiation visible <72 heures.

## Comparatif US, UK, FR

Résumé opérationnel (valeurs proposées ; confirmer avec conseil local) : https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation

| Juridiction | Focus opérationnel | Checklist rapide |
|---|---:|---|
| US | RP rapide et documentation d'actions | Pause persona ; log ; objectif 72h |
| UK | Transparence publique et correction | Attribution claire ; procédure de correction publique |
| FR | Réputation et droit de la personnalité (vérifier localement) | Éviter noms sans consentement ; revue avant réactivation |

(Remarque : obligations légales précises varient ; voir section Hypotheses / inconnues ci‑dessous.)

## Notes techniques + checklist de la semaine

### Hypotheses / inconnues

- The Verge a documenté un incident d'impersonation et une interview du PDG : https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation
- Détails précis manquants dans l'extrait : délais internes réels, volume exact de tickets, coûts juridiques. Les chiffres ci‑dessous (30 min, 180 min, 72 h, <5 min, 200 ms, 1 024 tokens, 90 jours, 50 templates) sont des recommandations opérationnelles conservatrices à valider.
- Estimations financières et d'impact (ex. coût légal $5k–$20k, baisse de rétention >3%) sont des hypothèses à confirmer par vos données et conseil juridique.

Méthodologie courte : j'ai utilisé le reportage The Verge comme signal et traduit l'incident en actions opérationnelles prioritaires.

### Risques / mitigations

Risques identifiés : perte de confiance publique, pic de support (×3–×10), exposition légale, baisse de rétention (>3%). Mitigations recommandées :
- Flag global persona_enabled = false et rollback one‑click testé (<5 minutes).
- Persister hash du template + derniers 1 024 tokens par événement pendant 90 jours pour audit.
- Exiger Product + Legal sign‑off documenté avant réactivation publique.
- Surveiller alertes : spike social ou ×3 augmentation tickets en <24 h déclenche procédure d'escalade.

### Prochaines etapes

Priorités 7 jours :
- [ ] Inventorier top 50 templates et marquer références à individus (24–48 h)
- [ ] Déployer attribution visible sur contenus générés (48 h cible)
- [ ] Implémenter et tester toggle global persona_enabled et rollback one‑click (72 h cible)
- [ ] Rédiger FAQ publique et template statut d'incident (24–48 h)
- [ ] Contacter un conseil juridique pour revue de l'usage des personas (dans 7 jours)

Checklist développeur : enregistrer hash des templates et 1 024 derniers tokens ; valider bascule prod/staging/canary en <5 minutes ; ajouter monitoring pour alerte sur ×3 augmentation tickets ou spike social.

Remarque finale : utilisez le reportage The Verge comme signal d'alerte opérationnel et adaptez ces SLA (accords de niveau de service) et seuils (30 min, 3 h, 72 h, <5 min, 200 ms, 1 024 tokens, 90 jours, 50 templates) à votre contexte produit et légal. Source : https://www.theverge.com/podcast/898715/superhuman-grammarly-expert-review-shishir-mehrotra-interview-ai-impersonation
