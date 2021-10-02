import type {PropsWithChildren, DetailedHTMLProps, HTMLAttributes} from 'react';
import {className} from './style.module.css';

export interface HeadingProps extends DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> {
    level: number,
}

const H = ({level, children, ...props}: PropsWithChildren<HeadingProps>) => {
    switch (level) {
    case 1:
        return <h1 {...props}>{children}</h1>;
    case 2:
        return <h2 {...props}>{children}</h2>;
    case 3:
        return <h3 {...props}>{children}</h3>;
    case 4:
        return <h4 {...props}>{children}</h4>;
    case 5:
        return <h5 {...props}>{children}</h5>;
    default:
        return <h6 {...props}>{children}</h6>;
    }
};

export const Heading = ({id: rawId, children, ...props}: PropsWithChildren<HeadingProps>) => {
    if (rawId) {
        const id = rawId.replace(/\s+/, '_');
        const hash = `#${id}`;
        return <H {...props} className={className.heading}>
            <div className="anchor" id={id}/>
            {children}&nbsp;
            <a className="link" href={hash} title={hash}>#link</a>
        </H>;
    }
    return <H {...props} className={className.heading}>{children}</H>;
};
