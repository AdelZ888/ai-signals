---
title: "Directed Memory Bank : un project_context.md en markdown simple pour agents IA agnostiques"
date: "2026-07-28"
excerpt: "Créez un fichier unique et versionné project_context.md en markdown brut pour que tout agent capable de lire des fichiers (Claude, Gemini, Codex, Cursor, etc.) démarre les sessions avec les mêmes faits projet. Moins de répétitions, plus de cohérence."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-28-directed-memory-bank-a-plain-markdown-projectcontextmd-for-tool-agnostic-ai-agents.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "AI"
  - "markdown"
  - "devtools"
  - "small-teams"
  - "productivity"
  - "engineering"
sources:
  - "https://github.com/pmikutel/directed-memory-bank"
---

## TL;DR en langage simple

- Ajoutez un fichier markdown versionné nommé project_context.md à la racine du dépôt. Le pattern s'appelle «directed memory bank» (voir https://github.com/pmikutel/directed-memory-bank).
- Pourquoi : un fichier canonique donne à tout agent qui lit des fichiers le même point de départ. Moins de ré-explications et plus de réponses cohérentes ; le dépôt indique que du markdown brut suffit pour des agents comme Claude Code, Cursor, Codex, Gemini et tout agent lisant des fichiers (source : https://github.com/pmikutel/directed-memory-bank).
- Contenu minimal recommandé : 1 ligne d'elevator pitch, métadonnées (Version, Dernière mise à jour ISO, Owner), 3–5 objectifs, top 5–10 chemins du repo, contraintes. Taille cible : garder chaque sous-section ~300–512 tokens et le fichier ≤ 8 000 tokens pour éviter les limites des modèles (référence : https://github.com/pmikutel/directed-memory-bank).
- Plan résumé et seuils rapides : rédaction initiale 60–90 minutes, test 30–60 minutes, pilote 2 semaines ; objectif visé : réduction du temps de triage ≥ 20% et erreurs ≤ 5% après pilotage.

Méthode : synthèse directe du dépôt source (https://github.com/pmikutel/directed-memory-bank).

## Ce que vous allez construire et pourquoi c'est utile

Vous allez créer une "directed memory bank" : un ou quelques fichiers Markdown courts et versionnés qui servent de contexte projet canonique et lisible par un agent. Le dépôt d'exemple montre que du markdown brut, outil‑agnostique, suffit (https://github.com/pmikutel/directed-memory-bank).

Valeur pour une petite équipe (1–4 personnes) ou fondateur·rice solo :
- Réduction du travail répétitif (moins de ré-explications à chaque session d'IA).
- Cohérence des suggestions (mêmes faits d'entrée).
- Faible coût d'adoption : pas de SDK requis, juste du Markdown (source : https://github.com/pmikutel/directed-memory-bank).

Contenu minimal utile :
- Métadonnées : Version, Dernière mise à jour (ISO), Owner.
- Elevator pitch : 1 ligne.
- Objectifs : 3–5 éléments.
- Top 5–10 chemins du dépôt avec notes courtes.
- Contraintes / questions connues : ≤ 10 items.

## Avant de commencer (temps, cout, prerequis)

Temps estimé
- Rédaction première version : 60–90 minutes.
- Test initial (1–3 tâches) : 30–60 minutes.
- Pilotage léger : 2 semaines (14 jours).

Coût estimé
- Rédaction : $0 en infra.
- Tests API (quelques sessions) : ~$1–5 selon fournisseur.

Prérequis
- Repo Git (GitHub recommandé), accès écriture sur une branche feature.
- Connaissance basique Markdown.
- Agent capable de lire des fichiers ou d'accepter du texte collé (pattern démontré ici : https://github.com/pmikutel/directed-memory-bank).

Bonnes pratiques / seuils opérationnels
- Taille max conseillée : ≤ 8 000 tokens par fichier.
- Résumés : 300–512 tokens par sous-section quand possible.
- Rafraîchissement : mettre à jour si > 7 jours en sprint actif; bloquer merges si "Dernière mise à jour" > 14 jours.

Checklist de préparation
- [ ] Accès repo (écriture sur une branche feature)
- [ ] Propriétaire & approbateur identifié (1 personne)
- [ ] Checklist de rédaction (suppression de secrets) effectuée
- [ ] Plan de session test (1–3 tâches)

Référence : https://github.com/pmikutel/directed-memory-bank

## Installation et implementation pas a pas

1) Créez et committez project_context.md à la racine (pattern : https://github.com/pmikutel/directed-memory-bank).

```bash
git checkout -b chore/dmb-add-project-context
cat > project_context.md <<'MD'
Version: 2026-07-28 | Owner: @alice | LastUpdate: 2026-07-28

# Elevator pitch
One line describing purpose.

# Current objectives
1. ...

# Key files
- src/main.py
- tests/

# Constraints
- No external SSO

MD

git add project_context.md
git commit -m "chore(dmb): add project_context.md v0.1"
git push --set-upstream origin chore/dmb-add-project-context
```

2) Remplissez rubriques minimales : pitch (1 ligne), 3–5 objectifs, top 5–10 chemins, notes CI/tests. Restez concis (≤ 512 tokens par sous-section si possible).

3) Ajoutez en-tête métadonnées (Version, Dernière mise à jour iso, Owner) pour contrôles CI.

4) Ouvrez une PR et testez avec une tâche simple dans les 60–90 minutes ; mesurez temps jusqu'au premier triage (minutes) et erreurs (%).

5) Exemple de job GitHub Actions pour valider la présence et header (pattern : https://github.com/pmikutel/directed-memory-bank) :

```yaml
name: Validate DMB
on: [pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Ensure project_context.md exists
        run: test -f project_context.md
      - name: Lint header
        run: |
          head -n 1 project_context.md | grep -E "Version: .* \| Owner: @" || (echo "Header missing" && exit 1)
```

6) Rollout recommandé : canary à 10% du flux d'issues pendant 3 jours (3 membres); passer à 50% la semaine suivante si erreurs ≤ 5% et édition humaine n'augmente pas > 20%.

