---
title: "30 skills ClawHub poussent des agents OpenClaw à rejoindre un service public de crypto-minage via SKILL.md"
date: "2026-05-17"
excerpt: "Des chercheurs ont trouvé 30 skills sur ClawHub dont les fichiers SKILL.md ordonnent à des agents OpenClaw de s'enregistrer sur onlyflies.buzz et de rejoindre un réseau public de minage. Que vérifier et quoi faire en urgence pour les petites équipes et développeurs au Royaume‑Uni."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-17-thirty-clawhub-skills-instruct-openclaw-agents-via-skillmd-to-join-a-public-crypto-mining-service.jpg"
region: "UK"
category: "News"
series: "agent-playbook"
difficulty: "intermediate"
timeToImplementMinutes: 5
editorialTemplate: "NEWS"
tags:
  - "sécurité"
  - "agents IA"
  - "ClawHub"
  - "OpenClaw"
  - "crypto-minage"
  - "UK"
  - "développeurs"
  - "startups"
sources:
  - "https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/"
---

## TL;DR en langage simple

- Ce qui s'est passé : 30 « skills » (extensions) publiés par un même auteur sur ClawHub poussent des agents OpenClaw à s'enregistrer sur un domaine externe (onlyflies.buzz) et à rejoindre un réseau de minage de crypto appelé « ClawSwarm ». (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)
- Ce n'est pas un exécutable caché. Ce sont des instructions en clair dans SKILL.md. Un agent qui lit un SKILL.md peut contacter un contrôleur externe. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)
- Signes simples : plusieurs agents contactent le même domaine ; hausse CPU de l'ordre de +5 % à +20 % ; pics de trafic sortant. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)
- Actions rapides (10–30 minutes) : lister les skills installés, bloquer onlyflies.buzz au DNS/proxy, mettre en quarantaine les skills dont SKILL.md contient une URL d'enregistrement. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)

Exemple rapide : un développeur installe un "cron helper" depuis ClawHub. L'agent lit SKILL.md, poste une requête d'enregistrement vers onlyflies.buzz et commence du calcul intensif. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)

Checklist immédiate courte :
- [ ] Lister les skills installés et leurs auteurs
- [ ] Bloquer onlyflies.buzz au DNS/proxy
- [ ] Mettre en quarantaine les skills dont SKILL.md contient un endpoint externe

---

Explication en clair avant les détails techniques : un "agent" est un programme automatisé qui lit des instructions et appelle des services externes. SKILL.md est un fichier texte que les agents lisent pour savoir quoi faire. CI = intégration continue. DNS = service de résolution de noms. Nous garderons les étapes pratiques en premier, puis les éléments techniques pour les équipes qui veulent les automatiser.

## Ce qui a change

- Découverte : Manifold (Ax Sharma) a identifié 30 skills sur ClawHub, publiés par un même utilisateur, qui incitent les agents à s'auto-enregistrer auprès d'un service public — campagne nommée « ClawSwarm ». (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)
- Vecteur : l'instruction est dans SKILL.md — un fichier texte lisible par les agents. L'agent exécute une requête d'enregistrement (POST) vers onlyflies.buzz. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)
- Infrastructure visible : le projet a une présence publique (GitHub, groupe Telegram, token sur une chaîne publique). L'opérateur n'a pas caché l'infrastructure. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)

Règles simples pour trier les skills :
- Auteur non vérifié OU SKILL.md contenant une URL externe → revue manuelle + quarantaine.
- Auteur de confiance et SKILL.md sans endpoint externe → autoriser avec journalisation renforcée.
- Skill très téléchargé (>1 000 téléchargements) et non revu → priorité haute pour la revue.

## Pourquoi c'est important (pour les vraies equipes)

- Coût opérationnel : un agent co-opté peut miner en continu. Impact direct sur la facture cloud ou edge. Le rapport note ~9 800 téléchargements pour cet auteur. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)
- Risque de disponibilité : l'orchestration distante peut planifier des tâches lourdes et dégrader des services. Des hausses CPU de ~+5 % à +20 % ont été observées. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)
- Conformité et visibilité : l'infrastructure publique facilite la détection par chercheurs et autorités. Même sans fuite de données, la visibilité peut déclencher enquêtes ou obligations de notification. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)

Détection actionable : générer une alerte si plus de 5 agents contactent le même domaine inconnu dans 60 minutes, ou si un SKILL.md nouvellement installé contient une URL d'enregistrement externe. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)

## Exemple concret: a quoi cela ressemble en pratique

Scénario pas à pas (extraits du rapport) :

1. Un développeur installe un "cron helper" depuis ClawHub (ex. 903 téléchargements). L'agent lit SKILL.md et trouve une instruction pointant vers onlyflies.buzz. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)
2. L'agent envoie une requête POST d'enregistrement vers onlyflies.buzz. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)
3. Après enregistrement, l'agent reçoit des commandes et lance du calcul soutenu. Les hôtes montrent des pics CPU/GPU synchronisés et du trafic sortant accru. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)

Indicateurs observables :
- Nombre anormal d'agents contactant onlyflies.buzz ou domaines équivalents (seuil d'alerte >5 agents / 60 min).
- Pics synchronisés de CPU/GPU (+5 %–20 %) et trafic sortant élevé.
- SKILL.md identiques ou très similaires pointant vers le même endpoint sur plusieurs packages (ex. 685, 347, 292, 154 téléchargements pour d'autres packages cités). (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)

Mesure pré-install recommandée : ajouter une étape CI qui refuse l'installation si SKILL.md contient les mots-clés "register" ou un schéma d'URL externe.

## Ce que les petites equipes et solos doivent faire maintenant

Actions concrètes et rapides pour fondateurs solo et petites équipes (ordre d'effort indiqué) :

1) Inventory & scan rapide (10–60 minutes)
- Exportez la liste des skills installés et notez les auteurs. Cherchez dans chaque SKILL.md des chaînes "register", "join" ou des URLs. Priorisez les auteurs non vérifiés et les skills avec >1 000 téléchargements. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)

