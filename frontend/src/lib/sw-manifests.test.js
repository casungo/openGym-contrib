// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { stampSw } from '../../scripts/sw-stamp.mjs'

const source = readFileSync(fileURLToPath(new URL('../../public/sw.js', import.meta.url)), 'utf8')

class Cache {
  entries = new Map()
  async put(key, response) { this.entries.set(String(key), response) }
  async add(key) { this.entries.set(String(key), await globalThis.fetch(key)) }
  async match(key) { return this.entries.get(String(key)) }
  keys() { return [...this.entries.keys()] }
}

it('precaches all localized manifests into the current build cache', async () => {
  const handlers = {}
  const cache = new Cache()
  const urls = ['./manifest.en.json', './manifest.it.json']
  const requests = []
  const worker = {
    addEventListener: (type, handler) => { handlers[type] = handler },
    skipWaiting: () => {}, clients: { claim: async () => {} }, registration: {}
  }
  const caches = { open: async () => cache, keys: async () => [], match: async key => cache.match(key), delete: async () => true }
  const fetch = async url => {
    requests.push(String(url))
    if (String(url) === 'index.html') return new Response('<html></html>', { status: 200 })
    const lang = String(url).includes('.it.') ? 'it' : 'en'
    return new Response(JSON.stringify({ name: 'openGym', lang, description: lang }), { status: 200, headers: { 'content-type': 'application/manifest+json' } })
  }
  const stamped = stampSw(source, { stamp: 'test', manifests: urls })
  new Function('self', 'caches', 'fetch', 'location', stamped)(worker, caches, fetch, { origin: 'https://gym.test', href: 'https://gym.test/' })
  let done
  handlers.install({ waitUntil: promise => { done = promise } })
  await done

  expect(requests).toEqual(['index.html', ...urls])
  expect(cache.keys()).toEqual([...urls, 'index.html'])
})
