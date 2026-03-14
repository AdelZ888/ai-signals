---
title: "predicate-secure : wrapper Python (3–5 lignes) pour vérification déterministe et fail-closed des actions d'agents IA"
date: "2026-03-14"
excerpt: "Wrapper Python drop-in qui impose une boucle de sécurité en trois phases : autorisation locale via YAML (fail‑closed), exécution de l'action, et vérification post‑exécution déterministe. Intégration annoncée en 3–5 lignes."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-14-predicate-secure-3-5-line-python-wrapper-for-fail-closed-deterministic-pre-and-post-verification-of-ai-agent-actions.jpg"
region: "UK"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "sécurité"
  - "python"
  - "agents"
  - "verification"
  - "LLM"
sources:
  - "https://news.ycombinator.com/item?id=47365599"
---

## TL;DR en langage simple

- predicate-secure est un wrapper Python « drop-in » qui ajoute une vérification déterministe aux agents d'automatisation (source: https://news.ycombinator.com/item?id=47365599).
- Il impose une boucle en 3 étapes : pré‑autorisation locale contre une politique YAML, exécution de l'action, puis vérification mathématique des changements (avant / après) (source: https://news.ycombinator.com/item?id=47365599).
- L'intégration annoncée tient en 3–5 lignes de code ; un LLM local (Qwen 2.5 7B Instruct) est mentionné pour générer les prédicats à partir du diff, mais l'évaluation des prédicats est dite déterministe et s'exécute en millisecondes (source: https://news.ycombinator.com/item?id=47365599).

Résumé concret rapide : protéger un flux de paiement de test en autorisant explicitement "browser.click" sur "button#checkout" dans policies/shopping.yaml. Le wrapper contrôle l'action avant exécution et vérifie mathématiquement l'état après.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez encapsuler un agent Python existant (navigateur automatisé, workflow LangChain, etc.) avec predicate-secure pour :

- réduire le « blast radius » d'une action non voulue (par ex. navigation vers un domaine malveillant ou lecture d'un fichier sensible) ;
- produire une preuve locale et déterministe qu'une action a réussi (capture before/after + prédicats évalués localement) ;
- limiter l'usage du pattern « LLM-as-a-judge » coûteux et probabiliste (source: https://news.ycombinator.com/item?id=47365599).

Flux résumé (source: https://news.ycombinator.com/item?id=47365599) :
1. Pré‑autorisation locale — l'action projetée est comparée à une politique YAML (fail‑closed possible).
2. Exécution — l'agent exécute l'action via le framework existant (Playwright, browser-use, etc.).
3. Vérification post‑exécution — capture avant/après, diff, génération de prédicats via un LLM local (optionnel), puis évaluation déterministe des prédicats (p.ex. element_exists('#success'), url_contains('example.com')).

## Avant de commencer (temps, cout, prerequis)

Prérequis principaux (tirés de l'annonce) : https://news.ycombinator.com/item?id=47365599

- Python installé et environnement virtuel recommandé.
- Un agent existant construit avec un framework supporté (l'annonce mentionne 5 adaptateurs : browser-use, LangChain, PydanticAI, OpenClaw et Playwright).
- Un dossier policies/ avec des fichiers YAML de politique (mode fail‑closed recommandé).
- Optionnel : un LLM local (Qwen 2.5 7B Instruct) si vous souhaitez synthétiser des prédicats à partir du diff ; l'annonce précise que ce LLM sert uniquement à générer des prédicats et que l'évaluation est déterministe (source: https://news.ycombinator.com/item?id=47365599).

Note méthodologique : ce guide synthétise l'annonce publique liée ci‑dessus et propose une trajectoire POC pour équipes réduites.

## Installation et implementation pas a pas

Référence : https://news.ycombinator.com/item?id=47365599

1) Installer (exemple) :

```bash
# Installation exemple : predicate-secure + adaptateur browser-use
pip install predicate-secure predicate-secure-adapter-browser-use
```

2) Exemple minimal de politique YAML (fail‑closed) :

```yaml
# policies/shopping.yaml
mode: strict
rules:
  - allow:
      action: browser.click
      selector: "button#checkout"
  - deny:
      action: fs.read
      path_glob: "~/.ssh/*"
  - deny:
      action: navigation
      domain_whitelist:
        - example.com
```

3) Envelopper un agent (DX annoncé en 3–5 lignes) :

```python
from predicate_secure import SecureAgent
from browser_use import Agent

agent = Agent(task="Buy headphones on Amazon", llm=my_model)
secure_agent = SecureAgent(agent=agent, policy="policies/shopping.yaml", mode="strict")
secure_agent.run()
```

4) Stratégie de test et déploiement progressif (source: https://news.ycombinator.com/item?id=47365599) :
- Commencez en bac à sable ;
- Rédigez et stabilisez les politiques avant mise en production ;
- Ajoutez des tests d'intégration qui vérifient la génération et l'évaluation des prédicats ;
- Conservez des logs structurés pour chaque action et vérification.

## Problemes frequents et correctifs rapides

Basé sur les scénarios décrits dans l'annonce : https://news.ycombinator.com/item?id=47365599

- Politique trop permissive ou trop restrictive
  - Symptôme : actions non surveillées ou blocages injustifiés.
  - Correctif : conserver deny‑by‑default ; écrire des règles Allow précises (sélecteurs CSS ciblés, globbing explicite).

- Prédicats fragiles à cause d'éléments éphémères
  - Symptôme : vérifications qui échouent à cause de timestamps ou d'IDs dynamiques.
  - Correctif : normaliser ou nettoyer les snapshots avant le diff ; privilégier des prédicats stables.

- Problèmes d'adaptateur
  - Symptôme : l'adaptateur ne correspond pas exactement à votre agent.
  - Correctif : utiliser un adaptateur officiel si disponible, ou écrire un bridge léger qui adapte l'API.

- Latence de vérification
  - Symptôme : inquiétude sur l'impact UX.
  - Correctif : mesurer la latence réelle — l'annonce indique que l'évaluation des prédicats s'exécute en millisecondes ; faites un déploiement progressif (canary) pour vérifier en conditions réelles (source: https://news.ycombinator.com/item?id=47365599).

Tableau comparatif rapide (annonce vs pattern existant) :

| Pattern | Latence typique | Déterministe | Dépendance LLM | Commentaire |
|---|---:|---:|---:|---|
| LLM-as-a-judge | élevée (s) | non | cloud / large model | probabiliste, brûle des tokens (source: HN) |
| predicate-secure (annoncé) | basse (ms) | oui | LLM local optionnel pour génération de prédicats | évaluation locale déterministe, preuves before/after (source: HN) |

## Premier cas d'usage pour une petite equipe

Plan POC concret et conseils actionnables pour fondateurs solo / petites équipes (1–3 personnes). Source : https://news.ycombinator.com/item?id=47365599

Actionnable — étapes minimales :

1) Cibler un seul flux non critique (p.ex. un checkout de bac à sable ou un formulaire interne). Ne tentez pas tout de suite les parcours multi‑étapes externes.

