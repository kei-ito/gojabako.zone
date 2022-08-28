// eslint-disable-next-line import/unambiguous
declare module '*.md' {
    import type {FunctionComponent} from 'react';

    const Component: FunctionComponent;
    // eslint-disable-next-line import/no-default-export
    export default Component;
}
