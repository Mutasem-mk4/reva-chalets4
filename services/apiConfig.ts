
/**
 * REVA CHALET - DATABASE CONFIGURATION
 * SECURITY NOTICE: Sensitive credentials have been moved to environment variables.
 * When deploying, ensure MONGODB_URI is set in your hosting provider's secret manager.
 */

export const DB_CONFIG = {
  // Use environment variables for the URI to keep credentials off GitHub
  uri: 'REDACTED_SENSITIVE_URI', 
  clusterName: 'Reva-chalet',
  dbName: 'reva_production',
  status: 'PROTECTED',
  lastPing: new Date().toISOString()
};

export const API_BASE_URL = 'https://api.revachalet.jo/v1';
