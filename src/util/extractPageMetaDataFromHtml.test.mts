import * as assert from 'node:assert';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { extractPageMetaDataFromHtml } from './extractPageMetaDataFromHtml.mts';

const expected = {
  'theme-color': ['rgba(255, 255, 255, 0.98)'],
  'title': [
    'Google 日本語入力物理フリックバージョン - YouTube',
    'Google 日本語入力物理フリックバージョン',
    'title in body',
  ],
  'description': [
    'Google 日本語入力チームからの新しいご提案です。',
    'Google 日本語入力チームからの新しいご提案です。',
  ],
  'keywords': ['google, グーグル, 日本語入力, 日本語, IME, エイプリルフール'],
  'og:site_name': ['YouTube'],
  'og:url': ['https://www.youtube.com/watch?v=5LI1PysAlkU'],
  'og:title': ['Google 日本語入力物理フリックバージョン'],
  'og:image': ['https://i.ytimg.com/vi/5LI1PysAlkU/maxresdefault.jpg'],
  'og:image:width': ['1280'],
  'og:image:height': ['720'],
  'og:description': ['Google 日本語入力チームからの新しいご提案です。'],
  'al:ios:app_store_id': ['544007664'],
  'al:ios:app_name': ['YouTube'],
  'og:type': ['video.other'],
  'og:video:url': ['https://www.youtube.com/embed/5LI1PysAlkU'],
  'og:video:secure_url': ['https://www.youtube.com/embed/5LI1PysAlkU'],
  'og:video:type': ['text/html'],
  'og:video:width': ['1280'],
  'og:video:height': ['720'],
  'al:android:app_name': ['YouTube'],
  'al:android:package': ['com.google.android.youtube'],
  'og:video:tag': [
    'google',
    'グーグル',
    '日本語入力',
    '日本語',
    'IME',
    'エイプリルフール',
    'ドラムセットバージョン',
    'モールスバージョン',
    'April Fool',
    'パタパタバージョン',
    'マジックハンドバージョン',
    'ピロピロバージョン',
    '物理フリック',
    '物理フリックバージョン',
    'フリック',
    'フリック入力',
  ],
  'fb:app_id': ['87741124305'],
  'twitter:card': ['player'],
  'twitter:site': ['@youtube'],
  'twitter:url': ['https://www.youtube.com/watch?v=5LI1PysAlkU'],
  'twitter:title': ['Google 日本語入力物理フリックバージョン'],
  'twitter:description': ['Google 日本語入力チームからの新しいご提案です。'],
  'twitter:image': ['https://i.ytimg.com/vi/5LI1PysAlkU/maxresdefault.jpg'],
  'twitter:app:name:iphone': ['YouTube'],
  'twitter:app:id:iphone': ['544007664'],
  'twitter:app:name:ipad': ['YouTube'],
  'twitter:app:id:ipad': ['544007664'],
  'twitter:app:name:googleplay': ['YouTube'],
  'twitter:app:id:googleplay': ['com.google.android.youtube'],
  'twitter:player': ['https://www.youtube.com/embed/5LI1PysAlkU'],
  'twitter:player:width': ['1280'],
  'twitter:player:height': ['720'],
  'name': ['Google 日本語入力物理フリックバージョン'],
  'requiresSubscription': ['False'],
  'identifier': ['5LI1PysAlkU'],
  'duration': ['PT2M11S'],
  'width': ['1280', '1280'],
  'height': ['720', '720'],
  'playerType': ['HTML5 Flash'],
  'isFamilyFriendly': ['true'],
  'regionsAllowed': ['JP'],
  'interactionCount': ['123456'],
  'datePublished': ['2016-03-31'],
  'uploadDate': ['2016-03-31'],
  'genre': ['Science & Technology'],
};

test(extractPageMetaDataFromHtml.name, async () => {
  const html = await readFile(
    new URL(import.meta.url.replace(/\.test\.mts$/, '.html')),
    'utf8',
  );
  const actual = extractPageMetaDataFromHtml(html);
  assert.deepStrictEqual(actual, expected);
});
