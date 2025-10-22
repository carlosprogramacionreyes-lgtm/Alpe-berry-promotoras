# Production Deployment Checklist
## Berry Quality Inspector - VPS Deployment

Use this checklist to deploy the Berry Quality Inspector application to your Hostinger VPS.

---

## 🔐 **SECURITY FIRST: Generate Credentials**

**Before starting deployment:**

```bash
# Generate database password (save this securely!)
openssl rand -base64 32

# Generate session secret (save this securely!)
openssl rand -base64 32
```

**Important:**
- Replace ALL placeholder credentials in this checklist with your generated values
- Never commit real credentials to git
- Store credentials securely (password manager, encrypted vault)
- `your_db_username` = Your chosen database username
- `your_secure_password_here` = Your generated database password
- `your-secure-random-string-here` = Your generated session secret

---

## 📋 Pre-Deployment Checklist

### ✅ VPS Access
- [ ] SSH access to VPS: `ssh root@5.183.11.150`
- [ ] Root or sudo privileges confirmed
- [ ] PostgreSQL installed (version 12 or higher recommended)
- [ ] Node.js installed (version 18 or higher)
- [ ] PM2 installed globally (`npm install -g pm2`)

### ✅ Application Code
- [ ] Code deployed to VPS (e.g., `/var/www/promotoras` or `/home/user/promotoras`)
- [ ] Dependencies installed (`npm install`)
- [ ] Build completed successfully (`npm run build` if applicable)

---

## 1️⃣ Database Setup

### Create Database Directory
```bash
sudo mkdir -p /srv/databases/promotoras
sudo chown -R postgres:postgres /srv/databases/promotoras
sudo chmod 700 /srv/databases/promotoras
```

**Checklist:**
- [ ] Directory created
- [ ] Ownership set to postgres
- [ ] Permissions set to 700

### Initialize Database
```bash
sudo su - postgres
/usr/lib/postgresql/*/bin/initdb -D /srv/databases/promotoras
exit
```

**Checklist:**
- [ ] Database cluster initialized
- [ ] No errors during initialization

### Configure postgresql.conf
```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```

**Required settings:**
```conf
data_directory = '/srv/databases/promotoras'
listen_addresses = 'localhost'
port = 5432
ssl = on
```

**Checklist:**
- [ ] `data_directory` set to `/srv/databases/promotoras`
- [ ] `listen_addresses` set to `'localhost'`
- [ ] SSL enabled
- [ ] File saved

### Configure pg_hba.conf
```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

**Required configuration (replace ALL content):**
```conf
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

**Checklist:**
- [ ] Only localhost connections allowed
- [ ] No external access configured
- [ ] File saved

### Create Database and User
```bash
sudo su - postgres
psql
```

**Run these SQL commands:**
```sql
CREATE DATABASE promotoras;
CREATE USER your_db_username WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE promotoras TO your_db_username;
\c promotoras
GRANT ALL ON SCHEMA public TO your_db_username;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_username;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_username;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO your_db_username;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO your_db_username;
\q
```

**Checklist:**
- [ ] Database `promotoras` created
- [ ] Database user created with password
- [ ] All privileges granted
- [ ] Connection successful: `psql -U your_db_username -d promotoras -h localhost`

### Restart PostgreSQL
```bash
sudo systemctl restart postgresql
sudo systemctl status postgresql
```

**Verification:**
```bash
# Should show 127.0.0.1:5432 (NOT 0.0.0.0:5432)
sudo netstat -tulpn | grep 5432
```

**Checklist:**
- [ ] PostgreSQL restarted successfully
- [ ] Service running
- [ ] Listening ONLY on localhost (127.0.0.1)

---

## 2️⃣ Firewall Configuration

### Configure UFW
```bash
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw enable
sudo ufw status numbered
```

**Expected rules:**
```
[ 1] 22/tcp      ALLOW IN    Anywhere       # SSH
[ 2] 80/tcp      ALLOW IN    Anywhere       # HTTP
[ 3] 443/tcp     ALLOW IN    Anywhere       # HTTPS
```

**Checklist:**
- [ ] UFW enabled
- [ ] Only ports 22, 80, 443 open
- [ ] Port 5432 NOT in firewall rules
- [ ] Can still SSH into server

### Verify Database Security
```bash
# From external machine - should FAIL (timeout/refused)
psql -U your_db_username -d promotoras -h 5.183.11.150

# From VPS localhost - should WORK
psql -U your_db_username -d promotoras -h localhost
```

**Checklist:**
- [ ] External connection FAILS (secure ✅)
- [ ] Localhost connection WORKS

---

## 3️⃣ Application Configuration

### Navigate to Application Directory
```bash
cd /var/www/promotoras  # or your deployment directory
```

### Create/Update .env File
```bash
nano .env
```

**Required variables:**
```env
DATABASE_URL=postgresql://your_db_username:your_secure_password@localhost:5432/promotoras
SESSION_SECRET=your-secure-random-string-here
NODE_ENV=production
PORT=3000
```

**Checklist:**
- [ ] DATABASE_URL points to localhost
- [ ] SESSION_SECRET is secure and unique
- [ ] NODE_ENV set to production
- [ ] File saved with correct permissions (600)

### Push Database Schema
```bash
npm run db:push
```

**Expected output:**
```
✓ Pushing schema to database...
✓ Changes applied successfully
```

**Checklist:**
- [ ] Schema pushed successfully
- [ ] All tables created
- [ ] No errors

