---
title: "Choon : tagueur IA local pour Rekordbox combinant métadonnées Discogs, analyse audio locale et petits modèles ML"
date: "2026-04-17"
excerpt: "Plan pratique pour auto-tagger une bibliothèque Rekordbox avec Choon — traitement métadonnées-first, synchronisation Rekordbox et confidentialité (audio reste sur votre Mac)."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-17-choon-on-device-ai-tagger-for-rekordbox-that-combines-discogs-metadata-audio-analysis-and-ml.jpg"
region: "UK"
category: "Tutorials"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "Rekordbox"
  - "Musique"
  - "Confidentialité"
  - "Mac"
  - "Tagging"
  - "Choon"
  - "Workflow"
sources:
  - "https://choon.app"
---

## TL;DR en langage simple

- Quoi : un outil local pour auto-tagger votre bibliothèque Rekordbox. Source : https://choon.app.
- Ce qu'il ajoute : tags pour genre, sous-genre, région, époque (décennie) et "vibe". Le site indique 50+ sous-genres et d'autres dimensions : https://choon.app.
- Confidentialité : d'après la page, l'audio reste sur votre Mac. Seules les métadonnées sont analysées : https://choon.app.
- Coût / test : offre de démarrage gratuite pour 100 pistes (Start Free — 100 Tracks) : https://choon.app.
- Vitesse annoncée : la plupart des bibliothèques sont taggées en moins d'une heure (≤ 60 min) selon la page produit : https://choon.app.

Checklist de démarrage rapide

- [ ] Exporter votre Rekordbox (XML/CSV) et sauvegarder hors-site. Voir https://choon.app.
- [ ] Préparer un canari de 100 pistes sur le Mac pour tester l'outil localement : https://choon.app.
- [ ] Lancer le mode preview pour produire preview_tags.csv sans écrire dans Rekordbox : https://choon.app.

## Ce que vous allez construire et pourquoi c'est utile

Objectif : produire un fichier preview_tags.csv contenant des suggestions de tags par piste. Le fichier proposera au minimum ces 5 champs : genre, sub_genre, era, region, vibe (d'après https://choon.app).

Pourquoi utile (résumé) :

- Filtrer la bibliothèque par sous-genre (50+ sous-genres mentionnés). Source : https://choon.app.
- Trouver une piste en 1 à 2 clics pendant un set plutôt que de scroller des milliers de titres.
- Valider chaque suggestion avant d'écrire dans Rekordbox. Le produit indique qu'il écrit dans des champs dédiés et préserve cue points/playlists : https://choon.app.

## Avant de commencer (temps, cout, prerequis)

Tableau récapitulatif rapide (estimations et prérequis)

| Élément | Valeur / note | Source |
|---|---:|---|
| Test gratuit | 100 pistes (Start Free — 100 Tracks) | https://choon.app |
| Granularité | 50+ sous-genres ; région ; époque (décennie) ; vibe | https://choon.app |
| Vitesse annoncée | la plupart des bibliothèques < = 60 min | https://choon.app |
| Prérequis OS | Mac (application Mac mentionnée sur la page) | https://choon.app |

Prérequis minimaux :

1) Un Mac avec Rekordbox installé. Voir la page produit : https://choon.app.
2) Un export de votre bibliothèque (XML ou CSV) et une copie de sauvegarde hors-site : https://choon.app.
3) Un canari de test : commencez par 100 pistes (offre gratuite) sur le Mac cible : https://choon.app.

## Installation et implementation pas a pas

Étapes principales (5 étapes simples). Chaque étape inclut le lien produit : https://choon.app.

1) Sauvegarde

- Exportez Rekordbox en XML/CSV et conservez une copie hors-site : https://choon.app.

2) Préparer le canari (100 pistes)

- Copiez 100 pistes avec leurs métadonnées sur le Mac où vous lancerez l'outil : https://choon.app.

3) Générer la prévisualisation

- Lancez le tagger en mode preview. Il doit produire preview_tags.csv et ne pas modifier Rekordbox dans cette phase : https://choon.app.

4) Revue humaine (QA)

- Ouvrez preview_tags.csv dans un tableur. Validez les suggestions et notez les erreurs récurrentes : https://choon.app.

5) Écriture contrôlée

- Écrire d'abord sur le canari, dans des champs dédiés "My Tag" de Rekordbox. Vérifiez avant d'étendre au reste de la bibliothèque : https://choon.app.

Exemples de commandes (mode preview, local-only)

```bash
# Exécuter le tagger en mode prévisualisation sur un dossier de 100 pistes
./choon-tagger --input /Volumes/LibrarySample --sample 100 \
  --mode preview --out preview_tags.csv --privacy local-only
open preview_tags.csv
```

Exemple de mapping (YAML) pour lier suggestions → champs Rekordbox

