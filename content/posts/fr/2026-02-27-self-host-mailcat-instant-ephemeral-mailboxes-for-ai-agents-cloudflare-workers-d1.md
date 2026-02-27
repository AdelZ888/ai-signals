---
title: "Auto‑héberger MailCat : boîtes mail éphémères instantanées pour agents IA (MailCat self‑host)"
date: "2026-02-27"
excerpt: "Déployez MailCat : une API open‑source qui donne à un agent IA une boîte mail éphémère instantanée, extrait automatiquement les codes de vérification et conserve les messages temporairement — installation en quelques minutes. Voir le dépôt : https://github.com/apidog/mailcat"
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-02-27-self-host-mailcat-instant-ephemeral-mailboxes-for-ai-agents-cloudflare-workers-d1.jpg"
region: "US"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 20
editorialTemplate: "TUTORIAL"
tags:
  - "mail"
  - "mailbox"
  - "AI"
  - "test-automation"
  - "CI"
  - "mailcat"
  - "open-source"
sources:
  - "https://github.com/apidog/mailcat"
---

## TL;DR en langage simple

MailCat donne à un agent d'intelligence artificielle (IA) sa propre adresse e‑mail : « Give your AI agent (e.g., OpenClaw) its own email address. Instant mailbox creation, receive emails, no signup required. » (https://github.com/apidog/mailcat). 

Points essentiels, très courts :

- Création instantanée de boîtes e‑mail et réception de messages sans inscription utilisateur (https://github.com/apidog/mailcat).
- Usage principal : automatiser des flux qui nécessitent une boîte mail éphémère (tests, agents IA, debug).
- Exemple d'usage rapide : créer une boîte, déclencher l'envoi d'un mail de confirmation, lire le code et valider une inscription sans action manuelle.

Petite checklist initiale :

- [ ] Cloner le dépôt et lire le README : https://github.com/apidog/mailcat
- [ ] Lancer un essai local (est. 10–30 minutes)
- [ ] Envoyer et récupérer un e‑mail pour valider le flux

Méthode (brève) : ce guide reprend la description publique du dépôt et propose des recommandations ; validez les commandes exactes dans le README du dépôt (https://github.com/apidog/mailcat).

## Ce que vous allez construire et pourquoi c'est utile

Objectif : obtenir une API/instance MailCat capable de créer des boîtes éphémères et de recevoir des e‑mails, utilisable pour des tests automatisés ou comme point d'entrée pour un agent IA (https://github.com/apidog/mailcat).

Pourquoi utile :

- Automatisation des vérifications par e‑mail dans CI/CD (suppression des étapes manuelles).
- Boîtes temporaires pour debug local ou runs automatisés (sandbox d'adresses).
- Permettre à un agent IA de surveiller une boîte sans créer d'utilisateurs réels.

Indicateurs opérationnels (exemples à valider en test) : taux de succès cible ≥95%, fenêtre de canary 24 h, part de trafic en canary 5% (https://github.com/apidog/mailcat).

## Avant de commencer (temps, cout, prerequis)

Lien principal : https://github.com/apidog/mailcat

Tableau comparatif rapide — choix d'environnement

| Environnement | Temps estimé | Coût estimé | Notes pratiques |
|---|---:|---:|---|
| Local (dev) | 10–30 minutes | $0 | Idéal pour debug, 1–5 boîtes de test |
| CI léger | 1–2 heures | $0–$20/mo | Automatisation create->read->assert, viser <30 s par run |
| Tests de charge | 2–6 heures | variable | Testez 50–500 créations pour valider montée en charge |

Prérequis minimaux :

- Accès au dépôt et au README : https://github.com/apidog/mailcat
- Machine locale, VM ou container pour exécuter le service
- Stockage sécurisé des secrets (CI secrets, Vault)
- Politique de rétention des messages (ex. 1 h–24 h)

Checklist pré‑déploiement :

- [ ] Cloner https://github.com/apidog/mailcat
- [ ] Lire README et quickstart
- [ ] Préparer stockage sécurisé des tokens
- [ ] Définir TTL/retention (1 h–24 h)

## Installation et implementation pas a pas

Suivez le quickstart du dépôt : https://github.com/apidog/mailcat

Étapes essentielles :

1) Récupérer le code et lire le README.
2) Préparer l'environnement (container/VM/local).
3) Démarrer une instance et créer une boîte de test.
4) Envoyer un e‑mail et vérifier la réception.
5) Écrire un script create -> trigger -> read -> assert pour CI.

Exemples de commandes (modèles — valider contre le README) :

```bash
# cloner et lancer (exemple modèle)
git clone https://github.com/apidog/mailcat.git
cd mailcat
# suivre le quickstart dans README.md
```

Exemple de configuration d'intégration (modèle) :

```json
{
  "API_TOKEN": "REPLACE_WITH_SECRET_TOKEN",
  "HOST": "https://your-host.example.com",
  "WEBHOOK_URL": "https://your-ci.example.com/mailhook"
}
```

