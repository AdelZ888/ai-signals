---
title: "agent-sandbox : CRD et contrôleur Kubernetes pour exécuter des agents IA isolés et stateful"
date: "2026-08-17"
excerpt: "Guide pratique pour agent-sandbox : une CRD et un contrôleur Kubernetes permettant d’exécuter des agents singleton, stateful, avec stockage persistant (PVC). Comprend installation, exemples et conseils de mise en production."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-08-17-agent-sandbox-kubernetes-crd-and-controller-to-run-isolated-stateful-ai-agents.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "kubernetes"
  - "agent-sandbox"
  - "ia"
  - "devops"
  - "stateful"
  - "petite-équipes"
  - "uk"
sources:
  - "https://github.com/kubernetes-sigs/agent-sandbox"
---

## TL;DR en langage simple

- agent-sandbox facilite la gestion de workloads isolés, stateful et singleton. Voir le dépôt : https://github.com/kubernetes-sigs/agent-sandbox (449 forks, ~3 500 étoiles). 
- Cas d'usage principal : un runtime d'agent IA qui a besoin d'un état local stable sur disque (controller + CRD + samples dans le dépôt). Référence : https://github.com/kubernetes-sigs/agent-sandbox.
- Priorité rapide : si vous avez besoin qu'un seul service conserve un historique local (logs, index, cache) sans le dupliquer sur N réplicas, agent-sandbox fournit les CRD et le contrôleur pour le gérer via Kubernetes.

