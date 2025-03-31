import { component } from './component';
import { ComponentProps } from './types';
interface ComponentRegistry {
    [key: string]: (props: ComponentProps) => component;
}
declare const em: ComponentRegistry;
export { em };
