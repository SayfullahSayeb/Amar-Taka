class AccountsManager {
    constructor() {
        this.currency = 'BDT';
    }

    async init() {
        // Load currency preference
        const savedCurrency = await db.getSetting('currency');
        if (savedCurrency) {
            this.currency = savedCurrency;
        }

        this.setupEventListeners();
        await this.render();
    }

    setupEventListeners() {
        // Navigation buttons
        // Navigation buttons are handled centrally in navigation.js


        // Manage Accounts button - use event delegation to handle clicks
        // Store handler to prevent duplicates
        if (!this.manageAccountsHandler) {
            this.manageAccountsHandler = (e) => {
                const btn = e.target.closest('#manage-accounts-btn');
                if (btn) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (typeof settingsManager !== 'undefined' && settingsManager.openCategoriesModal) {
                        // Open directly to the Accounts (payment) tab without timeout
                        settingsManager.openCategoriesModal('payment');
                    }
                }
            };

            document.addEventListener('click', this.manageAccountsHandler);
        }
    }

    async calculatePaymentMethodBalance(paymentMethodName) {
        const transactions = await db.getAll('transactions');
        let balance = 0;

        transactions.forEach(transaction => {
            if (transaction.type === 'income' && transaction.paymentMethod === paymentMethodName) {
                balance += transaction.amount;
            } else if (transaction.type === 'expense' && transaction.paymentMethod === paymentMethodName) {
                balance -= transaction.amount;
            } else if (transaction.type === 'transfer') {
                if (transaction.transferFrom === paymentMethodName) {
                    balance -= transaction.amount;
                } else if (transaction.transferTo === paymentMethodName) {
                    balance += transaction.amount;
                }
            }
        });

        return balance;
    }

    async render() {
        const container = document.getElementById('accounts-list');
        if (!container) return;

        const paymentMethods = await paymentMethodsManager.getPaymentMethods();

        if (paymentMethods.length === 0) {
            Utils.renderEmptyState(
                container,
                'university',
                'No accounts yet'
            );
            return;
        }

        // Calculate balance for each account
        const accountsWithBalances = await Promise.all(
            paymentMethods.map(async (method) => {
                const balance = await this.calculatePaymentMethodBalance(method.name);
                return {
                    ...method,
                    balance: balance
                };
            })
        );

        // Render accounts
        let html = '';
        accountsWithBalances.forEach((account, index) => {
            html += this.renderAccount(account, index + 1);
        });

        container.innerHTML = html;
    }

    renderAccount(account, number) {
        const balanceText = account.balance < 0
            ? '-' + Utils.formatCurrency(Math.abs(account.balance), this.currency)
            : Utils.formatCurrency(account.balance, this.currency);

        // Get icon for account
        const iconMap = {
            'Cash': 'fa-money-bill-wave',
            'Card': 'fa-credit-card',
            'Mobile Banking': 'fa-mobile-alt',
            'Bank': 'fa-university',
            'Savings': 'fa-piggy-bank'
        };
        const icon = account.icon || iconMap[account.name] || 'fa-wallet';

        return `
            <div class="account-item">
                <div class="account-icon-wrapper">
                    <div class="account-icon" style="background-color: ${account.color || 'var(--primary-color)'};">
                        <i class="fas ${icon}"></i>
                    </div>
                </div>
                <div class="account-info">
                    <span class="account-name">${account.name}</span>
                    <span class="account-balance">${balanceText}</span>
                </div>
            </div>
        `;
    }
}

// Create global accounts manager instance
const accountsManager = new AccountsManager();
