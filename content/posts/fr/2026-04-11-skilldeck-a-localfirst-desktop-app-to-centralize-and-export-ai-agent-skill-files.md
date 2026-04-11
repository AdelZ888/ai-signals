---
title: "Skilldeck : application desktop local‑first pour centraliser et exporter des fichiers « skills » d’agents IA"
date: "2026-04-11"
excerpt: "Skilldeck est présenté comme une application desktop local‑first pour gérer des fichiers « skill » d'agents IA et faciliter leur export vers des projets cibles. Guide pratique pour équipes UK, fondateurs et développeurs souhaitant un flux simple et reproductible."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-11-skilldeck-a-localfirst-desktop-app-to-centralize-and-export-ai-agent-skill-files.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 45
editorialTemplate: "TUTORIAL"
tags:
  - "skilldeck"
  - "IA"
  - "agents"
  - "local-first"
  - "workflow"
  - "GitHub"
sources:
  - "https://github.com/ali-erfan-dev/skilldeck"
---

## TL;DR en langage simple

- Skilldeck est présenté comme une application desktop pour gérer des fichiers « skill » (prompts / règles) et les centraliser. Source : https://github.com/ali-erfan-dev/skilldeck.
- Objectif : garder une source unique (single source of truth) pour des règles ou prompts réutilisables.
- Flux minimal recommandé : cloner le dépôt, créer une bibliothèque locale, ajouter 1 fichier « skill », puis l'exporter vers un projet cible pour un smoke test.

Exemple concret (scénario court) :
- Vous êtes dans une petite équipe produit. Vous centralisez la règle de masquage des numéros de facture dans ~/skilldeck-library/01-protect-invoice.md. Vous copiez ce fichier dans un repo canary et vérifiez à la main que les réponses masquent bien les numéros. Si OK, vous pouvez répéter pour d'autres règles.

Checklist rapide :
- [ ] cloner https://github.com/ali-erfan-dev/skilldeck
- [ ] créer une bibliothèque locale
- [ ] ajouter 1 fichier skill canonique
- [ ] exporter et vérifier le résultat

Méthode courte : testez localement avant d'automatiser.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez construire une petite bibliothèque locale de fichiers « skills » et un pas d'export reproductible vers un projet cible. Voir le dépôt pour le code et l'interface : https://github.com/ali-erfan-dev/skilldeck.

Pourquoi c'est utile :
- Centraliser évite d'avoir des copies divergentes. Une source unique facilite la maintenance.
- Un export simple permet un smoke test manuel avant toute automatisation.

Bénéfices pratiques :
- Édits centralisés pour les prompts/règles.
- Moins de copies obsolètes dans les projets consommateurs.
- Possibilité d'un déploiement canary (déploiement progressif) pour valider les changements.

À documenter dès le départ : structure des fichiers, métadonnées attendues et règles d'export.

## Avant de commencer (temps, cout, prerequis)

Voir le README du dépôt pour le contexte : https://github.com/ali-erfan-dev/skilldeck.

Prérequis techniques :
- Machine de développement (Windows, macOS ou Linux).
- Git et accès en lecture/écriture vers le dépôt cible si vous exportez directement.
- Emplacement local pour la bibliothèque (disque local ou dossier synchronisé).

Checklist de préparation :
- [ ] Vérifier l'accès Git pour la branche de test.
- [ ] Sauvegarder les fichiers existants du projet cible.
- [ ] Créer le dossier local pour la bibliothèque.

Remarque sur durée/coût : voir la section "Hypotheses / inconnues" plus bas pour des estimations. Ces valeurs sont des hypothèses à valider.

## Installation et implementation pas a pas

Consultez le dépôt pour le code et l'UI : https://github.com/ali-erfan-dev/skilldeck.

1) Cloner le dépôt et inspecter :

```bash
# cloner le repo
git clone https://github.com/ali-erfan-dev/skilldeck.git
cd skilldeck
ls -la
```

2) Créer la bibliothèque locale et ajouter un fichier skill :

```bash
mkdir -p ~/skilldeck-library
cat > ~/skilldeck-library/01-protect-invoice.md <<'EOF'
# Protect customer invoice numbers
When responding, mask invoice numbers so only the last 4 digits are visible.
EOF
```

3) Exemple simple de config de sync (map library -> target). Mettez ce fichier à côté de la bibliothèque. Voir le dépôt avant d’utiliser un outil fourni : https://github.com/ali-erfan-dev/skilldeck.

```json
{
  "library": "~/skilldeck-library",
  "targets": [
    { "name": "example-project", "path": "../example-project/.skills", "format": "markdown" }
  ],
  "pullPolicy": "manual-review"
}
```

4) Export minimal (UI si disponible, sinon copie) :

```bash
cp ~/skilldeck-library/01-protect-invoice.md ../example-project/.skills/
```

5) Lancer un smoke test rapide dans le projet cible (par exemple : vérification manuelle ou script court).

Conseil pratique : commencez par 1 fichier, puis 1–5 fichiers selon la confiance acquise.

