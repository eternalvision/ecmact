import { ComponentProps } from './types';
export declare class component extends HTMLElement {
    #private;
    private _props;
    constructor(props?: ComponentProps);
    connectedCallback(): void;
    setState(newProps: Partial<ComponentProps>): void;
    get props(): ComponentProps;
    set props(newProps: ComponentProps);
}
