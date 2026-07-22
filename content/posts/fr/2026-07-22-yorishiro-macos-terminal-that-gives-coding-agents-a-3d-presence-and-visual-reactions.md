---
title: "Yorishiro — donner une présence 3D aux agents de codage (terminal macOS) : guide pratique"
date: "2026-07-22"
excerpt: "Exécutez localement Yorishiro pour expérimenter une interface où un « agent » visuel réagit aux états de build. Ce guide explique pas à pas comment démarrer, quelles vérifications faire et quelles hypothèses valider dans le dépôt GitHub."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-22-yorishiro-macos-terminal-that-gives-coding-agents-a-3d-presence-and-visual-reactions.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "yorishiro"
  - "terminal"
  - "ai"
  - "macOS"
  - "développeurs"
  - "open-source"
  - "UX"
sources:
  - "https://github.com/sktkkoo/Yorishiro"
---

## TL;DR en langage simple

- Le projet existe sur GitHub : https://github.com/sktkkoo/Yorishiro.
- Description officielle trouvée dans le dépôt : « a terminal that gives AI a body and a living space. » Cette phrase est confirmée sur la page du dépôt.
- Avant d'exécuter quoi que ce soit, lisez le README du dépôt. Le README est la source de vérité pour les commandes et les exigences.
- Pourquoi tester rapidement : une interface visuelle locale permet souvent de repérer une erreur plus vite qu'en lisant uniquement des logs.
- Durées indicatives (à valider) : 5–20 min pour lire le README, 15–90 min pour lancer une démo, 30–120 min pour un prototype simple.

Exemple concret rapide :
- Scénario : vous voulez qu'une petite LED ou un avatar change de couleur quand un build échoue. Prototype : cloner le dépôt, lancer la démo locale, créer un petit "watcher" qui détecte la chaîne "BUILD FAILED" dans la sortie d'un script et déclenche un visuel. Gardez tout local pour éviter d'impacter des pipelines partagés.

## Ce que vous allez construire et pourquoi c'est utile

Explication simple avant les détails avancés :
- Ce document décrit comment explorer et tester localement le projet Yorishiro trouvé sur GitHub. Il explique comment lancer une démo, chercher des exemples et prototyper un déclencheur visuel. Il ne prétend pas remplacer le README du dépôt. Vérifiez toujours le dépôt pour les commandes exactes.

Vous allez : cloner le dépôt https://github.com/sktkkoo/Yorishiro, lire le README, et essayer de lancer la démonstration locale. Si le dépôt contient des packs ou des exemples, vous créerez un petit watcher local. Ce watcher surveillera la sortie d'une commande et déclenchera une réaction visuelle (par exemple : flash, changement d'expression, scène).

Pourquoi c'est utile :

- Repérage rapide : un signal visuel attire l'attention plus vite que des logs. Cela réduit le temps pour reconnaître un problème (time‑to‑acknowledge).
- Faible friction : prototyper local évite d'affecter les pipelines CI (CI = intégration continue / Continuous Integration).
- Réutilisable : le motif "écoute → déclenchement" s'applique à des builds, tests et petites alertes locales.

Remarque importante : l'extrait public confirme l'existence du dépôt et sa description. Les détails sur les packs, l'API et les scripts doivent être validés dans le README du dépôt : https://github.com/sktkkoo/Yorishiro.

## Avant de commencer (temps, cout, prerequis)

Temps estimé (exemples, à valider dans le README) :

- Lecture du README : 5–20 minutes.
- Installation et lancement d'une démo : 15–90 minutes.
- Prototype d'un watcher local : 30–120 minutes.

Coûts :

- $0 si tout reste en local avec le code open‑source.
- Des coûts peuvent apparaître si vous utilisez un LLM (modèle de grande taille, Large Language Model) payant ou des GPU (processeurs graphiques, Graphics Processing Unit) dans le cloud.

Prérequis minimaux :

- Git et accès réseau pour cloner le dépôt.
- Confort de base en terminal (exécuter des scripts, éditer des fichiers).
- Machine avec CPU (processeur central, Central Processing Unit) suffisante. Si la démo utilise rendu graphique, prévoir une machine de test avec une marge de charge.

