export type StyleSource = string | CSSStyleSheet;

export interface Config {
  shadow: boolean;
  styles: StyleSource[];
}

const defaults = (): Config => ({ shadow: true, styles: [] });

let current = defaults();

export const configure = (options: Partial<Config>) => {
  current = { ...current, ...options };
};

export const getConfig = () => current;

export const resetConfig = () => {
  current = defaults();
};
