# Profile Switching System Documentation

## Overview

The Profile Switching System allows users to manage **Personal** and **Business** finances separately within the same app. Each profile maintains completely isolated data including transactions, budgets, categories, and settings.

---

## Features

### ✅ What's Included

- **2 Profile Types:**
  - **Personal Profile** (Default, always enabled)
  - **Business Profile** (Optional, can be enabled/disabled)

- **Complete Data Isolation:**
  - Each profile has its own IndexedDB database
  - Transactions are never mixed between profiles
  - Budgets, categories, and settings are profile-specific
  - Analytics and reports show only current profile data

- **Easy Profile Switching:**
  - Click the profile indicator button in the home header
  - Instant switching with automatic data reload
  - Clear visual indicator of active profile

- **Business Profile Management:**
  - Enable/disable Business profile anytime
  - Data is preserved when disabled (just hidden)
  - Re-enabling shows previous business data

---

## User Interface

### Profile Indicator Button
**Location:** Top-right of home page header, next to settings icon

**Appearance:**
- Shows current profile icon (👤 for Personal, 💼 for Business)
- Displays profile name
- Dropdown chevron indicates it's clickable

**Action:** Click to open Profile Selector Modal

### Profile Selector Modal
**Features:**
- Lists all available profiles
- Shows active profile with checkmark
- Enable/Disable Business profile
- Clear descriptions for each profile

---

## Technical Implementation

### Data Structure

#### Database Naming Convention
```javascript
// Personal Profile Database
'FinanceTrackerDB_personal'

// Business Profile Database
'FinanceTrackerDB_business'
```

#### Profile Settings Storage
```javascript
// localStorage keys:
'active_profile'        // Current active profile key
'profile_settings'      // Profile configurations
'profiles_migrated'     // Migration flag for existing users
```

#### Profile Configuration
```javascript
profiles = {
  personal: {
    name: 'Personal',
    icon: '👤',
    enabled: true  // Always enabled
  },
  business: {
    name: 'Business',
    icon: '💼',
    enabled: false  // User can toggle
  }
}
```

---

## File Structure

### New Files Created

1. **`js/profiles.js`**
   - `ProfileManager` class
   - Profile switching logic
   - Database initialization per profile
   - Migration handling

### Modified Files

1. **`js/db.js`**
   - Updated `init()` to accept custom database name
   - Profile-aware database connection

2. **`js/app.js`**
   - Initialize ProfileManager before database
   - Setup profile event listeners
   - Handle existing data migration

3. **`js/export.js`**
   - Include profile information in exports
   - Profile-specific backup filenames

4. **`index.html`**
   - Added profile indicator button in header
   - Added Profile Selector Modal
   - Loaded profiles.js script

5. **`css/styles.css`**
   - Profile indicator button styles
   - Profile selector modal styles
   - Profile list item styles
   - Responsive adjustments

---

## How It Works

### Initialization Flow

1. **App Starts:**
   ```
   ProfileManager.init()
   → Load profile settings from localStorage
   → Set active profile (default: personal)
   → Update UI indicator
   ```

2. **Database Connection:**
   ```
   db.init()
   → Uses profile-specific database name
   → Opens 'FinanceTrackerDB_personal' or 'FinanceTrackerDB_business'
   ```

3. **Data Loading:**
   ```
   All managers load data from active profile's database
   → Transactions, budgets, categories, etc.
   ```

### Profile Switching Flow

1. **User clicks profile indicator**
2. **Profile Selector Modal opens**
3. **User selects different profile**
4. **System executes:**
   ```javascript
   - Close current database connection
   - Update active_profile in localStorage
   - Reinitialize database with new profile name
   - Reload all managers (home, transactions, analysis, etc.)
   - Update UI to show new profile data
   - Close modal
   ```

### Enabling Business Profile

1. **User clicks "Enable" on Business profile**
2. **System executes:**
   ```javascript
   - Set business.enabled = true
   - Save to localStorage
   - Initialize business database with default categories
   - Update profile selector UI
   - Show success toast
   ```

### Disabling Business Profile

