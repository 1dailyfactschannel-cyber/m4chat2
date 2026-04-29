// @ts-nocheck
// Signal Protocol E2E Encryption — Client-side implementation
// Uses Web Crypto API (ECDH P-256 + AES-256-GCM)
// Simplified Double Ratchet for private chats

const SIGNAL_CURVE = 'P-256';
const AES_GCM = 'AES-GCM';
const AES_KEY_LEN = 256;
const IV_LEN = 12;

// ==========================================
// Key Generation
// ==========================================

export interface KeyPair {
  publicKey: string; // base64
  privateKey: string; // base64
}

export interface SignedPreKey extends KeyPair {
  keyId: number;
  signature: string; // base64
}

export interface PreKey extends KeyPair {
  keyId: number;
}

export interface KeyBundle {
  registrationId: number;
  identityKey: string;
  signedPreKey: {
    keyId: number;
    publicKey: string;
    signature: string;
  };
  preKey?: {
    keyId: number;
    publicKey: string;
  };
}

async function generateECDHKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: SIGNAL_CURVE },
    true, // extractable
    ['deriveBits', 'deriveKey']
  );
}

async function exportKey(key: CryptoKey): Promise<string> {
  const buf = await crypto.subtle.exportKey(key.type === 'public' ? 'raw' : 'pkcs8', key);
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

async function importPublicKey(base64: string): Promise<CryptoKey> {
  const buf = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return crypto.subtle.importKey('raw', buf, { name: 'ECDH', namedCurve: SIGNAL_CURVE }, false, []);
}

async function importPrivateKey(base64: string): Promise<CryptoKey> {
  const buf = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return crypto.subtle.importKey('pkcs8', buf, { name: 'ECDH', namedCurve: SIGNAL_CURVE }, false, ['deriveBits', 'deriveKey']);
}

export async function generateIdentityKeyPair(): Promise<KeyPair> {
  const kp = await generateECDHKeyPair();
  return {
    publicKey: await exportKey(kp.publicKey),
    privateKey: await exportKey(kp.privateKey),
  };
}

export async function generateSignedPreKey(identityPrivateKey: string, keyId: number): Promise<SignedPreKey> {
  const kp = await generateECDHKeyPair();
  const pubBuf = await crypto.subtle.exportKey('raw', kp.publicKey);
  
  // Sign public key with identity private key
  const idPriv = await crypto.subtle.importKey(
    'pkcs8',
    Uint8Array.from(atob(identityPrivateKey), c => c.charCodeAt(0)),
    { name: 'ECDSA', namedCurve: SIGNAL_CURVE },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    idPriv,
    pubBuf
  );

  return {
    publicKey: await exportKey(kp.publicKey),
    privateKey: await exportKey(kp.privateKey),
    keyId,
    signature: btoa(String.fromCharCode(...new Uint8Array(signature))),
  };
}

export async function generatePreKeys(startId: number, count: number): Promise<PreKey[]> {
  const keys: PreKey[] = [];
  for (let i = 0; i < count; i++) {
    const kp = await generateECDHKeyPair();
    keys.push({
      keyId: startId + i,
      publicKey: await exportKey(kp.publicKey),
      privateKey: await exportKey(kp.privateKey),
    });
  }
  return keys;
}

export function generateRegistrationId(): number {
  return Math.floor(Math.random() * 16380) + 1;
}

// ==========================================
// X3DH Key Agreement
// ==========================================

async function deriveSharedSecret(privateKey: CryptoKey, publicKey: CryptoKey): Promise<ArrayBuffer> {
  return crypto.subtle.deriveBits(
    { name: 'ECDH', public: publicKey },
    privateKey,
    256
  );
}

async function hkdf(input: ArrayBuffer, salt: Uint8Array, info: Uint8Array, length: number): Promise<ArrayBuffer> {
  const baseKey = await crypto.subtle.importKey('raw', input, 'HKDF', false, ['deriveBits']);
  return crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info },
    baseKey,
    length * 8
  );
}

