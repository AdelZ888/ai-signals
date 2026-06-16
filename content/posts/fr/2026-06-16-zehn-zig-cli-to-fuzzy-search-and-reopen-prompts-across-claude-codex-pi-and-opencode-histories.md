---
title: "Zehn : CLI en Zig pour recherche floue et réouverture de prompts dans les historiques Claude, Codex, Pi et Opencode"
date: "2026-06-16"
excerpt: "Zehn est un petit outil CLI écrit en Zig qui lit les historiques de Claude, Codex, Pi et Opencode, normalise et déduplicate les prompts, puis propose une recherche floue à la manière de fzf et restaure la session d'origine."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-16-zehn-zig-cli-to-fuzzy-search-and-reopen-prompts-across-claude-codex-pi-and-opencode-histories.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "Zig"
  - "CLI"
  - "recherche floue"
  - "historique d'agents"
  - "productivité"
  - "AI"
sources:
  - "https://www.al3rez.com/building-zehn"
---

## TL;DR en langage simple

- Problème : vos prompts et sessions sont dispersés entre plusieurs agents et formats (claude, codex, pi, opencode). Retrouver une requête demande de fouiller plusieurs fichiers différents. Source : https://www.al3rez.com/building-zehn
- Solution : un petit binaire écrit en Zig (zehn) qui implémente quatre readers, normalise chaque entrée en un "Record", déduplique (garde l'occurrence la plus récente) et expose une recherche floue inspirée de fzf. En sélectionnant une ligne, l'outil tente de rouvrir la session dans l'agent propriétaire si possible. Source : https://www.al3rez.com/building-zehn

Exemple d'usage : tapez quelques lettres, les meilleurs résultats (score fzf-like) apparaissent en tête ; Entrée ouvre la session correspondante quand la cible est disponible. Source : https://www.al3rez.com/building-zehn

Méthodologie courte : implémentez et testez chaque reader séparément, puis enchaînez normalisation → déduplication → index → UI. Source : https://www.al3rez.com/building-zehn

## Ce que vous allez construire et pourquoi c'est utile

Objectif : un CLI qui fait ceci (prototype inspiré du référentiel décrit) :

1. lire les historiques de plusieurs agents (claude, codex, pi, opencode),
2. produire un Record uniforme {prompt, project?, session_id?, timestamp?, source_agent},
3. dédupliquer en gardant la version la plus récente quand un timestamp existe,
4. proposer une recherche floue qui imite fzf (bonus début de mot, bonus séquences consécutives),
5. fournir, si possible, une action "ouvrir la session" pour revenir à l'agent d'origine.

Pourquoi : regrouper 4 historiques en une interface unique évite de parcourir manuellement plusieurs fichiers et formats. Source : https://www.al3rez.com/building-zehn

Récapitulatif des formats (prototype) :

| Agent     | Stockage                     | Où trouver le prompt      |
|-----------|------------------------------|---------------------------|
| claude    | history.jsonl                | champ `display`           |
| codex     | history.jsonl                | champ `text`              |
| pi        | dossier par session + .jsonl | 1re ligne = métadonnées   |
| opencode  | SQLite DB                    | lecture via `sqlite3`     |

Source : https://www.al3rez.com/building-zehn

## Avant de commencer (temps, cout, prerequis)

- Prérequis logiciels : Zig (compilateur) si vous voulez builder le binaire ; `sqlite3` en CLI est utilisé par le reader Opencode (optionnel). Source : https://www.al3rez.com/building-zehn
- Accès : droits de lecture sur les fichiers d'historique pour chaque agent.
- Coût : outils open source (Zig, sqlite3) ; le prototype ne nécessite pas de serveur pour un usage local. Source : https://www.al3rez.com/building-zehn

Checklist de préparation :
- [ ] Zig installé
- [ ] `sqlite3` installé (optionnel pour Opencode)
- [ ] Accès lecture aux fichiers/dossiers d'historique

Estimation d'effort (guidance, valider en interne) : build initial et tests locaux sont souvent réalisables en une session de travail. Source : https://www.al3rez.com/building-zehn

## Installation et implementation pas a pas

1) Cloner et compiler

```bash
git clone https://example.com/your/zehn.git
cd zehn
zig build -Drelease-safe
./zig-out/bin/zehn --help
```

2) Créer une configuration JSON simple (chemins vers historiques) :

```json
{
  "paths": {
    "claude": "/home/user/.config/claude/history.jsonl",
    "codex": "/home/user/.config/codex/history.jsonl",
    "pi_dir": "/home/user/.local/share/pi/sessions",
    "opencode_db": "/home/user/.local/share/opencode/history.sqlite"
  }
}
```

3) Vérifier les readers fournis (comportements à contrôler) :
- claude reader : lire JSONL ligne par ligne, extraire `display`.
- codex reader : lire JSONL ligne par ligne, extraire `text`.
- pi reader : parcourir dossiers, lire .jsonl où la 1re ligne est métadonnée.
- opencode reader : exécuter `sqlite3` pour interroger la DB ; si `sqlite3` absent, l'outil ignore Opencode et logge l'état. Source : https://www.al3rez.com/building-zehn

4) Normalisation & déduplication
- Produire des Records standardisés.
- Dédupliquer par clé stable (prompt+project+agent) ; si timestamps disponibles, choisir la plus récente.

5) Index et UI

```bash
# reconstruire l'index (append-only possible)
./zig-out/bin/zehn --config ./zehn.json --reindex --out ./data/index.jsonl
# lancer l'UI en local
./zig-out/bin/zehn --config ./zehn.json --index ./data/index.jsonl
```

