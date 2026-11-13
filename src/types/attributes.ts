import type { ClassValue } from '@em/types/props';

/** A value that can be an attribute or be left out: text, a number, a boolean (`true` sets an empty attribute), or `null` and `undefined` for none. */
export type Primitive = string | number | boolean | null | undefined;

/** A length for `width` and `height`: a number of pixels or a string such as `50%`. */
type Size = number | string;
/** The referrer policies of the `referrerpolicy` attribute. */
type Referrer =
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url';
/** The values of the `crossorigin` attribute. */
type CrossOrigin = 'anonymous' | 'use-credentials' | '';
/** The browsing context to open a link in: one of the keywords, or the name of a frame. */
type Target = '_self' | '_blank' | '_parent' | '_top' | (string & {});
/** The values of the `preload` attribute of media elements. */
type Preload = 'none' | 'metadata' | 'auto' | '';

/** The attributes every HTML element accepts, plus `data-*` and `aria-*`. */
export interface GlobalAttributes {
  /** A unique identifier of the element. */
  id?: string;
  /** The CSS classes: text, a list, or an object whose keys are the names and whose values switch them on. */
  class?: ClassValue;
  /** Advisory text, usually shown as a tooltip. */
  title?: string;
  /** The language of the content, for example `en`. */
  lang?: string;
  /** The text direction. */
  dir?: 'ltr' | 'rtl' | 'auto';
  /** Hides the element; `until-found` lets find-in-page reveal it. */
  hidden?: boolean | 'until-found';
  /** Makes the element and its content unreachable for interaction. */
  inert?: boolean;
  /** The position of the element in the tab order. */
  tabindex?: number;
  /** The ARIA role. */
  role?: string;
  /** The name of the slot of the parent shadow tree to assign the element to. */
  slot?: string;
  /** Names that let outside CSS style the element with `::part()`. */
  part?: string;
  /** A keyboard shortcut key. */
  accesskey?: string;
  /** Whether the content is translated when the page is localized. */
  translate?: 'yes' | 'no';
  /** Whether the content is spell checked. */
  spellcheck?: 'true' | 'false';
  /** Whether the element can be dragged. */
  draggable?: 'true' | 'false';
  /** Whether the user can edit the content. */
  contenteditable?: 'true' | 'false' | 'plaintext-only' | '';
  /** The kind of virtual keyboard to show. */
  inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  /** The label of the enter key on virtual keyboards. */
  enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
  /** How text typed by the user is capitalized. */
  autocapitalize?: 'none' | 'off' | 'on' | 'sentences' | 'words' | 'characters';
  /** Focuses the element when the page loads. */
  autofocus?: boolean;
  /** A cryptographic nonce for the content security policy. */
  nonce?: string;
  /** Makes the element a popover. */
  popover?: 'auto' | 'manual' | 'hint' | '';
  /** The name of a customized built-in element to use. */
  is?: string;
  /** Forwards the `part` names of a nested shadow tree. */
  exportparts?: string;
  /** A global identifier for microdata. */
  itemid?: string;
  /** A microdata property name. */
  itemprop?: string;
  /** Ids of elements that hold more microdata properties. */
  itemref?: string;
  /** Creates a microdata item. */
  itemscope?: boolean;
  /** The microdata vocabulary. */
  itemtype?: string;
  /** Custom data attributes, such as `data-id`. */
  [attribute: `data-${string}`]: Primitive;
  /** ARIA attributes, such as `aria-label`. */
  [attribute: `aria-${string}`]: Primitive;
}

