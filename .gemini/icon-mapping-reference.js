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
        '🔧': 'fas fa-tools'
    };

    // Try to match by emoji first
    if (iconMap[emoji]) {
        return iconMap[emoji];
    }

    // Match by name as fallback
    const nameLower = name ? name.toLowerCase() : '';

    // Food & Dining
    if (nameLower.includes('food') || nameLower.includes('dining') || nameLower.includes('restaurant') || nameLower.includes('meal')) return 'fas fa-utensils';
    if (nameLower.includes('coffee') || nameLower.includes('cafe')) return 'fas fa-coffee';
    if (nameLower.includes('pizza')) return 'fas fa-pizza-slice';

    // Transportation
    if (nameLower.includes('transport') || nameLower.includes('travel') || nameLower.includes('commute')) return 'fas fa-car';
    if (nameLower.includes('taxi') || nameLower.includes('uber') || nameLower.includes('ride')) return 'fas fa-taxi';
    if (nameLower.includes('flight') || nameLower.includes('plane')) return 'fas fa-plane';
    if (nameLower.includes('fuel') || nameLower.includes('gas') || nameLower.includes('petrol')) return 'fas fa-gas-pump';

    // Bills & Utilities
    if (nameLower.includes('bill') || nameLower.includes('utility') || nameLower.includes('electric')) return 'fas fa-file-invoice-dollar';
    if (nameLower.includes('phone') || nameLower.includes('internet') || nameLower.includes('mobile')) return 'fas fa-phone';

    // Shopping
    if (nameLower.includes('shop') || nameLower.includes('purchase')) return 'fas fa-shopping-bag';
    if (nameLower.includes('cloth') || nameLower.includes('fashion')) return 'fas fa-tshirt';

    // Medical & Health
    if (nameLower.includes('medical') || nameLower.includes('health') || nameLower.includes('doctor') || nameLower.includes('hospital')) return 'fas fa-hospital';
    if (nameLower.includes('medicine') || nameLower.includes('pharmacy') || nameLower.includes('drug')) return 'fas fa-pills';
    if (nameLower.includes('insurance')) return 'fas fa-heartbeat';

    // Education
    if (nameLower.includes('education') || nameLower.includes('school') || nameLower.includes('college') || nameLower.includes('university')) return 'fas fa-graduation-cap';
    if (nameLower.includes('book') || nameLower.includes('study')) return 'fas fa-book';

    // Home & Rent
    if (nameLower.includes('rent') || nameLower.includes('home') || nameLower.includes('house')) return 'fas fa-home';
    if (nameLower.includes('maintenance') || nameLower.includes('repair')) return 'fas fa-tools';

    // Income
    if (nameLower.includes('salary') || nameLower.includes('income') || nameLower.includes('wage') || nameLower.includes('pay')) return 'fas fa-money-bill-wave';
    if (nameLower.includes('freelance') || nameLower.includes('gig') || nameLower.includes('contract')) return 'fas fa-hand-holding-usd';
    if (nameLower.includes('bonus') || nameLower.includes('commission')) return 'fas fa-dollar-sign';

    // Investment
    if (nameLower.includes('investment') || nameLower.includes('stock') || nameLower.includes('crypto')) return 'fas fa-chart-line';
    if (nameLower.includes('dividend') || nameLower.includes('interest')) return 'fas fa-chart-bar';

    // Entertainment
    if (nameLower.includes('entertainment') || nameLower.includes('fun') || nameLower.includes('leisure')) return 'fas fa-gamepad';
    if (nameLower.includes('movie') || nameLower.includes('cinema') || nameLower.includes('film')) return 'fas fa-film';
    if (nameLower.includes('music') || nameLower.includes('concert')) return 'fas fa-music';
    if (nameLower.includes('game') || nameLower.includes('gaming')) return 'fas fa-gamepad';

    // Gifts
    if (nameLower.includes('gift') || nameLower.includes('present')) return 'fas fa-gift';

    // Fitness & Sports
    if (nameLower.includes('fitness') || nameLower.includes('gym') || nameLower.includes('workout')) return 'fas fa-dumbbell';
    if (nameLower.includes('sport')) return 'fas fa-futbol';

    // Pets
    if (nameLower.includes('pet') || nameLower.includes('dog') || nameLower.includes('cat')) return 'fas fa-paw';

    // Other common categories
    if (nameLower.includes('other')) return 'fas fa-plus-circle';

    return 'fas fa-wallet'; // Default icon
}
