import renderRecipes from "./templates/card.js";
import { normalize, recipeMatchesSearch } from "./recipeSearch.js";

// Filtres recettes : filtre blanc (boutons + listes pour choisir), tag jaune (sélections affichées).

// Extrait la liste des ingrédients uniques (tri alphabétique)
function extractUniqueIngredients(recipes) {
  const seen = new Set();
  for (const recipe of recipes) {
    for (const item of recipe.ingredients) {
      if (!item.ingredient) continue;
      seen.add(normalize(item.ingredient));
    }
  }
  return [...seen].sort((a, b) => a.localeCompare(b, "fr"));
}

// Extrait la liste des appareils uniques
function extractUniqueAppliances(recipes) {
  const seen = new Set();
  for (const recipe of recipes) {
    if (!recipe.appliance) continue;
    seen.add(normalize(recipe.appliance));
  }
  return [...seen].sort((a, b) => a.localeCompare(b, "fr"));
}

// Extrait la liste des ustensiles uniques
function extractUniqueUstensils(recipes) {
  const seen = new Set();
  for (const recipe of recipes) {
    for (const name of recipe.ustensils) {
      if (!name) continue;
      seen.add(normalize(name));
    }
  }
  return [...seen].sort((a, b) => a.localeCompare(b, "fr"));
}

// Retourne les recettes qui correspondent à la recherche et à tous les critères sélectionnés
function filterRecipes(recipes, selectedItems, searchQuery) {
  const q = normalize(searchQuery);
  return recipes.filter((recipe) => {
    if (!recipeMatchesSearch(recipe, q)) return false;
    for (const item of selectedItems) {
      if (item.type === "ingredient") {
        const recipeIng = new Set(recipe.ingredients.map((i) => normalize(i.ingredient)));
        if (!recipeIng.has(normalize(item.value))) return false;
      } else if (item.type === "appliance") {
        if (normalize(recipe.appliance) !== normalize(item.value)) return false;
      } else if (item.type === "ustensil") {
        const recipeUst = new Set(recipe.ustensils.map((u) => normalize(u)));
        if (!recipeUst.has(normalize(item.value))) return false;
      }
    }
    return true;
  });
}

