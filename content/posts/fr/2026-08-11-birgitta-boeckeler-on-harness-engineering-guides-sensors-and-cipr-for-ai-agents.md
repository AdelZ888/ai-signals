---
title: "Birgitta Boeckeler sur le « harness engineering » : guides, capteurs et CI/PR pour agents IA"
date: "2026-08-11"
excerpt: "Birgitta Boeckeler présente le « harness engineering » : de courts guides lisibles par des humains et des capteurs automatiques (p. ex. Semgrep, SonarQube) intégrés dans CI/PR pour rendre les agents IA plus traçables et plus sûrs."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-11-birgitta-boeckeler-on-harness-engineering-guides-sensors-and-cipr-for-ai-agents.jpg"
region: "FR"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "IA"
  - "agents"
  - "harness engineering"
  - "CI/CD"
  - "Semgrep"
  - "SonarQube"
  - "sécurité"
  - "développement"
sources:
  - "https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/"
---

## TL;DR en langage simple

- Un "harness" est un ensemble léger de guides et de capteurs qui encadrent ce qu’un agent d’intelligence artificielle (IA) peut faire dans un dépôt. Voir l’épisode pour le concept et des exemples d’outils (Semgrep, SonarQube) : https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.
- Composition minimale : un guide lisible dans le dépôt (.md) et des capteurs qui s’exécutent dans le flux CI (continuous integration, intégration continue) / PR (pull request, demande de fusion) pour annoter ou bloquer les changements. L’épisode décrit ce pattern « guides + capteurs » et son intégration dans CI/PR : https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.
- Effet immédiat : annotations visibles dans la PR, piste d’audit et meilleure confiance pour le réviseur humain. Le harness demande une maintenance continue quand les modèles de base (foundation models) changent. https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.

Exemple court (scénario) : un agent propose un petit refactor sur une PR. Le harness exécute Semgrep et SonarQube en CI, poste des annotations dans la PR. Le réviseur voit les alertes, la portée autorisée (GUIDE.md) et décide d’accepter ou de demander des corrections.

### Explication simple avant les détails avancés
Un harness aide à garder le contrôle quand on laisse des agents IA intervenir sur le code. Il combine :
- un guide lisible par les humains qui dit ce que l’agent est autorisé à faire ;
- des capteurs automatisés qui vérifient sécurité, qualité et règles de style dans le même flux que la revue humaine.

L’idée clé : ne pas prendre la sortie d’un modèle « brute » dans la base de code. Faire tourner des contrôles automatiques dans la CI/PR et montrer les résultats au réviseur humain. Voir l’enregistrement pour les exemples d’implémentation : https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.

## Ce qui a change

Avant, on récupérait souvent la sortie d’un modèle et on l’examinait manuellement. Maintenant, on met des garde‑fous techniques directement dans le flux CI/PR où les humains prennent la décision finale. L’épisode explicite le pattern « guides + capteurs » et montre comment l’intégrer aux pipelines existants : https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.

Points clés tirés de l’épisode :
- Le harness est un artefact d’ingénierie concret (par exemple un fichier GUIDE.md + capteurs dans le pipeline). https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.
- Les capteurs annotent ou bloquent selon des règles et produisent une piste d’audit consultable dans la PR. https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.
- Le harness nécessite une maintenance régulière : les modèles et les règles évoluent, donc le harness peut vieillir s’il n’est pas mis à jour. https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.

## Pourquoi c'est important (pour les vraies equipes)

- Vitesse + traçabilité : le harness permet de garder la vitesse des agents tout en rendant leurs actions auditable par un humain. L’épisode montre que guides et capteurs rendent l’activité des agents plus facile à vérifier. https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.
- Confiance : un guide lisible définit la portée autorisée de l’agent. Les capteurs fournissent preuves et métriques visibles dans la PR.
- Sécurité et qualité : automatiser des vérifications standards (sécurité, qualité, style) réduit le risque d’introduire des vulnérabilités triviales. Semgrep et SonarQube sont cités comme exemples de capteurs pratiques. https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.

## Exemple concret: a quoi cela ressemble en pratique

Scénario détaillé : un agent propose des fixes et petits refactors. L’équipe veut traçabilité, peu de bruit et pas d’arrêt brutal du flux.

Implémentation minimale (pattern tiré de l’épisode) :
- Un fichier GUIDE.md à la racine du dépôt qui définit la portée autorisée et les fichiers interdits. https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.
- Des capteurs (ex. Semgrep, SonarQube) exécutés en CI qui postent des annotations dans la PR. https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.
- Un statut CI dédié (par ex. "agent-harness") visible dans le fil de la PR pour orienter le réviseur.

Extrait minimal de job CI d’illustration (adapter à votre plateforme) :

```yaml
on: [pull_request]
jobs:
  agent-harness:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
      - name: Post "agent-harness"
        run: echo "agent-harness: annotations posted"
```

Source et inspiration : https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.

## Ce que les petites equipes et solos doivent faire maintenant

