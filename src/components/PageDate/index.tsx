import {DateString} from '../DateString';
import {className} from './style.module.css';

export interface PageDateProps {
    filePath?: string,
    publishedAt?: string | null,
    updatedAt?: string | null,
}

export const PageDate = ({filePath, publishedAt, updatedAt}: PageDateProps) => {
    if (publishedAt && updatedAt && publishedAt !== updatedAt) {
        return <section className={className.container}>
            <DateString date={publishedAt}/>
            &ensp;
            (<DateString date={updatedAt}/>更新)
            &ensp;
            {filePath && <HistoryLink filePath={filePath}/>}
        </section>;
    } else if (publishedAt) {
        return <section className={className.container}>
            <DateString date={updatedAt || publishedAt}/>
            &ensp;
            {filePath && <HistoryLink filePath={filePath}/>}
        </section>;
    }
    return null;
};

const HistoryLink = ({filePath}: {filePath: string}) => {
    const historyUrl = `https://github.com/kei-ito/gojabako.zone/commits/main/${filePath}`;
    return <a href={historyUrl} target="_blank" rel="noreferrer">更新履歴</a>;
};
