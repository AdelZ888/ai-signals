---
title: "Hermes Agent : guide d'installation et premier démarrage pour macOS, Linux, WSL2 et Termux"
date: "2026-04-26"
excerpt: "Guide indépendant en français qui explique comment choisir macOS, Linux, WSL2 ou Termux, lancer l'installateur officiel en une ligne, recharger le shell et exécuter les commandes post-install essentielles pour vérifier Hermes."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-26-hermes-agent-installer-and-first-run-guide-for-macos-linux-wsl2-and-termux.jpg"
region: "FR"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "beginner"
timeToImplementMinutes: 30
editorialTemplate: "TUTORIAL"
tags:
  - "hermes-agent"
  - "installation"
  - "AI"
  - "devops"
  - "macOS"
  - "Linux"
  - "WSL2"
  - "Termux"
sources:
  - "https://ai-hermes-agent.com/install"
---

## TL;DR en langage simple

- Installez Hermes Agent avec le script officiel (one‑liner). Source : https://ai-hermes-agent.com/install
- Exécutez la commande d'installation fournie, rechargez votre shell, puis fournissez une clé d'API ou un endpoint compatible avant de configurer un modèle. Source : https://ai-hermes-agent.com/install
- Hôtes supportés : macOS, Linux, WSL2 (pour Windows) et Android via Termux. Source : https://ai-hermes-agent.com/install
- Vérifiez l'état avec les commandes CLI principales (ex. hermes doctor, hermes model list). Source : https://ai-hermes-agent.com/install

Méthodologie : j'ai synthétisé uniquement les instructions et recommandations issues de la page d'installation officielle (https://ai-hermes-agent.com/install).

Exemple d'installation (copier-coller) :

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

Commandes de vérification après installation :

```bash
hermes               # afficher l'aide / lancer Hermes
hermes doctor        # diagnostics de santé
hermes model list    # lister les modèles configurés
```

## Ce que vous allez construire et pourquoi c'est utile

Vous allez installer Hermes Agent sur une machine que vous contrôlez pour disposer d'un runtime local d'assistant accessible via une CLI. Hermes appelle un fournisseur de modèles externe en utilisant la clé d'API ou l'endpoint compatible que vous fournissez. Source : https://ai-hermes-agent.com/install

Pourquoi c'est utile (résumé extrait de la page officielle) :
- Point d'entrée privé et contrôlé pour automatiser des tâches. Source : https://ai-hermes-agent.com/install
- Prototypage d'assistants et exposition de gateways limitées et auditées. Source : https://ai-hermes-agent.com/install

Tableau comparatif rapide des hôtes supportés (d'après la page d'installation) :

| Hôte | Chemin recommandé | Cas d'usage recommandé | Source |
|------|-------------------|------------------------|--------|
| macOS | Installer officiel sur macOS | Machine personnelle toujours allumée, usage terminal‑first | https://ai-hermes-agent.com/install |
| Linux | Installer officiel sur Linux | VPS, homelab, déploiement cloud, exécution continue | https://ai-hermes-agent.com/install |
| Windows | Utiliser WSL2 (pas d'installation native recommandée) | Utilisateurs Windows souhaitant environnement Linux | https://ai-hermes-agent.com/install |
| Android | Termux + extras dédiés | Expérimentations mobiles légères | https://ai-hermes-agent.com/install |

## Avant de commencer (temps, cout, prerequis)

Prérequis explicitement listés sur la page d'installation :
- Hôte supporté : macOS, Linux, WSL2 ou Android via Termux. Source : https://ai-hermes-agent.com/install
- Accès à un shell avec curl (l'installateur one‑liner utilise curl). Source : https://ai-hermes-agent.com/install
- Clé d'API ou endpoint compatible du fournisseur de modèles avant de configurer votre premier modèle. Source : https://ai-hermes-agent.com/install

Checklist pré‑installation :
- [ ] Vérifier que l'hôte est supporté (macOS / Linux / WSL2 / Termux). Source : https://ai-hermes-agent.com/install
- [ ] Disposer d'un compte et d'une clé API chez le provider de modèles
- [ ] Avoir curl et accès à raw.githubusercontent.com
- [ ] Préparer la gestion des secrets (variables d'environnement ou gestionnaire de secrets). Source : https://ai-hermes-agent.com/install

Exemple minimal (NE PAS committer les secrets) :

```yaml
# example hermes model config (ne pas commit les secrets)
models:
  default:
    provider: example-provider
    api_key: "${HERMES_API_KEY}"
    endpoint: "https://api.example-provider.com/v1"
```

Source : https://ai-hermes-agent.com/install

## Installation et implementation pas a pas

Résumé d'ordre d'exécution (tiré de la page d'installation) : choisir l'hôte, exécuter l'installateur officiel, recharger le shell, puis configurer la clé du fournisseur. Source : https://ai-hermes-agent.com/install

Étapes détaillées :
1) Ouvrez un terminal sur l'hôte choisi. Source : https://ai-hermes-agent.com/install

2) Lancez l'installateur officiel (one‑liner) :

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

3) Rechargez votre shell immédiatement après l'installation (fermez/réouvrez le terminal ou sourcez votre profil) pour que la commande hermes soit disponible. Source : https://ai-hermes-agent.com/install

4) Commandes de premier niveau à exécuter pour vérifier :

```bash
hermes               # aide et entrée principale
hermes model list    # lister / vérifier les modèles
hermes doctor        # exécuter diagnostics de santé
hermes update        # mettre à jour l'agent
```

5) Configurez la clé du fournisseur : exportez une variable d'environnement (ex. HERMES_API_KEY) ou utilisez votre gestionnaire de secrets avant de créer la configuration du modèle. Source : https://ai-hermes-agent.com/install

