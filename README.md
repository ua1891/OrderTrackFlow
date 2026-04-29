# TrackFlow Automated Notification System

Welcome to the TrackFlow application! For a detailed understanding of what this project is and how it works, please refer to the **[Project Overview](OVERVIEW.md)**.

## Prerequisites
To run this application, you must first install Node.js (https://nodejs.org/) on your machine.

## Quick Start (Windows)
The easiest way to start both the backend and frontend together is using the provided startup script:
1. Double-click `start-trackflow.bat` in the root directory.
2. This will automatically install dependencies, set up the SQLite database, and launch both servers and your browser.

---

## Manual Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the Prisma database (SQLite):
   ```bash
   npx prisma migrate dev --name init
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:5000` and the Cron job scheduler will immediately begin polling the TCS API every 5 minutes.*

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the provided `localhost` URL (usually `http://localhost:5173`) in your browser to view the TrackFlow Dashboard.

## Features
- **TCS API Integration**: Connects to official TCS APIs for automated consignment tracking.
- **Background Cron Service**: Automatically polls TCS every 5 minutes and updates order statuses.
- **Automated Email Alerts**: Real-time notification system for vendors and customers.
- **Premium Dashboard**: Glassmorphic UI featuring analytics, tracking history, and alert feeds.

---

## Deployment
To deploy TrackFlow to a production environment:

### 1. Environment Variables
Ensure all variables in `backend/.env` are set correctly for production:
- `JWT_SECRET`: A long, random string.
- `DATABASE_URL`: Path to your SQLite file (or postgres/mysql if migrating).
- `SMTP_USER` & `SMTP_PASS`: Your production email credentials.

### 2. Frontend Build
```bash
cd frontend
npm run build
```
The production files will be in `frontend/dist`. These can be served by Nginx or the backend.

### 3. Backend Production
Use a process manager like **PM2** to keep the server running:
```bash
cd backend
npm install
npx prisma generate
npm start
```

---
*Cleaned and optimized for deployment.*
