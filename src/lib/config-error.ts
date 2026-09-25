/** A required service (database, payments, AI…) isn't configured yet. Shown to visitors as a friendly 503. */
export class ConfigError extends Error {
  constructor(public readonly service: string, detail: string) {
    super(detail);
  }
}