Chiffres utiles instantanés du repo : 449 forks, ~3 500 étoiles, installation de test estimée 1–3 heures. (https://github.com/kubernetes-sigs/agent-sandbox)

## Ce que vous allez construire et pourquoi c'est utile

Vous allez déployer le contrôleur agent-sandbox et créer une ressource « Sandbox » (CRD) qui gère un pod singleton et son stockage persistant. Le dépôt contient le contrôleur (manager), les CRD et des exemples : https://github.com/kubernetes-sigs/agent-sandbox.

Pourquoi c'est utile :

- Permet d'isoler l'état sur un seul volume PV/PVC plutôt que de le répliquer sur plusieurs réplicas.
- Gère cycle de vie et montages via Kubernetes (manifests + controller), donc on profite des primitives k8s au lieu de scripts ad hoc.
- Adapté pour des runtimes d'agents IA nécessitant un état local (index, cache, historiques).

Table de décision rapide (cas d'usage)

| Contrainte / besoin                         | Utiliser agent-sandbox ? | Remarque (dépôt) |
|--------------------------------------------|:------------------------:|------------------|
| Besoin d'un agent singleton avec stockage  | Oui                     | Controller + CRD disponibles (voir repo : https://github.com/kubernetes-sigs/agent-sandbox) |
| Besoin de N réplicas identiques, stateless | Non                      | Préférez Deployment/StatefulSet selon le besoin |
| Besoin de réplication d'état forte         | Non/à réfléchir          | agent-sandbox favorise l'état local unique

## Avant de commencer (temps, cout, prerequis)

Référence opérationnelle : https://github.com/kubernetes-sigs/agent-sandbox

Prérequis minimaux

- kubectl configuré et accès à un cluster Kubernetes. (https://github.com/kubernetes-sigs/agent-sandbox)
- Droits pour installer CRD et manifests (create/update CRD). (https://github.com/kubernetes-sigs/agent-sandbox)
- Git pour cloner le dépôt et consulter les samples. (https://github.com/kubernetes-sigs/agent-sandbox)

Checklist avant démarrage :

- [ ] Vérifier kubeconfig / contexte (cluster ciblé).
- [ ] Confirmer droits pour appliquer CRD et manifests.
- [ ] Cloner le dépôt et lire config/ et samples.

Temps estimé (test/dev) : 1–3 heures. Budget indicatif : 0–$50 pour un cluster dev cloud léger (estimation à valider selon fournisseur).

## Installation et implementation pas a pas

Voir le dépôt pour manifests et samples : https://github.com/kubernetes-sigs/agent-sandbox

1) Cloner le dépôt et inspecter :

```bash
git clone https://github.com/kubernetes-sigs/agent-sandbox.git
cd agent-sandbox
ls -la config/ config/crd/ samples/
```

2) Appliquer les CRD et le manager (adaptez les chemins aux fichiers du dépôt) :

```bash
kubectl apply -f config/crd/bases/
kubectl apply -f config/manager/manager.yaml
```

3) Exemple minimal (vérifiez apiVersion/fields dans le dépôt avant d'appliquer) :

```yaml
apiVersion: sandbox.sigs.k8s.io/v1alpha1
kind: Sandbox
metadata:
  name: example-agent
spec:
  image: ghcr.io/example/agent:v1.2.3
  storage:
    size: 5Gi
```

4) Commandes de vérification utiles :

```bash
kubectl get pods -n agents-dev -l control-plane=agent-sandbox
kubectl get pvc -n agents-dev
kubectl logs -n agents-dev <manager-pod>
kubectl describe sandbox example-agent -n agents-dev
```

Notes : adaptez labels, namespaces, et chemins aux manifests du dépôt. Consultez les samples et le schéma CRD dans le repo : https://github.com/kubernetes-sigs/agent-sandbox.

## Problemes frequents et correctifs rapides

Référence issues et diagnostics : https://github.com/kubernetes-sigs/agent-sandbox

Symptômes, diagnostics et remèdes rapides :

- Controller CrashLoopBackOff
  - Diagnostic : kubectl describe pod <controller> && kubectl logs <controller>
  - Remède : vérifier image tag, accès au registre et permissions RBAC.
- PVC Pending
  - Diagnostic : kubectl describe pvc/<name>
  - Remède : vérifier StorageClass, provisioner et quotas (quota de stockage > 0, StorageClass disponible).
- ImagePullBackOff
  - Vérifier que le tag n'est pas :latest en prod et que le registre autorise le pull.
- Redémarrages fréquents (restartCount > 3 sur 5 min)
  - Vérifier readiness/liveness probes et erreurs applicatives dans les logs.

Si un correctif demande plus de 30s pour investiguer, escaladez avec les logs et une capture prometheus/grafana si disponible. Pour plus d'exemples et issues ouvertes, consultez : https://github.com/kubernetes-sigs/agent-sandbox.

## Premier cas d'usage pour une petite equipe

Public cible : solo founders et équipes de 1–5 personnes qui veulent un runtime d'agent unique, persistant et simple à opérer. Référence : https://github.com/kubernetes-sigs/agent-sandbox

Conseils concrets et actionnables (solo / petite équipe) :

1) Démarrage rapide en isolation
   - Créez un namespace dédié (ex : agents-dev) et déployez le manager :

```bash
kubectl create namespace agents-dev
kubectl apply -n agents-dev -f config/manager/manager.yaml
```

   - Avantage : isolation des ressources, coût et blast radius limités.

2) Pinning d'images + contrôle des coûts
   - N'utilisez pas :latest en prod. Pinner les images avec un tag immuable (ex. v1.2.3) et limitez ressources requests/limits (CPU 100m–500m, mem 128Mi–1Gi selon besoin) pour contrôler la facture.

3) Taille initiale du stockage et snapshots tests
   - Démarrez avec 5Gi pour un prototype et créez une routine de snapshot/restaure (tester restauration au moins 1 fois).

4) Processus léger d'exploitation pour 1–2 personnes
   - Définissez deux playbooks courts (5–10 étapes) : a) Restore PVC, b) Rollback image. Documentez pour qu'une seule personne puisse effectuer un rollback < 10 minutes.

5) Observabilité minimale
   - Exportez au moins une métrique : controller reconciles/sec et PVC usage %. Configurez alertes à 80% d'utilisation.

