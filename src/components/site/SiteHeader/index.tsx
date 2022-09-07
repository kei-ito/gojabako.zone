import type {GuardedType} from '@nlib/typing';
import {createTypeChecker, ensure, isString} from '@nlib/typing';
import {MeiliSearch} from 'meilisearch';
import Link from 'next/link';
import {useEffect, useMemo, useState} from 'react';
import {siteName} from '../../../../config.site.mjs';
import {useDebouncedValue} from '../../../hooks/useDebouncedValue';
import {classnames} from '../../../util/classnames';
import {AuthorLinks} from '../AuthorLinks';
import {Logo} from '../Logo';
import style from './style.module.scss';

const meilisearchHost = ensure(process.env.NEXT_PUBLIC_MEILISEARCH_HOST, isString);
const meilisearchApiKey = ensure(process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_API_KEY, isString);
const useMeilisearchClient = () => useMemo(() => {
    return new MeiliSearch({host: meilisearchHost, apiKey: meilisearchApiKey});
}, []);

const useMeilisearchIndex = (indexName: string) => {
    const client = useMeilisearchClient();
    return useMemo(() => client.index(indexName), [client, indexName]);
};
const isPageInfo = createTypeChecker('PageInfo', {
    pathname: isString,
    title: isString,
    body: isString,
    publishedAt: isString,
    updatedAt: isString,
});
type PageInfo = GuardedType<typeof isPageInfo>;
const listSearchResult = function* (hits: Array<Record<string, unknown>>) {
    for (const {_formatted} of hits) {
        if (isPageInfo(_formatted)) {
            yield _formatted;
        }
    }
};

const highlightTag = '[hit]';
export const useCandidates = (search: string) => {
    const debounced = useDebouncedValue(search, 200);
    const index = useMeilisearchIndex('page');
    const [candidates, setCandidates] = useState<Array<PageInfo> | null>(null);
    useEffect(() => {
        let aborted = false;
        if (debounced.trim()) {
            index.search(debounced, {
                highlightPreTag: highlightTag,
                highlightPostTag: highlightTag,
                attributesToHighlight: ['body'],
                attributesToRetrieve: ['pathname', 'title', 'publishedAt', 'updatedAt'],
                attributesToCrop: ['body'],
                cropLength: 20,
            })
            .then((result) => {
                if (!aborted) {
                    setCandidates([...listSearchResult(result.hits)]);
                }
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.error(error);
            });
        } else {
            setCandidates(null);
        }
        return () => {
            aborted = true;
        };
    }, [index, debounced]);
    return candidates;
};

interface SearchResultProps {
    focused: boolean,
    value: string,
    candidates: Array<PageInfo>,
}
export const SearchResult = ({focused, value, candidates}: SearchResultProps) => {
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
    if (hidden) {
        return null;
    }
    if (candidates.length === 0) {
        return <div className={classnames(style.searchResult, style.empty)}>
            &quot;{value}&quot;を含むページが見つかりませんでした
        </div>;
    }
    return <div className={style.searchResult}>
        {candidates.map((item) => <SearchResultItem {...item} key={item.pathname}/>)}
    </div>;
};

const parseBody = function* (body: string) {
    let count = 0;
    for (const word of body.split(highlightTag)) {
        if (count++ % 2) {
            yield <em key={count}>{word}</em>;
        } else {
            yield word;
        }
    }
};

const SearchResultItem = (page: PageInfo) => {
    return <Link href={page.pathname || '/'}>
        <a>
            <h1>{page.title}</h1>
            <div className={style.body}>{[...parseBody(page.body)]}</div>
        </a>
    </Link>;
};

export const SiteHeader = () => {
    // const {focused, onFocus, onBlur} = useFocus();
    // const [value, setValue] = useState('');
    // const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    //     setValue(event.target.value.trim());
    // }, []);
    // const candidates = useCandidates(value);
    return <header className={style.header}>
        <div className={style.container}>
            <Link href="/">
                <a className={style.link}>
                    <Logo className={style.logo} />
                    <h1 className={style.title}>{siteName}</h1>
                </a>
            </Link>
            <div/>
            {/* <input
                className={classnames(style.search, value && style.active)}
                onChange={onChange}
                defaultValue={value}
                onFocus={onFocus}
                onBlur={onBlur}
            /> */}
            <AuthorLinks/>
        </div>
        {/* {candidates && <SearchResult
            focused={focused}
            value={value}
            candidates={candidates}
        />} */}
    </header>;
};
