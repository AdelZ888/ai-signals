---
title: "ASTRO — assistant vocal hors ligne et auto‑améliorant pour Raspberry Pi"
date: "2026-10-09"
excerpt: "Guide pour exécuter ASTRO en local sur un Raspberry Pi : détection par mot‑clé, STT/TTS sur l'appareil, support optionnel NPU Hailo et entraînement LoRA pour assistants vocaux privés et hors ligne."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-10-09-astro-an-offline-self-improving-voice-assistant-for-raspberry-pi-5.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 360
editorialTemplate: "TUTORIAL"
tags:
  - "ASTRO"
  - "Raspberry Pi"
  - "offline"
  - "STT"
  - "TTS"
  - "LoRA"
  - "Hailo"
  - "self-hosted"
sources:
  - "https://github.com/mobium-app/ai_astro_public"
---

## TL;DR en langage simple

- Ce que c'est : ASTRO est un agent vocal auto‑hébergeable, "offline‑first" (priorité au fonctionnement hors ligne). Le dépôt public est : https://github.com/mobium-app/ai_astro_public (source). Le projet indique support pour Raspberry Pi + Hailo NPU (unité de traitement neural), détection par mot‑clé (wake word), STT (speech‑to‑text, reconnaissance vocale), TTS (text‑to‑speech, synthèse vocale), vision et entraînement LoRA (Low‑Rank Adaptation) pour l'adaptation des modèles.
- Pourquoi l'essayer : garder l'audio local améliore la confidentialité. Réduire la dépendance aux API cloud peut aussi réduire les coûts et la latence réseau. Voir le dépôt : https://github.com/mobium-app/ai_astro_public.
- Actions immédiates : cloner le dépôt, vérifier le micro et le haut‑parleur, lancer l'exemple simple wake → STT → TTS fourni, tester d'abord sur un "appareil canari" (1 dispositif de test).

Exemple concret rapide : sur un Raspberry Pi, vous installez ASTRO, branchez un micro et un haut‑parleur, lancez l'exemple fourni et dites le mot‑clé. Le système doit détecter le mot, transcrire la commande (STT) et répondre par voix (TTS), le tout localement.

Note simple avant les détails avancés : ASTRO combine plusieurs blocs (wake word, STT, TTS, éventuellement vision et adaptation de modèles). Si vous débutez, testez d'abord la chaîne la plus courte : wake → STT → TTS, puis ajoutez le reste.

## Ce que vous allez construire et pourquoi c'est utile

Plain‑language : vous allez monter un petit système embarqué qui écoute un mot‑clé, enregistre localement, convertit la voix en texte, et peut répondre par voix. Vous pouvez aussi collecter des images et des enregistrements pour améliorer le modèle localement (LoRA). Le dépôt principal du projet est ici : https://github.com/mobium-app/ai_astro_public.

Ce que cela apporte :
- Confidentialité : l'audio peut rester sur l'appareil.
- Résilience : l'agent continue de fonctionner si la connexion Internet coupe.
- Latence moindre : traitement local évite les allers‑retours cloud.

Comparaison synthétique (qualitative) :

| Option | Latence | Confidentialité | Complexité d'installation |
|---|---:|---|---:|
| Cloud (API commerciale) | dépend du réseau | faible (audio envoyé) | faible à moyenne |
| ASTRO offline (Pi) | local | élevée (audio local) | moyenne |
| ASTRO + NPU (Hailo) | améliorée | élevée | plus élevée (drivers) |

Avant d'aller plus loin, gardez en tête : testez chaque bloc séparément (wake / STT / TTS) pour isoler les problèmes.

## Avant de commencer (temps, cout, prerequis)

Informations pratiques tirées du dépôt : https://github.com/mobium-app/ai_astro_public

Matériel et compétences :
- Appareil recommandé : Raspberry Pi ou équivalent. Le projet mentionne compatibilité avec Hailo NPU pour accélération.
- Périphériques : microphone et haut‑parleur compatibles ALSA (Advanced Linux Sound Architecture).
- Compétences minimales : Linux/SSH, Git, Python.

