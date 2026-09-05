---
title: "La Corée du Sud lance « AI for Everyone » : chatbot national gratuit avec minimum 50 % de modèles domestiques"
date: "2026-09-05"
excerpt: "Séoul a ouvert un appel d'offres pour un chatbot national gratuit et illimité destiné aux 52M d'habitants, exigeant ≥50% de modèles domestiques, 2–3 lauréats et jusqu'à 512 GPU Nvidia B200 par gagnant."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-05-south-korea-opens-ai-for-everyone-procurement-for-a-free-national-chatbot-with-50percent-domestic-models.jpg"
region: "FR"
category: "News"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "IA"
  - "gouvernement"
  - "procurement"
  - "startups"
  - "Corée du Sud"
  - "cloud"
  - "modèles locaux"
  - "politique publique"
sources:
  - "https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models"
---

## TL;DR en langage simple

- La Corée du Sud va offrir un chatbot d'IA gratuit à tous ses 52 000 000 d'habitants ; le programme s'appelle « AI for Everyone ». (Source : https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models)
- Exigences clés : au moins 50 % du service doit reposer sur des modèles domestiques ; 2–3 fournisseurs seront sélectionnés ; le gouvernement peut allouer jusqu'à 512 GPU Nvidia B200 par lauréat en contrepartie d'un financement matching. (Source : https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models)
- Calendrier public : appel d'offres ouvert (date limite indiquée publiquement dans le dossier), bêta prévue en septembre 2026, déploiement complet d'ici fin 2026, contrat jusqu'en 2030. (Source : https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models)

Méthodologie : synthèse factuelle à partir du résumé public (TNW) cité ci‑dessus.

## Ce qui a change

Séoul a publié un dossier d'appel d'offres pour fournir un chatbot illimité et un agent de service public à 52 000 000 de résidents. Points obligatoires extraits du résumé : 50 % minimum de capacité via modèles domestiques, 2–3 lauréats, jusqu'à 512 GPU B200 par lauréat avec matching financier, bêta en septembre 2026, contrat opérationnel jusqu'en 2030. (Source : https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models)

Conséquences immédiates : les fournisseurs doivent prouver la part locale (par une métrique à définir), préparer un plan CAPEX/OPEX pour le matching GPU, et être prêts à tests d'échelle (1 000 000+ requêtes/jour dans certains scénarios d'usage citées dans le dossier public). (Source : https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models)

## Pourquoi c'est important (pour les vraies equipes)

- Échelle : concevoir pour 52 000 000 d'usagers change l'architecture, l'observabilité et le SRE.
- Contraintes locales : le seuil >=50 % impose une preuve (tokens, sessions ou temps d'inférence). Anticipez audits et métriques (logs signés, dashboard). (Source : https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models)
- Matériel & finance : jusqu'à 512 GPU B200 disponibles mais exigent un matching — planifiez un budget pour couvrir au moins une partie du CAPEX attendu. (Source : https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models)
- Opérations : SLO recommandés plausibles — disponibilité >= 99 %, latence médiane 100–300 ms ; tests de charge continus et playbooks d'incident sont nécessaires.

Pour les équipes produit et infra : définir métrique locale (tokens vs inférences), chiffrer coût par million de requêtes, et préparer des runbooks d'escalade.

## Exemple concret: a quoi cela ressemble en pratique

Scénario type pour un candidat (startup locale) répondant à l'appel d'offres. (Source : https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models)

1) Offre technique
- Déclaration officielle : >=50 % de la capacité via modèles domestiques, métrique retenue (par ex. tokens traités). Indiquer SLA d'inférence (médiane 150 ms) et throughput cible (10 000 req/s pic).
- Preuves : contrats partenaires locaux, logs d'hébergement, snapshots de modèle, benchmarks de latence et tokens/sec.

2) Plan financier & matériel
- Montrer le matching financier pour jusqu'à 512 GPU ; ajouter scénario de secours si seul 50 % du matching est obtenu.
- Calculer coût par million de requêtes et projection OPEX 12–36 mois.

3) Déploiement
- Roadmap : staging → bêta (septembre 2026) → production (fin 2026) ; canary releases pour 1–5 % du trafic initial.
- Tests : montée en charge progressive jusqu'à 1 000 000+ requêtes/jour, tests d'isolement des modèles domestiques.

4) Transparence
- Tableaux de bord publics (répartition domestique vs tiers), runbooks d'incident, rapports d'audit périodiques.

## Ce que les petites equipes et solos doivent faire maintenant

Conseils concrets, actionnables et réalistes pour solo founders / petites équipes (7–28 jours). (Source : https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models)

1) Vendre des modules plutôt que viser la sélection directe
- Priorité : proposer un composant exportable (auth, monitoring, connecteur modèle, dataset annoté). Les petites équipes peuvent générer $10k–$200k de revenus en vendant composants aux lauréats.

2) Obtenir preuves et engagements rapides
- Contactez au moins 1 fournisseur de modèle domestique et 1 intégrateur ; obtenez une LOI (7 jours). Préparez un petit POC (1–2 semaines) démontrant 1 000–10 000 phrases ou 10k tokens de performance.

