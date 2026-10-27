import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB, closeDB } from './config/db';
import Issue from './models/Issue';
import { seedDatabase } from './utils/seed';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB (Atlas, Local, or embedded fallback)
    await connectDB();

    // Auto-seed if database is currently empty
    const issueCount = await Issue.countDocuments();
    if (issueCount === 0) {
      console.log('[Server] Database is empty. Auto-seeding initial demo data...');
      await seedDatabase();
    } else {
      console.log(`[Server] Database contains ${issueCount} issues. Ready.`);
    }

    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(` CivicConnect API Server running on port ${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
      console.log(` API Root:     http://localhost:${PORT}/api`);
      console.log('====================================================');
    });

    const handleShutdown = async (signal: string) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await closeDB();
        console.log('[Server] MongoDB connection closed. Exiting process.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (error) {
    console.error('[Server] Critical failure during startup:', error);
    process.exit(1);
  }
};

startServer();
