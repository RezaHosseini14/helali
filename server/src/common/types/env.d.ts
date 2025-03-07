namespace NodeJS {
  interface ProcessEnv {
    APP_TITLE: string;
    PORT: number;
    CORS_URL: string;

    MINIO_URL: string;
    MINIO_PORT: string;
    MINIO_accessKey: string;
    MINIO_secretKey: string;

    DB_NAME: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_URL: string;
    DB_PORT: string;

    SWAGGER_TITLE: string;
    SWAGGER_DESC: string;

    JWT_SECRET: string;

    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;

    NODE_ENV: string;
  }
}
