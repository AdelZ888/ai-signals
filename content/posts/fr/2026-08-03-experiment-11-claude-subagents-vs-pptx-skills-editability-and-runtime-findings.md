---
title: "Expérience : 11 sous‑agents Claude vs skills PPTX — éditabilité et temps d'exécution"
date: "2026-08-03"
excerpt: "Une expérience a exécuté 11 sous‑agents Claude sur le même brief 5 diapositives pour comparer 11 skills PPTX. Résultat clé : beaucoup de skills rasterisent tableaux/graphes au lieu de produire des objets PPTX éditables — impact réel pour fondateurs et petites équipes en déplacement."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-03-experiment-11-claude-subagents-vs-pptx-skills-editability-and-runtime-findings.jpg"
region: "UK"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "IA"
  - "agents"
  - "PPTX"
  - "Claude"
  - "outils"
  - "startups"
  - "UK"
sources:
  - "https://www.bulaev.net/p/i-had-11-ai-subagents-test-every"
---

## TL;DR en langage simple

- Un test a fait tourner 11 sous‑agents Claude sur le même brief : un pitch deck de 5 diapositives pour « Publora ». Résultat chiffré : 11 agents, 11 decks, ~1,3M tokens consommés, ~60 min de wall‑clock, et un SKILL.md atteignant ~82 000 tokens. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

- Le problème récurrent : beaucoup de skills tiers rendent tableaux et graphiques comme des images raster. Cela empêche l'édition rapide. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

- Règle courte pour commencer : vérifiez l'éditabilité, mesurez la consommation de tokens et testez plusieurs runs avant mise en production. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

## Ce qui a change

- Protocole de l'expérience : un brief unique (5 diapositives). Onze sous‑agents isolés, chacun clone un repo et exécute le SKILL.md tel quel. Sorties normalisées via LibreOffice → PNG pour comparaison visuelle. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

- Données collectées : logs (stdout/stderr), erreurs exactes, captures d'écran, et notes 1–10 pour facilité, qualité, éditabilité et docs. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

- Observation clé : la taille d'un SKILL.md peut atteindre ~82 000 tokens. Des fichiers aussi longs augmentent les tokens consommés, les coûts et la variance des temps d'exécution. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

- Pipeline synthétique : clone → exécution SKILL.md sans modification → logs → export (LibreOffice) → comparaison PNG. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

## Pourquoi c'est important (pour les vraies equipes)

- Éditabilité = rapidité opérationnelle. Si un tableau est une image, on ne peut pas modifier une cellule en 2 minutes avant une réunion. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

- Coût prévisible. Un SKILL.md de dizaines de milliers de tokens rend la facturation API et le planning d'exécution imprévisibles. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

- Dette technique et friction. Sorties non éditables demandent post‑traitement manuel et ajoutent du travail répétitif avant une démo ou une réunion. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

- Gouvernance légère à envisager : testez éditabilité et logs avant promotion. Les règles exactes (seuils numériques) sont proposées plus bas comme heuristiques. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

## Exemple concret: a quoi cela ressemble en pratique

Contexte réel : fondateur en taxi, réunion investisseur 09:00. Il doit mettre à jour le chiffre du jour sur la diapo 4 en < 2 minutes. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

- Exigence opérationnelle : la diapositive 4 doit contenir un vrai objet tableau PPTX (par ex. 4 lignes × 3 colonnes numériques) pour modifier une cellule directement.

- Échec observé : plusieurs skills ont aplati le tableau en image, empêchant la modification sans recréer le tableau.

- Succès observé : les skills qui génèrent des tables natives permettent une édition immédiate et passent l'export LibreOffice → PNG sans perdre l'information structurelle. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

Tableau d'acceptation (exemple) :

| Candidate skill | Editabilité (1–10) | Docs (1–10) | Runtime typique (min) | Notes d'erreurs connues |
|---|---:|---:|---:|---|
| Skill A (éval) | 8 | 7 | 6 | OK, table native |
| Skill B (éval) | 4 | 5 | 12 | Table rendu en image |

Remarques pratiques : effectuez au moins 3 runs par candidate et conservez ces captures et logs pour audit. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

## Ce que les petites equipes et solos doivent faire maintenant

Tous les points ci‑dessous se basent sur la méthodologie décrite dans l'article de test. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

Checklist rapide (pour un solo / petite équipe) :

1) Tester le skill sur votre brief réel
- Lancez le SKILL.md du candidat sans modification. Enregistrez stdout/stderr et le PPTX généré. (1 run prend typiquement quelques minutes; l'étude totale a pris ~60 min pour 11 runs). (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

2) Vérifier l'éditabilité (test manuel simple)
- Ouvrez le PPTX dans PowerPoint ou LibreOffice. Modifiez la diapo 4 : changez une cellule de tableau. Pass/Fail.