6) Sous Windows : installez et exécutez Hermes dans WSL2, comme recommandé par la page d'installation. Source : https://ai-hermes-agent.com/install

Notes pratiques extraites de la doc officielle : l'installateur officiel est la voie recommandée sauf si vous faites une installation contributrice ou un cas particulier ; pour Android utilisez le guide Termux. Source : https://ai-hermes-agent.com/install

## Problemes frequents et correctifs rapides

Problèmes courants et solutions, basés sur la page d'installation : Source : https://ai-hermes-agent.com/install

- Hermes introuvable après l'installation : rechargez le shell comme indiqué par l'installateur. Source : https://ai-hermes-agent.com/install
- Windows natif problématique : installez dans WSL2 et évitez le chemin Windows natif. Source : https://ai-hermes-agent.com/install
- curl absent ou téléchargement échoue : installez curl via votre gestionnaire de paquets et vérifiez l'accès à raw.githubusercontent.com. Source : https://ai-hermes-agent.com/install
- Erreurs d'authentification : vérifiez que la variable d'environnement HERMES_API_KEY ou l'endpoint sont correctement définis. Source : https://ai-hermes-agent.com/install
- Dépendances Termux manquantes : suivre le guide Termux spécifique listé sur la page d'installation. Source : https://ai-hermes-agent.com/install

Règle simple : assurez-vous que "hermes doctor" n'affiche pas d'erreurs avant d'exposer des gateways externes. Source : https://ai-hermes-agent.com/install

## Premier cas d'usage pour une petite equipe

Public cible : fondateurs solo et petites équipes qui veulent démarrer vite et réduire la surface de risque. Source : https://ai-hermes-agent.com/install

Scénario d'exemple (tri automatique de messages + génération de notes de release courtes) — process minimal :
1) Installer Hermes sur un hôte supporté via l'installateur officiel. Source : https://ai-hermes-agent.com/install
2) Stocker la clé API hors dépôt (gestionnaire de secrets ou variables d'environnement). Source : https://ai-hermes-agent.com/install
3) Ouvrir une passerelle contrôlée (ex. webhook privé) pour la phase de test. Source : https://ai-hermes-agent.com/install
4) Valider le bon fonctionnement avec hermes doctor et tests smoke avant d'élargir l'accès. Source : https://ai-hermes-agent.com/install
5) Rollback simple : désactiver la passerelle et restaurer une configuration connue.

Checklist pour la petite équipe :
- [ ] Exécuter l'installateur officiel (https://ai-hermes-agent.com/install)
- [ ] Placer les clés API dans un gestionnaire de secrets
- [ ] Configurer une passerelle privée pour le test
- [ ] Obtenir un hermes doctor sans erreurs avant d'élargir

Source : https://ai-hermes-agent.com/install

## Notes techniques (optionnel)

- Le script recommandé est disponible sur GitHub raw et est utilisé dans la commande one‑liner (raw.githubusercontent.com). Source : https://ai-hermes-agent.com/install
- Hôtes explicitement supportés : Linux, macOS, WSL2, Android via Termux. Source : https://ai-hermes-agent.com/install
- L'installateur officiel est la voie recommandée sauf pour les setups contributeur ou cas limites. Source : https://ai-hermes-agent.com/install

## Que faire ensuite (checklist production)

Source : https://ai-hermes-agent.com/install

### Hypotheses / inconnues

Les bornes chiffrées et les paramètres ci‑dessous sont des hypothèses à valider dans votre contexte (elles ne figurent pas explicitement sur la page d'installation officielle et servent de valeurs de départ) :

- Latence médiane cible pour prompts simples : 500 ms
- Disponibilité cible pour l'hôte canary : 99 %
- Timeout par requête : 60 s
- Budget tokens par interaction : 1 000 tokens
- Nombre d'utilisateurs canary initial : 1–5
- Durée du test privé : 7–14 jours
- Nombre de retries en cas d'erreur transitoire : 3
- Ressources minimales hypothétiques pour un petit VPS : 1 vCPU, 1–2 GB RAM
- Fréquence de vérification (hermes doctor) pendant canary : toutes les 5–15 minutes
- Taille de log à conserver en phase d'essai : 100–1 000 fichiers/jour selon volumétrie

### Risques / mitigations

- Risque : exécuter un script distant non audité.
  - Mitigation : pinnez le commit SHA du script raw.githubusercontent.com ou vendorisez le script dans votre dépôt avant déploiement.

- Risque : fuite de clés API.
  - Mitigation : utiliser un gestionnaire de secrets, n'ajoutez jamais de clés au contrôle de version, et limitez l'accès aux secrets à ≤ 3 personnes en phase initiale.

- Risque : comportement inattendu en production.
  - Mitigation : commencer en canary (1–5 utilisateurs), valider hermes doctor et les smoke tests, puis augmenter graduellement (par paliers 1 → 5 → 10+).

### Prochaines etapes

- Pin + vendoriser : copier ou pinner le script d'installation sur un commit SHA dans votre repo de déploiement.
- Service reproductible : créer une unité systemd ou un entrypoint container et activer restart automatique.
- Secrets en production : migrer les API keys vers un gestionnaire de secrets et les injecter au démarrage.
- Monitoring : ajouter logs, checks de disponibilité et exécuter hermes doctor via un scheduler (p. ex. toutes les 5–15 minutes) pendant la phase canary.
- Extension progressive : ouvrir les gateways par paliers et documenter les décisions.

Checklist production :
- [ ] Pin du script d'installation dans le repo
- [ ] Service systemd/container prêt avec restart
- [ ] Secrets migrés vers secret manager
- [ ] Monitoring et checks réguliers en place
- [ ] Plan de rollback testé

Référence d'installation autoritative : https://ai-hermes-agent.com/install
