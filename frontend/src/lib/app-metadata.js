import baseManifest from '../../public/manifest.json'
import { LANGS } from './i18n-core.js'

export const APP_DESCRIPTIONS = {
  en: 'Personal gym and bodyweight tracker',
  it: 'Diario personale di allenamento e peso corporeo'
}

export const APP_LANGUAGES = Object.keys(LANGS)
export const MANIFEST_LANGUAGES = Object.keys(APP_DESCRIPTIONS)

export function appManifest(lang) {
  const metadataLang = lang === 'it' ? 'it' : 'en'
  return { ...baseManifest, lang: metadataLang, description: APP_DESCRIPTIONS[metadataLang] }
}

export function initialMetadataScript() {
  const descriptions = JSON.stringify(APP_DESCRIPTIONS).replaceAll('<', '\\u003c')
  const languages = JSON.stringify(APP_LANGUAGES)
  return `(()=>{try{const s=JSON.parse(localStorage.getItem('gym_state_v1')||'{}');const supported=${languages};let l=supported.includes(s.lang)?s.lang:((navigator.language||'').slice(0,2)==='ar'?'ar':'en');const metadataLang=l==='it'?'it':'en';const d=${descriptions};document.documentElement.lang=l;const m=document.querySelector('meta[name="description"]');if(m)m.content=d[metadataLang];const link=document.createElement('link');link.rel='manifest';link.crossOrigin='use-credentials';link.href='./manifest.'+metadataLang+'.json';document.head.append(link)}catch(e){}})()`
}

export function updateBrowserMetadata(lang) {
  const metadataLang = lang === 'it' ? 'it' : 'en'
  const description = document.querySelector('meta[name="description"]')
  if (description) description.content = APP_DESCRIPTIONS[metadataLang]
  const manifest = document.querySelector('link[rel="manifest"]')
  if (manifest) manifest.href = new URL(`./manifest.${metadataLang}.json`, document.baseURI).href
}
