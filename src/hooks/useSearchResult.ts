import type {TypeChecker} from '@nlib/typing';
import {MeiliSearch} from 'meilisearch';
import type {SearchParams, SearchResponse} from 'meilisearch';
import {useEffect, useMemo, useState} from 'react';

const meilisearchHost = 'https://search.gojabako.zone';
const meilisearchApiKey = 'c374be2d44102f736d5c0631b3f3d23e336bb3602e84801bf1908e658aa22d3a';
const useMeilisearchClient = () => useMemo(() => {
    return new MeiliSearch({host: meilisearchHost, apiKey: meilisearchApiKey});
}, []);

const useMeilisearchIndex = (indexName: string) => {
    const client = useMeilisearchClient();
    return useMemo(() => client.index(indexName), [client, indexName]);
};

const listFormatted = function* <T>(
    hits: Array<Record<string, unknown>>,
    typeChecker: TypeChecker<T>,
) {
    for (const {_formatted} of hits) {
        if (typeChecker(_formatted)) {
            yield _formatted;
        }
    }
};

interface Result<T> extends Omit<SearchResponse, 'hits'> {
    items: Array<T>,
}

export interface SearchState<T> {
    active: boolean,
    loading: boolean,
    result?: Result<T>,
    error?: string,
}

export const useSearchResult = <T>(
    indexName: string,
    query: string,
    options: SearchParams,
    typeChecker: TypeChecker<T>,
) => {
    const index = useMeilisearchIndex(indexName);
    const [searchState, setSearchState] = useState<SearchState<T>>({active: false, loading: false});
    useEffect(() => {
        let aborted = false;
        if (query.trim()) {
            setSearchState((c) => ({...c, active: true, loading: true}));
            index.search(query, options)
            .then(({hits, ...others}) => {
                if (!aborted) {
                    setSearchState({
                        active: true,
                        loading: false,
                        result: {
                            ...others,
                            items: [...listFormatted(hits, typeChecker)],
                        },
                    });
                }
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.error(error);
                setSearchState((c) => ({...c, active: true, loading: false, error: `${error}`}));
            });
        } else {
            setSearchState({active: false, loading: false});
        }
        return () => {
            aborted = true;
        };
    }, [index, options, query, typeChecker]);
    return searchState;
};
