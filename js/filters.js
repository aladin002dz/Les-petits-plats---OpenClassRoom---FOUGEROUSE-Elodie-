import renderRecipes from "./templates/card.js";

/**
 * Filtres recettes : filtre blanc (boutons + listes pour choisir), tag jaune (sélections affichées).
 */

/** @typedef {{ type: 'ingredient'|'appliance'|'ustensil', value: string }} SelectedItem */

// Normalise une chaîne pour comparaison (minuscules, trim)
function normalize(s) {
  return String(s ?? "").trim().toLowerCase();
}

// Extrait la liste des ingrédients uniques (tri alphabétique)
function extractUniqueIngredients(recipes) {
  const seen = new Set();
  //const list = [];
  for (const recipe of recipes) {
    for (const item of recipe.ingredients || []) {
      const name = item.ingredient ?? "";
      if (!name) continue;
      const key = normalize(name);
      //if (seen.has(key)) continue;
      seen.add(key);
      //list.push(name);
    }
  }
  return [...seen].sort((a, b) => a.localeCompare(b, "fr"));
}

// Extrait la liste des appareils uniques
function extractUniqueAppliances(recipes) {
  const seen = new Set();
  //const list = [];
  for (const recipe of recipes) {
    const name = recipe.appliance ?? "";
    if (!name) continue;
    const key = normalize(name);
    //if (seen.has(key)) continue;
    seen.add(key);
    //list.push(name);
  }
  return [...seen].sort((a, b) => a.localeCompare(b, "fr"));
}

// Extrait la liste des ustensiles uniques
function extractUniqueUstensils(recipes) {
  const seen = new Set();
  //const list = [];
  for (const recipe of recipes) {
    for (const name of recipe.ustensils || []) {
      const trimmed = name ?? ""; //String(name ?? "").trim();
      if (!trimmed) continue;
      const key = normalize(trimmed);
      //if (seen.has(key)) continue;
      seen.add(key);
      //list.push(trimmed);
    }
  }
  return [...seen].sort((a, b) => a.localeCompare(b, "fr"));
}

// Retourne les recettes qui correspondent à tous les critères sélectionnés
function filterRecipes(recipes, selectedItems) {
  return recipes.filter((recipe) => {
    for (const item of selectedItems) {
      if (item.type === "ingredient") {
        const recipeIng = new Set(
          (recipe.ingredients || []).map((i) => normalize(i.ingredient ?? ""))
        );
        if (!recipeIng.has(normalize(item.value))) return false;
      } else if (item.type === "appliance") {
        if (normalize(recipe.appliance ?? "") !== normalize(item.value)) return false;
      } else if (item.type === "ustensil") {
        const recipeUst = new Set(
          (recipe.ustensils || []).map((u) => normalize(String(u)))
        );
        if (!recipeUst.has(normalize(item.value))) return false;
      }
    }
    return true;
  });
}

// Filtre blanc : une ligne cliquable dans la liste déroulante (ingrédient, appareil ou ustensile)
function createOptionEl(label, selected, onSelect) {
  const li = document.createElement("li");
  li.className =
    "cursor-pointer px-4 py-2.5 font-[Manrope] text-base font-medium leading-none text-dark transition-colors hover:bg-light-gray focus:bg-light-gray focus:outline-none";
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
    "inline-flex h-[53px] w-[203px] items-center justify-between gap-2 rounded-[10px] bg-primary px-[18px] py-[17px] font-[Manrope] text-sm font-normal leading-none tracking-normal text-dark opacity-100";
  const crossSvg =
    '<svg class="shrink-0 opacity-100" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="2.17" stroke-linecap="round"/></svg>';
  tag.innerHTML = `<span class="min-w-0 flex-1 truncate">${escapeHtml(label)}</span> <button type="button" class="inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center border-0 bg-transparent p-0 cursor-pointer text-dark opacity-100 m-0 hover:opacity-90" aria-label="Retirer ${escapeHtml(label)}">${crossSvg}</button>`;
  tag.querySelector("button").addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove();
  });
  return tag;
}

// Initialise les 3 filtres (filtre blanc) et la liste des tags (tag jaune) ; appelle onFilterChange à chaque changement
function initFilters(recipes/*, onFilterChange*/) {
  const ingredientsList = extractUniqueIngredients(recipes);
  const appliancesList = extractUniqueAppliances(recipes);
  const ustensilsList = extractUniqueUstensils(recipes);

  /** @type {SelectedItem[]} */
  const selectedItems = [];

  // Tag jaune : conteneur DOM des tags
  const selectedListEl = document.getElementById("recipes-selected-list");

  // Filtre blanc : config des 3 boutons (Ingrédients, Appareils, Ustensiles) et leurs listes
  const configs = [
    {
      key: "ingredients",
      type: "ingredient",
      label: "Ingrédients",
      options: ingredientsList,
      btnSelector: '[data-filter="ingredients"]',
    },
    {
      key: "appliances",
      type: "appliance",
      label: "Appareils",
      options: appliancesList,
      btnSelector: '[data-filter="appliances"]',
    },
    {
      key: "ustensils",
      type: "ustensil",
      label: "Ustensiles",
      options: ustensilsList,
      btnSelector: '[data-filter="ustensils"]',
    },
  ];

  let openDropdown = null;

  function applyFilter() {
    const filtered = filterRecipes(recipes, selectedItems);
    //onFilterChange(filtered);
    renderRecipes(filtered);
  }

  // Tag jaune : met à jour l’affichage des tags
  function renderSelectedList() {
    if (!selectedListEl) return;
    selectedListEl.innerHTML = "";
    selectedItems.forEach((item, i) => {
      selectedListEl.appendChild(
        createSelectedTagEl(item.value, () => {
          selectedItems.splice(i, 1);
          renderSelectedList();
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

  // Filtre blanc : crée le bouton + la liste déroulante pour un type (ingrédients, appareils ou ustensiles)
  function buildDropdown(config) {
    const btn = document.querySelector(config.btnSelector);
    if (!btn) return;

    const wrapper = document.createElement("div");
    wrapper.className = "relative flex flex-col items-start gap-2";
    btn.parentNode.insertBefore(wrapper, btn);
    wrapper.appendChild(btn);

    const dropdown = document.createElement("div");
    dropdown.className =
      "absolute left-0 top-full z-50 mt-1 hidden min-w-[195px] max-h-[280px] overflow-y-auto rounded-[11px] bg-white py-2 shadow-lg";
    dropdown.setAttribute("role", "listbox");
    dropdown.setAttribute("aria-label", config.label);
    wrapper.appendChild(dropdown);

    const list = document.createElement("ul");
    list.className = "m-0 list-none p-0";
    dropdown.appendChild(list);

    function renderOptionsFor(/*cfg*/) {
      list.innerHTML = "";
      for (const opt of config.options) {
        const selected = isAlreadySelected(config.type, opt);
        const li = createOptionEl(opt, selected, () => {
          if (selected) return;
          selectedItems.push({ type: config.type, value: opt });
          renderSelectedList();
          /*configs.forEach((c) => {
            if (c.key === config.key) renderOptionsFor(c);
          });*/
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
        renderOptionsFor(config);
      }
    });

    renderOptionsFor(config);
  }


  //configs.forEach(buildDropdown);
  configs.forEach((config) => buildDropdown(config));
  renderSelectedList();

  document.addEventListener("click", () => closeDropdown());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDropdown();
  });

  applyFilter();
}

export {
  /*extractUniqueIngredients,
  extractUniqueAppliances,
  extractUniqueUstensils,
  filterRecipes,*/
  initFilters,
};
