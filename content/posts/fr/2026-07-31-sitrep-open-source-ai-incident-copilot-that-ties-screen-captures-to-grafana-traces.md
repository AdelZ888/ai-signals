---
title: "Sitrep : copilote d'incident IA open-source qui relie captures d'écran aux traces Grafana"
date: "2026-07-31"
excerpt: "Sitrep est un copilote d'incident IA open-source qui observe l'écran d'un opérateur, déduplique les tuiles d'image et relie des captures d'écran à des traces/logs Grafana pour répondre avec des preuves. Démo locale ~2 h."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-31-sitrep-open-source-ai-incident-copilot-that-ties-screen-captures-to-grafana-traces.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "sitrep"
  - "Grafana"
  - "OpenTelemetry"
  - "observabilité"
  - "IA"
  - "incidents"
  - "DevOps"
  - "développement"
sources:
  - "https://github.com/dj9889/sitrep"
---

## TL;DR en langage simple

- Sitrep est un copilote d'incident open‑source qui observe l'écran d'un opérateur pendant un incident et associe des vignettes visuelles à la télémétrie (intégration Grafana LGTM + instrumentation OpenTelemetry GenAI semconv). Voir le dépôt : https://github.com/dj9889/sitrep.
- Objectif immédiat : réduire le temps passé à retrouver trace_id et preuves visuelles en joignant automatiquement une vignette d'écran aux traces/logs visible dans Grafana.
- Recommandation courte : lancer un pilote local limité et centré sur la confidentialité avant toute mise en production. Référez‑vous au README du dépôt pour les détails d'implémentation : https://github.com/dj9889/sitrep.

Méthodologie : synthèse du README et des fichiers du dépôt cité ci‑dessous.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez déployer une instance locale de Sitrep telle que décrite dans le dépôt GitHub (https://github.com/dj9889/sitrep) : un flux client qui capture des mini‑images d'écran → pipeline de déduplication → liaison aux traces/logs via Grafana + OpenTelemetry GenAI semconv.

Pourquoi c'est utile (extrait fonctionnel du dépôt) :
- Preuves visuelles attachées automatiquement aux traces dans Grafana pour accélérer les enquêtes (https://github.com/dj9889/sitrep).
- Réduction des allers‑retours entre chat et tableau de bord : contexte visuel disponible immédiatement.

## Avant de commencer (temps, cout, prerequis)

Prérequis techniques (vérifiez le README du dépôt) :
- Accès au dépôt : https://github.com/dj9889/sitrep.
- Environnements possibles : local Docker/Docker Compose ou instances contenant un client de capture côté poste d'astreinte (voir le repo pour exemples).
- Accès à Grafana (URL + clé API en lecture seule recommandée) et, si vous utilisez des traces, un collecteur OpenTelemetry/OTLP.

Checklist pré‑pilotage :
- [ ] Cloner le dépôt : https://github.com/dj9889/sitrep
- [ ] Docker / Docker Compose disponibles
- [ ] URL Grafana + clé API lecture seule prêtes
- [ ] (Optionnel) Endpoint OpenTelemetry disponible

## Installation et implementation pas a pas

Flux attendu : client de capture → pipeline de déduplication → liaison vignette ↔ trace_id → publication dans Grafana. Les étapes suivantes reprennent les commandes et exemples fournis dans le dépôt : https://github.com/dj9889/sitrep.

1) Cloner et inspecter le dépôt

```bash
git clone https://github.com/dj9889/sitrep
cd sitrep
ls -la
```

2) Construire et démarrer (exemple Docker Compose fourni dans le dépôt)

```bash
docker compose up --build -d
docker compose logs -f sitrep
```

3) Exemple de configuration Grafana (remplacez URL/clé). Voir le dossier de config du dépôt : https://github.com/dj9889/sitrep

```json
{
  "grafana_url": "https://grafana.example.com",
  "api_key": "REPLACE_WITH_READONLY_KEY",
  "dashboards": ["/api/dashboards/db/example"]
}
```

4) Exemple minimum pour OpenTelemetry Collector (OTLP) si vous exportez des traces ; adaptez depuis le repo : https://github.com/dj9889/sitrep

```yaml
receivers:
  otlp:
    protocols:
      http: {}
exporters:
  logging:
    logLevel: debug
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [logging]
```

5) Lancer le client de capture sur le poste d'astreinte en mode restreint (limiter applications surveillées) et exécuter un test de bout en bout décrit dans le dépôt : https://github.com/dj9889/sitrep.

## Problemes frequents et correctifs rapides

- Captures trop fréquentes / dupliquées
  - Correctif : ajuster la fenêtre de capture et la liste d'applications surveillées (voir options dans le dépôt : https://github.com/dj9889/sitrep).

- Traces introuvables dans Grafana
  - Correctif : vérifier la clé API, la configuration OTLP et la visibilité des traces dans Grafana via l'API listée dans le repo.

