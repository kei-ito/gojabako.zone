# Next.js 12にしました

ファイル構造を修正してたら[Next.js 12]が出たので導入しました。更新自体は`npm` `i` `next@latest`だけで問題なく動作しました。以下は追加でやったことの記録です。

[Next.js 12]: https://nextjs.org/blog/next-12

## next.config.mjsにする

ES Modulesで書けるようになったとのことでnext.config.jsをnext.config.mjsにしました。importのところを変えただけでwebpackのLoaderは相変わらず`require`されちゃうので.cjsのままです。

## middlewareを使う

単純なAPIであればmiddlewareで返せそうだったのでサイトマップとフィードを返すところでやってみました。

### これまでの実装

要件は次の通りでした。

1. サイトマップは`/sitemap.xml`で提供する
1. フィードは`/feed.atom`で提供する

これはpublicにファイルを置けば簡単なのですが、content-typeには`; charset=utf-8`をつけたいので以下のようにしました。

1. `/api/sitemap`でサイトマップを返し`/sitemap.xml`のrewriteをここに向ける
1. `/api/feed`フィードを返し`/feed.atom`のrewriteをここに向ける

当時の実装：[/next.config.js](https://github.com/gjbkz/gojabako.zone/blob/b5627b700c6c4061577a5ad80852f8183c2b764a/next.config.js#L19-L20), [/pages/api](https://github.com/gjbkz/gojabako.zone/tree/b5627b700c6c4061577a5ad80852f8183c2b764a/pages/api)

### middlewareの実装

content-typeのわがままは要件であるとします。`/pages/api`とrewriteを使うのは迂回をしている感じで具合が悪かったのでここをmiddlewareで解消することにしました。

```typescript [_middleware.ts](https://github.com/gjbkz/gojabako.zone/blob/b6916051706c2cf23b99986b35d98d4654d4114f/pages/_middleware.ts)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const middleware = (req: NextRequest) => {
  const { pathname } = req.nextUrl;
  switch (pathname) {
    case '/sitemap.xml':
      return respondSitemap();
    case '/feed.atom':
      return respondFeed();
    default:
      return undefined;
  }
};

const respondSitemap = () =>
  new NextResponse([...serializeSitemap()].join('\n'), {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });

const respondFeed = () =>
  new NextResponse([...serializeFeed()].join('\n'), {
    headers: {
      'content-type': 'application/atom+xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
```

これで`/pages/api`とrewriteの設定は不要になりました。

コンテンツが静的なのでmiddlewareを活用している感じは薄いですが、例えばJWTの検証を挟むにはちょうどいいですね。
