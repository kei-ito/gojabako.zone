# disabledなフォーム要素はsubmitされない

Reactだとたいていの`<form>`でsubmitをpreventDefaultするので意識しないのですがNext.jsは[API Routes](https://nextjs.org/docs/api-routes/introduction)があるので`<form>`のactionでそこに繋ぐことがあります。

また、一度押したボタンは`<button disabled>`にすると二重に押せないようにできますが、このdisabledのボタンを無効にする以外の作用についてよく知らなかったのでその記録です。動作確認はGoogle Chromeでやっています。

## disabledなフォーム要素

あるフォームで二重にボタンが押せないようにする際に`<input>`の値も保護しようとして適当にdisabledを設定すると、値が足らずサーバーがBadRequestを返すようになりました。足りていない値を確認するとdisabledを設定した要素のvalueでした。

```js (import)
import {useState, useEffect} from 'react';
const Query = () => {
    const [query, setQuery] = useState('なし');
    useEffect(() => {
        if (typeof location !== 'undefined') {
            setQuery(location.search);
        }
    }, []);
    return <code>{query}</code>;
};
```

```jsx (include)
<form id="form1" action="#form1" method="GET">
    <h1>disabledなinputのあるフォーム</h1>
    <p>このページにGETするので送信するとアドレスバーのクエリ文字列で値を確認できます。おそらく<code>{'?input1=value1&input2=value2'}</code>になるはずです。</p>
    <p>現在のクエリ文字列: <Query/></p>
    <label htmlFor="input1-1"><code>{'<input name="v1-1" type="text"/>'}</code></label>
    <input id="input1-1" name="v1-1" type="text" defaultValue="value1"/>
    <label htmlFor="input1-2"><code>{'<input name="v1-2" type="text" readonly/>'}</code></label>
    <input id="input1-2" name="v1-2" type="text" defaultValue="value2" readOnly/>
    <label htmlFor="input1-3"><code>{'<input name="v1-3" type="text" disabled/>'}</code></label>
    <input id="input1-3" name="v1-3" type="text" defaultValue="value3" disabled/>
    <button type="submit">送信</button>
</form>
```

いつもJavaScriptで値を集めてfetchで送っていたので気がつかなかったのですが、disabledな要素の値はフォームの送信に含まれません。

## disabledなfieldset

フォームの要素は`<fieldset>`でグループにできます。この`<fieldset>`にはdisabledが指定できます。先の結果から予想するとdisabledにするとそのグループの値は送信されないでしょう。確認してみます。

```jsx (include)
<form id="form2" action="#form2" method="GET">
    <h1>disabledなfieldsetのあるフォーム</h1>
    <p>このページにGETするので送信するとアドレスバーのクエリ文字列で値を確認できます。</p>
    <p>現在のクエリ文字列: <Query/></p>
    <fieldset>
        <legend><code>{'<fieldset>'}</code></legend>
        <label htmlFor="input2-1"><code>{'<input name="v2-1" type="text"/>'}</code></label>
        <input id="input2-1" name="v2-1" type="text" defaultValue="value1"/>
        <label htmlFor="input2-2"><code>{'<input name="v2-2" type="text"/>'}</code></label>
        <input id="input2-2" name="v2-2" type="text" defaultValue="value2"/>
    </fieldset>
    <fieldset readOnly>
        <legend><code>{'<fieldset readonly>'}</code></legend>
        <label htmlFor="input2-3"><code>{'<input name="v2-3" type="text"/>'}</code></label>
        <input id="input2-3" name="v2-3" type="text" defaultValue="value3"/>
        <label htmlFor="input2-4"><code>{'<input name="v2-4" type="text"/>'}</code></label>
        <input id="input2-4" name="v2-4" type="text" defaultValue="value4"/>
    </fieldset>
    <fieldset disabled>
        <legend><code>{'<fieldset disabled>'}</code></legend>
        <label htmlFor="input2-5"><code>{'<input name="v2-5" type="text"/>'}</code></label>
        <input id="input2-5" name="v2-5" type="text" defaultValue="value5"/>
        <label htmlFor="input2-6"><code>{'<input name="v2-6" type="text"/>'}</code></label>
        <input id="input2-6" name="v2-6" type="text" defaultValue="value6"/>
    </fieldset>
    <button type="submit">送信</button>
</form>
```

3つ目の`<fieldset>`の中の`v2-5`と`v2-6`は送信されません。readonlyな要素であれば送信されます。

## disabledの使い所

例えば「*Q2で **いいえ** と答えた方は入力してください*」のように文脈で無効である場合にはdisabledを使い、送信中の値の保護であればreadonly[^1]を使うようにしています。

[^1]: readonlyは`<input type="submit"/>`に使えないなどの条件があります。参考: [HTML 属性: readonly - HTML: HyperText Markup Language | MDN](https://developer.mozilla.org/ja/docs/Web/HTML/Attributes/readonly)