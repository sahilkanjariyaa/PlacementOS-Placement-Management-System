import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);

    // Automatically sync indexes and drop old conflicting non-partial indexes
    try {
      const studentProfilesCollection = conn.connection.db.collection('studentprofiles');
      const indexes = await studentProfilesCollection.indexes();
      const enrollmentIndex = indexes.find((idx) => idx.name === 'enrollmentNo_1');
      if (enrollmentIndex && !enrollmentIndex.partialFilterExpression) {
        await studentProfilesCollection.dropIndex('enrollmentNo_1');
        console.log('[MongoDB] Upgraded enrollmentNo index to partial filter expression.');
      }
    } catch (idxErr) {
      // Collection may not exist yet in fresh database
    }

    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    process.exit(1);
  }
};
