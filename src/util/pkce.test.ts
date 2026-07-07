import { webcrypto } from 'crypto';
import { TextEncoder } from 'util';
import {
  PKCE_CODE_VERIFIER_STORAGE_KEY,
  generateCodeChallenge,
  generateCodeVerifier,
} from './pkce';

beforeAll(() => {
  if (!globalThis.crypto?.subtle) {
    Object.defineProperty(globalThis, 'crypto', {
      value: webcrypto,
      configurable: true,
    });
  }

  if (!globalThis.TextEncoder) {
    globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
  }
});

/** SHA-256 S256 challenge for the RFC 7636 Appendix B verifier (verified via Web Crypto). */
const RFC7636_VERIFIER = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
const RFC7636_CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

describe('PKCE_CODE_VERIFIER_STORAGE_KEY', () => {
  it('is a stable session storage key name', () => {
    expect(PKCE_CODE_VERIFIER_STORAGE_KEY).toBe('spotify_pkce_code_verifier');
  });
});

describe('generateCodeVerifier', () => {
  it('returns a verifier within RFC 7636 length bounds by default', () => {
    const verifier = generateCodeVerifier();
    expect(verifier.length).toBe(64);
  });

  it('uses only unreserved PKCE characters', () => {
    const verifier = generateCodeVerifier();
    expect(verifier).toMatch(/^[A-Za-z0-9\-._~]+$/);
  });

  it('generates distinct verifiers on successive calls', () => {
    const first = generateCodeVerifier();
    const second = generateCodeVerifier();
    expect(first).not.toBe(second);
  });

  it('rejects lengths outside the RFC 7636 range', () => {
    expect(() => generateCodeVerifier(42)).toThrow(RangeError);
    expect(() => generateCodeVerifier(129)).toThrow(RangeError);
  });
});

describe('generateCodeChallenge', () => {
  it('matches the RFC 7636 S256 example', async () => {
    const challenge = await generateCodeChallenge(RFC7636_VERIFIER);
    expect(challenge).toBe(RFC7636_CHALLENGE);
  });

  it('is deterministic for the same verifier', async () => {
    const verifier = generateCodeVerifier();
    const first = await generateCodeChallenge(verifier);
    const second = await generateCodeChallenge(verifier);
    expect(first).toBe(second);
  });

  it('produces a base64url string without padding', async () => {
    const challenge = await generateCodeChallenge(generateCodeVerifier());
    expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/);
    expect(challenge.endsWith('=')).toBe(false);
  });
});
