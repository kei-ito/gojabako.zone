'use client';
import type { MouseEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

interface KeyViewProps {
  name: string;
  keyObject: CryptoKey;
  extract?: boolean;
  noExtract?: boolean;
}

// eslint-disable-next-line max-lines-per-function
export const KeyView = ({
  name,
  keyObject: key,
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
        .exportKey('jwk', key)
        .then((extracted) => setJwk(JSON.stringify(extracted, null, 2)))
        .catch((error) => setJwk(`${error}`));
    },
    [key],
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
      <table>
        <tbody>
          <tr>
            <td>
              <code>algorithm</code>
            </td>
            <td>
              <code>{JSON.stringify(key.algorithm, null, 2)}</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>extractable</code>
            </td>
            <td>
              <code>{`${key.extractable}`}</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>usages</code>
            </td>
            <td>
              <code>{JSON.stringify(key.usages)}</code>
            </td>
          </tr>
        </tbody>
      </table>
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
        <pre>
          <code>{jwk}</code>
        </pre>
      )}
    </fieldset>
  );
};
