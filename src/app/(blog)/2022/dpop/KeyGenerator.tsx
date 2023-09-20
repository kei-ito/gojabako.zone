'use client';
/* eslint-disable no-console */
import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';
import { Button, Buttons } from '../../../../components/Button';
import { KeyView } from './KeyView';
import { generateKeyPair } from './util.mts';

export const KeyGenerator = () => {
  const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null);
  const onSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();
    generateKeyPair().then(setKeyPair).catch(console.error);
  }, []);
  return (
    <form onSubmit={onSubmit}>
      <h1>鍵ペアを作成する</h1>
      <Buttons>
        <Button type="submit">鍵ペアを作成する</Button>
      </Buttons>
      {keyPair && (
        <>
          <KeyView name="PublicKey" keyObject={keyPair.publicKey} />
          <KeyView name="PrivateKey" keyObject={keyPair.privateKey} />
          <p>発行した鍵ペアはJavaScriptコンソールにも表示されています。</p>
        </>
      )}
    </form>
  );
};
