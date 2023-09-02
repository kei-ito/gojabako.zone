import type { PropsWithChildren } from 'react';
import { usePageData } from '../../../hooks/usePageData';
import { DateString } from '../../ui/DateString';
import style from './style.module.scss';

export interface PageDataProps {
  pathname: string;
  onlyUpdate?: boolean;
}

export const PageTitle = ({
  pathname,
  onlyUpdate,
}: PropsWithChildren<PageDataProps>) => {
  const { title, commitCount, filePath } = usePageData(pathname);
  const historyUrl = `https://github.com/gjbkz/gojabako.zone/commits/main/${filePath}`;
  return (
    <header className={style.container}>
      <h1>{title}</h1>
      <div className={style.data}>
        <Date pathname={pathname} onlyUpdate={onlyUpdate} />
        &ensp;
        <a href={historyUrl} target="_blank" rel="noreferrer">
          履歴 ({commitCount})
        </a>
      </div>
    </header>
  );
};

const Date = ({ pathname, onlyUpdate }: PageDataProps) => {
  const { publishedAt, updatedAt, commitCount, archiveOf } =
    usePageData(pathname);
  if (archiveOf) {
    return (
      <>
        <DateString dateTime={publishedAt || updatedAt} />
        &thinsp; に &thinsp;
        <a href={archiveOf} target="_blank" rel="noreferrer">
          {archiveOf.replace(/^https?:\/\//, '')}
        </a>
        &thinsp; で公開
        {1 < commitCount && (
          <>
            {' '}
            (<DateString dateTime={updatedAt} /> 更新)
          </>
        )}
      </>
    );
  }
  if (onlyUpdate) {
    return (
      <>
        <DateString dateTime={updatedAt} /> 更新
      </>
    );
  }
  return (
    <>
      <DateString dateTime={publishedAt} /> 公開
      {1 < commitCount && (
        <>
          {' '}
          (<DateString dateTime={updatedAt} /> 更新)
        </>
      )}
    </>
  );
};
