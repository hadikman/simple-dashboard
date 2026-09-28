import bcrypt from 'bcryptjs'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash)
}

/**
 * Returns a date normalized to UTC by removing the local timezone offset.
 *
 * This function creates a Date object that represents the same UTC time
 * as the input date, but without the local timezone offset applied.
 * When no date is provided, it uses the current date and time.
 *
 * @example
 * // If local timezone is UTC-5 (Eastern Standard Time)
 * const date = new Date('2023-12-25T10:00:00');
 * // getDateWithOffset(date) returns a Date representing '2023-12-25T15:00:00.000Z'
 *
 * @param {Date} [date] - Optional Date object to normalize. If omitted, uses current date/time.
 * @returns {Date} A new Date object normalized to UTC by removing local timezone offset.
 *
 * @remarks
 * Useful for:
 * - Storing dates in UTC format in databases
 * - Ensuring consistent date comparisons across timezones
 * - Displaying dates without local timezone interference
 * - Creating timezone-agnostic date representations
 */
export function getDateWithOffset(date?: Date): Date {
  if (date) {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  }
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
}

/**
 * Creates a promise that resolves after a specified delay.
 *
 * @param {number} ms - Delay duration in milliseconds
 * @returns {Promise<void>} A promise that resolves after the specified delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

/**
 * Ensures a promise takes at least a minimum amount of time to resolve.
 * This prevents UI flicker and provides a better user experience for quick-loading content.
 *
 * @template T - The type of value the promise resolves to
 *
 * @param {Promise<T>} promise - The original promise to await
 * @param {number} [minDelayMs=500] - Minimum delay in milliseconds before resolving (default: 500ms)
 * @returns {Promise<T>} A promise that resolves with the original promise's value,
 *                        but never before the minimum delay has elapsed
 *
 * @example
 * // Ensures loading spinner shows for at least 500ms
 * const userData = await withMinDelay(fetchUserData(), 500);
 *
 * @example
 * // Using with a custom delay
 * const productList = await withMinDelay(getProducts(), 1000);
 *
 * @remarks
 * Common use cases:
 * - Preventing loading spinners from flashing too briefly
 * - Ensuring users see loading states long enough to comprehend them
 * - Creating consistent perceived performance across fast and slow operations
 * - Improving UX for operations that sometimes complete very quickly
 *
 * @see {@link delay} - The utility function used to create the artificial delay
 */
export async function withMinDelay<T>(
  promise: Promise<T>,
  minDelayMs: number = 500,
): Promise<T> {
  const [result] = await Promise.all([promise, delay(minDelayMs)])
  return result
}

/**
 * Capitalizes the first letter of each word in a string.
 *
 * @param s - Input string to capitalize
 * @returns String with each word's first letter capitalized
 *
 * @example
 * capitalizeWords('hello world') // 'Hello World'
 */
export function capitalizeWords(s: string) {
  return s.replace(/\b\w/g, (c: string) => c.toLocaleUpperCase())
}

/**
 * Generates a short random identifier using base36 encoding.
 * Produces 7-character alphanumeric strings (e.g., 'abc1234').
 *
 * @returns {string} Random 7-character alphanumeric identifier
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

/**
 * Converts a string into a safe identifier by replacing dots with underscores.
 * Useful when using names as keys/IDs in contexts where dots have special meaning.
 *
 * @param name - The input string to sanitize
 * @returns A sanitized string with dots replaced by underscores
 */
export function safeId(name: string) {
  return name.replace(/\./g, '_')
}

/**
 * Returns the first non-nullish value from: fieldValue → initialValue → ''
 *
 * @param fieldValue - Primary value (used if not null/undefined)
 * @param initialValue - Fallback value (used if fieldValue is nullish)
 * @returns First non-nullish value or empty string
 */
export function resolveValue<T>(
  fieldValue: T | null | undefined,
  initialValue?: T | null,
) {
  if (fieldValue !== null && fieldValue !== undefined) {
    return fieldValue
  }

  if (initialValue !== null && initialValue !== undefined) {
    return initialValue
  }

  return ''
}

/**
 * Checks the value is string
 *
 * @param string - The input string
 * @returns true/false if the value is/not string
 */
export function isString(string: unknown): string is string {
  return typeof string === 'string'
}

/**
 * Gets a UTC date offset by a specified number of days from the current date or a reference date.
 *
 * @param {number} [days=1] - Number of days to add (positive) or subtract (negative).
 *                            Defaults to 1 (tomorrow) if not provided.
 * @param {boolean} [endOfDay=false] - If true, sets time to 23:59:59.999 UTC.
 *                                      If false, sets time to 00:00:00.000 UTC.
 * @param {Date} [referenceDate=new Date()] - The reference date to start from.
 *                                            Defaults to the current date/time.
 * @returns {Date} A new Date object with the calculated UTC date and time.
 *
 * @example
 * // Get tomorrow at 00:00:00 UTC from a specific date
 * const specificDate = new Date('2025-01-01T12:00:00Z');
 * const tomorrowFromSpecific = getUTCDateOffset(1, false, specificDate);
 */
