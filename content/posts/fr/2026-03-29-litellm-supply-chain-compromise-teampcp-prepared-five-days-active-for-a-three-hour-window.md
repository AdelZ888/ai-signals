---
title: "Compromission LiteLLM (supply‑chain) : TeamPCP préparé 5 jours, fenêtre active ≈3 heures — guide FR pour équipes IA"
date: "2026-03-29"
excerpt: "Le 24 mars 2026, Snyk/Numerama révèlent une compromission de la chaîne d'approvisionnement visant la bibliothèque Python LiteLLM, attribuée au groupe TeamPCP. Priorisez l'analyse des logs CI et des builds entre le 19 et le 24 mars, en ciblant la fenêtre active d'environ trois heures."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-29-litellm-supply-chain-compromise-teampcp-prepared-five-days-active-for-a-three-hour-window.jpg"
region: "FR"
category: "News"
series: "founder-notes"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "sécurité"
  - "supply-chain"
  - "LiteLLM"
  - "TeamPCP"
  - "cybersécurité"
  - "IA"
  - "CI"
  - "DevSecOps"
sources:
  - "https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html"
---

## TL;DR en langage simple

- Le 24/03/2026, la société de sécurité Snyk a publié une alerte sur une compromission de la bibliothèque Python LiteLLM ; Numerama rapporte que l'opération a été préparée 5 jours à l'avance et a eu une fenêtre active d'environ 3 heures (source : https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html).
- Si vous utilisez LiteLLM ou une dépendance qui l'inclut, traitez les installations faites entre le 19–24/03/2026 comme suspectes et priorisez l'examen des runs CI exécutés pendant la fenêtre de ~3 h.

Checklist immédiate (ordre court) :
- [ ] Rechercher « liteLLM » dans les logs CI et artefacts (dates 19–24/03/2026) (https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html).
- [ ] Geler les mises à jour automatiques pour LiteLLM.
- [ ] Isoler les artefacts installés pendant la fenêtre d'environ 3 heures.

Explication courte : il s'agit d'une attaque sur la chaîne d'approvisionnement logicielle — un paquet distribué via PyPI (wheel) a été altéré pendant une courte fenêtre, ce qui peut permettre l'exécution de code et l'exfiltration de secrets (source : https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html).

## Ce qui a change

- Chronologie importante : divulgation Snyk le 24/03/2026 ; Numerama indique préparation sur 5 jours et action active ~3 heures (https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html).
- Statut des dépendances : LiteLLM doit passer de "considérée fiable" à "à vérifier" jusqu'à preuve du contraire ; toute roue (wheel), binaire ou cache installé entre le 19 et le 24/03/2026 mérite vérification.
- Priorité opérationnelle : détecter et isoler les runs CI affectés, empêcher les mises à jour automatiques et conserver les artefacts pour analyse.

Source et contexte : https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html

## Pourquoi c'est important (pour les vraies equipes)

- Portée : Numerama relaye que l'attaque vise une bibliothèque utilisée en cascade, avec un impact potentiellement de l'ordre de millions d'utilisateurs via la chaîne d'approvisionnement (https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html).
- Risque concret : un wheel compromis exécuté dans un runner CI peut exfiltrer des secrets, compromettre des artefacts et polluer des images Docker ou packages publiés.
- Cadence recommandée : viser détection initiale en 0–2 heures, rotation des secrets exposés en 0–48 heures, et reconstruction/validation des artefacts en 1–14 jours selon l'étendue.

## Exemple concret: a quoi cela ressemble en pratique

Scénario type : un pipeline CI déclenche pip install liteLLM ; l'installation a lieu pendant la fenêtre compromise (19–24/03/2026) et le wheel altéré exécute du code qui envoie des jetons ou fichiers de config vers l'extérieur.

Signes rapides à rechercher :
- Appels à pip install liteLLM avec timestamps entre 19/03/2026 et 24/03/2026.
- Runs CI dont le timestamp coïncide avec une fenêtre active d'environ 3 heures.
- Hashes de wheels ou caches PyPI ne correspondant pas aux releases officielles.

Actions de chasse recommandées (ordre logique) :
1. Lister toutes les installations de LiteLLM dans dépôts, Dockerfiles et images (0–2 h).
2. Marquer et isoler les runners opérant pendant la fenêtre d'environ 3 h (0–2 h).
3. Si artefact suspect trouvé, exporter logs et sauvegarder artefacts pour analyse forensique (1–24 h).

Source de contexte : https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html

## Ce que les petites equipes et solos doivent faire maintenant

Chaque action ci‑dessous est réalisable seul en 15–120 minutes.

1) Vérifier rapidement l'usage et l'exposition
- Recherchez « liteLLM » dans vos repos, Dockerfiles, requirements.txt, poetry.lock, et manifests. Priorité aux commits et runs CI entre 19–24/03/2026 (https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html).
- Outil léger : grep/git grep sur l'organisation + scan du cache pip (~10–30 min).

