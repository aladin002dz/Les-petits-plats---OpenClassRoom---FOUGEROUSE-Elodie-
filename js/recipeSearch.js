// Logique de recherche textuelle sur les recettes (sans DOM).

// Normalise une chaîne pour comparaison (minuscules, trim)
export function normalize(s) {
  return s.trim().toLowerCase();
}

// Construit le texte indexé d'une recette (nom, description, ingrédients)
function recipeSearchText(recipe) {
  const parts = [
    recipe.name,
    recipe.description,
    ...recipe.ingredients.map((i) => i.ingredient),
  ];
  return normalize(parts.join(" "));
}

// Vérifie si une recette correspond à la requête de recherche
export function recipeMatchesSearch(recipe, normalizedQuery) {
  if (!normalizedQuery) return true;
  return recipeSearchText(recipe).includes(normalizedQuery);
}
