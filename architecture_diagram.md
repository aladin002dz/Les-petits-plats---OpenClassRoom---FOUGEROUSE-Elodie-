# Les Petits Plats — Architecture Diagram

## Project Overview

A vanilla JS recipe-search app. Users filter 1500+ recipes by **ingredients**, **appliances**, and **ustensils** via dropdown filters and yellow tag chips. The UI updates in real time.

---

## High-Level Flow

```mermaid
flowchart TD
    subgraph "Entry Point"
        A["index.html loads main.js\n(type=module)"]
    end

    subgraph "Initialization (main.js)"
        B["init()"]
        C["fetch recipes.json"]
        D["Parse JSON → recipes array"]
    end

    subgraph "Filter System (filters.js)"
        E["initFilters(recipes, callback)"]
        F["Extract unique values"]
        F1["extractUniqueIngredients()"]
        F2["extractUniqueAppliances()"]
        F3["extractUniqueUstensils()"]
        G["Build 3 dropdown panels\n(buildDropdown)"]
        H["selectedItems[] state"]
        I["User clicks option\n→ push to selectedItems"]
        J["User removes tag\n→ splice from selectedItems"]
        K["applyFilter()"]
        L["filterRecipes(recipes, selectedItems)"]
    end

    subgraph "Rendering (templates/card.js)"
        M["renderRecipes(filtered)"]
        N["recipeFactory(data)\n→ getRecipeCardDOM()"]
        O["Build article element\n(image, title, description, ingredients)"]
    end

    subgraph "Result Counter (templates/resultats.js)"
        P["updateRecipesResultLabel(count)"]
    end

    subgraph "DOM (index.html)"
        Q["#recipes-grid\n(recipe cards)"]
        R["#recipes-count\n(result label)"]
        S["#recipes-selected-list\n(yellow tags)"]
        T[".recipes-filter-btn × 3\n(dropdown buttons)"]
    end

    A --> B
    B --> C
    C --> D
    D --> E

    E --> F
    F --> F1 & F2 & F3
    F1 & F2 & F3 --> G

    G --> T
    T -- "click" --> I
    I --> H
    S -- "remove click" --> J
    J --> H

    H --> K
    K --> L
    L -- "callback(filtered)" --> M

    M --> N
    N --> O
    O --> Q

    M --> P
    P --> R

    E -- "renderSelectedList()" --> S
```

### 📎 Function References

