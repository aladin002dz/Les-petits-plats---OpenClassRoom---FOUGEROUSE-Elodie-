# Les petits plats — Moteur de recherche de recettes

Projet P7 de la formation Développeur d'application JavaScript React (OpenClassroom). Site de recettes de cuisine pour l'entreprise « Les petits plats », avec un moteur de recherche performant (recherche principale + filtres par tags), deux implémentations d'algorithme comparées (boucles natives vs programmation fonctionnelle) et une interface responsive réalisée avec Tailwind CSS.

![Aperçu du projet](assets/images/Preview.png)

---

## Présentation du projet

*Les petits plats* est une maquette de site de recettes (type Marmiton / 750g). La mission consiste à concevoir l'interface de recherche puis à développer **deux algorithmes de recherche** pour filtrer un jeu de 50 recettes fourni en JSON. Les deux versions sont comparées en performance via Jsben.ch ; la fiche d'investigation de fonctionnalité documente les résultats et justifie le choix de l'algorithme retenu.

Le site permet de :

- **Consulter** une page d'accueil avec un bandeau et une grille de cartes recettes (image, nom, temps, ingrédients, description).
- **Rechercher** des recettes via un champ de recherche principal (à partir de 3 caractères, dans le nom, les ingrédients et la description).
- **Filtrer** les recettes par tags (ingrédients, appareils, ustensiles) via des listes déroulantes.
- **Afficher** le nombre de recettes trouvées et un message explicite si aucun résultat ne correspond.

## Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| Page d'accueil | Bandeau « Les petits plats », grille de cartes recettes (responsive). |
| Recherche principale | Filtre les recettes dès 3 caractères saisis (nom, ingrédients, description). |
| Filtres par tags | Listes déroulantes (ingrédients, appareils, ustensiles) avec recherche interne. |
| Intersection des filtres | Les tags sélectionnés s'appliquent en intersection (ET logique). |
| Message aucun résultat | Affiche « Aucune recette ne contient "X"... » quand la recherche est vide. |
| Affichage des résultats | Compteur « X recette(s) » mis à jour dynamiquement. |
| Cartes recettes | Image, badge temps, titre, description, liste ingrédients (nom, quantité, unité). |
| Green Code & sécurité | Fonctions réutilisables ; pas d'injection HTML via les formulaires. |

## Algorithmes comparés

Deux implémentations de `recipeMatchesSearch` développées sur des branches Git distinctes :

| Branche | Approche | Performance |
|---|---|---|
| `feature/native-loops-search` | Boucle `for` + retour anticipé | **1 210 000 ops/sec** (+38%) 🏆 |
| `feature/functional-search` | `Array.some()` + spread | 874 260 ops/sec |

**Algorithme retenu : boucles natives** — testé sur Jsben.ch, 38% plus rapide car il n'alloue pas de tableau intermédiaire et effectue un retour anticipé dès le premier champ correspondant.

Voir la fiche d'investigation de fonctionnalité pour le détail complet (pseudocode, algorigrammes, résultats, recommandation).

## Technologies

- **HTML5** — sémantique, landmarks ARIA, `aria-label`
- **Tailwind CSS** — build via CLI (`css/input.css` → `css/style.css`), responsive, CSS Grid
- **JavaScript vanilla** — aucune librairie JS, modules ES6 natifs
- **Données** — 50 recettes en JSON dans `data/recipes.json`

## Structure du projet

```
.
├── index.html                  # Page unique (header + grille recettes)
├── fiche_investigation.md      # Comparaison des deux algorithmes + recommandation
├── data/
│   └── recipes.json            # 50 recettes (id, name, image, time, ingredients, appliance, ustensils)
├── js/
│   ├── main.js                 # Point d'entrée : chargement des recettes et initialisation
│   ├── recipeSearch.js         # Algorithme de recherche principale (2 versions selon la branche)
│   ├── filters.js              # Filtres par tags (ingrédients, appareils, ustensiles)
│   ├── search.js               # Écoute de la barre de recherche (règle des 3 caractères)
│   └── templates/
│       └── card.js             # Génération des cartes recettes + message aucun résultat
├── css/
│   ├── input.css               # Source Tailwind
│   └── style.css               # CSS compilé
└── assets/
    └── images/                 # Logo, header, photos des recettes
```

## Branches Git

```
main                          ← interface complète
  ├── feature/functional-search     ← recipeMatchesSearch avec Array.some()
  └── feature/native-loops-search   ← recipeMatchesSearch avec boucle for (retenu)
```

## Installation et lancement

```bash
npm install
npm run build   # compile Tailwind (css/input.css → css/style.css)
```

Ensuite ouvrir `index.html` dans un navigateur (ou via un serveur local).

## Livrables (contexte OpenClassroom)

- Interface de recherche responsive, code validable W3C.
- Deux branches Git avec deux implémentations de l'algorithme de recherche.
- Fiche d'investigation de fonctionnalité : pseudocode, algorigrammes Mermaid, résultats Jsben.ch, recommandation.

## Auteur

Projet réalisé dans le cadre du **Projet P7 – Développez un algorithme de recherche en JavaScript**, formation Développeur d'application JavaScript React, OpenClassroom.
