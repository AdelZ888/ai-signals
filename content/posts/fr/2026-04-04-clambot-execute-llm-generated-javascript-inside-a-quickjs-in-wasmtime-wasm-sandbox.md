---
title: "ClamBot : exécuter du JavaScript généré par un LLM dans un sandbox WASM (QuickJS + Wasmtime)"
date: "2026-04-04"
excerpt: "Tutoriel local et guide de mise en route pour ClamBot : exécuter en sécurité du JavaScript produit par un modèle LLM à l'intérieur d'un module QuickJS compilé en WebAssembly et exécuté par Wasmtime. Le sandbox limite l'exposition de l'hôte et force des bindings explicites."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-04-clambot-execute-llm-generated-javascript-inside-a-quickjs-in-wasmtime-wasm-sandbox.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "WASM"
  - "QuickJS"
  - "Wasmtime"
  - "sandbox"
  - "sécurité"
  - "IA"
  - "ClamBot"
  - "LLM"
sources:
  - "https://github.com/clamguy/clambot"
---

## TL;DR en langage simple

- ClamBot est un assistant personnel axé sécurité qui exécute du JavaScript généré par un LLM à l'intérieur d'un sandbox WebAssembly (QuickJS compilé en WASM, exécuté par Wasmtime). Source : https://github.com/clamguy/clambot
- Avantage clé : le moteur JS (QuickJS) tourne dans un module WASM et n'accède au système hôte que via les "bindings" que vous fournissez explicitement. Source : https://github.com/clamguy/clambot
- Démarrage recommandé : cloner le dépôt, lire le README et lancer les exemples dans une VM ou conteneur isolé. Source : https://github.com/clamguy/clambot

Checklist immédiate :

- [ ] Cloner https://github.com/clamguy/clambot
- [ ] Lire le README upstream
- [ ] Lancer un exemple dans un conteneur/VM isolé
- [ ] Vérifier les logs d'exécution pour confirmer le sandboxing

## Ce que vous allez construire et pourquoi c'est utile

Vous allez créer une preuve de concept (POC) locale où un LLM génère du code JavaScript et ce code est exécuté dans QuickJS compilé en WebAssembly, le tout orchestré par Wasmtime. Ceci limite la surface d'attaque puisque seules les API hôtes exposées (bindings) sont accessibles. Source : https://github.com/clamguy/clambot

Tableau comparatif (synthèse décisionnelle)

| Mode d'exécution | Isolation | Exposition API | Usage conseillé |
|---|---:|---|---|
| QuickJS + WASM (Wasmtime) | Fort (sandbox WASM) | Seules les bindings fournies | POC sécurité, exécution de scripts tiers |
| Exécution directe Node/QuickJS natif | Faible à moyenne | Système selon droits processus | Scripts internes de confiance |

Explication rapide : QuickJS est compilé en WASM et Wasmtime exécute ce module ; sans bindings, le moteur n'a pas d'accès au système. Source : https://github.com/clamguy/clambot

## Avant de commencer (temps, cout, prerequis)

Prérequis minimaux : Git, accès CLI, environnement isolé (VM ou conteneur) pour les tests. Voir le dépôt pour les exemples et le README : https://github.com/clamguy/clambot

Petite note pratique : prévoyez un environnement isolé dès le premier test (contenerisation ou VM) et consultez le README du dépôt pour adapter les commandes d'exécution. Source : https://github.com/clamguy/clambot

## Installation et implementation pas a pas

Remarque méthodologique courte : suivez l'architecture et les exemples du dépôt upstream et testez dans un environnement isolé. Voir : https://github.com/clamguy/clambot

1) Cloner le dépôt :

```bash
git clone https://github.com/clamguy/clambot.git
cd clambot
```

2) Installer et vérifier Wasmtime (exemple de vérification) :

```bash
which wasmtime || echo "wasmtime non trouvé"
wasmtime --version || echo "échec vérif version wasmtime"
```

3) Lire le README et localiser les exemples QuickJS+Wasmtime dans le dépôt : https://github.com/clamguy/clambot

4) Lancer un exemple dans un conteneur/VM isolé (commande générique, adapter selon runner présent dans le dépôt) :

```bash
# commande d'exemple — adapter selon le runner fourni
./run-sandbox --config sandbox.yaml --script examples/hello.js
```

5) Exemple de configuration minimale (JSON) — adapter en fonction de vos besoins :

```json
{
  "bindings": { "readOnlyDir": "/srv/safe-read" },
  "maxConcurrent": 2,
  "memoryLimitMB": 32,
  "timeoutMs": 1000
}
```

