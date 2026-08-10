/** Parses a timestamp coming from the API into a local Date. */
export function parseServerDate(value: string): Date {
  return new Date(value);
}
