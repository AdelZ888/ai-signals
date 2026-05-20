---
title: "Trainy roleplay : répéter la résistance des parties prenantes pour les fonctions IA avec le scénario de projection de richesse Vento"
date: "2026-05-20"
excerpt: "Utilisez le simulateur de roleplay de Trainy pour répéter le lancement de fonctionnalités IA : exécutez les scénarios Vento « wealth-projection », captez les objections Compliance et PM, puis transformez les transcripts en tickets de lancement."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-05-20-trainy-roleplay-rehearse-stakeholder-pushback-for-ai-features-with-the-vento-wealth-projection-scenario.jpg"
region: "UK"
category: "Tutorials"
series: "agent-playbook"
difficulty: "beginner"
timeToImplementMinutes: 45
editorialTemplate: "TUTORIAL"
tags:
  - "Trainy"
  - "roleplay"
  - "IA"
  - "produit"
  - "compliance"
  - "PM"
  - "UK"
sources:
  - "https://www.trainy.me/roleplay"
---

## TL;DR en langage simple

- Quoi : Trainy est un simulateur de roleplay pour s'entraîner à des revues produit difficiles. (Source : https://www.trainy.me/roleplay)
- Pourquoi : vous pratiquez des objections réalistes. Vous repérez les blocages avant la réunion. 
- Résultat attendu : exportez le transcript et transformez chaque objection en ticket avec un propriétaire et un délai.

Exemple concret : vous lancez le scénario « wealth-projection » et Helena vous demande "Pourquoi de l'IA pour ça ?". Vous répondez en tant que PM, exportez le transcript, et créez un ticket "A/B test (n) pour valider nécessité IA" avec propriétaire Produit.

