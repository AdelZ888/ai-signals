---
title: "Microsoft et syndicats enseignants : dix principes de confidentialité AI pour les écoles — ce que cela signifie pour les emplois et les produits"
date: "2026-09-17"
excerpt: "Microsoft a convenu avec l AFT/UFT d un ensemble de dix principes applicables à l usage de l IA dans les écoles : pas d entraînement sur les données d élèves/enseignants, collecte limitée, interdiction de certains « compagnons » IA et divulgations claires aux familles. Ce mémo explique ce que cela implique pour enseignants, DSI, fondateurs et équipes produit."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-17-microsoft-and-aftuft-set-ten-enforceable-ai-privacy-principles-for-schools-obligations-for-teachers-it-and-vendors.jpg"
region: "US"
category: "Model Breakdowns"
series: "security-boundary"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "SOCIETY"
tags:
  - "IA"
  - "confidentialite"
  - "edtech"
  - "education"
  - "conformite"
  - "GDPR"
  - "policy"
sources:
  - "https://www.theverge.com/policy/992359/microsoft-aft-schools-ai-privacy"
---

## TL;DR (emploi + personnes, langage simple)

- Ce qui s'est passé : The Verge rapporte un accord entre Microsoft et des syndicats d'enseignants (AFT/UFT) qui définit dix principes pour l'usage de l'IA en milieu scolaire, y compris un engagement à ne pas entraîner les modèles sur les données d'élèves et une interdiction de certains « compagnons IA ». Source : https://www.theverge.com/policy/992359/microsoft-aft-schools-ai-privacy

- Qui est directement concerné au travail (emplois, postes et tâches concrètes) :
  - Enseignant / professeur : concevoir devoirs, collecter copies, corriger, décider des outils autorisés.
  - Assistant pédagogique / aide-éducateur / bibliothécaire : préparer ressources, uploader contenus, gérer comptes élèves.
  - DSI / responsable informatique : piloter déploiements, gérer identités, appliquer restrictions réseau.
  - Juriste / DPO / responsable conformité : vérifier contrats, rédiger avenants, valider avis de confidentialité.
  - Achats / procurement / contract manager : négocier clauses, exiger attestations écrites.
  - Fondateur EdTech / product manager : définir defaults produit, séparer pipelines d'entraînement, rédiger CGU et avenants.
  - Commercial / account manager : fournir preuves et FAQ aux établissements.
  Source : https://www.theverge.com/policy/992359/microsoft-aft-schools-ai-privacy

- Exemple opérationnel : un professeur n'autorise pas un chatbot pour soumettre ou corriger un devoir si le fournisseur ne fournit pas d'attestation écrite indiquant que les données d'élèves ne serviront pas à entraîner les modèles et une fiche d'information pour les parents. Source : https://www.theverge.com/policy/992359/microsoft-aft-schools-ai-privacy

## Ce que disent vraiment les sources

The Verge rapporte un ensemble de dix principes négociés entre Microsoft et des syndicats scolaires (AFT/UFT). De l'extrait on retient principalement :

- engagement explicite à ne pas entraîner les modèles sur les données d'élèves et d'enseignants ;
- restrictions partagées sur la collecte et la conservation des données ;
- interdiction de fonctions de « compagnon IA » dans certains contextes scolaires ;
- exigence de divulgations lisibles et compréhensibles pour les familles.

Ces principes sont décrits comme utilisables comme avenants contractuels par les districts lors d'achats ou de pilotes. Méthodologie : je me limite à l'extrait cité de The Verge. Source : https://www.theverge.com/policy/992359/microsoft-aft-schools-ai-privacy

## Quelles taches sont exposees vs quels emplois changent plus lentement

Tâches à risque élevé (impact rapide sur travail/emploi) :
- Autoriser des chatbots, tuteurs IA et « assistants » accessibles aux élèves (enseignant, DSI, product manager). Source : https://www.theverge.com/policy/992359/microsoft-aft-schools-ai-privacy
- Téléversement d'exercices, copies, images ou médias d'élèves vers des services cloud externes (enseignant, assistant pédagogique).
- Lancer des pilotes commerciaux sans revue juridique et sans information aux familles (achats, chef de projet pédagogique).

