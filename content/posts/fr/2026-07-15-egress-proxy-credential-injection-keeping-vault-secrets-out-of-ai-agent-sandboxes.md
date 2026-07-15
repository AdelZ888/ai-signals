---
title: "Injection de credentials à la sortie (egress‑proxy) : garder les secrets du coffre hors des sandboxes d'agents IA"
date: "2026-07-15"
excerpt: "Conservez les secrets dans un coffre en écriture seule, exposez uniquement des références factices dans les VM des agents, et laissez un proxy d'egress externe attacher les credentials réels aux requêtes sortantes."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-07-15-egress-proxy-credential-injection-keeping-vault-secrets-out-of-ai-agent-sandboxes.jpg"
region: "UK"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "sécurité"
  - "IA"
  - "vault"
  - "egress-proxy"
  - "DevOps"
  - "conformité"
  - "UK"
  - "petites-équipes"
sources:
  - "https://declaw.ai/blog/credentials-agents-can-never-read"
---

## TL;DR en langage simple

- Idée clé : stockez les secrets sur un serveur (coffre) en mode « write‑only » (on écrit, on ne peut plus relire) et ne mettez qu'une référence factice dans la sandbox. Quand l'agent fait une requête, un proxy d'egress (sortie) attache la vraie clé après que la requête a quitté la VM. (Source : https://declaw.ai/blog/credentials-agents-can-never-read)
- Concrètement, la variable d'environnement dans la microVM contient un placeholder tel que "declaw:vault-managed". Si l'agent est compromis et inspecte /proc ou son environnement, il ne verra que ce placeholder. (Source : https://declaw.ai/blog/credentials-agents-can-never-read)
- Le proxy d'egress tourne en dehors de la VM et attache la vraie valeur au trafic sortant vers l'hôte scopié. L'agent ne tient jamais le secret en clair.

Exemple court : un agent doit appeler votre API de paiements. La sandbox a PAYMENTS_KEY=declaw:vault-managed. Le proxy ajoute la vraie clé seulement quand la requête sort vers payments.internal.example. (Source : https://declaw.ai/blog/credentials-agents-can-never-read)

Plain‑language explanation (avant les détails avancés)

L'objectif est simple et pratique : éviter que la clé existe jamais dans l'espace mémoire du code non‑fiable. Plutôt que de cacher la clé « quelque part dans la VM », on la garde hors de la VM et on dit à la VM seulement comment demander qu'on lui fournisse la clé au bon moment, via un proxy contrôlé.

Définitions rapides la première fois : LLM = large language model (grand modèle de langage). VM = virtual machine (machine virtuelle). DPIA = Data Protection Impact Assessment (analyse d'impact relative à la protection des données). RGPD = Règlement général sur la protection des données. ACL = access control list (liste de contrôle d'accès).

## Ce qui a change

Declaw publie une conception opérationnelle complète qui sépare trois composants :

- Un coffre « write‑only » (par ex. OpenBao mentionné par Declaw) où la valeur secrète est écrite une fois et n'est jamais renvoyée par l'API. (Source : https://declaw.ai/blog/credentials-agents-can-never-read)
- La sandbox / microVM qui reçoit uniquement le nom du secret et un placeholder (p. ex. declaw:vault-managed). (Source : https://declaw.ai/blog/credentials-agents-can-never-read)
- Un proxy d'egress qui s'exécute hors de la VM et attache la vraie clé à la requête quand celle‑ci vise un hôte autorisé. (Source : https://declaw.ai/blog/credentials-agents-can-never-read)

Le changement principal est de faire sortir la gestion des secrets de la surface d'exécution de l'agent. Même si l'agent est prompt‑injecté ou compromis, il ne peut récupérer que la référence factice.

## Pourquoi c'est important (pour les vraies equipes)

- Réduction du blast radius : une fuite dans la sandbox donne un placeholder, pas une clé exploitable. (Source : https://declaw.ai/blog/credentials-agents-can-never-read)
- Point de contrôle centralisé : le coffre et le proxy deviennent les points à sécuriser et à auditer. Cela simplifie la rotation des clés et la traçabilité. (Source : https://declaw.ai/blog/credentials-agents-can-never-read)
- Enquête et remédiation plus ciblées : en cas d'incident, on privilégie l'investigation sur le coffre et le proxy plutôt que sur chaque machine virtuelle.

Opérationnel : priorisez le monitoring, les ACL (contrôles d'accès) et les journaux sur le coffre et le proxy d'egress — ce sont les deux frontières critiques identifiées par Declaw. (Source : https://declaw.ai/blog/credentials-agents-can-never-read)

## Exemple concret: a quoi cela ressemble en pratique

Scénario condensé : un agent veut appeler https://payments.internal.example sans connaître la clé API.

Flux simplifié, adapté du design Declaw :

1. L'opérateur écrit la clé dans une entrée write‑only du coffre (nom exemple : payments/internal). Le coffre ne retourne la valeur après écriture. (Source : https://declaw.ai/blog/credentials-agents-can-never-read)
2. Dans la microVM, la variable d'environnement contient seulement le placeholder :

```bash
PAYMENTS_KEY=declaw:vault-managed
```

3. L'agent fait une requête HTTPS vers https://payments.internal.example/create depuis la VM.
4. Le proxy d'egress, exécuté hors de la VM, voit la destination, récupère la correspondance payments/internal et attache un header Authorization contenant la vraie clé avant d'envoyer la requête au service final. (Source : https://declaw.ai/blog/credentials-agents-can-never-read)
5. L'agent reçoit la réponse du service mais n'a jamais eu la clé en clair.

Bonnes pratiques opérationnelles citées : loguer chaque injection côté proxy et exposer des métriques minimales (ex. proxy-injections-success, proxy-injections-fail) pour détecter erreurs de configuration ou tentatives d'abus. (Source : https://declaw.ai/blog/credentials-agents-can-never-read)

## Ce que les petites equipes et solos doivent faire maintenant

Actions pratiques, à faible coût, pour fondateurs solo ou équipes 1–5 : (Source : https://declaw.ai/blog/credentials-agents-can-never-read)

1) Pilote rapide (1 secret)
- Choisir un secret à faible impact (clé sandbox paiement, webhook interne).
- Objectif : tester bout à bout en quelques jours.

2) Remplacer la valeur en sandbox par un placeholder et vérifier
- Écrire le secret dans une entrée write‑only du coffre.
- Dans la VM : export PAYMENTS_KEY=declaw:vault-managed
- Vérifier depuis la sandbox que env et /proc n'affichent que le placeholder.

3) Déployer un proxy d'egress minimal et restreint
- Allowlist 1–5 hôtes pour le pilote.
- Journaliser chaque injection et exposer metrics simples : proxy-injections-success / proxy-injections-fail.

4) Assigner un propriétaire et plan de rollback
- Nommer une personne responsable des alertes.
- Plan de rollback manuel si le taux d'échecs dépasse un seuil convenu (ex. proposition : >5% sur 1 heure).

5) Documenter par secret : vault-name -> host -> owner. Limiter la liste pilote à ≤10 lignes pour garder l'audit simple.

Ces étapes demandent peu d'effort d'ingénierie et rendent visibles les échecs d'injection plutôt que des fuites silencieuses. (Source : https://declaw.ai/blog/credentials-agents-can-never-read)

## Angle regional (UK)

Si vous traitez des données de résidents du Royaume‑Uni, préférez l'hébergement des composants critiques (coffre, proxy) au Royaume‑Uni ou dans l'Union européenne. Cela réduit les risques liés aux transferts transfrontaliers et facilite les analyses d'impact sur la protection des données (DPIA). (Source : https://declaw.ai/blog/credentials-agents-can-never-read)

Checklist UK pratique :

- Héberger coffre/proxy UK/EU pour les données personnelles identifiables (PII).
- Logger les écritures du coffre et les injections du proxy pour DPIA et rapports d'incident.
- Maintenir une allowlist auditable des destinations autorisées afin que le DPO (Data Protection Officer) puisse valider les flux.

Adapter ces recommandations selon les contraintes sectorielles (ex. NHS, finance). (Source : https://declaw.ai/blog/credentials-agents-can-never-read)

## Comparatif US, UK, FR

Tableau rapide pour prioriser contrôles et hébergement :

| Juridiction | Priorité d'hébergement | Logs & DPIA | Commentaire opérationnel |
|---|---:|---|---|
| US | sectoriel (PCI/HIPAA) | exigé pour audits sectoriels | Concentrez preuves d'audit pour coffre/proxy |
| UK | privilégier UK/EU | DPIA souvent demandé | Favoriser hébergement local pour PII |
| FR | RGPD très appliqué | DPIA et justification d'hébergement | Préparez documentation CNIL pour choix d'hébergement |

Règle simple : si vous opérez internationalement, auditez selon la juridiction la plus stricte raisonnablement applicable et conservez les logs d'injection et les écritures de coffre. (Source : https://declaw.ai/blog/credentials-agents-can-never-read)

## Notes techniques + checklist de la semaine

### Hypotheses / inconnues

- Le pattern suppose que tout le trafic sortant de la sandbox passe par un proxy contrôlable par l'équipe. Validez cette contrainte dans votre infrastructure. (Source : https://declaw.ai/blog/credentials-agents-can-never-read)
- Declaw mentionne OpenBao comme coffre possible ; si vous n'utilisez pas OpenBao, vérifiez que votre vault supporte le mode write‑only (ne renvoie jamais la valeur après écriture). (Source : https://declaw.ai/blog/credentials-agents-can-never-read)
- Seuils opérationnels proposés (à tester) : pilote 7 jours, allowlist 1–5 hôtes, rollback si >5% d'échecs d'injection sur 1 heure, garder la liste pilote ≤10 lignes.

### Risques / mitigations

Risque : le proxy compromis peut abuser des credentials injectés.
- Mitigations : restreindre l'accès au proxy, appliquer ACLs, segmenter le plan de contrôle, et renouveler régulièrement certificats/identifiants du proxy.

Risque : mauvaise configuration qui bloque le trafic.
- Mitigations : déployer un pilote réversible (7 jours), prévoir un fallback manuel (routage direct) et des alertes sur proxy-injections-fail.

Risque : obligations sur transferts de données et conservation des logs.
- Mitigations : héberger coffre/proxy dans la région requise, conserver allowlists auditées et appliquer des politiques de rétention conformes.

### Prochaines etapes

Checklist rapide (semaine pilote) :

- [ ] Inventaire des secrets et choix du secret pilote (1 item)
- [ ] Configurer une entrée write‑only dans le coffre pour ce secret
- [ ] Mettre à jour l'image sandbox : PAYMENTS_KEY=declaw:vault-managed
- [ ] Déployer un egress proxy minimal avec table de scoping / allowlist
- [ ] Lancer le pilote 7 jours et monitorer proxy-injections-success / proxy-injections-fail

Référence technique complète : https://declaw.ai/blog/credentials-agents-can-never-read

(Methodologie : résumé et traduction du design publié par Declaw, limité aux éléments décrits dans le billet.)
