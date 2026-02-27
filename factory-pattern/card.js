// Chemin des images de recettes (relatif à index.html).
const IMAGE_BASE_PATH = "./assets/images/recettes/";

/**
 * Factory pattern pour une recette.
 * @param {Object} data - Objet recette provenant de `recipes`.
 * @returns {{ id: number, name: string, time: number, getRecipeCardDOM: () => HTMLElement }}
 */
function recipeFactory(data) {
  const { id, name, image, time, ingredients, description } = data;

  /**
   * Construit la carte DOM pour la recette, stylée avec Tailwind.
   * @returns {HTMLElement}
   */
  function getRecipeCardDOM() {
    const article = document.createElement("article");
    article.className =
      "flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200";
    article.setAttribute("data-recipe-id", String(id));

    // Image
    const figure = document.createElement("figure");
    figure.className = "relative h-48 w-full overflow-hidden bg-slate-100";

    const img = document.createElement("img");
    img.src = IMAGE_BASE_PATH.replace(/\/?$/, "/") + image;
    img.alt = name;
    img.className = "h-full w-full object-cover";

    const timeBadge = document.createElement("p");
    timeBadge.className =
      "pointer-events-none absolute right-3 top-3 inline-flex items-center rounded-full bg-yellow-400 px-3 py-1 text-xs font-medium text-gray-700";
    timeBadge.textContent = `${time} min`;

    figure.appendChild(img);
    figure.appendChild(timeBadge);

    // Contenu texte
    const content = document.createElement("div");
    content.className = "flex flex-1 flex-col gap-3 p-4";

    const header = document.createElement("header");
    header.className = "flex items-start justify-between gap-2";

    const title = document.createElement("h2");
    title.className = "text-sm font-semibold leading-snug text-slate-900";
    title.textContent = name;

    const servings = document.createElement("p");
    servings.className = "text-xs font-medium text-slate-500";
    if (typeof data.servings === "number") {
      servings.textContent =
        data.servings <= 1 ? "1 portion" : `${data.servings} portions`;
    }

    header.appendChild(title);
    header.appendChild(servings);

    const descriptionEl = document.createElement("p");
    descriptionEl.className = "line-clamp-3 text-xs text-slate-600";
    descriptionEl.textContent = description;

    const ingredientsList = document.createElement("ul");
    ingredientsList.className =
      "mt-auto grid grid-cols-2 gap-x-3 gap-y-1 pt-2 text-xs text-slate-700";

    ingredients.forEach((item) => {
      const li = document.createElement("li");

      const nameSpan = document.createElement("span");
      nameSpan.className = "font-semibold";
      nameSpan.textContent = item.ingredient;

      const detailsSpan = document.createElement("span");
      detailsSpan.className = "ml-1 text-slate-500";

      const quantity = item.quantity ?? "";
      const unit = item.unit ?? item.unite ?? "";
      const parts = [quantity, unit].filter(Boolean);
      detailsSpan.textContent = parts.length ? parts.join(" ") : "";

      li.appendChild(nameSpan);
      if (detailsSpan.textContent) {
        li.appendChild(detailsSpan);
      }

      ingredientsList.appendChild(li);
    });

    content.appendChild(header);
    content.appendChild(descriptionEl);
    content.appendChild(ingredientsList);

    article.appendChild(figure);
    article.appendChild(content);

    return article;
  }

  return {
    id,
    name,
    time,
    getRecipeCardDOM,
  };
}

/**
 * Affiche une liste de recettes dans le conteneur prévu.
 * @param {Array<Object>} recipeList
 */
function renderRecipes(recipeList) {
  const grid = document.getElementById("recipes-grid");
  const countLabel = document.getElementById("recipes-count");

  if (!grid) {
    return;
  }

  grid.innerHTML = "";

  recipeList.forEach((recipe) => {
    const { getRecipeCardDOM } = recipeFactory(recipe);
    const card = getRecipeCardDOM();
    grid.appendChild(card);
  });

  if (countLabel) {
    const total = recipeList.length;
    countLabel.textContent =
      total <= 1 ? "1 recette trouvée" : `${total} recettes trouvées`;
  }
}
