import express, { RequestHandler } from 'express';
import { orders } from '../database/schema.js';
import { AuthUser } from '../types/auth.js';
import { and, desc, eq, lt, SQL } from 'drizzle-orm';
import { db } from '../database/db.js';
import { auth } from '../middlewares/auth.js';

const app = express.Router();
const PAGE_SIZE = 1000;

export type Order = typeof orders.$inferSelect;

export interface OrderListResponse {
    data: Order[];
    nextCursor: number | null; // null 代表沒有下一頁
}

interface ErrorBody {
    error: string;
}

const scope = (user: AuthUser): SQL | undefined => (user.role === 'admin' ? undefined : eq(orders.userId, user.id));

const parseId = (v: string | undefined): number | null => {
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
};

const listOrders: RequestHandler<{}, OrderListResponse | ErrorBody, unknown, { cursor?: string }> = async (req, res) => {
    if (!req.user) {
        return void res.status(401).json({ error: 'unauthorized' });
    }

    const cursor = parseId(req.query.cursor);

    const rows = await db
        .select()
        .from(orders)
        .where(
            and(
                // and() 會自動略過 undefined：
                scope(req.user),
                cursor ? lt(orders.id, cursor) : undefined,
            ),
        )
        .orderBy(desc(orders.id))
        .limit(PAGE_SIZE);

    res.json({
        data: rows,
        nextCursor: rows.length === PAGE_SIZE ? rows[rows.length - 1].id : null,
    });
};

const getOrder = () => {};

app.get('/api/orders', auth, listOrders);
app.get('/api/orders/:id', auth, getOrder);

export default app;
