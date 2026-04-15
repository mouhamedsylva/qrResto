export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  corsOrigin: process.env.APP_CORS_ORIGIN || 'http://localhost:5173',
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    name: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
  stripe: {
    secretKey: process.env.STRIPE_API_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  storage: {
    driver: process.env.STORAGE_DRIVER || 'local', // 'local' | 's3'
    s3Bucket: process.env.S3_BUCKET,
    s3Region: process.env.S3_REGION,
  },
});