// Alice (initiator) performs X3DH with Bob's bundle
export async function x3dhInitiate(
  aliceIdentity: KeyPair,
  aliceEphemeral: KeyPair,
  bobBundle: KeyBundle
): Promise<Uint8Array> {
  const DH1 = await deriveSharedSecret(
    await importPrivateKey(aliceIdentity.privateKey),
    await importPublicKey(bobBundle.signedPreKey.publicKey)
  );
  const DH2 = await deriveSharedSecret(
    await importPrivateKey(aliceEphemeral.privateKey),
    await importPublicKey(bobBundle.identityKey)
  );
  const DH3 = await deriveSharedSecret(
    await importPrivateKey(aliceEphemeral.privateKey),
    await importPublicKey(bobBundle.signedPreKey.publicKey)
  );

  let DH4: ArrayBuffer | undefined;
  if (bobBundle.preKey) {
    DH4 = await deriveSharedSecret(
      await importPrivateKey(aliceEphemeral.privateKey),
      await importPublicKey(bobBundle.preKey.publicKey)
    );
  }

  const kdfInput = new Uint8Array(DH1.byteLength + DH2.byteLength + DH3.byteLength + (DH4 ? DH4.byteLength : 0));
  let off = 0;
  kdfInput.set(new Uint8Array(DH1), off); off += DH1.byteLength;
  kdfInput.set(new Uint8Array(DH2), off); off += DH2.byteLength;
  kdfInput.set(new Uint8Array(DH3), off); off += DH3.byteLength;
  if (DH4) kdfInput.set(new Uint8Array(DH4), off);

  const rootKey = await hkdf(kdfInput, new Uint8Array(32), new TextEncoder().encode('m4chat-x3dh'), 32);
  return new Uint8Array(rootKey);
}

// Bob (responder) performs X3DH
export async function x3dhRespond(
  bobIdentity: KeyPair,
  bobSignedPreKey: KeyPair,
  bobOneTimePreKey: KeyPair | undefined,
  aliceIdentityPublic: string,
  aliceEphemeralPublic: string
): Promise<Uint8Array> {
  const DH1 = await deriveSharedSecret(
    await importPrivateKey(bobSignedPreKey.privateKey),
    await importPublicKey(aliceIdentityPublic)
  );
  const DH2 = await deriveSharedSecret(
    await importPrivateKey(bobIdentity.privateKey),
    await importPublicKey(aliceEphemeralPublic)
  );
  const DH3 = await deriveSharedSecret(
    await importPrivateKey(bobSignedPreKey.privateKey),
    await importPublicKey(aliceEphemeralPublic)
  );

  let DH4: ArrayBuffer | undefined;
  if (bobOneTimePreKey) {
    DH4 = await deriveSharedSecret(
      await importPrivateKey(bobOneTimePreKey.privateKey),
      await importPublicKey(aliceEphemeralPublic)
    );
  }

  const kdfInput = new Uint8Array(DH1.byteLength + DH2.byteLength + DH3.byteLength + (DH4 ? DH4.byteLength : 0));
  let off = 0;
  kdfInput.set(new Uint8Array(DH1), off); off += DH1.byteLength;
  kdfInput.set(new Uint8Array(DH2), off); off += DH2.byteLength;
  kdfInput.set(new Uint8Array(DH3), off); off += DH3.byteLength;
  if (DH4) kdfInput.set(new Uint8Array(DH4), off);

  const rootKey = await hkdf(kdfInput, new Uint8Array(32), new TextEncoder().encode('m4chat-x3dh'), 32);
  return new Uint8Array(rootKey);
}

// ==========================================
// Double Ratchet (Simplified)
// ==========================================

export interface RatchetState {
  rootKey: Uint8Array;
  sendingChainKey?: Uint8Array;
  receivingChainKey?: Uint8Array;
  sendingMessageNumber: number;
  receivingMessageNumber: number;
  skippedMessageKeys: Record<string, string>; // msgNum -> base64 key
}

async function kdfChainKey(chainKey: Uint8Array): Promise<{ messageKey: Uint8Array; nextChainKey: Uint8Array }> {
  const base = await crypto.subtle.importKey('raw', chainKey, 'HKDF', false, ['deriveBits']);
  const mk = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(32), info: new TextEncoder().encode('message-key') },
    base,
    256
  );
  const ck = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(32), info: new TextEncoder().encode('chain-key') },
    base,
    256
  );
  return { messageKey: new Uint8Array(mk), nextChainKey: new Uint8Array(ck) };
}

async function kdfRootKey(rootKey: Uint8Array, sharedSecret: Uint8Array): Promise<{ rootKey: Uint8Array; chainKey: Uint8Array }> {
  const input = new Uint8Array(rootKey.length + sharedSecret.length);
  input.set(rootKey);
  input.set(sharedSecret, rootKey.length);
  const base = await crypto.subtle.importKey('raw', input, 'HKDF', false, ['deriveBits']);
  const rk = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(32), info: new TextEncoder().encode('root-key') },
    base,
    256
  );
  const ck = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(32), info: new TextEncoder().encode('chain-key') },
    base,
    256
  );
  return { rootKey: new Uint8Array(rk), chainKey: new Uint8Array(ck) };
}

export async function ratchetInitSender(state: RatchetState, remotePublicKey: string): Promise<RatchetState> {
  const ephemeral = await generateECDHKeyPair();
  const shared = await deriveSharedSecret(ephemeral.privateKey, await importPublicKey(remotePublicKey));
  const { rootKey: newRoot, chainKey } = await kdfRootKey(state.rootKey, new Uint8Array(shared));
  return {
    ...state,
    rootKey: newRoot,
    sendingChainKey: chainKey,
    sendingMessageNumber: 0,
  };
}