- Préoccupations confidentialité
  - Correctif : activer le mode blackout, restreindre la portée de capture et faire une revue manuelle avant élargissement (exemples et recommandations : https://github.com/dj9889/sitrep).

Commandes de diagnostic utiles (extraites des pratiques du dépôt) :

```bash
docker compose ps
docker compose logs sitrep --tail 200
curl -H "Authorization: Bearer $GRAFANA_KEY" https://grafana.example.com/api/org
```

## Premier cas d'usage pour une petite equipe

Cible : fondateurs solo ou équipes réduites. Le dépôt décrit l'association écran↔trace et l'intégration Grafana/OTel (https://github.com/dj9889/sitrep). Voici des conseils concrets et actionnables pour une petite équipe/solo founder :

1) Déployer localement en 30–60 minutes pour un test rapide
- Action : cloner le dépôt et lancer le stack en local via Docker Compose (commande ci‑dessus). Vérifiez que Grafana est accessible et que la clé API est en lecture seule. Référence : https://github.com/dj9889/sitrep.

2) Limiter immédiatement la portée de capture
- Action : configurer la liste d'applications autorisées (navigateur, tableaux de bord) et activer le mode blackout par défaut. Ne capturez pas tout l'écran jusqu'à validation. Le dépôt inclut des options de configuration pour la portée : https://github.com/dj9889/sitrep.

3) Automatiser des gardes‑fous simples
- Action : mettre en place un script local qui active/désactive la capture en fonction d'un flag (par ex. fichier /tmp/sitrep_enable) et un webhook d'alerte pour audit manuel. Utilisez les hooks/metrics exposés par le projet : https://github.com/dj9889/sitrep.

4) Mesurer peu et utile
- Action : collectez 3 métriques clés pendant le pilote : temps moyen pour relier une preuve à une trace, nombre de vignettes traitées, et nombre d'activations blackout. Enregistrez ces valeurs localement avant d'élargir la portée. Voir les métriques suggérées dans le dépôt : https://github.com/dj9889/sitrep.

5) Itérer rapidement
- Action : en tant que fondateur solo, limitez le pilote à vos propres sessions d'astreinte pendant 7–14 jours (voir Hypothèses) ; corrigez la configuration et automatisez les suppressions de vignettes sensibles.

Ces étapes minimisent les risques opérationnels et de confidentialité tout en vous donnant une preuve de concept fonctionnelle, basée sur les composants décrits dans le dépôt : https://github.com/dj9889/sitrep.

## Notes techniques (optionnel)

Architecture synthétique (extrait du dépôt) : client de capture → pipeline de déduplication des vignettes → moteur d'interrogation Grafana/OTel → assistant qui joint vignette + lien trace (https://github.com/dj9889/sitrep). Le dépôt mentionne explicitement l'instrumentation OpenTelemetry GenAI semconv.

Métriques techniques suggérées (référence dans le repo) : latence de réponse, taux de faux‑positifs, nombre de vignettes traitées, activations blackout. Exemple simple :

| Indicateur | Unité | Usage |
|---|---:|---|
| latence de réponse | ms | SLA interne / diagnostic |
| faux‑positifs | % | qualité des preuves |
| vignettes traitées | count | charge du pipeline |

Pour plus d'éléments techniques et fichiers d'exemple : https://github.com/dj9889/sitrep.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse : le README du dépôt est la source d'autorité pour capacités et exemples de configuration : https://github.com/dj9889/sitrep.
- Hypothèse : le dépôt contient des exemples Docker Compose, des configurations Grafana et des fragments pour l'OTel Collector ; si un fichier manque, il faudra en créer un minimal.
- Paramètres opérationnels proposés (à valider en pilote) : 14 jours de pilote, 2 heures pour une installation locale minimale, 1–3 personnes pour le pilote, plafond initial 4 000 tokens/jour montant à 50 000 tokens/jour pour tests intensifs, débit recommandé 10 requêtes/minute par utilisateur, intervalle de capture initial 500 ms (ajuster entre 250–2000 ms), taille de tuile 256 px (128–512 px), seuil de déduplication Hamming 10 (5–30), critères canary 10% → 50% → 100% progression, critère d'arrêt : augmentation d'erreur >20% ou latence >2× baseline pendant 15 minutes, alertes budget à 80%.

### Risques / mitigations

- Risque : fuite d'informations sensibles via captures d'écran.
  - Mitigation : mode blackout, liste d'applications autorisées, revue manuelle avant production, suppression automatique des images sensibles.
- Risque : faux positifs qui entraînent actions incorrectes.
  - Mitigation : validation manuelle pendant le pilote, seuil d'acceptation (<5% en objectif), audits réguliers.
- Risque : dépassement de budget (tokens / modèles).
  - Mitigation : plafonds journaliers en $ et tokens, limites de débit (par ex. 10 q/min), alertes à 80% du budget.
- Risque : permissions excessives sur Grafana.
  - Mitigation : n'utiliser que des clés en lecture seule et appliquer le principe du moindre privilège.

### Prochaines etapes

- Lancer un pilote local limité en suivant le README : https://github.com/dj9889/sitrep.
- Mesurer quotidiennement coût (USD), temps médian pour obtenir une preuve (s), taux de faux‑positifs (%) et activations blackout (count).
- Valider critères de passage en production : dépenses sous plafond pendant 7 jours consécutifs, incidents de confidentialité = 0, taux de faux‑positifs <5%.
- Préparer plan canary (10% → 50% → 100%) avec gates de sécurité de 24 h par palier et rollback automatique si erreur >20% ou latence >2× baseline pendant 15 min.
- Après validation : provisionner clés Grafana lecture seule, documenter procédures d'astreinte (qui active le blackout, qui approuve rollback) et automatiser le déploiement canary.

Commencez par cloner le dépôt et suivez le README : https://github.com/dj9889/sitrep.
