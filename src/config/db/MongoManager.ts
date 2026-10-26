import {
  type Collection,
  type Db,
  type Document,
  type MongoClientOptions,
  MongoClient,
  MongoServerError,
} from 'mongodb'

import { type CollectionName, COLLECTIONS } from './mongo-manger.types'

import {
  DatabaseConnectionError,
  MongoDBConnectionError,
  MongoUriMissingError,
} from './DatabaseErrors'
import { COLLECTION_CONFIG } from './collection-configs'

const NAMESPACE_EXISTS = 48

class MongoManager {
  private clientPromise: Promise<MongoClient> | null = null
  private client: MongoClient | null = null
  private db: Db | null = null

  // One in-flight/finished setup promise per collection.
  // Storing the promise (not a boolean) makes concurrent first requests share one setup.
  // Persists across reconnects: collections live on the server, not in the connection.
  private collectionReady = new Map<CollectionName, Promise<void>>()

  public readonly USERS_COLL = COLLECTIONS.USERS
  public readonly CATEGORY_COLL = COLLECTIONS.CATEGORY
  public readonly POSTS_COLL = COLLECTIONS.POSTS
  public readonly POSTS_DRAFT_COLL = COLLECTIONS.POSTS_DRAFT
  public readonly PRODUCTS_COLL = COLLECTIONS.PRODUCTS
  public readonly PRODUCTS_DRAFT_COLL = COLLECTIONS.PRODUCTS_DRAFT
  public readonly BRANDS_COLL = COLLECTIONS.BRANDS
  public readonly FEATURES_COLL = COLLECTIONS.FEATURES
  public readonly OFFERS_COLL = COLLECTIONS.OFFERS
  public readonly GUARANTEES_COLL = COLLECTIONS.GUARANTEES

  private constructor() {}

  static getInstance(): MongoManager {
    // globalThis survives Next.js HMR / module re-evaluation,
    // so we never create a second client (and a second pool).
    const g = globalThis as unknown as { __mongoManager?: MongoManager }
    return (g.__mongoManager ??= new MongoManager())
  }

  // ---------------------------------------------------------------- connection

  private getClient(): Promise<MongoClient> {
    if (!this.clientPromise) {
      this.clientPromise = this.createClient().catch(error => {
        // Allow the next call to retry instead of caching the failure forever
        this.clientPromise = null
        throw error
      })
    }
    return this.clientPromise
  }

  private async createClient(): Promise<MongoClient> {
    const uri =
      process.env.MONGO_URI ||
      (process.env.NODE_ENV === 'production'
        ? undefined
        : 'mongodb://127.0.0.1:27017/')

    if (!uri) {
      throw new MongoUriMissingError(
        'MONGO_URI environment variable is required',
      )
    }

    const options: MongoClientOptions = {
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 10,
      minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE) || 0,
      maxIdleTimeMS: 60_000,
      connectTimeoutMS: 10_000,
      serverSelectionTimeoutMS: 5_000,
      socketTimeoutMS: 45_000,
      appName: 'simple-dashboard',
    }

    const client = new MongoClient(uri, options)
    try {
      await client.connect()
      const db = client.db(process.env.MONGO_DB_NAME || 'simple-dashboard')
      await db.command({ ping: 1 })

      this.client = client
      this.db = db
      console.log('✅ MongoDB connected (pool ready)')
      return client
    } catch (error) {
      await client.close().catch(() => {}) // don't leak sockets on failure
      throw new MongoDBConnectionError(
        `Failed to connect to MongoDB: ${error instanceof Error ? error.message : error}`,
        { cause: error },
      )
    }
  }

  /** Plain connected DB handle (does NOT ensure collections; prefer getCollection). */
  async getConnectedDatabase(): Promise<Db> {
    await this.getClient()
    if (!this.db) throw new DatabaseConnectionError('Database not connected.')
    return this.db
  }

  // --------------------------------------------------------------- collections

  /**
   * Main entry point for each dashboard section.
   * First call per collection: verifies it exists (creates it if not), applies
   * validator/indexes if configured. Every later call: no DB round-trip.
   */
  async getCollection<T extends Document = Document>(
    name: CollectionName,
  ): Promise<Collection<T>> {
    const db = await this.getConnectedDatabase()
    await this.ensureCollection(name)
    return db.collection<T>(name)
  }

  private ensureCollection(name: CollectionName): Promise<void> {
    let ready = this.collectionReady.get(name)
    if (!ready) {
      ready = this.setupCollection(name).catch(error => {
        this.collectionReady.delete(name) // retry on next request
        throw error
      })

      this.collectionReady.set(name, ready)
    }
    return ready
  }

  private async setupCollection(name: CollectionName): Promise<void> {
    const db = this.db
    if (!db) throw new DatabaseConnectionError('Database not connected.')

    const config = COLLECTION_CONFIG[name]

    const exists = await db
      .listCollections({ name }, { nameOnly: true })
      .hasNext()

    if (!exists) {
      try {
        await db.createCollection(
          name,
          config?.validator ? { validator: config.validator } : undefined,
        )
        console.log(`✅ Collection "${name}" created`)
      } catch (error) {
        // Another process/worker created it first, which is fine
        if (!(
          error instanceof MongoServerError && error.code === NAMESPACE_EXISTS
        )) {
          throw error
        }
      }
    } else if (config?.validator) {
      // Keep validator in sync for collections that already exist
      await db.command({ collMod: name, validator: config.validator })
    }

    if (config?.indexes?.length) {
      await db.collection(name).createIndexes(config.indexes)
    }
  }

  // ------------------------------------------------------------------- utility

  /** Real health check (use in a /api/health route). */
  async ping(): Promise<boolean> {
    try {
      const db = await this.getConnectedDatabase()
      await db.command({ ping: 1 })
      return true
    } catch {
      return false
    }
  }

  /** Whether a client has been established (not a liveness check; use ping()). */
  getConnectionStatus(): boolean {
    return this.client !== null
  }

  async close(): Promise<void> {
    const client = this.client
    this.clientPromise = null
    this.client = null
    this.db = null
    // collectionReady is intentionally kept: collections still exist on the server
    if (client) {
      await client.close()
      console.log('✅ MongoDB connection closed')
    }
  }
}

export const mongoManager = MongoManager.getInstance()
