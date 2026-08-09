---
title: "Déployer des agents IA sur Google Cloud : architecture en cinq parties et carte des produits"
date: "2026-08-09"
excerpt: "Mapper les produits Google Cloud sur les cinq parties d’un agent IA : modèle, outils, mémoire, boucle d’exécution et liens entre agents. Compare modèles managés vs inférence auto-hébergée."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-09-deploying-ai-agents-on-google-cloud-a-five-part-architecture-and-product-map.jpg"
region: "FR"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 240
editorialTemplate: "TUTORIAL"
tags:
  - "AI"
  - "Google Cloud"
  - "agents"
  - "infrastructure"
  - "devops"
  - "MLops"
sources:
  - "https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html"
---

## TL;DR en langage simple

- Un agent d'IA se compose de cinq parties : un modèle (le « cerveau »), des outils qu'il peut appeler, une mémoire pour le contexte, une boucle d'exécution (runtime) qui orchestre le tout, et parfois des connexions à d'autres agents (source : https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html).
- Séparez ces parties en services distincts pour faciliter les remplacements, la montée en charge et la sécurité.
- Démarrez avec un modèle managé (paiement à la consommation) puis migrez vers l'auto‑hébergement sur GPU si les coûts ou la gouvernance l'exigent.

Méthodologie : synthèse pratique fondée sur l’extrait ciblé ci‑dessus.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez convertir un prototype local (modèle + boucle + quelques outils) en une architecture modulaire prête pour production. Cette séparation permet :

- de remplacer le modèle sans réécrire les outils ;
- d’appliquer des règles de sécurité et d’observabilité par composant ;
- de choisir entre modèle managé (pay‑per‑token) et auto‑hébergement (GPU) en fonction du volume et de la sensibilité des données (source : https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html).

Briques principales (vocabulaire) :

- Modèle : moteur de raisonnement (ex. Gemini / Gemma ou modèles open‑weights via Model Garden — 200+ modèles disponibles). (source: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html)
- Outils : API ou services externes appelés par l'agent (recherche, exécution, DB).
- Mémoire : stockage de contexte pour garder l'état entre requêtes.
- Runtime loop : service qui orchestre modèle, mémoire et outils jusqu'à la fin de la tâche.
- Connecteurs multi‑agents : mécanismes d'appel entre agents pour déléguer des sous‑tâches.

## Avant de commencer (temps, cout, prerequis)

Points-clés à vérifier avant de lancer :

- Modèle : décider managé vs auto‑hébergé. Model Garden offre un démarrage rapide (200+ modèles) ; l’auto‑hébergement donne le contrôle mais demande ops. (source: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html)
- GPUs cités dans la source : NVIDIA L4 (24 GB) et NVIDIA RTX PRO 6000 Blackwell (96 GB). Les modèles ~70B paramètres peuvent exiger GPU plus grands. (source: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html)
- Durée pilote recommandée : 7 jours de canary pour collecter métriques essentielles (voir checklist).
- Coût pilote indicatif (à valider) : $0–$500/mois selon trafic et choix modèle. (mettre en hypothèses si non certain)

Vérifications rapides :

- Le modèle souhaité est‑il disponible dans Model Garden pour votre projet ?
- Les types de GPU requis sont‑ils disponibles dans la région cible ?
- Voulez‑vous utiliser ADK (Agent Development Kit) comme cadre de travail ?

## Installation et implementation pas a pas

Principe : prototypez vite avec un modèle managé, puis industrialisez.

Étapes recommandées :

1) Choisir la couche « modèle »
   - Model Garden (managé) : démarrage rapide, facturation pay‑per‑token.
   - Auto‑hébergé : déployer un moteur d'inférence (ex. vLLM) sur Cloud Run ou GKE et attacher un GPU si besoin. (source: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html)

2) Décomposer l'agent en microservices
   - Service modèle (API interne)
   - Service runtime (boucle d'exécution)
   - Services outils (search, exécution, DB)
   - Service mémoire (cache / base)

3) Déployer le runtime
   - Cloud Run pour scale‑to‑zero et faibles coûts d'opération ; GKE si orchestration GPU ou exigences complexes.

4) Instrumenter et mesurer
   - Comptez les tokens et les appels ; suivez latences p50/p95 et taux d'erreur.
   - Alertez sur variations anormales (ex. >2x tokens en 1 h).

Tableau de décision résumé :

| Aspect | Managé (Model Garden / Flash) | Auto‑hébergé (Cloud Run / GKE + GPU) |
|---|---:|---:|
| Modèles disponibles | 200+ | Tout ce que vous pouvez héberger |
| Coût | Pay‑per‑token (Flash possible) | Coût GPU / temps de run |
| Ops | Faible | Plus élevé (GPU, quotas) |
| Cas d'usage | Itération rapide, trafic irrégulier | Trafic soutenu, contrôle des données |

Commandes d'exemple (adaptez PROJECT_ID) :

```bash
# cloner un repo de démarrage
git clone https://github.com/example/adk-starter.git agent-starter
cd agent-starter
# build et push
docker build -t gcr.io/$PROJECT_ID/agent:latest .
gcloud auth configure-docker
```

