# Money Tracker Backend - Deployment Guide

This guide covers deploying the Money Tracker Backend to various cloud platforms.

## Pre-Deployment Checklist

### ✅ Code Preparation

- [ ] All code is committed to Git repository
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] Tests pass (if implemented)
- [ ] Environment variables documented
- [ ] Database schema applied to production database

### ✅ Environment Setup

- [ ] Production Supabase project created
- [ ] Production Firebase project configured
- [ ] Environment variables prepared for production
- [ ] CORS settings configured for production frontend domain
- [ ] Rate limiting configured appropriately

### ✅ Security Review

- [ ] All sensitive data in environment variables
- [ ] No hardcoded credentials in code
- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] Rate limiting enabled

---

## Platform-Specific Deployment

### Railway (Recommended)

Railway offers automatic deployments from Git with minimal configuration.

#### Setup Steps

1. **Create Railway Account**

   - Sign up at [railway.app](https://railway.app)
   - Connect your GitHub account

2. **Deploy from GitHub**

   ```bash
   # Push your code to GitHub first
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

3. **Create New Project**

   - Click "New Project" in Railway dashboard
   - Select "Deploy from GitHub repo"
   - Choose your money-tracker-backend repository
   - Railway will automatically detect Node.js and deploy

4. **Configure Environment Variables**

   ```bash
   # In Railway dashboard, go to Variables tab
   NODE_ENV=production
   PORT=5000
   SUPABASE_URL=https://your-production-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
   ```

5. **Custom Start Command (Optional)**

   ```bash
   # In Railway dashboard, Settings tab
   Build Command: npm run build
   Start Command: npm start
   ```

6. **Configure Domain**
   - Railway provides automatic domain: `your-app-name.railway.app`
   - Add custom domain in Settings if needed

#### Railway Configuration File

Create `railway.toml` in project root:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3

[env]
NODE_ENV = "production"
```

---

### Heroku

#### Setup Steps

1. **Install Heroku CLI**

   ```bash
   # Download from heroku.com/cli
   heroku --version
   ```

2. **Login and Create App**

   ```bash
   heroku login
   heroku create your-money-tracker-backend
   ```

3. **Configure Environment Variables**

   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SUPABASE_URL=https://your-production-project.supabase.co
   heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   heroku config:set FIREBASE_PROJECT_ID=your-firebase-project-id
   heroku config:set FIREBASE_CLIENT_EMAIL=your-service-account-email
   heroku config:set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

#### Procfile

Create `Procfile` in project root:

```
web: npm start
```

---

### Vercel (Serverless)

Vercel requires adapting the Express app for serverless functions.

#### Setup Steps

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   vercel login
   ```

2. **Create Serverless Handler**
   Create `api/index.ts`:

   ```typescript
   import { VercelRequest, VercelResponse } from '@vercel/node';
   import app from '../src/server';

   export default (req: VercelRequest, res: VercelResponse) => {
     return app(req, res);
   };
   ```

3. **Vercel Configuration**
   Create `vercel.json`:

   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "api/index.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/api/index.ts"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

4. **Deploy**

   ```bash
   vercel --prod
   ```

5. **Configure Environment Variables**
   ```bash
   vercel env add NODE_ENV
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add FIREBASE_PROJECT_ID
   vercel env add FIREBASE_CLIENT_EMAIL
   vercel env add FIREBASE_PRIVATE_KEY
   ```

---

### AWS EC2

#### Setup Steps

1. **Launch EC2 Instance**

   - Ubuntu 22.04 LTS
   - t3.micro or larger
   - Configure security group (ports 22, 80, 443, 5000)

2. **Connect and Setup**

   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip

   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   sudo npm install -g pm2
   ```

3. **Deploy Application**

   ```bash
   # Clone repository
   git clone https://github.com/your-username/money-tracker-backend.git
   cd money-tracker-backend

   # Install dependencies
   npm install

   # Build application
   npm run build
   ```

4. **Environment Variables**

   ```bash
   # Create .env file
   nano .env
   # Add all production environment variables
   ```

5. **Start with PM2**

   ```bash
   # Start application
   pm2 start dist/server.js --name money-tracker-backend

   # Save PM2 config
   pm2 save
   pm2 startup
   ```

6. **Setup Nginx (Optional)**

   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/money-tracker
   ```

   Nginx config:

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/money-tracker /etc/nginx/sites-enabled/
   sudo systemctl restart nginx
   ```

---

### Google Cloud Run

#### Setup Steps

1. **Install Google Cloud CLI**

   ```bash
   # Download from cloud.google.com/cli
   gcloud auth login
   gcloud config set project your-project-id
   ```

2. **Create Dockerfile**

   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci --only=production

   COPY . .
   RUN npm run build

   EXPOSE 5000

   CMD ["npm", "start"]
   ```

3. **Build and Deploy**

   ```bash
   # Build image
   gcloud builds submit --tag gcr.io/your-project-id/money-tracker-backend

   # Deploy to Cloud Run
   gcloud run deploy money-tracker-backend \
     --image gcr.io/your-project-id/money-tracker-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

4. **Set Environment Variables**
   ```bash
   gcloud run services update money-tracker-backend \
     --set-env-vars NODE_ENV=production,SUPABASE_URL=your-url \
     --region us-central1
   ```

---

## Database Setup (Production)

### Supabase Production Setup

1. **Create Production Project**

   - Go to [supabase.com](https://supabase.com)
   - Create new project for production
   - Note the project URL and service role key

2. **Run Database Migrations**

   ```sql
   -- In Supabase SQL Editor, run files in order:
   -- 1. database/01_create_tables.sql
   -- 2. database/02_row_level_security.sql (optional, disabled in current setup)
   -- 3. database/03_functions_triggers.sql
   -- 4. database/05_firebase_uid_fix.sql
   ```

3. **Configure Connection**
   ```bash
   # Use production environment variables
   SUPABASE_URL=https://your-prod-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key
   ```

### Firebase Production Setup

1. **Create Production Firebase Project**

   - Go to [console.firebase.google.com](https://console.firebase.google.com)
   - Create new project for production
   - Enable Authentication

2. **Generate Service Account**

   ```bash
   # Go to Project Settings > Service Accounts
   # Generate new private key
   # Download JSON file
   ```

3. **Configure Environment Variables**
   ```bash
   FIREBASE_PROJECT_ID=your-prod-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account@your-prod-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRODUCTION_KEY\n-----END PRIVATE KEY-----\n"
   ```

---

## Post-Deployment Verification

### Health Check

```bash
curl https://your-deployed-app.com/health
```

Expected response:

```json
{
  "status": "OK",
  "timestamp": "2025-08-28T14:06:08.986Z"
}
```

### API Testing

```bash
# Test API endpoint
curl https://your-deployed-app.com/api/debug
```

### Database Connection

```bash
# Check logs for database connection confirmation
# Look for: "Supabase Configuration:" in server logs
```

---

## Monitoring and Maintenance

### Logging

- **Railway:** Built-in logs dashboard
- **Heroku:** `heroku logs --tail`
- **Vercel:** Function logs in dashboard
- **AWS:** CloudWatch logs
- **Google Cloud:** Cloud Logging

### Health Monitoring

Set up monitoring for:

- `/health` endpoint
- Response times
- Error rates
- Database connection status

### Backup Strategy

- **Database:** Supabase automatic backups
- **Code:** Git repository
- **Environment Config:** Secure backup of environment variables

---

## Troubleshooting

### Common Issues

**Environment Variables Not Loading**

```bash
# Verify environment variables are set
curl https://your-app.com/api/debug
```

**Database Connection Failed**

- Verify Supabase URL and service role key
- Check database schema is applied
- Confirm network connectivity

**Firebase Authentication Failed**

- Verify Firebase project ID
- Check service account credentials
- Ensure private key formatting is correct

**CORS Errors**

```typescript
// Update CORS configuration in server.ts
app.use(
  cors({
    origin: ['https://your-frontend-domain.com'],
    credentials: true,
  })
);
```

### Debugging Commands

```bash
# Check application logs
npm run dev  # Local debugging

# Test specific components
npm run db:test          # Database connectivity
npm run firebase:test    # Firebase authentication
npm run firebase:generate-token  # Token generation
```

### Performance Optimization

1. **Enable Gzip Compression**

   ```typescript
   import compression from 'compression';
   app.use(compression());
   ```

2. **Database Query Optimization**

   - Add indexes for frequently queried fields
   - Use connection pooling
   - Implement query result caching

3. **Rate Limiting Tuning**
   ```typescript
   // Adjust based on expected traffic
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 1000, // Increase for production
   });
   ```

---

## Security Checklist for Production

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers enabled (Helmet)
- [ ] Database access restricted
- [ ] Firebase service account secured
- [ ] No sensitive data in logs
- [ ] Regular security updates
- [ ] Backup strategy implemented

---

This deployment guide covers the most common deployment scenarios. Choose the platform that best fits your needs and follow the specific instructions for that platform.
