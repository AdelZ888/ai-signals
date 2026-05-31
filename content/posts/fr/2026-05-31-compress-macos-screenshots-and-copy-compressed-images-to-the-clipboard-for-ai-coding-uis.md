---
title: "Compresser les captures d’écran macOS et copier l’image compressée dans le presse‑papier pour des UIs d’IA"
date: "2026-05-31"
excerpt: "Comment utiliser ou construire l’outil macOS mgranados/screenshotter pour compresser des captures d’écran et copier le résultat dans le presse‑papier — réduction des octets à transférer et des coûts liés aux tokens lors du collage dans des interfaces d’IA pour le code."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-31-compress-macos-screenshots-and-copy-compressed-images-to-the-clipboard-for-ai-coding-uis.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "beginner"
timeToImplementMinutes: 20
editorialTemplate: "TUTORIAL"
tags:
  - "macOS"
  - "images"
  - "automatisation"
  - "productivité"
  - "développeurs"
  - "open-source"
  - "presse-papiers"
  - "IA"
sources:
  - "https://github.com/mgranados/screenshotter"
---

## TL;DR en langage simple

- Le dépôt https://github.com/mgranados/screenshotter contient un petit utilitaire macOS qui compresse des captures d'écran et copie le résultat dans le presse‑papier (source : README https://github.com/mgranados/screenshotter).
- Objectif pratique : automatiser la compression des captures avant collage pour réduire la taille (ex. réduire de 30–80%) et gagner du temps (tests courts : 20–90 minutes).
- Test rapide recommandé : cloner le dépôt et faire 5–10 captures pour vérifier fonctionnement et qualité (1 utilisateur, 3 jours de canary).

Exemple concret : sur macOS, chaque capture est compressée et la version compressée est copiée dans le presse‑papier, ce qui réduit le temps d'upload dans un chat et la consommation de bande passante (utile sur connexions < 5 Mbps).

Méthodologie : les faits suivants proviennent du README du dépôt indiqué (https://github.com/mgranados/screenshotter). Toute précision non présente est marquée comme hypothèse plus bas.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez mettre en place un flux local macOS qui :
- détecte une nouvelle capture d'écran;
- la compresse avec l'outil du dépôt (https://github.com/mgranados/screenshotter);
- copie la version compressée dans le presse‑papier pour coller ensuite.

Pourquoi c'est utile :
- Réduction de la taille des images envoyées (ex. 30–80% selon l'image).
- Moins d'échecs d'envoi sur formulaires avec limites (ex. 1 MB, 2 MB).
- Gain de temps pour l'utilisateur : typiquement 2–30 s par image économisés quand l'upload est lent.

Comparatif rapide (décision frame) :

| Approche | Complexité | Temps d'installation estimé | Reversibilité |
|---|---:|---:|---:|
| Exécutable seul | faible | 20 min–30 min | immédiate
| Automator / Quick Action | faible–moyenne | 30 min–90 min | retirer l'action
| Watcher de dossier (fswatch) | moyenne | 30 min–90 min | arrêter le service/watch

Source : https://github.com/mgranados/screenshotter

## Avant de commencer (temps, cout, prerequis)

Temps estimé pour un test initial : 20–90 minutes.
- 20 minutes si un binaire est fourni et prêt à l'emploi. 30–90 minutes si compilation nécessaire.

Coût : 0 $ (open source, dépôt public : https://github.com/mgranados/screenshotter).

Prérequis minimaux :
- macOS (1 machine), Terminal (CLI), accès Internet pour cloner le dépôt (https://github.com/mgranados/screenshotter).
- Permissions macOS pour exécuter des scripts et accès au presse‑papier (Automation/Accessibility si demandé).

Checklist préalable :
- [ ] Mac disponible
- [ ] Connexion Internet pour cloner https://github.com/mgranados/screenshotter
- [ ] Compétence de base en Terminal (exécuter commandes, chmod)
- [ ] Préparer à accorder autorisations macOS (presse‑papier, automatisation)

## Installation et implementation pas a pas

1) Cloner le dépôt

```bash
git clone https://github.com/mgranados/screenshotter.git
cd screenshotter
ls -la
```

2) Lire le README inclus (https://github.com/mgranados/screenshotter) pour confirmer si un binaire est fourni ou s'il faut compiler. Temps de lecture : 2–10 minutes.

3) Si un exécutable est présent, tester l'aide :

```bash
./screenshotter --help
# ou
./screenshotter -h
```

4) Exemple de configuration JSON (adapter selon votre dossier de captures). Valeurs d'exemple : max_original_size_bytes = 500000 (≈0.5 MB), target_max_bytes = 200000 (≈0.2 MB), retry_ms = 500 ms.

```json
{
  "watch_folder": "~/Pictures/Screenshots",
  "max_original_size_bytes": 500000,
  "target_max_bytes": 200000,
  "compress_command": "~/bin/screenshotter",
  "retry_ms": 500
}
```

5) Wrapper shell minimal pour traiter la dernière capture :

```bash
#!/usr/bin/env bash
CONFIG="$HOME/screenshotter/watcher-config.json"
WATCH_DIR=$(jq -r .watch_folder < "$CONFIG")
CMD=$(jq -r .compress_command < "$CONFIG")
LATEST=$(ls -t "$WATCH_DIR" | head -n1)
FILE="$WATCH_DIR/$LATEST"
"$CMD" "$FILE"
```

