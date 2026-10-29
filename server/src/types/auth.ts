export type Role = 'admin' | 'user';

export interface AuthUser {
    id: number;
    role: Role;
}

// 宣告合併：在 Express 原本的 Request 介面上加一個 user 欄位
// 之後任何地方寫 req.user，TS 都知道它是 AuthUser | undefined
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}
