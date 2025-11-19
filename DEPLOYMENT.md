# Deployment & Production Guide

## 🚀 Pre-Production Checklist

### Backend

- [ ] Update JWT_SECRET in `.env` (change from example)
- [ ] Set NODE_ENV=production
- [ ] Configure email credentials (Gmail/SendGrid/etc)
- [ ] Set up MySQL on production server
- [ ] Configure CORS for frontend URL
- [ ] Use environment-specific database
- [ ] Set up error logging/monitoring
- [ ] Enable HTTPS in CORS
- [ ] Test all API endpoints

### Frontend

- [ ] Update REACT_APP_API_URL to production backend
- [ ] Run `npm run build` to create optimized build
- [ ] Test all features in production environment
- [ ] Optimize bundle size
- [ ] Set up CDN for static assets
- [ ] Configure caching headers

### Database

- [ ] Create production database backup
- [ ] Set up automated backups
- [ ] Configure database user with proper permissions
- [ ] Add indexes if needed
- [ ] Set up replication/failover if needed

---

## 📦 Deployment Options

### Option 1: Heroku (Easiest)

**Backend on Heroku:**

```bash
# Install Heroku CLI
heroku login
cd server
heroku create your-app-name
heroku addons:create cleardb:ignite
git push heroku main
heroku config:set JWT_SECRET=your-secret
heroku open
```

**Frontend on Vercel:**

```bash
# Install Vercel CLI
npm i -g vercel
cd client
vercel
# Set environment variables in Vercel dashboard
```

### Option 2: AWS (DigitalOcean/Linode Similar)

**Backend on EC2/Droplet:**

```bash
# SSH into server
ssh ubuntu@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt-get install mysql-server

# Clone repository
git clone your-repo-url
cd sheet-app/server

# Install dependencies
npm install

# Create .env with production values
nano .env

# Start with PM2
npm install -g pm2
pm2 start index.js --name "sheet-app"
pm2 save
pm2 startup
```

**Frontend on S3 + CloudFront:**

```bash
cd client
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name/

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Option 3: Docker (Recommended for Scaling)

**Dockerfile - Backend**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]
```

**Dockerfile - Frontend**

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml**

```yaml
version: "3.8"

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: sheet_app
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: sheet_app
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      - mysql

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

---

## 🔒 Security Hardening

### Backend Security

**Update `index.js`:**

```javascript
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

app.use(helmet());
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api", limiter);
```

### HTTPS/SSL

```bash
# Using Let's Encrypt with Nginx
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

### Database Security

```sql
-- Create limited user
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON sheet_app.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;

-- In .env, use app_user instead of root
```

---

## 📊 Performance Optimization

### Backend

```javascript
// Add Redis caching
const redis = require("redis");
const client = redis.createClient();

// Cache user queries
app.get("/api/users", async (req, res) => {
  const cached = await client.get("users");
  if (cached) return res.json(JSON.parse(cached));

  const data = await User.findAll();
  await client.setEx("users", 3600, JSON.stringify(data));
  res.json(data);
});
```

### Frontend

```javascript
// Code splitting
const DashboardPage = React.lazy(() => import("./pages/DashboardPage"));

// Lazy load with Suspense
<Suspense fallback={<Loading />}>
  <DashboardPage />
</Suspense>;
```

### Database

```sql
-- Add more indexes
CREATE INDEX idx_user_branch ON users(branch_id);
CREATE INDEX idx_sheet_branch ON sheets(branch_id);
CREATE INDEX idx_cell_sheet ON sheet_cells(sheet_id);

-- Optimize queries
ANALYZE TABLE users;
OPTIMIZE TABLE sheets;
```

---

## 🔄 Continuous Integration/Deployment

### GitHub Actions Example

**`.github/workflows/deploy.yml`**

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install
        working-directory: ./server

      - name: Run tests
        run: npm test
        working-directory: ./server

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Deploy to Heroku
        run: |
          git push heroku main
        env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
```

---

## 📈 Monitoring & Logging

### Backend Logging Setup

```javascript
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Use in routes
logger.info("Sheet created", { sheetId: sheet.id, userId: req.user.id });
```

### Error Tracking (Sentry)

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.errorHandler());
```

---

## 📋 Environment Configuration

### Production `.env`

```env
# Database
DB_HOST=db.production.internal
DB_USER=app_user
DB_PASSWORD=secure_password_here
DB_NAME=sheet_app_prod
DB_PORT=3306

# JWT
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_EXPIRY=7d

# Server
PORT=5000
NODE_ENV=production

# Email
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxx
EMAIL_FROM=noreply@yourapp.com

# Frontend
FRONTEND_URL=https://yourdomain.com

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
LOG_LEVEL=info
```

---

## 🔐 SSL Certificate Setup

### Using Let's Encrypt + Nginx

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renew
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }

    location /api {
        proxy_pass http://localhost:5000;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 🧪 Production Testing

### API Testing Script

```bash
#!/bin/bash

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Test health
curl http://localhost:5000/health

# Load test with Apache Bench
ab -n 1000 -c 100 http://localhost:5000/api/sheets
```

---

## 🔍 Database Backup Strategy

### Automated Daily Backups

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup all databases
mysqldump -u root -p$DB_PASSWORD --all-databases > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete

# Upload to S3
aws s3 cp $BACKUP_DIR/backup_$DATE.sql s3://your-bucket/backups/
```

Add to crontab:

```bash
0 2 * * * /home/ubuntu/backup.sh
```

---

## 📊 Scaling Strategies

### Horizontal Scaling (Multiple Servers)

```yaml
# Load Balancer (Nginx)
upstream backend {
server backend1.internal:5000;
server backend2.internal:5000;
server backend3.internal:5000;
}

server {
listen 80;

location /api {
proxy_pass http://backend;
}
}
```

### Database Scaling

```mysql
-- Master-Slave Replication
-- Configure MySQL replication for read scaling
-- Use read replicas for reporting queries
```

### Caching Layer

```javascript
// Redis for session/cache
const redis = require("redis");
const session = require("express-session");
const RedisStore = require("connect-redis").default;

const redisClient = redis.createClient();

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
```

---

## ✅ Deployment Checklist

- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] SSL certificate installed
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Rollback plan documented
- [ ] Team trained on deployment

---

## 🚨 Troubleshooting Production Issues

### Database Connection Failed

```bash
# Check MySQL status
systemctl status mysql

# Check connection
mysql -u app_user -p -h db.production.internal sheet_app

# Check firewall
sudo ufw status
sudo ufw allow 3306/tcp
```

### High Memory Usage

```bash
# Monitor processes
top -p $(pgrep node | tr '\n' ',' | sed 's/,$//g')

# Increase Node memory
NODE_OPTIONS="--max-old-space-size=2048" node index.js
```

### API Timeouts

```bash
# Increase Nginx timeout
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

---

## 📞 Support & Monitoring

- **Real-time Monitoring**: Use DataDog, New Relic, or Sentry
- **Log Aggregation**: Use ELK Stack or Loggly
- **APM**: Application Performance Monitoring tools
- **Alerts**: Set up alerts for errors, high CPU, memory

---

**Production deployment is complex. Start small, monitor everything, and scale as needed!** 🚀
