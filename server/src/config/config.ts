import { registerAs } from '@nestjs/config';

export enum ConfigKeys {
  App = 'App',
  Db = 'Db',
  Swagger = 'Swagger',
  Jwt = 'Jwt',
}

const AppConfig = registerAs(ConfigKeys.App, () => ({
  appTitle: process.env.APP_TITLE,
  port: process.env.PORT,
  corsUrl: process.env.CORS_URL,
}));

const DbConfig = registerAs(ConfigKeys.Db, () => ({
  port: process.env.DB_PORT,
  host: process.env.DB_URL,
  username: process.env.DB_PASSWORD,
  password: process.env.DB_USERNAME,
  database: process.env.DB_NAME,
}));

const SwaggerConfig = registerAs(ConfigKeys.Swagger, () => ({
  swaggerTitle: process.env.SWAGGER_TITLE,
  swaggerDesc: process.env.SWAGGER_DESC,
}));

const JwtConfig = registerAs(ConfigKeys.Jwt, () => ({
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
}));

export const configurations = [AppConfig, DbConfig, SwaggerConfig, JwtConfig];
