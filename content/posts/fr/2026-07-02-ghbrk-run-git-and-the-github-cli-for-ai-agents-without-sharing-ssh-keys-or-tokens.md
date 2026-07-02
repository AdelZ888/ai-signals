---
title: "ghbrk : exécuter git et le CLI GitHub pour des agents IA sans partager de clés SSH ni tokens"
date: "2026-07-02"
excerpt: "Déployez ghbrk, un broker d'identifiants en Rust qui permet à des agents IA d'exécuter git et la CLI GitHub sans exposer de clés SSH ou de tokens API. Le broker s'appuie sur une politique possédée par root et centralise les journaux."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-02-ghbrk-run-git-and-the-github-cli-for-ai-agents-without-sharing-ssh-keys-or-tokens.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "ghbrk"
  - "sécurité"
  - "GitHub"
  - "agents IA"
  - "devops"
  - "Rust"
sources:
  - "https://github.com/marconae/ghbrk"
---

## TL;DR en langage simple

ghbrk est un "credential broker" écrit en Rust qui permet à des agents automatisés d'exécuter git et la CLI gh sans exposer les clés SSH ni les tokens. La prise de décision est gouvernée par une politique locale qui doit être protégée par root. (Source : https://github.com/marconae/ghbrk)

Actions immédiates recommandées (rapide, 1–2 heures pour un smoke test) :

- Récupérer le binaire ou cloner le dépôt et vérifier un hash connu.
- Déposer une politique contrôlée par root (permission exemple 0400) et commencer en lecture seule.
- Lancer ghbrk sur un hôte de confiance, collecter logs centralisés et scanner les images clients pour tokens.

Méthodologie: j'ai synthétisé le rôle et la contrainte root affichés dans le dépôt et ajouté conseils opérationnels minimaux.

## Ce que vous allez construire et pourquoi c'est utile

Vous déployez une instance de ghbrk qui agit comme intermédiaire entre des agents (bots, CI, assistants) et GitHub : le broker exécute git/gh pour l'agent selon une politique locale, sans livrer les secrets à l'agent. Cela réduit la surface de fuite des identifiants et centralise les règles et l'audit. (Source : https://github.com/marconae/ghbrk)

Bénéfices concrets :

- Réduction du risque de fuite des clés SSH / tokens (agents ne possèdent pas les secrets).
- Politique unique possédée par root pour limiter les modifications non autorisées.
- Journalisation centralisée pour audits et forensic.

Limitation explicite : ghbrk est un point d'exécution contrôlé, pas un gestionnaire complet de secrets. (Source : https://github.com/marconae/ghbrk)

## Avant de commencer (temps, cout, prerequis)

Prérequis observables et recommandations :

- Accès au dépôt ou binaire : https://github.com/marconae/ghbrk
- Hôte de confiance pour exécuter le broker et stocker la politique (fichier possédé par root).
- Connexion réseau vers GitHub pour les opérations git/gh.

Estimations opérationnelles (à valider en contexte) : smoke test 1–2 heures; staging 7–14 jours; canary 10% du trafic initial; rétention logs 90 jours; cible latence client <200 ms. VM minimale conseillée : 1 vCPU et 512–1024 MB RAM. Coût indicatif micro-VM : $0–10 / mois.

Checklist rapide :

- [ ] Repo/binaire accessibles et vérifiés (checksum).
- [ ] Politique déposée et possédée par root (mode 0400).
- [ ] Logs centralisés configurés (SIEM ou stockage objet).
- [ ] Images clients scannées pour tokens embarqués.

(Source : https://github.com/marconae/ghbrk)

## Installation et implementation pas a pas

Exemples pratiques — vérifiez toujours le dépôt officiel pour flags et schéma : https://github.com/marconae/ghbrk

1) Cloner et compiler (optionnel si vous téléchargez un binaire)

```bash
git clone https://github.com/marconae/ghbrk.git
cd ghbrk
# compiler localement si besoin (Rust/cargo)
cargo build --release
# binaire attendu : target/release/ghbrk
```

2) Déposer une politique exemple et protéger par root

```bash
sudo mkdir -p /etc/ghbrk
sudo tee /etc/ghbrk/policy.json > /dev/null <<'POL'
{ "version": "1", "rules": [{ "id": "read-only", "allow": ["repo:your-org/*:read"] }] }
POL
sudo chown root:root /etc/ghbrk/policy.json
sudo chmod 0400 /etc/ghbrk/policy.json
```

3) Exemple minimal d'exécution (Dockerfile illustratif)

```dockerfile
FROM debian:12-slim
COPY ghbrk /usr/local/bin/ghbrk
RUN useradd --system --home /nonexistent ghbrk
USER ghbrk
ENTRYPOINT ["/usr/local/bin/ghbrk", "--policy", "/etc/ghbrk/policy.json"]
```

4) Exemple systemd (restart automatique, restartSec 5s)

