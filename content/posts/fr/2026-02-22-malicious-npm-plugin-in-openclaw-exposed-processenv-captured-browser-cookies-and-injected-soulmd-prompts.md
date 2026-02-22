---
title: "Plugin npm malveillant dans OpenClaw : process.env exposé, cookies de navigateur capturés et injections dans SOUL.md"
date: "2026-02-22"
excerpt: "Analyse d'incident de @getfoundry/unbrowse-openclaw : le plugin a lu process.env, exfiltré des cookies/tokens du navigateur et injecté des instructions dans des fichiers de démarrage (SOUL.md, AGENTS.md, HEARTBEAT.md). Étapes de détection et remédiation."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-22-malicious-npm-plugin-in-openclaw-exposed-processenv-captured-browser-cookies-and-injected-soulmd-prompts.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "sécurité"
  - "npm"
  - "supply-chain"
  - "node.js"
  - "openclaw"
  - "incident-response"
  - "plugins"
  - "gestion-des-secrets"
sources:
  - "https://news.ycombinator.com/item?id=47109114"
---

## TL;DR builders

Ce qui s'est passé (résumé du post cité) : l'auteur a installé le paquet @getfoundry/unbrowse-openclaw dans une passerelle OpenClaw (Node.js) le 5 février; dans les 14 jours suivants le package a lu process.env (incluant OP_SERVICE_ACCOUNT_TOKEN et OPENCLAW_GATEWAY_TOKEN), intercepté du trafic navigateur (cookies/tokens pour AmEx, Stanford MyHealth, Kubera, Twitter/X, session admin), et injecté des instructions dans des fichiers de démarrage (SOUL.md, AGENTS.md, HEARTBEAT.md). Des logs contenaient des lignes « Auto-published [service] to skill marketplace » avec réponses HTTP 200; le « skill marketplace » est devenu inaccessible le 15 février et la découverte a eu lieu le 19 février. Source : https://news.ycombinator.com/item?id=47109114

Actions urgentes recommandées (extraits et adaptation du post) :

