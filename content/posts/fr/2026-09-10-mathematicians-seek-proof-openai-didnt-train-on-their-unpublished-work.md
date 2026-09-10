---
title: "Les mathématiciens demandent la preuve qu’OpenAI n’a pas entraîné ses modèles sur leurs travaux non publiés"
date: "2026-09-10"
excerpt: "Des mathématiciens ont demandé à OpenAI de démontrer que des brouillons privés ou des conversations n'ont pas été ingérés pour l'entraînement des modèles. Le reportage de The Verge documente la dispute publique mais ne publie pas d'éléments d'audit internes (logs, manifests, preuves cryptographiques) qui permettraient de trancher."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-10-mathematicians-seek-proof-openai-didnt-train-on-their-unpublished-work.jpg"
region: "US"
category: "Model Breakdowns"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "ANALYSIS"
tags:
  - "IA"
  - "provenance"
  - "gouvernance"
  - "sécurité"
  - "OpenAI"
  - "mathématiques"
  - "transparence"
sources:
  - "https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data"
---

## TL;DR en langage simple

- Plusieurs mathématiciens ont demandé publiquement à OpenAI de prouver que leurs travaux privés n'ont pas servi à l'entraînement des modèles : https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data
- The Verge rapporte la controverse et reprend des citations publiques. L'article ne fournit pas de journaux d'ingestion ni d'attestations techniques vérifiables : https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data
- Pour les équipes : conservez des versions horodatées de vos brouillons. Demandez des preuves claires aux fournisseurs avant d'utiliser les sorties pour du travail sensible.

Exemple concret (court) : un chercheur remarque qu'une sortie publique d'un modèle ressemble fortement à son brouillon interne. Première action pratique : sauvegarder immédiatement le brouillon, l'exporter en PDF/texte brut, et calculer un hachage (expliquer ci‑dessous). Ensuite, adresser une demande formelle au fournisseur.

## Question centrale et reponse courte

Question : OpenAI a‑t‑il utilisé des contenus privés de mathématiciens pour entraîner ses modèles ? Source principale : https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data

Réponse courte : des mathématiciens ont demandé publiquement une preuve. The Verge rapporte ces demandes et la dispute publique. L'article ne publie pas d'artefacts techniques (journaux, manifests, hachages signés) permettant de trancher la question techniquement : https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data

Implication pratique : sans preuve de provenance fournie par le fournisseur, traitez toute correspondance entre un contenu privé et une sortie de modèle comme un incident de gouvernance qui demande collecte de preuves.

## Ce que montrent vraiment les sources

- The Verge documente des appels publics à la transparence de la part de plusieurs mathématiciens. L'article rend compte de la dynamique publique autour de ces demandes : https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data
- L'article compile des citations, réactions et positions publiques. Il n'inclut pas de logs d'ingestion horodatés, de manifests de dataset ni de preuves cryptographiques permettant de vérifier l'origine d'un extrait : https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data

Note méthodologique : ce résumé se limite au contenu public rapporté par The Verge et n'ajoute pas de nouvelles preuves techniques.

## Exemple concret: ou cela compte

Cas d'usage illustratif (hypothétique) :