Exemple de manifeste Cloud Run minimal :

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: agent-service
spec:
  template:
    spec:
      containers:
        - image: gcr.io/PROJECT_ID/agent:latest
          env:
            - name: MODEL_SELECTION
              value: "modelgarden-gemini-flash"
```

(source: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html)

## Problemes frequents et correctifs rapides

Symptômes courants et actions immédiates :

- 401/403 lors d'un appel modèle → vérifier IAM et permissions Model Garden.
- Coûts imprévus → identifiez les flux pay‑per‑token et arrêtez les jobs lourds.
- Latence p95 élevée → repérez cold starts, ajustez scaling et caches.
- Outils instables → ajouter retries exponentiels et circuit breaker.

Bonnes pratiques opérationnelles :

- Instrumentez le nombre de tokens par requête ; alertez sur un pic (>2x en 1 h).
- Appliquez le principe du moindre privilège aux comptes de service.
- Limitez la taille du contexte mémoire pour réduire la consommation de tokens.

(source: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html)

## Premier cas d'usage pour une petite equipe

Public : fondateurs solo et petites équipes qui veulent valider rapidement une idée ou un MVP. Plan d'action minimal et actionnable (source: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html) :

- Action 1 — Prototyper sur Model Garden : utilisez un modèle managé (ex. Gemini Flash) pour itérer sans infra GPU.  
- Action 2 — Déployer un runtime unique sur Cloud Run : un service qui orchestre modèle + 1–3 outils clefs (search, DB, exécution). Cloud Run fournit scale‑to‑zero et réduit les coûts opérationnels.  
- Action 3 — Restreindre le scope des outils : limitez à 3 outils pendant la validation pour réduire la surface d'erreur.  
- Action 4 — Mesurer : complétion, tokens par requête, latence p50/p95 et erreurs d'outil.  
- Action 5 — Critère de passage : si tokens/mois dépassent votre seuil (par ex. 1,000,000 tokens/mois), évaluez l'auto‑hébergement.

Conseils pratiques :

- Automatisez le déploiement (CI) pour pouvoir rollback en < 10 minutes.
- Préparez un plan B si le GPU n'est pas disponible : rester sur Model Garden ou changer de région.
- Faites une revue hebdomadaire des coûts et des logs pendant la phase canary (7 jours recommandés).

## Notes techniques (optionnel)

Points techniques tirés de la source :

- L'anatomie canonique d'un agent comprend 5 parties : modèle, outils, mémoire, boucle d'exécution, liens entre agents. (source: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html)
- Model Garden expose 200+ modèles au sein d'un projet Google Cloud, incluant Gemini et des poids ouverts. (source: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html)
- Gemini 3.x (ex. 3.1 Pro) et Gemma 4 sont mentionnés ; Gemma 4 apporte function calling et sorties structurées.
- Cloud Run peut servir des modèles et la source mentionne l'usage de GPU type NVIDIA L4 (24 GB) et RTX PRO 6000 (96 GB); les modèles ~70B peuvent exiger GPU plus gros. (source: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html)
- Agent Arena est cité comme banc d'essai comparant agents sur 1,000,000+ sessions.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse : la structure en 5 parties convient à votre charge de travail. (source: https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html)
- Hypothèse : Flash / pay‑per‑token est disponible et rentable pour vos usages initiaux.
- Hypothèse : GPUs cités (L4 24 GB, RTX PRO 6000 96 GB) sont accessibles dans les régions ciblées.
- Valeurs cibles proposées (à valider par test) : p95 orchestration < 500 ms, budget pilote = $0–$500/mois, seuil de transition = 1,000,000 tokens/mois, limiter scope initial à 3 outils, canary = 7 jours.

### Risques / mitigations

- Risque : dépassement de budget (tokens ou GPU). Mitigation : mettre en place alertes budgétaires, quotas et limites d'appel automatiques.
- Risque : fuite de données dans la mémoire ou les logs. Mitigation : redaction des PII, rotation courte des logs, least‑privilege IAM.
- Risque : indisponibilité GPU ou quotas insuffisants. Mitigation : demander quota tôt et prévoir fallback sur Model Garden.

### Prochaines etapes

- [ ] Décider modèle initial : Model Garden (Gemini Flash) vs auto‑hébergé.
- [ ] Créer un compte service « least‑privilege » pour l'accès modèle.
- [ ] Déployer un canary Cloud Run et collecter métriques pendant 7 jours : complétion, p50/p95, tokens par requête.
- [ ] Vérifier portes de sortie avant montée en charge : succès de tâche, latence, erreurs d'outil.

Exemples de déploiement rapide (rappel) :

```bash
docker build -t gcr.io/$PROJECT_ID/agent:latest .
gcloud auth configure-docker
gcloud run deploy agent-service --image gcr.io/$PROJECT_ID/agent:latest --region=us-central1
```

Variables d'environnement minimales :

```yaml
env:
  - name: MODEL_SELECTION
    value: "modelgarden-gemini-flash"
  - name: TOOL_ENDPOINT_URL
    value: "https://tools.example.internal/api"
```

Référence principale : https://ykdojo.github.io/awesome-agents-on-google-cloud/anatomy-of-an-ai-agent-on-google-cloud.html
