---
title: "Des collègues IA formés à partir de vos chats : ce que disent les faits et ce que ça implique pour salariés et fondateurs"
date: "2026-04-21"
excerpt: "Un projet viral a montré qu’on peut transformer l’historique de chat et les fichiers en « manuel » réutilisable pour un agent IA. L’article de MIT Technology Review décrit l’affaire Colleague Skill en Chine et les réactions des travailleurs ; ce mémo explique les risques, les mesures concrètes à prendre et comment l’adapter au contexte US/France/UK."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-21-chinese-tech-workers-report-being-asked-to-document-workflows-for-ai-agents.jpg"
region: "US"
category: "Model Breakdowns"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "SOCIETY"
tags:
  - "IA"
  - "travail"
  - "politique RH"
  - "confidentialité"
  - "productivité"
  - "gestion"
  - "droit"
  - "sécurité"
sources:
  - "https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/"
---

## TL;DR (emploi + personnes, langage simple)

- Un projet GitHub nommé Colleague Skill a montré qu'on peut extraire automatiquement historiques de chat et fichiers (Lark, DingTalk) pour générer un manuel réutilisable par un agent d'IA. Voir https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/.
- L'auteur dit que c'était une parodie. Malgré tout, des managers demandent déjà à des employés de documenter leurs workflows pour automatiser des tâches (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).
- Réactions observées : humour, inquiétude pour la dignité, peur d'être remplacé, préoccupations de vie privée (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).
- Si une tâche laisse >80% d'artefacts textuels (tickets, threads, documents), elle est plus facile à capturer. Exigez 7–14 jours de droit de revue avant toute mise en production.
- Conseil simple pour salarié·e : demander un périmètre écrit, exclure messages privés, exiger compensation (ex. 0,5–2 jours payés ou un forfait ≈ $500) si l'on doit préparer le corpus.

## Ce que disent vraiment les sources

- Le reportage du MIT Technology Review décrit le projet Colleague Skill : il importait automatiquement chats et fichiers depuis Lark et DingTalk et synthétisait des manuels pour qu'un agent d'IA reproduise des tâches (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).
- L'auteur, Tianyi Zhou (Shanghai Artificial Intelligence Laboratory), a dit que le projet était une mise en scène. Il a expliqué que l'initiative était motivée par des licenciements liés à l'IA et par la tendance des entreprises à demander aux employés d'automatiser leurs tâches (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).
- La viralité a déclenché un débat public sur la dignité au travail, la vie privée et le risque de remplacement. Plusieurs salariés ont rapporté que leurs managers leur demandaient d'exporter chats ou de rédiger des manuels pour automatiser des processus (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).

Méthode : synthèse directe de l'enquête citée ci‑dessus.

## Quelles taches sont exposees vs quels emplois changent plus lentement

Règle simple : plus la tâche est prévisible et laisse des traces textuelles structurées, plus elle est capturable par un agent. Les tâches avec jugement tacite, responsabilité légale ou relations humaines évoluent plus lentement. Source : https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/.

| Niveau d'exposition | Exemples concrets | Horizon plausible | Mesure de mitigation |
|---|---|---:|---|
| Haute | Triage de tickets, réponses FAQ, scripts de debugging récurrents | 0–6 mois | Exclure PII, human‑in‑loop, tests en shadow mode |
| Moyenne | Brouillons de spécifications, checklists de build, runbooks | 6–18 mois | Pilote limité, revue humaine, seuils d'acceptation (p.ex. <5% d'erreurs) |
| Basse | Recrutement final, arbitrage moral, mentorat en profondeur | 18+ mois | Maintien de la responsabilité humaine, interdiction d'automatisation complète |

Points pratiques tirés du cas Colleague Skill : les traces importées (chats, documents) sont le vecteur. Si la qualité des logs est bonne (threads lisibles, métadonnées), un agent peut reproduire des routines à l'aide de modèles consommant 5k–50k tokens par tâche ; pour des usages temps réel, visez <200 ms de latence côté inference et testez un taux d'erreur cible <5% avant montée en charge (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).

## Trois personas concrets (scenarios 2026)

