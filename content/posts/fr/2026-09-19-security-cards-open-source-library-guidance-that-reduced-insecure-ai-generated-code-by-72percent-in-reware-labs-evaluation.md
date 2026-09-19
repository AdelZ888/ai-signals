---
title: "Security Cards : guidance open-source par librairie qui a réduit de 72 % le code vulnérable généré par IA (évaluation Reware Labs)"
date: "2026-09-19"
excerpt: "Les Security Cards open-source fournissent aux agents de codage IA des conseils de sécurité courts et spécifiques à la librairie (80+ librairies, 13 langages). Reware Labs a observé jusqu’à 72,3 % de sorties moins vulnérables dans son évaluation."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-19-security-cards-open-source-library-guidance-that-reduced-insecure-ai-generated-code-by-72percent-in-reware-labs-evaluation.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 45
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "sécurité"
  - "développement"
  - "agents-IA"
  - "Reware Labs"
  - "DevSecOps"
sources:
  - "https://www.rewarelabs.com/blog/introducing-security-cards/"
---

## TL;DR en langage simple

- Security Cards sont des fiches de bonnes pratiques ciblées, open-source, conçues pour guider des agents de codage basés sur l'IA (voir l'annonce : https://www.rewarelabs.com/blog/introducing-security-cards/).
- Couverture déclarée : 80+ librairies et 13 langages; sans guidance, 40–50 % des extraits générés peuvent contenir au moins une vulnérabilité selon l'annonce.
- Résultat mesuré (exemple cité) : réduction relative du code vulnérable jusqu'à 72,3 % avec Claude Code (Opus 4.7) quand les Security Cards sont utilisées.
- Premier pas rapide : installer la skill et comparer sorties baseline vs cartes sur un petit jeu de prompts.