1. **User clicks "Disable Business Profile"**
2. **Confirmation dialog appears**
3. **If confirmed:**
   ```javascript
   - Set business.enabled = false
   - Save to localStorage
   - If currently on business, switch to personal
   - Update UI
   - Data remains in database (not deleted)
   ```

---

## Data Migration

### For Existing Users

When a user with existing data first loads the app with the profile system:

1. **Migration Check:**
   ```javascript
   - Check if 'profiles_migrated' flag exists
   - If not, check for old 'FinanceTrackerDB'
   ```

2. **Automatic Migration:**
   ```javascript
   - Old database becomes Personal profile database
   - No data loss
   - Set migration flag
   ```

3. **Result:**
   - Existing users see all their data in Personal profile
   - Business profile starts empty
   - Seamless transition

---

## Export/Backup Behavior

### Export (Backup)
- **Only exports current active profile's data**
- Filename includes profile name: `finance-tracker-personal-backup-2025-12-29.json`
- Export includes profile metadata

### Import (Restore)
- **Imports to current active profile**
- Replaces all data in that profile
- Other profile remains unaffected

---

## API Reference

### ProfileManager Methods

```javascript
// Get active profile key
profileManager.getActiveProfile()
// Returns: 'personal' or 'business'

// Get active profile display name
profileManager.getActiveProfileName()
// Returns: 'Personal' or 'Business'

// Get active profile icon
profileManager.getActiveProfileIcon()
// Returns: '👤' or '💼'

// Get active profile database name
profileManager.getActiveProfileDB()
// Returns: 'FinanceTrackerDB_personal' or 'FinanceTrackerDB_business'

// Check if business profile is enabled
profileManager.isBusinessProfileEnabled()
// Returns: true or false

// Switch to a different profile
await profileManager.switchProfile('business')

// Enable business profile
await profileManager.enableBusinessProfile()

// Disable business profile
await profileManager.disableBusinessProfile()

// Open profile selector modal
profileManager.openProfileSelector()

// Close profile selector modal
profileManager.closeProfileSelector()
```

---

## Future Expansion

### Adding More Profiles

To add additional profiles (e.g., "Family", "Investment"):

1. **Update `js/profiles.js`:**
   ```javascript
   this.profiles = {
     personal: { ... },
     business: { ... },
     family: {
       name: 'Family',
       icon: '👨‍👩‍👧‍👦',
       enabled: false
     }
   };
   ```

2. **Update UI in `updateProfileSelector()`** to render new profile

3. **Add enable/disable logic** similar to business profile

### Custom Profile Names

Allow users to rename profiles:

1. Add `customName` field to profile settings
2. Update UI to show custom name
3. Add "Edit Profile" option in modal

### Profile Colors

Add custom colors per profile:

1. Add `color` field to profile settings
2. Update header background based on active profile
3. Add color picker in profile settings

---

## Troubleshooting

### Profile Not Switching
- Check browser console for errors
- Verify `active_profile` in localStorage
- Clear browser cache and reload

### Data Not Showing After Switch
- Ensure database initialization completed
- Check if profile database exists in IndexedDB
- Verify managers are reloading correctly

### Business Profile Won't Enable
- Check if `profile_settings` in localStorage is valid JSON
- Clear localStorage and try again
- Check browser console for initialization errors

---

## Best Practices

1. **Always backup before switching profiles** (use Export feature)
2. **Enable Business profile only when needed** to avoid confusion
3. **Use descriptive transaction notes** to remember context when switching
4. **Export each profile separately** for complete backups
5. **Don't mix personal and business expenses** - that's the whole point!

---

## Version History

- **v1.0.3** - Initial Profile Switching System implementation
  - Personal and Business profiles
  - Complete data isolation
  - Optional Business profile
  - Automatic migration for existing users

---

## Support

For issues or questions about the Profile Switching System:
1. Check this documentation
2. Review browser console for errors
3. Try clearing cache and reloading
4. Export your data before troubleshooting

---

**Last Updated:** December 29, 2025
**Version:** 1.0.3
