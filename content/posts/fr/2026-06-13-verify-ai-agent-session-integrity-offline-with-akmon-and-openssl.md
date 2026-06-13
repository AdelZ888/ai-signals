---
title: "Vérifier l'intégrité d'une session d'agent IA en local avec Akmon et OpenSSL"
date: "2026-06-13"
excerpt: "Akmon propose une couche d'evidence tamper‑evident (preuve inviolable) pour signer une session d'agent IA (JSON + signature détachée) et vérifier son intégrité hors ligne avec OpenSSL, sans cloud ni lock‑in."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-13-verify-ai-agent-session-integrity-offline-with-akmon-and-openssl.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "akmon"
  - "OpenSSL"
  - "sécurité"
  - "audit"
  - "agents IA"
  - "POC"
  - "preuve"
  - "vérification"
sources:
  - "https://github.com/radotsvetkov/akmon"
---

## TL;DR en langage simple

- Akmon fournit une couche « tamper‑evident » pour preuves et vérification de sessions d'agents IA : "Verify any agent's session offline with just openssl. No cloud, no lock‑in." (https://github.com/radotsvetkov/akmon).
- Ce guide minimal montre comment produire un bundle « session + signature + clé publique » vérifiable hors‑ligne avec OpenSSL et le dépôt de référence (https://github.com/radotsvetkov/akmon).
- Résultat concret : un auditeur peut vérifier localement qu'un fichier session.json n'a pas été modifié depuis sa signature, en utilisant uniquement la clé publique et OpenSSL.

Méthodologie : les recommandations opérationnelles ci‑dessous sont pratiques ; l'intention principale est tirée du dépôt (https://github.com/radotsvetkov/akmon).

## Ce que vous allez construire et pourquoi c'est utile

- Objectif : un flux simple « exporter session → signer → vérifier » pour preuves d'exécution d'agents, vérifiables hors‑ligne (https://github.com/radotsvetkov/akmon).
- Utilité : auditabilité, portabilité des preuves, et absence de dépendance à un service cloud.
- Résultat attendu : pour chaque exécution vous produisez un bundle qui peut être transféré et validé avec OpenSSL.

Flux résumé (conceptuel) :
1) Exporter la session (JSON). 2) Signer le JSON localement. 3) Distribuer session.json + session.sig + pub.pem pour vérification (https://github.com/radotsvetkov/akmon).

## Avant de commencer (temps, cout, prerequis)

- Prérequis logiciels/matériels : shell (Linux/macOS/WSL), OpenSSL installé, accès au dépôt exemple https://github.com/radotsvetkov/akmon.
- Coût direct : si vous utilisez uniquement des outils locaux comme OpenSSL, coût direct = 0 $ (outil libre). Voir le dépôt : https://github.com/radotsvetkov/akmon.
- Estimation pratique : un POC rapide peut se faire en une session courte ; validez la procédure sur 1 machine de confiance.

Checklist minimale avant de commencer :
- [ ] git cloné depuis https://github.com/radotsvetkov/akmon
- [ ] openssl disponible (`openssl version`)
- [ ] répertoire de travail propre pour exporter vos bundles

## Installation et implementation pas a pas

Les étapes ci‑dessous montrent une implémentation locale minimale (référence : https://github.com/radotsvetkov/akmon).

1) Cloner le dépôt

```bash
git clone https://github.com/radotsvetkov/akmon
cd akmon
ls -la
```

2) Générer une paire de clés (exemple local)

```bash
# clé privée locale
openssl genpkey -algorithm RSA -out priv.pem -pkeyopt rsa_keygen_bits:4096
# extraire la clé publique
openssl pkey -in priv.pem -pubout -out pub.pem
```

3) Exemple minimal de bundle JSON (choisissez une canonicalisation et documentez‑la)

```json
{
  "agent": "example-bot",
  "session_id": "sess-0001",
  "events": [{"t": "2026-06-13T12:00:00Z", "action": "plan"}],
  "format_version": "1"
}
```

4) Signer et vérifier localement

```bash
# signer
openssl dgst -sha256 -sign priv.pem -out session.sig session.json
# vérifier
openssl dgst -sha256 -verify pub.pem -signature session.sig session.json
```

5) Job CI minimal (exécution de vérification avant publication)

```yaml
name: Verify evidence
on: [push]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Verify session bundle
        run: ./verify.sh session.json session.sig
```