export async function ratchetInitReceiver(state: RatchetState, ephemeralPublic: string, privateKey: string): Promise<RatchetState> {
  const shared = await deriveSharedSecret(await importPrivateKey(privateKey), await importPublicKey(ephemeralPublic));
  const { rootKey: newRoot, chainKey } = await kdfRootKey(state.rootKey, new Uint8Array(shared));
  return {
    ...state,
    rootKey: newRoot,
    receivingChainKey: chainKey,
    receivingMessageNumber: 0,
  };
}

// ==========================================
// Encrypt / Decrypt Message
// ==========================================

export interface EncryptedMessage {
  ciphertext: string; // base64
  iv: string; // base64
  ephemeralPublicKey?: string; // base64, included on first message or DH ratchet step
  messageNumber: number;
}

export async function encryptMessage(state: RatchetState, plaintext: string): Promise<{ state: RatchetState; encrypted: EncryptedMessage }> {
  if (!state.sendingChainKey) {
    throw new Error('No sending chain key — perform DH ratchet first');
  }

  const { messageKey, nextChainKey } = await kdfChainKey(state.sendingChainKey);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const key = await crypto.subtle.importKey('raw', messageKey, AES_GCM, false, ['encrypt']);
  const ciphertext = await crypto.subtle.encrypt(
    { name: AES_GCM, iv },
    key,
    new TextEncoder().encode(plaintext)
  );

  return {
    state: {
      ...state,
      sendingChainKey: nextChainKey,
      sendingMessageNumber: state.sendingMessageNumber + 1,
    },
    encrypted: {
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
      iv: btoa(String.fromCharCode(...iv)),
      messageNumber: state.sendingMessageNumber,
    },
  };
}

export async function decryptMessage(state: RatchetState, encrypted: EncryptedMessage): Promise<{ state: RatchetState; plaintext: string }> {
  // If ephemeral key present, this is a DH ratchet step
  if (encrypted.ephemeralPublicKey) {
    // Need receiver's private key to derive new receiving chain
    // In real impl, private key is fetched from key store
    throw new Error('DH ratchet decryption requires ephemeral key handling — not fully implemented in this simplified version');
  }

  if (!state.receivingChainKey) {
    throw new Error('No receiving chain key');
  }

  const { messageKey, nextChainKey } = await kdfChainKey(state.receivingChainKey);
  const iv = Uint8Array.from(atob(encrypted.iv), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('raw', messageKey, AES_GCM, false, ['decrypt']);
  const plaintext = await crypto.subtle.decrypt(
    { name: AES_GCM, iv },
    key,
    Uint8Array.from(atob(encrypted.ciphertext), c => c.charCodeAt(0))
  );

  return {
    state: {
      ...state,
      receivingChainKey: nextChainKey,
      receivingMessageNumber: state.receivingMessageNumber + 1,
    },
    plaintext: new TextDecoder().decode(plaintext),
  };
}

// ==========================================
// Session Store (IndexedDB wrapper)
// ==========================================

const SESSION_STORE = 'signal_sessions';

export async function saveSession(chatId: number, state: RatchetState): Promise<void> {
  const db = await openDB();
  await db.put(SESSION_STORE, {
    chatId,
    rootKey: btoa(String.fromCharCode(...state.rootKey)),
    sendingChainKey: state.sendingChainKey ? btoa(String.fromCharCode(...state.sendingChainKey)) : undefined,
    receivingChainKey: state.receivingChainKey ? btoa(String.fromCharCode(...state.receivingChainKey)) : undefined,
    sendingMessageNumber: state.sendingMessageNumber,
    receivingMessageNumber: state.receivingMessageNumber,
    skippedMessageKeys: state.skippedMessageKeys,
    updatedAt: Date.now(),
  }, chatId);
}

export async function loadSession(chatId: number): Promise<RatchetState | null> {
  const db = await openDB();
  const raw = await db.get(SESSION_STORE, chatId);
  if (!raw) return null;
  return {
    rootKey: Uint8Array.from(atob(raw.rootKey), c => c.charCodeAt(0)),
    sendingChainKey: raw.sendingChainKey ? Uint8Array.from(atob(raw.sendingChainKey), c => c.charCodeAt(0)) : undefined,
    receivingChainKey: raw.receivingChainKey ? Uint8Array.from(atob(raw.receivingChainKey), c => c.charCodeAt(0)) : undefined,
    sendingMessageNumber: raw.sendingMessageNumber,
    receivingMessageNumber: raw.receivingMessageNumber,
    skippedMessageKeys: raw.skippedMessageKeys,
  };
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('m4chat-signal', 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(SESSION_STORE, { keyPath: 'chatId' });
    };
  });
}
