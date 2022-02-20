import {usePageData} from '../../use/PageData';
import {DateString} from '../DateString';
import {className} from './style.module.css';

export interface PageDataProps {
    pathname: string,
    onlyUpdate?: boolean,
}

export const PageData = ({pathname, onlyUpdate}: PageDataProps) => {
    const {commitCount, filePath} = usePageData(pathname);
    const historyUrl = `https://github.com/gjbkz/gojabako.zone/commits/main/${filePath}`;
    return <section className={className.container}>
        <Date pathname={pathname} onlyUpdate={onlyUpdate}/>
        &ensp;
        <a href={historyUrl} target="_blank" rel="noreferrer">履歴 ({commitCount})</a>
    </section>;
};

const Date = ({pathname, onlyUpdate}: PageDataProps) => {
    const {publishedAt, updatedAt, commitCount, archiveOf} = usePageData(pathname);
    if (archiveOf) {
        return <>
            <DateString dateTime={publishedAt || updatedAt}/> に <a href={archiveOf} target="_blank" rel="noreferrer">{archiveOf.replace(/^https?:\/\//, '')}</a> で公開
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
