import { categorizedPageListByPublishedAt } from '../../../util/categorizedPageList';
import { AuthorLinks } from '../AuthorLinks';
import { PageLinkPublished } from '../PageLink';
import style from './style.module.scss';

export const SiteFooter = () => (
  <footer className={style.footer}>
    <section>
      <h2>書いたもの</h2>
      {categorizedPageListByPublishedAt.blogPost.map(([year, pages]) => (
        <div key={year}>
          <p>{year}</p>
          <ul>
            {pages.map((page) => (
              <li key={page.pathname}>
                <PageLinkPublished {...page} />
              </li>
            ))}
          </ul>
        </div>
      ))}
      <h2>その他</h2>
      <ul>
        {categorizedPageListByPublishedAt.others.map((page) => (
          <li key={page.pathname}>
            <PageLinkPublished {...page} />
          </li>
        ))}
      </ul>
    </section>
    <section>
      <div className={style.sign}>
        <span>&copy; 2013- Kei Ito</span>
        <AuthorLinks />
      </div>
    </section>
  </footer>
);
