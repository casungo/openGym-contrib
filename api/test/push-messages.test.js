import test from 'node:test';
import assert from 'node:assert/strict';
import { dayReminderPush, restTimerPush, testPush } from '../push-messages.js';
import { LANGS } from '../../frontend/src/lib/i18n-core.js';

test('localizes server-generated reminders in Italian and preserves names and tags', () => {
  const rest = restTimerPush('it');
  const testNotice = testPush('it');
  const day = dayReminderPush('it', { name: 'Routine {0}', emoji: '🧭', tag: 'keep-this' });
  assert.deepEqual(rest, { title: 'Recupero finito 💪', body: 'È ora della prossima serie.', tag: 'rest-timer' });
  assert.deepEqual(testNotice, { title: 'openGym', body: 'Notifica di prova ✅ Gli avvisi appariranno così.', tag: 'test' });
  assert.deepEqual(day, {
    title: '🧭 Routine {0} oggi',
    body: 'È nel tuo piano. Forza 💪',
    tag: 'day-reminder',
  });
  assert.deepEqual(Object.keys(day).sort(), ['body', 'tag', 'title']);
});

test('uses English for supported locales without a pre-existing copy pack', () => {
  const enDay = dayReminderPush('en', { name: 'User routine', emoji: '🧭' });
  for (const lang of Object.keys(LANGS).filter(lang => !['en', 'it', 'pt-BR'].includes(lang))) {
    assert.deepEqual(restTimerPush(lang), restTimerPush('en'), `${lang} rest copy should use English`);
    assert.deepEqual(testPush(lang), testPush('en'), `${lang} test copy should use English`);
    assert.deepEqual(dayReminderPush(lang, { name: 'User routine', emoji: '🧭' }), enDay,
      `${lang} day copy should use English while preserving the routine name`);
  }
});

test('keeps the existing Brazilian Portuguese copy and payload shape', () => {
  assert.deepEqual(restTimerPush('pt-BR'), {
    title: 'Descanso terminado 💪',
    body: 'Hora da próxima série.',
    tag: 'rest-timer',
  });
  assert.deepEqual(testPush('pt-BR'), {
    title: 'openGym',
    body: 'Notificação de teste ✅ É assim que os alertas aparecem.',
    tag: 'test',
  });
  assert.deepEqual(dayReminderPush('pt-BR', { name: 'Treino A', emoji: '💪' }), {
    title: '💪 Treino A hoje',
    body: 'Está no seu plano. Bora treinar 💪',
    tag: 'day-reminder',
  });
});

test('uses localized fallback title when there is no routine', () => {
  assert.deepEqual(dayReminderPush('it', null), {
    title: 'Allenamento in programma oggi',
    body: 'È nel tuo piano. Forza 💪',
    tag: 'day-reminder',
  });
  assert.deepEqual(dayReminderPush('en', undefined), {
    title: 'Workout planned today',
    body: "It's on your plan. Let's go 💪",
    tag: 'day-reminder',
  });
});

test('keeps the existing English copy as the fallback', () => {
  assert.deepEqual(restTimerPush('xx'), restTimerPush('en'));
  assert.equal(dayReminderPush('unknown', null).title, 'Workout planned today');
  assert.equal(testPush(undefined).body, 'Test notification ✅ This is what alerts look like.');
});
