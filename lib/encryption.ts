import crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16
const KEY_LENGTH = 32

// Get encryption key from environment variable
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required')
  }

  // For simplicity, we'll use the key directly as a 32-byte buffer
  // In production, you might want to use a more sophisticated key derivation
  const keyBuffer = Buffer.from(key, 'utf8')
  if (keyBuffer.length < KEY_LENGTH) {
    // Pad the key if it's too short
    const paddedKey = Buffer.alloc(KEY_LENGTH)
    keyBuffer.copy(paddedKey)
    return paddedKey
  }
  return keyBuffer.slice(0, KEY_LENGTH)
}

export function encrypt(text: string): string {
  if (!text) return ''

  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)

    // Use modern createCipheriv instead of deprecated createCipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // Combine IV + encrypted data
    const result = iv.toString('hex') + encrypted

    return result
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) return ''

  try {
    const key = getEncryptionKey()

    // Extract IV and encrypted data
    const iv = Buffer.from(encryptedText.slice(0, IV_LENGTH * 2), 'hex')
    const encrypted = encryptedText.slice(IV_LENGTH * 2)

    // Use modern createDecipheriv instead of deprecated createDecipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}


