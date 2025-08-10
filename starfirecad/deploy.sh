#!/bin/bash

# StarfireCAD Deployment Script for AWS EC2 Ubuntu 24.04
# This script automates the deployment process

set -e

echo "========================================="
echo "StarfireCAD Deployment Script"
echo "========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo "Please run this script as root (use sudo)"
   exit 1
fi

# Update system
echo "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install required packages
echo "Installing required packages..."
apt-get install -y \
    curl \
    git \
    nginx \
    certbot \
    python3-certbot-nginx \
    postgresql \
    postgresql-contrib \
    redis-server \
    ufw

# Install Docker
echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose
echo "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Install Node.js 18
echo "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install PM2
echo "Installing PM2..."
npm install -g pm2

# Setup PostgreSQL
echo "Setting up PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql <<EOF
CREATE USER starfirecad WITH PASSWORD 'changeme_production_password';
CREATE DATABASE starfirecad OWNER starfirecad;
GRANT ALL PRIVILEGES ON DATABASE starfirecad TO starfirecad;
EOF

# Setup firewall
echo "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw allow 3001/tcp
ufw --force enable

# Clone or update repository
echo "Setting up application..."
APP_DIR="/opt/starfirecad"
if [ -d "$APP_DIR" ]; then
    echo "Updating existing installation..."
    cd $APP_DIR
    git pull
else
    echo "Cloning repository..."
    git clone https://github.com/yourusername/starfirecad.git $APP_DIR
    cd $APP_DIR
fi

# Copy environment file
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Please edit .env file with your configuration"
fi

# Install dependencies
echo "Installing dependencies..."
npm ci

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy
npx prisma generate

# Build application
echo "Building application..."
npm run build

# Setup PM2
echo "Setting up PM2..."
pm2 delete starfirecad 2>/dev/null || true
pm2 start server.js --name starfirecad
pm2 save
pm2 startup systemd -u root --hp /root

# Setup Nginx
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/starfirecad <<'NGINX'
upstream starfirecad_backend {
    server localhost:3001;
}

upstream starfirecad_frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL configuration (will be added by certbot)
    
    client_max_body_size 10M;

    # Frontend
    location / {
        proxy_pass http://starfirecad_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api {
        proxy_pass http://starfirecad_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://starfirecad_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

# Enable Nginx site
ln -sf /etc/nginx/sites-available/starfirecad /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

echo "========================================="
echo "Deployment complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Edit /opt/starfirecad/.env with your configuration"
echo "2. Update Nginx configuration with your domain"
echo "3. Run: certbot --nginx -d your-domain.com"
echo "4. Restart services: pm2 restart starfirecad"
echo ""
echo "Access your application at:"
echo "http://your-server-ip:3000 (Frontend)"
echo "http://your-server-ip:3001 (API)"
echo ""
echo "Monitor logs with:"
echo "pm2 logs starfirecad"
echo ""