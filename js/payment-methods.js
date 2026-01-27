class PaymentMethodsManager {
    constructor() {
        this.defaultPaymentMethods = [
            { name: 'Cash', icon: 'fa-money-bill-wave' },
            { name: 'Card', icon: 'fa-credit-card' },
            { name: 'Mobile Banking', icon: 'fa-mobile-alt' },
            { name: 'Bank', icon: 'fa-university' }
        ];
    }

    async init() {
        // Check if payment methods exist, if not, add defaults
        const paymentMethods = await db.getAll('paymentMethods');

        if (paymentMethods.length === 0) {
            // No payment methods exist, add defaults
            for (const method of this.defaultPaymentMethods) {
                await db.add('paymentMethods', method);
            }
        } else {
            // Payment methods exist, but they might be missing icons
            // Let's fix them by updating with correct icons
            const iconMap = {
                'Cash': 'fa-money-bill-wave',
                'Card': 'fa-credit-card',
                'Mobile Banking': 'fa-mobile-alt',
                'Bank': 'fa-university'
            };

            for (const method of paymentMethods) {
                // If the method doesn't have an icon, or has an empty/invalid icon
                if (!method.icon || method.icon === '' || method.icon === 'undefined') {
                    // Try to match by name and assign the correct icon
                    if (iconMap[method.name]) {
                        method.icon = iconMap[method.name];
                        await db.update('paymentMethods', method);
                        console.log(`Fixed icon for payment method: ${method.name} -> ${method.icon}`);
                    } else {
                        // Default icon for unknown payment methods
                        method.icon = 'fa-wallet';
                        await db.update('paymentMethods', method);
                        console.log(`Set default icon for payment method: ${method.name} -> fa-wallet`);
                    }
                }
            }
        }
    }

    async getPaymentMethods() {
        return await db.getAll('paymentMethods');
    }

    async getPaymentMethodById(id) {
        return await db.get('paymentMethods', id);
    }

    async addPaymentMethod(methodData) {
        return await db.add('paymentMethods', methodData);
    }

    async updatePaymentMethod(id, methodData) {
        return await db.update('paymentMethods', { ...methodData, id });
    }

    async deletePaymentMethod(id) {
        return await db.delete('paymentMethods', id);
    }

    async populatePaymentMethodSelect(selectElement) {
        const methods = await this.getPaymentMethods();
        selectElement.innerHTML = '';

        methods.forEach(method => {
            const option = document.createElement('option');
            option.value = method.name;
            option.textContent = `${method.icon ? '' : ''}${method.name}`;
            selectElement.appendChild(option);
        });

        // Add "Add New Payment Method" option
        const addNewOption = document.createElement('option');
        addNewOption.value = '__add_new_payment__';
        addNewOption.textContent = `➕ Add Payment Method`;
        selectElement.appendChild(addNewOption);

        // Initialize custom select if settingsManager is available
        if (typeof settingsManager !== 'undefined' && settingsManager.createCustomSelect) {
            settingsManager.createCustomSelect(selectElement);
        }
    }

    async renderPaymentMethodsList() {
        const container = document.getElementById('payment-methods-list');
        const methods = await this.getPaymentMethods();

        if (methods.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: var(--spacing-lg); color: var(--text-tertiary);">No payment methods yet</p>';
            return;
        }

        let html = '<div class="category-payment-grid">';

        methods.forEach((method) => {
            const iconClass = this.getIconClass(method.icon);

            html += `
                <div class="payment-method-grid-item" data-method-id="${method.id}">
                    <div class="payment-method-icon-circle">
                        <i class="${iconClass}"></i>
                        <button class="payment-method-edit-btn-overlay" data-method-id="${method.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                    <span class="payment-method-label">
                        ${method.name}
                    </span>
                </div>
            `;
        });

        html += '</div>';

        container.innerHTML = html;

        // Setup event listeners
        this.setupPaymentMethodEventListeners();
    }

    getIconClass(icon) {
        // Ensure icon has 'fas' prefix
        if (!icon) return 'fas fa-wallet';
        if (icon.startsWith('fas ') || icon.startsWith('far ') || icon.startsWith('fab ')) {
            return icon;
        }
        return `fas ${icon}`;
    }

    setupPaymentMethodEventListeners() {
        // Edit buttons (overlay buttons)
        const editButtons = document.querySelectorAll('.payment-method-edit-btn-overlay');
        editButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering parent click
                const methodId = parseInt(btn.getAttribute('data-method-id'));
                this.editPaymentMethod(methodId);
            });
        });

        // Also handle old style edit buttons if they exist
        const oldEditButtons = document.querySelectorAll('.payment-method-edit-btn');
        oldEditButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const methodId = parseInt(btn.getAttribute('data-method-id'));
                this.editPaymentMethod(methodId);
            });
        });
    }

    async editPaymentMethod(id) {
        const method = await this.getPaymentMethodById(id);
        if (!method) return;

        const modal = document.getElementById('payment-method-form-modal');
        const title = document.getElementById('payment-method-form-title');
        const nameInput = document.getElementById('payment-method-name');
        const iconSelect = document.getElementById('payment-method-icon');
        const idInput = document.getElementById('payment-method-id');
        const deleteBtn = document.getElementById('delete-payment-method-btn');

        if (modal && title && nameInput && iconSelect && idInput) {
            title.textContent = 'Edit Account';
            nameInput.value = method.name;
            iconSelect.value = method.icon || 'fa-wallet';
            idInput.value = method.id;

            // Show delete button in edit mode
            if (deleteBtn) {
                deleteBtn.style.display = 'flex';
            }

            // Close payment methods modal and open form modal
            document.getElementById('payment-methods-modal').classList.remove('active');
            modal.classList.add('active');
        }
    }

    async confirmDeletePaymentMethod(id) {
        const method = await this.getPaymentMethodById(id);
        if (!method) return;

        const confirmed = await Utils.confirm(
            `This will permanently delete "${method.name}". Transactions using this account will not be affected.`,
            'Delete Account',
            'Delete'
        );

        if (confirmed) {
            try {
                await this.deletePaymentMethod(id);
                Utils.showToast('Account deleted successfully');

                // Close the edit modal
                document.getElementById('payment-method-form-modal').classList.remove('active');

                // Reopen the categories modal on the Accounts tab
                const categoriesModal = document.getElementById('categories-modal');
                if (categoriesModal) {
                    categoriesModal.classList.add('active');
                    // Switch to payment methods tab
                    if (typeof settingsManager !== 'undefined' && settingsManager.switchCategoryTab) {
                        settingsManager.switchCategoryTab('payment');
                    }
                }

                // Refresh the payment methods list
                await this.renderPaymentMethodsList();

                // Also refresh the accounts page if it's active
                if (typeof accountsManager !== 'undefined' && accountsManager.render) {
                    await accountsManager.render();
                }
            } catch (error) {
                console.error('Error deleting payment method:', error);
                Utils.showToast('Error deleting account');
            }
        }
    }

    getPaymentMethodIcon(methodName) {
        const method = this.defaultPaymentMethods.find(m => m.name === methodName);
        return method ? method.icon : 'fa-wallet';
    }
}

