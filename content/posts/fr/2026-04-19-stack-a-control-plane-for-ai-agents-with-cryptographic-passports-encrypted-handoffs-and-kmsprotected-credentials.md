---
title: "STACK : un plan de contrôle pour agents IA avec passeports cryptographiques, transferts chiffrés et identifiants protégés par KMS"
date: "2026-04-19"
excerpt: "Guide pratique pour STACK — un plan de contrôle qui donne aux agents des passeports cryptographiques, stocke les identifiants chiffrés sous votre KMS et fournit une grille de détecteurs capable de révoquer des accès et de produire une piste d'audit chaînée."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-19-stack-a-control-plane-for-ai-agents-with-cryptographic-passports-encrypted-handoffs-and-kmsprotected-credentials.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 90
editorialTemplate: "TUTORIAL"
tags:
  - "STACK"
  - "agents"
  - "sécurité"
  - "KMS"
  - "audit"
  - "PoC"
  - "IA"
sources:
  - "https://getstack.run/"
---

## TL;DR en langage simple

- STACK place une couche de sécurité entre vos agents IA et les services qu'ils appellent (vault, passeports cryptographiques, grille de détecteurs). Source : https://getstack.run/
- Il chiffre les identifiants avec votre KMS et évite d'exposer des clés longues en clair. Source : https://getstack.run/
- Il émet des « passeports » cryptographiques qui lient identité et périmètre (scope) et peuvent être révoqués globalement. Source : https://getstack.run/
- Une grille de détecteurs corrèle des signaux (ex. credential burst, scope drift) pour alerter ou bloquer : démo = 12× la normale, détecté en ~4 s, passeport révoqué en <60 s. Source : https://getstack.run/

Méthodologie : résumé strict basé sur les extraits de https://getstack.run/.

## Ce que vous allez construire et pourquoi c'est utile

Objectif : un PoC qui montre trois mécanismes centraux décrits sur https://getstack.run/ :

- chiffrement des identifiants via votre KMS ; Source : https://getstack.run/
- émission de passeports signés contenant agent_id + scope + TTL ; Source : https://getstack.run/
- grille de détecteurs corrélés capable de provoquer la révocation d'un passeport. Source : https://getstack.run/

Pourquoi c'est utile : réduction du risque lié aux clés non restreintes (ex. clé dans .env), piste d'audit hachée (hash‑chained audit log) et possibilité d'un « kill switch » automatique quand plusieurs signaux s'alignent. Exemples chiffrés fournis sur la page produit : 12× de pic, détection ~4 s, révocation <60 s, ~10 détecteurs et 1 kill switch. Source : https://getstack.run/

## Avant de commencer (temps, cout, prerequis)

Temps estimé PoC : 1–2 jours d'ingénierie pour un PoC léger (à valider en fonction des intégrations). Source : https://getstack.run/

Coût : dépend de votre usage et des tarifs sur https://getstack.run/ — vérifier la tarification avant déploiement. Source : https://getstack.run/

Prérequis techniques :

- accès réseau vers https://getstack.run/ ; Source : https://getstack.run/
- un KMS cloud (AWS/GCP/Azure) pour gérer la clé de chiffrement ; Source : https://getstack.run/
- identifiants de test non‑production pour simuler appels (ne pas utiliser clés prod). Source : https://getstack.run/

Checklist rapide avant démarrage :

- [ ] Créer un compte test sur https://getstack.run/  
- [ ] Préparer la clé KMS et noter son ARN/ID  
- [ ] Préparer identifiants non‑prod pour tests  

## Installation et implementation pas a pas

1) Vérifier la connectivité vers l'endpoint public : https://getstack.run/

```bash
# Vérification HTTP simple (attendu 200)
curl -sS -o /dev/null -w "%{http_code}\n" https://getstack.run/
```

2) Enregistrer votre clé KMS dans la vault du tenant STACK via l'UI ou l'API (fournir ARN/ID). Source : https://getstack.run/

3) Émettre un passeport de test (agent_id, scope minimal, TTL court). Exemple : TTL = 300 s.

```json
{
  "agent_id": "agent-canary",
  "scope": "read:billing",
  "ttl_s": 300
}
```

4) Configurer la grille de détecteurs en mode alerte et créer une baseline. Injectez du trafic réel ou simulé pour apprendre la normale (période d'observation recommandée en Hypotheses / inconnues). Source : https://getstack.run/

5) Déployer un proxy qui vérifie le passeport, échange contre credentials scoped et délivre uniquement des credentials temporaires au caller (pas de clés longues en clair). Source : https://getstack.run/

6) Test de bout en bout : agent présente passeport → proxy délivre credentials temporaires → backend appelé. Provoquez un pic pour observer la corrélation et la révocation (démo : 12× le baseline, detection ~4 s, révocation <60 s). Source : https://getstack.run/

## Problemes frequents et correctifs rapides

- Échec de vérification du passeport
  - Cause fréquente : clé publique de vérification non synchronisée ou TTL expiré.  
  - Correctif : publier clés de vérification avant rotation et vérifier l'horloge système (NTP). Source : https://getstack.run/

- Proxy n'injecte pas d'identifiants
  - Cause : passeport non accepté ou routes manquantes.  
  - Correctif : vérifier logs du proxy, routes et politiques d'injection. Source : https://getstack.run/

