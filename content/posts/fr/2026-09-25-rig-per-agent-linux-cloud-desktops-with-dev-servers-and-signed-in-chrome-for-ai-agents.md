---
title: "Rig : postes de travail Linux par agent dans le cloud avec serveur de dev et Chrome connecté pour agents IA"
date: "2026-09-25"
excerpt: "Rig fournit des postes de travail Linux par agent (chaque agent obtient un desktop avec serveur de développement, tests et un Chrome connecté qui se met en pause quand il est inactif). Guide pratique pour cloner, lancer et inspecter un agent (contexte UK)."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-25-rig-per-agent-linux-cloud-desktops-with-dev-servers-and-signed-in-chrome-for-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "AI"
  - "agents"
  - "cloud-desktop"
  - "open-source"
  - "devops"
  - "rig"
  - "UK"
sources:
  - "https://github.com/ShadowWalker2014/rig"
---

## TL;DR en langage simple

- Rig est un projet open-source qui fournit des desktops cloud pour agents d'intelligence artificielle (IA). (source : https://github.com/ShadowWalker2014/rig)
- Chaque agent reçoit un desktop Linux. Le desktop inclut un serveur de développement, une suite de tests et un Chrome (navigateur) connecté qui se met en pause quand il est inactif. (https://github.com/ShadowWalker2014/rig)
- Objectif immédiat : cloner le dépôt, lancer l'exemple fourni et ouvrir le desktop dans votre navigateur. Cela garde votre machine locale libre et rapide.

Checklist rapide (3 actions simples)

- [ ] git clone https://github.com/ShadowWalker2014/rig
- [ ] Lire README.md et repérer le script d'exemple (https://github.com/ShadowWalker2014/rig)
- [ ] Exécuter le script d'exemple et ouvrir l'URL fournie

Court scénario concret

- Vous êtes développeur·se A. Vous clonez le dépôt, vous lancez l'exemple sur une VM cloud. Vous recevez une URL. Vous ouvrez cette URL et voyez un desktop Linux avec Chrome connecté. Vous exécutez un test et récupérez les logs pour diagnostiquer un bug, sans utiliser votre laptop pour tout exécuter.

Remarque : ce guide suit la description publique du projet (https://github.com/ShadowWalker2014/rig).

## Ce que vous allez construire et pourquoi c'est utile

Vous allez provisionner un desktop cloud pour un agent IA à partir du dépôt Rig (https://github.com/ShadowWalker2014/rig). Le README décrit le projet ainsi : "Open-source cloud desktops for AI agents. Each agent gets a Linux desktop with a dev server, tests and a signed-in Chrome that pauses when idle." (https://github.com/ShadowWalker2014/rig).

Pourquoi c'est utile :

- Isolation : le code et le navigateur tournent à distance. Votre laptop reste réactif.
- Observabilité : accès direct au desktop et au navigateur pour reproduire et diagnostiquer un problème.
- Reproductibilité : on peut partager l'état isolé (logs, tests, session navigateur) pour que d'autres reproduisent le même comportement.

Table de comparaison (extrait documenté)

| Fonctionnalité déclarée | Présent dans l'extrait du dépôt (oui/non) | Remarque |
|---|---:|---|
| Desktop Linux par agent | Oui | Directement mentionné (https://github.com/ShadowWalker2014/rig) |
| Serveur de développement inclus | Oui | Mentionné explicitement |
| Suite de tests disponible | Oui | Mentionné explicitement |
| Chrome connecté, pause inactive | Oui | Mentionné explicitement |

(voir README : https://github.com/ShadowWalker2014/rig)

Plain-language explanation avant les détails avancés

Avant d'entrer dans les commandes et la configuration avancée : vous allez essentiellement faire trois choses : obtenir le code (git clone), lire le README pour connaître le script d'exemple, et exécuter ce script sur une machine (locale ou cloud). Les détails avancés expliquent comment vérifier que le service répond, consulter les logs, et protéger les ports réseau. Si vous débutez, suivez d'abord l'exemple simple puis explorez les options.

## Avant de commencer (temps, cout, prerequis)

Lire d'abord README.md du dépôt : https://github.com/ShadowWalker2014/rig

Prérequis minimaux :

- git installé.
- Accès à une machine Linux locale ou une VM cloud.
- Navigateur moderne pour ouvrir l'interface.

Hypothèses opérationnelles (à valider dans le README) :

- Temps estimé pour avoir un agent fonctionnel : ~90 minutes (clonage, lecture, provisioning). Vérifiez le README pour confirmer.
- Commencez avec 1 agent pour valider le flux.
- Organisation cible pour un premier test : petite équipe ou développeur·se seul·e.

(Confirmez toujours les détails dans le README : https://github.com/ShadowWalker2014/rig)

## Installation et implementation pas a pas

Suivez d'abord le README du dépôt comme source principale : https://github.com/ShadowWalker2014/rig

1) Cloner et inspecter

```bash
# clonage et lecture rapide
git clone https://github.com/ShadowWalker2014/rig
cd rig
ls -la
sed -n '1,160p' README.md
```

2) Identifier le script d'exemple cité dans le README. Notez les variables d'environnement et les permissions nécessaires.

3) Préparer un hôte test (local ou cloud). Ouvrez uniquement les ports nécessaires. (https://github.com/ShadowWalker2014/rig)

4) Lancer l'exemple indiqué par le README. Notez l'URL fournie par la sortie.

Vérifications rapides (exemples de commandes)

```bash
# vérifier qu'un port exposé répond (remplacez IP/PORT par les valeurs fournies)
curl -I http://<VM-IP>:<PORT>

# état de l'hôte via SSH (remplacez user/IP)
ssh user@<VM-IP> "uptime; free -m; df -h"
```

Exemple de test local (docker-compose) — adaptatif, confirmez avec le README du dépôt avant usage : https://github.com/ShadowWalker2014/rig

```yaml
# docker-compose.yml - smoke test local
version: '3.8'
services:
  dev-desktop:
    image: ubuntu:22.04
    container_name: rig-dev-desktop
    tty: true
    volumes:
      - ./workspace:/home/dev/workspace
    ports:
      - "8080:8080" # port serveur de dev
    command: /bin/bash -lc "apt-get update && apt-get install -y python3 && cd /home/dev/workspace && python3 -m http.server 8080"
```

Lancer le test local :

```bash
docker-compose up --build -d
# ouvrir http://localhost:8080
```

Note méthodologique : suivez toujours le README officiel pour les commandes exactes (https://github.com/ShadowWalker2014/rig).

## Problemes frequents et correctifs rapides

Consultez d'abord le README et la sortie/logs du script d'initialisation (https://github.com/ShadowWalker2014/rig).

Problème : serveur de dev inaccessible

- Vérifier le port imprimé par le script. (https://github.com/ShadowWalker2014/rig)
- Vérifier le pare-feu (firewall) ou les security groups du cloud. N'ouvrez que le port nécessaire.
- Tester depuis une autre machine avec curl.

Problème : Chrome semble inactif ou non connecté

- Le README indique un Chrome connecté qui se met en pause quand il est inactif. Inspectez les scripts pour comprendre la gestion des sessions et de l'authentification (https://github.com/ShadowWalker2014/rig).

Problème : erreurs au lancement

- Relancer le script en redirigeant stdout/stderr vers un fichier.
- Chercher un dossier de logs produit par le script et tailer les 200 dernières lignes :

```bash
ssh user@<VM-IP> "tail -n 200 ~/rig/logs/* || ls -la ~/rig/logs"
```

- Vérifier les variables d'environnement (.env.example) si présentes.

## Premier cas d'usage pour une petite equipe

Public cible : fondateurs solo et petites équipes (jusqu'à 3 personnes) qui veulent reproduire ou diagnostiquer des comportements d'agent. (https://github.com/ShadowWalker2014/rig)

Flux recommandé (canary simple)

1) Personne A : git clone https://github.com/ShadowWalker2014/rig et exécute le script d'exemple.
2) Personne A : capture logs, screenshoot du desktop et URL de session.
3) Personnes B/C : utilisent ces artefacts pour reproduire localement et proposer un correctif.

Bonnes pratiques :

- Limitez initialement à 1 agent pour maîtriser coût et complexité.
- Collecter systématiquement : logs (au moins 1 fichier compressé), capture d'écran (PNG), et un dump d'état si possible.
- Utiliser pull requests (PR) + revue pour tout changement des scripts de démarrage.

## Notes techniques (optionnel)

- Fait documenté : Rig propose des desktops Linux par agent, avec serveur de dev, tests et Chrome qui se met en pause (https://github.com/ShadowWalker2014/rig).
- Ne stockez pas de secrets en clair. Utilisez des variables d'environnement ou un gestionnaire de secrets.

Exemple .env (générique) :

```env
# .env.example
RIG_AGENT_NAME=canary-1
RIG_DEV_PORT=8080
RIG_IDLE_TIMEOUT_MIN=30
```

Exemple de détection d'inactivité (placeholder à adapter aux scripts du dépôt) :

```bash
# placeholder idle detect - adapter au dépôt
if ./detect-no-active-sessions.sh --idle-min 30; then
  echo "Idle for 30 min, consider shutting down"
fi
```

Metrics recommandées (suggestions opérationnelles) : surveiller CPU, RAM et sessions actives. Définir alertes (ex. CPU > 75% soutenu 5 minutes).

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse : temps pour la première instance ≈ 90 minutes (clonage, lecture, provisioning). Valider sur README : https://github.com/ShadowWalker2014/rig
- Hypothèse : durée canary proposée = 7 jours. (à valider)
- Hypothèse : timeout d'inactivité suggéré = 30 minutes. (à valider)
- Hypothèse : règle d'alerte CPU = 75% soutenu pendant 5 minutes. (opérationnelle, à ajuster)
- Hypothèse : démarrer avec 1 instance, puis 3 si réussite.
- Hypothèse coûts indicatifs : £0.04–£0.40 par heure selon taille et provider. (estimation à vérifier)
- Hypothèse tailles VM de départ (à tester) : small 2 vCPU / 4 GB, medium 4 vCPU / 8 GB, large 8 vCPU / 16 GB.
- Hypothèse : conserver 3 snapshots par agent pendant 30 jours.

(Validez ces hypothèses dans le README et les scripts du dépôt : https://github.com/ShadowWalker2014/rig)

### Risques / mitigations

- Risque : secrets commis. Mitigation : .gitignore + gestionnaire de secrets.
- Risque : coûts non maîtrisés. Mitigation : arrêt automatique après 30 minutes d'inactivité et alertes budgétaires.
- Risque : divergences de configuration. Mitigation : PR obligatoire et stockage des configurations canoniques.
- Risque : perte d'artefacts. Mitigation : politique de collecte (logs + screenshot + dump) pour chaque incident.

### Prochaines etapes

- Cloner et valider le quickstart : git clone https://github.com/ShadowWalker2014/rig
- Lancer un smoke test local (docker-compose ci‑dessus), puis un test sur une VM cloud unique.
- Mettre en place télémétrie minimale : CPU, mémoire, sessions actives; alerter si CPU > 75% pendant 5 minutes.
- Exécuter un canary de 7 jours avec 1 agent. Si OK, étendre à 3 agents en suivant des gates de déploiement.

Dernier rappel : inspectez toujours README.md et les scripts d'exemple du dépôt avant d'exécuter des commandes (https://github.com/ShadowWalker2014/rig).
