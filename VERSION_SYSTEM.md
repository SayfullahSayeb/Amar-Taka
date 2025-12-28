# Cache-Busting Version System Documentation

## Overview

This app now uses an automatic cache-busting system that ensures users always receive the latest version of CSS and JavaScript files without needing to manually clear their browser cache.

## How It Works

### Single Version Control
All CSS and JavaScript files are automatically loaded with a version parameter (e.g., `styles.css?v=1.0.0`). When you update the version number, browsers treat these as completely new files and download them fresh, bypassing any cached versions.

### Version Location

**File:** `js/version.js`

```javascript
const APP_VERSION = "1.0.0";
```

This is the ONLY file you need to edit to update the version across your entire app.

## How to Update Version Before Deployment

### Step 1: Open Version File
Open the file: `js/version.js`

### Step 2: Update Version Number
Change the version number following semantic versioning:

```javascript
// Before
const APP_VERSION = "1.0.0";

// After (example)
const APP_VERSION = "1.0.1";
```

### Version Numbering Guide
- **Patch** (1.0.0 → 1.0.1): Bug fixes, small changes
- **Minor** (1.0.0 → 1.1.0): New features, backwards compatible
- **Major** (1.0.0 → 2.0.0): Breaking changes, major updates

### Step 3: Deploy
Upload all files to your server. Users will automatically get the new version on their next visit.

## What Was Changed

### Files Modified

1. **js/version.js** (NEW)
   - Created central version configuration file
   - Contains single `APP_VERSION` constant

2. **index.html**
   - Added `<script src="js/version.js"></script>` at the top
   - Changed CSS loading to use version parameter
   - Changed all JS file loading to use version parameters
   - All files now load as: `filename.ext?v=1.0.0`

3. **onboarding.html**
   - Added `<script src="js/version.js"></script>` at the top
   - Changed CSS loading to use version parameter
   - Changed all JS file loading to use version parameters

### Technical Implementation

**CSS Files:**
```html
<!-- Before -->
<link rel="stylesheet" href="css/styles.css">

<!-- After -->
<script>document.write('<link rel="stylesheet" href="css/styles.css?v=' + APP_VERSION + '">');</script>
```

**JavaScript Files:**
```html
<!-- Before -->
<script src="js/app.js"></script>

<!-- After -->
<script>
    const scripts = ['js/app.js'];
    scripts.forEach(src => {
        document.write('<script src="' + src + '?v=' + APP_VERSION + '"><\/script>');
    });
</script>
```

## Files Covered

### Main App (index.html)
- **CSS:** styles.css
- **JS:** db.js, lang.js, utils.js, categories.js, categoryform.js, home.js, transactions.js, analysis.js, budget.js, export.js, settings.js, applock.js, demomode.js, app.js

### Onboarding (onboarding.html)
- **CSS:** onboarding.css
- **JS:** db.js, onboarding.js

## Testing

### Before Deployment
1. Update version in `js/version.js`
2. Test locally to ensure app works
3. Check browser console for any errors

### After Deployment
1. Open app in browser
2. Check browser DevTools → Network tab
3. Verify all files load with new version parameter (e.g., `?v=1.0.1`)
4. Confirm no 304 (cached) responses for your CSS/JS files

## Benefits

✅ **No Manual Cache Clearing** - Users automatically get updates
✅ **Single Update Point** - Change version in one place only
✅ **Caching Still Works** - Files are cached until version changes
✅ **No Build Tools Required** - Works on any hosting (cPanel, shared hosting, etc.)
✅ **Instant Updates** - Users see changes immediately on next visit
✅ **Version Tracking** - Easy to know which version is deployed

## Important Notes

1. **Always update version before deployment** when you change CSS or JS files
2. **Don't change version** if you only update HTML content or images
3. **Keep version.js in sync** - Never edit version numbers elsewhere
4. **Test locally first** - Always verify changes work before deploying

## Troubleshooting

### Users Still See Old Version
- Verify you updated `js/version.js`
- Check that version.js was uploaded to server
- Confirm version.js loads before other scripts
- Clear browser cache once as a test

### App Not Loading
- Check browser console for errors
- Verify all file paths are correct
- Ensure version.js exists on server
- Check that APP_VERSION is defined

## Example Deployment Workflow

1. Make changes to CSS/JS files
2. Open `js/version.js`
3. Increment version: `1.0.0` → `1.0.1`
4. Save file
5. Upload all changed files to server
6. Done! Users get fresh files automatically

---

**Current Version:** 1.0.0  
**Last Updated:** December 2025
