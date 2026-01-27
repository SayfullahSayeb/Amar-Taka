class TransactionsManager {
    constructor() {
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.sortOrder = 'newest';
        this.editingId = null;
        this.currency = 'BDT';
    }

    async init() {
        // Load currency preference
        const savedCurrency = await db.getSetting('currency');
        if (savedCurrency) {
            this.currency = savedCurrency;
        }

        this.setupEventListeners();

        // Initialize custom select for sort dropdown
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect && typeof settingsManager !== 'undefined' && settingsManager.createCustomSelect) {
            settingsManager.createCustomSelect(sortSelect);
        }

        // Initialize payment method dropdown
        await this.updatePaymentMethodOptions();

        await this.render();
    }

    async calculatePaymentMethodBalance(paymentMethodName, excludeTransactionId = null) {
        const transactions = await db.getAll('transactions');
        let balance = 0;

        transactions.forEach(transaction => {
            // Skip the transaction being edited
            if (excludeTransactionId && transaction.id === excludeTransactionId) {
                return;
            }

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

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', Utils.debounce((e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.render();
        }, 300));

        // Filter buttons
        document.querySelectorAll('.btn-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;

                // Reset sort dropdown to newest when changing filter
                const sortSelect = document.getElementById('sort-select');
                if (sortSelect && sortSelect.value === 'transfer') {
                    sortSelect.value = 'newest';
                    this.sortOrder = 'newest';
                }

                this.render();
            });
        });

        // Sort dropdown
        const sortSelect = document.getElementById('sort-select');
        sortSelect.addEventListener('change', (e) => {
            const value = e.target.value;

            if (value === 'transfer') {
                // Set filter to transfer
                this.currentFilter = 'transfer';
                this.sortOrder = 'newest'; // Reset to newest

                // Activate "All" filter button
                document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
                const allBtn = document.querySelector('.btn-filter[data-filter="all"]');
                if (allBtn) allBtn.classList.add('active');
            } else {
                // Normal sort option
                this.sortOrder = value;
            }

            this.render();
        });

        // Transaction form
        const form = document.getElementById('transaction-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Type toggle buttons
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const type = e.currentTarget.dataset.type;

                // Toggle transfer fields visibility
                this.toggleTransferFields(type);

                if (type !== 'transfer') {
                    this.updateCategoryOptions(type);
                }
            });
        });

        // Category select change listener
        const categorySelect = document.getElementById('category');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                if (e.target.value === '__add_new__') {
                    if (typeof categoryFormHandler !== 'undefined') {
                        // Pre-fill the type based on current transaction type
                        const activeTypeBtn = document.querySelector('.type-btn.active');
                        const preFillType = activeTypeBtn ? activeTypeBtn.dataset.type : 'expense';

                        // Open the modal
                        categoryFormHandler.openAddModal();

                        const typeSelect = document.getElementById('category-type');
                        if (typeSelect) {
                            typeSelect.value = preFillType;

                            // Manually update custom select UI if it exists
                            const wrapper = typeSelect.nextElementSibling;
                            if (wrapper && wrapper.classList.contains('custom-select-wrapper')) {
                                // Update displayed text
                                const selectedText = wrapper.querySelector('.custom-select-text');
                                const selectedOption = typeSelect.options[typeSelect.selectedIndex];
                                if (selectedText && selectedOption) {
                                    selectedText.textContent = selectedOption.textContent;
                                }

                                // Update active option in dropdown
                                const options = wrapper.querySelectorAll('.custom-select-option');
                                options.forEach(opt => {
                                    if (opt.dataset.value === preFillType) {
                                        opt.classList.add('selected');
                                    } else {
                                        opt.classList.remove('selected');
                                    }
                                });
                            }
                        }
                    }
                }
            });
        }

        // Payment method select change listener
        const paymentMethodSelect = document.getElementById('payment-method');
        if (paymentMethodSelect) {
            paymentMethodSelect.addEventListener('change', (e) => {
                if (e.target.value === '__add_new_payment__') {
                    if (typeof paymentMethodFormHandler !== 'undefined') {
                        // Open the modal
                        paymentMethodFormHandler.openAddModal();
                    }
                }
            });
        }


        // Modal controls - only nav button now
        const navAddBtn = document.getElementById('nav-add-transaction-btn');
        if (navAddBtn) {
            navAddBtn.addEventListener('click', () => {
                if (demoModeManager.isActive()) {
                    demoModeManager.showDemoModeWarning();
                    return;
                }
                this.openModal();
            });
        }

        document.getElementById('close-transaction-modal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancel-transaction-btn').addEventListener('click', () => {
            this.closeModal();
        });

        // Delete button in modal
        document.getElementById('delete-transaction-btn').addEventListener('click', async () => {
            if (this.editingId) {
                await this.deleteTransaction(this.editingId);
            }
        });

        // Event delegation for edit button only
        document.getElementById('transaction-list').addEventListener('click', async (e) => {
            const editBtn = e.target.closest('.btn-edit');

            if (editBtn) {
                if (demoModeManager.isActive()) {
                    demoModeManager.showDemoModeWarning();
                    return;
                }
                const id = parseInt(editBtn.dataset.id);
                await this.editTransaction(id);
            }
        });
    }

    toggleTransferFields(type) {
        const transferFields = document.getElementById('transfer-fields');
        const normalFields = document.getElementById('normal-transaction-fields');
        const categorySelect = document.getElementById('category');

        if (type === 'transfer') {
            // Show transfer fields, hide normal fields
            if (transferFields) transferFields.style.display = 'block';
            if (normalFields) normalFields.style.display = 'none';
            if (categorySelect) categorySelect.removeAttribute('required');

            // Populate transfer dropdowns
            this.updateTransferPaymentMethods();

            // Set up event listeners for dynamic filtering
            this.setupTransferChangeListeners();
        } else {
            // Show normal fields, hide transfer fields
            if (transferFields) transferFields.style.display = 'none';
            if (normalFields) normalFields.style.display = 'grid';
            if (categorySelect) categorySelect.setAttribute('required', 'required');
        }
    }

    setupTransferChangeListeners() {
        // Remove old listeners if they exist
        if (this.transferFromListener) {
            document.removeEventListener('change', this.transferFromListener);
        }
        if (this.transferToListener) {
            document.removeEventListener('change', this.transferToListener);
        }

        // Create new listeners
        this.transferFromListener = async (e) => {
            if (e.target.id === 'transfer-from') {
                const transferFrom = document.getElementById('transfer-from');
                const transferTo = document.getElementById('transfer-to');
                if (transferFrom && transferTo) {
                    await this.updateTransferPaymentMethods(transferFrom.value, transferTo.value);
                }
            }
        };

        this.transferToListener = async (e) => {
            if (e.target.id === 'transfer-to') {
                const transferFrom = document.getElementById('transfer-from');
                const transferTo = document.getElementById('transfer-to');
                if (transferFrom && transferTo) {
                    await this.updateTransferPaymentMethods(transferFrom.value, transferTo.value);
                }
            }
        };

        // Add listeners to document (event delegation)
        document.addEventListener('change', this.transferFromListener);
        document.addEventListener('change', this.transferToListener);
    }

    async updateTransferPaymentMethods(selectedFrom = null, selectedTo = null) {
        const transferFrom = document.getElementById('transfer-from');
        const transferTo = document.getElementById('transfer-to');

        if (!transferFrom || !transferTo) return;

        // Get all payment methods
        const methods = await paymentMethodsManager.getPaymentMethods();

        if (methods.length < 2) {
            // Need at least 2 accounts for transfer
            Utils.showToast('Please add at least 2 accounts to make a transfer');
            return;
        }

        // Store current selections if not provided
        let currentFrom = selectedFrom || transferFrom.value;
        let currentTo = selectedTo || transferTo.value;

        // On first load, ensure different defaults
        if (!currentFrom && !currentTo) {
            currentFrom = methods[0].name;
            currentTo = methods[1].name;
        } else if (currentFrom === currentTo) {
            // If somehow they're the same, fix it
            const otherMethod = methods.find(m => m.name !== currentFrom);
            if (otherMethod) {
                currentTo = otherMethod.name;
            }
        }

        // Populate FROM dropdown (exclude currently selected TO)
        transferFrom.innerHTML = '';
        methods.forEach(method => {
            if (method.name !== currentTo) {
                const option = document.createElement('option');
                option.value = method.name;
                option.textContent = method.name;
                transferFrom.appendChild(option);
            }
        });

        // Populate TO dropdown (exclude currently selected FROM)
        transferTo.innerHTML = '';
        methods.forEach(method => {
            if (method.name !== currentFrom) {
                const option = document.createElement('option');
                option.value = method.name;
                option.textContent = method.name;
                transferTo.appendChild(option);
            }
        });

        // Set selections
        if (currentFrom && transferFrom.querySelector(`option[value="${currentFrom}"]`)) {
            transferFrom.value = currentFrom;
        }
        if (currentTo && transferTo.querySelector(`option[value="${currentTo}"]`)) {
            transferTo.value = currentTo;
        }

        // Remove old custom select wrappers
        const fromWrapper = transferFrom.nextElementSibling;
        const toWrapper = transferTo.nextElementSibling;
        if (fromWrapper && fromWrapper.classList && fromWrapper.classList.contains('custom-select-wrapper')) {
            fromWrapper.remove();
        }
        if (toWrapper && toWrapper.classList && toWrapper.classList.contains('custom-select-wrapper')) {
            toWrapper.remove();
        }

        // Show original selects temporarily
        transferFrom.style.display = '';
        transferTo.style.display = '';

        // Initialize custom selects if available
        if (typeof settingsManager !== 'undefined' && settingsManager.createCustomSelect) {
            settingsManager.createCustomSelect(transferFrom);
            settingsManager.createCustomSelect(transferTo);
        }
    }

    async render() {
        const container = document.getElementById('transaction-list');
        let transactions = await db.getAll('transactions');

        // Apply filters
        if (this.currentFilter !== 'all') {
            transactions = transactions.filter(t => t.type === this.currentFilter);
        }

        // Apply search
        if (this.searchQuery) {
            transactions = transactions.filter(t =>
                t.category.toLowerCase().includes(this.searchQuery) ||
                (t.note && t.note.toLowerCase().includes(this.searchQuery)) ||
                t.amount.toString().includes(this.searchQuery)
            );
        }

        // Apply sorting - always newest first by default
        switch (this.sortOrder) {
            case 'newest':
                transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'highest':
                transactions.sort((a, b) => b.amount - a.amount);
                break;
            case 'lowest':
                transactions.sort((a, b) => a.amount - b.amount);
                break;
            default:
                transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        if (transactions.length === 0) {
            Utils.renderEmptyState(
                container,
                'wallet',
                lang.translate('noTransactions')
            );
            return;
        }

        // Group transactions by date
        const groupedTransactions = {};
        transactions.forEach(t => {
            const dateKey = t.date;
            if (!groupedTransactions[dateKey]) {
                groupedTransactions[dateKey] = [];
            }
            groupedTransactions[dateKey].push(t);
        });

        // Sort transactions within each date group by createdAt (newest first)
        Object.keys(groupedTransactions).forEach(date => {
            groupedTransactions[date].sort((a, b) => {
                const timeA = new Date(a.createdAt || a.date).getTime();
                const timeB = new Date(b.createdAt || b.date).getTime();
                return timeB - timeA; // Newest first
            });
        });

        // Render grouped transactions
        let html = '';
        Object.keys(groupedTransactions).forEach(date => {
            // Format date header
            const dateObj = new Date(date);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let dateLabel;
            if (dateObj.toDateString() === today.toDateString()) {
                dateLabel = 'Today';
            } else if (dateObj.toDateString() === yesterday.toDateString()) {
                dateLabel = 'Yesterday';
            } else {
                dateLabel = dateObj.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }

            html += `<div class="transaction-date-header">${dateLabel}</div>`;

            // Render transactions for this date
            groupedTransactions[date].forEach(t => {
                html += this.renderTransaction(t);
            });
        });

        container.innerHTML = html;
    }

    renderTransaction(transaction) {
        // Handle transfer transactions differently
        if (transaction.type === 'transfer') {
            return this.renderTransfer(transaction);
        }

        const iconClass = categoriesManager.getCategoryEmoji(transaction.category);
        const categoryName = lang.translate(transaction.category.toLowerCase());

        // Get payment method icon
        const paymentIcons = {
            'cash': 'fa-money-bill-wave',
            'card': 'fa-credit-card',
            'mobile': 'fa-mobile-alt',
            'mobile banking': 'fa-mobile-alt',
            'bank': 'fa-university'
        };
        const methodKey = (transaction.paymentMethod || 'cash').toLowerCase();
        const paymentIcon = paymentIcons[methodKey] || 'fa-wallet';
        const paymentMethodName = transaction.paymentMethod || 'Cash';

        return `
            <div class="transaction-item ${transaction.type}" data-id="${transaction.id}">
                <div class="transaction-info">
                    <div class="transaction-icon">
                        <span class="category-icon"><i class="${iconClass}"></i></span>
                    </div>
                    <div class="transaction-details">
                        <span class="category-name">${categoryName} <span style="font-size: 13px; font-weight: 400; color: var(--text-tertiary);"><i class="fas ${paymentIcon}" style="font-size: 10px;"></i> ${paymentMethodName}</span></span>
                        ${transaction.note ? `<span class="transaction-note" style="font-size: var(--font-size-sm); color: var(--text-tertiary);">${transaction.note}</span>` : ''}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : ''}${Utils.formatCurrency(transaction.amount, this.currency)}
                    </span>
                    <button class="btn-action btn-edit" data-id="${transaction.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderTransfer(transaction) {
        return `
            <div class="transaction-item transfer" data-id="${transaction.id}">
                <div class="transaction-info">
                    <div class="transaction-icon">
                        <span class="category-icon"><i class="fas fa-exchange-alt"></i></span>
                    </div>
                    <div class="transaction-details">
                        <span class="category-name">Transfer <span style="font-size: 13px; font-weight: 400; color: var(--text-tertiary);">${transaction.transferFrom} → ${transaction.transferTo}</span></span>
                        ${transaction.note ? `<span class="transaction-note" style="font-size: var(--font-size-sm); color: var(--text-tertiary);">${transaction.note}</span>` : ''}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="transaction-amount transfer">
                        ${Utils.formatCurrency(transaction.amount, this.currency)}
                    </span>
                    <button class="btn-action btn-edit" data-id="${transaction.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        `;
    }

    async openModal(transaction = null) {
        const modal = document.getElementById('transaction-modal');
        const form = document.getElementById('transaction-form');
        const modalTitle = document.getElementById('modal-title');
        const deleteBtn = document.getElementById('delete-transaction-btn');

        if (transaction) {
            // Edit mode
            this.editingId = transaction.id;
            modalTitle.setAttribute('data-lang', 'editTransaction');
            modalTitle.textContent = lang.translate('editTransaction');

            // Show delete button in edit mode
            deleteBtn.style.display = 'flex';

            // Set type first
            document.querySelectorAll('.type-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.type === transaction.type);
            });

            // Toggle transfer fields based on type
            this.toggleTransferFields(transaction.type);

            if (transaction.type === 'transfer') {
                // Populate transfer fields
                await this.updateTransferPaymentMethods();
                document.getElementById('transfer-from').value = transaction.transferFrom || '';
                document.getElementById('transfer-to').value = transaction.transferTo || '';
            } else {
                // Update category options based on type (MUST await this!)
                await this.updateCategoryOptions(transaction.type);
                // Populate form AFTER category options are updated
                document.getElementById('category').value = transaction.category;
                document.getElementById('payment-method').value = transaction.paymentMethod || 'cash';
            }

            document.getElementById('amount').value = transaction.amount;
            document.getElementById('date').value = Utils.formatDate(transaction.date, 'input');
            document.getElementById('note').value = transaction.note || '';
            document.getElementById('transaction-id').value = transaction.id;
        } else {
            // Add mode
            this.editingId = null;
            modalTitle.setAttribute('data-lang', 'addTransaction');
            modalTitle.textContent = lang.translate('addTransaction');

            // Hide delete button in add mode
            deleteBtn.style.display = 'none';

            form.reset();

            // Set today's date
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            document.getElementById('date').value = dateStr;
            document.querySelectorAll('.type-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.type === 'expense');
            });

            // Show normal fields by default
            this.toggleTransferFields('expense');
            await this.updateCategoryOptions('expense');
        }

        modal.classList.add('active');
    }

    closeModal() {
        const modal = document.getElementById('transaction-modal');
        modal.classList.remove('active');
        this.editingId = null;
    }

    async updateCategoryOptions(type, selectedCategory = null) {
        const categorySelect = document.getElementById('category');

        // Remove existing custom select wrapper if it exists
        const existingWrapper = categorySelect.nextSibling;
        if (existingWrapper && existingWrapper.classList && existingWrapper.classList.contains('custom-select-wrapper')) {
            existingWrapper.remove();
        }

        // Show the original select temporarily
        categorySelect.style.display = '';

        // Populate with new categories
        await categoriesManager.populateCategorySelect(categorySelect, type);

        // Auto-select the new category if provided
        if (selectedCategory) {
            categorySelect.value = selectedCategory;
        }
    }

    async updatePaymentMethodOptions(selectedMethod = null) {
        const paymentMethodSelect = document.getElementById('payment-method');

        // Remove existing custom select wrapper if it exists
        const existingWrapper = paymentMethodSelect.nextSibling;
        if (existingWrapper && existingWrapper.classList && existingWrapper.classList.contains('custom-select-wrapper')) {
            existingWrapper.remove();
        }

        // Show the original select temporarily
        paymentMethodSelect.style.display = '';

        // Populate with payment methods
        await paymentMethodsManager.populatePaymentMethodSelect(paymentMethodSelect);

        // Auto-select the new payment method if provided
        if (selectedMethod) {
            paymentMethodSelect.value = selectedMethod;
        }
    }


    async handleSubmit(e) {
        e.preventDefault();

        const activeTypeBtn = document.querySelector('.type-btn.active');
        const type = activeTypeBtn.dataset.type;

        let transactionData;

        if (type === 'transfer') {
            // Handle transfer
            const transferFrom = document.getElementById('transfer-from').value;
            const transferTo = document.getElementById('transfer-to').value;
            const amount = parseFloat(document.getElementById('amount').value);

            // Validate amount first
            if (!amount || isNaN(amount) || amount <= 0) {
                Utils.showToast('Please enter a valid amount');
                return;
            }

            if (transferFrom === transferTo) {
                Utils.showToast('Cannot transfer to the same account');
                return;
            }

            // Check if source account has sufficient balance (exclude current transaction if editing)
            const fromBalance = await this.calculatePaymentMethodBalance(transferFrom, this.editingId);

            console.log('Transfer validation:', {
                from: transferFrom,
                to: transferTo,
                amount: amount,
                fromBalance: fromBalance,
                editingId: this.editingId
            });

            if (fromBalance <= 0) {
                Utils.showToast(`Cannot transfer from ${transferFrom}: No funds available (Balance: ${Utils.formatCurrency(fromBalance, this.currency)})`);
                return;
            }

            if (amount > fromBalance) {
                Utils.showToast(`Insufficient funds in ${transferFrom}. Available: ${Utils.formatCurrency(fromBalance, this.currency)}`);
                return;
            }

            transactionData = {
                type: 'transfer',
                amount: amount,
                transferFrom: transferFrom,
                transferTo: transferTo,
                date: document.getElementById('date').value,
                note: document.getElementById('note').value,
                createdAt: new Date().toISOString()
            };
        } else {
            // Handle normal income/expense
            const categoryVal = document.getElementById('category').value;
            const paymentMethodVal = document.getElementById('payment-method').value;

            if (categoryVal === '__add_new__') {
                Utils.showToast('Please select a valid category');
                return;
            }

            if (paymentMethodVal === '__add_new_payment__') {
                Utils.showToast('Please select a valid payment method');
                return;
            }

            transactionData = {
                type: type,
                amount: parseFloat(document.getElementById('amount').value),
                category: categoryVal,
                paymentMethod: paymentMethodVal,
                date: document.getElementById('date').value,
                note: document.getElementById('note').value,
                createdAt: new Date().toISOString()
            };
        }

        // Validate
        if (!transactionData.amount || transactionData.amount <= 0) {
            Utils.showToast('Please enter a valid amount');
            return;
        }

        try {
            if (this.editingId) {
                // Update existing transaction
                transactionData.id = this.editingId;
                await db.update('transactions', transactionData);
                Utils.showToast(lang.translate('transactionUpdated'));
            } else {
                // Add new transaction
                await db.add('transactions', transactionData);
                Utils.showToast(lang.translate('transactionAdded'));
            }

            this.closeModal();
            await this.render();

            // Always update home page to refresh transactions history
            await homeManager.render();

            // Navigate to transactions page after adding (not editing)
            if (!this.editingId) {
                // Get reference to app instance
                const appElement = document.querySelector('.app-container');
                if (appElement && window.location.hash !== '#transactions') {
                    window.location.hash = 'transactions';
                }
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            Utils.showToast('Error saving transaction');
        }
    }

    async editTransaction(id) {
        const transaction = await db.get('transactions', id);
        if (transaction) {
            await this.openModal(transaction);
        }
    }

    async deleteTransaction(id) {
        const confirmed = await Utils.confirm(
            'Are you sure you want to delete this transaction?',
            'Delete Transaction',
            'Delete'
        );

        if (confirmed) {
            try {
                await db.delete('transactions', id);
                Utils.showToast(lang.translate('transactionDeleted'));

                // Close the modal
                this.closeModal();

                await this.render();

                // Update home page if visible
                if (document.getElementById('home-page').classList.contains('active')) {
                    await homeManager.render();
                }
            } catch (error) {
                console.error('Error deleting transaction:', error);
                Utils.showToast('Error deleting transaction');
            }
        }
    }
}

// Create global transactions manager instance
const transactionsManager = new TransactionsManager();