2) Écrire des règles YAML minimalistes et précises : démarrez par 1–3 règles Allow ciblées (sélecteurs CSS précis, actions explicitement listées) et deny‑by‑default. Gardez policies/ en contrôle de version.

3) Envelopper l'agent en 3–5 lignes (DX annoncé) et lancer localement : vérifiez que le wrapper intercepte les commandes attendues et génère des logs structurés.

4) Automatiser un test de fumée simple (local ou CI) qui exécute le scénario et s'arrête si la vérification échoue. Conserver un artefact (snapshot before/after) pour chaque run.

5) Instrumenter métriques basiques : taux de vérification passée/échouée, latence médiane et 95e percentile (mesures à capturer dès le POC).

Conseils pratiques pour un fondateur solo :
- Gardez la surface d'attaque petite : 1 flux, 1 fichier de policy initial ;
- Versionnez policies/ et exigez PR pour toute modification ;
- Si vous manquez de GPU/CPU pour un LLM local, commencez sans synthèse LLM : définissez prédicats statiques dans les policies et itérez.

Checklist POC (exécutable) :
- [ ] Créer policies/shopping.yaml (deny‑by‑default)
- [ ] Installer predicate-secure et l'adaptateur requis
- [ ] Envelopper l'agent (3–5 lignes)
- [ ] Exécuter des runs en sandbox et collecter les logs
- [ ] Ajouter un test CI bloquant sur régression

(source: https://news.ycombinator.com/item?id=47365599)

## Notes techniques (optionnel)

Points techniques extraits de l'annonce : https://news.ycombinator.com/item?id=47365599

- LLM local mentionné : Qwen 2.5 7B Instruct (utilisé uniquement pour générer des prédicats à partir des diffs).
- Exécution déterministe : l'annonce affirme que l'évaluation des prédicats est purement mathématique et s'exécute en millisecondes.
- Adaptateurs listés : browser-use, LangChain, PydanticAI, OpenClaw et Playwright.

Exemple de log structuré (conserver pour traçabilité) :

```json
{
  "action": "browser.click",
  "selector": "button#checkout",
  "pre_auth": "allow",
  "snapshot_before": "...",
  "snapshot_after": "...",
  "predicates": ["element_exists('#success')"],
  "verification_result": "pass"
}
```

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Données explicitement mentionnées dans l'annonce : intégration en 3–5 lignes, LLM local Qwen 2.5 7B Instruct, évaluation des prédicats en millisecondes, adaptateurs pour 5 frameworks (source: https://news.ycombinator.com/item?id=47365599).
- Éléments opérationnels à valider pendant le POC (hypothèses à mesurer) :
  - durée POC cible : 1–3 jours ;
  - nombre de runs de validation initial : 10 runs ;
  - nombre initial de règles à rédiger : 3–5 règles ;
  - seuils de latence acceptables : médiane < 100 ms, 95e percentile < 200 ms ;
  - équipe pour POC : 1–3 personnes (fondateur + développeur/QA partagé + DevOps partagé).
- Ressources LLM local (CPU/GPU, stockage) : besoins à mesurer selon Qwen 2.5 7B Instruct.

### Risques / mitigations

- Risque : prédicats fragiles (DOM éphémère).
  - Mitigation : normaliser snapshots, supprimer champs dynamiques (timestamps, IDs), utiliser sélecteurs stables.
- Risque : performance non conforme en production.
  - Mitigation : canary deploy, mesurer latence (médiane et 95e percentile), définir alertes et rollback automatique.
- Risque : dérive des policies et erreurs humaines.
  - Mitigation : policies en repo, revue via PR, tests automatisés qui valident les nouveaux scénarios.

### Prochaines etapes

- Déployer un POC en sandbox sur un flux non critique (checkout test) (source: https://news.ycombinator.com/item?id=47365599).
- Rédiger 1–3 règles Allow ciblées et activer le mode strict dans policy YAML.
- Intégrer SecureAgent autour de l'agent existant, exécuter les runs de validation (collecte de logs et snapshots).
- Instrumenter métriques (latence, taux d'échec, violations) et décider si la génération de prédicats restera prédéfinie dans les policies ou s'appuiera sur un LLM local.

Référence principale : annonce publique et discussion sur Hacker News — https://news.ycombinator.com/item?id=47365599
