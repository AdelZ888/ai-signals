---
title: "Prototyper un gadget agent Android minimal inspiré par Project Solara"
date: "2026-06-04"
excerpt: "Guide pour prototyper un gadget agent Android minimal : réveil par caméra ou biométrie, authentification sur l’appareil et routage des requêtes vers un modèle local ou un LLM cloud — inspiré par la couverture de Project Solara de The Verge."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-04-prototype-a-minimal-android-agent-gadget-inspired-by-microsofts-project-solara.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "IA"
  - "Android"
  - "prototype"
  - "edge-ai"
  - "Project Solara"
  - "développement"
sources:
  - "https://www.theverge.com/news/941830/microsoft-project-solara-os-ai-agent-gadgets"
---

## TL;DR en langage simple

- Microsoft a montré Project Solara : un concept d’OS pour « gadgets agent ». Il y a eu deux démonstrations (un bureau et un badge). Source : https://www.theverge.com/news/941830/microsoft-project-solara-os-ai-agent-gadgets
- Objectif du guide : construire un prototype Android simple qui se réveille quand on s’approche, demande une authentification locale, puis choisit entre un modèle embarqué ou un modèle cloud. Source : https://www.theverge.com/news/941830/microsoft-project-solara-os-ai-agent-gadgets
- Trois étapes principales : détecter, authentifier, répondre. Gardez le prototype minimal pour contrôler la batterie et le coût.
- Méthode courte : MVP → canary → pilote. Mesurez et décidez après 1–3 itérations.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez créer un prototype Android qui simule un « gadget agent » — pas un nouvel OS complet. Le but est de valider l’expérience utilisateur, les contraintes matérielles et les coûts avant d’investir. Source : https://www.theverge.com/news/941830/microsoft-project-solara-os-ai-agent-gadgets

Composants clefs du prototype :
- réveil sur détection (caméra ou capteur),
- authentification biométrique locale (Android Keystore),
- routage simple : modèle local pour réponses courtes, cloud pour recherches longues.

Pourquoi c’est utile : tester le flux consentement → authentification → réponse. Obtenir des mesures réelles sur latence et consommation. Produire un démonstrateur pour retours et partenariats. Source : https://www.theverge.com/news/941830/microsoft-project-solara-os-ai-agent-gadgets

## Avant de commencer (temps, cout, prerequis)

Prérequis minimaux :
- 1 appareil Android avec caméra et mode développeur activé. Source : https://www.theverge.com/news/941830/microsoft-project-solara-os-ai-agent-gadgets
- Poste de développement (Android Studio, adb).
- Clé API pour un LLM cloud OU un modèle local quantifié disponible.

Checklist minimale :
- [ ] Appareil Android (ou board dev) avec caméra
- [ ] Ordinateur avec Android Studio et adb
- [ ] Clé API LLM cloud OU fichier modèle local

Estimation de temps (à valider en pilote) : viser un MVP en 1–3 jours pour une petite équipe. Préparer un canary device 24–48 h pour observer le comportement réel. Source : https://www.theverge.com/news/941830/microsoft-project-solara-os-ai-agent-gadgets

## Installation et implementation pas a pas

Rappel : démarrez par un MVP qui affiche une seule information (par ex. la prochaine réunion). Ajoutez ensuite le routage local/cloud et l’observabilité.

1) Préparez l’appareil
- Activez le mode développeur et le débogage USB.
- Réservez un appareil « canary » 24–48 h au démarrage pour collecter métriques.

2) Installer l’APK et lire les logs

```bash
adb devices
adb install -r app-debug.apk
adb logcat -s AgentGadget:V
```

3) Réveil et authentification (principe)
- Détection : lancez un classificateur léger sur le flux caméra. Visez une décision initiale rapide pour réduire les faux positifs.
- Authentification : utilisez Android BiometricPrompt et stockez les clés dans Android Keystore. Ne jamais envoyer les templates bruts hors de l’appareil.
- Session : fermer la session après un timeout court.

4) Routage modèle (exemple de config)

```yaml
agent:
  inference_mode: local  # options: local | cloud
  cloud_api: "https://api.example-llm.com/v1/generate"
  local_model:
    path: /data/local-model/q4_2048.bin
    max_tokens: 512
  soft_timeout_ms: 1500
  cache_ttl_s: 86400
```

Règle simple : préférer le local pour requêtes courtes et fréquentes. Basculer vers le cloud pour contexte long ou informations externes. Source : https://www.theverge.com/news/941830/microsoft-project-solara-os-ai-agent-gadgets

Instrumentation recommandée : loggez latence wake (P50/P95), taux d’authentification, consommation CPU et batterie, coût cloud par interaction.

## Problemes frequents et correctifs rapides

Permission caméra refusée
- Correctif : afficher un message simple expliquant l’usage. Proposer un fallback (authentification manuelle) si l’utilisateur refuse.

Latence cloud / coût élevé
- Correctif : réduire la taille des payloads, activer cache pour intents fréquents, définir un timeout doux (soft timeout) pour éviter dépassements.

