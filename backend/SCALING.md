**Overview**

This document gives concise, actionable steps to scale the backend to reliably handle ~500 concurrent active users.

- Use a shared session store (Redis). The code supports `REDIS_URL` to enable Redis sessions.
- Run multiple Node instances and place them behind a load balancer (NGINX, cloud LB, or reverse proxy).
- Tune MongoDB connection pool with `MONGO_MAX_POOL_SIZE` (per-process). Monitor and adjust.
- Offload file uploads to Cloudinary (already a dependency) instead of local disk on production machines.

PM2 example (run multiple Node processes on one host)

1. Install PM2 globally:

```bash
npm install -g pm2
```

2. Example ecosystem file (use `backend/ecosystem.config.js`) and start:

```bash
pm2 start backend/ecosystem.config.js
pm2 scale api 4    # scale to 4 processes
```

Docker Compose (local multi-container example)

Use a load-balancer (nginx) + multiple Node replicas + Redis. For production use a cloud provider or Kubernetes.

Monitoring and validation
- Add APM (NewRelic/Datadog) or Prometheus + Grafana.
- Run load tests (k6) with representative payloads and DB to find RPS and latency limits.
