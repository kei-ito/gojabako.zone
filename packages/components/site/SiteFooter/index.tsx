import type {FC} from 'react';
import {categorizedPageListByPublishedAt} from '../../../util/categorizedPageList';
import {AuthorLinks} from '../AuthorLinks';
import {PageLinkPublished} from '../PageLink';
import {className} from './style.module.css';

export const SiteFooter: FC = () => <footer className={className.footer}>
    <section>
        <h2>書いたもの</h2>
        {categorizedPageListByPublishedAt.blogPost.map(([year, pages]) => <div key={year}>
            <p>{year}</p>
            <ul>
                {pages.map((page) => <li key={page.pathname}><PageLinkPublished {...page}/></li>)}
            </ul>
        </div>)}
        <h2>その他</h2>
        <ul>{categorizedPageListByPublishedAt.others.map((page) => <li key={page.pathname}><PageLinkPublished {...page}/></li>)}</ul>
    </section>
    <section>
        <div className={className.sign}>
            <span>&copy; 2013- Kei Ito</span>
            <AuthorLinks/>
        </div>
    </section>
</footer>;
