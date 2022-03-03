import type {FC} from 'react';
import styled from 'styled-components';
import {usePageData} from '../../../hooks/usePageData';
import {DateString} from '../../ui/DateString';

export interface PageDataProps {
    pathname: string,
    onlyUpdate?: boolean,
}

export const PageTitle: FC<PageDataProps> = ({pathname, onlyUpdate}) => {
    const {title, commitCount, filePath} = usePageData(pathname);
    const historyUrl = `https://github.com/gjbkz/gojabako.zone/commits/main/${filePath}`;
    return <Container>
        <h1>{title}</h1>
        <Data>
            <Date pathname={pathname} onlyUpdate={onlyUpdate}/>
            &ensp;
            <a href={historyUrl} target="_blank" rel="noreferrer">履歴 ({commitCount})</a>
        </Data>
    </Container>;
};

const Container = styled.header`
    display: grid;
    grid-auto-flow: row;
    row-gap: 0.2rem;
`;

const Data = styled.div`
    display: block;
    font-size: 80%;
`;

const Date = ({pathname, onlyUpdate}: PageDataProps) => {
    const {publishedAt, updatedAt, commitCount, archiveOf} = usePageData(pathname);
    if (archiveOf) {
        return <>
            <DateString dateTime={publishedAt || updatedAt}/>
            &thinsp;
            に
            &thinsp;
            <a href={archiveOf} target="_blank" rel="noreferrer">
                {archiveOf.replace(/^https?:\/\//, '')}
            </a>
            &thinsp;
            で公開
            {1 < commitCount && <> (<DateString dateTime={updatedAt}/> 更新)</>}
        </>;
    }
    if (onlyUpdate) {
        return <><DateString dateTime={updatedAt}/> 更新</>;
    }
    return <>
        <DateString dateTime={publishedAt}/> 公開
        {1 < commitCount && <> (<DateString dateTime={updatedAt}/> 更新)</>}
    </>;
};
