# DanceSuite Logging Setup

This document describes the logging infrastructure for the DanceSuite application using Elasticsearch, Kibana, and Fluent Bit.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌──────────────────┐
│   Backend   │────────▶│  Fluent Bit  │────────▶│ Elasticsearch    │
│  (Winston)  │  logs   │  (Collector) │  index  │  (Storage)       │
└─────────────┘         └──────────────┘         └──────────────────┘
                                                           │
┌─────────────┐                                            │
│  Frontend   │                                            │
│   (Vite)    │────────▶                                   │
└─────────────┘         Fluent Bit                         ▼
                                                   ┌──────────────────┐
                                                   │     Kibana       │
                                                   │ (Visualization)  │
                                                   └──────────────────┘
```

## Components

### 1. Elasticsearch
- **Purpose**: Centralized log storage and indexing
- **Port**: 9200 (HTTP), 9300 (Transport)
- **Version**: 8.11.0
- **Indices**:
  - `dancesuite-backend-*`: Backend application logs
  - `dancesuite-frontend-*`: Frontend application logs

### 2. Kibana
- **Purpose**: Log visualization and analysis
- **Port**: 5601
- **Version**: 8.11.0
- **URL**: http://localhost:5601

### 3. Fluent Bit
- **Purpose**: Log collection and forwarding
- **Port**: 24224 (Fluentd forward protocol), 2020 (HTTP monitoring)
- **Version**: 2.2
- **Configuration**: `logging/fluent-bit.conf`

### 4. Winston (Backend Logger)
- **Purpose**: Structured logging in Node.js
- **Version**: 3.11.0
- **Format**: JSON
- **Log Levels**: error, warn, info, debug

## Quick Start

### 1. Install Dependencies

```bash
cd backend
bun install
```

### 2. Start Logging Infrastructure

```bash
# Start Elasticsearch, Kibana, and Fluent Bit
docker compose -f docker-compose.logging.yaml up -d

# Verify services are running
docker compose -f docker-compose.logging.yaml ps
```

### 3. Start Application

```bash
# Start the main application (backend, frontend, database)
docker compose up -d
```

### 4. Access Kibana

1. Open http://localhost:5601 in your browser
2. Wait for Kibana to initialize (may take 1-2 minutes)
3. Navigate to **Discover** from the left menu
4. Create index patterns:
   - Pattern: `dancesuite-backend-*`
   - Time field: `@timestamp`
   - Pattern: `dancesuite-frontend-*`
   - Time field: `@timestamp`

## Using the Logger in Backend Code

### Basic Usage

```javascript
import logger from './utils/logger.js';

// Info level
logger.info('User logged in', { userId: '123', email: 'user@example.com' });

// Error level
logger.error('Database connection failed', { error: err.message, stack: err.stack });

// Warning level
logger.warn('Deprecated API endpoint accessed', { endpoint: '/api/old', userId: '123' });

// Debug level
logger.debug('Cache hit', { key: 'user:123', ttl: 3600 });
```

### HTTP Request Logging

All HTTP requests are automatically logged with:
- Method, URL, status code
- Response time
- User ID and role (if authenticated)
- Request ID for tracing
- IP address, user agent, referrer

```json
{
  "timestamp": "2026-01-30T10:15:30.123Z",
  "method": "POST",
  "url": "/api/auth/login",
  "status": 200,
  "responseTime": "45ms",
  "userId": "123",
  "userRole": "STUDENT",
  "requestId": "1738234530123-abc123def",
  "ip": "192.168.1.1"
}
```

### Error Logging

Errors are automatically logged with:
- Error message and stack trace
- Request context (method, URL, user)
- Request ID for correlation

```javascript
try {
  // Your code
} catch (error) {
  logger.error('Failed to process payment', {
    error: error.message,
    stack: error.stack,
    userId: req.user.userId,
    paymentId: payment.id
  });
  throw error;
}
```

## Searching Logs in Kibana

### 1. Basic Search

- Navigate to **Discover**
- Select index pattern: `dancesuite-backend-*`
- Use KQL (Kibana Query Language):

```kql
# Find all errors
level: "error"

# Find logs for specific user
userId: "123"

# Find slow requests (>1000ms)
responseTime > 1000

# Find authentication logs
url: "/api/auth/*"

