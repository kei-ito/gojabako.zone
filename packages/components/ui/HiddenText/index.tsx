import type {PropsWithChildren} from 'react';
import {className} from './style.module.css';

interface Props {}

export const HiddenText = ({children}: PropsWithChildren<Props>) => <span className={className.text}>
    {children}
</span>;
