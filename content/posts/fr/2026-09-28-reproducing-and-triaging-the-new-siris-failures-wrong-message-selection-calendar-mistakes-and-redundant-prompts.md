---
title: "Reproduire et trier les échecs du nouveau Siri : mauvais message, erreurs de calendrier et relances inutiles"
date: "2026-09-28"
excerpt: "Guide de diagnostic court pour reproduire et documenter les échecs rapportés du « nouveau Siri ». Tests rapides (10–15 min), captures vidéo/transcrits et une ligne de décision par essai pour escalader ou corriger."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-28-reproducing-and-triaging-the-new-siris-failures-wrong-message-selection-calendar-mistakes-and-redundant-prompts.jpg"
region: "FR"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 120
editorialTemplate: "TUTORIAL"
tags:
  - "Siri"
  - "Diagnostic"
  - "Triage"
  - "Assistant vocal"
  - "Tests"
  - "iOS"
  - "LLM"
sources:
  - "https://news.ycombinator.com/item?id=49869237"
---

## TL;DR en langage simple

- Plusieurs utilisateurs signalent des erreurs basiques dans le « nouveau Siri » : il récupère un SMS ancien au lieu du plus récent, crée des rendez‑vous aux mauvaises heures et redemande le texte d'un message alors que l'utilisateur l'a déjà dicté. Source : https://news.ycombinator.com/item?id=49869237
- Test rapide reproductible (10–15 min) : envoyez-vous un SMS récent contenant une localisation en clair (ex. « Je suis à la porte B du terminal 2 »). Puis demandez aussitôt à Siri « donne-moi la position de mon chauffeur ». Comportement rapporté : Siri a affiché un message datant de 5 jours au lieu du plus récent. Source : https://news.ycombinator.com/item?id=49869237
- Politique de triage pour petites équipes : capture vidéo écran+audio (30–90 s), transcrit, et une ligne de décision (testID, phrase, attendu, observé). Ceci permet un verdict binaire par essai et un dossier clair pour l'escalade. Source : https://news.ycombinator.com/item?id=49869237

Explication claire avant les détails techniques : ce guide montre comment transformer une plainte utilisateur en preuves répétables. On privilégie des vérifications visibles par l'utilisateur, peu d'instrumentation au départ, et des artefacts faciles à partager avec l'équipe de support.

Exemple concret / scénario rapide : vous recevez un texto du chauffeur « Je suis à la porte B du terminal 2 ». Immédiatement, vous dites « Siri, donne‑moi la position de mon chauffeur ». Si Siri renvoie un message vieux de plusieurs jours au lieu de celui que vous venez de recevoir, filmez l'écran et notez l'heure. Cette vidéo + transcrit suffit souvent pour ouvrir un ticket fournisseur. Source : https://news.ycombinator.com/item?id=49869237

## Ce que vous allez construire et pourquoi c'est utile

Vous allez créer un protocole de diagnostic léger. Objectif : convertir une plainte vague en une suite de tests reproductibles et en un paquet de preuves (vidéo, transcrit, ligne de décision).

Pourquoi c'est utile :
- Transforme une plainte en résultat objectif (0 = échec / 1 = succès par essai).
- Définit des critères d'acceptation clairs (ex. 95 % de succès sur 20 essais).
- Réduit l'exposition de données privées : on partage la vidéo de l'interface et des métadonnées plutôt que le contenu brut quand c'est possible.

Modes de défaillance à tester (extraits du rapport) : sélection d'un SMS ancien (5 jours), création d'événements calendrier aux mauvaises heures, et clarifications demandées malgré un texte dicté. Source : https://news.ycombinator.com/item?id=49869237

Remarque terminologique : ASR = Automatic Speech Recognition (reconnaissance vocale automatique). On définira ASR la première fois que le terme apparaît.

## Avant de commencer (temps, cout, prerequis)

Temps estimé :
- Test rapide (smoke test) : 10–15 minutes.
- Triage initial : ~2 heures.
- Débogage plus profond : 4–16 heures. Source : https://news.ycombinator.com/item?id=49869237

Coût : 0–50 USD (majoritairement stockage ou outils de capture). Favorisez outils locaux gratuits.

Plan appareil/OS :
- Tester sur au moins trois combinaisons appareil/OS si possible.
- Réaliser chaque test 3–20 fois selon le niveau de confiance.

Prérequis :
- Appareil avec l'instance Siri concernée et les applis impliquées (Messages, Calendrier, Contacts).
- Permissions Siri activées pour ces applis (vérifier dans Réglages).
- Moyen de capturer écran+audio et, si possible, d'extraire des logs console.