(Scénarios basés sur l'article : https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/.)

Persona A — Li Wei (ingénieur backend, Shanghai)
- Contexte : conversations de debug sur Lark/DingTalk importées.
- Risque : extraits informels et privés capturés sans consentement.
- Action recommandée : demander un périmètre écrit précisant canaux, plages de dates et exclusion des messages privés ; droit de revue 7–14 jours.

Persona B — Ava (product manager, Londres)
- Contexte : PRD et threads sur documents partagés.
- Risque : l'agent reprend des décisions historiques biaisées et impacte la roadmap.
- Action recommandée : pilote limité, humain‑in‑the‑loop pour validation des PRD, seuils d'acceptation graduels (p.ex. 90% de conformité avant déploiement partiel).

Persona C — Marcus (support lead, remote, États‑Unis)
- Contexte : logs historiques utilisés pour créer un chatbot support.
- Risque : fuite de données clients ou réponses erronées causant litiges.
- Action recommandée : suppression des PII avant entraînement, shadow mode (bot propose, humain publie), journaux d'audit avec horodatage et ID (au moins 1 enregistrement par interaction pour traçabilité).

## Ce que les salaries doivent faire maintenant

- Exiger un périmètre écrit : qui fournit les données, quelles sources (par ex. Lark, DingTalk, Slack, Gmail), pourquoi, et combien de temps les données seront conservées (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).
- Demander des règles de pseudonymisation : supprimer emails, numéros, identifiants, et toute PII avant entraînement.
- Négocier un droit de revue de 7–14 jours pour inspecter les exports et valider les sorties de l'agent avant mise en production.
- Exiger un human‑in‑the‑loop pour décisions sensibles (embauche, licenciement, remboursements).
- Préserver votre temps rémunéré : demander paiement pour le temps de préparation (ex. 0,5–2 jours, ou un forfait autour de $500 par employé selon charge).

Checklist courte à copier‑coller vers RH (inclut source) :
- Objet : pilote IA basé sur exports de messagerie (voir https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/)
- Sources proposées : liste explicite (canaux et dates)
- Exclusions : messages privés, pièces jointes avec PII
- Droit de revue : 7–14 jours
- Compensation : préciser montant ou temps protégé

## Ce que les fondateurs et managers doivent faire maintenant

- Rédiger une politique interne avant tout export : finalité, sources autorisées, durée de conservation, droit d'opt‑out, mécanisme de compensation et personne responsable (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).
- Réaliser un contrôle sécurité et vie privée avant extraction : filtres automatiques PII, suppression d'identifiants sensibles, séparation des environnements d'entraînement.
- Piloter en shadow mode : l'agent ne prend pas de décisions finales. Mesurer performance, logs et taux d'erreur ; définir un critère d'arrêt si >10% d'incidents en production.
- Rémunérer la production de documentation : reconnaître que la préparation d'un corpus prend du temps et prévoir 0,5–2 jours payés par employé ou un forfait.
- Documenter et archiver : garder des logs indiquant quelles données ont servi à quel modèle et quand (minimum 1 entrée par export).

Pratique recommandée : commencer par un pilote limité (30–90 jours), documenter les sources d'entraînement et garder un humain responsable des décisions finales.

## Angle France / US / UK

Le cas rapporté concerne la Chine, mais la dynamique — managers demandant des exports — peut apparaître ailleurs. Vérifiez le cadre local et engagez le dialogue social avant tout export (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).

- France : interroger la CNIL et le droit du travail ; si pertinent, impliquer le CSE avant extraction de données salariales.
- United Kingdom : vérifier la base légale sous le GDPR et suivre les recommandations de l'ICO ; consulter ACAS pour la conduite des consultations.
- United States : le cadre est fragmenté ; vérifier contrats, clauses de propriété intellectuelle et lois d'État (ex. CCPA pour données clients). 

Si la loi locale exige consultation ou négociation collective, faites‑la avant tout export. À défaut, appliquez transparence, révocabilité et proportionnalité.

## Checklist et prochaines etapes

### Hypotheses / inconnues

- Vérifié dans la source : Colleague Skill importait chats/fichiers et générait des manuels ; l'affaire est devenue virale en Chine et a déclenché un débat (https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/).
- À valider localement : fréquence réelle de demandes similaires hors Chine ; impact chiffré sur l'emploi à l'échelle d'une entreprise.
- Paramètres à tester en pilote : précision visée (p.ex. >95%), taux d'erreur critique tolérable (<5%), quantité de tokens par tâche (5k–50k), durée du pilote (30–90 jours), règles de rétention.

### Risques / mitigations

- Risque : export non autorisé de secrets ou PII. Mitigation : exclusions strictes, suppression automatique et revue humaine avant entraînement.
- Risque : sentiment de coercition chez les salarié·e·s. Mitigation : consentement écrit et révocable, opt‑out, compensation et dialogue social (CSE ou représentants).
- Risque : mauvaise expérience client due à agents immatures. Mitigation : shadow mode, human‑in‑the‑loop, journaux d'audit et possibilité de rollback.

### Prochaines etapes

Immédiat (0–7 jours)
- [ ] Exiger un périmètre écrit (qui, quoi, pourquoi, durée de conservation) — voir https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/.
- [ ] Obtenir l'inventaire des sources proposées à l'export (canaux, plages de dates).

Prioritaire (7–30 jours)
- [ ] Réaliser un audit sécurité & confidentialité avant tout export.
- [ ] Définir métriques de pilote (précision ciblée, taux d'erreur tolérable) et critères d'arrêt.
- [ ] Convenir d'une compensation ou de temps protégé pour les employé·e·s concernés.

Moyen terme (30–90 jours)
- [ ] Mettre en place des logs d'audit précisant quelles données ont servi à quel modèle et quand.
- [ ] Organiser des tests de type red‑team et publier les résultats clés aux parties prenantes.
- [ ] Élaborer des plans de requalification ou des mesures de compensation pour les rôles dont les tâches changent durablement.

Référence principale : MIT Technology Review — 'Chinese tech workers are starting to train their AI doubles—and pushing back' (20 avril 2026) : https://www.technologyreview.com/2026/04/20/1136149/chinese-tech-workers-ai-colleagues/.
