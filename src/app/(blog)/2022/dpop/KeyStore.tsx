/* eslint-disable no-console */
'use client';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Button, Buttons } from '../../../../components/Button';
import { KeyView } from './KeyView';
import { generateKeyPair, loadKeyPair, storeKeyPair } from './util.mts';

export const KeyStore = () => {
  const keyId = 'testKeyPair';
  const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null);
  const onSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();
    generateKeyPair()
      .then(async (newKeyPair) => {
        await storeKeyPair(keyId, newKeyPair);
        setKeyPair(newKeyPair);
      })
      .catch(console.error);
  }, []);
  useEffect(() => {
    loadKeyPair(keyId).then(setKeyPair).catch(console.error);
  }, []);
  return (
    <form onSubmit={onSubmit}>
      <h1>鍵ペアをIndexedDBに保管する</h1>
      <Buttons>
        <Button type="submit">
          {keyPair ? '鍵ペアを更新して保管する' : '鍵ペアを作成して保管する'}
        </Button>
      </Buttons>
      {keyPair && (
        <>
          <KeyView name="PublicKey" keyObject={keyPair.publicKey} extract />
          <KeyView name="PrivateKey" keyObject={keyPair.privateKey} noExtract />
          <p>
            IndexedDBのコンソールを開いて鍵ペアが格納されていることを確認してください。また、ページをリロードしても鍵ペアが消えないことを確認してください。
          </p>
        </>
      )}
    </form>
  );
};
