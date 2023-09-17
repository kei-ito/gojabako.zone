import { Query } from './Query';

export const Form1 = () => (
  <form action="#form1" method="GET">
    <span id="form1" className="fragment-target" />
    <h1>disabledなinputのあるフォーム</h1>
    <p>
      このページにGETするので送信するとアドレスバーのクエリ文字列で値を確認できます。おそらく
      <code>{'?v1-1=value1&v1-2=value2'}</code>になるはずです。
    </p>
    <p>
      現在のクエリ文字列: <Query />
    </p>
    <label htmlFor="v1-1">
      <code>{'<input name="v1-1" type="text"/>'}</code>
    </label>
    <input id="v1-1" name="v1-1" type="text" defaultValue="value1" />
    <label htmlFor="v1-2">
      <code>{'<input name="v1-2" type="text" readonly/>'}</code>
    </label>
    <input id="v1-2" name="v1-2" type="text" defaultValue="value2" readOnly />
    <label htmlFor="v1-3">
      <code>{'<input name="v1-3" type="text" disabled/>'}</code>
    </label>
    <input id="v1-3" name="v1-3" type="text" defaultValue="value3" disabled />
    <div className="buttons">
      <button type="submit">送信</button>
    </div>
  </form>
);
