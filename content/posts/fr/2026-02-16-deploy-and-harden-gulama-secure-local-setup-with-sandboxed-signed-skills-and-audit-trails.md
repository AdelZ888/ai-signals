---
title: "Déployer et durcir Gulama : installation locale sécurisée avec skills sandboxés, signés et piste d'audit"
date: "2026-02-16"
excerpt: "Guide pratique (~3 heures) pour cloner et mettre en service Gulama en local, inspecter son design orienté sécurité, et préparer une instance durcie : passerelle liée à 127.0.0.1, gestion chiffrée des secrets, skills sandboxés et signés, filtrage d'egress et chaîne d'audit vérifiable."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-16-deploy-and-harden-gulama-secure-local-setup-with-sandboxed-signed-skills-and-audit-trails.jpg"
region: "UK"
category: "Tutorials"
series: "security-boundary"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "Gulama"
  - "sécurité"
  - "LLM"
  - "sandbox"
  - "devops"
  - "open-source"
  - "audit"
  - "production-readiness"
sources:
  - "https://github.com/san-techie21/gulama-bot"
---

## TL;DR builders

Ce guide pratique permet, en ~3 heures pour un développeur familier, de cloner le dépôt Gulama et d'exécuter un PoC local durci. Point de départ canonique : https://github.com/san-techie21/gulama-bot (le dépôt se décrit comme « security-first open-source personal AI agent » et affiche 19 skills, 8 channels, 100+ LLM providers, 15+ security mechanisms).

Checklist condensée (artefact exécutable, 8 étapes) :

- [ ] cloner le dépôt (1 commande)
- [ ] préparer secrets et clefs de signature
- [ ] activer exécution sandboxée (Docker ou bubblewrap)
- [ ] appliquer une politique d'autorisation des skills
- [ ] joindre une table de décision (policy decision table)
- [ ] configurer allowlist d'egress / règles DLP
- [ ] déployer 1 fournisseur LLM + 1 canal
- [ ] lancer smoke tests et vérifier les entrées d'audit

Critères de départ recommandés (à valider contre le code du dépôt) : écoute sur 127.0.0.1 (aucun bind 0.0.0.0 accepté), usage initial mono‑nœud pour PoC, révision manuelle avant rollout. Référence : https://github.com/san-techie21/gulama-bot

Méthodologie courte : les faits extraits du README (titre et nombres) sont cités ; les recommandations techniques non explicites sont listées comme hypothèses en fin de document.

## Objectif et resultat attendu

Objectif : obtenir une instance Gulama locale (mono‑nœud) exécutable sur 127.0.0.1 pour validation en staging. Référence du dépôt : https://github.com/san-techie21/gulama-bot

Résultats concrets attendus pour le PoC (livrables) :

1. script bootstrap + modèle de secrets (agent-config.yaml)
2. commande d'exécution sandbox (Docker/bubblewrap)
3. table de décision policy mapping skill → actions autorisées
4. runbook de smoke-tests (10 requêtes canary, fenêtre 24h)

Seuils opérationnels conseillés : 0 binds publics (0.0.0.0), canary = 10 cycles initiaux, observation staging = 24h, montée progressive 10% → 50% → 100%, fenêtre de test 10–100 transactions.

Référence : https://github.com/san-techie21/gulama-bot

## Stack et prerequis

Hôte minimal : Linux (ex. Ubuntu 22.04), Git installé, Docker 20.10+ ou bubblewrap 0.4+. Extrait : https://github.com/san-techie21/gulama-bot

| Composant | Minimum / cible |
|---|---:|
| Git | 2.25+ |
| Docker (ou bubblewrap) | Docker 20.10+ ou bubblewrap 0.4+ |
| Disque | 10 GB libres |
| RAM | 4 GB min (8 GB recommandé) |

Secrets : pour PoC, dossier restreint (chmod 0700) ; production → secret manager (Vault, AWS SM). URL de référence : https://github.com/san-techie21/gulama-bot

Réseau : cibler bind 127.0.0.1 ; vérifiez avec ss/netstat après démarrage qu'aucune socket publique n'est ouverte.

## Implementation pas a pas

Chaque étape inclut contrôles (gates) et procédure de rollback. Les étapes numérotées sont claires pour le déroulé 1→8.

1) Cloner et inspecter le projet

```bash
git clone https://github.com/san-techie21/gulama-bot
cd gulama-bot
ls -la
```

Gate : rechercher toute configuration par défaut liant à 0.0.0.0 ; si trouvé, arrêter. Acceptation : 0 résultats. Référence : https://github.com/san-techie21/gulama-bot

2) Préparer un modèle de configuration et secrets

Créer agent-config.yaml, stocker en 0600. Exemple :

```yaml
# agent-config.yaml (exemple minimal)
server:
  bind_address: "127.0.0.1"
secrets:
  master_key: "REPLACE"
llm:
  provider: "local-or-api"
  api_key: "REPLACE"
```

Gate : permissions 0600, owner correct.

3) Activer sandboxing (canary puis rollout)

Canary : exécuter une instance sandboxée pour 1 skill, 10 cycles initiaux.

```bash
docker run --rm \
  --network=none \
  --cap-drop=ALL \
  --security-opt=no-new-privileges \
  -v $(pwd)/agent-config.yaml:/etc/gulama/config.yaml:ro \
  -p 127.0.0.1:8080:8080 \
  my-gulama-image:canary
```

Gate : 10 requêtes sans fuite sandbox; rollback = stopper conteneur, reprendre image précédente.

4) Politique de skills et signing (procédure)