- Isoler la sortie réseau de la gateway et prendre snapshots judiciaires (fichiers + liste de process). (source: https://news.ycombinator.com/item?id=47109114)
- Révoquer les tokens à haut risque et supprimer tout compte de service compromis (l'auteur a supprimé un compte 1Password lors de la découverte). (source: https://news.ycombinator.com/item?id=47109114)
- Chercher dans les logs la chaîne "Auto-published" et le message "Skill marketplace unreachable — auto-publish disabled". (source: https://news.ycombinator.com/item?id=47109114)
- Auditer SOUL.md, AGENTS.md, HEARTBEAT.md pour détecter des injections. (source: https://news.ycombinator.com/item?id=47109114)

Note méthodologique : résumé et playbook synthétisent les éléments techniques publiés dans le fil cité.

## Objectif et resultat attendu

Objectif : détecter et contenir une exfiltration pilotée par un plugin, identifier secrets compromis mentionnés dans le rapport (ex. OP_SERVICE_ACCOUNT_TOKEN), et obtenir preuves pour remédiation. (source: https://news.ycombinator.com/item?id=47109114)

Résultats attendus (faits tirés du post) :

- Identification des entrées dangereuses dans process.env (ex. OP_SERVICE_ACCOUNT_TOKEN, OPENCLAW_GATEWAY_TOKEN). (source: https://news.ycombinator.com/item?id=47109114)
- Preuves des logs « Auto-published ... » et de la séquence d'événements jusqu'à « Skill marketplace unreachable ». (source: https://news.ycombinator.com/item?id=47109114)
- Inventaire des cookies/proxies capturés (services listés dans le post). (source: https://news.ycombinator.com/item?id=47109114)

Remarques : les durées opérationnelles, les fenêtres d'observation (ex. 7 jours) ou estimations temporelles sont traitées comme hypothèses et listées sous "Hypotheses / inconnues".

## Stack et prerequis

Pile et artefacts cités dans le rapport : passerelle OpenClaw sous Node.js, package npm @getfoundry/unbrowse-openclaw, comptes 1Password, intégrations Slack/Telegram/OpenAI, et clients proxyfiés (AmEx, Stanford MyHealth, Kubera, Twitter/X, session admin). (source: https://news.ycombinator.com/item?id=47109114)

Prérequis pour l'investigation : accès shell/SSH sur l'hôte, accès en lecture aux logs applicatifs et proxy, capacité à supprimer/faire tourner des comptes dans le gestionnaire de secrets, hôte de quarantaine pour reconstruire la gateway.

Artefacts à collecter immédiatement : dump de process.env, copie de node_modules/@getfoundry/unbrowse-openclaw, copies horodatées des fichiers SOUL.md, AGENTS.md, HEARTBEAT.md, et logs contenant "Auto-published". (source: https://news.ycombinator.com/item?id=47109114)

## Implementation pas a pas

(source: https://news.ycombinator.com/item?id=47109114)

1) Isolation et collecte

1.1 Bloquer l'egress de la gateway et prendre un snapshot judiciaire (process list, env, node_modules). Exemple :

```bash
# exemple d'isolation (adapter à votre infra)
sudo iptables -A OUTPUT -m conntrack --ctstate NEW -j DROP
ps aux > /tmp/process-list.txt
cat /proc/$(pgrep -f node)/environ | tr '\0' '\n' > /tmp/process-env.txt
tar czf /tmp/node_modules-snapshot.tgz ./node_modules/@getfoundry/unbrowse-openclaw
```

2) Rechercher indicateurs d'exfiltration

2.1 Grepper les logs pour les marqueurs observés dans l'incident :

```bash
grep -R "Auto-published" /var/log/openclaw || true
grep -R "Skill marketplace unreachable" /var/log/openclaw || true
```

Consigner chaque ligne et son horodatage; les entrées avec réponse HTTP 200 dans le post sont des signaux prioritaires. (source: https://news.ycombinator.com/item?id=47109114)

3) Inspection de l'environnement d'exécution

3.1 Dumper process.env et comparer à une whitelist; rechercher OP_SERVICE_ACCOUNT_TOKEN et OPENCLAW_GATEWAY_TOKEN. (source: https://news.ycombinator.com/item?id=47109114)

3.2 Si un compte de service 1Password ou token avec privilèges vault est présent, le marquer comme compromis et planifier suppression/rotation; le post signale la suppression d'un compte 1Password à la découverte. (source: https://news.ycombinator.com/item?id=47109114)

4) Revue statique du plugin suspect

4.1 Inspecter node_modules/@getfoundry/unbrowse-openclaw pour appels réseau, dépendances et taille de payload : le post mentionne des dépendances liées à Solana (@solana/web3.js, @solana/spl-token) et ~216KB de TypeScript dans le payload observé. (source: https://news.ycombinator.com/item?id=47109114)

```bash
rg "skill marketplace|solana|web3" node_modules/@getfoundry/unbrowse-openclaw || true
wc -c node_modules/@getfoundry/unbrowse-openclaw/**/*.ts
```

5) Vérification des captures proxy / cookies

5.1 Auditer logs proxy pour entrées contenant cookies des services cités (AmEx 22–26 cookies, Stanford MyHealth 126–128 cookies, Kubera, Twitter/X, session admin). Ces compteurs proviennent du rapport et indiquent priorités d'investigation. (source: https://news.ycombinator.com/item?id=47109114)

6) Suppression et reconstruction

6.1 Désinstaller le paquet compromis, supprimer le compte de service compromis et reconstruire la gateway à partir d'artefacts propres :

```bash
npm uninstall @getfoundry/unbrowse-openclaw
npm ci --prefer-offline --no-audit
./deploy.sh --artifact=artifacts/openclaw-clean.tgz --no-plugins
```

6.2 Ne réactiver des plugins qu'après revue sécurité explicite (canary/feature-flag mentionnés comme pratique — voir Hypotheses). 

7) Vérification post-recovery

7.1 Vérifier l'absence des marqueurs d'exfiltration identifiés pendant la durée d'observation définie par votre politique (détails sur les fenêtres d'observation = hypothèses listées plus bas).

## Architecture de reference

Principes tirés des vecteurs d'attaque rapportés : moindre privilège pour comptes de service, interdire l'accès direct des plugins à process.env global, contrôle d'egress réseau, intégrité signée des fichiers de démarrage. (source: https://news.ycombinator.com/item?id=47109114)

Exemple de sandbox de plugin (proposition) :

```yaml
plugin_sandbox:
  runtime: nodejs12
  env_whitelist:
    - NODE_ENV
    - PLUGIN_ID
  egress_allowlist:
    - 10.0.0.0/16
    - management.example.com:443
  blocked_hosts:
    - "*"
```

Exemples de composants minimaux recommandés : gateway minimale en secrets, sandbox processus/containeur pour plugins, vault centralisé, proxy de sortie allowlisté. (source: https://news.ycombinator.com/item?id=47109114)

## Vue fondateur: ROI et adoption

(source: https://news.ycombinator.com/item?id=47109114)

Constat issu du post : les plugins tiers augmentent la vélocité produit mais aussi le risque supply‑chain et l'exposition des secrets si le plugin peut lire process.env ou intercepter du trafic. L'incident illustre l'impact opérationnel — suppression d'un compte 1Password et rotation de secrets. (source: https://news.ycombinator.com/item?id=47109114)

Parcours d'adoption proposé (pratique, discussions et chiffres d'acceptation à valider en interne — voir Hypotheses) : canary (1 host), observation, déploiement progressif (ex. 10 % de la flotte). Mesurer heures économisées vs coût de remédiation (inventaire des heures et coûts à estimer par l'organisation).

## Pannes frequentes et debugging

(source: https://news.ycombinator.com/item?id=47109114)

Modes d'échec observés et contre‑mesures cités ou déduits :

- Exfiltrations masquées : le post indique des appels réseau auto‑publishing avec réponses HTTP 200; surveiller succès HTTP associés à chaînes inhabituelles et utiliser analyse statique + tracing réseau. (source: https://news.ycombinator.com/item?id=47109114)
- Persistance par injection de prompts : fichiers SOUL.md, AGENTS.md, HEARTBEAT.md ont été modifiés selon le rapport; implémenter intégrité signée pour refuser démarrage si altérés. (source: https://news.ycombinator.com/item?id=47109114)
- Fuite dans backups/archives : rechercher tokens dans les archives et sauvegardes compressées.

Checklist de debugging :

- [ ] Grep des logs pour "Auto-published" et "Skill marketplace unreachable". (source: https://news.ycombinator.com/item?id=47109114)
- [ ] Vérifier process.env pour OP_SERVICE_ACCOUNT_TOKEN et OPENCLAW_GATEWAY_TOKEN. (source: https://news.ycombinator.com/item?id=47109114)
- [ ] Inspecter node_modules/@getfoundry/unbrowse-openclaw pour dépendances Solana et taille du payload (~216KB TS mentionnés). (source: https://news.ycombinator.com/item?id=47109114)
- [ ] Vérifier checksums de SOUL.md / AGENTS.md / HEARTBEAT.md.

## Checklist production

### Hypotheses / inconnues

- Dates et séquence d'événements extraits du post : installation 5 février, marketplace sombre 15 février, découverte 19 février. (source: https://news.ycombinator.com/item?id=47109114)
- Présence dans process.env d'OP_SERVICE_ACCOUNT_TOKEN et OPENCLAW_GATEWAY_TOKEN, capture de cookies AmEx (22–26), Stanford MyHealth (126–128), et modification de SOUL.md/AGENTS.md/HEARTBEAT.md proviennent du fil cité. (source: https://news.ycombinator.com/item?id=47109114)
- Les durées opérationnelles (ex. fenêtre d'observation 7 jours, canary 72 h, rollout 10 %) et coûts/estimations horaires sont des hypothèses recommandées à valider par votre équipe.

### Risques / mitigations

- Risque : plugin lit process.env et cookies proxyfiés.
  - Mitigation : exécuter plugins hors‑processus avec env whitelist et limiter secrets exposés dans la gateway. (source: https://news.ycombinator.com/item?id=47109114)
- Risque : injections persistantes dans fichiers de démarrage.
  - Mitigation : signer checksums des fichiers critiques et refuser démarrage si modifiés. (source: https://news.ycombinator.com/item?id=47109114)
- Risque : tokens disparus dans backups.
  - Mitigation : rechercher dans archives et faire rotation complète des tokens compromis.

### Prochaines etapes

- Mettre en place sandboxing des plugins, contrôle d'egress et politique d'activation progressive (canary → graduel → full) ; définir gates de sécurité et checklist de sign-off.
- Maintenir un runbook d'incident qui inclut suppression immédiate d'un compte de service compromis et suivi de la rotation des tokens (ex. 1Password). (source: https://news.ycombinator.com/item?id=47109114)
- Planifier un audit de dépendances de tous les plugins tiers et revue manuelle pour paquets déclarant bibliothèques financières (ex. @solana/web3.js).

Tableau rapide de priorisation :

| Priorité | Symptom | Action immédiate | Délai estimé |
|---:|---|---|---:|
| 1 | Token de compte de service dans process.env | Supprimer le compte + tourner tokens atteignables | 0–24 h |
| 2 | Entrées "Auto-published" | Isoler l'hôte + snapshot logs | 0–3 h |
| 3 | Fichiers de démarrage modifiés | Restaurer configs signées + vérifier checksums | 1–6 h |

Exemples et commandes fournis ci‑dessus; appliquer les éléments factuels tirés du post original : https://news.ycombinator.com/item?id=47109114
