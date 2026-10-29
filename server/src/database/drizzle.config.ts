import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    dialect: 'mysql',
    schema: './src/database/schema.ts',
    out: './drizzle',
    dbCredentials: { url: 'mysql://root:root@127.0.0.1:3306/app' },
});
