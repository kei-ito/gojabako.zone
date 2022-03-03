import Link from 'next/link';
import type {FC} from 'react';
import styled from 'styled-components';
import {siteName} from '../../../../packages/site/constants';
import {AuthorLinks} from '../AuthorLinks';

export const SiteHeader: FC = () => <Header>
    <Container>
        <Link href="/" passHref>
            <TitleLink>
                <Logo width="2em" height="1em" viewBox="0 0 8 4" aria-hidden="true">
                    <path d="M0 0h2v1h-1v1h1v2h-2zM3 0h2v4h-2v-2h1v-1h-1zM6 0h2v4h-1v-1h-1z" stroke="none"/>
                </Logo>
                <Title>{siteName}</Title>
            </TitleLink>
        </Link>
        <div/>
        <AuthorLinks/>
    </Container>
</Header>;

const Container = styled.div`
    inline-size: var(--baseWidth);
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: auto 1fr repeat(2, auto);
    column-gap: 0.5rem;
    align-items: stretch;
`;

const Header = styled.header`
    z-index: var(--zHeader);
    position: sticky;
    inset-block-start: 0;
    display: grid;
    align-items: center;
    justify-content: stretch;
    justify-items: center;
    padding-block-start: 0.4rem;
    padding-block-end: 0.4rem;
    background-color: var(--gray2);
    border-block-end: solid 1px var(--gray3);
`;

const TitleLink = styled.a`
    display: grid;
    grid-auto-flow: column;
    align-items: center;
    column-gap: 0.4rem;
    color: inherit;
    text-decoration: none;
`;

const Logo = styled.svg`
    fill: currentColor;
    @media (max-width: 280px) {
        display: none;
    }
`;

const Title = styled.h1`
    font-size: 115%;
    line-height: 1;
`;
