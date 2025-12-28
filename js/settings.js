// ===================================
// Settings Manager
// ===================================

class SettingsManager {
    async init() {
        await this.loadSettings();
        this.setupEventListeners();
    }

    async loadSettings() {
        // Load language
        const language = await db.getSetting('language') || 'en';
        document.getElementById('language-select').value = language;

        // Load theme - default to system
        const theme = await db.getSetting('theme') || 'system';
        document.getElementById('theme-select').value = theme;
        this.applyTheme(theme);

        // Load currency
        const currency = await db.getSetting('currency') || 'BDT';
        document.getElementById('currency-select').value = currency;

        // Load and display budget
        await this.loadBudget();

        // Load user name and update header
        const userName = await db.getSetting('userName') || 'Finance Tracker';
        const headerName = document.getElementById('settings-display-name');
        if (headerName) {
            headerName.textContent = userName;
        }
    }

    setupEventListeners() {
        // Name modal interactions
        const nameModal = document.getElementById('name-modal');
        const nameForm = document.getElementById('name-form');
        const nameInput = document.getElementById('name-input');

        // Open modal
        document.getElementById('set-name-card').addEventListener('click', async () => {
            const userName = await db.getSetting('userName') || '';
            nameInput.value = userName;
            nameModal.classList.add('active');
            nameInput.focus();
        });

        // Close modal
        const closeNameModal = () => {
            nameModal.classList.remove('active');
        };

        document.getElementById('close-name-modal').addEventListener('click', closeNameModal);
        document.getElementById('cancel-name-btn').addEventListener('click', closeNameModal);

        // Save name
        nameForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userName = nameInput.value.trim();

            if (userName) {
                await db.setSetting('userName', userName);

                // Update settings header
                const headerName = document.getElementById('settings-display-name');
                if (headerName) {
                    headerName.textContent = userName;
                }

                Utils.showToast('Name saved successfully!');
                closeNameModal();

                // Update home page header
                if (document.getElementById('home-page').classList.contains('active')) {
                    await homeManager.render();
                }
            } else {
                Utils.showToast('Please enter a name');
            }
        });

        // Language change
        document.getElementById('language-select').addEventListener('change', async (e) => {
            await lang.setLanguage(e.target.value);
            Utils.showToast('Language updated');

            // Refresh all pages
            if (document.getElementById('home-page').classList.contains('active')) {
                await homeManager.render();
            }
            if (document.getElementById('transactions-page').classList.contains('active')) {
                await transactionsManager.render();
            }
            if (document.getElementById('analysis-page').classList.contains('active')) {
                await analysisManager.render();
            }
        });

        // Theme change
        document.getElementById('theme-select').addEventListener('change', async (e) => {
            const theme = e.target.value;
            await db.setSetting('theme', theme);
            this.applyTheme(theme);
            Utils.showToast('Theme updated');
        });

        // Currency change
        document.getElementById('currency-select').addEventListener('change', async (e) => {
            const currency = e.target.value;
            await db.setSetting('currency', currency);
            Utils.showToast('Currency updated');

            // Update all managers
            homeManager.currency = currency;
            transactionsManager.currency = currency;
            analysisManager.currency = currency;
            budgetManager.currency = currency;

            // Refresh current page
            if (document.getElementById('home-page').classList.contains('active')) {
                await homeManager.render();
            }
            if (document.getElementById('transactions-page').classList.contains('active')) {
                await transactionsManager.render();
            }
            if (document.getElementById('analysis-page').classList.contains('active')) {
                await analysisManager.render();
            }

            // Refresh budget display in settings
            if (document.getElementById('settings-page').classList.contains('active')) {
                await this.loadBudget();
            }
        });

        // Manage categories
        document.getElementById('manage-categories-btn').addEventListener('click', () => {
            this.openCategoriesModal();
        });

        document.getElementById('close-categories-modal').addEventListener('click', () => {
            this.closeCategoriesModal();
        });

        // Reset data
        document.getElementById('reset-data-btn').addEventListener('click', () => {
            this.resetData();
        });

        // Clear cache and update
        document.getElementById('clear-cache-btn').addEventListener('click', () => {
            this.clearCacheAndUpdate();
        });
    }

    applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            // System theme
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
    }

    async loadBudget() {
        const budget = await db.getSetting('monthlyBudget');
        const budgetDisplay = document.getElementById('budget-amount-display');

        if (budget && budgetDisplay) {
            const currency = await db.getSetting('currency') || 'BDT';
            budgetDisplay.textContent = Utils.formatCurrency(budget, currency);
            budgetDisplay.removeAttribute('data-lang');
        } else if (budgetDisplay) {
            budgetDisplay.setAttribute('data-lang', 'noBudgetSet');
            budgetDisplay.textContent = lang.translate('noBudgetSet');
        }
    }

    async openCategoriesModal() {
        const modal = document.getElementById('categories-modal');
        await categoriesManager.renderCategoriesList();
        modal.classList.add('active');
    }

    closeCategoriesModal() {
        const modal = document.getElementById('categories-modal');
        modal.classList.remove('active');
    }

    async resetData() {
        const confirmMessage = lang.translate('dataResetConfirm');
        const confirmed = await Utils.confirm(confirmMessage, 'Reset All Data', 'Reset');
        if (confirmed) {
            try {
                // Clear transactions
                await db.clearStore('transactions');
                console.log('Transactions cleared');

                // Clear categories
                await db.clearStore('categories');
                console.log('Categories cleared');

                // Clear settings completely
                await db.clearStore('settings');
                console.log('Settings cleared');

                // Clear localStorage onboarding flag
                localStorage.removeItem('onboardingCompleted');
                console.log('localStorage cleared');

                // Reinitialize categories with defaults
                await categoriesManager.init();
                console.log('Categories reinitialized');

                Utils.showToast('Successfully Removed All Data!');

                // Redirect to onboarding after a short delay
                setTimeout(() => {
                    window.location.href = 'onboarding.html';
                }, 1500);
            } catch (error) {
                console.error('Reset error:', error);
                Utils.showToast('Error resetting data: ' + error.message);
                alert('Failed to reset data. Please try again or clear your browser data manually.');
            }
        }
    }

    async clearCacheAndUpdate() {
        const confirmed = await Utils.confirm(
            'This will clear the app cache and reload to show the latest updates. Continue?',
            'Clear Cache & Update',
            'Clear & Reload'
        );

        if (confirmed) {
            try {
                Utils.showToast('Clearing cache...');

                // Clear all caches using Cache API
                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    await Promise.all(
                        cacheNames.map(cacheName => caches.delete(cacheName))
                    );
                    console.log('Cache API cleared');
                }

                // Unregister service workers if any
                if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    await Promise.all(
                        registrations.map(registration => registration.unregister())
                    );
                    console.log('Service workers unregistered');
                }

                // Clear any app-specific cache keys from localStorage
                const cacheKeys = Object.keys(localStorage).filter(key =>
                    key.includes('cache') || key.includes('version')
                );
                cacheKeys.forEach(key => localStorage.removeItem(key));

                Utils.showToast('Cache cleared! Reloading...');

                // Force reload from server (bypassing cache)
                setTimeout(() => {
                    window.location.reload(true);
                }, 500);
            } catch (error) {
                console.error('Clear cache error:', error);
                Utils.showToast('Error clearing cache: ' + error.message);

                // Fallback: just do a hard reload
                setTimeout(() => {
                    window.location.reload(true);
                }, 1000);
            }
        }
    }
}

// Create global settings manager instance
const settingsManager = new SettingsManager();
