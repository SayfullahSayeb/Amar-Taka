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
            for (const method of this.defaultPaymentMethods) {
                await db.add('paymentMethods', method);
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

        let html = '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: var(--spacing-lg);">';

        methods.forEach((method) => {
            const bgColor = this.getColorForPaymentMethod(method.name);

            html += `
                <div class="payment-method-grid-item" data-method-id="${method.id}" style="display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; padding: 12px; border-radius: 12px; transition: background 0.2s;">
                    <div style="width: 70px; height: 70px; border-radius: 50%; background: ${bgColor}; display: flex; align-items: center; justify-content: center; position: relative;">
                        <i class="fas ${method.icon || 'fa-wallet'}" style="font-size: 32px; color: white;"></i>
                        <button class="payment-method-edit-btn-overlay" data-method-id="${method.id}" style="position: absolute; top: -4px; right: -4px; width: 24px; height: 24px; border-radius: 50%; background: var(--bg-primary); border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <i class="fas fa-edit" style="font-size: 10px; color: var(--text-secondary);"></i>
                        </button>
                    </div>
                    <span style="font-size: 13px; font-weight: 500; color: var(--text-primary); text-align: center; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
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

    getColorForPaymentMethod(name) {
        const colorMap = {
            'Cash': '#4CAF50',
            'Card': '#2196F3',
            'Mobile Banking': '#9C27B0',
            'Bank': '#FF9800',
            'PayPal': '#00457C',
            'Bitcoin': '#F7931A',
            'Wallet': '#607D8B'
        };

        return colorMap[name] || '#' + Math.floor(Math.random() * 16777215).toString(16);
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
            title.textContent = 'Edit Payment Method';
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
            `This will permanently delete "${method.name}". Transactions using this payment method will not be affected.`,
            'Delete Payment Method',
            'Delete'
        );

        if (confirmed) {
            try {
                await this.deletePaymentMethod(id);
                Utils.showToast('Payment method deleted successfully');

                // Close the edit modal
                document.getElementById('payment-method-form-modal').classList.remove('active');

                // Reopen the payment methods list modal
                const paymentMethodsModal = document.getElementById('payment-methods-modal');
                if (paymentMethodsModal) {
                    paymentMethodsModal.classList.add('active');
                }

                // Refresh the payment methods list
                await this.renderPaymentMethodsList();
            } catch (error) {
                console.error('Error deleting payment method:', error);
                Utils.showToast('Error deleting payment method');
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
            title.textContent = 'Add Payment Method';
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
            Utils.showToast('Please enter a payment method name');
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
