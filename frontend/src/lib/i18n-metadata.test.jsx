// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest'
import { setLang } from './i18n.js'
import * as italian from '../locales/it.js'

describe('localized document metadata', () => {
  beforeEach(() => {
    document.head.innerHTML = '<meta name="description" content="Personal gym & body weight tracker">'
  })

  it('uses Italian metadata and restores English through a locale without metadata', async () => {
    await setLang('it')
    expect(document.documentElement.lang).toBe('it')
    expect(document.querySelector('meta[name="description"]').content).toBe(italian.metadata.description)

    await setLang('en')
    expect(document.querySelector('meta[name="description"]').content).toBe('Personal gym & body weight tracker')

    await setLang('de')
    expect(document.documentElement.lang).toBe('de')
    expect(document.querySelector('meta[name="description"]').content).toBe('Personal gym & body weight tracker')
  })
})
