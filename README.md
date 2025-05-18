# 🚨 StarfireCAD - Multi-Tenant CAD/MDT SaaS Platform

StarfireCAD is a modern, full-stack Computer Aided Dispatch (CAD) and Mobile Data Terminal (MDT) system for RP communities — built to scale, support monetization, and empower dispatch, law enforcement, EMS, and civilian operations.

> Built with Flask, PostgreSQL, Redis, Stripe, WebSockets, and Tailwind CSS. Dockerized for Coolify and VPS deployment.

---

## 🌐 Live Features Overview

### ✅ Multi-Tenant Architecture
- Each **community** has its own:
  - Users, departments, dashboards, branding
  - Billing plan
  - API key + Discord/Webhook config
- Isolated data with scoped access

### ✅ Role-Based Dashboards
| Role     | Features Included |
|----------|--------------------|
| Civilian | Characters, Vehicles, Firearms, View Records |
| LEO      | BOLOs, Warrants, Citations, Arrest Reports |
| EMS      | Medical Calls, Treatment Reports |
| Dispatch | Active Calls, Panic Alerts, Unit Management |

---

## 🧠 Advanced Modules

### 🧠 AI Incident Assistant
- NLP-based incident summarization
- Suggests charges or auto-writes reports

### 🛍️ Community Marketplace
- Upload or purchase themes, templates, scripts
- Monetization system (stubbed for Stripe payout)

### 🧪 Training Simulator
- Customizable quizzes
- Track certifications per officer

### ⚙️ Scripting Sandbox
- Custom JS/Lua automation
- Triggered on system events

---

## 📡 Integrations

### 🔗 Discord Integration
- Panic alerts to webhook
- `/panic`, `/civsearch`, `/plate` slash commands

### 🎮 FiveM Plugin (API Ready)
- Endpoints:
  - `POST /api/panic`
  - `GET /api/civsearch`
  - `POST /api/status/update`
- Token-based authorization (`X-API-Key`)

---

## 🔒 Admin Systems

### 🧑‍💼 Community Admin Panel
- Branding customization (logo, theme)
- Role management
- Integration tokens

### 🌐 Global Admin Panel (GAP)
- View all users, communities
- Role elevation, ban tools
- Feature toggles, audit logs (future)
- Shadow login (staff debug access)

---

## ⚙️ Infrastructure + Deployment

### 🔄 Redis & PostgreSQL
- Caching: Civ lookups, unit status
- Session management: Redis
- Durable storage via PostgreSQL

### 🔁 Backups
- `backup.py`: dumps SQL backups (cron-ready)

### 📴 PWA Offline Mode
- Installable app (via manifest)
- `service-worker.js` caching

---

## 🚀 Deployment Instructions

### ✅ Option 1: Local Dev Setup

```bash
git clone https://github.com/yourusername/starfirecad.git
cd starfirecad
python -m venv venv
venv\Scripts\activate  # or source venv/bin/activate on Linux/macOS
pip install -r requirements.txt
```

#### Create `.env` based on:
```
SECRET_KEY=changeme
DATABASE_URL=postgresql://postgres:postgres@localhost/starfirecad
REDIS_URL=redis://localhost:6379/0
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
DISCORD_BOT_TOKEN=your-token
```

Then run:

```bash
flask db upgrade
python run.py
```

---

### ✅ Option 2: Docker + Coolify (Recommended)

1. **Push project to GitHub**

```bash
git init
git remote add origin https://github.com/yourusername/starfirecad.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

2. **Login to Coolify**

- Connect GitHub
- Select your repo
- Use `docker-compose.yml` + `Dockerfile`

3. **Set environment variables** under "App Configuration"

> You can copy `.env.example` as a reference

4. **Deploy!**

Coolify will auto-build and start your app on a public domain.

---

## 📁 Project Structure

```
├── app/
│   ├── routes/         # All Flask Blueprints
│   ├── models/         # SQLAlchemy Models
│   ├── templates/      # Tailwind-based HTML views
│   ├── static/         # Icons, manifest, SW
│   └── __init__.py     # App factory
├── backup.py           # Backup utility
├── discord_bot.py      # Optional bot
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── requirements.txt
└── run.py
```

---

## 📣 Credits & License

Built with ❤️ by **Ethan Bragdon** and **Starfire Hosting**  
Licensed under MIT

> Contributions welcome — this system is designed to grow with RP server communities.