Artefacts minimaux par test échoué :
- Vidéo écran+audio courte (30–90 s).
- Transcrit (reconnaissance vocale) ou reproduction écrite.
- Ligne de décision horodatée (CSV/JSON ou tableau).

Source du signal original : https://news.ycombinator.com/item?id=49869237

## Installation et implementation pas a pas

Suivez ces étapes numérotées. Chaque étape indique le temps estimé et l'artefact produit.

1. Préparez la matrice de tests (10 minutes)
   - Choisissez trois tests correspondant au rapport : T1_recent_sms, T2_calendar_range, T3_send_message_clarify. Source : https://news.ycombinator.com/item?id=49869237
   - Nombre d'exécutions : signal rapide = 3 runs ; confiance modérée = 20 runs.
   - Artefacts par run : screen.mov, transcript.txt, console.log (si possible).

2. Configurez l'appareil (5–10 minutes)
   - Assurez-vous que Messages et Calendrier contiennent des entrées récentes. Pour T1, envoyez un SMS récent contenant une phrase de localisation, ex. « Je suis à la porte B du terminal 2 ».
   - Vérifiez les permissions Siri dans Réglages.

3. Démarrez la capture (1–2 minutes par run)
   - Lancez l'enregistrement écran+audio et notez l'UUID/horodatage UTC dans le nom de fichier.
   - Exemple de commande macOS pour capturer via ffmpeg (ajustez selon écran/appareil) :

```bash
# Exemple : démarrer une capture écran avec ffmpeg (ajuster input et durée)
ffmpeg -f avfoundation -i '1:0' -r 30 -t 00:01:30 ~/Desktop/siri_run_$(date +%s).mp4
```

   - Nom d'artefact attendu : siri_run_<epoch>.mp4 (30–90 s).

4. Exécutez l'énoncé (10–30 secondes par run)
   - Prononcez exactement la phrase du rapport, par ex. : « Donne‑moi la position de mon chauffeur » immédiatement après l'envoi du SMS.
   - Pour le calendrier : « Prends un rendez‑vous lundi de 12h à 16h et appelle‑le Livraison de meubles. » Observez l'heure de début/fin créée.
   - Pour l'envoi de message : « Envoie à Jane : je suis en route. » Notez si Siri redemande le texte.

5. Arrêtez la capture et récupérez les logs (2–5 minutes)
   - Sauvegardez l'enregistrement UI. Copiez les logs console disponibles. Sauvegardez ou transcrivez l'audio.
   - Étiquetez chaque artefact avec test_id, modèle d'appareil, build OS et horodatage.

```json
{
  "test_id": "T1_recent_sms",
  "device": "iPhone-Model-Example",
  "os_build": "iOS-XX.YY",
  "artifacts": ["screen.mov","console.log","transcript.txt"],
  "expected": "most recent SMS used",
  "runs_planned": 3
}
```

6. Résumez et décidez (5–15 minutes)
   - Rédigez une ligne de décision par run : testID, énoncé, attendu, observé, couche probable.
   - Si les 3 runs rapides échouent de la même manière, passez à 20 runs et rassemblez plus de preuves.

7. Optionnel : comparer saisie tapée vs vocale (10–30 minutes)
   - Répétez les mêmes énoncés en les tapant dans l'UI de l'assistant. Cela isole les erreurs ASR (reconnaissance vocale automatique) des erreurs de routage d'intention. Si le texte tapé réussit mais la voix échoue, le problème est probablement dans la couche voix/ASR.

Source et exemples : https://news.ycombinator.com/item?id=49869237

## Problemes frequents et correctifs rapides

Échecs rapportés : SMS ancien sélectionné (5 jours), événement calendrier mal créé, assistant qui redemande le texte. Source : https://news.ycombinator.com/item?id=49869237

Vérifications rapides et corrections simples :
- Vérifier l'interface Messages : confirmez que le SMS le plus récent est visible et horodaté dans les 5 dernières minutes.
- Re‑tester en forçant la récence : ajouter « le plus récent » ou « dernier message » et comparer.
- Tester en saisie tapée : si la saisie tapée passe et la voix échoue, investiguer côté ASR (latence ou troncation). Cible de latence ASR pour décisions locales : < 300 ms.
- Vérifier fuseau horaire et durée par défaut du Calendrier : s'assurer que l'événement créé correspond aux heures demandées et qu'il n'y a pas de décalage implicite.

Si les artefacts sont insuffisants :
- Augmenter à 20 runs pour confiance statistique.
- Collecter les logs Console et noter les timestamps à ±50 ms si possible.

Source : https://news.ycombinator.com/item?id=49869237

## Premier cas d'usage pour une petite equipe

Public cible : fondateurs solo ou équipes de 1–3 personnes (ingénierie/produit) qui veulent une décision rapide (corriger ou escalader) avec peu de frais. Source : https://news.ycombinator.com/item?id=49869237

