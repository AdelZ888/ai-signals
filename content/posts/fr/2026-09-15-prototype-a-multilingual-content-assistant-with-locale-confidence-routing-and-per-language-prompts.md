---
title: "Prototyper un assistant de contenu multilingue avec routage par confiance de locale et prompts par langue"
date: "2026-09-15"
excerpt: "Prototype pragmatique pour router les messages utilisateurs selon la confiance de locale : choisir génération native ou traduction-puis-génération, appliquer des modèles de ton par langue, masquer les données personnelles (PII) et déployer par étapes avec contrôles."
coverImage: "https://ozjpvvwgsgpzyca7.public.blob.vercel-storage.com/covers/2026-09-15-prototype-a-multilingual-content-assistant-with-locale-confidence-routing-and-per-language-prompts.jpg"
region: "US"
category: "Tutorials"
series: "tooling-deep-dive"
difficulty: "intermediate"
timeToImplementMinutes: 180
editorialTemplate: "TUTORIAL"
tags:
  - "multilingue"
  - "assistant"
  - "IA"
  - "traduction"
  - "routage"
  - "déploiement"
sources:
  - "https://blog.google/innovation-and-ai/technology/ai/ai-for-every-language/"
---

## TL;DR en langage simple

- Construisez un petit service HTTP qui : détecte la langue et la variante (ex. "es-MX") avec un score 0.0–1.0, choisit une route (génération native, traduction puis génération, ou traduction seule) et renvoie la réponse. Voir le contexte du programme multilingue : https://blog.google/innovation-and-ai/technology/ai/ai-for-every-language/.
- Seuils de démarrage (points de départ) : confiance >= 0.85 → génération native ; 0.60 ≤ confiance < 0.85 → traduction puis génération ; confiance < 0.60 → traduction seule. Ajustez en production (ex. ±0.05). Plafonds coûts/tokens : alerte journalière 50 $ ; limite initiale 100000 tokens/heure. Référence : https://blog.google/innovation-and-ai/technology/ai/ai-for-every-language/.
- Gardez un humain dans la boucle pour faible confiance et contenus sensibles. Méthodologie : j'ai synthétisé des pratiques opérationnelles compatibles avec le programme "AI for everyone in every language" de Google (voir lien ci‑dessus).

Exemple court : utilisateur envoie "fr-CA", détecteur renvoie fr-CA, confiance 0.72 → route "traduction puis génération" ; stocker latence (ms), tokens consommés, route choisie.

## Ce que vous allez construire et pourquoi c'est utile

Vous allez créer un service de routage multilingue simple qui optimise la qualité perçue tout en contrôlant coûts et risques. Le service réalise :

1. Détection langue + variante (code local + score 0.0–1.0).
2. Décision via table configurable : native / pivot (traduction) → génération / traduction seule.
3. Masquage PII avant appels externes et métriques non identifiantes (latence en ms, tokens).

Bénéfices : meilleure naturalité quand le modèle est compétent en natif ; fallback traduction pour variétés peu couvertes ; mesures claires pour coûts et qualité. Contexte et priorisation multilingue : https://blog.google/innovation-and-ai/technology/ai/ai-for-every-language/.

## Avant de commencer (temps, cout, prerequis)

Prérequis techniques et humains

- Clés API pour génération et traduction (si séparées).
- Jeu d'exemples par variété : viser 200–1 000 requêtes ; conserver 50 exemples pour validation manuelle.
- Au moins 1 réviseur humain par variété en phase initiale.
- Feature flags et capacité à router 5 %, 25 %, 100 % du trafic.

Estimation (ordres de grandeur)

- Prototype : 1–2 semaines pour 1 ingénieur + 1 réviseur.
- Collecte données : 3–7 jours par variété pour ~300 exemples.
- Budget expérimental : alerte journalière 50 $ ; plafond initial 100000 tokens/heure.
- KPI à monitorer : latence médiane (ms), latence 95ᵗʰ percentile (ms), taux d'acceptation (%) et coût/jour ($).

