// Barre de recherche du header : écoute le champ de saisie et transmet la valeur.

export function attachSearch({ onQueryChange }) {
  const input = document.getElementById("recipe-search-input");
  const form = document.getElementById("recipe-search-form");

  function emit() {
    onQueryChange(input.value);
  }

  input.addEventListener("input", emit);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    emit();
  });
}
