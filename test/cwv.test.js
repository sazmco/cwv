import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getRating, generateId, THRESHOLDS } from '../src/index.js';

describe('@sazm/cwv', () => {
  test('thresholds match Google Web Vitals 75th percentile standards', () => {
    assert.deepEqual(THRESHOLDS.LCP, [2500, 4000]);
    assert.deepEqual(THRESHOLDS.INP, [200, 500]);
    assert.deepEqual(THRESHOLDS.CLS, [0.1, 0.25]);
    assert.deepEqual(THRESHOLDS.FCP, [1800, 3000]);
    assert.deepEqual(THRESHOLDS.TTFB, [800, 1800]);
  });

  test('getRating correctly classifies LCP', () => {
    assert.equal(getRating('LCP', 1200), 'good');
    assert.equal(getRating('LCP', 2500), 'good');
    assert.equal(getRating('LCP', 2501), 'needs-improvement');
    assert.equal(getRating('LCP', 4000), 'needs-improvement');
    assert.equal(getRating('LCP', 4001), 'poor');
  });

  test('getRating correctly classifies INP', () => {
    assert.equal(getRating('INP', 50), 'good');
    assert.equal(getRating('INP', 200), 'good');
    assert.equal(getRating('INP', 201), 'needs-improvement');
    assert.equal(getRating('INP', 500), 'needs-improvement');
    assert.equal(getRating('INP', 550), 'poor');
  });

  test('getRating correctly classifies CLS', () => {
    assert.equal(getRating('CLS', 0.02), 'good');
    assert.equal(getRating('CLS', 0.1), 'good');
    assert.equal(getRating('CLS', 0.15), 'needs-improvement');
    assert.equal(getRating('CLS', 0.25), 'needs-improvement');
    assert.equal(getRating('CLS', 0.26), 'poor');
  });

  test('generateId returns unique string IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    assert.equal(typeof id1, 'string');
    assert.notEqual(id1, id2);
    assert.ok(id1.length >= 8);
  });
});
