import { getThemeSettings, saveThemeSettings } from './themes';
import { getSavedSearchEngine } from './search';
export function initSettings() {
    const modal = document.getElementById('settings-modal');
    const toggleBtn = document.getElementById('settings-toggle');
    const closeBtn = document.getElementById('settings-close');
    const lightSelect = document.getElementById('light-theme-select');
    const darkSelect = document.getElementById('dark-theme-select');
    const engineSelect = document.getElementById('search-engine-select');
    if (!modal || !toggleBtn || !closeBtn || !lightSelect || !darkSelect || !engineSelect)
        return;
    const currentPreferences = getThemeSettings();
    lightSelect.value = currentPreferences.preferredLight;
    darkSelect.value = currentPreferences.preferredDark;
    engineSelect.value = getSavedSearchEngine();
    toggleBtn.addEventListener('click', () => modal.showModal());
    closeBtn.addEventListener('click', () => modal.close());
    modal.addEventListener('click', (event) => {
        const rect = modal.getBoundingClientRect();
        const clickedInside = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
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
    lightSelect.addEventListener('change', syncPreferences);
    darkSelect.addEventListener('change', syncPreferences);
    engineSelect.addEventListener('change', () => {
        localStorage.setItem('selectedSearchEngine', engineSelect.value);
    });
}
