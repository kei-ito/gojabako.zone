import { Button, Buttons } from '../../../../components/Button';
import { Query } from './Query';

export const Form2 = () => (
  <form action="#form2" method="GET">
    <span id="form2" className="fragment-target" />
    <h1>disabledなfieldsetのあるフォーム</h1>
    <p>
      このページにGETするので送信するとアドレスバーのクエリ文字列で値を確認できます。
    </p>
    <p>
      現在のクエリ文字列: <Query />
    </p>
    <fieldset>
      <legend>
        <code>{'<fieldset>'}</code>
      </legend>
      <label htmlFor="v2-1">
        <code>{'<input name="v2-1" type="text"/>'}</code>
      </label>
      <input id="v2-1" name="v2-1" type="text" defaultValue="value1" />
      <label htmlFor="v2-2">
        <code>{'<input name="v2-2" type="text"/>'}</code>
      </label>
      <input id="v2-2" name="v2-2" type="text" defaultValue="value2" />
    </fieldset>
    <fieldset disabled>
      <legend>
        <code>{'<fieldset disabled>'}</code>
      </legend>
      <label htmlFor="v2-3">
        <code>{'<input name="v2-3" type="text"/>'}</code>
      </label>
      <input id="v2-3" name="v2-3" type="text" defaultValue="value5" />
      <label htmlFor="v2-4">
        <code>{'<input name="v2-4" type="text"/>'}</code>
      </label>
      <input id="v2-4" name="v2-4" type="text" defaultValue="value6" />
    </fieldset>
    <Buttons>
      <Button type="submit">送信</Button>
    </Buttons>
  </form>
);
