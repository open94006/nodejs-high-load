import { mysqlTable, int, varchar, decimal, timestamp, mysqlEnum, index } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orders = mysqlTable(
    'orders',
    {
        id: int('id').autoincrement().primaryKey(),
        userId: int('user_id')
            .notNull()
            .references(() => users.id),
        amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
        status: mysqlEnum('status', ['pending', 'paid', 'cancelled']).default('pending').notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (t) => [index('orders_user_id_idx').on(t.userId)],
);
