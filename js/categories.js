class CategoriesManager {
    constructor() {
        this.defaultCategories = [
            { name: 'Food', emoji: 'fas fa-utensils', color: '#FF6B6B', type: 'expense' },
            { name: 'Transport', emoji: 'fas fa-car', color: '#4ECDC4', type: 'expense' },
            { name: 'Bills', emoji: 'fas fa-file-invoice-dollar', color: '#FFE66D', type: 'expense' },
            { name: 'Shopping', emoji: 'fas fa-shopping-bag', color: '#A8E6CF', type: 'expense' },
            { name: 'Medical', emoji: 'fas fa-hospital', color: '#FF8B94', type: 'expense' },
            { name: 'Education', emoji: 'fas fa-graduation-cap', color: '#95E1D3', type: 'expense' },
            { name: 'Rent', emoji: 'fas fa-home', color: '#F38181', type: 'expense' },
            { name: 'Salary', emoji: 'fas fa-money-bill-wave', color: '#34C759', type: 'income' },
            { name: 'Investment', emoji: 'fas fa-chart-line', color: '#5AC8FA', type: 'income' },
            { name: 'Others', emoji: 'fas fa-plus-circle', color: '#8E8E93', type: 'both' }
        ];
    }

    async init() {
        // Check if categories exist, if not, add defaults
        const categories = await db.getAll('categories');
        if (categories.length === 0) {
            for (const category of this.defaultCategories) {
                await db.add('categories', category);
            }
        } else {
            // Migrate existing emoji-based categories to icon classes
            await this.migrateEmojiToIcons();
        }
    }

    async migrateEmojiToIcons() {
        const categories = await db.getAll('categories');
        let migrated = false;

        for (const category of categories) {
            // Check if emoji field contains actual emoji (not icon class)
            if (category.emoji && !category.emoji.startsWith('fas ')) {
                // Convert emoji to icon class
                const iconClass = this.getIconForCategory(category.emoji, category.name);
                await db.update('categories', { ...category, emoji: iconClass });
                migrated = true;
            }
        }

        if (migrated) {
            console.log('Migrated categories from emoji to icons');
        }
    }

    async getCategories(type = null) {
        const categories = await db.getAll('categories');
        if (type) {
            return categories.filter(c => c.type === type || c.type === 'both');
        }
        return categories;
    }

    async getCategoryById(id) {
        return await db.get('categories', id);
    }

    async addCategory(categoryData) {
        return await db.add('categories', categoryData);
    }

    async updateCategory(id, categoryData) {
        return await db.update('categories', { ...categoryData, id });
    }

    async deleteCategory(id) {
        return await db.delete('categories', id);
    }

    async populateCategorySelect(selectElement, type = 'expense') {
        const categories = await this.getCategories(type);
        selectElement.innerHTML = '';

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = lang.translate(category.name.toLowerCase());
            selectElement.appendChild(option);
        });

        // Add "Add New Category" option
        const addNewOption = document.createElement('option');
        addNewOption.value = '__add_new__';
        addNewOption.textContent = `➕ Category`;
        selectElement.appendChild(addNewOption);

        // Initialize custom select if settingsManager is available
        if (typeof settingsManager !== 'undefined' && settingsManager.createCustomSelect) {
            settingsManager.createCustomSelect(selectElement);
        }
    }

    async renderCategoriesList() {
        const categories = await this.getCategories();

        // Group categories by type
        const incomeCategories = categories.filter(c => c.type === 'income' || c.type === 'both');
        const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');

        // Render expense categories
        this.renderCategoryList('expense-categories-list', expenseCategories);

        // Render income categories
        this.renderCategoryList('income-categories-list', incomeCategories);

        // Setup event listeners for the buttons
        this.setupCategoryEventListeners();
    }

    renderCategoryList(containerId, categories) {
        const container = document.getElementById(containerId);

        if (!container) return;

        if (categories.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: var(--spacing-lg); color: var(--text-tertiary);">No categories yet</p>';
            return;
        }

        let html = '<div class="category-payment-grid">';

        categories.forEach((category) => {
            // Map emoji to Font Awesome icon
            const iconClass = this.getIconForCategory(category.emoji, category.name);

            html += `
                <div class="category-grid-item" data-category-id="${category.id}">
                    <div class="category-icon-circle">
                        <i class="${iconClass}"></i>
                        <button class="category-edit-btn-overlay" data-category-id="${category.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                    <span class="category-label">
                        ${lang.translate(category.name.toLowerCase())}
                    </span>
                </div>
            `;
        });

        html += '</div>';

        container.innerHTML = html;
    }

    getIconForCategory(emoji, name) {
        // Map emojis and category names to Font Awesome icons
        const iconMap = {
            '🍔': 'fas fa-utensils',
            '🚗': 'fas fa-car',
            '💡': 'fas fa-file-invoice-dollar',
            '🛍️': 'fas fa-shopping-bag',
            '🏥': 'fas fa-hospital',
            '📚': 'fas fa-graduation-cap',
            '🏠': 'fas fa-home',
            '💰': 'fas fa-money-bill-wave',
            '📈': 'fas fa-chart-line',
            '➕': 'fas fa-plus-circle',
            '🎮': 'fas fa-gamepad',
            '☕': 'fas fa-coffee',
            '🎬': 'fas fa-film',
            '✈️': 'fas fa-plane',
            '🎁': 'fas fa-gift',
            '💊': 'fas fa-pills',
            '🔧': 'fas fa-tools',
            '💻': 'fas fa-laptop-code',
            '🎵': 'fas fa-music',
            '🎭': 'fas fa-theater-masks'
        };

        // Try to match by emoji first
        if (iconMap[emoji]) {
            return iconMap[emoji];
        }

        // Match by name as fallback
        const nameLower = name.toLowerCase();
        if (nameLower.includes('food')) return 'fas fa-utensils';
        if (nameLower.includes('transport')) return 'fas fa-car';
        if (nameLower.includes('bill')) return 'fas fa-file-invoice-dollar';
        if (nameLower.includes('shop')) return 'fas fa-shopping-bag';
        if (nameLower.includes('medical') || nameLower.includes('health')) return 'fas fa-hospital';
        if (nameLower.includes('education') || nameLower.includes('school')) return 'fas fa-graduation-cap';
        if (nameLower.includes('rent') || nameLower.includes('home')) return 'fas fa-home';
        if (nameLower.includes('salary') || nameLower.includes('income')) return 'fas fa-money-bill-wave';
        if (nameLower.includes('investment')) return 'fas fa-chart-line';
        if (nameLower.includes('freelance') || nameLower.includes('work')) return 'fas fa-laptop-code';
        if (nameLower.includes('entertainment') || nameLower.includes('fun')) return 'fas fa-theater-masks';
        if (nameLower.includes('game') || nameLower.includes('gaming')) return 'fas fa-gamepad';
        if (nameLower.includes('coffee') || nameLower.includes('cafe')) return 'fas fa-coffee';
        if (nameLower.includes('movie') || nameLower.includes('film')) return 'fas fa-film';
        if (nameLower.includes('travel') || nameLower.includes('trip')) return 'fas fa-plane';
        if (nameLower.includes('gift') || nameLower.includes('present')) return 'fas fa-gift';
        if (nameLower.includes('medicine') || nameLower.includes('pharmacy')) return 'fas fa-pills';
        if (nameLower.includes('repair') || nameLower.includes('maintenance')) return 'fas fa-tools';
        if (nameLower.includes('music') || nameLower.includes('concert')) return 'fas fa-music';

        return 'fas fa-circle'; // Default icon
    }

    setupCategoryEventListeners() {
        // Edit buttons (overlay buttons)
        const editButtons = document.querySelectorAll('.category-edit-btn-overlay');
        editButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering parent click
                const categoryId = parseInt(btn.getAttribute('data-category-id'));
                this.editCategory(categoryId);
            });
        });

        // Also handle old style edit buttons if they exist
        const oldEditButtons = document.querySelectorAll('.category-edit-btn');
        oldEditButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const categoryId = parseInt(btn.getAttribute('data-category-id'));
                this.editCategory(categoryId);
            });
        });

        // Delete button in modal
        const modalDeleteBtn = document.getElementById('delete-category-btn');
        if (modalDeleteBtn) {
            // Remove existing listeners
            const newDeleteBtn = modalDeleteBtn.cloneNode(true);
            modalDeleteBtn.parentNode.replaceChild(newDeleteBtn, modalDeleteBtn);

            newDeleteBtn.addEventListener('click', () => {
                const categoryId = document.getElementById('category-id').value;
                if (categoryId) {
                    this.confirmDeleteCategory(parseInt(categoryId));
                }
            });
        }
    }

    isDefaultCategory(name) {
        return this.defaultCategories.some(c => c.name === name);
    }

    getCategoryColor(categoryName) {
        const category = this.defaultCategories.find(c => c.name === categoryName);
        return category ? category.color : '#8E8E93';
    }

    getCategoryEmoji(categoryName) {
        // Use the robust icon matching logic from getIconForCategory
        return this.getIconForCategory(null, categoryName);
    }

    async editCategory(id) {
        const category = await this.getCategoryById(id);
        if (!category) return;

        // Open the category form modal in edit mode
        const modal = document.getElementById('category-form-modal');
        const title = document.getElementById('category-form-title');
        const iconSelect = document.getElementById('category-icon');
        const nameInput = document.getElementById('category-name');
        const typeSelect = document.getElementById('category-type');
        const idInput = document.getElementById('category-id');
        const deleteBtn = document.getElementById('delete-category-btn');

        if (modal && title && iconSelect && nameInput && typeSelect && idInput) {
            title.textContent = 'Edit Category';

            // Set icon - convert emoji to icon class if needed
            const iconClass = category.emoji.startsWith('fas ') ? category.emoji : this.getIconForCategory(category.emoji, category.name);
            iconSelect.value = iconClass;

            nameInput.value = category.name;
            typeSelect.value = category.type;
            idInput.value = category.id;

            // Show delete button in edit mode
            if (deleteBtn) {
                deleteBtn.style.display = 'flex';
            }

            // Don't close categories modal, just open form modal on top
            modal.classList.add('active');
        }
    }

    async confirmDeleteCategory(id) {
        const category = await this.getCategoryById(id);
        if (!category) return;

        const confirmed = await Utils.confirm(
            `This will permanently delete "${category.name}". Transactions using this category will not be affected.`,
            'Delete Category',
            'Delete'
        );

        if (confirmed) {
            try {
                await this.deleteCategory(id);
                Utils.showToast('Category deleted successfully');

                // Close the edit modal
                document.getElementById('category-form-modal').classList.remove('active');

                // Reopen the categories list modal
                const categoriesModal = document.getElementById('categories-modal');
                if (categoriesModal) {
                    categoriesModal.classList.add('active');
                }

                // Refresh the categories list
                await this.renderCategoriesList();

                // Refresh transaction modal category dropdown if it's open
                if (typeof categoryFormHandler !== 'undefined') {
                    categoryFormHandler.refreshTransactionCategoryDropdown();
                }
            } catch (error) {
                console.error('Error deleting category:', error);
                Utils.showToast('Error deleting category');
            }
        }
    }
}

