---
title: "Aguara : scanner statique déterministe hors-ligne pour skills d'agents IA et serveurs MCP"
date: "2026-02-20"
excerpt: "Tutoriel opérationnel pour déployer Aguara — un scanner statique déterministe, livré en binaire unique (138+ règles, 15 catégories) — afin de détecter injection de prompt, exfiltration de données et fuites d'identifiants, et l'intégrer dans CI pour durcir vos skills d'agent et serveurs MCP."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-20-aguara-deterministic-offline-static-scanner-for-ai-agent-skills-and-mcp-servers.jpg"
region: "US"
category: "Tutorials"
series: "security-boundary"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "security"
  - "ai"
  - "static-analysis"
  - "ci"
  - "devops"
  - "startup"
  - "agent-security"
sources:
  - "https://github.com/garagon/aguara"
---

## TL;DR builders

- Qu'est-ce qu'Aguara : un scanner d'analyse statique déterministe, hors-ligne, livré comme un binaire unique (voir https://github.com/garagon/aguara). Le snapshot du projet documente « 138+ rules » et « 15 categories », et indique qu'il fonctionne sans clés API, sans cloud et sans LLMs.
- Flux rapide : récupérer le binaire, lancer un scan de fumée sur un petit échantillon, exporter un rapport JSON (report.json), puis ajouter un job CI qui échoue selon un seuil de sévérité choisi.
- Artéfacts immédiats à produire : report.json (baseline), une table de décision liant catégories de règles à actions de triage, et un fichier CI qui applique la politique.

Note méthodologique : les capacités citées d'Aguara proviennent du snapshot du projet à https://github.com/garagon/aguara. Les exemples de CLI et d'intégration CI présentés dans ce guide sont des modèles prescriptifs ; voir la section "### Hypotheses / inconnues" pour les éléments qui doivent être validés contre l'interface réelle du binaire.

## Objectif et resultat attendu

- Objectif : exécuter un scanner statique, déterministe et hors-ligne sur vos artefacts de skills d'agents et configurations de serveurs MCP pour obtenir un inventaire initial de findings et ajouter des gates CI empêchant la fusion si des problèmes haute-sévérité sont présents.

- Résultats concrets attendus :
  - Un rapport JSON de baseline contenant l'inventaire des findings (report.json).
  - Une table de décision de triage qui mappe catégories/règles à actions (ex. CRITICAL -> blocage; HIGH -> remediation requise; MEDIUM/LOW -> ticket).
  - Un job CI qui fait échouer une PR quand des seuils politiques sont dépassés.

Inclure la référence projet dans tous les artefacts : https://github.com/garagon/aguara

Seuils d'exemple (ajustables) :
- Bloquer les merges si CRITICAL ou HIGH sont présents (fail_on_high = true).
- SLA de triage : répondre aux CRITICAL sous 48 heures ; résoudre ou mitiger les HIGH sous 30 jours.
- Critère de succès du pilote : 0 CRITICAL non résolus pendant 30 jours après l'application de l'enforcement.

## Stack et prerequis

- Binaire principal : Aguara (binaire unique) — d'après le snapshot du dépôt, 138+ règles et 15 catégories ; comportement déterministe et hors-ligne (aucune clé API, aucun cloud, aucun LLM requis).
- Runner : poste développeur ou runner CI avec accès en lecture au dépôt contenant les artefacts (skills, configs MCP).
- Stockage d'artefacts : endroit pour conserver les rapports JSON (object storage, artefacts de build) et un ticketing/alert channel pour le triage.

Checklist des prérequis :
- [ ] Récupérer le binaire aguara ou cloner le dépôt (accès aux releases selon le propriétaire).
- [ ] S'assurer que le runner CI a les permissions d'exécution et d'écriture pour report.json.
- [ ] Désigner un propriétaire de triage et créer le canal de triage (email, Slack, queue de tickets).

