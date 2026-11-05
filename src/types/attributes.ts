export type Primitive = string | number | boolean | null | undefined;

type Size = number | string;
type Referrer =
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url';
type CrossOrigin = 'anonymous' | 'use-credentials' | '';
type Target = '_self' | '_blank' | '_parent' | '_top' | (string & {});
type Preload = 'none' | 'metadata' | 'auto' | '';

export interface GlobalAttributes {
  id?: string;
  class?: string;
  title?: string;
  lang?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
  hidden?: boolean | 'until-found';
  inert?: boolean;
  tabindex?: number;
  role?: string;
  slot?: string;
  part?: string;
  accesskey?: string;
  translate?: 'yes' | 'no';
  spellcheck?: 'true' | 'false';
  draggable?: 'true' | 'false';
  contenteditable?: 'true' | 'false' | 'plaintext-only' | '';
  inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  [attribute: `data-${string}`]: Primitive;
  [attribute: `aria-${string}`]: Primitive;
}

export interface AttributeMap {
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
  };
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
  };
  form: {
    action?: string;
    method?: 'get' | 'post' | 'dialog';
    enctype?: string;
    target?: Target;
    name?: string;
    novalidate?: boolean;
    autocomplete?: string;
    'accept-charset'?: string;
  };
  label: { for?: string; form?: string };
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
  option: { value?: string | number; label?: string; selected?: boolean; disabled?: boolean };
  optgroup: { label?: string; disabled?: boolean };
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
  fieldset: { name?: string; disabled?: boolean; form?: string };
  output: { for?: string; form?: string; name?: string };
  progress: { value?: number; max?: number };
  meter: {
    value?: number;
    min?: number;
    max?: number;
    low?: number;
    high?: number;
    optimum?: number;
  };
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
  iframe: {
    src?: string;
    srcdoc?: string;
    name?: string;
    width?: Size;
    height?: Size;
    allow?: string;
    allowfullscreen?: boolean;
    sandbox?: string;
    loading?: 'eager' | 'lazy';
    referrerpolicy?: Referrer;
  };
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
  };
  audio: {
    src?: string;
    controls?: boolean;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    preload?: Preload;
    crossorigin?: CrossOrigin;
  };
  source: {
    src?: string;
    srcset?: string;
    sizes?: string;
    type?: string;
    media?: string;
    width?: Size;
    height?: Size;
  };
  canvas: { width?: Size; height?: Size };
  td: { colspan?: number; rowspan?: number; headers?: string };
  th: { colspan?: number; rowspan?: number; headers?: string; scope?: string; abbr?: string };
  col: { span?: number };
  colgroup: { span?: number };
  ol: { start?: number; reversed?: boolean; type?: '1' | 'a' | 'A' | 'i' | 'I' };
  li: { value?: number };
  details: { open?: boolean; name?: string };
  dialog: { open?: boolean };
  blockquote: { cite?: string };
  q: { cite?: string };
  time: { datetime?: string };
  meta: { name?: string; content?: string; charset?: string; 'http-equiv'?: string };
  track: {
    src?: string;
    kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
    srclang?: string;
    label?: string;
    default?: boolean;
  };
  slot: { name?: string };
  data: { value?: string };
  del: { cite?: string; datetime?: string };
  ins: { cite?: string; datetime?: string };
}
