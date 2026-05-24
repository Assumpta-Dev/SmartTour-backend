import { createHmac, timingSafeEqual } from 'crypto';

type AdminTokenPayload = {
  role: 'admin';
  iat: number;
  exp: number;
};

const TOKEN_LIFETIME_SECONDS = 8 * 60 * 60;
const JWT_HEADER = {
  alg: 'HS256',
  typ: 'JWT',
} as const;

function encodeBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(signingInput: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(signingInput).digest();
}

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

export function createAdminToken(secret: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminTokenPayload = {
    role: 'admin',
    iat: now,
    exp: now + TOKEN_LIFETIME_SECONDS,
  };

  const encodedHeader = encodeBase64Url(JSON.stringify(JWT_HEADER));
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = sign(signingInput, secret).toString('base64url');

  return `${signingInput}.${signature}`;
}

export function verifyAdminToken(token: string, secret: string): AdminTokenPayload {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('Malformed token');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = parseJson<{ alg?: string; typ?: string }>(decodeBase64Url(encodedHeader));

  if (header.alg !== JWT_HEADER.alg || header.typ !== JWT_HEADER.typ) {
    throw new Error('Unsupported token format');
  }

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = sign(signingInput, secret);
  const receivedSignature = Buffer.from(encodedSignature, 'base64url');

  if (
    receivedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(receivedSignature, expectedSignature)
  ) {
    throw new Error('Invalid token signature');
  }

  const payload = parseJson<AdminTokenPayload>(decodeBase64Url(encodedPayload));
  const now = Math.floor(Date.now() / 1000);

  if (payload.role !== 'admin') {
    throw new Error('Invalid token role');
  }

  if (!Number.isFinite(payload.exp) || payload.exp <= now) {
    throw new Error('Token expired');
  }

  return payload;
}