Concret : si vous utilisez un agent pour générer un endpoint d'authentification, l'ajout d'une Security Card spécifique à la librairie d'auth réduit fortement les risques de patterns vulnérables et d'erreurs d'implémentation (https://www.rewarelabs.com/blog/introducing-security-cards/).

## Ce que vous allez construire et pourquoi c'est utile

Ce que vous allez faire : intégrer les Security Cards comme couche de guidance pour votre agent IA (skill ou injection de prompt). L'objectif est de réduire les erreurs liées à des détails d'implémentation spécifiques à une librairie.

Pourquoi c'est utile (faits extraits) :
- Couverture ciblée : 80+ librairies, 13 langages (https://www.rewarelabs.com/blog/introducing-security-cards/).
- Problème adressé : 40–50 % d'exemples produits par agents IA peuvent contenir au moins une vulnérabilité sans guidance (https://www.rewarelabs.com/blog/introducing-security-cards/).
- Impact mesuré : réduction relative jusqu'à 72.3 % dans l'étude citée (Claude Code / Opus 4.7) (https://www.rewarelabs.com/blog/introducing-security-cards/).

Ce que vous mesurerez pendant un pilote : taux vulnérable baseline, taux vulnérable après injection des cartes; garder les mêmes prompts et critères d'analyse pour assurer comparabilité (méthodologie : conserver prompts et métriques constants — voir https://www.rewarelabs.com/blog/introducing-security-cards/).

## Avant de commencer (temps, cout, prerequis)

Prérequis techniques minimaux :
- Accès au dépôt Security Cards (site public / GitHub) et capacité à ajouter une "skill" ou modifier le prompt envoyé à l'agent (https://www.rewarelabs.com/blog/introducing-security-cards/).
- Outil d'analyse pour vérifier la sécurité du code (SAST ou revue humaine).

Checklist rapide avant pilote :
- [ ] Lire l'annonce et le dépôt Security Cards (https://www.rewarelabs.com/blog/introducing-security-cards/)
- [ ] Vérifier que vous pouvez modifier le payload/prompt envoyé au modèle
- [ ] Identifier 1–3 librairies critiques couvertes par les cartes

Estimations (à valider en pilote) :
- Installation initiale simple : 30–60 minutes.
- Pilote utile : 1 jour (sanity-check) à 1–2 semaines (collecte plus large).
- Taille minimale d'un jeu de prompts exploitables : 20–50 prompts; 5–15 prompts pour un quick check.

Source principale : https://www.rewarelabs.com/blog/introducing-security-cards/

## Installation et implementation pas a pas

Résumé : ajouter la skill, injecter le texte des cartes dans le prompt, exécuter baseline vs cartes, analyser via SAST ou revue.

1) Installer la skill (commande citée par l'annonce)

```bash
npx skills add Reware-Labs/securitycards --skill securitycards -g
```

(Adaptez si votre agent n'utilise pas npx/skills — voir repo/annonce : https://www.rewarelabs.com/blog/introducing-security-cards/.)

2) Exemple minimal de configuration (YAML) — adaptez au format de votre agent

```yaml
agent:
  name: my-code-agent
  skills:
    - name: securitycards
      source: Reware-Labs/securitycards
      enabled: true
  skill_injection: prompt
  verbosity: info
```

3) Méthode de test simple
- Exécuter la même suite de prompts sans cartes (baseline).
- Exécuter la même suite avec cartes activées.
- Analyser sorties avec SAST ou revue humaine, conserver métriques identiques.

Tableau synthétique (valeurs issues de l'annonce) :

| Métrique | Valeur citée | Source |
|---|---:|---|
| Couverture déclarée | 80+ librairies | https://www.rewarelabs.com/blog/introducing-security-cards/ |
| Langages | 13 | https://www.rewarelabs.com/blog/introducing-security-cards/ |
| Taux vulnérable (baseline) | 40–50% | https://www.rewarelabs.com/blog/introducing-security-cards/ |
| Réduction observée | 72.3% (relatif) | Claude Code (Opus 4.7) — https://www.rewarelabs.com/blog/introducing-security-cards/ |

4) Déploiement progressif
- Commencez localement ou sur un canary (ex. 10% des PRs).
- Vérifiez que la guidance apparaît dans les logs et payloads envoyés au modèle.

## Problemes frequents et correctifs rapides

Symptômes et actions :

- L'agent n'utilise pas la guidance
  - Confirmer que la skill est installée et activée (commande d'installation ci‑dessus).
  - Inspecter le payload — la carte doit apparaître dans le prompt envoyée au modèle (https://www.rewarelabs.com/blog/introducing-security-cards/).

- Guidance incomplète pour votre version de librairie
  - Vérifier la couverture dans le dépôt Security Cards; ouvrir issue/PR si manquant.

- Patterns vulnérables persistent
  - Ajouter des tests SAST et des règles bloquantes en CI; exiger passage des tests avant merge.

Checklist de dépannage :
- [ ] Guidance présente dans le payload ?
- [ ] Librairie couverte par les cartes ?
- [ ] Tests automatiques détectent le pattern critique ?

Source et référence : https://www.rewarelabs.com/blog/introducing-security-cards/

## Premier cas d'usage pour une petite equipe

Objectif : valider rapidement l'impact sur un flux critique (auth, gestion de mots de passe, parsing d'entrées externes). Voir le dépôt pour la couverture : https://www.rewarelabs.com/blog/introducing-security-cards/.

Processus recommandé pour solo founders / petites équipes (1–3 personnes) — actions concrètes et actionnables :

1) Prioriser un seul module critique (1 fichier ou 1 endpoint) couvert par les cartes.
   - Temps ciblé : 30–60 minutes pour installer la skill et préparer 5–15 prompts de sanity-check.

2) Exécuter un pilote rapide en 1 jour : baseline vs cartes.
   - Collecter 20–50 prompts si vous voulez des résultats statistiquement plus robustes; pour un quick win, 5–15 prompts suffisent.
   - Mesurer : nombre d'extraits vulnérables avant/après (ex. 10/30 -> 3/30 = -70% relatif).

3) Automatiser un check minimal dans CI en 1–2 heures :
   - Ajouter un SAST léger ou une règle de test unitaire qui détecte le pattern critique.
   - Requérir que le test passe pour merges sur la branche principale.