Source pattern : https://github.com/pmikutel/directed-memory-bank

## Problemes frequents et correctifs rapides

(Source : bonnes pratiques extraites du dépôt https://github.com/pmikutel/directed-memory-bank.)

- L'agent ignore ou contredit le fichier
  - Correctif : préfixer la session par "LISEZ project_context.md entièrement avant de répondre" et demander à l'agent de répéter l'elevator pitch en 1 phrase.

- Contexte obsolète
  - Correctif : champ "Dernière mise à jour" + politique de rafraîchissement (mettre à jour si > 7 jours; bloquer merges si > 14 jours).

- Fichier trop long / limites de tokens
  - Correctif : scinder en overview.md, architecture.md, changelog.md; garder chaque fichier < ~8 000 tokens; résumé 300–512 tokens.

- Secrets inclus
  - Correctif : checklist de rédaction + linter CI + hook pre-commit pour refuser motifs de secrets.

- Mesures rapides
  - Tester 10 issues initiales; si erreurs ≤ 5% et gain de temps ≥ 20% après 2 semaines, augmenter l'automatisation.

Référence : https://github.com/pmikutel/directed-memory-bank

## Premier cas d'usage pour une petite equipe

Cible : fondateurs solo et équipes 1–4 personnes. Le pattern et les exemples sont documentés ici : https://github.com/pmikutel/directed-memory-bank.

Étapes concrètes et seuils (durées et métriques incluses) :

1) Livrer un fichier minimal en 30–60 minutes
- Contenu : Version, Owner, 1-ligne pitch, 3 objectifs, top 5 chemins. Taille cible ≤ 1 000 tokens. Ouvrir PR.

2) Canary : 3 jours à 10% du trafic
- Configurer l'agent pour auto-trier 10% des issues pendant 3 jours. Mesurer : temps jusqu'au premier triage (minutes), labels appliqués, erreurs (%). Seuils : erreurs ≤ 5% pour continuer.

3) Vérification simple
- Instruction obligatoire : "LISEZ project_context.md. Confirmez l'objectif principal en 1 phrase." Assigner 1 Owner par décision automatisée.