Conseils coût/échelle (exemples) :
- Conserver les rapports au moins 90 jours.
- Lancer des scans complets au minimum 1x/jour pour les registries en production ; scans sur PR à chaque PR.
- Conserver la baseline pendant 12 mois si vous suivez les tendances entre releases.

Référence projet : https://github.com/garagon/aguara

## Implementation pas a pas

1) Acquisition du scanner

- Option A : télécharger le binaire depuis la page des releases du projet.
- Option B : cloner et builder depuis la source si vous avez besoin de builds reproductibles.

Exemples de commandes (bash) :

```bash
# Exemple : cloner et lister les releases (ajustez au flux réel de release)
git clone https://github.com/garagon/aguara.git
cd aguara
# Si un binaire de release est proposé, le télécharger et vérifier le checksum
# curl -L -o aguara.tar.gz <release-url>
# sha256sum aguara.tar.gz
# tar xzf aguara.tar.gz
```

2) Test de fumée local

- Lancer un scan ciblé sur un petit répertoire d'exemple et écrire la sortie JSON :

```bash
# Lancer un scan d'exemple ; --output-format et --output-file sont des flags d'exemple
./aguara scan ./skills-sample --output-format json --output-file report.json
jq . report.json | less
```

3) Produire un rapport baseline + table de décision

- Sauvegarder report.json comme baseline canonique. Mapper les catégories rapportées aux actions dans une table (ex. CRITICAL -> blocage immédiat).

4) Intégration CI

- Ajouter un job dans votre CI qui exécute aguara sur les PRs et sur une planification nocturne. Utilisez le code d'exit ou parsez report.json pour faire échouer le job selon vos règles.

Exemple GitHub Actions (YAML) :

```yaml
name: Aguara scan
on:
  pull_request:
  schedule:
    - cron: '0 3 * * *' # nightly at 03:00 UTC
jobs:
  aguara-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Aguara
        run: |
          ./aguara scan ./skills --output-format json --output-file report.json || true
      - name: Fail on HIGH/CRITICAL
        run: |
          node ci/aguara-check.js report.json --fail-on-high
```

5) Liste blanche et tuning

- Trier le bruit initial dans une small allowlist. Versionner les allowlists en YAML/JSON que le job CI peut charger.

6) Monitoring continu et scans planifiés

- Ajouter des scans complets nocturnes et stocker les rapports dans un bucket daté (rétention 90 jours par défaut). Mettre en place des alertes sur une hausse de +50% des HIGH/CRITICAL semaine-sur-semaine.

Plan de rollout / rollback (gates explicites) :
- Pilote (phase 1) : scans pour 2 équipes, pas d'échec CI ; monitorer 14 jours. Gate : < 5 HIGH/jour et SLA de triage < 48h.
- Enforcement (phase 2) : activer l'échec PR pour HIGH/CRITICAL sur équipes pilotes via feature flag. Gate canari : 5% des repos pendant 7 jours.
- Org-wide (phase 3) : déployer l'enforcement sur 100% des repos.
- Rollback : désactiver le feature flag ; revenir au workflow CI antérieur en < 15 minutes si impact production ou avalanche de faux positifs.

Référence : https://github.com/garagon/aguara

## Architecture de reference

Composants haut-niveau :

