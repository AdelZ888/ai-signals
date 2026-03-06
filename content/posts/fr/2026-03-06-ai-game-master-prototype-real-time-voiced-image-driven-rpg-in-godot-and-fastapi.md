---
title: "Prototype de Maître de Jeu IA : RPG en temps réel avec voix et images (Godot & FastAPI)"
date: "2026-03-06"
excerpt: "Plan pour un prototype de RPG jouable dans un navigateur où les commandes saisies vont à un Maître de Jeu IA qui renvoie du JSON structuré pour changer la musique, déplacer des PNJ, donner des objets, déclencher des cutscenes et de la TTS en temps réel."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-06-ai-game-master-prototype-real-time-voiced-image-driven-rpg-in-godot-and-fastapi.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 360
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "Jeu"
  - "Godot"
  - "FastAPI"
  - "RPG"
  - "Prototype"
  - "TTS"
  - "Backend"
sources:
  - "https://i-am-neon.itch.io/infinit"
---

## TL;DR en langage simple

- Objectif : prototype jouable dans le navigateur. Le joueur tape du texte ; le Maître de Jeu IA (GM) renvoie des enveloppes JSON que le client applique. Source : https://i-am-neon.itch.io/infinit.
- Pourquoi : l'IA anime un monde écrit à la main (musique, portraits, objets, cutscenes) — Infinit décrit ce pattern et le monde « Solhai » écrit à la main : https://i-am-neon.itch.io/infinit.
- Résultat attendu rapidement : une boucle jouable de base, session de référence ≈ 30 minutes ("About a half-hour") — https://i-am-neon.itch.io/infinit.

Méthodologie : extrait et synthèse directes de la page Infinit citée ci‑dessus.

Exemple simple : vous tapez « donner la pierre à l'aubergiste ». Le GM renvoie JSON indiquant : déplacer l'objet, mettre à jour l'inventaire, changer le portrait du PNJ, lancer une cinématique illustrée et jouer un thème musical. Le client applique ces actions.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez construire un prototype minimal qui :

- envoie le texte du joueur au GM IA ;
- reçoit des enveloppes JSON structurées décrivant des actions à exécuter ;
- applique ces commandes côté client (UI, audio, portraits, inventaire, cutscenes) ;
- exécute des agents back‑end pour journaliser les découvertes et produire des résumés de sauvegarde.

Pourquoi c'est utile : Infinit montre que conserver un monde pré-écrit (Solhai) et laisser un GM IA réactif rendre les parties uniques conserve cohérence et richesse narrative — https://i-am-neon.itch.io/infinit.

Comparaison rapide (décision frame) :

| Choix technique | Impact immédiat | Validation minimale |
|---|---:|---|
| JSON strict (schema) | Exécution sûre côté client | 0 erreurs de parsing en 1ère passe ou fallback sûr |
| État serveur autoritatif | Empêche les hallucinations persistantes | Rejet mutations pour entités inconnues |
| Agents journaux séparés | Résumés de sauvegarde automatiques | sauvegarde < 500 ms pour résumé |

Source : https://i-am-neon.itch.io/infinit.

## Avant de commencer (temps, cout, prerequis)

Prérequis principaux :

- Compétences web / moteur (Infinit est "Made with Godot" et jouable en HTML5) — https://i-am-neon.itch.io/infinit.
- Backend simple pour authentifier, recevoir texte et renvoyer JSON validé.
- Accès API ML (clé) et stratégie budget : le développeur d'Infinit paye les coûts d'inférence en alpha — https://i-am-neon.itch.io/infinit.

Estimation temporelle et coûts (valeurs pour planification) :

- Prototype initial : ~6 heures (wire‑up minimal).
- Tests de charge canari : 5 à 20 utilisateurs.
- Session de référence par joueur : ~30 minutes.
- Objectif latence texte seul : 500 ms ; timeout cible par commande : 3 000 ms.
- Plafond tokens indicatif par session : 8 000 tokens (à ajuster selon tarifs).

Source : https://i-am-neon.itch.io/infinit.

## Installation et implementation pas a pas

Résumé de la boucle : client envoie texte + contexte -> orchestrateur ajoute contexte -> GM IA renvoie JSON -> serveur valide -> client exécute. Agents (journal, résumé de sauvegarde) tournent en parallèle. Référence : https://i-am-neon.itch.io/infinit.

1) Orchestrateur (broker serveur)
- Expose endpoint WebSocket/HTTP.
- Reçoit {user_text, context_state} → construit prompt → appelle l'IA → parse/valide JSON → renvoie.

2) Installation rapide (exemple Python)

```bash
# créer un venv et installer FastAPI + uvicorn + pydantic
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn websockets pydantic
```

3) Schéma JSON minimal (command_schema.json)

```json
{
  "type": "object",
  "properties": {
    "type": {"type": "string"},
    "npc": {"type": "string"},
    "to": {"type": "string"},
    "item": {"type": "string"},
    "track": {"type": "string"},
    "fade_ms": {"type": "integer"}
  },
  "required": ["type"]
}
```

