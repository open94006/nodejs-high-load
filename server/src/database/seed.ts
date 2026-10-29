import { drizzle } from 'drizzle-orm/mysql2';
import { faker } from '@faker-js/faker';
import { users, orders } from './schema.js';

const db = drizzle('mysql://root:root@127.0.0.1:3306/app');

const USERS = 10_000;
const ORDER_PRE_USER = 10;
const BATCH = 1_000;

for (let i = 0; i < USERS; i += BATCH) {
    await db.insert(users).values(
        Array.from({ length: BATCH }, (_, j) => {
            return {
                name: faker.person.fullName(),
                email: `user${i + j}@example.com`,
            };
        }),
    );
}

const statuses = ['pending', 'paid', 'cancelled'] as const;
for (let i = 0; i < USERS * ORDER_PRE_USER; i += BATCH) {
    await db.insert(orders).values(
        Array.from({ length: BATCH }, () => {
            return {
                userId: faker.number.int({ min: 1, max: USERS }),
                amount: faker.commerce.price({ min: 5, max: 500 }),
                status: faker.helpers.arrayElement(statuses),
            };
        }),
    );
}

console.log('seed done');
process.exit(0);
