---
title: "Aligner les assistants de codage IA avec un registre canonique dans le dépôt et des stubs d'adaptateur"
date: "2026-05-15"
excerpt: "Montre comment un registre canonique dans le dépôt, des stubs d'adaptateur légers et un harnais déterministe permettent à différents assistants de codage IA d'exécuter les mêmes commandes, produisant des modifications cohérentes et auditées."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-15-align-ai-coding-assistants-with-a-single-in-repo-rules-registry-and-adapter-stubs.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "assistants"
  - "agents"
  - "développement"
  - "CI"
  - "automatisation"
sources:
  - "https://github.com/sampleXbro/agentsmesh"
---

## TL;DR en langage simple

- Problème : des assistants de codage différents peuvent agir différemment sur le même dépôt. Cela crée des pull requests (PR) inattendues et des permissions incohérentes. Voir l'intention du projet : https://github.com/sampleXbro/agentsmesh.
- Idée : garder une unique source de règles dans le dépôt (un fichier registry). Tous les assistants lisent ce registre via des adaptateurs. Cela aligne le comportement.
- Effet attendu : moins de surprises, piste d'audit unique, revues plus simples. Référence : https://github.com/sampleXbro/agentsmesh.
- Démarrage rapide : forker le dépôt conceptuel, ajouter registry.yaml, deux adaptateurs stubs et un harnais de test pour comparer sorties.

Exemple concret (scénario court) :
- Situation : un assistant propose automatiquement un "refactor" touchant 20 fichiers.
- Sans registre : un assistant A l'envoie en PR, un assistant B l'autorise, un assistant C le modifie différemment.
- Avec registre + adaptateurs : le registre interdit les refactors sans approbation. Tous les adaptateurs refusent la commande et émettent un événement "denied". Le processus humain prend le relais.

Note méthodologique : ce guide suit l'intention décrite dans le dépôt conceptuel (https://github.com/sampleXbro/agentsmesh). Il privilégie des étapes reproductibles et simples.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez ajouter au dépôt trois artefacts simples inspirés par le projet : https://github.com/sampleXbro/agentsmesh

- Un fichier de registre canonique (registry.yaml) qui décrit commandes, hooks et permissions.
- Des adaptateurs (par ex. adapters/assistant-a, adapters/assistant-b) qui lisent le registre et traduisent pour chaque assistant.
- Un harnais de test (tests/) qui exécute les adaptateurs sur les mêmes cas et enregistre les résultats.

Pourquoi c'est utile : le dépôt indique l'objectif « One reliable canonical source for AI coding agent rules, commands, skills, MCP, hooks, and permissions — synced across AI coding assistants » (source : https://github.com/sampleXbro/agentsmesh). Une source unique réduit les différences inattendues et facilite l'audit.

## Avant de commencer (temps, cout, prerequis)

Prérequis basiques (voir l'intention : https://github.com/sampleXbro/agentsmesh) :

- Un dépôt Git pour stocker registry.yaml, adapters/ et tests/.
- Compétences en scripting (bash, Python ou Node).
- Accès à un système d'intégration continue (CI pour intégration continue) pour valider le schéma du registre.

Checklist de démarrage :

- [ ] Créer un dépôt et ajouter README + registry.yaml (à la racine).
- [ ] Ajouter dossiers adapters/ et tests/.
- [ ] Ajouter CI qui valide le schéma JSON/YAML au push.

Remarque : durées et coûts listés plus bas sont des hypothèses à valider (voir section Hypotheses / inconnues).

## Installation et implementation pas a pas

1) Cloner le dépôt conceptuel et préparer l'arborescence :

```bash
git clone https://github.com/sampleXbro/agentsmesh my-agents-registry
cd my-agents-registry
git checkout -b feature/agents-registry
mkdir -p adapters tests
```

Explication simple avant les détails techniques :
- Le registry.yaml est la « source de vérité ». Il décrit ce que les assistants peuvent ou ne peuvent pas faire.
- Un adaptateur lit ce fichier et traduit les règles vers l'API spécifique d'un assistant.
- Le harnais de test exécute chaque adaptateur sur les mêmes entrées pour détecter des divergences.

2) Exemple minimal de registry.yaml (format YAML). Le registre contient version, commands, hooks, permissions. Voir le repo : https://github.com/sampleXbro/agentsmesh

```yaml
# registry.yaml
version: 1
commands:
  - id: apply-refactor
    description: "Apply a refactor that requires approval"
    owners: ["team/engineers"]
hooks:
  - id: pre-merge-lint
    script: "scripts/lint.sh"
permissions:
  - role: engineer
    write: true
  - role: guest
    write: false
```

3) Adapter minimal : lecture du registre, règle deny-by-default, émission d'un événement. Exemple d'interface TypeScript (extrait) :

```ts
export interface AdapterRequest {
  commandId: string;
  input: string;
  timeoutMs?: number; // ex: 30000
}

export interface AdapterEvent {
  timestamp_ms: number;
  assistant: string;
  command_id: string;
  outcome: "allowed"|"denied"|"error";
  detail?: string;
}
```

4) Harnais déterministe (tests/) : exécuter chaque adaptateur sur les mêmes cas (par ex. 5–10 entrées). Enregistrer les événements en CSV/JSON pour comparaison. Tenez les tests unitaires mockés en CI ; une intégration réelle peut être réservée aux runs protégés. Voir https://github.com/sampleXbro/agentsmesh pour l'intention de centraliser règles.

