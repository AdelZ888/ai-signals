---
title: "EverFree : importer Evernote en Markdown, stocker vos notes dans un repo GitHub et utiliser votre clé IA"
date: "2026-08-22"
excerpt: "EverFree importe des cahiers Evernote en Markdown, enregistre les notes comme commits dans un dépôt GitHub que vous contrôlez, et propose un assistant IA BYO (apportez votre clé) ainsi qu’un serveur MCP pour agents."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-22-everfree-import-evernote-to-markdown-store-notes-in-your-github-repo-and-use-a-byo-ai-co-writer.jpg"
region: "UK"
category: "News"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "notes"
  - "productivité"
  - "open-source"
  - "Git"
  - "IA"
  - "EverFree"
  - "UK"
sources:
  - "https://everfree.vercel.app/"
---

## TL;DR en langage simple

- EverFree est une application de prise de notes gratuite, open‑source et « truly $0 » pour l'utilisateur final. Source : https://everfree.vercel.app/.
- Les notes sont stockées comme fichiers Markdown dans votre propre dépôt GitHub ; chaque sauvegarde devient un commit dans ce dépôt. Source : https://everfree.vercel.app/.
- Clients : Mac (DMG), éditeur web, capture mobile — un seul espace de travail synchronisé. Vous pouvez fournir votre propre clé d'IA (BYO). Le client Mac embarque un serveur MCP pour agents. Source : https://everfree.vercel.app/.

Méthodologie : j'ai résumé et repris uniquement les fonctions publiques listées sur la page produit (https://everfree.vercel.app/).

---

## Ce qui a change

- Import Evernote → Markdown : EverFree propose d'importer des carnets Evernote et de convertir les notes en Markdown, facilitant la portabilité. Source : https://everfree.vercel.app/.
- Sauvegarde via Git : chaque sauvegarde est enregistrée comme commit dans votre dépôt GitHub, donnant une piste d'audit native. Source : https://everfree.vercel.app/.
- Multi‑plateforme : Mac (DMG), web et mobile partagent le même workspace synchronisé. Source : https://everfree.vercel.app/.
- BYO IA et agents : l'éditeur accepte votre clé d'IA ("Use your free Gemini key. Pay no one nothing.") et le Mac client inclut un serveur MCP pour que des agents puissent rechercher et écrire dans les notes. Source : https://everfree.vercel.app/.

## Pourquoi c'est important (pour les vraies equipes)

- Propriété et portabilité des données : stocker les notes comme fichiers Markdown dans votre dépôt GitHub vous donne un contrôle direct sur l'export, la copie et la suppression. Source produit : https://everfree.vercel.app/.
- Traçabilité et audit : chaque sauvegarde = commit Git, utile pour audits, restauration et traçabilité des modifications. Source : https://everfree.vercel.app/.
- Responsabilité des coûts IA : EverFree indique que vous fournissez la clé d'IA (BYO). Les coûts d'appels IA sont donc à la charge du titulaire de la clé — cela change la ventilation des coûts et des responsabilités. Source : https://everfree.vercel.app/.
- Gouvernance opérationnelle : décider qui administre le dépôt, qui possède la clé d'IA et quelles règles encadrent les agents MCP devient une exigence de procédure avant un déploiement en production. Source : https://everfree.vercel.app/.

Pratique recommandée pour équipes : nommer un propriétaire de repo, activer la protection de branche et imposer des revues avant d'autoriser des agents à écrire dans le dépôt. Source (fonctionnalité listée) : https://everfree.vercel.app/.

## Exemple concret: a quoi cela ressemble en pratique

Étapes opérationnelles (fonctionnalités visibles sur https://everfree.vercel.app/) :

1. Créez un dépôt GitHub privé pour les notes. Source : https://everfree.vercel.app/.
2. Installez EverFree sur Mac (DMG) ou ouvrez l'éditeur web ; connectez vos appareils au même workspace. Source : https://everfree.vercel.app/.
3. Importez un carnet Evernote ; EverFree convertit les notes en Markdown et crée des commits. Inspectez les premiers commits pour vérifier la granularité. Source : https://everfree.vercel.app/.
4. Configurez votre clé d'IA dans l'interface (ne la stockez pas dans le repo). Testez l'assistant sur résumés courts. Source : https://everfree.vercel.app/.
5. Pour le serveur MCP, démarrez par un mode restreint (revues humaines avant écriture automatique) puis étendez après pilote validé. Source (présence du serveur MCP) : https://everfree.vercel.app/.

Extrait utile :

```
deploy() { vercel --prod }
```

Bonnes pratiques rapides : commencer avec 1 carnet pilote, valider la conversion Markdown et contrôler les premiers commits. Source : https://everfree.vercel.app/.

## Ce que les petites equipes et solos doivent faire maintenant

Conseils concrets pour fondateurs solo et petites équipes (actionnables, basés sur les capacités publiques d'EverFree : https://everfree.vercel.app/) :

1) Pilote minimal et validation
- Action : importez 1 carnet Evernote dans un dépôt GitHub privé, ouvrez EverFree (web ou Mac) et vérifiez la structure Markdown et les premiers fichiers. Source : https://everfree.vercel.app/.
- Pourquoi : confirme la qualité de conversion et évite des surprises à grande échelle.

2) Protéger la clé IA (BYO)
- Action : ne stockez jamais la clé dans le dépôt. Placez la clé dans les GitHub Secrets ou un coffre chiffré (1 secret par projet). Configurez un scanner de secrets et un hook pre‑commit pour bloquer les commits accidentels.
- Pourquoi : EverFree requiert une clé BYO ; la responsabilité financière et sécuritaire revient à celui qui détient la clé. Source : https://everfree.vercel.app/.

