/**
 * Sovereign Encryption Utility
 * Implements client-side AES-GCM 256 encryption.
 * In a true Zero-Knowledge system, the passphrase is never sent to the server.
 */

const ALGORITHM = 'AES-GCM';

async function deriveKey(passphrase, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptFile(file, passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  
  const arrayBuffer = await file.arrayBuffer();
  const encryptedContent = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    arrayBuffer
  );

  // Combine salt, iv, and encrypted content into a single Blob
  const combined = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedContent), salt.length + iv.length);
  
  return new Blob([combined], { type: 'application/octet-stream' });
}

export async function decryptFile(blob, passphrase) {
  const combined = new Uint8Array(await blob.arrayBuffer());
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const encryptedContent = combined.slice(28);

  const key = await deriveKey(passphrase, salt);
  
  try {
    const decryptedContent = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      encryptedContent
    );
    return new Blob([decryptedContent]);
  } catch (e) {
    throw new Error('Decryption failed. Check your passphrase.');
  }
}