3) Packager un asset réutilisable
- Construisez en 2–4 semaines : dataset coréen (1 000–10 000 phrases), un connecteur d'authentification conforme, ou module de monitoring avec alertes < 300 ms.

4) Estimer et réduire le besoin compute
- Faire une gap analysis compute vs référence 512 GPU (60 minutes). Proposez des architectures hybrides edge/cloud pour réduire le besoin immédiat de GPU.

5) Former des alliances commerciales
- Si vous êtes solo, rejoignez un consortium ou sous-traitez comme fournisseur de composants ; candidater en solo contre 2–3 candidats nationaux exige souvent >millions $ d'investissement.

Checklist opérationnelle immédiate :
- [ ] Contacter 1 fournisseur modèle domestique + 1 intégrateur (7 jours)
- [ ] Obtenir LOI (7 jours)
- [ ] Packager un actif exportable (2–4 semaines)
- [ ] Rédiger pitch 2 pages (% domestique, plan matching GPU, runbook ops)
- [ ] Gap analysis compute vs 512 GPU (60 minutes)

Remarque commerciale : vendre des composants aux lauréats est généralement une voie plus accessible que concourir seul.

## Angle regional (FR)

Impacts pour la France et actions pertinentes pour les équipes françaises. (Source : https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models)

- Preuve de localisation : préparez logs d'inférence, contrats d'hébergement en France/UE, audits RGPD et documents CNIL ; ils deviennent des arguments commerciaux pour marchés B2G.
- Packager offres B2G : audits de conformité, preuve d'hébergement, runbooks métiers, SLA clairs (>= 99 % disponibilité, latence cible 100–300 ms).
- Penser partenariats transfrontaliers : fournir des modules ou services (monitoring, fine-tuning, audits) aux lauréats coréens plutôt que concurrencer à grande échelle.

## Comparatif US, UK, FR

Comparaison synthétique : Corée vs autres approches nationales/regionales. (Source : https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models)

| Pays | Échelle cible | Plancher local | Soutien matériel | Horizon temporel |
|------|--------------:|:--------------:|:----------------:|:-----------------:|
| Corée du Sud | 52 000 000 | >=50 % modèles domestiques | Jusqu'à 512 GPU B200 / lauréat (matching) | Bêta sept 2026, full fin 2026, contrat jusqu'en 2030 |
| États‑Unis | Agences / pilotes | Rarement national | Peu d'offres matérielles centrales | Pilotes par agence |
| Royaume‑Uni | Agences / régions | Variable | Généralement non centralisé | Marchés locaux |
| France | Régions / ministères | Contraintes RGPD/CNIL | Non centralisé | Marchés publics existants |

Orientation pratique : concourir en Corée demande capitaux importants (matching GPU, coûts d'opération), tandis que fournir des composants ou services (conformité, monitoring) est une stratégie plus accessible pour petites équipes.

Source pour comparaison et faits clés : https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models

## Notes techniques + checklist de la semaine

### Hypotheses / inconnues

- Hypothèse : la méthode officielle pour calculer le seuil >=50 % (par tokens, sessions ou temps d'inférence) n'est pas précisée dans le résumé public et doit être confirmée dans le dossier complet. (Source : https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models)
- Confirmé : jusqu'à 512 GPU Nvidia B200 par lauréat et exigence de matching financier ; contrat jusqu'en 2030. (Source : https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models)
- Données d'usage citées dans le résumé : ~66 % des Coréens ont déjà testé l'IA ; 44,5 % (~23 000 000) utilisent la génération d'IA régulièrement ; ChatGPT = 23,45 M utilisateurs en Corée, Gemini = 8,45 M, Claude = 2,41 M ; 1,8 M paient pour ces services. (Source : https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models)

### Risques / mitigations

Risques principaux :
- Échec administratif si vous ne prouvez pas >=50 % de capacité domestique.
- Incapacité à financer le matching pour 512 GPU (CAPEX élevé).
- Surcharge au lancement national (pic >1 000 000 requêtes/jour).

Mitigations proposées :
- Sécuriser LOI de fournisseurs locaux et partenaires d'hébergement.
- Modéliser coûts pour 512 GPU et proposer architectures hybrides pour diminuer le besoin immédiat.
- Lancer par paliers (canary 1–5 %), playbooks d'incident et redondance multi‑zone.

### Prochaines etapes

- [ ] Lire le dossier complet d'appel d'offres et Q&A ; clarifier la métrique >=50 % et la date limite des candidatures. (Source : https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models)
- [ ] Gap analysis (60 minutes) : couverture modèles domestiques vs exigence, compute vs référence 512 GPU.
- [ ] Rédiger pitch 2 pages : % domestique proposé, plan de matching GPU, runbook ops.
- [ ] Contacter au moins un fournisseur de modèle domestique et un intégrateur ; obtenir LOI en 7 jours.

Source principale : résumé public de l'appel d'offres « AI for Everyone » (TNW, 15 juillet 2026) — https://thenextweb.com/news/south-korea-free-ai-chatbot-all-citizens-domestic-models
