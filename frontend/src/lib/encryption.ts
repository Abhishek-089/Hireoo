import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const TAG_LENGTH = 16

// Get encryption key from environment variable
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required')
  }

  // If key is shorter than required, hash it to get proper length
  if (key.length < KEY_LENGTH) {
    return crypto.scryptSync(key, 'salt', KEY_LENGTH)
  }

  return Buffer.from(key.slice(0, KEY_LENGTH), 'utf8')
}

export interface EncryptedData {
  encrypted: string
  iv: string
  tag: string
}

export class TokenEncryption {
  static encrypt(text: string): EncryptedData {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)

    // Use modern createCipheriv API compatible with current Node versions
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const tag = cipher.getAuthTag()

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    }
  }

  static decrypt(encryptedData: EncryptedData): string {
    const key = getEncryptionKey()
    const iv = Buffer.from(encryptedData.iv, 'hex')
    const tag = Buffer.from(encryptedData.tag, 'hex')

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  static encryptToken(token: string): string {
    const encrypted = this.encrypt(token)
    return JSON.stringify(encrypted)
  }

  static decryptToken(encryptedToken: string): string {
    const encrypted: EncryptedData = JSON.parse(encryptedToken)
    return this.decrypt(encrypted)
  }
}