Déploiement progressif (rollout / rollback) — procédure recommandée :
- Canary initial : déployer la vérification sur 1‑2 runners (canary) puis étendre. (référence conceptuelle : https://github.com/radotsvetkov/akmon)
- Gates opérationnels : valider 24h de données canary avec < X% d'échecs avant progression (voir Hypotheses pour valeurs chiffrées).
- Rollback rapide : si le seuil d'échec est dépassé ou si une compromission de clé est suspectée, retirer la clé publique publiée, marquer les bundles concernés comme non valides et déclencher rotation de clé.

Méthodologie : les seuils chiffrés pour canary/gates/rollback sont des recommandations — voir la section Hypotheses / inconnues pour valeurs proposées.

## Problemes frequents et correctifs rapides

Référence conceptuelle : https://github.com/radotsvetkov/akmon

Symptômes et corrections :
- Vérification échoue
  - Cause fréquente : différences d'octets (encodage, CRLF vs LF). Solution : normaliser en UTF‑8 + LF avant signature.
- Clé publique non correspondante
  - Vérifier l'empreinte (hash) de pub.pem et comparer avec l'empreinte attendue stockée séparément.
- Horodatage incohérent
  - Utiliser ISO 8601, enregistrer fuseau, et appliquer une logique de fenêtre côté vérificateur.

Checklist dépannage rapide :
- [ ] fichier signé et fichier vérifié octet‑à‑octet identiques
- [ ] pub.pem correspond bien à la clé privée
- [ ] commande de vérification renvoie code de sortie 0

Tableau synthétique :

| Option clé | Sécurité (relative) | Latence vérif. | Coût direct |
|---|---:|---:|---:|
| RSA 2048 | Moyenne | faible | 0 $ |
| RSA 4096 | Élevée | faible–moyenne | 0 $ |
| HSM/KMS | Très élevée | variable | variable |

## Premier cas d'usage pour une petite equipe

Public cible : fondateur·rice solo ou équipe ≤ 5 personnes souhaitant une preuve simple, vérifiable et sans infrastructure cloud (https://github.com/radotsvetkov/akmon).

Actions concrètes pour un·e fondateur·rice solo / petite équipe :
1) Protéger la clé privée
   - Garder priv.pem sur une machine chiffrée; n'exposer que pub.pem et son empreinte dans le dépôt.
2) Procédure d'exécution et d'archivage
   - Pour chaque run, produire session.json, signer pour obtenir session.sig, et stocker le trio dans un dossier daté (ex. 2026-06-13_T12_00). Conserver au moins 3 copies (local, disque externe, archive immuable si disponible).
3) Publication graduée (canary minimal)
   - Publier la vérification en canary sur 1 runner ou 1 utilisateur externe avant publication générale; si OK, élargir.
4) Automatiser la vérification en CI
   - Ajouter un simple job qui exécute ./verify.sh sur chaque artefact publié; refuser publication si la vérification échoue.
5) Procédure de compromis et rotation
   - En cas de doute sur la clé privée, retirer pub.pem publié, annoncer revocation, et effectuer rotation (étapes simples documentées).

Script de vérification minimal (utilisable par une personne seule) :

```bash
#!/usr/bin/env bash
set -euo pipefail
pub="pub.pem"
sig="$2"
session="$1"
openssl dgst -sha256 -verify "$pub" -signature "$sig" "$session"
```

Référence : https://github.com/radotsvetkov/akmon

## Notes techniques (optionnel)

- But principal : vérification hors‑ligne sans dépendance cloud (https://github.com/radotsvetkov/akmon).
- Canonicalisation : définissez et documentez UTF‑8 + LF et l'ordre des champs JSON pour garantir stabilité des octets signés.
- Gestion des clés : commencez localement; prévoyez migration vers KMS/HSM si les exigences de sécurité l'imposent.
- Instrumentation : collectez métriques de vérification si vous traitez > 1000 bundles/jour.

## Que faire ensuite (checklist production)

Source conceptuelle : https://github.com/radotsvetkov/akmon

- [ ] Cloner le dépôt et valider un POC local
- [ ] Documenter la canonicalisation choisie
- [ ] Ajouter un job CI qui vérifie 100 % des bundles pendant la période canary
- [ ] Rédiger politique de rotation et rétention

### Hypotheses / inconnues

Les éléments ci‑dessous sont des hypothèses/préconisations opérationnelles à valider en contexte :
- Durée POC suggérée : 60–120 minutes.
- Taille de clé d'exemple proposée : RSA 4096 bits.
- Fenêtre d'horodatage tolérée proposée : ±300 secondes.
- Politique de rotation initiale proposée : 90 jours.
- Rétention initiale proposée : 365 jours.
- Phase de vérification stricte en CI : 7 jours à 100 % des runs (période canary étendue).
- Déploiement canary : commencer à 5 % des runners/utilisateurs, passer à 25 %, 50 %, puis 100 % si les gates sont franchis.
- Seuil d'alerte pour rollback recommandé : >1 % d'échecs de vérification sur la fenêtre de 24 h.
- Estimation indicatives de latence sign/verify : 5–50 ms par fichier sur matériel moderne.

### Risques / mitigations

- Risque : compromission de la clé privée. Mitigation : retirer la clé pub publiée, effectuer rotation immédiate et passer la signature sur HSM/KMS.
- Risque : mismatch d'octets (CRLF/encodage). Mitigation : imposer UTF‑8 + LF et valider canonicalisation avant signature.
- Risque : acceptation d'une preuve rejouée. Mitigation : inclure horodatage et session_id unique; vérifier fenêtre d'acceptation.
- Risque : bugs de déploiement. Mitigation : rollout canary + gates + seuils de rollback (voir Hypotheses).

### Prochaines etapes

1) Valider le format avec le dépôt (cloner https://github.com/radotsvetkov/akmon et inspecter exemples).
2) Exécuter le POC local : générer clés, signer 3 bundles, vérifier localement.
3) Intégrer verify.sh en CI pour une période canary (7 jours à 100 % puis montée progressive).
4) Documenter et publier politique de rotation (ex. 90 jours) et rétention (ex. 365 jours).

Référence principale : https://github.com/radotsvetkov/akmon
