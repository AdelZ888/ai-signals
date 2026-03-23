---
title: "Contrôle déterministe du navigateur : capture et replay de traces avec theredsix/agent-browser-protocol"
date: "2026-03-23"
excerpt: "Utilisez theredsix/agent-browser-protocol pour capturer des traces de commandes navigateur déterministes et les rejouer afin d’améliorer le débogage, la QA et l’audit. Commencez par lancer l’exemple du dépôt."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-23-deterministic-browser-control-capture-and-replay-traces-with-theredsixagent-browser-protocol.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "automation"
  - "navigateur"
  - "reproductibilité"
  - "agents"
  - "LLM"
  - "QA"
  - "dev"
  - "UK"
sources:
  - "https://github.com/theredsix/agent-browser-protocol"
---

## TL;DR en langage simple

- Le dépôt se présente comme une solution d'automatisation déterministe du navigateur. Source : https://github.com/theredsix/agent-browser-protocol.
- Il affirme une compatibilité "out of the box" avec Claude, Codex et OpenCode. Voir la page du projet : https://github.com/theredsix/agent-browser-protocol.
- Estimation rapide : 10 minutes pour un aperçu, ~1 heure pour un test simple, 4–8 heures pour stabiliser un flux de production. Ces durées sont indicatives.
- Début recommandé : cloner le repo, lire le README, lancer l'exemple fourni. Commandes de base :

```bash
git clone https://github.com/theredsix/agent-browser-protocol
cd agent-browser-protocol
```

- Méthodologie courte : validez les commandes et l'exemple du README avant d'automatiser. Référence : https://github.com/theredsix/agent-browser-protocol.

Exemple concret (scénario): reproduire un bug intermittent d'inscription. Capturer la session comme trace, rejouer la trace N=10 fois pour mesurer si le bug apparaît toujours. Cela aide à isoler l'état exact du navigateur quand le bug survient.

## Ce que vous allez construire et pourquoi c'est utile

- Objectif : expérimenter un pipeline où un agent pilote un navigateur de manière "déterministe" pour produire des traces réexécutables. Le dépôt le décrit ainsi : https://github.com/theredsix/agent-browser-protocol.
- Utilités immédiates : reproductibilité pour le débogage, auditabilité des actions, et prototypage rapide de flux utilisateur.
- Résultat attendu pour un petit test : une trace canonique (un fichier JSON ou équivalent à valider) et la capacité à la rejouer N=10 fois pour mesurer la variance.

Avantages pratiques :
- Débogage : vous pouvez rejouer exactement la même interaction pour isoler un problème.
- QA : vous conservez une preuve des actions reproduites pour audit.
- Prototypage : itérez rapidement sur séquences d'actions sans recréer l'état manuellement.

Tableau de décision rapide (résumé)

| Cas d'usage                       | Taille cible | Avantage principal        | Effort estimé    |
|-----------------------------------|-------------:|--------------------------:|-----------------:|
| Débogage d'un signup intermittent |        1–3   | Reproductibilité          | 1–2 heures       |
| QA automatisée (batch)            |        3–10  | Audit et traçabilité      | 4–8 heures       |
| Exploration à grande échelle      |       5–20+  | Échantillonnage contrôlé  | plusieurs jours  |

(Référence projet : https://github.com/theredsix/agent-browser-protocol)

## Avant de commencer (temps, cout, prerequis)

Temps estimé : 10 min pour un premier tour, ~1 heure pour un flux simple, 4–8 heures pour stabiliser, 1–3 jours pour intégration CI basique. Voir le dépôt : https://github.com/theredsix/agent-browser-protocol.

Coûts : cloner = $0. Si vous utilisez un modèle de langage (LLM, "large language model") externe, prévoyez des coûts par token selon le fournisseur. Estimations budgétaires suggérées : $10, $50, $200 selon volume et fréquence.

Prérequis techniques :
- Git et un shell (bash / zsh / PowerShell).
- Accès réseau pour cloner : https://github.com/theredsix/agent-browser-protocol.
- Connaissances de base en JSON.
- Optionnel : accès à un LLM (Claude/Codex/OpenCode) si vous voulez des intégrations live.

Checklist avant de commencer :
- [ ] git installé
- [ ] dépôt cloné depuis https://github.com/theredsix/agent-browser-protocol
- [ ] éditeur et shell prêts
- [ ] plan de stockage sécurisé pour traces (chiffrement, ACL)

## Installation et implementation pas a pas

1) Cloner et lire le README (source autoritaire initiale) :

```bash
git clone https://github.com/theredsix/agent-browser-protocol
cd agent-browser-protocol
sed -n '1,120p' README.md
```

2) Suivre les instructions du README pour lancer l'exemple. Vérifiez les ports et les dépendances. Lien : https://github.com/theredsix/agent-browser-protocol.

3) Démarrage minimal : lancer l'exemple fourni et observer les logs. Si un service attend une connexion, patientez 30–120 s selon l'état.

Exemple de configuration (template — vérifier dans le README) :

```yaml
# example-config.yaml (illustratif)
agent_endpoint: "http://localhost:8080"
agent_name: "example-agent"
trace_output_dir: "./traces"
```

4) Bonnes pratiques de démarrage :
- Commencez par un flux court de 3–7 étapes.
- Capturez une trace canonique.
- Rejouez N=10 pour mesurer la variance.

Lien utile : https://github.com/theredsix/agent-browser-protocol.