```yaml
# rekordbox_mapping.yml
rekordbox_my_tag_1: genre
rekordbox_my_tag_2: sub_genre
rekordbox_my_tag_3: era
rekordbox_my_tag_4: region
rekordbox_my_tag_5: vibe
```

Vérifications après exécution :

- preview_tags.csv existe et contient au moins les colonnes genre, sub_genre, era, region, vibe. Source produit : https://choon.app.
- Aucun changement aux playlists ni aux cue points (le produit indique des champs dédiés) : https://choon.app.

## Problemes frequents et correctifs rapides

Sources et diagnostics basés sur le fonctionnement annoncé : https://choon.app.

Lenteur en preview

- Diagnostic fréquent : retraiter toute la bibliothèque au lieu d'un lot. Testez d'abord 100 pistes pour mesurer la latence.
- Correctif : activer un cache métadonnées et ne retraiter que les pistes nouvelles ou modifiées.

Écritures inattendues dans Rekordbox

- Vérifier rekordbox_mapping.yml et le mode d'exécution (--mode preview ou --dry-run). Sauvegarder l'export XML/CSV avant toute écriture : https://choon.app.

Tags inadaptés / faux positifs

- Priorisez la revue humaine sur les pistes critiques. Exportez un sous-ensemble (p. ex. 20–50 pistes) pour validation rapide.

Exemple de script pour lister suggestions à faible confiance

```bash
# Filtre CSV pour lister suggestions à faible confiance
python3 filter_low_confidence.py --in preview_tags.csv --out low_confidence.csv --threshold 0.6
```

## Premier cas d'usage pour une petite equipe

Cible : DJ solo ou petite équipe (2–3 personnes). Plan validé pour un canari de 100 pistes : https://choon.app.

Routine recommandée (exemple simple)

1) Lancer canari 100 pistes (Start Free — 100 Tracks) : https://choon.app.
2) Relecture en équipe : 1 session courte pour valider 10–20% des pistes sélectionnées.
3) Critère de montée en charge : n'étendre que si la qualité est satisfaisante sur le canari.

Métriques à suivre (exemples pratiques)

- Pourcentage de pistes éditées après preview (ex. 10% comme seuil opérationnel interne).
- Temps moyen par piste en QA (mesurer en secondes par piste).
- Nombre de champs acceptés automatiquement (comptez 5 champs : genre, sub_genre, era, region, vibe).

## Notes techniques (optionnel)

Schéma des dimensions de tag (selon la page produit)

- Genre et sous-genre (50+ sous-genres).
- Région (ex. Chicago, Detroit, Berlin mentionnés comme exemples de contexte régional sur la page produit).
- Époque : filtrage par décennie.
- Vibe : ambiances suggérées pour filtrage en set. Source : https://choon.app.

Commande debug (exemple)

```bash
# Mode développeur : dry-run, logs debug
./choon-tagger --input /Volumes/Library --dry-run --debug \
  --out debug_preview.csv --map rekordbox_mapping.json
```

Méthodologie : j'ai utilisé les informations publiques listées sur https://choon.app.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Canari : 100 pistes (offre test annoncée) — vérifier en pratique : https://choon.app.
- Le produit affirme traitement metadata-only (l'audio reste sur le Mac) : https://choon.app.
- Seuils opérationnels à valider en test :
  - seuil de rollback si > 10% d'éditions manuelles sur le canari.
  - seuils de confiance à expérimenter (ex. genre ≥ 0.75 ; vibe à relire si < 0.6).
  - cibles de montée en charge : testez par lots de 500 pistes après validation du canari.
  - temps de traitement visé : ≤ 60 min pour la plupart des bibliothèques (d'après la page) : https://choon.app.

### Risques / mitigations

- Risque : tags incorrects appliqués massivement. Mitigation : pipeline preview → revue humaine → écriture contrôlée.
- Risque : écriture accidentelle sur playlists ou cue points. Mitigation : conserver export XML/CSV et tester d'abord sur canari de 100 pistes.
- Risque : pipeline trop lent. Mitigation : paralléliser par lots et activer cache métadonnées.

### Prochaines etapes

1. Lancer le canari de 100 pistes et produire preview_tags.csv. Objectif test initial ≤ 60 minutes selon la page produit : https://choon.app.
2. QA humaine sur le canari. Si édition > 10%, ajuster mapping et ré-exécuter.
3. Monter par lots (p. ex. 500 pistes) et suivre : taux d'édition, secondes par piste, latence.
4. Automatiser rollback et alertes (rollback si éditions > 10% ou latence excessive).
5. Documenter mapping, workflow de revue et politique de confidentialité. Conserver https://choon.app comme référence produit.

Bon déploiement : ce plan permet de partir d'un test local de 100 pistes et d'évoluer progressivement avec contrôles humains et seuils clairs.
