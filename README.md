# @sazm/cwv

> Ultra-lightweight Core Web Vitals (LCP, INP, CLS, FCP, TTFB) diagnostic & Real User Monitoring (RUM) toolkit.

Maintained by **[SazM](https://sazm.in)** — 20+ years in production engineering (since Oct 2006).

[![npm version](https://img.shields.io/npm/v/@sazm/cwv.svg)](https://www.npmjs.com/package/@sazm/cwv)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![SazM Speed Audit](https://img.shields.io/badge/Diagnostic-SazM%20Audit-emerald)](https://sazm.in/audit)

---

## Overview

`@sazm/cwv` is a zero-dependency, high-performance telemetry library (< 1.5 KB minified) designed to measure and report Google Core Web Vitals in modern web applications.

It adheres strictly to the official Chrome Web Vitals 75th-percentile thresholds:

| Metric | Full Name | Good | Needs Improvement | Poor |
| :--- | :--- | :--- | :--- | :--- |
| **LCP** | Largest Contentful Paint | ≤ 2,500 ms | 2,501 – 4,000 ms | > 4,000 ms |
| **INP** | Interaction to Next Paint | ≤ 200 ms | 201 – 500 ms | > 500 ms |
| **CLS** | Cumulative Layout Shift | ≤ 0.10 | 0.11 – 0.25 | > 0.25 |
| **FCP** | First Contentful Paint | ≤ 1,800 ms | 1,801 – 3,000 ms | > 3,000 ms |
| **TTFB** | Time to First Byte | ≤ 800 ms | 801 – 1,800 ms | > 1,800 ms |

---

## Installation

```bash
# npm
npm install @sazm/cwv

# pnpm
pnpm add @sazm/cwv

# yarn
yarn add @sazm/cwv
```

Or load directly from a CDN:

```html
<script type="module">
  import { observeCWV, reportCWV } from 'https://cdn.jsdelivr.net/npm/@sazm/cwv@1.0.0/dist/index.mjs';

  observeCWV((metric) => {
    console.log(metric.name, metric.value, metric.rating);
    reportCWV(metric, { endpoint: '/api/telemetry/cwv' });
  });
</script>
```

---

## Quick Start

### 1. Observe All Core Web Vitals

```javascript
import { observeCWV } from '@sazm/cwv';

observeCWV((metric) => {
  console.log(`[CWV] ${metric.name}: ${metric.value} (${metric.rating})`);
});
```

### 2. Observe Individual Metrics

```javascript
import { onLCP, onINP, onCLS, onTTFB } from '@sazm/cwv';

onLCP((metric) => {
  console.log('LCP render time:', metric.value, 'Rating:', metric.rating);
});

onINP((metric) => {
  console.log('INP interaction latency:', metric.value, 'Rating:', metric.rating);
});

onCLS((metric) => {
  console.log('CLS cumulative layout shift:', metric.value, 'Rating:', metric.rating);
});

onTTFB((metric) => {
  console.log('TTFB server response time:', metric.value, 'Rating:', metric.rating);
});
```

### 3. Automatic Beacon Reporting

Report metrics back to your edge analytics or logging collector (uses `navigator.sendBeacon` with fallback to `fetch(keepalive)`):

```javascript
import { observeCWV, reportCWV } from '@sazm/cwv';

observeCWV((metric) => {
  reportCWV(metric, {
    endpoint: '/api/telemetry/cwv',
    headers: { 'X-App-Env': 'production' },
  });
});
```

---

## API Reference

### `observeCWV(callback, options?)`
Attaches listeners for all 5 metrics (`LCP`, `INP`, `CLS`, `FCP`, `TTFB`).

### `getRating(metricName, value)`
Returns `'good' | 'needs-improvement' | 'poor'` based on official thresholds.

### `reportCWV(metric, options?)`
Dispatches metric payloads to your backend telemetry endpoint.

```typescript
interface CWVMetric {
  name: 'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB';
  value: number;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
  navigationType: string;
  entries: any[];
}
```

---

## About SazM

**[SazM](https://sazm.in)** provides fixed-price website speed optimizations and production engineering:
- **Free Automated Speed Audit:** [sazm.in/audit](https://sazm.in/audit)
- **Production Engineering:** [sazm.in](https://sazm.in)
- **Portfolio & Case Studies:** [sazm.in/projects](https://sazm.in/projects)

20+ years in production engineering (since Oct 2006). 1,000+ projects for 300+ clients for Weismann Web per CEO letter.

---

## License

[MIT](LICENSE) © 2026 [SazM](https://sazm.in)
