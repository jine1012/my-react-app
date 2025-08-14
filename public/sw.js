// public/sw.js
const CACHE_NAME = 'baby-monitor-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// 설치 이벤트 - 캐시 초기화
self.addEventListener('install', (event) => {
  console.log('Service Worker 설치 중...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('캐시 오픈 성공');
        return cache.addAll(CACHE_URLS);
      })
      .catch((error) => {
        console.error('캐시 추가 실패:', error);
      })
  );
});

// 활성화 이벤트 - 이전 캐시 삭제
self.addEventListener('activate', (event) => {
  console.log('Service Worker 활성화 중...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('이전 캐시 삭제:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
});

// 네트워크 요청 가로채기 - 캐시 우선 전략
self.addEventListener('fetch', (event) => {
  // POST 요청이나 API 호출은 네트워크 우선
  if (event.request.method !== 'GET' || 
      event.request.url.includes('api.openai.com') ||
      event.request.url.includes('localhost:8000')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에 있으면 캐시에서 반환
        if (response) {
          return response;
        }
        
        // 네트워크에서 가져오기
        return fetch(event.request)
          .then((response) => {
            // 유효한 응답인지 확인
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 응답 복사본 생성
            const responseToCache = response.clone();

            // 캐시에 저장
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // 오프라인일 때 기본 페이지 반환
            return caches.match('/');
          });
      })
  );
});

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', (event) => {
  if (event.tag === 'baby-status-sync') {
    event.waitUntil(
      // 백그라운드에서 아기 상태 동기화
      syncBabyStatus()
    );
  }
});

async function syncBabyStatus() {
  try {
    // 로컬 스토리지의 미동기화된 데이터 처리
    console.log('백그라운드 동기화 실행 중...');
  } catch (error) {
    console.error('백그라운드 동기화 실패:', error);
  }
}

// 푸시 알림 (선택사항)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '아기 모니터링 알림',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Baby Monitor', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // 앱 열기
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});