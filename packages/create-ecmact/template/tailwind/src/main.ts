import { configure, mount, tags } from 'ecmact';
import { createCounter } from './counter';
import tailwind from './tailwind.css?inline';

configure({ styles: [tailwind] });

mount(
  '#app',
  tags.h1({ class: 'p-4 text-3xl font-bold', content: 'Hello, ECMact' }),
  createCounter(),
);
