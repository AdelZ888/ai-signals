---
title: "Des annotateurs externalisés disent utiliser des chatbots publics pour fabriquer des dialogues d'entraînement « humains »"
date: "2026-06-23"
excerpt: "Des lanceurs d'alerte rapportent que des travailleurs sous-traités poussent des chatbots publics (ex. ChatGPT) pour générer des dialogues présentés comme produits par des humains, ce qui crée un risque de boucle de rétroaction dans les modèles. Checklist opérationnelle incluse, adaptée aux petites équipes au Royaume-Uni."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-23-outsourced-annotators-report-using-public-chatbots-to-generate-human-training-dialogues.jpg"
region: "UK"
category: "News"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "IA"
  - "LLM"
  - "qualité-des-données"
  - "provenance"
  - "UK"
  - "sécurité"
  - "conformité"
sources:
  - "https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/"
---

## TL;DR en langage simple

- Plusieurs travailleurs payés pour créer et tester des dialogues d'entraînement admettent utiliser des chatbots publics (par ex. ChatGPT) pour générer ces exemples au lieu de les rédiger eux‑mêmes. Source : New Scientist, 22 juin 2026. https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/
- Mécanisme observé : sous‑traitance + paiements à la tâche + quotas → incitation aux raccourcis. New Scientist rapporte des témoignages de lanceurs d'alerte. https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/
- Risque principal : « AI inbreeding » — entraîner un modèle sur des sorties d'autres modèles peut homogénéiser le style, répéter des erreurs et appauvrir la diversité. https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/
- Actions rapides (30–90 min) : exiger un champ provenance, prompt_text (≤1 024 tokens recommandé), timestamp, worker_time_to_complete (s) ; lancer des contrôles ponctuels (1 contrôle / 50 items). Voir checklist à la fin.

Ce TL;DR vise dirigeants, petites équipes et fondateurs solo qui veulent mesures pratiques et rapides.

## Ce qui a change

Explication simple : les LLM nécessitent beaucoup d'exemples conversationnels. Pour produire ces exemples, les entreprises emploient des travailleurs (souvent via des sous‑traitants) pour créer et valider des dialogues. New Scientist rapporte que certains de ces travailleurs utilisent des chatbots publics pour générer les exemples à la place d'une rédaction humaine. https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/

Points factuels tirés du reportage :
- Les tâches d'annotation/conversation sont souvent externalisées à des tiers et rémunérées à la tâche, créant des quotas et des incitations au raccourci. https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/
- Plusieurs lanceurs d'alerte disent qu'il est courant d'envoyer un prompt à un chatbot public, puis de soumettre la sortie comme « dialogue humain ». https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/
- Conséquence plausible : une part non négligeable des « données humaines » peut provenir d'autres modèles, favorisant des boucles d'entraînement.

## Pourquoi c'est important (pour les vraies equipes)

- Traçabilité et audits : si le fournisseur masque l'usage d'un chatbot, vos revues qualité seront biaisées. Le reportage signale que l'absence de contrats à plein temps et la faible rémunération sont des facteurs explicatifs. https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/
- Qualité des données : sorties de modèle → convergence stylistique ; sans provenance, vous ne pouvez pas mesurer diversité (p. ex. taux de duplicata >5% ou similarité >0.6 comme signaux d'alarme).
- Coût : détecter la fraude après livraison est plus coûteux (ex. audit de 1 000 items peut coûter £300–£1,000). Prévenir avec métadonnées simples est peu cher.

Le reportage montre que le problème est structurel : sous‑traitance + paiements à la tâche créent des incitations au raccourci. https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/

## Exemple concret: a quoi cela ressemble en pratique

Scénario : vous achetez 10 000 dialogues. Certains travailleurs, sous pression de quotas, envoient un prompt standard à un chatbot, copient la réponse et la soumettent. Le fournisseur livre 10 000 dialogues qui, en surface, paraissent corrects mais proviennent en partie d'un autre modèle. Témoignages : New Scientist. https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/

Signaux rapides à surveiller :
- Phrases strictement identiques présentes sur >5% des items.
- Temps moyen de complétion worker_time_to_complete_s souvent entre 30–90 s pour un dialogue multi‑tours — <60 s suspect pour multi‑tours.
- Absence du champ prompt_history ou prompt_text (≤1 024 tokens conseillé).

Table décisionnelle (exemple)

| Preuve présente | Similarité stylistique (0–1) | Action recommandée |
|---|---:|---|
| prompt_history + timestamps uniques | <0.6 | Accepter et fusionner |
| Pas de prompt_history ; similarité 0.6–0.9 | 0.6–0.9 | Quarantaine + revue manuelle (échantillon 50) |
| Pas de provenance ; similarité >0.9 ou duplicata nombreux | >0.9 | Rejeter + signaler le fournisseur |

Exemple JSONL minimal conseillé :

```
{"id":"dlg_0001","turns":[{"speaker":"user","text":"Bonjour, peux-tu m'aider?"},{"speaker":"assistant","text":"Bien sûr, que veux-tu savoir?"}],"provenance_flag":"human|assistant_assisted|bot_original","prompt_history":"...","worker_id":"w_123","worker_time_to_complete_s":45}
```

## Ce que les petites equipes et solos doivent faire maintenant

Cible : fondateurs solo, équipes de 1–5 personnes — actions réalisables sans équipe data ops dédiée.

Actions immédiates (30–90 min à implémenter) :
1) Instrumentation minimale (30–90 min)
- Ajouter un champ provenance_flag obligatoire (valeurs : human | assistant_assisted | bot_original).
- Capturer prompt_text (limiter à 1 024 tokens), worker_id, worker_time_to_complete_s (en ms ou s) et timestamp ISO.
- Stocker un hash court (p.ex. SHA‑1 ou SHA‑256 tronqué) du contenu pour détection rapide de duplicata.

