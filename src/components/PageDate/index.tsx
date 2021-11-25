import {getPageData} from '../../util/getPageData';
import {DateString} from '../DateString';
import {className} from './style.module.css';

export interface PageDateProps {
    pathname: string,
    onlyUpdate?: boolean,
}

export const PageDate = ({pathname, onlyUpdate}: PageDateProps) => {
    const {publishedAt, updatedAt, commitCount, filePath} = getPageData(pathname);
    const historyUrl = `https://github.com/gjbkz/gojabako.zone/commits/main/${filePath}`;
    if (onlyUpdate) {
        return <section className={className.container}>
            最終更新&ensp;<DateString date={updatedAt}/>
            &ensp;
            <a href={historyUrl} target="_blank" rel="noreferrer">履歴 ({commitCount})</a>
        </section>;
    }
    return <section className={className.container}>
        <DateString date={publishedAt}/>
        {1 < commitCount && <>&ensp;(<DateString date={updatedAt}/>更新)</>}
        &ensp;
        <a href={historyUrl} target="_blank" rel="noreferrer">履歴 ({commitCount})</a>
    </section>;
};
