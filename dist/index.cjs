/**
 * @sazm/cwv - Core Web Vitals diagnostic & reporting toolkit
 * Maintained by SazM (https://sazm.in)
 * @license MIT
 */

const THRESHOLDS = {
  LCP: [2500, 4000],
  INP: [200, 500],
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
};

/**
 * Returns the Google Core Web Vitals rating for a given metric and value.
 * @param {'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB'} name
 * @param {number} value
 * @returns {'good' | 'needs-improvement' | 'poor'}
 */
function getRating(name, value) {
  const threshold = THRESHOLDS[name];
  if (!threshold) return 'good';
  if (value <= threshold[0]) return 'good';
  if (value <= threshold[1]) return 'needs-improvement';
  return 'poor';
}

/**
 * Generates a collision-resistant 16-character alphanumeric ID.
 * @returns {string}
 */
function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  }
  return 'v1-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function createMetric(name, value, delta, entries = []) {
  return {
    name,
    value: Number(value.toFixed(name === 'CLS' ? 4 : 2)),
    delta: Number(delta.toFixed(name === 'CLS' ? 4 : 2)),
    rating: getRating(name, value),
    id: generateId(),
    navigationType: getNavigationType(),
    entries,
  };
}

function getNavigationType() {
  if (typeof performance === 'undefined' || !performance.getEntriesByType) return 'navigate';
  const nav = performance.getEntriesByType('navigation')[0];
  return nav ? nav.type : 'navigate';
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Measures Largest Contentful Paint (LCP).
 * Target: <= 2500ms (Good)
 * @param {(metric: any) => void} callback
 */
function onLCP(callback, { reportAllChanges = false } = {}) {
  if (!isBrowser() || typeof PerformanceObserver === 'undefined') return;

  let value = 0;
  let entries = [];

  try {
    const observer = new PerformanceObserver((list) => {
      const entryList = list.getEntries();
      for (const entry of entryList) {
        if (entry.startTime < document.visibilityState === 'hidden' ? 0 : Infinity) {
          value = entry.startTime;
          entries.push(entry);
          if (reportAllChanges) {
            callback(createMetric('LCP', value, entry.startTime, [entry]));
          }
        }
      }
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });

    const stop = () => {
      if (observer) {
        observer.takeRecords();
        observer.disconnect();
      }
      if (value > 0 && !reportAllChanges) {
        callback(createMetric('LCP', value, value, entries));
      }
    };

    ['visibilitychange', 'pagehide'].forEach((type) => {
      addEventListener(type, stop, { once: true, capture: true });
    });
  } catch (err) {
    // Unsupported browser
  }
}

/**
 * Measures Interaction to Next Paint (INP).
 * Target: <= 200ms (Good)
 * @param {(metric: any) => void} callback
 */
function onINP(callback, { reportAllChanges = false } = {}) {
  if (!isBrowser() || typeof PerformanceObserver === 'undefined') return;

  let longestDuration = 0;
  let longestEntry = null;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const duration = entry.duration;
        if (duration > longestDuration) {
          longestDuration = duration;
          longestEntry = entry;
          if (reportAllChanges) {
            callback(createMetric('INP', longestDuration, duration, [entry]));
          }
        }
      }
    });

    observer.observe({ type: 'event', buffered: true, durationThreshold: 16 });

    const report = () => {
      if (longestDuration > 0 && !reportAllChanges) {
        callback(createMetric('INP', longestDuration, longestDuration, longestEntry ? [longestEntry] : []));
      }
    };

    ['visibilitychange', 'pagehide'].forEach((type) => {
      addEventListener(type, report, { once: true, capture: true });
    });
  } catch (err) {
    // Unsupported browser
  }
}

/**
 * Measures Cumulative Layout Shift (CLS).
 * Target: <= 0.1 (Good)
 * @param {(metric: any) => void} callback
 */
function onCLS(callback, { reportAllChanges = false } = {}) {
  if (!isBrowser() || typeof PerformanceObserver === 'undefined') return;

  let clsValue = 0;
  let sessionValue = 0;
  let sessionEntries = [];

  try {
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        // Only count layout shifts without recent user input
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

          // Session window: 1s gap or 5s maximum
          if (
            sessionValue &&
            entry.startTime - lastSessionEntry.startTime < 1000 &&
            entry.startTime - firstSessionEntry.startTime < 5000
          ) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }

          if (sessionValue > clsValue) {
            const delta = sessionValue - clsValue;
            clsValue = sessionValue;
            if (reportAllChanges) {
              callback(createMetric('CLS', clsValue, delta, sessionEntries));
            }
          }
        }
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });

    const report = () => {
      if (!reportAllChanges) {
        callback(createMetric('CLS', clsValue, clsValue, sessionEntries));
      }
    };

    ['visibilitychange', 'pagehide'].forEach((type) => {
      addEventListener(type, report, { once: true, capture: true });
    });
  } catch (err) {
    // Unsupported browser
  }
}

/**
 * Measures First Contentful Paint (FCP).
 * Target: <= 1800ms (Good)
 * @param {(metric: any) => void} callback
 */
function onFCP(callback) {
  if (!isBrowser() || typeof PerformanceObserver === 'undefined') return;

  try {
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          observer.disconnect();
          callback(createMetric('FCP', entry.startTime, entry.startTime, [entry]));
          break;
        }
      }
    });

    observer.observe({ type: 'paint', buffered: true });
  } catch (err) {
    // Unsupported browser
  }
}

/**
 * Measures Time to First Byte (TTFB).
 * Target: <= 800ms (Good)
 * @param {(metric: any) => void} callback
 */
function onTTFB(callback) {
  if (!isBrowser() || typeof performance === 'undefined' || !performance.getEntriesByType) return;

  const handleNav = () => {
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav) {
      const responseStart = nav.responseStart || 0;
      callback(createMetric('TTFB', responseStart, responseStart, [nav]));
    }
  };

  if (document.readyState === 'complete') {
    handleNav();
  } else {
    addEventListener('load', handleNav, { once: true });
  }
}

/**
 * Observes all five Core Web Vitals (LCP, INP, CLS, FCP, TTFB) with a single listener.
 * @param {(metric: any) => void} callback
 * @param {object} [options]
 */
function observeCWV(callback, options = {}) {
  onLCP(callback, options);
  onINP(callback, options);
  onCLS(callback, options);
  onFCP(callback);
  onTTFB(callback);
}

/**
 * Dispatches a metric beacon to any HTTP endpoint using sendBeacon or keepalive fetch.
 * @param {object} metric
 * @param {object} [options]
 * @param {string} [options.endpoint]
 * @param {Record<string, string>} [options.headers]
 * @param {'auto' | 'beacon' | 'fetch'} [options.transport]
 * @returns {boolean}
 */
function reportCWV(metric, { endpoint = '/api/telemetry/cwv', headers = {}, transport = 'auto' } = {}) {
  if (!isBrowser() || !metric) return false;

  const payload = JSON.stringify({
    ...metric,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  });

  if ((transport === 'auto' || transport === 'beacon') && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([payload], { type: 'application/json' });
    const success = navigator.sendBeacon(endpoint, blob);
    if (success) return true;
  }

  if (typeof fetch === 'function') {
    try {
      fetch(endpoint, {
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        keepalive: true,
      }).catch(() => {});
      return true;
    } catch (e) {
      return false;
    }
  }

  return false;
}

module.exports = {
  THRESHOLDS,
  getRating,
  generateId,
  onLCP,
  onINP,
  onCLS,
  onFCP,
  onTTFB,
  observeCWV,
  reportCWV,
};
