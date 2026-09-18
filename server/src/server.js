import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 PlacementOS Backend Server running on port ${env.PORT}`);
      console.log(`📡 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 API Base URL: http://localhost:${env.PORT}/api`);
      console.log(`🔑 Real-Time 6-Digit Cryptographic OTP: ACTIVE`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