Note rapide : un run typique dure ~8–10 tours selon la page roleplay. (Source : https://www.trainy.me/roleplay)

## Ce que vous allez construire et pourquoi c'est utile

Vous allez créer une boucle courte et répétable :
1. lancer un scénario sur Trainy,  
2. jouer le rôle du PM et répondre aux objections des personnages,  
3. exporter le transcript,  
4. convertir les objections en artefacts actionnables (tickets, copies, gates).

La page roleplay montre des scénarios et des personnages récurrents (par exemple Alex, Helena, Olena, Mariana). Ces personnages simulent des revues où la décision peut entraîner un sign-off, un blocage ou un retrait d'accès. (Source : https://www.trainy.me/roleplay)

Pourquoi c'est utile :
- Réduction du risque de blocage Compliance tardif.
- Remplacement des débats vagues par des livrables mesurables.
- Création de gardes-fous traçables avant un déploiement canary.

Exemple de décision simple :

| Objection (partie prenante) | Artefact requis | Propriétaire |
|---|---:|---|
| « Ça frise le conseil financier » (Olena) | Texte UI non-prescriptif + approbation juridique signée | Legal / PM |
| « Pourquoi de l'IA pour ça ? » (Helena) | Hypothèse en 1 ligne + plan A/B (test) (définir n) | Produit |
| « Métrique vanité » (Mariana) | Baseline (7 jours) + MDE (Minimum Detectable Effect) 3–5% | Analytics |

(Source : https://www.trainy.me/roleplay)

## Avant de commencer (temps, cout, prerequis)

Temps estimé : 45–60 minutes par run. Synthèse et conversion en tickets : 30–120 minutes selon l'étendue. (Source : https://www.trainy.me/roleplay)

Coût : commencer par les scénarios publics sur Trainy pour valider l'adéquation. Vérifiez si un plan payant est nécessaire selon votre usage.

Prérequis :
- one-pager ≤1 page (hypothèse, métrique baseline, critères d'acceptation, garde-fous),
- métrique de référence ou plan pour la capter,
- navigateur et accès à https://www.trainy.me/roleplay,
- outil de tickets.

Taille d'équipe recommandée : 1–6 personnes. Un fondateur solo peut exécuter un run en ~45–90 minutes.

Checklist rapide :
- one-pager prêt (≤500 mots),
- baseline metric ou plan pour la capter (fenêtre recommandée = 7 jours),
- accès à https://www.trainy.me/roleplay.

## Installation et implementation pas a pas

Explication simple avant les détails avancés : lancez un scénario, jouez le rôle du PM, exportez le transcript, repérez les objections majeures, créez des tickets avec un propriétaire et un SLA (Service-Level Agreement). Répétez jusqu'à stabilisation.

1. Ouvrir un scénario
   - Aller sur https://www.trainy.me/roleplay et choisir un scénario (ex. "Why AI at all?", "Survive Compliance", "This is the room"). (Source : https://www.trainy.me/roleplay)

2. Préparer un one-pager
   - Inclure : hypothèse en 1 phrase, métrique baseline, critères d'acceptation, garde-fous. Limiter à ≤500 mots.

3. Jouer le scénario
   - Chaque run comporte typiquement ~8–10 tours. Répondez en tant que PM. Objectif : produire un transcript exportable et viser un sign-off ou identifier les blockers. (Source : https://www.trainy.me/roleplay)

4. Exporter et annoter
   - Exportez le transcript. Repérez les objections, assignez un propriétaire, notez la sévérité (échelle 1–5) et ajoutez le timestamp.

5. Transformer en actions
   - Créez des tickets avec propriétaire et SLA (par exemple 48–72 heures). Planifiez un canary si nécessaire.

6. Relancer si nécessaire
   - Critère d'arrêt suggéré : 3 runs consécutifs avec objections ≤2.

Exemples de commandes locales :

```bash
mkdir trainy-play && cd trainy-play
cat > one-pager.md <<'EOF'
Vento wealth-projection — projection only, not financial advice.
Baseline DAU: 12,345. Acceptance: no increase >2% in support tickets in 7 days.
EOF
# Ouvrir le scénario
open "https://www.trainy.me/roleplay"
```

Exemple de configuration YAML pour rollout :

```yaml
feature: wealth_projection_narratives
feature_flag: false
canary_pct: 5
canary_duration_days: 7
metric: engagement_rate
metric_baseline: 0.045
metric_success_threshold: 0.05
rollback_condition:
  support_ticket_increase_pct: 2
  critical_error_latency_ms: 500
owners:
  product: product@vento.example
  legal: legal@vento.example
```

Gates recommandés : sign-off Legal + Product, canary ≤5% pendant 7 jours, rollback si support tickets ↑ ≥2% ou latence >500 ms. (Source : https://www.trainy.me/roleplay)

## Problemes frequents et correctifs rapides

(Note : les scénarios et personnages cités proviennent de la page roleplay.) (Source : https://www.trainy.me/roleplay)

Problème : « Pas de valeur / pas d'IA » (Helena)
- Correctif : livrer une hypothèse en 1 ligne. Lancer un A/B test (test comparatif) avec objectif statistique (confiance 95%). Pilotez avec canary ≤5%.

Problème : « Ça ressemble à un conseil financier » (Olena / Compliance)
- Correctif : retirer le langage prescriptif, ajouter un avertissement UI standard, obtenir approbation juridique signée avant canary.

Problème : métriques vagues
- Correctif : définir une baseline (par exemple 7 jours, n ≥ 10k impressions), fenêtre de mesure (7 jours) et MDE (Minimum Detectable Effect) 3–5%. Définir propriétaires et seuils d'alerte.

Actions opérationnelles courtes :
- Bloqueur Compliance → joindre le texte approuvé à la PR (pull request). Délai recommandé : 48–72 h pour revue.
- Pas de baseline → capturer 7 jours avant canary.
- Pic tickets support → désactiver feature flag et escalader on-call si l'augmentation >2%.

(Source : https://www.trainy.me/roleplay)

## Premier cas d'usage pour une petite equipe

Atelier interne : 2 heures, 3 scénarios.
- Préparation : 30 minutes (one-pager + baseline).
- Exécution : 3 × 30 minutes (chaque run ~30 min).
- Synthèse : 30 minutes pour convertir transcripts en checklist et créer 3 tickets actionnables.

Workflow fondateur solo : 45–90 minutes.
1. Lancer un scénario sur https://www.trainy.me/roleplay (45 min).
2. Exporter transcript et marquer 3 objections haute sévérité.
3. Rédiger correctifs (avertissement UI, métrique, gate).
4. Partager pour retour sous 24–48 h.

Checklist de gate pour petite équipe :
- Sign-off Legal présent,
- Baseline capturée (7 jours),
- Feature flag opérationnel,
- Canary ≤5% pendant 7 jours,
- Dashboard de monitoring et owner d'alerte.

(Source : https://www.trainy.me/roleplay)

## Notes techniques (optionnel)

- Sauvegarder le transcript depuis https://www.trainy.me/roleplay pour garder une preuve auditable. (Source : https://www.trainy.me/roleplay)
- Convertir chaque objection en ticket avec acceptance criteria clairs (par exemple "Texte approuvé par Legal", "PR avec copie UI déployée").

Exemple minimal de ticket JSON :

```json
{
  "title": "Compliance: approve disclaimer text for wealth-projection",
  "owner": "legal@vento.example",
  "due_in_hours": 48,
  "acceptance_criteria": ["Text approved by Legal", "UI copy updated in PR"]
}
```

Conseil technique : tracez la provenance (timestamp, personnage, phrase exacte) pour citer le passage dans la PR ou le dossier de revue.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Les personnages (Alex, Helena, Olena, Mariana) et le scénario « wealth-projection » sont listés sur la page roleplay. (Source : https://www.trainy.me/roleplay)
- Les chiffres opérationnels (canary = 5%, duration = 7 jours, support gate = 2%, MDE = 3–5%, SLA tickets = 48–72 h, baseline window = 7 jours) sont des propositions pratiques. Validez-les avec votre équipe et Legal.
- Les comptes de tours (~8–10) viennent des extraits de la page roleplay. (Source : https://www.trainy.me/roleplay)

### Risques / mitigations

- Risque : blocage Compliance tardif. Mitigation : inviter Legal aux runs et exiger approbation signée avant canary.
- Risque : pas de baseline exploitable. Mitigation : retarder le rollout pour capturer 7 jours de données.
- Risque : langage prescriptif. Mitigation : bannir formulations prescriptives, ajouter avertissement UI, monitorer tickets de support.

### Prochaines etapes

- Cette semaine : exécuter les 3 scénarios recommandés sur https://www.trainy.me/roleplay et exporter ≥3 runs chacun.
- Convertir les 5 objections principales en tickets avec propriétaires et SLA (48–72 h).
- Joindre la config YAML de rollout à la PR et exiger gates : sign-off Legal + canary ≤5% + stabilité métrique.

Checklist finale :
- [ ] Préparer le one-pager
- [ ] Lancer le scénario 1 (Why AI at all?)
- [ ] Lancer le scénario 2 (Survive Compliance)
- [ ] Lancer le scénario 3 (This is the room)
- [ ] Créer des tickets pour les 5 objections principales
- [ ] Joindre la config YAML à la PR

Méthode : privilégiez runs courts et exportez systématiquement les transcripts pour conserver une trace vérifiable.
