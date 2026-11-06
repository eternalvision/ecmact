export { em } from '@em/em';
export { tags } from '@em/tags';
export { configure } from '@em/config';
export { consume, createContext, provide } from '@em/context';
export { batch, computed, effect, isSignal, signal, untracked } from '@em/signals';
export type { ReadonlySignal, Signal } from '@em/signals';
export type { Config, ErrorHandler, ErrorInfo, ErrorPhase, StyleSource } from '@em/config';
export type { Context, Provision } from '@em/context';
export { mount } from '@em/utils';
export type { Component } from '@em/component';
export type {
  AttributeMap,
  ComponentProps,
  GlobalAttributes,
  ResolvedProps,
  TagName,
} from '@em/types';
