---
title: "Les règles échouent dans le prompt, réussissent à la frontière"
date: "2026-02-06"
excerpt: "Les workflows agentiques et la coercition par prompt sont la nouvelle surface d'attaque. Ce tutoriel décrit une stratégie de frontière concrète et déployable (moteur de politique + sandbox + canaux attestés) pour réduire le risque de compromission agentique — avec configurations, code, métriques et cadre coût/risque pour fondateurs (contexte Royaume‑Uni)."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-06-rules-fail-at-the-prompt-succeed-at-the-boundary.jpg"
region: "UK"
category: "Tutorials"
editorialTemplate: "TUTORIAL"
tags:
  - "sécurité"
  - "IA"
  - "agents"
  - "policy-as-code"
  - "sandbox"
  - "founder"
sources:
  - "https://www.technologyreview.com/2026/01/28/1131003/rules-fail-at-the-prompt-succeed-at-the-boundary/"
  - "https://arxiv.org/abs/2602.04326"
  - "https://arxiv.org/abs/2602.04248"
  - "https://arxiv.org/abs/2602.04284"
---

## TL;DR builders

Le risque : l'injection et la coercition par prompt des workflows agentiques (human‑in‑loop ou pleinement autonomes) sont désormais des vecteurs d'attaque majeurs. Des incidents réels — de la divulgation d'injection de prompt sur Gemini Calendar à l'utilisation d'un moteur d'intrusion basé sur Claude par un acteur étatique en septembre 2025 (impactant ~30 organisations) — montrent que les règles insérées dans les prompts sont fragiles ; des frontières appliquées hors du modèle sont résistantes et testables (voir MIT Technology Review) et des analyses techniques récentes documentent des exploits pratiques (voir arXiv ci‑dessous).

Artifact métrique concret : viser une latence de détection < 2 minutes pour les actions sortantes agentiques, un Mean Time To Contain (MTTC) < 15 minutes, et un taux de détection vrai positif initial >= 90 % pour les motifs d'action coercitive.

## Objectif et resultat attendu

Objectif : empêcher la coercition des agents en rendant immuables les instructions sensibles du modèle et en s'assurant que toute action à haut risque soit obligatoirement soumise à des contrôles externes.

Résultats attendus (mesurables) :

- Réduire le taux d'actions sortantes non autorisées à < 0,5 % des actions initiées par l'agent pendant le déploiement.
- Exiger des approbations humaines pour les actions à haut risque (usage d'identifiants, exécution de code, accès réseau) via attestations signées et 2FA.
- Traçabilité : conserver des transcrits et jetons d'action signés cryptographiquement pendant 1 an (ou la période de rétention réglementaire applicable au Royaume‑Uni).

Décision de déploiement concrète : démarrer par un mode "observation" (monitor‑only) pendant 2–4 semaines pour collecter la ligne de base, puis passer en mode blocage pour les 3 actions les plus risquées.

## Stack et prerequis

Choix de stack recommandés (avec configurations concrètes) :

- Couche modèle : API LLM hébergée (vendor) derrière un proxy d'inférence ; alternative : modèle self‑hosted (Llama/Claude) dans un tenant isolé.
- Moteur de politique : Open Policy Agent (OPA) comme point de décision externalisé.
- Sandboxing : Firecracker ou gVisor pour exécution de code ; pas de réseau hôte par défaut.
- Secrets : identifiants éphémères depuis un vault (HashiCorp Vault ou AWS Secrets Manager) avec rotation automatisée.
- Télémétrie : journalisation centralisée (ELK ou Grafana Loki) et tracing (OpenTelemetry) avec rétention et alerting.

Configurations prérequises (exemples) :

- Réseau : le sous‑réseau agent a un egress uniquement via un egress‑proxy avec interception TLS pour routage métadonnées et filtrage.
- Vault TTL : secret_ttl = 5m pour les credentials éphémères utilisés par les agents.
- OPA : activer audit logging et versioning des politiques.

Exemple de contrainte OPA (artefact) :

```rego
# contrainte pseudo‑Rego illustrative
allow_action = false if action.capability == "exec_remote" and not action.attestation.present
```

Prérequis développeur minimaux :

- Maîtrise de policy‑as‑code (Rego), sandboxing de conteneurs/microVMs, et signatures HMAC.
- CI/CD pour déployer les politiques (repo git + PR obligatoire + tests automatiques de politiques).

## Implementation pas a pas

1) Proxy d'inférence + canal SYSTEM immutable