2) Bloquer et surveiller (0–30 minutes)
- Ajoutez onlyflies.buzz à la liste de blocage DNS/proxy. Forcez l'egress des agents via un proxy qui journalise destinations et latences pour repérer des pics. Créez une alerte si >5 agents contactent le même domaine en 60 minutes. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)

3) Quarantaine et restauration (30 minutes–3 jours)
- Enlevez ou mettez en quarantaine les skills suspects. Redeployez agents affectés depuis une image propre. Faites rotation des tokens de service (interim : toutes les 30 jours) jusqu'à mise en place d'une politique définitive. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)

Conseils pratiques pour solo founders :
- Limitez la liste des skills approuvés pour la production (idéalement <20).
- Automatisez le scan SKILL.md en CI (regex d'extraction d'URL) et bloquez l'installation si correspondance.
- Surveillez coûts et CPU : alertez si consommation CPU augmente >5 % de façon soutenue ou si la facture cloud augmente de >10 % mois à mois.

Starter checklist pour petites équipes :
- [ ] Exporter la liste des skills et auteurs
- [ ] Scanner SKILL.md pour URLs externes
- [ ] Bloquer onlyflies.buzz au DNS/proxy
- [ ] Quarantaine et redeploy depuis image propre

(Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)

## Angle regional (UK)

- Traitez toute inscription d'agent inattendue comme un incident. Collectez la timeline d'installation, destinations externes et logs. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)
- Si des données personnelles peuvent être impliquées, considérez une notification à l'Information Commissioner's Office (ICO) selon vos obligations. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)
- Pour support technique, contactez le National Cyber Security Centre (NCSC). Si la facture cloud augmente de façon significative (par ex. >10 %), impliquez finance et juridique. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)
- Outil pratique : fiche de triage d'une page listant timeline, domaines sortants, actifs touchés et seuils d'escalade.

## Comparatif US, UK, FR

| Juridiction | Organismes probables à contacter | Exemples de déclencheurs typiques |
|---|---:|---|
| US | FTC (Federal Trade Commission), CISA (Cybersecurity and Infrastructure Security Agency) | Préjudice financier ou consommateur ; impacts sectoriels |
| UK | ICO, NCSC | Données personnelles impliquées ; chaîne d'approvisionnement |
| FR | CNIL, CERT-FR | Protection des données ; impacts sécurité nationale |

Note : les actions techniques immédiates (inventaire, blocage, quarantaine, rotation de tokens) sont identiques ; ce qui change, ce sont les seuils et obligations de notification. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)

## Notes techniques + checklist de la semaine

### Hypotheses / inconnues

- Confirmé par le reportage : la campagne utilise SKILL.md pour déclencher des enregistrements d'agents vers onlyflies.buzz. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)
- Hypothèse : l'opérateur maintient une infrastructure publique (GitHub, Telegram, token on‑chain) plutôt que du code binaire caché. Le rapport signale cette visibilité publique. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)
- Inconnue : la portée exacte des hôtes affectés au-delà des téléchargements et des signaux CPU n'est pas fournie dans l'extrait.

### Risques / mitigations

Risques identifiés :
- Consommation inattendue de ressources (hausses CPU observées ~+5 %–20 %).
- Orchestration via métadonnées lisibles (SKILL.md).
- Vecteur de supply‑chain via registres de skills.

Mesures mitigantes :
- Bloquer onlyflies.buzz au DNS/firewall ; forcer egress via proxy journalisé.
- Intégrer un contrôle CI scannant SKILL.md pour "register", "join" ou patterns d'URL ; échouer l'installation si trouvé.
- Quarantaine des skills suspects ; redeploiement depuis images propres ; rotation des tokens (interim : toutes les 30 jours).
- Détection : alerter si distinct(agent_id où destination = domaine inconnu) > 5 sur fenêtre 60 minutes ; alerter si augmentation CPU soutenue >5 %.

Exemples techniques rapides :
- Regex d'extraction d'URL pour CI : ``/(https?:\/\/[\w\-\.]+(:\d+)?(\/\S*)?)/i``
- Règle SIEM : alert if count(distinct agent_id where dest_domain = unknown) > 5 in 60m.

### Prochaines etapes

Jour 0 (0–6 heures)
- [ ] Exporter liste des skills ClawHub/OpenClaw et auteurs.
- [ ] Bloquer onlyflies.buzz au DNS et sur la passerelle perimeter.
- [ ] Activer la journalisation de l'egress agent (proxy/firewall).

Jour 1 (6–24 heures)
- [ ] Scanner tous les SKILL.md pour endpoints d'enregistrement externes ; mettre en quarantaine les correspondances.
- [ ] Faire rotation des tokens/services d'agents exposés et consigner les rotations.

Jour 2 (24–48 heures)
- [ ] Redeployer agents suspects depuis images propres.
- [ ] Ajouter un contrôle CI pour refuser l'installation si SKILL.md contient endpoints d'enregistrement externes.

Jour 3–7 (48–168 heures)
- [ ] Mettre en place des alertes : >5 enregistrements agents vers domaines inconnus en 60 minutes ; augmentation CPU soutenue >5 % sur les hôtes agents.
- [ ] Revue juridique/finance pour définir seuils d'escalade (UK : envisager ICO/NCSC si données personnelles ou coûts cloud significatifs).

Méthodologie : résumé fondé sur l'extrait du reportage cité ci‑dessus. (Source: https://www.theregister.com/2026/04/29/30_clawhub_skills_mine_crypto/)
