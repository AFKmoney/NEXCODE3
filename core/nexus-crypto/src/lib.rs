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
pub struct SymmetricEngine {
    cipher: Aes256Gcm,
}

impl SymmetricEngine {
    /// Initialize with a precise 32-byte key.
    pub fn new(key_bytes: &[u8; 32]) -> Self {
        let key = Key::<Aes256Gcm>::from_slice(key_bytes);
        Self {
            cipher: Aes256Gcm::new(key.clone()),
        }
    }

    /// Generate a new 32-byte random key
    pub fn generate_key() -> [u8; 32] {
        Aes256Gcm::generate_key(OsRng).into()
    }

    /// Encrypts plaintext and prepends the 12-byte nonce.
    pub fn encrypt(&self, plaintext: &[u8]) -> Result<Vec<u8>, CryptoError> {
        let nonce = Aes256Gcm::generate_nonce(&mut OsRng); // 96-bits; unique per message
        let mut cipher_text = self.cipher.encrypt(&nonce, plaintext).map_err(|_| CryptoError::EncryptionError)?;
        
        let mut output = nonce.to_vec();
        output.append(&mut cipher_text);
        Ok(output)
    }

    /// Decrypts ciphertext assuming the first 12 bytes are the nonce.
    pub fn decrypt(&self, ciphertext: &[u8]) -> Result<Vec<u8>, CryptoError> {
        if ciphertext.len() < 12 {
            return Err(CryptoError::DecryptionError);
        }
        let (nonce_bytes, data) = ciphertext.split_at(12);
        let nonce = Nonce::from_slice(nonce_bytes);
        self.cipher.decrypt(nonce, data).map_err(|_| CryptoError::DecryptionError)
    }
}

/// Keychain identity for signing events (Ed25519).
pub struct Identity {
    signing_key: SigningKey,
}

impl Default for Identity {
    fn default() -> Self {
        Self::generate()
    }
}

impl Identity {
    /// Ephemeral generation (for testing/development). In prod, derived from Secure Enclave.
    pub fn generate() -> Self {
        Self {
            signing_key: SigningKey::generate(&mut OsRng),
        }
    }

    /// Exports public verification key.
    pub fn public_key(&self) -> VerifyingKey {
        self.signing_key.verifying_key()
    }

    /// Sign an arbitrary message.
    pub fn sign(&self, message: &[u8]) -> Signature {
        self.signing_key.sign(message)
    }
}

/// Merkle Audit Log wrapper.
pub struct AuditLog {
    leaves: Vec<[u8; 32]>,
}

impl Default for AuditLog {
    fn default() -> Self {
        Self::new()
    }
}

impl AuditLog {
    /// Creates a new empty audit log.
    pub fn new() -> Self {
        Self { leaves: Vec::new() }
    }

    /// Appends a new event payload to the log.
    pub fn append_event(&mut self, payload: &[u8]) {
        let hash = Sha256::hash(payload);
        self.leaves.push(hash);
    }

    /// Calculates the Merkle Root of the current log state.
    pub fn root(&self) -> Option<[u8; 32]> {
        if self.leaves.is_empty() {
            return None;
        }
        let tree = MerkleTree::<Sha256>::from_leaves(&self.leaves);
        tree.root()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_symmetric_encryption() {
        let key = SymmetricEngine::generate_key();
        let engine = SymmetricEngine::new(&key);
        let msg = b"Secret AI Context";
        let encrypted = engine.encrypt(msg).unwrap();
        let decrypted = engine.decrypt(&encrypted).unwrap();
        assert_eq!(decrypted, msg);
    }

    #[test]
    fn test_signing() {
        let id = Identity::generate();
        let msg = b"Commit hash 12345";
        let sig = id.sign(msg);
        assert!(id.public_key().verify(msg, &sig).is_ok());
    }

    #[test]
    fn test_merkle_log() {
        let mut log = AuditLog::new();
        log.append_event(b"Event 1: Typed character A");
        log.append_event(b"Event 2: Typed character B");
        assert!(log.root().is_some());
    }
}
