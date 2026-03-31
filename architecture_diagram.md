# Les Petits Plats — Architecture Diagram

## Project Overview

A vanilla JS recipe-search app. Users filter 1500+ recipes by **global search** (text), **ingredients**, **appliances**, and **ustensils** via dropdown filters and yellow tag chips. The UI updates in real time.

---

## High-Level Flow

```mermaid
flowchart TD
    subgraph "Entry Point"
        A["index.html loads main.js\n(type=module)"]
    end

    subgraph "Initialization (main.js)"
        B["init()"]
        C["fetch ./data/recipes.json"]
        D["Parse JSON → recipes array"]
        D1["initRecipe(recipes)"]
        D2["attachSearch({ onQueryChange })"]
    end

    subgraph "Global Search (search.js)"
        S1["Event listeners on\n#recipe-search-input & form"]
        S2["emit() on input > 2 chars or empty"]
    end

    subgraph "Filter System (filters.js)"
        E["initRecipe() scoped state"]
        E1["searchQuery state"]
        E2["selectedItems[] state"]
        G["buildDropdown() × 3"]
        G1["getOptionsFromRecipes()\nextract values per type"]
        G2["renderOptionsFor()\nrender option list in dropdown"]
        G3["isAlreadySelected()\nduplication guard"]
        G4["resetSearch()\nclear dropdown search input"]
        I["User clicks option\n→ push to selectedItems"]
        J["User removes tag\n→ splice from selectedItems"]
        K["applyFilter()"]
        L["filterRecipes()"]
        SEL["renderSelectedList()"]
        CD["closeDropdown()"]
        OD["openDropdownFor(panel)"]
    end

    subgraph "UI Helpers (filters.js)"
        CO["createOptionEl(label, selected, onSelect)\n→ li element"]
        CT["createSelectedTagEl(label, onRemove)\n→ yellow tag span"]
        EH["escapeHtml(s)"]
    end

    subgraph "Search Engine (recipeSearch.js)"
        R1["normalize()"]
        R2["stem()"]
        R3["recipeMatchesSearch()"]
        R4["recipeSearchText()\nbuild indexable text"]
    end

    subgraph "Rendering (templates/card.js)"
        M["renderRecipes(recipeList, query)"]
        N["createRecipeCard(recipe)\n→ article DOM element"]
        P["Inline counter update\n(#recipes-count)"]
    end

    A --> B
    B --> C
    C --> D
    D --> D1
    D1 -- "returns setSearchQuery" --> E
    D --> D2
    D2 --> S1

    S1 -- "calls onQueryChange" --> S2
    S2 -- "setSearchQuery(value)" --> E1

    E --> G
    G -- "calls" --> G1
    G1 -- "calls extractUnique()" --> G2
    G2 -- "creates" --> CO
    G -- "click option" --> I
    I --> E2
    I --> SEL
    SEL -- "creates tags via" --> CT
    CT -- "uses" --> EH
    I --> CD
    G -- "remove tag" --> J
    J --> E2

    E1 & E2 --> K
    K --> L
    L -- "calls" --> R3
    R3 -- "calls" --> R4
    R4 -- "uses" --> R1
    L -- "uses" --> R1 & R2
    L -- "renderRecipes(filtered, searchQuery)" --> M

    M --> N
    M --> P
```

### 📎 Function References

