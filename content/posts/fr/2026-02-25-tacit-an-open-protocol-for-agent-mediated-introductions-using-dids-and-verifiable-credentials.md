---
title: "Tacit — un protocole ouvert pour des introductions médiées par des agents (DIDs et Verifiable Credentials)"
date: "2026-02-25"
excerpt: "Guide pratique pour créer un POC local où des agents utilisent des DIDs W3C, DIDComm v2 et des Verifiable Credentials pour calculer un score d'authenticité signé et produire des reçus d'introduction vérifiables cryptographiquement."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-25-tacit-an-open-protocol-for-agent-mediated-introductions-using-dids-and-verifiable-credentials.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "tacit"
  - "DID"
  - "Verifiable Credentials"
  - "agent"
  - "POC"
  - "sécurité"
  - "cryptographie"
  - "AI"
sources:
  - "https://github.com/tacitprotocol/tacit"
---

## TL;DR en langage simple

- Tacit se décrit comme « the social layer for the agent era — AI agents discover, trust, and introduce people to each other. » (source : https://github.com/tacitprotocol/tacit).
- Ce guide décrit un POC local simple — deux identités qui échangent une attestation signée, un calcul de score d'authenticité et la production d'un reçu JSON signé — pour valider le flux d'introduction avant d'investir en production. Voir le dépôt officiel : https://github.com/tacitprotocol/tacit

Méthodologie courte : les éléments techniques non couverts par l'extrait de référence sont listés dans "Hypotheses / inconnues" à la fin.

## Ce que vous allez construire et pourquoi c'est utile

Ce que vous allez construire (livrable minimal)
- Deux identités locales (paires de clés).
- Une attestation JSON signée émise par une identité.
- Un module de vérification qui produit un score numérique.
- Un reçu d'introduction JSON signé contenant l'attestation, le score et une preuve de consentement.

Pourquoi c'est utile
- Permet de vérifier et tracer des introductions avec preuve cryptographique.
- Facilite des décisions automatiques basées sur un score réplicable.
- Idéal pour valider conceptuellement avant une intégration à plus grande échelle.

Comparaison rapide — mode local vs cloud

| Critère | Local (POC) | Cloud / production |
|---|---:|---:|
| Coût initial | faible / 0 $ | variable (VM, KMS) |
| Complexité de déploiement | faible | élevée |
| Besoin HSM/KMS | non requis pour POC | recommandé |
| Traçabilité | fichiers locaux signés | journaux centralisés signés |

Référence : https://github.com/tacitprotocol/tacit

## Avant de commencer (temps, cout, prerequis)

Prérequis matériels et logiciels
- Git installé, accès internet ponctuel pour cloner : https://github.com/tacitprotocol/tacit
- Éditeur de texte et terminal (bash/PowerShell)
- Navigateur pour inspecter JSON

Checklist rapide
- [ ] Cloner le dépôt officiel (voir lien ci‑dessous)
- [ ] Réserver une fenêtre d'essai
- [ ] Préparer un répertoire artifacts/ pour clés et outputs

Remarque sur le temps et le coût : les valeurs concrètes de durée et de coût pour votre contexte sont listées dans la section "Hypotheses / inconnues".

## Installation et implementation pas a pas

1) Cloner le dépôt

```bash
git clone https://github.com/tacitprotocol/tacit
cd tacit
ls -la
```

2) Explorer le README et repérer scripts
- Ouvrez README.md et les dossiers examples/ ou scripts/ (s'ils existent) dans le dépôt : https://github.com/tacitprotocol/tacit

3) Générer deux identités (ex. Alice et Bob)
- Pour un POC, créez deux paires Ed25519 locales et sauvegardez les clés privées dans artifacts/keys (permissions restreintes). Si le dépôt fournit un helper, utilisez-le et suivez sa documentation.

4) Créer une attestation JSON signée (exemple simplifié)

```json
{
  "issuer": "did:example:alice",
  "subject": "did:example:bob",
  "claim": {"email_verified": true},
  "issuedAt": "2026-02-25T12:00:00Z",
  "signature": "<base64-ed25519>"
}
```

5) Configurer un simple fichier de scoring (exemple)

```yaml
# config/scoring.yaml (exemple local)
weights:
  email_verified: 0.5
  org_membership: 0.3
  third_party_proof: 0.2
accept_threshold: 0.7
```

6) Exécuter le script de scoring
- Script minimal : lire l'attestation, appliquer les poids et produire artifacts/authenticity-vector.json puis comparer au seuil.

