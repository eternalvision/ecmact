import './styles.css';
import { mount } from 'ecmact';
import { App } from './app';
import { setup } from './setup';

setup();
mount('#app', App());
