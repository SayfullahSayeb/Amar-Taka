// ===================================
// Export/Import Manager
// ===================================

class ExportManager {
    async init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Export JSON (Backup)
        document.getElementById('export-json-btn').addEventListener('click', () => {
            this.exportJSON();
        });

        // Import (Restore)
        document.getElementById('import-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            this.handleImport(e);
        });
    }

    async exportJSON() {
        try {
            const data = await db.exportData();
            const jsonString = JSON.stringify(data, null, 2);
            const filename = `finance-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;

            Utils.downloadFile(jsonString, filename, 'application/json');
            Utils.showToast(lang.translate('dataExported'));
        } catch (error) {
            console.error('Export error:', error);
            Utils.showToast('Error exporting data');
        }
    }

    async exportCSV() {
        try {
            const transactions = await db.getAll('transactions');
            const csvContent = Utils.exportToCSV(transactions);
            const filename = `finance-tracker-transactions-${new Date().toISOString().split('T')[0]}.csv`;

            Utils.downloadFile(csvContent, filename, 'text/csv');
            Utils.showToast(lang.translate('dataExported'));
        } catch (error) {
            console.error('Export error:', error);
            Utils.showToast('Error exporting data');
        }
    }

    async handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Validate data structure
                if (!data.transactions && !data.categories && !data.settings) {
                    Utils.showToast('Invalid backup file format');
                    return;
                }

                // Confirm import
                const confirmed = await Utils.confirm(lang.translate('dataResetConfirm'), 'Restore Data', 'Restore');
                if (!confirmed) {
                    return;
                }

                const success = await db.importData(data);

                if (success) {
                    Utils.showToast(lang.translate('dataImported'));

                    // Reload the app
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    Utils.showToast('Error importing data');
                }
            } catch (error) {
                console.error('Import error:', error);
                Utils.showToast('Error importing data - Invalid file format');
            }
        };

        reader.readAsText(file);

        // Reset file input
        event.target.value = '';
    }
}

// Create global export manager instance
const exportManager = new ExportManager();
