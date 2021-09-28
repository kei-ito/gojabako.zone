import type {PropsWithChildren} from 'react';
import {className} from './style.module.css';

export interface MainProps {}

export const Main = ({children}: PropsWithChildren<MainProps>) => <main className={className.main}>
    {children}
</main>;
