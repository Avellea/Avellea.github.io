const STORAGE_KEY = 'startpage_theme_preferences';
const defaultSettings = {
    preferredLight: 'latte',
    preferredDark: 'dracula-dark'
};
export function getThemeSettings() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved)
        return defaultSettings;
    try {
        return JSON.parse(saved);
    }
    catch {
        return defaultSettings;
    }
}
export function saveThemeSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    applyCurrentTheme();
}
export function applyCurrentTheme() {
    const settings = getThemeSettings();
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeToApply = systemPrefersDark ? settings.preferredDark : settings.preferredLight;
    document.documentElement.setAttribute('data-theme', themeToApply);
}
export function initThemes() {
    applyCurrentTheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        applyCurrentTheme();
    });
}
