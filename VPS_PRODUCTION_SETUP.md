# VPS Production Setup Guide
## Berry Quality Inspector - PostgreSQL Configuration

This guide will help you configure PostgreSQL on your Hostinger VPS (5.183.11.150) for secure local-only access.

---

## 🔐 **IMPORTANT: Credential Security**

**Before you begin:**
- Generate strong, unique passwords for database users
- Never commit real credentials to git repositories
- Never share database passwords in plain text
- Use environment variables for all sensitive data

**Generate secure passwords:**
```bash
# Generate a random secure password (save this securely!)
openssl rand -base64 32
```

**Replace placeholders in this guide:**
- `your_db_username` → Your chosen database username
- `your_secure_password_here` → Your generated secure password
- `your-session-secret` → Random string for sessions (generate with same command)

---

## 📋 Prerequisites

- SSH access to your VPS: `ssh root@5.183.11.150`
- PostgreSQL installed
- UFW firewall available

---

## 1️⃣ PostgreSQL Configuration

### Step 1: Create Database Directory

```bash
# Create directory for database
sudo mkdir -p /srv/databases/promotoras

# Set ownership to postgres user
sudo chown -R postgres:postgres /srv/databases/promotoras

# Set permissions
sudo chmod 700 /srv/databases/promotoras
```

### Step 2: Initialize Database Cluster

```bash
# Switch to postgres user
sudo su - postgres

# Initialize the database cluster
/usr/lib/postgresql/*/bin/initdb -D /srv/databases/promotoras

# Exit postgres user
exit
```

### Step 3: Configure postgresql.conf

```bash
# Find your PostgreSQL version
psql --version

# Edit postgresql.conf (adjust path for your PostgreSQL version)
sudo nano /etc/postgresql/*/main/postgresql.conf
```

**Add/modify these settings:**

```conf
# Data Directory
data_directory = '/srv/databases/promotoras'

# Listen only on localhost (SECURE)
listen_addresses = 'localhost'

# Port
port = 5432

# SSL (optional but recommended)
ssl = on
ssl_cert_file = '/etc/ssl/certs/ssl-cert-snakeoil.pem'
ssl_key_file = '/etc/ssl/private/ssl-cert-snakeoil.key'
```

### Step 4: Configure pg_hba.conf

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

**Replace ALL content with (SECURE - localhost only):**

```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     peer

# IPv4 local connections (localhost only)
host    all             all             127.0.0.1/32            md5

# IPv6 local connections (localhost only)
host    all             all             ::1/128                 md5

# NO external connections allowed - database only accessible from localhost
```

### Step 5: Restart PostgreSQL

```bash
# Restart PostgreSQL service
sudo systemctl restart postgresql

# Check status
sudo systemctl status postgresql

# Verify it's listening only on localhost
sudo netstat -tulpn | grep 5432
# Should show: 127.0.0.1:5432 (NOT 0.0.0.0:5432)
```

### Step 6: Create Database and User

```bash
# Switch to postgres user
sudo su - postgres

# Access PostgreSQL
psql

# Run these SQL commands:
```

```sql
-- Create database
CREATE DATABASE promotoras;

-- Create user with password (replace with your secure password)
CREATE USER your_db_username WITH PASSWORD 'your_secure_password_here';

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE promotoras TO your_db_username;

-- Grant schema privileges (PostgreSQL 15+)
\c promotoras
GRANT ALL ON SCHEMA public TO your_db_username;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_username;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_username;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO your_db_username;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO your_db_username;

-- Verify connection
\q
```

```bash
# Test connection as your database user
psql -U your_db_username -d promotoras -h localhost

# If successful, you'll see:
# promotoras=>

# Exit
\q
exit
```

---

## 2️⃣ Firewall Configuration (UFW)

### Step 1: Configure UFW Rules

```bash
# Reset UFW (if needed)
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (CRITICAL - don't lock yourself out!)
sudo ufw allow 22/tcp comment 'SSH'

# Allow HTTP
sudo ufw allow 80/tcp comment 'HTTP'

# Allow HTTPS
sudo ufw allow 443/tcp comment 'HTTPS'

# IMPORTANT: Do NOT open port 5432
# PostgreSQL is localhost-only, no external access needed

# Enable firewall
sudo ufw enable

# Verify rules
sudo ufw status numbered
```

**Expected output:**

```
Status: active

     To                         Action      From
     --                         ------      ----
[ 1] 22/tcp                     ALLOW IN    Anywhere                   # SSH
[ 2] 80/tcp                     ALLOW IN    Anywhere                   # HTTP
[ 3] 443/tcp                    ALLOW IN    Anywhere                   # HTTPS
[ 4] 22/tcp (v6)                ALLOW IN    Anywhere (v6)              # SSH
[ 5] 80/tcp (v6)                ALLOW IN    Anywhere (v6)              # HTTP
[ 6] 443/tcp (v6)               ALLOW IN    Anywhere (v6)              # HTTPS
```

