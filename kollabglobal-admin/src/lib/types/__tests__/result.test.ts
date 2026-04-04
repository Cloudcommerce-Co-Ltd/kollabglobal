import { describe, it, expect } from 'vitest';
import {
  ok,
  err,
  fromNullable,
  isSome,
  isNone,
  mapMaybe,
  getOrElse,
  getOrThrow,
} from '@/lib/types/result';
import type { Result, Maybe } from '@/lib/types/result';

describe('Result', () => {
  it('ok() creates a success result', () => {
    const result: Result<number> = ok(42);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(42);
  });

  it('err() creates a failure result', () => {
    const result: Result<number> = err('fail');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('fail');
  });

  it('fromNullable() returns ok for non-null value', () => {
    const result = fromNullable('hello', 'missing');
    expect(result).toEqual({ ok: true, value: 'hello' });
  });

  it('fromNullable() returns err for null', () => {
    const result = fromNullable(null, 'missing');
    expect(result).toEqual({ ok: false, error: 'missing' });
  });

  it('fromNullable() returns err for undefined', () => {
    const result = fromNullable(undefined, 'missing');
    expect(result).toEqual({ ok: false, error: 'missing' });
  });
});

describe('Maybe', () => {
  it('isSome() returns true for non-null', () => {
    expect(isSome('hello')).toBe(true);
  });

  it('isSome() returns false for null', () => {
    expect(isSome(null)).toBe(false);
  });

  it('isNone() returns true for null', () => {
    expect(isNone(null)).toBe(true);
  });

  it('isNone() returns false for non-null', () => {
    expect(isNone('hello')).toBe(false);
  });

  it('mapMaybe() applies fn to non-null value', () => {
    const result: Maybe<number> = mapMaybe('hello', (s) => s.length);
    expect(result).toBe(5);
  });

  it('mapMaybe() returns null for null input', () => {
    const result = mapMaybe(null, (s: string) => s.length);
    expect(result).toBeNull();
  });

  it('getOrElse() returns value when not null', () => {
    expect(getOrElse('hello', 'default')).toBe('hello');
  });

  it('getOrElse() returns fallback when null', () => {
    expect(getOrElse(null, 'default')).toBe('default');
  });

  it('getOrThrow() returns value when not null', () => {
    expect(getOrThrow('hello', 'boom')).toBe('hello');
  });

  it('getOrThrow() throws when null', () => {
    expect(() => getOrThrow(null, 'boom')).toThrow('boom');
  });
});