Bonnes pratiques d'implémentation :

- Démarrer en canary (5% du trafic, fenêtre 24 h) avant un basculement complet.
- Instrumenter métriques basiques : mailbox_create_count, mail_inbound_count, extraction_failure_rate.
- Retries avec backoff exponentiel : 5 essais (100 ms -> 1600 ms) recommandé.

## Problemes frequents et correctifs rapides

Source de référence : https://github.com/apidog/mailcat

Problèmes courants et actions immédiates :

- Échec d'authentification à la création de boîte : vérifier le token et l'endpoint.
- Aucun mail entrant visible : vérifier les logs, l'adresse expéditrice, et que le webhook renvoie HTTP 200 dans un délai raisonnable (ex. <500 ms recommandé).
- Extraction du code/token échoue : inspecter le message brut et élargir la regex pour accepter 4–8 chiffres ou tokens alphanumériques 8–64 caractères.
- Erreurs 5xx sous charge : ajouter des retries/backoff, limiter le débit, augmenter ressources.

Seuils opérationnels (exemples de règles d'alerte) :

- Smoke tests : 10–50 inscriptions
- Gate de succès : ≥95% vérifications réussies
- Alerte extraction : >2% d'échecs
- Timeout webhook recommandé : 500 ms
- Retries max : 5 (100 ms, 200 ms, 400 ms, 800 ms, 1600 ms)

## Premier cas d'usage pour une petite equipe

Public : fondateur solo ou équipe 1–3 personnes. Référence : https://github.com/apidog/mailcat

Plan en 3 étapes :

1) Lancer localement/VM : cloner https://github.com/apidog/mailcat et démarrer une instance; créer 1 boîte de test.
2) Écrire un script create -> trigger -> read -> assert. Viser un run de débogage court (objectif <30 s) pour itérations rapides.
3) Automatiser rotation et nettoyage : suppression automatique après 1 h–24 h selon votre politique.

Checklist CI pour petite équipe :

- [ ] Générer token et le stocker dans les secrets CI
- [ ] Ajouter script create->trigger->read->assert (objectif <30 s)
- [ ] Automatiser rotation quotidienne/24 h des tokens si nécessaire

Conseil coût : commencer avec un budget modeste (< $20/mo) pour staging léger et 1–5 boîtes de test.

## Notes techniques (optionnel)

Voir le dépôt pour la description publique et le code : https://github.com/apidog/mailcat

Recommandations techniques succinctes :

- Tests unitaires rapides (idéalement chaque test <1 s) couvrant formats de message réels.
- Regex d'extraction : prévoir 4–8 chiffres et tokens 8–64 caractères.
- Métriques à instrumenter : mailbox_create_count, mail_inbound_count, extraction_failure_rate.
- Backoff conseillé : 5 essais (100 ms -> 1600 ms).
- Cible UX : latences visibles < quelques secondes lorsque possible, mais validez en conditions réelles.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Confirmé par le dépôt public : MailCat offre création instantanée de boîtes et réception d'e‑mails sans signup (https://github.com/apidog/mailcat).
- Inconnues à valider dans le README / code source : noms d'endpoints exacts, commandes d'installation précises, TTL par défaut des messages (1 h vs 24 h), format exact des tokens, backend de stockage recommandé.
- Estimations/paramètres proposés dans ce guide (à confirmer) : 10–30 minutes pour un test local, 1–2 heures pour une intégration CI légère, canary 24 h à 5% du trafic, seuil de succès ≥95%, retries max 5 (100 ms -> 1600 ms), tests de charge 50–500 créations.

### Risques / mitigations

- Fuite de token : stocker les secrets dans un vault, tourner les tokens régulièrement, révoquer tokens compromis.
- Exposition de données personnelles (PII) : limiter la rétention (1 h–24 h) et anonymiser les données de test.
- Disponibilité sous charge : effectuer des tests de charge (50–500 créations), ajouter retries/backoff et alertes si 5xx >1%.
- Conformité (GDPR/CCPA) : effectuer revue légale avant traitement de données réelles.

### Prochaines etapes

- [ ] Lire et valider le README et le code source sur https://github.com/apidog/mailcat ; confirmer endpoints, TTL et comportements par défaut.
- [ ] Choisir hébergement et préparer un canary : acheminer 5% des builds CI (1/20 runs) pendant 24 h.
- [ ] Mettre en place stockage sécurisé des secrets et rotation (ex. quotidienne si requis).
- [ ] Instrumenter métriques clés et définir alertes (extraction_failure_rate >2%, 5xx >1%).
- [ ] Valider les commandes d'installation dans le README et automatiser le déploiement si nécessaire.

Remarque finale : ce document synthétise la description publique disponible sur https://github.com/apidog/mailcat. Validez toujours les commandes et valeurs par défaut dans le README officiel avant tout déploiement en production.
