---
title: "Ink (ml.ink) : déploiement piloté par agents avec tokens MCP/Skill, délégation DNS et observabilité"
date: "2026-03-12"
excerpt: "Utilisez Ink (ml.ink) pour permettre à des agents IA de pousser du code, générer un token MCP/Skill et déployer des applications full‑stack avec builds auto‑détectés, sous‑domaines délégués et observabilité partagée."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-12-ink-mlink-agent-driven-deployment-with-mcpskill-tokens-dns-delegation-and-observability.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "ml.ink"
  - "agents"
  - "déploiement"
  - "observabilité"
  - "MCP"
  - "Skill"
  - "DevOps"
  - "UK"
sources:
  - "https://ml.ink/"
---

## TL;DR en langage simple

- Quoi : ml.ink (https://ml.ink/) est une plateforme où un agent d'IA peut construire, déployer et exploiter des services. Le tableau de bord montre à la fois des logs structurés et des métriques temps réel (CPU, mémoire, réseau) et ces mêmes signaux sont accessibles par l'agent via les APIs MCP/Skill.
- Pourquoi utile : déploiement rapide, observabilité partagée (humains + agents), facturation à la minute (pas de charge pour l'inactif). Extraits de prix publics : CPU 0,000393 $ / vCPU·min, mémoire 0,000161 $ / GB·min, crédit gratuit initial annoncé 2 $ (source : https://ml.ink/).
- Action immédiate : créez un workspace sur https://ml.ink/, générez un token MCP/Skill avec scopes limités, poussez un dépôt minimal (script start ou Dockerfile) et laissez l'agent déclencher build + deploy. Comptez ~60 minutes pour une démo ; la propagation DNS peut ajouter 10–48 h.

Exemple concret rapide : déployez une app Node avec script "start", commencez avec 0.25 vCPU et 256 MB. Surveillez le dashboard 1H pour voir événements de build et erreurs comme "ERROR Connection refused" ou latences 230ms–312ms observées dans les logs.

---

## Ce que vous allez construire et pourquoi c'est utile

Vous allez réaliser une démo full‑stack minimale : une API Node (ou site statique) + un petit backend, déployée via ml.ink (https://ml.ink/) pour montrer le cycle complet : push de code → build → déploiement → observabilité (logs structurés + métriques temps réel). Le dashboard expose les mêmes métriques aux humains et aux agents, ce qui facilite l'automatisation des diagnostics et des actions correctives (source : https://ml.ink/).

Livrables pratiques :

- Un dépôt contenant soit un script start soit un Dockerfile.
- Un token MCP/Skill (API) avec scopes limités pour deploy et secrets.
- Un service accessible via le domaine fourni par la plateforme, visible dans le dashboard avec logs structurés et graphiques CPU/mémoire sur fenêtres 1H/6H/7D/30D.

Tableau rapide de décision (taille & coût estimé pour une session de 60 minutes)

| Profil | vCPU | Mémoire | Coût approx. (60 min) |
|---|---:|---:|---:|
| Démo solo | 0.25 vCPU | 0.25 GB | ≈ 0.0083 $ |
| Staging léger | 0.5 vCPU | 0.5 GB | ≈ 0.0166 $ |
| Production petite | 1 vCPU | 1 GB | ≈ 0.0332 $ |

(Calcul basé sur les tarifs publics indiqués sur https://ml.ink/ : CPU 0,000393 $/vCPU·min, mémoire 0,000161 $/GB·min.)

Méthodologie courte : j'ai extrait prix, observabilité et capacités de déploiement depuis le snapshot public de ml.ink et j'ai gardé les recommandations pragmatiques compatibles avec ces éléments.

## Avant de commencer (temps, cout, prerequis)

Durée estimée

- Installation initiale et démo : ~60 minutes.
- Délégation DNS : 10–48 heures selon le registrar.
- Observation initiale (vérifier logs & métriques) : 1–2 heures.

Coûts (extraits du snapshot public)

- CPU : 0,000393 $ / vCPU·min.
- Mémoire : 0,000161 $ / GB·min.
- Crédit gratuit initial : 2 $ (inscription).
- Vous payez à la minute quand un service tourne : pas de charge pour l'inactif (source : https://ml.ink/).

Prérequis minimum

- Compte et workspace sur https://ml.ink/.
- Une application minimale (site statique, Node, Python) avec script start ou Dockerfile.
- Accès au registrar DNS si vous déléguerez un domaine.

Checklist préalable

- [ ] Créer un compte et workspace sur ml.ink.
- [ ] Préparer un repo avec script start ou Dockerfile.
- [ ] Générer un token MCP/Skill et le stocker en sécurité.
- [ ] (Optionnel) Déléguer dev.example.com vers les nameservers fournis.

Exemple de coût simple (approx. pour 60 minutes, 0.25 vCPU / 0.25 GB) :

- vCPU 0.25 × 0.000393 $/vCPU·min × 60 min ≈ 0.005895 $
- Mémoire 0.25 GB × 0.000161 $/GB·min × 60 min ≈ 0.002415 $
- Total approximatif ≈ 0.00831 $

## Installation et implementation pas a pas

Résumé rapide : créez le workspace, fournissez un repo exécutable (script start ou Dockerfile), générez un token MCP/Skill limité, poussez le code et lancez le déploiement. Le dashboard réunit logs et métriques (CPU, mémoire, I/O) et permet d'identifier erreurs et lenteurs.

1) Créez le workspace et le token

- Inscrivez‑vous sur https://ml.ink/ et créez un workspace.
- Dans le dashboard, générez un token MCP/Skill. Limitez les scopes (deploy, secrets, dns). Stockez‑le dans un coffre.

Exemple export (bash) :

```bash
export MCP_TOKEN="votre-token-ici"
# Ajoutez-le ensuite à votre gestionnaire de secrets (Vault, AWS Secrets Manager...)
```

2) Préparez un repo minimal

- Ajoutez un script start ou un Dockerfile pour permettre l'auto‑détection.

Exemple package.json (Node) :

```json
{
  "name": "mini-admin",
  "scripts": { "start": "node server.js" }
}
```

3) Dockerfile minimal

```Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
CMD ["node", "server.js"]
```

4) Poussez et déployez

