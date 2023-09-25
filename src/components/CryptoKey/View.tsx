/* eslint-disable no-console */
'use client';
import type { MouseEvent, PropsWithChildren } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Buttons, PrimaryButton } from '../Button';
import { DataView } from '../DataView';
import { FieldSet } from '../Form';
import * as style from './style.module.scss';

interface KeyViewProps {
  name: string;
  keyObject: CryptoKey;
  extract?: boolean;
  noExtract?: boolean;
}

// eslint-disable-next-line max-lines-per-function
export const CryptoKeyView = ({
  name,
  keyObject,
  extract,
  noExtract,
  children,
}: PropsWithChildren<KeyViewProps>) => {
  const [jwk, setJwk] = useState<Error | JsonWebKey | null>(null);
  const extractKey = useCallback(
    (event?: MouseEvent) => {
      if (event) {
        event.preventDefault();
      }
      Promise.resolve()
        .then(async () => {
          setJwk(await crypto.subtle.exportKey('jwk', keyObject));
        })
        .catch(setJwk);
    },
    [keyObject],
  );
  useEffect(() => {
    if (extract) {
      extractKey();
    }
  }, [extract, extractKey]);
  useEffect(() => console.info({ [name]: keyObject }), [name, keyObject]);
  const extractButton = !extract && !noExtract;
  return (
    <FieldSet className={style.container}>
      <legend>{name}</legend>
      <DataView value={keyObject} className={style.data} />
      {children}
      {extractButton && (
        <Buttons>
          <PrimaryButton
            type="button"
            onClick={extractKey}
            style={{ justifySelf: 'start' }}
          >
            {name} を JWK にエクスポートする
          </PrimaryButton>
        </Buttons>
      )}
      {jwk && (
        <>
          <p>JWKのエクスポート結果</p>
          <DataView value={jwk} className={style.data} />
        </>
      )}
    </FieldSet>
  );
};
