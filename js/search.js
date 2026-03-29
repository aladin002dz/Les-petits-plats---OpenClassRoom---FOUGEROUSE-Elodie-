// Barre de recherche du header : écoute le champ de saisie et transmet la valeur.

export function attachSearch({ onQueryChange }) {
  const input = document.getElementById("recipe-search-input");
  const form = document.getElementById("recipe-search-form");

  function emit() {
    const value = input.value;
    // La recherche se lance uniquement si le champ est vide ou contient au moins 3 caractères
    if (value.length === 0 || value.length >= 3) {
      onQueryChange(value);
    }
  }

  input.addEventListener("input", emit);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    emit();
  });
}
