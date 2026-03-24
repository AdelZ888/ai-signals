---
title: "Test de Claude Code et Cowork d’Anthropic sur macOS : configuration sûre sur une seule machine"
date: "2026-03-24"
excerpt: "Guide pas-à-pas (~60 minutes) pour essayer en sécurité la prise de contrôle restreinte d’Anthropic Claude (Code & Cowork) sur macOS. Configurez un canari sur une seule machine, accordez des permissions minimales et journalisez les actions."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-03-24-testing-anthropic-claudes-code-and-cowork-on-macos-a-safe-one-machine-setup.jpg"
region: "US"
category: "Tutorials"
series: "model-release-brief"
difficulty: "intermediate"
timeToImplementMinutes: 60
editorialTemplate: "TUTORIAL"
tags:
  - "Anthropic"
  - "Claude"
  - "macOS"
  - "automatisation"
  - "IA"
  - "sécurité"
  - "devops"
  - "pilot"
sources:
  - "https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer"
---

## TL;DR en langage simple

- Quoi : Anthropic propose une "research preview" permettant à Claude (features Code et Cowork) d'exécuter des actions sur une machine macOS ; Claude demandera l'autorisation avant d'agir (source : https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer).
- Limite clé : la preview est indiquée comme limitée à macOS (1 OS). (https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer)
- Pourquoi tester : automatiser une tâche simple pour gagner 5–10 minutes par exécution et réduire les erreurs humaines répétitives.
- Action rapide (30–60 minutes) : choisissez 1 machine macOS comme canari, créez un utilisateur dédié, et autorisez une seule permission ponctuelle demandée par Claude.
- Sécurité immédiate : principe du moindre privilège, logs conservés ≥30 jours, utilisateur dédié, révoquer les permissions après test.

Exemple concret : automatiser l'exécution nocturne d'un script Node.js qui collecte des logs et écrit un fichier horodaté (~1–50 KB). Claude doit demander la permission avant d'exécuter le job. (https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer)

Méthodologie : synthèse directe de l'extrait The Verge ci‑dessus.

## Ce que vous allez construire et pourquoi c'est utile

- Objectif : activer la research preview de Claude sur un Mac et exécuter un job de test strictement limité : ouvrir un dossier, lancer une commande et sauvegarder la sortie horodatée. (https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer)
- Résultat attendu : un fichier nommé test-output-YYYYMMDD.txt (~1–50 KB) et une entrée d'audit locale contenant l'horodatage et l'identité de l'action (résumé ≤200 caractères).
- Bénéfice mesurable : 5–10 minutes économisés par tâche répétée ; possibilité de runs programmés (ex. 02:00) pour réduire l'intervention humaine.

Tableau résumé :

| Niveau de risque | Exemple de tâche | Gabarit d’automatisation |
|---:|---|---|
| Faible | Collecte de logs nocturne | 1 canari (1 machine) ; revue humaine |
| Moyen | Génération de rapports qui écrivent cache | Feature flag ; seuil réussite ≥90% |
| Élevé | Modification du code source | Approvisionnement manuel obligatoire ; rollback testé |

(source : https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer)

## Avant de commencer (temps, cout, prerequis)

- Temps estimé : ≈60 minutes pour configurer et lancer le test sur 1 machine. Étendre le pilote à 2–3 machines : 1–2 jours.
- Coût : test initial potentiellement gratuit ; prévoir $0–$100 pour stockage ou sauvegarde additionnelle selon usage.
- Prérequis : 1 appareil macOS avec accès administrateur local pour répondre aux invites de permission. L'extrait indique explicitement une disponibilité macOS. (https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer)

Checklist pré‑vol :
- [ ] Enregistrer la machine de test (1) dans l’inventaire
- [ ] Créer un compte utilisateur dédié sur le Mac
- [ ] Sauvegarder les fichiers importants (Time Machine ou équivalent)
- [ ] Empêcher la mise en veille pendant le pilote

Gate du pilote : démarrer sur 1 canari ; exiger ≥90% de réussite et ≤5% de faux positifs sur 7 jours avant extension. (https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer)

## Installation et implementation pas a pas

1. Vérifiez dans l'UI Claude/Anthropic la présence de la "research preview" et la mention macOS. (https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer)

2. Préparez un petit projet de test et un script minimal :

```bash
# créer un projet de test simple
mkdir -p ~/TestProject
cat > ~/TestProject/test.js <<'JS'
console.log('TEST RUN', new Date().toISOString());
JS
```

3. Exemple de cron pour exécuter la tâche chaque nuit à 02:00 (modifiez selon fuseau) :

```bash
# éditer crontab pour l'utilisateur dédié
0 2 * * * /usr/local/bin/node /Users/you/TestProject/test.js >> /Users/you/TestProject/test-output-$(date +\%Y\%m\%d).txt 2>&1
```

4. Ouvrez le client Claude ou l'interface web. Donnez une instruction unique et limitée ; n'autorisez qu'une seule permission ponctuelle via l'UI.

Exemple d'instruction concise (≤300 caractères) :

```text
Ouvre ~/TestProject, lance `node test.js`, sauvegarde stdout dans ~/TestProject/test-output.txt. Ne modifie pas d'autres fichiers. Permission pour cette tâche unique uniquement.
```

5. Vérifiez la sortie : existence de ~/TestProject/test-output-YYYYMMDD.txt et entrée d'audit locale. Conservez les logs ≥30 jours.

6. Métadonnées du pilote (ex. JSON) :

```json
{
  "machine": "dev-mac-01",
  "pilot_start": "2026-03-24",
  "notes": "least-privilege; permissions à confirmer dans l'UI"
}
```

7. Rollback rapide : révoquer la permission dans les Réglages macOS et désactiver le mode autonome dans le client.

