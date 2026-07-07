import type { Phrase, Unit, VocabItem } from '../data/curriculum'
import { sample, shuffle } from './utils'

export type Exercise =
  | { kind: 'flash'; item: VocabItem }
  | { kind: 'listen-pick'; prompt: VocabItem; options: VocabItem[]; mode: 'emoji' | 'text' }
  | { kind: 'read-pick'; prompt: VocabItem; options: VocabItem[] }
  | { kind: 'build'; phrase: Phrase }
  | { kind: 'dictation'; phrase: Phrase }
  | { kind: 'speak'; phrase: Phrase }

function optionsFor(unit: Unit, target: VocabItem, n = 4): VocabItem[] {
  const distractors = sample(unit.vocab, n - 1, (v) => v.id === target.id || v.emoji === target.emoji)
  return shuffle([target, ...distractors])
}

/**
 * Staged lesson: present (flashcards with audio + image), then recognise by ear,
 * then read, then produce (arrange, type, speak). Listening comes before production.
 */
export function buildLesson(unit: Unit): Exercise[] {
  const vocab = shuffle(unit.vocab)
  const flash: Exercise[] = vocab.map((item) => ({ kind: 'flash', item }))

  const listenEmoji: Exercise[] = sample(unit.vocab, 5).map((v) => ({
    kind: 'listen-pick',
    prompt: v,
    options: optionsFor(unit, v),
    mode: 'emoji',
  }))
  const listenText: Exercise[] = sample(unit.vocab, 3).map((v) => ({
    kind: 'listen-pick',
    prompt: v,
    options: optionsFor(unit, v),
    mode: 'text',
  }))
  const readPick: Exercise[] = sample(unit.vocab, 4).map((v) => ({
    kind: 'read-pick',
    prompt: v,
    options: optionsFor(unit, v),
  }))

  const phrases = shuffle(unit.phrases)
  const build: Exercise[] = phrases.slice(0, 2).map((phrase) => ({ kind: 'build', phrase }))
  const shortPhrases = [...unit.phrases].sort((a, b) => a.it.length - b.it.length)
  const dictation: Exercise[] = [{ kind: 'dictation', phrase: shortPhrases[0] }]
  const speak: Exercise[] = phrases.slice(2, 4).map((phrase) => ({ kind: 'speak', phrase }))

  return [...flash, ...shuffle([...listenEmoji, ...listenText, ...readPick]), ...build, ...dictation, ...speak]
}

export function isScored(e: Exercise): boolean {
  return e.kind !== 'flash'
}
