import app from "./app";
import { appConfig } from "./config/env";
import { getMongoClient } from "./config/mongo";

const startServer = async () => {
  try {
    await getMongoClient();
    app.listen(appConfig.port, () => {
      console.log(`Mongo API server listening on port ${appConfig.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