Plain-language explanation before advanced details:
Ce dépôt enregistre des actions du navigateur comme une "trace". Une trace est une suite d'événements et d'états que l'on peut sauvegarder. Le but est de rejouer exactement ces étapes pour reproduire un comportement. La répétabilité aide à diagnostiquer des bugs qui n'apparaissent pas toujours. En pratique, vous capturez une session, puis vous utilisez un outil (fournit dans le dépôt) pour rejouer cette session plusieurs fois et comparer les résultats.

## Problemes frequents et correctifs rapides

Vérifiez d'abord le README du dépôt : https://github.com/theredsix/agent-browser-protocol.

Problèmes courants et remèdes :
- L'exemple ne démarre pas : vérifier le port (ex. 8080), pare‑feu, dépendances et logs. Temps d'attente typique : 30–120 s.
- Rejouage non équivalent : normaliser timestamps et IDs dynamiques avant comparaison.
- Fuites de données : appliquer des redactions à la capture et chiffrer les traces au repos. Politique de rétention recommandée : 30 jours par défaut.

Checklist dépannage :
- [ ] Vérifier logs et réseau
- [ ] Confirmer que le README a été suivi
- [ ] Contrôler la présence des artefacts dans ./traces

## Premier cas d'usage pour une petite equipe

Public : fondateur solo ou équipe 1–3 personnes. Référence repo : https://github.com/theredsix/agent-browser-protocol.

Plan d'action (3–7 étapes, exécution ~1–4 heures) :
1) Choisir 1 flux critique (1 page, 3–7 étapes).
2) Exécuter l'exemple et capturer la trace initiale (vérifier ./traces).
3) Rejouer N=10 fois et mesurer le taux de réussite. Objectif initial : >= 80%.
4) Si divergence, corriger sélecteurs/attentes puis refaire N=10 runs.

Boucle de replay illustrative (adapter au CLI réel du dépôt) :

```bash
for i in $(seq 1 10); do
  ./tools/replay --trace ./traces/canonical.json --out ./results/run-$i.json
  sleep 0.1 # attendre 100 ms entre runs
done
```

Checklist opérationnel :
- [ ] Définir flux canonique
- [ ] Capturer trace initiale
- [ ] Exécuter N=10 runs
- [ ] Documenter résultats et corriger

(Référence : https://github.com/theredsix/agent-browser-protocol)

## Notes techniques (optionnel)

- Fait établi : le dépôt se décrit comme dédié à l'automatisation déterministe du navigateur et indique une compatibilité "out of the box" avec Claude, Codex et OpenCode. Source : https://github.com/theredsix/agent-browser-protocol.
- À confirmer (hypothèses listées plus bas) : format exact des traces (JSON vs autre), outils de replay CLI, métadonnées précises (IDs, timestamps, tokens redacted).
- Conseils généraux pour production : pinner un commit/tag (éviter ruptures), ajouter validation de schéma en CI (intégration continue), chiffrer traces au repos et restreindre accès.

Exemple de test CI (schéma JSON) — illustration :

```yaml
# .github/workflows/validate-trace.yml (illustratif)
name: Validate trace
on: [push]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate trace schema
        run: python3 tools/validate_trace_schema.py ./traces/*.json
```

Remarques techniques courtes :
- Validez le format (schéma) avant d'intégrer des traces en production.
- Redigez une politique de masque/redaction pour les champs sensibles avant capture.
- Pinner un tag réduit les risques lors des mises à jour du dépôt.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse : le dépôt produit des artefacts structurés exploitables pour le replay (ex. JSON). Source à valider dans le README : https://github.com/theredsix/agent-browser-protocol.
- Hypothèse : des exemples d'intégration existent pour Claude/Codex/OpenCode (compatibilité annoncée dans la page du projet).
- Hypothèse opérationnelle : exécuter N=10 runs donne une estimation initiale de variance ; objectif recommandé : 80%–95% selon criticité.

### Risques / mitigations

- Risque : changement de schéma du dépôt (impact sur pipeline). Mitigation : pinner commit/tag, ajouter tests de format en CI.
- Risque : fuite de données sensibles dans les traces. Mitigation : redaction à la capture, chiffrement au repos, ACLs, suppression après 30 jours si non nécessaire.
- Risque : faible reproductibilité. Mitigation : ajouter attentes explicites (timeouts entre 500–2000 ms selon élément), renforcer sélecteurs, augmenter logs détaillés.

### Prochaines etapes

- [ ] Exécuter l'exemple du dépôt et capturer une trace canonique (valider format et emplacement ./traces). Référence : https://github.com/theredsix/agent-browser-protocol
- [ ] Lancer une série de rejouages (ex. N=10) et calculer le taux de répétabilité (objectif >= 80%).
- [ ] Pinner le repo à un tag/commit et ajouter un test CI qui valide le schéma de la trace.
- [ ] Documenter un playbook de rollback (temps estimé de restauration : 30 minutes).
- [ ] Implémenter chiffrement des traces et contrôles d'accès; définir politique de rétention (ex. 30 jours).

Exemple d'automatisation de comparaison (illustratif) :

```bash
# lancer 10 runs et agréger
for i in {1..10}; do
  ./tools/replay --trace ./traces/canonical.json --out ./results/run-$i.json
done
python3 tools/compare_traces.py --dir ./results --out summary.json
```

Si vous le souhaitez, je peux générer un script de replay adapté à votre environnement (Linux/macOS/WSL), définir un seuil de répétabilité (ex. 85%) ou rédiger un test CI pour valider le format de trace. Dites-moi vos contraintes (headless vs headed, politique de rétention en jours, navigateur cible).
