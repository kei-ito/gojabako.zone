import type {PropsWithChildren} from 'react';
import type {PageDateProps} from '../PageDate';
import {PageDate} from '../PageDate';

interface ArticleHeaderProps extends PageDateProps {}

export const ArticleHeader = (
    {children, ...props}: PropsWithChildren<ArticleHeaderProps>,
) => {
    return <header>
        {children}
        <PageDate {...props}/>
    </header>;
};
