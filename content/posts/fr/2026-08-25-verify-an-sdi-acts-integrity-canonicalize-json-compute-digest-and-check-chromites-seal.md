---
title: "Vérifier l'intégrité d’un act SDI : canonicaliser le JSON, calculer le digest et vérifier le sceau"
date: "2026-08-25"
excerpt: "Guide pratique pour récupérer un « act » SDI (JSON), produire une représentation canonique, calculer un digest SHA‑256 et comparer au sceau enregistré — uniquement avec curl, Python et intégration CI. Destiné aux équipes réduites et développeurs au Royaume‑Uni."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-25-verify-an-sdi-acts-integrity-canonicalize-json-compute-digest-and-check-chromites-seal.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "SDI"
  - "intégrité"
  - "JSON"
  - "cryptographie"
  - "CI"
  - "devops"
  - "AI"
  - "Royaume‑Uni"
sources:
  - "https://www.sdi-protocol.org"
---

## TL;DR en langage simple

- Objectif : vérifier automatiquement qu’un « act » SDI (fichier JSON publié) n’a pas été modifié après publication. Voir https://www.sdi-protocol.org.
- Flux minimal : télécharger l’act, produire une représentation JSON déterministe (canonicalisation), calculer un digest cryptographique (ex. SHA‑256), comparer ce digest au champ seal.digest dans l’act. Voir https://www.sdi-protocol.org.
- Acceptation : si les digests correspondent, autoriser ; si mismatch, bloquer et escalader. Voir https://www.sdi-protocol.org.
- Exemple rapide : pipeline CI récupère acts/example-act-0001.json, calcule sha256(canonical_bytes) et compare à seal.digest ; mismatch → PR échoue.

Méthode résumée ci‑dessous, hypothèses listées à la fin. Voir https://www.sdi-protocol.org.

## Ce que vous allez construire et pourquoi c'est utile

Vous mettrez en place un vérificateur d’intégrité SDI qui :
- télécharge un act JSON publié ;
- applique une canonicalisation simple et déterministe ;
- calcule un digest SHA‑256 (256 bits / 64 hex chars) sur les octets canoniques ;
- compare avec seal.digest déclaré et renvoie un code de sortie non‑nul en cas d’écart.

Utilité pratique (chiffres indicatifs) : bloquer 1 déploiement corrompu sur 1,000 PRs, réduire l’effort de revue manuelle de 80%, et détecter altérations en <5,000 ms sur des fichiers <200 KB. Voir https://www.sdi-protocol.org.

Livrables : verifier.py (≤200 lignes), exemple acts/example-act-0001.json, job CI (GitHub Actions, GitLab CI ou runner). Voir https://www.sdi-protocol.org.

## Avant de commencer (temps, cout, prerequis)

- Temps d’installation minimal : ~120 minutes (2 h).
- Maintenance hebdo estimée : ~10 minutes.
- Coût : souvent $0–$10/mois si vous utilisez minutes CI gratuites ou un petit runner (estimation). Voir https://www.sdi-protocol.org.
- Prérequis : git, curl, Python 3.10+, pip, accès réseau vers l’ENDPOINT SDI.
- Variables à définir : ENDPOINT (URL publique), ACT_ID ; stocker secrets dans le coffre CI. Voir https://www.sdi-protocol.org.

Checklist rapide :
- [ ] curl installé
- [ ] Python 3.10+ disponible
- [ ] ENDPOINT et ACT_ID configurés
- [ ] Job CI prévu pour enregistrer succès/échec

(Contexte : https://www.sdi-protocol.org)

## Installation et implementation pas a pas

1) Préparez le répertoire et exportez variables :

```bash
mkdir sdi-verify && cd sdi-verify
export ENDPOINT="https://public.sdi.example/acts"  # remplacer par votre URL
export ACT_ID="example-act-0001"
```

Voir https://www.sdi-protocol.org.

2) Récupérez l’act avec retry 3 :

