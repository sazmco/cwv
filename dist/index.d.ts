/**
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