| Function | File | Line |
|---|---|---|
| [`init()`](./js/main.js#L4) | `main.js` | L4 |
| [`initRecipe()`](./js/filters.js#L77) | `filters.js` | L77 |
| [`extractUnique()`](./js/filters.js#L7) | `filters.js` | L7 |
| [`filterRecipes()`](./js/filters.js#L19) | `filters.js` | L19 |
| [`createOptionEl()`](./js/filters.js#L39) | `filters.js` | L39 |
| [`escapeHtml()`](./js/filters.js#L54) | `filters.js` | L54 |
| [`createSelectedTagEl()`](./js/filters.js#L61) | `filters.js` | L61 |
| [`applyFilter()`](./js/filters.js#L106) | `filters.js` | L106 |
| [`renderSelectedList()`](./js/filters.js#L113) | `filters.js` | L113 |
| [`closeDropdown()`](./js/filters.js#L125) | `filters.js` | L125 |
| [`openDropdownFor()`](./js/filters.js#L135) | `filters.js` | L135 |
| [`isAlreadySelected()`](./js/filters.js#L144) | `filters.js` | L144 |
| [`buildDropdown()`](./js/filters.js#L151) | `filters.js` | L151 |
| [`resetSearch()`](./js/filters.js#L195) | `filters.js` | L195 |
| [`getOptionsFromRecipes()`](./js/filters.js#L200) | `filters.js` | L200 |
| [`renderOptionsFor()`](./js/filters.js#L214) | `filters.js` | L214 |
| [`attachSearch()`](./js/search.js#L3) | `search.js` | L3 |
| [`emit()`](./js/search.js#L7) | `search.js` | L7 |
| [`normalize()`](./js/recipeSearch.js#L4) | `recipeSearch.js` | L4 |
| [`stem()`](./js/recipeSearch.js#L9) | `recipeSearch.js` | L9 |
| [`recipeSearchText()`](./js/recipeSearch.js#L17) | `recipeSearch.js` | L17 |
| [`recipeMatchesSearch()`](./js/recipeSearch.js#L27) | `recipeSearch.js` | L27 |
| [`createRecipeCard()`](./js/templates/card.js#L5) | `card.js` | L5 |
| [`renderRecipes()`](./js/templates/card.js#L93) | `card.js` | L93 |

---

## Data Flow Sequence

```mermaid
sequenceDiagram
    participant HTML as index.html
    participant Main as main.js
    participant Search as search.js
    participant Filters as filters.js
    participant RecSearch as recipeSearch.js
    participant Card as templates/card.js

    HTML->>Main: <script type="module"> loads main.js
    Main->>Main: fetch("./data/recipes.json")
    
    Main->>Filters: initRecipe(recipes)
    Filters->>Filters: buildDropdown() × 3
    Note over Filters: Each dropdown calls<br/>getOptionsFromRecipes() → extractUnique()<br/>then renderOptionsFor() → createOptionEl()
    Filters->>Filters: renderSelectedList() (empty initially)
    Filters->>Filters: applyFilter() (initial render)
    Filters->>Filters: filterRecipes(recipes, [], "")
    Filters->>RecSearch: recipeMatchesSearch(recipe, "")
    RecSearch-->>Filters: true (no query = match all)
    Filters->>Card: renderRecipes(allRecipes, "")
    Card->>Card: createRecipeCard() for each recipe
    Card->>HTML: Append cards to #recipes-grid
    Card->>HTML: Update #recipes-count
    Filters-->>Main: returns { setSearchQuery }

    Main->>Search: attachSearch({ onQueryChange: setSearchQuery })
    Search->>HTML: Listen to input on #recipe-search-input
    Search->>HTML: Listen to submit on #recipe-search-form

    Note over HTML,Filters: User types in global search
    HTML->>Search: "input" event
    Search->>Search: emit() — checks length ≥ 3 or empty
    Search->>Filters: setSearchQuery("pom")
    Filters->>Filters: applyFilter()
    Filters->>Filters: filterRecipes(recipes, selectedItems, "pom")
    Filters->>RecSearch: recipeMatchesSearch(recipe, "pom")
    RecSearch->>RecSearch: recipeSearchText(recipe) → normalize()
    RecSearch-->>Filters: true / false
    Filters->>Card: renderRecipes(filteredRecipes, "pom")
    Card->>Card: createRecipeCard() per match
    Card->>HTML: Replace cards + update count

    Note over HTML,Filters: User selects a dropdown filter
    HTML->>Filters: click event on dropdown option
    Filters->>Filters: isAlreadySelected() check
    Filters->>Filters: push to selectedItems[]
    Filters->>Filters: renderSelectedList() → createSelectedTagEl() → yellow tags
    Filters->>Filters: closeDropdown()
    Filters->>Filters: applyFilter()
    Filters->>Filters: filterRecipes(recipes, selectedItems, searchQuery)
    Filters->>RecSearch: recipeMatchesSearch() per recipe
    Filters->>Card: renderRecipes(filteredRecipes, searchQuery)
    Card->>HTML: Replace cards + update count

    Note over HTML,Filters: User removes a yellow tag
    HTML->>Filters: click × button on tag
    Filters->>Filters: splice from selectedItems[]
    Filters->>Filters: applyFilter()
    Filters->>Filters: filterRecipes(recipes, selectedItems, searchQuery)
    Filters->>Card: renderRecipes(filteredRecipes, searchQuery)
    Card->>HTML: Replace cards + update count
```

---

## Dropdown Selection Flow

This diagram details the specific sequence of events triggered when a user clicks on an option within one of the filter dropdowns (Ingredients, Appliances, or Ustensils).

```mermaid
flowchart TD
    Click(["User clicks a dropdown option"]) --> Check{"isAlreadySelected(type, value)?"}
    Check -- "Yes (already selected)" --> Deselect["splice from selectedItems[]"]
    Deselect --> ReApply["Call applyFilter()"]
    ReApply --> ReRender["Call renderOptionsFor()\nRefresh dropdown list"]
    Check -- "No (new selection)" --> Push["Push item to selectedItems[]"]
    
    Push --> RenderTags["Call renderSelectedList()\n→ createSelectedTagEl() for each item\nUpdates yellow tags in UI"]
    RenderTags --> CloseDD["Call closeDropdown()"]
    CloseDD --> ApplyFilter["Call applyFilter()"]
    
    subgraph "applyFilter() internals"
        ApplyFilter --> Filter["Call filterRecipes(recipes, selectedItems, searchQuery)"]
        Filter --> MatchCheck["For each recipe:\n• recipeMatchesSearch(recipe, query)\n• Check selectedItems by type:\n  - ingredient → stem(normalize()) on Set\n  - appliance → stem(normalize()) compare\n  - ustensil → stem(normalize()) on Set"]
        MatchCheck --> RenderRecipes["Call renderRecipes(filtered, searchQuery)"]
        RenderRecipes --> Cards["createRecipeCard(recipe) for each match\n→ append to #recipes-grid"]
        RenderRecipes --> UpdateCount["Update #recipes-count\n(inline in renderRecipes)"]
        RenderRecipes --> RenderSel2["Call renderSelectedList()\nSync yellow tags"]
    end
```

---

## Dropdown Internal Flow

This diagram shows how a dropdown is built and how its internal search works.

```mermaid
flowchart TD
    BD["buildDropdown(config)"] --> FindBtn["Find button via config.btnSelector"]
    FindBtn --> CreateWrapper["Create wrapper div + dropdown panel"]
    CreateWrapper --> CreateSearch["Create search input + clear button + icon"]
    CreateSearch --> CreateList["Create ul list element"]
    CreateList --> InitRender["Call renderOptionsFor() — initial population"]

    subgraph "renderOptionsFor()"
        RO1["Get currentFiltered via\nfilterRecipes(recipes, selectedItems, searchQuery)"]
        RO1 --> RO2["Get dynamicOptions via\ngetOptionsFromRecipes(currentFiltered)"]
        RO2 --> RO3["getOptionsFromRecipes() extracts values\nby config.type → extractUnique(values)"]
        RO3 --> RO4["Filter by dropdown search input\n(normalize comparison)"]
        RO4 --> RO5["Render selected items first\n(yellow bg via createOptionEl)"]
        RO5 --> RO6["Render available options\n(skip if isAlreadySelected)"]
    end

    subgraph "Button click toggles dropdown"
        BtnClick["btn click event"] --> IsOpen{"dropdown has class 'block'?"}
        IsOpen -- "Yes" --> Close["closeDropdown()"]
        IsOpen -- "No" --> Open["openDropdownFor(dropdown)"]
        Open --> Reset["resetSearch()"]
        Reset --> Refresh["renderOptionsFor()"]
        Refresh --> Focus["searchInput.focus()"]
    end

    subgraph "Dropdown search input"
        SearchInput["searchInput 'input' event"] --> ToggleClear["Toggle clear button visibility"]
        ToggleClear --> RefreshList["renderOptionsFor()"]
        ClearClick["clearBtn click"] --> ResetS["resetSearch()"]
        ResetS --> RefreshList2["renderOptionsFor()"]
        RefreshList2 --> FocusBack["searchInput.focus()"]
    end

    InitRender --> RO1
```

---

## File Structure

```mermaid
graph LR
    subgraph Project
        IDX["index.html"]
        style IDX fill:#FFD15B,color:#1B1B1B

        subgraph js/
            MAIN["main.js\n(entry point)\ninit()"]
            FILT["filters.js\n(filter logic + UI)\ninitRecipe, filterRecipes,\nbuildDropdown, applyFilter,\nrenderSelectedList, extractUnique,\ncreateOptionEl, createSelectedTagEl,\nescapeHtml, closeDropdown,\nopenDropdownFor, isAlreadySelected,\nresetSearch, getOptionsFromRecipes,\nrenderOptionsFor"]
            SEARCH["search.js\n(search bar)\nattachSearch, emit"]
            RECSEARCH["recipeSearch.js\n(text match)\nnormalize, stem,\nrecipeSearchText,\nrecipeMatchesSearch"]
            DATA["../data/recipes.json\n(data source)"]
            subgraph templates/
                CARD["card.js\n(recipe cards + counter)\ncreateRecipeCard,\nrenderRecipes"]
            end
        end

        subgraph css/
            CSS["style.css\n(Tailwind build)"]
        end
    end

    IDX -- "script module" --> MAIN
    IDX -- "link stylesheet" --> CSS
    MAIN -- "import initRecipe" --> FILT
    MAIN -- "import attachSearch" --> SEARCH
    FILT -- "import normalize, stem,\nrecipeMatchesSearch" --> RECSEARCH
    MAIN -- "fetch" --> DATA
    FILT -- "import renderRecipes\n(default export)" --> CARD
```

### 📎 File References

| File | Path | Description |
|---|---|---|
| [index.html](./index.html) | `./index.html` | Main HTML page with DOM structure |
| [main.js](./js/main.js) | `./js/main.js` | Entry point — fetch + init |
| [search.js](./js/search.js) | `./js/search.js` | Global search event listeners |
| [recipeSearch.js](./js/recipeSearch.js) | `./js/recipeSearch.js` | Pure text search match logic |
| [filters.js](./js/filters.js) | `./js/filters.js` | Filter logic, dropdowns & tags |
| [card.js](./js/templates/card.js) | `./js/templates/card.js` | Recipe card factory + rendering + counter |
| [recipes.json](./data/recipes.json) | `./data/recipes.json` | Recipe data source |
| [style.css](./css/style.css) | `./css/style.css` | Tailwind CSS build |
