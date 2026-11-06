import { mount, tags } from 'ecmact';
import { createCounter } from './counter';

mount('#app', tags.h1({ content: 'Hello, ECMact' }), createCounter());
