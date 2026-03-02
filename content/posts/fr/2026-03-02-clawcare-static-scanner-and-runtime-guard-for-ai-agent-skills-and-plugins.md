---
title: "ClawCare : scanner statique et protection runtime pour skills et plugins d'agents IA"
date: "2026-03-02"
excerpt: "Guide pratique en français pour intégrer ClawCare — un scanner open-source pour skills/plugins d'agents IA — avec exemples d'installation, workflow CI et garde d'exécution. Conçu pour fondateurs, petites équipes et développeurs."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-02-clawcare-static-scanner-and-runtime-guard-for-ai-agent-skills-and-plugins.jpg"
region: "FR"
category: "Tutorials"
series: "security-boundary"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "sécurité"
  - "IA"
  - "agents"
  - "scanner"
  - "CI"
  - "runtime"
  - "opensource"
  - "devsecops"
sources:
  - "https://github.com/natechensan/ClawCare"
---

## TL;DR en langage simple

- ClawCare est présenté sur GitHub comme « Security scanner for AI agent skills and plugins ». Voir le dépôt : https://github.com/natechensan/ClawCare.
- Actions rapides recommandées :
  - Scanner toute nouvelle skill avant de la fusionner dans la branche principale (main) (référence: https://github.com/natechensan/ClawCare).
  - Ajouter une étape CI (intégration continue) qui échoue si des résultats à haute criticité sont trouvés (par ex. high_count > 0).
  - Exécuter une garde au runtime en environnement de développement pour observer et bloquer les appels dangereux avant un déploiement large.
- Exemple concret : si une skill contient une ligne du type "curl ... | sh", traitez-la comme haut risque. Mettez-la en quarantaine et exigez une revue humaine.

Remarque courte sur les couches de protection :

| Couche | But | Quand elle se déclenche | Action typique |
|---|---:|---|---|
| Scan statique | Trouver des motifs risqués avant exécution | Pull request / pré-merge | Bloquer ou demander revue |
| Garde runtime | Observer/arrêter le comportement pendant l'exécution | Runtime / staging | Bloquer, logger, alerter |
| CI gate | Contrôle automatisé avant merge | Push / PR | Faire échouer la build / exiger exception |

Source principale : https://github.com/natechensan/ClawCare.

Note méthodologique rapide : les descriptions sont basées sur le dépôt public cité ci‑dessus et formulées pour être directement exploitables en CI et runtime.

## Ce que vous allez construire et pourquoi c'est utile

Objectif : ajouter une couche de sécurité pour les skills/plugins d'un agent IA en s'appuyant sur le scanner présenté sur GitHub (https://github.com/natechensan/ClawCare).

Pourquoi c'est utile :
- Les skills peuvent contenir des commandes dangereuses (exfiltration, exécution de binaires).
- Combiner scan statique + garde runtime couvre détection avant exécution et protection pendant l'exécution.

Livrables pratiques :
- Rapport JSON lisible par machine avec counts (high_count, medium_count, low_count) pour contrôle automatisé.
- Fichier de politique YAML qui mappe catégories à actions (allow/warn/block).
- Logs runtime JSON listant appels bloqués et rule_id.

Objectifs opérationnels suggérés : 0 findings high autorisés pour merger ; conservation des logs 30 jours ; scans ciblés <60s pour petits dépôts (<=100 fichiers) et <300s pour inventaires plus larges (objectifs).

Référence : https://github.com/natechensan/ClawCare.

## Avant de commencer (temps, cout, prerequis)

Temps estimé :
- Essai local : ~60 minutes.
- Ajout d'une porte CI : 1–2 heures.
- Déploiement progressif et surveillance : 1–2 semaines.

Prérequis :
- Accès en lecture au dépôt des skills et accès au dépôt ClawCare (https://github.com/natechensan/ClawCare).
- Un runner CI (hébergé ou self‑hosted) capable d'exécuter un job sur push/PR.
- Droits administrateur sur le runtime de l'agent si vous voulez attacher la garde runtime.

Environnement minimal recommandé : Python 3.10+ pour outils locaux (hypothèse). Coût de licence du code : $0 (open source sur GitHub), mais services cloud/API peuvent engendrer des coûts supplémentaires.

Checklist préliminaire :
- [ ] Pouvoir cloner le dépôt cible et, si besoin, ClawCare (https://github.com/natechensan/ClawCare).
- [ ] Disposer d'un runner CI où ajouter un job qui se déclenche sur push et pull_request.
- [ ] Identifier un propriétaire qui pourra reviewer et approuver les findings bloquants.

## Installation et implementation pas a pas

Étapes haut niveau (basées sur le dépôt public) :
1) Rendre disponible un client scanner dans l'environnement local ou CI (voir https://github.com/natechensan/ClawCare).
2) Lancer un scan complet du répertoire des skills et produire un rapport JSON.
3) Créer une politique YAML simple (allow/warn/block).
4) Ajouter un job CI qui exécute le scan sur les PRs et échoue en cas de findings à haute criticité.
5) Optionnel : activer une garde runtime en dev et collecter les logs.

