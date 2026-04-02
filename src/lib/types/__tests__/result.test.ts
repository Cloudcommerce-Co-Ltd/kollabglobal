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
  type Result,
  type Maybe,
} from '../result';

describe('Result<T, E>', () => {
  describe('ok()', () => {
    it('should create a successful Result with a value', () => {
      const result = ok(42);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(42);
      }
    });

    it('should work with various types', () => {
      const stringResult = ok('hello');
      expect(stringResult.ok).toBe(true);
      if (stringResult.ok) {
        expect(stringResult.value).toBe('hello');
      }

      const objectResult = ok({ id: 1, name: 'test' });
      expect(objectResult.ok).toBe(true);
      if (objectResult.ok) {
        expect(objectResult.value).toEqual({ id: 1, name: 'test' });
      }

      const arrayResult = ok([1, 2, 3]);
      expect(arrayResult.ok).toBe(true);
      if (arrayResult.ok) {
        expect(arrayResult.value).toEqual([1, 2, 3]);
      }
    });

    it('should work with null/undefined as values (if intentional)', () => {
      const nullResult = ok(null as never);
      expect(nullResult.ok).toBe(true);
    });
  });

  describe('err()', () => {
    it('should create a failed Result with an error', () => {
      const result = err('Something went wrong');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('Something went wrong');
      }
    });

    it('should work with various error types', () => {
      const stringError = err('error message');
      expect(stringError.ok).toBe(false);
      if (!stringError.ok) {
        expect(stringError.error).toBe('error message');
      }

      const numberError = err(404);
      expect(numberError.ok).toBe(false);
      if (!numberError.ok) {
        expect(numberError.error).toBe(404);
      }

      const objectError = err({ code: 'NOT_FOUND', message: 'Resource not found' });
      expect(objectError.ok).toBe(false);
      if (!objectError.ok) {
        expect(objectError.error).toEqual({ code: 'NOT_FOUND', message: 'Resource not found' });
      }
    });
  });

  describe('fromNullable()', () => {
    it('should wrap a non-null value in a successful Result', () => {
      const result = fromNullable(42, 'Value is null');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(42);
      }
    });

    it('should return an error Result when value is null', () => {
      const result = fromNullable(null, 'Value is null');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('Value is null');
      }
    });

    it('should return an error Result when value is undefined', () => {
      const result = fromNullable(undefined, 'Value is undefined');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('Value is undefined');
      }
    });

    it('should work with different types', () => {
      const stringResult = fromNullable('hello', 'No string');
      expect(stringResult.ok).toBe(true);
      if (stringResult.ok) {
        expect(stringResult.value).toBe('hello');
      }

      const objectResult = fromNullable({ id: 1 }, 'No object');
      expect(objectResult.ok).toBe(true);
      if (objectResult.ok) {
        expect(objectResult.value).toEqual({ id: 1 });
      }
    });

    it('should handle falsy values that are not null/undefined', () => {
      const zeroResult = fromNullable(0, 'No zero');
      expect(zeroResult.ok).toBe(true);
      if (zeroResult.ok) {
        expect(zeroResult.value).toBe(0);
      }

      const falseResult = fromNullable(false, 'No false');
      expect(falseResult.ok).toBe(true);
      if (falseResult.ok) {
        expect(falseResult.value).toBe(false);
      }

      const emptyStringResult = fromNullable('', 'No empty string');
      expect(emptyStringResult.ok).toBe(true);
      if (emptyStringResult.ok) {
        expect(emptyStringResult.value).toBe('');
      }
    });
  });

  describe('Type narrowing with discriminated unions', () => {
    it('should properly narrow types in control flow', () => {
      const result: Result<string, number> = ok('success');

      if (result.ok) {
        const value: string = result.value;
        expect(value).toBe('success');
      } else {
        const error: number = result.error;
        // error is never executed in this test
      }
    });

    it('should narrow to error type in else branch', () => {
      const result: Result<string, Error> = err(new Error('failed'));

      if (result.ok) {
        // Should not reach here
      } else {
        const error: Error = result.error;
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('failed');
      }
    });
  });
});

