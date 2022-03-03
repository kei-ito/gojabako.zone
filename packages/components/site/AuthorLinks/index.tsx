import styled from 'styled-components';
import {authorGitHub, authorTwitter} from '../../../../packages/site/constants';
import {HiddenText} from '../../ui/HiddenText';
import {IconGitHub, IconTwitter} from '../../ui/Icon';

export const AuthorLinks = () => <>
    <A href={`https://twitter.com/${authorTwitter}`}>
        <IconTwitter width="1.3em" height="1.3em"/>
        <HiddenText>Twitter:</HiddenText>
        <Span>{authorTwitter}</Span>
    </A>
    <A href={`https://github.com/${authorGitHub}`}>
        <IconGitHub width="1.3em" height="1.3em"/>
        <HiddenText>GitHub:</HiddenText>
        <Span>{authorGitHub}</Span>
    </A>
</>;

const A = styled.a`
    display: grid;
    grid-auto-flow: column;
    column-gap: 0.2em;
    align-items: center;
    color: inherit;
    text-decoration: none;
`;

const Span = styled.span`
    font-size: 90%;
    @media (max-width: 370px) {
        display: none;
    }
`;
