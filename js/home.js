// ===================================
// Home Page Manager
// ===================================

class HomeManager {
    constructor() {
        this.currency = 'BDT';
    }

    async init() {
        // Load currency preference
        const savedCurrency = await db.getSetting('currency');
        if (savedCurrency) {
            this.currency = savedCurrency;
        }

        await this.render();
    }

    async render() {
        await this.updateGreeting();
        await this.updateHeaderCard();
        await this.renderTransactionsHistory();
        await this.updateTodayExpense();
        await this.updateMonthlyExpense();
        await this.updateSavings();
        await this.updateBudget();
        await this.updateMotivationalMessage();
    }

    async updateGreeting() {
        const hour = new Date().getHours();
        let greeting;

        if (hour < 12) {
            greeting = 'Good morning,';
        } else if (hour < 18) {
            greeting = 'Good afternoon,';
        } else {
            greeting = 'Good evening,';
        }

        document.getElementById('greeting-time').textContent = greeting;

        // Update user name
        const userName = await db.getSetting('userName') || 'Your Name';
        document.getElementById('user-name').textContent = userName;
    }

    async updateHeaderCard() {
        const { start, end } = Utils.getMonthRange();
        const transactions = await db.getTransactionsByDateRange(start, end);

        const totalIncome = Utils.calculateTotal(transactions, 'income');
        const totalExpense = Utils.calculateTotal(transactions, 'expense');
        const balance = totalIncome - totalExpense;

        document.getElementById('total-balance').textContent = Utils.formatCurrency(balance, this.currency);
        document.getElementById('header-income').textContent = Utils.formatCurrency(totalIncome, this.currency);
        document.getElementById('header-expense').textContent = Utils.formatCurrency(totalExpense, this.currency);
    }

