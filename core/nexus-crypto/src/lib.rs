#![deny(unsafe_op_in_unsafe_fn, missing_docs)]
//! Nexus Crypto Engine
//! Handles Ed25519 signatures, AES-256-GCM at-rest encryption, and Merkle logs.

use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Key, Nonce,
};
use ed25519_dalek::{Signer, SigningKey, Verifier, VerifyingKey, Signature};
use rs_merkle::{MerkleTree, Hasher, algorithms::Sha256};
use thiserror::Error;
use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

/// Crypto Errors
#[derive(Debug, Error)]
pub enum CryptoError {
    /// Cipher error
    #[error("Encryption failed")]
    EncryptionError,
    /// Decryption error
    #[error("Decryption failed. Invalid key or corrupted data.")]
    DecryptionError,
    /// Signature validation error
    #[error("Signature verification failed")]
    SignatureInvalid,
}

/// AES-256-GCM Engine wrapper
#[wasm_bindgen]
pub struct SymmetricEngine {
    cipher: Aes256Gcm,
}

#[wasm_bindgen]
impl SymmetricEngine {
    /// Initialize with a precise 32-byte key.
    pub fn new_from_js(key_bytes: &[u8]) -> Self {
        let key = Key::<Aes256Gcm>::from_slice(key_bytes);
        Self {
            cipher: Aes256Gcm::new(key.clone()),
        }
    }

    /// Generate a new 32-byte random key
    pub fn generate_key() -> Vec<u8> {
        let key: [u8; 32] = Aes256Gcm::generate_key(OsRng).into();
        key.to_vec()
    }

    /// Encrypts plaintext and prepends the 12-byte nonce.
    pub fn encrypt(&self, plaintext: &[u8]) -> Vec<u8> {
        let nonce = Aes256Gcm::generate_nonce(&mut OsRng); // 96-bits; unique per message
        let mut cipher_text = self.cipher.encrypt(&nonce, plaintext).unwrap();
        
        let mut output = nonce.to_vec();
        output.append(&mut cipher_text);
        output
    }

    /// Decrypts ciphertext assuming the first 12 bytes are the nonce.
    pub fn decrypt(&self, ciphertext: &[u8]) -> Vec<u8> {
        let (nonce_bytes, data) = ciphertext.split_at(12);
        let nonce = Nonce::from_slice(nonce_bytes);
        self.cipher.decrypt(nonce, data).unwrap()
    }
}

/// Keychain identity for signing events (Ed25519).
#[wasm_bindgen]
pub struct Identity {
    signing_key: SigningKey,
}

#[wasm_bindgen]
impl Identity {
    /// Ephemeral generation.
    pub fn generate() -> Self {
        Self {
            signing_key: SigningKey::generate(&mut OsRng),
        }
    }

    /// Exports public verification key bytes.
    pub fn public_key(&self) -> Vec<u8> {
        self.signing_key.verifying_key().to_bytes().to_vec()
    }

    /// Sign an arbitrary message.
    pub fn sign(&self, message: &[u8]) -> Vec<u8> {
        self.signing_key.sign(message).to_bytes().to_vec()
    }
}

/// Merkle Audit Log wrapper.
#[wasm_bindgen]
pub struct AuditLog {
    leaves: Vec<[u8; 32]>,
}

#[wasm_bindgen]
impl AuditLog {
    /// Creates a new empty audit log.
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self { leaves: Vec::new() }
    }

    /// Appends a new event payload to the log.
    pub fn append_event(&mut self, payload: &[u8]) {
        let hash = Sha256::hash(payload);
        self.leaves.push(hash);
    }

    /// Calculates the Merkle Root of the current log state.
    pub fn root(&self) -> JsValue {
        if self.leaves.is_empty() {
            return JsValue::NULL;
        }
        let tree = MerkleTree::<Sha256>::from_leaves(&self.leaves);
        let root = tree.root().unwrap();
        serde_wasm_bindgen::to_value(&root).unwrap()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_symmetric_encryption() {
        let key = SymmetricEngine::generate_key();
        let engine = SymmetricEngine::new_from_js(&key);
        let msg = b"Secret AI Context";
        let encrypted = engine.encrypt(msg);
        let decrypted = engine.decrypt(&encrypted);
        assert_eq!(decrypted, msg);
    }

    #[test]
    fn test_signing() {
        let id = Identity::generate();
        let msg = b"Commit hash 12345";
        let sig_bytes = id.sign(msg);
        let pk_bytes = id.public_key();
        
        let pk = VerifyingKey::from_bytes(pk_bytes.as_slice().try_into().unwrap()).unwrap();
        let sig = Signature::from_bytes(sig_bytes.as_slice().try_into().unwrap());
        assert!(pk.verify(msg, &sig).is_ok());
    }

    #[test]
    fn test_merkle_log() {
        let mut log = AuditLog::new();
        log.append_event(b"Event 1: Typed character A");
        log.append_event(b"Event 2: Typed character B");
        assert!(log.root().is_some());
    }
}