// Create global payment methods manager instance
const paymentMethodsManager = new PaymentMethodsManager();

class PaymentMethodFormHandler {
    constructor() {
        this.modal = null;
        this.form = null;
    }

    init() {
        this.modal = document.getElementById('payment-method-form-modal');
        this.form = document.getElementById('payment-method-form');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add Payment Method button
        const addBtn = document.getElementById('add-payment-method-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openAddModal());
        }

        // Close modal button
        const closeBtn = document.getElementById('close-payment-method-form-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancel-payment-method-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        // Form submit
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Delete button
        const deleteBtn = document.getElementById('delete-payment-method-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                const methodId = document.getElementById('payment-method-id').value;
                if (methodId) {
                    paymentMethodsManager.confirmDeletePaymentMethod(parseInt(methodId));
                }
            });
        }
    }

    openAddModal() {
        const title = document.getElementById('payment-method-form-title');
        if (title) {
            title.textContent = 'Add Account';
        }

        this.resetForm();

        // Hide delete button in add mode
        const deleteBtn = document.getElementById('delete-payment-method-btn');
        if (deleteBtn) {
            deleteBtn.style.display = 'none';
        }

        if (this.modal) {
            this.modal.classList.add('active');
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
        }
        this.resetForm();
    }

    resetForm() {
        if (this.form) {
            this.form.reset();
        }

        const idInput = document.getElementById('payment-method-id');
        if (idInput) {
            idInput.value = '';
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        const nameInput = document.getElementById('payment-method-name');
        const iconSelect = document.getElementById('payment-method-icon');
        const idInput = document.getElementById('payment-method-id');

        if (!nameInput || !iconSelect) {
            Utils.showToast('Please fill all fields');
            return;
        }

        const methodData = {
            name: nameInput.value.trim(),
            icon: iconSelect.value
        };

        // Validate
        if (!methodData.name) {
            Utils.showToast('Please enter an account name');
            return;
        }

        try {
            const methodId = idInput ? idInput.value : null;

            if (methodId) {
                // Edit mode
                await paymentMethodsManager.updatePaymentMethod(parseInt(methodId), methodData);
                Utils.showToast('Payment method updated successfully');
            } else {
                // Add mode
                await paymentMethodsManager.addPaymentMethod(methodData);
                Utils.showToast('Payment method added successfully');
            }

            // Refresh the payment methods list
            await paymentMethodsManager.renderPaymentMethodsList();

            // Refresh transaction modal payment method dropdown if it's open
            this.refreshTransactionPaymentMethodDropdown(methodData.name);

            // Close modal
            this.closeModal();

        } catch (error) {
            console.error('Error saving payment method:', error);
            Utils.showToast('Error saving payment method');
        }
    }

    refreshTransactionPaymentMethodDropdown(selectedMethod = null) {
        // Check if transaction modal is open
        const transactionModal = document.getElementById('transaction-modal');
        if (transactionModal && transactionModal.classList.contains('active')) {
            if (typeof transactionsManager !== 'undefined') {
                transactionsManager.updatePaymentMethodOptions(selectedMethod);
            }
        }
    }
}

// Initialize payment method form handler
const paymentMethodFormHandler = new PaymentMethodFormHandler();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    paymentMethodFormHandler.init();
});