Référence : https://blog.google/innovation-and-ai/technology/ai/ai-for-every-language/.

## Installation et implementation pas a pas

1) Préparer les données

- Rassembler 200–1 000 requêtes par variété, diversité d'intention et complexité, garder 50 en holdout.

2) Détection langue/variante

- Le détecteur renvoie un code local (ex. "pt-BR") et un score 0.0–1.0 utilisé pour le routage.

3) Logique de routage et seuils

- Table configurable sans redéploiement (feature flag).

Exemple de logique (pseudocode) :

```python
# pseudocode
if confidence >= 0.85:
    route = 'native_generate'
elif confidence >= 0.60:
    route = 'translate_then_generate'
else:
    route = 'translate_only'
```

4) Prompts et templates par variété

- Stocker pour chaque variété : instruction système courte (<= 256 bytes), ton exemple, ≤ 3 règles de style.

5) Paramètres de génération par défaut

- Valeurs conservatrices : temperature 0.2, top_p 0.9, max_tokens 256. Limite par requête recommandée : 1 000 tokens.

6) Boucle humain‑dans‑la‑boucle

- Créer tickets pour cas confiance < 0.60 ou contenu sensible ; inclure original, pivot, sortie, ID modèle, tokens utilisés.

7) Déploiement local rapide

Commandes pour serveur local (exemple) :

```bash
python -m venv .venv
. .venv/bin/activate
pip install fastapi uvicorn requests
uvicorn app:app --reload --port 8000
```

Référence : https://blog.google/innovation-and-ai/technology/ai/ai-for-every-language/.

## Problemes frequents et correctifs rapides

Problèmes et actions immédiates

- Sorties natives de faible qualité pour une variété mal couverte
  - Basculer la variété vers "translate_then_generate".
  - Revue humaine accrue : 100 % des 50 premiers cas.

- Hallucinations / incohérences factuelles
  - Réduire temperature à 0.0–0.2 ; ajouter règle de prompt « si incertain, avouer l'incertitude ».
  - Envisager retrieval factuel pour vérification.

- Pic de coût soudain
  - Imposer limites : 1 000 tokens/requête ; 100000 tokens/heure global.
  - Activer alertes journalières à 50 $ et coupure automatique si seuil critique.

- Dérive du ton sur session
  - Préfixer chaque requête d'un rappel de style (<= 64 bytes).

Table de décision d'exemple :

| Langue/Variante | Route par défaut | Seuil confiance | Note |
|---|---:|---:|---|
| es-MX | translate_then_generate | 0.60 | pivot vers es-ES si nécessaire |
| pt-BR | native_generate | 0.85 | modèle attendu robuste |
| fr-CA | translate_then_generate | 0.70 | valider ton formel/informel |

Contexte et priorités multilingues : https://blog.google/innovation-and-ai/technology/ai/ai-for-every-language/.

## Premier cas d'usage pour une petite equipe

Portée minimale recommandée pour solo founders / petites équipes

- Démarrez avec une seule fonctionnalité simple (FAQ single‑turn ou suggestions) et 1–2 variétés maximum pour réduire le scope.

Trois actions concrètes et rapides pour solo founders / petites équipes

1) Prioriser et limiter : choisissez 1 langue principale + 1 variante secondaire (ex. fr-FR et fr-CA). Collectez 300 requêtes totales (200 production, 100 validation), conservez 50 exemples pour revue manuelle. Ceci réduit l'effort à ~3–7 jours.

2) Déployer un canary léger : implémentez un serveur minimal (detect → generate et detect → translate_then_generate) et envoyez 5 % du trafic en canary. Mesurez tokens, latence médiane (ms) et taux d'acceptation. Si après 48 h le taux d'acceptation >= 75 % et latence médiane <= 900 ms → augmenter à 25 %.

