const openDB = async (): Promise<IDBDatabase> =>
  await new Promise((resolve, reject) => {
    const request = indexedDB.open("KeyPairTest", 1);
    request.onerror = reject;
    request.onupgradeneeded = () => {
      request.result.createObjectStore("keyPair", { keyPath: "keyId" });
    };
    request.onsuccess = () => resolve(request.result);
  });

export const storeKeyPair = async (keyId: string, keyPair: CryptoKeyPair) => {
  const db = await openDB();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(["keyPair"], "readwrite");
    transaction.onerror = reject;
    transaction.oncomplete = resolve;
    const objectStore = transaction.objectStore("keyPair");
    objectStore.put({ keyId, ...keyPair });
    transaction.commit();
  });
};

export const loadKeyPair = async (keyId: string): Promise<CryptoKeyPair> => {
  const db = await openDB();
  return await new Promise((resolve, reject) => {
    const transaction = db.transaction(["keyPair"], "readwrite");
    const objectStore = transaction.objectStore("keyPair");
    const getRequest = objectStore.get(keyId);
    getRequest.onerror = reject;
    getRequest.onsuccess = () => resolve(getRequest.result as CryptoKeyPair);
    transaction.commit();
  });
};

export const generateKeyPair = async () => {
  const algorithm = { name: "ECDSA", namedCurve: "P-256" };
  const extractable = false;
  const keyUsages = ["sign"] as const;
  const keyPair = await crypto.subtle.generateKey(
    algorithm,
    extractable,
    keyUsages,
  );
  console.info(keyPair);
  return keyPair;
};
