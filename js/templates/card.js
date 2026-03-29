// Chemin des images de recettes (relatif à index.html).
const IMAGE_BASE_PATH = "./assets/images/recettes/";

// Construit la carte DOM d'une recette (recipe : objet recette provenant de recipes.json)
function createRecipeCard(recipe) {
  const { name, image, time, ingredients, description } = recipe;

  const article = document.createElement("article");
  article.className =
    "flex h-full max-h-[731px] flex-col overflow-hidden rounded-card bg-white shadow-sm ring-1 ring-light-gray";

  // Image
  const figure = document.createElement("figure");
  figure.className = "relative h-48 min-h-[253px] w-full overflow-hidden bg-light-gray";

  const img = document.createElement("img");
  img.src = IMAGE_BASE_PATH + image;
  img.alt = name;
  img.className = "h-full w-full object-cover";

  const timeBadge = document.createElement("p");
  timeBadge.className =
    "pointer-events-none absolute right-3 top-3 inline-flex items-center justify-center rounded-full bg-primary px-3 py-1.5 font-manrope text-xs font-normal leading-none tracking-normal text-dark";
  timeBadge.textContent = `${time} min`;

  figure.appendChild(img);
  figure.appendChild(timeBadge);

  // Contenu texte
  const content = document.createElement("div");
  content.className = "flex flex-1 flex-col gap-3 px-6 py-10";

  const title = document.createElement("h2");
  title.className = "font-Anton text-lg font-normal leading-none tracking-normal text-dark pb-4";
  title.textContent = name;

  const recipeHeading = document.createElement("h3");
  recipeHeading.className =
    "font-manrope text-xs font-bold leading-none tracking-[0.09em] pb-2 uppercase text-gray";
  recipeHeading.textContent = "Recette";

  const descriptionEl = document.createElement("p");
  descriptionEl.className =
    "line-clamp-4 mb-6 font-manrope text-sm font-normal leading-normal tracking-normal text-dark";
  descriptionEl.textContent = description;

  const ingredientsHeading = document.createElement("h3");
  ingredientsHeading.className =
    "font-manrope mb-1 text-xs font-bold leading-none tracking-[0.09em] uppercase text-gray";
  ingredientsHeading.textContent = "Ingrédients";

  const ingredientsList = document.createElement("ul");
  ingredientsList.className = "grid grid-cols-2 gap-x-10 gap-y-6 pt-2 text-xs text-gray";

  for (const item of ingredients) {
    const li = document.createElement("li");
    li.className = "flex flex-col gap-1.5";

    const nameSpan = document.createElement("span");
    nameSpan.className =
      "font-manrope text-sm font-medium leading-none tracking-normal text-dark";
    nameSpan.textContent = item.ingredient;

    const quantity = item.quantity || "";
    const unit = item.unit || item.unite || "";
    const detail = [quantity, unit].filter(Boolean).join(" ");

    li.appendChild(nameSpan);
    if (detail) {
      const detailsSpan = document.createElement("span");
      detailsSpan.className =
        "font-manrope text-sm font-normal leading-none tracking-normal text-gray";
      detailsSpan.textContent = detail;
      li.appendChild(detailsSpan);
    }

    ingredientsList.appendChild(li);
  }

  content.appendChild(title);
  content.appendChild(recipeHeading);
  content.appendChild(descriptionEl);
  content.appendChild(ingredientsHeading);
  content.appendChild(ingredientsList);

  article.appendChild(figure);
  article.appendChild(content);

  return article;
}

// Affiche une liste de recettes dans le conteneur prévu (recipeList : tableau, query : chaîne de recherche)
function renderRecipes(recipeList, query = "") {
  const grid = document.getElementById("recipes-grid");
  grid.innerHTML = "";

  if (recipeList.length === 0) {
    const msg = document.createElement("p");
    msg.className = "col-span-full font-manrope text-base text-dark text-center py-12";
    const safeQuery = query.trim();
    msg.textContent = safeQuery
      ? `Aucune recette ne contient "${safeQuery}", vous pouvez chercher "tarte aux pommes", "poisson", etc.`
      : "Aucune recette ne correspond à votre recherche.";
    grid.appendChild(msg);
  } else {
    for (const recipe of recipeList) {
      grid.appendChild(createRecipeCard(recipe));
    }
  }

  const total = recipeList.length;
  document.getElementById("recipes-count").textContent = `${total} recette${total > 1 ? "s" : ""}`;
}

export default renderRecipes;
