import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let mongodInstance: any = null;

export const connectDB = async (): Promise<string> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicconnect';

  try {
    // Attempt connecting to the provided MONGODB_URI with reasonable timeout for cloud Atlas
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[MongoDB] Connected successfully to database: ${mongoose.connection.host}/${mongoose.connection.name}`);
    return uri;
  } catch (primaryError: any) {
    const maskedUri = uri.replace(/\/\/[^@]+@/, '//***:***@');
    console.warn(`[MongoDB] Could not connect to primary URI (${maskedUri}): ${primaryError.message}`);
    console.log('[MongoDB] Initializing in-memory MongoDB server fallback for demonstration...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const memoryUri = mongodInstance.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to Embedded MongoDB Server: ${memoryUri}`);
      return memoryUri;
    } catch (fallbackError: any) {
      console.error('[MongoDB] Failed to connect to both primary URI and in-memory server:', fallbackError);
      throw fallbackError;
    }
  }
};

export const closeDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};
