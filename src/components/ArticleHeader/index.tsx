import type {PropsWithChildren} from 'react';
import type {PageDateProps} from '../PageDate';
import {PageDate} from '../PageDate';
import {className} from './style.module.css';

interface ArticleHeaderProps extends PageDateProps {}

export const ArticleHeader = (
    {children, ...props}: PropsWithChildren<ArticleHeaderProps>,
) => {
    return <header className={className.header}>
        {children}
        <PageDate {...props}/>
    </header>;
};
