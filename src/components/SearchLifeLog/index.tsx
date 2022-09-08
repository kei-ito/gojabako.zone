/* eslint-disable max-lines-per-function */
import {createTypeChecker, isString} from '@nlib/typing';
import type {ChangeEvent} from 'react';
import {useMemo, useCallback, useState} from 'react';
import {useSearchResult} from '../../hooks/useSearchResult';
import {classnames} from '../../util/classnames';
import {SearchResultText} from '../ui/SearchResultText';
import style from './style.module.scss';

const highlightTag = '[hit]';
const isLifeLogItem = createTypeChecker('LifeLogItem', {
    id: isString,
    date: isString,
    userId: isString,
    body: isString,
});

export const SearchLifeLog = () => {
    const [value, setValue] = useState('朝食 ごはん');
    const onChangeQuery = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value.trim());
    }, []);
    const [limit, setLimit] = useState(20);
    const onChangeLimit = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setLimit(Math.floor(Number(event.target.value.trim())));
    }, []);
    const options = useMemo(() => ({
        highlightPreTag: highlightTag,
        highlightPostTag: highlightTag,
        attributesToHighlight: ['body'],
        attributesToRetrieve: ['id', 'date', 'userId'],
        attributesToCrop: ['body'],
        cropLength: 30,
        limit,
    }), [limit]);
    const {host, result, error, loading} = useSearchResult('lifelog', value, options, isLifeLogItem);
    return <>
        <div className={style.form}>
            <div>
                <label>Query</label>
                <input
                    type="search"
                    onChange={onChangeQuery}
                    defaultValue={value}
                    autoFocus
                />
            </div>
            <div>
                <label>Limit</label>
                <input
                    type="number"
                    onChange={onChangeLimit}
                    defaultValue={limit}
                    step="1"
                    min="1"
                />
            </div>
        </div>
        <dl className={classnames(style.params, loading && style.loading)}>
            <dt>Host</dt><dd>{host}</dd>
            <dt>Loading</dt><dd>{`${loading}`}</dd>
            { error && <><dt>Error</dt><dd>{error}</dd></> }
            {
                result && <>
                    <dt>Query</dt><dd>{result.query}</dd>
                    <dt>Limit</dt><dd>{result.limit}</dd>
                    <dt>EstimatedTotalHits</dt><dd>{result.estimatedTotalHits}</dd>
                    <dt>processingTimeMs</dt><dd>{result.processingTimeMs} ms</dd>
                    <dt>totalMs</dt><dd>{result.totalMs} ms</dd>
                </>
            }
        </dl>
        {
            result && <div className={style.items}>
                {result.items.map((item, index) => <div key={item.id} className={style.item}>
                    <header>{index + 1}/{result.items.length} {item.date} {item.userId}</header>
                    <div><SearchResultText text={item.body} highlightTag={highlightTag}/></div>
                </div>)}
            </div>
        }
    </>;
};
