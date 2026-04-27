Purpose
- Quick instructions and example to run a k6 load test against the backend to validate ~500 concurrent users.

Prerequisites
- Install k6: https://k6.io/docs/getting-started/installation/

Run the test
1. From repository root (or `backend`):

```bash
# run locally against default http://localhost:5002
k6 run backend/loadtests/k6_test.js

# or point to deployed instance
BASE_URL=https://your-deployed-url k6 run backend/loadtests/k6_test.js
```

Interpreting results
- Watch RPS, http_req_duration and errors. If p(95) latency exceeds ~1s, tune DB or add instances.

Notes
- The script hits a few read endpoints; adapt it to include auth-protected endpoints by adding login flow and cookies/headers.