// Filtre blanc : une ligne cliquable dans la liste déroulante
function createOptionEl(label, selected, onSelect) {
  const li = document.createElement("li");
  li.className =
    "cursor-pointer px-4 py-2.5 font-manrope text-base font-medium leading-none text-dark transition-colors hover:bg-light-gray focus:bg-light-gray focus:outline-none";
  li.setAttribute("role", "option");
  li.setAttribute("aria-selected", selected ? "true" : "false");
  li.textContent = label;
  li.addEventListener("click", (e) => {
    e.stopPropagation();
    onSelect();
  });
  return li;
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

// Tag jaune : pastille avec le choix sélectionné + bouton pour retirer
function createSelectedTagEl(label, onRemove) {
  const tag = document.createElement("span");
  tag.className =
    "inline-flex h-[53px] w-[203px] items-center justify-between gap-2 rounded-ui bg-primary px-[18px] py-[17px] font-manrope text-sm font-normal leading-none tracking-normal text-dark opacity-100";
  const crossSvg =
    '<svg class="shrink-0 opacity-100" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="2.17" stroke-linecap="round"/></svg>';
  tag.innerHTML = `<span class="min-w-0 flex-1 truncate">${escapeHtml(label)}</span> <button type="button" class="inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center border-0 bg-transparent p-0 cursor-pointer text-dark opacity-100 m-0 hover:opacity-90" aria-label="Retirer ${escapeHtml(label)}">${crossSvg}</button>`;
  tag.querySelector("button").addEventListener("click", (e) => {
    e.stopPropagation();
    onRemove();
    tag.remove();
  });
  return tag;
}

// Initialise les 3 filtres (filtre blanc) et la liste des tags (tag jaune)
function initRecipe(recipes) {
  const ingredientsList = extractUniqueIngredients(recipes);
  const appliancesList = extractUniqueAppliances(recipes);
  const ustensilsList = extractUniqueUstensils(recipes);

  // La variable qui stocke les tags des filtres sélectionnés
  const selectedItems = [];

  let searchQuery = "";

  // Tag jaune : conteneur DOM des tags
  const selectedListEl = document.getElementById("recipes-selected-list");

  // Filtre blanc : config des 3 boutons (Ingrédients, Appareils, Ustensiles) et leurs listes
  const configs = [
    {
      type: "ingredient",
      label: "Ingrédients",
      options: ingredientsList,
      btnSelector: '[data-filter="ingredients"]',
    },
    {
      type: "appliance",
      label: "Appareils",
      options: appliancesList,
      btnSelector: '[data-filter="appliances"]',
    },
    {
      type: "ustensil",
      label: "Ustensiles",
      options: ustensilsList,
      btnSelector: '[data-filter="ustensils"]',
    },
  ];

  let openDropdown = null;

  function applyFilter() {
    const filtered = filterRecipes(recipes, selectedItems, searchQuery);
    renderRecipes(filtered);
    renderSelectedList();
  }

  // Tag jaune : met à jour l'affichage des tags
  function renderSelectedList() {
    selectedListEl.innerHTML = "";
    selectedItems.forEach((item, i) => {
      selectedListEl.appendChild(
        createSelectedTagEl(item.value, () => {
          selectedItems.splice(i, 1);
          applyFilter();
        })
      );
    });
  }

  function closeDropdown() {
    if (openDropdown) {
      openDropdown.classList.add("hidden");
      openDropdown.classList.remove("block");
      const btn = openDropdown.parentElement?.querySelector(".recipes-filter-btn");
      if (btn) btn.setAttribute("aria-expanded", "false");
      openDropdown = null;
    }
  }

  function openDropdownFor(panel) {
    closeDropdown();
    openDropdown = panel;
    panel.classList.remove("hidden");
    panel.classList.add("block");
    const btn = panel.parentElement?.querySelector(".recipes-filter-btn");
    if (btn) btn.setAttribute("aria-expanded", "true");
  }

  function isAlreadySelected(type, value) {
    return selectedItems.some(
      (s) => s.type === type && normalize(s.value) === normalize(value)
    );
  }

  // Filtre blanc : crée le bouton + la liste déroulante pour un type
  function buildDropdown(config) {
    const btn = document.querySelector(config.btnSelector);
    if (!btn) return;

    const wrapper = document.createElement("div");
    wrapper.className = "relative flex flex-col items-start gap-2";
    btn.parentNode.insertBefore(wrapper, btn);
    wrapper.appendChild(btn);

    const dropdown = document.createElement("div");
    dropdown.className =
      "absolute left-0 top-full z-50 mt-1 hidden min-w-[195px] max-h-[280px] overflow-y-auto rounded-ui bg-white py-2 shadow-lg";
    dropdown.setAttribute("role", "listbox");
    dropdown.setAttribute("aria-label", config.label);
    wrapper.appendChild(dropdown);

    const list = document.createElement("ul");
    list.className = "m-0 list-none p-0";
    dropdown.appendChild(list);

    function renderOptionsFor() {
      list.innerHTML = "";
      for (const opt of config.options) {
        const selected = isAlreadySelected(config.type, opt);
        const li = createOptionEl(opt, selected, () => {
          if (selected) return;
          selectedItems.push({ type: config.type, value: opt });
          renderSelectedList();
          closeDropdown();
          applyFilter();
        });
        list.appendChild(li);
      }
    }

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (dropdown.classList.contains("block")) {
        closeDropdown();
      } else {
        openDropdownFor(dropdown);
        renderOptionsFor();
      }
    });

    renderOptionsFor();
  }

  configs.forEach((config) => buildDropdown(config));
  renderSelectedList();

  document.addEventListener("click", () => closeDropdown());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDropdown();
  });

  applyFilter();

  return {
    setSearchQuery(value) {
      searchQuery = value;
      applyFilter();
    },
  };
}

export {
  initRecipe,
};
