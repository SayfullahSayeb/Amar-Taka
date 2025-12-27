// ===================================
// Bilingual Language Support System
// ===================================

const translations = {
    en: {
        // Navigation
        home: 'Home',
        transactions: 'Transactions',
        analysis: 'Analysis',
        settings: 'Settings',

        // Home Page
        todayExpense: "Today's Expense",
        monthlyExpense: 'This Month',
        incomeVsExpense: 'Income vs Expense',
        income: 'Income',
        expense: 'Expense',
        savings: 'Savings',
        monthlyBudget: 'Monthly Budget',
        setBudget: 'Set Budget',
        noBudgetSet: 'No budget set',

        // Transactions
        addTransaction: 'Add Transaction',
        editTransaction: 'Edit Transaction',
        searchTransactions: 'Search transactions...',
        all: 'All',
        newest: 'Newest',
        oldest: 'Oldest',
        highest: 'Highest',
        lowest: 'Lowest',
        type: 'Type',
        amount: 'Amount',
        category: 'Category',
        paymentMethod: 'Payment Method',
        date: 'Date',
        note: 'Note (Optional)',

        // Payment Methods
        cash: 'Cash',
        card: 'Card',
        mobileBanking: 'Mobile Banking',
        bank: 'Bank',

        // Categories
        food: 'Food',
        transport: 'Transport',
        bills: 'Bills',
        shopping: 'Shopping',
        medical: 'Medical',
        education: 'Education',
        rent: 'Rent',
        salary: 'Salary',
        investment: 'Investment',
        others: 'Others',
        manageCategories: 'Manage Categories',
        addCategory: 'Add Category',

        // Analysis
        weekly: 'Weekly',
        monthly: 'Monthly',
        yearly: 'Yearly',
        expenseTrend: 'Expense Trend',
        categoryBreakdown: 'Category Breakdown',
        insights: 'Insights',
        avgDaily: 'Daily Average',
        highestCategory: 'Top Category',

        // Settings
        language: 'Language',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
        currency: 'Currency',
        dataManagement: 'Data Management',
        exportJSON: 'Export as JSON',
        exportCSV: 'Export as CSV',
        importData: 'Import Data',
        resetData: 'Reset All Data',
        about: 'About',
        appDescription: 'Professional Finance Expense Tracker - Offline-first web application for managing your finances.',

        // Buttons
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',

        // Messages
        noTransactions: 'No transactions yet',
        addFirstTransaction: 'Add your first transaction to get started!',
        budgetWarning: 'You are approaching your budget limit!',
        budgetExceeded: 'Budget exceeded!',
        dataResetConfirm: 'Are you sure you want to reset all data? This action cannot be undone.',
        dataExported: 'Data exported successfully!',
        dataImported: 'Data imported successfully!',
        transactionAdded: 'Transaction added!',
        transactionUpdated: 'Transaction updated!',
        transactionDeleted: 'Transaction deleted!',
        budgetSet: 'Budget set successfully!',
        categoryAdded: 'Category added!',

        // Motivational Messages
        motivational: {
            goodSpending: 'Great! You controlled your spending today!',
            highSpending: 'You spent a lot today. Try to save more!',
            noExpense: 'No expenses today. Keep it up!',
            savingWell: 'Excellent! You are saving well this month!',
            overspending: 'Warning! You are overspending this month.',
        },

        // Insights
        insightIncrease: 'increased',
        insightDecrease: 'decreased',
        insightThisMonth: 'this month',
        insightComparedToLast: 'compared to last month',

        // Budget
        setMonthlyBudget: 'Set Monthly Budget',
        budgetAmount: 'Budget Amount',
        remaining: 'Remaining',
        spent: 'Spent',
    },

    bn: {
        // Navigation
        home: 'হোম',
        transactions: 'লেনদেন',
        analysis: 'বিশ্লেষণ',
        settings: 'সেটিংস',

        // Home Page
        todayExpense: 'আজকের খরচ',
        monthlyExpense: 'এই মাসে',
        incomeVsExpense: 'আয় বনাম খরচ',
        income: 'আয়',
        expense: 'খরচ',
        savings: 'সঞ্চয়',
        monthlyBudget: 'মাসিক বাজেট',
        setBudget: 'বাজেট সেট করুন',
        noBudgetSet: 'কোন বাজেট সেট করা হয়নি',

        // Transactions
        addTransaction: 'লেনদেন যোগ করুন',
        editTransaction: 'লেনদেন সম্পাদনা করুন',
        searchTransactions: 'লেনদেন খুঁজুন...',
        all: 'সব',
        newest: 'নতুন',
        oldest: 'পুরাতন',
        highest: 'সর্বোচ্চ',
        lowest: 'সর্বনিম্ন',
        type: 'ধরন',
        amount: 'পরিমাণ',
        category: 'বিভাগ',
        paymentMethod: 'পেমেন্ট পদ্ধতি',
        date: 'তারিখ',
        note: 'নোট (ঐচ্ছিক)',

        // Payment Methods
        cash: 'নগদ',
        card: 'কার্ড',
        mobileBanking: 'মোবাইল ব্যাংকিং',
        bank: 'ব্যাংক',

        // Categories
        food: 'খাবার',
        transport: 'যাতায়াত',
        bills: 'বিল',
        shopping: 'কেনাকাটা',
        medical: 'চিকিৎসা',
        education: 'শিক্ষা',
        rent: 'ভাড়া',
        salary: 'বেতন',
        investment: 'বিনিয়োগ',
        others: 'অন্যান্য',
        manageCategories: 'বিভাগ পরিচালনা করুন',
        addCategory: 'বিভাগ যোগ করুন',

        // Analysis
        weekly: 'সাপ্তাহিক',
        monthly: 'মাসিক',
        yearly: 'বার্ষিক',
        expenseTrend: 'খরচের প্রবণতা',
        categoryBreakdown: 'বিভাগ অনুযায়ী',
        insights: 'অন্তর্দৃষ্টি',
        avgDaily: 'দৈনিক গড়',
        highestCategory: 'শীর্ষ বিভাগ',

        // Settings
        language: 'ভাষা',
        theme: 'থিম',
        light: 'হালকা',
        dark: 'অন্ধকার',
        system: 'সিস্টেম',
        currency: 'মুদ্রা',
        dataManagement: 'ডেটা ব্যবস্থাপনা',
        exportJSON: 'JSON হিসাবে রপ্তানি করুন',
        exportCSV: 'CSV হিসাবে রপ্তানি করুন',
        importData: 'ডেটা আমদানি করুন',
        resetData: 'সমস্ত ডেটা রিসেট করুন',
        about: 'সম্পর্কে',
        appDescription: 'পেশাদার ফিন্যান্স এক্সপেন্স ট্র্যাকার - আপনার আর্থিক ব্যবস্থাপনার জন্য অফলাইন-প্রথম ওয়েব অ্যাপ্লিকেশন।',

        // Buttons
        save: 'সংরক্ষণ করুন',
        cancel: 'বাতিল করুন',
        delete: 'মুছুন',
        edit: 'সম্পাদনা করুন',

        // Messages
        noTransactions: 'এখনও কোন লেনদেন নেই',
        addFirstTransaction: 'শুরু করতে আপনার প্রথম লেনদেন যোগ করুন!',
        budgetWarning: 'আপনি আপনার বাজেট সীমার কাছাকাছি!',
        budgetExceeded: 'বাজেট অতিক্রম করেছে!',
        dataResetConfirm: 'আপনি কি নিশ্চিত যে আপনি সমস্ত ডেটা রিসেট করতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
        dataExported: 'ডেটা সফলভাবে রপ্তানি করা হয়েছে!',
        dataImported: 'ডেটা সফলভাবে আমদানি করা হয়েছে!',
        transactionAdded: 'লেনদেন যোগ করা হয়েছে!',
        transactionUpdated: 'লেনদেন আপডেট করা হয়েছে!',
        transactionDeleted: 'লেনদেন মুছে ফেলা হয়েছে!',
        budgetSet: 'বাজেট সফলভাবে সেট করা হয়েছে!',
        categoryAdded: 'বিভাগ যোগ করা হয়েছে!',

        // Motivational Messages
        motivational: {
            goodSpending: 'দুর্দান্ত! আপনি আজ আপনার খরচ নিয়ন্ত্রণ করেছেন!',
            highSpending: 'আজ অনেক খরচ হয়েছে। আরও সঞ্চয় করার চেষ্টা করুন!',
            noExpense: 'আজ কোন খরচ নেই। এভাবে চালিয়ে যান!',
            savingWell: 'চমৎকার! আপনি এই মাসে ভালো সঞ্চয় করছেন!',
            overspending: 'সতর্কতা! আপনি এই মাসে অতিরিক্ত খরচ করছেন।',
        },

        // Insights
        insightIncrease: 'বৃদ্ধি পেয়েছে',
        insightDecrease: 'হ্রাস পেয়েছে',
        insightThisMonth: 'এই মাসে',
        insightComparedToLast: 'গত মাসের তুলনায়',

        // Budget
        setMonthlyBudget: 'মাসিক বাজেট সেট করুন',
        budgetAmount: 'বাজেট পরিমাণ',
        remaining: 'অবশিষ্ট',
        spent: 'খরচ হয়েছে',
    }
};