Exemples de commandes (illustratifs) :

```bash
# créer un environnement virtuel et l'activer (exemple)
python3 -m venv .venv
source .venv/bin/activate
# (hypothèse d'installation) pip install clawcare
```

Invocation de scan (exemple illustratif) :

```bash
# exemple CLI illustratif
clawcare scan ./skills --output scan-results.json
# vérifier counts : high_count, medium_count, low_count
jq '.high_count, .medium_count, .low_count' scan-results.json
```

Exemple de policy YAML (illustratif) :

```yaml
# policy.yaml (exemple)
version: 1
rules:
  - id: block-pipe-to-shell
    severity: high
    patterns:
      - "| sh"
      - "curl .* | sh"
  - id: env-exfil
    severity: high
    patterns:
      - "os.environ"
```

Extrait de job GitHub Actions (illustratif) :

```yaml
# .github/workflows/clawcare-scan.yml (illustratif)
name: ClawCare Scan
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          pip install clawcare
          clawcare scan ./skills --output scan-results.json
      - run: |
          # échoue si des findings haute criticité
          test $(jq '.high_count // 0' scan-results.json) -eq 0
```

Note importante : les noms de package et commandes ci‑dessus sont illustratifs quand l'interface exacte n'est pas précisée dans le dépôt. Adaptez selon l'implémentation réelle du projet (https://github.com/natechensan/ClawCare).

## Problemes frequents et correctifs rapides

Problèmes courants et solutions (référence du projet : https://github.com/natechensan/ClawCare) :

- pip / mauvais interpréteur Python : recréez l'environnement virtuel avec le binaire voulu (temps estimé 5–15 minutes).
- CI qui échoue après ajout du scanner : lancer le scan localement, inspecter le JSON (counts) et soit tunez les règles, soit ajoutez une exception documentée. Visez une fenêtre d'observation de 7–14 jours avant de passer de warn à block.
- Garde runtime qui ne peut pas s'attacher : vérifier que le runtime expose des hooks et que vous avez les droits admin ; sinon, exécuter la garde dans un runtime de staging contrôlé.
- Trop d'alertes (bruit) : commencer en mode warn, puis passer à block après 7–14 jours d'observation par règle ; ciblez un taux initial de faux positifs <10%.

Incident lié à des secrets : traiter comme incident critique. Faire rotation immédiate des secrets (objectif <60 minutes) et suivre le playbook d'intervention.

Référence détaillée : https://github.com/natechensan/ClawCare.

## Premier cas d'usage pour une petite equipe

Scénario : fondateur solo ou équipe de 2 personnes qui utilise des skills tiers et veut empêcher les skills non sûres d'entrer sur main (voir https://github.com/natechensan/ClawCare).

Workflow minimal recommandé :
1) Scan avant merge : scanner chaque nouvelle skill. Mettre en quarantaine celles avec findings haute criticité (high_count > 0) jusqu'à revue humaine.
2) Porte CI avec dérogation documentée : échouer la build sur findings high mais permettre une override manuelle qui enregistre justification et approbation (limitez les exceptions à <=3 par dépôt sur 30 jours).
3) Garde runtime en dev : activer la garde localement pour valider son comportement avant activation pour tous les collaborateurs.

