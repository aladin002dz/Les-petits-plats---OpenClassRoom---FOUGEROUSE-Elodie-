//import renderRecipes from "./templates/card.js";
import { initFilters } from "./filters.js";


async function init() {
  // Charge les recettes depuis recipes.json
  const res = await fetch("./data/recipes.json");
  if (!res.ok) return;
  const recipes = await res.json();
  if (!Array.isArray(recipes)) return;

  // Initialise les filtres ; à chaque changement, met à jour la grille et le résultat
  initFilters(recipes);
}

init();