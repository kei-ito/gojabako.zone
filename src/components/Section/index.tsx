import type {PropsWithChildren} from 'react';
import {className} from './style.module.css';

export interface SectionProps {
    title?: string,
    id?: string,
}

export const Section = ({title, id = title, children}: PropsWithChildren<SectionProps>) => <section className={className.section}>
    <div className={className.anchor} id={id}></div>
    {title ? <Title title={title} id={id}/> : null}
    {children}
</section>;

const Title = ({title, id = title}: SectionProps) => <h1 className={className.heading}>
    {title}
    <a className={className.link} href={`#${id}`}>link</a>
</h1>;
