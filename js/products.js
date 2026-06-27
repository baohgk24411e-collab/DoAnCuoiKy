// js/products.js

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initial State from URL params
  const state = {
    search: getUrlParam("search") || "",
    category: getUrlParam("category") || "all",
    season: getUrlParam("season") || "all",
    healthGoal: getUrlParam("healthGoal") || "all",
    priceRange: getUrlParam("priceRange") || "all",
    sort: getUrlParam("sort") || "newest"
  };

  // 2. Map State to DOM elements on load
  syncStateToDOM(state);

  // 3. Render filtered list initially
  filterAndRender(state);

  // 4. Bind DOM events to update state and trigger rerender
  bindFilterEvents(state);
});

// Sync input controls with state
function syncStateToDOM(state) {
  // Search input in header (optional, header may clear or keep)
  const headerInput = document.getElementById("header-search-input");
  if (headerInput && state.search) {
    headerInput.value = state.search;
  }

  // Category radios
  const catRadios = document.querySelectorAll('input[name="category"]');
  catRadios.forEach(radio => {
    if (radio.value === state.category) {
      radio.checked = true;
    }
  });

  // Season radios
  const seasonRadios = document.querySelectorAll('input[name="season"]');
  seasonRadios.forEach(radio => {
    if (radio.value === state.season) {
      radio.checked = true;
    }
  });

  // Health goal select dropdown
  const healthSelect = document.getElementById("health-goal-select");
  if (healthSelect) {
    healthSelect.value = state.healthGoal;
  }

  // Price range radios
  const priceRadios = document.querySelectorAll('input[name="priceRange"]');
  priceRadios.forEach(radio => {
    if (radio.value === state.priceRange) {
      radio.checked = true;
    }
  });

  // Sort select dropdown
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.value = state.sort;
  }

  // Search badge display
  const searchBadge = document.getElementById("search-badge");
  const keywordVi = document.getElementById("search-keyword-vi");
  const keywordEn = document.getElementById("search-keyword-en");
  if (searchBadge && state.search) {
    searchBadge.style.display = "flex";
    if (keywordVi) keywordVi.innerText = state.search;
    if (keywordEn) keywordEn.innerText = state.search;
  } else if (searchBadge) {
    searchBadge.style.display = "none";
  }
}

// Perform filtering and update products grid
function filterAndRender(state) {
  let result = [...window.MOCK_PRODUCTS];

  // A. Filter by Search
  if (state.search) {
    const q = state.search.toLowerCase().trim();
    result = result.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) ||
      p.region.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  // B. Filter by Category
  if (state.category !== "all") {
    result = result.filter(p => p.category === state.category);
  }

  // C. Filter by Season
  if (state.season !== "all") {
    if (state.season === "seasonal") {
      result = result.filter(p => p.isSeasonal);
    } else {
      result = result.filter(p => p.season === state.season);
    }
  }

  // D. Filter by Health Goal
  if (state.healthGoal !== "all") {
    result = result.filter(p => p.healthGoals.includes(state.healthGoal));
  }

  // E. Filter by Price Range
  if (state.priceRange !== "all") {
    if (state.priceRange === "under-50") {
      result = result.filter(p => p.price < 50000);
    } else if (state.priceRange === "50-100") {
      result = result.filter(p => p.price >= 50000 && p.price <= 100000);
    } else if (state.priceRange === "100-200") {
      result = result.filter(p => p.price > 100000 && p.price <= 200000);
    } else if (state.priceRange === "over-200") {
      result = result.filter(p => p.price > 200000);
    }
  }

  // F. Sorting
  if (state.sort === "newest") {
    result.sort((a, b) => b.id - a.id);
  } else if (state.sort === "price-asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (state.sort === "price-desc") {
    result.sort((a, b) => b.price - a.price);
  } else if (state.sort === "bestseller") {
    result.sort((a, b) => {
      if (a.isBestSeller && !b.isBestSeller) return -1;
      if (!a.isBestSeller && b.isBestSeller) return 1;
      return b.rating - a.rating;
    });
  }

  // Update counts
  const countVi = document.getElementById("product-count");
  const countEn = document.getElementById("product-count-en");
  if (countVi) countVi.innerText = result.length;
  if (countEn) countEn.innerText = result.length;

  // Render to grid
  const grid = document.getElementById("products-catalog-grid");
  const emptyState = document.getElementById("empty-state");

  if (result.length === 0) {
    if (grid) grid.style.display = "none";
    if (emptyState) emptyState.style.display = "block";
  } else {
    if (emptyState) emptyState.style.display = "none";
    if (grid) {
      grid.style.display = "grid";
      grid.innerHTML = result.map(p => window.Components.ProductCard(p)).join("");
    }
  }
}

// Bind DOM event listeners to state changes
function bindFilterEvents(state) {
  // Category change
  const catRadios = document.querySelectorAll('input[name="category"]');
  catRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      state.category = e.target.value;
      updateURL(state);
      filterAndRender(state);
    });
  });

  // Season change
  const seasonRadios = document.querySelectorAll('input[name="season"]');
  seasonRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      state.season = e.target.value;
      updateURL(state);
      filterAndRender(state);
    });
  });

  // Health goal change
  const healthSelect = document.getElementById("health-goal-select");
  if (healthSelect) {
    healthSelect.addEventListener("change", (e) => {
      state.healthGoal = e.target.value;
      updateURL(state);
      filterAndRender(state);
    });
  }

  // Price range change
  const priceRadios = document.querySelectorAll('input[name="priceRange"]');
  priceRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      state.priceRange = e.target.value;
      updateURL(state);
      filterAndRender(state);
    });
  });

  // Sort change
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      state.sort = e.target.value;
      updateURL(state);
      filterAndRender(state);
    });
  }

  // Clear search badge
  const clearSearchBtn = document.getElementById("clear-search-btn");
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      state.search = "";
      const headerInput = document.getElementById("header-search-input");
      if (headerInput) headerInput.value = "";
      document.getElementById("search-badge").style.display = "none";
      updateURL(state);
      filterAndRender(state);
    });
  }

  // Reset filters button
  const resetBtn = document.getElementById("reset-filters-btn");
  const resetEmptyBtn = document.getElementById("reset-empty-btn");
  
  const resetAll = () => {
    state.search = "";
    state.category = "all";
    state.season = "all";
    state.healthGoal = "all";
    state.priceRange = "all";
    state.sort = "newest";

    const headerInput = document.getElementById("header-search-input");
    if (headerInput) headerInput.value = "";

    syncStateToDOM(state);
    updateURL(state);
    filterAndRender(state);
  };

  if (resetBtn) resetBtn.addEventListener("click", resetAll);
  if (resetEmptyBtn) resetEmptyBtn.addEventListener("click", resetAll);
}

// Update URL parameters without reloading
function updateURL(state) {
  const url = new URL(window.location);
  Object.keys(state).forEach(key => {
    if (state[key] && state[key] !== "all") {
      url.searchParams.set(key, state[key]);
    } else {
      url.searchParams.delete(key);
    }
  });
  window.history.pushState({}, "", url);
}
