import renderRecipes from "./templates/card.js";

/**
 * Charge les recettes du JSON puis les affiche
 */
async function init() {
  const url = new URL("./recipes.json", import.meta.url).href;
  const res = await fetch(url);
  if (!res.ok) return;
  const recipes = await res.json();
  if (!Array.isArray(recipes)) return;
  renderRecipes(recipes);
}

init();