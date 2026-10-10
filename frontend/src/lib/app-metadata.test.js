// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { APP_DESCRIPTIONS, APP_LANGUAGES, MANIFEST_LANGUAGES, appManifest, updateBrowserMetadata } from './app-metadata.js'

describe('localized browser and PWA metadata', () => {
  it('uses Italian metadata for Italian and English metadata as the fallback', () => {
    expect(MANIFEST_LANGUAGES.slice().sort()).toEqual(['en', 'it'])
    for (const lang of APP_LANGUAGES) {
      const metadataLang = lang === 'it' ? 'it' : 'en'
      expect(appManifest(lang)).toMatchObject({ name: 'openGym', short_name: 'openGym', lang: metadataLang, description: APP_DESCRIPTIONS[metadataLang] })
    }
    expect(appManifest('unsupported')).toMatchObject({ lang: 'en', description: APP_DESCRIPTIONS.en })
  })

  it('updates the HTML description and manifest URL when the app language changes', () => {
    document.head.innerHTML = '<meta name="description"><link rel="manifest">'
    updateBrowserMetadata('it')
    expect(document.querySelector('meta[name="description"]').content).toBe(APP_DESCRIPTIONS.it)
    expect(new URL(document.querySelector('link[rel="manifest"]').href).pathname).toBe('/manifest.it.json')
    updateBrowserMetadata('de')
    expect(document.querySelector('meta[name="description"]').content).toBe(APP_DESCRIPTIONS.en)
    expect(new URL(document.querySelector('link[rel="manifest"]').href).pathname).toBe('/manifest.en.json')
  })
})
