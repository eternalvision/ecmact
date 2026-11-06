import type { Component } from '@em/component';

export type StyleSource = string | CSSStyleSheet;

export type ErrorPhase =
  'render' | 'event' | 'mounted' | 'cleanup' | 'unmounted' | 'beforeUpdate' | 'updated';

export interface ErrorInfo {
  component: Component;
  phase: ErrorPhase;
  event?: string;
}

export type ErrorHandler = (error: unknown, info: ErrorInfo) => void;

export interface Config {
  shadow: boolean;
  styles: StyleSource[];
  warnings: boolean;
  onError?: ErrorHandler;
}

const defaults = (): Config => ({ shadow: true, styles: [], warnings: true });

let current = defaults();

export const configure = (options: Partial<Config>) => {
  current = { ...current, ...options };
};

export const getConfig = () => current;

export const resetConfig = () => {
  current = defaults();
};