7) Produire le reçu d'introduction
- Reçu = {attestation, score, timestamp, consentement, signature_de_l'introducteur} et écrire artifacts/introduction-receipt.json

Outils de debug utiles

```bash
# afficher conteneurs si utilisés
docker-compose ps

afficher le reçu
jq . artifacts/introduction-receipt.json
```

Référence et code source : https://github.com/tacitprotocol/tacit

## Problemes frequents et correctifs rapides

Service qui ne répond pas
- Vérifier que le processus local ou le conteneur est démarré (si vous utilisez Docker : docker-compose ps).

Erreurs de signature ou format JSON
- Valider JSON (jq) et vérifier la clé publique associée à l'issuer.
- Confirmer le timestamp issuedAt et l'algorithme de signature.

Score trop bas ou incohérent
- Revoir les clés de preuve présentes dans l'attestation.
- Exécuter un petit jeu de tests manuels (voir checklist dans "Premier cas d'usage").

Commandes de base de dépannage

```bash
# suivre les logs
docker-compose logs -f

# vérifier format JSON
jq . path/to/file.json
```

Référence : https://github.com/tacitprotocol/tacit

## Premier cas d'usage pour une petite equipe

Public cible : fondateurs solo, équipes 1–3 personnes. Ce flux sert à valider l'idée en local.

Étapes courtes pour un POC mono‑machine
1) Cloner le dépôt et préparer deux identités locales.
2) Émettre 1–2 attestations différentes (par ex. preuve d'email, appartenance org).
3) Exécuter le scoring et produire 10 introductions manuelles en canary pour observer le comportement.
4) Conserver reçus signés pour audit.

Checklist POC
- [ ] Créer deux paires de clés dans artifacts/keys
- [ ] Émettre au moins 1 attestation par sujet
- [ ] Exécuter scoring et sauvegarder artifacts/authenticity-vector.json
- [ ] Produire et vérifier artifacts/introduction-receipt.json

Indicateurs simples à surveiller (exemples de métriques à instrumenter)
- nombre_introductions_testées, taux_acceptation, distribution_des_scores

Référence : https://github.com/tacitprotocol/tacit

## Notes techniques (optionnel)

Courtes définitions
- DID : identifiant pour une identité décentralisée.
- DIDComm v2 : protocole de messagerie pair‑à‑pair pour agents.
- Verifiable Credential (VC) : format standardisé pour attestations signées.

Bonnes pratiques de POC
- Conserver les clés privées en local et limiter l'exposition. En production, prévoir HSM/KMS et rotation.
- Conserver les reçus pour audit avec signature du créateur.

Exemple JSON minimal de scoring (conservé ici pour rapidité)

```json
{
  "weights": {"email_verified": 0.5, "org_membership": 0.3, "third_party_proof": 0.2},
  "accept_threshold": 0.7
}
```

Référence générale : https://github.com/tacitprotocol/tacit

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Le dépôt contient le code et la documentation de base (tagline confirmée) : https://github.com/tacitprotocol/tacit
- Hypothèses chiffrées proposées pour planification (à vérifier dans votre contexte) :
  - Temps POC indicatif : 120 minutes (2 heures).
  - Coût initial local : 0 $ si tout reste sur machine locale.
  - Effort d'intégration durcie : 1–3 jours selon dépendances.
  - Seuil d'acceptation initial recommandé pour tests : 0.7 (70%).
  - Nombre d'introductions canary : 10 entrées.
  - Taux d'acceptation cible pendant le canary : > 50%.
  - Taille cible du reçu compact : < 10 kB.
  - Fréquence recommandée de rotation de clés en production : 90 jours.
  - Latence cible des vérifications (si centralisées) : ≈ 200 ms par requête.
  - Phases de rollout : canary interne -> 10% -> 100%.

Ces chiffres sont des points de départ et doivent être validés contre les artefacts et scripts présents dans le dépôt référent.

### Risques / mitigations

- Risque : exposition des clés privées. Mitigation : chiffrer au repos, utiliser accès restreint et prévoir HSM/KMS en production.
- Risque : faible taux d'acceptation après mise en service. Mitigation : démarrer conservateur (seuil élevé), exiger plusieurs attestations indépendantes, itérer poids de scoring.
- Risque : biais dans le scoring. Mitigation : auditer manuellement un échantillon (p.ex. 10 introductions), ajuster poids et ajouter preuves indépendantes.
- Risque : charge/latence inattendue. Mitigation : mesurer latence (ms), prévoir caches, limiter requêtes concurrentes.

### Prochaines etapes

- Valider localement : cloner https://github.com/tacitprotocol/tacit et exécuter le POC.
- Durcir sécurité : définir plan HSM/KMS, rotation (p.ex. 90 jours) et chiffrement des artifacts.
- Instrumenter métriques : nombre d'introductions, distribution des scores, taux d'acceptation.
- Rollout progressive : canary interne → 10% du trafic → pleine production.

Pour toute vérification du code source et des exemples, consultez le dépôt officiel : https://github.com/tacitprotocol/tacit
