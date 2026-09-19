import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || process.env.SERVER_PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || 'production',

  // Supabase Configuration
  SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',

  // Upstash Redis Configuration (Optional with graceful in-memory fallback)
  REDIS_URL: process.env.REDIS_URL || '',
  REDIS_TOKEN: process.env.REDIS_TOKEN || '',

  // Firebase Cloud Messaging Configuration (Optional with graceful fallback)
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),

  // CORS & Security
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://www.oci-domain.com',
  CORS_ALLOWED_ORIGINS: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001,https://www.oci-domain.com,https://admin.oci-domain.com')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),
  
  JWT_SECRET: process.env.JWT_SECRET || 'oci-secure-jwt-secret-placeholder-change-in-prod',
};
