/**
 * @author Shiva Nagendra Babu Kore
 */

// Mobile compatibility utilities
// Minimal version to fix build errors

export const detectMobile = () => {
  try {
    if (typeof navigator === 'undefined') return {
      isMobileSafari: false,
      isIOS: false,
      isMobile: false,
      hasTouch: false,
      isSecure: false
    };
    
    const ua = navigator.userAgent;
    return {
      isMobileSafari: /Safari/.test(ua) && /iPhone|iPad|iPod/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua),
      isIOS: /iPhone|iPad|iPod/.test(ua),
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
      hasTouch: typeof window !== 'undefined' && 'ontouchstart' in window,
      isSecure: typeof window !== 'undefined' && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
    };
  } catch {
    return {
      isMobileSafari: false,
      isIOS: false,
      isMobile: false,
      hasTouch: false,
      isSecure: false
    };
  }
};

// Safe feature detection for mobile
export const canUseFeature = (feature: string) => {
  const mobile = detectMobile();
  
  switch (feature) {
    case 'websocket':
      return !mobile.isMobileSafari && mobile.isSecure && typeof WebSocket !== 'undefined';
    
    case 'realtime':
      return !mobile.isMobileSafari && mobile.isSecure;
    
    case 'serviceWorker':
      return typeof navigator !== 'undefined' && 'serviceWorker' in navigator && mobile.isSecure;
    
    case 'notifications':
      return typeof window !== 'undefined' && 'Notification' in window && mobile.isSecure;
    
    case 'localStorage':
      try {
        if (typeof localStorage === 'undefined') return false;
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    
    default:
      return true;
  }
};

// Error boundary safe execution
export const safeExecute = <T>(fn: () => T, fallback: T, context?: string): T => {
  try {
    return fn();
  } catch (error) {
    console.warn(`Safe execution failed${context ? ` in ${context}` : ''}:`, error);
    return fallback;
  }
};
