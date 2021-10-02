import type {PropsWithChildren} from 'react';
import {Heading} from '../Heading';
import {className} from './style.module.css';

export interface SectionProps {
    title?: string,
    id?: string,
}

export const Section = ({title, id = title, children}: PropsWithChildren<SectionProps>) => <section className={className.section}>
    {title ? <Heading level={1} id={id}>{title}</Heading> : null}
    {children}
</section>;
