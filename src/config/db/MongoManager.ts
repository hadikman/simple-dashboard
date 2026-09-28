import { Db, MongoClient } from 'mongodb'

import {
  DatabaseConnectionError,
  MongoDBConnectionError,
  MongoUriMissingError,
} from './DatabaseErrors'

class MongoManager {
  private static instance: MongoManager
  private client: MongoClient | null = null
  private db: Db | null = null
  private connectionPromise: Promise<void> | null = null
  private isConnected = false
  private isConnecting = false

  public USERS_COLL = 'users'
  public POSTS_COLL = 'posts'
  public POSTS_DRAFT_COLL = 'posts_draft'
  public POSTS_CATEGORY_COLL = 'posts_category'
  public PRODUCTS_COLL = 'products'
  public PRODUCTS_DRAFT_COLL = 'products_draft'
  public BRANDS_COLL = 'brands'
  public FEATURES_COLL = 'features'
  public OFFERS_COLL = 'offers'
  public GUARANTEES_COLL = 'guarantees'

  private constructor() {}

  static getInstance(): MongoManager {
    if (!MongoManager.instance) {
      MongoManager.instance = new MongoManager()
    }
    return MongoManager.instance
  }

  private async connect(): Promise<void> {
    // If already connected, return immediately
    if (this.isConnected && this.db) {
      return
    }

    // If connection is in progress, return the existing promise
    if (this.connectionPromise) {
      return this.connectionPromise
    }

    // Start new connection
    this.isConnecting = true
    this.connectionPromise = this.establishConnection()

    try {
      await this.connectionPromise
      this.isConnecting = false
    } catch (error) {
      this.isConnecting = false
      this.connectionPromise = null
      throw error
    }
  }

  private async establishConnection(): Promise<void> {
    const uri = process.env.MONGO_URI || 'mongodb://0.0.0.0:27017/'
    if (!uri) {
      throw new MongoUriMissingError(
        'MONGO_URI environment variable is required',
      )
    }

    try {
      this.client = new MongoClient(uri)
      await this.client.connect()
      this.db = this.client.db(process.env.MONGO_DB_NAME || 'simple-dashboard')

      // Test the connection
      await this.db.command({ ping: 1 })
      this.isConnected = true
      console.log('✅ MongoDB connected successfully with connection pooling')
    } catch (error) {
      this.client = null
      this.db = null
      this.isConnected = false
      throw new MongoDBConnectionError(`Failed to connect to MongoDB: ${error}`)
    }
  }

  private async ensureConnection(): Promise<void> {
    if (!this.isConnected && !this.isConnecting) {
      await this.connect()
    } else if (this.isConnecting) {
      // Wait for the ongoing connection to complete
      await this.connectionPromise
    }
  }

  private getDatabase(): Db {
    if (!this.db || !this.isConnected) {
      throw new DatabaseConnectionError('Database not connected.')
    }
    return this.db
  }

  // Public method that automatically ensures connection
  async getConnectedDatabase(): Promise<Db> {
    await this.ensureConnection()
    return this.getDatabase()
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.db = null
      this.isConnected = false
      this.connectionPromise = null
      this.isConnecting = false
      console.log('✅ MongoDB connection closed')
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }
}

export const mongoManager = MongoManager.getInstance()
