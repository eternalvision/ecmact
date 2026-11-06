export { em } from '@em/core/em';
export { tags } from '@em/core/tags';
export { configure } from '@em/core/config';
export { styled } from '@em/styled/styled';
export type {
  Attrs,
  Styled,
  StyledComponent,
  StyledProps,
  StyledTag,
  StyleProps,
} from '@em/styled/styled';
export { css, keyframes } from '@em/styled/template';
export type { CssFragment, Interpolation, Keyframes } from '@em/styled/template';
export { ThemeProvider, themeContext, useTheme } from '@em/styled/theme';
export type { Theme, ThemeProviderProps } from '@em/styled/theme';
export { defineWidget } from '@em/widget/widget';
export type { WidgetContext, WidgetOptions } from '@em/widget/widget';
export { consume, createContext, provide } from '@em/core/context';
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
export { resource } from '@em/data/resource';
export type { Resource, ResourceContext, ResourceOptions } from '@em/data/resource';
export { batch, computed, effect, isSignal, signal, untracked } from '@em/signals/signals';
export type { ReadonlySignal, Signal } from '@em/signals/signals';
export type { Config, ErrorHandler, ErrorInfo, ErrorPhase, StyleSource } from '@em/core/config';
export type { Context, Provision } from '@em/core/context';
export { mount } from '@em/utils/mount';
export type { Component } from '@em/core/component';
export type {
  AttributeMap,
  Child,
  ComponentProps,
  EventHandlerOptions,
  GlobalAttributes,
  ResolvedProps,
  TagName,
} from '@em/types';
