import {DateString} from '../DateString';
import {className} from './style.module.css';

export interface PageDateProps {
    filePath: string,
    publishedAt?: Date,
    updatedAt?: Date,
}

const Ms1Day = 86400000;
export const PageDate = ({filePath, publishedAt, updatedAt}: PageDateProps) => {
    if (publishedAt && updatedAt && Ms1Day < updatedAt.getTime() - publishedAt.getTime()) {
        return <div className={className.container}>
            <DateString date={publishedAt}/>
            &ensp;
            (<DateString date={updatedAt}/>更新)
            &ensp;
            <HistoryLink filePath={filePath}/>
        </div>;
    } else if (publishedAt) {
        return <div className={className.container}>
            <DateString date={updatedAt || publishedAt}/>
            &ensp;
            <HistoryLink filePath={filePath}/>
        </div>;
    }
    return null;
};

const HistoryLink = ({filePath}: {filePath: string}) => {
    const historyUrl = `https://github.com/kei-ito/gojabako.zone/commits/main/${filePath}`;
    return <a href={historyUrl} target="_blank" rel="noreferrer">更新履歴</a>;
};