export function getUTCDateOffset(
  days: number = 1,
  endOfDay: boolean = false,
  referenceDate: Date = new Date(),
): Date {
  const date = new Date(referenceDate)
  date.setUTCDate(date.getUTCDate() + days)

  if (endOfDay) {
    date.setUTCHours(23, 59, 59, 999)
  } else {
    date.setUTCHours(0, 0, 0, 0)
  }

  return date
}

/**
 * Formats a date to a localized date/time string.
 *
 * @param date - The date object to format
 * @param type - The format type: 'date' for MM/DD/YY or 'time' for HH:MM:SS AM/PM
 * @param [timezone] - Optional IANA timezone string. Defaults to system local timezone
 * @returns A formatted date or time string
 *
 * @example
 * // Get date in UTC
 * formatLocalDateTime(new Date(), 'date', 'UTC')
 * // Returns: "08/25/26"
 *
 * @example
 * // Get time in local timezone
 * formatLocalDateTime(new Date(), 'time')
 * // Returns: "10:30:00 AM" (in local time)
 *
 * @example
 * // Get time in Tokyo
 * formatLocalDateTime(new Date(), 'time', 'Asia/Tokyo')
 * // Returns: "11:30:00 PM"
 */
export function formatLocalDateTime(
  date: Date,
  type: 'date' | 'time',
  timezone?: Intl.DateTimeFormatOptions['timeZone'],
) {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    ...(type === 'date'
      ? { year: '2-digit', month: '2-digit', day: '2-digit' }
      : { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  }

  return type === 'date'
    ? date.toLocaleDateString('en-US', options)
    : date.toLocaleTimeString('en-US', options)
}

/**
 * Returns the base name of a filename, excluding its extension.
 *
 * The extension is determined by the last `.` in the filename. A leading dot
 * (e.g. `.gitignore`) is not treated as an extension separator, so filenames
 * starting with a dot will return an empty string.
 *
 * @param filename - The filename to extract the base name from.
 * @returns The filename without its extension, or an empty string if the
 *          filename has no extension or starts with a dot.
 *
 * @example
 * getFilename('archive.tar.gz') // => 'archive.tar'
 * getFilename('README.md')      // => 'README'
 * getFilename('.gitignore')     // => ''
 * getFilename('Makefile')       // => ''
 */
export function getFilename(filename: string): string {
  const dotIndex = filename.lastIndexOf('.')
  return dotIndex > 0 ? filename.slice(0, dotIndex) : ''
}

/**
 * Returns the extension of a filename, including the leading dot.
 *
 * The extension is determined by the last `.` in the filename and is
 * normalized to lowercase. A leading dot (e.g. `.gitignore`) is not treated
 * as an extension separator, so such filenames will return an empty string.
 *
 * @param filename - The filename to extract the extension from.
 * @returns The lowercased extension including the leading dot (e.g. `'.gz'`),
 *          or an empty string if the filename has no extension or starts with a dot.
 *
 * @example
 * getFileExtension('archive.tar.gz') // => '.gz'
 * getFileExtension('IMAGE.PNG')      // => '.png'
 * getFileExtension('.gitignore')     // => ''
 * getFileExtension('Makefile')       // => ''
 */
export function getFileExtension(filename: string): string {
  const lastDotIdx = filename.lastIndexOf('.')
  return lastDotIdx > 0 ? filename.slice(lastDotIdx).toLowerCase() : ''
}

/**
 * Appends a key-value pair to a `FormData` instance only if the value is
 * neither `null` nor `undefined`.
 *
 * The value is serialized to a JSON string before being appended, so it can
 * safely represent primitives, objects, arrays, or any JSON-serializable
 * structure. If the value is `null` or `undefined`, the function is a no-op
 * and the `FormData` remains unchanged.
 *
 * @param {FormData} fd - The `FormData` instance to append the value to.
 * @param {string} key - The field name under which the value will be stored.
 * @param {unknown} value - The value to conditionally append. It will be
 *   converted to a JSON string via `JSON.stringify`. If `null` or `undefined`,
 *   nothing is appended.
 * @returns {void} This function does not return a value.
 *
 * @example
 * const fd = new FormData();
 * appendIfDefined(fd, 'name', 'Alice');        // appends: name = '"Alice"'
 * appendIfDefined(fd, 'tags', ['a', 'b']);     // appends: tags = '["a","b"]'
 * appendIfDefined(fd, 'age', null);            // no-op
 * appendIfDefined(fd, 'meta', undefined);      // no-op
 *
 * @example
 * // Common usage: building a multipart/form-data payload from an object,
 * // skipping any optional fields that were not provided.
 * const payload = { title: 'Hello', subtitle: undefined, count: 3 };
 * const fd = new FormData();
 * for (const [key, value] of Object.entries(payload)) {
 *   appendIfDefined(fd, key, value);
 * }
 * // fd now contains only: title = '"Hello"' and count = '3'
 */
export function appendIfDefined(
  fd: FormData,
  key: string,
  value: unknown,
): void {
  if (value !== null && value !== undefined) {
    fd.append(key, JSON.stringify(value))
  }
}

/**
 * Parses a `FormData` entry by key and returns the deserialized value.
 *
 * Assumes the value was stored using `JSON.stringify` (e.g., via
 * `fd.append(key, JSON.stringify(value))`). This is the inverse of the
 * common `appendIfDefined` helper used to build `FormData` payloads.
 *
 * @param {FormData} fd - The `FormData` instance to read from.
 * @param {string} key - The field name whose value should be parsed.
 * @returns {any} The parsed JSON value. The return type is `any` because
 *   `JSON.parse` cannot infer the shape at compile time. Callers should
 *   cast or validate the result as needed.
 *
 * @throws {SyntaxError} If the value stored under `key` is not valid JSON.
 *
 * @example
 * const fd = new FormData()
 * fd.append('user', JSON.stringify({ id: 1, name: 'Alice' }))
 * const user = parseFormDataByKey(fd, 'user')
 * // user => { id: 1, name: 'Alice' }
 */
export function parseFormDataByKey<T>(fd: FormData, key: string): T {
  return JSON.parse(fd.get(key) as string) as T
}

/**
 * Recursively removes all `null` values from an object, including nested
 * plain objects. `undefined` values are preserved (only `null` is stripped).
 *
 * Behavior by value type:
 * - `null` → removed entirely (key is dropped).
 * - `Date` → kept as-is (dates are treated as leaf values, not recursed into).
 * - Plain object (`typeof v === 'object' && !Array.isArray(v)`) → recursed
 *   into; if the result is an empty object, the key is dropped.
 * - Array → kept as-is (arrays are not recursed into, so `null` inside
 *   arrays is preserved).
 * - Primitives (`string`, `number`, `boolean`, `undefined`, etc.) → kept as-is.
 *
 * Useful for building PATCH-style payloads where only explicitly provided
 * (non-null) fields should be sent, while preserving nested structure.
 * The original object is not mutated.
 *
 * @template T - The shape of the input object. Must extend
 *   `Record<string, unknown>`. The same type `T` is returned, since the
 *   function preserves the object's shape (minus removed `null` keys —
 *   TypeScript cannot express that narrowing, so the return type is
 *   intentionally the same as the input).
 *
 * @param {T} data - The object to strip `null` values from. May contain
 *   nested plain objects, `Date` instances, arrays, and primitives.
 * @returns {T} A new object with all `null` values removed recursively.
 *   Empty nested objects (resulting from null removal) are also dropped.
 *
 * @example
 * // Basic null removal
 * removeNullByRecursive({ a: 1, b: null, c: 'x' })
 * // => { a: 1, c: 'x' }
 *
 * @example
 * // Nested objects
 * removeNullByRecursive({
 *   title: 'Hello',
 *   meta: { author: null, tags: ['a'] },
 *   extra: { x: null },
 * })
 * // => { title: 'Hello', meta: { tags: ['a'] } }
 * // Note: `extra` is dropped because it became empty.
 *
 * @example
 * // Dates and arrays are preserved
 * removeNullByRecursive({
 *   publishedAt: new Date(),
 *   tags: [null, 'news'],   // null inside arrays is preserved
 * })
 * // => { publishedAt: Date, tags: [null, 'news'] }
 *
 * @example
 * // Typed usage
 * type TUpdatePostData = {
 *   title?: string | null
 *   meta?: { author?: string | null } | null
 * }
 * const cleaned = removeNullByRecursive<TUpdatePostData>({
 *   title: 'Hello',
 *   meta: { author: null },
 * })
 * // cleaned: TUpdatePostData => { title: 'Hello', meta: {} }
 */
export function removeNullByRecursive<T extends Record<string, unknown>>(
  data: T,
): T {
  return Object.fromEntries(
    Object.entries(data).reduce(
      (acc, [k, v]) => {
        if (v === null) {
          return acc
        }

        if (v instanceof Date) {
          acc.push([k, v])
          return acc
        }

        if (typeof v === 'object' && !Array.isArray(v)) {
          // Recursively call for nested plain objects
          const res = removeNullByRecursive(v as Record<string, unknown>)

          if (Object.keys(res).length !== 0) {
            acc.push([k, res])
          }

          return acc
        }

        acc.push([k, v])
        return acc
      },
      [] as [string, unknown][],
    ),
  ) as unknown as T
}