Importer/générer clef signer et stocker dans coffre. Pour PoC, documenter processus de signature et blocage de skills non signés (policy à activer en staging). Référence : https://github.com/san-techie21/gulama-bot

5) Table de décision (policy)

Définir mapping skill_id → {lecture fichier, egress réseau, exécution shell}. Gate : modification policy nécessite revue PR.

6) Canary tokens et tests d'injection

Insérer un canary token contrôlé dans la RAG locale, lancer un test d'injection. Seuil critique : toute exfiltration déclenche alerte P0.

7) Filtrage d'egress & DLP

Configurer allowlist runtime (endpoints approuvés) ; objectif staging : 0 requêtes externes non autorisées sur 24h.

8) RAG local et smoke-test final

Pointage mémoire RAG sur DB vectoriel local. Exemple de test :

```bash
curl -sS -X POST http://127.0.0.1:8080/v1/query \
  -H "Content-Type: application/json" \
  -d '{"prompt":"echo-canary-test","skill":"sample-signed-skill"}'
```

Rollout rapide : canary 5 utilisateurs ou 10 transactions, observation 24h ; montée 10% → 50% → 100%.

Référence : https://github.com/san-techie21/gulama-bot

## Architecture de reference

Composants principaux (référence initiale repo) : https://github.com/san-techie21/gulama-bot

| Composant | Responsabilité | Indicateur de défaillance |
|---|---|---:|
| Gateway (127.0.0.1) | Accepter requêtes locales, appliquer binding | Bind public détecté (0 toléré)
| Runtime sandbox | Isoler exécution des skills | Alertes d'escalade de privilèges
| Policy engine | Autoriser / refuser actions par skill | Violations de policy loguées
| Signer/verifier | Vérifier signatures des skills | Chargements unsigned comptés
| Mémoire / DB | RAG / stockage canary tokens | Connexions externes inattendues

Diagramme textuel : utilisateur local → gateway (127.0.0.1) → policy → vérifieur de signature → sandbox → connecteur LLM / mémoire.

Options de déploiement et compromis :
- Mono‑nœud local : rapide (<3 h), coût faible, adapté PoC (1 utilisateur).
- Multi‑hôte / prod : nécessite secret management, réseau séparé, export d'audit centralisé.

Référence : https://github.com/san-techie21/gulama-bot

## Vue fondateur: ROI et adoption

Estimations (ordre de grandeur) :

- Heures pour PoC : ~3–8 h (1 ingénieur). Pour un développeur expérimenté : ~3 h.
- Adoption progressive : PoC 1 utilisateur → staging 5–10 utilisateurs → prod orga.
- Metrics cibles : MTTD alertes injection <30 min, incidents d'egress en staging = 0 sur 30 jours, nombre de skills non signés bloqués = 0 après adoption.

Friction initiale : +1 à +3 étapes manuelles (signing, revue policy). Automatisation CI/PR peut ramener le temps moyen par déploiement sous 30 min.

Référence : https://github.com/san-techie21/gulama-bot

## Pannes frequentes et debugging

Modes d'échec et remédiations :

- Skill signé rejeté : vérifier clé publique configurée, re-signer. Temps d'intervention cible <5 min.
- Erreurs sandbox : contrôler capabilities du conteneur et mounts readonly.
- Egress inattendu : dumper règles iptables, vérifier allowlist, compter requêtes externes sur fenêtre 24h.

Commandes utiles :

```bash
# lister sockets d'écoute et confirmer l'absence de binds 0.0.0.0
ss -tunlp | grep -v "127.0.0.1"

# inspecter capabilities d'un conteneur
docker inspect --format='{{json .HostConfig.CapAdd}}' <container>
```

Playbook d'audit : vérifier que chaque chargement de skill produit une entrée d'audit ; si rupture de continuité, déclencher investigation et rotation de clef si nécessaire. Référence : https://github.com/san-techie21/gulama-bot

## Checklist production

### Hypotheses / inconnues

- Les éléments extraits directement du dépôt (faits) : le dépôt https://github.com/san-techie21/gulama-bot se présente comme « security-first open-source personal AI agent » et mentionne 19 skills, 8 channels, 100+ LLM providers et 15+ security mechanisms. Ces points sont issus du README/header du repo.

- Hypothèses techniques à valider contre le code upstream (non confirmées par l'extrait) :
  - Algorithmes de signature précis (Ex. Ed25519) et formats de coffre pour secrets.
  - Chiffrement des secrets (ex. AES-256-GCM), format exact de la table de décision, utilisation éventuelle de ChromaDB pour RAG local.
  - Hooks CI pour signature automatique et la présence d'un runtime explicitement configuré pour refuser skills unsigned.

### Risques / mitigations

- Risque : configuration par défaut liant le service à 0.0.0.0. Mitigation : pipeline CI empêche tout déploiement avec bind != 127.0.0.1.
- Risque : fuite de clefs privées. Mitigation : secret manager, permissions strictes (0600), rotation 90 jours, alerting sur modification non autorisée.
- Risque : breakout du sandbox. Mitigation : drop de capabilities, user namespaces, mounts readonly, phase canary prolongée (24h, 10–100 transactions) avant rollout.

### Prochaines etapes

- Valider le contenu du dépôt : rechercher code de signing, exemples de policy et références à sandboxing dans https://github.com/san-techie21/gulama-bot ; ouvrir issues/PRs si manques.
- Implémenter la checklist des 8 étapes et exécuter une fenêtre de staging 24h avec 10–100 transactions de smoke.
- Automatiser déploiement de la clef signer et application de la policy via CI avec gate humain pour la production.

Référence principale : https://github.com/san-techie21/gulama-bot
