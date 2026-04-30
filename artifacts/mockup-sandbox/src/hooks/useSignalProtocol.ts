import { useCallback, useEffect, useRef } from 'react';
import {
  generateIdentityKeyPair,
  generateSignedPreKey,
  generatePreKeys,
  generateRegistrationId,
  x3dhInitiate,
  encryptMessage,
  decryptMessage,
  saveSession,
  loadSession,
  type KeyBundle,
  type RatchetState,
  type EncryptedMessage,
} from '../lib/signal';
import { api } from '../lib/api';

async function deriveChainKeyFromRoot(rootKey: Uint8Array): Promise<Uint8Array> {
  const baseKey = await crypto.subtle.importKey('raw', rootKey.buffer.slice(rootKey.byteOffset, rootKey.byteOffset + rootKey.byteLength) as ArrayBuffer, 'HKDF', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(32), info: new TextEncoder().encode('chain-key') },
    baseKey,
    256
  );
  return new Uint8Array(bits);
}

export function useSignalProtocol() {
  const initialized = useRef(false);

  // Initialize Signal Protocol on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      try {
        // Web Crypto API requires secure context (HTTPS or localhost)
        if (!window.crypto?.subtle) {
          console.warn('Signal Protocol unavailable: Web Crypto API requires HTTPS or localhost');
          return;
        }

        // Check if keys already registered
        const me = await api.getMe();
        if (!me) return;

        // Try to load existing identity key from localStorage
        let identityKey = localStorage.getItem('signal_identity_key');
        if (!identityKey) {
          const keyPair = await generateIdentityKeyPair();
          identityKey = JSON.stringify(keyPair);
          localStorage.setItem('signal_identity_key', identityKey);

          const registrationId = generateRegistrationId();
          const signedPreKey = await generateSignedPreKey(keyPair.privateKey, 1);
          const preKeys = await generatePreKeys(1, 20);

          // Register keys on server
          await api.registerSignalKeys({
            registrationId,
            identityKey: keyPair.publicKey,
            signedPreKey: {
              keyId: signedPreKey.keyId,
              publicKey: signedPreKey.publicKey,
              signature: signedPreKey.signature,
            },
            preKeys: preKeys.map((pk) => ({
              keyId: pk.keyId,
              publicKey: pk.publicKey,
            })),
          });

          // Store prekeys locally for decryption
          localStorage.setItem('signal_prekeys', JSON.stringify(preKeys));
          localStorage.setItem('signal_signed_prekey', JSON.stringify(signedPreKey));
        }
      } catch (err) {
        console.error('Signal Protocol init failed:', err);
      }
    };

    init();
  }, []);

  const establishSession = useCallback(async (chatId: number, remoteUserId: number): Promise<RatchetState> => {
    // Check if session already exists
    const existing = await loadSession(chatId);
    if (existing) return existing;

    // Fetch remote user's key bundle
    const bundle: KeyBundle = await api.getSignalKeyBundle(remoteUserId);

    // Load our identity key
    const identityKeyStr = localStorage.getItem('signal_identity_key');
    if (!identityKeyStr) throw new Error('Identity key not found');
    const identityKey = JSON.parse(identityKeyStr);

    // Generate ephemeral key pair
    const ephemeralKey = await generateIdentityKeyPair();

    // Perform X3DH
    const rootKey = await x3dhInitiate(identityKey, ephemeralKey, bundle);

    // Initialize chain keys from root key
    const sendingChainKey = await deriveChainKeyFromRoot(rootKey);

    const state: RatchetState = {
      rootKey,
      sendingChainKey,
      receivingChainKey: undefined,
      sendingMessageNumber: 0,
      receivingMessageNumber: 0,
      skippedMessageKeys: {},
    };

    // Save session
    await saveSession(chatId, state);

    return state;
  }, []);

  const encrypt = useCallback(async (chatId: number, plaintext: string): Promise<string> => {
    const state = await loadSession(chatId);
    if (!state) throw new Error('No session established for this chat');

    const { state: newState, encrypted } = await encryptMessage(state, plaintext);
    await saveSession(chatId, newState);

    return JSON.stringify(encrypted);
  }, []);

  const decrypt = useCallback(async (chatId: number, encryptedPayload: string): Promise<string> => {
    let state = await loadSession(chatId);
    if (!state) throw new Error('No session established for this chat');

    const encrypted: EncryptedMessage = JSON.parse(encryptedPayload);

    // If no receiving chain key yet, initialize from root key
    if (!state.receivingChainKey) {
      state.receivingChainKey = await deriveChainKeyFromRoot(state.rootKey);
    }

    const { state: newState, plaintext } = await decryptMessage(state, encrypted);
    await saveSession(chatId, newState);

    return plaintext;
  }, []);

  return { establishSession, encrypt, decrypt };
}