Checklist rapide avant d'exécuter :

- [ ] Ouvrir la page du dépôt et lire le README : https://github.com/sktkkoo/Yorishiro
- [ ] Vérifier les dépendances et scripts mentionnés dans le README
- [ ] Préparer un dossier ./local-packs/ pour expérimentations locales (si pertinent)

## Installation et implementation pas a pas

1) Cloner le dépôt

```bash
git clone https://github.com/sktkkoo/Yorishiro.git
cd Yorishiro
```

2) Lire le README et les exemples

- Le README du repo est l'autorité pour les commandes exactes de build et de démarrage.

3) Installer dépendances et lancer (exemple générique)

- Les commandes ci‑dessous sont un exemple générique. Adaptez-les selon le README ou package.json du dépôt.

```bash
# exécuter les commandes listées dans le README ou package.json
npm install
npm run build && npm run start
```

4) Rechercher les packs / exemples

- Cherchez des dossiers example/, packs/ ou docs/ dans l'arborescence.
- Si vous trouvez un dossier d'exemples, lisez-les avant de modifier quoi que ce soit.

5) Prototyper un watcher local

- Créez ./local-packs/ et placez-y un fichier de test. Gardez tout local pour pouvoir revenir en arrière.
- Le format exact des packs dépendra du dépôt (JSON, YAML, JS). Validez dans le README.

6) Test simple d'intégration

- Écrivez un script qui émet une ligne de test (ex. "BUILD FAILED") et observez la réaction visuelle.

Conseils de débogage rapide

- Relisez le README.
- Augmentez la verbosité des logs si possible.
- Consultez les issues ouvertes du dépôt pour erreurs connues.

## Problemes frequents et correctifs rapides

Commencez par le README et les issues sur GitHub : https://github.com/sktkkoo/Yorishiro.

Problèmes fréquents et actions rapides :

- L'application ne démarre pas : réinstallez les modules et vérifiez les dépendances natives. Nettoyez node_modules si nécessaire.
- Le watcher ne réagit : vérifiez la casse, les espaces et l'emplacement du fichier de pack. Testez avec une ligne exacte courte.
- Forte consommation CPU/GPU (> 80% CPU ou > 70% GPU) : cherchez un mode basse consommation ou headless dans le README.

Commandes utiles (exemples) :

```bash
# suivre un log local (adapter le chemin)
tail -n 200 -f logs/yorishiro.log

# rebuild & restart (adapter selon package.json)
npm run build && npm run start
```

Si le problème persiste : ouvrez une issue sur le dépôt avec 3–5 logs utiles (200–2000 lignes selon le cas).

## Premier cas d'usage pour une petite equipe

Public ciblé : fondateurs seuls et petites équipes (1–5 personnes) qui veulent une alerte visuelle locale.

Actions concrètes pour un fondateur solo / petite équipe :

1) Setup minimal (30–120 minutes) : cloner le dépôt, lire le README, lancer la démo locale et vérifier qu'elle démarre.
2) Créer 1 watcher local (≈ 30 minutes) : placer un fichier dans ./local-packs/ qui matche exactement une chaîne d'erreur (ex. "BUILD FAILED"). Tester avec un script qui imprime la ligne.
3) Protection et rollback : gardez vos packs hors du dépôt principal. Travaillez sur une branche feature/local-packs. Préparez un rollback simple (supprimer ./local-packs/ ou désactiver le watcher).
4) Mesure pragmatique : pendant 2–4 semaines, mesurez le time‑to‑acknowledge (objectif initial < 60 s) et le taux de faux positifs (viser < 10% au pilote).

Checklist pour un pilote (3–5 personnes) :

- [ ] Cloner et lancer la démo (voir README)
- [ ] Ajouter 1 watcher local et tester
- [ ] Valider la latence d'alerte (objectif < 500 ms pour la détection locale)
- [ ] Piloter 2–4 semaines et collecter métriques

Note : validez les commandes et le format des packs dans le README du dépôt : https://github.com/sktkkoo/Yorishiro.

## Notes techniques (optionnel)

