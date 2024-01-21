document.addEventListener("DOMContentLoaded", function () {
  let currentUsername = "raptor4444";
  const repoList = document.getElementById("repository-list");
  const pageInfo = document.getElementById("page-info");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const repoLimitSelect = document.getElementById("repo-limit");
  const usernameForm = document.getElementById("username-form");
  const newUsernameInput = document.getElementById("new-username");
  const repoSearchInput = document.getElementById("repo-search");
  const forkedFilterSelect = document.getElementById("forked-filter");
  const applyFiltersButton = document.getElementById("apply-filters");

  let currentPage = 1;
  let repoLimit = 10;
  let repositories = [];

  function fetchRepositories(username, page, limit) {
    fetch(
      `https://api.github.com/users/${username}/repos?page=${page}&per_page=${limit}`
    )
      .then((response) => response.json())
      .then((data) => {
        repositories = data;

        currentUsername = username;
        document.getElementById("username").innerText = currentUsername;
        renderRepositories(data);

        const totalPages = Math.ceil(data.length / repoLimit);
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  function renderRepositories(repos) {
    repoList.innerHTML = "";

    repos.forEach((repo) => {
      const listItem = document.createElement("li");
      listItem.className = `repository-card${repo.fork ? " forked" : ""}`;

      const nameElement = document.createElement("div");
      nameElement.className = "repository-name";
      nameElement.innerHTML = `<a href="${repo.html_url}" target="_blank">${repo.name}</a>`;
      listItem.appendChild(nameElement);

      if (repo.description) {
        const descriptionElement = document.createElement("div");
        descriptionElement.className = "repository-description";
        descriptionElement.textContent = repo.description;
        listItem.appendChild(descriptionElement);
      }

      const languageContainer = document.createElement("div");
      languageContainer.className = "repository-language";

      fetch(repo.languages_url)
        .then((response) => response.json())
        .then((languages) => {
          for (const language in languages) {
            const languageButton = document.createElement("div");
            languageButton.className = "language-button";
            languageButton.textContent = `${language}: ${languages[language]}`;
            languageContainer.appendChild(languageButton);
          }
        })
        .catch((error) => console.error("Error fetching languages:", error));

      listItem.appendChild(languageContainer);

      if (repo.fork) {
        const forkedIndicator = document.createElement("div");
        forkedIndicator.className = "forked-indicator";
        forkedIndicator.textContent = "Forked";
        listItem.appendChild(forkedIndicator);
      }

      repoList.appendChild(listItem);
    });
  }

  function updatePagination() {
    currentPage = 1;
    fetchRepositories(currentUsername, currentPage, repoLimit);
  }

  function changePage(delta) {
    currentPage += delta;

    if (currentPage < 1) {
      currentPage = 1;
    }

    const totalPages = Math.ceil(repositories.length / repoLimit);
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    fetchRepositories(currentUsername, currentPage, repoLimit);
  }

  function changeRepoLimit() {
    repoLimit = parseInt(repoLimitSelect.value, 10);
    updatePagination();
  }

  function applyFilters() {
    const searchInput = repoSearchInput.value.trim().toLowerCase();
    const forkedFilter = forkedFilterSelect.value;

    const filteredRepos = repositories.filter((repo) => {
      const isNameMatch = repo.name.toLowerCase().includes(searchInput);
      const isForkedMatch =
        forkedFilter === "all" ||
        (forkedFilter === "true" && repo.fork) ||
        (forkedFilter === "false" && !repo.fork);

      return isNameMatch && isForkedMatch;
    });

    renderRepositories(filteredRepos);
  }

  usernameForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const newUsername = newUsernameInput.value.trim();

    if (newUsername !== "") {
      currentUsername = newUsername;
      updatePagination();
    }
  });

  prevBtn.addEventListener("click", () => changePage(-1));
  nextBtn.addEventListener("click", () => changePage(1));
  repoLimitSelect.addEventListener("change", changeRepoLimit);
  applyFiltersButton.addEventListener("click", applyFilters);

  updatePagination();
});