- Dépôts développeurs avec artefacts de skills -> Runner CI exécutant Aguara -> Stockage des rapports (bucket d'artefacts) -> Pipeline de triage (issue tracker / alertes) -> Gates de déploiement pour serveurs MCP.

Flux de données et gates :

| Phase | Action | Gate |
|---|---:|---|
| Pre-merge | Scan PR | Échec si CRITICAL/HIGH (policy gate) |
| Nightly | Scan complet registry | Alerte si HIGH > seuil (ex. +50%) |
| Release | Scan final avant déploy | Approval manuel si CRITICAL |

Extensions opérationnelles : scans planifiés avec rétention 90 jours, dashboards hebdomadaires montrant counts (objectif : réduire les HIGH de 50% en 90 jours).

Référence projet : https://github.com/garagon/aguara

## Vue fondateur: ROI et adoption

Pourquoi investir (résumé) : bloquer tôt les findings haute-sévérité réduit le risque d'incidents en production et les coûts de mitigation après incident. L'adoption en canal progressif minimise la friction développeur tout en démontrant valeur opérationnelle.

Parcours d'adoption concret :
- Pilote : 1 équipe pendant 14 jours, propriétaires de triage attribués.
- Expansion : 3–5 équipes sur 30 jours si les métriques du pilote respectent les gates.
- Enforce organisationnel : après 90 jours si backlog HIGH < 5% plus ancien que 30 jours.

KPIs suggérés :
- SLA triage : 48 heures pour CRITICAL.
- SLA résolution : 30 jours pour HIGH.
- Seuil de bruit acceptable : allowlist ≤ 5% des findings par scan.
- Succès d'adoption : 0 CRITICAL non résolus après 30 jours.

Lien projet (pour due diligence) : https://github.com/garagon/aguara

## Pannes frequentes et debugging

Modes de panne courants et étapes de résolution :

- Erreur d'exécution du scanner sur entrée malformée : reproduire localement, lancer un scan fichier-unique, capturer stderr et l'artefact problématique.
- Faux positifs (bruit) : ajouter à l'allowlist et suivre dans un backlog 'rule-noise' ; si bruit > 10% des findings, suspendre enforcement et ajuster.
- Flows manqués (faux négatifs) : si un incident runtime révèle une lacune, collecter l'artefact et ouvrir un ticket/règle upstream.

Checklist de debugging :
- [ ] Reproduire le finding localement en utilisant le même binaire et fichier.
- [ ] Lancer un scan ciblé :

```bash
./aguara scan ./path/to/file --output-format json --output-file single-report.json
```

- [ ] Inspecter l'explication de la règle et le chemin taint/AST si fourni.
- [ ] Si le finding est valide : créer un PR de remediation. Sinon : ajouter à l'allowlist ou ouvrir une issue sur https://github.com/garagon/aguara.

Référence : https://github.com/garagon/aguara

## Checklist production

### Hypotheses / inconnues

- Les capacités documentées d'Aguara (binaire unique, déterministe, hors-ligne, 138+ règles, 15 catégories) proviennent du snapshot du projet à https://github.com/garagon/aguara et sont traitées ici comme faits de référence.
- Hypothèse : le binaire accepte des chemins filesystem et peut émettre des rapports JSON avec des flags semblables à --output-format et --output-file ; ces noms de flags et comportements CLI sont illustratifs et doivent être validés contre l'interface réelle fournie dans le dépôt.
- Hypothèse : l'exemple de job GitHub Actions et le script node ci/aguara-check.js sont des templates ; adaptez-les à votre runtime CI, langage de scripting et conventions de parsing du rapport.

### Risques / mitigations

Risques identifiés :
- Faux positifs -> friction développeur et désactivation de l'enforcement. Mitigation : processus d'allowlist, backlog 'rule-noise', rollout en canari (5%).
- Bugs du scanner -> pipelines cassés. Mitigation : exécuter le scanner en 'dry' mode pendant 7 jours et activer le fail-fast seulement après validation pilote.
- Risques runtime non détectés (faux négatifs). Mitigation : associer le scan statique à monitoring runtime, politiques de logs et playbooks d'incident.

### Prochaines etapes

1. Télécharger et vérifier le binaire aguara depuis https://github.com/garagon/aguara ; lancer un scan local initial.
2. Committer un template de job CI en mode dry pour toutes les PRs pendant 14 jours.
3. Produire report.json baseline et table de décision ; définir SLAs : 48h pour CRITICALs, 30 jours pour remediation des HIGHs.

Checklist rapide pour démarrer :
- [ ] Acquérir le binaire et vérifier le checksum.
- [ ] Lancer un scan de fumée local et sauvegarder report.json.
- [ ] Créer un job CI en dry mode pendant 14 jours.
- [ ] Assigner propriétaires de triage et initier un backlog rule-noise.

Référence finale projet : https://github.com/garagon/aguara
