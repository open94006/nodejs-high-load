import http from 'k6/http';
import { check } from 'k6';
import { SharedArray } from 'k6/data';

const BASE = __ENV.BASE_URL ?? 'http://localhost:5100';
const PROFILE = __ENV.PROFILE ?? 'smoke';
const LIMIT = Number(__ENV.LIMIT ?? 4000); // 目前已知的上限，之後系統改善了就從指令列改

const users = new SharedArray('users', () => JSON.parse(open('./tokens.json')));

const PROFILES = {
    // 冒煙測試：每次改完程式先跑，確認功能正常，30 秒
    smoke: {
        executor: 'constant-vus',
        vus: 1,
        duration: '30s',
    },

    // 基準測試：固定在上限的一半跑 2 分鐘，用來比較每次修改前後的 p95
    baseline: {
        executor: 'constant-arrival-rate',
        rate: LIMIT * 0.5,
        timeUnit: '1s',
        duration: '2m',
        preAllocatedVUs: 200,
        maxVUs: 2000,
    },

    // 斷點測試：只在「預期上限會改變」的修改之後才跑
    breakpoint: {
        executor: 'ramping-arrival-rate',
        startRate: 50,
        timeUnit: '1s',
        preAllocatedVUs: 200,
        maxVUs: 3000,
        stages: [
            { duration: '1m', target: LIMIT * 0.5 },
            { duration: '4m', target: LIMIT * 2 },
        ],
    },

    // 尖峰測試：瞬間衝到上限的 2 倍，看系統會不會崩，以及退回後能不能恢復
    spike: {
        executor: 'ramping-arrival-rate',
        startRate: 50,
        timeUnit: '1s',
        preAllocatedVUs: 500,
        maxVUs: 5000,
        stages: [
            { duration: '30s', target: LIMIT * 0.3 },
            { duration: '10s', target: LIMIT * 2 },
            { duration: '1m', target: LIMIT * 2 },
            { duration: '10s', target: LIMIT * 0.3 },
            { duration: '1m', target: LIMIT * 0.3 }, // 這段 p95 要回到正常，才算恢復
        ],
    },

    // 長時間測試：上限的 60% 跑 30 分鐘，抓記憶體洩漏、連線沒釋放
    soak: {
        executor: 'constant-arrival-rate',
        rate: LIMIT * 0.6,
        timeUnit: '1s',
        duration: '30m',
        preAllocatedVUs: 300,
        maxVUs: 3000,
    },
};

export const options = {
    scenarios: { [PROFILE]: PROFILES[PROFILE] },
    thresholds: {
        http_req_duration: [{ threshold: 'p(95)<200', abortOnFail: true, delayAbortEval: '10s' }],
        http_req_failed: ['rate<0.01'],
        checks: ['rate>0.99'],
    },
};

export default function () {
    const u = users[Math.floor(Math.random() * users.length)];
    const res = http.get(`${BASE}/api/orders`, {
        headers: { Authorization: `Bearer ${u.token}` },
        tags: { name: 'GET /api/orders' },
        timeout: '5s',
    });
    check(res, {
        '回應 200': (r) => r.status === 200,
        只拿到自己的訂單: (r) => r.status === 200 && r.json('data').every((o) => o.userId === u.id),
    });
}
