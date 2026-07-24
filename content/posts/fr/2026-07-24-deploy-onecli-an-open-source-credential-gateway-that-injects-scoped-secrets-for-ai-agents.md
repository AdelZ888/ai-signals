---
title: "Déployer OneCLI — une passerelle open‑source d'identifiants qui injecte des secrets limités pour agents IA"
date: "2026-07-24"
excerpt: "Guide de 60–90 minutes pour déployer OneCLI : une passerelle open‑source qui proxyfie les requêtes des agents, applique des règles réseau et injecte des identifiants limités afin que les agents ne voient jamais les clés brutes."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-24-deploy-onecli-an-open-source-credential-gateway-that-injects-scoped-secrets-for-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "OneCLI"
  - "sécurité"
  - "agents IA"
  - "proxies"
  - "secrets"
  - "déploiement"
  - "Royaume‑Uni"
sources:
  - "https://onecli.sh"
---

## TL;DR en langage simple

- OneCLI est une passerelle (gateway) open‑source qui centralise et injecte des identifiants pour des agents d'IA ; les agents n'obtiennent jamais la valeur brute des clés (source : https://onecli.sh).
- Les règles (policies) sont appliquées au niveau réseau : si la passerelle n'injecte pas un secret, l'agent ne le reçoit pas (source : https://onecli.sh).
- L'interface montre la gestion centralisée et les journaux d'injection (ex. « 7 keys exposed to agents » visible sur la page produit : https://onecli.sh).

Exemple concret (illustratif) : un agent doit créer une pull request sur GitHub sans avoir le token en clair. L'agent effectue une requête HTTP vers sa cible ; OneCLI injecte un jeton scoped pour cette requête seulement et l'agent ne voit pas la valeur du secret (voir https://onecli.sh).

Note méthodologique (très courte) : tout exemple de commande ou de configuration ci‑dessous est illustratif — vérifiez les flags et le schéma exact sur https://onecli.sh.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez déployer une passerelle OneCLI minimale pour :

- proxifier le trafic sortant de vos agents,
- appliquer des policies au niveau réseau,
- injecter des identifiants scoped à la requête sans exposer la valeur aux agents.

Pourquoi c'est utile (source : https://onecli.sh) :

- Réduction du risque d'exfiltration : les agents ne détiennent pas la valeur des clés.
- Application des règles hors du modèle (network layer), ce qui limite la capacité d'un prompt ou d'un agent à forcer la fuite d'un secret.
- Traçabilité centralisée des injections et visibilité dans l'UI (ex. création/liste des clés exposées) sur https://onecli.sh.

Tableau rapide (features documentées sur https://onecli.sh)

| Fonctionnalité documentée | OneCLI |
|---|---:|
| Injection d'identifiants au niveau réseau | Oui |
| Les agents voient la valeur des clés | Non |
| Credentials scoped injectés par requête | Oui |
| Interface / logs montrant les clés exposées | Oui (ex. « 7 keys exposed to agents ») |

## Avant de commencer (temps, cout, prerequis)

Prérequis minimaux (préparez ces éléments avant d'essayer un quickstart) :

- Accès à la documentation et quickstart : https://onecli.sh
- Un poste de développeur ou une VM pour lancer un test local (terminal/CLI disponible)
- Un jeton d'API limité (scoped) pour tester l'injection (ex. token GitHub limité)

Checklist courte avant démarrage :

- [ ] Consulter le quickstart sur https://onecli.sh
- [ ] Préparer un token scoped pour test
- [ ] Accès à une machine pour tester le proxy (local/VM)

(Remarque : durées exactes d'installation et coûts d'infra varient selon votre environnement — voir Hypotheses / inconnues pour des estimations chiffrées proposées.)

## Installation et implementation pas a pas

1) Lire le quickstart officiel sur https://onecli.sh.

2) Exemple illustratif pour lancer une instance locale (vérifier la procédure officielle sur https://onecli.sh) :

```bash
# exemple illustratif — adapter selon la doc officielle
# build / run local (image/nom d'image à adapter)
git clone https://example/onecli-repo.git  # remplacer par le repo officiel indiqué sur onecli.sh
cd onecli
docker build -t onecli:local .
docker run --name onecli -p 8080:8080 onecli:local
```

3) Exemple illustratif de policy (format pédagogique) — consultez la doc officielle pour le schéma exact :

```yaml
# policy exemple — adapter au schéma officiel indiqué sur https://onecli.sh
policies:
  - id: gh-pr-only
    match:
      host: api.github.com
      path: /repos/mon-org/mon-repo/*
    secret_id: github_pr_token
    actions:
      - inject-header: Authorization
```

4) Diriger le trafic des agents vers OneCLI :

- Méthode simple (test) : configurer HTTP_PROXY/HTTPS_PROXY de l'agent pour pointer vers OneCLI.
- Méthode réseau (prod) : restreindre l'egress pour forcer la sortie via la passerelle.

5) Test canari de bout en bout :

- Démarrer un agent de test qui utilise le proxy.
- Effectuer une requête ciblée (ex. création d'une PR ou appel API protégé).
- Vérifier dans les logs/UI de OneCLI l'injection et l'événement d'audit (voir https://onecli.sh).

## Problemes frequents et correctifs rapides

Gateway inaccessible
- Symptôme : aucune réponse via le proxy.
- Vérifier : le processus/conteneur OneCLI est‑il lancé ? Le port est‑il exposé (ex. 8080) ? (voir https://onecli.sh)
- Correctif fréquent : redémarrer le conteneur/pod, vérifier configuration réseau.

L'agent contourne la gateway
- Symptôme : trafics sortants visibles hors proxy.
- Vérifier : HTTP_PROXY/HTTPS_PROXY configurés sur l'agent ? Règles d'egress applicables ?
- Correctif : forcer proxy côté agent et/ou verrouiller egress ; appliquer deny‑by‑default.

401 / 403 après injection
- Symptôme : requête rejetée malgré injection.
- Vérifier : la policy cible le bon host/path et le token a le scope requis.
- Correctif : ajuster la policy ou utiliser un token scoped approprié.

Latence accrue
- Symptôme : hausse de latence observée (P95/P99).
- Vérifier : mesurer p95/p99 en ms ; vérifier charge et réplicas.
- Correctif : ajouter réplicas, activer autoscale, optimiser réseau.

Commandes de debug (illustratif) :

```bash
# suivre les logs (exemple)
docker logs -f onecli
# tester le proxy depuis la machine de test
curl -x http://localhost:8080 -v https://api.github.com/
```

Pour l'UI et les exemples d'audit, voir https://onecli.sh.

## Premier cas d'usage pour une petite equipe

Contexte : vous êtes fondateur solo ou petite équipe (1–5 personnes) et vous voulez autoriser un agent à créer des PR sans distribuer de token en clair. (Voir https://onecli.sh)

Actions concrètes et actionnables :

1) Générer et importer un token scoped
- Créez un token GitHub limité au dépôt cible (scope minimal).
- Importez ce secret dans OneCLI sous un nom lisible (ex. github_pr_token) et assignez‑l à une policy restreinte. (Voir https://onecli.sh pour l'interface.)

2) Déployer localement un test canari rapide
- Démarrez une instance OneCLI locale et configurez votre agent pour utiliser HTTP_PROXY pointant vers OneCLI.
- Lancez une PR de test et vérifiez dans l'UI/logs que l'injection a eu lieu.

3) Limiter le blast radius immédiatement
- Écrire une règle qui cible uniquement le host/path du dépôt (host=api.github.com, path=/repos/votre‑org/votre‑repo/*).
- Autoriser 1 seul type d'action (ex. création de PR) et refuser tout le reste (deny‑by‑default conceptuel).

4) Automatiser la vérification et la rotation (niveau minimal)
- Commencez avec 1 secret et 1 règle en prod. Automatisez une vérification manuelle hebdomadaire des logs d'injection la première semaine.
- Planifiez la rotation (voir Hypotheses / inconnues pour valeurs recommandées).

5) Surveillance basique pour une petite équipe
- Configurez alertes simples sur : absence d'audit, erreurs 401/403, et hausse de latence perçue.
- Export minimal : envoyer les événements d'audit vers un canal Slack ou email pour revue manuelle.

Documentation et quickstarts : https://onecli.sh.

## Notes techniques (optionnel)

- Points tirés de la page produit : OneCLI injecte des credentials au network layer, « keys never leave the vault » et « Agents never hold a real secret » (source : https://onecli.sh).
- Les patterns courants pour forcer le trafic via la gateway incluent configuration de proxy (HTTP_PROXY/HTTPS_PROXY) ou verrouillage d'egress réseau (concepts répertoriés dans la doc publique : https://onecli.sh).
- L'UI montre la visibilité centralisée des clés et des événements d'injection (ex. « 7 keys exposed to agents »), utile pour les revues opérationnelles.

Acronymes : LLM (large language model), CLI (command‑line interface), PR (pull request), SIEM (security information and event management).

## Que faire ensuite (checklist production)

- [ ] Valider un run local de bout en bout avec 1 agent et 1 secret ; vérifier l'audit (voir https://onecli.sh).
- [ ] Mettre en place l'export des logs d'audit vers un SIEM ou canal de revue.
- [ ] Automatiser la rotation des credentials selon votre politique (voir Hypotheses / inconnues).
- [ ] Planifier monitoring : mesurer P95/P99 en ms et alerter sur taux d'erreur.
- [ ] Effectuer un canari progressif avant passage en production.

### Hypotheses / inconnues

- Durées estimées (exemples opérationnels non extraits de la page produit) : test local complet ≈ 60–90 minutes ; validation canari recommandée 24–72 heures.
- Rollout recommandé (exemple) : canari 5% → 30% → 100% du trafic.
- HA / sizing (recommandation pratique) : commencer avec 3 réplicas pour tolérance de panne ; augmenter selon charge.
- Rotation et secrets (recommandation) : rotation ≤ 30 jours pour tokens à usage élevé ; commencer 1–3 secrets pour une petite équipe.
- Seuils d'alerte suggérés : taux d'erreur cible < 1% sur 5 minutes ; déclencher revue si P95 augmente de +50 ms.
- Coût / infra dépend du fournisseur : prévoir $0–$X/mois selon l'hébergement et le volume (à chiffrer sur votre infra).

(ces chiffres sont des recommandations pratiques — vérifier l'adaptation à votre contexte et la doc officielle sur https://onecli.sh)

### Risques / mitigations

- Risque : contournement du gateway par l'agent. Mitigation : appliquer HTTP(S)_PROXY et verrouiller l'egress réseau ; politique deny‑by‑default (voir https://onecli.sh).
- Risque : policies trop larges ouvrant un scope excessif. Mitigation : démarrer avec host/path précis et tokens à durée limitée.
- Risque : latence et régression UX. Mitigation : mesurer P95/P99 en ms, ajouter réplicas et autoscale avant montée en charge.

### Prochaines etapes

1) Exécuter le test local complet (≈ 60–90 minutes estimate).  
2) Lancer un canari 24–72 heures à 5% du trafic, puis augmenter progressivement.  
3) Automatiser rotation et export d'audit vers SIEM.  
4) Passer en production avec monitoring des métriques P95/P99 et alertes (<1% d'erreur cible).

Pour le quickstart, la doc et les schémas officiels, consulter : https://onecli.sh.