2) Contrôles automatisés peu coûteux (60 min)
- Échantillonnage automatique 1/50 (2%) pour revue humaine.
- Rejeter / marquer comme suspect tout lot où >10% des items sont duplicata exacts ou >5% sont identiques.
- Marquer suspect tout item avec worker_time_to_complete_s <60 s pour dialogues ≥3 tours.

3) Audits et réponse rapide (1–2 jours)
- Faire un audit initial de 1 000 items (coût estimé £300–£1,000 selon prestataire) ou faire vous‑même une revue de 50 items dans la semaine.
- Exiger lors de l'onboarding la divulgation de l'usage de modèles tiers pour le premier lot de 500–1 000 items.
- Prévoir clause contractuelle simple : remplacement du lot ou remboursement partiel si dissimulation prouvée.

Ressources low‑cost : scripts open‑source pour détection de duplicata (minhash), outils gratuits de stylométrie basiques ; temps d'ingénierie estimé 2–4 heures pour un fondateur technique.

Source et contexte : New Scientist (témoignages de travailleurs, incitations économiques). https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/

## Angle regional (UK)

New Scientist note que ces tâches sont souvent réalisées par des travailleurs tiers, sans contrat à plein temps, ce qui crée les incitations observées — ce schéma peut se rencontrer aussi au Royaume‑Uni. https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/

Recommandation pratique pour une petite équipe UK : vérifier vos obligations locales en matière de tenue de registres et demander preuves/échantillons au fournisseur dès le premier lot. Ne pas présumer de procédures d'audit déjà en place chez le prestataire.

## Comparatif US, UK, FR

Le phénomène rapporté (sous‑traitance + usage de chatbots par des travailleurs) est sectoriel et non limité à un pays selon New Scientist. Pour toutes les juridictions : demandez prompt_history et provenance_flag, et prévoyez spot checks (1 contrôle / 50 items). https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/

| Pays (exemple) | Action minimale recommandée |
|---|---|
| US | Demander preuve/sample + 1 contrôle / 50 items |
| UK | Demander preuve/sample + 1 contrôle / 50 items |
| FR | Demander preuve/sample + 1 contrôle / 50 items |

(Détails réglementaires spécifiques à chaque pays sont hors champ du reportage ; voir la section Hypothèses / inconnues.)

## Notes techniques + checklist de la semaine

### Hypotheses / inconnues

- Hypothèse confirmée par New Scientist : plusieurs travailleurs admettent utiliser des chatbots publics pour produire des annotations/dialogues, créant un risque d'"AI inbreeding". https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/
- Inconnue : prévalence exacte du phénomène sur le marché (les seuils proposés ici — p.ex. 5%, 10%, 30% n‑gram overlap, similarité >0.6 — sont heuristiques pour démarrer les contrôles).
- Inconnue réglementaire : obligations précises de conservation des logs (p.ex. durée 12 mois) et implications contractuelles selon US/UK/FR — ces points nécessitent validation juridique locale.

### Risques / mitigations

- Risque : faux positifs via détection stylométrique ou duplicata. Mitigation : quarantaine puis revue humaine (échantillon 50) avant décision finale.
- Risque : refus du fournisseur de fournir logs (protection des méthodes). Mitigation : clauses contractuelles, échantillons obligatoires pour le premier lot, sanctions simples (remboursement partiel).
- Risque : adoption tardive de métadonnées → coûts d'audit élevés. Mitigation : instrumenter maintenant (provenance_flag, prompt_history ≤1 024 tokens, worker_time_to_complete_s) et lancer audit 1 000 items.

### Prochaines etapes

- [ ] Ajouter champ provenance_flag (human | assistant_assisted | bot_original) au schéma de données.
- [ ] Capturer prompt_history (jusqu'à 1 024 tokens), worker_id et worker_time_to_complete (s) pour chaque soumission.
- [ ] Lancer un scan stylométrique / duplication sur 1 000 items ; signaler batches avec >30% n‑gram overlap ou similarité >0.6.
- [ ] Quarantaine des datasets où >10% des items sont flaggés ; revue manuelle d'un échantillon de 50 items.
- [ ] Mettre à jour les contrats fournisseurs pour exiger la divulgation d'utilisation de modèles tiers et permettre des audits ponctuels.
- [ ] Ouvrir un ticket d'audit reproduisant 1 dialogue mis en quarantaine à partir du prompt_history fourni.

Méthodologie courte : ce brief s'appuie sur le reportage New Scientist (22 juin 2026) et propose contrôles pragmatiques et peu coûteux adaptés aux petites équipes. https://www.newscientist.com/article/2531050-people-training-new-ai-models-admit-they-just-get-chatbots-to-do-it/
