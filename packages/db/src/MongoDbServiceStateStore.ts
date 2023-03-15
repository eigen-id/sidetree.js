import MongoDbStore from './MongoDbStore';

import { IServiceStateStore } from '@evan.network/sidetree-common';
import { FindOptions, WithoutId } from 'mongodb';

/**
 * Implementation of IServiceStateStore using MongoDB database.
 */
export default class MongoDbServiceStateStore<T> extends MongoDbStore
  implements IServiceStateStore<T> {
  /** Collection name for storing service state. */
  public static readonly collectionName = 'service';

  /**
   * Constructs a `MongoDbServiceStateStore`;
   */
  constructor(serverUrl: string, databaseName: string) {
    super(serverUrl, MongoDbServiceStateStore.collectionName, databaseName);
  }

  async put(serviceState: T) {
    await this.collection!.replaceOne({}, serviceState as WithoutId<T>, { upsert: true }); // { } filter results in replacement of the first document returned.
  }

  public async get(): Promise<T> {
    const queryOptions = { fields: { _id: 0 } } as FindOptions<Document>; // Exclude `_id` field from being returned.
    const serviceState = await this.collection!.findOne({}, queryOptions);

    return serviceState ? serviceState : {};
  }
}