Biométrie : faux rejets / acceptations
- Correctif : prévoir un chemin de secours (PIN), ajuster seuils et collecter (avec consentement) exemples pour améliorer le modèle.

Batterie / CPU
- Correctif : profiler l’app, augmenter l’intervalle d’échantillonnage caméra (ex. passer de 200 ms à 1000 ms), limiter threads d’inférence.

Indicateurs à suivre : latence wake (P50/P95), taux réussite biométrie, % CPU, consommation batterie par heure, coût journalier. Source : https://www.theverge.com/news/941830/microsoft-project-solara-os-ai-agent-gadgets

## Premier cas d'usage pour une petite equipe

Exemple concret : assistant de bureau partagé (prototype)

Scénario : quand une personne s’approche, le gadget s’allume, demande une authentification rapide, puis affiche la prochaine réunion.
Source : https://www.theverge.com/news/941830/microsoft-project-solara-os-ai-agent-gadgets

Sprint recommandé pour 1–3 personnes : MVP minimal, canary, itération.

Actions concrètes pour fondateurs solo / petites équipes (au moins 3 points actionnables) :
1) Prioriser un MVP de 1 écran et 1 intent. Livrable en 1–3 jours. Limitez les variables pour contrôler coûts et complexité.
2) Mettre en place un plafond cloud quotidien (ex. $5/jour) et un feature flag pour basculer local/cloud rapidement.
3) Automatiser l’installation et le rollback : scripts adb + backup image. Test de restauration en <30 min.
4) Recruter 3 testeurs internes et déployer sur 1 appareil canary pendant 24–48 h avant tout pilote externe.
5) Instrumenter dès le départ : logs pour P50/P95, taux d’auth, erreurs. Configurer alertes si taux d’erreur >5%.

Checklist pilote :
- [ ] Enrôler 3 utilisateurs de test
- [ ] Déployer sur 1 appareil canary (24–48 h)
- [ ] Activer logs : tentatives d’auth, latences (P50/P95), coût cloud

Source : https://www.theverge.com/news/941830/microsoft-project-solara-os-ai-agent-gadgets

## Notes techniques (optionnel)

Contexte : The Verge décrit Project Solara comme un OS pour « agent gadgets ». Nous utilisons Android comme plateforme pragmatique pour prototyper. Source : https://www.theverge.com/news/941830/microsoft-project-solara-os-ai-agent-gadgets

Exemple minimal de manifeste (permissions & cibles SDK) :

```json
{
  "uses-permission": [
    "android.permission.CAMERA",
    "android.permission.RECORD_AUDIO",
    "android.permission.USE_BIOMETRIC"
  ],
  "minSdkVersion": 30,
  "targetSdkVersion": 33
}
```

Méthodologie courte : les éléments explicitement décrits par la source sont cités ; les chiffres opérationnels sont listés en hypothèses à valider dans la section finale.

Source : https://www.theverge.com/news/941830/microsoft-project-solara-os-ai-agent-gadgets

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

Les points suivants sont des hypothèses opérationnelles à valider pendant le pilote :

| Critère | Hypothèse basse | Hypothèse haute |
|---|---:|---:|
| Latence locale (P50) | 50 ms | 500 ms |
| Latence cloud (P95) | 300 ms | 1 500 ms |
| Cache TTL | 3 600 s | 86 400 s |
| Soft timeout | 500 ms | 1 500 ms |
| Max context tokens local | 512 tokens | 2 048 tokens |
| Coût par interaction | $0.00 | $0.10 |
| Budget pilote | $5 / jour | $50 / jour |
| Taux d’authentification visé | 90% | 99% |

Notes : ces nombres servent de seuils pour les tests. Validez-les avec mesures réelles.

Source : https://www.theverge.com/news/941830/microsoft-project-solara-os-ai-agent-gadgets

### Risques / mitigations

- Vie privée : fuite PII ou biométrie. Mitigation : garder templates dans Android Keystore, chiffrer logs, consentement explicite.
- Coût cloud : dépassement budgétaire. Mitigation : plafonner dépenses, activer cache, soft timeout 1 500 ms.
- Batterie / CPU : drain élevé. Mitigation : limiter threads, augmenter intervalle d’échantillonnage, viser <70% CPU soutenu.
- Conformité : règles locales sur biométrie. Mitigation : revue juridique avant déploiement large.

Source : https://www.theverge.com/news/941830/microsoft-project-solara-os-ai-agent-gadgets

### Prochaines etapes

- Durcir la chaîne : OTA sécurisée, images signées, chiffrement des secrets.
- Observabilité : dashboards pour taux d’auth, latences wake (P50/P95), taux erreur cloud, coût par interaction.
- Déploiement progressif : canary 1 appareil (24–48 h) → petit pilote 5–10 utilisateurs (~1 semaine) → montée à 50+ si métriques OK.

Checklist production :
- [ ] Validation privacy & compliance
- [ ] Dashboards de monitoring en place
- [ ] Playbook de rollback documenté
- [ ] Feature flags pour basculer local/cloud

Source principale — couverture Project Solara : https://www.theverge.com/news/941830/microsoft-project-solara-os-ai-agent-gadgets
