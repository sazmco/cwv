import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const srcPath = path.resolve('src/index.js');
const srcCode = fs.readFileSync(srcPath, 'utf8');

// 1. ESM output
fs.writeFileSync(path.join(distDir, 'index.mjs'), srcCode, 'utf8');

// 2. CommonJS output
const cjsCode = srcCode
  .replace(/export const /g, 'const ')
  .replace(/export function /g, 'function ')
  + '\nmodule.exports = {\n  THRESHOLDS,\n  getRating,\n  generateId,\n  onLCP,\n  onINP,\n  onCLS,\n  onFCP,\n  onTTFB,\n  observeCWV,\n  reportCWV,\n};\n';

fs.writeFileSync(path.join(distDir, 'index.cjs'), cjsCode, 'utf8');

// 3. TypeScript Declaration
const dts = `/**
 * @sazm/cwv - Core Web Vitals diagnostic & reporting toolkit
 * Maintained by SazM (https://sazm.in)
 * @license MIT
 */

export type MetricName = 'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB';
export type MetricRating = 'good' | 'needs-improvement' | 'poor';

export interface CWVMetric {
  name: MetricName;
  value: number;
  delta: number;
  rating: MetricRating;
  id: string;
  navigationType: string;
  entries: any[];
}

export interface MetricOptions {
  reportAllChanges?: boolean;
}

export interface ReportOptions {
  endpoint?: string;
  headers?: Record<string, string>;
  transport?: 'auto' | 'beacon' | 'fetch';
}

export declare const THRESHOLDS: Record<MetricName, [number, number]>;
export declare function getRating(name: MetricName, value: number): MetricRating;
export declare function generateId(): string;
export declare function onLCP(callback: (metric: CWVMetric) => void, options?: MetricOptions): void;
export declare function onINP(callback: (metric: CWVMetric) => void, options?: MetricOptions): void;
export declare function onCLS(callback: (metric: CWVMetric) => void, options?: MetricOptions): void;
export declare function onFCP(callback: (metric: CWVMetric) => void): void;
export declare function onTTFB(callback: (metric: CWVMetric) => void): void;
export declare function observeCWV(callback: (metric: CWVMetric) => void, options?: MetricOptions): void;
export declare function reportCWV(metric: CWVMetric, options?: ReportOptions): boolean;
`;

fs.writeFileSync(path.join(distDir, 'index.d.ts'), dts, 'utf8');

console.log('Build complete: dist/index.mjs, dist/index.cjs, dist/index.d.ts generated.');
