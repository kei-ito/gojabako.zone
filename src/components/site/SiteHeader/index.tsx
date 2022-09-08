import type {GuardedType} from '@nlib/typing';
import {createTypeChecker, isString} from '@nlib/typing';
import Link from 'next/link';
import type {ChangeEvent} from 'react';
import {useCallback, useEffect, useState} from 'react';
import {siteName} from '../../../../config.site.mjs';
import {useFocus} from '../../../hooks/useFocus';
import type {SearchState} from '../../../hooks/useSearchResult';
import {useSearchResult} from '../../../hooks/useSearchResult';
import {classnames} from '../../../util/classnames';
import {SearchResultText} from '../../ui/SearchResultText';
import {AuthorLinks} from '../AuthorLinks';
import {Logo} from '../Logo';
import style from './style.module.scss';

const highlightTag = '[hit]';
const searchOptions = {
    highlightPreTag: highlightTag,
    highlightPostTag: highlightTag,
    attributesToHighlight: ['body'],
    attributesToRetrieve: ['pathname', 'title', 'publishedAt', 'updatedAt'],
    attributesToCrop: ['body'],
    cropLength: 20,
};
const isPageInfo = createTypeChecker('PageInfo', {
    pathname: isString,
    title: isString,
    body: isString,
    publishedAt: isString,
    updatedAt: isString,
});
type PageInfo = GuardedType<typeof isPageInfo>;

interface SearchResultProps {
    focused: boolean,
    search: SearchState<PageInfo>,
}
const SearchResult = (
    {
        focused,
        search: {active, loading, result},
    }: SearchResultProps,
) => {
    const [hidden, setHidden] = useState(true);
    useEffect(() => {
        if (focused) {
            setHidden(false);
        }
        const timerId = setTimeout(() => {
            if (!focused) {
                setHidden(true);
            }
        }, 50);
        return () => {
            clearTimeout(timerId);
        };
    }, [focused]);
    if (active && loading && !result) {
        return <div className={classnames(style.searchResult, style.empty)}>
            検索中です
        </div>;
    }
    if (hidden || !active || !result) {
        return null;
    }
    if (result.items.length === 0) {
        return <div className={classnames(style.searchResult, style.empty)}>
            &quot;{result.query}&quot;を含むページが見つかりませんでした
        </div>;
    }
    return <div className={style.searchResult}>
        {result.items.map((item) => <SearchResultItem {...item} key={item.pathname}/>)}
    </div>;
};

const SearchResultItem = (page: PageInfo) => {
    return <Link href={page.pathname || '/'}>
        <a>
            <h1>{page.title}</h1>
            <div className={style.body}>
                <SearchResultText text={page.body} highlightTag={highlightTag}/>
            </div>
        </a>
    </Link>;
};

export const SiteHeader = () => {
    const {focused, onFocus, onBlur} = useFocus();
    const [value, setValue] = useState('');
    const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value.trim());
    }, []);
    const search = useSearchResult('page', value, searchOptions, isPageInfo);
    return <header className={style.header}>
        <div className={style.container}>
            <Link href="/">
                <a className={style.link}>
                    <Logo className={style.logo} />
                    <h1 className={style.title}>{siteName}</h1>
                </a>
            </Link>
            {/* <div/> */}
            <input
                className={classnames(style.search, value && style.active)}
                onChange={onChange}
                defaultValue={value}
                onFocus={onFocus}
                onBlur={onBlur}
            />
            <AuthorLinks/>
        </div>
        <SearchResult focused={focused} search={search}/>
    </header>;
};
