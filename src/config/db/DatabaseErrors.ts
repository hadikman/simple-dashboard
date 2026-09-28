import { DomainError } from '@/lib/errors/DomainError'

export class MongoUriMissingError extends DomainError {
  constructor(message: unknown) {
    super('MONGO_URI_REQUIRED', `Error Message: ${message}`)
  }
}

export class MongoDBConnectionError extends DomainError {
  constructor(message: unknown) {
    super('MONGODB_CONNECTION_FAILED', `Error Message: ${message}`)
  }
}

export class DatabaseConnectionError extends DomainError {
  constructor(message: unknown) {
    super('DATABASE_CONNECTION_FAILED', `Error Message: ${message}`)
  }
}

export class MongoClientConnectionError extends DomainError {
  constructor(message: unknown) {
    super('MONGO_CLIENT_CONNECTION_FAILED', `Error Message: ${message}`)
  }
}
