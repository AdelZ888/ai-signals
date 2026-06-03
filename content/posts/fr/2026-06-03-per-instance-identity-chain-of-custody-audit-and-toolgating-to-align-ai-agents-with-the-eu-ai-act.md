---
title: "Identité par instance, chaîne de custodie et contrôle d'outils pour aligner les agents IA avec le règlement européen sur l'IA"
date: "2026-06-03"
excerpt: "Checklist pratique pour rendre les agents IA traçables et contrôlables : identifiants courts par instance, journaux de chaîne de custodie et plan de politique externe pour le contrôle des appels d'outils (inspiré par Cerbos)."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-03-per-instance-identity-chain-of-custody-audit-and-toolgating-to-align-ai-agents-with-the-eu-ai-act.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 480
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "sécurité"
  - "agents"
  - "conformité"
  - "EU AI Act"
  - "audit"
  - "Cerbos"
sources:
  - "https://www.cerbos.dev/blog/authorization-for-ai-agents-what-to-build-before-eu-ai-act-deadline"
---

## TL;DR en langage simple

- Les agents d'IA peuvent lancer d'autres agents et appeler des outils externes. Ceci crée des chaînes d'actions difficiles à tracer. (source : https://www.cerbos.dev/blog/authorization-for-ai-agents-what-to-build-before-eu-ai-act-deadline)

