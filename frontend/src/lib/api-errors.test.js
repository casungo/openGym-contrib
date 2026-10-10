import { describe, expect, it } from 'vitest'
import { API_ERROR_KEYS, apiErrorMessage } from './api-errors.js'
import { _setLangState } from './i18n-core.js'

const packs = import.meta.glob('../locales/*.js', { eager: true, import: 'default' })
const translated = Object.fromEntries(Object.entries(packs).map(([path, pack]) => [path.split('/').at(-1).replace('.js', ''), pack]))

const SERVER_CODES = [
  'bad-credentials', 'too-short', 'too-long', 'too-common', 'name-taken', 'email-invalid', 'email-taken',
  'invite', 'disabled', 'current-required', 'current-wrong', 'passkey', 'passkey-required', 'last-way-in',
  'reset-invalid', 'locked', 'busy', 'challenge-expired', 'unknown-credential', 'pair-invalid', 'link-invalid',
  'passkey-limit', 'credential-exists', 'not-found', 'missing', 'bad-request', 'media-type', 'media-too-large',
  'media-too-long', 'media-quota', 'media-invalid', 'media-missing', 'hash-mismatch', 'storage-full', 'timeout',
  'off', 'auth', 'provider', 'unusable', 'restart', 'nostate', 'noworkout', 'internal', 'consent', 'cap', 'shared',
  'unprivileged'
]

describe('API error display', () => {
  it('covers every server error code with a display key or a safe localized fallback', () => {
    expect(Object.keys(API_ERROR_KEYS)).toEqual(expect.arrayContaining(SERVER_CODES))
    for (const key of Object.values(API_ERROR_KEYS)) expect(typeof key).toBe('string')
  })

  it('uses Italian copy and falls back to English when the active locale has no API-specific copy', () => {
    _setLangState('it', translated.it)
    expect(apiErrorMessage({ code: 'bad-credentials', error: 'wrong name or password' }, 401)).toBe(translated.it['Wrong name, e-mail or password.'])
    expect(apiErrorMessage({ code: 'media-too-large', maxMB: 2, error: 'that file is too large' }, 413)).toBe(translated.it['That file is too big. Max {0} MB.'].replace('{0}', '2'))
    expect(apiErrorMessage({ code: 'shared', error: 'This instance is configured with a single shared account. Ask your admin to enable per-profile sign-in.' }, 409)).toBe(translated.it['This instance is configured with a single shared account. Ask your admin to enable per-profile sign-in.'])
    expect(apiErrorMessage({ code: 'locked' }, 429)).toBe(translated.it['Too many attempts. Try again later.'])
    expect(apiErrorMessage({ code: 'locked' }, 429, { upload: true })).toBe(translated.it['Too many uploads. Try again later.'])
    _setLangState('en', {})
    expect(apiErrorMessage({ code: 'shared' }, 409)).toBe('This instance is configured with a single shared account. Ask your admin to enable per-profile sign-in.')
    _setLangState('de', translated.de)
    expect(apiErrorMessage({ code: 'shared' }, 409)).toBe('This instance is configured with a single shared account. Ask your admin to enable per-profile sign-in.')
  })

  it('does not show unknown API text or credential-like details', () => {
    _setLangState('it', translated.it)
    const raw = 'authorization bearer secret-token-from-provider'
    expect(apiErrorMessage({ error: raw, code: 'unrecognized-code' }, 500)).toBe(translated.it['Server error (HTTP {0})'].replace('{0}', '500'))
    expect(apiErrorMessage({ error: raw }, 400)).not.toContain(raw)
  })

  it('maps known actionable legacy server errors without codes in Italian', () => {
    _setLangState('it', translated.it)
    expect(apiErrorMessage({ error: 'not verified' }, 400)).toBe(translated.it['The passkey could not be verified. Check that you’re using the right passkey, then try again.'])
    expect(apiErrorMessage({ error: 'credential already registered' }, 409)).toBe(translated.it['This passkey already belongs to a profile.'])
    expect(apiErrorMessage({ error: 'state unreadable' }, 503)).toBe(translated.it['Your training data on the server could not be read. Contact the instance admin.'])
    expect(apiErrorMessage({ error: 'not verified with secret-token' }, 400)).toBe(translated.it['Server error (HTTP {0})'].replace('{0}', '400'))
  })
})
