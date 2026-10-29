import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 20 }, // 暖機：30 秒內從 0 增加到 20 VU
        { duration: '2m', target: 20 }, // 維持：這段才是真正的 baseline
        { duration: '10s', target: 0 }, // 收尾
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'], // 錯誤率低於 1%
        http_req_duration: ['p(95)<200'], // p95 低於 200ms
    },
};

export default function () {
    const res = http.get('http://localhost:5100/api/hello');
    check(res, { '回應 200': (r) => r.status === 200 });
    sleep(1); // 模擬真人「看一下再操作」，每個 VU 約每秒 1 次請求
}
