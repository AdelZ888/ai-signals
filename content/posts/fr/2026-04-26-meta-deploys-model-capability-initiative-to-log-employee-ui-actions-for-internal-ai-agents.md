---
title: "Meta enregistre clics et frappes pour entraîner ses agents internes — risques, emplois exposés et actions immédiates"
date: "2026-04-26"
excerpt: "Numerama rapporte que Meta a déployé un outil (MCI) qui capture clics, mouvements de souris, frappes au clavier et captures d’écran sur postes de travail pour enseigner des « réflexes d’interface » aux modèles. Que cela signifie pour les tâches automatisables, la conformité (CNIL/ICO/GDPR) et les actions concrètes pour salariés, responsables et fondateurs ?"
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-04-26-meta-deploys-model-capability-initiative-to-log-employee-ui-actions-for-internal-ai-agents.jpg"
region: "FR"
category: "Model Breakdowns"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "SOCIETY"
tags:
  - "IA"
  - "monitoring"
  - "confidentialité"
  - "Meta"
  - "MCI"
  - "emploi"
  - "GDPR"
  - "CNIL"
sources:
  - "https://www.numerama.com/tech/2238609-meta-entraine-ses-ia-avec-les-clics-et-frappes-au-clavier-de-ses-salaries.html"
---

## TL;DR (emploi + personnes, langage simple)

