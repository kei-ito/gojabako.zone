import { PrimaryButton, Buttons } from '../../../../components/Button';
import { Form } from '../../../../components/Form';
import { Query } from './Query';

export const Form1 = () => (
  <Form action="#form1" method="GET">
    <span id="form1" className="fragment-target" />
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
    <Buttons>
      <PrimaryButton type="submit">送信</PrimaryButton>
    </Buttons>
  </Form>
);