- Connectez votre repo (GitHub/Git) à ml.ink, donnez au service l'accès au MCP_TOKEN pour déclencher le build et le deploy. Le dashboard affichera en temps réel : build logs, runtime logs et métriques sur 1H/6H/7D/30D (source : https://ml.ink/).

5) Surveillance & seuils simples

- Fenêtres recommandées : 1H, 6H, 7D, 30D.
- Seuils d'alerte recommandés : CPU 80 %, Mémoire 85 %, erreurs 5xx > 0.5 % sur 5 minutes.
- Déploiement canary : commencer par 5 % du trafic pendant 10 minutes ; promouvoir si erreurs < 1 % et latence stable.

Commande de rollback conceptuelle :

```bash
ml-ink service rollback --service mini-admin --to-revision 42 --token "$MCP_TOKEN"
```

## Problemes frequents et correctifs rapides

(voir aussi la page d'observabilité et logs sur https://ml.ink/)

- DNS ne résout pas : vérifier la délégation NS chez le registrar et que le sous‑domaine est ajouté au workspace. Utilisez dig/host. Propagation jusqu'à 48 h.
- Échec de détection du build : ajouter un Dockerfile ou un package.json avec script start ; un Procfile explicite aide.
- Permissions manquantes : revérifier les scopes du MCP_TOKEN ; révoquer et rotater le token si fuite.
- Connection refused à l'exécution : consulter les logs combinés build/runtime (ex. "ERROR Connection refused" ou "Retry 1/3 — reconnecting...") et corriger l'host/port upstream.

Checklist de triage rapide :

- [ ] Rechercher logs avec @level:error ou messages "ERROR".
- [ ] Vérifier scopes et expiration du MCP_TOKEN.
- [ ] Confirmer les enregistrements NS (dig) et la propagation.
- [ ] Lancer la commande start localement pour valider le comportement.

Exemples de lignes de logs à surveiller (extraits du snapshot) :

- `POST /api/deploy 201 — 230ms`
- `Slow query: SELECT * FROM services (312ms)`
- `ERROR Connection refused: upstream 10.0.1.42:8080`

## Premier cas d'usage pour une petite equipe

Scénario : un fondateur solo veut déployer une UI admin interne et déléguer certaines tâches à un agent. (Source : https://ml.ink/)

Actions concrètes et opérationnelles pour un fondateur / petite équipe :

1) MVP et déploiement rapide (~60 minutes)
- Créez une app Node/React minimale avec une route et un script `start`.
- Connectez le repo à ml.ink et déployez sur le domaine par défaut pour éviter d'attendre la DNS.
- Vérifiez en 10–30 minutes les logs de build puis 1H de métriques pour confirmer la stabilité.

2) Contrôle coût & disponibilité
- Démarrez avec 0.25 vCPU / 256 MB pour limiter le coût initial.
- Limitez l'auto‑scale à max 2 vCPU / 4 GB si nécessaire et définissez un budget d'essai (par ex. 5 $ / semaine).
- Arrêtez automatiquement les environnements non productifs (horaires : 22:00–07:00) pour réduire la facture.

