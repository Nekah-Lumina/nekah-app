// Offline functionality and low bandwidth optimization
export class OfflineService {
  private static readonly CACHE_PREFIX = 'nekah_cache_';
  private static readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  
  static init(): void {
    // Register service worker for offline functionality
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Initial connection check
    this.updateConnectionStatus();
  }
  
  static isOnline(): boolean {
    return navigator.onLine;
  }
  
  static handleOnline(): void {
    document.body.classList.remove('offline');
    // Sync pending data when coming back online
    this.syncPendingData();
  }
  
  static handleOffline(): void {
    document.body.classList.add('offline');
  }
  
  static updateConnectionStatus(): void {
    if (this.isOnline()) {
      this.handleOnline();
    } else {
      this.handleOffline();
    }
  }
  
  // Cache management
  static setCache(key: string, data: any, customExpiry?: number): void {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: customExpiry || this.CACHE_EXPIRY
    };
    
    try {
      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Cache storage failed:', error);
    }
  }
  
  static getCache(key: string): any | null {
    try {
      const cached = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!cached) return null;
      
      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > cacheData.expiry;
      
      if (isExpired) {
        localStorage.removeItem(this.CACHE_PREFIX + key);
        return null;
      }
      
      return cacheData.data;
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
      return null;
    }
  }
  
  static clearCache(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
  
  // Offline data queue
  static addToQueue(action: string, data: any): void {
    const queue = this.getQueue();
    queue.push({
      id: Date.now().toString(),
      action,
      data,
      timestamp: Date.now()
    });
    localStorage.setItem('nekah_offline_queue', JSON.stringify(queue));
  }
  
  static getQueue(): any[] {
    try {
      const queue = localStorage.getItem('nekah_offline_queue');
      return queue ? JSON.parse(queue) : [];
    } catch {
      return [];
    }
  }
  
  static clearQueue(): void {
    localStorage.removeItem('nekah_offline_queue');
  }
  
  static async syncPendingData(): Promise<void> {
    const queue = this.getQueue();
    if (queue.length === 0) return;
    
    console.log(`Syncing ${queue.length} pending items...`);
    
    for (const item of queue) {
      try {
        // Process each queued item based on action type
        switch (item.action) {
          case 'mood_entry':
            // Sync mood entries
            break;
          case 'community_post':
            // Sync community posts
            break;
          case 'profile_update':
            // Sync profile updates
            break;
          default:
            console.warn('Unknown action type:', item.action);
        }
      } catch (error) {
        console.error('Failed to sync item:', item, error);
      }
    }
    
    this.clearQueue();
  }
  
  // Low bandwidth optimizations
  static async optimizeImage(file: File, maxSize: number = 800, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        const ratio = Math.min(maxSize / width, maxSize / height);
        
        if (ratio < 1) {
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
  
  static getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection ? connection.effectiveType || 'unknown' : 'unknown';
  }
  
  static isSlowConnection(): boolean {
    const connectionType = this.getConnectionType();
    return ['slow-2g', '2g'].includes(connectionType);
  }
  
  static shouldReduceData(): boolean {
    return this.isSlowConnection() || !this.isOnline();
  }
}

// Accessibility utilities
export class AccessibilityService {
  static init(): void {
    this.setupKeyboardNavigation();
    this.setupScreenReaderSupport();
    this.setupFocusManagement();
    this.checkReducedMotion();
  }
  
  static setupKeyboardNavigation(): void {
    // Skip to content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const main = document.getElementById('main-content');
      if (main) {
        main.focus();
        main.scrollIntoView();
      }
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Alt + H = Home
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        window.location.hash = '/home';
      }
      
      // Alt + M = Menu
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        const menuButton = document.querySelector('[aria-label*="menu"]') as HTMLElement;
        menuButton?.click();
      }
      
      // Escape = Close modals
      if (e.key === 'Escape') {
        const openModal = document.querySelector('[role="dialog"][aria-hidden="false"]');
        if (openModal) {
          const closeButton = openModal.querySelector('[aria-label*="close"]') as HTMLElement;
          closeButton?.click();
        }
      }
    });
  }
  
  static setupScreenReaderSupport(): void {
    // Live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.id = 'live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }
  
  static announce(message: string): void {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }
  
  static setupFocusManagement(): void {
    // Focus trap for modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const modal = document.querySelector('[role="dialog"][aria-hidden="false"]');
        if (modal) {
          const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });
  }
  
  static checkReducedMotion(): boolean {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.body.classList.add('reduced-motion');
    }
    return prefersReducedMotion;
  }
  
  static setFocus(element: HTMLElement, options?: FocusOptions): void {
    element.focus(options);
    this.announce(`Focused on ${element.getAttribute('aria-label') || element.textContent || 'element'}`);
  }
  
  static getAriaLabel(context: string, ...parts: (string | number)[]): string {
    return `${context}: ${parts.filter(Boolean).join(', ')}`;
  }
  
  static updateAriaExpanded(button: HTMLElement, expanded: boolean): void {
    button.setAttribute('aria-expanded', expanded.toString());
  }
  
  static updateAriaSelected(element: HTMLElement, selected: boolean): void {
    element.setAttribute('aria-selected', selected.toString());
  }
}

// Performance monitoring
export class PerformanceService {
  static trackPageLoad(pageName: string): void {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      
      console.log(`Page ${pageName} loaded in ${loadTime}ms`);
      
      // Track to analytics if available
      if (loadTime > 3000) {
        console.warn(`Slow page load detected: ${pageName} took ${loadTime}ms`);
      }
    }
  }
  
  static trackUserInteraction(action: string): void {
    const timestamp = Date.now();
    console.log(`User interaction: ${action} at ${timestamp}`);
    
    // Store for analytics
    const interactions = JSON.parse(localStorage.getItem('nekah_interactions') || '[]');
    interactions.push({ action, timestamp });
    
    // Keep only last 100 interactions
    if (interactions.length > 100) {
      interactions.splice(0, interactions.length - 100);
    }
    
    localStorage.setItem('nekah_interactions', JSON.stringify(interactions));
  }
}