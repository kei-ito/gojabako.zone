import type {FC} from 'react';
import {className} from './style.module.css';

export const HiddenText: FC = ({children}) => <span className={className.text}>
    {children}
</span>;