3) Sécurité et opérations minimales
- Générez un MCP_TOKEN avec scopes restreints (deploy, secrets) et stockez‑le dans un vault.
- Activez les logs structurés et configurez un gate canary : 5 % du trafic pendant 10 minutes, rejeter si erreurs > 1 %.
- Automatisez la rotation du token tous les 30 jours et testez le rollback en < 10 minutes.

Checklist rapide pour petites équipes

- [ ] Utiliser le domaine par défaut de ml.ink pour la première démo.
- [ ] Démarrer à 0.25 vCPU / 256 MB et limiter auto‑scale à 2 vCPU / 4 GB.
- [ ] Configurer canary 5 % / 10 min avec gate erreur < 1 %.

## Notes techniques (optionnel)

- API programmatique & agents : ml.ink expose MCP/Skill pour que des agents automatisent deploy, scale, set secrets et opérations DNS via API (source : https://ml.ink/).
- Observabilité : logs structurés et métriques temps réel (plages 1H, 6H, 7D, 30D) consultables depuis le dashboard et via API pour diagnostics automatisés.
- Stacks supportés : auto‑détection, Docker, buildpacks et stacks courants (Node, Python, Next.js, Go, Rust, etc.) ; la plateforme peut déployer des stacks variés sans config lourde.

Exemple YAML de ressources (config d'illustration) :

```yaml
service:
  name: mini-admin
  resources:
    cpu: 0.25 # vCPU
    memory: 256 # MB
  autoscale:
    min_instances: 1
    max_instances: 4
    cpu_target: 0.7 # 70%
```

Conseil rapide : séparez tokens selon usage (deploy vs lecture métriques), automatisez la rotation et testez localement avec les mêmes variables d'environnement que la prod.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse : la facturation à la minute et les tarifs (CPU 0,000393 $ / vCPU·min, Mémoire 0,000161 $ / GB·min) correspondent au snapshot public de https://ml.ink/.
- Hypothèse : les agents peuvent lire logs structurés et accéder aux métriques temps réel et appeler les opérations deploy/scale via MCP/Skill comme indiqué.
- Hypothèse opérationnelle (à valider) : arrêt automatique après 60 minutes d'inactivité et quotas autoscale configurables sont disponibles pour tous les plans.

### Risques / mitigations

- Risque : hausse du temps de fonctionnement = coûts plus élevés (ex. passage de 0.25 → 2 vCPU multiplie le coût par ~8). Mitigation : caps autoscale, arrêt automatique, plages d'arrêt nocturne.
- Risque : déploiement défectueux impacte utilisateurs. Mitigation : canary 5 % / 10 min, gate erreur < 1 %, rollback automatique si 5xx > 0.5 % sur 5 min.
- Risque : fuite de token MCP/Skill. Mitigation : scopes minimaux, rotation toutes les 30 jours, stockage dans gestionnaire de secrets.

### Prochaines etapes

- Durcir SLOs & alertes (ex. CPU 80 %, mémoire 85 %, 5xx 0.5 %).
- Valider un rollback en < 5 minutes via exercices sur plusieurs révisions.
- Automatiser backups DB et stratégie de rollback de migration.

Checklist finale pour la production

- [ ] Rotation et scoping des tokens MCP/Skill.
- [ ] Activer canary (5 % / 10 min) avec gates santé.
- [ ] Configurer SLOs & alertes (CPU 80 %, mémoire 85 %, 5xx 0.5 %).
- [ ] Mettre en place backups & procédures de rollback.
- [ ] Organiser un exercice d'incident et vérifier rollback < 10 minutes.

Si vous le souhaitez, je peux fournir un runbook d'incident d'une page, un Procfile/Dockerfile adapté à votre stack et une liste minimale de permissions MCP/Skill à demander.