- Numerama rapporte que Meta a déployé un outil appelé Model Capability Initiative (MCI) aux États‑Unis. MCI enregistre clics, mouvements de souris, frappes au clavier et captures d’écran sur postes de travail pour entraîner des modèles d’IA (https://www.numerama.com/tech/2238609-meta-entraine-ses-ia-avec-les-clics-et-frappes-au-clavier-de-ses-salaries.html).

- Que cela signifie pour une personne : si vous faites souvent la même suite d’actions (par ex. fermer un ticket en 5–8 clics), ces étapes peuvent devenir automatisables. Si votre travail demande jugement, négociation ou créativité, il est moins exposé pour l’instant.

- Actions simples à faire tout de suite : demander par écrit ce qui est collecté et pendant combien de jours (réponse demandée sous 7–14 jours) ; lister 5–15 tâches récurrentes et le nombre d’étapes par tâche ; éviter de taper des données sensibles quand possible.

- Pour les managers : lancer une AIPD/DPIA avant montée en charge ; piloter un test volontaire (opt‑in) de taille minimale recommandée n ≥ 10 ; définir critères d’arrêt (par ex. précision ≥ 90 %, erreurs critiques ≤ 2 %).

## Ce que disent vraiment les sources

- Fait confirmé : Numerama décrit le déploiement de MCI aux États‑Unis et la capture des signaux mentionnés (clics, souris, frappes, captures d’écran) pour entraîner des réflexes d’interface pour des agents internes (https://www.numerama.com/tech/2238609-meta-entraine-ses-ia-avec-les-clics-et-frappes-au-clavier-de-ses-salaries.html).

- Ce que l’extrait ne précise pas : nombre exact de postes, durée de conservation, fréquence d’échantillonnage en ms, formes de stockage (brut vs anonymisé) et modalités de consentement. Ces éléments sont déplacés dans la section Hypotheses / inconnues.

- Méthode courte : je n’affirme que ce que l’extrait dit. Les recommandations opérationnelles sont guidées par ces faits et par des bonnes pratiques de conformité.

## Quelles taches sont exposees vs quels emplois changent plus lentement

- Exposition élevée (court/moyen terme) : tâches d’interface strictement séquentielles et répétitives. Exemple : saisie de formulaires standardisés, copier‑coller entre apps, clôture de tickets en 5–8 actions (https://www.numerama.com/tech/2238609-meta-entraine-ses-ia-avec-les-clics-et-frappes-au-clavier-de-ses-salaries.html).

- Exposition plus faible : activités demandant jugement contextuel, négociation, supervision humaine, responsabilité légale ou créativité stratégique.

Voici un tableau de comparaison simple :

| Type de tâche | Exemple | Nb d'étapes typique | Exposition (court terme) |
|---|---:|---:|---:|
| Séquentielle répétitive | Clôture ticket | 5–8 clics | Élevée |
| Saisie standardisée | Formulaire RH | 6–12 champs | Élevée |
| Judgement/éthique | Décision contractuelle | 3–20 étapes + jugement | Faible |
| Coordination humaine | Négociation client | 8–50 interactions | Faible |

- Règles pratiques : prioriser les tâches répétées >70 % du temps pour évaluation d’automatisation. Recommandation de supervision humaine tant que précision < 90 %.

(voir source : https://www.numerama.com/tech/2238609-meta-entraine-ses-ia-avec-les-clics-et-frappes-au-clavier-de-ses-salaries.html)

## Trois personas concrets (scenarios 2026)

(Numerama signale la capture de signaux sur postes de travail ; ces scénarios partent de ce fait : https://www.numerama.com/tech/2238609-meta-entraine-ses-ia-avec-les-clics-et-frappes-au-clavier-de-ses-salaries.html.)

Persona 1 — Elena (États‑Unis), agente support client

- Activité : clôture de tickets via un outil interne. Flux type : lire le ticket, choisir réponse, coller note, marquer résolu — 5–8 clics.
- Risque : automatisation possible de la séquence. Si automatisée, son temps de travail peut baisser et la supervision doit rester tant que précision < 90 %.
- Action : tenir un journal de 5–10 tâches et préciser où le jugement humain intervient.

Persona 2 — Luc (France), DPO

- Activité : suivi RGPD et contrôle des traitements. La capture de frappes et d’écrans est susceptible d’être un traitement à haut risque selon la CNIL.
- Action : préparer une AIPD/DPIA, vérifier la base légale, consulter le CSE. (Référence : https://www.numerama.com/tech/2238609-meta-entraine-ses-ia-avec-les-clics-et-frappes-au-clavier-de-ses-salaries.html)

Persona 3 — Asha (Royaume‑Uni), product manager

- Activité : pilote un test d’agent RH. Conception recommandée : volontaires opt‑in, n ≥ 10, métriques définies (précision ≥ 90 %, erreurs critiques ≤ 2 %), minimisation et rétention courte des données.

## Ce que les salaries doivent faire maintenant

(Source : https://www.numerama.com/tech/2238609-meta-entraine-ses-ia-avec-les-clics-et-frappes-au-clavier-de-ses-salaries.html)

Actions immédiates et concrètes :

- Envoyer une demande écrite au RH / DPO. Poser ces questions : quels signaux sont captés (clics, souris, frappes, captures d’écran) ; finalité ; durée de conservation (en jours) ; qui y a accès ; participation optionnelle ou obligatoire. Demander réponse sous 7–14 jours et garder la preuve.

- Rédiger une fiche d’une page listant 5–15 tâches récurrentes ; pour chaque tâche, indiquer le nombre d’étapes et où intervient le jugement humain.

- Ne pas saisir d’informations sensibles (données de santé, mots de passe, numéros d’identification) sur interfaces susceptibles d’être capturées. Considérer qu’une capture d’écran peut tout conserver.

- Sauvegarder toutes les communications RH / DPO / CSE et horodater les copies.

Exemple d’e‑mail objet : « Demande d’information – collecte de signaux poste de travail ».

## Ce que les fondateurs et managers doivent faire maintenant

(Source : https://www.numerama.com/tech/2238609-meta-entraine-ses-ia-avec-les-clics-et-frappes-au-clavier-de-ses-salaries.html)

Priorités opérationnelles :

- Cartographier la surface de capture : inventorier applications et équipes exposées ; compter les postes concernés.

- Lancer une AIPD/DPIA avant toute montée en charge. Documenter finalité, minimisation, format des captures (brut vs rédigé), durée de conservation et contrôles d’accès.

- Piloter un test volontaire (opt‑in) : taille minimale recommandée n ≥ 10. Faire des revues à J+30 et J+90. Définir critères de succès (par ex. opt‑in ≥ 60 %, précision ≥ 90 %, erreurs critiques ≤ 2 %).

- Préparer un plan de transition pour les collaborateurs impactés : budget indicatif 1k–5k USD par personne pour formation ou reconversion ; calendrier et communication claire.

Checklist dirigeant :
- [ ] AIPD/DPIA complète avant montée en charge
- [ ] Pilote opt‑in (n ≥ 10) planifié, revues J+30/J+90
- [ ] Critères go/no‑go définis (ex. précision ≥ 90 %)
- [ ] Budget reconversion estimé (1k–5k USD par personne)

## Angle France / US / UK

- France (RGPD / CNIL) : la capture de frappes et d’écrans est probablement un traitement à haut risque. Une AIPD/DPIA est requise et le CSE doit être consulté. (Source : https://www.numerama.com/tech/2238609-meta-entraine-ses-ia-avec-les-clics-et-frappes-au-clavier-de-ses-salaries.html)

- Royaume‑Uni (UK GDPR) : obligations proches du RGPD. Documenter proportionnalité et mesures compensatoires. (Source : https://www.numerama.com/tech/2238609-meta-entraine-ses-ia-avec-les-clics-et-frappes-au-clavier-de-ses-salaries.html)

- États‑Unis : pas de cadre fédéral unique équivalent au RGPD. Conformité dépend d’État, secteur et contrat. L’affaire Meta illustre risques réglementaires et réputationnels. (Source : https://www.numerama.com/tech/2238609-meta-entraine-ses-ia-avec-les-clics-et-frappes-au-clavier-de-ses-salaries.html)

## Checklist et prochaines etapes

### Hypotheses / inconnues

- Confirmé : déploiement MCI aux États‑Unis et capture de clics, mouvements, frappes et captures d’écran pour entraîner des réflexes d’interface (Numerama : https://www.numerama.com/tech/2238609-meta-entraine-ses-ia-avec-les-clics-et-frappes-au-clavier-de-ses-salaries.html).

- Hypothèses à vérifier (à demander à l’employeur ou au régulateur) : nombre précis de postes concernés (compte, ex. 10–10 000), fréquence d’échantillonnage (ex. 100 ms), durée de conservation (en jours, ex. ≤ 90 jours), format de stockage (brut vs anonymisé), mécanismes de consentement (opt‑in vs obligatoire), si les captures sont transformées en tokens ou résumées avant entraînement (ex. 8k tokens max).

### Risques / mitigations

- Risque : capture d’informations sensibles (santé, identifiants). Mitigation : suppression/masquage au point de capture, minimisation, rétention courte (ex. ≤ 90 jours), journalisation des accès.

- Risque : automatisation déployée trop tôt sur tâches critiques. Mitigation : tests aveugles, supervision humaine jusqu’à seuils acceptés (précision ≥ 90 %, erreurs critiques ≤ 2 %), revues J+30/J+90.

- Risque : contentieux ou mobilisation des salariés. Mitigation : AIPD/DPIA, consultation CSE/DPO/avocats, communication transparente, budget de reconversion ou formation.

### Prochaines etapes

Pour salariés :
- Envoyer la demande écrite au RH/DPO dans les 7–14 jours.
- Remplir la fiche tâches (5–15 tâches) cette semaine.
- Conserver preuves des échanges.

Pour managers/fondateurs :
- Lancer l’AIPD/DPIA sous 14 jours.
- Planifier un pilote opt‑in (n ≥ 10) avec revues à J+30/J+90.
- Définir métriques et sécuriser budget reconversion (1k–5k USD par personne impactée).

Pour juridique / conformité :
- Vérifier obligations CNIL/ICO/GDPR et lois d’État US pertinentes.
- Préparer modèles de communication aux salariés.

Checklist d’implémentation rapide :
- [ ] Employé : demander disclosure écrite (réponse 7–14 jours)
- [ ] Employé : compléter 1‑page task inventory (5–15 tâches)
- [ ] Manager : lancer AIPD/DPIA (14 jours)
- [ ] Manager : piloter opt‑in (n ≥ 10), revue J+30
- [ ] Tous : conserver tous les échanges/documentations

Source principale : Numerama — "Meta entraîne ses IA avec les clics et frappes au clavier de ses salariés" (https://www.numerama.com/tech/2238609-meta-entraine-ses-ia-avec-les-clics-et-frappes-au-clavier-de-ses-salaries.html).
