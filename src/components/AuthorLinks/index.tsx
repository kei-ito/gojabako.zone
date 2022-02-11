import {IconGitHub, IconTwitter} from '../Icon';
import {HiddenText} from '../HiddenText';
import {className} from './style.module.css';
import {authorGitHub, authorTwitter} from '../../../packages/site/constants';

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
