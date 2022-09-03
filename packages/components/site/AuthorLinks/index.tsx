import {authorGitHub, authorTwitter} from '../../../../site.mjs';
import {HiddenText} from '../../ui/HiddenText';
import {IconGitHub, IconTwitter} from '../../ui/Icon';
import {className} from './style.module.css';

export const AuthorLinks = () => <>
    <a className={className.link} href={`https://twitter.com/${authorTwitter}`}>
        <IconTwitter width="1.3em" height="1.3em"/>
        <HiddenText>Twitter:</HiddenText>
        <span className={className.id}>{authorTwitter}</span>
    </a>
    <a className={className.link} href={`https://github.com/${authorGitHub}`}>
        <IconGitHub width="1.3em" height="1.3em"/>
        <HiddenText>GitHub:</HiddenText>
        <span className={className.id}>{authorGitHub}</span>
    </a>
</>;
