import { Db, MongoClient } from "mongodb";
import { appConfig } from "./env";

let client: MongoClient | null = null;

export const getMongoClient = async (): Promise<MongoClient> => {
  if (client) {
    return client;
  }
  client = new MongoClient(appConfig.mongoUri, {
    monitorCommands: false,
  });
  await client.connect();
  return client;
};

export const getMongoDb = async (): Promise<Db> => {
  const mongoClient = await getMongoClient();
  return mongoClient.db(appConfig.database);
};

export const closeMongo = async () => {
  if (client) {
    await client.close();
    client = null;
  }
};
