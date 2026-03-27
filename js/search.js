/**
 * Barre de recherche du header : saisie + bouton, synchronisée avec les filtres.
 * @param {{ onQueryChange: (query: string) => void }} options
 */
export function attachSearch({ onQueryChange }) {
  const input = document.getElementById("recipe-search-input");
  const form = document.getElementById("recipe-search-form");

  if (!input || typeof onQueryChange !== "function") return;

  function emit() {
    onQueryChange(input.value);
  }

  input.addEventListener("input", emit);
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    emit();
  });
}