class LanguageManager {
    constructor() {
        this.currentLang = 'en';
    }

    async init() {
        // Load saved language preference
        const savedLang = await db.getSetting('language');
        if (savedLang) {
            this.currentLang = savedLang;
        }
        this.updateUI();
    }

    translate(key) {
        const keys = key.split('.');
        let value = translations[this.currentLang];

        for (const k of keys) {
            value = value[k];
            if (!value) {
                return key; // Return key if translation not found
            }
        }

        return value;
    }

    async setLanguage(lang) {
        this.currentLang = lang;
        await db.setSetting('language', lang);
        this.updateUI();
    }

    updateUI() {
        // Update all elements with data-lang attribute
        document.querySelectorAll('[data-lang]').forEach(element => {
            const key = element.getAttribute('data-lang');
            const translation = this.translate(key);

            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-lang-placeholder]').forEach(element => {
            const key = element.getAttribute('data-lang-placeholder');
            element.placeholder = this.translate(key);
        });

        // Update select options
        document.querySelectorAll('option[data-lang]').forEach(option => {
            const key = option.getAttribute('data-lang');
            option.textContent = this.translate(key);
        });
    }

    getCurrentLanguage() {
        return this.currentLang;
    }
}

// Create global language manager instance
const lang = new LanguageManager();
