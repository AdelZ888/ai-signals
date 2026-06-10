---
title: "hty : des sessions PTY persistantes pour laisser les agents IA piloter des CLIs interactifs"
date: "2026-06-10"
excerpt: "hty expose des programmes interactifs via des sessions PTY persistantes : un agent IA peut prendre un snapshot du terminal rendu et envoyer des frappes clavier — ce qui permet aux agents de piloter des éditeurs, des flux d'authentification et des assistants pas à pas."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-06-10-hty-persistent-pty-sessions-let-ai-agents-drive-interactive-clis.jpg"
region: "FR"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "NEWS"
tags:
  - "agents-IA"
  - "CLI"
  - "hty"
  - "automatisation"
  - "sécurité"
  - "GDPR"
  - "devops"
sources:
  - "https://hty.sh/"
---

## TL;DR en langage simple

- hty permet à un agent d'intelligence artificielle de voir et d'interagir avec un terminal comme le ferait un humain : il lit l'écran rendu et envoie des frappes (primitives documentées). Source : https://hty.sh/.
- Fonctionnement de base : hty crée une session PTY persistante, l'agent peut prendre un instantané (snapshot) et envoyer des frappes (send) dans la même session. Voir la doc : https://hty.sh/.
- Ce que ça débloque : permet aux agents d'utiliser des outils interactifs (vim, create-next-app, gh auth login, git add -p) plutôt que de bricoler les fichiers en dehors du terminal. Détails : https://hty.sh/.

Méthodologie courte : résumé basé sur la documentation officielle et les primitives listées sur https://hty.sh/.

## Ce qui a change

- Primitives explicites : snapshot pour capturer l'écran rendu, send pour envoyer des frappes. Ces commandes sont les primitives opérationnelles documentées par hty : https://hty.sh/.
- Sessions persistantes : un serveur maintient les sessions ouvertes entre invocations, ce qui permet de reprendre un flux interactif sans relancer le processus (voir https://hty.sh/).
- Skill prête à l'emploi : la documentation indique une skill et un point d'entrée `https://hty.sh/skill.md` ; la skill peut être ajoutée via `npx skills add LatentEvals/hty --skill hty` (référence : https://hty.sh/).
- Résultat pratique : les agents peuvent suivre des séquences multi‑invite (scaffolding, logins, éditeurs) en lisant l'écran et en tapant au bon moment (https://hty.sh/).

## Pourquoi c'est important (pour les vraies equipes)

- Meilleure fidélité de l'observation : l'agent voit le rendu terminal comme un humain, ce qui réduit les erreurs liées à des heuristiques hors‑outil.
- Moins de hacks fragile : au lieu de contourner l'interface (écrire dans /tmp, appliquer des patchs), l'agent interagit avec l'UI réelle (vim, psql, wizards), ce qui diminue les cas d'échec intermittents (https://hty.sh/).
- Observabilité et post‑mortem : snapshots et logs de session donnent une piste pour diagnostiquer pourquoi un flux a échoué (documentation et commandes listées sur https://hty.sh/).
- Déploiement prudente : traitez ces sessions comme des ressources potentiellement sensibles et pilotez l'usage avant mise en production (https://hty.sh/).

## Exemple concret: a quoi cela ressemble en pratique

Flux simple (extrait des usages documentés) : lancer un générateur interactive et répondre à une invite.

```bash
hty run --name create-next-app -- create-next-app my-app
hty snapshot create-next-app
hty send create-next-app --text "y\n"
```

Étapes pratiques :
- Démarrer la session (`hty run --name ...`).
- Capturer l'écran pour détecter une invite (`hty snapshot`).
- Envoyer la frappe attendue (`hty send`).
- Rejouer, regarder en direct, puis supprimer la session (`hty delete`).

Guide rapide et référence : https://hty.sh/.

## Ce que les petites equipes et solos doivent faire maintenant

Conseils concrets, actionnables, pensés pour un solo founder ou une équipe de 1–3 personnes (chaque point est exécutable en ordre) :

1) Installer et tester en local / runner isolé
- Installer hty sur une machine dédiée ou un runner non‑prod. Tester les trois commandes de base : `hty run`, `hty snapshot`, `hty send` sur des flows non sensibles (ex. create‑next‑app). Voir https://hty.sh/.

2) Ajouter la skill et vérifier le comportement de l'agent
- Ajouter la skill documentée (`npx skills add LatentEvals/hty --skill hty`) ou pointer l'agent vers `https://hty.sh/skill.md` ; vérifier que l'agent sait quand snapshotter et quand envoyer des frappes (logs et sorties visibles). Référence : https://hty.sh/.

3) Isoler et sécuriser les credentials immédiats
- N'utilisez pas d'identifiants production : créez comptes de test et tokens à courte durée. Restreindre l'accès réseau du runner et limiter les droits des comptes utilisés par l'agent. Détails : https://hty.sh/.

4) Tests de fumée ciblés
- Automatiser deux workflows interactifs plausibles (par ex. scaffolding + auth) et exercer manuellement le flux via hty pour valider l'observation et les frappes. Capturer les snapshots et garder un journal pour corriger les règles de parsing de l'agent (https://hty.sh/).

5) Itérer en petite boucle
- Après un tour de validation, corriger les prompts mal détectés et réessayer. Préparez une checklist minimale d'arrêt (qui débranche le runner) si un comportement dangereux est détecté.

