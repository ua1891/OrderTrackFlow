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

## Features Built
- **TCS API Integration**: Connects to the official TCS APIs to retrieve OAuth tokens and fetch dynamic tracking details for multiple Consignment Numbers.
- **Cron Service**: Automatically checks orders stored in the SQLite database every 5 minutes without manual intervention.
- **Automated Email Alerts**: Detects status changes and automatically alerts the vendor (`ua9118@gmail.com`) using Nodemailer.
- **Dynamic Dashboard**: Responsive, glassmorphic UI matching exact specifications featuring metrics, a weekly line-chart summary, sortable/filterable Order list, and a smart visual alert feed.
