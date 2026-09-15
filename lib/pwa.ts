// PWA Service Worker Registration and Management

class PWAManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline: boolean = true;
  private updateAvailable: boolean = false;

  constructor() {
    this.init();
  }

  private async init() {
    if (typeof window !== 'undefined') {
      // Register service worker
      await this.registerServiceWorker();
      
      // Set up online/offline listeners
      this.setupOnlineOfflineHandlers();
      
      // Set up update handlers
      this.setupUpdateHandlers();
    }
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('Service Worker registered successfully');

        // Listen for updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration?.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New update available
                this.updateAvailable = true;
                this.notifyUpdateAvailable();
              }
            });
          }
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private setupOnlineOfflineHandlers(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyOnlineStatus(true);
      
      // Trigger background sync when coming back online
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
          return (registration as any).sync.register('background-sync');
        });
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyOnlineStatus(false);
    });

    // Check initial online status
    this.isOnline = navigator.onLine;
  }

  private setupUpdateHandlers(): void {
    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        this.updateAvailable = true;
        this.notifyUpdateAvailable();
      }
    });
  }

  private notifyOnlineStatus(online: boolean): void {
    // Dispatch custom event for online/offline status
    const event = new CustomEvent('pwa-connection-change', {
      detail: { online }
    });
    window.dispatchEvent(event);

    // Show toast notification
    if (online) {
      this.showNotification('اتصال برقرار شد', 'success');
    } else {
      this.showNotification('حالت آفلاین - برخی ویژگی‌ها محدود است', 'warning');
    }
  }

  private notifyUpdateAvailable(): void {
    // Dispatch custom event for update available
    const event = new CustomEvent('pwa-update-available');
    window.dispatchEvent(event);

    // Show update notification
    this.showNotification(
      'نسخه جدید در دسترس است',
      'info',
      'به‌روزرسانی',
      () => this.applyUpdate()
    );
  }

  public applyUpdate(): void {
    if (this.registration?.waiting) {
      // Tell the waiting service worker to skip waiting
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page after the service worker takes control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }

  public cacheVocabularyData(data: any): void {
    // Send vocabulary data to service worker for caching
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_VOCABULARY',
        data: data
      });
    }
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  private showNotification(
    message: string, 
    type: 'success' | 'warning' | 'info' = 'info',
    actionText?: string,
    action?: () => void
  ): void {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `
      fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm
      transform transition-all duration-300 translate-x-full
      ${type === 'success' ? 'bg-green-500 text-white' : ''}
      ${type === 'warning' ? 'bg-yellow-500 text-black' : ''}
      ${type === 'info' ? 'bg-blue-500 text-white' : ''}
    `;

    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="flex-1">
          <p class="text-sm font-medium">${message}</p>
        </div>
        ${actionText ? `
          <button class="px-3 py-1 rounded text-xs font-medium bg-white/20 hover:bg-white/30">
            ${actionText}
          </button>
        ` : ''}
        <button class="ml-2 text-white/70 hover:text-white">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Set up event handlers
    const actionButton = notification.querySelector('button[class*="bg-white/20"]');
    const closeButton = notification.querySelector('button[class*="ml-2"]');

    if (actionButton && action) {
      actionButton.addEventListener('click', () => {
        action();
        this.removeNotification(notification);
      });
    }

    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.removeNotification(notification);
      });
    }

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        this.removeNotification(notification);
      }
    }, 5000);
  }

  private removeNotification(notification: HTMLElement): void {
    notification.style.transform = 'translateX(full)';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }

  public async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  public showPushNotification(title: string, options?: NotificationOptions): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options
      });
    }
  }
}

// Create singleton instance
export const pwaManager = new PWAManager();

// React hook for PWA functionality
export function usePWA() {
  const [isOnline, setIsOnline] = React.useState(pwaManager.getOnlineStatus());
  const [updateAvailable, setUpdateAvailable] = React.useState(pwaManager.isUpdateAvailable());

  React.useEffect(() => {
    const handleConnectionChange = (event: CustomEvent) => {
      setIsOnline(event.detail.online);
    };

    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('pwa-connection-change', handleConnectionChange as EventListener);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-connection-change', handleConnectionChange as EventListener);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  return {
    isOnline,
    updateAvailable,
    applyUpdate: () => pwaManager.applyUpdate(),
    requestNotificationPermission: () => pwaManager.requestNotificationPermission(),
    showPushNotification: (title: string, options?: NotificationOptions) => 
      pwaManager.showPushNotification(title, options),
  };
}

import React from 'react';