Checklist opérationnel pour petite équipe :
- [ ] Namespace dédié créé
- [ ] Images pinées (tags immuables)
- [ ] PVC initial 5Gi créé et snapshot testé

Ces recommandations tirent parti des primitives Kubernetes et s'appliquent au workflow fourni par agent-sandbox (controller + CRD + samples dans le repo : https://github.com/kubernetes-sigs/agent-sandbox).

## Notes techniques (optionnel)

Le dépôt décrit agent-sandbox comme orienté « isolated, stateful, singleton » workloads ; il expose un controller et des CRD pour gérer ces cas (https://github.com/kubernetes-sigs/agent-sandbox).

Bonnes pratiques techniques à considérer :
- Probes : readiness < 30s pour smoke tests, liveness selon la criticité.
- Réplication du controller : exécuter 3 réplicas si le controller supporte leader election pour éviter SPOF.
- RBAC : appliquez principe du moindre privilège pour le ServiceAccount du controller.

Exemple RBAC minimal (vérifier apiGroups exacts dans le dépôt) :

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: agent-sandbox-manager
rules:
- apiGroups: ["sandbox.sigs.k8s.io"]
  resources: ["sandboxes"]
  verbs: ["get","list","watch","create","update","patch","delete"]
```

Toujours valider les manifests et le schéma CRD dans le dépôt upstream : https://github.com/kubernetes-sigs/agent-sandbox.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Données repo instantanées : 449 forks, ~3 500 étoiles. (https://github.com/kubernetes-sigs/agent-sandbox)
- Estimations opérationnelles à valider : tests end-to-end en dev ≈ 180 minutes (3 h). Ces durées (1–3 h, 180 min) sont indicatives et doivent être adaptées à votre infra.
- Paramètres chiffrés proposés comme point de départ : storage 5Gi initial, seuil d'alerte stockage 80%, plan d'expansion +10Gi, rollback cible < 10 minutes, restartCount critique > 3 en 5 minutes, readiness target < 30s, controller réplicas = 3. Ces valeurs sont des hypothèses à vérifier contre vos manifests et votre cluster.

Méthodologie courte : résumé basé sur le dépôt upstream et bonnes pratiques k8s extraites du repo principal : https://github.com/kubernetes-sigs/agent-sandbox.

### Risques / mitigations

- Risque : saturation du stockage (>= 80%).
  - Mitigation : alerte à 80%, snapshot régulier, plan d'expansion (+10Gi) ou rotation.
- Risque : agent qui redémarre fréquemment (restartCount > 3 en 5 min).
  - Mitigation : rollback vers image saine, probes et alertes on-call.
- Risque : contrôleur en SPOF.
  - Mitigation : exécuter 3 réplicas du controller et activer leader election si supporté.
- Risque : permissions RBAC excessives.
  - Mitigation : appliquer moindre privilège et auditer les ServiceAccounts.

### Prochaines etapes

- Inspecter et valider le schéma CRD et l'emplacement des manifests dans le dépôt : https://github.com/kubernetes-sigs/agent-sandbox
- Mettre en place RBAC restreint et réviser les bindings.
- Implémenter backup/restore des PVCs et tester la restauration sur un cluster sandbox au moins 1 fois/mois.
- Ajouter observabilité : métriques pour reconciles, latence, utilisation PVC et readiness ; définir SLO/SLA.
- Documenter procédures de rollback et tester un rollback manuel en moins de 10 minutes.

Checklist de production :
- [ ] Schéma CRD revu et validé
- [ ] RBAC en moindre privilège appliqué
- [ ] Scanning d'images et politique de vulnérabilité mise en place
- [ ] Observabilité et alertes configurées (alerte stockage 80%)
- [ ] Plan de rollback documenté et testé

Pour plus de détails, samples et issues ouvertes, consultez : https://github.com/kubernetes-sigs/agent-sandbox.