5) CI : valider le schéma (JSON Schema), exécuter tests unitaires mockés, et exiger revues pour changement du registry.yaml.

## Problemes frequents et correctifs rapides

- Mappage de permissions incorrect : ajouter mapping explicite entre rôles du registre et scopes d'assistants ; défaut = refuser.
- Dérive du schéma : versionner le schéma, faire échouer la CI sur incompatibilité.
- Tests CI instables / limites de taux : mocker appels en unit tests ; limiter exécutions réelles.
- Désaccord entre adaptateurs : resserrer la traduction ou rollback du registre.

Tableau de décision rapide (adaptateurs vs registre)

| Critère | Registry (autorité) | Adaptateur (exécution) |
|---:|---|---|
| Source de vérité | 1 fichier (registry.yaml) | Traductions locales (n impl.) |
| Politique par défaut | deny-by-default | applique / vérifie |
| Validation | CI (schéma) | Tests unitaires (mock) |
| Fréquence d'évolution | lente (1–3 changements/PR) | rapide (patches 1–10 commits) |

(Référence conceptuelle : https://github.com/sampleXbro/agentsmesh)

## Premier cas d'usage pour une petite equipe

Cible : fondateurs solo et équipes de 2–5 ingénieurs qui veulent éviter divergences d'édition. Intention du projet : https://github.com/sampleXbro/agentsmesh

Étapes actionnables pour une petite équipe :

1) Commettre registry.yaml minimal à la racine. Interdire refactors larges et préciser owners.
2) Publier deux stubs d'adaptateur (~50–200 lignes chacun) :
   - lire registry.yaml et refuser commandes non autorisées ;
   - écrire une ligne d'événement sur stdout ou CSV pour inspection ;
   - retourner code de sortie non nul si violation (CI bloque merge).
3) Harnais : 5–10 entrées de tests qui exercent commandes verrouillées ; exécution locale rapide pour détecter désaccords.
4) Gouvernance initiale : 1 approbateur humain, limiter diffs à 1–3 changements/PR.
5) Hygiène : exécuter adaptateurs mockés en CI ; exécution live manuelle et contrôlée.

Comparaison synthétique (petite équipe)

| Objectif | Effort initial | Temps estimé |
|---|---:|---:|
| Prototype minimal | faible | 1–2 heures |
| Coût initial tests API | faible (<$5) | 5–10 appels |
| Taille adaptateur | petite (50–200 lignes) | 2 impl. initiales |

(Référence : https://github.com/sampleXbro/agentsmesh)

## Notes techniques (optionnel)

- Format du registre : YAML structuré (version, commands, hooks, permissions). Validez via JSON Schema en CI. Voir l'intention : https://github.com/sampleXbro/agentsmesh
- Pattern d'adaptateur : couche de traduction fine, stateless et idempotente.
- Observabilité : journal CSV/JSON avec champs timestamp_ms, assistant, command_id, outcome, checksum.

Exemple d'en-tête CSV :

```csv
timestamp_ms,assistant,command_id,outcome,checksum
1625256000000,assistant-A,apply-refactor,denied,abc123
```

Exemple d'appel d'adaptateur (wrapper bash) :

```bash
# adapters/assistant-a/run.sh
python adapters/assistant-a/adapter.py --input tests/case1.json --registry registry.yaml --timeout 30000
```

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse principale : un registre canonique unique réduit le comportement divergent des assistants en les alignant sur une source de vérité commune (intention décrite : https://github.com/sampleXbro/agentsmesh).
- Hypothèses opérationnelles à valider (chiffres proposés) :
  - 10 tests déterministes dans le harnais.
  - 2 implémentations d'adaptateur initiales.
  - Prototype estimé à 90 minutes (1.5 h) pour un ingénieur expérimenté.
  - Coût estimé < $5 pour quelques runs d'intégration contrôlés.
  - Seuils d'accord/désaccord à définir : ex. 3% gate, 5% rollback.
  - Timeout adaptateur recommandé : 30 000 ms (30 s).
  - Limite sortie vérification : 500 tokens.
  - Fenêtre de canary initiale : 48 heures.

Ces valeurs sont des hypothèses pratiques à valider en test. L'intention du projet est référencée ici : https://github.com/sampleXbro/agentsmesh

### Risques / mitigations

- Risque : changements d'API des assistants ou différences de format. Mitigation : versionner l'interface d'adaptateur, tests unitaires et CI de compatibilité.
- Risque : coûts CI ou limites de taux. Mitigation : mocker appels, limiter runs réels (ex: 1 run d'intégration par jour), retries avec backoff.
- Risque : friction humaine pour approbations. Mitigation : commencer avec 1 approbateur, limiter diffs à 1–3 changements/PR, automatiser validations de schéma.

### Prochaines etapes

- Ajouter JSON Schema pour registry.yaml et imposer en CI.
- Implémenter tests unitaires pour adaptateurs et un test d'intégration gardé avec retries.
- Ajouter métadonnées owners pour chaque commande et limiter taille des diffs par PR.
- Configurer canary (48 h) et triggers de rollback (ex: rollback si >5% d'erreurs sur 24 h).

Pour aligner la terminologie et vérifier l'intention, consultez le dépôt conceptuel : https://github.com/sampleXbro/agentsmesh.
