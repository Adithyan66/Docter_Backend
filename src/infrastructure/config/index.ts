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
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    s3BucketName: string;
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
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      region: process.env.AWS_REGION || '',
      s3BucketName: process.env.AWS_S3_BUCKET_NAME || '',
    },
    allowedImageTypes: process.env.ALLOWED_IMAGE_TYPES
      ? process.env.ALLOWED_IMAGE_TYPES.split(',').map(type => type.trim())
      : [],
  };
};

export const config = getConfig();
export default config;