describe('Maybe<T>', () => {
  describe('isSome()', () => {
    it('should return true for non-null values', () => {
      expect(isSome(42)).toBe(true);
      expect(isSome('hello')).toBe(true);
      expect(isSome({ id: 1 })).toBe(true);
      expect(isSome([])).toBe(true);
    });

    it('should return false for null', () => {
      expect(isSome(null)).toBe(false);
    });

    it('should return true for falsy values that are not null', () => {
      expect(isSome(0)).toBe(true);
      expect(isSome(false)).toBe(true);
      expect(isSome('')).toBe(true);
    });

    it('should act as type guard', () => {
      const value: Maybe<string> = 'hello';

      if (isSome(value)) {
        const result: string = value;
        expect(result.length).toBe(5);
      }
    });

    it('should narrow null type in else branch', () => {
      const value: Maybe<number> = null;

      if (isSome(value)) {
        // Should not reach here
      } else {
        const none: null = value;
        expect(none).toBe(null);
      }
    });
  });

  describe('isNone()', () => {
    it('should return true for null', () => {
      expect(isNone(null)).toBe(true);
    });

    it('should return false for non-null values', () => {
      expect(isNone(42)).toBe(false);
      expect(isNone('hello')).toBe(false);
      expect(isNone({ id: 1 })).toBe(false);
      expect(isNone([])).toBe(false);
    });

    it('should return false for falsy values that are not null', () => {
      expect(isNone(0)).toBe(false);
      expect(isNone(false)).toBe(false);
      expect(isNone('')).toBe(false);
    });

    it('should act as type guard', () => {
      const value: Maybe<string> = null;

      if (isNone(value)) {
        const none: null = value;
        expect(none).toBe(null);
      }
    });
  });

  describe('mapMaybe()', () => {
    it('should apply function to Some value', () => {
      const result = mapMaybe(5, (x) => x * 2);
      expect(result).toBe(10);
    });

    it('should return null for None value', () => {
      const result = mapMaybe(null, (x: number) => x * 2);
      expect(result).toBe(null);
    });

    it('should work with string transformation', () => {
      const result = mapMaybe('hello', (s) => s.toUpperCase());
      expect(result).toBe('HELLO');
    });

    it('should work with object transformation', () => {
      const result = mapMaybe({ id: 1, name: 'test' }, (obj) => obj.name);
      expect(result).toBe('test');
    });

    it('should chain transformations', () => {
      const result = mapMaybe(
        'hello',
        (s) => s.length
      );
      expect(result).toBe(5);
    });

    it('should preserve null through transformation chain', () => {
      const value: Maybe<string> = null;
      const result = mapMaybe(value, (s) => s.length);
      expect(result).toBe(null);
    });

    it('should handle nested transformations', () => {
      const value: Maybe<{ data: number }> = { data: 42 };
      const result = mapMaybe(value, (obj) => obj.data * 2);
      expect(result).toBe(84);
    });

    it('should handle transformation that returns null', () => {
      const result = mapMaybe('hello', () => null);
      expect(result).toBe(null);
    });
  });

  describe('getOrElse()', () => {
    it('should return the value if Some', () => {
      const result = getOrElse('hello', 'default');
      expect(result).toBe('hello');
    });

    it('should return fallback if None', () => {
      const result = getOrElse(null, 'default');
      expect(result).toBe('default');
    });

    it('should return the value for falsy non-null values', () => {
      expect(getOrElse(0, 100)).toBe(0);
      expect(getOrElse(false, true)).toBe(false);
      expect(getOrElse('', 'default')).toBe('');
    });

    it('should work with object fallback', () => {
      const fallback = { id: 0, name: 'default' };
      const result = getOrElse(null, fallback);
      expect(result).toEqual(fallback);
    });

    it('should work with array fallback', () => {
      const fallback = [1, 2, 3];
      const result = getOrElse(null, fallback);
      expect(result).toEqual(fallback);
    });

    it('should preserve type when value is Some', () => {
      const value: Maybe<number> = 42;
      const result: number = getOrElse(value, 0);
      expect(result).toBe(42);
    });
  });

  describe('getOrThrow()', () => {
    it('should return the value if Some', () => {
      const result = getOrThrow('hello', 'Value is required');
      expect(result).toBe('hello');
    });

    it('should throw an error if None', () => {
      expect(() => {
        getOrThrow(null, 'Value is required');
      }).toThrow('Value is required');
    });

    it('should return falsy values without throwing', () => {
      expect(getOrThrow(0, 'Value is required')).toBe(0);
      expect(getOrThrow(false, 'Value is required')).toBe(false);
      expect(getOrThrow('', 'Value is required')).toBe('');
    });

    it('should throw with custom error message', () => {
      expect(() => {
        getOrThrow(null, 'Custom error: User not found');
      }).toThrow('Custom error: User not found');
    });

    it('should work with objects', () => {
      const obj = { id: 1, name: 'test' };
      const result = getOrThrow(obj, 'Object not found');
      expect(result).toEqual(obj);
    });

    it('should throw immediately on null', () => {
      expect(() => {
        getOrThrow(null, 'Unexpected null');
      }).toThrow(Error);
    });
  });

  describe('Complex scenarios', () => {
    it('should combine multiple Maybe operations', () => {
      const user: Maybe<{ id: number; name: string }> = { id: 1, name: 'Alice' };

      const name = mapMaybe(user, (u) => u.name);
      const nameOrDefault = getOrElse(name, 'Unknown');

      expect(nameOrDefault).toBe('Alice');
    });

    it('should handle null through chain', () => {
      const user: Maybe<{ id: number; name: string }> = null;

      const name = mapMaybe(user, (u) => u.name);
      const nameOrDefault = getOrElse(name, 'Unknown');

      expect(nameOrDefault).toBe('Unknown');
    });

    it('should chain isSome and isNone checks', () => {
      const values: Maybe<number>[] = [1, null, 3, null, 5];

      const someValues = values.filter(isSome);
      const noneValues = values.filter(isNone);

      expect(someValues).toEqual([1, 3, 5]);
      expect(noneValues).toEqual([null, null]);
    });

    it('should use Maybe with Result', () => {
      const maybeUser: Maybe<{ id: number; email: string }> = { id: 1, email: 'test@example.com' };

      const result = fromNullable(maybeUser, 'User not found');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.email).toBe('test@example.com');
      }
    });

    it('should handle nested null checks', () => {
      const maybeUser: Maybe<{ id: number; profile: { bio: string } | null }> = {
        id: 1,
        profile: null,
      };

      const bio = mapMaybe(maybeUser, (u) => u.profile?.bio ?? null);

      expect(bio).toBe(null);
    });

    it('should use Result to convert nullable to Maybe', () => {
      const nullable: string | null = 'test';
      const result = fromNullable(nullable, 'Value is null');

      if (result.ok) {
        const maybe: Maybe<string> = result.value;
        expect(maybe).toBe('test');
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings in Maybe operations', () => {
      const empty: Maybe<string> = '';
      expect(isSome(empty)).toBe(true);
      expect(getOrElse(empty, 'default')).toBe('');
    });

    it('should handle zero in Maybe operations', () => {
      const zero: Maybe<number> = 0;
      expect(isSome(zero)).toBe(true);
      expect(getOrElse(zero, 100)).toBe(0);
    });

    it('should handle false in Maybe operations', () => {
      const falsy: Maybe<boolean> = false;
      expect(isSome(falsy)).toBe(true);
      expect(getOrElse(falsy, true)).toBe(false);
    });

    it('should handle empty array in Maybe operations', () => {
      const empty: Maybe<number[]> = [];
      expect(isSome(empty)).toBe(true);
      expect(getOrElse(empty, [1, 2, 3])).toEqual([]);
    });

    it('should handle NaN in Maybe operations', () => {
      const nan: Maybe<number> = NaN;
      expect(isSome(nan)).toBe(true);
      expect(getOrElse(nan, 0)).toBe(NaN);
    });

    it('should handle Result with complex error types', () => {
      class CustomError extends Error {
        constructor(public code: string, message: string) {
          super(message);
        }
      }

      const result = err(new CustomError('NOT_FOUND', 'Resource not found'));

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('NOT_FOUND');
        expect(result.error.message).toBe('Resource not found');
      }
    });
  });
});