- Cerbos identifie trois problèmes clairs : identité par instance, audit de la chaîne de custodie, et orchestration / contrôle d'accès aux outils. Ces trois éléments manquent souvent aujourd'hui. (source : https://www.cerbos.dev/blog/authorization-for-ai-agents-what-to-build-before-eu-ai-act-deadline)

- Pour un prototype, commencez par ces trois choses : donner une identité par instance, enregistrer qui a "sponsorisée" l'agent, et déplacer les décisions allow/deny hors de l'agent vers un plan de politique externe. (source : https://www.cerbos.dev/blog/authorization-for-ai-agents-what-to-build-before-eu-ai-act-deadline)

Méthodologie : synthèse guidée par le billet Cerbos ci‑dessus.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez assembler trois composants simples, déjà nommés dans le cadrage Cerbos : identité par instance, audit détaillé, et un "policy plane" externe. Ces composants rendent les agents traçables et contrôlables, et aident à satisfaire des exigences de sécurité ou de conformité qui s'appliquent aux comportements automatisés. (source : https://www.cerbos.dev/blog/authorization-for-ai-agents-what-to-build-before-eu-ai-act-deadline)

- Identité par instance : éviter l'usage d'une seule clé longue pour toutes les instances. L'identité doit être liée à un sponsor humain.
- Audit de la chaîne de custodie : chaque délégation (agent → sous‑agent → outil) doit produire des traces lisibles indiquant qui a autorisé quoi.
- Orchestration / policy plane : les règles allow/deny s'exécutent hors de l'agent pour empêcher l'agent d'auto‑autorisers des actions sensibles.

(source : https://www.cerbos.dev/blog/authorization-for-ai-agents-what-to-build-before-eu-ai-act-deadline)

## Avant de commencer (temps, cout, prerequis)

Préconditions minimales :

- Un cadre d'agent modifiable pour ajouter sponsor_id et agent_instance_id à chaque instance. (source : https://www.cerbos.dev/blog/authorization-for-ai-agents-what-to-build-before-eu-ai-act-deadline)
- Un moyen d'émettre et de révoquer des identifiants (service de tokens ou équivalent).
- Une canalisation de logs pour conserver les événements d'audit et les corréler (SIEM ou stockage structuré).
- Approbation d'un sponsor produit/tech et revue juridique sur la rétention des logs.

Estimation opérationnelle : prototype possible en quelques jours à quelques semaines selon disponibilité des personnes et des environnements. (source : https://www.cerbos.dev/blog/authorization-for-ai-agents-what-to-build-before-eu-ai-act-deadline)

## Installation et implementation pas a pas

Ordre recommandé : identité → audit → orchestration. Testez après chaque étape. (source : https://www.cerbos.dev/blog/authorization-for-ai-agents-what-to-build-before-eu-ai-act-deadline)

1) Identité (service d'émission de tokens)
- Fournir un token par instance qui contient sponsor_id et agent_instance_id.
- Permettre la validation et la révocation des tokens hors du modèle.
- Lier la durée de vie du token au sponsor humain (cycle de vie nommé).

2) Audit
- Chaque appel d'outil doit produire un enregistrement d'audit clair indiquant au minimum : timestamp, sponsor_id, agent_instance_id, parent_agent_id, tool_id, purpose.
- Pousser ces événements vers votre canal SIEM ou stockage central.

3) Orchestration / policy plane
- Externaliser les décisions allow/deny. L'agent demande au policy plane avant d'appeler un outil sensible.
- Prévoir un comportement sûr si le policy plane est injoignable (mode fail‑closed mentionné dans le cadrage). (source : https://www.cerbos.dev/blog/authorization-for-ai-agents-what-to-build-before-eu-ai-act-deadline)

4) Tests et déploiement progressif
- Tests unitaires et d'intégration pour la propagation des IDs et la génération d'audit.
- Rollout progressif (canary / feature flag) et monitorage des métriques clés.

## Problemes frequents et correctifs rapides

(voir le cadrage Cerbos : https://www.cerbos.dev/blog/authorization-for-ai-agents-what-to-build-before-eu-ai-act-deadline)

- Problème : une seule clé API longue pour toutes les instances. Correctif : émettre des tokens courts par instance, liés à un sponsor.
- Problème : perte de la chaîne de custodie quand un agent crée un sous‑agent. Correctif : propager parent_agent_id et sponsor_id dans le token et dans les logs.
- Problème : l'agent s'auto‑autorise pour des outils sensibles. Correctif : exiger une décision signée par le policy plane.
- Problème : latence du policy plane. Correctif rapide : cache court des décisions côté runtime et instrumentation de la latence.

Surveillance rapide : alertes SIEM sur événements sans sponsor_id et sur erreurs du policy plane. (source : https://www.cerbos.dev/blog/authorization-for-ai-agents-what-to-build-before-eu-ai-act-deadline)

## Premier cas d'usage pour une petite equipe

Contexte : vous êtes fondateur solo ou une petite équipe (1–5 personnes). Vous voulez un assistant qui tri les tickets et peut appeler l'API de facturation. (source : https://www.cerbos.dev/blog/authorization-for-ai-agents-what-to-build-before-eu-ai-act-deadline)

Conseils concrets et actionnables pour une petite équipe / solo founder :

- Minimiser la surface : démarrez en local/staging avec un service de tokens simple qui émet un token par instance. Branchez ce service à votre agent en 1–2 heures pour valider le flux d'identité.

- Log minimal utile : enrichissez chaque log d'appel d'outil avec sponsor_id, agent_instance_id et parent_agent_id. Configurez un fichier log structuré (JSON) ou un bucket simple pour corrélation avant d'ajouter un SIEM.

- Isoler les appels sensibles : mettez l'API de facturation derrière un adaptateur/gateway qui demande au policy plane une décision avant d'exécuter la requête. Si vous n'avez pas de policy plane prêt, ajoutez un verrou manuel (approval workflow) pour les premières 50–100 opérations critiques.

- Itérer par incréments courts : testez le chemin bout à bout pour 10–20 tickets, vérifiez que chaque action a sponsor_id, puis élargissez l'usage.

- Automatiser les contrôles basiques : scripts/bot qui refusent les appels sans sponsor_id et qui envoient une alerte Slack/Email pour chaque événement critique.

(source : https://www.cerbos.dev/blog/authorization-for-ai-agents-what-to-build-before-eu-ai-act-deadline)

- [ ] Déployer token service minimal en staging
- [ ] Ajouter sponsor_id + parent_agent_id dans les logs
- [ ] Mettre l'API facturation derrière un adaptateur de contrôle

## Notes techniques (optionnel)

Rappel conceptuel depuis Cerbos : la solution se découpe en identité par instance, audit de la chaîne, et orchestration externe. Les détails d'implémentation (format de token, méthode de stockage) sont des choix techniques à valider pour votre contexte. (source : https://www.cerbos.dev/blog/authorization-for-ai-agents-what-to-build-before-eu-ai-act-deadline)

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

Les éléments chiffrés ci‑dessous sont des hypothèses opérationnelles à valider sur vos données et votre budget. Ils ne remplacent pas une mesure réelle.

| Élément | Valeur proposée |
|---|---:|
| Token TTL par défaut | 300 s (5 min) |
| Token TTL max | 900 s (15 min) |
| Rétention d'audit | 90 jours |
| Canary initial | 10 % |
| Canary durée | 24–72 h |
| Policy decision latency cible (p95) | 200 ms |
| Seuil d'alerte sponsor manquant | 0.1 % |
| Échantillonnage d'archivage | 1 % |

Exemples de configuration / commandes (hypothétiques) :

```bash
# démarrer un service d'émission d'identifiants local (exemple hypothétique)
docker run --rm -p 8080:8080 my-token-service:latest

# émettre un token avec claims (exemple hypothétique)
curl -X POST http://localhost:8080/issue -H 'Content-Type: application/json' \
  -d '{"tool":"billing","sponsor_id":"alice","ttl":300}'
```

```yaml
# token-service-config.yml (exemple hypothétique)
issuer: agent-token-svc
default_ttl_seconds: 300
max_ttl_seconds: 900
require_sponsor: true
supported_tools: [billing, search, file-store]
```

Estimations de coût (hypothèses) :
- PoC : $0–200 / mois
- Production légère : $1,000+ / mois selon rétention
- Exemple de stockage : 100000 événements/jour × ~1 KB → ~9 GB pour 90 jours

(source : https://www.cerbos.dev/blog/authorization-for-ai-agents-what-to-build-before-eu-ai-act-deadline)

### Risques / mitigations

- Risque : indisponibilité du policy plane qui bloque les appels légitimes.
  - Mitigation : comportement fail‑closed par défaut. Mettre en place un cache court (ex. 30 s) et une procédure de restauration documentée (RTO cible hypothétique : 30 minutes).

- Risque : métadonnées sponsor manquantes → angles morts d'audit.
  - Mitigation : en staging, bloquer les opérations sans sponsor_id ; en production, alerter si le taux dépasse le seuil défini (ex. 0.1 %).

- Risque : coûts d'audit élevés.
  - Mitigation : échantillonnage (ex. 1 %), archivage vers du stockage moins cher, ou ajustement de la rétention selon obligations légales.

### Prochaines etapes

- Implémenter token-service-config.yml et audit-schema.json en staging ; exécuter des tests d'intégration parent→child dans les 24 heures.
- Déployer le policy plane en staging derrière un feature flag ; lancer un canary à 10 % pour 24–72 h ; mesurer p95 et taux d'erreur.
- Préparer les preuves juridiques et de sécurité une fois les logs et le cycle sponsor en place ; planifier montée en charge progressive (10 % → 30 % → 60 % → 100 %) avec critères de rollback.

Checklist de production :

- [ ] Token service configuré et testé en staging
- [ ] Schéma d'audit appliqué à tous les appels d'outil
- [ ] Policy plane déployé en mode canary
- [ ] Alerting : sponsor manquant, erreurs policy, latence p95

Référence : Cerbos — "Authorization for AI agents: What to build before the EU AI Act deadline" (https://www.cerbos.dev/blog/authorization-for-ai-agents-what-to-build-before-eu-ai-act-deadline).