Point de départ confirmé : le repo existe et contient la description "a terminal that gives AI a body and a living space." Voir : https://github.com/sktkkoo/Yorishiro.

Points à vérifier dans le code (liste de contrôle) :

- Format des packs : JSON, YAML ou JS ? (à confirmer dans les exemples du dépôt).
- API d'extension et hooks disponibles.
- Modes d'exécution headless ou basse qualité pour limiter la charge CPU/GPU.

Exemple illustratif de configuration (à adapter selon le format réel)

```json
{
  "name": "local-build-reflex",
  "watch": { "pattern": "BUILD FAILED", "action": "scene.flashRed" },
  "persona": { "name": "BuilderBot", "verbosity": 2 }
}
```

Comparaison rapide (décision simple) :

| Mode       | Usage cible       | Charge CPU cible | Taille du rollout |
|------------|-------------------|------------------:|------------------:|
| Local      | Prototype solo    | < 50%            | 1 personne        |
| Pilote     | Petite équipe     | < 80%            | 3–5 personnes     |
| Production | Intégration large | monitoring requis | rollout progressif|

Opérations et sécurité :

- Ne mettez pas de clés en clair dans les fichiers. Utilisez des variables d'environnement ou un gestionnaire de secrets.
- Prévoir un bouton ON/OFF pour désactiver le rendu visuel sur des postes sensibles.

## Que faire ensuite (checklist production)

Suivre la documentation du dépôt et valider chaque étape en environnement contrôlé.

- [ ] Lire le README du dépôt et identifier scripts de build/start : https://github.com/sktkkoo/Yorishiro
- [ ] Créer ./local-packs/ et stocker les expérimentations localement
- [ ] Mesurer latence et faux positifs pendant 2–4 semaines
- [ ] Mettre en place revue de PR pour packs partagés
- [ ] Préparer playbook de rollback et d'activation

Rollout / rollback (plan résumé) :

1) Canary : déployer le watcher à 1 personne pendant 48–72 h. Vérifier charge CPU < 80% et latence de détection < 500 ms.
2) Gates : si les métriques restent stables (fausses alertes < 10%, CPU < 80%), étendre à 10% des équipes pendant 7 jours.
3) Full rollout : monter à 100% en vagues (25% → 50% → 100%).
4) Rollback : si régression (p.ex. CPU > 90% ou faux positifs > 30%), désactiver le watcher global en < 10 minutes et revenir à la configuration précédente.

### Hypotheses / inconnues

- Le repo contient des packs/examples et une démo UI interactive : hypothèse à valider dans le README et les dossiers du repo.
- Format exact des packs (JSON/YAML/JS) et noms de scripts CLI : hypothèse — inspecter package.json et les exemples.
- Indicateurs chiffrés (latence < 500 ms, faux positifs < 10%, CPU < 80%) sont des objectifs proposés et non des garanties fournies par le projet.

### Risques / mitigations

- Risque : commit accidentel de secrets. Mitigation : .gitignore, hooks pre-commit, gestionnaire de secrets.
- Risque : surcharge CPU/GPU. Mitigation : activer mode basse consommation/headless et limiter rendu sur postes sensibles.
- Risque : faux positifs trop nombreux. Mitigation : affiner les patterns, ajouter conditions contextuelles, exécuter une phase pilote restreinte.

### Prochaines etapes

1) Ouvrir la page du dépôt et lire le README immédiatement : https://github.com/sktkkoo/Yorishiro
2) Cloner et lancer la démo locale. Documenter les scripts utilisés (nom et durée en secondes).
3) Créer ./local-packs/ et un watcher de test. Mesurer la latence et la charge pendant 48–72 h.
4) Lancer un pilote 3–5 personnes pendant 2–4 semaines. Collecter time‑to‑acknowledge, taux de faux positifs et charge CPU.
5) Si les résultats sont satisfaisants, formaliser la gouvernance (revues de PR, contrôle des secrets, guide de déploiement) et préparer le rollout par canary/gates.

Méthodologie : ce document s'appuie sur l'extrait public du dépôt pour confirmer son existence et sa description. Tous les autres éléments techniques et chiffrés sont fournis comme hypothèses ou recommandations à valider dans le code source et le README du dépôt.
