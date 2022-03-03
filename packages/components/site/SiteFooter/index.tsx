import type {FC} from 'react';
import styled from 'styled-components';
import {categorizedPageListByPublishedAt} from '../../../site/categorizedPageList';
import {AuthorLinks} from '../AuthorLinks';
import {PageLinkPublished} from '../PageLink';

export const SiteFooter: FC = () => <Footer>
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
        <Sign>
            <span>&copy; 2013- Kei Ito</span>
            <AuthorLinks/>
        </Sign>
    </section>
</Footer>;

const Footer = styled.footer`
    position: sticky;
    inset-block-start: 100%;
    display: grid;
    grid-auto-flow: row;
    justify-content: stretch;
    padding-block-start: 1rem;
    background-color: var(--gray2);
    border-block-start: solid 1px var(--gray3);
`;

const Sign = styled.div`
    display: grid;
    grid-template-columns: 1fr repeat(2, auto);
    grid-auto-flow: column;
    column-gap: 0.5rem;
    justify-items: end;
    align-items: center;
    padding-block-start: 1rem;
    padding-block-end: 1rem;
`;
