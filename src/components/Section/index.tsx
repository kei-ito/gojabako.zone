import type {PropsWithChildren} from 'react';
import {className} from './style.module.css';

export interface SectionProps {
    title?: string,
    id?: string,
}

export const Section = ({title, id = title, children}: PropsWithChildren<SectionProps>) => <section className={className.section}>
    {title ? <Title title={title} id={id}/> : null}
    {children}
</section>;

const Title = ({title, id: rawId}: SectionProps) => {
    if (rawId) {
        const id = rawId.replace(/\s+/, '_');
        return <h1 className={className.heading}>
            <div className="anchor" id={id}/>
            {title}&nbsp;
            <a className="link" href={`#${id}`}>link</a>
        </h1>;
    }
    return <h1 className={className.heading}>{title}</h1>;
};