- Bruit détecteurs
  - Cause : baseline insuffisante.  
  - Correctif : laisser détecteurs en mode alerte, augmenter fenêtre d'apprentissage et exiger corrélation multi‑signal avant blocage. Source : https://getstack.run/

Petite checklist de dépannage :

- [ ] Vérifier accessibilité du plan de contrôle https://getstack.run/  
- [ ] Confirmer permissions KMS  
- [ ] Reproduire une transaction test et vérifier l'audit haché  
- [ ] Laisser détecteurs en mode alerte pendant tuning  

## Premier cas d'usage pour une petite equipe

Contexte : équipe de 1–3 personnes (solo founders inclus) qui déploie quelques agents pour automatisation, scraping ou reporting. Objectif : réduire risques et charge opérationnelle. Source : https://getstack.run/

Conseils concrets et actionnables pour solo founders / petites équipes (au moins 3 actions) :

1) Priorité 0 — passeports canari et TTL court
   - Émettre un passeport unique par agent et limiter le scope au minimum requis. Source : https://getstack.run/
   - Utiliser un TTL court d'exemple = 300 s pour réduire la fenêtre d'exposition. Source : https://getstack.run/

2) Opter pour KMS géré et zéro clé longue dans le repo
   - Stocker toutes les clés dans la vault chiffrée par votre KMS (ARN enregistré dans STACK). Source : https://getstack.run/
   - Ne jamais committer de clé longue dans le code ou .env ; utilisez le proxy pour fournir credentials temporaires. Source : https://getstack.run/

3) Déployer canaries et commencer en mode alerte
   - Déployer 1 agent canari qui génère 1–10 requêtes/minute pour établir une baseline. Source : https://getstack.run/
   - Laisser détecteurs en mode alerte pendant 7–14 jours (recommandation d'observation, voir Hypotheses). Source : https://getstack.run/

4) Runbook minimal pour 1‑2 personnes
   - Documenter 3 étapes simples : isoler agent (révoquer passeport), enquêter via timeline hachée, faire rotation KMS si besoin. Source : https://getstack.run/
   - Temps cible pour réaction initiale en mode manuel : <60 s pour déclencher révocation (démo montre <60 s). Source : https://getstack.run/

5) Automatiser exports d'audit
   - Configurer export périodique (ex. journal quotidien) de la timeline hash‑chained pour enquêtes ou assurances. Source : https://getstack.run/

## Notes techniques (optionnel)

- Les détecteurs partagent le même plan de données : lorsqu'un ensemble de signaux (credential burst + scope drift) s'aligne, STACK peut alerter ou bloquer. Source : https://getstack.run/
- Données chiffrées/valeurs de démo extraites : 12× pic d'accès, detection ≈4 s, révocation <60 s, ≈10 détecteurs, 1 kill switch. Source : https://getstack.run/

Tableau de décision (cadre simplifié, chiffres tirés de la démo) :

| Détecteur | Signal observé | Seuil démo | Action proposée |
|---|---:|---:|---|
| Credential Burst | accès aux credentials × baseline | 12× | Alerte en ~4 s → corrélation → révocation si multi‑signal |
| Scope Drift | appels hors scope déclaré | accès hors scope | Marquer, corréler avec burst, possible révocation |
| Passport Revocation | événement corrélé | N/A | Révocation globale en <60 s (démo) |

- Exemples de seuils à tester en PoC : 12× pour bursts, TTL 300 s, observation 7–14 jours. Source : https://getstack.run/

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse : PoC minimal = 1–2 jours d'ingénierie selon intégrations (à valider). Source : https://getstack.run/
- Hypothèse : fenêtre d'observation recommandée 7–14 jours avant activation du blocage automatique (à ajuster). Source : https://getstack.run/
- Hypothèse : TTL exemple 300 s pour passeports courts ; choisir selon latence et UX des agents. Source : https://getstack.run/
- Chiffres extraits de la page produit : détection ≈4 s, pic 12×, révocation <60 s, ~10 détecteurs, 1 kill switch, near‑miss ≈$50,000 (démo). Source : https://getstack.run/

### Risques / mitigations

- Risque : faux positifs entraînant blocage de flux légitimes.  
  - Mitigation : démarrer en mode alerte, exiger corrélation multi‑signal avant révocation, augmenter période d'apprentissage. Source : https://getstack.run/

- Risque : rotation KMS mal coordonnée casse vérification des passeports.  
  - Mitigation : chevauchement de clés, publication préalable des clés de vérification et tests de rotation. Source : https://getstack.run/

- Risque : conservation d'audit insuffisante pour conformité.  
  - Mitigation : configurer export/retention et vérifier la timeline hash‑chained pour preuves d'investigation. Source : https://getstack.run/

### Prochaines etapes

- Lancer le PoC : enregistrer la clé KMS, créer un passeport test (TTL 300 s), déployer le proxy, provoquer une alerte et observer la corrélation + révocation + timeline. Source : https://getstack.run/
- Durcir : définir seuils métriques (ex. bursts >12×), réduire TTL, automatiser runbooks et tester rotation de clés. Source : https://getstack.run/
- Vérifier tarification et docs officielles sur https://getstack.run/ avant passage en prod. Source : https://getstack.run/

Checklist de production finale :

- [ ] Détecteurs réglés et testés en mode alerte jusqu'à acceptabilité  
- [ ] Politique de rotation KMS documentée et testée  
- [ ] Exportation et rétention d'audit configurées  
- [ ] Garde‑fous de déploiement (canary, feature flag) en place