4) Pilotage (2 semaines)
- Suivre : temps jusqu'au premier triage (minutes), taux d'acceptation PR au premier passage (%), nombre d'éditions humaines. Succès : réduction du temps de triage ≥ 20% OU approbation qualitative; erreurs < 5%.

5) Réversibilité
- Droits d'édition limités à 1–2 propriétaires. Rollback si éditions humaines augmentent > 20% ou erreurs > 5%.

Artifacts produits : mapping décisionnel, checklist PR (1 page), rapport pilote 14 jours.

Source : https://github.com/pmikutel/directed-memory-bank

Table décisionnelle (exemple rapide)

| Métrique / trigger             | Seuil       | Action automatique                  |
|-------------------------------:|:-----------:|:------------------------------------|
| Erreurs agentées (%)           | > 5%        | Rollback canary à 0%                |
| Éditions humaines (%)          | > 20%       | Restreindre droits d'édition (1–2)  |
| Temps moyen triage (minutes)   | ↓ ≥ 20%     | Étendre portée canary               |
| Taille fichier (tokens)        | > 8 000     | Split en 2–3 fichiers + résumé      |

## Notes techniques (optionnel)

- Agnosticité outil : le markdown brut évite verrouillage à un SDK — le dépôt l'expose clairement (https://github.com/pmikutel/directed-memory-bank).
- Accès : fournir l'URL raw GitHub pour fetch HTTP (GET), ou monter le repo pour runners locaux.
- Stores vectoriels : optionnels. Pour un pilote, éviter cette infrastructure réduit coût/complexité ; envisagez un store vectoriel seulement si > 10 000 documents ou besoin de latence < 100 ms pour la recherche (seuils indicatifs).

Exemple JSON metadata (à insérer en tête de project_context.md) :

```json
{
  "version": "2026-07-28",
  "owner": "@alice",
  "expires": "2026-08-04"
}
```

Remarque pratique : instrumentez les lectures (logs) pour vérifier que l'agent a chargé le fichier. Si votre modèle impose une contrainte de tokens, fournissez un résumé 300–512 tokens et liez le détail raw (https://github.com/pmikutel/directed-memory-bank).

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse : l'agent peut lire des fichiers ou accepter du texte collé (pattern décrit ici : https://github.com/pmikutel/directed-memory-bank).
- Hypothèse : l'équipe mettra à jour le fichier au moins une fois tous les 7 jours pendant les sprints actifs.
- Hypothèse : les métriques choisies (temps de triage, taux d'édition de PR) reflètent la valeur du pilote.

### Risques / mitigations

- Risque : contexte périmé → Mitigation : champ "Dernière mise à jour" + blocage merges si âge > 14 jours.
- Risque : limites de tokens → Mitigation : scinder fichiers, garder chaque fichier < ~8 000 tokens, fournir résumés 300–512 tokens.
- Risque : fuite de secrets → Mitigation : checklist rédaction + linter CI + hooks pre-commit.
- Risque opérationnel : erreurs > 5% ou hausse éditions humaines > 20% → Mitigation : rollback et restriction des droits d'édition à 1–2 propriétaires.

### Prochaines etapes

- Finaliser project_context.md et ouvrir une PR (objectif : 30–60 minutes pour premier brouillon).
- Lancer un canary 3 jours à 10% du trafic issues (mesurer pendant 14 jours au total).
- Recueillir métriques pendant 2 semaines et comparer aux seuils (réduction du temps de triage ≥ 20% OU approbation qualitative; erreurs < 5%).
- Ajouter job CI pour valider l'en-tête et exécuter contrôles rédaction (ex. l'exemple YAML ci‑dessus, source : https://github.com/pmikutel/directed-memory-bank).
- Restreindre droits d'édition à 1–2 propriétaires et documenter plan de rollback dans le runbook.

Checklist finale :
- [ ] Créer project_context.md et ouvrir la PR
- [ ] Lancer un canary 3 jours à 10% du trafic
- [ ] Recueillir métriques pendant 2 semaines et comparer aux seuils

Note finale : conservez la memory bank petite (≤ 8 000 tokens), lisible et versionnée — pattern simple et pragmatique : du markdown brut que tout agent lisant des fichiers peut consommer (référence : https://github.com/pmikutel/directed-memory-bank).