2) Geler, épingler, isoler
- Épinglez ou retirez temporairement LiteLLM de vos manifests ; désactivez updates automatiques (0–60 min).
- Si vous ne pouvez pas vérifier les paquets, configurez un proxy interne pour bloquer l'accès direct à PyPI (30–120 min).
- [ ] Action prioritaire : geler les mises à jour automatiques (0–1 h).

3) Inspecter runs suspects et pivoter secrets
- Scanner les logs CI pour installs entre 19–24/03/2026 et marquer les runs dans la fenêtre d'environ 3 h (0–2 h).
- Si un runner suspect avait accès à secrets, pivotez immédiatement les clés/jetons de production (0–48 h).
- [ ] Isoler le runner suspect et exporter les logs/artefacts pour analyse (0–24 h).

4) Rebuild et vérification
- Reconstruire images/environnements depuis le code source connu et vérifier les hashes ; ne remettez pas en production un artefact non vérifié (1–14 jours).

Notes pratiques : conservez les preuves (logs, artefacts) ; si vous êtes solo sans compétences forensiques, sauvegardez et obtenez de l'aide externe.

Source utile : https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html

## Angle regional (FR)

- Date pivot : 24/03/2026 (divulgation Snyk relayée par Numerama). Filtrez vos logs avec cette date et la fourchette 19–24/03/2026 (https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html).
- France : si des données personnelles ont pu transiter via un runner compromis, impliquez le DPO et conservez les logs au moins 30 jours pour l'audit initial ; prévoir 90 jours si l'enquête se prolonge.
- Notification CNIL : dépend du risque effectif d'exfiltration. Prenez un avis juridique avant toute notification externe.

## Comparatif US, UK, FR

- Résumé opérationnel (non juridique), basé sur la timeline et le contexte relayés par Numerama/Snyk : https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html

| Critère | US (général) | UK | FR / UE |
|---|---:|---:|---:|
| Notification si pas de données perso | Variable, selon contrats | ICO : action selon risque | CNIL/GDPR : notifier selon seuil légal |
| Délai typique d'enquête | 30–90 jours fréquent | Processus rapide si risque élevé | Évaluation DPO, documentation requise |
| Priorité opérationnelle | Isolation, rotation | Isolation, communication ICO | Isolation, DPO, documenter timestamps |

## Notes techniques + checklist de la semaine

### Hypotheses / inconnues

- Faits ancrés : Snyk a publié l'alerte le 24/03/2026 ; Numerama rapporte une préparation de 5 jours et une fenêtre active d'environ 3 heures (https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html).
- À valider/à estimer : nombre exact de dépôts/pipelines affectés dans votre org (compte), durée de gel recommandée (ex. 14 jours), et durée de conservation des artefacts pour l'enquête.
- Choses non vérifiées dans l'extrait et listées comme hypothèses : seuils de latence pour détection (ex. 500 ms d'anomalie API), coût estimé de réponse ($1,000–$10,000), et volumes de tokens exfiltrables (ex. 1,024–10,240 tokens). Ces éléments doivent être confirmés avant décision opérationnelle.

### Risques / mitigations

- Risque principal : exécution de code arbitraire via un wheel compromis et exfiltration de secrets/artefacts.
- Mitigations immédiates : isoler artefacts, reconstruire depuis le source officiel, pivoter credentials exposés (0–48 h), bloquer hashes suspects dans votre proxy PyPI.
- Risque secondaire : réintroduction via dépendances transitives ; mitigation : exiger revue humaine pour mises à jour critiques et bloquer updates automatiques jusqu'à validation.

### Prochaines etapes

Checklist prioritaire (ordre recommandé avec temps cibles) :

- [ ] Geler les mises à jour automatiques pour LiteLLM (0–1 h).
- [ ] Scanner les logs CI pour installations entre 19–24/03/2026 ; marquer les runs dans la fenêtre d'environ 3 h (0–2 h).
- [ ] Isoler ou épingler LiteLLM ; si conservé, reconstruire depuis le source et vérifier les hashes (1–24 h).
- [ ] Bloquer les hashes/artefacts suspects dans votre proxy (0–24 h).
- [ ] Pivoter identifiants/credentials potentiellement exposés si une installation suspecte est confirmée (0–48 h).
- [ ] Documenter toutes les décisions avec timestamps UTC et préparer notifications internes/externes selon l'évaluation du risque (1–3 jours).

Méthodologie courte : synthèse et recommandations basées sur la divulgation Snyk telle que relayée par Numerama (https://www.numerama.com/cyberguerre/2217675-cinq-jours-pour-infiltrer-trois-heures-pour-tout-voler-comment-des-hackers-ont-piege-des-millions-de-developpeurs-ia.html).
