// PWA Install Banner Manager
class PWABannerManager {
    constructor() {
        this.banner = null;
        this.installBtn = null;
        this.closeBtn = null;
        this.deferredPrompt = null;
        this.dismissedKey = 'pwa-banner-dismissed';
        this.dismissedTimeKey = 'pwa-banner-dismissed-time';
    }

    init() {
        // Don't show banner if already in PWA mode
        if (this.isInPWA()) {
            return;
        }

        // Check if banner was dismissed recently (within 24 hours)
        if (this.wasRecentlyDismissed()) {
            return;
        }

        this.banner = document.getElementById('pwa-install-banner');
        this.installBtn = document.getElementById('pwa-install-btn');
        this.closeBtn = document.getElementById('pwa-banner-close');

        if (!this.banner || !this.installBtn || !this.closeBtn) {
            return;
        }

        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Save the event for later use
            this.deferredPrompt = e;
            // Show the banner
            this.showBanner();
        });

        // Setup event listeners
        this.setupEventListeners();

        // For browsers that don't support beforeinstallprompt (like iOS Safari)
        // Show banner if not already installed
        if (!this.deferredPrompt && !this.isInstalled()) {
            setTimeout(() => {
                this.showBanner();
            }, 3000); // Show after 3 seconds
        }

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            this.hideBanner();
            console.log('PWA was installed');
        });
    }

    isInPWA() {
        // Check if running in standalone mode (PWA)
        return window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://');
    }

    isInstalled() {
        // Check if app is already installed
        return window.matchMedia('(display-mode: standalone)').matches;
    }

    wasRecentlyDismissed() {
        const dismissedTime = localStorage.getItem(this.dismissedTimeKey);
        if (!dismissedTime) {
            return false;
        }

        const now = Date.now();
        const timeSinceDismissed = now - parseInt(dismissedTime);
        const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        return timeSinceDismissed < twentyFourHours;
    }

    showBanner() {
        if (this.banner) {
            this.banner.style.display = 'block';
        }
    }

    hideBanner() {
        if (this.banner) {
            this.banner.style.display = 'none';
        }
    }

    setupEventListeners() {
        // Install button click
        this.installBtn.addEventListener('click', async () => {
            if (!this.deferredPrompt) {
                // For browsers that don't support install prompt (like iOS)
                this.showIOSInstructions();
                return;
            }

            // Show the install prompt
            this.deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            const { outcome } = await this.deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }

            // Clear the deferredPrompt
            this.deferredPrompt = null;
            this.hideBanner();
        });

        // Close button click
        this.closeBtn.addEventListener('click', () => {
            this.hideBanner();
            // Save dismissal time
            localStorage.setItem(this.dismissedTimeKey, Date.now().toString());
        });
    }

    showIOSInstructions() {
        // Check if iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        if (isIOS) {
            alert('To install this app on your iOS device:\n\n1. Tap the Share button\n2. Select "Add to Home Screen"\n3. Tap "Add"');
        } else {
            alert('To install this app:\n\nLook for the install icon in your browser\'s address bar or menu.');
        }

        this.hideBanner();
        localStorage.setItem(this.dismissedTimeKey, Date.now().toString());
    }
}

// Create and initialize the PWA banner manager
const pwaBannerManager = new PWABannerManager();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        pwaBannerManager.init();
    });
} else {
    pwaBannerManager.init();
}
