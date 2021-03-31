require('dotenv').config();

module.exports = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  migrations: ['dist/shared/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  migrationsRun: false,
  entities: ['dist/**/*.entity.js'],
  synchronize: true,
  cli: {
    migrationsDir: 'src/shared/migrations',
  },
  logging: true,
  logger: 'file',
};
