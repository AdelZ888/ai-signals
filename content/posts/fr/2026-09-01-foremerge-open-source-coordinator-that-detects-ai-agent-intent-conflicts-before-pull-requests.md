---
title: "Foremerge : coordinatrice open-source pour détecter les conflits d'intention des agents avant les pull requests"
date: "2026-09-01"
excerpt: "Foremerge est présenté comme une couche de coordination open-source au‑dessus de Git qui enregistre des « intents » JSON d'agents et permet de repérer des plans incompatibles avant que du code ne soit écrit. Ce guide FR explique comment l'installer, l'intégrer en CI et l'utiliser en équipe réduite."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-01-foremerge-open-source-coordinator-that-detects-ai-agent-intent-conflicts-before-pull-requests.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "foremerge"
  - "coordination"
  - "agents"
  - "git"
  - "ci"
  - "ai-dev"
sources:
  - "https://github.com/naw103/foremerge"
---

## TL;DR en langage simple

- Foremerge est un protocole open-source pour coordonner des "intents" avant d'écrire du code. Source : https://github.com/naw103/foremerge.
- Les "agents" annoncent ce qu'ils veulent faire (un "intent"). Foremerge compare ces annonces et signale les plans incompatibles avant qu'un merge (fusion) n'apporte du code en base.
- Résultat attendu : moins de merges cassés, moins de temps perdu en corrections, et plus de clarté pour les équipes.
- Déploiement rapide attendu : prototype local en ~2 heures, intégration dans la CI (intégration continue) en 2–8 heures (hypothèse à valider).

Exemple concret court : Agent A poste un intent pour supprimer le paramètre "x" d'une API. Agent B poste un intent pour rendre "x" requis. Foremerge signale un conflit d'intention avant qu'une pull request (PR, demande de fusion) n'arrive en code.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez créer un prototype (proof of concept, POC) de Foremerge en local ou en conteneur. Puis vous ajouterez une vérification dans votre CI pour interroger Foremerge lors des PR. Le but : détecter des conflits d'intention (par exemple deux agents modifiant la même API) avant que le code ne soit fusionné.

Pourquoi c'est utile :
- Détection précoce des conflits d'intention. Moins de corrections urgentes après merge.
- Mise en place rapide pour tester l'effet sur votre flux de travail.
- Historique des intentions et des décisions conservé dans le dépôt pour revue et audit.

Référence projet : https://github.com/naw103/foremerge (le dépôt décrit Foremerge comme un protocole de coordination construit au‑dessus de Git).

## Avant de commencer (temps, cout, prerequis)

- Temps estimé : ~2 heures pour un prototype local; 2–8 heures pour adapter les politiques et intégrer la CI (chiffres proposés, à valider).
- Coût : logiciel open-source gratuit. Comptez des coûts d'infrastructure (VM, minutes CI). Exemple indicatif : 0,10–5 USD/jour pour une petite VM de test (hypothèse).
- Prérequis techniques : Git; un dépôt de test; un runner CI capable d'appeler une API HTTP; un ou plusieurs scripts/agents pouvant POSTer du JSON vers un service HTTP.

Checklist initiale :
- [ ] Cloner https://github.com/naw103/foremerge
- [ ] Créer le dossier .foremerge/ dans votre dépôt de test pour y stocker les politiques (POC)
- [ ] Ajouter un workflow CI qui interroge Foremerge
- [ ] Lancer deux agents de test pour valider la détection

Remarque méthodologique courte : commencez en mode "monitoring" (surveillance) avant d'activer des blocages automatiques. Mesurez 1–2 semaines puis adaptez.

Explication simple avant les détails techniques :
- Un "agent" est un script ou un outil qui décrit une intention de changement sous forme d'objet JSON (ex. type = "api-change", scope = "/v1/orders").
- Foremerge reçoit ces intents via une API HTTP. Il compare les intents entre eux et applique une table de décision ou des règles. Il renvoie un résultat : ok, require-review (requiert revue humaine), ou block (bloque).
- Vous intégrez cet appel dans votre CI ou votre processus de PR pour agir avant que le code ne soit fusionné.

