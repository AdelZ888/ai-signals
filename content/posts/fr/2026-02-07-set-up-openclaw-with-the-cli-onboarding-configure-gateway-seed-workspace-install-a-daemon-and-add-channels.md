---
title: "Configurer OpenClaw avec l'onboarding CLI : Gateway, workspace initial, démon utilisateur et canaux"
date: "2026-02-07"
excerpt: "Guide pratique pour développeurs et fondateurs US : utiliser l'onboarding CLI d'OpenClaw pour provisionner un Gateway local (port 18789), semer ~/.openclaw/workspace, installer un démon utilisateur et connecter au moins un canal."
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "beginner"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "openclaw"
  - "onboarding"
  - "cli"
  - "gateway"
  - "agents"
  - "devops"
  - "ai"
sources:
  - "https://docs.openclaw.ai/start/wizard"
  - "https://docs.openclaw.ai/start/wizard-cli-reference"
  - "https://getclawdbot.com/guides/install/"
---

## TL;DR builders

Exécuter l'assistant d'onboarding CLI pour configurer un Gateway OpenClaw (local ou distant) et semer un workspace d'agent. Voir le guide rapide et la référence CLI pour détails: https://docs.openclaw.ai/start/wizard et https://docs.openclaw.ai/start/wizard-cli-reference.

Principales commandes:

```bash
# Vérifier le CLI
openclaw --version

# Lancer l'onboarding interactif
openclaw onboard

# Mode non interactif (CI / automation)
openclaw onboard --non-interactive
```

Résultats immédiats attendus (flux local documenté):

