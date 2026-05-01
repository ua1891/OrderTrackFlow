<div align="center">

# 🚚 TrackFlow

### Automated Shipment Tracking & Notification System

*Built for Pakistani vendors using TCS Courier Services*

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Deployed on Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

---

## 📖 What is TrackFlow?

TrackFlow is a **real-time shipment management platform** that bridges the gap between TCS courier updates and vendor awareness. It automatically tracks all active consignments, sends email alerts when statuses change, and displays everything on a premium glassmorphic dashboard.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔄 **Auto-Polling** | Background cron job checks TCS API every 5 minutes |
| 📧 **Email Alerts** | Instant notifications for deliveries, returns & delays |
| 📊 **Analytics Dashboard** | 7-day trend charts, live metrics, and status breakdown |
| 🔐 **Auth System** | JWT-based login/signup with encrypted passwords |
| 📦 **Order Management** | Add, filter, and sort all your consignments in one place |
| 🔔 **Alert Feed** | Full history of all system notifications |
| 💬 **WhatsApp Integration** | *(Coming Soon)* WhatsApp alerts via Meta Cloud API |

---

## 🏗️ Architecture

```
┌─────────────────┐      HTTPS API      ┌──────────────────────┐
│   React + Vite  │ ──────────────────► │  Node.js + Express   │
│   (Vercel CDN)  │                     │  (Render Web Service) │
└─────────────────┘                     └──────────┬───────────┘
                                                   │ Prisma ORM
                                                   ▼
                                        ┌──────────────────────┐
                                        │   PostgreSQL Database │
                                        │   (Render Free Tier)  │
                                        └──────────────────────┘
```

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- React Router DOM
- Recharts (Analytics)
- Lucide React (Icons)

**Backend**
- Node.js + Express
- Prisma ORM
- node-cron (Scheduling)
- Nodemailer (Email)
- bcryptjs + JWT (Auth)

**Database**
- PostgreSQL (Production)
- SQLite (Local Development)

---

## 🚀 Local Development Setup

### Prerequisites
- [Node.js v18+](https://nodejs.org/)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/trackflow.git
cd trackflow
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside `/backend` (see [Environment Variables](#-environment-variables) below):
```bash
cp .env.example .env
# Fill in your values in .env
```

Run database migrations:
```bash
npx prisma migrate dev --name init
```

Start the backend:
```bash
npm run dev
# Server starts at http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
# App opens at http://localhost:5173
```

### ⚡ Windows Quick Start
Double-click `start-trackflow.bat` in the root directory — it handles everything automatically.

---

## 🔑 Environment Variables

Create a `backend/.env` file based on `backend/.env.example`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (or `file:./dev.db` for local) |
| `JWT_SECRET` | A long random secret string for signing tokens |
| `TCS_USERNAME` | Your TCS courier account username |
| `TCS_PASSWORD` | Your TCS courier account password |
| `TCS_BEARER_TOKEN` | Static bearer token from TCS Connect portal |
| `SMTP_HOST` | Email SMTP host (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (e.g. `587`) |
| `SMTP_USER` | Your sending email address |
| `SMTP_PASS` | Your email app password |
| `VENDOR_EMAIL` | Email address to receive alert notifications |
| `FRONTEND_URL` | Your deployed frontend URL (for CORS) |
| `WHATSAPP_TOKEN` | Meta Cloud API token *(optional)* |
| `PHONE_NUMBER_ID` | WhatsApp Phone Number ID *(optional)* |
| `POSTEX_TOKEN` | PostEx API token *(optional)* |

---

## ☁️ Deployment

This project is deployed using:
- **Frontend** → [Vercel](https://vercel.com) (Root: `frontend/`)
- **Backend** → [Render](https://render.com) (Root: `backend/`)
- **Database** → Render PostgreSQL (Free Tier)

See the full step-by-step deployment guide in [`DEPLOYMENT.md`](DEPLOYMENT.md).

---

## 📁 Project Structure

```
trackflow/
├── backend/
│   ├── middleware/        # JWT auth middleware
│   ├── prisma/            # Database schema & migrations
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic (TCS, email, cron, auth)
│   ├── utils/             # Prisma client, email templates
│   └── server.js          # App entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios client configuration
│   │   ├── components/    # React page components
│   │   ├── context/       # Auth context & state
│   │   └── utils/         # Helper utilities
│   └── vercel.json        # Vercel routing config
│
├── start-trackflow.bat    # Windows quick-start script
└── README.md
```

---

## 🤝 Contributing

This is a university project. For any queries, reach out via the GitHub Issues tab.

---

<div align="center">
  <sub>Built with ❤️ as part of Software Engineering coursework</sub>
</div>
