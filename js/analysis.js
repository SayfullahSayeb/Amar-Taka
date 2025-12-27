// ===================================
// Analysis Manager
// ===================================

class AnalysisManager {
    constructor() {
        this.currentPeriod = 'month';
        this.expenseChart = null;
        this.categoryChart = null;
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
        document.querySelectorAll('.btn-period').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-period').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPeriod = e.target.dataset.period;
                this.render();
            });
        });
    }

    async render() {
        await this.renderExpenseChart();
        await this.renderCategoryChart();
        await this.renderInsights();
        await this.renderStats();
    }

    async renderExpenseChart() {
        const canvas = document.getElementById('expense-chart');
        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.expenseChart) {
            this.expenseChart.destroy();
        }

        const { labels, data } = await this.getExpenseData();

        this.expenseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: lang.translate('expense'),
                    data: data,
                    backgroundColor: 'rgba(255, 59, 48, 0.6)',
                    borderColor: 'rgba(255, 59, 48, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => Utils.formatCurrency(value, this.currency)
                        }
                    }
                }
            }
        });
    }

    async renderCategoryChart() {
        const canvas = document.getElementById('category-chart');
        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.categoryChart) {
            this.categoryChart.destroy();
        }

        const { labels, data, colors } = await this.getCategoryData();

        this.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    async getExpenseData() {
        let range;
        let labels = [];

        if (this.currentPeriod === 'week') {
            range = Utils.getWeekRange();
            // Generate labels for each day of the week
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            labels = days;
        } else if (this.currentPeriod === 'month') {
            range = Utils.getMonthRange();
            // Generate labels for weeks of the month
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        } else {
            range = Utils.getYearRange();
            // Generate labels for each month
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        }

        const transactions = await db.getTransactionsByDateRange(range.start, range.end);
        const expenses = transactions.filter(t => t.type === 'expense');

        const data = new Array(labels.length).fill(0);

        expenses.forEach(expense => {
            const date = new Date(expense.date);
            let index;

            if (this.currentPeriod === 'week') {
                index = date.getDay();
            } else if (this.currentPeriod === 'month') {
                index = Math.floor((date.getDate() - 1) / 7);
            } else {
                index = date.getMonth();
            }

            if (index >= 0 && index < data.length) {
                data[index] += parseFloat(expense.amount);
            }
        });

        return { labels, data };
    }

    async getCategoryData() {
        let range;

        if (this.currentPeriod === 'week') {
            range = Utils.getWeekRange();
        } else if (this.currentPeriod === 'month') {
            range = Utils.getMonthRange();
        } else {
            range = Utils.getYearRange();
        }

        const transactions = await db.getTransactionsByDateRange(range.start, range.end);
        const expenses = transactions.filter(t => t.type === 'expense');
        const grouped = Utils.groupByCategory(expenses);

        const labels = [];
        const data = [];
        const colors = [];

        for (const category in grouped) {
            labels.push(lang.translate(category.toLowerCase()));
            data.push(grouped[category].total);
            colors.push(categoriesManager.getCategoryColor(category));
        }

        return { labels, data, colors };
    }

    async renderInsights() {
        const container = document.getElementById('insights-list');

        const currentMonth = Utils.getMonthRange();
        const lastMonth = Utils.getMonthRange(-1);

        const currentTransactions = await db.getTransactionsByDateRange(currentMonth.start, currentMonth.end);
        const lastTransactions = await db.getTransactionsByDateRange(lastMonth.start, lastMonth.end);

        const insights = Utils.generateInsights(currentTransactions, lastTransactions);

        if (insights.length === 0) {
            container.innerHTML = '<p class="text-center" style="color: var(--text-tertiary);">Not enough data for insights</p>';
            return;
        }

        container.innerHTML = insights.map(insight => `
            <div class="insight-item ${insight.type}">
                <p class="insight-text">${insight.text}</p>
            </div>
        `).join('');
    }

    async renderStats() {
        let range;

        if (this.currentPeriod === 'week') {
            range = Utils.getWeekRange();
        } else if (this.currentPeriod === 'month') {
            range = Utils.getMonthRange();
        } else {
            range = Utils.getYearRange();
        }

        const transactions = await db.getTransactionsByDateRange(range.start, range.end);
        const expenses = transactions.filter(t => t.type === 'expense');

        // Calculate daily average
        const totalExpense = Utils.calculateTotal(expenses);
        const days = Math.ceil((range.end - range.start) / (1000 * 60 * 60 * 24));
        const avgDaily = totalExpense / days;

        document.getElementById('avg-daily').textContent =
            Utils.formatCurrency(avgDaily, this.currency);

        // Find highest spending category
        const grouped = Utils.groupByCategory(expenses);
        let highestCategory = '-';
        let highestAmount = 0;

        for (const category in grouped) {
            if (grouped[category].total > highestAmount) {
                highestAmount = grouped[category].total;
                highestCategory = lang.translate(category.toLowerCase());
            }
        }

        document.getElementById('highest-category').textContent = highestCategory;

        // Display budget information (monthly only)
        const budget = await db.getSetting('monthlyBudget');
        const budgetElement = document.getElementById('analysis-budget');
        const remainingElement = document.getElementById('budget-remaining');

        if (budget && this.currentPeriod === 'month') {
            budgetElement.textContent = Utils.formatCurrency(budget, this.currency);

            const monthExpense = Utils.calculateTotal(expenses);
            const remaining = budget - monthExpense;

            remainingElement.textContent = Utils.formatCurrency(Math.abs(remaining), this.currency);

            // Color code the remaining amount
            if (remaining < 0) {
                remainingElement.style.color = 'var(--danger-color)';
                remainingElement.textContent = '-' + Utils.formatCurrency(Math.abs(remaining), this.currency);
            } else {
                remainingElement.style.color = 'var(--success-color)';
                remainingElement.textContent = Utils.formatCurrency(remaining, this.currency);
            }
        } else {
            budgetElement.textContent = '-';
            remainingElement.textContent = '-';
            remainingElement.style.color = 'var(--primary-color)';
        }
    }
}

// Create global analysis manager instance
const analysisManager = new AnalysisManager();