### Start Application with PM2
```bash
# Start application
pm2 start npm --name "promotoras" -- run start

# Or if using a custom start script:
pm2 start server/index.js --name "promotoras"

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
# Follow the command it outputs
```

**Checklist:**
- [ ] Application started
- [ ] PM2 shows status as "online"
- [ ] No errors in logs: `pm2 logs promotoras`
- [ ] PM2 configured to start on boot

### Test Application
```bash
# Test from localhost
curl http://localhost:3000/api/auth/me
# Expected: {"message":"No autenticado"}

# Test login endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

**Checklist:**
- [ ] Application responds on localhost:3000
- [ ] API endpoints working
- [ ] No errors in PM2 logs

---

## 4️⃣ Web Server Configuration (Nginx/Apache)

### Option A: Nginx (Recommended)

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/promotoras
```

```nginx
server {
    listen 80;
    server_name 5.183.11.150 yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
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
# Enable site
sudo ln -s /etc/nginx/sites-available/promotoras /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Checklist:**
- [ ] Nginx configuration created
- [ ] Configuration syntax valid
- [ ] Site enabled
- [ ] Nginx restarted
- [ ] Can access application via `http://5.183.11.150`

### Option B: Apache (Alternative)

Create Apache configuration:
```bash
sudo nano /etc/apache2/sites-available/promotoras.conf
```

```apache
<VirtualHost *:80>
    ServerName 5.183.11.150
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

```bash
# Enable modules and site
sudo a2enmod proxy proxy_http
sudo a2ensite promotoras
sudo systemctl restart apache2
```

**Checklist:**
- [ ] Apache configuration created
- [ ] Proxy modules enabled
- [ ] Site enabled
- [ ] Apache restarted
- [ ] Can access application via `http://5.183.11.150`

---

## 5️⃣ SSL/HTTPS Configuration (Optional but Recommended)

### Install Certbot
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

### Get SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Checklist:**
- [ ] Certbot installed
- [ ] SSL certificate obtained
- [ ] HTTPS working
- [ ] Auto-renewal configured

---

## 6️⃣ Final Verification

### Security Checks
```bash
# PostgreSQL localhost only
sudo netstat -tulpn | grep 5432
# Expected: 127.0.0.1:5432

# Firewall status
sudo ufw status verbose

# Port 5432 external access (should FAIL)
telnet 5.183.11.150 5432
```

**Checklist:**
- [ ] ✅ PostgreSQL listening only on localhost
- [ ] ✅ UFW enabled with correct rules
- [ ] ✅ Port 5432 blocked externally
- [ ] ✅ Ports 22, 80, 443 open

### Application Checks
```bash
# PM2 status
pm2 status

# Application logs
pm2 logs promotoras --lines 50

# Database connection
psql -U your_db_username -d promotoras -h localhost -c "SELECT version();"
```

**Checklist:**
- [ ] ✅ PM2 shows "online" status
- [ ] ✅ No errors in logs
- [ ] ✅ Database connection works
- [ ] ✅ Application accessible via browser

### Functional Tests
Open browser and test:
- [ ] ✅ Login page loads: `http://5.183.11.150` or `https://yourdomain.com`
- [ ] ✅ Can login with test credentials
- [ ] ✅ Dashboard displays correctly
- [ ] ✅ Can navigate all pages
- [ ] ✅ Configuration panel works (no Database tab visible)
- [ ] ✅ Can create/view evaluations

---

## 7️⃣ Monitoring and Maintenance

### Set Up Automated Backups
```bash
sudo nano /usr/local/bin/backup-promotoras.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/srv/backups/promotoras"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

sudo -u postgres pg_dump promotoras > $BACKUP_DIR/promotoras_$DATE.sql
find $BACKUP_DIR -name "promotoras_*.sql" -mtime +7 -delete

echo "Backup completed: promotoras_$DATE.sql"
```

```bash
sudo chmod +x /usr/local/bin/backup-promotoras.sh
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-promotoras.sh
```

**Checklist:**
- [ ] Backup script created
- [ ] Script executable
- [ ] Cron job configured
- [ ] Test backup runs successfully

### Monitor Application
```bash
# View real-time logs
pm2 logs promotoras

# Monitor resources
pm2 monit

# View application info
pm2 info promotoras
```

---

## 🎉 Deployment Complete!

If all checkboxes are ticked, your Berry Quality Inspector application is:

✅ **Secure**: Database localhost-only, firewall hardened, bcrypt auth  
✅ **Running**: PM2 process manager, auto-restart on failures  
✅ **Accessible**: Via web server (Nginx/Apache) on HTTP/HTTPS  
✅ **Backed up**: Automated daily database backups  
✅ **Monitored**: PM2 monitoring and logging  

**Production URL**: `http://5.183.11.150` or `https://yourdomain.com`

---

## 🚨 Troubleshooting

### Application won't start
```bash
pm2 logs promotoras
# Check for errors in logs
```

### Can't connect to database
```bash
# Test connection manually
psql -U your_db_username -d promotoras -h localhost

# Check DATABASE_URL
echo $DATABASE_URL
```

### Port already in use
```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill the process if needed
sudo kill -9 <PID>
```

### Locked out of SSH
- Access via Hostinger control panel console
- Disable UFW: `sudo ufw disable`
- Re-enable SSH: `sudo ufw allow 22`
- Re-enable UFW: `sudo ufw enable`

---

## 📞 Support

For issues:
1. Check PM2 logs: `pm2 logs promotoras`
2. Check PostgreSQL logs: `sudo journalctl -u postgresql`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Review this checklist for missed steps