Source : https://www.al3rez.com/building-zehn

## Problemes frequents et correctifs rapides

- Opencode n'apparaît pas : `sqlite3` manquant. Correctif : installer `sqlite3` ou fournir un export SQL/JSON. Source : https://www.al3rez.com/building-zehn

- Duplicats persistants : extraire/inférer timestamps ; sinon utiliser la date de modification (mtime) comme heuristique.

- Matching différent de fzf : rendre les paramètres du score (poids début de mot, poids séquences consécutives) configurables.

- Erreurs de permission : exécuter avec droits de lecture ou copier localement les historiques.

Astuce perf : maintenir un index JSONL append-only pour éviter de rescanner tous les fichiers à chaque lancement. Source : https://www.al3rez.com/building-zehn

## Premier cas d'usage pour une petite equipe

Cible : fondateurs solos et petites équipes (2–4 personnes). Démarrer local, itérer vite. Source : https://www.al3rez.com/building-zehn

Actions concrètes (au moins 3 étapes actionnables) :

1) Lancer un prototype local en 3 étapes (actionnable)
   - Clonez le repo, adaptez la config JSON avec vos chemins, compilez le binaire.
   - Exécutez `--reindex` pour construire un index local et lancez l'UI.
   - Validez que 10–50 prompts représentatifs apparaissent et que la sélection réouvre la session quand c'est possible.

2) Nettoyage minimal avant partage
   - Extractez les historiques sur une machine locale.
   - Exécutez un script simple (grep/sed ou script Node/Python) pour supprimer e-mails et clés avant tout export partagé.
   - N'envoyez jamais un index brut sans consentement explicite des collaborateurs.

3) Pilote court et itératif
   - Choisissez 1–3 utilisateurs internes pour un pilote initial.
   - Collectez retours sur le scoring, la pertinence et les faux positifs, puis ajustez les poids du matcher.

Checklist rapide pour fondateur solo / petite équipe :
- [ ] Exécuter le prototype localement
- [ ] Activer sanitization avant tout partage
- [ ] Piloter avec 1–3 utilisateurs et collecter feedback

Source : https://www.al3rez.com/building-zehn

## Notes techniques (optionnel)

- Format de message : un message peut être une chaîne ou un tableau de blocs typés — le prototype aplatit ces parties et joint avec des sauts de ligne. Source : https://www.al3rez.com/building-zehn
- SQLite : le prototype appelle `sqlite3` en shell au lieu d'implémenter un lecteur SQLite en Zig ; si `sqlite3` manque, Opencode est ignoré avec un message explicite. Source : https://www.al3rez.com/building-zehn
- Scoring : cherche à imiter fzf (bonuses début de mot, séquences consécutives). Rendre ces poids configurables facilite l'itération. Source : https://www.al3rez.com/building-zehn
- Index JSONL : format append-only recommandé pour mises à jour incrémentales et CI.

Points d'ingénierie : gestion UTF-8, tolérance aux JSON mal formés, limiter la mémoire pour indexes très larges. Source : https://www.al3rez.com/building-zehn

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse factuelle ancrée dans le prototype : les mappings listés (claude.`display`, codex.`text`, pi = dossier/session .jsonl, opencode = SQLite) sont ceux décrits dans la référence. Source : https://www.al3rez.com/building-zehn
- Éléments chiffrés et seuils à valider par tests (hypothèses, à confirmer) :
  - cold start cible : < 5s
  - latence médiane de recherche cible : < 200ms
  - seuil d'alerte latence médiane : 500ms
  - taux de duplicats après dédup cible : < 1%
  - seuil d'alerte duplicate-rate : 5%
  - objectif d'adoption pilote : 50%–90% d'utilisation hebdo sur 2 semaines
  - fenêtre canary recommandée : 48–72 heures
  - taille d'index de test CI : 10 000 enregistrements
  - recommandation de rétention pour exports partagés : 90 jours

(Méthode : ces chiffres sont des objectifs opérationnels — validez-les avec vos propres mesures.)

### Risques / mitigations

- Risque : fuite de données privées via un index partagé. Mitigation : opt-in explicite, sanitization (suppression d'e-mails, clés API, tokens), rétention limitée (p.ex. 90 jours).
- Risque : absence de `sqlite3` empêche Opencode. Mitigation : détecter `sqlite3` au démarrage et proposer un import/export SQL/JSON comme repli.
- Risque : scoring inattendu → Mitigation : exposer paramètres du scorer, itérer en pilote, mesurer pertinence.
- Risque : index volumineux ralentit l'UI → Mitigation : index append-only, mises à jour incrémentales, tests sur échantillons (p.ex. 10k enregistrements).

### Prochaines etapes

- Ajouter CI qui exécute tests d'intégration avec fichiers d'historique d'exemple pour les agents supportés (≥4 agents). Source : https://www.al3rez.com/building-zehn
- Packager des binaires de release (tar.gz) et préparer distribution (Homebrew, etc.).
- Écrire un outil de sanitization/audit de confidentialité pour exports partagés.
- Mettre en place monitoring : latence médiane de recherche et duplicate-rate ; créer alertes (p.ex. médiane > 500ms, duplicate-rate > 5%).

Checklist finale pour mise en production :
- [ ] Build Zig en CI
- [ ] Tests d'intégration avec fichiers d'historique d'exemple (≥4 agents)
- [ ] Audit de confidentialité terminé
- [ ] Canary sur 1 utilisateur pendant 72 heures

Source et référence principale : https://www.al3rez.com/building-zehn
