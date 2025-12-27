// ===================================
// App Lock Module
// ===================================

const AppLock = {
    pin: null,
    tempPin: null,
    currentPin: '',
    lockPin: '',
    isSettingPin: false,
    isChangingPin: false,

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.checkLockStatus();
    },

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('appLockSettings') || '{}');
        this.pin = settings.pin || null;
        const isEnabled = settings.enabled || false;

        // Update toggle state
        const toggle = document.getElementById('app-lock-toggle');
        if (toggle) {
            toggle.checked = isEnabled;
            this.updatePinStatus(isEnabled);
        }
    },

    saveSettings(enabled) {
        const settings = {
            pin: this.pin,
            enabled: enabled
        };
        localStorage.setItem('appLockSettings', JSON.stringify(settings));
    },

    setupEventListeners() {
        // Toggle switch
        const toggle = document.getElementById('app-lock-toggle');
        if (toggle) {
            toggle.addEventListener('change', (e) => this.handleToggle(e));
        }

        // Change PIN button
        const changePinBtn = document.getElementById('change-pin-btn');
        if (changePinBtn) {
            changePinBtn.addEventListener('click', () => this.openChangePinModal());
        }

        // PIN modal close
        const closePinModal = document.getElementById('close-pin-modal');
        if (closePinModal) {
            closePinModal.addEventListener('click', () => this.closePinModal());
        }

        // Forgot PIN button
        const forgotPinBtn = document.getElementById('forgot-pin-btn');
        if (forgotPinBtn) {
            forgotPinBtn.addEventListener('click', () => this.handleForgotPin());
        }

        // PIN keypad buttons
        this.setupKeypad('pin-modal', (key) => this.handlePinInput(key));
        this.setupKeypad('lock-screen', (key) => this.handleLockInput(key));
    },

    setupKeypad(containerId, callback) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const keys = container.querySelectorAll('.pin-key');
        keys.forEach(key => {
            key.addEventListener('click', () => {
                const keyValue = key.getAttribute('data-key');
                if (keyValue) {
                    callback(keyValue);
                }
            });
        });
    },

    handleToggle(e) {
        const isEnabled = e.target.checked;

        if (isEnabled) {
            // Enable lock - need to set PIN if not already set
            if (!this.pin) {
                this.openSetPinModal();
            } else {
                this.saveSettings(true);
                this.updatePinStatus(true);
                showToast('App lock enabled');
            }
        } else {
            // Disable lock
            this.saveSettings(false);
            this.updatePinStatus(false);
            showToast('App lock disabled');
        }
    },

    updatePinStatus(isEnabled) {
        const pinStatus = document.getElementById('pin-status');
        if (pinStatus) {
            if (isEnabled && this.pin) {
                pinStatus.classList.remove('hidden');
            } else {
                pinStatus.classList.add('hidden');
            }
        }
    },

    openSetPinModal() {
        this.isSettingPin = true;
        this.isChangingPin = false;
        this.currentPin = '';
        this.tempPin = null;

        const modal = document.getElementById('pin-modal');
        const title = document.getElementById('pin-modal-title');
        const instruction = document.getElementById('pin-instruction');

        if (modal && title && instruction) {
            title.textContent = 'Set PIN';
            instruction.textContent = 'Enter a 4-digit PIN';
            modal.classList.add('active');
            this.clearPinDots('pin-dot');
        }
    },

    openChangePinModal() {
        this.isChangingPin = true;
        this.isSettingPin = false;
        this.currentPin = '';
        this.tempPin = null;

        const modal = document.getElementById('pin-modal');
        const title = document.getElementById('pin-modal-title');
        const instruction = document.getElementById('pin-instruction');

        if (modal && title && instruction) {
            title.textContent = 'Change PIN';
            instruction.textContent = 'Enter current PIN';
            modal.classList.add('active');
            this.clearPinDots('pin-dot');
        }
    },

    closePinModal() {
        const modal = document.getElementById('pin-modal');
        if (modal) {
            modal.classList.remove('active');
        }

        // Reset toggle if PIN was not set
        if (!this.pin) {
            const toggle = document.getElementById('app-lock-toggle');
            if (toggle) {
                toggle.checked = false;
            }
        }

        this.currentPin = '';
        this.tempPin = null;
        this.isSettingPin = false;
        this.isChangingPin = false;
    },

    handlePinInput(key) {
        if (key === 'delete') {
            this.currentPin = this.currentPin.slice(0, -1);
        } else if (this.currentPin.length < 4) {
            this.currentPin += key;
        }

        this.updatePinDots('pin-dot', this.currentPin.length);

        // Check if PIN is complete
        if (this.currentPin.length === 4) {
            setTimeout(() => this.processPinInput(), 300);
        }
    },

    processPinInput() {
        console.log('Processing PIN input...', {
            isChangingPin: this.isChangingPin,
            isSettingPin: this.isSettingPin,
            tempPin: this.tempPin,
            currentPinLength: this.currentPin.length
        });

        if (this.isChangingPin) {
            if (!this.tempPin) {
                // First step: verify current PIN
                console.log('Step 1: Verifying current PIN');
                if (this.currentPin === this.pin) {
                    this.tempPin = 'verified';
                    this.currentPin = '';
                    const instruction = document.getElementById('pin-instruction');
                    if (instruction) {
                        instruction.textContent = 'Enter new 4-digit PIN';
                    }
                    this.clearPinDots('pin-dot');
                    console.log('Current PIN verified');
                } else {
                    console.log('Incorrect current PIN');
                    this.showToastMessage('Incorrect PIN');
                    this.currentPin = '';
                    this.clearPinDots('pin-dot');
                }
            } else if (this.tempPin === 'verified') {
                // Second step: enter new PIN
                console.log('Step 2: Setting new PIN');
                this.tempPin = this.currentPin;
                this.currentPin = '';
                const instruction = document.getElementById('pin-instruction');
                if (instruction) {
                    instruction.textContent = 'Confirm new PIN';
                }
                this.clearPinDots('pin-dot');
                console.log('New PIN set, waiting for confirmation');
            } else {
                // Third step: confirm new PIN
                console.log('Step 3: Confirming new PIN', {
                    currentPin: this.currentPin,
                    tempPin: this.tempPin,
                    match: this.currentPin === this.tempPin
                });
                if (this.currentPin === this.tempPin) {
                    this.pin = this.currentPin;
                    this.saveSettings(true);
                    this.showToastMessage('PIN changed successfully');
                    this.closePinModal();
                    console.log('PIN changed successfully');
                } else {
                    console.log('PINs do not match');
                    this.showToastMessage('PINs do not match. Try again.');
                    this.tempPin = 'verified';
                    this.currentPin = '';
                    const instruction = document.getElementById('pin-instruction');
                    if (instruction) {
                        instruction.textContent = 'Enter new 4-digit PIN';
                    }
                    this.clearPinDots('pin-dot');
                }
            }
        } else if (this.isSettingPin) {
            if (!this.tempPin) {
                // First entry
                console.log('Setting PIN - First entry');
                this.tempPin = this.currentPin;
                this.currentPin = '';
                const instruction = document.getElementById('pin-instruction');
                if (instruction) {
                    instruction.textContent = 'Confirm your PIN';
                }
                this.clearPinDots('pin-dot');
                console.log('PIN entered, waiting for confirmation');
            } else {
                // Confirmation
                console.log('Setting PIN - Confirmation', {
                    currentPin: this.currentPin,
                    tempPin: this.tempPin,
                    match: this.currentPin === this.tempPin
                });
                if (this.currentPin === this.tempPin) {
                    this.pin = this.currentPin;
                    this.saveSettings(true);
                    this.updatePinStatus(true);
                    this.showToastMessage('PIN set successfully');
                    this.closePinModal();
                    console.log('PIN set successfully');
                } else {
                    console.log('PINs do not match');
                    this.showToastMessage('PINs do not match. Try again.');
                    this.tempPin = null;
                    this.currentPin = '';
                    const instruction = document.getElementById('pin-instruction');
                    if (instruction) {
                        instruction.textContent = 'Enter a 4-digit PIN';
                    }
                    this.clearPinDots('pin-dot');
                }
            }
        }
    },

    handleLockInput(key) {
        if (key === 'delete') {
            this.lockPin = this.lockPin.slice(0, -1);
        } else if (this.lockPin.length < 4) {
            this.lockPin += key;
        }

        this.updatePinDots('lock-pin-dot', this.lockPin.length);

        // Check if PIN is complete
        if (this.lockPin.length === 4) {
            setTimeout(() => this.verifyLockPin(), 300);
        }
    },

    verifyLockPin() {
        if (this.lockPin === this.pin) {
            this.unlockApp();
        } else {
            this.showLockError();
            this.lockPin = '';
            this.clearPinDots('lock-pin-dot');
        }
    },

    showLockError() {
        const errorMsg = document.getElementById('lock-error');
        if (errorMsg) {
            errorMsg.classList.remove('hidden');
            setTimeout(() => {
                errorMsg.classList.add('hidden');
            }, 2000);
        }
    },

    updatePinDots(prefix, count) {
        for (let i = 1; i <= 4; i++) {
            const dot = document.getElementById(`${prefix}-${i}`);
            if (dot) {
                if (i <= count) {
                    dot.classList.add('filled');
                } else {
                    dot.classList.remove('filled');
                }
            }
        }
    },

    clearPinDots(prefix) {
        this.updatePinDots(prefix, 0);
    },

    checkLockStatus() {
        const settings = JSON.parse(localStorage.getItem('appLockSettings') || '{}');
        if (settings.enabled && settings.pin) {
            this.showLockScreen();
        }
    },

    showLockScreen() {
        const lockScreen = document.getElementById('lock-screen');
        if (lockScreen) {
            lockScreen.classList.remove('hidden');
            this.lockPin = '';
            this.clearPinDots('lock-pin-dot');
        }
    },

    unlockApp() {
        const lockScreen = document.getElementById('lock-screen');
        if (lockScreen) {
            lockScreen.classList.add('hidden');
        }
        this.lockPin = '';
        this.showToastMessage('App unlocked');
    },

    showToastMessage(message) {
        // Check if showToast function exists (from utils.js)
        if (typeof showToast === 'function') {
            showToast(message);
        } else {
            // Fallback: use alert or console
            console.log('Toast:', message);
            // Simple toast implementation
            const toast = document.getElementById('toast');
            if (toast) {
                toast.textContent = message;
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
            }
        }
    },

    async handleForgotPin() {
        const confirmed = await Utils.confirm(
            'This will disable app lock and clear your PIN. You can set a new PIN later in Settings.',
            'Reset PIN',
            'Reset'
        );

        if (confirmed) {
            // Clear PIN and disable lock
            this.pin = null;
            this.saveSettings(false);

            // Update UI
            const toggle = document.getElementById('app-lock-toggle');
            if (toggle) {
                toggle.checked = false;
            }
            this.updatePinStatus(false);

            // Unlock and close
            this.unlockApp();
            this.showToastMessage('PIN reset successfully. App lock disabled.');

            console.log('PIN reset by user');
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    AppLock.init();
});