# Combine queries
level: "error" AND service: "dancesuite-backend"
```

### 2. Time Range

- Use time picker in top right
- Select: Last 15 minutes, Last hour, Last 24 hours, etc.
- Custom range for specific periods

### 3. Saved Searches

Create and save common searches:
1. Build your query
2. Click **Save** at top
3. Name it (e.g., "Backend Errors", "Slow Requests")
4. Load saved searches anytime

## Creating Kibana Dashboards

### 1. Create Visualization

1. Navigate to **Visualize Library**
2. Click **Create visualization**
3. Select visualization type:
   - Line chart: Response times over time
   - Pie chart: Log levels distribution
   - Data table: Recent errors
   - Metric: Total request count

### 2. Example: Response Time Chart

1. Type: Line
2. Index: `dancesuite-backend-*`
3. Y-axis: Average of `responseTime`
4. X-axis: Date histogram of `@timestamp` (interval: Auto)
5. Split series by `method` or `url`

### 3. Create Dashboard

1. Navigate to **Dashboard**
2. Click **Create dashboard**
3. Click **Add** to add visualizations
4. Arrange and resize panels
5. Save dashboard

### Recommended Dashboards

**Application Health Dashboard**:
- Total requests (last hour)
- Error rate (%)
- Average response time
- Top 10 slowest endpoints
- Error logs table

**User Activity Dashboard**:
- Active users count
- Requests by user role
- Top users by request count
- Authentication events timeline

## Log Retention and Cleanup

### Configure Index Lifecycle Management (ILM)

1. Navigate to **Stack Management** → **Index Lifecycle Policies**
2. Create new policy:

```json
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_age": "7d",
            "max_size": "50gb"
          }
        }
      },
      "delete": {
        "min_age": "30d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

This policy:
- Keeps logs for 30 days
- Rolls over to new index after 7 days or 50GB
- Automatically deletes old indices

## Troubleshooting

### Logs not appearing in Elasticsearch

1. Check Fluent Bit status:
```bash
docker logs dancesuite-fluentbit
```

2. Check Elasticsearch health:
```bash
curl http://localhost:9200/_cluster/health?pretty
```

3. Verify indices exist:
```bash
curl http://localhost:9200/_cat/indices?v
```

### Fluent Bit connection issues

1. Ensure all containers are on same network:
```bash
docker network inspect dancesuite-network
```

2. Check Fluent Bit can reach Elasticsearch:
```bash
docker exec dancesuite-fluentbit curl http://elasticsearch:9200
```

### Backend logging not working

1. Check Winston is writing to console:
```bash
docker logs dancesuite-backend
```

2. Verify log format is JSON:
```bash
docker logs dancesuite-backend 2>&1 | grep "{"
```

## Performance Considerations

### Backend Logging

- **Async logging**: Winston writes asynchronously to not block requests
- **Log levels**: Use appropriate levels (error, warn, info, debug)
- **Sampling**: Consider sampling high-volume debug logs in production

### Elasticsearch

- **Memory**: Allocated 512MB heap (-Xms512m -Xmx512m)
- **Disk**: Monitor disk usage, logs can grow quickly
- **Shards**: Default 1 shard for small deployments

### Fluent Bit

- **Buffering**: Configured with 5MB memory buffer
- **Retry**: Up to 5 retries on failure
- **Async**: Async forwarding enabled

## Security Best Practices

1. **Don't log sensitive data**:
   - ❌ Passwords, API keys, tokens
   - ❌ Credit card numbers, SSNs
   - ❌ Full request/response bodies with PII

2. **Sanitize logs**:
```javascript
logger.info('User updated', {
  userId: user.id,
  email: maskEmail(user.email), // us***@example.com
  // Don't log: password, token, etc.
});
```

3. **Use request IDs**: Correlate logs across services
4. **Encrypt in transit**: Use HTTPS for production Elasticsearch
5. **Access control**: Restrict Kibana access to authorized users

## Production Deployment

### Environment Variables

```env
# Backend
LOG_LEVEL=info
NODE_ENV=production

# Elasticsearch
ES_JAVA_OPTS=-Xms2g -Xmx2g  # Increase for production
```

### Enable Elasticsearch Security

Update `docker-compose.logging.yaml`:

```yaml
elasticsearch:
  environment:
    - xpack.security.enabled=true
    - ELASTIC_PASSWORD=your-strong-password
```

### Use External Elasticsearch

Point Fluent Bit to external cluster:

```conf
[OUTPUT]
    Name es
    Host your-elasticsearch.example.com
    Port 9200
    HTTP_User elastic
    HTTP_Passwd your-password
    tls On
    tls.verify On
```

## Monitoring the Logging System

### Fluent Bit Metrics

Access at: http://localhost:2020/api/v1/metrics/prometheus

Metrics include:
- Input/output records
- Errors and retries
- Buffer usage

### Elasticsearch Monitoring

1. Cluster health: `GET /_cluster/health`
2. Index stats: `GET /_cat/indices?v`
3. Node stats: `GET /_nodes/stats`

### Set up Alerts

Create alerts in Kibana:
1. Navigate to **Stack Management** → **Rules and Connectors**
2. Create rule:
   - Type: Elasticsearch query
   - Condition: `level: "error"` count > 10 in 5 minutes
   - Action: Send notification (email, Slack, etc.)

## Additional Resources

- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Kibana Documentation](https://www.elastic.co/guide/en/kibana/current/index.html)
- [Fluent Bit Documentation](https://docs.fluentbit.io/)
- [Winston Documentation](https://github.com/winstonjs/winston)
