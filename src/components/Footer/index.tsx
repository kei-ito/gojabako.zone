import {pageListByPublishedAt} from '../../util/pageList';
import {AuthorLinks} from '../AuthorLinks';
import {PageLinkPublished} from '../PageLink';
import {className} from './style.module.css';

export const Footer = () => <footer className={className.footer}>
    <section>
        <h2>書いたもの</h2>
        <ul>{pageListByPublishedAt.map((page) => <PageLinkPublished {...page} key={page.pathname}/>)}</ul>
    </section>
    <section>
        <div className={className.sign}>
            <span>&copy; 2013- Kei Ito</span>
            <AuthorLinks/>
        </div>
    </section>
</footer>;