## Installation et implementation pas a pas

1) Cloner le dépôt

```bash
git clone https://github.com/naw103/foremerge
cd foremerge
ls -la
# Le dépôt source : https://github.com/naw103/foremerge
```

2) Exécuter une instance locale (exemple POC, à valider contre la doc du repo)

```bash
# Exemple conteneur local (image et tag hypothétiques)
docker run --rm -p 8080:8080 naw103/foremerge:local
# Attendre une API HTTP sur http://localhost:8080
```

3) Exemple de table de décision (POC — valider le format exact)

| intent_type     | scope       | action         |
|-----------------|-------------|----------------|
| api-change      | endpoint    | require-review |
| refactor        | module      | allow          |
| breaking-change | public-api  | block          |

(Cette table est un exemple POC. Voir https://github.com/naw103/foremerge pour le projet source.)

4) Exemple de config (.foremerge/config.yaml) — proposition

```yaml
service:
  endpoint: "http://localhost:8080"
  token: "REPLACE_TOKEN"
metrics:
  enabled: true
```

5) Exemple d'envoi d'un intent (curl)

```bash
curl -X POST http://localhost:8080/intents \
  -H "Authorization: Bearer TOKEN123" \
  -H "Content-Type: application/json" \
  -d '{"agent":"agent-A","intent_type":"api-change","scope":"/v1/orders","details":"remove param x"}'
```

6) Exemple de job GitHub Actions (POC)

```yaml
name: Foremerge check
on: [pull_request]
jobs:
  foremerge:
    runs-on: ubuntu-latest
    steps:
      - name: Call Foremerge
        run: |
          curl -s -f -X POST "$FOREMERGE_URL/check" \
            -H "Authorization: Bearer ${{ secrets.FOREMERGE_TOKEN }}" \
            -d '{"pr": "$GITHUB_REF"}' || (echo "Foremerge check failed" && exit 1)
```

Remarque : l'image Docker, les endpoints et la syntaxe exacte sont des hypothèses ici. Vérifiez la documentation du dépôt : https://github.com/naw103/foremerge.

## Problemes frequents et correctifs rapides

Source utile : https://github.com/naw103/foremerge

- Agents n'envoient pas d'intents
  - Vérifiez l'URL et le token. Testez avec le curl ci‑dessus. Attendez un code HTTP 200 ou 202 selon l'implémentation.
- Le contrôle CI passe alors qu'il devrait alerter
  - Assurez-vous que .foremerge/decision-table.csv (ou le format attendu) est présent et lisible par le runner CI.
  - Confirmez que le runner peut joindre Foremerge (testez la latence et la connectivité).
- Erreurs d'autorisation
  - Vérifiez que le token CI a les droits nécessaires. Préférez un compte de service avec le moindre privilège.
- Faux positifs
  - Démarrez en surveillance (monitoring-only) avant d'activer le blocage automatique. Ajustez les règles.

Checklist de dépannage rapide :
- [ ] Endpoint accessible depuis la CI (test ping / curl)
- [ ] Token valide et non expiré
- [ ] Decision table présente et syntaxe correcte
- [ ] Agents respectent le schéma JSON attendu