Priorité et actions concrètes pour une équipe légère ou un solo founder. Pattern général expliqué dans l’épisode : https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.

Actions immédiates (3 priorités) :

1) Créer un GUIDE.md dans la racine du dépôt. Contenu minimal : portée autorisée de l’agent, fichiers interdits, procédure de revue humaine, et propriétaire/contact. L’épisode insiste sur l’utilité d’un guide lisible pour limiter le périmètre des actions d’un agent. https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.

2) Activer un capteur léger : installer Semgrep ou équivalent avec 1–2 règles (ex. détection de secrets, règle de sécurité critique). Configurez-le pour poster des annotations sur la PR plutôt que de bloquer d’emblée. L’épisode cite Semgrep comme exemple pratique. https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.

3) Ajouter un job CI simple nommé "agent-harness" qui exécute le capteur et publie un statut/annotation visible dans la PR. Commencez non‑bloquant pour éviter d’arrêter le flux de livraison. https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.

Aides pratiques à faible coût :
- Ajouter une ligne standard dans le template PR, p.ex. "Origin: agent", pour repérer ces PRs.
- Nommer un propriétaire ou une rotation de 2–3 personnes pour trier les annotations et affiner les règles.

Checklist copiable :

- [ ] Créer GUIDE.md et le lier au template PR
- [ ] Installer Semgrep et activer 1–2 règles pour commencer
- [ ] Ajouter job CI "agent-harness" (commencer non‑bloquant)
- [ ] Marquer PRs d’agent (Origin: agent) et exiger revue humaine
- [ ] Nommer un propriétaire / planifier un triage régulier

Référence principale : https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.

## Angle regional (FR)

Points pratiques pour la France (à valider avec vos équipes juridiques / conformité) :
- N’exposez pas de prompts ou logs sensibles dans un dépôt public. Conservez les artefacts dans un stockage CI privé. L’épisode se concentre sur le pattern technique ; la conformité reste une adaptation locale. https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.
- Documentez la collecte de données (télémetrie, prompts, sorties agents) dans le GUIDE.md pour faciliter les revues de conformité et les demandes d’accès. https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.
- Prévoyez une politique de conservation des logs et artefacts et validez les durées avec la conformité (voir section Hypotheses / inconnues pour des suggestions à tester).

## Comparatif US, UK, FR

Adaptations opérationnelles possibles selon juridiction ; inspirées du pattern guides+capteurs décrit dans l’épisode : https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.

| Perspective | Focus principal | Exemple opérationnel |
|---|---|---|
| US | ownership par repo, rapidité d’itération | règles par repo + owners nommés |
| UK | explicabilité et audit | guides détaillés + annotations riches dans PR |
| FR | traçabilité et conformité | logs conservés avec identifiants de réviseurs (voir juridique) |

## Notes techniques + checklist de la semaine

### Hypotheses / inconnues

- Les recommandations chiffrées ci‑dessous sont des hypothèses opérationnelles à tester (elles ne proviennent pas textuellement de l’épisode) :
  - Démarrer avec 1–3 règles Semgrep ciblées pour limiter le bruit.
  - Estimation de temps initial : 30–60 minutes pour rédiger un GUIDE.md, 1–3 heures pour configurer Semgrep et le job CI, 30 minutes par semaine pour le triage initial.
  - Rétention proposée des logs/artefacts : 30–90 jours selon contraintes RGPD et sectorielles.
  - Collecte de signaux initiale : 2–4 semaines avant de promouvoir des règles non‑bloquantes vers bloquantes.
  - Objectifs métriques à tester : réduire les correspondances haute gravité à <5 par mois par repo, garder un taux de faux positifs <30% en phase de stabilisation.

### Risques / mitigations

- Risque : faux positifs élevés → fatigue des réviseurs. Mitigation : commencer non‑bloquant, triage hebdomadaire, ajuster les règles.
- Risque : le harness devient obsolète quand les modèles changent. Mitigation : nommer un propriétaire et prévoir une revue mensuelle (p.ex. 60 minutes) pour mettre à jour guides et règles.
- Risque : blocages excessifs ralentissant le flux. Mitigation : chemin gradué (annoter → warn → block) et critères explicites pour promouvoir une règle en bloquante.

### Prochaines etapes

Checklist prioritaire (semaine 1) :

- [ ] Ajouter GUIDE.md et le lier au template PR (propriétaire nommé)
- [ ] Configurer Semgrep (1–3 rules) ; activer annotations PR
- [ ] Ajouter job CI "agent‑harness" (commencer non‑bloquant)
- [ ] Marquer PRs d’agent (Origin: agent) et exiger revue humaine
- [ ] Planifier triage hebdo (30 min) et revue mensuelle (60 min)

Métriques à suivre le premier mois : nombre de correspondances haute gravité par PR, ratio faux positifs (%), taux de blocage hebdomadaire, latence moyenne de revue (minutes). Source d’inspiration et descriptions du pattern : https://se-radio.net/2026/07/se-radio-730-birgitta-boeckeler-on-harness-engineering-for-ai-agents/.
