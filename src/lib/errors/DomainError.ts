export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options)
    // Explicit name per class (set in subclasses) survives minification,
    // unlike relying on the class's own name.
    this.name = 'DomainError'
  }
}
