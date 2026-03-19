---
title: "Tour of Agents : cours navigateur en 9 leçons pour comprendre une boucle d'agent minimal en ~60 lignes Python"
date: "2026-03-19"
excerpt: "Un cours interactif et court (exécuté dans le navigateur via Pyodide) qui implémente, leçon après leçon, une boucle d'agent minimale : appels d'outils, mémoire, état, règles (policy gates) et auto-planification. Mode mock gratuit ou option Groq pour LLM en direct."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-19-tour-of-agents-9-lesson-browser-run-course-that-implements-a-minimal-ai-agent-in-60-lines-of-python.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "beginner"
timeToImplementMinutes: 30
editorialTemplate: "TUTORIAL"
tags:
  - "AI"
  - "agents"
  - "python"
  - "pyodide"
  - "groq"
  - "éducation"
  - "développement"
sources:
  - "https://news.ycombinator.com/item?id=47426730"
---

## TL;DR en langage simple

- Quoi : un cours interactif et court qui montre, pas à pas, comment fonctionne un agent d'IA minimal. (Source : https://news.ycombinator.com/item?id=47426730)
- Durée : ~30 minutes. 9 courtes leçons. Environ 60 lignes de Python.
- Exécution : tourne dans le navigateur (Pyodide). Mode "mock" instantané et gratuit. Pas d'inscription nécessaire. Pour du live, on peut brancher une clé Groq. (Source : https://news.ycombinator.com/item?id=47426730)

Points clés rapides :

