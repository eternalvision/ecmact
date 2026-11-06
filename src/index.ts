export { em } from '@em/em';
export { tags } from '@em/tags';
export { configure } from '@em/config';
export { defineWidget } from '@em/widget';
export type { WidgetContext, WidgetOptions } from '@em/widget';
export { consume, createContext, provide } from '@em/context';
export { createRouter } from '@em/router';
export type {
  Guard,
  GuardResult,
  LinkProps,
  NavigateOptions,
  OutletProps,
  Route,
  RouteContext,
  RouteMatch,
  Router,
  RouterLocation,
  RouterOptions,
} from '@em/router';
export { resource } from '@em/resource';
export type { Resource, ResourceContext, ResourceOptions } from '@em/resource';
export { batch, computed, effect, isSignal, signal, untracked } from '@em/signals';
export type { ReadonlySignal, Signal } from '@em/signals';
export type { Config, ErrorHandler, ErrorInfo, ErrorPhase, StyleSource } from '@em/config';
export type { Context, Provision } from '@em/context';
export { mount } from '@em/utils';
export type { Component } from '@em/component';
export type {
  AttributeMap,
  Child,
  ComponentProps,
  EventHandlerOptions,
  GlobalAttributes,
  ResolvedProps,
  TagName,
} from '@em/types';
