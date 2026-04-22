---
title: "LibreThinker — copilote IA pour LibreOffice Writer avec modèle gratuit intégré et support Ollama/BYOK"
date: "2026-04-22"
excerpt: "Installez LibreThinker pour ajouter un copilote IA directement dans la barre latérale de LibreOffice Writer. Livré avec un modèle gratuit en ligne (sans inscription), prend en charge les clés API fournisseurs (BYOK) et les instances Ollama locales ; plus de 10 000 téléchargements déclarés."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-22-librethinker-ai-copilot-for-libreoffice-writer-with-built-in-free-model-and-ollamabyok-support.jpg"
region: "FR"
category: "Tutorials"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 45
editorialTemplate: "TUTORIAL"
tags:
  - "LibreThinker"
  - "LibreOffice"
  - "IA"
  - "LLM"
  - "Ollama"
  - "BYOK"
sources:
  - "https://librethinker.com/"
---

## TL;DR en langage simple

- LibreThinker ajoute un assistant IA dans la barre latérale de LibreOffice Writer. Il permet de reformuler, résumer, relire, traduire et générer des ébauches sans quitter Writer (source : https://librethinker.com/).
- Trois modes de connexion : modèle en ligne gratuit (sans inscription), BYOK (vos clés pour OpenAI, Mistral, etc.) et Ollama local (instance auto‑hébergée) — choisissez selon besoin (https://librethinker.com/).
- Installation courte : téléchargez le .oxt, installez via Outils > Gestionnaire d'extensions, redémarrez Writer et ouvrez la barre latérale pour cliquer l'icône ampoule (https://librethinker.com/).

Checklist rapide pour démarrer

- [ ] Télécharger le .oxt depuis le répertoire (https://librethinker.com/)
- [ ] Outils > Gestionnaire d'extensions > Ajouter → sélectionner .oxt
- [ ] Redémarrer LibreOffice Writer
- [ ] Vue > Barre latérale → cliquer l'icône ampoule LibreThinker (https://librethinker.com/)

Petit exemple : sélectionnez un paragraphe dense. Cliquez « Résumer ». Vérifiez la sortie et acceptez‑la pour remplacer votre texte. Tout se passe dans Writer, pas de copier/coller vers un autre outil (https://librethinker.com/).

## Ce que vous allez construire et pourquoi c'est utile

Objectif : installer LibreThinker dans LibreOffice Writer et tester les trois modes de connexion (gratuit, BYOK, Ollama local). L'extension place un copilote dans la barre latérale pour éviter les allers‑retours entre applications (source : https://librethinker.com/).

Pourquoi c'est utile (concret)

- Rester dans l'éditeur : actions disponibles directement dans la barre latérale (https://librethinker.com/).
- Flexibilité de backend : démarrage immédiat avec le modèle gratuit ; BYOK pour utiliser vos clés ; Ollama pour exécution locale (https://librethinker.com/).
- Adoption indiquée : le projet mentionne plus de 10 000 téléchargements dans le répertoire des extensions (https://librethinker.com/).

Tableau comparatif rapide

| Backend | Effort d'installation | Confidentialité | Coût initial | Remarques clés |
|---|---:|---|---:|---|
| Modèle gratuit (en ligne) | Faible | Standard | 0 $ (sans inscription) | Usage immédiat, sans signup (https://librethinker.com/)
| BYOK (vos clés) | Faible–moyen | Dépend du fournisseur | Variable (selon fournisseur) | Collez votre clé API dans les réglages BYOK (https://librethinker.com/)
| Ollama (local) | Moyen–élevé | Meilleure confidentialité (local) | Coût machine/temps | Exemple de modèle : sh/ollama/gemma3:1b. Endpoint par défaut : http://localhost:11434/api/chat (https://librethinker.com/)

## Avant de commencer (temps, cout, prerequis)

Prérequis techniques

- LibreOffice Writer installé et opérationnel (https://librethinker.com/).
- Fichier .oxt LibreThinker téléchargé depuis le répertoire des extensions (https://librethinker.com/).
- Optionnel : clé API fournisseur (OpenAI, Mistral…) si vous activez BYOK (https://librethinker.com/).
- Optionnel : instance Ollama si vous choisissez l'exécution locale et un modèle téléchargé (ex. gemma3:1b) (https://librethinker.com/).

Note méthodologique courte : je reprends ici uniquement les éléments signalés sur la page projet ; les valeurs opérationnelles proposées plus détaillées sont listées plus bas comme hypothèses à valider (https://librethinker.com/).

## Installation et implementation pas a pas

1) Télécharger et installer

- Récupérez le fichier .oxt depuis le répertoire des extensions (https://librethinker.com/).
- Dans Writer : Outils > Gestionnaire d'extensions > Ajouter → sélectionnez le .oxt → redémarrez LibreOffice.

2) Ouvrir la barre latérale

- Vue > Barre latérale → repérez l'icône ampoule LibreThinker. Cliquez pour ouvrir le copilote (https://librethinker.com/).

3) Tester le modèle gratuit intégré

- Sélectionnez un paragraphe. Cliquez « Reformuler », « Résumer » ou « Relire ». Vérifiez la sortie et insérez‑la si elle vous convient (https://librethinker.com/).

4) Configurer BYOK (vos clés)

- BYOK signifie "Bring Your Own Key". Ouvrez les réglages BYOK dans la barre latérale et collez la clé API fournie par votre compte (OpenAI, Mistral, etc.). L'extension prend en charge plusieurs fournisseurs selon la page projet (https://librethinker.com/).

Exemple simple de paramètre local (ne pas committer de vraies clés) :

```ini
# Paramètres exemple pour usage local/BYOK
model_url = http://localhost:11434/api/chat
model_id = sh/ollama/gemma3:1b
```

5) Utiliser Ollama local

- Installez et lancez Ollama sur la machine. Téléchargez le modèle voulu (ex. gemma3:1b).
- Dans LibreThinker → BYOK/Ollama Settings, définissez l'ID modèle sur "sh/ollama/gemma3:1b" comme indiqué sur le site. Par défaut, l'extension pointe vers http://localhost:11434/api/chat (https://librethinker.com/).

Vérification rapide (curl) :

```bash
curl -s -X POST http://localhost:11434/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"model":"gemma3:1b","messages":[{"role":"user","content":"Hello"}]}' | jq .
```

6) Plan de test minimal

- Effectuez au moins 3 tâches types : reformuler, résumer, relire. Comparez qualitativement le modèle gratuit, BYOK et Ollama pour choisir le backend adapté (https://librethinker.com/).

## Problemes frequents et correctifs rapides

- Extension introuvable après installation
  - Action : redémarrez LibreOffice. Vérifiez Outils > Gestionnaire d'extensions et Vue > Barre latérale → icône ampoule (https://librethinker.com/).

- Pas de réponse / erreurs réseau
  - Action : tester la connectivité Internet. Si le réseau bloque, basculez sur Ollama local ou utilisez BYOK avec un endpoint accessible (https://librethinker.com/).

- Erreurs de clé API / dépassement de quota
  - Action : retapez la clé dans BYOK. Vérifiez le tableau de bord du fournisseur pour quotas et erreurs.

- Échecs de connexion à Ollama
  - Action : assurez‑vous qu'Ollama est lancé et que le modèle est téléchargé. Testez l'endpoint http://localhost:11434/api/chat avec le curl ci‑dessus (https://librethinker.com/).

Checklist dépannage

- [ ] Redémarrer LibreOffice
- [ ] Vérifier la présence de LibreThinker dans le gestionnaire
- [ ] Tester la connectivité Internet
- [ ] Exécuter le curl de vérification pour Ollama
- [ ] Vérifier le tableau de bord fournisseur pour quotas (https://librethinker.com/)

## Premier cas d'usage pour une petite equipe

Cible : fondateurs solo ou petites équipes (1–3 personnes) qui veulent produire des textes rapides sans quitter Writer (https://librethinker.com/).

Conseils concrets et actionnables (au moins 3)

1) Installer en local et tester en 1 journée
- Installez LibreThinker sur votre poste. Lancez 3 documents réels et faites 3 actions sur chacun : reformulation, résumé, relecture. Mesurez si cela réduit les allers‑retours.

2) Choisir un backend minimal viable
- Débutez avec le modèle gratuit pour 1–2 jours. Si la confidentialité est requise, installez Ollama sur 1 machine et définissez l'ID modèle sh/ollama/gemma3:1b ; l'extension utilise par défaut http://localhost:11434/api/chat (https://librethinker.com/).

3) Créer 2 templates prêts à l'emploi
- Rédigez un prompt de reformulation et un prompt de résumé. Sauvegardez ces 2 prompts dans un document partagé ou un gestionnaire de snippets pour réutilisation.

4) Protéger les clés et limiter les risques
- N'enregistrez pas les clés API dans des fichiers partagés. Si vous utilisez BYOK, stockez la clé dans un gestionnaire de secrets et collez‑la via les réglages BYOK dans l'extension (https://librethinker.com/).

5) Feedback léger et itératif
- Après 3 jours d'usage par 1 personne, collectez 3 mesures : satisfaction sur 1–5, nombre d'ébauches réutilisées, temps jusqu'à première ébauche. Ajustez ensuite.

Tableau rapide de pilotage (exemple d'usage pour 1–3 personnes)

| Action | Durée cible | But |
|---|---:|---|
| Installer + test initial | 1 jour | Valider intégration dans le flux de travail |
| Pilote 1 personne | 3 jours | Mesurer efficacité et satisfaction |
| Étendre à 3 personnes | 2 semaines | Valider montée en charge et coûts |

(Références et détails d'installation : https://librethinker.com/.)

## Notes techniques (optionnel)

- LibreThinker ajoute un copilote dans la barre latérale de Writer avec plusieurs backends : modèle gratuit sans inscription, BYOK pour fournisseurs externes et support Ollama local (https://librethinker.com/).
- Pour Ollama, la syntaxe d'ID modèle attendue est préfixée par sh/ollama/ (ex. sh/ollama/gemma3:1b). L'endpoint chat par défaut est : http://localhost:11434/api/chat (https://librethinker.com/).

Exemple de snippet de configuration local (ne pas partager de vraies clés) :

```json
{
  "model_url": "http://localhost:11434/api/chat",
  "model_id": "sh/ollama/gemma3:1b"
}
```

Remarque sécurité : évitez de stocker des clés API dans des documents. Préférez BYOK via les réglages ou un gestionnaire de secrets externe (https://librethinker.com/).

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Éléments confirmés sur la page projet : installation via .oxt, fonctions (reformuler, résumer, relire, traduire, générer des ébauches), modèle gratuit sans inscription, BYOK (votre clé), support Ollama local, exemple de modèle sh/ollama/gemma3:1b, endpoint par défaut http://localhost:11434/api/chat, et >10 000 téléchargements (https://librethinker.com/).
- Valeurs opérationnelles proposées à valider en pilote (hypothèses) : temps d'installation 15–45 minutes ; pilote initial 3 jours pour 1 personne ; test sur 3 documents et 3 tâches par document ; seuil d'acceptation qualité moyen ≥ 3/5 ; alerte de rollback si taux d'erreur > 5% ; budget pilote estimé 0–20 $ si BYOK (dépend du fournisseur) ; limite opérationnelle de tokens testée : 512–4 000 tokens (à valider). Ces chiffres sont des points d'entrée à mesurer en conditions réelles.

### Risques / mitigations

- Risque : fuite de clés API. Mitigation : n'enregistrer aucune clé dans des documents partagés. Utiliser BYOK via l'UI et un gestionnaire de secrets.
- Risque : coûts inattendus sur clé fournisseur. Mitigation : activer alertes et plafonds sur le compte fournisseur avant tout usage à grande échelle.
- Risque : mauvaise qualité des sorties. Mitigation : comparer systématiquement le modèle gratuit, BYOK et Ollama ; conserver prompts exemplaires ; seuils de décision à définir (voir hypothèses).
- Risque : indisponibilité de l'endpoint local. Mitigation : documenter l'URL par défaut (http://localhost:11434/api/chat) et automatiser un check de santé minimal pour Ollama (https://librethinker.com/).

### Prochaines etapes

- Lancer un canary : déployer LibreThinker pour 1 rédacteur pendant 3 jours. Collecter satisfaction (1–5), temps‑à‑première‑ébauche, et nombre d'éditions lourdes.
- Si concluant : étendre à 3 personnes pendant 2 semaines. Mesurer coûts réels et charge opérationnelle.
- Décider du backend de production (gratuit / BYOK / Ollama). Mettre en place gestion des clés, monitoring et critères de rollback (par ex. taux d'erreur > 5% ou feedback moyen < 3/5).

Source principale : page projet LibreThinker — https://librethinker.com/.