- Ouvrez le post Hacker News et suivez le lien vers le dépôt GitHub. (Source : https://news.ycombinator.com/item?id=47426730)
- Lancez la démo en mode mock. Parcourez les leçons 1→9.
- Exportez le script final (~60 lignes) pour l'étudier hors ligne.

Exemple concret :
- Scénario : Alice, développeuse solo, ouvre la démo en mode mock pendant 30 minutes. Elle suit les 9 leçons, exporte le script et ajoute un outil factice pour voir comment l'agent appelle un outil et met à jour sa mémoire.

Remarque rapide : le cours met en lumière la boucle centrale (AgentExecutor), implémentée progressivement comme une simple boucle while. Vous verrez comment se construisent appel d'outils, mémoire et règles. (Source : https://news.ycombinator.com/item?id=47426730)

## Ce que vous allez construire et pourquoi c'est utile

### Résultat concret

Vous exécuterez et lirez une implémentation incrémentale d'un "agent" d'IA. Le parcours comprend 9 leçons et ~60 lignes de Python. Tout fonctionne dans le navigateur via la démo liée sur Hacker News. (Source : https://news.ycombinator.com/item?id=47426730)

### Pourquoi c'est utile

- Voir la boucle de contrôle en clair aide à comprendre le flux décisionnel. La boucle centrale s'appelle AgentExecutor.
- L'apprentissage par étapes permet d'associer chaque concept à son effet pratique : appel d'outils, mémoire, état, règles (policy gates), auto‑planification.
- Le mode mock gratuit permet d'itérer sans coût avant d'ajouter une clé API pour réponses réelles.

(Source : https://news.ycombinator.com/item?id=47426730)

## Avant de commencer (temps, cout, prerequis)

- Temps estimé : ~30 minutes pour le parcours rapide (9 leçons). (Source : https://news.ycombinator.com/item?id=47426730)
- Coût : mode mock = gratuit. Mode live peut requérir une clé Groq (la démo mentionne la possibilité d'utiliser une clé Groq gratuite). (Source : https://news.ycombinator.com/item?id=47426730)
- Prérequis : savoir lire un court script Python. Un navigateur moderne (Chrome, Firefox, Edge, Safari) est nécessaire pour exécuter la démo. (Source : https://news.ycombinator.com/item?id=47426730)

Checklist de préparation :

- [ ] Avoir un navigateur moderne.
- [ ] Ouvrir le post Hacker News et le dépôt GitHub : https://github.com/ahumblenerd/tour-of-agents (lié depuis le post). (Source : https://news.ycombinator.com/item?id=47426730)
- [ ] (Optionnel) Récupérer une clé Groq gratuite si vous voulez tester le mode live.

## Installation et implementation pas a pas

Suivez ces étapes pour lancer la démo dans votre navigateur et inspecter le code. (Source : https://news.ycombinator.com/item?id=47426730)

1) Ouvrez le post Hacker News et suivez le lien vers le dépôt du projet. (Source : https://news.ycombinator.com/item?id=47426730)

2) Pour une copie locale, clonez et servez :

```bash
# clone le dépôt pour une copie locale
git clone https://github.com/ahumblenerd/tour-of-agents.git
cd tour-of-agents
python -m http.server 8000
# puis ouvrir http://localhost:8000
```

- Explication : ces commandes récupèrent le code puis lancent un serveur HTTP simple. Ouvrez ensuite l'URL indiquée dans votre navigateur.

3) Ouvrez la démo dans le navigateur. Commencez en mode mock (instantané, 0 €). Parcourez les leçons 1→9. Chaque leçon ajoute un concept et montre son effet dans la boucle.

4) Inspectez la boucle AgentExecutor (la boucle while). Chaque leçon ajoute : appel d'outils, mémoire, état, règles (policy gates), auto‑planification. Regardez comment la logique évolue au fil des leçons. (Source : https://news.ycombinator.com/item?id=47426730)

5) Pour le mode live, ajoutez une clé Groq dans la configuration. Exemple de fragment JSON utilisé par la démo :

```json
{
  "mode": "live",
  "provider": "groq",
  "api_key": "<VOTRE_CLE_GROQ_GRATUITE_ICI>"
}
```

- Explication : remplacez <VOTRE_CLE_GROQ_GRATUITE_ICI> par votre clé. Vérifiez la console du navigateur si rien ne se passe (erreurs réseau/CORS, clé invalide).

6) Exportez le script final (~60 lignes) comme référence. Vous pourrez l'exécuter ensuite dans un runtime serveur si vous voulez passer du prototype au prototype serveur.

## Problemes frequents et correctifs rapides

Remèdes courts pour les problèmes courants lors de l'utilisation de la démo dans le navigateur. (Source : https://news.ycombinator.com/item?id=47426730)

- La page bloque au chargement de la démo
  - Action : recharger (Ctrl/Cmd+Shift+R), vider le cache, ou essayer un autre navigateur.

- Les réponses live n'apparaissent pas après ajout de la clé
  - Action : vérifier la clé, consulter la console pour erreurs réseau/CORS, relancer la leçon.

- Différences mock vs live
  - Action : enregistrer les transcriptions. Exécuter les mêmes prompts en mock et en live pour comparer les comportements.

- Difficile de suivre la boucle
  - Action : ajoutez des prints/logs dans la boucle while pour afficher prompts, appels d'outils et mises à jour mémoire.

Tableau comparatif rapide (mock vs live) :

| Aspect | Mock | Live |
|---|---:|---:|
| Coût | 0 € | dépend du fournisseur (clé requise) |
| Démarrage | instantané | nécessite clé API |
| Réalisme | simulé | réponses LLM (large language model) réelles |
| Risque exposé | faible | attention aux clés côté client |

(Source : https://news.ycombinator.com/item?id=47426730)

## Premier cas d'usage pour une petite equipe

Conseils concis et actionnables pour un fondateur solo ou une petite équipe (1–3 personnes).

1) Session découverte (30–90 minutes)
   - Objectif : parcourir les 9 leçons en mode mock.
   - Livrable : exporter le script final (~60 lignes). (Source : https://news.ycombinator.com/item?id=47426730)

2) Trois expériences rapides à faire après la lecture
   - A. Ajouter 1 outil factice (toy tool) et observer 3 runs consécutifs pour mesurer comportement et variance.
   - B. Exécuter 10 prompts types en mock puis en live et comparer les sorties (transcrire différences).
   - C. Instrumenter la boucle avec 5 logs clés : entrée prompt, décision, outil appelé, mémoire mise à jour, action finale.

3) Règles opérationnelles minimales pour une petite équipe
   - Ne pas exposer de clés API privées dans une démo publique. Utiliser une clé test ou un backend pour les appels live.
   - Fixer un budget d'expérimentation : mode mock = 0 €, prévoir un plafond live initial (par ex. 20 $) pour éviter surprises.
   - Définir un critère d'acceptation simple : > 80 % de réponses acceptables sur un jeu de 10–30 prompts avant migration en production.

Livrables attendus : script exporté (~60 lignes), 10–30 prompts de validation, logs basiques, comparaison mock vs live. (Source : https://news.ycombinator.com/item?id=47426730)

## Notes techniques (optionnel)

Plain-language explanation (avant les détails avancés) :
- L'idée centrale est simple. L'agent exécute une boucle. À chaque itération, il réfléchit, éventuellement appelle un outil, met à jour sa mémoire, puis agit. La démo montre comment assembler ces pièces une à une.

Détails techniques (succincts) :

- Pattern central : une boucle while (AgentExecutor) orchestre réflexion → appel d'outils → mise à jour mémoire → action. L'exercice montre cela dans un Python minimal. (Source : https://news.ycombinator.com/item?id=47426730)
- Runtime : la démo est exécutable dans le navigateur via Pyodide, ce qui évite toute installation locale lourde. (Source : https://news.ycombinator.com/item?id=47426730)
- Composants introduits progressivement : interfaces d'outils, mémoire, persistance d'état, policy gates (règles de filtrage de politique), self‑scheduling (auto‑planification). (Source : https://news.ycombinator.com/item?id=47426730)

Sécurité : pour toute utilisation au‑delà de l'expérimentation, ne laissez pas de clés privées dans le client. Migrez les appels sensibles vers un backend sécurisé.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Les items suivants sont des hypothèses opérationnelles à valider en test :
  - Pour un canary, exposer 5 % des runs.
  - Taille du jeu de validation initial : 10–30 prompts par fonctionnalité.
  - Latence médiane cible en production : < 2 000 ms (2 s).
  - Taux d'erreur acceptable cible : < 1 % de réponses inacceptables.
  - Budget d'expérimentation pour prototypage live initial : 20–100 $.
  - Temps d'itération par cycle prototype : 60–90 minutes.

(Méthodologie : ces hypothèses doivent être validées par des tests réels; elles ne proviennent pas toutes du post mais permettent d'orienter l'expérimentation.)

### Risques / mitigations

- Risque : confondre comportement mock et live.
  - Mitigation : conserver des transcriptions et exécuter les mêmes prompts en mock et en live pour comparer.

- Risque : exposer clés API côté client.
  - Mitigation : utiliser clés éphémères, limiter permissions, ou déplacer les appels vers un backend sécurisé.

- Risque : dépendre d'un runtime navigateur pour la production.
  - Mitigation : porter la boucle AgentExecutor sur un runtime serveur, ajouter logs et monitoring, et sécuriser les accès.

### Prochaines etapes

- Exécuter la démo en mode mock maintenant (lien : https://news.ycombinator.com/item?id=47426730).
- Construire un jeu de validation de 10–30 prompts et l'exécuter en mock puis en live pour comparaison.
- Exporter le script Python final (~60 lignes) et documenter le comportement attendu par leçon.
- Si les résultats live sont satisfaisants, migrer la boucle côté serveur, sécuriser les clés, ajouter observabilité et définir seuils de latence/taux d'erreur.

Sources principales

- Post Hacker News récapitulant le cours : https://news.ycombinator.com/item?id=47426730
- Dépôt mentionné dans le post : https://github.com/ahumblenerd/tour-of-agents
