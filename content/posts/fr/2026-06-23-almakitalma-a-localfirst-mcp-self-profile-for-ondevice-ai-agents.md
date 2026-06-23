---
title: "alma (almakit/alma) — profil « self » local pour agents IA sur machine"
date: "2026-06-23"
excerpt: "Exécutez alma localement pour stocker un profil « self » structuré et versionné sur votre machine. Garde les données privées sur l’appareil, standardise les décisions des agents et facilite le prototypage rapide."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-23-almakitalma-a-localfirst-mcp-self-profile-for-ondevice-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "AI"
  - "agents"
  - "local-first"
  - "alma"
  - "MCP"
  - "self-model"
  - "développement"
  - "UK"
sources:
  - "https://github.com/almakit/alma"
---

## TL;DR en langage simple

- Qu'est-ce que c'est : alma (repo https://github.com/almakit/alma) est un modèle "self" local que vous pouvez exécuter depuis le dépôt. Il stocke un profil privé et structuré d'une personne ou d'une équipe. Des agents locaux peuvent lire ce profil et, si vous l'autorisez, le modifier.
- Pourquoi c'est utile : garder les données privées sur votre machine. Fournir une source unique et versionnée pour les décisions des agents. Rendre le comportement des agents plus prévisible et plus auditable.
- Actions rapides : cloner le dépôt, lire le README, lancer une instance de développement locale, charger un profil d'exemple, exécuter une requête simple.

Checklist (smoke) :
- [ ] cloner → installer → démarrer le serveur local → charger sample-profile.json → lancer une requête d'essai

Explication en clair avant les détails techniques :
- Ce projet conserve une petite représentation structurée de « qui je suis » (personne ou équipe) sur votre machine. Les agents — petits programmes qui prennent des décisions ou proposent des actions — lisent ce profil local au lieu d'interroger un service externe pour obtenir des informations privées. Les secrets restent locaux. Le comportement devient reproductible.

Exemple concret (scénario court) :
- Une petite équipe produit exécute alma sur un portable d'équipe. Un bot de triage lit le profil d'équipe et propose des relecteurs selon la disponibilité et les préférences stockées dans sample-profile.json. Au départ, le bot ne fait que lire ; les droits d'écriture sont ajoutés plus tard via un drapeau.

Note courte sur le terme "MCP" : le dépôt se décrit comme un modèle local-first de type "MCP" (terme utilisé par le projet). Pour plus de détails et le code, voir le dépôt source : https://github.com/almakit/alma.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez exécuter une instance locale du modèle « self » alma pour que des agents locaux puissent lire et, si vous l'autorisez, écrire un profil structuré. Le dépôt décrit un modèle local-first de type MCP pour agents IA : https://github.com/almakit/alma.

Ce que cela vous apporte :
- Stockage local des champs sensibles : pas besoin d'envoyer des préférences privées vers un service hébergé.
- Source unique de vérité : plusieurs agents qui lisent le même profil agiront de façon cohérente.
- Artefact minimal et versionné : un fichier JSON/YAML qui contient identité, rôles, préférences et règles.

Artefact concret : sample-profile.json contient identité, rôles, préférences et un petit bloc de politiques. Voir le dépôt : https://github.com/almakit/alma.

Note en clair avant les étapes :
- Pensez au profil comme un petit fichier versionné que vous contrôlez. Commencez simple : nom, rôles, préférences et une règle qui indique ce qu’un agent peut faire automatiquement.

## Avant de commencer (temps, cout, prerequis)

Référence : https://github.com/almakit/alma

Ce dont vous aurez besoin :
- Git et des compétences de base en terminal.
- Un éditeur de texte et un navigateur.
- De l'espace disque pour un dossier de données où placer les profils.

Checklist avant d'exécuter :
- [ ] git installé et opérationnel
- [ ] Accès en lecture au dépôt : https://github.com/almakit/alma
- [ ] Créer un répertoire data pour les fichiers de profil et les sauvegardes

Remarques : le README du dépôt contient les commandes exactes pour le runtime et le démarrage. Vérifiez-le avant d'installer.

Temps et coût estimés (hypothèses à valider) :
- Prototype : quelques heures pour cloner, démarrer et tester un flux simple.
- Coût : nul si tout tourne localement ; coûts possibles si vous connectez des LLM (modèles de langage) hébergés.

## Installation et implementation pas a pas

Référence : https://github.com/almakit/alma

1. Cloner le dépôt et lire le README.

```bash
# clone
git clone https://github.com/almakit/alma
cd alma
less README.md
```

2. Installer les runtimes et dépendances indiqués dans le README. Si le projet utilise Node ou Python, suivez les versions spécifiées.

3. Créer un dossier local data et un profil minimal nommé sample-profile.json.

4. Copier la configuration d'exemple du dépôt et mettre à jour le chemin data pour pointer sur votre profil.

5. Démarrer l'instance de développement locale selon le README. Confirmez que le processus écoute sur le port configuré.

```bash
# exemples de démarrage — adaptez selon ce que documente le dépôt
# Si le dépôt fournit un script
./run-local.sh --config config/local.yaml
# Ou pour un projet Node
npm run dev
```

6. Placer sample-profile.json dans le dossier de données configuré. Exemple minimal (ajustez au schéma du dépôt) :

```json
{
  "id": "example-self",
  "identity": { "name": "Alex", "role": "product" },
  "preferences": { "meeting_window": "09:00-17:00", "timezone": "Europe/London" },
  "policies": { "auto_assign_pr": false }
}
```

7. Faire un test rapide (smoke). Demandez à un agent de lire une préférence et de retourner un résultat contrôlé (par exemple proposer des créneaux de réunion basés sur meeting_window). Gardez les tests déterministes et courts.

Table de décision (exemple editable) :

| Field | Autorisé pour actions automatisées ? | Nécessite approbation humaine |
|-------|-------------------------------------:|------------------------------:|
| preferences.meeting_window | Oui | Non |
| policies.auto_assign_pr | Non | Oui |
| identity.email | Non | Oui |

8. Ajouter un script smoke qui vérifie l'accès en lecture et valide les sorties. Assertions simples : clés attendues présentes et pas de fuite de champs privés.

Conseil de déploiement : exécutez l’automatisation sur un petit échantillon d’abord et laissez les écritures derrière un feature flag.

## Problemes frequents et correctifs rapides

Référence : https://github.com/almakit/alma

Le serveur ne démarre pas
- Correctif : changez le port configuré et retentez. Consultez les logs pour l'erreur exacte.

Runtime ou dépendance manquante
- Correctif : installez la version du runtime indiquée dans le README.

Profil non chargé ou réponses vides
- Correctif : vérifiez que sample-profile.json est placé dans le dossier data configuré et que le processus a les permissions de lecture.

Réponses agents incohérentes ou obsolètes
- Correctif : confirmez que l'agent lit le namespace de données actif et désactivez/rapprochez les caches pendant les tests.

Diagnostics utiles :

```bash
# vérifier les ports à l'écoute (exemple)
ss -ltnp | grep 3000
# lire les logs
tail -n 200 logs/dev.log
```

Objectifs de monitoring pour les tests initiaux : garder le flux smoke petit et reproductible ; viser un taux de lecture élevé et peu d'erreurs.

## Premier cas d'usage pour une petite equipe

Référence : https://github.com/almakit/alma

Scénario : une petite équipe produit veut un assistant de triage qui suggère des relecteurs à partir d'un profil d'équipe local. Le profil reste anonymisé et l'accès en lecture seule est préféré au départ.

Comment démarrer :
- Exécuter alma localement sur une machine privée et créer team-profile.json avec les préférences des relecteurs et leurs disponibilités.
- Donner au bot de triage un accès en lecture seule au profil. Bloquer les écritures derrière un feature flag.
- Lancer un canary court sur un dépôt et inspecter les résultats avant d'étendre.

Mesures pendant le canary : temps moyen de triage, cas d'assignations incorrectes et satisfaction des relecteurs. Suivre des signaux simples fournis par le script smoke.

Conseil pour un fondateur solo : commencer par une seule automatisation, garder les données locales, garder le profil minimal et versionné.

## Notes techniques (optionnel)

Référence : https://github.com/almakit/alma

Format de données et validation
- Attendez-vous à du JSON ou YAML pour les fichiers de profil. Conservez un schéma de validation si le dépôt en fournit un.

Sécurité et stockage
- Chiffrez les champs sensibles au repos si vous stockez des secrets localement. Utilisez des keyrings locaux et des journaux audités pour les lectures et écritures.

Tuning performance (dev vs prod)
- Utilisez des TTL de cache courts en développement. Augmentez les TTL en production seulement après validation.

Exemple de snippet YAML de configuration locale :

```yaml
server:
  port: 3000
  host: 127.0.0.1
data:
  profile_path: ./data/sample-profile.json
security:
  encrypt_sensitive: true
  encryption_key_path: ~/.keys/alma_key
```

Si vous prévoyez d'attacher des LLM externes, contrôlez l'utilisation de tokens et les coûts via des plafonds et compteurs.

Remarque sur les aspects non confirmés (à traiter comme hypothèses) :
- Le dépôt semble fournir un mode exécutable localement et un README décrivant le démarrage local (source : snapshot du dépôt). Détails tels que exigences exactes de CPU/RAM ou durée de canary sont des hypothèses et doivent être validés dans votre environnement.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Le dépôt fournit un mode local exécutable et un README qui décrit comment lancer une instance locale (source snapshot : https://github.com/almakit/alma). Cette affirmation est basée sur le snapshot ; vérifiez le README actuel.
- Estimations prototypes citées précédemment (durée 3 heures, machine recommandée 4 CPU / 8 GB RAM, durée canary 7 jours, seuils de succès) sont des hypothèses. Mesurez et ajustez dans votre contexte.

### Risques / mitigations

- Risque : fuite accidentelle de champs privés.
  - Mitigation : chiffrage au repos des champs sensibles, approbation humaine obligatoire pour les écritures, journaux d'audit.
- Risque : mauvaise qualité d'automatisation (assignations incorrectes).
  - Mitigation : canary sur petit échantillon, approbation humaine pendant la fenêtre initiale, déclencheur de rollback si le taux d'erreur dépasse votre seuil.
- Risque : coûts API inattendus si vous utilisez des LLM hébergés.
  - Mitigation : plafonds de dépense, limites de tokens par requête, monitoring et alertes sur les pics de coût.

### Prochaines etapes

- Ajouter le test smoke au CI pour qu'il s'exécute automatiquement lors des changements (ex. tests/smoke.sh).
- Finaliser et versionner la table de décision qui mappe les champs du profil aux actions automatisées autorisées.
- Mettre en place des sauvegardes et une politique de rétention ; commencer par des snapshots quotidiens et une rétention de 30 jours.
- Implémenter monitoring et alertes pour taux de lecture < 95% ou taux d'erreur > 5% (valeurs initiales à ajuster après canary).
- Replacer les hypothèses par des valeurs mesurées à l'issue du canary.

Référence / dépôt : https://github.com/almakit/alma
