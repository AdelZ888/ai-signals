---
title: "Journaliser des décisions d'agents IA en JSONL signé avec le protocole dcp‑ai (options post‑quantum)"
date: "2026-04-25"
excerpt: "Guide pratique pour ajouter une couche d'audit portable aux agents IA avec dcp‑ai : enregistrer des lignes JSON signées, vérifier les signatures, piloter en 3 heures, et notes sur le post‑quantum."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-25-record-signed-jsonl-audit-logs-for-ai-agents-with-the-dcp-ai-protocol-post-quantum-options.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "dcp-ai"
  - "audit"
  - "agents-IA"
  - "JSONL"
  - "sécurité"
  - "post-quantum"
  - "UK"
sources:
  - "https://github.com/dcp-ai-protocol/dcp-ai"
---

## TL;DR en langage simple

- But : ajouter une piste d'audit simple et vérifiable pour les actions d'un agent IA. Référence : https://github.com/dcp-ai-protocol/dcp-ai.
- Résultat attendu : un fichier de logs au format JSONL (une ligne JSON par événement) où chaque événement utile est émis et signé. Vous aurez aussi un petit script local pour vérifier ces signatures.
- Processus court : cloner le dépôt, lire le README, générer une paire de clés (ou configurer un KMS), brancher un hook qui émet et signe chaque événement, puis vérifier avec un script local.

Exemple concret rapide : vous êtes un·e solo founder qui teste un assistant qui supprime ou modifie des données. Vous lancez le wrapper localement, réalisez 20 interactions de test, puis lancez un script qui parcourt accountability.log et valide les signatures pour confirmer qu’aucune action n’a été modifiée.

Note : le dépôt de référence est ici : https://github.com/dcp-ai-protocol/dcp-ai (protocole pour agents IA liés aux humains).

## Ce que vous allez construire et pourquoi c'est utile

Vous allez construire un petit "wrapper" autour d’un agent IA. Ce wrapper :

- capture chaque action pertinente comme un objet JSON compact ;
- signe l’objet avec une clé privée ;
- écrit chaque enregistrement signé en append-only dans un fichier JSONL.

Pourquoi c’est utile :

- traçabilité simple pour audits ;
- possibilité de vérifier l’intégrité hors ligne sans accéder au système lui-même ;
- base pour gérer la révocation ou la rotation des clés.

Référence projet et protocole : https://github.com/dcp-ai-protocol/dcp-ai. Le dépôt sert de guide pour l’architecture et les conventions.

## Avant de commencer (temps, cout, prerequis)

- Prérequis logiciels : Git et un runtime (par ex. Python 3.x ou Node.js). Voir le repo : https://github.com/dcp-ai-protocol/dcp-ai.
- Matériel / stockage : espace disque local pour logs. Quelques Mo suffisent pour un prototype ; prévoyez des dizaines de Go si le trafic est important.
- Sécurité initiale : commencez avec une clé locale pour prototypage. En production, migrez vers un KMS (Key Management Service) ou un HSM (Hardware Security Module).
- Contrôles d’accès : limiter les droits de modification du fichier de logs. ACL signifie "Access Control List".
- Durée estimée : prototype local = quelques heures ; pilote en canary = 1–2 jours.

### Explication simple avant les détails avancés

Avant d’entrer dans l’installation et les commandes, voici l’idée en clair : à chaque action de l’agent que vous voulez tracer, vous créez un petit objet JSON contenant l’essentiel (horodatage, type d’action, identifiants pertinents, sortie). Vous signez cet objet et vous l’ajoutez comme une ligne dans un fichier JSONL. Plus tard, n’importe qui qui a la clé publique (ou y accède via un outil) peut vérifier que la ligne n’a pas été modifiée.

Ceci évite d’avoir à fouiller des bases complexes. C’est une piste d’audit simple, vérifiable et archivable.

## Installation et implementation pas a pas

1) Cloner le dépôt et inspecter le README

```bash
git clone https://github.com/dcp-ai-protocol/dcp-ai.git
cd dcp-ai
ls -la
# lire le README.md et les dossiers d'exemples
```

2) Générer une paire de clés locale (exemple rapide)

```bash
mkdir -p ./keys
openssl genpkey -algorithm RSA -out ./keys/agent_signing.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in ./keys/agent_signing.pem -out ./keys/agent_signing.pub
```

3) Exemple de configuration minimale (exemple local YAML)

```yaml
version: 1
log_path: ./accountability.log
signing_key: ./keys/agent_signing.pem
batching: true
batch_max_items: 50
```

4) Brancher le hook d'audit

- Ajoutez un wrapper autour du gestionnaire d’actions de votre agent. À chaque action pertinente, le wrapper :
  1) crée un objet JSON réduit ;
  2) calcule une signature (clé privée) ;
  3) écrit une ligne JSONL dans le fichier de logs.
- Le dépôt est une référence pour la structure générale : https://github.com/dcp-ai-protocol/dcp-ai.

5) Lancer un agent d'essai

```bash
# commande d'exemple : adapter selon votre agent local
python examples/run_agent.py --config ./config.yml
# ou
node examples/run_agent.js --config ./config.yml
```

6) Vérifier le log