Tâches qui évolueront plus lentement (cycles organisationnels longs) :
- Négociation d'avenants-types à l'échelle d'un district ou d'un État (juridique, achats) — cycles en semaines/mois.
- Refonte des cursus et formation continue des enseignants pour intégrer l'usage sûr de l'IA (direction pédagogique, formation).

Tableau de décision rapide (rôles vs contrôle recommandé) :

| Tâche exposée | Rôles impliqués | Urgence | Contrôle recommandé |
|---|---:|---:|---|
| Déployer chatbot auprès d'élèves | Enseignant, DSI, Product Manager | Élevée | Avenant signé + FAQ parents + journal de pilote |
| Collecte de copies pour correction IA | Enseignant, Assistant pédagogique | Élevée | Interdiction d'uploads sans attestation fournisseur |
| Pilote commercial multi-district | Achats, Juridique, Commercial | Moyenne | Revue juridique + SLA clairs |

Source : https://www.theverge.com/policy/992359/microsoft-aft-schools-ai-privacy

## Trois personas concrets (scenarios 2026)

Persona 1 — DSI de district (US, district moyen)
- Tâches quotidiennes : gestion des comptes élèves (création/suppression), approbation de déploiements, rédaction des politiques d'accès.
- Décision concrète : refuser tout pilote impliquant élèves sans avenant reprenant les dix principes et une fiche d'information destinée aux familles.
- Impact attendu sur le travail : réduction des pilotes non conformes; l'équipe IT devra tenir un registre des cohortes et des comptes. Source : https://www.theverge.com/policy/992359/microsoft-aft-schools-ai-privacy

Persona 2 — Professeur de lettres (lycée, UK)
- Tâches : concevoir devoirs, collecter copies, corriger en présentiel/numérique, communiquer aux parents.
- Décision concrète : n'utiliser un outil de correction ou de collecte que si le fournisseur fournit une attestation écrite qu'il n'utilise pas ces données pour entraîner ses modèles et une fiche parentale lisible.
- Impact travail : requalification des procédures de collecte des devoirs et documentation des usages par classe. Source : https://www.theverge.com/policy/992359/microsoft-aft-schools-ai-privacy

Persona 3 — Fondateur EdTech (France)
- Tâches : définir defaults produit, séparer pipelines d'entraînement, rédiger CGU/avenant, former commerciaux.
- Décision concrète : par défaut désactiver l'entraînement sur inputs élèves, préparer un avenant type et une FAQ en français, adapter flows de vente.
- Impact product/vente : nécessité d'un gate produit pour bloquer tout déploiement élèves tant qu'un avenant et une FAQ ne sont pas fournis. Source : https://www.theverge.com/policy/992359/microsoft-aft-schools-ai-privacy

## Ce que les salaries doivent faire maintenant

Pour enseignants et personnels de classe (tâches & postes) :
- Ne pas autoriser d'uploads d'élèves vers un service externe sans preuve écrite sur l'usage des données (attestation fournisseur). Source : https://www.theverge.com/policy/992359/microsoft-aft-schools-ai-privacy
- Tenir un journal d'usage simple (qui / quelle classe / combien d'élèves / dates) pour chaque pilote.
- Eviter de partager audio/vidéo sensible sans validation juridique (responsable de scolarité, DPO).

Pour IT, Achats, Juridique :
- Exiger revue juridique avant tout pilote impliquant des élèves ; demander une FAQ pour les familles et droits d'audit.
- Mettre en place un registre centralisé (qui, quoi, quand, fournisseur, avenant signé).

