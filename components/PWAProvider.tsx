'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Install prompt handler
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    // Online/offline handlers
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Service worker update handler
    const handleSWUpdate = () => setUpdateAvailable(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('pwa-update-available', handleSWUpdate);

    // Check initial online status
    setIsOnline(navigator.onLine);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered');
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch(console.error);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa-update-available', handleSWUpdate);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstallButton(false);
        setDeferredPrompt(null);
      }
    }
  };

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  return (
    <>
      {children}
      
      {/* Install App Banner */}
      {showInstallButton && (
        <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
          <Card className="bg-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Download className="h-6 w-6" />
                <div className="flex-1">
                  <p className="font-medium">Install App</p>
                  <p className="text-sm text-blue-100">Faster access and offline support</p>
                </div>
                <Button 
                  onClick={handleInstall}
                  size="sm" 
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  Install
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Update Available Banner */}
      {updateAvailable && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
          <Card className="bg-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-6 w-6" />
                <div className="flex-1">
                  <p className="font-medium">Update Available</p>
                  <p className="text-sm text-green-100">A new version is ready</p>
                </div>
                <Button 
                  onClick={handleUpdate}
                  size="sm" 
                  variant="secondary"
                  className="bg-white text-green-600 hover:bg-green-50"
                >
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 z-50">
          <div className="flex items-center justify-center gap-2 text-sm">
            <WifiOff className="h-4 w-4" />
            <span>Offline Mode - Some features may be limited</span>
          </div>
        </div>
      )}

      {/* Online Indicator (shows briefly when coming back online) */}
      {isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white text-center py-2 z-50 transition-transform duration-300 transform -translate-y-full data-[show=true]:translate-y-0">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Wifi className="h-4 w-4" />
            <span>Reconnected - Syncing data...</span>
          </div>
        </div>
      )}
    </>
  );
}