(source : https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer)

## Problemes frequents et correctifs rapides

- Pas d’invite visible : ramenez le client au premier plan ou redémarrez-le ; macOS peut regrouper ou retarder les invites.
- Permission refusée pour écrire : vérifiez droits (ls -l), relancez la commande manuellement.
- Aperçu manquant : se déconnecter/reconnecter et vérifier le statut du compte dans l'UI.
- Automatisation qui échoue sans message : isolez l'étape (ex. `touch ~/TestProject/ok`) et inspectez les logs locaux.

Checklist de dépannage rapide :
- [ ] Redémarrer le client Claude
- [ ] Révoquer et ré-autoriser la permission demandée par l’UI
- [ ] Vérifier la propriété des fichiers (`ls -l`, `chmod`, `chown`)
- [ ] Consulter le journal local d’audit et la connectivité réseau

(source : https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer)

## Premier cas d'usage pour une petite equipe

Adapté aux solo‑founders et petites équipes (1–3 personnes) : objectif lancer un pilote simple, sûr et réversible en <2 heures.

Contexte : l'extrait indique que la preview est limitée à macOS et que Claude demandera la permission avant d'agir ; on s'appuie sur ces contraintes pour limiter le blast radius. (https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer)

Actions concrètes (au moins 3, exécutables immédiatement) :
1. Isolation rapide (10–30 minutes) : provisionnez 1 Mac canari, créez 1 utilisateur non‑admin et placez la machine sur un VLAN ou réseau invité ; activez un backup quotidien (retention ≥30 jours).
2. Script minimal et test manuel (20–60 minutes) : déployez le script Node.js ci‑dessous, exécutez-le manuellement 3 fois, puis demandez à Claude d'exécuter une seule fois. Vérifiez la sortie et l'entrée d'audit.

```bash
# test manuel rapide
node ~/TestProject/test.js > ~/TestProject/test-output-$(date +%Y%m%d).txt
wc -c ~/TestProject/test-output-*.txt  # confirme taille ~1-5000 octets
```

3. Limiter permissions et cadence (5–10 minutes) : n'accordez que la permission nécessaire, limitez le nombre d'exécutions auto à 1 par cycle (ex. 1 run nocturne à 02:00) et imposez revue humaine si une action dépasse 3 fichiers modifiés ou >1000 tokens d'entrée (hypothèse à valider).
4. Monitoring et alertes (30–90 minutes) : configurez alertes email/SMS si taux d'échec >10% sur 24h ou si latence d'opération >2000 ms ; conservez un tableau de bord simple avec counts par jour (runs, successes, overrides).
5. Règles opérationnelles (15 minutes) : templates de prompts (≤300 caractères), rotation d'identifiants toutes les 1–4 semaines, et script de rollback testé (révocation des permissions).

Répéter le cycle 7 jours (pilot window) : objectif ≥90% de réussite et ≤5% de faux positifs avant d'étendre. (https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer)

## Notes techniques (optionnel)

- Confirmé par l’extrait : la preview est macOS‑only et Claude demande la permission avant d’exécuter des actions. (https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer)
- Métriques proposées à suivre : taux de réussite (%) par run, latence moyenne (ms) par opération, nombre d'overrides manuels par semaine (count), tokens par prompt (count). Exemples de seuils opérationnels : réussite ≥90%, latence cible <2000 ms, faux positifs ≤5%, retention_days = 30, rotation_id_interval = 7 jours.

Configuration d’exemple pour gates du pilote :

```yaml
pilot:
  machines: 1
  success_threshold: 0.90   # 90%
  false_positive_threshold: 0.05  # 5%
  retention_days: 30
  latency_target_ms: 2000
canary:
  enabled: true
  gate: human_review_present
```

- À valider dans l'UI produit (hypothèses techniques) : noms exacts des permissions macOS demandées et la portée des données (télémétrie) envoyées à Anthropic.

(source : https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer)

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Hypothèse confirmée : Anthropic Claude peut demander la permission et exécuter des actions sur macOS (extrait The Verge). (https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer)
- Inconnue : noms exacts des permissions macOS demandées, la portée précise des données remontées à Anthropic, et le coût réel en production pour un déploiement à >10 machines.
- Inconnue : plafond de tokens par prompt et rétention automatique côté fournisseur (à valider).

### Risques / mitigations

- Risque : permissions excessives → modifications non désirées. Mitigation : principe du moindre privilège, éviter Full Disk Access si possible, autoriser 1 permission à la fois.
- Risque : échecs silencieux ou résultats erronés. Mitigation : revue humaine pour tâches critiques, alertes si taux de réussite <90% ou si overrides_count >3/semaine.
- Risque : compromission de la machine via automatisation. Mitigation : isoler la machine (VLAN), maintenir l'OS à jour, utiliser endpoint protection et rotation d'identifiants (intervalle 7 jours recommandé jusqu'à validation).

### Prochaines etapes

- Lancer pilote 7 jours sur 1 machine (objectifs : ≥90% réussite, ≤5% faux positifs).
- Si succès : étendre à 2–3 machines pendant 14 jours, puis planifier déploiement progressif (canari → groupe → production) avec critères mesurables (latence <2000 ms, succès ≥90%).
- Documenter et tester procédures de rollback : révoquer permissions, désactiver le mode autonome et valider impossibilité d’action après révocation.

Checklist final de production :
- [ ] Démarrer le pilote (1 machine)
- [ ] Activer suivi métrique (taux réussite, latence ms, overrides)
- [ ] Documenter procédure de rollback et la tester
- [ ] N’étendre qu’après validation des gates (canari → groupe → déploiement)

Référence principale : https://www.theverge.com/ai-artificial-intelligence/899430/anthropic-claude-code-cowork-ai-control-computer