4) Réduire les coûts et le bruit :
   - Limiter les runs du modèle aux prompts à haut risque (10% des prompts) et regrouper runs batch pour économiser tokens.
   - Surveiller consommation (tokens) et définir un budget quotidien ou hebdomadaire.

5) Itérer et contribuer :
   - Si la carte manque ou est incomplète, ouvrir une issue/PR sur le repo Security Cards (https://www.rewarelabs.com/blog/introducing-security-cards/).

Ces étapes permettent à une équipe de 1–3 personnes d'obtenir une preuve d'impact en 1 jour à 1 semaine et d'industrialiser ensuite si l'effet est positif (réduction relative visée, ex. 50–70%).

## Notes techniques (optionnel)

Points clés extraits de l'annonce :
- Les Security Cards fournissent une guidance spécifique à la librairie pour aider les agents IA à générer du code plus sûr (https://www.rewarelabs.com/blog/introducing-security-cards/).
- Couverture initiale : 80+ librairies, 13 langages; étude rapportée : réduction jusqu'à 72,3 % du taux de code vulnérable sur Claude Code (Opus 4.7) (https://www.rewarelabs.com/blog/introducing-security-cards/).

Implémentation technique courte : injectez le texte des cartes dans le prompt ou montez la skill comme plugin. Vérifiez que la taille du contexte (tokens) reste raisonnable pour votre modèle — factorisez cartes longues et n'injectez que les sections pertinentes.

Méthodologie recommandée (remarque brève) : comparez baseline et test avec les mêmes prompts et critères pour mesurer l'impact de façon fiable (https://www.rewarelabs.com/blog/introducing-security-cards/).

## Que faire ensuite (checklist production)

- [ ] Installer la skill Security Cards et lancer un smoke test local (https://www.rewarelabs.com/blog/introducing-security-cards/)
- [ ] Mesurer et consigner les taux vulnérables avant/après (valeurs absolues et pourcentages)
- [ ] Définir un critère de succès pour le pilote (par ex. réduction relative visée de 50 % ou 70 %)
- [ ] Mettre en place des tests bloquants pour patterns critiques en CI
- [ ] Contribuer au dépôt si vous trouvez des manques (issues / PR)

### Hypotheses / inconnues

- Durée d'installation initiale estimée : 30–60 minutes pour une configuration simple.
- Temps pour un pilote utile : 1 jour (sanity-check) à 1–2 semaines (collecte plus large).
- Volume de prompts pour évaluation exploitable : 20–50 prompts; 5–15 prompts pour un quick-check.
- Canary initial recommandé : 10% des PRs.
- Coûts en tokens / dollars : variables selon fournisseur; surveiller consommation et fixer un budget quotidien/hebdomadaire.

Voir le dépôt principal pour la guidance et la source : https://www.rewarelabs.com/blog/introducing-security-cards/

### Risques / mitigations

- Risque : cartes obsolètes ou non pertinentes pour votre version de librairie.
  - Mitigation : piner la version de la dépendance, ouvrir issue/PR sur le repo Security Cards.
- Risque : le modèle n'applique pas la guidance.
  - Mitigation : vérifier inclusion de la guidance dans le payload, tester différentes stratégies d'injection, ajouter checks CI bloquants.
- Risque : coût élevé en tokens.
  - Mitigation : prioriser prompts à fort risque, grouper runs, utiliser canary (10% PRs) avant roll‑out complet.
- Risque : fuite de données sensibles via prompts.
  - Mitigation : anonymiser/synthétiser données de test avant envoi au modèle.

### Prochaines etapes

1) Installation rapide et smoke test :

```bash
npx skills add Reware-Labs/securitycards --skill securitycards -g
```

2) Lancer un pilote comparatif baseline vs cartes (collecter 20–50 prompts si possible).
3) Définir le critère de succès (ex. réduction relative visée de 50%–70%).
4) Déployer en canary (ex. 10% des PRs) et monitorer 1–2 semaines.
5) Ouvrir issues/PR pour améliorer les cartes manquantes et contribuer au repo : https://www.rewarelabs.com/blog/introducing-security-cards/

Référence principale : https://www.rewarelabs.com/blog/introducing-security-cards/.
