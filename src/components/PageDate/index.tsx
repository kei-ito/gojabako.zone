import {getPageData} from '../../util/getPageData';
import {DateString} from '../DateString';
import {className} from './style.module.css';

export interface PageDateProps {
    pathname: string,
}

export const PageDate = ({pathname}: PageDateProps) => {
    const {publishedAt, updatedAt, commitCount, filePath} = getPageData(pathname);
    const historyUrl = `https://github.com/kei-ito/gojabako.zone/commits/main/${filePath}`;
    return <section className={className.container}>
        <DateString date={publishedAt}/>
        {1 < commitCount && <>&ensp;(<DateString date={updatedAt}/>更新)</>}
        &ensp;
        <a href={historyUrl} target="_blank" rel="noreferrer">履歴 ({commitCount})</a>
    </section>;
};
