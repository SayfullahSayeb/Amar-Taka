// Updated renderCategoryList function for card-based design

renderCategoryList(containerId, categories) {
    const container = document.getElementById(containerId);

    if (!container) return;

    if (categories.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: var(--spacing-lg); color: var(--text-tertiary);">No categories yet</p>';
        return;
    }

    let html = '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: var(--spacing-lg);">';

    categories.forEach((category) => {
        // Map emoji to Font Awesome icon
        const iconClass = this.getIconForCategory(category.emoji, category.name);

        html += `
            <div class="category-card-item" data-category-id="${category.id}" style="position: relative; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.2s ease; min-height: 100px;">
                <button class="category-edit-btn-overlay" data-category-id="${category.id}" style="position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; border-radius: 50%; background: var(--bg-primary); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0.7; transition: opacity 0.2s;">
                    <i class="fas fa-edit" style="font-size: 10px; color: var(--text-secondary);"></i>
                </button>
                <i class="${iconClass}" style="font-size: 24px; color: var(--primary-color);"></i>
                <span style="font-size: 13px; font-weight: 500; color: var(--text-primary); text-align: center; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${lang.translate(category.name.toLowerCase())}
                </span>
            </div>
        `;
    });

    html += '</div>';

    container.innerHTML = html;
}