    async renderTransactionsHistory() {
        const container = document.getElementById('home-transactions-list');

        try {
            const allTransactions = await db.getAll('transactions');

            if (!allTransactions || allTransactions.length === 0) {
                container.innerHTML = '<p class="no-transactions">No transactions yet</p>';
                return;
            }

            // Sort by creation time (newest added first) and take first 4
            const recentTransactions = allTransactions
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 4);

            container.innerHTML = recentTransactions.map(transaction => {
                // Get emoji with fallback
                const emoji = categoriesManager.getCategoryEmoji(transaction.category) || '➕';

                // Format date
                const transDate = new Date(transaction.date);
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                let dateStr;
                if (transDate.toDateString() === today.toDateString()) {
                    dateStr = 'Today';
                } else if (transDate.toDateString() === yesterday.toDateString()) {
                    dateStr = 'Yesterday';
                } else {
                    dateStr = transDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                }

                const amountClass = transaction.type === 'income' ? 'income' : 'expense';
                const amountPrefix = transaction.type === 'income' ? '+ ' : '- ';

                return `
                    <div class="transaction-item ${transaction.type}">
                        <div class="transaction-info">
                            <div class="transaction-icon">
                                <span class="category-icon">${emoji}</span>
                            </div>
                            <div class="transaction-details">
                                <span class="category-name">${transaction.category || 'Unknown'}</span>
                                <span class="transaction-note" style="font-size: var(--font-size-sm); color: var(--text-tertiary);">
                                    ${dateStr}
                                </span>
                            </div>
                        </div>
                        <span class="transaction-amount ${amountClass}">
                            ${amountPrefix}${Utils.formatCurrency(transaction.amount, this.currency)}
                        </span>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Error rendering transactions history:', error);
            container.innerHTML = '<p class="no-transactions">No transactions yet</p>';
        }
    }

    async updateTodayExpense() {
        const { start, end } = Utils.getTodayRange();
        const transactions = await db.getTransactionsByDateRange(start, end);
        const todayExpense = Utils.calculateTotal(transactions, 'expense');

        document.getElementById('today-expense').textContent =
            Utils.formatCurrency(todayExpense, this.currency);
    }

    async updateMonthlyExpense() {
        const { start, end } = Utils.getMonthRange();
        const transactions = await db.getTransactionsByDateRange(start, end);
        const monthExpense = Utils.calculateTotal(transactions, 'expense');

        document.getElementById('month-expense').textContent =
            Utils.formatCurrency(monthExpense, this.currency);
    }

    async updateIncomeVsExpense() {
        const { start, end } = Utils.getMonthRange();
        const transactions = await db.getTransactionsByDateRange(start, end);

        const totalIncome = Utils.calculateTotal(transactions, 'income');
        const totalExpense = Utils.calculateTotal(transactions, 'expense');

        document.getElementById('total-income').textContent =
            Utils.formatCurrency(totalIncome, this.currency);
        document.getElementById('total-expense').textContent =
            Utils.formatCurrency(totalExpense, this.currency);
    }

    async updateSavings() {
        const { start, end } = Utils.getMonthRange();
        const transactions = await db.getTransactionsByDateRange(start, end);

        const totalIncome = Utils.calculateTotal(transactions, 'income');
        const totalExpense = Utils.calculateTotal(transactions, 'expense');
        const savings = totalIncome - totalExpense;

        const savingsElement = document.getElementById('savings-amount');

        // Format the amount with proper sign
        if (savings < 0) {
            // Negative savings (overspending) - show in red with minus sign
            savingsElement.textContent = '-' + Utils.formatCurrency(Math.abs(savings), this.currency);
            savingsElement.style.color = 'var(--danger-color)';
        } else {
            // Positive savings - show in green
            savingsElement.textContent = Utils.formatCurrency(savings, this.currency);
            savingsElement.style.color = 'var(--success-color)';
        }

        // Update progress bar
        const progressFill = document.getElementById('savings-progress');
        if (totalIncome > 0) {
            const savingsPercentage = (savings / totalIncome) * 100;
            progressFill.style.width = `${Math.max(0, Math.min(100, savingsPercentage))}%`;

            // Change progress bar color based on savings
            if (savings < 0) {
                progressFill.style.background = 'var(--danger-color)';
            } else {
                progressFill.style.background = 'linear-gradient(90deg, var(--success-color), var(--primary-light))';
            }
        } else {
            progressFill.style.width = '0%';
        }
    }

    async updateBudget() {
        const budget = await db.getSetting('monthlyBudget');
        const budgetContent = document.getElementById('budget-content');

        if (!budget) {
            budgetContent.innerHTML = `
                <p class="budget-info" data-lang="noBudgetSet">${lang.translate('noBudgetSet')}</p>
            `;
            return;
        }

        const { start, end } = Utils.getMonthRange();
        const transactions = await db.getTransactionsByDateRange(start, end);
        const monthExpense = Utils.calculateTotal(transactions, 'expense');
        const remaining = budget - monthExpense;
        const percentage = (monthExpense / budget) * 100;

        budgetContent.innerHTML = `
            <div class="budget-display">
                <p class="budget-amount">${Utils.formatCurrency(budget, this.currency)}</p>
                <p class="budget-spent">
                    ${lang.translate('spent')}: ${Utils.formatCurrency(monthExpense, this.currency)} 
                    (${percentage.toFixed(1)}%)
                </p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(100, percentage)}%; background-color: ${percentage > 100 ? 'var(--danger-color)' : percentage > 80 ? 'var(--warning-color)' : 'var(--success-color)'}"></div>
                </div>
                ${remaining < 0 ? `
                    <p class="budget-warning">${lang.translate('budgetExceeded')}</p>
                ` : percentage > 80 ? `
                    <p class="budget-warning">${lang.translate('budgetWarning')}</p>
                ` : ''}
            </div>
        `;
    }

    async updateMotivationalMessage() {
        const { start: todayStart, end: todayEnd } = Utils.getTodayRange();
        const { start: monthStart, end: monthEnd } = Utils.getMonthRange();

        const todayTransactions = await db.getTransactionsByDateRange(todayStart, todayEnd);
        const monthTransactions = await db.getTransactionsByDateRange(monthStart, monthEnd);

        const todayExpense = Utils.calculateTotal(todayTransactions, 'expense');
        const monthExpense = Utils.calculateTotal(monthTransactions, 'expense');
        const budget = await db.getSetting('monthlyBudget');

        const message = Utils.getMotivationalMessage(todayExpense, monthExpense, budget);
        document.getElementById('motivational-message').textContent = message;

        // Set background color based on expense level
        const card = document.getElementById('motivational-card');
        if (card) {
            let bgColor;
            if (todayExpense === 0) {
                // No expenses - green
                bgColor = '#d4edda';
            } else if (budget && monthExpense > budget * 0.8) {
                // Over 80% of budget - red
                bgColor = '#f8d7da';
            } else if (budget && monthExpense > budget * 0.5) {
                // Over 50% of budget - orange/yellow
                bgColor = '#fff3cd';
            } else {
                // Normal - light green
                bgColor = '#d4edda';
            }
            card.style.backgroundColor = bgColor;
        }
    }
}

// Create global home manager instance
const homeManager = new HomeManager();
