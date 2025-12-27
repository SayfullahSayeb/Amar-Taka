# Finance Expense Tracker Web App

A professional, offline-first finance tracking application with bilingual support (English/Bangla) and Apple iOS-inspired design.

## Features

### 📊 Dashboard
- Today's expense tracking
- Monthly expense summary
- Income vs Expense comparison
- Savings indicator with progress bar
- Monthly budget tracking with warnings
- Motivational messages based on spending patterns

### 💰 Transactions
- Add income and expense transactions
- Edit and delete transactions
- Search and filter functionality
- Category-based organization
- Payment method tracking
- Notes and date support
- Beautiful card-based UI

### 📈 Analysis & Reports
- Interactive charts (Bar & Doughnut)
- Weekly, Monthly, and Yearly views
- Category-wise breakdown
- Spending insights and comparisons
- Daily average calculations
- Top spending category identification

### 🏷️ Categories
- 10 default categories with emojis
- Custom category creation
- Color-coded categories
- Support for both income and expense

### 💵 Budget Management
- Set monthly budget
- Visual progress tracking
- Warning system for overspending
- Budget vs actual comparison

### 💾 Export & Import
- Export data as JSON (full backup)
- Export transactions as CSV
- Import from backup
- Data validation on import

### ⚙️ Settings
- Language toggle (English/Bangla)
- Theme switcher (Light/Dark/System)
- Currency selector (BDT/USD/EUR/INR)
- Category management
- Data reset option

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Apple iOS-inspired design with CSS variables
- **JavaScript (ES6+)** - Modular architecture
- **IndexedDB** - Offline-first data storage
- **Chart.js** - Beautiful, responsive charts
- **Font Awesome** - Icon library

## Installation

1. Download or clone this repository
2. Open `index.html` in a modern web browser
3. That's it! No server or build process required

## Usage

### First Time Setup
1. The app will automatically initialize with default categories
2. Choose your preferred language (English or বাংলা)
3. Select your currency
4. Set a monthly budget (optional)

### Adding Transactions
1. Click the **+** button on the home page or transactions page
2. Select transaction type (Income or Expense)
3. Enter amount, category, payment method, and date
4. Add optional notes
5. Click Save

### Viewing Analysis
1. Navigate to the Analysis tab
2. Switch between Weekly, Monthly, or Yearly views
3. View charts and insights
4. Check your top spending categories

### Managing Data
1. Go to Settings
2. Export your data as JSON or CSV
3. Import from a previous backup
4. Reset all data if needed

## Offline Functionality

This app is designed to work completely offline:
- All data is stored locally in IndexedDB
- No internet connection required
- Data persists across browser sessions
- Works on mobile, tablet, and desktop

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with IndexedDB support

## File Structure

```
finance-tracker/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles and design system
├── js/
│   ├── app.js          # Main application controller
│   ├── db.js           # IndexedDB wrapper
│   ├── lang.js         # Bilingual support
│   ├── utils.js        # Utility functions
│   ├── categories.js   # Category management
│   ├── home.js         # Home page logic
│   ├── transactions.js # Transaction management
│   ├── analysis.js     # Charts and insights
│   ├── budget.js       # Budget management
│   ├── export.js       # Export/Import functionality
│   └── settings.js     # Settings management
└── README.md           # This file
```

## Design Philosophy

The app follows Apple's iOS design principles:
- **Clean & Minimal** - No clutter, focus on content
- **Smooth Animations** - Delightful transitions
- **Card-based Layout** - Organized information hierarchy
- **Consistent Typography** - System fonts for familiarity
- **Thoughtful Colors** - Calm, professional palette
- **Responsive Design** - Works on all screen sizes

## Data Privacy

- **100% Local** - All data stays on your device
- **No Tracking** - No analytics or third-party scripts
- **No Account Required** - Use immediately, no sign-up
- **Your Data, Your Control** - Export and backup anytime

## Future Enhancements

Potential features for future versions:
- Recurring transactions
- Multiple accounts/wallets
- Advanced filtering and sorting
- Custom date ranges
- More chart types
- PDF export
- Cloud sync (optional)

## License

This project is open source and available for personal and commercial use.

## Credits

Built with ❤️ for people who want to take control of their finances.

---

**Version:** 1.0.0  
**Last Updated:** December 2025
