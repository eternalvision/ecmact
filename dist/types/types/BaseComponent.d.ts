export interface ComponentProps {
    content?: string;
    tag?: string;
    style?: Partial<CSSStyleDeclaration>;
    children?: HTMLElement[];
    slots?: Record<string, string>;
    ref?: (element: HTMLElement) => void;
    customEvents?: Record<string, (event: Event) => void>;
    [key: string]: any;
}
