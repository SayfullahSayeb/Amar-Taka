// ===================================
// Demo Mode Manager
// ===================================

class DemoModeManager {
    constructor() {
        this.isDemoMode = false;
        this.originalData = null;
    }

    async init() {
        // Check if demo mode is enabled
        const demoMode = localStorage.getItem('demoMode') === 'true';
        if (demoMode) {
            this.isDemoMode = true;
            await this.loadDemoData();
        }
    }

    getDemoTransactions() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const fourDaysAgo = new Date(today);
        fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
        const fiveDaysAgo = new Date(today);
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        return [
            // Income first - Monthly salary
            {
                id: 1,
                type: 'income',
                amount: 50000,
                category: 'Salary',
                paymentMethod: 'bank',
                date: fiveDaysAgo.toISOString().split('T')[0],
                note: 'Monthly salary',
                createdAt: fiveDaysAgo.toISOString()
            },
            // Freelance income
            {
                id: 2,
                type: 'income',
                amount: 15000,
                category: 'Freelance',
                paymentMethod: 'bank',
                date: threeDaysAgo.toISOString().split('T')[0],
                note: 'Web design project',
                createdAt: threeDaysAgo.toISOString()
            },
            // Today's transactions
            {
                id: 3,
                type: 'expense',
                amount: 350,
                category: 'Food',
                paymentMethod: 'cash',
                date: today.toISOString().split('T')[0],
                note: 'Lunch at restaurant',
                createdAt: new Date(today.getTime() - 3600000).toISOString()
            },
            {
                id: 4,
                type: 'expense',
                amount: 120,
                category: 'Transport',
                paymentMethod: 'card',
                date: today.toISOString().split('T')[0],
                note: 'Uber ride',
                createdAt: new Date(today.getTime() - 7200000).toISOString()
            },
            // Yesterday's transactions
            {
                id: 5,
                type: 'expense',
                amount: 1200,
                category: 'Shopping',
                paymentMethod: 'card',
                date: yesterday.toISOString().split('T')[0],
                note: 'Clothes shopping',
                createdAt: yesterday.toISOString()
            },
            {
                id: 6,
                type: 'expense',
                amount: 850,
                category: 'Food',
                paymentMethod: 'cash',
                date: yesterday.toISOString().split('T')[0],
                note: 'Grocery shopping',
                createdAt: yesterday.toISOString()
            },
            // Two days ago
            {
                id: 7,
                type: 'expense',
                amount: 2500,
                category: 'Bills',
                paymentMethod: 'bank',
                date: twoDaysAgo.toISOString().split('T')[0],
                note: 'Electricity & water bills',
                createdAt: twoDaysAgo.toISOString()
            },
            {
                id: 8,
                type: 'expense',
                amount: 450,
                category: 'Entertainment',
                paymentMethod: 'card',
                date: twoDaysAgo.toISOString().split('T')[0],
                note: 'Movie tickets',
                createdAt: twoDaysAgo.toISOString()
            },
            // Three days ago
            {
                id: 9,
                type: 'expense',
                amount: 680,
                category: 'Food',
                paymentMethod: 'mobile',
                date: threeDaysAgo.toISOString().split('T')[0],
                note: 'Dinner with friends',
                createdAt: threeDaysAgo.toISOString()
            },
            // Four days ago
            {
                id: 10,
                type: 'expense',
                amount: 200,
                category: 'Transport',
                paymentMethod: 'cash',
                date: fourDaysAgo.toISOString().split('T')[0],
                note: 'Taxi fare',
                createdAt: fourDaysAgo.toISOString()
            },
            {
                id: 11,
                type: 'expense',
                amount: 520,
                category: 'Food',
                paymentMethod: 'card',
                date: fourDaysAgo.toISOString().split('T')[0],
                note: 'Restaurant',
                createdAt: fourDaysAgo.toISOString()
            },
            // Five days ago
            {
                id: 12,
                type: 'expense',
                amount: 3500,
                category: 'Shopping',
                paymentMethod: 'card',
                date: fiveDaysAgo.toISOString().split('T')[0],
                note: 'New laptop accessories',
                createdAt: fiveDaysAgo.toISOString()
            },
            {
                id: 13,
                type: 'expense',
                amount: 800,
                category: 'Health',
                paymentMethod: 'cash',
                date: fiveDaysAgo.toISOString().split('T')[0],
                note: 'Medical checkup',
                createdAt: fiveDaysAgo.toISOString()
            }
        ];
    }

    async enableDemoMode() {
        try {
            // Save current data before loading demo
            this.originalData = {
                transactions: await db.getAll('transactions'),
                settings: {
                    monthlyBudget: await db.getSetting('monthlyBudget'),
                    userName: await db.getSetting('userName')
                }
            };

            // Store original data in localStorage
            localStorage.setItem('originalData', JSON.stringify(this.originalData));

            // Clear current transactions
            await db.clearStore('transactions');

            // Load demo transactions
            const demoTransactions = this.getDemoTransactions();
            for (const transaction of demoTransactions) {
                await db.add('transactions', transaction);
            }

            // Set demo budget and name
            await db.setSetting('monthlyBudget', 40000);
            await db.setSetting('userName', 'Demo User');

            // Mark demo mode as active
            this.isDemoMode = true;
            localStorage.setItem('demoMode', 'true');

            Utils.showToast('Demo Mode Enabled! Explore the app with sample data.');

            // Refresh all pages
            await this.refreshAllPages();

        } catch (error) {
            console.error('Error enabling demo mode:', error);
            Utils.showToast('Error enabling demo mode');
        }
    }

    async disableDemoMode() {
        try {
            // Clear demo transactions
            await db.clearStore('transactions');

            // Restore original data
            const originalDataStr = localStorage.getItem('originalData');
            if (originalDataStr) {
                this.originalData = JSON.parse(originalDataStr);

                // Restore transactions
                if (this.originalData.transactions && this.originalData.transactions.length > 0) {
                    for (const transaction of this.originalData.transactions) {
                        await db.add('transactions', transaction);
                    }
                }

                // Restore settings
                if (this.originalData.settings.monthlyBudget) {
                    await db.setSetting('monthlyBudget', this.originalData.settings.monthlyBudget);
                }
                if (this.originalData.settings.userName) {
                    await db.setSetting('userName', this.originalData.settings.userName);
                }

                // Clear stored original data
                localStorage.removeItem('originalData');
            }

            // Mark demo mode as inactive
            this.isDemoMode = false;
            localStorage.removeItem('demoMode');

            Utils.showToast('Demo Mode Disabled! Your data has been restored.');

            // Refresh all pages
            await this.refreshAllPages();

        } catch (error) {
            console.error('Error disabling demo mode:', error);
            Utils.showToast('Error disabling demo mode');
        }
    }

    async loadDemoData() {
        // This is called on init if demo mode is already enabled
        // Just ensure the flag is set
        this.isDemoMode = true;
    }

    async refreshAllPages() {
        // Refresh home page
        if (typeof homeManager !== 'undefined') {
            await homeManager.render();
        }

        // Refresh transactions page
        if (typeof transactionsManager !== 'undefined') {
            await transactionsManager.render();
        }

        // Refresh analysis page
        if (typeof analysisManager !== 'undefined') {
            await analysisManager.render();
        }

        // Refresh settings
        if (typeof settingsManager !== 'undefined') {
            await settingsManager.loadSettings();
        }
    }

    showDemoModeWarning() {
        Utils.confirm(
            'You are in Demo Mode. Please disable Demo Mode in Settings to add, edit, or delete transactions.',
            'Demo Mode Active',
            'Go to Settings'
        ).then(confirmed => {
            if (confirmed) {
                // Navigate to settings
                window.location.hash = 'settings';
            }
        });
    }

    isActive() {
        return this.isDemoMode;
    }
}

// Create global demo mode manager instance
const demoModeManager = new DemoModeManager();
