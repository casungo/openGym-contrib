// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, describe, expect, it } from 'vitest'
import { useStore } from './store/useStore.js'
import { useUI } from './store/useUI.js'
import { startFlow } from './sheets.jsx'
import { _setLangState } from './lib/i18n-core.js'
import italian from './locales/it.js'

// Start opens the quick weigh-in unless Settings → During a workout → "Weigh in before
// workouts" is off (issue #137) — then the session begins at once, with no body weight on it.

describe('the weigh-in before a workout is a setting', () => {
  it('shows Italian decimal chips and changes the numeric weight', () => {
    useUI.setState({ sheets: [] })
    useStore.setState(s => ({ S: { ...s.S, unit: 'kg', weighIn: true, bodyweight: [] } }))
    _setLangState('it', italian, null, null)
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    try {
      act(() => startFlow([]))
      const sheet = useUI.getState().sheets[0]
      act(() => root.render(sheet.render(() => {})))
      const chips = [...host.querySelectorAll('button.chip')]
      expect(chips.map(b => b.textContent)).toEqual(['−1', '−0,5', '+0,5', '+1'])
      act(() => chips.find(b => b.textContent === '+0,5').click())
      expect(Number(host.querySelector('input').value)).toBe(70.5)
    } finally {
      act(() => root.unmount())
      host.remove()
      _setLangState('en', {}, null, null)
    }
  })

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    useUI.setState({ sheets: [], toasts: [] })
    useStore.setState(s => ({ S: { ...s.S, active: null, routines: [], workouts: [], bodyweight: [], weighIn: true } }))
  })

  it('on (the default): Start opens the weigh-in and the session waits for it', () => {
    act(() => startFlow([]))
    expect(useUI.getState().sheets).toHaveLength(1)
    expect(useUI.getState().sheets[0].locked).toBe(true)   // the required weigh-in, not a plain sheet
    expect(useStore.getState().S.active).toBeNull()
  })

  it('a profile written before the setting existed still asks', () => {
    useStore.setState(s => { const S = { ...s.S }; delete S.weighIn; return { S } })
    act(() => startFlow([]))
    expect(useUI.getState().sheets).toHaveLength(1)
    expect(useUI.getState().sheets[0].locked).toBe(true)
    expect(useStore.getState().S.active).toBeNull()
  })

  it('off: Start begins the session at once, with no sheet and no body weight', () => {
    useStore.setState(s => ({ S: { ...s.S, weighIn: false } }))
    act(() => startFlow([]))
    expect(useUI.getState().sheets).toHaveLength(0)
    const { active } = useStore.getState().S
    expect(active).not.toBeNull()
    expect(active.bw).toBeNull()
    expect(active.routineIds).toEqual([])
  })
})