Temps et coûts (estimations à valider) :
- Temps prototype : 4–8 heures (estimation pratique).
- MicroSD : 32–128 GB recommandé.
- Coût matériel indicatif : 70–200 USD pour l'appareil de base ; NPU +100–200 USD (valeurs indicatives).

Checklist initiale :
- [ ] Cloner le dépôt : https://github.com/mobium-app/ai_astro_public
- [ ] Préparer microSD, alimentation, réseau
- [ ] Vérifier microphone + haut‑parleur via ALSA
- [ ] Créer un environnement Python et installer dépendances

Le dépôt contient scripts et exemples pour démarrer. Une connexion Internet est nécessaire pour cloner et télécharger des dépendances ; après cela, le système peut fonctionner hors ligne.

## Installation et implementation pas a pas

Toutes les étapes ci‑dessous se basent sur les fichiers et exemples fournis dans le dépôt : https://github.com/mobium-app/ai_astro_public.

1) Cloner le dépôt et l'inspecter :

```bash
git clone https://github.com/mobium-app/ai_astro_public.git
cd ai_astro_public
ls -la
```

2) Mettre à jour le système et installer paquets requis (exemple Debian/Ubuntu/Raspbian) :

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-venv python3-pip alsa-utils -y
```

3) Vérifier les périphériques audio (ALSA) :

```bash
arecord -l   # lister devices d'enregistrement
aplay -l     # lister devices de lecture
```

4) Créer et activer un environnement Python, puis installer dépendances du repo :

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

5) Exemple de fichier de configuration (adaptez selon vos dispositifs). Le dépôt contient ses propres fichiers de config et exemples : https://github.com/mobium-app/ai_astro_public.

```yaml
# config.yaml (exemple)
microphone_device: hw:1,0
sample_rate: 16000
wakeword_model: models/wake.tflite
stt_model: models/stt_quant.tflite
tts_model: models/tts.tflite
npu_enabled: false
lora_enabled: true
```

6) Lancer un listener de démonstration (script exemple du dépôt) :

```bash
python tools/wake_listener.py --config config.yaml
```

Explication simple avant détails avancés : commencez par valider que votre micro et votre sortie audio fonctionnent. Ensuite, lancez l'exemple de wake listener. Si cela fonctionne, vous pouvez activer STT puis TTS. L'ajout du NPU et de l'adaptation LoRA vient en dernier.

## Problemes frequents et correctifs rapides

Remarques générales basées sur les exigences typiques d'un projet embarqué et sur les fonctionnalités annoncées dans : https://github.com/mobium-app/ai_astro_public.

- Périphérique audio introuvable
  - Ajoutez l'utilisateur au groupe audio et redémarrez :

```bash
sudo usermod -aG audio $USER
reboot
```

- Trop de faux réveils
  - Réduisez le gain du micro, ajustez le seuil du wakeword dans la config, ou remplacez le modèle wakeword fourni.

- Driver NPU instable
  - Testez d'abord le pilote sur un canari. Conservez un chemin de secours CPU/quantifié (npu_enabled: false) et basculez si nécessaire.

- Espace disque consommé par enregistrements
  - Implémentez rotation/purge automatique et suppression quand l'espace critique est atteint.

Mesures à surveiller : nombre d'interactions, latence par étape (wake, STT, TTS), taux de faux réveils, utilisation CPU et disque. Le dépôt contient outils et exemples pour démarrer : https://github.com/mobium-app/ai_astro_public.

## Premier cas d'usage pour une petite equipe

Scénario ciblé : fondateur solo ou petite équipe (1–3 personnes) qui veut prototyper un kiosque vocal local. Référence : https://github.com/mobium-app/ai_astro_public.

Étapes concrètes pour un prototype rapide :
1) Appareil canari
  - Installez tout sur un seul appareil. Branchez micro et haut‑parleur. Lancer l'exemple end‑to‑end. Validez la boucle wake → STT → TTS avant d'ajouter d'autres fonctions.

2) Collecte d'exemples et adaptation LoRA
  - Capturez lots d'exemples audio annotés (20–100 pour commencer). Vérifiez chaque transcription avant adaptation. N'automatisez pas l'entraînement LoRA sans revue humaine.

3) Déploiement progressif
  - Déployez par vagues : canari → petit groupe → parc complet. Mesurez latence, taux de faux réveils et qualité de la transcription entre chaque vague.

4) Automations pratiques pour une petite équipe
  - Scripts pour snapshots des poids, rollback simple, purge automatique des enregistrements. Alerts par e‑mail ou webhook si seuil critique atteint (ex. disque plein).

5) Répartition minimale des rôles pour 2 personnes
  - Une personne matériel/tests, l'autre intégration logicielle/tests et déploiement modèles. Le dépôt offre exemples pour accélérer.

Référence principale : https://github.com/mobium-app/ai_astro_public

## Notes techniques (optionnel)

Rappels techniques et structure recommandée (inspirés par le repo) : https://github.com/mobium-app/ai_astro_public

- Les modèles STT/TTS et le wakeword peuvent être fournis en formats quantifiés pour accélérer l'inférence sur CPU.
- Si vous utilisez un NPU (Hailo), prévoyez des tests de drivers et un fallback CPU.

Disposition simple recommandée pour les modèles :

```text
/models/
  base-stt.bin
  base-tts.bin
  adapters/
    lora-2026-10-01-001.zip
