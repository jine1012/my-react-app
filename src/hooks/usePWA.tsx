import { useEffect, useMemo, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

interface PWAInstallProps {
  canInstall: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  install: () => Promise<void>;
  isOffline: boolean;
}

export const usePWA = (): PWAInstallProps => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof navigator === 'undefined') return false;
    return !navigator.onLine;
  });

  // 안전한 display-mode 체크
  const computeStandalone = useMemo(() => {
    return () => {
      if (typeof window === 'undefined') return false;
      const mql = window.matchMedia?.('(display-mode: standalone)');
      // iOS Safari PWA
      const iosStandalone = (window.navigator as any)?.standalone === true;
      return !!(mql?.matches || iosStandalone);
    };
  }, []);

  useEffect(() => {
    // 최초 standalone 상태 반영
    setIsStandalone(computeStandalone());

    // Service Worker 등록 (load 대기 불필요)
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker 등록 성공:', registration.scope);

          // 업데이트 감지(브라우저별 호환 처리)
          const onUpdateFound = () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                if (typeof window !== 'undefined' && window.confirm('새 버전이 사용 가능합니다. 새로고침할까요?')) {
                  window.location.reload();
                }
              }
            });
          };

          // 일부 타입 정의에서 addEventListener 미정의가 있을 수 있어 onupdatefound도 함께 처리
          try {
            
            registration.addEventListener?.('updatefound', onUpdateFound);
          } catch {
            /* noop */
          }
          registration.onupdatefound = onUpdateFound;
        })
        .catch((error) => {
          console.error('Service Worker 등록 실패:', error);
        });
    }

    // 이벤트 핸들러들
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      console.log('PWA 설치 완료');
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.addEventListener('appinstalled', handleAppInstalled as EventListener);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
        window.removeEventListener('appinstalled', handleAppInstalled as EventListener);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [computeStandalone]);

  // 앱 설치 함수
  const install = async (): Promise<void> => {
    if (!deferredPrompt) {
      throw new Error('설치 프롬프트를 사용할 수 없습니다.');
    }
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('사용자가 PWA 설치를 수락했습니다.');
      } else {
        console.log('사용자가 PWA 설치를 거부했습니다.');
      }
      setDeferredPrompt(null);
      setCanInstall(false);
    } catch (error) {
      console.error('PWA 설치 중 오류 발생:', error);
      throw error;
    }
  };

  useEffect(() => {
    // 설치되어 있는지 재확인 (iOS에서 홈추가 후 재실행 등)
    setIsStandalone(computeStandalone());
  }, [computeStandalone]);

  return {
    canInstall,
    isInstalled,
    isStandalone,
    install,
    isOffline,
  };
};
