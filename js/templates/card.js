import updateRecipesResultLabel from "./resultats.js";

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
      "flex max-h-[731px] h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-light-gray";
    article.setAttribute("data-recipe-id", String(id));

    // Image
    const figure = document.createElement("figure");
    figure.className = "relative min-h-[253px] h-48 w-full overflow-hidden bg-light-gray";

    const img = document.createElement("img");
    img.src = IMAGE_BASE_PATH.replace(/\/?$/, "/") + image;
    img.alt = name;
    img.className = "h-full w-full object-cover";

    const timeBadge = document.createElement("p");
    timeBadge.className =
      "pointer-events-none absolute right-3 top-3 inline-flex items-center justify-center rounded-full bg-primary px-3 py-1.5 font-[family-name:Manrope,sans-serif] text-xs font-normal leading-none tracking-normal text-dark";
    timeBadge.textContent = `${time} min`;

    figure.appendChild(img);
    figure.appendChild(timeBadge);

    // Contenu texte
    const content = document.createElement("div");
    content.className = "flex flex-1 flex-col gap-3 px-6 py-10";

    const header = document.createElement("header");
    header.className = "flex items-start justify-between gap-2";

    const title = document.createElement("h2");
    title.className = "font-[Anton] text-lg font-normal leading-none tracking-normal text-dark pb-4";
    title.textContent = name;

    header.appendChild(title);

    const recipeHeading = document.createElement("h3");
    recipeHeading.className =
      "font-[Manrope] text-xs font-bold leading-none tracking-[0.09em] pb-2 uppercase text-gray";
    recipeHeading.textContent = "Recette";

    const descriptionEl = document.createElement("p");
    descriptionEl.className =
      "line-clamp-4 mb-6 font-[Manrope] text-sm font-normal leading-normal tracking-normal text-dark";
    descriptionEl.textContent = description;

    const ingredientsHeading = document.createElement("h3");
    ingredientsHeading.className =
      "font-[Manrope] mb-1 text-xs font-bold leading-none tracking-[0.09em] uppercase text-gray";
    ingredientsHeading.textContent = "Ingrédients";

    const ingredientsList = document.createElement("ul");
    ingredientsList.className =
      "grid grid-cols-2 gap-x-10fr gap-y-6 pt-2 text-xs text-gray";

    ingredients.forEach((item) => {
      const li = document.createElement("li");
      li.className = "flex flex-col gap-1.5";

      const nameSpan = document.createElement("span");
      nameSpan.className =
        "font-[Manrope] text-sm font-medium leading-none tracking-normal text-dark";
      nameSpan.textContent = item.ingredient;

      const detailsSpan = document.createElement("span");
      detailsSpan.className =
        "font-[Manrope] text-sm font-normal leading-none tracking-normal text-gray";

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
    content.appendChild(recipeHeading);
    content.appendChild(descriptionEl);
    content.appendChild(ingredientsHeading);
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


  if (!grid) {
    return;
  }

  grid.innerHTML = "";

  recipeList.forEach((recipe) => {
    const { getRecipeCardDOM } = recipeFactory(recipe);
    const card = getRecipeCardDOM();
    grid.appendChild(card);
  });

  updateRecipesResultLabel(recipeList.length);
}


export default renderRecipes;