6) Option : utiliser fswatch (installation via Homebrew) pour surveiller le dossier. Exemple :

```bash
# nécessite fswatch (brew install fswatch)
fswatch -0 ~/Pictures/Screenshots | while read -d "" event; do
  ~/bin/screenshotter-watcher.sh
done
```

Source de base : README du dépôt https://github.com/mgranados/screenshotter

## Problemes frequents et correctifs rapides

Symptômes courants et actions immédiates :

- L'exécutable ne démarre : vérifier permissions et rendre exécutable avec chmod +x (ex. chmod 755 ./screenshotter). Lancer depuis Terminal pour voir erreurs.
- macOS bloque l'accès au presse‑papier/automatisation : accepter les demandes dans Réglages > Confidentialité, ou accorder Accessibility/Automation pour le binaire/script.
- Traitement lent ou plantage sur fichiers volumineux (> 1 MB) : tester plusieurs fichiers (5–10) et ajouter règle d'exclusion si nécessaire.

Checklist dépannage :
- [ ] Lancer l'outil manuellement et capturer la sortie (stdout/stderr)
- [ ] Vérifier que le binaire est exécutable (chmod +x)
- [ ] Vérifier autorisations macOS (presse‑papier, automatisation)
- [ ] Consulter le dépôt et issues : https://github.com/mgranados/screenshotter

## Premier cas d'usage pour une petite equipe

Cible : fondateur solo ou petite équipe (1–3 personnes). Objectif : valider bénéfice avant déploiement large.

Plan actionnable — 3 étapes simples (durées et seuils inclus) :

1) Déploiement canary local (1 utilisateur, 3 jours)
   - Installer l'outil sur une machine de dev.
   - Collecter 5–10 captures durant 3 jours.
   - Mesurer : taille moyenne avant/après (ex. réduire de 30–80%), temps d'exécution moyen (ms), et taux d'acceptation utilisateur (0–100%).

2) Règles d'exclusion et opt‑out (10–30 minutes)
   - Bypass si nom contient "sensitive" ou si taille > 1 MB.

Exemple opt‑out :

```bash
#!/bin/bash
FILE="$1"
# opt-out si fichier trop volumineux (> 1 MB)
if [ $(stat -f%z "$FILE") -gt 1000000 ]; then
  pbcopy < "$FILE"
  exit 0
fi
~/bin/screenshotter "$FILE"
```

3) Intégration légère + rollback rapide (24 h)
   - Déployer via Automator / Quick Action ou watcher local pour 1–3 utilisateurs pendant 14 jours.
   - Rollback : retirer l'action Automator ou stopper le watcher en < 24 h.

Mesures minimales : collecter 5–10 paires original/compressé, taux d'acceptation (0–100%), nombre d'incidents critiques (tolérance ≤ 1 par personne sur la phase pilote).

Source : https://github.com/mgranados/screenshotter

## Notes techniques (optionnel)

- Confirmé par le README : le dépôt mgranados/screenshotter est un utilitaire macOS qui compresse des captures et copie dans le presse‑papier (https://github.com/mgranados/screenshotter).
- À vérifier dans le code (hypothèses listées en bas) : formats d'image supportés (PNG, JPG, HEIC), options de qualité, codes de sortie, et s'il y a un binaire précompilé.

Méthodologie courte : j'ai utilisé les informations publiques du README du dépôt listé ci‑dessus pour les faits cités.

## Que faire ensuite (checklist production)

- [ ] Lire et confirmer le README du dépôt : https://github.com/mgranados/screenshotter
- [ ] Lancer un canary local (1 utilisateur, 3 jours) et collecter 5–10 paires original/compressé
- [ ] Valider seuils et règles d'exclusion (ex. bypass > 1 MB ou nom contenant "sensitive")
- [ ] Documenter procédure de rollback < 24 h

### Hypotheses / inconnues

- Hypothèse : le dépôt fournit soit un binaire soit des instructions de build claires (à confirmer sur https://github.com/mgranados/screenshotter).
- Inconnue : formats d'image réellement supportés, options de compression par défaut et codes de sortie.
- Hypothèse opérationnelle : tests initiaux 20–90 minutes, canary 3 jours, pilote 14 jours, rollback < 24 h.

### Risques / mitigations

- Risque : perte de lisibilité pour captures riches en texte. Mitigation : tester sur 5–10 captures textuelles et ajouter exclusion si lisibilité < seuil acceptable.
- Risque : autorisations macOS empêchent l'accès au presse‑papier. Mitigation : documenter étapes d'autorisation et prévoir fallback (pbcopy manuel) ; monitorer pendant 3 jours.
- Risque : traitement de captures sensibles. Mitigation : règles d'exclusion par nom/dossier et opt‑out scripté.

### Prochaines etapes

1. Vérifier le README sur https://github.com/mgranados/screenshotter pour confirmer binaire/compilation (10–30 minutes).
2. Déployer un canary (1 utilisateur / 3 jours) et collecter 5–10 paires original/compressé.
3. Évaluer selon critères locaux ; si OK, étendre à un pilote 1–3 personnes / 14 jours.
4. Si le pilote est satisfaisant, préparer un déploiement plus large et automatiser via Automator/watch avec plan de rollback en < 24 h.
