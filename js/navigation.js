class NavigationManager {
    constructor() {
        this.currentPage = 'home';
        this.isNavigating = false;
        this.initialized = false;
        this.backPressTime = 0;
        this.backPressTimeout = 2000;
    }

    init() {
        if (this.initialized) {
            return;
        }

        this.setupNavigation();
        this.setupHashListener();
        this.setupBackButtonHandler();
        this.setupModalObserver();
        this.initialized = true;

        // Navigate to initial page
        const initialHash = window.location.hash.slice(1);
        const initialPage = this.isValidPage(initialHash) ? initialHash : 'home';
        this.navigateTo(initialPage, false);
    }

    setupNavigation() {
        // Use event delegation on the bottom nav container
        const bottomNav = document.querySelector('.bottom-nav');

        if (bottomNav) {
            // Remove old listener if exists
            if (this.navClickHandler) {
                bottomNav.removeEventListener('click', this.navClickHandler);
            }

            // Create delegated click handler
            this.navClickHandler = (e) => {
                // Find the closest nav-item (in case user clicks on icon or span inside)
                const navItem = e.target.closest('.nav-item');

                if (navItem && navItem.dataset.page) {
                    e.preventDefault();
                    e.stopPropagation();

                    const page = navItem.dataset.page;

                    if (page && this.isValidPage(page)) {
                        this.navigateTo(page, true);
                    }
                }
            };

            // Add single delegated listener to the container
            bottomNav.addEventListener('click', this.navClickHandler);
        }

        // Setup page navigation buttons (Transactions <-> Analysis)
        this.setupPageButtons();
    }

    setupPageButtons() {
        // Use event delegation on document for page navigation buttons
        // Remove old listeners if they exist
        if (this.pageButtonsHandler) {
            document.removeEventListener('click', this.pageButtonsHandler);
        }

        this.pageButtonsHandler = (e) => {
            const target = e.target.closest('#goto-analysis-btn, #goto-transactions-btn');

            if (target) {
                e.preventDefault();
                e.stopPropagation();

                if (target.id === 'goto-analysis-btn') {
                    this.navigateTo('analysis', true);
                } else if (target.id === 'goto-transactions-btn') {
                    this.navigateTo('transactions', true);
                }
            }
        };

        document.addEventListener('click', this.pageButtonsHandler);
    }

    setupHashListener() {
        // Remove any existing hashchange listeners
        if (this.hashChangeHandler) {
            window.removeEventListener('hashchange', this.hashChangeHandler);
        }

        this.hashChangeHandler = () => {
            // Ignore hashchange if we're currently navigating (we set the hash ourselves)
            if (this.isNavigating) {
                return;
            }

            const hash = window.location.hash.slice(1);
            const page = this.isValidPage(hash) ? hash : 'home';
            this.navigateTo(page, false);
        };

        window.addEventListener('hashchange', this.hashChangeHandler);
    }

    setupBackButtonHandler() {
        // Handle popstate (back button) event
        window.addEventListener('popstate', (event) => {
            // First, check if any modal is open
            const openModal = document.querySelector('.modal.active');
            if (openModal) {
                // Close the modal instead of navigating
                this.closeAllModals();
                // Push state back to prevent actual navigation
                window.history.pushState({ page: this.currentPage }, '', `#${this.currentPage}`);
                return;
            }

            const currentTime = Date.now();

            // If user is on home page
            if (this.currentPage === 'home') {
                // Check if this is a second back press within timeout window
                if (currentTime - this.backPressTime < this.backPressTimeout) {
                    // Second back press on home - exit app
                    this.exitApp();
                } else {
                    // First back press on home - prepare for exit (no toast)
                    this.backPressTime = currentTime;
                    // Push state back to prevent actual navigation
                    window.history.pushState({ page: 'home' }, '', '#home');
                }
            } else {
                // User is on any other page - navigate to home
                this.navigateTo('home', true);
                this.backPressTime = 0; // Reset back press timer
            }
        });
    }

    setupModalObserver() {
        // Watch for modals being opened
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('modal') && target.classList.contains('active')) {
                        // Modal was just opened - push a history state
                        window.history.pushState({ modal: true, page: this.currentPage }, '', `#${this.currentPage}`);
                    }
                }
            });
        });

        // Observe all modals
        document.querySelectorAll('.modal').forEach(modal => {
            observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
        });
    }

    async exitApp() {
        // Show confirmation dialog
        const confirmed = await Utils.confirm(
            'Do you really want to exit the app?',
            'Exit App',
            'Exit'
        );

        if (!confirmed) {
            // User cancelled - push state back to stay in app
            window.history.pushState({ page: 'home' }, '', '#home');
            return;
        }

        // User confirmed - close the app
        if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
            // PWA mode - close the window
            window.close();
        } else {
            // Browser mode - try to close or navigate away
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.close();
            }
        }
    }


    isValidPage(page) {
        const validPages = ['home', 'transactions', 'analysis', 'goals', 'settings'];
        return validPages.includes(page);
    }

    async navigateTo(pageName, updateHash = false) {
        // Prevent multiple simultaneous navigations
        if (this.isNavigating) {
            return;
        }

        // Validate page name
        if (!this.isValidPage(pageName)) {
            return;
        }

        // Don't navigate if already on the page
        if (this.currentPage === pageName) {
            return;
        }

        this.isNavigating = true;

        try {
            // Update current page FIRST before any async operations
            this.currentPage = pageName;

            // Update URL hash if needed (do this BEFORE showing page to avoid flash)
            if (updateHash) {
                // Use pushState to create a history entry for back button
                window.history.pushState({ page: pageName }, '', `#${pageName}`);
            }

            // Scroll to top immediately
            window.scrollTo(0, 0);

            // Close all modals
            this.closeAllModals();

            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });

            // Show selected page
            const selectedPage = document.getElementById(`${pageName}-page`);
            if (selectedPage) {
                selectedPage.scrollTop = 0;
                selectedPage.classList.add('active');
            }

            // Update navigation active state
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.page === pageName) {
                    item.classList.add('active');
                }
            });

            // Render page content
            await this.renderPageContent(pageName);

        } catch (error) {
            console.error('Navigation error:', error);
        } finally {
            // Always release the navigation lock
            this.isNavigating = false;
        }
    }

    async renderPageContent(pageName) {
        try {
            switch (pageName) {
                case 'home':
                    if (typeof homeManager !== 'undefined' && homeManager.render) {
                        await homeManager.render();
                    }
                    break;
                case 'transactions':
                    if (typeof transactionsManager !== 'undefined' && transactionsManager.render) {
                        await transactionsManager.render();
                    }
                    break;
                case 'analysis':
                    if (typeof analysisManager !== 'undefined' && analysisManager.render) {
                        await analysisManager.render();
                    }
                    break;
                case 'goals':
                    if (typeof goalsManager !== 'undefined' && goalsManager.loadGoals) {
                        await goalsManager.loadGoals();
                    }
                    break;
                case 'settings':
                    // Settings are already loaded
                    break;
            }
        } catch (error) {
            console.error(`Error rendering ${pageName}:`, error);
        }
    }

    closeAllModals() {
        // Close all modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });

        // Remove any modal backdrops
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.remove();
        });

        // Reset body overflow
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');

        // Clear any confirm dialogs
        const confirmModal = document.getElementById('confirm-modal');
        if (confirmModal) {
            confirmModal.classList.remove('active');
        }
    }

    // Public method to get current page
    getCurrentPage() {
        return this.currentPage;
    }

    // Public method to force re-render current page
    async refreshCurrentPage() {
        await this.renderPageContent(this.currentPage);
    }
}

// Create global navigation manager instance
const navigationManager = new NavigationManager();
