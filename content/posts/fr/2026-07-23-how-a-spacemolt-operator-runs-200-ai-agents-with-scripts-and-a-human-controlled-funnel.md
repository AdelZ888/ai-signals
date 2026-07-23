---
title: "Comment un opérateur SpaceMolt gère ~200 agents IA avec des scripts et un entonnoir humain"
date: "2026-07-23"
excerpt: "Résumé et bonnes pratiques tirées du portrait de Brocktree (SpaceMolt): privilégier des scripts déterministes pour les tâches fréquentes, centraliser les décisions majeures via un bot entonnoir et garder l’humain pour les choix macro."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-23-how-a-spacemolt-operator-runs-200-ai-agents-with-scripts-and-a-human-controlled-funnel.jpg"
region: "FR"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "IA"
  - "agents"
  - "opération"
  - "scripts"
  - "automatisation"
  - "SpaceMolt"
  - "ops"
  - "FR"
sources:
  - "https://spacemolt.com/news/operator-spotlight-brocktree"
---

## TL;DR en langage simple

- SpaceMolt a publié le portrait d’opérateur « Scripts Are Cheaper Than Tokens » le 21/07/2026. Source : https://spacemolt.com/news/operator-spotlight-brocktree
- Constat concret : Brocktree orchestre une ruche d’environ 200 agents (≈160 mineurs, ≈40 transporteurs). Un bot centralise tout l’inventaire et n’a pas bougé depuis la semaine de lancement. (https://spacemolt.com/news/operator-spotlight-brocktree)
- Choix clé : déplacer les boucles fréquentes du modèle vers des scripts déterministes. Voir le guide des skills : https://spacemolt.com/skill.md
- Effet attendu : comportements plus prévisibles et moins d’appels au modèle (donc moins de coûts liés aux tokens).

Exemple court (scénario) : vous êtes seul·e. Vous identifiez la tâche « miner puis déposer ». Vous écrivez un script simple qui fait miner 5 cycles puis retourne déposer automatiquement. Déployez-le sur 5 agents. Si tout fonctionne 72 heures, vous augmentez à 20 agents. Ce scénario suit la méthode rapportée par Brocktree. (https://spacemolt.com/news/operator-spotlight-brocktree)

Plain-language explanation (avant les détails avancés) : l’idée est simple. Les décisions stratégiques restent humaines. Les opérations répétitives (déplacements, collecte, dépôt) deviennent des scripts exécutés localement. Cela réduit la variabilité et le nombre d’appels à des modèles coûteux.

## Ce qui a change

- Le portrait (21/07/2026) montre une architecture « opérateur + essaim » : l’humain garde la planification macro, les agents exécutent des scripts définis. (https://spacemolt.com/news/operator-spotlight-brocktree)
- Chiffres rapportés : ~200 agents ; répartition ≈160 mineurs / ≈40 haulers (transporteurs) ; certains trajets de transport prennent moins de 10 minutes. (https://spacemolt.com/news/operator-spotlight-brocktree)
- Pratique mise en avant : remplacer des appels LLM répétés par des scripts déterministes pour les boucles fréquentes. Guide des skills recommandé : https://spacemolt.com/skill.md

Impact immédiat : baisse des appels au modèle, boucles plus prévisibles, intervention humaine ciblée sur les décisions importantes.

## Pourquoi c'est important (pour les vraies equipes)

- Prévisibilité : les scripts rendent les comportements répétitifs déterministes. Cela facilite le diagnostic et la correction d’incidents. (https://spacemolt.com/news/operator-spotlight-brocktree)
- Contrôle des coûts : moins d’appels au modèle signifie moins de consommation de tokens et donc de dépenses. Le titre de l’article l’illustre : « Scripts Are Cheaper Than Tokens ». (https://spacemolt.com/news/operator-spotlight-brocktree)
- Opérabilité : centraliser les états importants (par ex. un bot entonnoir qui reçoit tout) permet d’agir rapidement et en sécurité.

Note sur vocabulaire : LLM = modèle de langage large. RGPD = Règlement Général sur la Protection des Données.

## Exemple concret: a quoi cela ressemble en pratique

Données du portrait : ~200 agents ; ≈160 mineurs ; ≈40 transporteurs ; bot entonnoir immobile depuis le lancement. (https://spacemolt.com/news/operator-spotlight-brocktree)

Décision simple à implémenter : séparer « plan » et « exécution ». Exemple de tableau décisionnel minimal :

| Condition | Action scriptée | Escalader à l’humain |
|---|---:|---|
| Combat détecté | Se replier automatiquement | Escalader si hostiles > 3 |
| Backlog de l’entonnoir > 50 items | Lancer X transporteurs | Escalader si backlog > 200 pendant 10+ min |
| Besoin de refit | Retour base et file d’attente | Escalader si refit échoue 3x |

Exemple de boucle mineur (concept simplifié, inspiré du guide) :

```
while True:
  target = find_nearest_resource()
  travel_to(target)
  if detect_hostiles():
    shelter_and_report()
    continue
  mine_for(standard_cycle)
  if cargo_full():
    return_to_funnel()
    deposit_cargo()
  wait(short_cooldown)
```

Points pratiques à retenir :
- Testez d’abord sur 5–10 agents avant d’élargir.
- Mesurez appels API au modèle (compteurs), taux d’échec et réussite des dépôts sur 24–72 h.
- Visez une latence d’exécution locale faible pour les boucles critiques si possible.

Sources : portrait SpaceMolt et guide skills. (https://spacemolt.com/news/operator-spotlight-brocktree, https://spacemolt.com/skill.md)

## Ce que les petites equipes et solos doivent faire maintenant

Ordre d’action rapide :

1) Identifier une boucle critique à automatiser (30–90 minutes d’observation). Exemple : collecte + dépôt. Inspirez‑vous du portrait SpaceMolt. (https://spacemolt.com/news/operator-spotlight-brocktree)
2) Écrire un script déterministe pour cette boucle. Déployer en pilote sur 5 agents.
3) Mesurer pendant 24–72 h : nombre d’appels LLM, erreurs/minute, taux de réussite de dépôt (%).
4) Définir règles d’escalade simples (seuils) et un override humain en 1 clic.
5) Itérer : si stable 72 h, augmenter le nombre d’agents par paliers (5 → 20 → 100+).

Checklist rapide pour solo :

- [ ] Documenter 1 playbook opérateur (1 page)
- [ ] Transformer 1 boucle en script et déployer 5 agents
- [ ] Mesurer appels LLM et taux d’échec sur 72 h
- [ ] Définir 3 règles d’escalade et un bouton override

## Angle regional (FR)

- Traduisez et localisez le playbook et les messages d’alerte en français pour les utilisateurs locaux. (https://spacemolt.com/news/operator-spotlight-brocktree)
- Respect RGPD : pseudonymisez les identifiants et minimisez la télémétrie avant tout partage. Réduction de la période de rétention recommandée en phase pilote (7–30 jours).
- Soyez explicite sur les décisions humaines : publiez un résumé clair indiquant quand l’opérateur intervient.

## Comparatif US, UK, FR

- US : forte priorité donnée à la réduction des coûts et au scale. L’angle « scripts cheaper » cadre avec cet objectif. (https://spacemolt.com/news/operator-spotlight-brocktree)
- UK : plus d’attention sur l’auditabilité et l’historique des décisions (horodatage, journaux immuables pour les escalades).
- FR (UE) : priorité sur la protection des données et la transparence en français ; privilégiez la pseudonymisation et des durées de rétention courtes.

Choisissez le bon compromis entre coût, conformité et confiance avant d’augmenter la taille de l’essaim.

## Notes techniques + checklist de la semaine

### Hypotheses / inconnues

- Faits établis (source) : article du 21/07/2026 ; ~200 agents ; ≈160 mineurs ; ≈40 transporteurs ; bot entonnoir immobile depuis le lancement. (https://spacemolt.com/news/operator-spotlight-brocktree)
- Hypothèse chiffrée à tester : réduire de 40–60% l’usage de tokens si on remplace les appels fréquents par des scripts. Mesurer via compteurs d’appels API.
- Hypothèse opérationnelle : un opérateur solo peut superviser N agents si les alertes restent < 1/minute et si l’entonnoir centralise l’état essentiel.
- Hypothèse de performance : viser latence < 200 ms sur les boucles locales critiques.

### Risques / mitigations

- Risque : l’entonnoir devient un point de défaillance unique (SPOF, Single Point Of Failure). Mitigation : sauvegarde d’état, réplication, basculement automatisé.
- Risque : explosion d’alertes pour l’opérateur solo. Mitigation : batching d’alertes, priorisation par sévérité, seuils adaptatifs.
- Risque : non‑conformité RGPD. Mitigation : pseudonymisation, minimisation des données, politique de rétention (7–30 jours en phase pilote).

### Prochaines etapes

- Jour 0 : lire le portrait SpaceMolt et le guide de skills (https://spacemolt.com/news/operator-spotlight-brocktree, https://spacemolt.com/skill.md).
- Jour 1 : rédiger le playbook opérateur (1 page) et définir 3 règles d’escalade.
- Jours 2–3 : coder 1 script executor, déployer 5–10 agents, collecter métriques (appels LLM, erreurs/min, réussite dépôt %).
- Jours 4–7 : itérer sur seuils, ajouter override one‑click, décider extension progressive (5 → 20 → 100+).

Checklist technique de la semaine :

- [ ] Lire article + guide (https://spacemolt.com/news/operator-spotlight-brocktree, https://spacemolt.com/skill.md)
- [ ] Définir playbook opérateur 1 page
- [ ] Écrire 1 script executor pour la boucle la plus fréquente
- [ ] Déployer pilote observable (5–10 agents) et collecter métriques
- [ ] Mettre en place sauvegarde/replication pour l’entonnoir

Si vous le voulez, je peux générer le template du playbook opérateur (1 page en français) et un schéma d’alerte JSON prêt à intégrer dans votre stack de monitoring.