```ini
[Unit]
Description=ghbrk broker
After=network.target

[Service]
ExecStart=/opt/ghbrk/ghbrk --policy /etc/ghbrk/policy.json
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Remarque : vérifiez les flags dans le dépôt et pinner une release avant production : https://github.com/marconae/ghbrk

## Problemes frequents et correctifs rapides

Référence : https://github.com/marconae/ghbrk

Table diagnostic rapide :

| Symptôme                 | Cause probable                     | Action corrective (priorité)                      |
|--------------------------|------------------------------------|---------------------------------------------------|
| Permission denied        | Politique non possédée par root    | chown root; chmod 0400; vérifier SELinux/AppArmor |
| Token embarqué           | Secret présent dans l'image client | Rebuilder l'image sans secrets; rotation des tokens |
| Pas de journaux          | Forwarding mal configuré ou disque plein | Reconfigurer forwarding; alerter; libérer espace |

Correctifs rapides :

- Si policy -> chown root:root /etc/ghbrk/policy.json && chmod 0400 (vérifier que la politique est lisible par le service uniquement).
- Scanner images (outil SCA) pour trouver tokens; supprimer tout token en clair et rouler les tokens compromis.
- Mettre des alertes si taux de refus >1% sur 24h ou si latence >200 ms.

## Premier cas d'usage pour une petite equipe

Source et contexte : https://github.com/marconae/ghbrk

Contrainte ciblée pour fondateurs solo / petites équipes : sécuriser un bot CI ou un assistant qui doit cloner des dépôts en lecture seule sans gérer rotation complexe de secrets. Recommandations actionnables (au moins 3) :

1) Pinner et vérifier le binaire avant déploiement
   - Télécharger une release et vérifier sha256sum localement.
   - Garder 1 copie signée et 1 checksum dans le repo d'infra.

2) Démarrer en lecture seule et limiter l'impact
   - Déployer une politique minimale "read-only" (ex. repo:your-org/*:read) et lancer canary sur 10% des jobs CI.
   - Mesurer pour 7–14 jours avant d'étendre droits d'écriture.

3) Centraliser logs et automatiser détections rapides
   - Forwarder logs vers un SIEM ou stockage objet avec rétention 90 jours.
   - Mettre alertes si taux de refus >1% ou latence >200 ms.

4) Procédures pratiques pour un fondateur seul (opération en <10 minutes pour rollback)
   - Maintenir un runbook de 2–3 pages décrivant comment désactiver les écritures en <5 minutes et restaurer le service en <10 minutes.
   - Scanner images clients pour tokens avant mise en prod.

Checklist d'onboarding pour petite équipe :

- [ ] Binaire pinner et checksum validé
- [ ] Politique en lecture seule déposée (0400, root)
- [ ] Canary (10% des jobs) configuré
- [ ] Logs remontés et alertes configurées

(Source : https://github.com/marconae/ghbrk)

## Notes techniques (optionnel)

- Langage projet : Rust (mémo du dépôt). Rust limite certains bugs mémoire par son système de types et emprunts. (Source : https://github.com/marconae/ghbrk)
- La politique est décrite comme "root-owned" dans la page principale du dépôt : garantissez l'intégrité du fichier via ownership et permissions.
- Pour des besoins d'audit, conservez au moins 90 jours de journaux et un export quotidien compressé.

## Que faire ensuite (checklist production)

Source principale : https://github.com/marconae/ghbrk

### Hypotheses / inconnues

- Confirmé dans le dépôt : ghbrk est un credential broker Rust qui exécute git et gh pour des agents sans exposer clés/tokens, et la politique doit être possédée par root. (https://github.com/marconae/ghbrk)
- Valeurs opérationnelles fournies ici sont des hypothèses à valider en test : canary 10% du trafic, latence cible <200 ms, seuil alerte >1% refus, VM minimale 1 vCPU & 512–1024 MB RAM, rétention logs 90 jours, smoke test 1–2 heures, staging 7–14 jours, rollback écritures <5 minutes, restauration service <10 minutes, quota initial recommandé 5 PR/jour, documentation onboarding 2–3 pages, coût micro-VM $0–10/mo.

### Risques / mitigations

- Risque : politique permissive -> Mitigation : commencer read-only, revoir politique avec responsable, exiger approbation humaine pour écritures.
- Risque : tokens dans images -> Mitigation : scanner images, interdire secrets montés, rouler tokens compromis.
- Risque : perte d'audit -> Mitigation : forward logs hors de l'hôte, configurer rétention 90 jours et alertes sur échecs de forwarding.

### Prochaines etapes

- Vérifier le schéma exact de la politique et les flags CLI dans le dépôt et pinner une release : https://github.com/marconae/ghbrk
- Déployer un canary (10% du trafic) et observer pendant 7–14 jours; mesurer latence (<200 ms cible) et taux de refus (<1% cible).
- Mettre en place monitoring, dashboards et runbooks ; documenter onboarding 2–3 pages pour qu'un fondateur solo puisse rollback en <10 minutes.
- Scanner et durcir images clients, configurer rotation de tokens si nécessaire.

Référence principale : https://github.com/marconae/ghbrk
