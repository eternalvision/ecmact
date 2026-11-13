import { translation as api } from '@site/content/docs/ru/api';
import { translation as comparison } from '@site/content/docs/ru/comparison';
import { translation as components } from '@site/content/docs/ru/components';
import { translation as context } from '@site/content/docs/ru/context';
import { translation as data } from '@site/content/docs/ru/data';
import { translation as forms } from '@site/content/docs/ru/forms';
import { translation as gettingStarted } from '@site/content/docs/ru/getting-started';
import { translation as http } from '@site/content/docs/ru/http';
import { translation as lifecycle } from '@site/content/docs/ru/lifecycle';
import { translation as limitations } from '@site/content/docs/ru/limitations';
import { translation as routing } from '@site/content/docs/ru/routing';
import { translation as security } from '@site/content/docs/ru/security';
import { translation as signals } from '@site/content/docs/ru/signals';
import { translation as state } from '@site/content/docs/ru/state';
import { translation as styled } from '@site/content/docs/ru/styled';
import { translation as styling } from '@site/content/docs/ru/styling';
import { translation as tooling } from '@site/content/docs/ru/tooling';
import { translation as typescript } from '@site/content/docs/ru/typescript';
import { translation as widgets } from '@site/content/docs/ru/widgets';

/** The Russian translation of every documentation page, by slug. */
export const russian: Record<string, string[]> = {
  'getting-started': gettingStarted,
  comparison,
  components,
  signals,
  styling,
  styled,
  lifecycle,
  context,
  forms,
  routing,
  state,
  http,
  data,
  widgets,
  tooling,
  typescript,
  security,
  limitations,
  api,
};