(Se référer à la doc du dépôt : https://github.com/naw103/foremerge pour les codes HTTP et comportements précis.)

## Premier cas d'usage pour une petite equipe

Référence projet : https://github.com/naw103/foremerge

Scénario concret (équipe 2–3 personnes) :
- Agent A soumet un intent pour supprimer un paramètre. Agent B soumet un intent pour rendre ce même paramètre requis. Les deux intents ciblent la même ressource.
- Foremerge signale un conflit d'intention avant qu'une PR contienne du code. Cela évite un merge cassé.

Playbook rapide :
1. Foremerge annote la PR et envoie une alerte (Slack ou email). Intégration à configurer.
2. Le responsable de triage examine le conflit. Service-level agreement (SLA, accord de niveau de service) suggéré : triage en 24 heures (hypothèse).
3. Modifier la règle dans .foremerge/decision-table.csv si nécessaire et valider la résolution.

Conseils pour un fondateur solo :
- Restez en mode monitoring pendant 1–2 semaines. Mesurez le taux de conflits d'intention.
- N'activez pas le blocage automatique tant que les faux positifs ne sont pas maîtrisés.

## Notes techniques (optionnel)

Voir le projet sur GitHub : https://github.com/naw103/foremerge

Points techniques (haut niveau) :
- Concept : l'intent est un objet séparé du code. Les agents publient des intents typés (api-change, refactor, breaking-change).
- Interface : service HTTP prototypique, authentifié par token Bearer (pattern évoqué; détails à valider).
- Intégration : adaptez des adaptateurs pour transformer vos propositions de changement en intents JSON, puis POSTez-les vers l'API.
- Observabilité proposée (exemples) : intent_conflict_count (compteur), conflict_latency_ms (histogramme). Alertes possibles si intent_conflict_rate > 5% ou p95 latency > 500 ms (seuils POC).

Exemple JSON métriques (POC)

```json
{
  "metrics": {
    "intent_conflict_count": "gauge",
    "conflict_latency_ms": "histogram"
  },
  "alerts": {
    "high_conflict_rate": {"threshold_pct": 5}
  }
}
```

Sécurité : protégez les submissions par tokens, appliquez rotation, stockez les secrets dans le coffre CI.

(Informations basées sur le projet listé sur https://github.com/naw103/foremerge ; formats exacts à valider.)

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Le dépôt indique que Foremerge est un protocole de coordination open-source construit au‑dessus de Git : https://github.com/naw103/foremerge (extrait source).
- Détails opérationnels non vérifiés dans l'extrait : syntaxe exacte de .foremerge/decision-table.csv, endpoints API précis, images Docker publiques, tags d'image, codes de réponse HTTP exacts, et schémas JSON complets. Ces éléments sont listés comme hypothèses et doivent être validés en test.
- Hypothèses numériques à valider : prototype = 2 h, adaptation = 2–8 h, canary = 7 jours, monitoring = 14 jours, blocage après 30 jours, latence cible p95 < 500 ms, latence CI < 5 s, objectif KPI conflit < 2%.

### Risques / mitigations

- Risque : blocages causés par faux positifs.
  - Mitigation : mode monitoring-only d'abord; require-review (revue humaine requise) avant blocage.
- Risque : indisponibilité du service affectant les PR.
  - Mitigation : définir un SLO (service-level objective), prévoir un feature flag de contournement et un plan de rollback.
- Risque : fuite de tokens.
  - Mitigation : rotation régulière, stockage des secrets dans un coffre sécurisé, principes du moindre privilège.

### Prochaines etapes

1. Canary : déployer sur 1 dépôt ou ~10% des dépôts pendant 7 jours.
2. Monitoring : activer le mode surveillance 14 jours, collecter intent_conflict_count et conflict_latency_ms.
3. Require-review : exiger revue humaine 14 jours; viser SLA de triage = 24 h et conflit < 5% (POC).
4. Block : activer blocages automatiques après 30 jours de métriques stables.

Checklist opérationnelle immédiate :
- [ ] Cloner https://github.com/naw103/foremerge et lancer une instance locale (POC)
- [ ] Ajouter .foremerge/decision-table.csv à un dépôt de test
- [ ] Ajouter un workflow CI qui appelle Foremerge et viser une latence <5 s pour vos runners
- [ ] Lancer un test à deux agents pour vérifier la détection des conflits d'intention

Sources

- Projet principal : https://github.com/naw103/foremerge (référence utilisée pour la description du projet).

Remarque : les extraits factuels proviennent du dépôt listé ci‑dessus; les commandes, formats et seuils proposés ici sont des suggestions POC et doivent être validés en test.