```

Bonnes pratiques : conserver un historique des snapshots, tester les mises à jour sur un échantillon A/B avant déploiement large.

## Que faire ensuite (checklist production)

- [ ] Automatiser snapshot des poids avant toute mise à jour
- [ ] Mettre en place monitoring local (uptime, latences, taux d'erreurs, utilisation CPU/disk)
- [ ] Déployer par vagues avec critères d'arrêt et rollback
- [ ] Activer purge automatique des enregistrements et définir politique de rétention

Référence principale : https://github.com/mobium-app/ai_astro_public

### Hypotheses / inconnues

- Le dépôt https://github.com/mobium-app/ai_astro_public décrit ASTRO comme offline‑first et mentionne Raspberry Pi + Hailo NPU, wake word, STT/TTS, vision et LoRA self‑training (source). Ces fonctionnalités sont le socle réel documenté.
- Estimations opérationnelles proposées comme recommandations (à valider sur votre matériel) :
  - Temps prototype : 4–8 heures (estimation pratique).
  - Taille microSD recommandée : 32–128 GB.
  - Coût matériel indicatif : 70–200 USD pour l'appareil de base, +100–200 USD pour un NPU (valeurs indicatives).
  - Échantillonnage audio recommandé : 16 kHz (recommandation courante pour voix).
  - Latence cible indicative : <300 ms pour boucle locale, <150 ms possible avec NPU.
  - Faux réveils acceptables visés : <5 % avant mise en production large.
  - Nombre d'exemples validés avant automatisation de LoRA : 100 interactions validées minimum.
  - Stratégie de déploiement recommandée : canari (1 appareil) ou 5 % du parc pour la première vague.

### Risques / mitigations

- Risque : adaptation LoRA dégrade la qualité.
  - Mitigation : exiger ≥100 exemples validés et mesurer WER (word error rate) avant/après ; rollback si dégradation >2 %.
- Risque : drivers NPU instables.
  - Mitigation : tester sur canari et maintenir fallback CPU/quantifié.
- Risque : saturation disque.
  - Mitigation : purge automatique et offload externe si disque >80 %.

### Prochaines etapes

- Valider sur 1 appareil (canari) : exécuter la boucle et collecter 20–100 interactions pour première évaluation.
- Mettre en place snapshots automatiques et scripts de rollback rapides.
- Définir seuils d'alerte (ex. latence >500 ms, CPU >85 %, disque >80 %) et configurer monitoring léger.

Référence principale : https://github.com/mobium-app/ai_astro_public