/** The attributes of the elements that have their own, by tag. Other standard tags only accept the global attributes. */
export interface AttributeMap {
  /** The attributes of `<a>`, a link. */
  a: {
    href?: string;
    target?: Target;
    rel?: string;
    download?: string | boolean;
    hreflang?: string;
    type?: string;
    ping?: string;
    referrerpolicy?: Referrer;
  };
  /** The attributes of `<area>`, a clickable area of an image map. */
  area: {
    alt?: string;
    coords?: string;
    shape?: 'rect' | 'circle' | 'poly' | 'default';
    href?: string;
    target?: Target;
    rel?: string;
    download?: string | boolean;
    hreflang?: string;
    ping?: string;
    referrerpolicy?: Referrer;
  };
  /** The attributes of `<map>`, an image map. */
  map: { name?: string };
  /** The attributes of `<base>`, the document base URL. */
  base: { href?: string; target?: Target };
  /** The attributes of `<embed>`, embedded external content. */
  embed: { src?: string; type?: string; width?: Size; height?: Size };
  /** The attributes of `<object>`, an embedded object. */
  object: {
    data?: string;
    type?: string;
    name?: string;
    form?: string;
    usemap?: string;
    width?: Size;
    height?: Size;
  };
  /** The attributes of `<style>`, an embedded stylesheet. */
  style: { media?: string; blocking?: string };
  /** The attributes of `<template>`, an inert template. */
  template: {
    shadowrootmode?: 'open' | 'closed';
    shadowrootdelegatesfocus?: boolean;
    shadowrootclonable?: boolean;
    shadowrootserializable?: boolean;
  };
  /** The attributes of `<img>`, an image. */
  img: {
    src?: string;
    srcset?: string;
    sizes?: string;
    alt?: string;
    width?: Size;
    height?: Size;
    loading?: 'eager' | 'lazy';
    decoding?: 'sync' | 'async' | 'auto';
    fetchpriority?: 'high' | 'low' | 'auto';
    crossorigin?: CrossOrigin;
    referrerpolicy?: Referrer;
    usemap?: string;
    ismap?: boolean;
  };
  /** The attributes of `<input>`, a form input. */
  input: {
    type?:
      | 'button'
      | 'checkbox'
      | 'color'
      | 'date'
      | 'datetime-local'
      | 'email'
      | 'file'
      | 'hidden'
      | 'image'
      | 'month'
      | 'number'
      | 'password'
      | 'radio'
      | 'range'
      | 'reset'
      | 'search'
      | 'submit'
      | 'tel'
      | 'text'
      | 'time'
      | 'url'
      | 'week';
    name?: string;
    value?: string | number;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    checked?: boolean;
    multiple?: boolean;
    autofocus?: boolean;
    autocomplete?: string;
    accept?: string;
    min?: string | number;
    max?: string | number;
    step?: string | number;
    minlength?: number;
    maxlength?: number;
    size?: number;
    pattern?: string;
    list?: string;
    form?: string;
    src?: string;
    alt?: string;
    width?: Size;
    height?: Size;
    capture?: 'user' | 'environment' | boolean;
    dirname?: string;
    formaction?: string;
    formenctype?: string;
    formmethod?: 'get' | 'post' | 'dialog';
    formnovalidate?: boolean;
    formtarget?: Target;
    popovertarget?: string;
    popovertargetaction?: 'show' | 'hide' | 'toggle';
  };
  /** The attributes of `<button>`, a button. */
  button: {
    type?: 'button' | 'submit' | 'reset';
    name?: string;
    value?: string;
    disabled?: boolean;
    autofocus?: boolean;
    form?: string;
    formaction?: string;
    formmethod?: 'get' | 'post' | 'dialog';
    formtarget?: Target;
    formnovalidate?: boolean;
    formenctype?: string;
    popovertarget?: string;
    popovertargetaction?: 'show' | 'hide' | 'toggle';
  };
  /** The attributes of `<form>`, a form. */
  form: {
    rel?: string;
    action?: string;
    method?: 'get' | 'post' | 'dialog';
    enctype?: string;
    target?: Target;
    name?: string;
    novalidate?: boolean;
    autocomplete?: string;
    'accept-charset'?: string;
  };
  /** The attributes of `<label>`, a form label. */
  label: { for?: string; form?: string };
  /** The attributes of `<select>`, a drop-down list. */
  select: {
    name?: string;
    disabled?: boolean;
    multiple?: boolean;
    required?: boolean;
    autofocus?: boolean;
    autocomplete?: string;
    size?: number;
    form?: string;
  };
  /** The attributes of `<option>`, an option of a list. */
  option: { value?: string | number; label?: string; selected?: boolean; disabled?: boolean };
  /** The attributes of `<optgroup>`, a group of options. */
  optgroup: { label?: string; disabled?: boolean };
  /** The attributes of `<textarea>`, a multi-line text field. */
  textarea: {
    name?: string;
    placeholder?: string;
    rows?: number;
    cols?: number;
    wrap?: 'soft' | 'hard' | 'off';
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    autofocus?: boolean;
    autocomplete?: string;
    minlength?: number;
    maxlength?: number;
    form?: string;
  };
  /** The attributes of `<fieldset>`, a group of form controls. */
  fieldset: { name?: string; disabled?: boolean; form?: string };
  /** The attributes of `<output>`, the result of a calculation. */
  output: { for?: string; form?: string; name?: string };
  /** The attributes of `<progress>`, a progress bar. */
  progress: { value?: number; max?: number };
  /** The attributes of `<meter>`, a gauge. */
  meter: {
    value?: number;
    min?: number;
    max?: number;
    low?: number;
    high?: number;
    optimum?: number;
  };
  /** The attributes of `<link>`, an external resource link. */
  link: {
    href?: string;
    rel?: string;
    type?: string;
    media?: string;
    as?: string;
    sizes?: string;
    hreflang?: string;
    integrity?: string;
    crossorigin?: CrossOrigin;
    referrerpolicy?: Referrer;
  };
  /** The attributes of `<script>`, a script. */
  script: {
    src?: string;
    type?: string;
    async?: boolean;
    defer?: boolean;
    nomodule?: boolean;
    integrity?: string;
    crossorigin?: CrossOrigin;
    referrerpolicy?: Referrer;
  };
  /** The attributes of `<iframe>`, an inline frame. */
  iframe: {
    src?: string;
    srcdoc?: string;
    name?: string;
    width?: Size;
    height?: Size;
    allow?: string;
    allowfullscreen?: boolean;
    csp?: string;
    sandbox?: string;
    loading?: 'eager' | 'lazy';
    referrerpolicy?: Referrer;
  };
  /** The attributes of `<video>`, a video player. */
  video: {
    src?: string;
    poster?: string;
    width?: Size;
    height?: Size;
    controls?: boolean;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    playsinline?: boolean;
    preload?: Preload;
    crossorigin?: CrossOrigin;
    controlslist?: string;
    disablepictureinpicture?: boolean;
    disableremoteplayback?: boolean;
  };
  /** The attributes of `<audio>`, an audio player. */
  audio: {
    src?: string;
    controls?: boolean;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    preload?: Preload;
    crossorigin?: CrossOrigin;
    controlslist?: string;
    disableremoteplayback?: boolean;
  };
  /** The attributes of `<source>`, a media source. */
  source: {
    src?: string;
    srcset?: string;
    sizes?: string;
    type?: string;
    media?: string;
    width?: Size;
    height?: Size;
  };
  /** The attributes of `<canvas>`, a drawing surface. */
  canvas: { width?: Size; height?: Size };
  /** The attributes of `<td>`, a table data cell. */
  td: { colspan?: number; rowspan?: number; headers?: string };
  /** The attributes of `<th>`, a table header cell. */
  th: {
    colspan?: number;
    rowspan?: number;
    headers?: string;
    scope?: 'row' | 'col' | 'rowgroup' | 'colgroup';
    abbr?: string;
  };
  /** The attributes of `<col>`, a table column. */
  col: { span?: number };
  /** The attributes of `<colgroup>`, a group of table columns. */
  colgroup: { span?: number };
  /** The attributes of `<ol>`, an ordered list. */
  ol: { start?: number; reversed?: boolean; type?: '1' | 'a' | 'A' | 'i' | 'I' };
  /** The attributes of `<li>`, a list item. */
  li: { value?: number };
  /** The attributes of `<details>`, a disclosure widget. */
  details: { open?: boolean; name?: string };
  /** The attributes of `<dialog>`, a dialog box. */
  dialog: { open?: boolean };
  /** The attributes of `<blockquote>`, a block quotation. */
  blockquote: { cite?: string };
  /** The attributes of `<q>`, an inline quotation. */
  q: { cite?: string };
  /** The attributes of `<time>`, a date or time. */
  time: { datetime?: string };
  /** The attributes of `<track>`, a text track of a media element. */
  track: {
    src?: string;
    kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
    srclang?: string;
    label?: string;
    default?: boolean;
  };
  /** The attributes of `<slot>`, a slot of a shadow tree. */
  slot: { name?: string };
  /** The attributes of `<data>`, a machine-readable value. */
  data: { value?: string };
  /** The attributes of `<del>`, deleted text. */
  del: { cite?: string; datetime?: string };
  /** The attributes of `<ins>`, inserted text. */
  ins: { cite?: string; datetime?: string };
}
