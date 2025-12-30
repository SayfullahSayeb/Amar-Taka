# Service Worker Documentation

## Overview
The `sw.js` file is the service worker for the Amar Taka PWA. It enables offline functionality, caching, and provides the foundation for a native app-like experience.

## Version Management
The service worker uses the same version system as the rest of the app by importing `version.js`:

```javascript
importScripts('js/version.js');
const CACHE_NAME = `amar-taka-v${APP_VERSION}`;
const DATA_CACHE_NAME = `amar-taka-data-v${APP_VERSION}`;
```

When updating the app, simply increment the version in `js/version.js`:
```javascript
const APP_VERSION = "2.0.7"; // Increment version
```

This ensures the service worker cache version stays in sync with the app version automatically.

## Caching Strategy

### Static Assets (Cache-First)
The following assets are cached on service worker installation:
- HTML files (index.html, onboarding.html)
- CSS files (styles.css, bk.css)
- JavaScript files (all app JS files)
- Images (icons, screenshots)
- Manifest file

**Strategy**: Serve from cache first, update cache in background if network available.

### Dynamic Data (Network-First)
API requests and dynamic data use network-first strategy:
- Fetch from network first
- Cache the response
- If network fails, serve from cache

## Service Worker Lifecycle

### 1. Installation
```javascript
self.addEventListener('install', ...)
```
- Caches all static assets listed in `STATIC_ASSETS`
- Calls `skipWaiting()` to activate immediately

### 2. Activation
```javascript
self.addEventListener('activate', ...)
```
- Deletes old caches (different versions)
- Claims all clients immediately

### 3. Fetch Handling
```javascript
self.addEventListener('fetch', ...)
```
- Intercepts all network requests
- Applies appropriate caching strategy
- Provides offline fallback

## Message Handling

The service worker can receive messages from the client:

### Skip Waiting
```javascript
navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
```
Forces the new service worker to activate immediately.

### Clear Cache
```javascript
navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
```
Clears all caches and notifies clients.

### Get Version
```javascript
const channel = new MessageChannel();
navigator.serviceWorker.controller.postMessage(
  { type: 'GET_VERSION' },
  [channel.port2]
);
```
Returns the current cache version.

## Future Features

### Background Sync
The service worker includes a sync event listener for future implementation:
```javascript
self.addEventListener('sync', ...)
```
Can be used to sync offline transactions when connection is restored.

### Push Notifications
Infrastructure for push notifications is ready:
```javascript
self.addEventListener('push', ...)
self.addEventListener('notificationclick', ...)
```

## Debugging

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Application tab
3. Select "Service Workers" in sidebar
4. View status, update, or unregister

### Common Commands
```javascript
// Unregister service worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});

// Check if service worker is active
navigator.serviceWorker.ready.then(registration => {
  console.log('Service Worker is ready:', registration);
});
```

## Troubleshooting

### Service Worker Not Registering
- Ensure you're using HTTPS or localhost
- Check browser console for errors
- Verify `sw.js` is in the root directory

### Cache Not Updating
- Increment the cache version number
- Clear browser cache manually
- Use "Update on reload" in DevTools

### Offline Mode Not Working
- Ensure all assets are listed in `STATIC_ASSETS`
- Check Network tab in DevTools
- Verify service worker is active

## Best Practices

1. **Version Control**: Always increment cache version when deploying updates
2. **Asset List**: Keep `STATIC_ASSETS` array updated with all critical files
3. **Testing**: Test offline functionality in DevTools before deployment
4. **Error Handling**: Monitor console for service worker errors
5. **Cache Size**: Be mindful of cache size, remove unused assets

## File Structure
```
/
├── sw.js                 # Service worker (this file)
├── index.html           # Main app (registers service worker)
├── manifest.json        # PWA manifest
├── css/
│   ├── styles.css
│   └── bk.css
├── js/
│   ├── app.js
│   ├── db.js
│   └── ... (other JS files)
└── image/
    └── icon.png
```

## Registration Code
The service worker is registered in `index.html`:
```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(error => {
        console.error('SW registration failed:', error);
      });
  });
}
```

## Update Process

When you update the app:
1. Update cache version in `sw.js`
2. Update `STATIC_ASSETS` if files changed
3. Deploy new files
4. Service worker will detect changes
5. New version installs in background
6. Activates on next page load

## Performance Tips

- Keep `STATIC_ASSETS` list minimal
- Use cache-first for static assets
- Use network-first for dynamic data
- Implement stale-while-revalidate for better UX
- Monitor cache size in DevTools

---

**Last Updated**: December 2025  
**Version**: 1.0.0