4) Adapter ML & validation
- Prompt strict : "Output only JSON matching this schema." Retenter 1–2 fois en cas d'échec.
- Si échec persistant, renvoyer commande de secours (narration sécurisée sans mutation d'état).

5) Client minimal
- UI : zone de saisie, narration, portraits, lecteur audio, inventaire.
- Appliquer commandes reçues séquentiellement ; inclure sequence_id monotone pour replay/résilience.

6) Agents back‑end
- Agent journal : enregistre découvertes (countables, timestamps).
- Agent sauvegarde : génère résumé lisible à la sauvegarde (objectif < 500 ms pour résumé initial).

Tests recommandés : mesurer latency_ms, tokens_in, tokens_out, cost_usd par tour. Source : https://i-am-neon.itch.io/infinit.

## Problemes frequents et correctifs rapides

- ML renvoie texte non JSON
  - Fix : re‑prompt strict; retenter 1 fois. Si échec, fallback narratif.
- Hallucinations (IA invente PNJ/lieux)
  - Fix : état serveur autoritatif, validation JSON, rejeter mutations pour entités inconnues.
- Latence médias / TTS
  - Fix : placeholders, chargement asynchrone, feature flags pour activer médias lourds uniquement.
- Ordre des commandes après reconnexion
  - Fix : utiliser sequence_id monotone ; rejouer jusqu'à N=50 commandes max si nécessaire.

Note opérationnelle : Infinit est en alpha; l'auteur précise que "things will break" et que l'IA hallucine parfois — https://i-am-neon.itch.io/infinit.

## Premier cas d'usage pour une petite equipe

Répartition recommandée pour un petit studio (solo + 1–2) :

- 1 développeur full‑stack (orchestrateur, validation, télémétrie).
- 1 développeur/designer client (UI, application JSON, assets).
- Optionnel : 1 rédacteur prompts / lore.

Conseils pratiques :
1) Limitez la portée initiale à 1 zone, 2 lieux et 2 PNJ (2 lieux, 2 PNJ = portée minimale testable).
2) Test en cercle fermé : invite 5–20 testeurs via itch.io / Discord (page d'invitation similaire à Infinit) — https://i-am-neon.itch.io/infinit.
3) Protégez le budget : logs par tour (latency_ms, tokens_in, tokens_out), plafonds par session et quotidiens.

Checklist alpha exemple :

- [ ] Page d'invitation + Discord pour feedback — https://i-am-neon.itch.io/infinit
- [ ] Plafonds budgétaires et throttles
- [ ] Télémetrie par tour (latency_ms, tokens_in)

## Notes techniques (optionnel)

Architecture recommandée : client <-> broker WebSocket <-> orchestrateur -> agents (GM, journal, sauvegarde). Infinit décrit les agents en arrière‑plan et le rôle du GM IA — https://i-am-neon.itch.io/infinit.

Instrumentation exemple (JSON) :

```json
{
  "metrics": ["latency_ms","validation_fail_count","tokens_in","tokens_out","cost_usd"],
  "alerts": {"validation_fail_rate": 0.10, "mean_latency_ms": 500}
}
```

Bonnes pratiques : retentes de parsing 1–2 fois, capturer latency_ms et validation_fail_count, limiter les assets lourds par feature flags.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse : mise en place initiale (wire‑up) ≈ 6 heures.
- Hypothèse timeout cible par commande = 3 000 ms.
- Hypothèse latence cible pour texte seul = 500 ms.
- Hypothèse portée initiale = 2 lieux, 2 PNJ, 3–6 types de commandes.
- Hypothèse canari = 5 utilisateurs ou 5 % d'une liste d'invitation.
- Hypothèse session de référence = 30 minutes (d'après Infinit).
- Hypothèse tokens plafond par session = 8 000 tokens (à valider selon fournisseur).
- Hypothèse retentatives JSON parse = 1–2 tentatives avant fallback.

### Risques / mitigations

- Risque : coût élevé d'inférence (USD). Mitigations : plafonds quotidiens, budgets par session, throttles automatiques.
- Risque : hallucinations du modèle. Mitigations : état serveur autoritatif, validation JSON stricte, commandes de secours.
- Risque : latence médias / TTS. Mitigations : placeholders, chargement asynchrone, feature flags pour médias lourds.
- Risque : modération / safety. Mitigations : filtrage avant envoi, pipeline de modération et blocage automatique.

### Prochaines etapes

- [ ] Durcir le schéma JSON et la validation serveur
- [ ] Implémenter la télémetrie par tour (latency_ms, tokens_in, tokens_out, cost_usd)
- [ ] Ajouter plafonds budgétaires et throttles par session
- [ ] Construire un éditeur auteur basique pour le JSON monde
- [ ] Lancer playtests sur invitation (5–20 utilisateurs) et collecter feedback
- [ ] Implémenter agents journal et résumé de sauvegarde en production
- [ ] Ajouter feature flags pour médias lourds et activer rollouts progressifs

Référence principale : Infinit — un monde écrit à la main animé par un Maître de Jeu IA et des agents de journalisation/sauvegarde — https://i-am-neon.itch.io/infinit.