- Ouvrez le fichier JSONL. Chaque ligne doit être un JSON signé (par ex. champs payload + signature).
- Adaptez ou écrivez un script local pour valider les signatures.

## Problemes frequents et correctifs rapides

Référence : https://github.com/dcp-ai-protocol/dcp-ai

- Signature invalide
  - Cause commune : chemin de clé incorrect ou clé différente. Action : vérifier le chemin et regénérer une signature de test.
- Latence ajoutée
  - Cause commune : signature synchrone par événement. Action : activer le batching asynchrone ou signer en background.
- Champs manquants
  - Cause : hook qui n’extrait pas tous les champs. Action : standardiser le schéma et rejouer des traces.
- Dépendances manquantes
  - Action : isoler l’environnement (virtualenv Python ou container) et réinstaller.

Tableau de contrôle rapide

| Problème | Indicateur | Action rapide |
|---|---:|---|
| Signature invalide | vérification échoue | vérifier clé / resigner |
| Latence élevée | + temps par action | activer batching / async |
| Champs manquants | validation schema KO | corriger hook |

## Premier cas d'usage pour une petite equipe

Référence : https://github.com/dcp-ai-protocol/dcp-ai

Scénario — solo founder / équipe 1–3 personnes. Actions concrètes :

1) Pilote minimal en local
- Cloner le dépôt, générer une clé locale, lancer le wrapper sur 1–5 scénarios.
- Réaliser 10–100 interactions manuelles pour vérifier le format.

2) Vérification automatisée simple
- Écrire un script d’intégrité (bash + jq) qui parcourt le JSONL et valide chaque signature.
- Automatiser son exécution après chaque session de test.

3) Gate humain léger
- Ajouter une étape d’approbation pour une action critique (ex. suppression de données).
- Documenter la procédure de révocation.

4) Surveillance et rollback simple
- Tagger chaque déploiement et garder un extrait de accountability.log comme exemple committé.
- Préparer un plan de rollback si le taux d’erreur dépasse un seuil (par ex. 1%).

Checklist pour pilote

- [ ] Cloner le repo et générer la clé (https://github.com/dcp-ai-protocol/dcp-ai)
- [ ] Brancher le hook et lancer 10–100 interactions locales
- [ ] Exécuter le script de vérification après chaque session
- [ ] Documenter la procédure de révocation et l’approbateur

## Notes techniques (optionnel)

Référence : https://github.com/dcp-ai-protocol/dcp-ai

- Environnement Python (exemple)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

- Exemple de script d'intégrité minimal (bash)

```bash
#!/bin/bash
LOG=${1:-./accountability.log}
PUB=${2:-./keys/agent_signing.pub}
jq -c . "$LOG" | while read -r line; do
  # placeholder: extraire payload et signature, vérifier via openssl ou outil dédié
  echo "$line"
done
```

- Charge & stockage : mesurer la taille moyenne d’un enregistrement localement avant de dimensionner. Le dépôt donne le cadre conceptuel : https://github.com/dcp-ai-protocol/dcp-ai.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Le dépôt https://github.com/dcp-ai-protocol/dcp-ai fournit le protocole et des exemples réutilisables pour brancher un hook d'audit. À valider en local.
- Paramètres pilotes proposés (à vérifier) : pilote court = 3 heures ; canary initial = 24 heures à 10 % du trafic ; test de charge ciblé = 1 000 requêtes.
- Objectifs opérationnels proposés : taux d'enregistrement signé cible = 99.9 % ; temps de vérification ciblé = 50 ms par enregistrement ; surcharge latence cible = 200 ms.
- Dimensionnement proposé (estimation) : taille moyenne d'un enregistrement ≈ 1 200 octets → 1 000 événements/jour ≈ 1.2 MB/jour ; 1 000 000 événements/jour ≈ 1.2 GB/jour.
- Opérations clés proposées : rotation de clé tous les 90 jours ; ACL initiale limitée à 1–2 administrateurs ; alerte de stockage à 80 %.

### Risques / mitigations

- Risque : compromission de la clé privée. Mitigation : migrer vers KMS/HSM, restreindre ACL, rotation toutes les 90 jours, playbook de révocation.
- Risque : régression de performance (latence > 500 ms). Mitigation : activer batching asynchrone, signer synchroniquement uniquement les événements critiques.
- Risque : croissance excessive du journal (> 10 GB). Mitigation : archivage vers stockage froid, appliquer une politique de rétention, alertes à 80 % du quota.
- Risque : blocage par gate humain unique. Mitigation : définir SLA d'approbation (ex. 30 minutes) et procédure d'escalade avec 2 intervenants.

### Prochaines etapes

1. Lancer un test de charge local à 1 000 requêtes et mesurer latence et temps de vérification.
2. Ajouter un feature flag et déployer un canary à 10 % pendant 24 heures ; monitorer le taux d'erreur et les signatures.
3. Migrer les clés vers KMS/HSM et automatiser la rotation (planning initial 90 jours).
4. Rédiger runbooks : procédure de révocation (SLA 30 minutes), playbook incident, plan de montée en charge.

Artefacts finaux recommandés à committer : fichier de configuration example, un extrait de accountability.log, scripts d'intégrité, runbooks et checklist de déploiement.

Point de départ et référence principale : https://github.com/dcp-ai-protocol/dcp-ai
