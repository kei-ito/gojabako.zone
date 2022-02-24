import {authorGitHub, authorTwitter} from '../../../../packages/site/constants';
import {HiddenText} from '../../ui/HiddenText';
import {IconGitHub, IconTwitter} from '../../ui/Icon';
import {className} from './style.module.css';

export const AuthorLinks = () => <>
    <a className={className.link} href={`https://twitter.com/${authorTwitter}`}>
        <IconTwitter/>
        <HiddenText>Twitter:</HiddenText>
        <span>{authorTwitter}</span>
    </a>
    <a className={className.link} href={`https://github.com/${authorGitHub}`}>
        <IconGitHub/>
        <HiddenText>GitHub:</HiddenText>
        <span>{authorGitHub}</span>
    </a>
</>;