6) Tests de base à effectuer : vérifier qu'un script trivial renvoie la valeur attendue, vérifier qu'un script tentant d'accéder à /etc/passwd échoue si le binding n'est pas présent, et inspecter les logs. Source : https://github.com/clamguy/clambot

## Problemes frequents et correctifs rapides

Symptôme : l'exemple ne démarre.
- Cause courante : Wasmtime absent ou variables d'environnement manquantes. Vérifiez le README : https://github.com/clamguy/clambot

Vérifications rapides :

```bash
which wasmtime || echo "installer wasmtime"
ls -la examples || echo "exemples manquants"
```

Symptôme : erreurs liées aux bindings.
- Correctif : moquer le binding en test ou fournir une implémentation hôte minimale.

Symptôme : timeouts ou latence élevée.
- Correctif : augmenter temporairement le timeout pour debug, puis resserrer en production.

Symptôme : accès fichier ou réseau inattendu.
- Correctif : retirer le binding, relancer canaris et inspecter les logs d'audit. Référence : https://github.com/clamguy/clambot

## Premier cas d'usage pour une petite equipe

Public cible : solo founders et équipes de 1–5 personnes souhaitant exécuter des scripts générés par LLM sans exposer l'infra. Source : https://github.com/clamguy/clambot

Processus recommandé (no-friction) : déployer un POC local, autoriser initialement un seul binding en lecture, exécuter des tests synthétiques avant élargissement, et tenir un registre des bindings.

Checklist rapide pour une petite équipe :

- [ ] Lancer prototype local en VM/conteneur
- [ ] Autoriser uniquement lecture par défaut pour le premier binding
- [ ] Revue de code pour tout changement des bindings
- [ ] Exécuter tests synthétiques avant montée en charge

Conseil opérationnel : conservez le dépôt de référence ouvert pendant les revues (https://github.com/clamguy/clambot) et documentez chaque binding exposé.

## Notes techniques (optionnel)

- Principe central confirmé par le dépôt : QuickJS est compilé en WebAssembly et s'exécute via Wasmtime ; c'est le mécanisme utilisé pour isoler l'exécution du moteur JS. Source : https://github.com/clamguy/clambot
- Chaque binding hôte augmente la surface d'attaque ; limitez le nombre de bindings exposés et documentez-les.

Exemple JSON de manifeste minimal (illustration) :

```json
{
  "env": "staging",
  "bindings": ["readOnlyDir"],
  "limits": { "memoryMB": 32, "timeoutMs": 1000 }
}
```

Référence code et exemples : https://github.com/clamguy/clambot

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse structurelle : le dépôt implémente un assistant sécurité qui exécute du code LLM dans un WASM (QuickJS dans Wasmtime). Source : https://github.com/clamguy/clambot
- Valeurs à valider en staging (exemples à tester) : timeouts 500 ms / 1000 ms / 2000 ms ; mémoire 16 MB / 32 MB / 64 MB / 128 MB ; concurrence 1 / 2 / 4 / 8 sandboxes ; runs synthétiques 100 / 500 / 1000 ; seuil d'alerte erreur 2% ; canary rollout 5% d'utilisateurs / 1–2 développeurs.
- Hypothèse opérationnelle : les exemples et runners fournis dans le dépôt couvrent les scénarios de base de lancement (à confirmer en clonant : https://github.com/clamguy/clambot).

### Risques / mitigations

- Risque : bindings trop permissifs -> évasion potentielle.
  - Mitigation : politique de bindings, PR obligatoire et au moins 1 reviewer (processus), journaux d'audit structurés.
- Risque : coûts/perf non anticipés lors de la montée en charge.
  - Mitigation : tester 100–1 000 runs synthétiques par palier, limiter autoscale initial (par ex. 4–8 sandboxes max par hôte pendant staging).
- Risque : erreurs silencieuses non détectées.
  - Mitigation : alertes si taux d'erreur > 2% sur 100 runs ou si p95 > 2000 ms ; surveiller logs 7–14 jours après déploiement canary.

### Prochaines etapes

- Lancer un canary : 1–2 devs ou ~5% d'utilisateurs, effectuer 100–1 000 runs synthétiques, mesurer latence moyenne (ms), p95 (ms), mémoire utilisée (MB) et volume de logs (MB/jour).
- Codifier la politique de bindings, exiger PR + approbation pour tout changement.
- Rédiger un runbook avec seuils de rollback (taux d'erreur > 2% ou p95 > 2000 ms) et procédure d'urgence.
- Garder le dépôt de référence accessible pour revue continue : https://github.com/clamguy/clambot