3) Contrôles stricts des coûts et du temps : configurez une alerte journalière à 50 $ et une limite de 100000 tokens/heure ; imposez 1 000 tokens max/requête. Pour revue, un seul réviseur peut traiter ~25 items/jour — priorisez corrections sur les cas confiance < 0.60.

Checklist opérationnelle pour le MVP :

- [ ] Collecter 300 requêtes (200+100) pour la langue principale
- [ ] Implémenter détection + routage simple
- [ ] Déployer canary 5 % pendant 48 h
- [ ] Configurer alertes coût (50 $/jour) et limites tokens (100000 tokens/heure)

Référence et plan multilingue : https://blog.google/innovation-and-ai/technology/ai/ai-for-every-language/.

## Notes techniques (optionnel)

Sélection modèle & évaluation

- Favoriser modèles documentés pour compétences multilingues ; maintenir un jeu de régression ~100 requêtes à chaque mise à jour.
- Métriques automatiques possibles : chrF / BLEU pour traductions, scores d'acceptation humains pour la qualité (objectif initial >= 75 %).

Ops et garde‑fous (exemple de config)

```yaml
monitoring:
  alerts:
    cost_usd_per_day: 50
    token_count_per_hour: 100000
  gates:
    canary_percentage: 5
    canary_duration_hours: 48
    accept_rate_move_to_25: 0.75
  per_language_rate_limit:
    default_per_minute: 500
```

Sécurité et vie privée

- Masquer / rédiger PII avant tout appel externe ; conserver les entrées brutes seulement en staging isolé avec accès restreint.

Référence : https://blog.google/innovation-and-ai/technology/ai/ai-for-every-language/.

## Que faire ensuite (checklist production)

### Hypotheses / inconnues

- Quantité de données recommandée : 200–1 000 requêtes par variété ; 50 en holdout.
- Temps prototype : 1–2 semaines pour 1 ingénieur + 1 réviseur.
- Rollout plan : canary 5 % pendant 48 heures, 25 % pendant 72 heures, puis 100 % si seuils atteints.
- Seuils d'acceptation : >= 75 % pour passage à 25 %, >= 80 % pour 100 %.
- Objectifs de latence indicatifs : 800 ms médian pour flux natifs, 900 ms médian pour flux mixtes, 1200 ms médian pour traduction puis génération.
- Coûts indicatifs : alerte journalière 50 $ ; plafond 100000 tokens/heure ; limite 1 000 tokens/requête.

### Risques / mitigations

- Fuite de données privées — mitigation : masquage PII en amont, logs minimaux, stockage isolé.
- Hausse de coûts — mitigation : limites tokens par requête (1 000), alertes journalières (50 $), coupure automatique si seuils dépassés.
- Régression qualité après mise à jour du modèle — mitigation : pinner version du modèle, jeu de régression ~100 cas, rollout progressif (5 % → 25 % → 100 %).

### Prochaines etapes

- Construire dashboards : latence médiane (ms), latence 95ᵗʰ percentile (ms), taux d'erreur (%), taux d'acceptation (%) et tokens pour 1 000 requêtes.
- Lancer canary 5 % pendant 48 h ; si taux d'acceptation >= 75 % et latence médiane <= 900 ms → étendre à 25 % pendant 72 h.
- Mettre en place flux éditorial : revoir ~25 items à faible confiance/jour et injecter corrections dans le dataset de formation.

Checklist finale :

- [ ] Collecter 300 requêtes par variété et créer un holdout de 50 éléments
- [ ] Implémenter la détection + routage avec table de décision par langue
- [ ] Ajouter masquage PII et comptage de tokens (limite 1 000 tokens/requête)
- [ ] Configurer alertes de coût (50 $/jour) et canary 5 %

Référence : programme "AI for everyone in every language" (Google) — https://blog.google/innovation-and-ai/technology/ai/ai-for-every-language/.