- Création ou mise à jour de `~/.openclaw/openclaw.json` (l'assistant propose Keep/Modify/Reset si le fichier existe). (voir https://docs.openclaw.ai/start/wizard-cli-reference)
- Workspace seedé dans `~/.openclaw/workspace` (fichiers bootstrap). (voir https://docs.openclaw.ai/start/wizard-cli-reference)
- Gateway démarré et à l'écoute, port par défaut 18789 avec token auth auto‑généré (même en loopback). (voir https://docs.openclaw.ai/start/wizard)

Checklist rapide:

- [ ] `openclaw onboard`
- [ ] Choisir QuickStart ou Advanced
- [ ] Fournir une clé API (Anthropic recommandé) ou configurer OpenAI/OAuth
- [ ] Connecter au moins un canal (ex. token bot Telegram)
- [ ] Vérifier l'installation du démon utilisateur (LaunchAgent macOS / systemd user unit Linux/WSL2)

Source principale: https://docs.openclaw.ai/start/wizard

## Objectif et resultat attendu

Objectif: installer le CLI OpenClaw, exécuter l'onboarding, connecter au moins un canal de messagerie et obtenir un ensemble minimal opérationnel : Gateway sain + workspace seedé. Référence: https://docs.openclaw.ai/start/wizard.

Critères d'acceptation basés sur la référence CLI:

- Gateway configuré et écoutant (port par défaut 18789). (https://docs.openclaw.ai/start/wizard)
- Fichier `~/.openclaw/openclaw.json` créé ou mis à jour avec choix Keep/Modify/Reset. (https://docs.openclaw.ai/start/wizard-cli-reference)
- Workspace initialisé dans `~/.openclaw/workspace` avec fichiers de bootstrap. (https://docs.openclaw.ai/start/wizard-cli-reference)
- Démon utilisateur installé pour persistance (LaunchAgent ou systemd user unit). (https://docs.openclaw.ai/start/wizard-cli-reference)

Mesures quantitatives (pour acceptation pilote):

- Temps de déploiement attendu: < 10 minutes pour QuickStart.
- Port par défaut: 18789.
- Canary initial proposé: 5% du trafic (hypothèse à valider).
- Taille maximale de requête initiale recommandée: 4096 tokens (hypothèse).

Si un critère échoue: relancer l'onboarding en mode Modify/Reset ou consulter `openclaw doctor`. (https://docs.openclaw.ai/start/wizard-cli-reference)

## Stack et prerequis

Plateformes et prérequis documentés:

- OS supportés (flux local): macOS, Linux, Windows via WSL2. (https://docs.openclaw.ai/start/wizard)
- OpenClaw CLI installé et dans le PATH — suivre le guide d'installation: https://getclawdbot.com/guides/install/
- Accès aux providers de modèles: Anthropic (recommandé) ou OpenAI/OAuth et autres listés dans la référence CLI. (https://docs.openclaw.ai/start/wizard-cli-reference)
- Permissions FS pour écrire `~/.openclaw/workspace` et installer un démon utilisateur. (https://docs.openclaw.ai/start/wizard-cli-reference)
- Canaux pris en charge: Telegram, WhatsApp, Discord, Google Chat, Mattermost, Signal, BlueBubbles/iMessage. (https://docs.openclaw.ai/start/wizard-cli-reference)
- Optionnel: clé Brave Search pour activer web_search via `openclaw configure --section web`. (https://docs.openclaw.ai/start/wizard)

Contraintes opérationnelles chiffrées (propositions):

- Budget pilote: $100/jour plafond (hypothèse).
- Durée pilote recommandée: 7 jours.
- Utilisateurs pilotes: 10 utilisateurs initiaux, montée à 50 selon gate. (hypothèses à valider)

## Implementation pas a pas

1) Installer le CLI

- Suivre le guide d'installation: https://getclawdbot.com/guides/install/

```bash
# Vérifier l'installation
openclaw --version
```

2) Lancer l'onboarding (interactif recommandé)

```bash
openclaw onboard
# ou pour l'automatisation
openclaw onboard --non-interactive
```

3) Suivre les étapes guidées

- Choisir modèle/auth (Anthropic recommandé), emplacement du workspace, configuration Gateway (port, bind, auth, Tailscale), canaux, démon, skills. (https://docs.openclaw.ai/start/wizard)

4) QuickStart vs Advanced

- QuickStart: valeurs par défaut (loopback, port 18789, workspace par défaut, token auth auto). (https://docs.openclaw.ai/start/wizard)
- Advanced: contrôle sur bind, port, auth, workspace, exposition Tailscale. (https://docs.openclaw.ai/start/wizard)

5) Configurer la recherche web (optionnel)

```bash
openclaw configure --section web
# écrit tools.web.search.apiKey
```

6) Exemple concret de fichier de configuration produit par l'onboarding

```json
{
  "gateway": {
    "port": 18789,
    "bind": "127.0.0.1",
    "auth": { "tokenAuth": true }
  },
  "workspace": {
    "path": "~/.openclaw/workspace",
    "seeded": true
  },
  "models": {
    "default": "anthropic"
  },
  "channels": ["telegram"]
}
```

Les champs ci‑dessus (port 18789, workspace, tokenAuth=true, modèle par défaut) sont explicitement documentés par la référence CLI. (https://docs.openclaw.ai/start/wizard-cli-reference)

7) Installer le démon

- Choisir LaunchAgent (macOS) ou unité systemd user (Linux/WSL2) pour maintenir le Gateway. L'onboarding propose l'installation et effectue un health check. (https://docs.openclaw.ai/start/wizard-cli-reference)

8) Health check et smoke test

```bash
cat ~/.openclaw/openclaw.json
ss -ltnp | grep 18789 || netstat -ltnp | grep 18789
openclaw dashboard
```

9) Réexécution, reset et doctor

- Si `~/.openclaw/openclaw.json` existe, l'assistant propose Keep/Modify/Reset. `--reset` offre des scopes: Config only, Config + credentials + sessions, Full reset. Si la config est invalide, exécuter `openclaw doctor`. (https://docs.openclaw.ai/start/wizard-cli-reference)

## Architecture de reference

Composants (tels que l'onboarding les configure):

| Composant | Rôle | Valeur par défaut / note |
|---|---:|---|
| Gateway | Endpoint local/remote pour les clients/agents | Loopback, port 18789 (par défaut) (https://docs.openclaw.ai/start/wizard) |
| Workspace | Emplacement des agents et seeds | `~/.openclaw/workspace` (seeded) (https://docs.openclaw.ai/start/wizard-cli-reference) |
| Démon | Maintient le Gateway | LaunchAgent (macOS) / systemd user unit (Linux/WSL2) (https://docs.openclaw.ai/start/wizard-cli-reference) |
| Canaux | Entrées/sorties messaging | Telegram, WhatsApp, Discord, Google Chat, Mattermost, Signal, BlueBubbles (https://docs.openclaw.ai/start/wizard-cli-reference) |
| Modèles | Providers d'IA | Anthropic recommandé; OpenAI/OAuth et autres listés (https://docs.openclaw.ai/start/wizard-cli-reference) |

Flux primaire: onboarding → démarrage Gateway → health check → messages via canaux. Le mode remote configure une machine cliente pour se connecter à un Gateway distant sans modifier l'hôte distant. (https://docs.openclaw.ai/start/wizard-cli-reference)

## Vue fondateur: ROI et adoption

Points de contrôle immédiats (à vérifier après onboarding):

- Disponibilité: Gateway répond aux health checks et l'UI est accessible localement. (https://docs.openclaw.ai/start/wizard-cli-reference)
- Contrôle d'accès: token auth activé et allowlist de canaux pour piloter l'adoption. (https://docs.openclaw.ai/start/wizard)
- Mesure des coûts: suivre consommation de tokens et facturation des providers pendant la phase pilote.

Recommandations chiffrées pour pilote (propositions):

- Canary initial: 5% du trafic.
- Gate 1: 10 utilisateurs; Gate 2: 50 utilisateurs.
- Seuils de rollback: erreur > 1% ou latence > 200 ms ou taux d'erreur API > 5% sur 15 minutes.
- Plafond budget pilote: $100/jour pendant 7 jours.
- Limite de tokens par requête suggérée: 4096 tokens; quota journalier pilote: 5000 tokens (hypothèses).

Lien utile: références d'onboarding et CLI: https://docs.openclaw.ai/start/wizard-cli-reference

## Pannes frequentes et debugging

Problèmes documentés et commandes de diagnostic (source: https://docs.openclaw.ai/start/wizard-cli-reference):

- Config existante détectée: l'onboarding propose Keep/Modify/Reset; si la config contient des clés legacy ou est invalide, il demande `openclaw doctor`.

- Gateway ne démarre pas: vérifier le bind et le port (18789 par défaut), token d'auth, et logs du démon.

- Échecs canaux: vérifier tokens bot, JSON de service account pour Google Chat, ou finaliser le QR login WhatsApp.

Commandes utiles:

```bash
ps aux | grep openclaw
cat ~/.openclaw/openclaw.json
ss -ltnp | grep 18789
# Sur Linux: journalctl --user -u <unit>
# Sur macOS: launchctl list | grep openclaw
```

Si dérive de configuration: relancer l'onboarding en Modify/Reset ou utiliser `openclaw doctor`. (https://docs.openclaw.ai/start/wizard-cli-reference)

## Checklist production

### Hypotheses / inconnues

- L'onboarding crée/met à jour `~/.openclaw/openclaw.json` et sème `~/.openclaw/workspace` en mode local. (https://docs.openclaw.ai/start/wizard, https://docs.openclaw.ai/start/wizard-cli-reference)
- Les providers et options d'auth listés dans la référence CLI couvrent vos besoins (Anthropic recommandé, OpenAI OAuth supporté). (https://docs.openclaw.ai/start/wizard-cli-reference)
- Plan de rollout/rollback (proposition à valider): canary initial à 5% du trafic, gate 1 à 10 utilisateurs, gate 2 à 50 utilisateurs, rollback si erreur > 1% ou latence > 200 ms ou taux d'erreur API > 5% sur 15 minutes; fenêtre de rollback cible: 15 minutes. Ces chiffres sont des hypothèses à valider en produit/ops.
- Pilote: 10 utilisateurs internes pendant 7 jours avec budget initial de $100/jour comme plafond de sécurité (hypothèses).
- Tokens: limiter à 4096 tokens max par requête et 5000 tokens/jour pour le pilote (hypothèses).

### Risques / mitigations

- Risque: exposition externe accidentelle via Tailscale ou bind non sécurisé — Mitigation: vérifier manuellement l'activation et conserver token auth activé. (https://docs.openclaw.ai/start/wizard)
- Risque: fuite de credentials de canaux — Mitigation: stocker secrets dans un vault; garder seeds non sensibles dans le VCS. (https://docs.openclaw.ai/start/wizard-cli-reference)
- Risque: dérive de coûts modèles — Mitigation: appliquer quotas, alertes et commencer en mode conservateur (ex: plafond $100/jour). (opérationnel, à valider)

### Prochaines etapes

- Automatiser l'onboarding non interactif (`openclaw onboard --non-interactive`) en CI/CD en chiffrant templates de config et en stockant secrets dans un coffre. (https://docs.openclaw.ai/start/wizard-cli-reference)
- Lancer un pilote interne restreint (allowlist) pendant au moins 7 jours pour valider uptimes, flux canal→agent et consommation API.
- Mettre en place alertes sur les health checks Gateway et tableaux de bord de consommation API pour détecter dérives (alerte si latence > 200 ms, erreur > 1% sur 15 min).

---

Références:
- Onboarding Wizard (CLI) overview: https://docs.openclaw.ai/start/wizard
- CLI Onboarding Reference: https://docs.openclaw.ai/start/wizard-cli-reference
- Install guides: https://getclawdbot.com/guides/install/

Méthodologie: synthèse uniquement des éléments documentés; paramètres non explicitement fournis placés en Hypothèses / inconnues pour validation.