| Function | File | Line |
|---|---|---|
| [`init()`](./js/main.js#L4) | `main.js` | L4 |
| [`initFilters()`](./js/filters.js#L121) | `filters.js` | L121 |
| [`extractUniqueIngredients()`](./js/filters.js#L13) | `filters.js` | L13 |
| [`extractUniqueAppliances()`](./js/filters.js#L30) | `filters.js` | L30 |
| [`extractUniqueUstensils()`](./js/filters.js#L45) | `filters.js` | L45 |
| [`filterRecipes()`](./js/filters.js#L62) | `filters.js` | L62 |
| [`buildDropdown()`](./js/filters.js#L205) | `filters.js` | L205 |
| [`applyFilter()`](./js/filters.js#L159) | `filters.js` | L159 |
| [`renderSelectedList()`](./js/filters.js#L165) | `filters.js` | L165 |
| [`createOptionEl()`](./js/filters.js#L84) | `filters.js` | L84 |
| [`createSelectedTagEl()`](./js/filters.js#L105) | `filters.js` | L105 |
| [`normalize()`](./js/filters.js#L8) | `filters.js` | L8 |
| [`renderRecipes()`](./js/templates/card.js#L123) | `card.js` | L123 |
| [`recipeFactory()`](./js/templates/card.js#L11) | `card.js` | L11 |
| [`updateRecipesResultLabel()`](./js/templates/resultats.js#L19) | `resultats.js` | L19 |

---

## Data Flow Sequence

```mermaid
sequenceDiagram
    participant HTML as index.html
    participant Main as main.js
    participant JSON as recipes.json
    participant Filters as filters.js
    participant Card as templates/card.js
    participant Result as templates/resultats.js

    HTML->>Main: <script type="module"> loads main.js
    Main->>JSON: fetch("recipes.json")
    JSON-->>Main: Recipe[] (50 recipes)

    Main->>Filters: initFilters(recipes, callback)
    Filters->>Filters: extractUniqueIngredients()
    Filters->>Filters: extractUniqueAppliances()
    Filters->>Filters: extractUniqueUstensils()
    Filters->>HTML: buildDropdown() × 3 → attach to .recipes-filter-btn
    Filters->>Filters: applyFilter() (initial, no selection)
    Filters-->>Main: callback(allRecipes)
    Main->>Card: renderRecipes(allRecipes)
    Card->>Card: recipeFactory() per recipe
    Card->>HTML: Append cards to #recipes-grid
    Card->>Result: updateRecipesResultLabel(count)
    Result->>HTML: Update #recipes-count text

    Note over HTML,Filters: User selects a filter option
    HTML->>Filters: click event on dropdown option
    Filters->>Filters: push to selectedItems[]
    Filters->>HTML: renderSelectedList() → yellow tags in #recipes-selected-list
    Filters->>Filters: filterRecipes(recipes, selectedItems)
    Filters-->>Main: callback(filteredRecipes)
    Main->>Card: renderRecipes(filteredRecipes)
    Card->>HTML: Replace #recipes-grid content
    Card->>Result: updateRecipesResultLabel(newCount)
    Result->>HTML: Update #recipes-count

    Note over HTML,Filters: User removes a tag
    HTML->>Filters: click × button on yellow tag
    Filters->>Filters: splice from selectedItems[]
    Filters->>HTML: renderSelectedList() → update tags
    Filters->>Filters: filterRecipes(recipes, selectedItems)
    Filters-->>Main: callback(filteredRecipes)
    Main->>Card: renderRecipes(filteredRecipes)
    Card->>HTML: Replace #recipes-grid content
```

---

## Dropdown Selection Flow

This diagram details the specific sequence of events triggered when a user clicks on an option within one of the filter dropdowns (Ingredients, Appliances, or Ustensils).

```mermaid
flowchart TD
    Click(["User clicks a dropdown option"]) --> Check{"Is option already selected?"}
    Check -- "Yes" --> Ignore["Return (Do nothing)"]
    Check -- "No" --> Push["Push item to selectedItems array"]
    
    Push --> RenderTags["Call renderSelectedList()\nUpdates yellow tags in UI"]
    RenderTags --> RenderOpts["Call renderOptionsFor()\nRe-renders current dropdown options"]
    RenderOpts --> ApplyFilter["Call applyFilter()"]
    
    subgraph "Filtering and Rendering"
        ApplyFilter --> Filter["Call filterRecipes(recipes, selectedItems)"]
        Filter --> RenderRecipes["Call renderRecipes(filtered)\nUpdates recipe cards in DOM"]
        RenderRecipes --> UpdateCount["Call updateRecipesResultLabel(count)\nUpdates recipes count text"]
    end
```

---

## File Structure

```mermaid
graph LR
    subgraph Project
        IDX["index.html"]
        style IDX fill:#FFD15B,color:#1B1B1B

        subgraph js/
            MAIN["main.js\n(entry point)"]
            FILT["filters.js\n(filter logic + UI)"]
            DATA["recipes.json\n(data source)"]
            subgraph templates/
                CARD["card.js\n(recipe card factory)"]
                RES["resultats.js\n(result counter)"]
            end
        end

        subgraph css/
            CSS["style.css\n(Tailwind build)"]
        end

        subgraph assets/images/
            HERO["Header image"]
            LOGO["Logo.svg"]
            REC["recettes/*.webp"]
        end
    end

    IDX -- "script module" --> MAIN
    IDX -- "link stylesheet" --> CSS
    MAIN -- "import default" --> CARD
    MAIN -- "import initFilters" --> FILT
    MAIN -- "fetch" --> DATA
    CARD -- "import default" --> RES
    CARD -- "reads" --> REC
    IDX -- "background-image" --> HERO
    IDX -- "img src" --> LOGO
```

### 📎 File References

| File | Path | Description |
|---|---|---|
| [index.html](./index.html) | `./index.html` | Main HTML page with DOM structure |
| [main.js](./js/main.js) | `./js/main.js` | Entry point — fetch + init |
| [filters.js](./js/filters.js) | `./js/filters.js` | Filter logic, dropdowns & tags |
| [card.js](./js/templates/card.js) | `./js/templates/card.js` | Recipe card factory + rendering |
| [resultats.js](./js/templates/resultats.js) | `./js/templates/resultats.js` | Result counter update |
| [recipes.json](./js/recipes.json) | `./js/recipes.json` | Recipe data source |
| [style.css](./css/style.css) | `./css/style.css` | Tailwind CSS build |
