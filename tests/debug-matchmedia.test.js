import { test, expect, vi } from 'vitest';

test('debug matchMedia mock', () => {
  console.log('Testing matchMedia mock...');
  console.log('typeof window.matchMedia:', typeof window.matchMedia);
  
  if (typeof window.matchMedia === 'function') {
    const result = window.matchMedia('(max-width: 640px)');
    console.log('Result of window.matchMedia("(max-width: 640px)"):', result);
    console.log('result.matches:', result?.matches);
  } else {
    console.log('window.matchMedia is not a function!');
  }
});