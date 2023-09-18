'use client';
import { entries } from '@nlib/typing';
import type { MouseEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import * as style from './style.module.scss';

interface KeyViewProps {
  name: string;
  keyObject: CryptoKey;
  extract?: boolean;
  noExtract?: boolean;
}

// eslint-disable-next-line max-lines-per-function
export const KeyView = ({
  name,
  keyObject,
  extract,
  noExtract,
}: KeyViewProps) => {
  const [jwk, setJwk] = useState<string | null>(null);
  const extractKey = useCallback(
    (event?: MouseEvent) => {
      if (event) {
        event.preventDefault();
      }
      crypto.subtle
        .exportKey('jwk', keyObject)
        .then((extracted) => setJwk(JSON.stringify(extracted, null, 2)))
        .catch((error) => setJwk(`${error}`));
    },
    [keyObject],
  );
  useEffect(() => {
    if (extract) {
      extractKey();
    }
  }, [extract, extractKey]);
  const extractButton = !extract && !noExtract;
  return (
    <fieldset>
      <legend>{name}</legend>
      <div className={style.table}>
        <table>
          <tbody>
            {entries(keyObject.algorithm).map(([key, value]) => (
              <tr key={`algorithm.${key}`}>
                <td>
                  <code>algorithm.{key}</code>
                </td>
                <td>
                  <code>{JSON.stringify(value)}</code>
                </td>
              </tr>
            ))}
            <tr>
              <td>
                <code>extractable</code>
              </td>
              <td>
                <code>{`${keyObject.extractable}`}</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>usages</code>
              </td>
              <td>
                <code>{JSON.stringify(keyObject.usages)}</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {extractButton && (
        <button
          type="button"
          onClick={extractKey}
          style={{ justifySelf: 'start' }}
        >
          ExportKey
        </button>
      )}
      {jwk && (
        <pre className={style.output}>
          <code>{jwk}</code>
        </pre>
      )}
    </fieldset>
  );
};
