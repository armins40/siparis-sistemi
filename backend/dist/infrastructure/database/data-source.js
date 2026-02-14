"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: ['.env.local', '.env'] });
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
exports.default = new typeorm_1.DataSource(databaseUrl
    ? {
        type: 'postgres',
        url: databaseUrl,
        ssl: databaseUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
        entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../../migrations/**/*{.ts,.js}'],
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
    }
    : {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || process.env.USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'siparis',
        entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../../migrations/**/*{.ts,.js}'],
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
    });
//# sourceMappingURL=data-source.js.map