3) Démarrer MCP en mode contrôlé
- Action : exécutez le serveur MCP en mode lecture seule ou avec revue humaine pour les premières 1–2 semaines de tests. N'autorisez l'écriture automatique qu'après un pilote validé.
- Pourquoi : le serveur MCP permet à des agents d'interroger et d'écrire dans vos notes ; un mode restreint réduit le risque de modification non souhaitée. Source : https://everfree.vercel.app/.

4) Gouvernance légère et sauvegardes
- Action : définissez 1 propriétaire de repo et 1 réviseur ; activez la protection de branche et exportez régulièrement une archive locale. Documentez qui paie la clé d'IA.

5) Mesure et budget initial
- Action : exécutez 1–3 prompts tests courts pour mesurer fréquence et coût avant un déploiement. Évaluez les coûts d'usage et fixez un plafond budgétaire simple.

Checklist rapide :
- [ ] Importer 1 carnet Evernote dans un repo privé et vérifier la conversion (Markdown)
- [ ] Placer la clé BYO dans un coffre sécurisé (ne pas committer)
- [ ] Lancer MCP en mode restreint et valider les propositions d'agent

Référence produit : https://everfree.vercel.app/.

## Angle regional (UK)

Points pratiques pour équipes au Royaume‑Uni (liés aux fonctions publiques d'EverFree : https://everfree.vercel.app/) :

- PII et prompts : considérez les notes comme potentiellement sensibles, car les prompts et le contenu peuvent inclure des données personnelles. Source : https://everfree.vercel.app/.
- UK GDPR : documentez la base légale et la durée de conservation. Pour les éléments sensibles, chiffrez côté client avant synchronisation.
- Transferts d'IA : si vous appelez un fournisseur d'IA hors du Royaume‑Uni via la clé BYO, vérifiez les règles de transfert et anonymisez les données si nécessaire.

Recommandation opérationnelle : dépôts privés + chiffrement côté client pour éléments sensibles + journalisation des accès pour audit. Source : https://everfree.vercel.app/.

## Comparatif US, UK, FR

| Région | Priorité principale | Mesure immédiate recommandée | Référence produit |
|---|---:|---|---|
| US | Conformité sectorielle (santé/finance) | Repo privé, audit des commits, protection des secrets | https://everfree.vercel.app/ |
| UK | UK GDPR, transferts internationaux | Chiffrement côté client, durée de conservation documentée | https://everfree.vercel.app/ |
| FR | CNIL, traçabilité | Journalisation renforcée, éviter les données personnelles en clair | https://everfree.vercel.app/ |

Points communs : ne pas committer de clés, garder les repos privés et utiliser l'historique Git pour l'audit. Source : https://everfree.vercel.app/.

## Notes techniques + checklist de la semaine

Résumé technique : EverFree est un client de prise de notes gratuit et open‑source qui importe Evernote en Markdown, synchronise via commits Git vers votre dépôt GitHub, propose un DMG Mac, un éditeur web, une capture mobile, accepte une clé BYO pour l'IA et inclut un serveur MCP pour agents. Source : https://everfree.vercel.app/.

Checklist opérationnelle (semaine 0 → validation) :

- [ ] Importer un carnet Evernote dans un repo privé ; vérifier les 10 premiers commits.
- [ ] Scanner le repo pour secrets et placer la clé BYO dans un coffre sécurisé.
- [ ] Faire 1–3 prompts tests courts et mesurer l'impact (usage/coût).
- [ ] Démarrer MCP en lecture seule ; inspecter les propositions d'agent avant toute écriture automatique.

### Hypotheses / inconnues

- Hypothèse : les coûts des appels IA sont facturés au titulaire de la clé (interprétation de « Use your free Gemini key. Pay no one nothing. »). Source : https://everfree.vercel.app/.
- Hypothèse chiffrée (recommandation) : valider 10–20 fichiers convertis lors d'un pilote avant d'étendre l'import.
- Inconnue : comportement exact en cas de conflits de commits simultanés entre appareils (à valider par tests de synchronisation).
- Inconnue : politique par défaut du serveur MCP lorsque plusieurs agents proposent des modifications simultanées.
- Recommandation budgétaire hypothétique : commencer avec un plafond d'essai (par ex. $50) et 1 semaine de pilote pour mesurer consommation de tokens / appels.

### Risques / mitigations

- Risque : commit accidentel de clés/API. Mitigation : hooks pre‑commit, scanners de secrets, stockage dans GitHub Secrets ou coffre chiffré.
- Risque : fuite de données sensibles (PII). Mitigation : dépôts privés, chiffrement côté client pour éléments sensibles, revue des imports Evernote.
- Risque : agents qui modifient du contenu sans contrôle. Mitigation : MCP en lecture seule au départ, revue humaine systématique pour les premières actions.

### Prochaines etapes

- [ ] Lancer un import ciblé : 1 carnet Evernote → 1 repo privé ; valider la conversion Markdown.
- [ ] Sécuriser la clé BYO dans un coffre et exécuter 1–3 tests courts pour mesurer l'usage.
- [ ] Tester MCP en mode restreint, examiner les logs et définir la règle d'activation de l'écriture automatique.

Référence principale : https://everfree.vercel.app/.
