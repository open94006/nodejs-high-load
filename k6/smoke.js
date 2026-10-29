import http from 'k6/http';
import { check } from 'k6';

export const options = {
    vus: 10,
    duration: '5s',
};

export default function () {
    const res = http.get('http://localhost:5100/api/hello');
    check(res, { '回應 200': (r) => r.status === 200 });
}