- Construire un proxy d'inférence qui injecte systématiquement un canal SYSTEM scellé que le modèle ne peut pas modifier. Le proxy signe ce canal SYSTEM avec un HMAC de frontière et transmet des jetons signés en aval.

2) Vérification externe par moteur de politique (OPA)

- Intercepter les actions proposées par l'agent (sorties JSON structurées) et les soumettre à OPA pour autorisation/refus. Garder le dépôt de politiques dans Git et exiger des tests unitaires pour chaque changement.

3) Gating des capacités

- Cartographier les "capabilities" du modèle vers des actions concrètes (send_email, read_db, exec_shell) et n'autoriser la mappage que si une approbation externe est présente.

4) Approbation humaine avec attestations

- Pour toute capacité classée haut risque (usage d'identifiants, accès latéral au réseau, exécution de code), exiger une attestation humaine signée via 2FA. Stocker le jeton d'attestation avec TTL dans Vault.

5) Exécution en sandbox

- Exécuter les actions dans des microVMs (Firecracker) avec credentials éphémères et egress réseau uniquement via un egress‑proxy à filtrage strict.

6) Monitoring et réponse

- Logger les sorties du modèle, décisions OPA, jetons d'attestation et résultats d'action. Alerter sur taux de refus de politique ou création anormale de jetons.

Exemple de middleware minimal (vérifie un token boundary signé) — Node.js / pseudo :

```javascript
const crypto = require('crypto');
function verifyBoundary(token, secret) {
  const [payloadB64, sigB64] = token.split('.');
  const expected = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64');
  return expected === sigB64;
}

// Usage: verify incoming SYSTEM token before honoring any capability
```

Décision de rollout : faire tourner le proxy en mode "observe" 14 jours, puis faire appliquer les politiques de refus sur les 3 actions les plus critiques.

## Architecture de reference

Choix d'architecture concret : design frontière en trois couches

- Proxy d'inférence (stateless) — injecte canal SYSTEM, signe les tokens, applique rate‑limits.
- Plan de politique (OPA + repo de politiques) — décisions déterministes allow/deny, pipeline de tests de politique.
- Plan d'exécution (microVMs sandbox + Vault + egress‑proxy) — n'exécute que les actions autorisées.

Métriques clés à instrumenter :

- Latence de décision (proxy -> OPA -> réponse) : cible <= 200 ms.
- MTTC (Mean Time To Contain) : cible <= 15 minutes.
- Taux d'autorisation d'action et ratio de refus.

Exemple de segmentation réseau : tout le compute lié aux agents sur VLAN A, egress via egress‑proxy avec ACL basées sur l'hôte ; plan de management sur VLAN B avec accès restreint.

Pour visualisation et tests : fournir un docker‑compose/minimal deploy séparant ces services et activant le tracing par service.

## Vue fondateur: ROI et adoption

Cadre décisionnel compact (one‑liner + bullets) :

- Quick win : déployer un proxy observe‑mode + OPA pour £10–£30k ingénierie et infra par trimestre ; cela prévient les intrusions automatisées à grande échelle qui, comme vu fin‑2025, ont affecté ~30 organisations — le coût d'une brèche dépasse largement le coût du déploiement.

Coûts estimés & jalons d'adoption :