Plain-language explanation before advanced details:
Si vous n'êtes pas développeur, retenez l'idée simple : gardez les règles utiles dans un dossier central. Copiez une règle dans un projet de test, vérifiez que tout fonctionne, puis appliquez la même méthode pour les autres règles. Plus tard, vous automatiserez ce copier/valider.

## Problemes frequents et correctifs rapides

Consultez le dépôt pour les détails d'implémentation : https://github.com/ali-erfan-dev/skilldeck.

| Problème | Cause probable | Correctif rapide |
|---|---:|---|
| Fichiers exportés au mauvais format | Mapping incorrect | Corriger sync-config.json et ré-exporter 1 fichier |
| Trop d’alertes de dérive | Règles diff trop strictes | Ajuster seuils de diff ou ignorer en‑têtes |
| Écrasements accidentels | Pull automatique sans revue | Mettre pullPolicy sur "manual-review" |
| Tests qui échouent après export | Entrées runtime changées | Bloquer import automatique jusqu’au smoke test vert |

Checklist de dépannage :
- [ ] Relancer export d’un seul fichier après correction.
- [ ] Restaurer depuis backup si nécessaire.
- [ ] Ajuster règles de diff pour réduire le bruit.

## Premier cas d'usage pour une petite equipe

Public cible : fondateurs solo et petites équipes (1–4 personnes). Voir le dépôt : https://github.com/ali-erfan-dev/skilldeck.

Plan succinct (valeur attendue en 1–2 jours selon l'équipe) :
1. Créer une bibliothèque locale et définir un propriétaire unique.
2. Démarrer avec 3 fichiers canoniques (par exemple : sécurité, masquage, tonalité).
3. Exporter manuellement vers un repo canary (environ 1 projet de test) et ajouter un job CI (intégration continue) pour un smoke test rapide.
4. Conserver backups et garder les 7 derniers commits sur une branche de sauvegarde.
5. Exiger revue manuelle pour les pulls dans la bibliothèque.

Checklist pour la petite équipe :
- [ ] Créer la bibliothèque et assigner un propriétaire.
- [ ] Ajouter 3 fichiers canoniques.
- [ ] Exporter vers un repo canary et exécuter un smoke test.
- [ ] Mettre en place backups journaliers (conserver 7 sauvegardes).

Notes rapides : CI = intégration continue. Un job CI peut lancer un script qui vérifie le format et un comportement simple en moins d'une minute.

## Notes techniques (optionnel)

Le dépôt est décrit comme une application desktop pour gérer des fichiers « skill » d’agents IA. Source : https://github.com/ali-erfan-dev/skilldeck.

Bonnes pratiques techniques :
- Versionnez la configuration de synchronisation (sync-config) à côté de la bibliothèque.
- Préférez les scripts ou binaires fournis par le dépôt pour l’export quand ils existent.
- Enregistrez le hash du commit de la bibliothèque pour chaque export afin de garder une traçabilité.

Exemple de métadonnées à embarquer (YAML) :

```yaml
---
skill_id: protect-invoice
version: 1
exported_at_ms: 1712800000000
canary: false
```

Points avancés à considérer plus tard : convertisseurs de format (JSON/YAML/Markdown), instrumentation de suivi de déploiement, et mesure des taux de succès des smoke tests.

## Que faire ensuite (checklist production)

Révisez le dépôt et validez les capacités réelles : https://github.com/ali-erfan-dev/skilldeck.

### Hypotheses / inconnues

Méthodologie courte : tout ce qui suit est une estimation/plan à valider contre le README et les releases du dépôt.

Estimations et hypothèses à confirmer :
- ~45 minutes : premier export manuel (estimation).
- <60s : objectif pour un smoke test initial.
- 1–4 : taille typique d’une petite équipe ciblée.
- 3 fichiers : jeu initial canonique recommandé.
- 7 jours : fenêtre canary avant diffusion large (hypothèse).
- 7 commits : conserver les 7 derniers pour les backups.
- 30 minutes : objectif de temps pour rollback automatisé.
- $0 : coût minimal si tout reste local (baseline).
- 95% : objectif de taux de réussite du smoke test (à définir selon le contexte).
- 2048 tokens : plafond possible pour prompts (valeur indicative).

### Risques / mitigations

- Risque : écrasement accidentel des fichiers cibles.
  - Mitigation : pullPolicy = "manual-review", backups journaliers, protection de la branche cible.
- Risque : alertes trop bruyantes (faux positifs de drift).
  - Mitigation : ajuster seuils de diff, whitelist des métadonnées non pertinentes.
- Risque : régression en production après export.
  - Mitigation : canary pendant 7 jours, bloquer merge si smoke test < 95% de succès.

### Prochaines etapes

- Inspecter le README et les releases dans https://github.com/ali-erfan-dev/skilldeck pour vérifier exporteurs et UI.
- Créer 3–5 fichiers canoniques et exécuter un export canary vers un projet de test.
- Ajouter un job CI (intégration continue) pour un smoke test <60s et une suite de régression nocturne <30min.
- Si vous fournissez la structure du repo cible, je peux générer un sync-config.json initial et un script de smoke test minimal.
