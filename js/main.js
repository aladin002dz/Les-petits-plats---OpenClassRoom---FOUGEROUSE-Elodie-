import renderRecipes from "./templates/card.js";
import { initFilters } from "./filters.js";

async function init() {
  // Charge les recettes depuis recipes.json
  const url = new URL("./recipes.json", import.meta.url).href;
  const res = await fetch(url);
  if (!res.ok) return;
  const recipes = await res.json();
  if (!Array.isArray(recipes)) return;

  // Initialise les filtres ; à chaque changement, met à jour la grille et le résultat
  initFilters(recipes, (filtered) => {
    renderRecipes(filtered);
  });
}

init();