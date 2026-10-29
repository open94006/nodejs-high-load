import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthUser } from '../types/auth.js';

const SECRET = process.env.JWT_SECRET ?? 'dev-secret'; // 正式環境一定要用環境變數

// 型別守衛：jwt.verify 回傳 string | JwtPayload，不能直接當成 AuthUser
// 逐欄位檢查後才收窄型別，不用 as
const isAuthUser = (p: unknown): p is AuthUser => typeof p === 'object' && p !== null && 'id' in p && typeof p.id === 'number' && 'role' in p && (p.role === 'admin' || p.role === 'user');

export const auth: RequestHandler = (req, res, next) => {
    // 格式：Authorization: Bearer <token>
    const token = req.headers.authorization?.replace(/^Bearer /, '');
    if (!token) return void res.status(401).json({ error: 'missing token' });

    try {
        const payload = jwt.verify(token, SECRET); // 簽章錯誤或過期都會丟例外
        if (!isAuthUser(payload)) return void res.status(401).json({ error: 'bad payload' });
        req.user = { id: payload.id, role: payload.role }; // ← req.user 是在這裡設定的
        next();
    } catch {
        res.status(401).json({ error: 'invalid token' });
    }
};