Checklist opérationnelle courte (enseignants + IT) :
- Fournisseur fournit une FAQ claire destinée aux familles (1 page). [Source: https://www.theverge.com/policy/992359/microsoft-aft-schools-ai-privacy]
- Fournisseur confirme par écrit si les contributions élèves servent à entraîner les modèles.
- Pilote limité à une cohorte documentée.
- Avenant signé par achats/juridique avant déploiement.

## Ce que les fondateurs et managers doivent faire maintenant

Produit & ingénierie (product manager, lead dev, architecte) :
- Prioriser la minimisation des données : séparer logs d'usage et pipelines d'entraînement, désactiver par défaut tout entraînement sur inputs élèves.
- Mettre en place un gate de lancement qui bloque tout déploiement élèves tant qu'un avenant et une FAQ ne sont pas fournis. Source : https://www.theverge.com/policy/992359/microsoft-aft-schools-ai-privacy

Juridique & ventes (legal counsel, head of sales, account managers) :
- Rédiger un avenant basé sur les dix principes : clauses sur entraînement, conservation, divulgation et droits d'audit.
- Former commerciaux et account managers à négocier avec districts et syndicats.

Support & opérations (ops, CRM admin) :
- Tracker dans le CRM les pilotes : école, classe, nombre d'élèves, dates, avenants signés; produire rapports pour achats/juridique.

Source : https://www.theverge.com/policy/992359/microsoft-aft-schools-ai-privacy

## Angle France / US / UK

- US : levier contractuel et syndical — districts et syndicats peuvent exiger des avenants fondés sur les dix principes ; postes clés : juriste de district, DSI, acheteur. Source : https://www.theverge.com/policy/992359/microsoft-aft-schools-ai-privacy

- UK : coordonner équipes pédagogiques, DPO et autorités locales ; prévoir une analyse d'impact sur la protection des données (DPIA) et une FAQ parentale avant toute expérimentation (chef d'établissement, DPO, head of IT). Source : https://www.theverge.com/policy/992359/microsoft-aft-schools-ai-privacy

- France / UE : angle RGPD — clarifier contrats de sous-traitance, base légale, durée de conservation ; rôles clés : DPO, juriste, product manager. Source : https://www.theverge.com/policy/992359/microsoft-aft-schools-ai-privacy

## Checklist et prochaines etapes

### Hypotheses / inconnues

- L'article mentionne dix principes négociés, y compris l'engagement à ne pas entraîner les modèles sur données élèves/enseignants (10 = nombre de principes cité). Source : https://www.theverge.com/policy/992359/microsoft-aft-schools-ai-privacy
- Paramètres opérationnels non fournis dans l'extrait : quotas/tailles de cohortes, durées de conservation, fréquence d'audit. Les valeurs ci‑dessous sont des hypothèses à valider localement :
  - 0% d'entraînement sur inputs élèves (politique cible hypothétique).
  - Rétention temporaire testée : 30 jours de logs avant purge automatique (hypothèse).
  - Taille pilote typique : 25 élèves / classe (hypothèse de gestion opérationnelle).
  - Seuil d'information parentale : viser 90% de parents informés/consultés pour pilotes (hypothèse d'engagement).
  - Vérification technique : audit trimestriel (4 fois/an) comme hypothèse de fréquence.

### Risques / mitigations

- Risque : déclarations fournisseurs ambiguës sur l'entraînement.
  - Mitigation : exiger attestations écrites, droits d'audit et evidence technique pendant le pilote.
- Risque : confusion chez enseignants et familles sur les usages.
  - Mitigation : FAQ d'une page par langue + réunion d'information courte (par ex. 10–15 minutes) avant lancement (hypothèse de format). 
- Risque : defaults produit collectent trop de données.
  - Mitigation : modifier defaults pour minimisation, activer purge automatique et exiger opt-in explicite pour entraînement.

### Prochaines etapes

Pour DSI / Achats : imposer une gate d'achat en 5 questions opérationnelles (examen juridique requis) et n'autoriser aucun pilote sans avenant signé. Source : https://www.theverge.com/policy/992359/microsoft-aft-schools-ai-privacy

Pour enseignants : tenir un journal d'usage d'une page par pilote, exiger une FAQ parentale et une attestation écrite avant tout upload d'élèves.

Pour fondateurs / produit / ventes : produire un package avenant + FAQ, modifier defaults produit pour éviter l'usage d'inputs élèves en entraînement, et former l'équipe commerciale à négocier avec les districts.

Checklist rapide à implémenter :
- [ ] Fournisseur fournit une divulgation claire destinée aux familles
- [ ] Fournisseur confirme par écrit si les inputs élèves servent à l'entraînement des modèles
- [ ] Droits d'audit ou attestations disponibles pour examen
- [ ] Politique de minimisation et de rétention des données documentée
- [ ] Avenant contractuel reprenant les principes rapportés signé avant pilote

Note : l'extrait de The Verge fournit un cadre de principes et un exemple de levier contractuel; traduisez ces principes en tâches concrètes (avenants, FAQ, gates opérationnels) avant tout déploiement impliquant des élèves. Source : https://www.theverge.com/policy/992359/microsoft-aft-schools-ai-privacy
