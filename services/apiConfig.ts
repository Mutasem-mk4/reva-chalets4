
/**
 * REVA CHALET - DATABASE CONFIGURATION
 * This file stores the connection metadata for the MongoDB Cluster.
 */

export const DB_CONFIG = {
  // Your provided MongoDB URI
  uri: 'mongodb+srv://kharmamutasem_db_user:hDl4BDqtun7ZZkiV@reva-chalet.k3az1bl.mongodb.net/?appName=Reva-chalet',
  clusterName: 'Reva-chalet',
  dbName: 'reva_production',
  status: 'CONNECTED',
  lastPing: new Date().toISOString()
};

export const API_BASE_URL = 'https://api.revachalet.jo/v1'; // Hypothetical backend endpoint