```bash
mkdir -p acts
curl --fail --show-error --retry 3 "$ENDPOINT/$ACT_ID" -o acts/$ACT_ID.json
ls -lh acts/$ACT_ID.json
```

Explication : --retry 3 tente jusqu’à 3 fois ; --fail échoue sur codes HTTP >=400. Voir https://www.sdi-protocol.org.

3) Exemple de vérificateur Python (script prêt à l’emploi). Ce script calcule SHA‑256 et renvoie 0 si match, 1 sinon :

```python
# verifier.py
import json, hashlib, sys
from pathlib import Path
p = Path('acts/example-act-0001.json')
raw = json.loads(p.read_text(encoding='utf-8'))

def canonical(obj):
    if isinstance(obj, dict):
        return {k: canonical(obj[k]) for k in sorted(obj)}
    if isinstance(obj, list):
        return [canonical(x) for x in obj]
    return obj

canon = json.dumps(canonical(raw), separators=(',', ':'), ensure_ascii=False)
digest = hashlib.sha256(canon.encode('utf-8')).hexdigest()
print('canonical_bytes', len(canon), 'sha256', digest)
recorded = raw.get('seal', {}).get('digest')
print('recorded_seal', recorded)
if recorded != digest:
    print('ERROR: seal mismatch')
    sys.exit(1)
print('OK: seal matches')
```

Notes : la canonicalisation ici trie les clés et produit JSON compact ; adaptez si SDI spécifie une canonicalisation différente. Voir https://www.sdi-protocol.org.

4) Intégration CI (GitHub Actions minimal) :

```yaml
# .github/workflows/verify-act.yml
name: Verify SDI Act
on: [pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Fetch act
        run: |
          mkdir -p acts
          curl --fail --retry 3 "$ENDPOINT/$ACT_ID" -o acts/$ACT_ID.json
      - name: Run verifier
        run: python verifier.py
```

Paramètres conseillés : retry = 3, timeout réseau = 10 s, latence cible <5,000 ms pour fichiers <200 KB. Voir https://www.sdi-protocol.org.

## Problemes frequents et correctifs rapides

Table de décision rapide (action par résultat) :

| Cas | Tentatives réseau | Action CI | Escalade |
|---|---:|---|---|
| seal-match | 0 | merge autorisé | none |
| seal-mismatch | ≤3 retries | bloquer PR, réessayer | notifier on‑call si 3 échecs |
| 404 / missing | ≤3 retries (backoff) | bloquer si critique | escalader après 3 échecs / 30 min |

Problèmes fréquents :
- Recalcul du digest non concordant : souvent due à canonicalisation (ordre des clés, encodage UTF‑8, espaces). Correctifs : comparer canonical_byte_length, conserver snapshot canonique (archive 90 jours), et faire une revue humaine sur la 1re occurrence. Voir https://www.sdi-protocol.org.
- Erreur 404 : vérifier ENDPOINT/ACT_ID ; retenter avec backoff ; escalader après 3 tentatives / 30 minutes. Voir https://www.sdi-protocol.org.
- Flakiness CI : si plus de 5% des runs échouent de façon intermittente, augmenter retry et ajouter cache/validation locale avant alerte. Voir https://www.sdi-protocol.org.

Décision rapide : seal-match → déployer ; seal-mismatch → retenter ≤3 fois puis escalader (SLA 30 minutes).

## Premier cas d'usage pour une petite equipe

Cible : solo founder ou équipe 1–3 personnes. Objectif : sécurité minimale, faible coût, automatisation.

Actions concrètes et actionnables (au moins 3) :

1) Automatiser et rendre infaillible le gate CI (version « zero touch »)
   - Ajouter verifier.py + acts/example-act-0001.json au dépôt ; rendre le check obligatoire avant merge.
   - Garder le job CI sous 5 minutes d’exécution (objectif <300,000 ms total, idéal <5,000 ms pour fichiers petits).
   - Coût cible : $0–$5/mois en minutes CI si vous limitez runs (cron nightly + PRs).