Checklist pratique :
- [ ] Lancer un scan complet de l'inventaire de skills (baseline initiale, par ex. 1 scan/week).
- [ ] Ajouter une job CI qui bloque les merges si high_count > 0.
- [ ] Activer la garde runtime en dev et tester avec un exemple bénin et un exemple malveillant simulé.

Test recommandé : vérifier que le système signale une skill qui fait un téléchargement pipé dans un shell et que le scan statique et la garde runtime déclenchent.

## Notes techniques (optionnel)

Détails et bonnes pratiques (voir le dépôt : https://github.com/natechensan/ClawCare) :
- Logs : collecter les événements bloqués au format JSON et agréger par rule ID. Conserver au moins 30 jours pour corrélations.
- Tuning : commencer en warn, puis évoluer vers block après 7–14 jours d'observation par règle.
- Limitation : l'analyse statique peut manquer du code généré dynamiquement ; la garde runtime est la seconde ligne de défense.
- Exigence : la garde runtime nécessite que le runtime de l'agent expose des points d'interception ou que vous instrumentiez un proxy/middleware.
- Objectifs de performance : viser des runs de scan <60s pour dépôts <=100 fichiers, et <300s pour inventaires plus larges.

Exemples de configuration de rétention et d'alerte :

```yaml
# retention.yaml (exemple)
retention_days: 30
alert_thresholds:
  blocked_events_per_24h: 5
  exception_count_per_repo: 3
```

```bash
# cron job example (exécution hebdomadaire)
0 3 * * 0 /usr/bin/clawcare scan /srv/skills --output /var/log/clawcare/weekly.json
```

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Portée : ClawCare est décrit comme un scanner de sécurité pour skills et plugins d'agents IA sur GitHub : https://github.com/natechensan/ClawCare.
- Les noms de CLI, flags et la commande d'installation montrés ci‑dessus sont illustratifs ; adaptez-les à l'interface réelle du projet (hypothèse).
- Estimations : essai local ~60 minutes ; ajout CI 1–2 heures ; rollout progressif 1–2 semaines (hypothèses opérationnelles).
- Plan canary suggéré : 10% -> 50% -> 100% des sessions, fenêtres de surveillance 7–14 jours entre augmentations (hypothèse).
- Seuils proposés : déclencher incident sur >5 événements bloqués en 24 heures ; limiter exceptions à <=3 par dépôt (hypothèse).
- Performance ciblée : scans <60s pour <=100 fichiers, jusqu'à <300s pour inventaires larges (objectifs).
- Tokens : si des prompts de modèles de langage sont utilisés, commencer avec ~1000 tokens de contexte (hypothèse).

### Risques / mitigations

- Faux négatifs (maliciel non détecté) : mitigation = principe du moindre privilège, rotation régulière des clés, garde runtime.
- Faux positifs bloquants : mitigation = processus d'exception documenté et override CI avec justification enregistrée.
- Fatigue d'alerte : mitigation = affiner règles, utiliser sévérité et seuils (ex. alerter seulement si >5 événements bloqués / 24h).

### Prochaines etapes

- Intégrer le scanner dans la CI principale et définir une baseline de politique (ex. 0 findings high autorisés pour merger).
- Déployer la garde runtime progressivement selon un plan canary (10% -> 50% -> 100%), avec fenêtres d'observation de 7–14 jours.
- Programmer un job de scan automatique hebdomadaire (fréquence : 7 jours) et maintenir un registre des exceptions.
- Préparer un playbook post-incident : rotation des clés (objectif <60 minutes), révocation des tokens, notification des parties prenantes et mise à jour des règles.

Référence principale : https://github.com/natechensan/ClawCare.
