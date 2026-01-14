class NavigationManager {
    constructor() {
        this.currentPage = 'home';
        this.isNavigating = false;
        this.initialized = false;
        this.navHandlers = new Map(); // Track event handlers to prevent duplicates
        this.backPressTime = 0; // Track time of last back press
        this.backPressTimeout = 2000; // 2 seconds window for double back press
        this.isProgrammaticNavigation = false; // Track if navigation is programmatic
    }

    init() {
        if (this.initialized) {
            return;
        }

        this.setupNavigation();
        this.setupHashListener();
        this.setupBackButtonHandler(); // Add back button handler
        this.initialized = true;

        // Navigate to initial page
        const initialHash = window.location.hash.slice(1);
        const initialPage = this.isValidPage(initialHash) ? initialHash : 'home';
        this.navigateTo(initialPage, false);
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            // Remove any existing listeners first
            const oldHandler = this.navHandlers.get(item);
            if (oldHandler) {
                item.removeEventListener('click', oldHandler);
            }

            // Create new handler
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();

                const page = e.currentTarget.dataset.page;

                if (page && this.isValidPage(page)) {
                    this.navigateTo(page);
                }
            };

            // Store handler reference
            this.navHandlers.set(item, handler);

            // Add listener (removed capture phase to not interfere with other buttons)
            item.addEventListener('click', handler);
        });

        // Setup page navigation buttons (Transactions <-> Analysis)
        this.setupPageButtons();
    }

    setupPageButtons() {
        const gotoAnalysisBtn = document.getElementById('goto-analysis-btn');
        if (gotoAnalysisBtn) {
            // Remove old listener if exists
            const oldHandler = this.navHandlers.get('goto-analysis');
            if (oldHandler) {
                gotoAnalysisBtn.removeEventListener('click', oldHandler);
            }

            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.navigateTo('analysis');
            };

            this.navHandlers.set('goto-analysis', handler);
            gotoAnalysisBtn.addEventListener('click', handler);
        }

        const gotoTransactionsBtn = document.getElementById('goto-transactions-btn');
        if (gotoTransactionsBtn) {
            // Remove old listener if exists
            const oldHandler = this.navHandlers.get('goto-transactions');
            if (oldHandler) {
                gotoTransactionsBtn.removeEventListener('click', oldHandler);
            }

            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.navigateTo('transactions');
            };

            this.navHandlers.set('goto-transactions', handler);
            gotoTransactionsBtn.addEventListener('click', handler);
        }
    }

    setupHashListener() {
        // Remove any existing hashchange listeners
        if (this.hashChangeHandler) {
            window.removeEventListener('hashchange', this.hashChangeHandler);
        }

        this.hashChangeHandler = () => {
            const hash = window.location.hash.slice(1);
            const page = this.isValidPage(hash) ? hash : 'home';
            this.navigateTo(page, false);
        };

        window.addEventListener('hashchange', this.hashChangeHandler);
    }

    setupBackButtonHandler() {
        // Handle popstate (back button) event
        window.addEventListener('popstate', (event) => {
            // Ignore if this is a programmatic navigation
            if (this.isProgrammaticNavigation) {
                this.isProgrammaticNavigation = false;
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
                    // First back press on home - show toast and prepare for exit
                    this.showExitToast();
                    this.backPressTime = currentTime;
                    // Push state back to prevent actual navigation
                    window.history.pushState({ page: 'home' }, '', '#home');
                }
            } else {
                // User is on any other page - navigate to home
                this.navigateTo('home');
                this.backPressTime = 0; // Reset back press timer
            }
        });
    }

    showExitToast() {
        // Create or update exit toast
        let toast = document.getElementById('exit-toast');

        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'exit-toast';
            toast.className = 'exit-toast';
            toast.textContent = lang.translate('pressBackAgainToExit') || 'Press back again to exit';
            document.body.appendChild(toast);
        }

        // Show toast
        toast.classList.add('show');

        // Hide toast after timeout
        setTimeout(() => {
            toast.classList.remove('show');
        }, this.backPressTimeout);
    }

    exitApp() {
        // Try to close the app (works in PWA mode)
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

        // Fallback: If window.close() doesn't work (browser restrictions)
        setTimeout(() => {
            // Show a message that the app cannot be closed
            const toast = document.getElementById('exit-toast');
            if (toast) {
                toast.textContent = lang.translate('cannotCloseApp') || 'Cannot close app. Please close manually.';
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 3000);
            }
        }, 100);
    }


    isValidPage(page) {
        const validPages = ['home', 'transactions', 'analysis', 'goals', 'settings'];
        return validPages.includes(page);
    }

    async navigateTo(pageName, updateHash = true) {
        // Prevent multiple simultaneous navigations
        if (this.isNavigating) {
            return;
        }

        // Validate page name
        if (!this.isValidPage(pageName)) {
            return;
        }

        // Don't navigate if already on the page
        if (this.currentPage === pageName && !updateHash) {
            return;
        }

        this.isNavigating = true;

        try {
            // Scroll to top immediately
            window.scrollTo(0, 0);

            // Update URL hash if needed
            if (updateHash) {
                this.isProgrammaticNavigation = true;
                window.location.hash = pageName;
            }

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

            // Update current page
            this.currentPage = pageName;

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
