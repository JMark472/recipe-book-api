import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  APP_NAME: process.env.APP_NAME || 'Portfolio API',
  PORT: parseInt(process.env.PORT || '7000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_change_me',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8000',
  DATABASE_URL: process.env.DATABASE_URL,
  CSRF_SECRET: process.env.CSRF_SECRET,
};
