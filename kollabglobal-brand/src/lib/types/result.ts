/**
 * Result<T, E> — Represents a computation that can succeed with a value T or fail with an error E.
 * This is a lightweight, zero-dependency implementation inspired by Rust's Result type.
 *
 * @example
 * ```ts
 * const result: Result<number, string> = ok(42);
 * if (result.ok) {
 *   console.log(result.value); // 42
 * } else {
 *   console.log(result.error);
 * }
 * ```
 */
export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

/**
 * Create a successful Result.
 *
 * @example
 * ```ts
 * const success = ok(42);
 * ```
 */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/**
 * Create a failed Result.
 *
 * @example
 * ```ts
 * const failure = err("Something went wrong");
 * ```
 */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/**
 * Convert a nullable value into a Result.
 * If the value is null or undefined, returns an error Result with the provided error message.
 *
 * @example
 * ```ts
 * const result = fromNullable(user, "User not found");
 * ```
 */
export function fromNullable<T>(
  value: T | null | undefined,
  error: string
): Result<T, string> {
  if (value === null || value === undefined) {
    return err(error);
  }
  return ok(value);
}

/**
 * Maybe<T> — Represents an optional value. Simpler than Result when no error context is needed.
 *
 * @example
 * ```ts
 * const value: Maybe<string> = "hello" | null;
 * ```
 */
export type Maybe<T> = T | null;

/**
 * Type guard to check if a Maybe value is Some (not null).
 *
 * @example
 * ```ts
 * if (isSome(value)) {
 *   // value is safely T here
 *   console.log(value.length);
 * }
 * ```
 */
export function isSome<T>(value: Maybe<T>): value is T {
  return value !== null;
}

/**
 * Type guard to check if a Maybe value is None (null).
 *
 * @example
 * ```ts
 * if (isNone(value)) {
 *   console.log("Value is null");
 * }
 * ```
 */
export function isNone<T>(value: Maybe<T>): value is null {
  return value === null;
}

/**
 * Map a Maybe value using a transformation function.
 * Returns null if the input is null, otherwise applies the function.
 *
 * @example
 * ```ts
 * const result = mapMaybe("hello", (s) => s.length); // 5 | null
 * ```
 */
export function mapMaybe<T, U>(value: Maybe<T>, fn: (v: T) => U): Maybe<U> {
  if (value === null) {
    return null;
  }
  return fn(value);
}

/**
 * Extract the value from a Maybe, or return a fallback if null.
 *
 * @example
 * ```ts
 * const result = getOrElse(value, "default");
 * ```
 */
export function getOrElse<T>(value: Maybe<T>, fallback: T): T {
  if (value === null) {
    return fallback;
  }
  return value;
}

/**
 * Extract the value from a Maybe, or throw an error if null.
 *
 * @example
 * ```ts
 * const result = getOrThrow(value, "Value must not be null");
 * ```
 *
 * @throws Error if the value is null
 */
export function getOrThrow<T>(value: Maybe<T>, msg: string): T {
  if (value === null) {
    throw new Error(msg);
  }
  return value;
}