// Create global categories manager instance
const categoriesManager = new CategoriesManager();

class CategoryFormHandler {
    constructor() {
        this.modal = null;
        this.form = null;
        this.isEditMode = false;
    }

    init() {
        this.modal = document.getElementById('category-form-modal');
        this.form = document.getElementById('category-form');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add Category button logic is handled in settings.js setupCategoryTabs
        // Do not add a duplicate listener here

        // Close modal button
        const closeBtn = document.getElementById('close-category-form-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancel-category-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        // Form submit
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Emoji picker buttons
        const emojiButtons = document.querySelectorAll('.emoji-btn');
        emojiButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const emoji = btn.getAttribute('data-emoji');
                const emojiInput = document.getElementById('category-emoji');
                if (emojiInput) {
                    emojiInput.value = emoji;
                }
            });
        });


    }

    openAddModal() {
        const title = document.getElementById('category-form-title');
        if (title) {
            title.textContent = 'Add Category';
        }

        this.isEditMode = false;
        this.resetForm();

        // Hide delete button in add mode
        const deleteBtn = document.getElementById('delete-category-btn');
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

        const idInput = document.getElementById('category-id');
        if (idInput) {
            idInput.value = '';
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        const iconSelect = document.getElementById('category-icon');
        const nameInput = document.getElementById('category-name');
        const typeSelect = document.getElementById('category-type');
        const idInput = document.getElementById('category-id');

        if (!iconSelect || !nameInput || !typeSelect) {
            Utils.showToast('Please fill all fields');
            return;
        }

        const categoryData = {
            emoji: iconSelect.value, // Store icon class as emoji
            name: nameInput.value.trim(),
            color: '#f6f8fa', // Fixed color for all categories
            type: typeSelect.value
        };

        // Validate
        if (!categoryData.emoji || !categoryData.name) {
            Utils.showToast('Please fill all required fields');
            return;
        }

        // Check for duplicate name
        const allCategories = await categoriesManager.getCategories();
        const categoryId = idInput ? idInput.value : null;

        const duplicate = allCategories.find(c =>
            c.name.toLowerCase() === categoryData.name.toLowerCase() &&
            (c.type === categoryData.type || c.type === 'both' || categoryData.type === 'both') &&
            (!categoryId || c.id !== parseInt(categoryId))
        );

        if (duplicate) {
            Utils.showToast('Category with this name already exists');
            return;
        }

        try {
            const categoryId = idInput ? idInput.value : null;

            if (categoryId) {
                // Edit mode
                await categoriesManager.updateCategory(parseInt(categoryId), categoryData);
                Utils.showToast('Category updated successfully');
            } else {
                // Add mode
                await categoriesManager.addCategory(categoryData);
                Utils.showToast('Category added successfully');
            }

            // Refresh the categories list
            await categoriesManager.renderCategoriesList();

            // Refresh transaction modal category dropdown if it's open
            // Pass the category name to auto-select it
            this.refreshTransactionCategoryDropdown(categoryData.name);

            // Close modal
            this.closeModal();

        } catch (error) {
            console.error('Error saving category:', error);
            Utils.showToast('Error saving category');
        }
    }

    refreshTransactionCategoryDropdown(selectedCategory = null) {
        // Check if transaction modal is open
        const transactionModal = document.getElementById('transaction-modal');
        if (transactionModal && transactionModal.classList.contains('active')) {
            // Get current transaction type
            const activeTypeBtn = document.querySelector('.type-btn.active');
            if (activeTypeBtn && typeof transactionsManager !== 'undefined') {
                const type = activeTypeBtn.dataset.type;
                transactionsManager.updateCategoryOptions(type, selectedCategory);
            }
        }
    }
}

// Initialize category form handler
const categoryFormHandler = new CategoryFormHandler();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    categoryFormHandler.init();
});