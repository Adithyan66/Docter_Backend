import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  jwtSecret?: string;
  jwtExpiresIn?: string;
  jwtRefreshSecret?: string;
  jwtRefreshExpiresIn?: string;
  corsOrigin?: string;
  storage: {
    provider: 's3' | 'gcp' | 'azure';
    s3: {
      accessKeyId: string;
      secretAccessKey: string;
      region: string;
      bucketName: string;
    };
  };
  allowedImageTypes: string[];
}

const getConfig = (): Config => {
  return {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/doctor',
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    corsOrigin: process.env.CORS_ORIGIN,
    storage: {
      provider: (process.env.STORAGE_PROVIDER || 's3') as 's3' | 'gcp' | 'azure',
      s3: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        region: process.env.AWS_REGION || '',
        bucketName: process.env.AWS_S3_BUCKET_NAME || '',
      },
    },
    allowedImageTypes: process.env.ALLOWED_IMAGE_TYPES
      ? process.env.ALLOWED_IMAGE_TYPES.split(',').map(type => type.trim())
      : [],
  };
};

export const config = getConfig();
export default config;