Étapes actionnables :
1. Reproduire et capturer une fois (10–20 minutes) : exécuter l'énoncé exact, enregistrer une vidéo de 30–90 s, sauvegarder un transcrit. Souvent un seul artefact suffit pour catégoriser le problème.
2. Échantillon 3x (30–60 minutes) : réaliser trois runs par test (T1..T3). Si les trois échouent de la même façon, escalader à 20 runs ou ouvrir un ticket fournisseur. Notez modèle d'appareil et build OS pour chaque run.
3. Tester saisie tapée (5–10 minutes) : isoler la couche voix. Si tapé fonctionne, traiter comme problème ASR/voix.
4. Minimiser exposition privée : rédiger les corps de message ; joindre la vidéo UI + timestamps. Obtenir consentement avant de partager du contenu personnel.
5. Checklist d'escalade minimale : trois vidéos + un log console + une ligne de décision par test avant de déposer un ticket. Définir condition d'acceptation initiale (ex. 95 % sur 20 runs).

Astuce budget : utiliser enregistrement local et stockage cloud gratuit (1–5 GB). Faire d'abord le test 3‑run avant d'investir dans des outils payants.

Source : https://news.ycombinator.com/item?id=49869237

## Notes techniques (optionnel)

- Concentrez les tests sur les trois défaillances concrètes rapportées : mauvaise sélection du SMS (5 jours), mauvaise gestion des plages horaires du calendrier, et clarification redondante après texte explicite. Source : https://news.ycombinator.com/item?id=49869237
- Si vous avez accès développeur : collectez logs de routage d'intention, horodatages et IDs d'appel d'API. Corrélez l'outil choisi par l'assistant avec l'horodatage UI à ±100 ms quand possible.
- Standardisation recommandée : 6 tests de base, 3 runs pour signal rapide, 20 runs pour confiance, seuil d'acceptation 95 %. Déploiement progressif (canary) : 5 % → 25 % → 100 % pour correctifs en production.

Source : https://news.ycombinator.com/item?id=49869237

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse : les échecs rapportés relèvent principalement du routage d'outils ou de la sélection par récence plutôt que d'erreurs purement ASR ; l'exemple « message de 5 jours » motive un focus sur la récence. Source : https://news.ycombinator.com/item?id=49869237
- Hypothèse de plan de test : exécuter une suite de 6 tests (T1..T6), chacun avec 3 runs rapides et une suite optionnelle de 20 runs pour confiance statistique.
- Hypothèse de seuil : fixer 95 % de succès sur 20 runs comme condition d'acceptation pour fermer une correction fournisseur/interne.

### Risques / mitigations

- Risque : contraintes de confidentialité empêchent le partage des corps de messages. Mitigation : partager vidéo UI + timestamps et rédiger (rédiger = remplacer ou masquer) le contenu ; demander consentement pour partager les données brutes.
- Risque : instabilité liée au réseau ou à l'ASR. Mitigation : augmenter l'échantillon à 20+ runs et comparer saisie tapée vs vocale.
- Risque : mauvaise attribution (penser que c'est un bug fournisseur alors que c'est une intégration locale). Mitigation : vérifier permissions d'app, tester en citant explicitement l'application dans l'énoncé et collecter logs de routage.

### Prochaines etapes

Court terme (0–48 h) : exécuter les trois tests principaux (T1..T3) avec 3 runs chacun, capturer au moins une vidéo par symptôme et remplir la ligne de décision.

Moyen terme (48–168 h) : si les échecs persistent après vérifications (permissions, saisie tapée), préparer un ticket fournisseur avec : trois vidéos, transcrits et logs. Indiquer clairement les critères d'acceptation (95 % sur 20 runs). Si le problème est interne, ajouter tests unitaires et d'intégration, et planifier un déploiement canari (5 % → 25 % → 100 %) avec SLO et rollback.

Checklist d'escalade avant dépôt :
- [ ] Reproduit au moins une fois sur un appareil.
- [ ] Capturé une courte vidéo écran+audio de la séquence qui échoue.
- [ ] Collecté les logs Console disponibles et noté les horodatages.
- [ ] Rempli une ligne de décision (testID, énoncé, attendu, observé, couche probable).

Tableau de décision exemple (à joindre au ticket) :

| testID | énoncé | attendu | observé | couche probable | lien_artefact |
|---|---:|---|---|---|---|
| T1 | « Donne‑moi la position de mon chauffeur » | utiliser le SMS le plus récent | SMS plus ancien (5 jours) | routage outil / récence | lien/vers/artefact.mov |

Référence utile (report utilisateur original) : https://news.ycombinator.com/item?id=49869237
