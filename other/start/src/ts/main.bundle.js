"use strict";
(() => {
  // src/ts/themes.ts
  var STORAGE_KEY = "startpage_theme_preferences";
  var defaultSettings = {
    preferredLight: "latte",
    preferredDark: "dracula-dark"
  };
  function getThemeSettings() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultSettings;
    try {
      return JSON.parse(saved);
    } catch {
      return defaultSettings;
    }
  }
  function saveThemeSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    applyCurrentTheme();
  }
  function applyCurrentTheme() {
    const settings = getThemeSettings();
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const themeToApply = systemPrefersDark ? settings.preferredDark : settings.preferredLight;
    document.documentElement.setAttribute("data-theme", themeToApply);
  }
  function initThemes() {
    applyCurrentTheme();
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      applyCurrentTheme();
    });
  }

  // src/ts/search.ts
  var shortcutsList = [];
  var currentFilteredSuggestions = [];
  var activeSuggestionIndex = -1;
  var SEARCH_PREFIXES = {
    "s/": "",
    "r/": "https://www.reddit.com/search/?q=",
    "g/": "https://www.github.com/search/?q=",
    "y/": "https://www.youtube.com/search/?q=",
    "i/": "https://www.google.com/search?tbm=isch&q=",
    "a/": "https://wiki.archlinux.org/index.php?search=",
    "t/": "https://www.twitch.tv/search?term=",
  };
  var PREFIX_DESCRIPTIONS = {
    "s/": "Default Web Search",
    "r/": "Reddit",
    "g/": "GitHub",
    "y/": "YouTube",
    "i/": "Google Images",
    "a/": "Arch Wiki",
    "t/": "Twitch"
  };
  function getSavedSearchEngine() {
    return localStorage.getItem("selectedSearchEngine") || "https://google.com/search?q=";
  }
  function applyDefaultPlaceholder(inputElement) {
    const engineUrl = getSavedSearchEngine();
    let engineName = "Google";
    if (engineUrl.includes("duckduckgo.com")) {
      engineName = "DuckDuckGo";
    } else if (engineUrl.includes("search.brave.com")) {
      engineName = "Brave Search";
    }
    inputElement.placeholder = `Search with ${engineName}`;
  }
  function initSearchEngine() {
    const selectElement = document.getElementById("search-engine-select");
    const inputElement = document.getElementById("search-input");
    if (!inputElement) return;
    const savedEngine = getSavedSearchEngine();
    if (selectElement) {
      selectElement.value = savedEngine;
    }
    applyDefaultPlaceholder(inputElement);
    if (selectElement) {
      selectElement.addEventListener("change", () => {
        localStorage.setItem("selectedSearchEngine", selectElement.value);
        if (!inputElement.classList.contains("has-prefix")) {
          applyDefaultPlaceholder(inputElement);
        }
      });
    }
  }
  function clearSearchInput(inputElement) {
    inputElement.value = "";
    inputElement.focus();
    updateSearchSuggestions("");
  }
  async function loadShortcuts() {
    // const yamlUrl = "https://raw.githubusercontent.com/druxorey/dotfiles/refs/heads/main/core/local/share/brave/bookmarks.yaml";
    const yamlUrl = "";
    try {
      const response = await fetch(yamlUrl);
      if (!response.ok) throw new Error("Failed to retrieve remote shortcuts yaml file");
      const yamlText = await response.text();
      const lines = yamlText.split("\n");
      shortcutsList = [];
      let currentName = "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        if (trimmed.startsWith("- name:")) {
          currentName = trimmed.replace("- name:", "").trim();
        } else if (trimmed.startsWith("url:")) {
          const currentUrl = trimmed.replace("url:", "").trim();
          if (currentName && currentUrl) {
            shortcutsList.push({ name: currentName, url: currentUrl });
          }
        }
      }
    } catch (error) {
      console.error("Error processing shortcuts configuration:", error);
      shortcutsList = [];
    }
  }
  function updateSearchSuggestions(inputVal) {
    const query = inputVal.toLowerCase().trim();
    const ghostElement = document.getElementById("search-ghost");
    const suggestionsElement = document.getElementById("search-suggestions");
    const inputElement = document.getElementById("search-input");
    if (!ghostElement || !suggestionsElement) return;
    const matchedPrefix = Object.keys(SEARCH_PREFIXES).find((prefix) => inputVal.toLowerCase().startsWith(prefix));
    if (inputElement) {
      if (matchedPrefix) {
        inputElement.classList.add("has-prefix");
        inputElement.placeholder = `Search ${PREFIX_DESCRIPTIONS[matchedPrefix]}...`;
      } else {
        inputElement.classList.remove("has-prefix");
        applyDefaultPlaceholder(inputElement);
      }
    }
    if (matchedPrefix) {
      ghostElement.textContent = "";
      currentFilteredSuggestions = [];
      activeSuggestionIndex = -1;
      suggestionsElement.classList.add("prefix-mode");
      suggestionsElement.style.display = "block";
      suggestionsElement.innerHTML = `<div class="prefix-indicator">Searching in <strong>${PREFIX_DESCRIPTIONS[matchedPrefix]}</strong>...</div>`;
      return;
    } else {
      suggestionsElement.classList.remove("prefix-mode");
    }
    if (!query) {
      ghostElement.textContent = "";
      suggestionsElement.style.display = "none";
      currentFilteredSuggestions = [];
      activeSuggestionIndex = -1;
      return;
    }
    currentFilteredSuggestions = shortcutsList.filter((item) => item.name.toLowerCase().includes(query)).slice(0, 5);
    if (currentFilteredSuggestions.length > 0) {
      suggestionsElement.style.display = "block";
      suggestionsElement.innerHTML = "";
      currentFilteredSuggestions.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        if (index === activeSuggestionIndex) div.classList.add("active");
        const cleanerUrl = item.url.replace(/^https?:\/\/(www\.)?/, "");
        div.innerHTML = `<span>${item.name}</span><span class="suggestion-url">${cleanerUrl}</span>`;
        div.addEventListener("click", () => {
          window.location.href = item.url;
        });
        suggestionsElement.appendChild(div);
      });
      const topMatchName = currentFilteredSuggestions[0].name;
      if (topMatchName.toLowerCase().startsWith(query)) {
        const missingPart = topMatchName.substring(query.length);
        ghostElement.innerHTML = `${inputVal}<span>${missingPart}</span>`;
      } else {
        ghostElement.textContent = "";
      }
    } else {
      suggestionsElement.style.display = "none";
      ghostElement.textContent = "";
      activeSuggestionIndex = -1;
    }
  }
  function handleSearchKeyDown(event, inputElement) {
    if (currentFilteredSuggestions.length === 0) return false;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeSuggestionIndex = (activeSuggestionIndex + 1) % currentFilteredSuggestions.length;
      updateSearchSuggestions(inputElement.value);
      return true;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      activeSuggestionIndex = (activeSuggestionIndex - 1 + currentFilteredSuggestions.length) % currentFilteredSuggestions.length;
      updateSearchSuggestions(inputElement.value);
      return true;
    }
    return false;
  }
  function handleSearch(query) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    const lowerQuery = trimmedQuery.toLowerCase();
    const matchedPrefix = Object.keys(SEARCH_PREFIXES).find((p) => lowerQuery.startsWith(p));
    if (matchedPrefix) {
      const searchQuery = trimmedQuery.substring(matchedPrefix.length);
      if (matchedPrefix === "s/") {
        window.location.href = `${getSavedSearchEngine()}${encodeURIComponent(searchQuery)}`;
      } else {
        window.location.href = `${SEARCH_PREFIXES[matchedPrefix]}${encodeURIComponent(searchQuery)}`;
      }
      return;
    }
    if (activeSuggestionIndex >= 0 && activeSuggestionIndex < currentFilteredSuggestions.length) {
      window.location.href = currentFilteredSuggestions[activeSuggestionIndex].url;
      return;
    }
    if (currentFilteredSuggestions.length > 0) {
      window.location.href = currentFilteredSuggestions[0].url;
      return;
    }
    window.location.href = `${getSavedSearchEngine()}${encodeURIComponent(trimmedQuery)}`;
  }
  document.addEventListener("click", (event) => {
    const searchWrapper = document.querySelector(".search-wrapper");
    const suggestionsElement = document.getElementById("search-suggestions");
    if (searchWrapper && suggestionsElement && !searchWrapper.contains(event.target)) {
      suggestionsElement.style.display = "none";
      activeSuggestionIndex = -1;
    }
  });

  // src/ts/settings.ts
  function initSettings() {
    const modal = document.getElementById("settings-modal");
    const toggleBtn = document.getElementById("settings-toggle");
    const closeBtn = document.getElementById("settings-close");
    const lightSelect = document.getElementById("light-theme-select");
    const darkSelect = document.getElementById("dark-theme-select");
    const engineSelect = document.getElementById("search-engine-select");
    if (!modal || !toggleBtn || !closeBtn || !lightSelect || !darkSelect || !engineSelect) return;
    const currentPreferences = getThemeSettings();
    lightSelect.value = currentPreferences.preferredLight;
    darkSelect.value = currentPreferences.preferredDark;
    engineSelect.value = getSavedSearchEngine();
    toggleBtn.addEventListener("click", () => modal.showModal());
    closeBtn.addEventListener("click", () => modal.close());
    modal.addEventListener("click", (event) => {
      const rect = modal.getBoundingClientRect();
      const clickedInside = rect.top <= event.clientY && event.clientY <= rect.top + rect.height && rect.left <= event.clientX && event.clientX <= rect.left + rect.width;
      if (!clickedInside) {
        modal.close();
      }
    });
    const syncPreferences = () => {
      const updatedSettings = {
        preferredLight: lightSelect.value,
        preferredDark: darkSelect.value
      };
      saveThemeSettings(updatedSettings);
    };
    lightSelect.addEventListener("change", syncPreferences);
    darkSelect.addEventListener("change", syncPreferences);
    engineSelect.addEventListener("change", () => {
      localStorage.setItem("selectedSearchEngine", engineSelect.value);
    });
  }

  // src/ts/services.ts
  async function checkLocalServices() {
    const serviceLinks = document.querySelectorAll(".homelab-service-link[data-url]");
    serviceLinks.forEach(async (link) => {
      const url = link.getAttribute("data-url");
      if (!url) return;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2e3);
        await fetch(url, { mode: "no-cors", signal: controller.signal });
        clearTimeout(timeoutId);
        link.classList.remove("offline");
        link.classList.add("online");
      } catch (error) {
        link.classList.remove("online");
        link.classList.add("offline");
      }
    });
  }

  // src/ts/main.js
  function updateClockDisplay() {
    const dateTimeDisplay = document.getElementById("datetime-display");
    if (!dateTimeDisplay)
      return;
    const now = /* @__PURE__ */ new Date();
    const weekday = now.toLocaleString("en-US", { weekday: "long" });
    const day = now.toLocaleString("en-US", { day: "2-digit" });
    const month = now.toLocaleString("en-US", { month: "2-digit" });
    const year = now.toLocaleString("en-US", { year: "numeric" });
    const timeString = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    dateTimeDisplay.textContent = `${weekday}, ${timeString} | ${day}/${month}/${year}`;
  }
  function initHelpModal() {
    const modal = document.getElementById("help-modal");
    const toggleBtn = document.getElementById("help-toggle");
    const closeBtn = document.getElementById("help-close");
    if (!modal || !toggleBtn || !closeBtn)
      return;
    toggleBtn.addEventListener("click", () => modal.showModal());
    closeBtn.addEventListener("click", () => modal.close());
    modal.addEventListener("click", (event) => {
      const rect = modal.getBoundingClientRect();
      const clickedInside = rect.top <= event.clientY && event.clientY <= rect.top + rect.height && rect.left <= event.clientX && event.clientX <= rect.left + rect.width;
      if (!clickedInside) {
        modal.close();
      }
    });
  }
  document.addEventListener("DOMContentLoaded", async () => {
    initThemes();
    initSettings();
    initSearchEngine();
    initHelpModal();
    await loadShortcuts();
    checkLocalServices();
    updateClockDisplay();
    setInterval(updateClockDisplay, 1e3);
    const searchInput = document.getElementById("search-input");
    const settingsModal = document.getElementById("settings-modal");
    const helpModal = document.getElementById("help-modal");
    if (!searchInput)
      return;
    searchInput.addEventListener("input", () => {
      updateSearchSuggestions(searchInput.value);
    });
    document.addEventListener("keydown", (event) => {
      if (document.activeElement?.tagName === "SELECT")
        return;
      if (document.activeElement === searchInput) {
        const handledByDropdown = handleSearchKeyDown(event, searchInput);
        if (handledByDropdown)
          return;
      }
      if (event.key === "Escape") {
        if (settingsModal?.open)
          settingsModal.close();
        if (helpModal?.open)
          helpModal.close();
      } else if (event.key === " " && document.activeElement !== searchInput) {
        event.preventDefault();
        searchInput.focus();
      } else if (event.key === "Enter" && document.activeElement === searchInput) {
        event.preventDefault();
        handleSearch(searchInput.value);
      } else if (event.key === "c" && event.ctrlKey) {
        event.preventDefault();
        clearSearchInput(searchInput);
      }
    });
  });


  // Time-based greetings. Makes the page a bit more personable. Configure your name at the bottom of this function block.

  function getGreeting(name, date = new Date()) {
    const hour = date.getHours();

    const greetings = {
      night: [
        `Up late, ${name}?`,
        `Still awake, ${name}?`,
        `Night owl, ${name}?`
      ],
      morning: [
        `Morning, ${name}!`,
        `Rise and shine, ${name}!`,
        `Good morning, ${name}!`
      ],
      afternoon: [
        `Afternoon, ${name}!`,
        `Hey ${name}!`,
        `Good afternoon, ${name}!`
      ],
      evening: [
        `Evening, ${name}!`,
        `Hey ${name}!`,
        `Good evening, ${name}!`
      ]
    };

    let bucket;
    if (hour < 5) bucket = "night";
    else if (hour < 12) bucket = "morning";
    else if (hour < 17) bucket = "afternoon";
    else if (hour < 21) bucket = "evening";
    else bucket = "night";

    const options = greetings[bucket];
    return options[Math.floor(Math.random() * options.length)];
  }

  function renderGreeting(name, date = new Date()) {
    const el = document.querySelector(".greeting-title");
    if (el) el.textContent = getGreeting(name, date);
  }

  renderGreeting("Kat");


})();
