import recipes from "./data.js";
import renderRecipes from "./templates/card.js";

/**
 * Point d'entrée : affiche les recettes via factory-pattern/card.js
 */
/*document.addEventListener("DOMContentLoaded", () => {
  if (typeof recipes === "undefined" || !Array.isArray(recipes)) {
    return;
  }
  if (typeof renderRecipes === "function") {*/
renderRecipes(recipes);
/*}
});
*/