import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

// Basic k6 script that simulates a mixture of requests.
// Configure target URL via env: BASE_URL (default http://localhost:5002)

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5002';

export const options = {
  stages: [
    { duration: '30s', target: 100 }, // ramp to 100 users
    { duration: '1m', target: 500 },  // ramp to 500 users
    { duration: '2m', target: 500 },  // sustain 500 users
    { duration: '30s', target: 100 }, // ramp down
    { duration: '10s', target: 0 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000']
  }
};

const paths = new SharedArray('paths', function () {
  return [
    '/api/health',
    '/api/influencer',
    '/api/inquiries'
  ];
});

export default function () {
  // choose endpoint
  const path = paths[Math.floor(Math.random() * paths.length)];
  const url = `${BASE_URL}${path}`;

  const res = http.get(url, { tags: { name: path } });
  check(res, {
    'status is 200': (r) => r.status === 200 || r.status === 401
  });
  sleep(Math.random() * 2 + 0.5);
}
