import { DomainError } from '@/lib/errors/DomainError'

// DatabaseErrors.ts

export class MongoUriMissingError extends DomainError {
  constructor(message: unknown, options?: ErrorOptions) {
    super('MONGO_URI_REQUIRED', `Error Message: ${message}`, options)
    this.name = 'MongoUriMissingError'
  }
}

export class MongoDBConnectionError extends DomainError {
  constructor(message: unknown, options?: ErrorOptions) {
    super('MONGODB_CONNECTION_FAILED', `Error Message: ${message}`, options)
    this.name = 'MongoDBConnectionError'
  }
}

export class DatabaseConnectionError extends DomainError {
  constructor(message: unknown, options?: ErrorOptions) {
    super('DATABASE_CONNECTION_FAILED', `Error Message: ${message}`, options)
    this.name = 'DatabaseConnectionError'
  }
}

export class MongoClientConnectionError extends DomainError {
  constructor(message: unknown, options?: ErrorOptions) {
    super(
      'MONGO_CLIENT_CONNECTION_FAILED',
      `Error Message: ${message}`,
      options,
    )
    this.name = 'MongoClientConnectionError'
  }
}