- Situation : un chercheur observe qu'une réponse publique d'un modèle reproduit des idées d'un brouillon interne non publié.
- Actions prioritaires :
  1. Sauvegarder immédiatement le brouillon en texte brut et en PDF.
  2. Capturer les prompts et les conversations locales (logs d'API si disponibles). API = interface de programmation d'application.
  3. Calculer et stocker un hachage du fichier (ex. SHA‑256 — Secure Hash Algorithm 256 bits) et conserver la date/heure.
  4. Envoyer une demande formelle au fournisseur pour clarifier si le fichier a été ingéré.

Contexte public qui motive cette vigilance : https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data

Plain-language explanation avant les détails avancés :
Si vous n'êtes pas expert technique, pensez aux preuves comme à des reçus. Un hachage est l'équivalent numérique d'un reçu unique pour un fichier. Un journal d'ingestion est le registre qui montre quand un fichier a été lu par le fournisseur. Sans ces reçus, il est difficile de prouver où un texte a été pris.

## Ce que les petites equipes doivent surveiller

Mesures opérationnelles simples à mettre en place rapidement (à partir du débat public) : https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data

- Archiver chaque brouillon et chaque transcript en texte brut et en PDF.
- Calculer et stocker un hachage par fichier (SHA‑256). Expliquer aux collaborateurs pourquoi on le fait.
- Tenir une chronologie par incident : date de création/partage, date d'apparition dans une sortie publique, date de la plainte.
- Conserver prompts et journaux locaux d'API quand ils existent. API = interface de programmation d'application.
- Demander au fournisseur une attestation et des informations sur les plages d'ingestion quand un incident survient.

Tableau de décision rapide

| Question clé | Action immédiate | Preuve requise |
|---|---:|---|
| Le résultat ressemble à un brouillon privé ? | Archiver le brouillon et calculer son hachage dans les 24 h | Fichier horodaté, SHA‑256, captures d'écran |
| Le fournisseur ne répond pas ? | Escalader via juriste/institution | Copie de la requête, accusé de réception |
| Besoin de preuve pour publication ? | Rassembler chronologie et demandes avant toute diffusion | Hachages, logs locaux, réponse fournisseur |

Source du contexte public : https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data

## Compromis et risques

Points de tension tirés du débat public : https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data

- Transparence vs secrets commerciaux : demander des manifests ou des hachages peut entrer en conflit avec des pratiques propriétaires des fournisseurs.
- Vitesse vs traçabilité : utiliser un modèle sans contrôler la provenance accélère le travail, mais complique la preuve après coup.
- Tests statistiques (ex. tests d'appartenance) : ils donnent un signal mais peuvent produire des faux positifs. Ils ne remplacent pas des logs d'ingestion officiels.

Rappel : l'article de The Verge rapporte la controverse et les demandes publiques, mais ne montre pas d'artefacts d'audit conclusifs : https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data

## Notes techniques (pour lecteurs avances)

Le reportage couvre une dispute publique mais n'apporte pas d'artefacts techniques conclusifs. Pour un audit technique robuste, deux familles d'artefacts sont généralement nécessaires : https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data

1) Logs d'ingestion et manifests : enregistrements horodatés montrant quels fichiers ont été ingérés et quand. Ils doivent inclure timestamps serveur et identifiants de snapshot.
2) Preuves cryptographiques : hachages (ex. SHA‑256) de snapshots, et attestations signées liant un snapshot à une date et à un identifiant de modèle.

Remarques pratiques :

- Tests d'influence et tests d'appartenance (membership inference) existent. Membership inference = test statistique qui tente d'indiquer si un exemple a été présent dans les données d'entraînement. Ces tests donnent des signaux, mais ils font des erreurs et ne constituent pas une preuve juridique.
- Pour une demande formelle, demander : plages d'ingestion, hachages de snapshots, enregistrements d'opt‑out et une attestation signée par une autorité technique du fournisseur.

Contexte public : https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data

## Checklist de decision et prochaines etapes

### Hypotheses / inconnues

- Confirmé par la source : des mathématiciens ont demandé publiquement à OpenAI des preuves que leurs contenus privés n'ont pas été utilisés ; l'article rapporte la controverse sans publier de preuves d'audit : https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data
- Hypothèses opérationnelles (recommandations, non affirmations de l'article) :
  - Conserver des exports bruts pendant 90 à 365 jours selon criticité.
  - Demander une réponse fournisseur sous 30 jours.
  - Limiter les prompts externes à ≈1 000 tokens comme précaution. (Un token = fragment de texte utilisé par le modèle.)
  - Interpréter un seuil statistique de 95% seulement comme signal circonstanciel.
  - Surveillance opérationnelle : alerte si l'usage augmente de 10–30% rapidement.
  - Estimation de coût d'archivage chiffré : ≈10 $/mois par contributeur pour petits volumes (estimation).
  - Conserver au moins 3 dates par incident (partage, apparition modèle, plainte) et au moins 1 hachage SHA‑256 par fichier.

### Risques / mitigations

- Risque : le fournisseur refuse de divulguer des informations. Mitigation : conserver preuves locales horodatées et escalader via canaux institutionnels ou juridiques.
- Risque : faux positifs provenant d'analyses statistiques. Mitigation : ne pas engager d'action légale uniquement sur ces tests ; attendre attestations et logs.
- Risque : surcharge opérationnelle (ralentissement des workflows). Mitigation : garder deux flux de travail : exploratoire (rapide) et protégé (sensible).

### Prochaines etapes

- [ ] Inventaire immédiat (7 jours) : exporter et archiver tous les chats privés et brouillons pertinents. Calculer SHA‑256 pour chaque item.
- [ ] Chronologie : consigner 3 dates par incident (partage initial, apparition du modèle, plainte).
- [ ] Requête fournisseur : envoyer une demande formelle pour plages d'ingestion, hachages de snapshots et attestation signée (délai demandé : 30 jours).
- [ ] Politique interne : adopter règle courte (prompt ≤1 000 tokens pour usage public, conservation 90–365 jours pour exports critiques).
- [ ] Si correspondance confirmée : assembler exports horodatés, hachages, chronologie et réponses fournisseur ; consulter conseil juridique avant publication.

Source principale pour le contexte public : https://www.theverge.com/ai-artificial-intelligence/993263/where-does-openai-get-mathematics-training-data

Fin.
