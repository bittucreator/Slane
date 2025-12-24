/**
 * Service Worker for Slane Task Manager
 * Handles background notifications and caching
 */

const CACHE_NAME = 'slane-v2-theme-fix';
const STATIC_ASSETS = [
  '/',
  '/Slane.png',
  '/slane-dark.png',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});

// Background sync for notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-due-tasks') {
    console.log('Background sync: checking due tasks');
    event.waitUntil(checkDueTasks());
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification);
  
  const notification = event.notification;
  const data = notification.data || {};
  
  notification.close();

  // Handle different notification types
  switch (data.type) {
    case 'task-due':
    case 'task-reminder':
      // Focus or open the app
      event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
          .then((clientList) => {
            // Try to focus existing window
            for (let client of clientList) {
              if (client.url.includes(self.location.origin)) {
                return client.focus();
              }
            }
            // Open new window if none exists
            return clients.openWindow('/');
          })
      );
      break;
      
    case 'overdue':
      event.waitUntil(
        clients.openWindow('/')
      );
      break;
      
    default:
      console.log('Unknown notification type:', data.type);
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification);
  
  const data = event.notification.data || {};
  
  // Track notification dismissal if needed
  if (data.trackDismissal) {
    console.log('Tracking notification dismissal for:', data.type);
  }
});

// Background function to check for due tasks
async function checkDueTasks() {
  try {
    // This would ideally fetch from your API or indexedDB
    // For now, we'll just log that the check happened
    console.log('Checking for due tasks in background...');
    
    // You could implement logic here to:
    // 1. Fetch tasks from IndexedDB or API
    // 2. Check which tasks are due
    // 3. Show notifications for due tasks
    
    // Example notification
    self.registration.showNotification('Background Check', {
      body: 'Checking for due tasks...',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'background-check',
      data: {
        type: 'background-check',
        timestamp: Date.now()
      }
    });
    
  } catch (error) {
    console.error('Error checking due tasks:', error);
  }
}

// Handle push notifications (for future server-sent notifications)
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'Task Reminder',
    body: 'You have tasks that need attention',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'push-notification'
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: true,
      data: notificationData.data || { type: 'push' }
    })
  );
});

// Periodic background sync (experimental feature)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-tasks-periodic') {
    console.log('Periodic sync: checking tasks');
    event.waitUntil(checkDueTasks());
  }
});

console.log('Service Worker loaded and ready');