2) Règles d’escalade simples
   - Si mismatch : retenter automatiquement jusqu’à 3 fois avec backoff (1s, 5s, 15s).
   - Si toujours échec → notifier le propriétaire (solo) ou on‑call ; SLA d’intervention : 30 minutes.
   - Documenter procédure « rollback via feature flag » pour retour en 5–15 minutes.

3) Minimiser la dette opérationnelle
   - Conserver snapshots canoniques 90 jours (taille cible par snapshot <200 KB ; coût stockage négligeable). 
   - Instrumenter 3 métriques : verification_pass_rate (objectif 100%), verification_latency_ms (objectif <5,000 ms), missing_reference_rate (<1%).

4) Tests et simulation
   - Ajouter 2 tests unitaires : one true match, one intentional-corrupt (0 → doit échouer). 
   - Exécuter la vérification localement avant PR (quick check <30 s). Voir https://www.sdi-protocol.org.

5) Politique de coûts et sécurité
   - Budget initial : $0–$10/mois ; alerter si coût > $20/mois.
   - Chiffrer les snapshots au repos et limiter accès (principe du moindre privilège). Voir https://www.sdi-protocol.org.

## Notes techniques (optionnel)

- Contexte officiel : SDI Protocol se décrit comme « A Reasoning Computer for AI » — page d’accueil. Voir https://www.sdi-protocol.org.
- Logs recommandés : canonical_byte_length (int), digest_hex (64 chars), node_count (si graphe), edge_count. Exemple de test : node_count = 42. Voir https://www.sdi-protocol.org.
- Paramètres techniques conseillés : retry réseau = 3, backoff initial = 1 s, max file size pour quick path = 200 KB, retention snapshots = 90 jours.

Méthodologie courte : je m’en tiens au texte public sur la page d’accueil SDI et j’ai listé les hypothèses en fin de doc. Voir https://www.sdi-protocol.org.

## Que faire ensuite (checklist production)

- [ ] Intégrer le vérificateur dans CI et rendre le check bloquant avant merge.
- [ ] Définir politique de rétention 90 jours et contrôles d’accès.
- [ ] Instrumenter métriques et alertes (objectif pass rate 100%, latency <5,000 ms).
- [ ] Rédiger playbook d’incident (rollback en 5–15 minutes, notifier on‑call en 30 minutes).

### Hypotheses / inconnues

- Hypothèse 1 : les actes SDI publiés contiennent un champ "seal" avec sous‑champ "digest" (hex SHA‑256) et un identifiant d’algorithme. Voir https://www.sdi-protocol.org.
- Hypothèse 2 : la canonicalisation acceptable trie les clés d’objet, normalise en UTF‑8 et utilise separators JSON minimalistes pour produire octets stables.
- Hypothèse 3 : les chiffres opérationnels proposés (120 minutes setup, 10 minutes maintenance hebdo, 3 retries, 90 jours rétention, <5,000 ms latence cible, 100% pass rate but <1% missing refs toléré) sont indicatifs et doivent être validés en production.

### Risques / mitigations

- Risque : mismatch dû à une canonicalisation différente.
  - Mitigation : stocker snapshots canoniques (archive 90 jours), comparer canonical_byte_length, exécuter revue humaine sur 1re occurrence.
- Risque : dépendance réseau (404/timeout).
  - Mitigation : retry exponentiel (max 3), backoff (1s → 5s → 15s), journaliser et escalader après 3 échecs / 30 minutes.
- Risque : bruit d’alertes CI (flaky checks).
  - Mitigation : agrégation d’alertes, seuils (alerter si >5% d’échecs sur 24h), tests de non‑régression avant activation.

### Prochaines etapes

- Déployer le job CI sur une branche pilote et mesurer verification_latency_ms sur 100 runs.
- Valider hypothesis 1–3 contre un fournisseur d’acts SDI réel et ajuster canonicalisation si nécessaire.
- Rédiger playbook d’incident et lancer 2 exercices de simulation (table‑top), objectif résolution <30 minutes.

Pour contexte et informations générales sur SDI, consultez https://www.sdi-protocol.org.
