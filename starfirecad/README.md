# StarfireCAD - Next Generation Computer Aided Dispatch System

![StarfireCAD Logo](https://img.shields.io/badge/StarfireCAD-v1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)

## 🚀 Overview

StarfireCAD is a professional-grade, fully-featured Computer Aided Dispatch (CAD) and Mobile Data Terminal (MDT) system designed specifically for FiveM roleplay communities. Built with modern technologies and a focus on performance, reliability, and user experience.

## ✨ Key Features

### 🎯 Core Functionality
- **Advanced CAD System** - Real-time dispatch management with unit tracking
- **Mobile Data Terminal** - Full MDT for field officers with comprehensive records
- **Multi-Community Support** - Host multiple isolated communities on one platform
- **Real-Time Updates** - WebSocket-powered instant synchronization
- **Draggable UI** - Fully customizable interface layouts
- **Role-Based Access** - Granular permission system

### 💼 Business Features
- **Stripe Integration** - Automated subscription management
- **Tiered Plans** - Basic, Professional, and Enterprise options
- **Community Management** - Complete administrative control
- **Audit Logging** - Comprehensive activity tracking
- **Webhook Support** - External integrations

### 🛡️ Technical Features
- **Local Authentication** - Email/username/password login
- **AWS EC2 Ready** - Optimized for Ubuntu 24.04 deployment
- **Self-Contained** - No external dependencies required
- **High Performance** - Lightning-fast response times
- **Secure** - Enterprise-grade security measures

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Material-UI
- **Backend**: Node.js, Express, Socket.io
- **Database**: PostgreSQL 15 with Prisma ORM
- **Authentication**: JWT-based local auth
- **Real-time**: Socket.io for WebSocket communication
- **Payments**: Stripe API integration
- **Deployment**: Docker, PM2, Nginx

### System Components
```
┌─────────────────────────────────────────────────────────┐
│                     Nginx (Reverse Proxy)                │
├─────────────────────────┬───────────────────────────────┤
│    Next.js Frontend     │      Express Backend          │
│       (Port 3000)       │        (Port 3001)           │
├─────────────────────────┴───────────────────────────────┤
│                    PostgreSQL Database                   │
└─────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Ubuntu 24.04 (for production deployment)
- Stripe account (for payment processing)
- SMTP server (for email notifications)

## 🚀 Quick Start

### Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/starfirecad.git
cd starfirecad
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Setup database**
```bash
npx prisma migrate dev
npx prisma db seed
```

5. **Start development servers**
```bash
npm run dev
```

Access the application at:
- Frontend: http://localhost:3000
- API: http://localhost:3001

## 🚢 Production Deployment

### AWS EC2 Ubuntu 24.04 Deployment

1. **Launch EC2 Instance**
   - Ubuntu 24.04 LTS
   - t3.medium or larger
   - 20GB+ storage
   - Security groups: 22, 80, 443, 3000, 3001

2. **Run deployment script**
```bash
sudo chmod +x deploy.sh
sudo ./deploy.sh
```

3. **Configure environment**
```bash
sudo nano /opt/starfirecad/.env
# Add your production configuration
```

4. **Setup SSL**
```bash
sudo certbot --nginx -d your-domain.com
```

5. **Start services**
```bash
pm2 restart starfirecad
sudo systemctl restart nginx
```

### Docker Deployment

```bash
docker-compose up -d
```

## 📁 Project Structure

```
starfirecad/
├── api/                 # Express API routes
│   ├── auth.js         # Authentication endpoints
│   ├── communities.js  # Community management
│   ├── dispatch.js     # CAD dispatch operations
│   ├── mdt.js          # MDT operations
│   ├── admin.js        # Admin panel API
│   └── stripe.js       # Payment processing
├── prisma/
│   └── schema.prisma   # Database schema
├── src/
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   ├── lib/          # Utility libraries
│   ├── hooks/        # Custom React hooks
│   ├── store/        # State management
│   └── types/        # TypeScript types
├── public/           # Static assets
├── server.js         # Express server with Socket.io
├── docker-compose.yml
├── Dockerfile
└── deploy.sh         # Deployment script
```

## 🔧 Configuration

### Environment Variables

Key environment variables to configure:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/starfirecad"

# Authentication
NEXTAUTH_SECRET="generate-secure-secret"
JWT_SECRET="generate-secure-jwt-secret"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="app-specific-password"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Application
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://your-domain.com"
```

## 📊 Database Schema

The system uses a comprehensive PostgreSQL schema with tables for:
- Users and authentication
- Communities and multi-tenancy
- Departments and units
- Calls and dispatch
- Citizens, vehicles, and licenses
- Incidents and reports
- Audit logs

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: API request throttling
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Prisma ORM
- **XSS Protection**: React's built-in protections
- **HTTPS**: SSL/TLS encryption in production

## 📈 Subscription Plans

| Feature | Basic | Professional | Enterprise |
|---------|-------|-------------|------------|
| Users | 10 | 50 | Unlimited |
| Units | 20 | 100 | Unlimited |
| Calls/month | 500 | 5,000 | Unlimited |
| Custom Fields | ❌ | ✅ | ✅ |
| Webhooks | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ✅ |
| Support | Community | Email | Priority |
| Price | $19.99/mo | $49.99/mo | $149.99/mo |

## 🛠️ Maintenance

### Backup Database
```bash
pg_dump starfirecad > backup.sql
```

### Update Application
```bash
cd /opt/starfirecad
git pull
npm install
npx prisma migrate deploy
npm run build
pm2 restart starfirecad
```

### Monitor Logs
```bash
pm2 logs starfirecad
tail -f /opt/starfirecad/logs/error.log
```

## 📚 API Documentation

The API follows RESTful principles with endpoints for:

- `/api/auth/*` - Authentication operations
- `/api/communities/*` - Community management
- `/api/dispatch/*` - CAD operations
- `/api/mdt/*` - MDT operations
- `/api/admin/*` - System administration
- `/api/stripe/*` - Payment processing

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: [docs.starfirecad.com](https://docs.starfirecad.com)
- **Discord**: [discord.gg/starfirecad](https://discord.gg/starfirecad)
- **Email**: support@starfirecad.com

## 🙏 Acknowledgments

- FiveM community for inspiration
- Open source contributors
- All beta testers and early adopters

---

**Built with ❤️ for the FiveM Roleplay Community**