import { t } from './i18n-core.js'

// API `error` text remains English on the wire for older clients and operators. The client uses
// stable codes for display, and never echoes an unknown server string that might contain input or
// credentials. Values here are existing locale keys, so every shipped language can translate them.
export const API_ERROR_KEYS = {
  'bad-credentials': 'Wrong name, e-mail or password.',
  'too-short': 'Use at least {0} characters.',
  'too-long': 'That password is too long.',
  'too-common': 'That password is too easy to guess. Try a longer one, or a few random words strung together.',
  'name-taken': 'Another profile already signs in with this name.',
  'email-invalid': 'That is not an e-mail address.',
  'email-taken': 'Another profile already uses this e-mail address.',
  invite: 'That invite code is not valid.',
  disabled: 'This account has been disabled.',
  'current-required': 'Your current password is not right.',
  'current-wrong': 'Your current password is not right.',
  passkey: 'Your passkey could not be confirmed.',
  'passkey-required': 'Your passkey could not be confirmed.',
  'last-way-in': 'It is your only way in, so it cannot be removed until there is another.',
  'reset-invalid': 'That reset code is wrong or has expired. Ask your admin for a new one.',
  locked: 'Too many attempts. Try again later.',
  busy: 'The server is busy. Try again in a moment.',
  'challenge-expired': 'That took a little too long. Give it another go.',
  'unknown-credential': 'This server doesn’t know that passkey. Make a profile first.',
  'pair-invalid': 'That code is wrong, already used or expired. Make a new one on your other device.',
  'link-invalid': 'That code is wrong, already used or expired. Make a new one on your other device.',
  'passkey-limit': 'This profile already has as many passkeys as it can hold.',
  'credential-exists': 'This passkey already belongs to a profile.',
  'not-found': 'Could not find that passkey.',
  missing: 'Some required information is missing.',
  'bad-request': 'Couldn’t read that file.',
  'media-type': 'That file type isn’t supported. Use a photo, a GIF, or an MP4, MOV or WebM video.',
  'media-too-large': 'That file is too big. Max {0} MB.',
  'media-too-long': 'That video is too long. Max {0} seconds.',
  'media-quota': 'Your photo and video space on the server is full ({0} of {1} MB).',
  'media-invalid': 'Couldn’t read that file.',
  'media-missing': 'Couldn’t read that file.',
  'hash-mismatch': 'Couldn’t read that file.',
  'storage-full': 'The server is running out of disk space.',
  timeout: 'The server did not answer in time.',
  off: 'The Coach isn’t set up on this instance.',
  auth: 'The Coach couldn’t sign in to its provider. The instance owner needs to check its setup.',
  provider: 'The Coach couldn’t run. The instance owner needs to check its setup.',
  unusable: 'The Coach answered with something the app couldn’t use.',
  restart: 'The server restarted while the Coach was thinking.',
  nostate: 'The Coach couldn’t read your training data.',
  noworkout: 'There’s no workout to look at yet. Log one first.',
  internal: 'Something went wrong on the server.',
  consent: 'The Coach needs your go-ahead first.',
  cap: 'The Coach is taking a rest day. Try again tomorrow.',
  shared: 'This instance is configured with a single shared account. Ask your admin to enable per-profile sign-in.',
  unprivileged: 'The Coach is switched off on this instance for safety reasons.'
}

const ERROR_ARGS = {
  'too-short': () => [10],
  'media-too-large': d => [d.maxMB],
  'media-too-long': d => [d.maxSec],
  'media-quota': d => [d.usedMB, d.quotaMB]
}

// Older server routes still return these actionable messages without a stable code. Match only
// exact server-owned strings, so arbitrary error text (which may contain credentials or input)
// continues to use the generic HTTP fallback.
const LEGACY_ERROR_KEYS = {
  'not verified': 'The passkey could not be verified. Check that you’re using the right passkey, then try again.',
  'credential already registered': 'This passkey already belongs to a profile.',
  'state unreadable': 'Your training data on the server could not be read. Contact the instance admin.'
}

export function apiErrorMessage(data, status, { upload = false } = {}) {
  const code = data && typeof data.code === 'string' ? data.code : ''
  const key = code === 'busy' && status === 409
    ? 'The Coach is already thinking about your training.'
    : code === 'missing' && status === 503
      ? 'The Coach isn’t installed properly on this instance.'
    : code === 'locked' && upload
      ? 'Too many uploads. Try again later.'
    : API_ERROR_KEYS[code] || (typeof data?.error === 'string' ? LEGACY_ERROR_KEYS[data.error] : '')
  if (key) {
    const args = ERROR_ARGS[code]?.(data) || []
    if (args.some(value => !Number.isFinite(value))) return t('Server error (HTTP {0})', status)
    return t(key, ...args)
  }
  return t('Server error (HTTP {0})', Number.isFinite(status) ? status : 0)
}
