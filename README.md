# Igikubo Marketplace — site

Site statique (HTML / CSS / JavaScript vanilla) implémenté à partir de la maquette Claude Design exportée le 2026-06-12. Recrée fidèlement les 5 pages et l'univers pastel (motif disque + octogone, polices Fredoka + Nunito).

## Pages

| Fichier | Page | Interactions |
|---------|------|--------------|
| `index.html` | Accueil | Toggle « Je joue / Je crée », disques à la une, explorer par thème, témoignages |
| `catalogue.html` | Catalogue | Filtres (thème, âge, joueurs, prix, note), tri, état vide, pagination |
| `disque.html` | Page produit | Galerie + miniatures, quantité, ajout au panier, distribution des avis, suggestions |
| `devenir-createur.html` | Devenir créateur | Avantages, revenus 85 %, 4 étapes, FAQ accordéon, CTA |
| `connexion.html` | Connexion / Inscription | Bascule connexion/inscription, choix profil joueur/créateur |

## Assets partagés

- `assets/styles.css` — design tokens (palette, rayons, ombres) et tous les composants.
- `assets/components.js` — Header et Footer injectés (évite la duplication), plus la carte-disque et le motif disque réutilisables.

## Lancer en local

Ouvrir `index.html` directement dans un navigateur suffit (aucune dépendance, aucun build). Les polices se chargent depuis Google Fonts (connexion requise).

Pour un rendu plus propre (et tester la navigation), servir le dossier :

```
python -m http.server 8000
```

puis ouvrir http://localhost:8000

## Notes

- Maquette front-end uniquement : pas de backend, panier, paiement ou comptes réels. Les boutons « Ajouter au panier », newsletter et formulaires sont des démos visuelles.
- Les disques sont des motifs géométriques générés (conic-gradient). Ils peuvent être remplacés par de vraies illustrations / photos quand elles seront disponibles (la page produit prévoit déjà des emplacements « photo · plateau / boîte / partie »).
- Responsive (mobile-first via flex-wrap et grilles auto-fit). Un menu hamburger mobile dédié reste à ajouter si besoin.