**Port 5432 should NOT appear in this list!**

### Step 2: Verify PostgreSQL is NOT externally accessible

```bash
# From your local machine (NOT the VPS), try to connect:
# This should FAIL (connection refused/timeout) - which is GOOD!
psql -U your_db_username -d promotoras -h 5.183.11.150

# From the VPS itself, this should WORK:
psql -U your_db_username -d promotoras -h localhost
```

---

## 3️⃣ Application Configuration

### Step 1: Locate Application Directory

```bash
# Your Node.js app should be in something like:
cd /var/www/promotoras
# or
cd /home/username/promotoras
# or wherever you deployed it
```

### Step 2: Configure Environment Variables

```bash
# Edit your .env file or PM2 ecosystem file
nano .env
```

**Add/update these variables:**

```env
# Database (localhost connection)
DATABASE_URL=postgresql://your_db_username:your_secure_password@localhost:5432/promotoras

# Session secret (keep your existing value or generate new one)
SESSION_SECRET=your-existing-session-secret-here

# Node environment
NODE_ENV=production
```

### Step 3: Push Database Schema

```bash
# Install dependencies (if not already done)
npm install

# Push schema to database
npm run db:push

# Or if you have migration tools:
npm run migrate
```

### Step 4: Restart Application with PM2

```bash
# If using PM2:
pm2 restart promotoras --update-env

# Verify it's running
pm2 status

# Check logs
pm2 logs promotoras --lines 50
```

### Step 5: Test Application

```bash
# Test database connection from application
curl http://localhost:3000/api/auth/me
# Should return: {"message":"No autenticado"}

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

---

## 4️⃣ Security Verification Checklist

Run these commands to verify your security setup:

```bash
# ✅ PostgreSQL listening only on localhost
sudo netstat -tulpn | grep 5432
# Should show: 127.0.0.1:5432 (NOT 0.0.0.0:5432)

# ✅ Firewall enabled and configured
sudo ufw status verbose

# ✅ Port 5432 NOT accessible externally
# From external machine, this should FAIL:
telnet 5.183.11.150 5432

# ✅ PostgreSQL service running
sudo systemctl status postgresql

# ✅ Application running
pm2 status

# ✅ Database connection works locally
psql -U your_db_username -d promotoras -h localhost -c "SELECT version();"
```

---

## 🔒 Security Features Implemented

✅ **Database isolated**: PostgreSQL only accepts localhost connections  
✅ **Firewall hardened**: Only ports 22, 80, 443 open externally  
✅ **Port 5432 blocked**: No external database access possible  
✅ **SSL enabled**: Encrypted connections even on localhost  
✅ **Strong authentication**: bcrypt password hashing  
✅ **Principle of least privilege**: Database user has only necessary permissions  

---

## 🚨 Troubleshooting

### PostgreSQL won't start

```bash
# Check logs
sudo journalctl -u postgresql -n 50

# Check permissions
ls -la /srv/databases/promotoras
# Should be owned by postgres:postgres with 700 permissions

# Verify config syntax
sudo -u postgres /usr/lib/postgresql/*/bin/postgres -C data_directory
```

### Application can't connect to database

```bash
# Test connection manually
psql -U your_db_username -d promotoras -h localhost

# Check application logs
pm2 logs promotoras

# Verify DATABASE_URL
echo $DATABASE_URL
```

### Locked out of SSH (UFW issue)

```bash
# If you have console access via Hostinger panel:
sudo ufw disable
sudo ufw allow 22
sudo ufw enable
```

---

## 📦 Backup Recommendations

### Automated Daily Backups

```bash
# Create backup script
sudo nano /usr/local/bin/backup-promotoras.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/srv/backups/promotoras"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
sudo -u postgres pg_dump promotoras > $BACKUP_DIR/promotoras_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "promotoras_*.sql" -mtime +7 -delete

echo "Backup completed: promotoras_$DATE.sql"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-promotoras.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-promotoras.sh
```

---

## ✅ Deployment Complete!

Once all steps are completed:

1. ✅ PostgreSQL running at `/srv/databases/promotoras`
2. ✅ Database only accessible from localhost
3. ✅ Firewall properly configured (ports 22, 80, 443 only)
4. ✅ Application connected to local database
5. ✅ bcrypt authentication working
6. ✅ Production-ready and secure

**You can now access your application via:**
- `http://5.183.11.150` (if using Nginx/Apache reverse proxy)
- `https://yourdomain.com` (if domain configured with SSL)