3) Actions concrètes (au moins 3 pour les solos)
- A. Maintenez un template de secours minimal (1–2 diapositives) que vous savez remplir à la main en < 5 minutes. Entraînez‑vous à le faire sur laptop ou mobile.
- B. Automatisez un test d'édition simple : script python‑pptx qui ouvre la diapo 4 et remplace une cellule. Si le script échoue, basculez sur le fallback. (exemple d'utilisation basique inspiré du test: modifier cellule d'une table). (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)
- C. Mesurez tokens et runtime : si un SKILL.md dépasse ~20 000 tokens ou si un run dépasse 30 min à répétition, forkez/extrayez un wrapper minimal (< 10 000 tokens) et retestez.

4) Process léger avant réunion
- Exécutez le skill, ouvrez la diapo 4, modifiez une cellule, vérifiez polices et logos. Si échec, utilisez le template de secours. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

Ces étapes prennent 10–30 minutes pour un solo si automatisées. Elles limitent le risque d'un échec en situation critique.

## Angle regional (UK)

- Comparaison d'affichage : l'étude a standardisé les exports via LibreOffice → PNG pour comparaison visuelle, mais les PowerPoint d'entreprise (Windows/Mac) peuvent rendre différemment — testez sur le client réel UK. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

- Conformité et stockage : pour le Royaume‑Uni, traitez chaque skill tiers comme un fournisseur. Consignez l'emplacement des PPTX générés et validez la compatibilité DLP/IT.

Checklist UK avant mise en prod :
- Tester le deck généré sur PowerPoint corporate (Windows/Mac).
- Valider que les objets restent éditables et que les polices correspondent au template.
- Confirmer que le stockage et les accès respectent les règles DLP locales. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

## Comparatif US, UK, FR

- Observations générales : l'écosystème des skills PPTX sur GitHub est international. Le comportement « peindre les tableaux en images » est fréquent dans plusieurs contributions. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

- US : forte priorité sur CI/CD, monitoring des tokens consommés (ex. alarmes au delà de 20k tokens) et tests automatisés de rapidité.

- UK : mêmes priorités que US, plus validations spécifiques PowerPoint corporate et contrôles DLP/stockage.

- FR : ajouter des vérifs de localisation (libellés FR, formats date/nombre) et tester un deck localisé avant déploiement.

Colonnes utiles à suivre sur un tableau de bord : éditabilité, tokens par run, runtime (min), compatibilité PowerPoint corporate, support de localisation. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

## Notes techniques + checklist de la semaine

### Hypotheses / inconnues

- L'expérience rapportée a fait tourner 11 sous‑agents Claude sur le même brief et a normalisé les rendus via LibreOffice → PNG ; métriques citées : ~1,3M tokens totaux, ~60 min wall‑clock, SKILL.md jusqu'à ~82 000 tokens. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

- Hypothèse à valider localement : réduire un SKILL.md de ~82k → <10k tokens diminuera sensiblement coût et variance de runtime.

- Inconnue opérationnelle : différences précises de rendu (kerning, wrapping, padding) entre LibreOffice et la version PowerPoint du client final.

### Risques / mitigations

- Risque : tableaux rendus comme images (non éditables). Mitigation : test d'éditabilité automatisé + test manuel sur la diapo 4 avant approbation. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

- Risque : SKILL.md très long → coûts et lenteur. Mitigation : alerter si token_count > 20 000 ; extraire wrapper minimal (< 10 000 tokens) et retester. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

- Risque : non‑parité rendu LibreOffice vs PowerPoint corporate. Mitigation : valider sur client final et stocker captures avant approbation. (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)

### Prochaines etapes

Checklist hebdomadaire (prévoir 60–120 minutes par skill candidat) :

- [ ] Préparer votre brief réel (ex. pitch 5 diapositives).
- [ ] Cloner le repo du skill et exécuter SKILL.md une fois ; collecter stdout/stderr et erreurs.
- [ ] Exporter via votre pipeline (LibreOffice → PPTX ou PPTX natif) et ouvrir dans PowerPoint cible ; tenter d'éditer la diapo 4.
- [ ] Compléter la table de décision : editabilité (1–10), docs (1–10), runtime (min), token count, erreurs connues.
- [ ] N'approuver un skill que si critères internes satisfaits et 3 runs consécutifs sans erreur critique.
- [ ] Si SKILL.md > 20k tokens ou runtime > 10–30 min en continu : extraire un wrapper minimal et retester.

Référence complète : Serge Bulaev — "I Had 11 AI Subagents Test Every PPTX Skill for Claude Code". (https://www.bulaev.net/p/i-had-11-ai-subagents-test-every)
