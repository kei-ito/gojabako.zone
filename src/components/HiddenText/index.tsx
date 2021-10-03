import type {PropsWithChildren} from 'react';
import {className} from './style.module.css';

interface HiddenTextProps {}

export const HiddenText = ({children}: PropsWithChildren<HiddenTextProps>) => <span className={className.text}>
    {children}
</span>;
