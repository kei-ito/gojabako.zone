import {IconGitHub, IconTwitter} from '../Icon';
import {HiddenText} from '../HiddenText';
import {className} from './style.module.css';

export const AuthorLinks = () => <>
    <a className={className.link} href="https://twitter.com/gjbkz">
        <IconTwitter/>
        <HiddenText>Twitter:</HiddenText>
        <span>gjbkz</span>
    </a>
    <a className={className.link} href="https://github.com/gjbkz">
        <IconGitHub/>
        <HiddenText>GitHub:</HiddenText>
        <span>gjbkz</span>
    </a>
</>;
