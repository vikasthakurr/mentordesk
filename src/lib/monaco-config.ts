import { loader } from '@monaco-editor/react';

/**
 * Configure Monaco to load from local node_modules instead of CDN.
 * This makes loading faster and more reliable (no network dependency).
 */
export function configureMonaco() {
  loader.config({
    paths: {
      vs: '/monaco-editor/min/vs',
    },
  });
}
