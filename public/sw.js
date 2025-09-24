// Service Worker for offline quiz taking capability

const CACHE_NAME = 'noto-quiz-cache-v1';
const OFFLINE_CACHE_NAME = 'noto-offline-cache-v1';

// Resources to cache for offline functionality
const STATIC_RESOURCES = [
  '/',
  '/dashboard',
  '/dashboard/quiz',
  '/manifest.json',
  '/favicon.ico',
  // Add critical CSS and JS files
  '/_next/static/css/',
  '/_next/static/js/',
];

// API endpoints that support offline functionality
const OFFLINE_API_PATTERNS = [
  /^\/api\/quiz\/[^\/]+$/,
  /^\/api\/quiz\/[^\/]+\/questions$/,
  /^\/api\/quiz\/attempts$/,
];

// Quiz data structure for offline storage
const OFFLINE_QUIZ_STORE = 'offline-quizzes';
const OFFLINE_ATTEMPTS_STORE = 'offline-attempts';

self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static resources...');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log('✅ Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker installation failed:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle quiz-related API requests
  if (isQuizApiRequest(url.pathname)) {
    event.respondWith(handleQuizApiRequest(request));
    return;
  }

  // Handle static resources
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

// Handle quiz API requests with offline support
async function handleQuizApiRequest(request) {
  const url = new URL(request.url);
  const method = request.method;

  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses for offline use
      if (method === 'GET') {
        const cache = await caches.open(OFFLINE_CACHE_NAME);
        await cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    }
    
    throw new Error(`Network response not ok: ${networkResponse.status}`);
  } catch (error) {
    console.log('🔌 Network failed, trying offline fallback for:', url.pathname);
    
    // Handle different types of offline requests
    if (method === 'GET') {
      return handleOfflineGetRequest(request);
    } else if (method === 'POST' && url.pathname.includes('/attempts')) {
      return handleOfflineAttemptSubmission(request);
    }
    
    // Return offline fallback response
    return new Response(
      JSON.stringify({
        error: 'Offline mode - this action will be synced when connection is restored',
        offline: true
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle offline GET requests (quiz data, questions)
async function handleOfflineGetRequest(request) {
  const cache = await caches.open(OFFLINE_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('🎯 Serving cached quiz data for offline use');
    return cachedResponse;
  }
  
  // Return empty quiz data structure for offline mode
  const url = new URL(request.url);
  
  if (url.pathname.includes('/questions')) {
    return new Response(
      JSON.stringify({
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
        offline: true,
        message: 'Quiz questions not available offline'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  return new Response(
    JSON.stringify({
      error: 'Data not available offline',
      offline: true
    }),
    {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Handle offline quiz attempt submissions
async function handleOfflineAttemptSubmission(request) {
  try {
    const attemptData = await request.json();
    
    // Store attempt data for later sync
    await storeOfflineAttempt(attemptData);
    
    console.log('💾 Quiz attempt stored for offline sync');
    
    return new Response(
      JSON.stringify({
        success: true,
        offline: true,
        message: 'Quiz attempt saved offline - will sync when connection is restored',
        id: generateOfflineId()
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('❌ Failed to store offline attempt:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to save quiz attempt offline',
        offline: true
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static resource requests
async function handleStaticRequest(request) {
  try {
    // Try network first for fresh content
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Update cache with fresh content
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error(`Network response not ok: ${networkResponse.status}`);
  } catch (error) {
    // Fallback to cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('🎯 Serving cached resource:', request.url);
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response(
        getOfflineHTML(),
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    
    return new Response('Resource not available offline', { status: 404 });
  }
}

// Check if request is for quiz API
function isQuizApiRequest(pathname) {
  return OFFLINE_API_PATTERNS.some(pattern => pattern.test(pathname));
}

// Store quiz attempt for offline sync
async function storeOfflineAttempt(attemptData) {
  const db = await openOfflineDB();
  const transaction = db.transaction([OFFLINE_ATTEMPTS_STORE], 'readwrite');
  const store = transaction.objectStore(OFFLINE_ATTEMPTS_STORE);
  
  const offlineAttempt = {
    id: generateOfflineId(),
    data: attemptData,
    timestamp: Date.now(),
    synced: false
  };
  
  await store.add(offlineAttempt);
}

// Open IndexedDB for offline storage
function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NotoOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains(OFFLINE_QUIZZES_STORE)) {
        db.createObjectStore(OFFLINE_QUIZZES_STORE, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(OFFLINE_ATTEMPTS_STORE)) {
        const attemptsStore = db.createObjectStore(OFFLINE_ATTEMPTS_STORE, { keyPath: 'id' });
        attemptsStore.createIndex('synced', 'synced', { unique: false });
        attemptsStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Generate offline ID
function generateOfflineId() {
  return 'offline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get offline HTML page
function getOfflineHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Noto</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: #f8fafc;
          color: #334155;
        }
        .offline-container {
          text-align: center;
          max-width: 400px;
          padding: 2rem;
        }
        .offline-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        .offline-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .offline-message {
          color: #64748b;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        .retry-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .retry-button:hover {
          background: #2563eb;
        }
        .offline-features {
          margin-top: 2rem;
          text-align: left;
        }
        .offline-features h3 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }
        .offline-features ul {
          color: #64748b;
          font-size: 0.9rem;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">🔌</div>
        <h1 class="offline-title">You're Offline</h1>
        <p class="offline-message">
          No internet connection detected. Some features may be limited, but you can still:
        </p>
        
        <div class="offline-features">
          <h3>Available Offline:</h3>
          <ul>
            <li>Take previously loaded quizzes</li>
            <li>Review cached quiz history</li>
            <li>Browse downloaded content</li>
          </ul>
        </div>
        
        <button class="retry-button" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
      
      <script>
        // Auto-retry when connection is restored
        window.addEventListener('online', () => {
          window.location.reload();
        });
        
        // Show connection status
        function updateConnectionStatus() {
          if (navigator.onLine) {
            window.location.reload();
          }
        }
        
        setInterval(updateConnectionStatus, 5000);
      </script>
    </body>
    </html>
  `;
}

// Background sync for offline attempts
self.addEventListener('sync', (event) => {
  if (event.tag === 'quiz-attempts-sync') {
    console.log('🔄 Background sync triggered for quiz attempts');
    event.waitUntil(syncOfflineAttempts());
  }
});

// Sync offline attempts when connection is restored
async function syncOfflineAttempts() {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction([OFFLINE_ATTEMPTS_STORE], 'readwrite');
    const store = transaction.objectStore(OFFLINE_ATTEMPTS_STORE);
    const index = store.index('synced');
    
    const unsyncedAttempts = await index.getAll(false);
    
    console.log(`🔄 Syncing ${unsyncedAttempts.length} offline quiz attempts...`);
    
    for (const attempt of unsyncedAttempts) {
      try {
        const response = await fetch('/api/quiz/attempts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(attempt.data)
        });
        
        if (response.ok) {
          // Mark as synced
          attempt.synced = true;
          await store.put(attempt);
          console.log('✅ Synced offline attempt:', attempt.id);
        } else {
          console.warn('⚠️ Failed to sync attempt:', attempt.id, response.status);
        }
      } catch (error) {
        console.error('❌ Error syncing attempt:', attempt.id, error);
      }
    }
    
    // Notify clients about sync completion
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        syncedCount: unsyncedAttempts.filter(a => a.synced).length
      });
    });
    
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'CACHE_QUIZ_DATA':
      cacheQuizData(data);
      break;
    case 'GET_OFFLINE_STATUS':
      event.ports[0].postMessage({
        offline: !navigator.onLine,
        cacheSize: getCacheSize()
      });
      break;
    case 'CLEAR_OFFLINE_CACHE':
      clearOfflineCache();
      break;
  }
});

// Cache quiz data for offline use
async function cacheQuizData(quizData) {
  try {
    const cache = await caches.open(OFFLINE_CACHE_NAME);
    
    // Cache quiz metadata
    await cache.put(
      new Request(`/api/quiz/${quizData.id}`),
      new Response(JSON.stringify(quizData), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
    
    // Cache quiz questions
    if (quizData.questions) {
      await cache.put(
        new Request(`/api/quiz/${quizData.id}/questions`),
        new Response(JSON.stringify({ data: quizData.questions }), {
          headers: { 'Content-Type': 'application/json' }
        })
      );
    }
    
    console.log('💾 Cached quiz data for offline use:', quizData.id);
  } catch (error) {
    console.error('❌ Failed to cache quiz data:', error);
  }
}

// Get cache size information
async function getCacheSize() {
  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      totalSize += requests.length;
    }
    
    return totalSize;
  } catch (error) {
    console.error('❌ Failed to get cache size:', error);
    return 0;
  }
}

// Clear offline cache
async function clearOfflineCache() {
  try {
    await caches.delete(OFFLINE_CACHE_NAME);
    
    const db = await openOfflineDB();
    const transaction = db.transaction([OFFLINE_ATTEMPTS_STORE, OFFLINE_QUIZZES_STORE], 'readwrite');
    
    await transaction.objectStore(OFFLINE_ATTEMPTS_STORE).clear();
    await transaction.objectStore(OFFLINE_QUIZZES_STORE).clear();
    
    console.log('🗑️ Offline cache cleared');
  } catch (error) {
    console.error('❌ Failed to clear offline cache:', error);
  }
}