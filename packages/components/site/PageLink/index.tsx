import Link from 'next/link';
import type {FC} from 'react';
import styled from 'styled-components';
import type {PageData} from '../../../site/pageList';
import {DateString} from '../../ui/DateString';

export const PageLinkPublished: FC<PageData> = ({pathname, title, publishedAt}) => <Link href={pathname || '/'} passHref>
    <A>
        {title}
        &ensp;
        <Meta>
            <DateString dateTime={publishedAt}/> 公開
        </Meta>
    </A>
</Link>;

export const PageLinkUpdated: FC<PageData> = ({pathname, title, updatedAt}) => <Link href={pathname || '/'} passHref>
    <A>
        {title}
        &ensp;
        <Meta>
            <DateString dateTime={updatedAt}/> 更新
        </Meta>
    </A>
</Link>;

const A = styled.a`
    justify-self: start;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    text-decoration-line: none;
    color: currentColor;
    &:hover {
        text-decoration-line: underline;
    }
`;

const Meta = styled.span`
    white-space: nowrap;
    font-size: 80%;
    opacity: 0.6;
`;
