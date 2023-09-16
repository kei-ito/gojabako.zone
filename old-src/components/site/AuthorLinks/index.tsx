import { authorGitHub, authorTwitter } from '../../../../config.site.mts';
import { HiddenText } from '../../ui/HiddenText';
import { IconGitHub, IconTwitter } from '../../ui/Icon';
import style from './style.module.scss';

export const AuthorLinks = () => (
  <>
    <a className={style.link} href={`https://twitter.com/${authorTwitter}`}>
      <IconTwitter width="1.3em" height="1.3em" />
      <HiddenText>Twitter:</HiddenText>
      <span className={style.id}>{authorTwitter}</span>
    </a>
    <a className={style.link} href={`https://github.com/${authorGitHub}`}>
      <IconGitHub width="1.3em" height="1.3em" />
      <HiddenText>GitHub:</HiddenText>
      <span className={style.id}>{authorGitHub}</span>
    </a>
  </>
);
