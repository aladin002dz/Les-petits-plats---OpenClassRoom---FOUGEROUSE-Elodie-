import { initRecipe } from "./filters.js";
import { attachSearch } from "./search.js";

async function init() {
  // Charge les recettes depuis recipes.json
  const res = await fetch("./data/recipes.json");
  const recipes = await res.json();

  // Lance les filtres et récupère la fonction pour mettre à jour la recherche
  const { setSearchQuery } = initRecipe(recipes);

  // Connecte la barre de recherche aux filtres
  attachSearch({ onQueryChange: setSearchQuery });
}

init();