Référence principale : https://hty.sh/ (installez, testez, répétez).

## Angle regional (FR)

- RGPD : les snapshots peuvent contenir des données personnelles (emails, noms). Considérez ces exports comme des traitements de données personnelles ; documentez base légale et finalité. Voir la doc fonctionnelle : https://hty.sh/.
- DPIA : si les sessions exposent des données sensibles, une analyse d'impact est recommandée avant déploiement à large échelle.
- Hébergement : pour limiter les risques de transferts internationaux, privilégiez un hébergement en EU/FR quand vous stockez snapshots ou logs. Gardez une piste d'audit pour toute exportation (https://hty.sh/).

## Comparatif US, UK, FR

| Région | Focus | Contrôles minimaux recommandés |
|---|---:|---|
| US | Conformité sectorielle (selon contexte) | Contrats, gestion des secrets, rétention contrôlée (voir politique interne) — https://hty.sh/ |
| UK | Alignement GDPR post‑Brexit ; vigilance sur transferts | DPIA‑style, justification des transferts, logs d'audit — https://hty.sh/ |
| FR (UE) | GDPR + règles nationales ; DPIA probable | DPIA, minimiser accès, hébergement EU, piste d'audit — https://hty.sh/ |

Observation : quelle que soit la région, sécurisez les secrets et contrôlez l'accès avant toute mise en production ; la doc officielle liste les primitives et comportements attendus : https://hty.sh/.

## Notes techniques + checklist de la semaine

### Hypotheses / inconnues

- hty expose bien des sessions PTY persistantes et fournit `snapshot` et `send` comme primitives documentées (source : https://hty.sh/).
- La skill packagée est accessible via `npx skills add LatentEvals/hty --skill hty` ou via `https://hty.sh/skill.md` (https://hty.sh/).
- Hypothèses opérationnelles à valider en pilote :
  - seuil d'automatisation visé (ex. >= 90%) sur un corpus donné — à valider via expérimentation (ex. 50 runs).
  - fenêtre de rétention initiale proposée (ex. 7 jours) et extension possible jusqu'à 30 jours selon justification.
  - taille du pilote recommandée pour tests initiaux : 1–3 utilisateurs.
  - estimation de mise en place rapide : ~60–90 minutes pour un setup de base + runs répétés pour collecter métriques.
  - tests répétitifs recommandés entre 10–50 répétitions pour mesurer stabilité; cibles temporelles à valider (ex. <5 minutes par run).

(Méthodologie : ces hypothèses servent à cadrer le pilote et proviennent de la pratique recommandée autour des primitives listées sur https://hty.sh/.)

### Risques / mitigations

- Risque : fuite de secrets dans les snapshots/logs. Mitigation : comptes tests, tokens short‑lived, suppression automatique des exports, RBAC strict (https://hty.sh/).
- Risque : exécution de commandes destructrices. Mitigation : exécuter uniquement sur runners isolés, sauvegardes, et utiliser snapshots avant étapes sensibles pour faciliter le rollback.
- Risque : non‑conformité réglementaire ou transferts de données. Mitigation : DPIA si nécessaire, hébergement EU/FR pour données locales, journalisation des accès et exports (https://hty.sh/).

### Prochaines etapes

- [ ] Installer hty sur un runner isolé et vérifier les commandes de base (`hty run`, `hty snapshot`, `hty send`) : https://hty.sh/.
- [ ] Ajouter la skill (`npx skills add LatentEvals/hty --skill hty`) ou pointer l'agent vers `https://hty.sh/skill.md` ; confirmer que l'agent choisit hty pour les flows interactifs.
- [ ] Exécuter deux tests de fumée manuels (scaffolding + auth) et collecter snapshots/erreurs pour itération.
- [ ] Mettre en place comptes de test et tokens éphémères ; configurer suppression automatique des exports / journal d'accès.
- [ ] Documenter un gate de production (conditions minimales, revue sécurité) et planifier une phase non‑prod pour tracer les modes d'échec.

Documentation et référence : https://hty.sh/.
