# Quick Start: Logging Infrastructure

This guide will help you get the logging infrastructure running in 5 minutes.

## Prerequisites

- Docker and Docker Compose installed
- DanceSuite application already set up

## Step-by-Step Setup

### 1. Install Backend Dependencies

```bash
cd backend
bun install
```

This will install `winston` and `morgan` packages for structured logging.

### 2. Start the Logging Stack

```bash
# From the project root directory
docker compose -f docker-compose.logging.yaml up -d
```

This starts:
- ✅ Elasticsearch (port 9200)
- ✅ Kibana (port 5601)
- ✅ Fluent Bit (port 24224)

### 3. Wait for Services to Initialize

```bash
# Check service status
docker compose -f docker-compose.logging.yaml ps

# Watch logs to see when services are ready
docker compose -f docker-compose.logging.yaml logs -f
```

Wait for:
- Elasticsearch: "Cluster health status changed from [RED] to [GREEN]"
- Kibana: "http server running"
- Fluent Bit: "Fluent Bit v2.2 started"

This typically takes 30-60 seconds.

### 4. Restart Backend to Enable Logging

```bash
docker compose restart backend
```

### 5. Access Kibana

1. Open http://localhost:5601
2. Click "Explore on my own" (skip welcome wizard)
3. Navigate to **☰ Menu** → **Discover**

### 6. Create Index Pattern

1. In Discover, click **Create data view**
2. **Name**: Backend Logs
3. **Index pattern**: `dancesuite-backend-*`
4. **Timestamp field**: `@timestamp`
5. Click **Save data view to Kibana**

### 7. View Logs!

You should now see logs flowing in. Try:
- Making some API requests
- Logging in to the application
- Creating a class or user

Refresh the Discover page to see new logs appear.

## Common Commands

```bash
# Start logging infrastructure
docker compose -f docker-compose.logging.yaml up -d

# Stop logging infrastructure
docker compose -f docker-compose.logging.yaml down

# View logs from logging services
docker compose -f docker-compose.logging.yaml logs -f

# Restart Fluent Bit (if configuration changed)
docker compose -f docker-compose.logging.yaml restart fluent-bit

# Check Elasticsearch health
curl http://localhost:9200/_cluster/health?pretty

# List all indices
curl http://localhost:9200/_cat/indices?v

# Stop everything and remove data
docker compose -f docker-compose.logging.yaml down -v
```

## Useful Kibana Queries

Once you have logs, try these queries in Discover:

```kql
# All error logs
level: "error"

# Specific HTTP method
method: "POST"

# Slow requests (>500ms)
responseTime > 500

# Authentication events
url: "/api/auth/*"

# Logs for a specific user
userId: "your-user-id"

# Combine conditions
level: "error" AND service: "dancesuite-backend"
```

## Troubleshooting

### No logs appearing in Kibana?

1. **Check backend is logging**:
```bash
docker logs dancesuite-backend | grep "{"
```
You should see JSON-formatted log lines.

2. **Check Fluent Bit is receiving logs**:
```bash
docker logs dancesuite-fluentbit | grep "backend"
```

3. **Check Elasticsearch indices**:
```bash
curl http://localhost:9200/_cat/indices?v | grep dancesuite
```
You should see indices like `dancesuite-backend-2026.01.30`.

### Kibana won't start?

1. **Check Elasticsearch is healthy**:
```bash
curl http://localhost:9200/_cluster/health
```
Should show `"status":"green"` or `"status":"yellow"`.

2. **Check Kibana logs**:
```bash
docker logs dancesuite-kibana
```

### Fluent Bit errors?

1. **Check configuration syntax**:
```bash
docker exec dancesuite-fluentbit fluent-bit -c /fluent-bit/etc/fluent-bit.conf --dry-run
```

2. **View Fluent Bit health**:
```bash
curl http://localhost:2020/api/v1/health
```

## Next Steps

1. **Read the full documentation**: See `LOGGING_SETUP.md` for detailed information
2. **Create dashboards**: Build visualizations in Kibana
3. **Set up alerts**: Get notified of errors
4. **Customize logging**: Add more structured logging to your code

## Example: Adding Custom Logs

In your backend code:

```javascript
import logger from './utils/logger.js';

// In a route handler
router.post('/api/classes', async (req, res) => {
  logger.info('Creating new class', {
    userId: req.user.userId,
    className: req.body.name,
    instructor: req.body.instructorId
  });

  try {
    const classObj = await prisma.class.create({ data: req.body });

    logger.info('Class created successfully', {
      classId: classObj.id,
      className: classObj.name,
      userId: req.user.userId
    });

    res.json(classObj);
  } catch (error) {
    logger.error('Failed to create class', {
      error: error.message,
      stack: error.stack,
      userId: req.user.userId,
      requestBody: req.body
    });
    throw error;
  }
});
```

These logs will automatically appear in Kibana with full context!

## Architecture Overview

```
┌─────────────────┐
│   Your Code     │
│  (logger.info)  │
└────────┬────────┘
         │ JSON logs
         ▼
┌─────────────────┐
│    Winston      │
│ (Logger Library)│
└────────┬────────┘
         │ stdout
         ▼
┌─────────────────┐
│   Fluent Bit    │
│ (Log Collector) │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│ Elasticsearch   │
│ (Log Storage)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Kibana      │
│ (Log Viewer)    │
└─────────────────┘
```

## Resources

- Elasticsearch: http://localhost:9200
- Kibana: http://localhost:5601
- Fluent Bit Metrics: http://localhost:2020/api/v1/metrics/prometheus
- Full Documentation: `LOGGING_SETUP.md`

Happy logging! 🎉
