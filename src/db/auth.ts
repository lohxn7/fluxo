// Autenticação local apenas para fins de protótipo acadêmico.
// A senha nunca é salva em texto puro: usamos SHA-256 com salt via WebCrypto.
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function generateSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return bufferToHex(bytes.buffer)
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(salt + password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return bufferToHex(digest)
}

export async function verifyPassword(password: string, salt: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password, salt)
  return computed === hash
}

const SESSION_KEY = 'fluxo:session-user-id'

export function setSession(userId: string, remember: boolean) {
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(SESSION_KEY, userId)
}

export function getSession(): string | null {
  return localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY)
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}