- Ingénierie initiale (4–6 semaines) : ~£25k — construire proxy, repo OPA, tests.
- Infra ops : £2–5k/mois — capacité microVM, Vault, logging.
- Chemin d'adoption : pilote sur agents non sensibles (2–4 semaines observe), phase sur capacités sensibles (4–8 semaines), enforcement complet à 12 semaines.
- Métrique de réduction de risque : >90 % de réduction attendue des actions non autorisées à haut risque après enforcement.

Points de tension à communiquer :

- Latence vs sécurité : les contrôles externes ajoutent de la latence (~100–200 ms) ; acceptable pour automatisation de tickets, problématique pour chat temps réel.
- Friction UX : les attestations humaines ralentissent des workflows ; privilégier enforcement progressif (observe -> avertir -> bloquer).

## Pannes frequentes et debugging

Modes de panne courants et actions de débogage concrètes :

- Faux négatifs (coercition passe entre les mailles) : métrique à surveiller — pourcentage d'actions sortantes non vérifiées par jour. Enquête par replay des transcrits signés et exécution d'un détecteur d'anomalies.
- Faux positifs (actions légitimes bloquées) : suivre taux de rollback et temps de correction ; prévoir un flux d'override journalisé et auditable.
- Compromission de jetons : artefact de détection — pic soudain de création de jetons d'attestation ; réponse — révoquer tous les jetons, rotation immédiate de la clé HMAC et enquête forensique.
- Évasion du sandbox : artefact — connexions réseau non autorisées depuis des microVMs ; réponse — isoler l'hôte, capturer snapshot disque, et bloquer la capacité d'egress.

Checklist de debugging (rapide) :

- Collecter : transcript modèle, token SYSTEM signé, décision OPA, logs d'exécution.
- Reproduire : exécuter le transcript localement contre le moteur de politique et simuler le chemin d'action.
- Tester : injecter variantes adversariales depuis le corpus d'exploits publié sur arXiv et valider le comportement de refus.
- Métriques : alerter si taux d'actions non vérifiées > 0,5 % ou latence décisionnelle > 500 ms.

## Checklist production

- [ ] Observe‑mode pendant 14 jours ; collecter métriques de base (latence décisionnelle, ratios de refus, faux positifs).
- [ ] Repo de politiques avec CI : tests unitaires, couverture politique cible >= 80 %.
- [ ] Intégration Vault : TTL des secrets <= 5 minutes pour credentials éphémères.
- [ ] Canal SYSTEM signé : calendrier de rotation de clé HMAC (rotation hebdomadaire recommandée).
- [ ] Sandboxing : exécution de code en microVMs (pas de réseau hôte) avec limites de ressources.
- [ ] Traçabilité : conserver transcrits signés et jetons d'action pendant 1 an (ou période de conformité requise au Royaume‑Uni).
- [ ] Runbook incident : MTTC cible <= 15 minutes et playbooks pour compromission de jetons, breakout sandbox.
- [ ] Canary/rollback : blue/green pour mises à jour de politiques ; rollback automatique si spike de refus.
- [ ] Télémétrie : traces et logs vers ELK/OpenTelemetry avec SLOs pour latence d'ingestion.
- [ ] Formation : tests red‑team mensuels d'injection de prompt utilisant le corpus partagé (inclure motifs d'exploits identifiés sur arXiv).

Remarque finale : les règles intégrées aux prompts sont fragiles ; imposez des frontières immuables hors du modèle. Commencez en observe‑mode, pratiquez policy‑as‑code et gatez les capacités critiques par des attestations signées.

Références techniques et enquêtes récentes : MIT Technology Review (janv. 2026) et les analyses arXiv citées — https://www.technologyreview.com/2026/01/28/1131003/rules-fail-at-the-prompt-succeed-at-the-boundary/, https://arxiv.org/abs/2602.04326, https://arxiv.org/abs/2602.04248, https://arxiv.org/abs/2602.04284.
